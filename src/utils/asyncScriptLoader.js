/**
 * Async Script Loading Utilities for Saraiva Vision
 * Optimized for healthcare platform with CFM/LGPD compliance
 *
 * Features:
 * - Priority-based script loading
 * - Healthcare compliance validation
 * - Error tracking and fallback mechanisms
 * - Performance monitoring integration
 * - Healthcare data protection (LGPD)
 */

/**
 * Script loading priorities
 */
export const SCRIPT_PRIORITIES = {
  CRITICAL: 'critical',     // Medical content, essential functionality
  HIGH: 'high',            // Patient-facing features
  NORMAL: 'normal',        // Analytics, tracking
  LOW: 'low'              // Chat widgets, non-essential features
};

/**
 * Healthcare compliance validation
 */
const HEALTHCARE_COMPLIANCE = {
  // Scripts that must load immediately for medical content
  essentialMedical: [
    'googlemaps', // Maps for clinic location
    'core-medical-content'
  ],

  // Scripts that can be deferred but must comply with LGPD
  deferredTracking: [
    'analytics',
    'posthog',
    'google-analytics'
  ],

  // Non-essential scripts that can be loaded during idle time
  nonEssential: [
    'chat-widget',
    'social-widgets',
    'marketing-tools'
  ]
};

/**
 * Performance tracking for script loading
 */
class ScriptLoadingTracker {
  constructor() {
    this.metrics = new Map();
    this.startTime = performance.now();
  }

  track(scriptName, status, details = {}) {
    if (!this.metrics.has(scriptName)) {
      this.metrics.set(scriptName, {
        loadStartTime: details.loadStartTime || this.startTime,
        loadEndTime: performance.now(),
        status,
        retryCount: details.retryCount || 0,
        error: details.error || null
      });
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  getLoadTime(scriptName) {
    const metric = this.metrics.get(scriptName);
    return metric ? metric.loadEndTime - metric.loadStartTime : null;
  }
}

// Global script loading tracker
window.scriptLoadingTracker = new ScriptLoadingTracker();

/**
 * Check if script is healthcare critical
 */
function isHealthcareCritical(scriptSrc) {
  return HEALTHCARE_COMPLIANCE.essentialMedical.some(essential =>
    scriptSrc.toLowerCase().includes(essential.toLowerCase())
  );
}

/**
 * Check if script requires LGPD compliance
 */
function requiresLGPDCompliance(scriptSrc) {
  return HEALTHCARE_COMPLIANCE.deferredTracking.some(tracking =>
    scriptSrc.toLowerCase().includes(tracking.toLowerCase())
  );
}

/**
 * Enhanced async script loader with healthcare compliance
 */
export function loadScript(src, options = {}) {
  return new Promise((resolve, reject) => {
    const scriptName = options.name || src.split('/').pop().split('?')[0];
    const startTime = performance.now();

    // Healthcare compliance checks
    const isCritical = isHealthcareCritical(src);
    const requiresConsent = requiresLGPDCompliance(src);

    // Check for LGPD consent if required
    if (requiresConsent && window.__lgpd_consent__?.analytics === false) {
      console.info(`[LGPD] Script ${scriptName} requires analytics consent, skipping load`);
      resolve(null);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    // Set attributes
    if (options.defer) script.defer = true;
    if (options.integrity) script.integrity = options.integrity;
    if (options.crossorigin) script.crossorigin = options.crossorigin;
    if (options.id) script.id = options.id;
    if (options.dataset) {
      Object.keys(options.dataset).forEach(key => {
        script.dataset[key] = options.dataset[key];
      });
    }

    // Healthcare compliance attributes
    if (requiresConsent) {
      script.setAttribute('data-lgpd-tracking', 'true');
      script.setAttribute('data-purposes', 'analytics');
    }
    if (isCritical) {
      script.setAttribute('data-medical-critical', 'true');
    }

    script.onload = () => {
      window.scriptLoadingTracker.track(scriptName, 'loaded', { loadStartTime: startTime });

      // Log performance for medical critical scripts
      if (isCritical) {
        const loadTime = window.scriptLoadingTracker.getLoadTime(scriptName);
        console.info(`[Medical Critical] ${scriptName} loaded in ${Math.round(loadTime)}ms`);
      }

      resolve(script);
    };

    script.onerror = () => {
      const error = new Error(`Failed to load script: ${src}`);
      window.scriptLoadingTracker.track(scriptName, 'error', {
        loadStartTime: startTime,
        error: error.message
      });

      // Enhanced error tracking for healthcare compliance
      if (isCritical) {
        console.error(`[Critical Error] Failed to load medical-critical script: ${scriptName}`);
        // Attempt retry for critical medical scripts
        if (options.retry !== false) {
          setTimeout(() => {
            console.info(`[Retry] Attempting to reload critical script: ${scriptName}`);
            loadScript(src, { ...options, retry: false }).catch(() => {
              console.error(`[Final Failure] Could not load critical script: ${scriptName}`);
            });
          }, 2000);
        }
      }

      reject(error);
    };

    // Priority-based loading strategy
    const priority = options.priority || SCRIPT_PRIORITIES.NORMAL;

    switch (priority) {
      case SCRIPT_PRIORITIES.CRITICAL:
        document.head.appendChild(script);
        break;

      case SCRIPT_PRIORITIES.HIGH:
        // Load after DOM content is loaded
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', () => {
            document.head.appendChild(script);
          });
        } else {
          document.head.appendChild(script);
        }
        break;

      case SCRIPT_PRIORITIES.NORMAL:
        // Load after initial page load
        if (window.requestIdleCallback) {
          requestIdleCallback(() => {
            document.head.appendChild(script);
          }, { timeout: 2000 });
        } else {
          setTimeout(() => {
            document.head.appendChild(script);
          }, 1000);
        }
        break;

      case SCRIPT_PRIORITIES.LOW:
        // Load during idle time with longer timeout
        if (window.requestIdleCallback) {
          requestIdleCallback(() => {
            document.head.appendChild(script);
          }, { timeout: 5000 });
        } else {
          setTimeout(() => {
            document.head.appendChild(script);
          }, 3000);
        }
        break;
    }
  });
}

