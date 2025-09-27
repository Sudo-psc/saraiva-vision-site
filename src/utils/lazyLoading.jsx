import React, { useState, useEffect, lazy, Suspense } from 'react';

/**
 * Higher-order component for lazy loading with error handling and retry logic
 * Prevents chunk loading failures from breaking the application
 */
const createLazyComponent = (importFn, retries = 3, retryDelay = 1000) => {
  const LazyComponent = lazy(importFn);

  return function LazyComponentWithErrorHandling(props) {
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (error && retryCount < retries) {
        const timer = setTimeout(() => {
          console.log(`Retrying chunk load (${retryCount + 1}/${retries})...`);
          setRetryCount(prev => prev + 1);
          setError(null);
          setIsLoading(true);
        }, retryDelay);

        return () => clearTimeout(timer);
      }
    }, [error, retryCount, retries, retryDelay]);

    const handleError = (err) => {
      console.error('Lazy loading error:', err);
      setError(err);
      setIsLoading(false);
    };

    if (error && retryCount >= retries) {
      return (
        <div className="w-full py-20 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0S3.34 2.667 2.57 4l-6.732 13C-4.85 18.667-3.888 20-2.348 20z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar página</h3>
          <p className="text-gray-600 mb-4">Não foi possível carregar o conteúdo solicitado.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recarregar página
          </button>
        </div>
      );
    }

    return (
      <Suspense
        fallback={
          <div className="w-full py-20 text-center">
            <div className="text-sm text-slate-700 mb-2">
              {error ? 'Tentando recarregar...' : 'Carregando página...'}
            </div>
            <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"></div>
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
 * Simple error boundary component for lazy loading
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error boundary caught:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // Let the parent component handle the error display
    }
    return this.props.children;
  }
}

export default createLazyComponent;