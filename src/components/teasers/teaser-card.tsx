"use client";

import { CheckIcon, LoaderIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type TeaserQuestion = {
  id: string;
  question: string;
  options: string[];
  topic: string;
};

export type TeaserReveal = {
  correctIndex: number;
  explanation: string;
};

type Props = {
  question: TeaserQuestion;
  index: number;
  total: number;
  picked: number | null;
  reveal: TeaserReveal | null;
  revealing: boolean;
  streak: number;
  onPick: (optionIndex: number) => void;
  onNext: () => void;
  onFinish: () => void;
};

export function TeaserCard({
  question,
  index,
  total,
  picked,
  reveal,
  revealing,
  streak,
  onPick,
  onNext,
  onFinish,
}: Props) {
  const answered = reveal !== null;
  const isLast = index === total - 1;
  const right = answered && picked === reveal.correctIndex;

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Twister {index + 1} of {total}
        </p>
        {streak > 1 ? (
          <p className="text-sm text-muted-foreground">{streak} in a row</p>
        ) : null}
      </div>

      <Progress value={((index + 1) / total) * 100} className="mt-3 h-1" aria-hidden />

      {question.topic ? (
        <p className="mt-8 text-sm text-muted-foreground">{question.topic}</p>
      ) : null}

      <h1 className="mt-2 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
        {question.question}
      </h1>

      <div
        role="radiogroup"
        aria-label={`Options for twister ${index + 1}`}
        className="mt-6 flex flex-col gap-2"
      >
        {question.options.map((option, optionIndex) => {
          const isPicked = picked === optionIndex;
          // The right answer lights up whether or not it was chosen, so a wrong
          // guess still teaches something on the way past.
          const showAnswer = answered && optionIndex === reveal.correctIndex;
          const showMiss = answered && isPicked && optionIndex !== reveal.correctIndex;

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isPicked}
              disabled={answered || revealing}
              onClick={() => onPick(optionIndex)}
              className={cn(
                "flex w-full items-center rounded-lg border border-border bg-card py-3 pl-4 pr-4 text-left text-sm transition-colors",
                "hover:not-disabled:border-foreground/25 hover:not-disabled:bg-muted/50",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                "disabled:cursor-default",
                showAnswer && "border-success bg-success/10",
                showMiss && "border-destructive bg-destructive/10",
                answered && !showAnswer && !showMiss && "opacity-55",
              )}
            >
              <span className="font-mono text-xs text-muted-foreground">
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span className="ml-3">{option}</span>

              {showAnswer ? (
                <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckIcon className="size-3.5" />
                </span>
              ) : null}
              {showMiss ? (
                <span className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  <XIcon className="size-3.5" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <p role="status" className="sr-only">
        {revealing
          ? "Checking your answer."
          : answered
            ? right
              ? "Correct."
              : "Not this time."
            : ""}
      </p>

      <div className="mt-6 min-h-16">
        {revealing ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderIcon className="size-4 animate-spin" />
            Checking…
          </p>
        ) : null}

        {answered ? (
          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold">
              {right ? "Twisted it" : "Not this time"}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {reveal.explanation}
            </p>
          </div>
        ) : null}

        {!answered && !revealing ? (
          <p className="text-sm text-muted-foreground">
            Pick an answer to see the reasoning.
          </p>
        ) : null}
      </div>

      <div className="mt-6">
        <Button
          size="lg"
          className="h-11 w-full px-5 sm:w-auto"
          onClick={isLast ? onFinish : onNext}
          disabled={!answered}
        >
          {isLast ? "See how you did" : "Next twister"}
        </Button>
      </div>
    </div>
  );
}
