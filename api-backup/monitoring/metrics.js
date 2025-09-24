/**
 * Monitoring Metrics API
 * Provides system metrics, performance data, and health status
 */

import { createLogger } from '../../src/lib/logger.js';
import { getPerformanceMetrics, generatePerformanceReport } from '../../src/lib/performanceMonitor.js';
import { alertingSystem } from '../../src/lib/alertingSystem.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Get comprehensive system metrics
 */
export default async function handler(req, res) {
    const logger = createLogger('monitoring-api', req.headers['x-request-id']);

    try {
        if (req.method !== 'GET') {
            return res.status(405).json({
                success: false,
                error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET method allowed' }
            });
        }

        // Check authentication for sensitive metrics
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: { code: 'UNAUTHORIZED', message: 'Bearer token required' }
            });
        }

        const token = authHeader.substring(7);
        const expectedToken = process.env.MONITORING_API_TOKEN;

        if (!expectedToken || token !== expectedToken) {
            await logger.warn('Unauthorized monitoring access attempt', {
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
            });

            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token' }
            });
        }

        const startTime = Date.now();

        // Get query parameters
        const {
            include = 'all',
            hours = '24',
            format = 'json'
        } = req.query;

        const hoursNum = parseInt(hours, 10) || 24;
        const includeAll = include === 'all';

        // Collect metrics
        const metrics = {
            timestamp: new Date().toISOString(),
            system: {}
        };

        // Performance metrics
        if (includeAll || include.includes('performance')) {
            metrics.performance = getPerformanceMetrics();
        }

        // Delivery statistics
        if (includeAll || include.includes('delivery')) {
            metrics.delivery = await alertingSystem.getDeliveryStats(hoursNum);
        }

        // Recent alerts
        if (includeAll || include.includes('alerts')) {
            metrics.alerts = await alertingSystem.getRecentAlerts(hoursNum);
        }

        // Database health
        if (includeAll || include.includes('database')) {
            metrics.database = await getDatabaseHealth();
        }

        // Message queue status
        if (includeAll || include.includes('queue')) {
            metrics.queue = await getQueueStatus();
        }

        // System health summary
        if (includeAll || include.includes('health')) {
            metrics.health = await getSystemHealth(metrics);
        }

        // Error rates
        if (includeAll || include.includes('errors')) {
            metrics.errors = await getErrorRates(hoursNum);
        }

        const responseTime = Date.now() - startTime;

        await logger.info('Monitoring metrics retrieved', {
            response_time_ms: responseTime,
            metrics_included: include,
            hours_requested: hoursNum
        });

        // Set appropriate cache headers
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        return res.status(200).json({
            success: true,
            data: metrics,
            meta: {
                response_time_ms: responseTime,
                generated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        await logger.error('Failed to retrieve monitoring metrics', {
            error_message: error.message,
            error_stack: error.stack
        });

        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve metrics'
            }
        });
    }
}

/**
 * Get database health metrics
 */
async function getDatabaseHealth() {
    try {
        const startTime = Date.now();

        // Test database connectivity
        const { data, error } = await supabase
            .from('event_log')
            .select('count')
            .limit(1);

        const responseTime = Date.now() - startTime;

        if (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                response_time_ms: responseTime
            };
        }

        // Get table sizes and counts
        const tables = ['contact_messages', 'appointments', 'message_outbox', 'event_log', 'podcast_episodes'];
        const tableCounts = {};

        for (const table of tables) {
            try {
                const { count } = await supabase
                    .from(table)
                    .select('*', { count: 'exact', head: true });
                tableCounts[table] = count || 0;
            } catch (err) {
                tableCounts[table] = 'error';
            }
        }

        return {
            status: 'healthy',
            response_time_ms: responseTime,
            table_counts: tableCounts,
            connection_pool: 'active' // Supabase manages this
        };
    } catch (err) {
        return {
            status: 'unhealthy',
            error: err.message,
            response_time_ms: null
        };
    }
}

/**
 * Get message queue status
 */
