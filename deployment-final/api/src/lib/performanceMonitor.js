/**
 * Performance Monitoring System
 * Tracks response times, error rates, and system metrics
 */

import { createLogger } from './logger.js';

/**
 * Performance Metrics Collector
 */
class PerformanceMonitor {
    constructor() {
        this.logger = createLogger('performance');
        this.metrics = new Map();
        this.errorCounts = new Map();
        this.responseTimes = new Map();
        this.startTime = Date.now();
    }

    /**
     * Record API call performance
     */
    recordApiCall(endpoint, method, statusCode, responseTime, metadata = {}) {
        const key = `${method}:${endpoint}`;

        // Update response time metrics
        if (!this.responseTimes.has(key)) {
            this.responseTimes.set(key, []);
        }
        this.responseTimes.get(key).push(responseTime);

        // Update error counts
        if (statusCode >= 400) {
            const errorKey = `${key}:${statusCode}`;
            this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
        }

        // Log performance data
        this.logger.logPerformance(`API ${method} ${endpoint}`, responseTime, {
            ...metadata,
            status_code: statusCode,
            endpoint,
            method
        });
    }

    /**
     * Record database operation performance
     */
    recordDbOperation(operation, table, responseTime, success = true, metadata = {}) {
        const key = `db:${operation}:${table}`;

        if (!this.responseTimes.has(key)) {
            this.responseTimes.set(key, []);
        }
        this.responseTimes.get(key).push(responseTime);

        if (!success) {
            this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
        }

        this.logger.logPerformance(`DB ${operation} ${table}`, responseTime, {
            ...metadata,
            operation,
            table,
            success
        });
    }

    /**
     * Record external service call performance
     */
    recordExternalCall(service, operation, responseTime, success = true, metadata = {}) {
        const key = `external:${service}:${operation}`;

        if (!this.responseTimes.has(key)) {
            this.responseTimes.set(key, []);
        }
        this.responseTimes.get(key).push(responseTime);

        if (!success) {
            this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
        }

        this.logger.logPerformance(`External ${service} ${operation}`, responseTime, {
            ...metadata,
            service,
            operation,
            success
        });
    }

    /**
     * Calculate statistics for a metric
     */
    calculateStats(values) {
        if (!values || values.length === 0) {
            return { count: 0, avg: 0, min: 0, max: 0, p95: 0, p99: 0 };
        }

        const sorted = [...values].sort((a, b) => a - b);
        const count = sorted.length;
        const sum = sorted.reduce((a, b) => a + b, 0);

        return {
            count,
            avg: Math.round(sum / count),
            min: sorted[0],
            max: sorted[count - 1],
            p95: sorted[Math.floor(count * 0.95)] || 0,
            p99: sorted[Math.floor(count * 0.99)] || 0
        };
    }

    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const summary = {
            uptime_seconds: Math.floor((Date.now() - this.startTime) / 1000),
            endpoints: {},
            database: {},
            external_services: {},
            error_rates: {}
        };

        // Process response times and calculate stats
        for (const [key, values] of this.responseTimes.entries()) {
            const stats = this.calculateStats(values);

            if (key.startsWith('GET:') || key.startsWith('POST:') || key.startsWith('PUT:') || key.startsWith('DELETE:')) {
                summary.endpoints[key] = stats;
            } else if (key.startsWith('db:')) {
                summary.database[key] = stats;
            } else if (key.startsWith('external:')) {
                summary.external_services[key] = stats;
            }
        }

        // Calculate error rates
        for (const [key, errorCount] of this.errorCounts.entries()) {
            const baseKey = key.split(':').slice(0, -1).join(':');
            const totalCalls = this.responseTimes.get(baseKey)?.length || 0;

            if (totalCalls > 0) {
                summary.error_rates[key] = {
                    error_count: errorCount,
                    total_calls: totalCalls,
                    error_rate: Math.round((errorCount / totalCalls) * 100 * 100) / 100 // 2 decimal places
                };
            }
        }

