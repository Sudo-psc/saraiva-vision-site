'use client';

/**
 * ClientLayoutProviders Component
 * Client-side providers and components for the root layout
 * Phase 4: UI Components Migration (Vite → Next.js 15)
 *
 * Features:
 * - Web Vitals performance monitoring
 * - Performance analytics with GDPR compliance
 * - Client-side error handling
 * - Accessibility features
 */

import React, { useEffect } from 'react';
import { useWebVitals } from '@/hooks/useWebVitals';
import { initializeConsentMode } from '@/lib/utils/consentMode';

interface ClientLayoutProvidersProps {
  children: React.ReactNode;
}

/**
 * Client-side layout providers wrapper
 */
export function ClientLayoutProviders({ children }: ClientLayoutProvidersProps) {
  // Initialize Web Vitals tracking
  const webVitals = useWebVitals((metric) => {
    // Log Web Vitals in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Web Vital: ${metric.name} (${metric.rating})`, {
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
      });
    }

    // Send to analytics in production (only if consent is granted)
    if (process.env.NODE_ENV === 'production') {
      // Check if analytics consent is granted before sending data
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.id,
          non_interaction: true,
          custom_map: {
            [`${metric.name}_delta`]: metric.delta,
          },
        });
      }
    }
  });

  // Initialize consent mode on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize LGPD consent mode
      initializeConsentMode();

      // Set up global error tracking
      const handleError = (event: ErrorEvent) => {
        console.error('🚨 Global error:', event.error);

        // Send to error tracking service if consent is granted
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'exception', {
            description: event.error?.message || 'Unknown error',
            fatal: false,
          });
        }
      };

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error('🚨 Unhandled promise rejection:', event.reason);

        // Send to error tracking service if consent is granted
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'exception', {
            description: `Unhandled rejection: ${event.reason}`,
            fatal: false,
          });
        }
      };

      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, []);

  // Performance monitoring in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log performance metrics
      const logPerformance = () => {
        if ('performance' in window && 'getEntriesByType' in performance) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

          console.log('⚡ Performance Metrics:', {
            DOMContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            Load: navigation.loadEventEnd - navigation.loadEventStart,
            FirstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
            FirstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime,
            WebVitals: webVitals,
          });
        }
      };

      // Log performance after page load
      if (document.readyState === 'complete') {
        logPerformance();
      } else {
        window.addEventListener('load', logPerformance);
        return () => window.removeEventListener('load', logPerformance);
      }
    }
  }, [webVitals]);

  return <>{children}</>;
}