async function getQueueStatus() {
    try {
        const { data: pendingMessages } = await supabase
            .from('message_outbox')
            .select('message_type, status, retry_count, created_at')
            .in('status', ['pending', 'failed']);

        const { data: recentMessages } = await supabase
            .from('message_outbox')
            .select('message_type, status, created_at')
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const queueStats = {
            pending: pendingMessages?.length || 0,
            pending_by_type: {},
            failed_retries: 0,
            recent_24h: recentMessages?.length || 0,
            recent_by_status: {}
        };

        // Count pending by type
        pendingMessages?.forEach(msg => {
            queueStats.pending_by_type[msg.message_type] =
                (queueStats.pending_by_type[msg.message_type] || 0) + 1;

            if (msg.status === 'failed' && msg.retry_count > 0) {
                queueStats.failed_retries++;
            }
        });

        // Count recent by status
        recentMessages?.forEach(msg => {
            queueStats.recent_by_status[msg.status] =
                (queueStats.recent_by_status[msg.status] || 0) + 1;
        });

        return queueStats;
    } catch (err) {
        return {
            error: err.message,
            pending: 0,
            recent_24h: 0
        };
    }
}

/**
 * Get system health summary
 */
async function getSystemHealth(metrics) {
    const health = {
        overall_status: 'healthy',
        components: {},
        issues: []
    };

    // Check database health
    if (metrics.database) {
        health.components.database = metrics.database.status;
        if (metrics.database.status !== 'healthy') {
            health.overall_status = 'degraded';
            health.issues.push('Database connectivity issues');
        }
    }

    // Check delivery rates
    if (metrics.delivery) {
        const emailFailureRate = metrics.delivery.email.failure_rate;
        const smsFailureRate = metrics.delivery.sms.failure_rate;

        health.components.email_delivery = emailFailureRate < 5 ? 'healthy' : 'degraded';
        health.components.sms_delivery = smsFailureRate < 5 ? 'healthy' : 'degraded';

        if (emailFailureRate >= 5) {
            health.overall_status = 'degraded';
            health.issues.push(`High email failure rate: ${emailFailureRate.toFixed(2)}%`);
        }

        if (smsFailureRate >= 5) {
            health.overall_status = 'degraded';
            health.issues.push(`High SMS failure rate: ${smsFailureRate.toFixed(2)}%`);
        }
    }

    // Check queue backlog
    if (metrics.queue) {
        health.components.message_queue = metrics.queue.pending < 100 ? 'healthy' : 'degraded';

        if (metrics.queue.pending >= 100) {
            health.overall_status = 'degraded';
            health.issues.push(`High queue backlog: ${metrics.queue.pending} messages`);
        }
    }

    // Check recent alerts
    if (metrics.alerts) {
        const criticalAlerts = metrics.alerts.filter(alert => alert.severity === 'critical');
        const highAlerts = metrics.alerts.filter(alert => alert.severity === 'high');

        if (criticalAlerts.length > 0) {
            health.overall_status = 'unhealthy';
            health.issues.push(`${criticalAlerts.length} critical alerts in last 24h`);
        } else if (highAlerts.length > 5) {
            health.overall_status = 'degraded';
            health.issues.push(`${highAlerts.length} high-severity alerts in last 24h`);
        }
    }

    return health;
}

/**
 * Get error rates by service
 */
async function getErrorRates(hours) {
    try {
        const { data: logs } = await supabase
            .from('event_log')
            .select('severity, event_data, created_at')
            .eq('event_type', 'application_log')
            .gte('created_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString());

        const errorStats = {
            total_logs: logs?.length || 0,
            by_severity: {},
            by_service: {},
            error_rate: 0
        };

        if (!logs || logs.length === 0) {
            return errorStats;
        }

        // Count by severity
        logs.forEach(log => {
            errorStats.by_severity[log.severity] =
                (errorStats.by_severity[log.severity] || 0) + 1;

            // Count by service
            const service = log.event_data?.service || 'unknown';
            if (!errorStats.by_service[service]) {
                errorStats.by_service[service] = { total: 0, errors: 0 };
            }
            errorStats.by_service[service].total++;

            if (log.severity === 'error' || log.severity === 'critical') {
                errorStats.by_service[service].errors++;
            }
        });

        // Calculate error rates by service
        Object.keys(errorStats.by_service).forEach(service => {
            const stats = errorStats.by_service[service];
            stats.error_rate = stats.total > 0 ? (stats.errors / stats.total) * 100 : 0;
        });

        // Overall error rate
        const totalErrors = (errorStats.by_severity.error || 0) + (errorStats.by_severity.critical || 0);
        errorStats.error_rate = errorStats.total_logs > 0 ? (totalErrors / errorStats.total_logs) * 100 : 0;

        return errorStats;
    } catch (err) {
        return {
            error: err.message,
            total_logs: 0,
            error_rate: 0
        };
    }
}