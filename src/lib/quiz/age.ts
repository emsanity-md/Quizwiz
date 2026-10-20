/**
 * The age gate's rules, shared by the browser and the server.
 *
 * The date of birth is used for the check and then thrown away. It is never
 * stored, never written into a cookie, and never sent anywhere but the route
 * that verifies it. The browser runs the same arithmetic the server does, so
 * the form can answer straight away and the server still decides.
 */

export const MINIMUM_AGE = 18;

/** Nobody alive is older than this, and it keeps the date input sane. */
export const MAX_AGE = 120;

export type AgeResult = {
  ok: boolean;
  /** The age in whole years. Zero when the date could not be read. */
  age: number;
  /** Why it failed, ready to show. */
  error?: string;
};

/**
 * Reads a `YYYY-MM-DD` date and works out how old it is today.
 *
 * The check is on the date, not the time: someone born on the 30th is not
 * eligible on the 30th, only the day after.
 */
export function ageFromDateOfBirth(
  value: string,
  today: Date = new Date(),
): AgeResult {
  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

  if (!match) {
    return { ok: false, age: 0, error: "Enter your date of birth." };
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const born = new Date(Date.UTC(year, month - 1, day));

  // Date.UTC rolls a bad day over into the next month, so 31 February comes
  // back as 3 March. Compare it back to what was asked for.
  if (
    born.getUTCFullYear() !== year ||
    born.getUTCMonth() !== month - 1 ||
    born.getUTCDate() !== day
  ) {
    return { ok: false, age: 0, error: "That date does not exist." };
  }

  const now = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  if (born.getTime() > now.getTime()) {
    return { ok: false, age: 0, error: "That date is in the future." };
  }

  let age = now.getUTCFullYear() - born.getUTCFullYear();
  const birthdayHasPassed =
    now.getUTCMonth() > born.getUTCMonth() ||
    (now.getUTCMonth() === born.getUTCMonth() &&
      now.getUTCDate() >= born.getUTCDate());

  if (!birthdayHasPassed) age -= 1;

  if (age > MAX_AGE) {
    return {
      ok: false,
      age: 0,
      error: `Enter a date of birth from the last ${MAX_AGE} years.`,
    };
  }

  if (age < MINIMUM_AGE) {
    return {
      ok: false,
      age,
      error: `Quizwiz is for adults. You must be ${MINIMUM_AGE} or older to use it.`,
    };
  }

  return { ok: true, age };
}
