/**
 * Retry with Exponential Backoff Utility
 *
 * Implements exponential backoff retry strategy: 1s → 2s → 4s
 * Maximum 3 retry attempts (configurable)
 *
 * As per research.md:
 * - Base delay: 1000ms
 * - Exponential multiplier: 2^attempt
 * - Default max retries: 3
 * - Total attempts: 1 initial + 3 retries = 4 attempts
 */

/**
 * Executes a function with exponential backoff retry
 *
 * @param {Function} fn - Async function to execute
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @returns {Promise<any>} Result from successful execution
 * @throws {Error} Last error if all retries exhausted
 *
 * @example
 * const result = await retryWithBackoff(
 *   () => fetch('/api/endpoint'),
 *   3
 * );
 */
export async function retryWithBackoff(fn, maxRetries = 3) {
  let lastError;

  // Handle negative retry attempts - treat as 0
  const sanitizedMaxRetries = Math.max(0, maxRetries);

  // Total attempts = 1 initial + maxRetries
  const totalAttempts = sanitizedMaxRetries + 1;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    try {
      // Execute function
      return await fn();
    } catch (error) {
      lastError = error;

      // If this was the last attempt, throw error
      if (attempt === sanitizedMaxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay
      // Attempt 0 (1st retry): 2^0 * 1000 = 1000ms (1s)
      // Attempt 1 (2nd retry): 2^1 * 1000 = 2000ms (2s)
      // Attempt 2 (3rd retry): 2^2 * 1000 = 4000ms (4s)
      const baseDelay = 1000; // 1 second
      const delay = Math.pow(2, attempt) * baseDelay;

      // Wait before next retry
      await sleep(delay);
    }
  }

  // This should never be reached, but just in case
  throw lastError;
}

/**
 * Sleep utility function
 *
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with custom backoff configuration
 *
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @returns {Promise<any>} Result from successful execution
 *
 * @example
 * const result = await retryWithBackoffCustom(
 *   () => apiCall(),
 *   { maxRetries: 5, baseDelay: 2000 }
 * );
 */
export async function retryWithBackoffCustom(
  fn,
  { maxRetries = 3, baseDelay = 1000 } = {}
) {
  let lastError;

  const totalAttempts = maxRetries + 1;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * baseDelay;
      await sleep(delay);
    }
  }

  throw lastError;
}
