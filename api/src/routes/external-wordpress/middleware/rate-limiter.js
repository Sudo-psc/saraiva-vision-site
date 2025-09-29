// Rate Limiting Middleware for External WordPress Integration
// Implements Redis-based rate limiting with flexible strategies

import { createErrorResponse } from '../utils/error-handler.js';
import { logger } from '../utils/logger.js';
import { Redis } from 'ioredis';

// Redis client for rate limiting
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      enableReadyCheck: false,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    })
  : null;

// Fallback to in-memory storage if Redis is unavailable
const memoryStore = new Map();

/**
 * Create rate limiter configuration
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware function
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100, // 100 requests per window
    keyGenerator = (req) => req.ip,
    skip = () => false,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    headers = true,
    strategy = 'sliding-window' // sliding-window, fixed-window, token-bucket
  } = options;

  return async (req, res, next) => {
    try {
      // Skip rate limiting if conditions are met
      if (skip(req)) {
        logger.debug('Rate limiting skipped', { ip: req.ip, path: req.path });
        return next();
      }

      const key = keyGenerator(req);
      const currentTime = Date.now();
      const windowStart = currentTime - windowMs;

      if (!key) {
        logger.warn('No rate limiting key generated', { ip: req.ip, path: req.path });
        return next();
      }

      let requestCount;
      let resetTime;

      switch (strategy) {
        case 'sliding-window':
          ({ requestCount, resetTime } = await slidingWindowStrategy(key, currentTime, windowMs));
          break;
        case 'fixed-window':
          ({ requestCount, resetTime } = await fixedWindowStrategy(key, currentTime, windowMs));
          break;
        case 'token-bucket':
          ({ requestCount, resetTime } = await tokenBucketStrategy(key, currentTime, windowMs, max));
          break;
        default:
          ({ requestCount, resetTime } = await slidingWindowStrategy(key, currentTime, windowMs));
      }

      // Check if rate limit is exceeded
      if (requestCount > max) {
        logger.warn('Rate limit exceeded', {
          key,
          requestCount,
          max,
          windowMs,
          path: req.path,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });

        if (headers) {
          res.set({
            'X-RateLimit-Limit': max,
            'X-RateLimit-Remaining': 0,
            'X-RateLimit-Reset': Math.ceil(resetTime / 1000)
          });
        }

        return res.status(statusCode).json(createErrorResponse(
          'RATE_LIMIT_ERROR',
          message,
          {
            limit: max,
            window: windowMs / 1000,
            resetIn: Math.ceil((resetTime - currentTime) / 1000),
            strategy,
            timestamp: new Date().toISOString()
          }
        ));
      }

      // Update rate limit headers
      if (headers) {
        const remaining = Math.max(0, max - requestCount);
        res.set({
          'X-RateLimit-Limit': max,
          'X-RateLimit-Remaining': remaining,
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000)
        });
      }

      // Update request count for successful/failed requests if not skipped
      const incrementCount = () => {
        if (res.statusCode < 400 && !skipSuccessfulRequests) {
          return incrementRequestCount(key, currentTime, strategy, max, windowMs);
        } else if (res.statusCode >= 400 && !skipFailedRequests) {
          return incrementRequestCount(key, currentTime, strategy, max, windowMs);
        }
      };

      // Listen for response finish to update counters
      res.on('finish', incrementCount);

      logger.debug('Rate limiting check passed', {
        key,
        requestCount: requestCount + 1,
        max,
        remaining: max - requestCount - 1,
        path: req.path,
        method: req.method
      });

      next();
    } catch (error) {
      logger.error('Rate limiting middleware error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      // Fail open if Redis is unavailable
      next();
    }
  };
};

/**
 * Sliding window rate limiting strategy
 * More accurate but requires more Redis operations
 */
