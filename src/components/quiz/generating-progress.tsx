"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";

type Props = {
  /** Fractional while a batch streams, in question units. */
  done: number;
  total: number;
  batches: number;
  batchTotal: number;
  /** What is being counted, for the counter. */
  noun: string;
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
 * The shared wait screen. Both the quiz and the twister use it, so they cannot
 * drift apart.
 *
 * The bar fills from real streamed tokens, which is the only reason it moves at
 * all: a batch that is still being written counts towards the total instead of
 * the bar sitting at the same number until it lands.
 */
export function GeneratingProgress({
  done,
  total,
  batches,
  batchTotal,
  noun,
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

  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor(ratio * STAGES.length))];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
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
        <p aria-live="polite">{stage}</p>
        <p className="tabular-nums">
          {batchTotal > 0 ? (
            <span>
              Batch {Math.min(batches + 1, batchTotal)} of {batchTotal}
            </span>
          ) : null}
          {remaining !== null ? (
            <span className="ml-3">about {remaining}s left</span>
          ) : elapsed > 0 ? (
            <span className="ml-3">{elapsed}s elapsed</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}
