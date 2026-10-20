import type { Metadata } from "next";

import { QuizFlow } from "@/components/quiz/quiz-flow";
import { hasAgeProof } from "@/lib/quiz/age-proof";

export const metadata: Metadata = {
  title: "Take a quiz — Quizwiz",
  description:
    "Answer questions in a subject you know. Pick a field or upload a PDF, choose how many questions you want, and get your score with the reasoning behind every answer.",
};

export default async function QuizPage() {
  // Read on the server so the gate does not flash before it settles.
  const verified = await hasAgeProof();

  return <QuizFlow verified={verified} />;
}
