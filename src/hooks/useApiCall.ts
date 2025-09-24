/**
 * Enhanced API call hook for Saraiva Vision
 * Handles proper URL construction and error handling for Vercel/VPS hybrid architecture
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getApiBaseUrl, apiUrl, isDevelopment } from '../lib/env';

interface ApiCallOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => Promise<void>;
  abort: () => void;
}

export function useApiCall<T = any>(
  endpoint: string,
  options: ApiCallOptions = {}
): ApiResponse<T> & { execute: (overrideOptions?: Partial<ApiCallOptions>) => Promise<T | null> } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastCallRef = useRef<{ endpoint: string; options: ApiCallOptions } | null>(null);

  // Default options
  const defaultOptions: ApiCallOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
    retries: 2,
    retryDelay: 1000,
    ...options,
  };

  const execute = useCallback(async (overrideOptions: Partial<ApiCallOptions> = {}): Promise<T | null> => {
    const finalOptions = { ...defaultOptions, ...overrideOptions };

    // Store call details for retry
    lastCallRef.current = { endpoint, options: finalOptions };

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    let attemptCount = 0;
    const maxAttempts = (finalOptions.retries || 0) + 1;

    while (attemptCount < maxAttempts) {
      try {
        // Construct proper URL
        const url = endpoint.startsWith('http')
          ? endpoint
          : endpoint.startsWith('/api/')
            ? apiUrl(endpoint) // Use apiUrl for /api/ routes
            : apiUrl(`/${endpoint.replace(/^\//, '')}`); // Ensure proper path

        if (isDevelopment) {
          console.log(`API Call [${finalOptions.method}]:`, url);
        }

        // Setup request
        const fetchOptions: RequestInit = {
          method: finalOptions.method,
          headers: finalOptions.headers,
          signal: abortControllerRef.current.signal,
        };

        // Add body for non-GET requests
        if (finalOptions.body && finalOptions.method !== 'GET') {
          if (finalOptions.headers?.['Content-Type']?.includes('application/json')) {
            fetchOptions.body = JSON.stringify(finalOptions.body);
          } else {
            fetchOptions.body = finalOptions.body;
          }
        }

        // Execute request with timeout
        const fetchPromise = fetch(url, fetchOptions);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), finalOptions.timeout);
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        // Check response status
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        // Parse response
        let result: T;
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          result = await response.json();
        } else {
          result = (await response.text()) as unknown as T;
        }

        setData(result);
        setLoading(false);
        return result;

      } catch (err: any) {
        attemptCount++;

        // Don't retry if aborted
        if (err.name === 'AbortError') {
          setLoading(false);
          return null;
        }

        // If this was the last attempt, set error
        if (attemptCount >= maxAttempts) {
          const finalError = new Error(
            `API call failed after ${maxAttempts} attempts: ${err.message}`
          );
          setError(finalError);
          setLoading(false);

          if (isDevelopment) {
            console.error('API Error:', {
              endpoint: url,
              error: err,
              attempts: attemptCount,
            });
          }

          throw finalError;
        }

        // Wait before retrying
        if (finalOptions.retryDelay && attemptCount < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, finalOptions.retryDelay));
        }
      }
    }

    return null;
  }, [endpoint, JSON.stringify(defaultOptions)]);

  const retry = useCallback(async (): Promise<void> => {
    if (lastCallRef.current) {
      await execute(lastCallRef.current.options);
    }
  }, [execute]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    retry,
    abort,
  };
}

/**
 * Hook for Google Reviews API calls
 */
export function useGoogleReviewsApi() {
  return useApiCall('/api/google-reviews');
}

/**
 * Hook for contact form submissions
 */
export function useContactApi() {
  return useApiCall('/api/contact', {
    method: 'POST',
    timeout: 15000, // Longer timeout for form submissions
  });
}

/**
 * Hook for appointment bookings
 */
export function useAppointmentsApi() {
  return useApiCall('/api/appointments', {
    method: 'POST',
    timeout: 20000, // Longer timeout for complex operations
  });
}