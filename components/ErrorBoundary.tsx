'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { redirectToBackup } from '@/utils/redirectToBackup';
import { trackComponentError } from '@/utils/errorTracker';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorDetails {
  message: string;
  stack: string;
  componentStack: string;
  timestamp: string;
  url: string;
  userAgent: string;
  isMinified: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorMessage = error?.message || 'Unknown error';
    const errorStack = error?.stack || 'No stack trace available';

    trackComponentError(
      this.constructor.name || 'ErrorBoundary',
      error,
      errorInfo?.componentStack
    );

    console.error('🚨 ErrorBoundary caught error:', {
      error: errorMessage,
      stack: errorStack,
      componentStack: errorInfo?.componentStack || 'No component stack available',
      timestamp: new Date().toISOString(),
      isMinifiedError: errorMessage.includes('Minified React error'),
      errorCode: errorMessage.match(/#(\d+)/)?.[1] || 'unknown'
    });

    if (errorMessage.includes('Minified React error #306')) {
      console.error('🔍 React #306 Debug: Element type is invalid. Check for:', {
        commonCauses: [
          'Undefined component import/export',
          'Mixed default/named imports',
          'Component not properly exported',
          'Typo in component name'
        ],
        stackTrace: errorStack
      });
    }

    try {
      const errorDetails: ErrorDetails = {
        message: errorMessage,
        stack: errorStack,
        componentStack: errorInfo?.componentStack || 'No component stack available',
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        isMinified: errorMessage.includes('Minified React error')
      };
      
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('lastError', JSON.stringify(errorDetails));
      }
    } catch (e) {
      console.warn('Failed to save error details:', e);
    }

    const isChunkLoadError = errorMessage.includes('ChunkLoadError') ||
                            errorMessage.includes('Failed to fetch dynamically imported module') ||
                            errorMessage.includes('Loading chunk') ||
                            errorMessage.includes('Loading CSS chunk');

    const isNetworkError = errorMessage.includes('Network Error') ||
                          errorMessage.includes('Failed to fetch') ||
                          errorMessage.includes('NetworkError') ||
                          errorMessage.includes('ECONNREFUSED') ||
                          errorMessage.includes('ENOTFOUND');

    const isAuthError = errorMessage.includes('401') ||
                       errorMessage.includes('403') ||
                       errorMessage.includes('Unauthorized') ||
                       errorMessage.includes('Forbidden');

    const isNullError = errorMessage.includes('Cannot read properties of null') ||
                      errorMessage.includes('Cannot read properties of undefined');

    const isCriticalError = errorMessage.includes('Minified React error') ||
                          isChunkLoadError ||
                          isNetworkError ||
                          (isNullError && !errorMessage.includes('displayName')) ||
                          isAuthError;

    if (isCriticalError) {
      console.warn('Critical error detected, redirecting to backup...', {
        errorType: isChunkLoadError ? 'Chunk Load' :
                  isNetworkError ? 'Network' :
                  isAuthError ? 'Authentication' : 'React Critical'
      });

      setTimeout(() => {
        try {
          redirectToBackup();
        } catch (e) {
          console.error('Backup redirect failed:', e);
        }
      }, isChunkLoadError ? 1000 : 2000);
    } else {
      console.warn('Non-critical error caught, showing error UI instead of redirecting', {
        errorType: isNullError ? 'Null Reference' : 'Generic'
      });
    }

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div role="alert" className="p-4 text-sm text-red-700 bg-red-50 rounded-md">
          <div className="font-medium mb-2">Ocorreu um erro inesperado</div>
          <div className="text-xs mb-2">Verifique o console do navegador para mais detalhes</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
          >
            Recarregar Página
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs">Detalhes do Erro (DEV)</summary>
              <pre className="text-xs mt-1 overflow-auto max-h-32 bg-gray-100 p-2">
                {(() => {
                  try {
                    const errorData = typeof sessionStorage !== 'undefined' 
                      ? sessionStorage.getItem('lastError')
                      : null;
                    return errorData ? JSON.stringify(JSON.parse(errorData), null, 2) : 'Nenhum erro registrado';
                  } catch (e) {
                    return 'Erro ao carregar detalhes: ' + (e as Error).message;
                  }
                })()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
