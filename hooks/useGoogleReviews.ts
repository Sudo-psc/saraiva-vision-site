'use client';

import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';
import type { ReviewsResponse } from '@/types/api';
import { slowRevalidateConfig } from '@/lib/swr/config';

interface UseGoogleReviewsOptions {
  placeId?: string;
  limit?: number;
  language?: string;
  config?: SWRConfiguration;
}

export function useGoogleReviews({
  placeId,
  limit = 5,
  language = 'pt-BR',
  config,
}: UseGoogleReviewsOptions = {}) {
  const params = new URLSearchParams();
  if (placeId) params.set('placeId', placeId);
  if (limit) params.set('limit', limit.toString());
  if (language) params.set('language', language);

  const url = `/api/reviews?${params.toString()}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<ReviewsResponse>(
    url,
    {
      ...slowRevalidateConfig,
      ...config,
    }
  );

  return {
    reviews: data?.data?.reviews ?? [],
    stats: data?.data?.stats,
    metadata: data?.data?.metadata,
    pagination: data?.data?.pagination,
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
}
