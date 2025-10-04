/**
 * Glass Effect Error Boundary for Saraiva Vision - Next.js 15
 * Provides graceful fallback when CSS glass morphism features are not supported
 * WCAG AAA compliant with TypeScript support
 */

'use client';

import React, { Component, ReactNode } from 'react';
import type {
  GlassEffectErrorBoundaryProps,
  GlassEffectSupport,
  ErrorBoundaryState,
} from '@/types/error';

interface GlassEffectErrorBoundaryState extends ErrorBoundaryState {
  fallbackMode: boolean;
  supportsBackdropFilter: boolean;
}

/**
 * Specialized error boundary for glass morphism effects
 * Provides graceful fallback when CSS features are not supported
 */
export class GlassEffectErrorBoundary extends Component<
  GlassEffectErrorBoundaryProps,
  GlassEffectErrorBoundaryState
> {
  constructor(props: GlassEffectErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      fallbackMode: false,
      supportsBackdropFilter: true,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GlassEffectErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Glass Effect Error Boundary caught an error:', error, errorInfo);

    // Check if error is related to backdrop-filter support
    const isBackdropFilterError =
      error.message?.includes('backdrop-filter') ||
      error.message?.includes('filter') ||
      error.stack?.includes('backdrop');

    this.setState({
      hasError: true,
      error,
      errorInfo,
      fallbackMode: true,
      supportsBackdropFilter: !isBackdropFilterError,
    });

    // Notify parent of fallback mode
    if (this.props.onFallback) {
      const support: GlassEffectSupport = {
        supportsBackdropFilter: !isBackdropFilterError,
        supportsFilter: true,
        supportsBlur: !isBackdropFilterError,
        fallbackMode: true,
      };
      this.props.onFallback(support);
    }

    // Call parent onError handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-recover in fallback mode
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 100);
  }

  render(): ReactNode {
    const { children, fallbackComponent: FallbackComponent } = this.props;

    if (this.state.hasError && !this.state.fallbackMode) {
      // Show loading while switching to fallback
      return (
        <div
          className="glass-effect-loading animate-pulse"
          role="status"
          aria-live="polite"
          aria-label="Carregando modo alternativo"
        >
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-sm text-gray-600">Carregando...</span>
          </div>
        </div>
      );
    }

    // Render with fallback props if in fallback mode
    if (this.state.fallbackMode) {
      if (FallbackComponent) {
        return <FallbackComponent supportsBackdropFilter={this.state.supportsBackdropFilter} />;
      }

      // Default fallback: render children with disabled glass effects
      if (React.isValidElement(children)) {
        return React.cloneElement(children, {
          enableGlassEffect: false,
          enableBackdropFilter: this.state.supportsBackdropFilter,
          fallbackMode: true,
        } as any);
      }
    }

    return children;
  }
}

/**
 * Hook to check glass effect support
 */
export function useGlassEffectSupport(): GlassEffectSupport {
  const [support, setSupport] = React.useState<GlassEffectSupport>({
    supportsBackdropFilter: true,
    supportsFilter: true,
    supportsBlur: true,
    fallbackMode: false,
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check backdrop-filter support
    const supportsBackdropFilter =
      CSS.supports('backdrop-filter', 'blur(10px)') ||
      CSS.supports('-webkit-backdrop-filter', 'blur(10px)');

    // Check filter support
    const supportsFilter = CSS.supports('filter', 'blur(10px)');

    // Check blur support
    const supportsBlur =
      supportsBackdropFilter || CSS.supports('filter', 'blur(10px)');

    setSupport({
      supportsBackdropFilter,
      supportsFilter,
      supportsBlur,
      fallbackMode: !supportsBackdropFilter,
    });
  }, []);

  return support;
}

/**
 * Glass Effect Wrapper with automatic fallback
 */
interface GlassEffectWrapperProps {
  children: ReactNode;
  className?: string;
  fallbackClassName?: string;
  enableGlassEffect?: boolean;
}

export function GlassEffectWrapper({
  children,
  className = '',
  fallbackClassName = '',
  enableGlassEffect = true,
}: GlassEffectWrapperProps) {
  const support = useGlassEffectSupport();

  const glassEffectClasses = enableGlassEffect && support.supportsBackdropFilter
    ? 'backdrop-blur-md bg-white/30 dark:bg-gray-900/30'
    : fallbackClassName || 'bg-white dark:bg-gray-900';

  return (
    <GlassEffectErrorBoundary>
      <div className={`${glassEffectClasses} ${className}`}>
        {children}
      </div>
    </GlassEffectErrorBoundary>
  );
}

export default GlassEffectErrorBoundary;
