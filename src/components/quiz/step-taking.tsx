"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { GenerateResponse } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

type Props = {
  quiz: GenerateResponse;
  index: number;
  answers: (number | null)[];
  onAnswer: (optionIndex: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitting: boolean;
};

export function StepTaking({
  quiz,
  index,
  answers,
  onAnswer,
  onPrev,
  onNext,
  onSubmit,
  submitting,
}: Props) {
  const total = quiz.questions.length;
  const question = quiz.questions[index];
  const isLast = index === total - 1;
  const picked = answers[index];
  const answeredCount = answers.filter((answer) => answer !== null).length;

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Question {index + 1} of {total}
        </p>
        {question.topic ? (
          <p className="text-sm text-muted-foreground">{question.topic}</p>
        ) : null}
      </div>

      <Progress
        value={((index + 1) / total) * 100}
        className="mt-3 h-1"
        aria-hidden
      />

      <h1 className="mt-8 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
        {question.question}
      </h1>

      <div
        role="radiogroup"
        aria-label={`Answers for question ${index + 1}`}
        className="mt-6 flex flex-col gap-2"
      >
        {question.options.map((option, optionIndex) => {
          const selected = picked === optionIndex;

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onAnswer(optionIndex)}
              className={cn(
                "flex w-full items-center rounded-lg border border-border bg-card py-3 pl-4 pr-4 text-left text-sm transition-colors",
                "hover:border-foreground/25 hover:bg-muted/50",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                selected && "border-primary bg-primary/5",
              )}
            >
              <span className="font-mono text-xs text-muted-foreground">
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span className="ml-3">{option}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="lg"
          className="h-11 px-4"
          onClick={onPrev}
          disabled={index === 0}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back
        </Button>

        {isLast ? (
          <Button
            size="lg"
            className="h-11 px-5 sm:ml-auto"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "Marking…" : "See my results"}
          </Button>
        ) : (
          <Button
            size="lg"
            className="h-11 px-5 sm:ml-auto"
            onClick={onNext}
            disabled={picked === null || picked === undefined}
          >
            Next
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        )}
      </div>

      {answeredCount < total ? (
        <Alert className="mt-6">
          <AlertDescription>
            {answeredCount} of {total} answered. Anything you skip counts as
            wrong.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
