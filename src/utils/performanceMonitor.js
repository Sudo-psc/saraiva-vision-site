/**
 * Performance Monitoring for Saraiva Vision Healthcare Platform
 * Features: Web Vitals tracking, healthcare compliance validation, async loading optimization
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } from 'web-vitals';

/**
 * Healthcare Performance Standards
 */
const HEALTHCARE_PERFORMANCE_THRESHOLDS = {
  // Critical for medical content accessibility
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 },   // First Input Delay (ms)
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint (ms)
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },  // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 }  // Time to First Byte (ms)
};

/**
 * Performance monitoring class for healthcare platform
 */
class HealthcarePerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.healthMetrics = new Map();
    this.startTime = performance.now();
    this.navigationTiming = null;
    this.isInitialized = false;
  }

  /**
   * Initialize performance monitoring
   */
  initialize() {
    if (this.isInitialized) return;

    // Get navigation timing data
    this.navigationTiming = performance.getEntriesByType('navigation')[0];

    // Track Web Vitals for healthcare compliance
    this.trackWebVitals();

    // Track resource loading
    this.trackResourceLoading();

    // Track user interactions
    this.trackUserInteractions();

    // Monitor script loading performance
    this.monitorScriptLoading();

    // Setup healthcare compliance validation
    this.setupHealthcareCompliance();

    this.isInitialized = true;
    console.info('[Performance Monitor] Healthcare platform performance monitoring initialized');
  }

  /**
   * Track Web Vitals with healthcare context
   */
  trackWebVitals() {
    const trackMetric = (name, getMetricFn) => {
      getMetricFn((metric) => {
        const threshold = HEALTHCARE_PERFORMANCE_THRESHOLDS[name];
        const rating = this.getPerformanceRating(metric.value, threshold);

        // Store metric
        this.metrics.set(name, {
          value: metric.value,
          rating,
          timestamp: metric.startTime,
          healthcare: true
        });

        // Enhanced logging for medical content
        if (rating === 'poor') {
          console.warn(`[Healthcare Performance] ${name} is ${rating}: ${metric.value.toFixed(2)}`, metric);
        } else {
          console.info(`[Performance] ${name}: ${metric.value.toFixed(2)} (${rating})`);
        }

        // Send to analytics if available
        this.sendToAnalytics('web-vital', { name, value: metric.value, rating });
      });
    };

    // Track all web vitals
    trackMetric('LCP', getLCP);
    trackMetric('FID', getFID);
    trackMetric('INP', getINP);
    trackMetric('CLS', getCLS);
    trackMetric('FCP', getFCP);
    trackMetric('TTFB', getTTFB);
  }

  /**
   * Track resource loading performance
   */
  trackResourceLoading() {
    // Observer for resource loading
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.initiatorType === 'script') {
              this.trackScriptResource(entry);
            } else if (entry.initiatorType === 'img') {
              this.trackImageResource(entry);
            } else if (entry.initiatorType === 'css') {
              this.trackCSSResource(entry);
            }
          });
        });

        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (error) {
        console.warn('Resource observer not supported:', error);
      }
    }
  }

  /**
   * Track script resource loading
   */
  trackScriptResource(entry) {
    const isMedical = entry.name.includes('medical') ||
                     entry.name.includes('doctor') ||
                     entry.name.includes('healthcare');

    const scriptMetric = {
      duration: entry.duration,
      size: entry.transferSize,
      cached: entry.transferSize === 0,
      medical: isMedical,
      timestamp: entry.startTime
    };

    this.metrics.set(`script-${entry.name}`, scriptMetric);

    // Log slow medical scripts
    if (isMedical && entry.duration > 1000) {
      console.warn(`[Medical Performance] Slow medical script: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
    }
  }

  /**
   * Track image resource loading
   */
  trackImageResource(entry) {
    const isMedical = entry.name.includes('medical') ||
                     entry.name.includes('doctor') ||
                     entry.name.includes('clinic');

    const imageMetric = {
      duration: entry.duration,
      size: entry.transferSize,
      cached: entry.transferSize === 0,
      medical: isMedical,
      timestamp: entry.startTime
    };

    this.metrics.set(`image-${entry.name}`, imageMetric);

    // Medical images should load quickly
    if (isMedical && entry.duration > 2000) {
      console.warn(`[Medical Performance] Slow medical image: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
    }
  }

  /**
   * Track CSS resource loading
   */
  trackCSSResource(entry) {
    const cssMetric = {
      duration: entry.duration,
      size: entry.transferSize,
      cached: entry.transferSize === 0,
      timestamp: entry.startTime
    };

    this.metrics.set(`css-${entry.name}`, cssMetric);
  }

  /**
   * Track user interactions for performance
   */
  trackUserInteractions() {
    let interactionCount = 0;
    const interactions = [];

    const trackInteraction = (event) => {
      interactionCount++;
      const interaction = {
        type: event.type,
        target: event.target.tagName,
        timestamp: performance.now(),
        interactionNumber: interactionCount
      };

      interactions.push(interaction);

      // Log delayed interactions (poor performance)
      if (interactionCount === 1 && interaction.timestamp - this.startTime > 3000) {
        console.warn('[Healthcare Performance] First interaction delayed:', interaction.timestamp - this.startTime);
      }
    };

    // Track major interaction events
    document.addEventListener('click', trackInteraction, { passive: true });
    document.addEventListener('keydown', trackInteraction, { passive: true });
    document.addEventListener('touchstart', trackInteraction, { passive: true });
  }

  /**
   * Monitor script loading performance
   */
  monitorScriptLoading() {
    // Override script loading to track performance
    const originalScriptLoader = window.loadScript;
    if (originalScriptLoader) {
      window.loadScript = async (src, options = {}) => {
        const startTime = performance.now();
        try {
          const result = await originalScriptLoader(src, options);
          const loadTime = performance.now() - startTime;

          this.metrics.set(`async-script-${src}`, {
            loadTime,
            priority: options.priority,
            success: true,
            timestamp: startTime
          });

          console.info(`[Async Script] ${src} loaded in ${loadTime.toFixed(2)}ms (${options.priority})`);
          return result;
        } catch (error) {
          const loadTime = performance.now() - startTime;
          this.metrics.set(`async-script-${src}`, {
            loadTime,
            priority: options.priority,
            success: false,
            error: error.message,
            timestamp: startTime
          });

          console.error(`[Async Script] Failed to load ${src} after ${loadTime.toFixed(2)}ms:`, error);
          throw error;
        }
      };
    }
  }

  /**
   * Setup healthcare compliance validation
   */
  setupHealthcareCompliance() {
    // Validate medical content loading
    setInterval(() => {
      this.validateHealthcareCompliance();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Validate healthcare compliance metrics
   */
  validateHealthcareCompliance() {
    const lcpMetric = this.metrics.get('LCP');
    const fidMetric = this.metrics.get('FID');
    const clsMetric = this.metrics.get('CLS');

    const issues = [];

    // Critical metrics for medical content
    if (lcpMetric && lcpMetric.rating === 'poor') {
      issues.push({
        type: 'critical',
        metric: 'LCP',
        message: 'Medical content loading is too slow',
        value: lcpMetric.value,
        threshold: HEALTHCARE_PERFORMANCE_THRESHOLDS.LCP.poor
      });
    }

    if (fidMetric && fidMetric.rating === 'poor') {
      issues.push({
        type: 'critical',
        metric: 'FID',
        message: 'Medical interface response is too slow',
        value: fidMetric.value,
        threshold: HEALTHCARE_PERFORMANCE_THRESHOLDS.FID.poor
      });
    }

    if (clsMetric && clsMetric.rating === 'poor') {
      issues.push({
        type: 'warning',
        metric: 'CLS',
        message: 'Medical content layout is unstable',
        value: clsMetric.value,
        threshold: HEALTHCARE_PERFORMANCE_THRESHOLDS.CLS.poor
      });
    }

    // Store compliance data
    this.healthMetrics.set('compliance', {
      timestamp: Date.now(),
      issues,
      overallScore: issues.filter(i => i.type === 'critical').length === 0 ? 'good' : 'poor'
    });

    // Log compliance issues
    if (issues.length > 0) {
      console.warn('[Healthcare Compliance] Performance issues detected:', issues);
    }

    return issues;
  }

  /**
   * Get performance rating
   */
  getPerformanceRating(value, threshold) {
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Send metrics to analytics
   */
  sendToAnalytics(type, data) {
    // Send to PostHog if available
    if (window.posthog) {
      try {
        window.posthog.capture('performance_metric', {
          type,
          ...data,
          healthcare_platform: true,
          timestamp: Date.now()
        });
      } catch (error) {
        console.warn('Failed to send performance metrics to analytics:', error);
      }
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    const metrics = Object.fromEntries(this.metrics);
    const healthMetrics = Object.fromEntries(this.healthMetrics);

    // Calculate overall performance score
    const vitalMetrics = ['LCP', 'FID', 'INP', 'CLS', 'FCP', 'TTFB'];
    const scores = vitalMetrics.map(metric => {
      const m = metrics[metric];
      return m && m.rating === 'good' ? 1 : m && m.rating === 'needs-improvement' ? 0.5 : 0;
    });

    const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      overallScore: Math.round(overallScore * 100),
      metrics,
      healthMetrics,
      healthcareCompliance: healthMetrics.compliance?.overallScore || 'unknown',
      navigationTiming: this.navigationTiming ? {
        domComplete: this.navigationTiming.domComplete,
        loadEventEnd: this.navigationTiming.loadEventEnd,
        firstContentfulPaint: this.navigationTiming.firstContentfulPaint
      } : null,
      timestamp: Date.now()
    };
  }

  /**
   * Get healthcare compliance report
   */
  getHealthcareComplianceReport() {
    const compliance = this.healthMetrics.get('compliance');
    const criticalIssues = compliance?.issues?.filter(i => i.type === 'critical') || [];
    const warnings = compliance?.issues?.filter(i => i.type === 'warning') || [];

    return {
      compliant: criticalIssues.length === 0,
      criticalIssues,
      warnings,
      lastCheck: compliance?.timestamp,
      recommendations: this.generateHealthcareRecommendations(criticalIssues, warnings)
    };
  }

  /**
   * Generate healthcare compliance recommendations
   */
  generateHealthcareRecommendations(criticalIssues, warnings) {
    const recommendations = [];

    if (criticalIssues.some(i => i.metric === 'LCP')) {
      recommendations.push({
        priority: 'critical',
        action: 'Optimize medical content loading',
        description: 'Medical images and content should load within 2.5 seconds'
      });
    }

    if (criticalIssues.some(i => i.metric === 'FID')) {
      recommendations.push({
        priority: 'critical',
        action: 'Improve interface responsiveness',
        description: 'Patient interactions should respond within 100ms'
      });
    }

    if (warnings.some(i => i.metric === 'CLS')) {
      recommendations.push({
        priority: 'warning',
        action: 'Stabilize medical content layout',
        description: 'Prevent unexpected layout shifts during content loading'
      });
    }

    return recommendations;
  }
}

// Global performance monitor instance
window.healthcarePerformanceMonitor = new HealthcarePerformanceMonitor();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.healthcarePerformanceMonitor.initialize();
  });
} else {
  window.healthcarePerformanceMonitor.initialize();
}

export default HealthcarePerformanceMonitor;
export { HEALTHCARE_PERFORMANCE_THRESHOLDS };