/**
 * Date formatting for the page content in this folder.
 *
 * `toLocaleDateString` without an explicit time zone renders a different day
 * for a visitor west of UTC than it does on the server, which shows up as a
 * hydration mismatch on every date on the site. Pinning both the locale and the
 * time zone means the server and the browser always agree.
 */

const LONG_DATE: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
};

/** "2026-09-14" or "2026-09-14T09:40:00Z" becomes "14 September 2026". */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", LONG_DATE).format(new Date(iso));
}
