import { Container, Section } from "@/components/landing/container";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { STEPS } from "@/lib/site";

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Three steps, one link"
            lead="No tooling to learn and nothing for the people taking it to install. The whole flow is short enough to repeat before every session."
          />
        </Reveal>

        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={0.08 * (index + 1)}>
                <p className="text-sm font-semibold tabular-nums text-primary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