        return summary;
    }

    /**
     * Reset metrics (useful for periodic reporting)
     */
    reset() {
        this.metrics.clear();
        this.errorCounts.clear();
        this.responseTimes.clear();
        this.startTime = Date.now();
    }

    /**
     * Check if error rates exceed thresholds
     */
    checkErrorThresholds() {
        const alerts = [];
        const summary = this.getPerformanceSummary();

        for (const [key, errorData] of Object.entries(summary.error_rates)) {
            if (errorData.error_rate > 10) { // 10% error rate threshold
                alerts.push({
                    type: 'high_error_rate',
                    endpoint: key,
                    error_rate: errorData.error_rate,
                    error_count: errorData.error_count,
                    total_calls: errorData.total_calls
                });
            }
        }

        return alerts;
    }

    /**
     * Check if response times exceed thresholds
     */
    checkPerformanceThresholds() {
        const alerts = [];
        const summary = this.getPerformanceSummary();

        // Check API endpoints
        for (const [endpoint, stats] of Object.entries(summary.endpoints)) {
            if (stats.p95 > 5000) { // 5 second P95 threshold
                alerts.push({
                    type: 'slow_response',
                    endpoint,
                    p95_ms: stats.p95,
                    avg_ms: stats.avg
                });
            }
        }

        // Check database operations
        for (const [operation, stats] of Object.entries(summary.database)) {
            if (stats.p95 > 2000) { // 2 second P95 threshold for DB
                alerts.push({
                    type: 'slow_database',
                    operation,
                    p95_ms: stats.p95,
                    avg_ms: stats.avg
                });
            }
        }

        return alerts;
    }

    /**
     * Generate performance report
     */
    async generateReport() {
        const summary = this.getPerformanceSummary();
        const errorAlerts = this.checkErrorThresholds();
        const performanceAlerts = this.checkPerformanceThresholds();

        const report = {
            timestamp: new Date().toISOString(),
            summary,
            alerts: [...errorAlerts, ...performanceAlerts],
            health_status: errorAlerts.length === 0 && performanceAlerts.length === 0 ? 'healthy' : 'degraded'
        };

        // Log the report
        await this.logger.info('Performance report generated', {
            report,
            operation_type: 'performance_report'
        });

        // Send alerts if any
        if (report.alerts.length > 0) {
            await this.logger.warn('Performance alerts detected', {
                alerts: report.alerts,
                operation_type: 'performance_alert'
            });
        }

        return report;
    }
}

/**
 * Global performance monitor instance
 */
const performanceMonitor = new PerformanceMonitor();

/**
 * Middleware to track API performance
 */
export function performanceTrackingMiddleware(req, res, next) {
    const startTime = Date.now();

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function (...args) {
        const responseTime = Date.now() - startTime;
        const endpoint = req.route?.path || req.path || req.url;

        performanceMonitor.recordApiCall(
            endpoint,
            req.method,
            res.statusCode,
            responseTime,
            {
                user_agent: req.get('User-Agent'),
                content_length: res.get('Content-Length') || 0
            }
        );

        originalEnd.apply(this, args);
    };

    next();
}

/**
 * Database operation wrapper with performance tracking
 */
export function trackDbOperation(operation, table) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args) {
            const startTime = Date.now();
            let success = true;
            let error = null;

            try {
                const result = await originalMethod.apply(this, args);
                return result;
            } catch (err) {
                success = false;
                error = err;
                throw err;
            } finally {
                const responseTime = Date.now() - startTime;
                performanceMonitor.recordDbOperation(operation, table, responseTime, success, {
                    error_message: error?.message
                });
            }
        };

        return descriptor;
    };
}

/**
 * External service call wrapper with performance tracking
 */
export function trackExternalCall(service, operation) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args) {
            const startTime = Date.now();
            let success = true;
            let error = null;

            try {
                const result = await originalMethod.apply(this, args);
                return result;
            } catch (err) {
                success = false;
                error = err;
                throw err;
            } finally {
                const responseTime = Date.now() - startTime;
                performanceMonitor.recordExternalCall(service, operation, responseTime, success, {
                    error_message: error?.message
                });
            }
        };

        return descriptor;
    };
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics() {
    return performanceMonitor.getPerformanceSummary();
}

/**
 * Generate performance report
 */
export function generatePerformanceReport() {
    return performanceMonitor.generateReport();
}

export { performanceMonitor };
export default PerformanceMonitor;