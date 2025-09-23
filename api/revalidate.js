// Next.js API route for ISR revalidation triggered by WordPress webhooks
import { invalidateCache } from '../src/lib/wordpress-api.js';
import { getRevalidationPaths } from '../src/lib/wordpress-isr.js';

// Revalidation secret from environment variables
const REVALIDATE_SECRET = process.env.WP_REVALIDATE_SECRET;

// Rate limiting for revalidation requests
const revalidationAttempts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 10; // Max 10 revalidation attempts per minute

const isRateLimited = (ip) => {
    const now = Date.now();
    const attempts = revalidationAttempts.get(ip) || [];

    // Clean old attempts
    const recentAttempts = attempts.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    revalidationAttempts.set(ip, recentAttempts);

    return recentAttempts.length >= MAX_ATTEMPTS;
};

const recordAttempt = (ip) => {
    const now = Date.now();
    const attempts = revalidationAttempts.get(ip) || [];
    attempts.push(now);
    revalidationAttempts.set(ip, attempts);
};

export default async function handler(req, res) {
    // Set CORS headers for WordPress webhook
    res.setHeader('Access-Control-Allow-Origin', process.env.WORDPRESS_DOMAIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST and GET methods
    if (!['POST', 'GET'].includes(req.method)) {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    try {
        // Get client IP for rate limiting
        const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

        // Check rate limiting
        if (isRateLimited(clientIP)) {
            return res.status(429).json({
                success: false,
                message: 'Too many revalidation requests. Please try again later.',
            });
        }

        // Verify revalidation secret
        const { secret, path, contentType, slug } = req.method === 'POST' ? req.body : req.query;

        if (!secret || secret !== REVALIDATE_SECRET) {
            recordAttempt(clientIP);
            return res.status(401).json({
                success: false,
                message: 'Invalid revalidation secret'
            });
        }

        // Record successful attempt for rate limiting
        recordAttempt(clientIP);

        const startTime = Date.now();
        const revalidatedPaths = [];
        const errors = [];

        try {
            if (path) {
                // Revalidate specific path
                await res.revalidate(path);
                revalidatedPaths.push(path);
            } else if (contentType) {
                // Revalidate based on content type and slug
                const paths = getRevalidationPaths(contentType, slug);

                for (const pathToRevalidate of paths) {
                    try {
                        await res.revalidate(pathToRevalidate);
                        revalidatedPaths.push(pathToRevalidate);
                    } catch (error) {
                        console.error(`Failed to revalidate path ${pathToRevalidate}:`, error);
                        errors.push({
                            path: pathToRevalidate,
                            error: error.message,
                        });
                    }
                }
            } else {
                // Default: revalidate homepage
                await res.revalidate('/');
                revalidatedPaths.push('/');
            }

            // Clear WordPress API cache for affected content
            if (contentType) {
                invalidateCache(contentType);
            } else if (path) {
                // Clear all cache if specific path revalidation
                invalidateCache();
            }

            const duration = Date.now() - startTime;

            console.log(`Revalidation completed in ${duration}ms:`, {
                paths: revalidatedPaths,
                contentType,
                slug,
                errors: errors.length > 0 ? errors : undefined,
            });

            return res.status(200).json({
                success: true,
                message: 'Revalidation completed successfully',
                revalidatedPaths,
                duration,
                errors: errors.length > 0 ? errors : undefined,
                timestamp: new Date().toISOString(),
            });

        } catch (error) {
            console.error('Revalidation error:', error);

            return res.status(500).json({
                success: false,
                message: 'Failed to revalidate',
                error: error.message,
                timestamp: new Date().toISOString(),
            });
        }

    } catch (error) {
        console.error('Revalidation handler error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
            timestamp: new Date().toISOString(),
        });
    }
}