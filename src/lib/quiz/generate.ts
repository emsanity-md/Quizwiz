import "server-only";

import { chat, chatStream } from "./nvidia";
import type { Question } from "./types";
import type { Category } from "./categories";

/**
 * Parallel calls in flight. Measured against the provider: three is reliably
 * fast, six starts returning headers timeouts. Four keeps the 100-question case
 * inside one request without sitting on the edge.
 */
const CONCURRENCY = 4;
/** Extra rounds allowed if a batch comes back short or malformed. */
const MAX_ROUNDS = 4;

type RawQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
};

/**
 * The shape of the writing, not the subject. Both flavours produce the same
 * question structure, so parsing, validation, sealing and grading are shared
 * and only the prompt changes.
 */
export type Flavour = "exam" | "teaser";

const SHARED_RULES = [
  "Every question must have exactly four distinct options with exactly one correct answer.",
  "Distractors must be plausible to someone partway to the answer, and must never be arguable.",
  "The explanation states why the answer is right, in one sentence, and must not simply repeat the option.",
  "Begin your reply immediately with the opening brace of the JSON object. Never think out loud, never explain your approach, never add a preamble.",
  "Reply with a single JSON object and nothing else. No prose, no code fence, no commentary.",
];

const FLAVOURS: Record<Flavour, { system: string[]; shape: string; batch: number }> = {
  exam: {
    system: [
      "You write multiple-choice exam questions that are accurate, unambiguous, and free of trick wording.",
      ...SHARED_RULES,
    ],
    shape: 'topic is a short label of three to five words, e.g. "Photosynthesis and respiration".',
    batch: 10,
  },
  teaser: {
    system: [
      "You write brain teasers that are solved by lateral thinking, wordplay, or careful reading, not by recalling facts.",
      "Each one must be a genuine puzzle: solvable in the head in under a minute, and satisfying once it clicks.",
      "Every puzzle must have a definite, satisfying answer. Never offer 'cannot be determined', 'all of the above', or 'none of the above' as the answer to a puzzle.",
      "No distractor may give the answer away, restate the question, or be obviously the odd one out.",
      "Keep every option the same kind of thing, and roughly the same length.",
      "Write the question as the puzzle itself, never naming the kind of puzzle it is.",
      "Keep them clean. No gore, no cruelty, no adult situations, nothing that turns cruel as a punchline.",
      ...SHARED_RULES,
    ],
    shape: 'topic names the kind of puzzle, e.g. "Lateral thinking" or "Wordplay".',
    // Riddles are wordy and five at a time keeps each call quick, which matters
    // more here than on the quiz where the wait is expected.
    batch: 5,
  },
};

const SHAPE_INSTRUCTIONS = [
  'Return exactly: {"questions":[{"question":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"...","topic":"..."}]}',
  "correctIndex is the zero-based position of the correct option.",
].join(" ");

