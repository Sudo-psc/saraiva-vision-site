import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * BlogErrorBoundary - Catches and handles errors in blog page rendering
 * Provides fallback UI with debugging information in development mode
 */
class BlogErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `blog-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    const errorDetails = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      url: typeof window !== 'undefined' ? window.location.href : 'SSR'
    };

    // Development mode logging
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Blog Error Boundary Caught an Error');
      console.error('Error ID:', errorDetails.errorId);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Full Details:', errorDetails);
      console.groupEnd();
    }

    // Production error logging
    console.error('Blog Error:', errorDetails);

    // Store error details for debugging
    this.setState({
      error,
      errorInfo,
      errorDetails
    });

    // Track error in analytics if available
    if (typeof window !== 'undefined' && window.trackBlogInteraction) {
      try {
        window.trackBlogInteraction('error', 'blog_page_error', {
          error_id: errorDetails.errorId,
          error_message: error.message,
          component_stack: errorInfo.componentStack
        });
      } catch (analyticsError) {
        console.warn('Failed to track error in analytics:', analyticsError);
      }
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      errorDetails: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="max-w-2xl w-full">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Ops! Algo deu errado no blog
              </h1>

              {/* Error Description */}
              <p className="text-lg text-gray-600 mb-8">
                Encontramos um problema ao carregar o conteúdo do blog.
                Nossa equipe foi notificada e estamos trabalhando para resolver isso.
              </p>

              {/* Error ID for Support */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
                <p className="text-sm text-gray-600">
                  <strong>ID do Erro:</strong> {this.state.errorId}
                </p>
                {isDevelopment && (
                  <p className="text-xs text-gray-500 mt-2">
                    Modo de desenvolvimento: Mais detalhes disponíveis no console
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar Novamente
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Página Inicial
                </Button>
              </div>

              {/* Development Mode Debug Info */}
              {isDevelopment && this.state.error && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-sm font-mono text-red-600 hover:text-red-700">
                    🐛 Detalhes do Erro (Desenvolvimento)
                  </summary>
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-800 mb-2">Error Message:</h4>
                      <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono">
                        {this.state.error.toString()}
                      </pre>
                    </div>

                    {this.state.error.stack && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-red-800 mb-2">Stack Trace:</h4>
                        <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono overflow-x-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}

                    {this.state.errorInfo && this.state.errorInfo.componentStack && (
                      <div>
                        <h4 className="font-semibold text-red-800 mb-2">Component Stack:</h4>
                        <pre className="text-xs text-red-700 whitespace-pre-wrap font-mono overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default BlogErrorBoundary;