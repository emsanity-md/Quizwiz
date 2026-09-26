import { NextResponse } from "next/server";

import { buildReview } from "@/lib/quiz/score";
import { clientKey, rateLimit } from "@/lib/quiz/rate-limit";
import { open } from "@/lib/quiz/token";
import { MAX_QUESTIONS, type ReviewResponse } from "@/lib/quiz/types";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const SUBMITS_PER_WINDOW = 30;

type ReviewBody = {
  answers?: unknown;
  token?: unknown;
};

export async function POST(request: Request) {
  const limit = rateLimit(
    `review:${clientKey(request)}`,
    SUBMITS_PER_WINDOW,
    WINDOW_MS,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many submissions from this connection. Try again shortly." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  let body: ReviewBody;
  try {
    body = (await request.json()) as ReviewBody;
  } catch {
    return NextResponse.json({ error: "Could not read that request." }, { status: 400 });
  }

  const { answers, token } = body;

  if (typeof token !== "string" || token.length === 0) {
    return NextResponse.json({ error: "This quiz could not be found." }, { status: 400 });
  }

  if (
    !Array.isArray(answers) ||
    answers.length === 0 ||
    answers.length > MAX_QUESTIONS ||
    answers.some(
      (answer) => answer !== null && (typeof answer !== "number" || answer < 0 || answer > 3),
    )
  ) {
    return NextResponse.json({ error: "Those answers are not valid." }, { status: 400 });
  }

  // A tampered token fails the auth tag, so this either opens cleanly or throws.
  let key;
  try {
    key = open(token);
  } catch {
    return NextResponse.json(
      { error: "This quiz could not be verified. Please start a new one." },
      { status: 400 },
    );
  }

  if (answers.length !== key.questions.length) {
    return NextResponse.json(
      { error: "That answer list does not match this quiz." },
      { status: 400 },
    );
  }

  const payload: ReviewResponse = buildReview(
    key,
    answers as (number | null)[],
    // The label travels in the key, so this does not depend on the category
    // still existing or the player having picked a real one.
    key.sourceName ?? key.categoryLabel,
  );

  return NextResponse.json(payload, { headers: { "cache-control": "no-store" } });
}