function text(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Pulls the JSON object out of whatever the model wrapped it in, then checks
 * every field. A malformed batch is dropped rather than repaired: a half-valid
 * question is worse than one fewer question.
 */
export function parseBatch(raw: string): RawQuestion[] {
  let text_ = raw.trim();

  const fence = text_.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) text_ = fence[1].trim();

  const start = text_.indexOf("{");
  const end = text_.lastIndexOf("}");
  if (start === -1 || end <= start) return [];
  text_ = text_.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text_);
  } catch {
    return [];
  }

  const list = (parsed as { questions?: unknown })?.questions;
  if (!Array.isArray(list)) return [];

  const valid: RawQuestion[] = [];
  for (const entry of list) {
    if (typeof entry !== "object" || entry === null) continue;
    const item = entry as Record<string, unknown>;

    const question = text(item.question);
    const explanation = text(item.explanation);
    if (!question || !explanation) continue;

    if (!Array.isArray(item.options)) continue;
    const options = item.options.map(text);
    if (options.length !== 4 || options.some((option) => option === null)) {
      continue;
    }

    const clean = options as string[];
    // Two identical options make the question unanswerable.
    if (new Set(clean.map((o) => o.toLowerCase())).size !== 4) continue;

    const correctIndex = item.correctIndex;
    if (
      typeof correctIndex !== "number" ||
      !Number.isInteger(correctIndex) ||
      correctIndex < 0 ||
      correctIndex > 3
    ) {
      continue;
    }

    valid.push({
      question,
      options: clean,
      correctIndex,
      explanation,
      topic: text(item.topic) ?? "",
    });
  }

  return valid;
}

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function dedupe(list: RawQuestion[]): RawQuestion[] {
  const seen = new Set<string>();
  const out: RawQuestion[] = [];
  for (const item of list) {
    const key = normalise(item.question);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

type BatchRequest = {
  flavour: Flavour;
  /** Built per attempt so a retry can ask for less and fit the budget. */
  instructionFor: (ask: number) => string;
  avoid: string[];
};

/** Tries, and how much less to ask for each time. */
const ATTEMPTS = [1, 0.5, 0.5];

/**
 * Roughly how many streamed characters one finished question costs, reasoning
 * included. Only used to turn tokens into a fraction of a batch, so being out
 * changes how fast the bar crawls rather than where it lands. Measured at
 * roughly 3,000 for this model; the ceiling at 0.94 keeps a batch from
 * appearing finished before it actually is.
 */
const CHARS_PER_QUESTION = 3000;
const BATCH_CEILING = 0.94;
/** How often progress may be reported at most, in milliseconds. */
const PROGRESS_INTERVAL_MS = 120;

async function runBatch(
  request: BatchRequest,
  onTick?: (fraction: number) => void,
): Promise<RawQuestion[]> {
  const { flavour, instructionFor } = request;
  const system = FLAVOURS[flavour].system.join(" ");
  const full = FLAVOURS[flavour].batch;
  const avoid = request.avoid.length
    ? `\n\nDo not use any of these, which have already been used:\n${request.avoid
        .map((q) => `- ${q}`)
        .join("\n")}`
    : "";

  for (const [attempt, scale] of ATTEMPTS.entries()) {
    // Halving the ask is the fix for a truncated answer: the model runs the
    // token budget out mid-question, and asking for fewer lets it finish.
    const ask = Math.max(3, Math.round(full * scale));
    const user = `${instructionFor(ask)}\n\n${SHAPE_INSTRUCTIONS}\n${FLAVOURS[flavour].shape}${avoid}`;
    const temperature = attempt === 0 ? 0.7 : 0.9;

    // A dead stream must not cost the batch: fall back to the whole-response
    // call, which has no progress to report but still returns an answer.
    const report = (chars: number) =>
      onTick?.(
        Math.min(
          BATCH_CEILING,
          (chars / (ask * CHARS_PER_QUESTION)) * BATCH_CEILING,
        ),
      );

    try {
      const parsed = parseBatch(
        await chatStream({
          system,
          user,
          temperature,
          onTick: (tick) => report(tick.chars),
        }),
      );
      if (parsed.length > 0) return parsed;
    } catch {
      try {
        const parsed = parseBatch(await chat({ system, user, temperature }));
        if (parsed.length > 0) return parsed;
      } catch {
        // Cold starts and truncation both land here. Try again, asking for less.
      }
    }
  }

  return [];
}

async function runAll(
  requests: BatchRequest[],
  onTick?: (batch: number, fraction: number) => void,
): Promise<RawQuestion[][]> {
  const results: RawQuestion[][] = new Array(requests.length);
  let cursor = 0;

  async function worker() {
    while (cursor < requests.length) {
      const index = cursor++;
      results[index] = await runBatch(requests[index], (fraction) =>
        onTick?.(index, fraction),
      );
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, requests.length) }, worker),
  );

  return results;
}

type PlanInput = {
  category: Category;
  count: number;
  round: number;
  flavour: Flavour;
  sourceText?: string;
  existing: string[];
};

