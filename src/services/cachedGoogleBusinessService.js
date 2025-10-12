import GoogleBusinessService from './googleBusinessService.js';
import ReviewCacheManager from './reviewCacheManager.js';

/**
 * Cached Google Business Service
 * Extends GoogleBusinessService with intelligent caching capabilities
 */
class CachedGoogleBusinessService extends GoogleBusinessService {
    constructor(cacheOptions = {}) {
        super();

        this.cacheManager = new ReviewCacheManager({
            defaultTTL: 43200, // 12 hours (reduced for fresher content)
            staleTTL: 86400, // 24 hours (reduced stale time)
            maxCachedReviews: 100, // Increased cache capacity
            enableLogging: cacheOptions.enableLogging || false,
            ...cacheOptions
        });

        // Cache configuration
        this.cacheConfig = {
            enableStaleWhileRevalidate: cacheOptions.enableStaleWhileRevalidate !== false,
            backgroundRefresh: cacheOptions.backgroundRefresh !== false,
            maxStaleAge: cacheOptions.maxStaleAge || 86400, // 24 hours (reduced)
            refreshThreshold: cacheOptions.refreshThreshold || 0.7, // Refresh at 70% for better performance
        };

        // Background refresh tracking
        this.refreshPromises = new Map();
    }

    /**
     * Initialize the cached service
     * @param {string} encryptedCredentials - Encrypted API credentials
     * @param {string} encryptionKey - Encryption key
     * @param {Object} cacheClients - Cache storage clients
     */
    async initialize(encryptedCredentials, encryptionKey, cacheClients = {}) {
        // Initialize the base service
        await super.initialize(encryptedCredentials, encryptionKey);

        // Initialize the cache manager
        await this.cacheManager.initialize(cacheClients);

        return true;
    }

    /**
     * Fetch reviews with intelligent caching
     * @param {string} locationId - Google Business location ID
     * @param {Object} options - Fetch options
     */
    async fetchReviews(locationId, options = {}) {
        if (!locationId) {
            throw new Error('Location ID is required');
        }

        const {
            useCache = true,
            forceRefresh = false,
            maxStaleAge = this.cacheConfig.maxStaleAge
        } = options;

        try {
            // If cache is disabled or force refresh, fetch directly
            if (!useCache || forceRefresh) {
                return await this.fetchFreshReviews(locationId, options);
            }

            // Try to get from cache first
            const cachedData = await this.cacheManager.getCachedReviews(locationId);

            if (cachedData) {
                const cacheAge = this.getCacheAge(cachedData);
                const isStale = cacheAge > this.cacheManager.options.defaultTTL;
                const isTooStale = cacheAge > maxStaleAge;

                // If data is too stale, fetch fresh data
                if (isTooStale) {
                    return await this.fetchFreshReviews(locationId, options);
                }

                // If data is stale but not too stale, use stale-while-revalidate
                if (isStale && this.cacheConfig.enableStaleWhileRevalidate) {
                    this.backgroundRefresh(locationId, options);
                    return this.formatCachedResponse(cachedData, true); // Mark as stale
                }

                // If data is fresh enough, check if we should proactively refresh
                const refreshThreshold = this.cacheManager.options.defaultTTL * this.cacheConfig.refreshThreshold;
                if (cacheAge > refreshThreshold && this.cacheConfig.backgroundRefresh) {
                    this.backgroundRefresh(locationId, options);
                }

                // Return cached data
                return this.formatCachedResponse(cachedData, false);
            }

            // No cached data, fetch fresh
            return await this.fetchFreshReviews(locationId, options);

        } catch (error) {
            // Try to return stale data as fallback
            try {
                const staleData = await this.cacheManager.getCachedReviews(locationId);
                if (staleData) {
                    return this.formatCachedResponse(staleData, true);
                }
            } catch (fallbackError) {
                // Fallback failed, re-throw original error
            }

            throw error;
        }
    }

