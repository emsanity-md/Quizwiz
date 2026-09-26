import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container, Section } from "@/components/landing/container";
import { Reveal } from "@/components/landing/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CallToAction() {
  return (
    <Section>
      <Container>
        <Reveal>
          <div className="max-w-2xl border-t border-border pt-12">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl sm:leading-tight">
              Find out what your group actually knows
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Your first three quizzes are free, and you can have one live before
              the kettle boils.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/quiz"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 px-5 text-[0.9375rem]"
                )}
              >
                Start a quiz
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
              {/* A styled anchor rather than a Button rendering an anchor: this
                  one navigates, so it should keep link semantics. */}
              <a
                href="#demo"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-11 px-5 text-[0.9375rem] text-muted-foreground"
                )}
              >
                Play with a sample first
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
