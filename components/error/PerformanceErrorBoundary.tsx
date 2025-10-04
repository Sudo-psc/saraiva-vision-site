/**
 * Performance Error Boundary for Saraiva Vision - Next.js 15
 * Automatically degrades to simpler versions when errors occur
 * Provides performance monitoring and graceful degradation
 */

'use client';

import React, { Component, ReactNode } from 'react';
import type {
  PerformanceErrorBoundaryProps,
  PerformanceLevel,
  PerformanceErrorContext,
} from '@/types/error';

interface PerformanceErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  performanceLevel: PerformanceLevel;
  errorCount: number;
  performanceContext?: PerformanceErrorContext;
}

/**
 * Error boundary for performance-sensitive components
 * Automatically degrades to simpler versions when errors occur
 */
export class PerformanceErrorBoundary extends Component<
  PerformanceErrorBoundaryProps,
  PerformanceErrorBoundaryState
> {
  private degradationHistory: PerformanceErrorContext['degradationHistory'] = [];

  constructor(props: PerformanceErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      performanceLevel: props.initialPerformanceLevel || 'high',
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<PerformanceErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Performance Error Boundary caught an error:', error, errorInfo);

    const newErrorCount = this.state.errorCount + 1;
    const previousLevel = this.state.performanceLevel;
    let newPerformanceLevel: PerformanceLevel = previousLevel;

    // Degrade performance level based on error frequency
    if (newErrorCount >= 3) {
      newPerformanceLevel = 'low';
    } else if (newErrorCount >= 2) {
      newPerformanceLevel = 'medium';
    }

    // Record degradation if level changed
    if (newPerformanceLevel !== previousLevel) {
      this.degradationHistory.push({
        timestamp: new Date().toISOString(),
        previousLevel,
        newLevel: newPerformanceLevel,
        reason: `Error count reached ${newErrorCount}`,
      });
    }

    const performanceContext: PerformanceErrorContext = {
      performanceLevel: newPerformanceLevel,
      errorCount: newErrorCount,
      degradationHistory: this.degradationHistory,
    };

    this.setState({
      hasError: true,
      error,
      errorInfo,
      errorCount: newErrorCount,
      performanceLevel: newPerformanceLevel,
      performanceContext,
    });

    // Notify parent component of performance degradation
    if (this.props.onPerformanceDegradation && newPerformanceLevel !== previousLevel) {
      this.props.onPerformanceDegradation(newPerformanceLevel, error);
    }

    // Call parent onError handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry with degraded performance after a delay
    setTimeout(() => {
      this.setState({ hasError: false });
    }, 1000);
  }

  /**
   * Get performance level description
   */
  private getPerformanceLevelDescription(level: PerformanceLevel): string {
    switch (level) {
      case 'high':
        return 'Desempenho Completo';
      case 'medium':
        return 'Desempenho Otimizado';
      case 'low':
        return 'Modo Econômico';
      default:
        return 'Desempenho Padrão';
    }
  }

  /**
   * Get performance level color
   */
  private getPerformanceLevelColor(level: PerformanceLevel): string {
    switch (level) {
      case 'high':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'orange';
      default:
        return 'gray';
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Show loading state while recovering
      const levelColor = this.getPerformanceLevelColor(this.state.performanceLevel);
      const levelDescription = this.getPerformanceLevelDescription(this.state.performanceLevel);

      return (
        <div
          className={`performance-recovery p-4 bg-${levelColor}-50 border border-${levelColor}-200 rounded-lg`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`Otimizando desempenho: ${levelDescription}`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Otimizando desempenho...
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Modo: {levelDescription}
              </p>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-3 text-xs text-gray-600">
              <summary className="cursor-pointer hover:text-gray-800 font-medium">
                Performance Diagnostics
              </summary>
              <div className="mt-2 p-2 bg-white rounded">
                <p>
                  <strong>Error Count:</strong> {this.state.errorCount}
                </p>
                <p>
                  <strong>Performance Level:</strong> {this.state.performanceLevel}
                </p>
                {this.state.error && (
                  <p>
                    <strong>Last Error:</strong> {this.state.error.message}
                  </p>
                )}
                {this.degradationHistory.length > 0 && (
                  <div className="mt-2">
                    <strong>Degradation History:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {this.degradationHistory.map((entry, index) => (
                        <li key={index}>
                          {entry.previousLevel} → {entry.newLevel}: {entry.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      );
    }

    // Pass performance level to children
    if (React.isValidElement(this.props.children)) {
      return React.cloneElement(this.props.children, {
        performanceLevel: this.state.performanceLevel,
        errorCount: this.state.errorCount,
      } as any);
    }

    return this.props.children;
  }
}

/**
 * Hook to monitor performance metrics
 */
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<{
    fps: number;
    memory?: number;
    timing?: PerformanceTiming;
  }>({
    fps: 60,
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;

        setMetrics((prev) => ({
          ...prev,
          fps,
          // @ts-ignore - memory is not standard
          memory: performance.memory?.usedJSHeapSize,
          timing: performance.timing,
        }));
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return metrics;
}

/**
 * Performance-aware component wrapper
 */
interface PerformanceAwareWrapperProps {
  children: ReactNode;
  highPerformanceComponent?: ReactNode;
  mediumPerformanceComponent?: ReactNode;
  lowPerformanceComponent?: ReactNode;
  performanceThreshold?: {
    fps: number;
    memory?: number;
  };
}

export function PerformanceAwareWrapper({
  children,
  highPerformanceComponent,
  mediumPerformanceComponent,
  lowPerformanceComponent,
  performanceThreshold = { fps: 30 },
}: PerformanceAwareWrapperProps) {
  const metrics = usePerformanceMonitor();
  const [performanceLevel, setPerformanceLevel] = React.useState<PerformanceLevel>('high');

  React.useEffect(() => {
    if (metrics.fps < performanceThreshold.fps) {
      setPerformanceLevel('low');
    } else if (metrics.fps < performanceThreshold.fps * 1.5) {
      setPerformanceLevel('medium');
    } else {
      setPerformanceLevel('high');
    }
  }, [metrics.fps, performanceThreshold.fps]);

  return (
    <PerformanceErrorBoundary initialPerformanceLevel={performanceLevel}>
      {performanceLevel === 'high' && (highPerformanceComponent || children)}
      {performanceLevel === 'medium' && (mediumPerformanceComponent || children)}
      {performanceLevel === 'low' && (lowPerformanceComponent || children)}
    </PerformanceErrorBoundary>
  );
}

export default PerformanceErrorBoundary;