    /**
     * Fetch business info with caching
     * @param {string} locationId - Google Business location ID
     * @param {Object} options - Fetch options
     */
    async fetchBusinessInfo(locationId, options = {}) {
        const cacheKey = `business_info:${locationId}`;
        const { useCache = true, forceRefresh = false } = options;

        try {
            if (!useCache || forceRefresh) {
                const freshData = await super.fetchBusinessInfo(locationId);
                if (freshData.success) {
                    await this.cacheBusinessInfo(locationId, freshData);
                }
                return freshData;
            }

            // Try cache first
            const cachedData = await this.getCachedBusinessInfo(locationId);
            if (cachedData && !this.isBusinessInfoStale(cachedData)) {
                return cachedData;
            }

            // Fetch fresh data
            const freshData = await super.fetchBusinessInfo(locationId);
            if (freshData.success) {
                await this.cacheBusinessInfo(locationId, freshData);
            }

            return freshData;

        } catch (error) {
            // Try to return cached data as fallback
            const fallbackData = await this.getCachedBusinessInfo(locationId);
            if (fallbackData) {
                return fallbackData;
            }

            throw error;
        }
    }

    /**
     * Get review stats with caching
     * @param {string} locationId - Google Business location ID
     * @param {Object} options - Options
     */
    async getReviewStats(locationId, options = {}) {
        const { useCache = true, forceRefresh = false } = options;

        try {
            if (!useCache || forceRefresh) {
                const freshStats = await super.getReviewStats(locationId);
                if (freshStats.success) {
                    await this.cacheReviewStats(locationId, freshStats);
                }
                return freshStats;
            }

            // Try cache first
            const cachedStats = await this.getCachedReviewStats(locationId);
            if (cachedStats && !this.isStatsStale(cachedStats)) {
                return cachedStats;
            }

            // Fetch fresh stats
            const freshStats = await super.getReviewStats(locationId);
            if (freshStats.success) {
                await this.cacheReviewStats(locationId, freshStats);
            }

            return freshStats;

        } catch (error) {
            // Try to return cached stats as fallback
            const fallbackStats = await this.getCachedReviewStats(locationId);
            if (fallbackStats) {
                return fallbackStats;
            }

            throw error;
        }
    }

