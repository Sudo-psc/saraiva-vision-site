'use client';

import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';
import type { BlogPostResponse } from '@/types/api';
import { staticConfig } from '@/lib/swr/config';

interface UseBlogPostOptions {
  slug: string;
  config?: SWRConfiguration;
}

export function useBlogPost({ slug, config }: UseBlogPostOptions) {
  const url = slug ? `/api/blog/${slug}` : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<BlogPostResponse>(
    url,
    {
      ...staticConfig,
      ...config,
    }
  );

  return {
    post: data?.data,
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
}
