import React, { useState, useEffect, lazy, Suspense } from 'react';
import { trackError } from './errorTracker.js';

/**
 * Higher-order component for lazy loading with enhanced error handling and retry logic
 * Prevents chunk loading failures from breaking the application
 */
const createLazyComponent = (importFn, retries = 3, retryDelay = 1000) => {
  const LazyComponent = lazy(importFn);

  return function LazyComponentWithErrorHandling(props) {
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      if (error && retryCount < retries) {
        // Enhanced retry logic with exponential backoff
        const backoffDelay = retryDelay * Math.pow(2, retryCount);
        const maxDelay = 5000; // Cap at 5 seconds
        const actualDelay = Math.min(backoffDelay, maxDelay);

        console.log(`Retrying chunk load (${retryCount + 1}/${retries}) in ${actualDelay}ms...`);

        const timer = setTimeout(() => {
          setIsLoading(true);
          setRetryCount(prev => prev + 1);
          setError(null);

          // Reset loading state after a brief delay
          setTimeout(() => setIsLoading(false), 100);
        }, actualDelay);

        return () => clearTimeout(timer);
      }
    }, [error, retryCount, retries, retryDelay]);

    const handleError = (err) => {
      console.error('Lazy loading error:', err);

      // Track error with centralized system
      trackError(err, {
        component: 'LazyComponentWrapper',
        retryCount,
        importFn: importFn.name || 'dynamic-import',
        isLoading,
        timestamp: new Date().toISOString()
      }, 'lazy-loading');

      setError(err);
    };

    if (error && retryCount >= retries) {
      // Enhanced error UI with more context
      const isNetworkError = error.message?.includes('Network') ||
                            error.message?.includes('Failed to fetch') ||
                            error.message?.includes('Loading chunk');

      return (
        <div className="w-full py-20 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0S3.34 2.667 2.57 4l-6.732 13C-4.85 18.667-3.888 20-2.348 20z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isNetworkError ? 'Erro de Conexão' : 'Erro ao Carregar Página'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isNetworkError
              ? 'Verifique sua conexão com a internet e tente novamente.'
              : 'Não foi possível carregar o conteúdo solicitado.'}
          </p>
          <div className="space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recarregar Página
            </button>
            <button
              onClick={() => {
                setRetryCount(0);
                setError(null);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      );
    }

    return (
      <Suspense
        fallback={
          <div className="w-full py-20 text-center">
            <div className="text-sm text-slate-700 mb-2">
              {error ? `Tentando recarregar... (${retryCount + 1}/${retries})` : 'Carregando página...'}
            </div>
            <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"></div>
            {retryCount > 0 && (
              <div className="text-xs text-gray-500 mt-2">
                Tentativa {retryCount} de {retries}
              </div>
            )}
          </div>
        }
      >
        <ErrorBoundary onError={handleError}>
          <LazyComponent {...props} />
        </ErrorBoundary>
      </Suspense>
    );
  };
};

/**
 * Enhanced error boundary component for lazy loading with better error tracking
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Lazy loading error boundary caught:', error, info);

    // Track error with centralized system
    trackError(error, {
      component: 'LazyLoadingErrorBoundary',
      componentStack: info?.componentStack,
      fallbackUsed: !!this.props.fallback,
      timestamp: new Date().toISOString()
    }, 'lazy-loading-error-boundary');

    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      // Enhanced error categorization for better fallback UI
      const errorMessage = this.state.error?.message || '';
      const isChunkError = errorMessage.includes('Loading chunk') ||
                         errorMessage.includes('ChunkLoadError') ||
                         errorMessage.includes('Failed to fetch dynamically imported module');

      const isNetworkError = errorMessage.includes('Network') ||
                            errorMessage.includes('Failed to fetch') ||
                            errorMessage.includes('ECONNREFUSED');

      // Return enhanced fallback UI with better context
      return this.props.fallback || (
        <div className="w-full py-4 text-center">
          <div className={`${isChunkError ? 'text-orange-600' : 'text-yellow-600'} mb-2`}>
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0S3.34 2.667 2.57 4l-6.732 13C-4.85 18.667-3.888 20-2.348 20z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            {isChunkError ? 'Módulo temporariamente indisponível' :
             isNetworkError ? 'Erro de conexão' :
             'Componente temporariamente indisponível'}
          </p>
          {import.meta.env.DEV && (
            <details className="mt-2 text-left">
              <summary className="cursor-pointer text-xs text-gray-500">Detalhes técnicos</summary>
              <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto max-h-20">
                {errorMessage.substring(0, 200)}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default createLazyComponent;