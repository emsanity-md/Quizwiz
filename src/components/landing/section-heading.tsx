import * as React from "react";

import { PROSE_WIDTH } from "@/components/landing/container";
import { cn } from "@/lib/utils";

type HeadingProps = {
  /** Small label above the title. The page's one accent moment per band. */
  eyebrow: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  className?: string;
};

/** Every band opens with the same three lines, in the same order and measure. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
}: HeadingProps) {
  return (
    <div className={cn(PROSE_WIDTH, className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
        {title}
      </h2>
      <p className="mt-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
        {lead}
      </p>
    </div>
  );
}
