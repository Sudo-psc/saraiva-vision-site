const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_REQUESTS = 5;

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

export function getRateLimiter() {
  if (!globalThis.__contactRateLimiter) {
    globalThis.__contactRateLimiter = createRateLimiter({
      windowMs: process.env.CONTACT_RATE_LIMIT_WINDOW_MS,
      max: process.env.CONTACT_RATE_LIMIT_MAX
    });
  }

  return globalThis.__contactRateLimiter;
}
