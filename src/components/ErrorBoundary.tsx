import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SafeHelmet } from './SafeHelmet';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary that safely handles Helmet errors and prevents loops
 * Implements retry with backoff for /errors endpoint
 *
 * @author Dr. Philipe Saraiva Cruz
 */
export class ErrorBoundary extends Component<Props, State> {
  private errorCount = 0;
  private readonly MAX_ERRORS = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.errorCount++;

    // Prevent error loops
    if (this.errorCount > this.MAX_ERRORS) {
      console.error('[ErrorBoundary] Too many errors, stopping reporting to prevent loop');
      return;
    }

    // Don't report Helmet errors to /errors (prevent 500 loop)
    const isHelmetError = error.message?.includes('Helmet expects a string');

    if (!isHelmetError) {
      this.logError(error, errorInfo);
    } else {
      console.warn('[ErrorBoundary] Helmet error caught, not reporting to /errors:', error.message);
    }

    this.setState({
      error,
      errorInfo
    });
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorPayload = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Only send to /errors if payload is reasonable size
    const payloadSize = JSON.stringify(errorPayload).length;
    if (payloadSize > 10000) {
      console.warn('[ErrorBoundary] Error payload too large, truncating stack');
      errorPayload.stack = errorPayload.stack?.substring(0, 1000);
      errorPayload.componentStack = errorPayload.componentStack?.substring(0, 1000);
    }

    // Send with retry and backoff
    this.sendErrorWithRetry(errorPayload);
  }

  private async sendErrorWithRetry(payload: any, attempt = 1) {
    const MAX_RETRIES = 3;
    const BACKOFF_MS = 1000 * attempt;

    try {
      const response = await fetch('/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok && attempt < MAX_RETRIES) {
        console.warn(`[ErrorBoundary] Error reporting failed (${response.status}), retry ${attempt}/${MAX_RETRIES}`);
        setTimeout(() => this.sendErrorWithRetry(payload, attempt + 1), BACKOFF_MS);
      }
    } catch (err) {
      console.error('[ErrorBoundary] Failed to send error report:', err);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <SafeHelmet title="Erro - Saraiva Vision" />
          {this.props.fallback || (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                  Ocorreu um erro
                </h1>
                <p className="text-gray-700 mb-4">
                  Desculpe, algo deu errado. Nossa equipe foi notificada.
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Voltar para a página inicial
                </button>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 text-xs text-gray-600">
                    <summary className="cursor-pointer font-semibold">Detalhes técnicos</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                      {this.state.error.toString()}
                      {'\n\n'}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}
        </>
      );
    }

    return this.props.children;
  }
}
