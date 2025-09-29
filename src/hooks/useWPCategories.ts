/**
 * WordPress Categories Hook
 * Fetches and manages WordPress category data with automatic cleanup
 */

import { useEffect, useState, useCallback } from 'react';
import { wpFetch, WPFetchError } from '@/lib/wpClient';

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
  parent?: number;
  link?: string;
}

export interface UseWPCategoriesOptions {
  perPage?: number;
  orderBy?: 'name' | 'count' | 'id';
  order?: 'asc' | 'desc';
  hideEmpty?: boolean;
  autoFetch?: boolean;
}

export interface UseWPCategoriesReturn {
  data: WPCategory[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch WordPress categories with automatic abort on unmount
 * @param options - Fetch configuration options
 * @returns Categories data, loading state, error state, and refetch function
 */
export function useWPCategories(
  options: UseWPCategoriesOptions = {}
): UseWPCategoriesReturn {
  const {
    perPage = 50,
    orderBy = 'name',
    order = 'asc',
    hideEmpty = true,
    autoFetch = true,
  } = options;

  const [data, setData] = useState<WPCategory[] | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setFetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!autoFetch && fetchTrigger === 0) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    let mounted = true;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams({
          per_page: perPage.toString(),
          orderby: orderBy,
          order,
          hide_empty: hideEmpty.toString(),
          _fields: 'id,name,slug,count,description,parent,link',
        });

        const categories = await wpFetch<WPCategory[]>(
          `/categories?${params.toString()}`,
          {
            retries: 2,
            retryDelay: 500,
            timeout: 10000,
          },
          signal
        );

        if (mounted && !signal.aborted) {
          setData(categories);
        }
      } catch (err: any) {
        if (mounted && !signal.aborted) {
          // Handle specific error types
          if (err instanceof WPFetchError) {
            if (err.statusCode === 204) {
              setError(
                'WordPress returned 204 No Content. Check CORS configuration on the server.'
              );
            } else if (err.statusCode === 404) {
              setError(
                'WordPress REST API not found. Verify VITE_WORDPRESS_API_URL is correct.'
              );
            } else {
              setError(
                err.message || 'Failed to fetch categories from WordPress'
              );
            }
          } else if (err.name === 'AbortError') {
            // Request was aborted, don't set error
            console.log('WordPress categories fetch aborted');
          } else {
            setError(
              err?.message ||
                'Unknown error occurred while fetching categories'
            );
          }

          // Log detailed error for debugging
          console.error('WordPress categories fetch error:', {
            error: err,
            statusCode: err instanceof WPFetchError ? err.statusCode : undefined,
            responseBody:
              err instanceof WPFetchError ? err.responseBody : undefined,
          });
        }
      } finally {
        if (mounted && !signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [autoFetch, fetchTrigger, perPage, orderBy, order, hideEmpty]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to fetch a single WordPress category by ID
 * @param categoryId - Category ID to fetch
 * @returns Category data, loading state, and error state
 */
export function useWPCategory(categoryId: number | null) {
  const [data, setData] = useState<WPCategory | null>(null);
  const [loading, setLoading] = useState(!!categoryId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    let mounted = true;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);

        const category = await wpFetch<WPCategory>(
          `/categories/${categoryId}?_fields=id,name,slug,count,description,parent,link`,
          {
            retries: 2,
            retryDelay: 500,
            timeout: 10000,
          },
          signal
        );

        if (mounted && !signal.aborted) {
          setData(category);
        }
      } catch (err: any) {
        if (mounted && !signal.aborted) {
          if (err instanceof WPFetchError) {
            setError(
              err.message || 'Failed to fetch category from WordPress'
            );
          } else if (err.name !== 'AbortError') {
            setError(
              err?.message || 'Unknown error occurred while fetching category'
            );
          }

          console.error('WordPress category fetch error:', err);
        }
      } finally {
        if (mounted && !signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCategory();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [categoryId]);

  return {
    data,
    loading,
    error,
  };
}