import { Container, Section } from "@/components/landing/container";
import { Reveal } from "@/components/landing/reveal";
import { Stat } from "@/components/landing/stat";
import { STATS } from "@/lib/site";

export function Stats() {
  return (
    <Section>
      <Container className="grid gap-8 border-y py-8 sm:grid-cols-3 sm:gap-6 sm:py-10">
        {STATS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.08}>
            <Stat value={stat.value} suffix={stat.suffix} label={stat.label} />
          </Reveal>
        ))}
      </Container>
    </Section>
  );
}
