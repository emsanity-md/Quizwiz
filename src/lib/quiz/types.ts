/** Shared between the browser and the route handlers. No server-only code. */

export const MAX_QUESTIONS = 100;
export const MIN_QUESTIONS = 1;
export const DEFAULT_QUESTIONS = 10;
/**
 * Questions per model call. Overridden per flavour in `generate.ts`, because
 * exam questions and riddles have very different output sizes.
 */
export const BATCH_SIZE = 10;

export type Question = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
};

export type GenerateRequest = {
  name: string;
  categoryId: string;
  count: number;
  /** Text pulled out of an uploaded PDF. Mutually exclusive with category. */
  sourceText?: string;
  sourceName?: string;
};

export type GenerateResponse = {
  /** Everything except the answer key. Safe to hand to the browser. */
  questions: Omit<Question, "correctIndex" | "explanation">[];
  /** Opaque, encrypted answer key. The browser cannot read it. */
  token: string;
  categoryId: string;
  categoryLabel: string;
  name: string;
  sourceName?: string;
  /** What was asked for. Higher than questions.length means a shortfall. */
  requested: number;
};

export type ReviewRequest = {
  name: string;
  categoryId: string;
  /** Index into the question list, or null for "not answered". */
  answers: (number | null)[];
  token: string;
};

export type ReviewedQuestion = Question & {
  pickedIndex: number | null;
  correct: boolean;
};

export type ReviewResponse = {
  name: string;
  categoryId: string;
  categoryLabel: string;
  sourceName?: string;
  questions: ReviewedQuestion[];
  total: number;
  correctCount: number;
  /** 0-100, whole numbers. */
  score: number;
  accuracy: number;
  band: { label: string; blurb: string };
  unansweredCount: number;
};

export type ApiError = { error: string };
