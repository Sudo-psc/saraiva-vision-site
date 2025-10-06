/**
 * Persistent storage utilities for Google Reviews data
 * Saves real reviews and stats to localStorage for fallback scenarios
 */

const STORAGE_KEYS = {
  REVIEWS: 'google_reviews_cached_data',
  STATS: 'google_reviews_cached_stats',
  PLACE_DATA: 'google_reviews_cached_place_data',
  LAST_SUCCESS: 'google_reviews_last_success',
  FALLBACK_REVIEWS: 'google_reviews_fallback_data'
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const FALLBACK_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days for fallback

class GoogleReviewsStorage {
  /**
   * Get localStorage instance safely (works in both browser and Node.js mock)
   */
  static getStorage() {
    return typeof window !== 'undefined' ? window.localStorage :
           (typeof global !== 'undefined' && global.window ? global.window.localStorage : null);
  }

  /**
   * Save successful reviews data to localStorage
   */
  static saveReviewsData(reviews, stats, placeId) {
    try {
      const data = {
        reviews,
        stats,
        placeId,
        timestamp: Date.now(),
        version: '1.0'
      };

      const storage = this.getStorage();

      if (!storage) {
        console.warn('❌ [GoogleReviewsStorage] localStorage not available');
        return false;
      }

      storage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(data));
      storage.setItem(STORAGE_KEYS.LAST_SUCCESS, Date.now().toString());

      console.log('✅ [GoogleReviewsStorage] Reviews data saved to localStorage', {
        reviewsCount: reviews?.length || 0,
        hasStats: !!stats,
        placeId,
        timestamp: data.timestamp
      });

      return true;
    } catch (error) {
      console.warn('❌ [GoogleReviewsStorage] Failed to save reviews data:', error);
      return false;
    }
  }

  /**
   * Load cached reviews data from localStorage
   */
  static loadReviewsData() {
    try {
      const storage = this.getStorage();
      if (!storage) return null;

      const stored = storage.getItem(STORAGE_KEYS.REVIEWS);
      if (!stored) return null;

      const data = JSON.parse(stored);

      // Check if data is expired
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        console.log('⏰ [GoogleReviewsStorage] Cached reviews data expired, removing');
        storage.removeItem(STORAGE_KEYS.REVIEWS);
        return null;
      }

      console.log('✅ [GoogleReviewsStorage] Loaded reviews data from cache', {
        reviewsCount: data.reviews?.length || 0,
        hasStats: !!data.stats,
        placeId: data.placeId,
        age: Date.now() - data.timestamp
      });

      return data;
    } catch (error) {
      console.warn('❌ [GoogleReviewsStorage] Failed to load reviews data:', error);
      return null;
    }
  }

  /**
   * Save place data from Google Places API
   */
  static savePlaceData(placeData, placeId) {
    try {
      const data = {
        placeData,
        placeId,
        timestamp: Date.now(),
        version: '1.0'
      };

      const storage = this.getStorage();
      if (!storage) {
        console.warn('❌ [GoogleReviewsStorage] localStorage not available');
        return false;
      }

      storage.setItem(STORAGE_KEYS.PLACE_DATA, JSON.stringify(data));

      console.log('✅ [GoogleReviewsStorage] Place data saved to localStorage', {
        placeId,
        hasReviews: placeData?.reviews?.length > 0,
        reviewsCount: placeData?.reviews?.length || 0,
        rating: placeData?.rating,
        timestamp: data.timestamp
      });

      return true;
    } catch (error) {
      console.warn('❌ [GoogleReviewsStorage] Failed to save place data:', error);
      return false;
    }
  }

  /**
   * Load cached place data from localStorage
   */
  static loadPlaceData() {
    try {
      const storage = this.getStorage();
      if (!storage) return null;

      const stored = storage.getItem(STORAGE_KEYS.PLACE_DATA);
      if (!stored) return null;

      const data = JSON.parse(stored);

      // Check if data is expired
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        console.log('⏰ [GoogleReviewsStorage] Cached place data expired, removing');
        storage.removeItem(STORAGE_KEYS.PLACE_DATA);
        return null;
      }

      console.log('✅ [GoogleReviewsStorage] Loaded place data from cache', {
        placeId: data.placeId,
        hasReviews: data.placeData?.reviews?.length > 0,
        reviewsCount: data.placeData?.reviews?.length || 0,
        age: Date.now() - data.timestamp
      });

      return data.placeData;
    } catch (error) {
      console.warn('❌ [GoogleReviewsStorage] Failed to load place data:', error);
      return null;
    }
  }

  /**
   * Get last successful fetch timestamp
   */
  static getLastSuccessTime() {
    try {
      const storage = this.getStorage();
      if (!storage) return null;

      const stored = storage.getItem(STORAGE_KEYS.LAST_SUCCESS);
      return stored ? parseInt(stored) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if we have valid cached data (within cache duration)
   */
  static hasValidCache() {
    const lastSuccess = this.getLastSuccessTime();
    if (!lastSuccess) return false;

    return (Date.now() - lastSuccess) < CACHE_DURATION;
  }

  /**
   * Check if we have fallback data (within fallback duration)
   */
  static hasFallbackData() {
    const lastSuccess = this.getLastSuccessTime();
    if (!lastSuccess) return false;

    return (Date.now() - lastSuccess) < FALLBACK_DURATION;
  }

  /**
   * Clear all cached data
   */
  static clearCache() {
    try {
      const storage = this.getStorage();
      if (!storage) {
        console.warn('❌ [GoogleReviewsStorage] localStorage not available');
        return false;
      }

      Object.values(STORAGE_KEYS).forEach(key => {
        storage.removeItem(key);
      });

      console.log('✅ [GoogleReviewsStorage] All cached data cleared');
      return true;
    } catch (error) {
      console.warn('❌ [GoogleReviewsStorage] Failed to clear cache:', error);
      return false;
    }
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats() {
    try {
      const storage = this.getStorage();
      if (!storage) {
        return {
          lastSuccess: null,
          hasValidCache: false,
          hasFallbackData: false,
          cacheAge: null,
          storageKeys: {},
          storageAvailable: false
        };
      }

      const stats = {
        lastSuccess: this.getLastSuccessTime(),
        hasValidCache: this.hasValidCache(),
        hasFallbackData: this.hasFallbackData(),
        cacheAge: this.getLastSuccessTime() ? Date.now() - this.getLastSuccessTime() : null,
        storageKeys: {},
        storageAvailable: true
      };

      // Check each storage key
      Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
        const stored = storage.getItem(storageKey);
        stats.storageKeys[key] = {
          exists: !!stored,
          size: stored ? stored.length : 0
        };
      });

      return stats;
    } catch (error) {
      console.warn('❌ [GoogleReviewsStorage] Failed to get cache stats:', error);
      return null;
    }
  }

  /**
   * Save real reviews as fallback data (separate from cache)
   */
  static saveFallbackReviews(reviews, stats) {
    try {
      const data = {
        reviews,
        stats,
        timestamp: Date.now(),
        version: '1.0'
      };

      const storage = this.getStorage();
      if (!storage) {
        console.warn('❌ [GoogleReviewsStorage] localStorage not available');
        return false;
      }

      storage.setItem(STORAGE_KEYS.FALLBACK_REVIEWS, JSON.stringify(data));

      console.log('✅ [GoogleReviewsStorage] Fallback reviews saved', {
        reviewsCount: reviews?.length || 0,
        hasStats: !!stats,
        timestamp: data.timestamp
      });

      return true;
    } catch (error) {
      console.warn('❌ [GoogleReviewsStorage] Failed to save fallback reviews:', error);
      return false;
    }
  }

  /**
   * Load fallback reviews (older data that can be used when API fails)
   */
  static loadFallbackReviews() {
    try {
      const storage = this.getStorage();
      if (!storage) return null;

      const stored = storage.getItem(STORAGE_KEYS.FALLBACK_REVIEWS);
      if (!stored) return null;

      const data = JSON.parse(stored);

      // Check if fallback data is too old
      if (Date.now() - data.timestamp > FALLBACK_DURATION) {
        console.log('⏰ [GoogleReviewsStorage] Fallback reviews expired, removing');
        storage.removeItem(STORAGE_KEYS.FALLBACK_REVIEWS);
        return null;
      }

      console.log('✅ [GoogleReviewsStorage] Loaded fallback reviews', {
        reviewsCount: data.reviews?.length || 0,
        hasStats: !!data.stats,
        age: Date.now() - data.timestamp
      });

      return data;
    } catch (error) {
      console.warn('❌ [GoogleReviewsStorage] Failed to load fallback reviews:', error);
      return null;
    }
  }
}

export default GoogleReviewsStorage;
export { STORAGE_KEYS, CACHE_DURATION, FALLBACK_DURATION };