'use client';

import useSWR from 'swr';
import type { SWRConfiguration } from 'swr';
import { staticConfig } from '@/lib/swr/config';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  stripeProductId: string;
  popular?: boolean;
}

interface SubscriptionPlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
  timestamp?: string;
}

interface UseSubscriptionPlansOptions {
  config?: SWRConfiguration;
}

export function useSubscriptionPlans({ config }: UseSubscriptionPlansOptions = {}) {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<SubscriptionPlansResponse>('/api/subscription/plans', {
      ...staticConfig,
      ...config,
    });

  return {
    plans: data?.data ?? [],
    isLoading,
    isError: !!error,
    error,
    isValidating,
    mutate,
  };
}
