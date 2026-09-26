import { NextResponse } from "next/server";

import { findCategory } from "@/lib/quiz/categories";
import { generateQuiz, type Flavour, type GenerateProgress } from "@/lib/quiz/generate";
import { MODEL } from "@/lib/quiz/nvidia";
import { extractPdfText, PdfError } from "@/lib/quiz/pdf";
import { clientKey, rateLimit } from "@/lib/quiz/rate-limit";
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

const WINDOW_MS = 10 * 60 * 1000;
/** Room for a genuine session of quizzes without opening the door wider. */
const GENERATIONS_PER_WINDOW = 8;

type StreamEvent =
  | { type: "progress" } & GenerateProgress
  | ({ type: "done" } & GenerateResponse)
  | { type: "error"; error: string };

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const limit = rateLimit(
    `generate:${clientKey(request)}`,
    GENERATIONS_PER_WINDOW,
    WINDOW_MS,
  );
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: `Too many quizzes generated from this connection. Try again in ${Math.ceil(
          limit.retryAfterSeconds / 60,
        )} minute(s).`,
      },
      {
        status: 429,
        headers: { "retry-after": String(limit.retryAfterSeconds) },
      },
    );
  }

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

  // NDJSON over a single response. Progress arrives as it happens without
  // polling and without any server-side job state to lose on a restart.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: StreamEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      try {
        const questions = await generateQuiz(
          { category, count, flavour, sourceText },
          (progress) => send({ type: "progress", ...progress }),
        );

        if (questions.length === 0) {
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
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      // Stops a reverse proxy from buffering the stream into one lump.
      "x-accel-buffering": "no",
      "x-quiz-model": MODEL,
    },
  });
}

export type { GenerateRequest };
