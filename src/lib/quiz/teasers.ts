import type { Category } from "./categories";

/**
 * A pseudo-category so brain teasers reuse the whole generation pipeline:
 * batching, validation, sealing and grading all work unchanged. It is
 * deliberately kept out of `CATEGORIES`, which is what the field picker renders.
 */
export const TEASER_CATEGORY: Category = {
  id: "brain-teasers",
  label: "Brain teasers",
  blurb: "Lateral thinking, wordplay, and riddles.",
  topics: [
    "lateral thinking puzzles",
    "riddles that hinge on a word with two meanings",
    "riddles whose answer is a single ordinary word",
    "puzzles about letters, spelling, or sounds",
    "what-am-I riddles about an object or a role",
    "trick questions that still have one fair answer",
    "puzzles about time, money, or counting",
    "riddles with a surprising everyday answer",
  ],
};

/**
 * Multi-clue deduction is deliberately absent. The model writes those with too
 * few clues to have a unique solution, and the "no maybes" rule then pushes it
 * into inventing a confident wrong answer, which is worse than a bland puzzle.
 */

/** A short session. Long enough to feel like a round, short enough to replay. */
export const TEASER_COUNT = 7;
