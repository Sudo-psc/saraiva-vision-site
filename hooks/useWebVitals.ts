import { useEffect, useState, useCallback } from 'react';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import type { WebVitalsReport, WebVitalMetric } from '@/types/performance';

/**
 * Hook for tracking Core Web Vitals using Next.js web-vitals library
 * Tracks CLS, FCP, INP, LCP, and TTFB metrics
 *
 * @param onReport - Optional callback when new metrics are reported
 * @returns Current Web Vitals report
 *
 * @example
 * ```tsx
 * const webVitals = useWebVitals((metric) => {
 *   console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
 * });
 *
 * if (webVitals.LCP && webVitals.LCP.rating === 'poor') {
 *   // Take action for poor LCP
 * }
 * ```
 */
export const useWebVitals = (
  onReport?: (metric: WebVitalMetric) => void
): WebVitalsReport => {
  const [vitals, setVitals] = useState<WebVitalsReport>({
    timestamp: Date.now(),
  });

  const handleMetric = useCallback(
    (metric: WebVitalMetric) => {
      // Update state with new metric
      setVitals((prev) => ({
        ...prev,
        [metric.name]: metric,
        timestamp: Date.now(),
      }));

      // Call optional callback
      if (onReport) {
        onReport(metric);
      }

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
        });
      }
    },
    [onReport]
  );

  useEffect(() => {
    // Track Cumulative Layout Shift (CLS)
    // Good: < 0.1, Needs Improvement: < 0.25, Poor: >= 0.25
    onCLS(handleMetric);

    // Track First Contentful Paint (FCP)
    // Good: < 1800ms, Needs Improvement: < 3000ms, Poor: >= 3000ms
    onFCP(handleMetric);

    // Track Interaction to Next Paint (INP) - replaces FID
    // Good: < 200ms, Needs Improvement: < 500ms, Poor: >= 500ms
    onINP(handleMetric);

    // Track Largest Contentful Paint (LCP)
    // Good: < 2500ms, Needs Improvement: < 4000ms, Poor: >= 4000ms
    onLCP(handleMetric);

    // Track Time to First Byte (TTFB)
    // Good: < 800ms, Needs Improvement: < 1800ms, Poor: >= 1800ms
    onTTFB(handleMetric);
  }, [handleMetric]);

  return vitals;
};

/**
 * Get rating thresholds for Web Vitals metrics
 */
export const getWebVitalThresholds = (metricName: string) => {
  const thresholds: Record<string, { good: number; needsImprovement: number }> = {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    INP: { good: 200, needsImprovement: 500 },
    LCP: { good: 2500, needsImprovement: 4000 },
    TTFB: { good: 800, needsImprovement: 1800 },
  };

  return thresholds[metricName] || { good: 0, needsImprovement: 0 };
};

/**
 * Calculate Web Vitals score (0-100) based on all metrics
 */
export const calculateWebVitalsScore = (report: WebVitalsReport): number => {
  const metrics = [report.CLS, report.FCP, report.INP, report.LCP, report.TTFB].filter(
    Boolean
  ) as WebVitalMetric[];

  if (metrics.length === 0) return 0;

  const scoreMap = { good: 100, 'needs-improvement': 50, poor: 0 };
  const totalScore = metrics.reduce((sum, metric) => sum + scoreMap[metric.rating], 0);

  return Math.round(totalScore / metrics.length);
};

/**
 * Check if Web Vitals meet acceptable thresholds
 */
export const areWebVitalsGood = (report: WebVitalsReport): boolean => {
  const requiredMetrics: (keyof WebVitalsReport)[] = ['LCP', 'CLS', 'INP'];

  return requiredMetrics.every((metricName) => {
    const metric = report[metricName];
    if (!metric || typeof metric === 'number') return false;
    return metric.rating === 'good';
  });
};

export default useWebVitals;
