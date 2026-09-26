/**
 * The memory game's rules, with no React and no DOM.
 *
 * Extracted so the part most likely to be subtly wrong — which card can be
 * turned, what counts as a pair, when the board is finished — can be tested
 * directly instead of being clicked through by hand.
 */

export type Card = {
  id: number;
  face: number;
  revealed: boolean;
  matched: boolean;
};

export type Random = () => number;

export function shuffle<T>(items: T[], random: Random = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createDeck(faceCount: number, random: Random = Math.random): Card[] {
  const paired = Array.from({ length: faceCount }, (_, face) => [
    { id: face * 2, face },
    { id: face * 2 + 1, face },
  ]).flat();

  return shuffle(paired, random).map((card) => ({
    ...card,
    revealed: false,
    matched: false,
  }));
}

/** A card can be turned only if it is face down and not already paired. */
export function canFlip(cards: Card[], index: number): boolean {
  const card = cards[index];
  return Boolean(card) && !card.revealed && !card.matched;
}

export function flipUp(cards: Card[], index: number): Card[] {
  return cards.map((card, i) => (i === index ? { ...card, revealed: true } : card));
}

export function flipDown(cards: Card[], a: number, b: number): Card[] {
  return cards.map((card, i) =>
    i === a || i === b ? { ...card, revealed: false } : card,
  );
}

/** A matched card is always face up. Setting it here means the invariant holds
 *  whatever order the caller turned and paired the cards in. */
export function markMatched(cards: Card[], a: number, b: number): Card[] {
  return cards.map((card, i) =>
    i === a || i === b ? { ...card, matched: true, revealed: true } : card,
  );
}

/** A pair is two different cards showing the same face. The same index twice is
 *  not a pair, so this stays correct if it is ever called with one card. */
export function isPair(cards: Card[], a: number, b: number): boolean {
  if (a === b) return false;
  const first = cards[a];
  const second = cards[b];
  return Boolean(first && second && first.face === second.face);
}

export function matchedPairs(cards: Card[]): number {
  return cards.filter((card) => card.matched).length / 2;
}

export function isComplete(cards: Card[]): boolean {
  return cards.length > 0 && cards.every((card) => card.matched);
}

/**
 * Whole seconds left on the memorise countdown, never below zero.
 *
 * Takes an absolute deadline rather than counting down in state, so a
 * backgrounded tab cannot skip the peek by throttling its timers.
 */
export function peekSecondsLeft(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

export type PendingPair = { a: number; b: number };

export type PickOutcome = {
  cards: Card[];
  first: number | null;
  pending: PendingPair | null;
  /** A committed pair attempt. Committing a stale mismatch is not one. */
  countsAsMove: boolean;
  complete: boolean;
};

/**
 * What one click does. Pure, so the feel of the game can be reasoned about
 * without a component.
 *
 * The case that matters: clicking a third card while a mismatch is still on
 * screen commits that pair immediately and takes the new card as the first of
 * the next attempt. Ignoring the click, as an earlier version did, made fast
 * tapping feel broken — the game looked like it had frozen.
 *
 * Returns null when the click should do nothing at all.
 */
export function pickCard(
  cards: Card[],
  first: number | null,
  pending: PendingPair | null,
  index: number,
): PickOutcome | null {
  if (!canFlip(cards, index)) return null;

  if (pending) {
    return {
      cards: flipUp(flipDown(cards, pending.a, pending.b), index),
      first: index,
      pending: null,
      countsAsMove: false,
      complete: false,
    };
  }

  if (first === null) {
    return {
      cards: flipUp(cards, index),
      first: index,
      pending: null,
      countsAsMove: false,
      complete: false,
    };
  }

  if (isPair(cards, first, index)) {
    const next = markMatched(cards, first, index);
    return {
      cards: next,
      first: null,
      pending: null,
      countsAsMove: true,
      complete: isComplete(next),
    };
  }

  // Both cards are flipped up explicitly rather than trusting the caller to
  // have done it when it set `first`, so the outcome does not depend on the
  // state it was handed.
  return {
    cards: flipUp(flipUp(cards, first), index),
    first: null,
    pending: { a: first, b: index },
    countsAsMove: true,
    complete: false,
  };
}
