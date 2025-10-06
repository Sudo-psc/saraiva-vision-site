/**
 * Ninsaúde Rate Limiter Middleware
 * Implements distributed rate limiting using Redis: 30 requests/minute per IP
 * Requirements: T032, LGPD compliance, CFM guidelines
 */

import crypto from 'crypto';

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
    windowMs: 60 * 1000, // 1 minute in milliseconds
    maxRequests: 30, // 30 requests per minute
    redisKeyPrefix: 'ninsaude:ratelimit',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    headers: {
        limit: 'X-RateLimit-Limit',
        remaining: 'X-RateLimit-Remaining',
        reset: 'X-RateLimit-Reset',
        retryAfter: 'Retry-After'
    }
};

/**
 * Extract client IP address from request
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const cfConnectingIP = req.headers['cf-connecting-ip'];
    const vercelForwardedFor = req.headers['x-vercel-forwarded-for'];

    if (vercelForwardedFor) {
        return vercelForwardedFor.split(',')[0].trim();
    }

    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    if (realIP) {
        return realIP;
    }

    return req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.connection?.socket?.remoteAddress ||
        'unknown';
}

/**
 * Hash IP address for privacy compliance (LGPD)
 * @param {string} ip - Client IP address
 * @returns {string} SHA-256 hashed IP
 */
