"use client";

import { Button } from "@/components/ui/button";

/** The fewest moves possible: every pick is a fresh pair. */
export const PERFECT_MOVES = 8;

/**
 * The result of a finished board, with no dialog around it, so the wording and
 * the perfect-move arithmetic can be checked on their own.
 */
export function MemoryResult({
  moves,
  clock,
  onReplay,
}: {
  moves: number;
  clock: string;
  onReplay: () => void;
}) {
  const over = Math.max(0, moves - PERFECT_MOVES);

  return (
    <>
      <p className="text-2xl font-semibold tracking-tight">
        {moves} {moves === 1 ? "move" : "moves"} in {clock}
      </p>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {over === 0
          ? "Not one wasted turn. That is as clean as this game goes."
          : `A clean solve takes ${PERFECT_MOVES} moves, so you spent ${over} on remembering rather than hunting.`}
      </p>

      <Button size="lg" className="h-11 px-5" onClick={onReplay}>
        Play again
      </Button>
    </>
  );
}
