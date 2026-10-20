"use client";

import * as React from "react";

import { AgeGate } from "@/components/quiz/age-gate";
import { SETTLE_MS } from "@/components/quiz/generating-progress";
import { QuizHeader } from "@/components/quiz/quiz-header";
import { StepCategory } from "@/components/quiz/step-category";
import { StepGenerating } from "@/components/quiz/step-generating";
import { StepName } from "@/components/quiz/step-name";
import { StepReview } from "@/components/quiz/step-review";
import { StepSetup } from "@/components/quiz/step-setup";
import { StepTaking } from "@/components/quiz/step-taking";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateQuiz, QuizApiError, submitAnswers } from "@/lib/quiz/client";
import { DEFAULT_QUESTIONS, type GenerateResponse, type ReviewResponse } from "@/lib/quiz/types";

/**
 * "finishing" is the beat between the questions being written and the quiz
 * taking over the screen. The thought line settles in it and says how long
 * the wait was, so the wait has an ending.
 */
type Phase = "name" | "category" | "setup" | "generating" | "finishing" | "taking" | "review";

const FIRST_CATEGORY = "agriculture";

export function QuizFlow({ verified: passed }: { verified: boolean }) {
  const [phase, setPhase] = React.useState<Phase>("name");
  const [name, setName] = React.useState("");
  const [categoryId, setCategoryId] = React.useState(FIRST_CATEGORY);
  const [count, setCount] = React.useState(DEFAULT_QUESTIONS);
  const [file, setFile] = React.useState<File | null>(null);

  // The gate starts where the server said it starts and moves on once the
  // check has been made, so the header stays put either way.
  const [verified, setVerified] = React.useState(passed);

  const [quiz, setQuiz] = React.useState<GenerateResponse | null>(null);
  const [answers, setAnswers] = React.useState<(number | null)[]>([]);
  const [index, setIndex] = React.useState(0);
  const [review, setReview] = React.useState<ReviewResponse | null>(null);

  const [progress, setProgress] = React.useState({
    done: 0,
    total: 0,
    batches: 0,
    batchTotal: 0,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  // A cancelled or failed request must not leave the progress screen behind.
  React.useEffect(() => () => abortRef.current?.abort(), []);

  // The wait ends with a beat. The effect owns the timer, so cancelling or
  // leaving the screen takes the pending move with it.
  React.useEffect(() => {
    if (phase !== "finishing") return;
    const timer = setTimeout(() => setPhase("taking"), SETTLE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  async function start() {
    setError(null);
    setProgress({ done: 0, total: count, batches: 0, batchTotal: 0 });
    setPhase("generating");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await generateQuiz(
        { name: name.trim(), categoryId, count, file },
        (next) => setProgress(next),
        controller.signal,
      );

      setQuiz(result);
      setAnswers(new Array(result.questions.length).fill(null));
      setIndex(0);
      setPhase("finishing");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(
        caught instanceof QuizApiError
          ? caught.message
          : "Something went wrong while generating your quiz.",
      );
      setPhase("setup");
    } finally {
      abortRef.current = null;
    }
  }

  function cancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setProgress({ done: 0, total: 0, batches: 0, batchTotal: 0 });
    setPhase("setup");
  }

  function answer(optionIndex: number) {
    setAnswers((current) => {
      const next = [...current];
      next[index] = optionIndex;
      return next;
    });
  }

  async function mark() {
    if (!quiz) return;
    setSubmitting(true);
    setError(null);

    try {
      setReview(await submitAnswers(quiz.token, answers));
      setPhase("review");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(
        caught instanceof QuizApiError
          ? caught.message
          : "Your answers could not be marked.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function restart() {
    setQuiz(null);
    setReview(null);
    setAnswers([]);
    setIndex(0);
    setError(null);
    setFile(null);
    setPhase("name");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <QuizHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {/* The gate wraps the quiz rather than the page, so the header and
              the theme toggle in it stay reachable while it is answered. */}
          <AgeGate verified={verified} onVerified={() => setVerified(true)}>
            {error ? (
              <Alert variant="destructive" className="mb-8">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {phase === "name" ? (
              <StepName value={name} onChange={setName} onNext={() => setPhase("category")} />
            ) : null}

            {phase === "category" ? (
              <StepCategory
                value={categoryId}
                onChange={setCategoryId}
                onNext={() => setPhase("setup")}
                onBack={() => setPhase("name")}
              />
            ) : null}

            {phase === "setup" ? (
              <StepSetup
                categoryId={categoryId}
                count={count}
                file={file}
                onCountChange={setCount}
                onFileChange={setFile}
                onBack={() => setPhase("category")}
                onNext={start}
              />
            ) : null}

            {phase === "generating" || phase === "finishing" ? (
              <StepGenerating
                name={name}
                categoryId={categoryId}
                file={file}
                done={progress.done}
                total={progress.total}
                batches={progress.batches}
                batchTotal={progress.batchTotal}
                working={phase === "generating"}
                onCancel={cancel}
              />
            ) : null}

            {phase === "taking" && quiz ? (
              <StepTaking
                quiz={quiz}
                index={index}
                answers={answers}
                onAnswer={answer}
                onPrev={() => setIndex((current) => Math.max(0, current - 1))}
                onNext={() =>
                  setIndex((current) => Math.min(quiz.questions.length - 1, current + 1))
                }
                onSubmit={mark}
                submitting={submitting}
              />
            ) : null}

            {phase === "review" && review ? (
              <StepReview review={review} onRestart={restart} />
            ) : null}
          </AgeGate>
        </div>
      </main>
    </>
  );
}
