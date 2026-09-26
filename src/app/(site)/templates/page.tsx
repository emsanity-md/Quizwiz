import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ClockIcon, ListChecksIcon, TimerIcon } from "lucide-react";

import { Container, Section } from "@/components/landing/container";
import { PageCta } from "@/components/landing/page-cta";
import { PageHeader } from "@/components/landing/page-header";
import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { QUIZ_TEMPLATES } from "@/lib/pages/resources";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Quiz templates — Quizwiz",
  description:
    "Eight ready-made quiz shapes: warm-ups, exit tickets, end of unit checks, reading comprehension, lab safety, onboarding, and pre-exam practice.",
};

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Templates"
        title="A shape to start from, then make it yours"
        lead="Each of these is a question set that already works: the length, the timing, and the mix of question types are decided for you. Open one, edit the wording, and it is yours."
        note={`${QUIZ_TEMPLATES.length} templates. Every one is a starting point, not a fixed quiz.`}
      />

      <Section className="pt-10 sm:pt-12">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {QUIZ_TEMPLATES.map((template, index) => (
              <Reveal key={template.id} delay={0.05 * index} className="h-full">
                <Card
                  id={template.id}
                  className="h-full scroll-mt-24 gap-4 shadow-xs [--card-spacing:--spacing(6)]"
                >
                  <CardHeader>
                    <Badge variant="outline" className="text-muted-foreground">
                      {template.audience}
                    </Badge>
                    <CardTitle className="mt-3">{template.title}</CardTitle>
                    <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <li className="flex items-center gap-1.5">
                        <ListChecksIcon className="size-3.5" />
                        {template.questions} questions
                      </li>
                      <li className="flex items-center gap-1.5">
                        <ClockIcon className="size-3.5" />
                        {template.minutes} min
                      </li>
                      <li className="flex items-center gap-1.5">
                        <TimerIcon className="size-3.5" />
                        {template.timed ? "Timed" : "Untimed"}
                      </li>
                    </ul>
                  </CardHeader>

                  <CardContent className="flex flex-1 flex-col gap-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {template.summary}
                    </p>
                    <ul className="mt-auto flex flex-col gap-2">
                      {template.includes.map((item) => (
                        <li key={item} className="flex gap-2 text-sm">
                          <span
                            aria-hidden="true"
                            className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/60"
                          />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground">
                      Subject area: {template.category}
                    </p>
                  </CardContent>

                  <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                    <Link
                      href="/quiz"
                      className={cn(
                        buttonVariants({ size: "sm" }),
                        "h-8 px-3"
                      )}
                    >
                      Use this template
                      <ArrowRightIcon data-icon="inline-end" />
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      Editable before you publish
                    </span>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <PageCta
        eyebrow="Nothing that fits"
        title="Or start from your own bank"
        lead="If you already have questions written, import them as CSV or JSON and keep the wording you have. The guide has the column format and an example file."
        action={{ label: "Read the question bank guide", href: "/guides/question-bank" }}
        secondary={{ label: "Start a quiz", href: "/quiz" }}
      />
    </>
  );
}
