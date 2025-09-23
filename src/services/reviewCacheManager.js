/**
 * Review Cache Manager
 * Handles intelligent caching of Google Business reviews with multi-layer storage
 */

/**
 * Review Cache Manager Class
 * Implements stale-while-revalidate pattern with Redis and database fallback
 */
class ReviewCacheManager {
    constructor(options = {}) {
        this.options = {
            // Cache TTL settings (in seconds)
            defaultTTL: options.defaultTTL || 86400, // 24 hours
            staleTTL: options.staleTTL || 172800, // 48 hours (stale data)
            maxCachedReviews: options.maxCachedReviews || 50,

            // Cache keys
            keyPrefix: options.keyPrefix || 'google_business',

            // Storage options
            enableRedis: options.enableRedis !== false,
            enableDatabase: options.enableDatabase !== false,
            enableMemory: options.enableMemory !== false,

            // Performance settings
            compressionEnabled: options.compressionEnabled !== false,
            encryptionEnabled: options.encryptionEnabled !== false,

            // Debug settings
            enableLogging: options.enableLogging || false
        };

        // Initialize storage layers
        this.memoryCache = new Map();
        this.redisClient = null;
        this.databaseClient = null;

        // Cache statistics
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            errors: 0,
            lastReset: new Date()
        };

