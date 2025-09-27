import { useState, useEffect } from 'react';
import { fetchCategories } from '../lib/wordpress-compat';

/**
 * Custom hook for fetching WordPress categories with enhanced error handling and retry logic
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoRetry - Whether to automatically retry failed requests
 * @param {number} options.retryDelay - Delay between retries in milliseconds
 * @param {number} options.maxRetries - Maximum number of retry attempts
 */
export const useWordPressCategories = ({
  autoRetry = true,
  retryDelay = 2000,
  maxRetries = 3
} = {}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadCategories = async (attempt = 1) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Attempting to fetch categories (attempt ${attempt}/${maxRetries + 1})`);

      const categoriesData = await fetchCategories();

      if (categoriesData && categoriesData.length >= 0) {
        setCategories(categoriesData);
        setRetryCount(0); // Reset retry count on success
        console.log(`Successfully loaded ${categoriesData.length} categories`);

        // Track successful category load for analytics
        if (window.posthog) {
          window.posthog.capture('wordpress_categories_loaded', {
            count: categoriesData.length,
            attempt,
            success: true
          });
        }
      } else {
        throw new Error('Invalid categories data received');
      }
    } catch (error) {
      console.error(`Error loading categories (attempt ${attempt}):`, error);

      const shouldRetry = autoRetry && attempt <= maxRetries && !error.message?.includes('CORS');

      if (shouldRetry) {
        setRetryCount(attempt);
        console.log(`Retrying categories fetch in ${retryDelay}ms...`);

        setTimeout(() => {
          loadCategories(attempt + 1);
        }, retryDelay);
      } else {
        setError({
          message: error.message || 'Failed to load categories',
          type: error.type || 'UNKNOWN_ERROR',
          suggestion: error.suggestion || 'Please try refreshing the page',
          originalError: error,
          finalAttempt: true,
          attempts: attempt
        });

        // Track category load failure for analytics
        if (window.posthog) {
          window.posthog.capture('wordpress_categories_failed', {
            error: error.message,
            type: error.type,
            attempts: attempt,
            finalFailure: true
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []); // Empty dependency array - only run once on mount

  const retry = () => {
    setRetryCount(0);
    loadCategories();
  };

  return {
    categories,
    loading,
    error,
    retryCount,
    retry,
    hasCategories: categories.length > 0,
    isEmpty: !loading && categories.length === 0 && !error,
    isRetrying: retryCount > 0 && loading
  };
};

export default useWordPressCategories;