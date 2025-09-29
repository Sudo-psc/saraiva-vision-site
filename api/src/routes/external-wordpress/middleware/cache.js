// Cache Middleware for External WordPress Integration
// Implements multi-layer caching strategy with Redis, database, and browser caching

import { createErrorResponse } from '../utils/error-handler.js';
import { logger } from '../utils/logger.js';
import { Redis } from 'ioredis';
import { createHash } from 'crypto';

// Redis client for caching
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      enableReadyCheck: false,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    })
  : null;

// Cache configuration
const DEFAULT_TTL = 300; // 5 minutes
const MAX_TTL = 86400; // 24 hours
const MIN_TTL = 60; // 1 minute

/**
 * Generate cache key from request
 * @param {Object} req - Express request object
 * @param {Object} options - Cache options
 * @returns {string} Cache key
 */
const generateCacheKey = (req, options = {}) => {
  const {
    includeQuery = true,
    includeHeaders = false,
    keyPrefix = '',
    customKeyGenerator = null
  } = options;

  // Use custom key generator if provided
  if (customKeyGenerator && typeof customKeyGenerator === 'function') {
    return customKeyGenerator(req);
  }

  // Build cache key components
  const components = [
    keyPrefix,
    req.method.toLowerCase(),
    req.path.replace(/\/$/, '') // Remove trailing slash
  ];

  // Include query parameters
  if (includeQuery && Object.keys(req.query).length > 0) {
    const sortedQuery = Object.keys(req.query)
      .sort()
      .map(key => `${key}=${req.query[key]}`)
      .join('&');
    components.push(sortedQuery);
  }

  // Include specific headers if requested
  if (includeHeaders) {
    const headers = [
      req.get('Accept'),
      req.get('Accept-Language'),
      req.get('Authorization')?.substring(0, 20) // Truncate for security
    ].filter(Boolean);
    components.push(headers.join('|'));
  }

  // Create hash for long keys
  const keyString = components.join(':');
  if (keyString.length > 250) {
    return createHash('sha256').update(keyString).digest('hex');
  }

  return keyString;
};

/**
 * Parse cache control headers
 * @param {Object} req - Express request object
 * @returns {Object} Cache control options
 */
const parseCacheControl = (req) => {
  const cacheControl = req.get('Cache-Control') || '';
  const options = {
    noCache: false,
    noStore: false,
    maxAge: null,
    mustRevalidate: false
  };

  cacheControl.split(',').forEach(directive => {
    const [key, value] = directive.trim().split('=');
    switch (key) {
      case 'no-cache':
        options.noCache = true;
        break;
      case 'no-store':
        options.noStore = true;
        break;
      case 'max-age':
        options.maxAge = parseInt(value, 10);
        break;
      case 'must-revalidate':
        options.mustRevalidate = true;
        break;
    }
  });

  return options;
};

/**
 * Get cached response from Redis
 * @param {string} key - Cache key
 * @returns {Promise<Object|null>} Cached response or null
 */
const getFromRedis = async (key) => {
  if (!redis) return null;

  try {
    const cached = await redis.get(`cache:${key}`);
    if (!cached) return null;

    const { data, timestamp, ttl, etag, contentType } = JSON.parse(cached);

    // Check if cache is expired
    const now = Date.now();
    if (now - timestamp > ttl * 1000) {
      await redis.del(`cache:${key}`);
      return null;
    }

    return {
      data,
      timestamp,
      etag,
      contentType,
      cached: true
    };
  } catch (error) {
    logger.error('Redis cache get error', { key, error: error.message });
    return null;
  }
};

/**
 * Store response in Redis cache
 * @param {string} key - Cache key
 * @param {Object} data - Response data
 * @param {number} ttl - Time to live in seconds
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<void>}
 */
const storeInRedis = async (key, data, ttl, metadata = {}) => {
  if (!redis) return;

  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
      ...metadata
    };

    await redis.setex(`cache:${key}`, ttl, JSON.stringify(cacheEntry));

    logger.debug('Data cached in Redis', { key, ttl, timestamp: Date.now() });
  } catch (error) {
    logger.error('Redis cache set error', { key, error: error.message });
  }
};

/**
 * Cache middleware factory
 * @param {Object} options - Cache options
 * @returns {Function} Express middleware
 */
export const cacheMiddleware = (options = {}) => {
  const {
    ttl = DEFAULT_TTL,
    keyPrefix = '',
    includeQuery = true,
    includeHeaders = false,
    customKeyGenerator = null,
    enabled = true,
    varyBy = [],
    staleWhileRevalidate = null,
    bypassCache = false
  } = options;

  // Validate TTL
  const validatedTtl = Math.max(MIN_TTL, Math.min(MAX_TTL, ttl));

  return async (req, res, next) => {
    try {
      // Skip caching if disabled or bypass requested
      if (!enabled || bypassCache) {
        return next();
      }

      // Skip caching for specific methods
      if (!['GET', 'HEAD'].includes(req.method)) {
        return next();
      }

      // Check cache control headers
      const cacheControl = parseCacheControl(req);
      if (cacheControl.noStore || cacheControl.noCache) {
        return next();
      }

      // Generate cache key
      const cacheKey = generateCacheKey(req, {
        includeQuery,
        includeHeaders,
        keyPrefix,
        customKeyGenerator
      });

      // Try to get from cache
      const cachedResponse = await getFromRedis(cacheKey);
      if (cachedResponse && !cacheControl.noCache) {
        logger.debug('Cache hit', { key: cacheKey, timestamp: cachedResponse.timestamp });

        // Set cache headers
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'ETag': cachedResponse.etag,
          'Content-Type': cachedResponse.contentType || 'application/json',
          'Cache-Control': `public, max-age=${validatedTtl}`,
          'X-Cache-Timestamp': new Date(cachedResponse.timestamp).toISOString()
        });

        // Check If-None-Match header
        const ifNoneMatch = req.get('If-None-Match');
        if (ifNoneMatch && ifNoneMatch === cachedResponse.etag) {
          return res.status(304).end();
        }

        return res.json(cachedResponse.data);
      }

      logger.debug('Cache miss', { key: cacheKey });

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        // Generate ETag
        const responseString = JSON.stringify(data);
        const etag = createHash('sha256').update(responseString).digest('hex');

        // Store in cache
        storeInRedis(cacheKey, data, validatedTtl, {
          etag,
          contentType: res.get('Content-Type') || 'application/json'
        }).catch(error => {
          logger.error('Failed to cache response', { key: cacheKey, error: error.message });
        });

        // Set cache headers
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey,
          'ETag': etag,
          'Cache-Control': `public, max-age=${validatedTtl}`,
          'X-Cache-Timestamp': new Date().toISOString()
        });

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      // Fail open if cache fails
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 * @param {Object} options - Invalidation options
 * @returns {Function} Express middleware
 */
