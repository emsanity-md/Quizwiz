import { Container, Section } from "@/components/landing/container";
import { Reveal } from "@/components/landing/reveal";
import { Stat } from "@/components/landing/stat";
import { STATS } from "@/lib/site";

export function Stats() {
  return (
    <Section>
      <Container className="grid gap-10 border-y py-12 sm:grid-cols-3 sm:gap-8 sm:py-14">
        {STATS.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.08}>
            <Stat value={stat.value} suffix={stat.suffix} label={stat.label} />
          </Reveal>
        ))}
      </Container>
    </Section>
  );
}
