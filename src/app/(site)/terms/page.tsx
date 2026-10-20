import type { Metadata } from "next";

import { LegalPage } from "@/components/landing/legal-page";
import { TERMS } from "@/lib/pages/legal";

export const metadata: Metadata = {
  title: "Terms & Conditions — Quizwiz",
  description:
    "The agreement between you and Quizwiz: who may use it, what happens to your documents, what the generated questions are worth, and the limits on both sides.",
};

export default function TermsPage() {
  return <LegalPage document={TERMS} />;
}
