import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container, Section } from "@/components/landing/container";
import { Reveal } from "@/components/landing/reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PageCtaLink = {
  label: string;
  href: string;
};

type PageCtaProps = {
  eyebrow: string;
  title: string;
  lead: string;
  /** The one thing you want the reader to do. */
  action: PageCtaLink;
  secondary?: PageCtaLink;
};

/**
 * The closer at the bottom of a content page. Same shape as the landing CTA,
 * but the words and the links are per page: a status page should not end by
 * asking someone to start a quiz.
 */
export function PageCta({ eyebrow, title, lead, action, secondary }: PageCtaProps) {
  return (
    <Section>
      <Container>
        <Reveal>
          <div className="max-w-2xl border-t border-border pt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
              {title}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {lead}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={action.href}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 px-5 text-[0.9375rem]"
                )}
              >
                {action.label}
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
              {secondary ? (
                <Link
                  href={secondary.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "h-11 px-5 text-[0.9375rem] text-muted-foreground"
                  )}
                >
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
