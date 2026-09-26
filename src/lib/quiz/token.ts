import "server-only";

import crypto from "node:crypto";

/**
 * The answer key never reaches the browser. It is sealed with AES-GCM and
 * handed over as an opaque token; the review route opens it on submit.
 *
 * Stateless on purpose. Keeping the key in a server Map would look simpler but
 * breaks on a cold start and across instances, which quietly loses a quiz
 * halfway through.
 */

const ALGO = "aes-256-gcm";
const IV_BYTES = 12;

export type SealedQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
};

export type AnswerKey = {
  name: string;
  categoryId: string;
  /**
   * Carried in the key rather than looked up on review, so the review does not
   * depend on the category still existing or still being spelled the same way.
   */
  categoryLabel: string;
  sourceName?: string;
  questions: SealedQuestion[];
};

function secretKey(): Buffer {
  const secret = process.env.QUIZ_TOKEN_SECRET;
  if (!secret) {
    throw new Error("QUIZ_TOKEN_SECRET is not configured on the server.");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function seal(key: AnswerKey): string {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGO, secretKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(key), "utf8"),
    cipher.final(),
  ]);

  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function open(token: string): AnswerKey {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed token.");
  }

  const [iv, tag, ciphertext] = parts;
  const decipher = crypto.createDecipheriv(
    ALGO,
    secretKey(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  const json = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");

  return JSON.parse(json) as AnswerKey;
}