function hashIP(ip) {
    const salt = process.env.IP_HASH_SALT;
    if (!salt) {
        throw new Error('Missing required environment variable: IP_HASH_SALT. This must be set for secure IP hashing.');
    }
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

/**
 * Get rate limit key for Redis
 * @param {string} ip - Client IP address
 * @returns {string} Redis key
 */
function getRateLimitKey(ip) {
    const hashedIP = hashIP(ip);
    return `${RATE_LIMIT_CONFIG.redisKeyPrefix}:${hashedIP}`;
}

/**
 * Get current request count and TTL from Redis
 * @param {Object} redisClient - Redis client instance
 * @param {string} key - Redis key
 * @returns {Promise<Object>} Request count and TTL data
 */
async function getCurrentCount(redisClient, key) {
    try {
        const [count, ttl] = await Promise.all([
            redisClient.get(key),
            redisClient.ttl(key)
        ]);

        return {
            current: parseInt(count) || 0,
            ttl: ttl > 0 ? ttl : RATE_LIMIT_CONFIG.windowMs / 1000
        };
    } catch (error) {
        console.error('Redis rate limit retrieval error:', error);
        // Fail open: allow request if Redis fails
        return {
            current: 0,
            ttl: RATE_LIMIT_CONFIG.windowMs / 1000
        };
    }
}

/**
 * Increment request count in Redis
 * @param {Object} redisClient - Redis client instance
 * @param {string} key - Redis key
 * @returns {Promise<number>} New request count
 */
async function incrementCount(redisClient, key) {
    try {
        const newCount = await redisClient.incr(key);

        // Set TTL on first request in window
        if (newCount === 1) {
            await redisClient.expire(key, RATE_LIMIT_CONFIG.windowMs / 1000);
        }

        return newCount;
    } catch (error) {
        console.error('Redis rate limit increment error:', error);
        // Fail open: assume count is 0 if Redis fails
        return 0;
    }
}

/**
 * Calculate reset timestamp
 * @param {number} ttl - Time to live in seconds
 * @returns {number} Unix timestamp when limit resets
 */
function calculateResetTime(ttl) {
    return Math.floor(Date.now() / 1000) + ttl;
}

/**
 * Set rate limit headers on response
 * @param {Object} res - Express response object
 * @param {Object} limitData - Rate limit data
 */
function setRateLimitHeaders(res, limitData) {
    res.setHeader(RATE_LIMIT_CONFIG.headers.limit, RATE_LIMIT_CONFIG.maxRequests);
    res.setHeader(RATE_LIMIT_CONFIG.headers.remaining, Math.max(0, RATE_LIMIT_CONFIG.maxRequests - limitData.current));
    res.setHeader(RATE_LIMIT_CONFIG.headers.reset, limitData.resetTime);

    if (limitData.exceeded) {
        res.setHeader(RATE_LIMIT_CONFIG.headers.retryAfter, limitData.ttl);
    }
}

/**
 * Ninsaúde rate limiter middleware
 * @param {Object} redisClient - Redis client instance (injected by app setup)
 * @param {Object} options - Optional configuration overrides
 * @returns {Function} Express middleware function
 */
export function rateLimiter(redisClient, options = {}) {
    const config = { ...RATE_LIMIT_CONFIG, ...options };

    return async (req, res, next) => {
        try {
            // Skip rate limiting for certain endpoints if configured
            if (options.skip && options.skip(req)) {
                return next();
            }

            // Get client IP and create rate limit key
            const clientIP = getClientIP(req);
            const rateLimitKey = getRateLimitKey(clientIP);

            // Get current count before incrementing
            const currentData = await getCurrentCount(redisClient, rateLimitKey);

            // Check if limit already exceeded
            if (currentData.current >= config.maxRequests) {
                const resetTime = calculateResetTime(currentData.ttl);

                setRateLimitHeaders(res, {
                    current: currentData.current,
                    exceeded: true,
                    ttl: currentData.ttl,
                    resetTime
                });

                return res.status(429).json({
                    success: false,
                    error: {
                        code: 'rate_limit_exceeded',
                        message: 'Muitas solicitações. Aguarde um momento antes de tentar novamente.',
                        category: 'rate_limit',
                        severity: 'medium',
                        recovery: `Aguarde ${currentData.ttl} segundos antes de tentar novamente.`,
                        retryable: true,
                        retryAfter: currentData.ttl,
                        timestamp: new Date().toISOString(),
                        requestId: req.security?.requestId || crypto.randomUUID()
                    }
                });
            }

            // Increment request count
            const newCount = await incrementCount(redisClient, rateLimitKey);
            const resetTime = calculateResetTime(currentData.ttl);

            // Set rate limit headers
            setRateLimitHeaders(res, {
                current: newCount,
                exceeded: false,
                ttl: currentData.ttl,
                resetTime
            });

            // Check if limit exceeded after increment
            if (newCount > config.maxRequests) {
                return res.status(429).json({
                    success: false,
                    error: {
                        code: 'rate_limit_exceeded',
                        message: 'Muitas solicitações. Aguarde um momento antes de tentar novamente.',
                        category: 'rate_limit',
                        severity: 'medium',
                        recovery: `Aguarde ${currentData.ttl} segundos antes de tentar novamente.`,
                        retryable: true,
                        retryAfter: currentData.ttl,
                        timestamp: new Date().toISOString(),
                        requestId: req.security?.requestId || crypto.randomUUID()
                    }
                });
            }

            next();
        } catch (error) {
            console.error('Rate limiter middleware error:', error);

            // Fail open: allow request on error but log it
            console.warn('Rate limiting failed, allowing request through');
            next();
        }
    };
}

/**
 * Helper function to manually reset rate limit for an IP
 * Useful for admin operations or testing
 * @param {Object} redisClient - Redis client instance
 * @param {string} ip - Client IP address to reset
 * @returns {Promise<boolean>} Success status
 */
export async function resetRateLimit(redisClient, ip) {
    try {
        const rateLimitKey = getRateLimitKey(ip);
        await redisClient.del(rateLimitKey);
        return true;
    } catch (error) {
        console.error('Rate limit reset error:', error);
        return false;
    }
}

/**
 * Get current rate limit status for an IP
 * @param {Object} redisClient - Redis client instance
 * @param {string} ip - Client IP address
 * @returns {Promise<Object>} Rate limit status
 */
export async function getRateLimitStatus(redisClient, ip) {
    try {
        const rateLimitKey = getRateLimitKey(ip);
        const currentData = await getCurrentCount(redisClient, rateLimitKey);
        const resetTime = calculateResetTime(currentData.ttl);

        return {
            current: currentData.current,
            limit: RATE_LIMIT_CONFIG.maxRequests,
            remaining: Math.max(0, RATE_LIMIT_CONFIG.maxRequests - currentData.current),
            resetTime,
            ttl: currentData.ttl
        };
    } catch (error) {
        console.error('Rate limit status error:', error);
        return null;
    }
}

export default rateLimiter;
