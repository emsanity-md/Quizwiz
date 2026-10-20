import { flushSync } from "react-dom";

/**
 * The circular reveal when the theme changes.
 *
 * The browser's view transition API takes a snapshot of the page, runs the
 * change, and then animates between the two. The new colours are clipped to a
 * circle that grows out from the toggle, so the switch reads as the page
 * turning over from where you pressed rather than as a colour swap.
 *
 * Every part of it is decoration. Where the browser has no view transitions,
 * or the visitor has asked for less motion, the theme simply changes.
 */

/**
 * Changes the theme, opening the new colours in a circle from `origin`.
 *
 * `origin` is the button the press came from. Its centre is where the circle
 * starts and its distance to the farthest corner is how far the circle has to
 * grow to cover the page.
 */
export function transitionTheme(
  apply: () => void,
  origin: DOMRect | null,
): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    apply();
    return;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supported = typeof document.startViewTransition === "function";

  if (!supported || reduced || !origin) {
    apply();
    return;
  }

  const cx = origin.left + origin.width / 2;
  const cy = origin.top + origin.height / 2;
  // The circle has to reach the farthest corner, or the edge of the page
  // stays in the old theme.
  const radius = Math.hypot(
    Math.max(cx, window.innerWidth - cx),
    Math.max(cy, window.innerHeight - cy),
  );

  const root = document.documentElement;
  root.style.setProperty("--theme-cx", `${cx}px`);
  root.style.setProperty("--theme-cy", `${cy}px`);
  root.style.setProperty("--theme-r", `${radius}px`);
  // Only while the reveal runs, so any other view transition on the page
  // keeps its own animation.
  root.dataset.themeAnim = "1";

  const transition = document.startViewTransition(() => {
    // The theme lands on the element in an effect, which would come after
    // the browser took its snapshot. Flushing it here means the colours the
    // transition animates are the ones that were asked for.
    flushSync(apply);
  });

  void transition.finished
    .catch(() => {})
    .finally(() => {
      delete root.dataset.themeAnim;
    });
}
