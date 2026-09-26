"use client";

import { Button } from "@/components/ui/button";
import { GeneratingProgress } from "@/components/quiz/generating-progress";
import { PdfPreview } from "@/components/quiz/pdf-preview";
import { CATEGORIES } from "@/lib/quiz/categories";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  categoryId: string;
  /** The whole file, not just its name: it is what the preview renders. */
  file: File | null;
  done: number;
  total: number;
  batches: number;
  batchTotal: number;
  onCancel: () => void;
};

export function StepGenerating({
  name,
  categoryId,
  file,
  done,
  total,
  batches,
  batchTotal,
  onCancel,
}: Props) {
  const category = CATEGORIES.find((item) => item.id === categoryId);
  const source = file?.name ?? category?.label ?? "your field";

  return (
    /* With a document the page sits beside the copy, and the scan runs over it.
       Without one there is nothing to show, so it stays a single column. */
    <div
      className={cn(
        file
          ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]"
          : "max-w-xl"
      )}
    >
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {file ? "Reading your document" : "Writing your questions"}
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          One moment, {name.split(" ")[0]}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {file
            ? "Pulling the text out of your file and writing questions from it. You can stay on this page, or come back to it."
            : `Writing questions for ${source}. You can stay on this page, or come back to it.`}
        </p>

        <div className="mt-8">
          <GeneratingProgress
            done={done}
            total={total}
            batches={batches}
            batchTotal={batchTotal}
            noun="questions"
          />
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          {total > 10
            ? "Longer quizzes are written in batches, several at a time, so the first one can take a minute."
            : "This usually takes under a minute."}
        </p>

        <Button
          variant="ghost"
          size="lg"
          className="mt-6 h-11 px-5"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>

      {file ? (
        <PdfPreview
          file={file}
          scanning
          className="mx-auto w-56 lg:mx-0 lg:w-full lg:self-start"
        />
      ) : null}
    </div>
  );
}
