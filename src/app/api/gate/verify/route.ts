import { NextResponse } from "next/server";

import { ageFromDateOfBirth } from "@/lib/quiz/age";
import {
  GATE_COOKIE,
  GATE_PROOF_TTL_MS,
  issueGateProof,
} from "@/lib/quiz/gate";
import { clientKey, rateLimit } from "@/lib/quiz/rate-limit";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
/** Checking is cheap, but there is no reason to allow a guessing loop. */
const CHECKS_PER_WINDOW = 20;

type Body = {
  dateOfBirth?: unknown;
  terms?: unknown;
  privacy?: unknown;
};

/**
 * Checks a date of birth and the two consents, then hands back a signed proof
 * that this browser has passed the gate.
 *
 * The date of birth goes nowhere else and is not put in the cookie: the proof
 * says only that the check happened, when, and against which version of the
 * terms.
 */
export async function POST(request: Request) {
  const limit = rateLimit(
    `gate:${clientKey(request)}`,
    CHECKS_PER_WINDOW,
    WINDOW_MS,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many checks from this connection. Try again shortly." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "Could not read that request." },
      { status: 400 },
    );
  }

  // Both boxes have to be ticked. An unticked box is not a yes, and the
  // server does not take the browser's word for it either.
  if (body.terms !== true || body.privacy !== true) {
    return NextResponse.json(
      {
        error:
          "Please accept the Terms & Conditions and the Privacy Policy to continue.",
      },
      { status: 403 },
    );
  }

  const dateOfBirth =
    typeof body.dateOfBirth === "string" ? body.dateOfBirth : "";

  const result = ageFromDateOfBirth(dateOfBirth);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "That date of birth could not be checked." },
      { status: 403 },
    );
  }

  const response = NextResponse.json(
    { verified: true },
    { headers: { "cache-control": "no-store" } },
  );

  response.cookies.set(GATE_COOKIE, issueGateProof(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(GATE_PROOF_TTL_MS / 1000),
  });

  return response;
}
