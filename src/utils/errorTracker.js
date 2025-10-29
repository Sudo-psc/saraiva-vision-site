/**
 * Error tracking utility for reducing console noise and providing observability
 *
 * Features:
 * - Debounced error logging to prevent spam
 * - Global resource error handler
 * - CORS error filtering (expected behavior for iframes)
 * - Automatic initialization on import
 *
 * @author Dr. Philipe Saraiva Cruz
 */

class ErrorTracker {
  constructor() {
    this.errorCounts = new Map();
    this.errorHashes = new Set();
    this.debounceTimers = new Map();
    this.maxLogFrequency = 5000; // 5 seconds between same error logs
    this.initialized = false;

    // Error patterns to ignore (expected behavior)
    this.ignoredPatterns = [
      /Blocked a frame with origin.*from accessing a cross-origin frame/i,
      /SecurityError.*cross-origin/i,
      /Unable to post message to.*Permission denied/i,
      /postMessage.*different origin/i,
    ];
  }

  /**
   * Initialize global error handlers
   * Call this once when the app starts
   */
  initialize() {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    this.initialized = true;

    // Global error handler
    window.addEventListener('error', (event) => {
      // Check if error should be ignored
      if (this.shouldIgnoreError(event.error || event.message)) {
        event.preventDefault(); // Prevent error from appearing in console
        return;
      }

      // Handle resource loading errors
      if (event.target !== window) {
        this.handleResourceError(event);
        return;
      }

      // Handle JS errors
      const error = event.error || new Error(event.message);
      this.trackError(error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'unhandled'
      }, 'global');
    });

    // Global unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      if (this.shouldIgnoreError(event.reason)) {
        event.preventDefault();
        return;
      }

      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

      this.trackError(error, {
        type: 'promise',
        promise: event.promise
      }, 'promise');
    });

    console.log('✅ ErrorTracker initialized with global handlers');
  }

  /**
   * Check if error matches ignored patterns (CORS, etc.)
   */
  shouldIgnoreError(error) {
    if (!error) return false;

    const errorString = error.message || String(error);
    return this.ignoredPatterns.some(pattern => pattern.test(errorString));
  }

  /**
   * Handle resource loading errors (images, scripts, stylesheets)
   */
  handleResourceError(event) {
    const target = event.target;
    const tagName = target.tagName?.toLowerCase();
    const src = target.src || target.href;

    if (!src) return;

    const error = new Error(`Failed to load ${tagName}: ${src}`);
    this.trackError(error, {
      tagName,
      src,
      type: 'resource'
    }, 'resource');
  }

  /**
   * Generate a hash for error stack trace to identify unique errors
   */
  generateErrorHash(error) {
    const stack = error.stack || error.message || 'unknown';
    let hash = 0;
    for (let i = 0; i < stack.length; i++) {
      const char = stack.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if error should be logged based on frequency and uniqueness
   */
  shouldLogError(error, category = 'default') {
    const errorHash = this.generateErrorHash(error);
    const key = `${category}:${errorHash}`;

    // If we haven't seen this error before, log it
    if (!this.errorHashes.has(errorHash)) {
      this.errorHashes.add(errorHash);
      this.errorCounts.set(key, 1);
      return true;
    }

    // Check debounce timer
    if (this.debounceTimers.has(key)) {
      return false;
    }

    // Update count and check if we should log
    const count = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, count + 1);

    // Set debounce timer
    this.debounceTimers.set(key, setTimeout(() => {
      this.debounceTimers.delete(key);
    }, this.maxLogFrequency));

    // Log every 10th occurrence or if it's been a while
    return count % 10 === 0;
  }

  /**
   * Track error with debounce and aggregation
   */
  trackError(error, context = {}, category = 'default') {
    if (!this.shouldLogError(error, category)) {
      return;
    }

    const errorHash = this.generateErrorHash(error);
    const key = `${category}:${errorHash}`;
    const count = this.errorCounts.get(key) || 1;

    // Log structured error
    console.groupCollapsed(`🚨 [${category.toUpperCase()}] ${error.message} (#${count})`);
    console.error('Error:', error);
    console.error('Context:', context);
    console.error('Hash:', errorHash);
    console.error('Count:', count);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    console.groupEnd();

    // Send to error monitoring service if available
    if (typeof window !== 'undefined' && window.navigator?.onLine) {
      this.sendToMonitoring(error, context, category, errorHash, count);
    }
  }

  /**
   * Send error to monitoring service (placeholder for real implementation)
   */
  sendToMonitoring(error, context, category, errorHash, count) {
    // Placeholder for error monitoring service integration
    // Could be Sentry, LogRocket, custom endpoint, etc.
    if (process.env.NODE_ENV === 'development') {
      console.debug('Would send to monitoring:', {
        error: error.message,
        category,
        errorHash,
        count,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  }

  /**
   * Track network errors specifically
   */
  trackNetworkError(url, status, error) {
    const context = {
      url,
      status,
      method: 'GET',
      timestamp: new Date().toISOString()
    };

    this.trackError(error, context, 'network');
  }

  /**
   * Track component errors specifically
   */
  trackComponentError(componentName, error, componentStack) {
    const context = {
      componentName,
      componentStack,
      timestamp: new Date().toISOString()
    };

    this.trackError(error, context, 'component');
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      uniqueErrors: this.errorHashes.size,
      totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
      topErrors: Array.from(this.errorCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([key, count]) => ({ key, count }))
    };

    return stats;
  }

  /**
   * Clear tracking data (useful for testing)
   */
  clear() {
    this.errorCounts.clear();
    this.errorHashes.clear();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => errorTracker.initialize());
  } else {
    errorTracker.initialize();
  }
}

// Export convenience functions
export const trackError = (error, context, category) =>
  errorTracker.trackError(error, context, category);

export const trackNetworkError = (url, status, error) =>
  errorTracker.trackNetworkError(url, status, error);

export const trackComponentError = (componentName, error, componentStack) =>
  errorTracker.trackComponentError(componentName, error, componentStack);

export default ErrorTracker;