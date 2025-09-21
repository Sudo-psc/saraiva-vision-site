const DEFAULT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_REQUESTS = 5;

/**
 * Creates a new in-memory rate limiter instance.
 * This uses a sliding window algorithm based on the client's IP address.
 *
 * @param {object} [options={}] The rate limiter configuration.
 * @param {number} [options.windowMs=300000] The time window in milliseconds.
 * @param {number} [options.max=5] The maximum number of requests allowed per window.
 * @returns {{check: function(string): {allowed: boolean, retryAfter?: number}, reset: function(): void}} An object with `check` and `reset` methods.
 */
export function createRateLimiter(options = {}) {
  const windowMs = Number(options.windowMs ?? DEFAULT_WINDOW_MS);
  const max = Number(options.max ?? DEFAULT_MAX_REQUESTS);
  const buckets = new Map();

  /**
   * Checks if a request from a given IP address is allowed.
   *
   * @param {string} ipAddress The client's IP address.
   * @returns {{allowed: boolean, retryAfter?: number}} An object indicating if the request is allowed.
   * If not allowed, `retryAfter` suggests when to try again (in seconds).
   */
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

  /**
   * Resets the rate limiter, clearing all tracked IP addresses.
   */
  function reset() {
    buckets.clear();
  }

  return { check, reset };
}

/**
 * Gets a singleton instance of the rate limiter.
 * This ensures that the same rate limiter is used across all requests in the same serverless environment.
 *
 * @returns {ReturnType<typeof createRateLimiter>} The singleton rate limiter instance.
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
