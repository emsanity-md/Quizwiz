"use client";

import { Button } from "@/components/ui/button";
import { GeneratingProgress } from "@/components/quiz/generating-progress";
import { CATEGORIES } from "@/lib/quiz/categories";

type Props = {
  name: string;
  categoryId: string;
  fileName: string | null;
  done: number;
  total: number;
  batches: number;
  batchTotal: number;
  onCancel: () => void;
};

export function StepGenerating({
  name,
  categoryId,
  fileName,
  done,
  total,
  batches,
  batchTotal,
  onCancel,
}: Props) {
  const category = CATEGORIES.find((item) => item.id === categoryId);
  const source = fileName ?? category?.label ?? "your field";

  return (
    <div className="max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Writing your questions
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        One moment, {name.split(" ")[0]}
      </h1>
      <p className="mt-3 text-muted-foreground">
        Writing questions for {source}. You can stay on this page, or come back
        to it.
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
  );
}
