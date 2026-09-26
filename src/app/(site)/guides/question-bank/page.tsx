import type { Metadata } from "next";

import { Container, Section } from "@/components/landing/container";
import { PageCta } from "@/components/landing/page-cta";
import { PageHeader } from "@/components/landing/page-header";
import { Reveal } from "@/components/landing/reveal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/pages/format";
import { GUIDE_CHECKLIST, GUIDE_SECTIONS } from "@/lib/pages/resources";

export const metadata: Metadata = {
  title: "Question bank guide — Quizwiz",
  description:
    "How many questions a quiz should have, which question types earn their place, what makes a good explanation, and the CSV format for importing a bank you already have.",
};

export default function QuestionBankGuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="Guide"
        title="The question bank guide"
        lead="Everything we have learned about writing questions that somebody learns from. Long enough to be useful, short enough to read before a lesson."
        note={`Seven sections, about twelve minutes. Last reviewed ${formatDate("2026-09-20")}.`}
      />

      <Section className="pt-10 sm:pt-12">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-12">
            <nav
              aria-label="On this page"
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                On this page
              </p>
              <ol className="mt-3 flex flex-col gap-2">
                {GUIDE_SECTIONS.map((section, index) => (
                  <li key={section.id} className="flex gap-2 text-sm">
                    <span className="text-muted-foreground/60 tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={`#${section.id}`}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="flex flex-col gap-12">
              {GUIDE_SECTIONS.map((section, index) => (
                <Reveal key={section.id} delay={0.04 * index}>
                  <section id={section.id} className="scroll-mt-24">
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                      {section.heading}
                    </h2>

                    <div className="mt-4 flex max-w-2xl flex-col gap-4">
                      {section.blocks.map((block, blockIndex) => {
                        if (block.type === "p") {
                          return (
                            <p
                              key={blockIndex}
                              className="leading-relaxed text-muted-foreground"
                            >
                              {block.text}
                            </p>
                          );
                        }

                        if (block.type === "ul") {
                          return (
                            <ul
                              key={blockIndex}
                              className="flex flex-col gap-2.5 text-muted-foreground"
                            >
                              {block.items.map((item) => (
                                <li key={item} className="flex gap-2.5 leading-relaxed">
                                  <span
                                    aria-hidden="true"
                                    className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground/60"
                                  />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }

                        if (block.type === "table") {
                          return (
                            <div
                              key={blockIndex}
                              className="overflow-x-auto rounded-lg border border-border"
                            >
                              <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                  <tr className="bg-muted/50">
                                    {block.head.map((cell) => (
                                      <th
                                        key={cell}
                                        scope="col"
                                        className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                                      >
                                        {cell}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {block.rows.map((row) => (
                                    <tr key={row[0]} className="border-t border-border">
                                      {row.map((cell, cellIndex) => (
                                        <td
                                          key={cell}
                                          className="px-4 py-3 align-top leading-relaxed text-muted-foreground first:text-foreground"
                                        >
                                          {cellIndex === 0 ? <code>{cell}</code> : cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        }

                        return (
                          <figure key={blockIndex} className="flex flex-col gap-2">
                            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs leading-relaxed">
                              <code className="font-mono">{block.code}</code>
                            </pre>
                            <figcaption className="text-xs text-muted-foreground">
                              {block.caption}
                            </figcaption>
                          </figure>
                        );
                      })}
                    </div>
                  </section>
                </Reveal>
              ))}

              <Reveal>
                <Card className="gap-4 [--card-spacing:--spacing(6)]">
                  <CardHeader>
                    <CardTitle>Before you publish</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-col gap-2.5">
                      {GUIDE_CHECKLIST.map((item) => (
                        <li
                          key={item}
                          className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <PageCta
        eyebrow="Put it into practice"
        title="Start with a template, or bring your own bank"
        lead="The templates already have the length and the question mix decided. If you have written questions before, the CSV format above will take about two minutes to get right."
        action={{ label: "Browse the templates", href: "/templates" }}
        secondary={{ label: "Take a quiz", href: "/quiz" }}
      />
    </>
  );
}
