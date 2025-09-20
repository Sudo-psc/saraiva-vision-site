const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_REQUESTS = 5;

/**
 * Create a per-IP rate limiter that tracks request counts in in-memory buckets.
 *
 * The returned limiter exposes `check(ipAddress)` to test and record a request for a given IP,
 * and `reset()` to clear all stored buckets.
 *
 * @param {Object} [options] - Configuration overrides.
 * @param {number} [options.windowMs] - Rolling window duration in milliseconds (defaults to DEFAULT_WINDOW_MS).
 * @param {number} [options.max] - Maximum requests allowed per IP within the window (defaults to DEFAULT_MAX_REQUESTS).
 * @return {{check: function(string?): {allowed: boolean, retryAfter?: number}, reset: function(): void}} An object with:
 *  - check(ipAddress): records a request for `ipAddress` and returns `{ allowed: true }` if under the limit,
 *    or `{ allowed: false, retryAfter }` when the limit is exceeded (`retryAfter` is seconds until the window resets).
 *    If `ipAddress` is falsy, `check` returns `{ allowed: true }`.
 *  - reset(): clears all stored per-IP buckets.
 */
export function createRateLimiter(options = {}) {
  const windowMs = Number(options.windowMs ?? DEFAULT_WINDOW_MS);
  const max = Number(options.max ?? DEFAULT_MAX_REQUESTS);
  const buckets = new Map();

  function check(ipAddress) {
    if (!ipAddress) {
      return { allowed: true };
    }

    const now = Date.now();
    const bucket = buckets.get(ipAddress) ?? { count: 0, start: now };

    if (now - bucket.start > windowMs) {
      bucket.count = 0;
      bucket.start = now;
    }

    bucket.count += 1;
    buckets.set(ipAddress, bucket);

    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.start + windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }

    return { allowed: true };
  }

  function reset() {
    buckets.clear();
  }

  return { check, reset };
}

/**
 * Return a singleton rate limiter for contact requests, creating it on first access.
 *
 * On first call this initializes and caches a limiter on `globalThis.__contactRateLimiter`
 * using `createRateLimiter(...)`. Initialization reads configuration from the
 * environment variables `CONTACT_RATE_LIMIT_WINDOW_MS` and `CONTACT_RATE_LIMIT_MAX`.
 *
 * @return {{check: function(string|undefined): {allowed: boolean, retryAfter?: number}, reset: function(): void}}
 *         An object with `check(ipAddress)` — which returns `{ allowed, retryAfter }` — and `reset()` to clear buckets.
 */
export function getRateLimiter() {
  if (!globalThis.__contactRateLimiter) {
    globalThis.__contactRateLimiter = createRateLimiter({
      windowMs: process.env.CONTACT_RATE_LIMIT_WINDOW_MS,
      max: process.env.CONTACT_RATE_LIMIT_MAX
    });
  }

  return globalThis.__contactRateLimiter;
}
