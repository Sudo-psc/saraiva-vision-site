/**
 * Error tracking utility for reducing console noise and providing observability
 */

class ErrorTracker {
  constructor() {
    this.errorCounts = new Map();
    this.errorHashes = new Set();
    this.debounceTimers = new Map();
    this.maxLogFrequency = 5000; // 5 seconds between same error logs
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

// Export convenience functions
export const trackError = (error, context, category) =>
  errorTracker.trackError(error, context, category);

export const trackNetworkError = (url, status, error) =>
  errorTracker.trackNetworkError(url, status, error);

export const trackComponentError = (componentName, error, componentStack) =>
  errorTracker.trackComponentError(componentName, error, componentStack);

export default ErrorTracker;