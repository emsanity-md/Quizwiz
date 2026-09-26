import { NextResponse } from "next/server";

import { clientKey, rateLimit } from "@/lib/quiz/rate-limit";
import { open } from "@/lib/quiz/token";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const REVEALS_PER_WINDOW = 60;

type Body = { token?: unknown; id?: unknown };

/**
 * Hands back the answer to a single teaser, and only that one.
 *
 * Brain teasers give feedback per question rather than at the end, so the
 * answers have to stay sealed until the player has committed. Opening the token
 * here keeps them off the page entirely, and this endpoint reveals one answer
 * per call rather than the whole set.
 */
export async function POST(request: Request) {
  const limit = rateLimit(
    `reveal:${clientKey(request)}`,
    REVEALS_PER_WINDOW,
    WINDOW_MS,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests from this connection." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Could not read that request." }, { status: 400 });
  }

  const { token, id } = body;
  if (typeof token !== "string" || typeof id !== "string") {
    return NextResponse.json({ error: "That teaser could not be found." }, { status: 400 });
  }

  let key;
  try {
    key = open(token);
  } catch {
    return NextResponse.json(
      { error: "This round could not be verified. Start a new one." },
      { status: 400 },
    );
  }

  const question = key.questions.find((item) => item.id === id);
  if (!question) {
    return NextResponse.json({ error: "No such teaser." }, { status: 404 });
  }

  return NextResponse.json(
    {
      id: question.id,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
