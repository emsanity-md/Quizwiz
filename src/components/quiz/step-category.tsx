"use client";

import { ArrowRightIcon, CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/quiz/categories";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export function StepCategory({ value, onChange, onNext, onBack }: Props) {
  const selected = CATEGORIES.find((item) => item.id === value);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Step 2
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        Pick a field
      </h1>
      <p className="mt-3 text-muted-foreground">
        Questions are written for the field you choose, spread across its usual
        topics rather than hammering one of them.
      </p>

      <div
        role="radiogroup"
        aria-label="Quiz category"
        className="mt-8 grid gap-3 sm:grid-cols-2"
      >
        {CATEGORIES.map((category) => {
          const isSelected = category.id === value;

          return (
            <button
              key={category.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(category.id)}
              className={cn(
                "flex flex-col items-start rounded-xl border border-border bg-card p-5 text-left shadow-xs transition-colors",
                "hover:border-foreground/25 hover:bg-muted/40",
                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                isSelected && "border-primary bg-primary/5",
              )}
            >
              <span className="flex w-full items-start justify-between gap-3">
                <span className="font-semibold">{category.label}</span>
                {isSelected ? (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CheckIcon className="size-3.5" />
                  </span>
                ) : null}
              </span>
              <span className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {category.blurb}
              </span>
            </button>
          );
        })}
      </div>

      {/* Choosing a card only marks it. Moving on is a separate, deliberate
          click, so a stray tap in a twelve item grid cannot skip a step. */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="lg" className="h-11 px-5" onClick={onBack}>
          Back
        </Button>

        <div className="sm:text-right">
          <p className="mb-2 text-sm text-muted-foreground">
            {selected ? (
              <>
                <span className="text-foreground">{selected.label}</span>{" "}
                selected
              </>
            ) : (
              "Choose one to carry on"
            )}
          </p>
          <Button
            size="lg"
            className="h-11 w-full px-5 sm:w-auto"
            onClick={onNext}
            disabled={!selected}
          >
            Continue
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </div>
  );
}
