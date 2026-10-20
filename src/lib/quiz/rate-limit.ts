import "server-only";

import crypto from "node:crypto";

/**
 * Abuse protection for the routes that cost money.
 *
 * There is no login, so the connection is the only identity there is. Three
 * tiers, each cheap enough to run before the work it protects:
 *
 *   - `rateLimit`   a plain fixed window. Used for the cheap endpoints.
 *   - `creditLimit` a token bucket measured in model calls rather than
 *                   requests, because a 100 question quiz costs five times
 *                   what a 10 question one does and a request count cannot
 *                   tell the difference.
 *   - `acquireSlot` a count of work in flight, so one connection cannot have
 *                   twenty quizzes written at the same time.
 *
 * In-memory on purpose and honest about its limits: it resets when the
 * process restarts and is per-instance, so on a serverless fleet it is a
 * speed bump, not a wall. Swap this file for Redis or Upstash if the
 * endpoint ever gets hammered.
 */

/** A fixed window that resets when the clock runs out. */
type Window = { count: number; resetAt: number };

/** A bucket of credits that refills over the window. */
type Credit = { tokens: number; updatedAt: number; windowMs: number };

const windows = new Map<string, Window>();
const credits = new Map<string, Credit>();
const slots = new Map<string, number>();

/** Keeps the maps from growing without bound on a long-lived process. */
const SWEEP_AT = 5_000;

function sweep(now: number) {
  if (windows.size + credits.size + slots.size < SWEEP_AT) return;

  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }

  for (const [key, credit] of credits) {
    // An idle bucket is refilled to the brim anyway, so dropping it changes
    // nothing that the refill would not have done.
    if (now - credit.updatedAt > credit.windowMs) credits.delete(key);
  }

  for (const [key, count] of slots) {
    if (count <= 0) slots.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const bucket = windows.get(key);

  if (!bucket || bucket.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  if (bucket.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  return {
    ok: true,
    remaining: limit - bucket.count,
    retryAfterSeconds: 0,
  };
}

/**
 * A budget measured in model calls.
 *
 * The bucket holds `capacity` credits and refills at that rate over the
 * window. A request costs what it is worth: a 100 question quiz spends
 * eleven credits, a 10 question one spends two. Asking for more than the
 * bucket holds is refused outright rather than being allowed to go negative.
 */
export function creditLimit(
  key: string,
  cost: number,
  capacity: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  if (cost > capacity) {
    return { ok: false, remaining: 0, retryAfterSeconds: windowMs / 1000 };
  }

  const perMs = capacity / windowMs;
  const bucket = credits.get(key);

  if (!bucket) {
    credits.set(key, { tokens: capacity - cost, updatedAt: now, windowMs });
    return {
      ok: true,
      remaining: Math.floor(capacity - cost),
      retryAfterSeconds: 0,
    };
  }

  // Refill first, then charge: a request that arrives just as a credit comes
  // back is allowed, rather than being told to wait for the next window.
  const elapsed = Math.max(0, now - bucket.updatedAt);
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * perMs);
  bucket.updatedAt = now;

  if (bucket.tokens < cost) {
    const shortfall = cost - bucket.tokens;
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(shortfall / perMs / 1000)),
    };
  }

  bucket.tokens -= cost;

  return {
    ok: true,
    remaining: Math.floor(bucket.tokens),
    retryAfterSeconds: 0,
  };
}

/**
 * Takes one of the `max` places in the queue. The caller must give it back
 * with `releaseSlot` when the work is done, however it ends.
 */
export function acquireSlot(key: string, max: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const current = slots.get(key) ?? 0;

  if (current >= max) {
    // The work in flight has its own length, so this is a hint rather than a
    // promise: the slot comes back when the quiz it belongs to finishes.
    return { ok: false, remaining: 0, retryAfterSeconds: 30 };
  }

  slots.set(key, current + 1);
  return { ok: true, remaining: max - current - 1, retryAfterSeconds: 0 };
}

/** Gives a slot back. Safe to call more than once. */
export function releaseSlot(key: string): void {
  const current = slots.get(key);
  if (current === undefined) return;

  if (current <= 1) slots.delete(key);
  else slots.set(key, current - 1);
}

/**
 * The rightmost entry of x-forwarded-for.
 *
 * The leftmost value is whatever the client sent, unless the edge rewrote
 * the whole header, so it is the one thing here an attacker controls for
 * free. The rightmost entry was appended by the closest proxy and is the
 * safer default.
 */
function rightmostForwardedFor(value: string | null): string | null {
  if (!value) return null;

  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts[parts.length - 1] : null;
}

/**
 * Best-effort client identity from proxy headers.
 *
 * A deployment that knows which header its edge sets can say so with
 * TRUSTED_IP_HEADER. Otherwise the well known ones are tried in order of how
 * much they can be trusted, and the raw address is hashed so the process is
 * not holding a list of visitors.
 *
 * There is no way to tell a forged x-forwarded-for from a real one without
 * knowing what sits in front of the app. The header the edge sets is the
 * answer to that; if none is configured, the fallback errs towards one
 * bucket for everyone, which over-limits rather than under-limits.
 */
export function clientKey(request: Request): string {
  const configured = process.env.TRUSTED_IP_HEADER?.trim().toLowerCase();

  const raw =
    (configured ? request.headers.get(configured) : null) ||
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    rightmostForwardedFor(request.headers.get("x-forwarded-for")) ||
    "unknown";

  return crypto
    .createHash("sha256")
    .update(raw)
    .digest("base64url")
    .slice(0, 22);
}
