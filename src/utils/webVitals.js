/**
 * Web Vitals Monitoring Utility
 *
 * Measures and reports Core Web Vitals metrics:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity
 * - INP (Interaction to Next Paint): Responsiveness (replaces FID)
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render
 * - TTFB (Time to First Byte): Server response time
 *
 * @author Dr. Philipe Saraiva Cruz
 */

// Threshold values for Core Web Vitals (Google's recommendations)
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // ms
  FID: { good: 100, needsImprovement: 300 }, // ms
  INP: { good: 200, needsImprovement: 500 }, // ms
  CLS: { good: 0.1, needsImprovement: 0.25 }, // score
  FCP: { good: 1800, needsImprovement: 3000 }, // ms
  TTFB: { good: 800, needsImprovement: 1800 } // ms
};

/**
 * Get rating based on metric value
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @returns {'good' | 'needs-improvement' | 'poor'}
 */
function getRating(metric, value) {
  const threshold = THRESHOLDS[metric];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Format metric value for display
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @returns {string}
 */
function formatValue(metric, value) {
  if (metric === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

/**
 * Report metric to analytics
 * @param {Object} metric - Web Vital metric
 */
function reportToAnalytics(metric) {
  const { name, value, rating, id, delta, navigationType } = metric;

  // Report to Google Analytics 4 if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      metric_value: value,
      metric_rating: rating,
      metric_delta: delta,
      navigation_type: navigationType,
      non_interaction: true
    });
  }

  // Report to PostHog if available
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('web_vital', {
      metric_name: name,
      metric_value: value,
      metric_rating: rating,
      metric_delta: delta,
      navigation_type: navigationType
    });
  }

  // Log in development
  if (import.meta.env?.DEV) {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(
      `${emoji} ${name}: ${formatValue(name, value)} (${rating})`,
      { delta, navigationType }
    );
  }
}

/**
 * Initialize Web Vitals monitoring
 * Uses web-vitals library for accurate measurements
 */
export async function initWebVitals() {
  try {
    // Dynamic import to avoid bundling if not needed
    const { onLCP, onFID, onCLS, onFCP, onTTFB, onINP } = await import('web-vitals');

    // LCP - Largest Contentful Paint (loading)
    onLCP((metric) => {
      reportToAnalytics({
        ...metric,
        rating: getRating('LCP', metric.value)
      });
    });

    // FID - First Input Delay (interactivity) - deprecated but still useful
    onFID((metric) => {
      reportToAnalytics({
        ...metric,
        rating: getRating('FID', metric.value)
      });
    });

    // INP - Interaction to Next Paint (responsiveness) - replaces FID
    onINP((metric) => {
      reportToAnalytics({
        ...metric,
        rating: getRating('INP', metric.value)
      });
    });

    // CLS - Cumulative Layout Shift (visual stability)
    onCLS((metric) => {
      reportToAnalytics({
        ...metric,
        rating: getRating('CLS', metric.value)
      });
    });

    // FCP - First Contentful Paint
    onFCP((metric) => {
      reportToAnalytics({
        ...metric,
        rating: getRating('FCP', metric.value)
      });
    });

    // TTFB - Time to First Byte
    onTTFB((metric) => {
      reportToAnalytics({
        ...metric,
        rating: getRating('TTFB', metric.value)
      });
    });

  } catch (error) {
    // Web Vitals library not available - use fallback
    console.warn('Web Vitals library not available, using fallback measurements');
    initFallbackMeasurements();
  }
}

/**
 * Fallback measurements using Performance API
 */
function initFallbackMeasurements() {
  if (typeof window === 'undefined' || !window.performance) return;

  // Measure LCP using PerformanceObserver
  if ('PerformanceObserver' in window) {
    try {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          reportToAnalytics({
            name: 'LCP',
            value: lastEntry.startTime,
            rating: getRating('LCP', lastEntry.startTime),
            id: 'fallback-lcp',
            delta: lastEntry.startTime,
            navigationType: 'navigate'
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Report CLS on page hide
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          reportToAnalytics({
            name: 'CLS',
            value: clsValue,
            rating: getRating('CLS', clsValue),
            id: 'fallback-cls',
            delta: clsValue,
            navigationType: 'navigate'
          });
        }
      });

      // FID Observer
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0];
        if (firstEntry) {
          const fidValue = firstEntry.processingStart - firstEntry.startTime;
          reportToAnalytics({
            name: 'FID',
            value: fidValue,
            rating: getRating('FID', fidValue),
            id: 'fallback-fid',
            delta: fidValue,
            navigationType: 'navigate'
          });
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

    } catch (e) {
      console.warn('PerformanceObserver not fully supported:', e);
    }
  }

  // Measure FCP and TTFB from navigation timing
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');

      if (navigation) {
        // TTFB
        const ttfb = navigation.responseStart - navigation.requestStart;
        reportToAnalytics({
          name: 'TTFB',
          value: ttfb,
          rating: getRating('TTFB', ttfb),
          id: 'fallback-ttfb',
          delta: ttfb,
          navigationType: navigation.type
        });
      }

      // FCP
      const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        reportToAnalytics({
          name: 'FCP',
          value: fcpEntry.startTime,
          rating: getRating('FCP', fcpEntry.startTime),
          id: 'fallback-fcp',
          delta: fcpEntry.startTime,
          navigationType: 'navigate'
        });
      }
    }, 0);
  });
}

/**
 * Get current Web Vitals summary
 * @returns {Promise<Object>} Summary of all metrics
 */
export async function getWebVitalsSummary() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const summary = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    metrics: {}
  };

  // Get navigation timing
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation) {
    summary.metrics.TTFB = {
      value: navigation.responseStart - navigation.requestStart,
      rating: getRating('TTFB', navigation.responseStart - navigation.requestStart)
    };
  }

  // Get paint timing
  const paint = performance.getEntriesByType('paint');
  const fcpEntry = paint.find(entry => entry.name === 'first-contentful-paint');
  if (fcpEntry) {
    summary.metrics.FCP = {
      value: fcpEntry.startTime,
      rating: getRating('FCP', fcpEntry.startTime)
    };
  }

  return summary;
}

/**
 * Log performance summary to console
 */
export function logPerformanceSummary() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    setTimeout(async () => {
      const summary = await getWebVitalsSummary();
      if (summary && import.meta.env?.DEV) {
        console.group('📊 Performance Summary');
        console.log('URL:', summary.url);
        console.log('Timestamp:', summary.timestamp);
        Object.entries(summary.metrics).forEach(([name, data]) => {
          const emoji = data.rating === 'good' ? '✅' : data.rating === 'needs-improvement' ? '⚠️' : '❌';
          console.log(`${emoji} ${name}: ${formatValue(name, data.value)} (${data.rating})`);
        });
        console.groupEnd();
      }
    }, 3000);
  });
}

export default {
  initWebVitals,
  getWebVitalsSummary,
  logPerformanceSummary,
  THRESHOLDS
};
