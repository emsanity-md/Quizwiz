"use client";

import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** "Every one" for a clean sweep, otherwise a plain read on how it went. */
export function teaserHeadline(correct: number, total: number): string {
  if (correct === total) return "Every one";
  if (correct >= Math.ceil(total / 2)) return "Most of them";
  return "A tough round";
}

/**
 * The body of the round result, with no dialog and no heading around it.
 *
 * Split from the shell so the numbers and wording can be rendered and checked on
 * their own, and so this could be dropped into a page rather than a modal later
 * without being rewritten.
 */
export function TeaserResult({
  total,
  correct,
  bestStreak,
  missed,
  onReplay,
}: {
  total: number;
  correct: number;
  bestStreak: number;
  missed: { question: string; explanation: string }[];
  onReplay: () => void;
}) {
  return (
    <>
      <div className="grid grid-cols-3 gap-4 border-y border-border py-4">
        <div>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {correct}
            <span className="text-base text-muted-foreground">/{total}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Solved</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {bestStreak}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Best run</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {total - correct}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Twisted</p>
        </div>
      </div>

      {missed.length > 0 ? (
        <div className="max-h-64 overflow-y-auto">
          <h3 className="text-sm font-semibold">Worth another look</h3>
          <ol className="mt-3 flex flex-col gap-4">
            {missed.map((item) => (
              <li key={item.question} className="border-l-2 border-border pl-3">
                <p className="text-sm font-semibold text-balance">
                  {item.question}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.explanation}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button size="lg" className="h-11 px-5" onClick={onReplay}>
          Another round
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Link
          href="/quiz"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "h-11 px-5 text-muted-foreground",
          )}
        >
          Try a subject quiz
        </Link>
      </div>
    </>
  );
}
