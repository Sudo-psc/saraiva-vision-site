// src/utils/structuredLogger.js

/**
 * Structured Logger for Saraiva Vision Components
 * Provides comprehensive observability with contextual logging
 */

class StructuredLogger {
    constructor(component = 'Unknown') {
        this.component = component;
        this.sessionId = this.generateSessionId();
        this.enableConsole = process.env.NODE_ENV !== 'production';
        this.enableRemote = process.env.NODE_ENV === 'production';
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    createLogEntry(level, message, data = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            component: this.component,
            sessionId: this.sessionId,
            message,
            ...data,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
            url: typeof window !== 'undefined' ? window.location.href : 'server'
        };

        // Add performance metrics if available
        if (typeof performance !== 'undefined' && performance.memory) {
            entry.memory = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }

        return entry;
    }

    log(level, message, data = {}) {
        const entry = this.createLogEntry(level, message, data);

        // Console logging for development
        if (this.enableConsole) {
            const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
            console[logMethod](`[${this.component}]`, message, data);
        }

        // Remote logging for production (implement as needed)
        if (this.enableRemote) {
            this.sendToRemoteLogging(entry);
        }

        return entry;
    }

    info(message, data = {}) {
        return this.log('info', message, data);
    }

    warn(message, data = {}) {
        return this.log('warn', message, data);
    }

    error(message, data = {}) {
        return this.log('error', message, data);
    }

    debug(message, data = {}) {
        return this.log('debug', message, data);
    }

    // Specialized logging methods for reviews
    logReviewProcessing(reviewId, action, data = {}) {
        return this.info('Review Processing', {
            reviewId,
            action,
            ...data
        });
    }

    logReviewError(reviewId, error, context = {}) {
        return this.error('Review Error', {
            reviewId,
            error: error.message || error,
            stack: error.stack,
            ...context
        });
    }

    logReviewValidation(reviewId, isValid, issues = []) {
        return this.info('Review Validation', {
            reviewId,
            isValid,
            issuesCount: issues.length,
            issues: issues.slice(0, 3) // Only log first 3 issues to avoid spam
        });
    }

    logPerformance(operation, duration, metadata = {}) {
        return this.info('Performance', {
            operation,
            duration: `${duration}ms`,
            ...metadata
        });
    }

    logApiCall(endpoint, method, status, duration, data = {}) {
        return this.info('API Call', {
            endpoint,
            method,
            status,
            duration: `${duration}ms`,
            ...data
        });
    }

    logUserInteraction(element, action, metadata = {}) {
        return this.info('User Interaction', {
            element,
            action,
            ...metadata
        });
    }

    async sendToRemoteLogging(entry) {
        // Implement remote logging as needed
        // This could send to your monitoring service, Splunk, etc.
        try {
            // Example: await fetch('/api/log', { method: 'POST', body: JSON.stringify(entry) });
        } catch (error) {
            // Fail silently to avoid breaking the application
            console.warn('Failed to send log to remote service:', error);
        }
    }
}

// Create logger instances for different components
export const createLogger = (component) => new StructuredLogger(component);

// Default logger instance
export const logger = createLogger('Application');

// Hook for React components
export const useLogger = (componentName) => {
    return React.useMemo(() => createLogger(componentName), [componentName]);
};