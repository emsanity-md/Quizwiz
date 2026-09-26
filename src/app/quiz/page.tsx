import type { Metadata } from "next";

import { QuizFlow } from "@/components/quiz/quiz-flow";

export const metadata: Metadata = {
  title: "Take a quiz — Quizwiz",
  description:
    "Answer questions in a subject you know. Pick a field or upload a PDF, choose how many questions you want, and get your score with the reasoning behind every answer.",
};

export default function QuizPage() {
  return <QuizFlow />;
}
