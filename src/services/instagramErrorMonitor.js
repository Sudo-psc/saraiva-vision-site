/**
 * Instagram Error Monitor Service
 * Advanced error monitoring, analytics, and reporting for Instagram components
 */

class InstagramErrorMonitor {
    constructor() {
        this.errorQueue = [];
        this.errorMetrics = {
            totalErrors: 0,
            errorsByType: {},
            errorsBySeverity: {},
            errorsByComponent: {},
            errorsByTimeframe: {},
            averageResolutionTime: 0,
            retrySuccessRate: 0
        };

        this.performanceMetrics = {
            apiResponseTimes: [],
            componentRenderTimes: [],
            errorRecoveryTimes: [],
            cacheHitRates: []
        };

        this.alertThresholds = {
            errorRate: 0.1, // 10% error rate threshold
            consecutiveErrors: 5,
            criticalErrorCount: 3,
            responseTimeThreshold: 5000 // 5 seconds
        };

        this.subscribers = new Map();
        this.isMonitoring = false;
        this.reportingInterval = null;
        this.batchSize = 10;
        this.reportingEndpoint = '/api/errors/instagram';
    }

    /**
     * Start monitoring Instagram errors
     */
    startMonitoring(options = {}) {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        this.alertThresholds = { ...this.alertThresholds, ...options.thresholds };
        this.reportingEndpoint = options.endpoint || this.reportingEndpoint;

        // Start periodic reporting
        if (options.enableReporting !== false) {
            this.startPeriodicReporting(options.reportingInterval || 300000); // 5 minutes
        }

        // Listen for page visibility changes
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        }

