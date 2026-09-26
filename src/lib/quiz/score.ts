import type { AnswerKey } from "./token";
import type { ReviewResponse, ReviewedQuestion } from "./types";

/**
 * Grading is arithmetic on purpose. No model is involved, so the score cannot
 * drift and the same answers always produce the same result.
 *
 * Everything rendered in the review comes out of the sealed key, including the
 * question text. Nothing is taken back from the browser, so a tampered client
 * cannot restyle a question to make a wrong answer look right.
 */

export type Band = { label: string; blurb: string };

/**
 * A description of how well the attempt went, not a measurement of ability.
 * Deliberately avoids IQ-style framing: these numbers come from a handful of
 * generated questions and would not survive being read as an IQ result.
 */
export function bandFor(accuracy: number): Band {
  if (accuracy >= 0.9) {
    return {
      label: "Advanced",
      blurb: "Comfortable across the board. Try a harder category.",
    };
  }
  if (accuracy >= 0.75) {
    return {
      label: "Proficient",
      blurb: "Solid grasp, with a few gaps worth revisiting.",
    };
  }
  if (accuracy >= 0.5) {
    return {
      label: "Developing",
      blurb: "The basics are there. The review below is where the marks are.",
    };
  }
  return {
    label: "Foundational",
    blurb: "Worth going back to the source material before moving on.",
  };
}

export function buildReview(
  key: AnswerKey,
  answers: (number | null)[],
  categoryLabel: string,
): ReviewResponse {
  const questions: ReviewedQuestion[] = key.questions.map((sealed, index) => {
    const pickedIndex = answers[index] ?? null;

    return {
      id: sealed.id,
      question: sealed.question,
      options: sealed.options,
      correctIndex: sealed.correctIndex,
      explanation: sealed.explanation,
      topic: sealed.topic,
      pickedIndex,
      correct: pickedIndex === sealed.correctIndex,
    };
  });

  const total = questions.length;
  const correctCount = questions.filter((item) => item.correct).length;
  // Unanswered questions count against the score, so leaving blanks is not a way
  // to protect a percentage.
  const accuracy = total === 0 ? 0 : correctCount / total;

  return {
    name: key.name,
    categoryId: key.categoryId,
    categoryLabel,
    sourceName: key.sourceName,
    questions,
    total,
    correctCount,
    score: Math.round(accuracy * 100),
    accuracy: Math.round(accuracy * 1000) / 10,
    band: bandFor(accuracy),
    unansweredCount: total - questions.filter((q) => q.pickedIndex !== null).length,
  };
}
