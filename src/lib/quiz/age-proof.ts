import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

import { AGE_COOKIE, AGE_PROOF_TTL_MS } from "./age";

/**
 * The proof that a browser has passed the age gate.
 *
 * HMAC signed with the same secret as the answer key, and it carries nothing
 * but the moment it was issued. The date of birth was checked at the door and
 * discarded: there is no way to read a birthdate back out of this, because
 * there is no birthdate in it.
 *
 * Stateless on purpose, for the same reason as the answer key: a proof held
 * in a server Map would fail on a cold start and lose the gate.
 */

type Proof = { iat: number };

function secret(): Buffer {
  const secret = process.env.QUIZ_TOKEN_SECRET;
  if (!secret) {
    throw new Error("QUIZ_TOKEN_SECRET is not configured on the server.");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Mints a proof for a browser that has just been through the gate. */
export function issueAgeProof(now: number = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({ iat: now } satisfies Proof),
    "utf8",
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

/**
 * Whether a proof is genuine and still in date.
 *
 * The signature is compared in constant time, and the length is checked first
 * because `timingSafeEqual` throws when the two buffers differ in length.
 */
export function verifyAgeProof(
  token: string | undefined,
  now: number = Date.now(),
): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expected = sign(payload);

  if (signature.length !== expected.length) return false;
  if (
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return false;
  }

  try {
    const proof = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Proof;

    if (typeof proof.iat !== "number") return false;
    if (proof.iat > now + 60_000) return false;
    if (now - proof.iat > AGE_PROOF_TTL_MS) return false;

    return true;
  } catch {
    return false;
  }
}

/** Whether this request comes from a browser that has passed the gate. */
export async function hasAgeProof(): Promise<boolean> {
  const store = await cookies();
  return verifyAgeProof(store.get(AGE_COOKIE)?.value);
}