function planBatches({
  category,
  count,
  round,
  flavour,
  sourceText,
  existing,
}: PlanInput) {
  const full = FLAVOURS[flavour].batch;
  // One spare batch. Without it a seven question round is a single call, so one
  // truncated answer loses the whole round. The surplus is sliced off.
  const needed = Math.ceil(count / full);
  const batchCount = Math.max(1, needed + (round === 0 ? 1 : 0));
  const requests: BatchRequest[] = [];

  for (let i = 0; i < batchCount; i += 1) {
    // Two topics per batch, not one. A single hint pulls every question in the
    // batch toward the same kind of puzzle.
    const start = (round * batchCount + i) % category.topics.length;
    const topics = [0, 1]
      .map((offset) => category.topics[(start + offset) % category.topics.length])
      .join(" or ");

    const instructionFor =
      sourceText !== undefined
        ? (ask: number) => {
            // Hand each batch a different window of the document so parallel
            // calls read different pages rather than the same first page.
            const span = Math.max(1200, Math.floor(sourceText.length / batchCount));
            const start = Math.min(i * span, Math.max(0, sourceText.length - span));
            const slice = sourceText.slice(start, start + span).trim();
            return `Write ${ask} multiple-choice exam questions from this excerpt of the user's document.\n\nExcerpt:\n"""\n${slice}\n"""`;
          }
        : flavour === "teaser"
          ? (ask: number) =>
              `Write ${ask} brain teasers. Draw them from these kinds of puzzle, and vary which kind each one is: ${topics}. Each must be solvable by thinking, not by knowing facts.`
          : (ask: number) =>
              `Write ${ask} multiple-choice exam questions for a quiz in this field: ${category.label}. Concentrate on: ${topics}.`;

    requests.push({ flavour, instructionFor, avoid: existing });
  }

  return requests;
}

export type GenerateInput = {
  category: Category;
  count: number;
  flavour?: Flavour;
  sourceText?: string;
};

/**
 * `done` is fractional while a batch is still streaming, in question units, so
 * the page can count up smoothly instead of jumping once per batch.
 */
export type GenerateProgress = {
  done: number;
  total: number;
  /** Batches finished, and how many are planned. */
  batches: number;
  batchTotal: number;
};

export type ProgressReporter = (progress: GenerateProgress) => void;

/**
 * Produces up to `count` questions. Rounds are only repeated when a batch came
 * back short, so the common case is a single round of parallel calls.
 */
export async function generateQuiz(
  input: GenerateInput,
  onProgress?: ProgressReporter,
): Promise<Question[]> {
  const { category, count, flavour = "exam", sourceText } = input;

  let collected: RawQuestion[] = [];
  const full = FLAVOURS[flavour].batch;

  for (let round = 0; round < MAX_ROUNDS; round += 1) {
    if (collected.length >= count) break;

    const requests = planBatches({
      category,
      count,
      round,
      flavour,
      sourceText,
      existing: collected.map((item) => item.question),
    });

    // Per-batch streaming fractions, so a batch being written right now counts
    // towards the total instead of the bar sitting still until it lands.
    const fractions = new Map<number, number>();
    let finished = 0;
    let lastSent = 0;
    let lastWhole = -1;

    // Tokens arrive far faster than anyone can see a bar move, and every event
    // re-renders the page. Emit when a whole question lands or every ~120ms,
    // and always on a batch boundary, since the bar glides on the client.
    const report = (force = false) => {
      let partial = 0;
      for (const value of fractions.values()) partial += value * full;

      const done = Math.min(count, collected.length + finished + partial);
      const whole = Math.floor(done);
      const stamp = Date.now();

      if (!force && whole === lastWhole && stamp - lastSent < PROGRESS_INTERVAL_MS) {
        return;
      }

      lastSent = stamp;
      lastWhole = whole;

      onProgress?.({
        done,
        total: count,
        batches: finished,
        batchTotal: requests.length,
      });
    };

    const settled = await runAll(requests, (batch, fraction) => {
      fractions.set(batch, fraction);
      report();
    });

    for (let i = 0; i < settled.length; i += 1) {
      finished += 1;
      report(true);
    }

    const before = collected.length;
    collected = dedupe([...collected, ...settled.flat()]);

    report(true);

    // A round that adds nothing new means the model is failing, not that we
    // asked for too few. Stopping here saves four rounds of doomed calls.
    if (collected.length === before) break;
  }

  return collected.slice(0, count).map((item, index) => ({
    id: `q${index + 1}`,
    question: item.question,
    options: item.options,
    correctIndex: item.correctIndex,
    explanation: item.explanation,
    topic: item.topic,
  }));
}
