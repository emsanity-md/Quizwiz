import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/landing/container";
import { HeroText } from "@/components/landing/hero-text";
import { HeroTexture } from "@/components/landing/hero-texture";
import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <HeroTexture />
      {/* The hero gets more air than the bands below it. Everywhere else uses
          the shared section rhythm. */}
      <Container className="relative py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl">
          <Badge variant="secondary">Now in public beta</Badge>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-[1.06]">
            <HeroText text="Turn anything into a quiz worth taking." />
          </h1>

          <Reveal delay={0.35}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Give Quizwiz a topic, a document, or a bank of questions you
              already have. It turns them into a quiz you can send as a single
              link, then shows you exactly which questions landed.
            </p>
          </Reveal>

          <Reveal delay={0.45}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" className="h-11 px-5 text-[0.9375rem]">
                Start a quiz
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              {/* A styled anchor rather than a Button rendering an anchor: this
                  one navigates, so it should keep link semantics. */}
              <a
                href="#demo"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-5 text-[0.9375rem]"
                )}
              >
                See a live example
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.55}>
            <p className="mt-6 text-sm text-muted-foreground">
              No credit card. Your first three quizzes are free.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
