import * as React from "react";

import { Container, PROSE_WIDTH, Section } from "@/components/landing/container";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  /** One small muted line under the lead: a date, a count, a reply time. */
  note?: React.ReactNode;
  /** Buttons, links, or a badge row. Sits below the note. */
  children?: React.ReactNode;
  className?: string;
};

/**
 * The opening band for every page that is not the landing page. Deliberately the
 * same three lines as SectionHeading, one step up in size, so the pages feel
 * like one site rather than a set of templates.
 *
 * The bottom padding is cut because the band below supplies the rhythm.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  note,
  children,
  className,
}: PageHeaderProps) {
  return (
    <Section className={cn("pb-4 sm:pb-6", className)}>
      <Container>
        <Reveal>
          <div className={PROSE_WIDTH}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl sm:leading-tight">
              {title}
            </h1>
            <p className="mt-4 text-muted-foreground sm:text-lg sm:leading-relaxed">
              {lead}
            </p>
            {note ? (
              <p className="mt-4 text-sm text-muted-foreground">{note}</p>
            ) : null}
            {children ? <div className="mt-8">{children}</div> : null}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
