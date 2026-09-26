import { CallToAction } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SampleQuiz } from "@/components/landing/sample-quiz";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Stats />
        <SampleQuiz />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Faq />
        <CallToAction />
      </main>
      <SiteFooter />
    </>
  );
}
