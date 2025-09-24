/**
 * Error Tracking and Observability Hook for Saraiva Vision
 * Provides centralized error handling, logging, and analytics tracking
 */

import { useCallback, useEffect } from 'react';
import { VITE_ENV, isDevelopment } from '../lib/env';

interface ErrorContext {
  userId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

interface ApiError {
  endpoint: string;
  method: string;
  status: number;
  statusText: string;
  body?: any;
  duration?: number;
}

class ErrorTracker {
  private static instance: ErrorTracker;
  private errors: Array<{ error: Error; context?: ErrorContext }> = [];
  private maxErrors = 50;

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  private constructor() {
    // Global error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handleGlobalRejection.bind(this));
    }
  }

  private handleGlobalError(event: ErrorEvent) {
    this.trackError(event.error || new Error(event.message), {
      component: 'GlobalErrorHandler',
      url: event.filename,
      additionalData: {
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  }

  private handleGlobalRejection(event: PromiseRejectionEvent) {
    this.trackError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      {
        component: 'UnhandledPromiseRejection',
      }
    );
  }

  public trackError(error: Error, context?: ErrorContext) {
    const errorEntry = {
      error,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        url: window.location?.href,
        userAgent: navigator?.userAgent,
      },
    };

    // Add to local storage
    this.errors.push(errorEntry);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Console log in development
    if (isDevelopment) {
      console.group('🚨 Error Tracked');
      console.error('Error:', error);
      console.table(errorEntry.context);
      console.groupEnd();
    }

    // Send to analytics (PostHog)
    this.sendToAnalytics(errorEntry);

    // Send to external services in production
    if (!isDevelopment) {
      this.sendToExternalServices(errorEntry);
    }
  }

  public trackApiError(apiError: ApiError) {
    const error = new Error(`API Error: ${apiError.status} ${apiError.statusText}`);
    this.trackError(error, {
      component: 'ApiCall',
      action: `${apiError.method} ${apiError.endpoint}`,
      additionalData: {
        endpoint: apiError.endpoint,
        method: apiError.method,
        status: apiError.status,
        statusText: apiError.statusText,
        duration: apiError.duration,
        body: apiError.body,
      },
    });
  }

  public trackPerformanceIssue(metric: string, value: number, threshold: number) {
    if (value > threshold) {
      const error = new Error(`Performance threshold exceeded: ${metric}`);
      this.trackError(error, {
        component: 'PerformanceMonitor',
        action: 'ThresholdExceeded',
        additionalData: {
          metric,
          value,
          threshold,
          difference: value - threshold,
        },
      });
    }
  }

  private sendToAnalytics(errorEntry: { error: Error; context?: ErrorContext }) {
    try {
      // PostHog tracking
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('error_tracked', {
          error_message: errorEntry.error.message,
          error_stack: errorEntry.error.stack,
          error_component: errorEntry.context?.component,
          error_action: errorEntry.context?.action,
          error_url: errorEntry.context?.url,
          error_additional_data: errorEntry.context?.additionalData,
          environment: VITE_ENV.VERCEL_ENV,
        });
      }
    } catch (e) {
      console.warn('Failed to send error to analytics:', e);
    }
  }

  private async sendToExternalServices(errorEntry: { error: Error; context?: ErrorContext }) {
    // In a real implementation, you would send to services like Sentry, LogRocket, etc.
    // For now, we'll just log the attempt
    if (isDevelopment) {
      console.log('Would send error to external services:', errorEntry);
    }
  }

  public getErrors(): Array<{ error: Error; context?: ErrorContext }> {
    return [...this.errors];
  }

  public clearErrors(): void {
    this.errors = [];
  }
}

export function useErrorTracking() {
  const tracker = ErrorTracker.getInstance();

  const trackError = useCallback((error: Error, context?: ErrorContext) => {
    tracker.trackError(error, context);
  }, [tracker]);

  const trackApiError = useCallback((apiError: ApiError) => {
    tracker.trackApiError(apiError);
  }, [tracker]);

  const trackPerformanceIssue = useCallback((metric: string, value: number, threshold: number) => {
    tracker.trackPerformanceIssue(metric, value, threshold);
  }, [tracker]);

  const getErrors = useCallback(() => tracker.getErrors(), [tracker]);
  const clearErrors = useCallback(() => tracker.clearErrors(), [tracker]);

  return {
    trackError,
    trackApiError,
    trackPerformanceIssue,
    getErrors,
    clearErrors,
  };
}

/**
 * Hook for tracking form submission errors
 */
export function useFormErrorTracking(formName: string) {
  const { trackError } = useErrorTracking();

  const trackFormError = useCallback(
    (error: Error, fieldName?: string, formData?: Record<string, any>) => {
      trackError(error, {
        component: 'FormSubmission',
        action: `submit_${formName}`,
        additionalData: {
          formName,
          fieldName,
          formData: fieldName ? { [fieldName]: formData?.[fieldName] } : undefined, // Only send relevant field
        },
      });
    },
    [trackError, formName]
  );

  return { trackFormError };
}

/**
 * Hook for tracking component lifecycle errors
 */
export function useComponentErrorTracking(componentName: string) {
  const { trackError } = useErrorTracking();

  useEffect(() => {
    const handleComponentError = (error: Error) => {
      trackError(error, {
        component: componentName,
        action: 'component_lifecycle',
      });
    };

    return () => {
      // Cleanup if needed
    };
  }, [trackError, componentName]);

  const trackComponentError = useCallback(
    (error: Error, action: string, additionalData?: Record<string, any>) => {
      trackError(error, {
        component: componentName,
        action,
        additionalData,
      });
    },
    [trackError, componentName]
  );

  return { trackComponentError };
}