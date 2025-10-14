/**
 * Advanced Error Tracking for Production
 * Captures detailed error context including CORS, state errors, and network issues
 */

class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.sessionId = this.generateSessionId();
    this.setupGlobalHandlers();
  }

  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  setupGlobalHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.sessionId,
        // Additional context
        isCrossOrigin: event.filename === '' || event.filename === 'Unknown file',
        errorObject: event.error ? this.serializeError(event.error) : null
      });

      // Don't prevent default - let other handlers run
      return false;
    }, true);

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandledrejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        sessionId: this.sessionId,
        reason: this.serializeError(event.reason)
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.captureResourceError({
          type: 'resource',
          tagName: event.target.tagName,
          src: event.target.src || event.target.href,
          timestamp: Date.now(),
          url: window.location.href,
          sessionId: this.sessionId
        });
      }
    }, true);

    // Page visibility changes (important for WebSocket errors)
    document.addEventListener('visibilitychange', () => {
      this.log('visibility', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
        timestamp: Date.now()
      });
    });

    // Network status
    window.addEventListener('online', () => {
      this.log('network', { status: 'online', timestamp: Date.now() });
    });

    window.addEventListener('offline', () => {
      this.log('network', { status: 'offline', timestamp: Date.now() });
    });
  }

  serializeError(error) {
    if (!error) return null;

    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        // DOMException specific
        code: error.code,
        // Additional properties
        ...Object.getOwnPropertyNames(error).reduce((acc, key) => {
          acc[key] = error[key];
          return acc;
        }, {})
      };
    }

    return { value: String(error) };
  }

  captureError(errorData) {
    console.error('[ErrorTracker] Error captured:', errorData);

    this.errors.push(errorData);

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Send to analytics if available
    if (window.posthog) {
      window.posthog.capture('error', errorData);
    }

    // Store in localStorage for debugging
    this.persistErrors();
  }

  captureResourceError(errorData) {
    console.error('[ErrorTracker] Resource error:', errorData);
    this.errors.push(errorData);
    this.persistErrors();
  }

  log(category, data) {
    const logEntry = {
      category,
      ...data,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    console.log(`[ErrorTracker:${category}]`, data);

    // Store in memory
    this.errors.push(logEntry);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  persistErrors() {
    try {
      const recentErrors = this.errors.slice(-20); // Last 20 errors
      localStorage.setItem('errorTracker', JSON.stringify({
        sessionId: this.sessionId,
        errors: recentErrors,
        lastUpdate: Date.now()
      }));
    } catch (e) {
      console.error('[ErrorTracker] Failed to persist errors:', e);
    }
  }

  getErrors() {
    return this.errors;
  }

  getReport() {
    return {
      sessionId: this.sessionId,
      errorCount: this.errors.length,
      errors: this.errors,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now()
    };
  }

  exportErrors() {
    const report = this.getReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${this.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize global error tracker
const errorTracker = new ErrorTracker();

// Expose to window for debugging
window.errorTracker = errorTracker;

// Add helper to console
console.exportErrors = () => errorTracker.exportErrors();
console.getErrors = () => errorTracker.getErrors();

export default errorTracker;