const slidingWindowStrategy = async (key, currentTime, windowMs) => {
  const windowStart = currentTime - windowMs;

  if (redis) {
    // Use Redis sorted set for sliding window
    const redisKey = `ratelimit:${key}`;

    // Remove old entries
    await redis.zremrangebyscore(redisKey, 0, windowStart);

    // Set expiration to prevent memory leaks
    await redis.expire(redisKey, Math.ceil(windowMs / 1000) + 1);

    // Get count of requests in current window
    const requestCount = await redis.zcount(redisKey, windowStart, currentTime);

    // Get reset time (when oldest request will expire)
    const oldestRequest = await redis.zrange(redisKey, 0, 0, 'WITHSCORES');
    const resetTime = oldestRequest.length > 0 ? parseFloat(oldestRequest[0][1]) + windowMs : currentTime + windowMs;

    return { requestCount, resetTime };
  } else {
    // Fallback to in-memory sliding window
    const memoryKey = `ratelimit:${key}`;
    const requests = memoryStore.get(memoryKey) || [];

    // Filter out old requests
    const validRequests = requests.filter(time => time > windowStart);

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      cleanupMemoryStore();
    }

    const requestCount = validRequests.length;
    const resetTime = validRequests[0] + windowMs;

    return { requestCount, resetTime };
  }
};

/**
 * Fixed window rate limiting strategy
 * Less accurate but more efficient
 */
const fixedWindowStrategy = async (key, currentTime, windowMs) => {
  const windowId = Math.floor(currentTime / windowMs);
  const redisKey = `ratelimit:${key}:${windowId}`;
  const resetTime = (windowId + 1) * windowMs;

  if (redis) {
    // Use Redis with expiration for fixed window
    const currentCount = await redis.get(redisKey);
    const requestCount = currentCount ? parseInt(currentCount) : 0;

    return { requestCount, resetTime };
  } else {
    // Fallback to in-memory fixed window
    const memoryKey = `ratelimit:${key}:${windowId}`;
    const requestCount = memoryStore.get(memoryKey) || 0;

    return { requestCount, resetTime };
  }
};

/**
 * Token bucket rate limiting strategy
 * Good for burst traffic control
 */
const tokenBucketStrategy = async (key, currentTime, windowMs, maxTokens) => {
  const redisKey = `tokenbucket:${key}`;
  const refillRate = maxTokens / windowMs; // tokens per millisecond

  if (redis) {
    // Use Redis hash for token bucket
    const pipeline = redis.pipeline();

    // Get current tokens and last refill time
    pipeline.hget(redisKey, 'tokens');
    pipeline.hget(redisKey, 'lastRefill');

    const [tokens, lastRefillStr] = await pipeline.exec();
    const lastRefill = lastRefillStr ? parseFloat(lastRefillStr) : currentTime;

    // Calculate tokens to add
    const timePassed = currentTime - lastRefill;
    const tokensToAdd = Math.floor(timePassed * refillRate);
    const currentTokens = Math.min(maxTokens, (tokens ? parseFloat(tokens) : maxTokens) + tokensToAdd);

    // Check if we can proceed
    if (currentTokens >= 1) {
      // Consume one token
      await redis.hset(redisKey, {
        tokens: currentTokens - 1,
        lastRefill: currentTime
      });

      // Set expiration
      await redis.expire(redisKey, Math.ceil(windowMs / 1000) + 1);

      const requestCount = maxTokens - Math.floor(currentTokens);
      const resetTime = currentTime + Math.ceil((1 - (currentTokens % 1)) / refillRate);

      return { requestCount, resetTime };
    } else {
      // No tokens available
      const resetTime = currentTime + Math.ceil((1 - currentTokens) / refillRate);
      const requestCount = maxTokens;

      return { requestCount, resetTime };
    }
  } else {
    // Fallback to simple fixed window for token bucket
    return fixedWindowStrategy(key, currentTime, windowMs);
  }
};

/**
 * Increment request count for the given strategy
 */
const incrementSlidingWindow = async (key, currentTime, windowMs) => {
  if (redis) {
    const redisKey = `ratelimit:${key}`;
    await redis.zadd(redisKey, currentTime, currentTime);
    await redis.expire(redisKey, Math.ceil(windowMs / 1000) + 1);
  } else {
    const memoryKey = `ratelimit:${key}`;
    const requests = memoryStore.get(memoryKey) || [];
    requests.push(currentTime);
    memoryStore.set(memoryKey, requests);
  }
};

