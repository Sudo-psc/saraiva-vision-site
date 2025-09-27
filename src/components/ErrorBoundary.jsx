import React from 'react';
import { redirectToBackup } from '@/utils/redirectToBackup';

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

    redirectToBackup();
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

