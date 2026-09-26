"use client";

import * as React from "react";
import { FileTextIcon, XIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES } from "@/lib/quiz/categories";
import { MAX_QUESTIONS, MIN_QUESTIONS } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

/** Matches the server's limits, so the UI never offers what will be rejected. */
const MAX_PDF_BYTES = 10 * 1024 * 1024;

type Props = {
  categoryId: string;
  count: number;
  file: File | null;
  onCountChange: (count: number) => void;
  onFileChange: (file: File | null) => void;
  onBack: () => void;
  onNext: () => void;
};

export function StepSetup({
  categoryId,
  count,
  file,
  onCountChange,
  onFileChange,
  onBack,
  onNext,
}: Props) {
  const [fileError, setFileError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const category = CATEGORIES.find((item) => item.id === categoryId);
  // Generating in batches costs time and quota, so the UI says so up front
  // rather than letting someone discover it mid-wait.
  const estimate =
    count <= 20 ? "under a minute" : count <= 60 ? "a minute or two" : "a few minutes";

  function pickFile(next: File | null) {
    if (!next) {
      onFileChange(null);
      setFileError(null);
      return;
    }
    const isPdf =
      next.type === "application/pdf" || next.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFileError("Only PDF files can be used.");
      return;
    }
    if (next.size > MAX_PDF_BYTES) {
      setFileError(
        `That file is ${(next.size / 1024 / 1024).toFixed(1)}MB. The limit is 10MB.`,
      );
      return;
    }
    setFileError(null);
    onFileChange(next);
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Step 3
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        How many questions?
      </h1>
      <p className="mt-3 text-muted-foreground">
        {file
          ? "Questions will come from your document instead of the field."
          : `From ${category?.label ?? "the field you picked"}. Up to ${MAX_QUESTIONS}.`}
      </p>

      <div className="mt-8 max-w-xl">
        <div className="flex items-baseline justify-between gap-4">
          <Label htmlFor="quiz-count" className="text-sm">
            Number of questions
          </Label>
          <span className="text-2xl font-semibold tabular-nums">{count}</span>
        </div>

        <input
          id="quiz-count"
          type="range"
          min={MIN_QUESTIONS}
          max={MAX_QUESTIONS}
          step={1}
          value={count}
          onChange={(event) => onCountChange(Number(event.target.value))}
          className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />

        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{MIN_QUESTIONS}</span>
          <span>{MAX_QUESTIONS}</span>
        </div>

        <Progress
          value={(count / MAX_QUESTIONS) * 100}
          className="mt-4 h-1"
          aria-hidden
        />

        <p className="mt-3 text-sm text-muted-foreground">
          Expect {estimate}. Longer quizzes are written in batches, in parallel.
        </p>
      </div>

      <div className="mt-8 max-w-xl">
        <Label htmlFor="quiz-file" className="text-sm">
          Or use your own PDF
        </Label>
        <p className="mt-1 text-sm text-muted-foreground">
          Questions are written from the text in the file. This replaces the
          field above.
        </p>

        <input
          ref={inputRef}
          id="quiz-file"
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
            <span className="shrink-0 text-sm text-muted-foreground">
              {(file.size / 1024).toFixed(0)}KB
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                pickFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              aria-label="Remove file"
            >
              <XIcon />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className={cn("mt-3 h-10 px-4")}
            onClick={() => inputRef.current?.click()}
          >
            Choose a PDF
          </Button>
        )}

        {fileError ? (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription>{fileError}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button variant="ghost" size="lg" className="h-11 px-5" onClick={onBack}>
          Back
        </Button>
        <Button
          size="lg"
          className="h-11 px-5 sm:ml-auto"
          onClick={onNext}
          disabled={Boolean(fileError)}
        >
          Generate my quiz
        </Button>
      </div>
    </div>
  );
}