        // Listen for beforeunload to send final report
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        }

        console.log('Instagram Error Monitor started');
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;

        if (this.reportingInterval) {
            clearInterval(this.reportingInterval);
            this.reportingInterval = null;
        }

        // Send final report
        this.sendErrorReport(true);

        console.log('Instagram Error Monitor stopped');
    }

    /**
     * Record an error occurrence
     */
    recordError(errorInfo, context = {}) {
        if (!this.isMonitoring) return;

        const enrichedError = this.enrichErrorInfo(errorInfo, context);
        this.errorQueue.push(enrichedError);
        this.updateMetrics(enrichedError);

        // Check for alert conditions
        this.checkAlertConditions(enrichedError);

        // Notify subscribers
        this.notifySubscribers('error', enrichedError);

        // Send immediate report for critical errors
        if (enrichedError.severity === 'critical') {
            this.sendErrorReport(false, [enrichedError]);
        }
    }

    /**
     * Record performance metrics
     */
    recordPerformance(metricType, value, context = {}) {
        if (!this.isMonitoring) return;

        const performanceEntry = {
            type: metricType,
            value,
            timestamp: Date.now(),
            context
        };

        switch (metricType) {
            case 'apiResponse':
                this.performanceMetrics.apiResponseTimes.push(performanceEntry);
                break;
            case 'componentRender':
                this.performanceMetrics.componentRenderTimes.push(performanceEntry);
                break;
            case 'errorRecovery':
                this.performanceMetrics.errorRecoveryTimes.push(performanceEntry);
                break;
            case 'cacheHit':
                this.performanceMetrics.cacheHitRates.push(performanceEntry);
                break;
        }

        // Keep only recent metrics (last 100 entries)
        Object.keys(this.performanceMetrics).forEach(key => {
            if (this.performanceMetrics[key].length > 100) {
                this.performanceMetrics[key] = this.performanceMetrics[key].slice(-100);
            }
        });

        // Check performance thresholds
        if (metricType === 'apiResponse' && value > this.alertThresholds.responseTimeThreshold) {
            this.triggerAlert('performance', {
                type: 'slow_api_response',
                value,
                threshold: this.alertThresholds.responseTimeThreshold,
                context
            });
        }
    }

    /**
     * Record error recovery success
     */
    recordRecovery(errorId, recoveryMethod, timeTaken) {
        if (!this.isMonitoring) return;

        const recoveryInfo = {
            errorId,
            method: recoveryMethod,
            timeTaken,
            timestamp: Date.now()
        };

        this.recordPerformance('errorRecovery', timeTaken, recoveryInfo);
        this.updateRetrySuccessRate();
        this.notifySubscribers('recovery', recoveryInfo);
    }

    /**
     * Enrich error information with additional context
     */
    enrichErrorInfo(errorInfo, context) {
        return {
            ...errorInfo,
            id: errorInfo.id || this.generateErrorId(),
            timestamp: errorInfo.timestamp || Date.now(),
            sessionId: this.getSessionId(),
            userId: context.userId || 'anonymous',
            component: context.component || 'unknown',
            userAgent: navigator.userAgent,
            url: window.location.href,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            connection: this.getConnectionInfo(),
            performance: this.getCurrentPerformanceSnapshot(),
            stackTrace: errorInfo.stack || new Error().stack,
            breadcrumbs: this.getBreadcrumbs(),
            tags: context.tags || []
        };
    }

    /**
     * Update error metrics
     */
    updateMetrics(errorInfo) {
        this.errorMetrics.totalErrors++;

        // Update by type
        const type = errorInfo.type || 'unknown';
        this.errorMetrics.errorsByType[type] = (this.errorMetrics.errorsByType[type] || 0) + 1;

        // Update by severity
        const severity = errorInfo.severity || 'medium';
        this.errorMetrics.errorsBySeverity[severity] = (this.errorMetrics.errorsBySeverity[severity] || 0) + 1;

        // Update by component
        const component = errorInfo.component || 'unknown';
        this.errorMetrics.errorsByComponent[component] = (this.errorMetrics.errorsByComponent[component] || 0) + 1;

        // Update by timeframe (hourly buckets)
        const hour = new Date().getHours();
        this.errorMetrics.errorsByTimeframe[hour] = (this.errorMetrics.errorsByTimeframe[hour] || 0) + 1;
    }

    /**
     * Check for alert conditions
     */
    checkAlertConditions(errorInfo) {
        // Check error rate
        const recentErrors = this.getRecentErrors(300000); // Last 5 minutes
        const errorRate = recentErrors.length / 100; // Assuming 100 operations per 5 minutes baseline

        if (errorRate > this.alertThresholds.errorRate) {
            this.triggerAlert('error_rate', {
                rate: errorRate,
                threshold: this.alertThresholds.errorRate,
                recentErrors: recentErrors.length
            });
        }

        // Check consecutive errors
        const lastErrors = this.errorQueue.slice(-this.alertThresholds.consecutiveErrors);
        if (lastErrors.length === this.alertThresholds.consecutiveErrors) {
            const timeSpan = lastErrors[lastErrors.length - 1].timestamp - lastErrors[0].timestamp;
            if (timeSpan < 60000) { // Within 1 minute
                this.triggerAlert('consecutive_errors', {
                    count: this.alertThresholds.consecutiveErrors,
                    timeSpan
                });
            }
        }

        // Check critical error count
        const criticalErrors = this.getRecentErrors(3600000).filter(e => e.severity === 'critical');
        if (criticalErrors.length >= this.alertThresholds.criticalErrorCount) {
            this.triggerAlert('critical_errors', {
                count: criticalErrors.length,
                threshold: this.alertThresholds.criticalErrorCount
            });
        }
    }

    /**
     * Trigger an alert
     */
    triggerAlert(alertType, alertData) {
        const alert = {
            type: alertType,
            data: alertData,
            timestamp: Date.now(),
            id: this.generateAlertId()
        };

        console.warn('Instagram Error Monitor Alert:', alert);

        // Send to external alerting systems
        this.sendAlert(alert);

        // Notify subscribers
        this.notifySubscribers('alert', alert);
    }

    /**
     * Get recent errors within timeframe
     */
    getRecentErrors(timeframeMs) {
        const cutoff = Date.now() - timeframeMs;
        return this.errorQueue.filter(error => error.timestamp > cutoff);
    }

    /**
     * Update retry success rate
     */
    updateRetrySuccessRate() {
        const recentRecoveries = this.performanceMetrics.errorRecoveryTimes.filter(
            entry => Date.now() - entry.timestamp < 3600000 // Last hour
        );

        const recentErrors = this.getRecentErrors(3600000);

        if (recentErrors.length > 0) {
            this.errorMetrics.retrySuccessRate = recentRecoveries.length / recentErrors.length;
        }
    }

    /**
     * Get current performance snapshot
     */
    getCurrentPerformanceSnapshot() {
        return {
            memory: this.getMemoryUsage(),
            timing: this.getPerformanceTiming(),
            resources: this.getResourceTiming()
        };
    }

    /**
     * Get memory usage information
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }

    /**
     * Get performance timing information
     */
    getPerformanceTiming() {
        if (performance.timing) {
            const timing = performance.timing;
            return {
                navigationStart: timing.navigationStart,
                loadEventEnd: timing.loadEventEnd,
                domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
                responseEnd: timing.responseEnd
            };
        }
        return null;
    }

    /**
     * Get resource timing information
     */
    getResourceTiming() {
        if (performance.getEntriesByType) {
            return performance.getEntriesByType('resource')
                .filter(entry => entry.name.includes('instagram'))
                .map(entry => ({
                    name: entry.name,
                    duration: entry.duration,
                    transferSize: entry.transferSize,
                    responseEnd: entry.responseEnd
                }));
        }
        return [];
    }

    /**
     * Get connection information
     */
    getConnectionInfo() {
        if (navigator.connection) {
            return {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            };
        }
        return null;
    }

    /**
     * Get breadcrumbs (simplified implementation)
     */
    getBreadcrumbs() {
        // This would typically track user actions leading up to the error
        return [
            {
                timestamp: Date.now(),
                category: 'navigation',
                message: `Current page: ${window.location.pathname}`
            }
        ];
    }

    /**
     * Start periodic error reporting
     */
    startPeriodicReporting(interval) {
        this.reportingInterval = setInterval(() => {
            this.sendErrorReport();
        }, interval);
    }

    /**
     * Send error report to backend
     */
    async sendErrorReport(isFinal = false, specificErrors = null) {
        const errorsToSend = specificErrors || this.errorQueue.splice(0, this.batchSize);

        if (errorsToSend.length === 0 && !isFinal) return;

        const report = {
            errors: errorsToSend,
            metrics: this.errorMetrics,
            performance: this.getPerformanceSummary(),
            session: {
                id: this.getSessionId(),
                duration: Date.now() - this.sessionStartTime,
                isFinal
            },
            timestamp: Date.now()
        };

        try {
            // Use sendBeacon for final reports to ensure delivery
            if (isFinal && navigator.sendBeacon) {
                navigator.sendBeacon(
                    this.reportingEndpoint,
                    JSON.stringify(report)
                );
            } else {
                await fetch(this.reportingEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(report)
                });
            }

            console.log('Error report sent successfully', { errorCount: errorsToSend.length });
        } catch (error) {
            console.warn('Failed to send error report:', error);
            // Put errors back in queue if not final report
            if (!isFinal) {
                this.errorQueue.unshift(...errorsToSend);
            }
        }
    }

    /**
     * Send alert to external systems
     */
    async sendAlert(alert) {
        try {
            // Send to monitoring services (e.g., Sentry, DataDog, etc.)
            if (window.gtag) {
                window.gtag('event', 'instagram_alert', {
                    alert_type: alert.type,
                    alert_data: JSON.stringify(alert.data)
                });
            }

            // Send to custom alerting endpoint
            await fetch('/api/alerts/instagram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(alert)
            });
        } catch (error) {
            console.warn('Failed to send alert:', error);
        }
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        return {
            apiResponseTime: this.calculateAverage(this.performanceMetrics.apiResponseTimes),
            componentRenderTime: this.calculateAverage(this.performanceMetrics.componentRenderTimes),
            errorRecoveryTime: this.calculateAverage(this.performanceMetrics.errorRecoveryTimes),
            cacheHitRate: this.calculateCacheHitRate()
        };
    }

    /**
     * Calculate average from performance entries
     */
    calculateAverage(entries) {
        if (entries.length === 0) return 0;
        const sum = entries.reduce((acc, entry) => acc + entry.value, 0);
        return sum / entries.length;
    }

    /**
     * Calculate cache hit rate
     */
    calculateCacheHitRate() {
        const cacheEntries = this.performanceMetrics.cacheHitRates;
        if (cacheEntries.length === 0) return 0;

        const hits = cacheEntries.filter(entry => entry.value === true).length;
        return hits / cacheEntries.length;
    }

    /**
     * Subscribe to monitoring events
     */
    subscribe(eventType, callback) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, new Set());
        }
        this.subscribers.get(eventType).add(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(eventType);
            if (callbacks) {
                callbacks.delete(callback);
            }
        };
    }

    /**
     * Notify subscribers of events
     */
    notifySubscribers(eventType, data) {
        const callbacks = this.subscribers.get(eventType);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.warn('Error in monitor subscriber callback:', error);
                }
            });
        }
    }

    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            // Send report when page becomes hidden
            this.sendErrorReport(true);
        }
    }

    /**
     * Handle before unload
     */
    handleBeforeUnload() {
        this.sendErrorReport(true);
    }

    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return `ig-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate unique alert ID
     */
    generateAlertId() {
        return `ig-alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get or create session ID
     */
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = `ig-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            this.sessionStartTime = Date.now();
        }
        return this.sessionId;
    }

    /**
     * Get current error metrics
     */
    getMetrics() {
        return {
            ...this.errorMetrics,
            performance: this.getPerformanceSummary(),
            queueSize: this.errorQueue.length,
            isMonitoring: this.isMonitoring
        };
    }

    /**
     * Reset all metrics and queues
     */
    reset() {
        this.errorQueue = [];
        this.errorMetrics = {
            totalErrors: 0,
            errorsByType: {},
            errorsBySeverity: {},
            errorsByComponent: {},
            errorsByTimeframe: {},
            averageResolutionTime: 0,
            retrySuccessRate: 0
        };
        this.performanceMetrics = {
            apiResponseTimes: [],
            componentRenderTimes: [],
            errorRecoveryTimes: [],
            cacheHitRates: []
        };
    }

    /**
     * Export error data for analysis
     */
    exportData() {
        return {
            errors: this.errorQueue,
            metrics: this.errorMetrics,
            performance: this.performanceMetrics,
            session: {
                id: this.getSessionId(),
                startTime: this.sessionStartTime,
                duration: Date.now() - this.sessionStartTime
            }
        };
    }
}

// Create singleton instance
const instagramErrorMonitor = new InstagramErrorMonitor();

export default instagramErrorMonitor;