    /**
     * Invalidate all cache for a location
     * @param {string} locationId - Google Business location ID
     */
    async invalidateLocationCache(locationId) {
        try {
            await Promise.all([
                this.cacheManager.invalidateCache(locationId),
                this.invalidateBusinessInfoCache(locationId),
                this.invalidateStatsCache(locationId)
            ]);

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Warm cache for a location
     * @param {string} locationId - Google Business location ID
     */
    async warmLocationCache(locationId) {
        try {
            const promises = [
                this.fetchReviews(locationId, { forceRefresh: true }),
                this.fetchBusinessInfo(locationId, { forceRefresh: true }),
                this.getReviewStats(locationId, { forceRefresh: true })
            ];

            await Promise.allSettled(promises);
            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            cache: this.cacheManager.getStats(),
            backgroundRefreshes: this.refreshPromises.size,
            config: this.cacheConfig
        };
    }

    /**
     * Clear all caches
     */
    async clearAllCaches() {
        try {
            await this.cacheManager.clearAll();
            this.refreshPromises.clear();
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Private methods

    /**
     * Fetch fresh reviews and cache them
     * @param {string} locationId - Location ID
     * @param {Object} options - Fetch options
     */
    async fetchFreshReviews(locationId, options) {
        const freshData = await super.fetchReviews(locationId, options);

        if (freshData.success) {
            // Cache the fresh data
            await this.cacheManager.setCachedReviews(locationId, freshData);
        }

        return freshData;
    }

    /**
     * Background refresh of cache data
     * @param {string} locationId - Location ID
     * @param {Object} options - Fetch options
     */
    backgroundRefresh(locationId, options) {
        // Prevent multiple concurrent refreshes for the same location
        if (this.refreshPromises.has(locationId)) {
            return this.refreshPromises.get(locationId);
        }

        const refreshPromise = this.performBackgroundRefresh(locationId, options)
            .finally(() => {
                this.refreshPromises.delete(locationId);
            });

        this.refreshPromises.set(locationId, refreshPromise);
        return refreshPromise;
    }

    /**
     * Perform the actual background refresh
     * @param {string} locationId - Location ID
     * @param {Object} options - Fetch options
     */
    async performBackgroundRefresh(locationId, options) {
        try {
            await this.fetchFreshReviews(locationId, options);
        } catch (error) {
            // Don't throw - background refresh failures shouldn't affect the main request
        }
    }

    /**
     * Format cached response
     * @param {Object} cachedData - Cached data
     * @param {boolean} isStale - Whether data is stale
     */
    formatCachedResponse(cachedData, isStale = false) {
        return {
            ...cachedData,
            fromCache: true,
            isStale,
            cacheAge: this.getCacheAge(cachedData),
            lastUpdated: cachedData.metadata?.lastUpdated || null
        };
    }

    /**
     * Get cache age in seconds
     * @param {Object} cachedData - Cached data
     */
    getCacheAge(cachedData) {
        if (!cachedData.metadata?.cachedAt) return Infinity;

        const cachedAt = new Date(cachedData.metadata.cachedAt);
        return Math.floor((Date.now() - cachedAt.getTime()) / 1000);
    }

    /**
     * Cache business info
     * @param {string} locationId - Location ID
     * @param {Object} data - Business info data
     */
    async cacheBusinessInfo(locationId, data) {
        const cacheKey = this.cacheManager.generateCacheKey('business_info', locationId);
        await this.cacheManager.setInMemory(cacheKey, data, this.cacheManager.options.defaultTTL);
    }

    /**
     * Get cached business info
     * @param {string} locationId - Location ID
     */
    async getCachedBusinessInfo(locationId) {
        const cacheKey = this.cacheManager.generateCacheKey('business_info', locationId);
        return await this.cacheManager.getFromMemory(cacheKey);
    }

    /**
     * Check if business info is stale
     * @param {Object} cachedData - Cached business info
     */
    isBusinessInfoStale(cachedData) {
        return this.getCacheAge(cachedData) > this.cacheManager.options.defaultTTL;
    }

    /**
     * Invalidate business info cache
     * @param {string} locationId - Location ID
     */
    async invalidateBusinessInfoCache(locationId) {
        const cacheKey = this.cacheManager.generateCacheKey('business_info', locationId);
        await this.cacheManager.deleteFromMemory(cacheKey);
    }

    /**
     * Cache review stats
     * @param {string} locationId - Location ID
     * @param {Object} data - Stats data
     */
    async cacheReviewStats(locationId, data) {
        const cacheKey = this.cacheManager.generateCacheKey('stats', locationId);
        await this.cacheManager.setInMemory(cacheKey, data, this.cacheManager.options.defaultTTL);
    }

    /**
     * Get cached review stats
     * @param {string} locationId - Location ID
     */
    async getCachedReviewStats(locationId) {
        const cacheKey = this.cacheManager.generateCacheKey('stats', locationId);
        return await this.cacheManager.getFromMemory(cacheKey);
    }

    /**
     * Check if stats are stale
     * @param {Object} cachedData - Cached stats
     */
    isStatsStale(cachedData) {
        return this.getCacheAge(cachedData) > this.cacheManager.options.defaultTTL;
    }

    /**
     * Invalidate stats cache
     * @param {string} locationId - Location ID
     */
    async invalidateStatsCache(locationId) {
        const cacheKey = this.cacheManager.generateCacheKey('stats', locationId);
        await this.cacheManager.deleteFromMemory(cacheKey);
    }
}

export default CachedGoogleBusinessService;