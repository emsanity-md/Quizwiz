import { NextResponse } from "next/server";

import { hasAgeProof } from "@/lib/quiz/age-proof";
import { findCategory } from "@/lib/quiz/categories";
import { generateQuiz, type Flavour, type GenerateProgress } from "@/lib/quiz/generate";
import { MODEL } from "@/lib/quiz/nvidia";
import { extractPdfText, PdfError } from "@/lib/quiz/pdf";
import {
  acquireSlot,
  clientKey,
  creditLimit,
  rateLimit,
  releaseSlot,
  type RateLimitResult,
} from "@/lib/quiz/rate-limit";
import { TEASER_CATEGORY } from "@/lib/quiz/teasers";
import { seal } from "@/lib/quiz/token";
import {
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  type GenerateRequest,
  type GenerateResponse,
} from "@/lib/quiz/types";

export const runtime = "nodejs";
/** Generating 100 questions is a long request by design. */
export const maxDuration = 300;

/** Requests allowed in the burst window. Stops a retry loop and a flood. */
const BURST_LIMIT = 6;
const BURST_WINDOW_MS = 60 * 1000;

/** Model calls allowed per window. The budget, measured in work not requests. */
const CREDIT_CAPACITY = 16;
const CREDIT_WINDOW_MS = 10 * 60 * 1000;

/** Quizzes allowed to be written at the same time, per connection. */
const MAX_CONCURRENT = 2;

type StreamEvent =
  | { type: "progress" } & GenerateProgress
  | ({ type: "done" } & GenerateResponse)
  | { type: "error"; error: string };

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function tooMany(
  message: string,
  limit: RateLimitResult,
  cap: number,
): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "retry-after": String(limit.retryAfterSeconds),
        "x-ratelimit-limit": String(cap),
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(
          Math.ceil(Date.now() / 1000) + limit.retryAfterSeconds,
        ),
      },
    },
  );
}

/**
 * What a request is worth in model calls.
 *
 * A batch is ten questions, and the planner always adds one spare batch, so
 * a hundred questions cost eleven calls while ten questions cost two. This is
 * why the limiter counts calls rather than requests.
 */
function batchCost(count: number): number {
  return Math.ceil(count / 10) + 1;
}

