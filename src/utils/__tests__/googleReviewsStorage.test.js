/**
 * Test suite for GoogleReviewsStorage utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  info: vi.spyOn(console, 'info').mockImplementation(() => {}),
};

describe('GoogleReviewsStorage', () => {
  let GoogleReviewsStorage;

  beforeEach(async () => {
    // Reset mocks but preserve implementations
    vi.clearAllMocks();

    // Re-attach mock functions after clearing
    localStorageMock.getItem = vi.fn();
    localStorageMock.setItem = vi.fn();
    localStorageMock.removeItem = vi.fn();
    localStorageMock.clear = vi.fn();

    // Re-attach console spies after clearing
    consoleSpy.log = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleSpy.warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleSpy.error = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleSpy.info = vi.spyOn(console, 'info').mockImplementation(() => {});

    // Set up global window with localStorage
    global.window = {
      localStorage: localStorageMock
    };

    // Dynamic import to match the component's import pattern
    const module = await import('../googleReviewsStorage.js');
    GoogleReviewsStorage = module.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clear localStorage mock data
    Object.keys(localStorageMock).forEach(key => {
      delete localStorageMock[key];
    });
  });

  describe('saveReviewsData', () => {
    it('should save reviews data to localStorage', () => {
      const reviews = [
        { id: '1', author: 'Test User', rating: 5, text: 'Great service!' }
      ];
      const stats = { averageRating: 4.8, totalReviews: 10 };
      const placeId = 'test-place-id';

      const result = GoogleReviewsStorage.saveReviewsData(reviews, stats, placeId);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'google_reviews_cached_data',
        expect.stringContaining('"reviews":[{"id":"1"')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'google_reviews_last_success',
        expect.any(String)
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = GoogleReviewsStorage.saveReviewsData([], null, 'test-id');

      expect(result).toBe(false);
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '❌ [GoogleReviewsStorage] Failed to save reviews data:',
        expect.any(Error)
      );
    });
  });

  describe('loadReviewsData', () => {
    it('should load valid cached reviews data', () => {
      const testData = {
        reviews: [{ id: '1', author: 'Test User', rating: 5 }],
        stats: { averageRating: 4.8, totalReviews: 10 },
        placeId: 'test-place-id',
        timestamp: Date.now(),
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(testData));

      const result = GoogleReviewsStorage.loadReviewsData();

      expect(result).toEqual(testData);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '✅ [GoogleReviewsStorage] Loaded reviews data from cache',
        expect.objectContaining({
          reviewsCount: 1,
          hasStats: true
        })
      );
    });

    it('should return null for expired data', () => {
      const expiredData = {
        reviews: [],
        stats: null,
        placeId: 'test',
        timestamp: Date.now() - (25 * 60 * 60 * 1000), // 25 hours ago
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredData));

      const result = GoogleReviewsStorage.loadReviewsData();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('google_reviews_cached_data');
    });

    it('should return null for invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = GoogleReviewsStorage.loadReviewsData();

      expect(result).toBeNull();
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '❌ [GoogleReviewsStorage] Failed to load reviews data:',
        expect.any(Error)
      );
    });
  });

  describe('savePlaceData', () => {
    it('should save place data to localStorage', () => {
      const placeData = {
        name: 'Test Clinic',
        rating: 4.8,
        userRatingCount: 25,
        reviews: [{ id: '1', author: 'Test User' }]
      };
      const placeId = 'test-place-id';

      const result = GoogleReviewsStorage.savePlaceData(placeData, placeId);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'google_reviews_cached_place_data',
        expect.stringContaining('"name":"Test Clinic"')
      );
    });
  });

  describe('loadPlaceData', () => {
    it('should load valid cached place data', () => {
      const testData = {
        placeData: {
          name: 'Test Clinic',
          rating: 4.8,
          userRatingCount: 25,
          reviews: [{ id: '1', author: 'Test User' }]
        },
        placeId: 'test-place-id',
        timestamp: Date.now(),
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(testData));

      const result = GoogleReviewsStorage.loadPlaceData();

      expect(result).toEqual(testData.placeData);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '✅ [GoogleReviewsStorage] Loaded place data from cache',
        expect.objectContaining({
          placeId: 'test-place-id',
          hasReviews: true
        })
      );
    });
  });

  describe('saveFallbackReviews', () => {
    it('should save fallback reviews separately', () => {
      const reviews = [{ id: '1', author: 'Test User', rating: 5 }];
      const stats = { averageRating: 4.8, totalReviews: 10 };

      const result = GoogleReviewsStorage.saveFallbackReviews(reviews, stats);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'google_reviews_fallback_data',
        expect.stringContaining('"reviews":[{"id":"1"')
      );
    });
  });

  describe('loadFallbackReviews', () => {
    it('should load fallback reviews', () => {
      const testData = {
        reviews: [{ id: '1', author: 'Test User', rating: 5 }],
        stats: { averageRating: 4.8, totalReviews: 10 },
        timestamp: Date.now(),
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(testData));

      const result = GoogleReviewsStorage.loadFallbackReviews();

      expect(result).toEqual(testData);
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '✅ [GoogleReviewsStorage] Loaded fallback reviews',
        expect.objectContaining({
          reviewsCount: 1,
          hasStats: true
        })
      );
    });

    it('should return null for expired fallback data', () => {
      const expiredData = {
        reviews: [],
        stats: null,
        timestamp: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
        version: '1.0'
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredData));

      const result = GoogleReviewsStorage.loadFallbackReviews();

      expect(result).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('google_reviews_fallback_data');
    });
  });

  describe('cache validation', () => {
    it('should report valid cache correctly', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'google_reviews_last_success') {
          return (Date.now() - (10 * 60 * 1000)).toString(); // 10 minutes ago
        }
        return null;
      });

      expect(GoogleReviewsStorage.hasValidCache()).toBe(true);
      expect(GoogleReviewsStorage.hasFallbackData()).toBe(true);
    });

    it('should report invalid cache for old data', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'google_reviews_last_success') {
          return (Date.now() - (25 * 60 * 60 * 1000)).toString(); // 25 hours ago
        }
        return null;
      });

      expect(GoogleReviewsStorage.hasValidCache()).toBe(false);
      expect(GoogleReviewsStorage.hasFallbackData()).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should clear all storage keys', () => {
      GoogleReviewsStorage.clearCache();

      expect(localStorageMock.removeItem).toHaveBeenCalledTimes(5); // All 5 storage keys
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('google_reviews_cached_data');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('google_reviews_cached_stats');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('google_reviews_cached_place_data');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('google_reviews_last_success');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('google_reviews_fallback_data');
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'google_reviews_last_success') {
          return (Date.now() - (10 * 60 * 1000)).toString();
        }
        return 'test-data';
      });

      const stats = GoogleReviewsStorage.getCacheStats();

      expect(stats).toEqual(
        expect.objectContaining({
          lastSuccess: expect.any(Number),
          hasValidCache: true,
          hasFallbackData: true,
          storageKeys: expect.objectContaining({
            REVIEWS: expect.objectContaining({ exists: true }),
            STATS: expect.objectContaining({ exists: true }),
            PLACE_DATA: expect.objectContaining({ exists: true }),
            LAST_SUCCESS: expect.objectContaining({ exists: true }),
            FALLBACK_REVIEWS: expect.objectContaining({ exists: true })
          })
        })
      );
    });
  });
});