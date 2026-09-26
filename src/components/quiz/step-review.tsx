"use client";

import Link from "next/link";
import { ArrowRightIcon, CheckIcon, XIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Stat } from "@/components/landing/stat";
import { Reveal } from "@/components/landing/reveal";
import type { ReviewResponse } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

type Props = {
  review: ReviewResponse;
  onRestart: () => void;
};

export function StepReview({ review, onRestart }: Props) {
  return (
    <div>
      <Reveal>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Your result
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          {review.name.split(" ")[0]}, here is how it went
        </h1>
        <p className="mt-3 text-muted-foreground">
          {review.sourceName
            ? `Questions written from ${review.sourceName}.`
            : `${review.categoryLabel}.`}{" "}
          Every question is below with the reasoning.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8">
          <div className="grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-12">
            <div>
              <p className="text-6xl font-semibold tracking-tight tabular-nums">
                {review.score}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">out of 100</p>
            </div>

            <div>
              <p className="text-lg font-semibold">{review.band.label}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {review.band.blurb}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 border-t border-border pt-6 sm:grid-cols-3">
            <Stat value={review.correctCount} label="Correct" />
            <Stat
              value={review.total - review.correctCount}
              label="Incorrect"
            />
            <Stat value={review.unansweredCount} label="Skipped" />
          </div>

          <p className="mt-6 border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
            This is a measure of how you did on these questions, not a
            measurement of ability. It is worth reading the questions you missed
            below rather than the number.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <h2 className="mt-16 text-xl font-semibold tracking-tight">
          Every question
        </h2>
      </Reveal>

      <ol className="mt-6 flex flex-col gap-4">
        {review.questions.map((question, position) => (
          <li key={question.id}>
            <Reveal delay={0.02 * Math.min(position, 10)}>
              <article
                className={cn(
                  "rounded-xl border bg-card p-5 shadow-xs sm:p-6",
                  question.correct ? "border-success/40" : "border-destructive/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                      question.correct
                        ? "bg-success/15 text-success"
                        : "bg-destructive/15 text-destructive"
                    )}
                  >
                    {question.correct ? (
                      <CheckIcon className="size-3.5" />
                    ) : (
                      <XIcon className="size-3.5" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {question.correct ? "Correct" : "Incorrect"}
                      {question.pickedIndex === null ? " · skipped" : ""}
                    </p>

                    <h3 className="mt-2 text-base font-semibold text-balance">
                      {question.question}
                    </h3>

                    <ul className="mt-4 flex flex-col gap-1.5">
                      {question.options.map((option, optionIndex) => {
                        const isCorrect = optionIndex === question.correctIndex;
                        const isPicked = optionIndex === question.pickedIndex;

                        return (
                          <li
                            key={option}
                            className={cn(
                              "flex items-start gap-2.5 rounded-md px-2.5 py-1.5 text-sm",
                              isCorrect && "bg-success/10",
                              !isCorrect && isPicked && "bg-destructive/10",
                              !isCorrect && !isPicked && "text-muted-foreground"
                            )}
                          >
                            <span className="font-mono text-xs text-muted-foreground">
                              {String.fromCharCode(65 + optionIndex)}
                            </span>
                            <span>{option}</span>
                            {isCorrect ? (
                              <span className="ml-auto shrink-0 text-xs font-semibold text-success">
                                correct answer
                              </span>
                            ) : isPicked ? (
                              <span className="ml-auto shrink-0 text-xs font-semibold text-destructive">
                                your answer
                              </span>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>

                    <p className="mt-4 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center">
        <Button size="lg" className="h-11 px-5" onClick={onRestart}>
          Take another quiz
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost", size: "lg" }),
            "h-11 px-5 text-muted-foreground",
          )}
        >
          Back to the home page
        </Link>
      </div>
    </div>
  );
}
