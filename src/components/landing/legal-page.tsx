import * as React from "react";

import { Container, PROSE_WIDTH, Section } from "@/components/landing/container";
import { PageHeader } from "@/components/landing/page-header";
import type { LegalDocument } from "@/lib/pages/legal";

/**
 * The shared shape of the two legal documents.
 *
 * Both are the same thing: a lead, a date, and a run of numbered-in-spirit
 * sections. Keeping them on one renderer means a change to how a document
 * reads lands on both.
 */
export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <>
      <PageHeader
        eyebrow={document.eyebrow}
        title={document.title}
        lead={document.lead}
        note={document.note}
      />

      <Section>
        <Container>
          <div className={PROSE_WIDTH}>
            {document.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 mb-10 last:mb-0"
              >
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {section.title}
                </h2>

                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-3 leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.points ? (
                  <ul className="mt-4 flex flex-col gap-2 text-muted-foreground">
                    {section.points.map((point) => (
                      <li key={point} className="flex gap-3 leading-relaxed">
                        <span
                          aria-hidden="true"
                          className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground/60"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
