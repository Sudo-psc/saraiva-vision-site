import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CachedGoogleBusinessService from '../cachedGoogleBusinessService.js';

describe('CachedGoogleBusinessService - Core Functionality', () => {
    let service;
    const mockLocationId = 'accounts/123/locations/456';
    const mockReviewData = {
        success: true,
        reviews: [
            {
                id: 'review-1',
                starRating: 5,
                comment: 'Great service!',
                reviewer: { displayName: 'John Doe' }
            }
        ],
        totalSize: 1,
        averageRating: 5.0,
        fetchedAt: new Date().toISOString()
    };

    beforeEach(() => {
        service = new CachedGoogleBusinessService({
            enableLogging: false,
            enableRedis: false,
            enableDatabase: false
        });

        // Set up basic service state
        service.apiKey = 'test-key';
        service.accessToken = 'test-token';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with cache manager and config', () => {
            expect(service.cacheManager).toBeDefined();
            expect(service.cacheConfig).toBeDefined();
            expect(service.refreshPromises).toBeInstanceOf(Map);
        });

        it('should use custom cache options', () => {
            const customService = new CachedGoogleBusinessService({
                enableStaleWhileRevalidate: false,
                backgroundRefresh: false,
                maxStaleAge: 86400
            });

            expect(customService.cacheConfig.enableStaleWhileRevalidate).toBe(false);
            expect(customService.cacheConfig.backgroundRefresh).toBe(false);
            expect(customService.cacheConfig.maxStaleAge).toBe(86400);
        });
    });

    describe('Cache Management', () => {
        it('should invalidate all cache types for a location', async () => {
            vi.spyOn(service.cacheManager, 'invalidateCache').mockResolvedValue(true);
            vi.spyOn(service, 'invalidateBusinessInfoCache').mockResolvedValue();
            vi.spyOn(service, 'invalidateStatsCache').mockResolvedValue();

            const result = await service.invalidateLocationCache(mockLocationId);

            expect(result).toBe(true);
            expect(service.cacheManager.invalidateCache).toHaveBeenCalledWith(mockLocationId);
            expect(service.invalidateBusinessInfoCache).toHaveBeenCalledWith(mockLocationId);
            expect(service.invalidateStatsCache).toHaveBeenCalledWith(mockLocationId);
        });

        it('should clear all caches', async () => {
            vi.spyOn(service.cacheManager, 'clearAll').mockResolvedValue(true);

            const result = await service.clearAllCaches();

            expect(result).toBe(true);
            expect(service.cacheManager.clearAll).toHaveBeenCalled();
            expect(service.refreshPromises.size).toBe(0);
        });

        it('should warm cache for a location', async () => {
            vi.spyOn(service, 'fetchReviews').mockResolvedValue(mockReviewData);
            vi.spyOn(service, 'fetchBusinessInfo').mockResolvedValue({ success: true });
            vi.spyOn(service, 'getReviewStats').mockResolvedValue({ success: true });

            const result = await service.warmLocationCache(mockLocationId);

            expect(result).toBe(true);
            expect(service.fetchReviews).toHaveBeenCalledWith(mockLocationId, { forceRefresh: true });
            expect(service.fetchBusinessInfo).toHaveBeenCalledWith(mockLocationId, { forceRefresh: true });
            expect(service.getReviewStats).toHaveBeenCalledWith(mockLocationId, { forceRefresh: true });
        });
    });

    describe('Background Refresh', () => {
        it('should perform background refresh', async () => {
            vi.spyOn(service, 'fetchFreshReviews').mockResolvedValue(mockReviewData);

            const promise = service.backgroundRefresh(mockLocationId, {});

            expect(service.refreshPromises.has(mockLocationId)).toBe(true);

            await promise;

            expect(service.fetchFreshReviews).toHaveBeenCalledWith(mockLocationId, {});
            expect(service.refreshPromises.has(mockLocationId)).toBe(false);
        });

        it('should prevent multiple concurrent refreshes for same location', async () => {
            vi.spyOn(service, 'fetchFreshReviews').mockResolvedValue(mockReviewData);

            const promise1 = service.backgroundRefresh(mockLocationId, {});
            const promise2 = service.backgroundRefresh(mockLocationId, {});

            expect(promise1).toBe(promise2);
            expect(service.refreshPromises.size).toBe(1);

            await promise1;
        });

        it('should handle background refresh errors gracefully', async () => {
            vi.spyOn(service, 'fetchFreshReviews').mockRejectedValue(new Error('Refresh error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            // Should not throw error
            await service.backgroundRefresh(mockLocationId, {});

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Background refresh failed'),
                expect.any(Error)
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Utility Methods', () => {
        it('should return cache statistics', () => {
            vi.spyOn(service.cacheManager, 'getStats').mockReturnValue({
                hits: 10,
                misses: 5,
                hitRate: 66.67
            });

            service.refreshPromises.set('location1', Promise.resolve());
            service.refreshPromises.set('location2', Promise.resolve());

            const stats = service.getCacheStats();

            expect(stats.cache.hits).toBe(10);
            expect(stats.cache.misses).toBe(5);
            expect(stats.backgroundRefreshes).toBe(2);
            expect(stats.config).toEqual(service.cacheConfig);
        });

        it('should format cached response with metadata', () => {
            const cachedData = {
                ...mockReviewData,
                metadata: {
                    cachedAt: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
                    lastUpdated: new Date().toISOString()
                }
            };

            const formatted = service.formatCachedResponse(cachedData, true);

            expect(formatted.fromCache).toBe(true);
            expect(formatted.isStale).toBe(true);
            expect(formatted.cacheAge).toBeGreaterThan(3500); // ~1 hour in seconds
            expect(formatted.lastUpdated).toBe(cachedData.metadata.lastUpdated);
        });

        it('should calculate cache age correctly', () => {
            const cachedData = {
                metadata: {
                    cachedAt: new Date(Date.now() - 3600 * 1000).toISOString() // 1 hour ago
                }
            };

            const age = service.getCacheAge(cachedData);

            expect(age).toBeGreaterThan(3500);
            expect(age).toBeLessThan(3700);
        });

        it('should return Infinity for missing cachedAt', () => {
            const cachedData = { metadata: {} };

            const age = service.getCacheAge(cachedData);

            expect(age).toBe(Infinity);
        });
    });

    describe('Cache Key Generation', () => {
        it('should generate correct cache keys', () => {
            const reviewsKey = service.cacheManager.generateCacheKey('reviews', mockLocationId);
            const businessInfoKey = service.cacheManager.generateCacheKey('business_info', mockLocationId);
            const statsKey = service.cacheManager.generateCacheKey('stats', mockLocationId);

            expect(reviewsKey).toBe(`google_business:reviews:${mockLocationId}`);
            expect(businessInfoKey).toBe(`google_business:business_info:${mockLocationId}`);
            expect(statsKey).toBe(`google_business:stats:${mockLocationId}`);
        });
    });

    describe('Memory Cache Operations', () => {
        it('should cache and retrieve business info', async () => {
            const businessInfo = { success: true, businessInfo: { name: 'Test Business' } };

            await service.cacheBusinessInfo(mockLocationId, businessInfo);
            const cached = await service.getCachedBusinessInfo(mockLocationId);

            expect(cached).toEqual(businessInfo);
        });

        it('should cache and retrieve review stats', async () => {
            const stats = { success: true, stats: { averageRating: 4.5 } };

            await service.cacheReviewStats(mockLocationId, stats);
            const cached = await service.getCachedReviewStats(mockLocationId);

            expect(cached).toEqual(stats);
        });

        it('should invalidate business info cache', async () => {
            const businessInfo = { success: true, businessInfo: { name: 'Test Business' } };

            await service.cacheBusinessInfo(mockLocationId, businessInfo);
            expect(await service.getCachedBusinessInfo(mockLocationId)).toEqual(businessInfo);

            await service.invalidateBusinessInfoCache(mockLocationId);
            expect(await service.getCachedBusinessInfo(mockLocationId)).toBeNull();
        });

        it('should invalidate stats cache', async () => {
            const stats = { success: true, stats: { averageRating: 4.5 } };

            await service.cacheReviewStats(mockLocationId, stats);
            expect(await service.getCachedReviewStats(mockLocationId)).toEqual(stats);

            await service.invalidateStatsCache(mockLocationId);
            expect(await service.getCachedReviewStats(mockLocationId)).toBeNull();
        });
    });

    describe('Staleness Detection', () => {
        it('should detect stale business info', () => {
            const freshData = {
                metadata: { cachedAt: new Date().toISOString() }
            };

            const staleData = {
                metadata: { cachedAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString() }
            };

            expect(service.isBusinessInfoStale(freshData)).toBe(false);
            expect(service.isBusinessInfoStale(staleData)).toBe(true);
        });

        it('should detect stale stats', () => {
            const freshData = {
                metadata: { cachedAt: new Date().toISOString() }
            };

            const staleData = {
                metadata: { cachedAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString() }
            };

            expect(service.isStatsStale(freshData)).toBe(false);
            expect(service.isStatsStale(staleData)).toBe(true);
        });
    });
});