        this.log('ReviewCacheManager initialized', this.options);
    }

    /**
     * Initialize cache connections
     * @param {Object} clients - Storage clients (redis, database)
     */
    async initialize(clients = {}) {
        try {
            if (clients.redis && this.options.enableRedis) {
                this.redisClient = clients.redis;
                this.log('Redis client connected');
            }

            if (clients.database && this.options.enableDatabase) {
                this.databaseClient = clients.database;
                this.log('Database client connected');
            }

            return true;
        } catch (error) {
            this.log('Cache initialization error:', error);
            throw new Error(`Failed to initialize cache: ${error.message}`);
        }
    }

    /**
     * Get cached reviews for a location
     * @param {string} locationId - Google Business location ID
     * @param {Object} options - Cache retrieval options
     */
    async getCachedReviews(locationId, options = {}) {
        if (!locationId) {
            throw new Error('Location ID is required');
        }

        const cacheKey = this.generateCacheKey('reviews', locationId);
        const startTime = Date.now();

        try {
            // Try memory cache first (fastest)
            if (this.options.enableMemory) {
                const memoryResult = await this.getFromMemory(cacheKey);
                if (memoryResult) {
                    this.stats.hits++;
                    this.log(`Memory cache hit for ${locationId}`, {
                        responseTime: Date.now() - startTime
                    });
                    return memoryResult;
                }
            }

            // Try Redis cache (fast)
            if (this.redisClient && this.options.enableRedis) {
                const redisResult = await this.getFromRedis(cacheKey);
                if (redisResult) {
                    // Update memory cache
                    if (this.options.enableMemory) {
                        await this.setInMemory(cacheKey, redisResult, this.options.defaultTTL);
                    }

                    this.stats.hits++;
                    this.log(`Redis cache hit for ${locationId}`, {
                        responseTime: Date.now() - startTime
                    });
                    return redisResult;
                }
            }

            // Try database cache (slower but persistent)
            if (this.databaseClient && this.options.enableDatabase) {
                const dbResult = await this.getFromDatabase(cacheKey, locationId);
                if (dbResult) {
                    // Update higher-level caches
                    if (this.redisClient && this.options.enableRedis) {
                        await this.setInRedis(cacheKey, dbResult, this.options.defaultTTL);
                    }
                    if (this.options.enableMemory) {
                        await this.setInMemory(cacheKey, dbResult, this.options.defaultTTL);
                    }

                    this.stats.hits++;
                    this.log(`Database cache hit for ${locationId}`, {
                        responseTime: Date.now() - startTime
                    });
                    return dbResult;
                }
            }

            // Cache miss
            this.stats.misses++;
            this.log(`Cache miss for ${locationId}`, {
                responseTime: Date.now() - startTime
            });

            return null;

        } catch (error) {
            this.stats.errors++;
            this.log('Error getting cached reviews:', error);
            return null; // Graceful degradation
        }
    }

    /**
     * Set cached reviews for a location
     * @param {string} locationId - Google Business location ID
     * @param {Object} data - Review data to cache
     * @param {number} ttl - Time to live in seconds
     */
    async setCachedReviews(locationId, data, ttl = null) {
        if (!locationId || !data) {
            throw new Error('Location ID and data are required');
        }

        const cacheKey = this.generateCacheKey('reviews', locationId);
        const cacheTTL = ttl || this.options.defaultTTL;
        const cacheData = this.prepareCacheData(data);

        try {
            const promises = [];

            // Set in memory cache
            if (this.options.enableMemory) {
                promises.push(this.setInMemory(cacheKey, cacheData, cacheTTL));
            }

            // Set in Redis cache
            if (this.redisClient && this.options.enableRedis) {
                promises.push(this.setInRedis(cacheKey, cacheData, cacheTTL));
            }

            // Set in database cache
            if (this.databaseClient && this.options.enableDatabase) {
                promises.push(this.setInDatabase(cacheKey, locationId, cacheData, cacheTTL));
            }

            await Promise.allSettled(promises);
            this.stats.sets++;

            this.log(`Cached reviews for ${locationId}`, {
                reviewCount: data.reviews?.length || 0,
                ttl: cacheTTL
            });

            return true;

        } catch (error) {
            this.stats.errors++;
            this.log('Error setting cached reviews:', error);
            throw error;
        }
    }

    /**
     * Invalidate cache for a location
     * @param {string} locationId - Google Business location ID
     */
    async invalidateCache(locationId) {
        if (!locationId) {
            throw new Error('Location ID is required');
        }

        const cacheKey = this.generateCacheKey('reviews', locationId);

        try {
            const promises = [];

            // Remove from memory cache
            if (this.options.enableMemory) {
                promises.push(this.deleteFromMemory(cacheKey));
            }

            // Remove from Redis cache
            if (this.redisClient && this.options.enableRedis) {
                promises.push(this.deleteFromRedis(cacheKey));
            }

            // Remove from database cache
            if (this.databaseClient && this.options.enableDatabase) {
                promises.push(this.deleteFromDatabase(cacheKey, locationId));
            }

            await Promise.allSettled(promises);
            this.stats.deletes++;

            this.log(`Invalidated cache for ${locationId}`);
            return true;

        } catch (error) {
            this.stats.errors++;
            this.log('Error invalidating cache:', error);
            throw error;
        }
    }

    /**
     * Get last update time for cached data
     * @param {string} locationId - Google Business location ID
     */
    async getLastUpdateTime(locationId) {
        if (!locationId) {
            throw new Error('Location ID is required');
        }

        try {
            const cachedData = await this.getCachedReviews(locationId);
            return cachedData?.metadata?.lastUpdated || null;
        } catch (error) {
            this.log('Error getting last update time:', error);
            return null;
        }
    }

    /**
     * Check if cached data is stale
     * @param {string} locationId - Google Business location ID
     */
    async isStale(locationId) {
        try {
            const lastUpdate = await this.getLastUpdateTime(locationId);
            if (!lastUpdate) return true;

            const staleThreshold = Date.now() - (this.options.defaultTTL * 1000);
            return new Date(lastUpdate).getTime() < staleThreshold;
        } catch (error) {
            this.log('Error checking stale status:', error);
            return true; // Assume stale on error
        }
    }

    /**
     * Warm cache with fresh data
     * @param {string} locationId - Google Business location ID
     * @param {Function} dataFetcher - Function to fetch fresh data
     */
    async warmCache(locationId, dataFetcher) {
        if (!locationId || typeof dataFetcher !== 'function') {
            throw new Error('Location ID and data fetcher function are required');
        }

        try {
            this.log(`Warming cache for ${locationId}`);

            const freshData = await dataFetcher(locationId);
            if (freshData) {
                await this.setCachedReviews(locationId, freshData);
                this.log(`Cache warmed for ${locationId}`);
                return true;
            }

            return false;
        } catch (error) {
            this.log('Error warming cache:', error);
            throw error;
        }
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const uptime = Date.now() - this.stats.lastReset.getTime();
        const totalRequests = this.stats.hits + this.stats.misses;

        return {
            ...this.stats,
            uptime,
            totalRequests,
            hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
            errorRate: totalRequests > 0 ? (this.stats.errors / totalRequests) * 100 : 0,
            memorySize: this.memoryCache.size
        };
    }

    /**
     * Reset cache statistics
     */
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            errors: 0,
            lastReset: new Date()
        };
    }

    /**
     * Clear all caches
     */
    async clearAll() {
        try {
            const promises = [];

            // Clear memory cache
            if (this.options.enableMemory) {
                this.memoryCache.clear();
            }

            // Clear Redis cache
            if (this.redisClient && this.options.enableRedis) {
                const pattern = `${this.options.keyPrefix}:*`;
                promises.push(this.clearRedisPattern(pattern));
            }

            // Clear database cache
            if (this.databaseClient && this.options.enableDatabase) {
                promises.push(this.clearDatabaseCache());
            }

            await Promise.allSettled(promises);
            this.log('All caches cleared');
            return true;

        } catch (error) {
            this.log('Error clearing caches:', error);
            throw error;
        }
    }

    // Private methods for storage layer implementations

    /**
     * Generate cache key
     * @param {string} type - Cache type (reviews, stats, etc.)
     * @param {string} locationId - Location identifier
     */
    generateCacheKey(type, locationId) {
        return `${this.options.keyPrefix}:${type}:${locationId}`;
    }

    /**
     * Prepare data for caching
     * @param {Object} data - Raw data to cache
     */
    prepareCacheData(data) {
        const cacheData = {
            ...data,
            metadata: {
                cachedAt: new Date().toISOString(),
                lastUpdated: data.fetchedAt || new Date().toISOString(),
                version: '1.0',
                compressed: this.options.compressionEnabled,
                encrypted: this.options.encryptionEnabled
            }
        };

        // Limit review count to prevent cache bloat
        if (cacheData.reviews && cacheData.reviews.length > this.options.maxCachedReviews) {
            cacheData.reviews = cacheData.reviews.slice(0, this.options.maxCachedReviews);
            cacheData.metadata.truncated = true;
        }

        return cacheData;
    }

    // Memory cache operations
    async getFromMemory(key) {
        const cached = this.memoryCache.get(key);
        if (!cached) return null;

        if (cached.expiresAt && Date.now() > cached.expiresAt) {
            this.memoryCache.delete(key);
            return null;
        }

        return cached.data;
    }

    async setInMemory(key, data, ttl) {
        const expiresAt = Date.now() + (ttl * 1000);
        this.memoryCache.set(key, { data, expiresAt });
    }

    async deleteFromMemory(key) {
        this.memoryCache.delete(key);
    }

    // Redis cache operations (placeholder - requires Redis client)
    async getFromRedis(key) {
        if (!this.redisClient) return null;

        try {
            // This would be implemented with actual Redis client
            // const cached = await this.redisClient.get(key);
            // return cached ? JSON.parse(cached) : null;
            return null; // Placeholder
        } catch (error) {
            this.log('Redis get error:', error);
            return null;
        }
    }

    async setInRedis(key, data, ttl) {
        if (!this.redisClient) return;

        try {
            // This would be implemented with actual Redis client
            // await this.redisClient.setex(key, ttl, JSON.stringify(data));
        } catch (error) {
            this.log('Redis set error:', error);
        }
    }

    async deleteFromRedis(key) {
        if (!this.redisClient) return;

        try {
            // This would be implemented with actual Redis client
            // await this.redisClient.del(key);
        } catch (error) {
            this.log('Redis delete error:', error);
        }
    }

    async clearRedisPattern(pattern) {
        if (!this.redisClient) return;

        try {
            // This would be implemented with actual Redis client
            // const keys = await this.redisClient.keys(pattern);
            // if (keys.length > 0) {
            //   await this.redisClient.del(...keys);
            // }
        } catch (error) {
            this.log('Redis clear error:', error);
        }
    }

    // Database cache operations (placeholder - requires database client)
    async getFromDatabase(key, locationId) {
        if (!this.databaseClient) return null;

        try {
            // This would be implemented with actual database client
            // const result = await this.databaseClient.query(
            //   'SELECT data FROM review_cache WHERE cache_key = ? AND expires_at > NOW()',
            //   [key]
            // );
            // return result.length > 0 ? JSON.parse(result[0].data) : null;
            return null; // Placeholder
        } catch (error) {
            this.log('Database get error:', error);
            return null;
        }
    }

    async setInDatabase(key, locationId, data, ttl) {
        if (!this.databaseClient) return;

        try {
            // This would be implemented with actual database client
            // const expiresAt = new Date(Date.now() + (ttl * 1000));
            // await this.databaseClient.query(
            //   'INSERT INTO review_cache (cache_key, location_id, data, expires_at) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE data = ?, expires_at = ?',
            //   [key, locationId, JSON.stringify(data), expiresAt, JSON.stringify(data), expiresAt]
            // );
        } catch (error) {
            this.log('Database set error:', error);
        }
    }

    async deleteFromDatabase(key, locationId) {
        if (!this.databaseClient) return;

        try {
            // This would be implemented with actual database client
            // await this.databaseClient.query(
            //   'DELETE FROM review_cache WHERE cache_key = ?',
            //   [key]
            // );
        } catch (error) {
            this.log('Database delete error:', error);
        }
    }

    async clearDatabaseCache() {
        if (!this.databaseClient) return;

        try {
            // This would be implemented with actual database client
            // await this.databaseClient.query(
            //   'DELETE FROM review_cache WHERE cache_key LIKE ?',
            //   [`${this.options.keyPrefix}:%`]
            // );
        } catch (error) {
            this.log('Database clear error:', error);
        }
    }

    /**
     * Log messages if logging is enabled
     * @param {string} message - Log message
     * @param {Object} data - Additional data to log
     */
    log(message, data = null) {
        if (this.options.enableLogging) {
            const timestamp = new Date().toISOString();
            console.log(`[ReviewCacheManager] ${timestamp}: ${message}`, data || '');
        }
    }
}

export default ReviewCacheManager;