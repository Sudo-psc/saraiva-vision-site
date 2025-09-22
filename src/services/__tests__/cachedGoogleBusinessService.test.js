import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CachedGoogleBusinessService from '../cachedGoogleBusinessService.js';

describe('CachedGoogleBusinessService', () => {
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

        // Mock the parent class methods
        service.apiKey = 'test-key';
        service.accessToken = 'test-token';
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with default cache options', () => {
            const cachedService = new CachedGoogleBusinessService();

            expect(cachedService.cacheManager).toBeDefined();
            expect(cachedService.cacheConfig.enableStaleWhileRevalidate).toBe(true);
            expect(cachedService.cacheConfig.backgroundRefresh).toBe(true);
            expect(cachedService.cacheConfig.maxStaleAge).toBe(172800);
            expect(cachedService.refreshPromises).toBeInstanceOf(Map);
        });

        it('should initialize with custom cache options', () => {
            const customOptions = {
                enableStaleWhileRevalidate: false,
                backgroundRefresh: false,
                maxStaleAge: 86400,
                refreshThreshold: 0.5
            };

            const cachedService = new CachedGoogleBusinessService(customOptions);

            expect(cachedService.cacheConfig.enableStaleWhileRevalidate).toBe(false);
            expect(cachedService.cacheConfig.backgroundRefresh).toBe(false);
            expect(cachedService.cacheConfig.maxStaleAge).toBe(86400);
            expect(cachedService.cacheConfig.refreshThreshold).toBe(0.5);
        });
    });

    describe('initialize', () => {
        it('should initialize both service and cache manager', async () => {
            const mockCacheClients = { redis: {}, database: {} };

            vi.spyOn(service.cacheManager, 'initialize').mockResolvedValue(true);

            const result = await service.initialize('encrypted-creds', 'key', mockCacheClients);

            expect(result).toBe(true);
            expect(service.cacheManager.initialize).toHaveBeenCalledWith(mockCacheClients);
        });
    });

    describe('fetchReviews with caching', () => {
        beforeEach(() => {
            vi.spyOn(service, 'fetchFreshReviews').mockResolvedValue(mockReviewData);
        });

        it('should fetch fresh data when cache is disabled', async () => {
            const result = await service.fetchReviews(mockLocationId, { useCache: false });

            expect(result).toEqual(mockReviewData);
            expect(service.fetchFreshReviews).toHaveBeenCalledWith(mockLocationId, { useCache: false });
        });

        it('should fetch fresh data when force refresh is enabled', async () => {
            const result = await service.fetchReviews(mockLocationId, { forceRefresh: true });

            expect(result).toEqual(mockReviewData);
            expect(service.fetchFreshReviews).toHaveBeenCalledWith(mockLocationId, { forceRefresh: true });
        });

        it('should return cached data when available and fresh', async () => {
            const cachedData = {
                ...mockReviewData,
                metadata: {
                    cachedAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                }
            };

            vi.spyOn(service.cacheManager, 'getCachedReviews').mockResolvedValue(cachedData);

            const result = await service.fetchReviews(mockLocationId);

            expect(result.fromCache).toBe(true);
            expect(result.isStale).toBe(false);
            expect(result.reviews).toEqual(cachedData.reviews);
            expect(service.fetchFreshReviews).not.toHaveBeenCalled();
        });

        it('should use stale-while-revalidate for stale data', async () => {
            const staleData = {
                ...mockReviewData,
                metadata: {
                    cachedAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(), // 2 days ago
                    lastUpdated: new Date(Date.now() - 2 * 86400 * 1000).toISOString()
                }
            };

            vi.spyOn(service.cacheManager, 'getCachedReviews').mockResolvedValue(staleData);
            vi.spyOn(service, 'backgroundRefresh').mockImplementation(() => { });

            const result = await service.fetchReviews(mockLocationId);

            expect(result.fromCache).toBe(true);
            expect(result.isStale).toBe(true);
            expect(service.backgroundRefresh).toHaveBeenCalledWith(mockLocationId, {});
        });

        it('should fetch fresh data when cache is too stale', async () => {
            const tooStaleData = {
                ...mockReviewData,
                metadata: {
                    cachedAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(), // 5 days ago
                    lastUpdated: new Date(Date.now() - 5 * 86400 * 1000).toISOString()
                }
            };

            vi.spyOn(service.cacheManager, 'getCachedReviews').mockResolvedValue(tooStaleData);

            const result = await service.fetchReviews(mockLocationId, { maxStaleAge: 172800 });

            expect(result).toEqual(mockReviewData);
            expect(service.fetchFreshReviews).toHaveBeenCalled();
        });

        it('should proactively refresh cache when approaching expiration', async () => {
            const approachingStaleData = {
                ...mockReviewData,
                metadata: {
                    cachedAt: new Date(Date.now() - 70000 * 1000).toISOString(), // ~19 hours ago (80% of 24h)
                    lastUpdated: new Date(Date.now() - 70000 * 1000).toISOString()
                }
            };

            vi.spyOn(service.cacheManager, 'getCachedReviews').mockResolvedValue(approachingStaleData);
            vi.spyOn(service, 'backgroundRefresh').mockImplementation(() => { });

            const result = await service.fetchReviews(mockLocationId);

            expect(result.fromCache).toBe(true);
            expect(result.isStale).toBe(false);
            expect(service.backgroundRefresh).toHaveBeenCalled();
        });

        it('should fetch fresh data when no cache exists', async () => {
            vi.spyOn(service.cacheManager, 'getCachedReviews').mockResolvedValue(null);

            const result = await service.fetchReviews(mockLocationId);

            expect(result).toEqual(mockReviewData);
            expect(service.fetchFreshReviews).toHaveBeenCalled();
        });

        it('should fallback to stale data on error', async () => {
            const staleData = {
                ...mockReviewData,
                metadata: {
                    cachedAt: new Date(Date.now() - 86400 * 1000).toISOString(),
                    lastUpdated: new Date(Date.now() - 86400 * 1000).toISOString()
                }
            };

            vi.spyOn(service.cacheManager, 'getCachedReviews')
                .mockResolvedValueOnce(null) // First call returns null (cache miss)
                .mockResolvedValueOnce(staleData); // Second call returns stale data (fallback)

            vi.spyOn(service, 'fetchFreshReviews').mockRejectedValue(new Error('API Error'));

            const result = await service.fetchReviews(mockLocationId);

            expect(result.fromCache).toBe(true);
            expect(result.isStale).toBe(true);
        });

        it('should throw error when no fallback data available', async () => {
            vi.spyOn(service.cacheManager, 'getCachedReviews').mockResolvedValue(null);
            vi.spyOn(service, 'fetchFreshReviews').mockRejectedValue(new Error('API Error'));

            await expect(service.fetchReviews(mockLocationId)).rejects.toThrow('API Error');
        });

        it('should throw error for missing location ID', async () => {
            await expect(service.fetchReviews()).rejects.toThrow('Location ID is required');
        });
    });

    describe('fetchBusinessInfo with caching', () => {
        const mockBusinessInfo = {
            success: true,
            businessInfo: { name: 'Test Business' },
            fetchedAt: new Date().toISOString()
        };

        beforeEach(() => {
            vi.spyOn(service.constructor.prototype, 'fetchBusinessInfo').mockResolvedValue(mockBusinessInfo);
        });

        it('should fetch fresh data when cache is disabled', async () => {
            const result = await service.fetchBusinessInfo(mockLocationId, { useCache: false });

            expect(result).toEqual(mockBusinessInfo);
            expect(service.constructor.prototype.fetchBusinessInfo).toHaveBeenCalled();
        });

        it('should return cached data when available and fresh', async () => {
            const cachedData = {
                ...mockBusinessInfo,
                metadata: { cachedAt: new Date().toISOString() }
            };

            vi.spyOn(service, 'getCachedBusinessInfo').mockResolvedValue(cachedData);
            vi.spyOn(service, 'isBusinessInfoStale').mockReturnValue(false);

            const result = await service.fetchBusinessInfo(mockLocationId);

            expect(result).toEqual(cachedData);
            expect(service.constructor.prototype.fetchBusinessInfo).not.toHaveBeenCalled();
        });

        it('should fetch fresh data when cache is stale', async () => {
            const staleData = {
                ...mockBusinessInfo,
                metadata: { cachedAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString() }
            };

            vi.spyOn(service, 'getCachedBusinessInfo').mockResolvedValue(staleData);
            vi.spyOn(service, 'isBusinessInfoStale').mockReturnValue(true);
            vi.spyOn(service, 'cacheBusinessInfo').mockResolvedValue();

            const result = await service.fetchBusinessInfo(mockLocationId);

            expect(result).toEqual(mockBusinessInfo);
            expect(service.constructor.prototype.fetchBusinessInfo).toHaveBeenCalled();
            expect(service.cacheBusinessInfo).toHaveBeenCalled();
        });

        it('should fallback to cached data on error', async () => {
            const cachedData = {
                ...mockBusinessInfo,
                metadata: { cachedAt: new Date().toISOString() }
            };

            vi.spyOn(service, 'getCachedBusinessInfo')
                .mockResolvedValueOnce(null) // First call returns null
                .mockResolvedValueOnce(cachedData); // Second call returns cached data (fallback)

            vi.spyOn(service.constructor.prototype, 'fetchBusinessInfo').mockRejectedValue(new Error('API Error'));

            const result = await service.fetchBusinessInfo(mockLocationId);

            expect(result).toEqual(cachedData);
        });
    });

    describe('getReviewStats with caching', () => {
        const mockStats = {
            success: true,
            stats: { averageRating: 4.5, totalReviews: 10 },
            fetchedAt: new Date().toISOString()
        };

        beforeEach(() => {
            vi.spyOn(service.constructor.prototype, 'getReviewStats').mockResolvedValue(mockStats);
        });

        it('should fetch fresh stats when cache is disabled', async () => {
            const result = await service.getReviewStats(mockLocationId, { useCache: false });

            expect(result).toEqual(mockStats);
            expect(service.constructor.prototype.getReviewStats).toHaveBeenCalled();
        });

        it('should return cached stats when available and fresh', async () => {
            const cachedStats = {
                ...mockStats,
                metadata: { cachedAt: new Date().toISOString() }
            };

            vi.spyOn(service, 'getCachedReviewStats').mockResolvedValue(cachedStats);
            vi.spyOn(service, 'isStatsStale').mockReturnValue(false);

            const result = await service.getReviewStats(mockLocationId);

            expect(result).toEqual(cachedStats);
            expect(service.constructor.prototype.getReviewStats).not.toHaveBeenCalled();
        });

        it('should fetch fresh stats when cache is stale', async () => {
            vi.spyOn(service, 'getCachedReviewStats').mockResolvedValue(null);
            vi.spyOn(service, 'cacheReviewStats').mockResolvedValue();

            const result = await service.getReviewStats(mockLocationId);

            expect(result).toEqual(mockStats);
            expect(service.constructor.prototype.getReviewStats).toHaveBeenCalled();
            expect(service.cacheReviewStats).toHaveBeenCalled();
        });
    });

    describe('Cache Management', () => {
        describe('invalidateLocationCache', () => {
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

            it('should handle invalidation errors', async () => {
                vi.spyOn(service.cacheManager, 'invalidateCache').mockRejectedValue(new Error('Invalidation error'));

                await expect(service.invalidateLocationCache(mockLocationId)).rejects.toThrow('Invalidation error');
            });
        });

        describe('warmLocationCache', () => {
            it('should warm all cache types for a location', async () => {
                vi.spyOn(service, 'fetchReviews').mockResolvedValue(mockReviewData);
                vi.spyOn(service, 'fetchBusinessInfo').mockResolvedValue({ success: true });
                vi.spyOn(service, 'getReviewStats').mockResolvedValue({ success: true });

                const result = await service.warmLocationCache(mockLocationId);

                expect(result).toBe(true);
                expect(service.fetchReviews).toHaveBeenCalledWith(mockLocationId, { forceRefresh: true });
                expect(service.fetchBusinessInfo).toHaveBeenCalledWith(mockLocationId, { forceRefresh: true });
                expect(service.getReviewStats).toHaveBeenCalledWith(mockLocationId, { forceRefresh: true });
            });

            it('should handle warming errors gracefully', async () => {
                vi.spyOn(service, 'fetchReviews').mockRejectedValue(new Error('Fetch error'));
                vi.spyOn(service, 'fetchBusinessInfo').mockResolvedValue({ success: true });
                vi.spyOn(service, 'getReviewStats').mockResolvedValue({ success: true });

                // Should not throw error even if one operation fails
                const result = await service.warmLocationCache(mockLocationId);

                expect(result).toBe(true);
            });
        });

        describe('clearAllCaches', () => {
            it('should clear all caches', async () => {
                vi.spyOn(service.cacheManager, 'clearAll').mockResolvedValue(true);

                const result = await service.clearAllCaches();

                expect(result).toBe(true);
                expect(service.cacheManager.clearAll).toHaveBeenCalled();
                expect(service.refreshPromises.size).toBe(0);
            });

            it('should handle clear errors', async () => {
                vi.spyOn(service.cacheManager, 'clearAll').mockRejectedValue(new Error('Clear error'));

                await expect(service.clearAllCaches()).rejects.toThrow('Clear error');
            });
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
        describe('getCacheStats', () => {
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
        });

        describe('formatCachedResponse', () => {
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
        });

        describe('getCacheAge', () => {
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
    });

    describe('fetchFreshReviews', () => {
        it('should fetch fresh data and cache it', async () => {
            vi.spyOn(service.constructor.prototype, 'fetchReviews').mockResolvedValue(mockReviewData);
            vi.spyOn(service.cacheManager, 'setCachedReviews').mockResolvedValue(true);

            const result = await service.fetchFreshReviews(mockLocationId, {});

            expect(result).toEqual(mockReviewData);
            expect(service.constructor.prototype.fetchReviews).toHaveBeenCalledWith(mockLocationId, {});
            expect(service.cacheManager.setCachedReviews).toHaveBeenCalledWith(mockLocationId, mockReviewData);
        });

        it('should not cache failed requests', async () => {
            const failedResponse = { success: false, error: 'API Error' };

            vi.spyOn(service.constructor.prototype, 'fetchReviews').mockResolvedValue(failedResponse);
            vi.spyOn(service.cacheManager, 'setCachedReviews').mockResolvedValue(true);

            const result = await service.fetchFreshReviews(mockLocationId, {});

            expect(result).toEqual(failedResponse);
            expect(service.cacheManager.setCachedReviews).not.toHaveBeenCalled();
        });
    });
});