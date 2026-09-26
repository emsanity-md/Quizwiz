import * as React from "react";

import { cn } from "@/lib/utils";

/** The single page gutter. Every band on the page lines up to this. */
export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6", className)} {...props} />
  );
}

/** The single vertical rhythm. Every band on the page uses this padding. */
export function Section({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return <section className={cn("py-20 sm:py-28", className)} {...props} />;
}

/** Measure cap for prose, so paragraphs never run longer than they should. */
export const PROSE_WIDTH = "max-w-2xl";