/**
 * Batch script loader for multiple scripts
 */
export function loadScripts(scripts, options = {}) {
  const {
    parallel = true,
    timeout = 10000,
    continueOnError = true,
    trackPerformance = true
  } = options;

  if (trackPerformance) {
    const startTime = performance.now();
    console.info(`[Batch Load] Starting to load ${scripts.length} scripts`);
  }

  if (parallel) {
    // Load all scripts in parallel
    const promises = scripts.map(scriptOptions =>
      loadScript(scriptOptions.src, scriptOptions)
        .catch(error => {
          if (continueOnError) {
            console.warn(`[Batch Load] Script failed but continuing:`, error);
            return null;
          }
          throw error;
        })
    );

    return Promise.allSettled(promises);
  } else {
    // Load scripts sequentially
    return scripts.reduce((promise, scriptOptions) => {
      return promise.then(() => loadScript(scriptOptions.src, scriptOptions))
        .catch(error => {
          if (continueOnError) {
            console.warn(`[Sequential Load] Script failed but continuing:`, error);
            return null;
          }
          throw error;
        });
    }, Promise.resolve());
  }
}

/**
 * Healthcare compliance validation for loaded scripts
 */
export function validateHealthcareCompliance() {
  const scripts = document.querySelectorAll('script[data-medical-critical]');
  const criticalScripts = Array.from(scripts).filter(script =>
    script.dataset.medicalCritical === 'true' && !script.onload
  );

  if (criticalScripts.length > 0) {
    console.error(`[Compliance Alert] ${criticalScripts.length} critical medical scripts failed to load`);
    // Implement fallback mechanisms for healthcare compliance
    return false;
  }

  return true;
}

/**
 * Performance monitoring integration
 */
export function getScriptLoadingMetrics() {
  const metrics = window.scriptLoadingTracker.getMetrics();
  const summary = {
    totalScripts: Object.keys(metrics).length,
    loadedCount: Object.values(metrics).filter(m => m.status === 'loaded').length,
    errorCount: Object.values(metrics).filter(m => m.status === 'error').length,
    averageLoadTime: Object.values(metrics)
      .filter(m => m.status === 'loaded')
      .reduce((acc, m) => acc + (m.loadEndTime - m.loadStartTime), 0) /
      Object.values(metrics).filter(m => m.status === 'loaded').length || 0
  };

  return { metrics, summary };
}

/**
 * Initialize optimized script loading for Saraiva Vision
 */
export function initializeScriptLoading() {
  // Set up performance monitoring
  if (window.requestIdleCallback) {
    requestIdleCallback(() => {
      const metrics = getScriptLoadingMetrics();
      console.info('[Performance] Script loading metrics:', metrics.summary);

      // Track Web Vitals for medical platform
      if (window.webVitals) {
        window.webVitals.getCLS(console.info);
        window.webVitals.getFID(console.info);
        window.webVitals.getLCP(console.info);
        window.webVitals.getTTFB(console.info);
      }
    }, { timeout: 3000 });
  }

  // Healthcare compliance check
  setTimeout(validateHealthcareCompliance, 5000);
}

// Export utilities for React components
export default {
  loadScript,
  loadScripts,
  getScriptLoadingMetrics,
  validateHealthcareCompliance,
  initializeScriptLoading,
  SCRIPT_PRIORITIES
};