export const cacheInvalidationMiddleware = (options = {}) => {
  const {
    keyPatterns = [],
    customInvalidator = null
  } = options;

  return async (req, res, next) => {
    try {
      // Store original end method
      const originalEnd = res.end;

      res.end = function(chunk, encoding) {
        // Invalidate cache based on response
        if (res.statusCode < 400) { // Only invalidate on successful responses
          if (customInvalidator && typeof customInvalidator === 'function') {
            Promise.resolve().then(() => customInvalidator(req, res)).catch(error => {
              logger.error('Custom cache invalidator error', { error: error.message });
            });
          } else {
            // Default invalidation patterns
            invalidateCachePatterns(req, keyPatterns).catch(error => {
              logger.error('Cache invalidation error', { error: error.message });
            });
          }
        }

        // Call original end method
        return originalEnd.call(this, chunk, encoding);
      };

      next();
    } catch (error) {
      logger.error('Cache invalidation middleware error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      next();
    }
  };
};

/**
 * Invalidate cache patterns
 * @param {Object} req - Express request object
 * @param {Array} patterns - Key patterns to invalidate
 * @returns {Promise<void>}
 */
const invalidateCachePatterns = async (req, patterns) => {
  if (!redis || patterns.length === 0) return;

  try {
    const keysToDelete = [];

    for (const pattern of patterns) {
      // Generate keys based on pattern
      if (typeof pattern === 'string') {
        // Check if pattern contains glob characters
        if (pattern.includes('*') || pattern.includes('?') || pattern.includes('[')) {
          // Use SCAN to find matching keys for wildcard patterns
          const matchingKeys = [];
          let cursor = 0;
          do {
            const scanResult = await redis.scan(cursor, 'MATCH', `cache:${pattern}`, 'COUNT', 100);
            cursor = scanResult[0];
            matchingKeys.push(...scanResult[1]);
          } while (cursor !== '0');

          keysToDelete.push(...matchingKeys);
        } else {
          // Exact key match
          keysToDelete.push(`cache:${pattern}`);
        }
      } else if (typeof pattern === 'function') {
        // Function-based pattern generation
        const generatedKeys = await pattern(req);
        keysToDelete.push(...generatedKeys.map(key => `cache:${key}`));
      }
    }

    // Delete keys from Redis
    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
      logger.debug('Cache invalidated', { keys: keysToDelete });
    }
  } catch (error) {
    logger.error('Cache pattern invalidation error', { error: error.message });
  }
};

/**
 * Cache utility functions
 */
export const cacheUtils = {
  /**
   * Generate cache key
   */
  generateKey: generateCacheKey,

  /**
   * Manually invalidate cache key
   */
  async invalidate(key) {
    if (!redis) return;
    try {
      await redis.del(`cache:${key}`);
      logger.debug('Cache key invalidated', { key });
    } catch (error) {
      logger.error('Cache invalidation error', { key, error: error.message });
    }
  },

  /**
   * Clear all cache (use with caution)
   */
  async clearAll() {
    if (!redis) return;
    try {
      const keys = await redis.keys('cache:*');
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info('All cache cleared', { count: keys.length });
      }
    } catch (error) {
      logger.error('Cache clear error', { error: error.message });
    }
  },

  /**
   * Get cache statistics
   */
  async getStats() {
    if (!redis) return { total: 0, memory: 0 };
    try {
      const keys = await redis.keys('cache:*');
      const memory = await redis.info('memory');
      return {
        total: keys.length,
        memory: parseInt(memory.match(/used_memory_human:([^\r\n]+)/)?.[1] || '0B')
      };
    } catch (error) {
      logger.error('Cache stats error', { error: error.message });
      return { total: 0, memory: 0 };
    }
  }
};

// Pre-configured cache middleware instances
export const shortCache = cacheMiddleware({ ttl: 60, keyPrefix: 'short' }); // 1 minute
export const mediumCache = cacheMiddleware({ ttl: 300, keyPrefix: 'medium' }); // 5 minutes
export const longCache = cacheMiddleware({ ttl: 1800, keyPrefix: 'long' }); // 30 minutes
export const veryLongCache = cacheMiddleware({ ttl: 3600, keyPrefix: 'verylong' }); // 1 hour

export default {
  cacheMiddleware,
  cacheInvalidationMiddleware,
  cacheUtils,
  shortCache,
  mediumCache,
  longCache,
  veryLongCache
};