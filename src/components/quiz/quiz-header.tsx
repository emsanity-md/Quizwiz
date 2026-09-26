import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** A quieter header than the marketing one: no CTA that goes nowhere. */
export function QuizHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-6">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Quizwiz
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground",
            )}
          >
            Home
          </Link>
        </div>
      </div>
    </header>
  );
}
