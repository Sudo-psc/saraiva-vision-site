import React, { Suspense, ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { SafeHelmet } from './SafeHelmet';

interface SafeSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
}

/**
 * Suspense wrapper that prevents Helmet errors during loading
 * Combines ErrorBoundary + Suspense for safe lazy loading
 *
 * @author Dr. Philipe Saraiva Cruz
 */
export const SafeSuspense: React.FC<SafeSuspenseProps> = ({
  children,
  fallback,
  title = 'Carregando...'
}) => {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SafeHelmet title={title} />
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600">{title}</p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
