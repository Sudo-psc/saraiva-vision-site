'use client';

import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';
import type { BlogListResponse } from '@/types/api';
import { staticConfig } from '@/lib/swr/config';

interface UseBlogPostsOptions {
  page?: number;
  pageSize?: number;
  category?: string;
  featured?: boolean;
  search?: string;
  config?: SWRConfiguration;
}

export function useBlogPosts({
  page = 1,
  pageSize = 10,
  category,
  featured,
  search,
  config,
}: UseBlogPostsOptions = {}) {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (category) params.set('category', category);
  if (featured !== undefined) params.set('featured', featured.toString());
  if (search) params.set('search', search);

  const url = `/api/blog?${params.toString()}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<BlogListResponse>(
    url,
    {
      ...staticConfig,
      ...config,
    }
  );

  return {
    posts: data?.data?.posts ?? [],
    total: data?.data?.total ?? 0,
    page: data?.data?.page ?? 1,
    pageSize: data?.data?.pageSize ?? pageSize,
    totalPages: data?.data?.totalPages ?? 0,
    categories: data?.data?.categories ?? [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
}
