/**
 * Safe Fetch Utilities with Retry Logic and Error Handling
 *
 * @author Dr. Philipe Saraiva Cruz
 * @priority P0 - Critical (data fetching reliability)
 */

/**
 * Exponential backoff with jitter
 */
const calculateBackoff = (attempt, baseDelay = 1000, maxDelay = 10000) => {
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  const jitter = Math.random() * 0.3 * exponentialDelay;
  return exponentialDelay + jitter;
};

/**
 * Check if response has JSON content
 */
const isJsonResponse = (response) => {
  const contentType = response.headers.get('content-type');
  return contentType && contentType.includes('application/json');
};

/**
 * Check if response is empty
 */
const isEmptyResponse = (response) => {
  const contentLength = response.headers.get('content-length');
  return response.status === 204 || contentLength === '0';
};

/**
 * Safe JSON parsing with fallback
 */
const safeJsonParse = async (response) => {
  // Check if response is empty
  if (isEmptyResponse(response)) {
    console.warn('[SafeFetch] Empty response detected (204 or content-length:0)');
    return null;
  }

  // Check content type
  if (!isJsonResponse(response)) {
    console.warn('[SafeFetch] Non-JSON response detected:', response.headers.get('content-type'));
    return null;
  }

  // Get response text first (safer than direct .json())
  const text = await response.text();

  // If empty text, return null
  if (!text || text.trim() === '') {
    console.warn('[SafeFetch] Empty response body');
    return null;
  }

  // Try to parse JSON
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('[SafeFetch] JSON parse error:', {
      error: error.message,
      textPreview: text.substring(0, 100),
      url: response.url,
      status: response.status
    });
    throw new Error(`Failed to parse JSON response: ${error.message}`);
  }
};

/**
 * Safe fetch with retry logic and comprehensive error handling
 *
 * @param {string|Request} input - URL or Request object
 * @param {RequestInit & {retries?: number, retryDelay?: number, timeout?: number}} init - Fetch options
 * @returns {Promise<Response>}
 */
export const safeFetch = async (input, init = {}) => {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    ...fetchOptions
  } = init;

  const url = typeof input === 'string' ? input : input.url;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(input, {
        ...fetchOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // If successful, return response
      if (response.ok) {
        return response;
      }

      // Don't retry client errors (4xx) except 429 (rate limit)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // For server errors (5xx) or rate limit, retry
      if (attempt < retries) {
        const delay = calculateBackoff(attempt, retryDelay);
        console.warn(`[SafeFetch] Retry ${attempt + 1}/${retries} for ${url} after ${Math.round(delay)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      clearTimeout(timeoutId);

      // Don't retry on abort (user cancelled)
      if (error.name === 'AbortError') {
        if (timeoutId) {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
      }

      // Retry on network errors
      if (attempt < retries) {
        const delay = calculateBackoff(attempt, retryDelay);
        console.warn(`[SafeFetch] Network error, retry ${attempt + 1}/${retries} after ${Math.round(delay)}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }
};

/**
 * Safe fetch JSON with automatic parsing and validation
 *
 * @param {string|Request} input - URL or Request object
 * @param {RequestInit & {retries?: number, retryDelay?: number, timeout?: number}} init - Fetch options
 * @returns {Promise<any>} Parsed JSON or null
 */
export const safeFetchJson = async (input, init = {}) => {
  try {
    const response = await safeFetch(input, init);
    return await safeJsonParse(response);
  } catch (error) {
    console.error('[SafeFetch] Failed to fetch JSON:', {
      url: typeof input === 'string' ? input : input.url,
      error: error.message
    });
    throw error;
  }
};

/**
 * Normalize data to always return an array
 * Handles null, undefined, objects, and array-like objects
 *
 * @param {any} data - Data to normalize
 * @param {string} context - Context for logging
 * @returns {Array} Always returns an array
 */
export const normalizeToArray = (data, context = 'unknown') => {
  // Already an array
  if (Array.isArray(data)) {
    return data;
  }

  // Null or undefined
  if (data == null) {
    console.warn(`[DataNormalizer] Null/undefined data in ${context}, returning empty array`);
    return [];
  }

  // Array-like object (has length and numeric keys)
  if (typeof data === 'object' && 'length' in data && typeof data.length === 'number') {
    return Array.from(data);
  }

  // Single object - wrap in array
  if (typeof data === 'object') {
    console.warn(`[DataNormalizer] Object instead of array in ${context}, wrapping in array`);
    return [data];
  }

  // Primitive value
  console.warn(`[DataNormalizer] Primitive value in ${context}, returning empty array`);
  return [];
};

/**
 * Check if user is online
 */
export const isOnline = () => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

/**
 * Detect if ad blocker might be active
 * @param {number} timeout - Detection timeout in ms
 * @returns {Promise<boolean>}
 */
export const detectAdBlocker = async (timeout = 1000) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Try to load a known ad script (will fail if blocked)
    const response = await fetch('https://www.googletagmanager.com/gtag/js?id=test', {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return false; // Ad blocker not detected
  } catch (error) {
    return true; // Likely ad blocker
  }
};

export default {
  safeFetch,
  safeFetchJson,
  normalizeToArray,
  isOnline,
  detectAdBlocker,
  calculateBackoff
};
