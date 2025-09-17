import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log detalhado para debug - sempre mostrar em desenvolvimento
    console.error('🚨 ErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      timestamp: new Date().toISOString()
    });
    
    // Também salvar no sessionStorage para análise posterior
    try {
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };
      sessionStorage.setItem('lastError', JSON.stringify(errorDetails));
    } catch (e) {
      console.warn('Failed to save error details:', e);
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
                {JSON.stringify(sessionStorage.getItem('lastError'), null, 2)}
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

