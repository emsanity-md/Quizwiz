"use client";

import {
  TeaserResult,
  teaserHeadline,
} from "@/components/teasers/teaser-result";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  total: number;
  correct: number;
  bestStreak: number;
  missed: { question: string; explanation: string }[];
  onReplay: () => void;
  onDismiss: () => void;
};

export function TeaserSummary({
  open,
  total,
  correct,
  bestStreak,
  missed,
  onReplay,
  onDismiss,
}: Props) {
  return (
    /* The round result interrupts play, the same as the memory game, so the last
       question is not left sitting behind its own score.

       onOpenChange is not optional here. Base UI's close button, the backdrop
       and Escape all report through it, so leaving it off produces a dialog
       that looks closable and is not. */
    <Dialog open={open} onOpenChange={(next) => !next && onDismiss()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Round over
          </p>
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {teaserHeadline(correct, total)}
          </DialogTitle>
          <DialogDescription>
            {correct} of {total} solved
            {bestStreak > 1 ? `, with a run of ${bestStreak}` : ""}.
          </DialogDescription>
        </DialogHeader>

        <TeaserResult
          total={total}
          correct={correct}
          bestStreak={bestStreak}
          missed={missed}
          onReplay={onReplay}
        />
      </DialogContent>
    </Dialog>
  );
}
