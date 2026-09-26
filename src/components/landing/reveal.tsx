"use client";

import * as React from "react";

import FadeContent from "@/components/FadeContent";

type RevealProps = {
  children: React.ReactNode;
  /** Seconds to hold before revealing. Use it to stagger siblings. */
  delay?: number;
  className?: string;
};

/**
 * One reveal for the whole page: a short fade as a block scrolls into view.
 * `data-reveal` is the hook the reduced-motion rule in globals.css uses to pin
 * the final state, so nothing is ever left stuck invisible.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <FadeContent
      data-reveal=""
      className={className}
      delay={delay}
      duration={0.6}
      ease="power2.out"
      threshold={0.15}
    >
      {children}
    </FadeContent>
  );
}
