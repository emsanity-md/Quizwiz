"use client";

import { useReducedMotion } from "motion/react";

import CountUp from "@/components/CountUp";

type StatProps = {
  value: number;
  suffix?: string;
  label: string;
};

export function Stat({ value, suffix = "", label }: StatProps) {
  const reduce = useReducedMotion();
  const formatted = new Intl.NumberFormat("en-US").format(value);

  return (
    <div>
      <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
        {/* CountUp writes its figure in an effect, so the real number travels on
            the element for the no-script stylesheet to show. Reduced motion
            moves the starting point instead of swapping markup, which keeps the
            server and client output identical. */}
        <span className="stat-value" data-value={formatted}>
          <CountUp
            to={value}
            from={reduce ? value : 0}
            duration={1.6}
            separator=","
          />
        </span>
        {suffix ? <span className="text-muted-foreground">{suffix}</span> : null}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
