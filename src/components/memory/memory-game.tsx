"use client";

import * as React from "react";
import {
  AppleIcon,
  BirdIcon,
  BugIcon,
  CherryIcon,
  FishIcon,
  KeyRoundIcon,
  RocketIcon,
  SunIcon,
} from "lucide-react";

import { MemoryResult } from "@/components/memory/memory-result";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createDeck,
  flipDown,
  isComplete,
  matchedPairs,
  peekSecondsLeft,
  pickCard,
  type Card,
  type PendingPair,
} from "@/lib/memory/deck";
import { cn } from "@/lib/utils";

/** Eight faces, so eight pairs. Sixteen cards in a 4x4 grid is the classic
 *  layout and finishes in a couple of minutes rather than five. */
const FACES = [
  AppleIcon,
  BirdIcon,
  BugIcon,
  CherryIcon,
  FishIcon,
  KeyRoundIcon,
  RocketIcon,
  SunIcon,
] as const;

/** How long a mismatched pair stays visible before turning back over. */
const FLIP_BACK_MS = 700;
/** How long the player gets to study the board before it turns over. */
const PEEK_SECONDS = 6;

type Phase = "ready" | "peek" | "play";

export function MemoryGame() {
  const [cards, setCards] = React.useState<Card[]>(() => createDeck(FACES.length));
  const [phase, setPhase] = React.useState<Phase>("ready");
  const [peekLeft, setPeekLeft] = React.useState(0);
  const [resultOpen, setResultOpen] = React.useState(false);
  const [first, setFirst] = React.useState<number | null>(null);
  const [pending, setPending] = React.useState<PendingPair | null>(null);
  const [moves, setMoves] = React.useState(0);
  const [seconds, setSeconds] = React.useState(0);

  const found = matchedPairs(cards);
  const complete = isComplete(cards);

  // The board is dealt once and stays dealt, so the peek shows the arrangement
  // the player is about to play. Re-shuffling here would defeat the point.
  function begin() {
    deadline.current = Date.now() + PEEK_SECONDS * 1000;
    setPeekLeft(PEEK_SECONDS);
    setPhase("peek");
  }

  // Countdown, then hand over to play. Driven off a deadline rather than a
  // chain of timeouts so a backgrounded tab cannot skip the peek.
  React.useEffect(() => {
    if (phase !== "peek") return;

    const timer = setInterval(() => {
      const left = peekSecondsLeft(deadline.current, Date.now());
      setPeekLeft(left);
      if (left === 0) {
        clearInterval(timer);
        setPhase("play");
      }
    }, 250);

    return () => clearInterval(timer);
  }, [phase]);

  // The clock only runs while there is something left to find.
  React.useEffect(() => {
    if (phase !== "play" || complete) return;
    const timer = setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, [phase, complete]);

  const deadline = React.useRef(0);
  const timerRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  React.useEffect(() => () => clearTimeout(timerRef.current), []);

  function pick(index: number) {
    if (phase !== "play") return;

    const outcome = pickCard(cards, first, pending, index);
    if (!outcome) return;

    setCards(outcome.cards);
    setFirst(outcome.first);
    setPending(outcome.pending);
    if (outcome.countsAsMove) setMoves((n) => n + 1);
    if (outcome.complete) setResultOpen(true);

    clearTimeout(timerRef.current);

    if (outcome.pending) {
      // A mismatch stays readable long enough to be remembered, which is the
      // whole point of the game. A third click cuts the wait short.
      const { a, b } = outcome.pending;
      timerRef.current = setTimeout(() => {
        setCards((current) => flipDown(current, a, b));
        setPending(null);
      }, FLIP_BACK_MS);
    }
  }

  function restart() {
    clearTimeout(timerRef.current);
    setCards(createDeck(FACES.length));
    setPhase("ready");
    setPeekLeft(0);
    setResultOpen(false);
    setFirst(null);
    setPending(null);
    setMoves(0);
    setSeconds(0);
  }

  const minutes = Math.floor(seconds / 60);
  const clock = `${minutes}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Memory twister
        </h1>
        {phase === "play" ? (
          <p className="text-sm tabular-nums text-muted-foreground">
            {moves} {moves === 1 ? "move" : "moves"} · {clock}
          </p>
        ) : null}
      </div>

      <p className="mt-3 text-muted-foreground">
        Sixteen cards, eight pairs. Get a look at them first, then find every
        pair from memory.
      </p>

      {/* Start sits above the board. A visitor should never have to scroll past
          sixteen cards to find out how the game begins. */}
      {phase === "ready" ? (
        <div className="mt-5">
          <Button size="lg" className="h-11 px-5" onClick={begin}>
            Start
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            Every card turns over for six seconds. That is your only look.
          </p>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-4 gap-3">
        {cards.map((card, index) => {
          const Face = FACES[card.face];
          // The peek is the whole point of the start button, so every card is
          // treated as face up for its duration.
          const open = card.revealed || card.matched || phase === "peek";

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => pick(index)}
              disabled={phase !== "play"}
              aria-label={
                open ? `Card ${index + 1}, showing ${card.face + 1}` : `Card ${index + 1}, face down`
              }
              className="relative aspect-square [perspective:60rem] focus-visible:outline-none disabled:cursor-default"
            >
              <span
                className={cn(
                  "absolute inset-0 block transition-transform duration-200 ease-out [transform-style:preserve-3d] motion-reduce:transition-none",
                  open && "[transform:rotateY(180deg)]",
                )}
              >
                <span className="absolute inset-0 flex items-center justify-center rounded-xl border border-border bg-card text-lg font-semibold text-muted-foreground shadow-xs [backface-visibility:hidden]">
                  ?
                </span>
                <span
                  className={cn(
                    "absolute inset-0 flex items-center justify-center rounded-xl border shadow-xs [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    card.matched
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-primary/40 bg-primary/5 text-primary",
                  )}
                >
                  <Face className="size-7 sm:size-8" />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {phase === "peek" ? (
        <div className="mt-6 flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/5 p-6">
          <span className="text-3xl font-semibold tabular-nums">{peekLeft}</span>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Memorise them. They turn back over in{" "}
            {peekLeft === 1 ? "a second" : `${peekLeft} seconds`}.
          </p>
        </div>
      ) : null}

      {phase === "play" && !complete ? (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {found} of {FACES.length} pairs found
          </p>
          <Button variant="ghost" size="lg" className="h-11 px-5" onClick={restart}>
            Shuffle and start over
          </Button>
        </div>
      ) : null}

      {/* Closing the result leaves the finished board with a one line summary,
          so a dismissed dialog never strands the page. */}
      {complete && !resultOpen ? (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Solved in {moves} {moves === 1 ? "move" : "moves"} · {clock}
          </p>
          <Button variant="ghost" size="lg" className="h-11 px-5" onClick={restart}>
            Play again
          </Button>
        </div>
      ) : null}

      {/* The result interrupts play rather than sliding in underneath it, so
          the board is not left half covered by its own score. */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Solved</DialogTitle>
            <DialogDescription>
              Every pair found. Here is how it went.
            </DialogDescription>
          </DialogHeader>

          <MemoryResult moves={moves} clock={clock} onReplay={restart} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
