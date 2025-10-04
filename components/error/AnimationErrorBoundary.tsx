/**
 * Animation Error Boundary for Saraiva Vision - Next.js 15
 * Provides fallback rendering when animations fail
 * WCAG AAA compliant with reduced motion support
 */

'use client';

import React, { Component, ReactNode } from 'react';
import type { AnimationErrorBoundaryProps, AnimationErrorContext } from '@/types/error';

interface AnimationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  animationContext?: AnimationErrorContext;
}

/**
 * Error boundary specifically designed for animated components
 * Provides fallback rendering when animations fail
 */
export class AnimationErrorBoundary extends Component<
  AnimationErrorBoundaryProps,
  AnimationErrorBoundaryState
> {
  private maxRetries: number;

  constructor(props: AnimationErrorBoundaryProps) {
    super(props);
    this.maxRetries = props.maxRetries || 3;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AnimationErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Animation Error Boundary caught an error:', error, errorInfo);

    // Extract animation context from error
    const animationContext: AnimationErrorContext = {
      animationName: this.extractAnimationName(error),
      retryCount: this.state.retryCount,
      maxRetries: this.maxRetries,
    };

    this.setState({
      error,
      errorInfo,
      hasError: true,
      animationContext,
    });

    // Report to error tracking service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Extract animation name from error message
   */
  private extractAnimationName(error: Error): string | undefined {
    const match = error.message.match(/animation[:\s]+([a-zA-Z0-9-_]+)/i);
    return match ? match[1] : undefined;
  }

  /**
   * Handle retry attempt
   */
  private handleRetry = (): void => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: this.state.retryCount + 1,
      });
    }
  };

  /**
   * Reset error boundary
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      animationContext: undefined,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({
            code: 'ANIMATION_ERROR',
            type: 'animation' as any,
            message: this.state.error?.message || 'Animation error',
            userMessage: 'Falha na animação. Exibindo versão simplificada.',
            severity: 'medium' as any,
            retryable: this.state.retryCount < this.maxRetries,
            recovery: 'Tente recarregar a página ou desabilite animações.',
            ariaLabel: 'Erro de animação: falha ao reproduzir animação',
          });
        }
        return this.props.fallback;
      }

      // Default fallback UI
      const showDetails = this.props.showErrorDetails && process.env.NODE_ENV === 'development';

      return (
        <div
          className="animation-error-fallback p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          {showDetails ? (
            // Development error details
            <div className="error-details">
              <div className="flex items-start mb-3">
                <span className="text-2xl mr-2" role="img" aria-label="Aviso">
                  ⚠️
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                    Animation Error
                  </h3>
                  <p className="text-xs text-yellow-700">
                    {this.state.error?.message || 'Unknown animation error'}
                  </p>
                </div>
              </div>

              {this.state.animationContext?.animationName && (
                <p className="text-xs text-yellow-700 mb-2">
                  <strong>Animation:</strong> {this.state.animationContext.animationName}
                </p>
              )}

              <details className="text-xs text-yellow-600 mb-3">
                <summary className="cursor-pointer hover:text-yellow-800 font-medium">
                  Error Details
                </summary>
                <pre className="mt-2 p-2 bg-yellow-100 rounded text-[10px] overflow-auto max-h-40">
                  {this.state.error?.stack}
                </pre>
                {this.state.errorInfo?.componentStack && (
                  <pre className="mt-2 p-2 bg-yellow-100 rounded text-[10px] overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>

              {this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="px-3 py-1 text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Retry Animation ({this.maxRetries - this.state.retryCount} attempts left)
                </button>
              )}

              <button
                onClick={this.handleReset}
                className="ml-2 px-3 py-1 text-xs font-medium text-yellow-700 bg-white border border-yellow-300 hover:bg-yellow-50 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                Reset
              </button>
            </div>
          ) : (
            // Production fallback - simple version without animation
            <div className="simple-fallback">
              <div className="flex items-start">
                <span className="text-xl mr-2" role="img" aria-label="Informação">
                  ℹ️
                </span>
                <div>
                  <p className="text-sm text-gray-700">
                    Exibindo versão simplificada sem animações.
                  </p>
                </div>
              </div>

              {/* Render children without animations */}
              <div className="mt-3" style={{ animation: 'none', transition: 'none' }}>
                {this.props.children}
              </div>

              {this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="mt-3 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Tentar carregar animação novamente"
                >
                  Ativar Animações
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to detect reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, []);

  return reducedMotion;
}

/**
 * Safe Animation Wrapper
 * Automatically disables animations when reduced motion is preferred
 */
interface SafeAnimationWrapperProps {
  children: ReactNode;
  className?: string;
  fallbackClassName?: string;
  enableAnimation?: boolean;
}

export function SafeAnimationWrapper({
  children,
  className = '',
  fallbackClassName = '',
  enableAnimation = true,
}: SafeAnimationWrapperProps) {
  const reducedMotion = useReducedMotion();

  const animationClasses = enableAnimation && !reducedMotion
    ? className
    : fallbackClassName || className.replace(/animate-/g, '');

  return (
    <AnimationErrorBoundary>
      <div className={animationClasses} style={reducedMotion ? { animation: 'none' } : undefined}>
        {children}
      </div>
    </AnimationErrorBoundary>
  );
}

export default AnimationErrorBoundary;
