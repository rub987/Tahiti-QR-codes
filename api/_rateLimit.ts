/**
 * Minimal in-memory rate limiter, keyed by client IP.
 *
 * NOTE: state lives in the function instance's memory, so it is per-instance, not
 * global — Fluid Compute reuses instances, but a hard, distributed guarantee needs
 * a durable store (e.g. Upstash Redis via the Vercel Marketplace). This is enough
 * to blunt casual abuse and protect the paid Imagen quota.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5; // per window per IP

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // seconds until the window resets
};

export function rateLimit(
  ip: string,
  max = MAX_REQUESTS,
  windowMs = WINDOW_MS,
): RateLimitResult {
  const now = Date.now();

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (buckets.size > 10_000) {
    for (const [key, b] of buckets) {
      if (now > b.resetAt) buckets.delete(key);
    }
  }

  const bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }

  if (bucket.count >= max) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count++;
  return { allowed: true, remaining: max - bucket.count, retryAfter: 0 };
}

/** Extract the client IP from a request's headers (proxy-aware). */
export function getClientIp(
  headers: Record<string, string | string[] | undefined>,
): string {
  const xff = headers['x-forwarded-for'];
  const raw = Array.isArray(xff) ? xff[0] : xff;
  return raw?.split(',')[0].trim() || 'unknown';
}
