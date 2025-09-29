/**
 * WordPress REST API Client
 * Centralized client with retry logic, abort support, and error handling
 */

export const WP_API_BASE = import.meta.env.VITE_WORDPRESS_API_URL as string;

export interface WPFetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class WPFetchError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: string
  ) {
    super(message);
    this.name = 'WPFetchError';
  }
}

/**
 * Fetch data from WordPress REST API with retry logic and abort support
 * @template T - Expected response type
 * @param path - API path (e.g., '/categories' or '/posts')
 * @param options - Fetch options with retry configuration
 * @param signal - AbortSignal for request cancellation
 * @returns Promise resolving to typed response data
 */
export async function wpFetch<T>(
  path: string,
  options: WPFetchOptions = {},
  signal?: AbortSignal
): Promise<T> {
  const {
    retries = 2,
    retryDelay = 300,
    timeout = 10000,
    ...fetchOptions
  } = options;

  // Create timeout controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

  // Combine signals if external signal is provided
  let finalSignal: AbortSignal;
  if (signal) {
    const combinedController = new AbortController();
    finalSignal = combinedController.signal;

    // Listen for abort from either source
    signal.addEventListener('abort', () => combinedController.abort(), {
      once: true,
    });
    timeoutController.signal.addEventListener(
      'abort',
      () => combinedController.abort(),
      { once: true }
    );
  } else {
    finalSignal = timeoutController.signal;
  }

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      // Ensure path starts with /
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      const url = `${WP_API_BASE}${normalizedPath}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'omit',
        ...fetchOptions,
        signal: finalSignal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(fetchOptions.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new WPFetchError(
          `WordPress API error: ${response.status} ${response.statusText}`,
          response.status,
          body
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        throw new WPFetchError(
          'Received 204 No Content - check WordPress CORS configuration',
          204
        );
      }

      // Parse JSON response
      const data = await response.json();
      return data as T;
    } catch (err: any) {
      lastError = err;

      // Don't retry on abort or certain errors
      if (
        err.name === 'AbortError' ||
        finalSignal.aborted ||
        (err instanceof WPFetchError && err.statusCode === 204)
      ) {
        clearTimeout(timeoutId);
        throw err;
      }

      // Retry logic
      if (attempt < retries) {
        const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt++;
        continue;
      }

      // All retries exhausted
      clearTimeout(timeoutId);
      throw lastError;
    }
  }

  clearTimeout(timeoutId);
  throw lastError || new Error('WordPress fetch failed after all retries');
}

/**
 * Validate WordPress API configuration
 * @returns True if configuration is valid
 */
export function validateWPConfig(): boolean {
  if (!WP_API_BASE) {
    console.error(
      'WordPress API base URL not configured. Set VITE_WORDPRESS_API_URL in environment.'
    );
    return false;
  }

  try {
    new URL(WP_API_BASE);
    return true;
  } catch {
    console.error('Invalid WordPress API base URL:', WP_API_BASE);
    return false;
  }
}

/**
 * Test WordPress API connectivity
 * @returns Promise resolving to true if API is reachable
 */
export async function testWPConnection(): Promise<boolean> {
  if (!validateWPConfig()) {
    return false;
  }

  try {
    // Test with a simple endpoint that doesn't require authentication
    await wpFetch<{ name: string }>('/?_fields=name', {
      retries: 1,
      timeout: 5000,
    });
    return true;
  } catch (error) {
    console.error('WordPress API connection test failed:', error);
    return false;
  }
}