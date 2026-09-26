import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * The single page gutter. Every band on the page lines up to this.
 *
 * 5xl rather than 6xl: on a wide screen 6xl left the content floating in the
 * middle with the header running well past it, which read as loose rather than
 * airy. 5xl still fits three feature columns and the four-wide memory grid.
 */
export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("mx-auto w-full max-w-5xl px-6", className)} {...props} />
  );
}

/**
 * The single vertical rhythm. Every band on the page uses this padding.
 *
 * 56/80px. This was 80/112px, which was enough air to read as a gap rather than
 * as breathing room once you scrolled more than a screen.
 */
export function Section({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return <section className={cn("py-14 sm:py-20", className)} {...props} />;
}

/** Measure cap for prose, so paragraphs never run longer than they should. */
export const PROSE_WIDTH = "max-w-2xl";
