"use client";

import * as React from "react";

import { GeneratingProgress } from "@/components/quiz/generating-progress";
import { TeaserCard, type TeaserReveal } from "@/components/teasers/teaser-card";
import { TeaserSummary } from "@/components/teasers/teaser-summary";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { generateQuiz, QuizApiError } from "@/lib/quiz/client";
import { TEASER_CATEGORY, TEASER_COUNT } from "@/lib/quiz/teasers";
import type { GenerateResponse } from "@/lib/quiz/types";

type Phase = "intro" | "generating" | "playing" | "summary";

type Missed = { question: string; explanation: string };

export function TeaserFlow() {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [round, setRound] = React.useState<GenerateResponse | null>(null);
  const [index, setIndex] = React.useState(0);

  const [picked, setPicked] = React.useState<number | null>(null);
  const [reveal, setReveal] = React.useState<TeaserReveal | null>(null);
  const [revealing, setRevealing] = React.useState(false);

  const [progress, setProgress] = React.useState({
    done: 0,
    total: TEASER_COUNT,
    batches: 0,
    batchTotal: 0,
  });
  const [error, setError] = React.useState<string | null>(null);

  const [correct, setCorrect] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [missed, setMissed] = React.useState<Missed[]>([]);

  const abortRef = React.useRef<AbortController | null>(null);
  React.useEffect(() => () => abortRef.current?.abort(), []);

  const question = round?.questions[index] ?? null;

  async function start() {
    setError(null);
    setProgress({ done: 0, total: TEASER_COUNT, batches: 0, batchTotal: 0 });
    setPhase("generating");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await generateQuiz(
        {
          name: "Player",
          categoryId: TEASER_CATEGORY.id,
          count: TEASER_COUNT,
          kind: "teaser",
        },
        (next) => setProgress(next),
        controller.signal,
      );

      setRound(result);
      setIndex(0);
      setPicked(null);
      setReveal(null);
      setCorrect(0);
      setStreak(0);
      setBestStreak(0);
      setMissed([]);
      setPhase("playing");
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError(
        caught instanceof QuizApiError
          ? caught.message
          : "Something went wrong while twisting.",
      );
      setPhase("intro");
    } finally {
      abortRef.current = null;
    }
  }

  async function pick(optionIndex: number) {
    if (!round || !question || reveal || revealing) return;

    setPicked(optionIndex);
    setRevealing(true);

    try {
      const response = await fetch("/api/teaser/reveal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: round.token, id: question.id }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new QuizApiError(body.error || "That answer could not be checked.");
      }

      const answer = (await response.json()) as TeaserReveal;
      setReveal(answer);

      if (optionIndex === answer.correctIndex) {
        setCorrect((n) => n + 1);
        setStreak((n) => {
          const next = n + 1;
          setBestStreak((best) => Math.max(best, next));
          return next;
        });
      } else {
        setStreak(0);
        setMissed((list) =>
          list.some((item) => item.question === question.question)
            ? list
            : [...list, { question: question.question, explanation: answer.explanation }],
        );
      }
    } catch (caught) {
      setError(
        caught instanceof QuizApiError
          ? caught.message
          : "That answer could not be checked.",
      );
    } finally {
      setRevealing(false);
    }
  }

  function advance() {
    if (!round) return;
    if (index >= round.questions.length - 1) {
      setPhase("summary");
      return;
    }
    setIndex((current) => current + 1);
    setPicked(null);
    setReveal(null);
  }

  return (
    <>
      {error ? (
        <Alert variant="destructive" className="mb-8">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {phase === "intro" ? (
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Brain teaser twister
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Seven puzzles. No setup. See how many you can twist.
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Lateral thinking, wordplay, and riddles, written fresh each time.
                Work the puzzle, commit to an answer, and the reasoning appears
                straight away.
              </p>

              <Button size="lg" className="mt-6 h-11 px-6" onClick={start}>
                Start twisting
              </Button>

              <ul className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground">
                <li>No name, no account, no setup.</li>
                <li>Every puzzle is new, so a replay is a different round.</li>
                <li>Wrong answers still show you the reasoning.</li>
              </ul>
            </div>
          ) : null}

          {phase === "generating" ? (
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Twisting
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Working out your puzzles
              </h1>
              <p className="mt-3 text-muted-foreground">
                Each one is written from scratch, so this takes a moment.
              </p>

              <div className="mt-8">
                <GeneratingProgress
                  done={progress.done}
                  total={progress.total}
                  batches={progress.batches}
                  batchTotal={progress.batchTotal}
                  noun="puzzles"
                />
              </div>

              <Button
                variant="ghost"
                size="lg"
                className="mt-8 h-11 px-5"
                onClick={() => {
                  abortRef.current?.abort();
                  abortRef.current = null;
                  setPhase("intro");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : null}

          {/* The same card in both phases: the round result is a dialog laid
              over it, and closing that dialog puts you back here rather than
              on an empty page. */}
          {(phase === "playing" || phase === "summary") && round && question ? (
            <div
              aria-hidden={phase === "summary"}
              className={phase === "summary" ? "pointer-events-none opacity-40" : undefined}
            >
              <TeaserCard
                question={question}
                index={index}
                total={round.questions.length}
                picked={picked}
                reveal={reveal}
                revealing={revealing}
                streak={streak}
                onPick={pick}
                onNext={advance}
                onFinish={advance}
              />
            </div>
          ) : null}

          {phase === "summary" && round ? (
            <TeaserSummary
              open
              total={round.questions.length}
              correct={correct}
              bestStreak={bestStreak}
              missed={missed}
              onReplay={start}
              onDismiss={() => setPhase("playing")}
            />
          ) : null}
    </>
  );
}
