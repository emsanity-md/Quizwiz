import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

import { TERMS_VERSION } from "@/lib/pages/legal";

/**
 * The proof that this browser passed the gate: it is over 18, and it has
 * accepted the terms and the policy.
 *
 * HMAC signed with the same secret as the answer key, and it carries nothing
 * but the moment it was issued and the version of the terms that were
 * accepted. The date of birth was checked at the door and discarded: there is
 * no way to read a birthdate back out of this, because there is no birthdate
 * in it.
 *
 * The terms version is the point of the whole thing. When the words change,
 * the version changes with them, every old proof stops verifying, and
 * everyone is asked to accept the new ones instead of carrying on with the
 * old ones.
 *
 * Stateless on purpose, for the same reason as the answer key: a proof held
 * in a server Map would fail on a cold start and lose the gate.
 */

export const GATE_COOKIE = "quizwiz_gate";
export const GATE_PROOF_TTL_MS = 365 * 24 * 60 * 60 * 1000;

type Proof = { iat: number; terms: string };

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
export function issueGateProof(
  termsVersion: string = TERMS_VERSION,
  now: number = Date.now(),
): string {
  const payload = Buffer.from(
    JSON.stringify({ iat: now, terms: termsVersion } satisfies Proof),
    "utf8",
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

/**
 * Whether a proof is genuine, still in date, and was given against the terms
 * that are in force now.
 *
 * The signature is compared in constant time, and the length is checked first
 * because `timingSafeEqual` throws when the two buffers differ in length.
 */
export function verifyGateProof(
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
    if (now - proof.iat > GATE_PROOF_TTL_MS) return false;
    // The terms have moved on since this proof was issued.
    if (proof.terms !== TERMS_VERSION) return false;

    return true;
  } catch {
    return false;
  }
}

/** Whether this request comes from a browser that has passed the gate. */
export async function hasGateProof(): Promise<boolean> {
  const store = await cookies();
  return verifyGateProof(store.get(GATE_COOKIE)?.value);
}
