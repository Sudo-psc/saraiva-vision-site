/**
 * Simple in-memory cache implementation
 * Fallback for when Redis is not available
 *
 * Features:
 * - Key-value storage with TTL support
 * - Automatic expiration cleanup
 * - Thread-safe operations (single-threaded Node.js)
 *
 * @module utils/memoryCache
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();

    // Cleanup expired entries every minute
    this._cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @param {Object} options - Additional options
   * @param {boolean} options.NX - Only set if key doesn't exist (for atomic operations)
   * @returns {string|null} 'OK' if set, null if NX failed
   */
  async set(key, value, ttl = null, options = {}) {
    // Handle NX (Not eXists) option for atomic lock operations
    if (options.NX && this.cache.has(key)) {
      const entry = this.cache.get(key);
      // Check if entry is still valid (not expired)
      if (!entry.expiresAt || Date.now() <= entry.expiresAt) {
        return null; // Key exists, NX failed
      }
    }

    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Store value with expiration timestamp
    this.cache.set(key, {
      value,
      expiresAt: ttl ? Date.now() + (ttl * 1000) : null
    });

    // Set expiration timer if TTL provided
    if (ttl) {
      const timer = setTimeout(() => {
        this.cache.delete(key);
        this.timers.delete(key);
      }, ttl * 1000);

      this.timers.set(key, timer);
    }

    return 'OK';
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null if not found/expired
   */
  async get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      return null;
    }

    return entry.value;
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  async del(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    return this.cache.delete(key) ? 1 : 0;
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  async exists(key) {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Clear all cache entries
   */
  async flushAll() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.timers.clear();
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number} Number of entries in cache
   */
  size() {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries
   * Called periodically to remove expired entries
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
    }

    if (keysToDelete.length > 0) {
      console.log(`[MemoryCache] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Mock connect method for Redis compatibility
   */
  async connect() {
    console.log('[MemoryCache] Using in-memory cache (Redis not available)');
    return this;
  }

  /**
   * Mock disconnect method for Redis compatibility
   */
  async disconnect() {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }
    await this.flushAll();
    console.log('[MemoryCache] Disconnected and flushed cache');
  }

  /**
   * Get TTL for a key (Redis compatibility)
   * @param {string} key - Cache key
   * @returns {Promise<number>} TTL in seconds (-2 if expired/not found, -1 if no expiration)
   */
  async ttl(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return -2; // Key doesn't exist
    }
    
    if (!entry.expiresAt) {
      return -1; // No expiration set
    }
    
    const remaining = entry.expiresAt - Date.now();
    
    if (remaining <= 0) {
      // Key has expired, clean it up
      this.cache.delete(key);
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      return -2; // Key expired
    }
    
    return Math.ceil(remaining / 1000); // Return TTL in seconds
  }

  /**
   * Increment a numeric value (Redis compatibility)
   * @param {string} key - Cache key
   * @returns {Promise<number>} New value after increment
   */
  async incr(key) {
    const entry = this.cache.get(key);
    
    // Check if key exists and is not expired
    if (entry && (!entry.expiresAt || Date.now() <= entry.expiresAt)) {
      const currentValue = parseInt(entry.value) || 0;
      const newValue = currentValue + 1;
      
      // Update value while preserving TTL
      this.cache.set(key, {
        value: newValue,
        expiresAt: entry.expiresAt
      });
      
      return newValue;
    } else {
      // Key doesn't exist or expired, initialize to 1
      if (entry && entry.expiresAt && Date.now() > entry.expiresAt) {
        // Clean up expired entry
        this.cache.delete(key);
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key));
          this.timers.delete(key);
        }
      }
      
      this.cache.set(key, {
        value: 1,
        expiresAt: null
      });
      
      return 1;
    }
  }

  /**
   * Set expiration for a key (Redis compatibility)
   * @param {string} key - Cache key
   * @param {number} ttl - TTL in seconds
   * @returns {Promise<number>} 1 if successful, 0 if key not found
   */
  async expire(key, ttl) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return 0; // Key not found
    }
    
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    // Set new expiration
    const expiresAt = Date.now() + (ttl * 1000);
    entry.expiresAt = expiresAt;
    
    // Set new timer
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, ttl * 1000);
    
    this.timers.set(key, timer);
    
    return 1; // Success
  }

  /**
   * Mock event handlers for Redis compatibility
   */
  on(event, handler) {
    // No-op for compatibility
  }
}

// Singleton instance
let instance = null;

/**
 * Get or create singleton cache instance
 * @returns {MemoryCache}
 */
export function getMemoryCache() {
  if (!instance) {
    instance = new MemoryCache();
  }
  return instance;
}

export default MemoryCache;
