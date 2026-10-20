import type { Metadata } from "next";

import { LegalPage } from "@/components/landing/legal-page";
import { PRIVACY } from "@/lib/pages/legal";

export const metadata: Metadata = {
  title: "Privacy Policy — Quizwiz",
  description:
    "What Quizwiz collects, what it deliberately does not collect, what happens to a document you upload, and how to have everything removed.",
};

export default function PrivacyPage() {
  return <LegalPage document={PRIVACY} />;
}
