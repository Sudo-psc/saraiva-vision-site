'use client';

import { SWRConfig } from 'swr';
import { swrConfig } from './config';
import type { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
  fallback?: Record<string, any>;
}

export function SWRProvider({ children, fallback }: SWRProviderProps) {
  return (
    <SWRConfig value={{ ...swrConfig, fallback }}>
      {children}
    </SWRConfig>
  );
}