export async function POST(request: Request) {
  const key = clientKey(request);

  // The cheapest guard first. A flood is turned away before the body is read,
  // so an upload flood never gets to buffer ten megabytes.
  const burst = rateLimit(
    `generate:burst:${key}`,
    BURST_LIMIT,
    BURST_WINDOW_MS,
  );
  if (!burst.ok) {
    return tooMany(
      "Too many requests from this connection. Wait a moment and try again.",
      burst,
      BURST_LIMIT,
    );
  }

  // The gate on the page is a convenience. This is the boundary: the route
  // refuses to spend anything for a browser that has not confirmed its age.
  if (!(await hasAgeProof())) {
    return NextResponse.json(
      { error: "Confirm your age before generating a quiz." },
      { status: 403 },
    );
  }

  // One place in the queue at a time, so a single connection cannot have a
  // pile of quizzes written at the same time.
  const slot = acquireSlot(`generate:slot:${key}`, MAX_CONCURRENT);
  if (!slot.ok) {
    return tooMany(
      "A quiz is still being written. Wait for it to finish, then try again.",
      slot,
      MAX_CONCURRENT,
    );
  }

  // The slot belongs to the stream from here on. It is given back when the
  // generation ends, however it ends.
  let handedOff = false;

  try {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return fail("Could not read that request.", 400);
    }

    // Validate everything before spending a token on the model. The client is
    // never trusted for the count or the category.
    const rawName = String(form.get("name") ?? "").trim();
    const kind = String(form.get("kind") ?? "quiz");
    // Brain teasers are a one-click round with nowhere to put a name, so the
    // name is only required when one will actually be shown.
    const name = kind === "teaser" ? "Player" : rawName;

    if (kind !== "teaser" && (name.length < 1 || name.length > 80)) {
      return fail("Enter a name between 1 and 80 characters.", 400);
    }

    const rawCount = Number(form.get("count"));
    const count = Math.floor(rawCount);
    if (!Number.isFinite(rawCount) || count < MIN_QUESTIONS || count > MAX_QUESTIONS) {
      return fail(
        `Choose between ${MIN_QUESTIONS} and ${MAX_QUESTIONS} questions.`,
        400,
      );
    }

    // The size is known now, so the request can be charged for what it is
    // worth. Ten questions cost two credits, a hundred cost eleven.
    const quota = creditLimit(
      `generate:credit:${key}`,
      batchCost(count),
      CREDIT_CAPACITY,
      CREDIT_WINDOW_MS,
    );
    if (!quota.ok) {
      return tooMany(
        "You have reached the limit for quizzes from this connection. Try again shortly.",
        quota,
        CREDIT_CAPACITY,
      );
    }

    const fileValue = form.get("file");
    const file =
      fileValue instanceof File && fileValue.size > 0 ? fileValue : undefined;

    // "teaser" swaps in the brain teaser prompt. Same pipeline, same validation,
    // same sealing, so a second copy of this handler would only be a copy.
    let categoryId = String(form.get("categoryId") ?? "").trim();
    let sourceText: string | undefined;
    let sourceName: string | undefined;
    let categoryLabel: string;
    let flavour: Flavour = "exam";

    if (kind === "teaser") {
      categoryId = TEASER_CATEGORY.id;
      categoryLabel = TEASER_CATEGORY.label;
      flavour = "teaser";

      if (file) {
        return fail("Brain teasers are written fresh, not from a document.", 400);
      }
    } else if (file) {
      // A document replaces the category: questions come from the file.
      try {
        const extracted = await extractPdfText(file);
        sourceText = extracted.text;
        sourceName = file.name.slice(0, 120);
      } catch (error) {
        if (error instanceof PdfError) return fail(error.message, error.status);
        return fail("That PDF could not be read.", 400);
      }

      // The category is only a label once a document is driving generation.
      const fallback = findCategory(categoryId) ?? findCategory("general")!;
      categoryId = fallback.id;
      categoryLabel = sourceName;
    } else {
      const category = findCategory(categoryId);
      if (!category) return fail("Choose a category.", 400);
      categoryId = category.id;
      categoryLabel = category.label;
    }

    const category = kind === "teaser" ? TEASER_CATEGORY : findCategory(categoryId)!;
    const encoder = new TextEncoder();

    // Cancelling the page aborts this, which stops the model calls rather
    // than paying for a quiz nobody is waiting for.
    const abort = new AbortController();
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      releaseSlot(`generate:slot:${key}`);
    };

    // NDJSON over a single response. Progress arrives as it happens without
    // polling and without any server-side job state to lose on a restart.
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (event: StreamEvent) => {
          try {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          } catch {
            // The reader has gone. The abort below stops the model calls.
          }
        };

        try {
          const questions = await generateQuiz(
            { category, count, flavour, sourceText, signal: abort.signal },
            (progress) => send({ type: "progress", ...progress }),
          );

          if (abort.signal.aborted) {
            // Nobody is listening. There is nothing to report.
          } else if (questions.length === 0) {
            send({
              type: "error",
              error:
                "The model could not produce usable questions this time. Try again, or try a different category.",
            });
          } else {
            const token = seal({
              name,
              categoryId,
              categoryLabel,
              sourceName,
              questions: questions.map((question) => ({ ...question })),
            });

            const payload: GenerateResponse = {
              // The answer key is stripped here. It only exists inside the token.
              questions: questions.map(
                ({ id, question: stem, options, topic }) => ({
                  id,
                  question: stem,
                  options,
                  topic,
                }),
              ),
              token,
              categoryId,
              categoryLabel,
              name,
              sourceName,
              // A large quiz can come up short if the provider drops calls. Saying
              // so is better than quietly serving a shorter quiz than was asked for.
              requested: count,
            };

            send({ type: "done", ...payload });
          }
        } catch (error) {
          send({
            type: "error",
            error:
              error instanceof Error
                ? error.message
                : "Something went wrong while generating.",
          });
        } finally {
          try {
            controller.close();
          } catch {
            // Already closed: the reader cancelled and the stream is done.
          }
          release();
        }
      },
      cancel() {
        // The reader left. Stop the model calls rather than paying for a quiz
        // nobody will read.
        abort.abort();
        release();
      },
    });

    handedOff = true;

    return new Response(stream, {
      headers: {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-store",
        // Stops a reverse proxy from buffering the stream into one lump.
        "x-accel-buffering": "no",
        "x-quiz-model": MODEL,
      },
    });
  } finally {
    // If the stream never got going, the slot is still ours to give back.
    if (!handedOff) releaseSlot(`generate:slot:${key}`);
  }
}

export type { GenerateRequest };
