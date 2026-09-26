import type { Metadata } from "next";

import { Container, Section } from "@/components/landing/container";
import { PageCta } from "@/components/landing/page-cta";
import { PageHeader } from "@/components/landing/page-header";
import { Reveal } from "@/components/landing/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HELP_GROUPS } from "@/lib/pages/help";

export const metadata: Metadata = {
  title: "Help centre — Quizwiz",
  description:
    "Answers on writing questions, sharing a quiz, reading the results, plans and limits, and the things that go wrong most often.",
};

export default function HelpPage() {
  return (
    <>
      <PageHeader
        eyebrow="Help centre"
        title="Answers to the questions we get most"
        lead="Five groups, twenty short answers, and no sign-up to read them. Where an answer is missing, the article below says what we know about it so far."
        note="Twenty answers across five groups. Updated September 2026."
      />

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-12">
            <nav
              aria-label="Help topics"
              className="flex flex-col gap-2 lg:sticky lg:top-24 lg:self-start"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Topics
              </p>
              {HELP_GROUPS.map((group) => (
                <a
                  key={group.id}
                  href={`#${group.id}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {group.title}
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-12">
              {HELP_GROUPS.map((group, index) => (
                <Reveal key={group.id} delay={0.04 * index}>
                  {/* scroll-mt clears the sticky header when a topic is linked to. */}
                  <section id={group.id} className="scroll-mt-24">
                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                      {group.title}
                    </h2>
                    <p className="mt-2 text-muted-foreground">{group.blurb}</p>

                    <Accordion defaultValue={[]} multiple className="mt-5">
                      {group.articles.map((article) => (
                        <AccordionItem key={article.question} value={article.question}>
                          <AccordionTrigger className="py-4 text-base hover:no-underline">
                            {article.question}
                          </AccordionTrigger>
                          <AccordionContent className="max-w-2xl pb-5 leading-relaxed text-muted-foreground">
                            {article.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </section>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <PageCta
        eyebrow="Still stuck"
        title="The fastest answer is usually a quiz you can run right now"
        lead="Every template is a working set of questions with the length and the timing already decided. Take one, read the per-question breakdown, and you will know what to change."
        action={{ label: "Browse the templates", href: "/templates" }}
        secondary={{ label: "Take a quiz", href: "/quiz" }}
      />
    </>
  );
}
