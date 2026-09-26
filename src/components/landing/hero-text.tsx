"use client";

import BlurText from "@/components/BlurText";
import { cn } from "@/lib/utils";

type HeroTextProps = {
  text: string;
  className?: string;
};

/**
 * The hero headline, one word at a time. Restrained on purpose: a 16px lift and
 * a 6px blur is enough to feel considered.
 *
 * Motion writes its starting state into the markup, so the words are painted
 * invisible before hydration. The `blur-reveal` class is what the reduced
 * motion and no-script rules in the app target to hold them at their final
 * state instead.
 */
export function HeroText({ text, className }: HeroTextProps) {
  return (
    <BlurText
      text={text}
      className={cn("blur-reveal", className)}
      delay={55}
      animateBy="words"
      threshold={0.2}
      easing={[0.22, 1, 0.36, 1]}
      animationFrom={{ filter: "blur(6px)", opacity: 0, y: 16 }}
      animationTo={[
        { filter: "blur(2px)", opacity: 0.6, y: 2 },
        { filter: "blur(0px)", opacity: 1, y: 0 },
      ]}
      stepDuration={0.28}
    />
  );
}
