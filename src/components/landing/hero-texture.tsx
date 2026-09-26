"use client";

import { useTheme } from "next-themes";

import DotGrid from "@/components/DotGrid";

/**
 * A quiet field of dots behind the hero. It reacts to the pointer, then fades
 * out downward so it never reads as a panel with an edge.
 */
export function HeroTexture() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
    >
      <DotGrid
        className="h-full w-full"
        dotSize={2}
        gap={26}
        baseColor={dark ? "#3f3f46" : "#e4e4e7"}
        activeColor={dark ? "#818cf8" : "#6366f1"}
        proximity={130}
        speedTrigger={240}
        shockStrength={0}
        resistance={900}
        returnDuration={1.2}
      />
    </div>
  );
}
