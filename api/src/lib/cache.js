/**
 * Redis Cache Layer
 * Author: Dr. Philipe Saraiva Cruz
 * High-performance caching with TTL and fallback
 */

import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.memoryCache = new Map(); // Fallback in-memory cache
  }

  async connect() {
    try {
      // Try to connect to Redis if URL is provided
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              logger.warn('Redis connection failed, using in-memory cache');
              return false; // Stop reconnecting after 3 attempts
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', { error: err.message });
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis connected successfully');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      logger.warn('Failed to initialize Redis, using in-memory cache', { error: error.message });
      this.isConnected = false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    try {
      if (this.isConnected && this.client) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Fallback to memory cache
        const cached = this.memoryCache.get(key);
        if (cached && cached.expires > Date.now()) {
          return cached.value;
        }
        this.memoryCache.delete(key);
        return null;
      }
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(key, value, ttlSeconds = 3600) {
    try {
      if (this.isConnected && this.client) {
        await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      } else {
        // Fallback to memory cache
        this.memoryCache.set(key, {
          value,
          expires: Date.now() + (ttlSeconds * 1000)
        });

        // Cleanup old entries if memory cache grows too large
        if (this.memoryCache.size > 1000) {
          this.cleanupMemoryCache();
        }
      }
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
    }
  }

  /**
   * Delete value from cache
   */
  async del(key) {
    try {
      if (this.isConnected && this.client) {
        await this.client.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      if (this.isConnected && this.client) {
        await this.client.flushAll();
      } else {
        this.memoryCache.clear();
      }
    } catch (error) {
      logger.error('Cache clear error', { error: error.message });
    }
  }

  /**
   * Cleanup expired entries from memory cache
   */
  cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, data] of this.memoryCache.entries()) {
      if (data.expires <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
      }
    } catch (error) {
      logger.error('Cache disconnect error', { error: error.message });
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      type: this.isConnected ? 'redis' : 'memory',
      connected: this.isConnected,
      memoryEntries: this.memoryCache.size
    };
  }
}

// Singleton instance
const cache = new CacheManager();

export { cache };
