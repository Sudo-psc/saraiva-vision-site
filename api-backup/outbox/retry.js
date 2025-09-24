import { retryFailedMessages, getOutboxStats } from '../contact/outboxService.js';

/**
 * Outbox Retry API Endpoint
 * Manually retry failed messages that haven't exceeded max retries
 */

/**
 * Apply CORS headers for the API
 */
function applyCors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Verify admin authentication
 * @param {Request} req - Request object
 * @returns {boolean} Whether the request is authorized
 */
function verifyAdminAuth(req) {
    const authHeader = req.headers.authorization;
    const adminSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET || 'default-admin-secret';

    // Check for Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        return token === adminSecret;
    }

    // Allow localhost for development
    const host = req.headers.host;
    if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
        return true;
    }

    return false;
}

/**
 * Main handler for outbox retry endpoint
 */
export default async function handler(req, res) {
    const startTime = Date.now();

    try {
        // Apply CORS headers
        applyCors(res);

        // Handle preflight OPTIONS request
        if (req.method === 'OPTIONS') {
            return res.status(204).end();
        }

        // Only allow POST requests
        if (req.method !== 'POST') {
            res.setHeader('Allow', 'POST, OPTIONS');
            return res.status(405).json({
                success: false,
                error: {
                    code: 'METHOD_NOT_ALLOWED',
                    message: 'Only POST requests are allowed'
                }
            });
        }

        // Verify authentication
        if (!verifyAdminAuth(req)) {
            console.log('Unauthorized retry attempt:', {
                ip: req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
                userAgent: req.headers['user-agent'],
                host: req.headers.host
            });

            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Unauthorized access to retry endpoint'
                }
            });
        }

        console.log('Retrying failed messages...');

        // Get current stats before retry
        const statsBefore = await getOutboxStats();

        // Retry failed messages
        const result = await retryFailedMessages();

        // Get stats after retry
        const statsAfter = await getOutboxStats();

        const processingTime = Date.now() - startTime;

        if (result.success) {
            console.log(`Failed messages retry completed:`, {
                retriedCount: result.retriedCount,
                processingTime: `${processingTime}ms`
            });

            return res.status(200).json({
                success: true,
                message: 'Failed messages retry completed',
                data: {
                    retriedCount: result.retriedCount,
                    statsBefore: statsBefore.stats || {},
                    statsAfter: statsAfter.stats || {}
                },
                timestamp: new Date().toISOString(),
                processingTime: `${processingTime}ms`
            });
        } else {
            console.error('Failed messages retry failed:', result.error);

            return res.status(500).json({
                success: false,
                error: {
                    code: 'RETRY_FAILED',
                    message: result.error || 'Failed to retry messages'
                },
                timestamp: new Date().toISOString(),
                processingTime: `${processingTime}ms`
            });
        }

    } catch (error) {
        const processingTime = Date.now() - startTime;

        console.error('Outbox retry endpoint error:', {
            error: error.message,
            stack: error.stack,
            processingTime: `${processingTime}ms`
        });

        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred'
            },
            timestamp: new Date().toISOString(),
            processingTime: `${processingTime}ms`
        });
    }
}

/**
 * Configuration for Vercel
 */
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
    maxDuration: 30, // 30 seconds timeout
};