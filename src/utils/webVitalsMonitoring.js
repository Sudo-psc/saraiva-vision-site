/**
 * Web Vitals Monitoring System
 * Measures and reports Core Web Vitals (LCP, CLS, INP/FID) with analytics integration
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

class WebVitalsMonitor {
  constructor(options = {}) {
    this.options = {
      endpoint: '/api/web-vitals',
      debug: process.env.NODE_ENV === 'development',
      thresholds: {
        LCP: 2500, // ms
        FID: 100,  // ms
        CLS: 0.1,  // unitless
        FCP: 1800, // ms
        TTFB: 600  // ms
      },
      ...options
    };

    this.vitals = {};
    this.analytics = this.initAnalytics();
  }

  initAnalytics() {
    // Check for GA4
    if (typeof gtag !== 'undefined') {
      return {
        send: (name, value, data) => {
          gtag('event', name, {
            event_category: 'Web Vitals',
            value: Math.round(value),
            custom_map: { metric_rating: data.rating },
            non_interaction: true,
          });
        }
      };
    }

    return null;
  }

  getRating(name, value) {
    const thresholds = {
      LCP: [2500, 4000],
      INP: [200, 500], // INP thresholds: good <= 200ms, needs improvement <= 500ms
      CLS: [0.1, 0.25],
      FCP: [1800, 3000],
      TTFB: [800, 1800]
    };

    const [good, needsImprovement] = thresholds[name] || [0, 0];

    if (value <= good) return 'good';
    if (value <= needsImprovement) return 'needs-improvement';
    return 'poor';
  }

  async sendToAnalytics(metric) {
    const { name, value, rating, delta, id } = metric;

    // Store locally for debugging
    this.vitals[name] = { value, rating, delta, id, timestamp: Date.now() };

    if (this.options.debug) {
      console.log(`[Web Vitals] ${name}:`, {
        value: Math.round(value),
        rating,
        delta: Math.round(delta),
        threshold: this.options.thresholds[name]
      });
    }

    // Send to GA4
    if (this.analytics) {
      this.analytics.send(`web_vital_${name.toLowerCase()}`, value, { rating });
    }

    // Send to custom endpoint (only in production or if endpoint is available)
    if (this.options.endpoint && !this.options.debug) {
      try {
        await fetch(this.options.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metric: name,
            value: Math.round(value),
            rating,
            delta: Math.round(delta),
            id,
            url: window.location.pathname,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            connection: navigator.connection?.effectiveType || 'unknown'
          }),
        });
      } catch (error) {
        if (this.options.debug) {
          console.warn('[Web Vitals] Failed to send metric:', error);
        }
      }
    }
  }

  init() {
    // Initialize all Core Web Vitals monitoring
    onCLS((metric) => {
      metric.rating = this.getRating('CLS', metric.value);
      this.sendToAnalytics(metric);
    });

    onFCP((metric) => {
      metric.rating = this.getRating('FCP', metric.value);
      this.sendToAnalytics(metric);
    });

    onLCP((metric) => {
      metric.rating = this.getRating('LCP', metric.value);
      this.sendToAnalytics(metric);
    });

    onTTFB((metric) => {
      metric.rating = this.getRating('TTFB', metric.value);
      this.sendToAnalytics(metric);
    });

    // INP (Interaction to Next Paint) - replaces FID in Core Web Vitals
    onINP((metric) => {
      metric.rating = this.getRating('INP', metric.value);
      this.sendToAnalytics(metric);
    });
  }

  // Custom INP monitoring fallback
  initCustomINP() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (entry.interactionId) {
              const inp = {
                name: 'INP',
                value: entry.processingStart - entry.startTime,
                rating: this.getRating('INP', entry.processingStart - entry.startTime),
                delta: entry.processingStart - entry.startTime,
                id: `inp-${Date.now()}-${Math.random()}`,
                entries: [entry]
              };
              this.sendToAnalytics(inp);
            }
          }
        });

        observer.observe({
          type: 'event',
          buffered: true,
          durationThreshold: 40
        });
      } catch (error) {
        if (this.options.debug) {
          console.warn('[Web Vitals] INP monitoring not supported:', error);
        }
      }
    }
  }  // Get current vitals summary
  getSummary() {
    return {
      vitals: this.vitals,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent
    };
  }

  // Report performance issues to console in dev mode
  reportIssues() {
    if (!this.options.debug) return;

    Object.entries(this.vitals).forEach(([metric, data]) => {
      const threshold = this.options.thresholds[metric];
      if (threshold && data.value > threshold) {
        console.warn(`[Performance Issue] ${metric} is ${data.rating} (${Math.round(data.value)} > ${threshold})`);
      }
    });
  }
}

// Auto-initialize if not imported as module
let monitor;

export function initWebVitals(options = {}) {
  if (monitor) return monitor;

  monitor = new WebVitalsMonitor(options);

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => monitor.init());
  } else {
    monitor.init();
  }

  // Report issues after page load
  if (options.debug) {
    window.addEventListener('load', () => {
      setTimeout(() => monitor.reportIssues(), 3000);
    });
  }

  return monitor;
}

export function getWebVitalsSummary() {
  return monitor ? monitor.getSummary() : null;
}

export default WebVitalsMonitor;