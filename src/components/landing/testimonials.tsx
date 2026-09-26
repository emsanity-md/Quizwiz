import { Container, Section } from "@/components/landing/container";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { TESTIMONIALS } from "@/lib/site";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export function Testimonials() {
  return (
    <Section>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="In use"
            title="What people use it for"
            lead="Placeholder quotes until there are real ones to publish. The shape of the section will not change."
          />
        </Reveal>

        <div className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={0.08 * index} className="h-full">
              <figure className="flex h-full flex-col">
                <blockquote className="text-pretty leading-relaxed">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
                  >
                    {initials(testimonial.name)}
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold">
                      {testimonial.name}
                    </span>
                    <span className="block text-muted-foreground">
                      {testimonial.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
