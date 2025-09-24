/**
 * Health Check API Endpoint
 * Provides basic system health status for monitoring tools
 */

import { createLogger } from '../../../../../../..../../../../src/lib/logger.js';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Basic health check endpoint
 */
export default async function handler(req, res) {
    const startTime = Date.now();
    const logger = createLogger('health-check', req.headers['x-request-id']);

    try {
        if (req.method !== 'GET') {
            return res.status(405).json({
                success: false,
                error: { code: 'METHOD_NOT_ALLOWED', message: 'Only GET method allowed' }
            });
        }

        const { detailed = 'false' } = req.query;
        const includeDetailed = detailed === 'true';

        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        };

        // Basic checks
        const checks = {
            api: { status: 'healthy', response_time_ms: 0 },
            database: { status: 'unknown', response_time_ms: 0 }
        };

        // Test database connectivity
        try {
            const dbStartTime = Date.now();
            const { error } = await supabase
                .from('event_log')
                .select('id')
                .limit(1);

            const dbResponseTime = Date.now() - dbStartTime;

            if (error) {
                checks.database = {
                    status: 'unhealthy',
                    error: error.message,
                    response_time_ms: dbResponseTime
                };
                health.status = 'degraded';
            } else {
                checks.database = {
                    status: 'healthy',
                    response_time_ms: dbResponseTime
                };
            }
        } catch (dbError) {
            checks.database = {
                status: 'unhealthy',
                error: dbError.message,
                response_time_ms: 0
            };
            health.status = 'unhealthy';
        }

        // Detailed checks if requested
        if (includeDetailed) {
            // Check external services
            checks.external_services = await checkExternalServices();

            // Check message queue
            checks.message_queue = await checkMessageQueue();

            // Update overall status based on detailed checks
            if (checks.external_services.resend?.status === 'unhealthy' ||
                checks.external_services.zenvia?.status === 'unhealthy') {
                health.status = 'degraded';
            }

            if (checks.message_queue.status === 'unhealthy') {
                health.status = 'degraded';
            }
        }

        const totalResponseTime = Date.now() - startTime;
        checks.api.response_time_ms = totalResponseTime;

        health.checks = checks;
        health.response_time_ms = totalResponseTime;

        // Log health check
        await logger.info('Health check performed', {
            status: health.status,
            response_time_ms: totalResponseTime,
            detailed: includeDetailed
        });

        // Set appropriate status code
        const statusCode = health.status === 'healthy' ? 200 :
            health.status === 'degraded' ? 200 : 503;

        // Set cache headers
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        return res.status(statusCode).json({
            success: health.status !== 'unhealthy',
            data: health
        });

    } catch (error) {
        const responseTime = Date.now() - startTime;

        await logger.error('Health check failed', {
            error_message: error.message,
            error_stack: error.stack,
            response_time_ms: responseTime
        });

        return res.status(503).json({
            success: false,
            data: {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                error: error.message,
                response_time_ms: responseTime
            }
        });
    }
}

/**
 * Check external services health
 */
async function checkExternalServices() {
    const services = {
        resend: { status: 'unknown', response_time_ms: 0 },
        zenvia: { status: 'unknown', response_time_ms: 0 }
    };

    // Check Resend API
    if (process.env.RESEND_API_KEY) {
        try {
            const startTime = Date.now();
            const response = await fetch('https://api.resend.com/domains', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const responseTime = Date.now() - startTime;

            services.resend = {
                status: response.ok ? 'healthy' : 'unhealthy',
                response_time_ms: responseTime,
                status_code: response.status
            };
        } catch (error) {
            services.resend = {
                status: 'unhealthy',
                error: error.message,
                response_time_ms: 0
            };
        }
    }

    // Check Zenvia API
    if (process.env.ZENVIA_API_TOKEN) {
        try {
            const startTime = Date.now();
            const response = await fetch('https://api.zenvia.com/v2/channels', {
                method: 'GET',
                headers: {
                    'X-API-TOKEN': process.env.ZENVIA_API_TOKEN,
                    'Content-Type': 'application/json'
                }
            });

            const responseTime = Date.now() - startTime;

            services.zenvia = {
                status: response.ok ? 'healthy' : 'unhealthy',
                response_time_ms: responseTime,
                status_code: response.status
            };
        } catch (error) {
            services.zenvia = {
                status: 'unhealthy',
                error: error.message,
                response_time_ms: 0
            };
        }
    }

    return services;
}

/**
 * Check message queue health
 */
async function checkMessageQueue() {
    try {
        const startTime = Date.now();

        // Count pending messages
        const { data: pendingMessages, error } = await supabase
            .from('message_outbox')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending');

        const responseTime = Date.now() - startTime;

        if (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                response_time_ms: responseTime
            };
        }

        const pendingCount = pendingMessages || 0;

        return {
            status: pendingCount < 1000 ? 'healthy' : 'degraded', // Alert if more than 1000 pending
            pending_messages: pendingCount,
            response_time_ms: responseTime
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message,
            response_time_ms: 0
        };
    }
}