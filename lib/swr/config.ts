import type { SWRConfiguration } from 'swr';
import { defaultFetcher } from './fetcher';

export const swrConfig: SWRConfiguration = {
  fetcher: defaultFetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: true,
  focusThrottleInterval: 5000,
  loadingTimeout: 3000,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    if (error.status === 404) return;
    if (error.status === 403) return;
    if (retryCount >= 3) return;

    setTimeout(() => revalidate({ retryCount }), 5000);
  },
};

export const fastRevalidateConfig: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 30000,
  revalidateOnFocus: true,
  dedupingInterval: 1000,
};

export const slowRevalidateConfig: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 300000,
  revalidateOnFocus: false,
  dedupingInterval: 10000,
};

export const staticConfig: SWRConfiguration = {
  ...swrConfig,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
};

export const realtimeConfig: SWRConfiguration = {
  ...swrConfig,
  refreshInterval: 5000,
  revalidateOnFocus: true,
  dedupingInterval: 500,
};
