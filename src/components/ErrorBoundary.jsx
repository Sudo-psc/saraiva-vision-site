import React from 'react';
import { redirectToBackup } from '@/utils/redirectToBackup';
import { trackComponentError } from '@/utils/errorTracker';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log detalhado para debug - sempre mostrar em desenvolvimento
    const errorMessage = error?.message || 'Unknown error';
    const errorStack = error?.stack || 'No stack trace available';

    // Track component error with centralized error tracker
    trackComponentError(
      this.constructor.name || 'ErrorBoundary',
      error,
      info?.componentStack
    );

    console.error('🚨 ErrorBoundary caught error:', {
      error: errorMessage,
      stack: errorStack,
      componentStack: info?.componentStack || 'No component stack available',
      timestamp: new Date().toISOString(),
      isMinifiedError: errorMessage.includes('Minified React error'),
      errorCode: errorMessage.match(/#(\d+)/)?.[1] || 'unknown'
    });

    // Para erros React minificados, tentar fornecer mais contexto
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

    // Também salvar no sessionStorage para análise posterior
    try {
      const errorDetails = {
        message: errorMessage,
        stack: errorStack,
        componentStack: info?.componentStack || 'No component stack available',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        isMinified: errorMessage.includes('Minified React error')
      };
      sessionStorage.setItem('lastError', JSON.stringify(errorDetails));
    } catch (e) {
      console.warn('Failed to save error details:', e);
    }

    // Enhanced error categorization for better handling
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

    // Only redirect to backup for critical errors that make the app unusable
    // Don't redirect for minor errors that can be recovered from
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
      }, isChunkLoadError ? 1000 : 2000); // Faster redirect for chunk errors
    } else {
      console.warn('Non-critical error caught, showing error UI instead of redirecting', {
        errorType: isNullError ? 'Null Reference' : 'Generic'
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-4 text-sm text-red-700 bg-red-50 rounded-md">
          <div className="font-medium mb-2">Ocorreu um erro inesperado</div>
          <div className="text-xs mb-2">Verifique o console do navegador para mais detalhes</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Recarregar Página
          </button>
          {import.meta.env.DEV && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs">Detalhes do Erro (DEV)</summary>
              <pre className="text-xs mt-1 overflow-auto max-h-32 bg-gray-100 p-2">
                {(() => {
                  try {
                    const errorData = sessionStorage.getItem('lastError');
                    return errorData ? JSON.stringify(JSON.parse(errorData), null, 2) : 'Nenhum erro registrado';
                  } catch (e) {
                    return 'Erro ao carregar detalhes: ' + e.message;
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

