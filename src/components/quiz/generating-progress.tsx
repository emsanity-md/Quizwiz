"use client";

import * as React from "react";
import { ClockIcon } from "lucide-react";

import ThoughtLine from "@/components/quiz/ThoughtLine";
import { Progress } from "@/components/ui/progress";

type Props = {
  /** Fractional while a batch streams, in question units. */
  done: number;
  total: number;
  batches: number;
  batchTotal: number;
  /** What is being counted, for the counter. */
  noun: string;
  /**
   * False once the work is finished. The thought line settles on its own and
   * says how long it took, so the wait has an ending rather than just stopping.
   */
  working?: boolean;
  /** The uploaded document, if there is one. A big one makes the wait longer. */
  file?: File | null;
};

/**
 * Said in order while waiting. These name the work rather than inventing a
 * percentage, so nothing here can be a lie about how far along it is.
 */
const STAGES = [
  "Starting the model",
  "Working out what to ask",
  "Writing them now",
  "Checking the answers",
  "Almost there",
];

/**
 * How long the wait runs before it says anything about itself. A minute is
 * past what the estimate promised, so from there on it owes the visitor an
 * explanation rather than a silent bar.
 */
const SLOW_AFTER_SECONDS = 60;

/** A document this size is a couple of hundred pages of text. */
const BIG_FILE_BYTES = 2 * 1024 * 1024;

/** Past this many, writing the questions genuinely takes minutes. */
const MANY_QUESTIONS = 20;

/**
 * Why the wait is running long, in the visitor's terms.
 *
 * The bar only shows that work is happening. This says why it is taking a
 * while, so a long wait reads as a long job rather than a broken one.
 */
function slowNote(count: number, noun: string, file: File | null): string {
  if (file && file.size > BIG_FILE_BYTES) {
    return "That document is a big one, so the questions take longer to write. Please be patient.";
  }

  if (count > MANY_QUESTIONS) {
    return `Writing ${count} ${noun} takes a while. Please be patient.`;
  }

  return "This is taking a little longer than usual. Please be patient.";
}

/**
 * How long the thought line is left to settle before the next screen takes
 * over. Long enough to read "Thought for 12.4s", short enough not to be in
 * the way.
 */
export const SETTLE_MS = 480;

/**
 * The shared wait screen. Both the quiz and the twister use it, so they cannot
 * drift apart.
 *
 * The bar fills from real streamed tokens, which is the only reason it moves at
 * all: a batch that is still being written counts towards the total instead of
 * the bar sitting at the same number until it lands. The thought line above it
 * says what is happening, and the trace grows as the work gets further along.
 */
export function GeneratingProgress({
  done,
  total,
  batches,
  batchTotal,
  noun,
  working = true,
  file = null,
}: Props) {
  const [startedAt] = React.useState(() => Date.now());
  const [now, setNow] = React.useState(() => Date.now());

  // A local clock so elapsed time keeps moving between progress events.
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ratio = total === 0 ? 0 : Math.min(1, done / total);
  const percent = Math.round(ratio * 100);
  const whole = Math.min(total, Math.floor(done));

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  // Only meaningful once there is progress to extrapolate from, and rounded up
  // so it never promises less time than it takes.
  const remaining =
    ratio > 0.08 && ratio < 1 ? Math.max(1, Math.ceil(elapsed / ratio - elapsed)) : null;

  const stageIndex = Math.min(STAGES.length - 1, Math.floor(ratio * STAGES.length));
  const stage = STAGES[stageIndex];
  // The trace only shows the stages that have been reached, so it never claims
  // work that has not happened yet.
  const steps = STAGES.slice(0, stageIndex + 1);

  return (
    <div>
      <ThoughtLine
        working={working}
        steps={steps}
        label="Thinking…"
        doneLabel="Thought for"
        glyph="sparkle"
        fontSize={15}
        breathPeriod={1.6}
        breathDepth={0.45}
        settleDuration={350}
        settleBlur={2}
        collapsible
        collapseOnSettle
        showTimer
      />

      {/* The thought line above is decoration as far as a screen reader is
          concerned, so the stage is announced here instead. */}
      <p className="sr-only" aria-live="polite">
        {stage}
      </p>

      <div className="mt-6 flex items-baseline justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">{whole}</span> of{" "}
          {total} {noun}
        </p>
        <p className="text-2xl font-semibold tabular-nums">{percent}%</p>
      </div>

      {/* No shimmer here. The bar fills from real streamed tokens, so it moves
          on its own, and a decorative sweep would only be claiming activity
          that is not being measured. */}
      <Progress value={percent} className="mt-3 h-2" />

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <p>
          {batchTotal > 0 ? (
            <span>
              Batch {Math.min(batches + 1, batchTotal)} of {batchTotal}
            </span>
          ) : null}
          {remaining !== null ? (
            <span className="ml-3">about {remaining}s left</span>
          ) : null}
        </p>
      </div>

      {/* Only once the wait has outlasted the estimate. It goes away with the
          work, so it is never sitting there saying be patient about something
          that has already finished. */}
      {working && elapsed >= SLOW_AFTER_SECONDS ? (
        <p className="mt-4 flex animate-in items-start gap-2 text-sm text-muted-foreground fade-in-0 duration-500">
          <ClockIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{slowNote(total, noun, file)}</span>
        </p>
      ) : null}
    </div>
  );
}
