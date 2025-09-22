/**
 * Instagram Error Handler Service
 * Manages error handling, retry mechanisms, and fallback strategies for Instagram API
 */

class InstagramErrorHandler {
    constructor() {
        this.retryAttempts = new Map(); // Track retry attempts per operation
        this.errorLog = []; // Store error history (without sensitive data)
        this.maxRetries = 3;
        this.baseDelay = 1000; // Base delay for exponential backoff (1 second)
        this.maxDelay = 30000; // Maximum delay (30 seconds)
        this.errorCallbacks = new Map(); // Error event listeners
    }

    /**
     * Handle API errors with appropriate retry logic and user messaging
     */
    async handleError(error, context = {}) {
        const errorInfo = this.analyzeError(error, context);

        // Log error (without sensitive information)
        this.logError(errorInfo);

        // Determine if retry is appropriate
        const shouldRetry = this.shouldRetry(errorInfo);

        if (shouldRetry && this.canRetry(context.operationId)) {
            return this.scheduleRetry(context.operation, context.operationId, errorInfo);
        }

        // Emit error event for UI components
        this.emitError(errorInfo);

        return {
            success: false,
            error: errorInfo,
            shouldShowFallback: this.shouldShowFallback(errorInfo),
            userMessage: this.getUserMessage(errorInfo),
            retryable: shouldRetry && !this.hasExceededRetries(context.operationId)
        };
    }

