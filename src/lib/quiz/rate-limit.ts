import "server-only";

/**
 * A per-IP request cap, held in memory. There is no login, so this is the only
 * thing standing between a stranger and your NVIDIA quota.
 *
 * In-memory on purpose and honest about its limits: it resets when the process
 * restarts and is per-instance, so on a serverless fleet it is a speed bump,
 * not a wall. Swap this file for Redis or Upstash if the endpoint ever gets
 * hammered.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
/** Keeps the map from growing without bound on a long-lived process. */
const SWEEP_AT = 5_000;

function sweep(now: number) {
  if (buckets.size < SWEEP_AT) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
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

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
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

/** Best-effort client identity from proxy headers. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return ip;
}
