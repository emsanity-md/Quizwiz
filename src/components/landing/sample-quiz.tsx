"use client";

import * as React from "react";
import { ArrowRightIcon, XIcon } from "lucide-react";

import SpringCheck from "@/components/SpringCheck";
import { Container, Section } from "@/components/landing/container";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { Button } from "@/components/ui/button";
import { SAMPLE_QUESTIONS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SampleQuiz() {
  const [index, setIndex] = React.useState(0);
  const [picked, setPicked] = React.useState<number | null>(null);

  const question = SAMPLE_QUESTIONS[index];
  const answered = picked !== null;
  const right = picked === question.answer;

  function move(offset: number) {
    setIndex((current) => (current + offset + SAMPLE_QUESTIONS.length) % SAMPLE_QUESTIONS.length);
    setPicked(null);
  }

  return (
    <Section id="demo">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-12">
          <Reveal>
            <SectionHeading
              eyebrow="Try it"
              title="This is what taking one feels like"
              lead="Pick an answer and you get the result straight away, with the reasoning behind it. No account, no waiting on a score email."
            />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Question {index + 1} of {SAMPLE_QUESTIONS.length}
              </p>

              <p className="mt-4 text-lg font-semibold tracking-tight text-balance">
                {question.question}
              </p>

              <div
                role="group"
                aria-label="Answer options"
                className="mt-6 flex flex-col gap-2"
              >
                {question.options.map((option, optionIndex) => {
                  const isAnswer = optionIndex === question.answer;
                  const isPicked = optionIndex === picked;

                  return (
                    // The row is a button, so the result marker is a sibling
                    // placed over its right edge rather than nested inside it.
                    <div key={option} className="relative">
                      <button
                        type="button"
                        disabled={answered}
                        onClick={() => setPicked(optionIndex)}
                        className={cn(
                          "flex w-full items-center rounded-lg border border-border bg-background py-3 pl-4 pr-11 text-left text-sm transition-colors",
                          "hover:not-disabled:border-foreground/25 hover:not-disabled:bg-muted/60",
                          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                          "disabled:cursor-default",
                          answered &&
                            isAnswer &&
                            "border-success bg-success/10 text-foreground",
                          answered &&
                            isPicked &&
                            !isAnswer &&
                            "border-destructive bg-destructive/10 text-foreground",
                          answered && !isAnswer && !isPicked && "opacity-55"
                        )}
                      >
                        <span className="font-mono text-xs text-muted-foreground">
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <span className="ml-3">{option}</span>
                      </button>

                      {answered && isAnswer ? (
                        <SpringCheck
                          checked
                          strike="none"
                          label=""
                          doneOpacity={1}
                          boxSize={20}
                          color="var(--success)"
                          fillColor="var(--success)"
                          checkColor="var(--success-foreground)"
                          className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 [--sc-row:20px] [--sc-gap:0px]"
                          aria-hidden
                          tabIndex={-1}
                        />
                      ) : null}

                      {answered && isPicked && !isAnswer ? (
                        <span className="absolute top-1/2 right-3.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-[7px] bg-destructive/15 text-destructive">
                          <XIcon className="size-3.5" />
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <p role="status" className="sr-only">
                {answered
                  ? right
                    ? "Correct."
                    : `Not quite. The answer is ${question.options[question.answer]}.`
                  : ""}
              </p>

              {answered ? (
                <div className="mt-6 border-t border-border pt-5">
                  <p className="text-sm font-semibold">
                    {right ? "Correct" : "Not quite"}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {question.explanation}
                  </p>
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  {SAMPLE_QUESTIONS.map((item, dotIndex) => (
                    <span
                      key={item.question}
                      className={cn(
                        "size-1.5 rounded-full transition-colors",
                        dotIndex === index ? "bg-primary" : "bg-border"
                      )}
                    />
                  ))}
                </div>
                {answered ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => move(1)}
                    className="text-muted-foreground"
                  >
                    Next question
                    <ArrowRightIcon data-icon="inline-end" />
                  </Button>
                ) : null}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