    /**
     * Analyze error to determine type, severity, and appropriate response
     */
    analyzeError(error, context = {}) {
        const errorInfo = {
            id: `ig-error-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date().toISOString(),
            type: 'unknown',
            severity: 'medium',
            message: error.message || 'Unknown error',
            code: error.code || error.status,
            context: {
                operation: context.operation || 'unknown',
                operationId: context.operationId || 'unknown',
                url: context.url,
                method: context.method
            },
            retryable: false,
            userFacing: true
        };

        // Analyze error type based on various indicators
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorInfo.type = 'network';
            errorInfo.severity = 'high';
            errorInfo.retryable = true;
        } else if (error.status === 401 || error.status === 403) {
            errorInfo.type = 'auth';
            errorInfo.severity = 'high';
            errorInfo.retryable = false;
        } else if (error.status === 429) {
            errorInfo.type = 'rate-limit';
            errorInfo.severity = 'medium';
            errorInfo.retryable = true;
        } else if (error.status >= 500) {
            errorInfo.type = 'server';
            errorInfo.severity = 'high';
            errorInfo.retryable = true;
        } else if (error.status >= 400 && error.status < 500) {
            errorInfo.type = 'client';
            errorInfo.severity = 'medium';
            errorInfo.retryable = false;
        } else if (error.message.includes('timeout')) {
            errorInfo.type = 'timeout';
            errorInfo.severity = 'medium';
            errorInfo.retryable = true;
        } else if (error.message.includes('AbortError')) {
            errorInfo.type = 'cancelled';
            errorInfo.severity = 'low';
            errorInfo.retryable = true;
            errorInfo.userFacing = false;
        }

        // Special handling for Instagram API specific errors
        if (context.url && context.url.includes('instagram')) {
            if (error.message.includes('Invalid access token')) {
                errorInfo.type = 'auth';
                errorInfo.retryable = false;
            } else if (error.message.includes('Rate limit exceeded')) {
                errorInfo.type = 'rate-limit';
                errorInfo.retryable = true;
            }
        }

        return errorInfo;
    }

    /**
     * Determine if an error should trigger a retry
     */
    shouldRetry(errorInfo) {
        const retryableTypes = ['network', 'timeout', 'server', 'rate-limit', 'cancelled'];
        return retryableTypes.includes(errorInfo.type) && errorInfo.retryable;
    }

    /**
     * Check if we can retry based on attempt count
     */
    canRetry(operationId) {
        if (!operationId) return false;
        const attempts = this.retryAttempts.get(operationId) || 0;
        return attempts < this.maxRetries;
    }

    /**
     * Check if retry attempts have been exceeded
     */
    hasExceededRetries(operationId) {
        if (!operationId) return false;
        const attempts = this.retryAttempts.get(operationId) || 0;
        return attempts >= this.maxRetries;
    }

    /**
     * Schedule a retry with exponential backoff
     */
    async scheduleRetry(operation, operationId, errorInfo) {
        if (!operation || !operationId) {
            throw new Error('Operation and operationId required for retry');
        }

        const attempts = this.retryAttempts.get(operationId) || 0;
        this.retryAttempts.set(operationId, attempts + 1);

        // Calculate delay with exponential backoff and jitter
        let delay = Math.min(
            this.baseDelay * Math.pow(2, attempts),
            this.maxDelay
        );

        // Add jitter to prevent thundering herd
        delay += Math.random() * 1000;

        // Special handling for rate limits
        if (errorInfo.type === 'rate-limit') {
            delay = Math.max(delay, 60000); // Minimum 1 minute for rate limits
        }

        console.log(`Retrying operation ${operationId} in ${delay}ms (attempt ${attempts + 1}/${this.maxRetries})`);

        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    const result = await operation();
                    // Clear retry count on success
                    this.retryAttempts.delete(operationId);
                    resolve(result);
                } catch (retryError) {
                    // Handle retry failure
                    resolve(await this.handleError(retryError, {
                        operation,
                        operationId,
                        url: errorInfo.context.url,
                        method: errorInfo.context.method
                    }));
                }
            }, delay);
        });
    }

    /**
     * Determine if fallback content should be shown
     */
    shouldShowFallback(errorInfo) {
        const fallbackTypes = ['network', 'server', 'timeout', 'rate-limit'];
        return fallbackTypes.includes(errorInfo.type);
    }

    /**
     * Get user-friendly error message
     */
    getUserMessage(errorInfo) {
        switch (errorInfo.type) {
            case 'network':
                return {
                    title: 'Connection Issue',
                    message: 'Unable to connect to Instagram. Please check your internet connection.',
                    suggestion: 'Try refreshing the page or check your network connection.'
                };
            case 'auth':
                return {
                    title: 'Authentication Error',
                    message: 'There was an issue accessing Instagram content.',
                    suggestion: 'This issue has been reported to our team. Please try again later.'
                };
            case 'rate-limit':
                return {
                    title: 'Rate Limit Exceeded',
                    message: 'Too many requests to Instagram. Please wait a moment.',
                    suggestion: 'Instagram limits how often we can fetch content. Please try again in a few minutes.'
                };
            case 'server':
                return {
                    title: 'Server Error',
                    message: 'Instagram servers are experiencing issues.',
                    suggestion: 'This is a temporary issue. Please try again in a few minutes.'
                };
            case 'timeout':
                return {
                    title: 'Request Timeout',
                    message: 'The request to Instagram took too long.',
                    suggestion: 'This might be due to slow internet. Please try again.'
                };
            case 'client':
                return {
                    title: 'Request Error',
                    message: 'There was an issue with the request to Instagram.',
                    suggestion: 'Please refresh the page. If the problem persists, contact support.'
                };
            default:
                return {
                    title: 'Something Went Wrong',
                    message: 'An unexpected error occurred while loading Instagram content.',
                    suggestion: 'Please try refreshing the page. If the problem persists, contact support.'
                };
        }
    }

    /**
     * Log error without sensitive information
     */
    logError(errorInfo) {
        // Remove sensitive information before logging
        const sanitizedError = {
            ...errorInfo,
            context: {
                ...errorInfo.context,
                // Remove potentially sensitive URL parameters
                url: errorInfo.context.url ? this.sanitizeUrl(errorInfo.context.url) : undefined
            }
        };

        // Add to error log (keep only last 50 errors)
        this.errorLog.push(sanitizedError);
        if (this.errorLog.length > 50) {
            this.errorLog.shift();
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Instagram Error:', sanitizedError);
        }

        // Send to error reporting service in production
        if (process.env.NODE_ENV === 'production' && errorInfo.severity === 'high') {
            this.reportError(sanitizedError);
        }
    }

    /**
     * Remove sensitive information from URLs
     */
    sanitizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // Remove access tokens and other sensitive parameters
            urlObj.searchParams.delete('access_token');
            urlObj.searchParams.delete('token');
            urlObj.searchParams.delete('key');
            urlObj.searchParams.delete('secret');
            return urlObj.toString();
        } catch {
            return '[invalid-url]';
        }
    }

    /**
     * Report error to external service
     */
    async reportError(errorInfo) {
        try {
            // Example: Send to error reporting service
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'exception', {
                    description: `Instagram ${errorInfo.type}: ${errorInfo.message}`,
                    fatal: errorInfo.severity === 'high',
                    error_id: errorInfo.id
                });
            }

            // Could also send to custom error endpoint
            // await fetch('/api/errors', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(errorInfo)
            // });
        } catch (reportingError) {
            console.warn('Failed to report error:', reportingError);
        }
    }

    /**
     * Add error event listener
     */
    onError(callback) {
        const id = Date.now().toString();
        this.errorCallbacks.set(id, callback);
        return () => this.errorCallbacks.delete(id);
    }

    /**
     * Emit error event to listeners
     */
    emitError(errorInfo) {
        this.errorCallbacks.forEach(callback => {
            try {
                callback(errorInfo);
            } catch (error) {
                console.warn('Error in error callback:', error);
            }
        });
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        const stats = {
            total: this.errorLog.length,
            byType: {},
            bySeverity: {},
            recent: this.errorLog.slice(-10)
        };

        this.errorLog.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
        });

        return stats;
    }

    /**
     * Clear error history and retry attempts
     */
    reset() {
        this.errorLog.length = 0;
        this.retryAttempts.clear();
    }

    /**
     * Create a wrapped version of a function with error handling
     */
    withErrorHandling(fn, context = {}) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                return await this.handleError(error, context);
            }
        };
    }

    /**
     * Create operation context for consistent error handling
     */
    createContext(operation, url, method = 'GET') {
        return {
            operation,
            operationId: `${operation}-${Date.now()}`,
            url,
            method
        };
    }
}

// Create singleton instance
const instagramErrorHandler = new InstagramErrorHandler();

export default instagramErrorHandler;