const incrementFixedWindow = async (key, currentTime, windowMs) => {
  const windowId = Math.floor(currentTime / windowMs);
  if (redis) {
    const redisKey = `ratelimit:${key}:${windowId}`;
    await redis.incr(redisKey);
    await redis.expire(redisKey, Math.ceil(windowMs / 1000) + 1);
  } else {
    const memoryKey = `ratelimit:${key}:${windowId}`;
    const requestCount = (memoryStore.get(memoryKey) || 0) + 1;
    memoryStore.set(memoryKey, requestCount);
  }
};

const incrementRequestCount = async (key, currentTime, strategy, maxTokens, windowMs) => {
  if (strategy === 'token-bucket') {
    // Token bucket doesn't need increment on response (consumed on request)
    return;
  }

  // For sliding and fixed window, increment happens on response based on skip flags
  if (strategy === 'sliding-window') {
    await incrementSlidingWindow(key, currentTime, windowMs);
  } else if (strategy === 'fixed-window') {
    await incrementFixedWindow(key, currentTime, windowMs);
  }
};

/**
 * Clean up expired entries in memory store
 */
const cleanupMemoryStore = () => {
  const now = Date.now();
  for (const [key, requests] of memoryStore.entries()) {
    if (requests.length > 0 && requests[0] < now - (24 * 60 * 60 * 1000)) { // 24 hours
      memoryStore.delete(key);
    }
  }
};

/**
 * Validate rate limit configuration
 * @param {Object} config - Rate limit configuration
 * @returns {Object} Validated configuration
 */
const validateRateLimitConfig = (config) => {
  const {
    windowMs,
    max,
    strategy,
    keyGenerator
  } = config;

  // Validate required fields
  if (!windowMs || windowMs <= 0) {
    throw new Error('windowMs must be a positive number');
  }

  if (!max || max <= 0) {
    throw new Error('max must be a positive number');
  }

  // Validate strategy
  const validStrategies = ['sliding-window', 'fixed-window', 'token-bucket'];
  if (strategy && !validStrategies.includes(strategy)) {
    throw new Error(`Invalid strategy: ${strategy}. Must be one of: ${validStrategies.join(', ')}`);
  }

  // Validate key generator
  if (keyGenerator && typeof keyGenerator !== 'function') {
    throw new Error('keyGenerator must be a function');
  }

  return {
    windowMs: Math.max(1000, windowMs), // Minimum 1 second
    max: Math.max(1, max),
    strategy: strategy || 'sliding-window',
    keyGenerator: keyGenerator || ((req) => req.ip)
  };
};

/**
 * Create source-specific rate limiter
 * @param {string} sourceId - WordPress source ID
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware
 */
export const createSourceRateLimiter = (sourceId, options = {}) => {
  return createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute per source
    keyGenerator: (req) => `${sourceId}:${req.ip}`,
    message: 'Too many requests for this WordPress source',
    ...options
  });
};

/**
 * Create admin rate limiter (more restrictive)
 * @param {Object} options - Rate limit options
 * @returns {Function} Express middleware
 */
export const createAdminRateLimiter = (options = {}) => {
  return createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 50 requests per 15 minutes for admin operations
    keyGenerator: (req) => `admin:${req.user?.id || req.ip}`,
    message: 'Too many admin requests, please try again later',
    ...options
  });
};

// Pre-configured rate limiters for different use cases
export const globalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests from this IP'
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes for API
  keyGenerator: (req) => `api:${req.ip}`,
  message: 'API rate limit exceeded'
});

export const contentRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 content requests per 5 minutes
  keyGenerator: (req) => `content:${req.ip}`,
  message: 'Content retrieval rate limit exceeded'
});

export default {
  createRateLimiter,
  createSourceRateLimiter,
  createAdminRateLimiter,
  validateRateLimitConfig,
  globalRateLimiter,
  apiRateLimiter,
  contentRateLimiter
};