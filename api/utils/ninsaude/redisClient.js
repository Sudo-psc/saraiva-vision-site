/**
 * Redis Client Utility for Ninsaúde Integration
 *
 * Provides Redis connection and operations for:
 * - OAuth token storage with TTL (15 minutes)
 * - Request queue operations (FIFO)
 * - Health checks
 *
 * Uses ioredis for better performance and features
 */

import Redis from 'ioredis';

/**
 * Redis client instance (singleton)
 */
export let redisClient = null;

/**
 * Check if Redis client is ready
 *
 * @returns {boolean} True if client is ready
 */
function isClientReady() {
  if (!redisClient) return false;

  // ioredis-mock doesn't have a status property, so check if it's defined and operational
  if (redisClient.status === undefined) {
    // Assume mock is ready if client exists
    return true;
  }

  // For real ioredis, check status
  return redisClient.status === 'ready' || redisClient.status === 'connect';
}

/**
 * Initialize Redis connection
 *
 * @returns {Promise<Redis>} Redis client instance
 */
export async function initRedis() {
  // Return existing client if already initialized
  if (isClientReady()) {
    return redisClient;
  }

  // Create new Redis client
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redisPassword = process.env.REDIS_PASSWORD;

  const options = {
    lazyConnect: false,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };

  // Add password if provided
  if (redisPassword) {
    options.password = redisPassword;
  }

  redisClient = new Redis(redisUrl, options);

  // Handle connection events (only for real ioredis, not mock)
  if (redisClient.on) {
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully');
    });
  }

  // Wait for connection to be ready (only if using real ioredis with status)
  if (redisClient.status !== undefined) {
    await new Promise((resolve) => {
      if (redisClient.status === 'ready' || redisClient.status === 'connect') {
        resolve();
      } else {
        redisClient.once('ready', resolve);
        redisClient.once('connect', resolve);
      }
    });
  }

  return redisClient;
}

/**
 * Close Redis connection
 *
 * @returns {Promise<void>}
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
  }
}

/**
 * Store OAuth token with TTL
 *
 * @param {string} tokenType - Token type (e.g., 'access_token', 'refresh_token')
 * @param {string} token - Token value
 * @param {number} ttl - Time to live in seconds (default: 900 = 15 minutes)
 * @returns {Promise<void>}
 */
export async function storeToken(tokenType, token, ttl = 900) {
  if (!isClientReady()) {
    throw new Error('Redis client not initialized');
  }

  const key = `ninsaude:token:${tokenType}`;
  await redisClient.setex(key, ttl, token);
}

/**
 * Get OAuth token from Redis
 *
 * @param {string} tokenType - Token type
 * @returns {Promise<string|null>} Token value or null if not found
 */
export async function getToken(tokenType) {
  if (!isClientReady()) {
    throw new Error('Redis client not initialized');
  }

  const key = `ninsaude:token:${tokenType}`;
  return await redisClient.get(key);
}

/**
 * Delete OAuth token from Redis
 *
 * @param {string} tokenType - Token type
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteToken(tokenType) {
  if (!isClientReady()) {
    throw new Error('Redis client not initialized');
  }

  const key = `ninsaude:token:${tokenType}`;
  const result = await redisClient.del(key);
  return result === 1;
}

/**
 * Enqueue request to FIFO queue
 *
 * @param {string} queueName - Queue name
 * @param {Object} request - Request data to enqueue
 * @returns {Promise<void>}
 */
export async function enqueueRequest(queueName, request) {
  if (!isClientReady()) {
    throw new Error('Redis client not initialized');
  }

  const key = `ninsaude:queue:${queueName}`;
  const serialized = JSON.stringify(request);
  await redisClient.rpush(key, serialized);
}

/**
 * Dequeue request from FIFO queue (left pop)
 *
 * @param {string} queueName - Queue name
 * @returns {Promise<Object|null>} Dequeued request or null if empty
 */
export async function dequeueRequest(queueName) {
  if (!isClientReady()) {
    throw new Error('Redis client not initialized');
  }

  const key = `ninsaude:queue:${queueName}`;
  const serialized = await redisClient.lpop(key);

  if (!serialized) {
    return null;
  }

  return JSON.parse(serialized);
}

/**
 * Get queue length
 *
 * @param {string} queueName - Queue name
 * @returns {Promise<number>} Number of items in queue
 */
export async function getQueueLength(queueName) {
  if (!isClientReady()) {
    throw new Error('Redis client not initialized');
  }

  const key = `ninsaude:queue:${queueName}`;
  return await redisClient.llen(key);
}

/**
 * Clear entire queue
 *
 * @param {string} queueName - Queue name
 * @returns {Promise<void>}
 */
export async function clearQueue(queueName) {
  if (!isClientReady()) {
    throw new Error('Redis client not initialized');
  }

  const key = `ninsaude:queue:${queueName}`;
  await redisClient.del(key);
}

/**
 * Set key-value with expiry
 *
 * @param {string} key - Key name
 * @param {string} value - Value to store
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<void>}
 */
export async function setWithExpiry(key, value, ttl) {
  if (!isClientReady()) {
    throw new Error('Redis client not initialized');
  }

  await redisClient.setex(key, ttl, value);
}

/**
 * Health check for Redis connection
 *
 * @returns {Promise<boolean>} True if healthy, false otherwise
 */
export async function healthCheck() {
  try {
    if (!isClientReady()) {
      return false;
    }

    // Ping Redis server
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}
