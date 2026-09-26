import {
  ChartColumnIcon,
  LinkIcon,
  PaletteIcon,
  SparklesIcon,
  TimerIcon,
  UploadIcon,
  type LucideIcon,
} from "lucide-react";

import { Container, Section } from "@/components/landing/container";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURES } from "@/lib/site";

const ICONS: Record<(typeof FEATURES)[number]["icon"], LucideIcon> = {
  sparkles: SparklesIcon,
  link: LinkIcon,
  chart: ChartColumnIcon,
  upload: UploadIcon,
  timer: TimerIcon,
  palette: PaletteIcon,
};

export function Features() {
  return (
    <Section id="features">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title="Everything the quiz needs, nothing it does not"
            lead="Six things worth having. We have left out leaderboards, streaks, and anything else that turns a quiz into a game."
          />
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = ICONS[feature.icon];

            return (
              <Reveal key={feature.title} delay={0.06 * index} className="h-full">
                <Card className="h-full gap-4 shadow-xs transition-shadow duration-200 hover:shadow-sm [--card-spacing:--spacing(6)]">
                  <CardHeader>
                    <Icon className="size-5 text-muted-foreground" />
                    <CardTitle className="mt-3">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.body}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
