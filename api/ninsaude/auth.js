/**
 * Ninsaúde OAuth2 Authentication Module (T035)
 *
 * Implements OAuth2 password grant flow with automatic token management.
 * Reference: /specs/001-ninsaude-integration/data-model.md (Section 8)
 *
 * Features:
 * - OAuth2 password grant authentication
 * - Automatic access token refresh (15min expiry)
 * - Redis-based token caching (14min TTL)
 * - Refresh token handling (7-day TTL)
 * - Thread-safe token operations
 *
 * Endpoints consumed:
 * - POST /oauth2/token (Ninsaúde API)
 *
 * Environment variables required:
 * - NINSAUDE_API_URL
 * - NINSAUDE_ACCOUNT
 * - NINSAUDE_USERNAME
 * - NINSAUDE_PASSWORD
 * - REDIS_URL (optional, defaults to localhost)
 */

import axios from 'axios';
import crypto from 'crypto';

// Redis client (will be created when module loads)
let redisClient = null;

/**
 * Initialize Redis client lazily
 * @returns {Promise<Object>} Redis client instance
 */
async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const { createClient } = await import('redis');

  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          return new Error('Redis connection failed after 10 retries');
        }
        return Math.min(retries * 50, 1000);
      }
    }
  });

  redisClient.on('error', (err) => {
    console.error('[Ninsaúde Auth] Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('[Ninsaúde Auth] Redis connected successfully');
  });

  await redisClient.connect();
  return redisClient;
}

/**
 * OAuth2 Configuration
 */
const OAUTH_CONFIG = {
  tokenUrl: `${process.env.NINSAUDE_API_URL || 'https://api.ninsaude.com/v1'}/oauth2/token`,
  account: process.env.NINSAUDE_ACCOUNT,
  username: process.env.NINSAUDE_USERNAME,
  password: process.env.NINSAUDE_PASSWORD,
  accountUnit: process.env.NINSAUDE_ACCOUNT_UNIT || '1',

  // Token TTLs
  accessTokenTTL: 840, // 14 minutes (1 min before actual 15min expiry)
  refreshTokenTTL: 604800, // 7 days in seconds

  // Redis keys
  accessTokenKey: 'ninsaude:access_token',
  refreshTokenKey: 'ninsaude:refresh_token',
  tokenLockKey: 'ninsaude:token_lock',

  // Lock timeout for thread-safe token refresh
  lockTimeout: 5000, // 5 seconds
};

/**
 * Validates OAuth2 configuration
 * @throws {Error} If required environment variables are missing
 */
function validateConfig() {
  const required = ['NINSAUDE_API_URL', 'NINSAUDE_ACCOUNT', 'NINSAUDE_USERNAME', 'NINSAUDE_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required Ninsaúde environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Acquires distributed lock for token refresh operation
 * Prevents race conditions when multiple requests try to refresh simultaneously
 *
 * @param {Object} redis - Redis client instance
 * @returns {Promise<boolean>} True if lock acquired
 */
async function acquireTokenLock(redis) {
  try {
    const lockId = crypto.randomUUID();
    const acquired = await redis.set(
      OAUTH_CONFIG.tokenLockKey,
      lockId,
      {
        NX: true, // Only set if doesn't exist
        PX: OAUTH_CONFIG.lockTimeout // Expire after 5 seconds
      }
    );

    return acquired === 'OK';
  } catch (error) {
    console.error('[Ninsaúde Auth] Error acquiring token lock:', error);
    return false;
  }
}

/**
 * Releases distributed lock
 * @param {Object} redis - Redis client instance
 */
async function releaseTokenLock(redis) {
  try {
    await redis.del(OAUTH_CONFIG.tokenLockKey);
  } catch (error) {
    console.error('[Ninsaúde Auth] Error releasing token lock:', error);
  }
}

/**
 * Request new access token from Ninsaúde using password grant
 *
 * @returns {Promise<Object>} Token response with access_token, refresh_token, expires_in
 * @throws {Error} If authentication fails
 */
async function requestAccessToken() {
  validateConfig();

  try {
    const payload = {
      grant_type: 'password',
      account: OAUTH_CONFIG.account,
      username: OAUTH_CONFIG.username,
      password: OAUTH_CONFIG.password,
      account_unit: OAUTH_CONFIG.accountUnit
    };

    console.log('[Ninsaúde Auth] Requesting new access token...');

    const response = await axios.post(OAUTH_CONFIG.tokenUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.data.access_token) {
      throw new Error('No access token in response');
    }

    console.log('[Ninsaúde Auth] Access token obtained successfully');

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in || 900, // Default 15 minutes
      token_type: response.data.token_type || 'Bearer'
    };
  } catch (error) {
    console.error('[Ninsaúde Auth] Failed to obtain access token:', error.message);

    if (error.response) {
      console.error('[Ninsaúde Auth] Response status:', error.response.status);
      console.error('[Ninsaúde Auth] Response data:', error.response.data);
    }

    throw new Error(`OAuth2 authentication failed: ${error.message}`);
  }
}

/**
 * Request new access token using refresh token
 *
 * @param {string} refreshToken - Valid refresh token
 * @returns {Promise<Object>} Token response
 * @throws {Error} If refresh fails
 */
async function requestTokenRefresh(refreshToken) {
  validateConfig();

  try {
    const payload = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      account: OAUTH_CONFIG.account,
      account_unit: OAUTH_CONFIG.accountUnit
    };

    console.log('[Ninsaúde Auth] Refreshing access token...');

    const response = await axios.post(OAUTH_CONFIG.tokenUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000
    });

    if (!response.data.access_token) {
      throw new Error('No access token in refresh response');
    }

    console.log('[Ninsaúde Auth] Access token refreshed successfully');

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token || refreshToken, // Reuse if not provided
      expires_in: response.data.expires_in || 900,
      token_type: response.data.token_type || 'Bearer'
    };
  } catch (error) {
    console.error('[Ninsaúde Auth] Failed to refresh access token:', error.message);
    throw new Error(`Token refresh failed: ${error.message}`);
  }
}

/**
 * Store tokens in Redis with appropriate TTLs
 *
 * @param {string} accessToken - Access token
 * @param {string} refreshToken - Refresh token
 * @param {number} expiresIn - Access token expiry in seconds (from Ninsaúde)
 */
async function storeTokens(accessToken, refreshToken, expiresIn) {
  const redis = await getRedisClient();

  try {
    // Store access token with 14-minute TTL (1 min safety margin)
    await redis.setEx(
      OAUTH_CONFIG.accessTokenKey,
      OAUTH_CONFIG.accessTokenTTL,
      accessToken
    );

    // Store refresh token with 7-day TTL
    await redis.setEx(
      OAUTH_CONFIG.refreshTokenKey,
      OAUTH_CONFIG.refreshTokenTTL,
      refreshToken
    );

    console.log('[Ninsaúde Auth] Tokens stored in Redis (access: 14min, refresh: 7days)');
  } catch (error) {
    console.error('[Ninsaúde Auth] Error storing tokens in Redis:', error);
    throw error;
  }
}

/**
 * Get access token from Redis cache
 *
 * @returns {Promise<string|null>} Access token or null if not found/expired
 */
async function getCachedAccessToken() {
  const redis = await getRedisClient();

  try {
    const token = await redis.get(OAUTH_CONFIG.accessTokenKey);

    if (token) {
      console.log('[Ninsaúde Auth] Using cached access token');
    }

    return token;
  } catch (error) {
    console.error('[Ninsaúde Auth] Error retrieving cached token:', error);
    return null;
  }
}

/**
 * Get refresh token from Redis cache
 *
 * @returns {Promise<string|null>} Refresh token or null if not found/expired
 */
async function getCachedRefreshToken() {
  const redis = await getRedisClient();

  try {
    return await redis.get(OAUTH_CONFIG.refreshTokenKey);
  } catch (error) {
    console.error('[Ninsaúde Auth] Error retrieving refresh token:', error);
    return null;
  }
}

/**
 * Get valid access token (from cache or request new one)
 * Thread-safe implementation with distributed locking
 *
 * @returns {Promise<string>} Valid access token
 * @throws {Error} If unable to obtain token
 *
 * @example
 * const token = await getAccessToken();
 * // Use token in Authorization header: `Bearer ${token}`
 */
export async function getAccessToken() {
  const redis = await getRedisClient();

  // Try to get cached token first
  const cachedToken = await getCachedAccessToken();
  if (cachedToken) {
    return cachedToken;
  }

  // Need to obtain new token - acquire lock to prevent race conditions
  console.log('[Ninsaúde Auth] No cached token found, acquiring lock...');
  const lockAcquired = await acquireTokenLock(redis);

  if (!lockAcquired) {
    // Another process is already refreshing, wait and retry
    console.log('[Ninsaúde Auth] Another process is refreshing token, waiting...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check cache again after waiting
    const retryToken = await getCachedAccessToken();
    if (retryToken) {
      return retryToken;
    }

    throw new Error('Failed to acquire token lock and no cached token available');
  }

  try {
    // Double-check cache after acquiring lock (another process may have refreshed)
    const doubleCheckToken = await getCachedAccessToken();
    if (doubleCheckToken) {
      await releaseTokenLock(redis);
      return doubleCheckToken;
    }

    // Try to use refresh token first
    const refreshToken = await getCachedRefreshToken();
    let tokenData;

    if (refreshToken) {
      try {
        tokenData = await requestTokenRefresh(refreshToken);
      } catch (refreshError) {
        console.log('[Ninsaúde Auth] Refresh token failed, requesting new token');
        tokenData = await requestAccessToken();
      }
    } else {
      tokenData = await requestAccessToken();
    }

    // Store tokens in cache
    await storeTokens(
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in
    );

    return tokenData.access_token;
  } finally {
    // Always release lock
    await releaseTokenLock(redis);
  }
}

/**
 * Refresh access token manually (exported for middleware use)
 *
 * @returns {Promise<string>} New access token
 * @throws {Error} If refresh fails
 *
 * @example
 * const newToken = await refreshAccessToken();
 */
export async function refreshAccessToken() {
  const redis = await getRedisClient();
  const refreshToken = await getCachedRefreshToken();

  if (!refreshToken) {
    console.log('[Ninsaúde Auth] No refresh token, requesting new access token');
    const tokenData = await requestAccessToken();
    await storeTokens(tokenData.access_token, tokenData.refresh_token, tokenData.expires_in);
    return tokenData.access_token;
  }

  try {
    const tokenData = await requestTokenRefresh(refreshToken);
    await storeTokens(tokenData.access_token, tokenData.refresh_token, tokenData.expires_in);
    return tokenData.access_token;
  } catch (error) {
    // If refresh fails, fall back to password grant
    console.log('[Ninsaúde Auth] Refresh failed, falling back to password grant');
    const tokenData = await requestAccessToken();
    await storeTokens(tokenData.access_token, tokenData.refresh_token, tokenData.expires_in);
    return tokenData.access_token;
  }
}

/**
 * Clear all cached tokens (useful for logout or testing)
 *
 * @example
 * await clearTokenCache();
 */
export async function clearTokenCache() {
  const redis = await getRedisClient();

  try {
    await redis.del(OAUTH_CONFIG.accessTokenKey);
    await redis.del(OAUTH_CONFIG.refreshTokenKey);
    await redis.del(OAUTH_CONFIG.tokenLockKey);
    console.log('[Ninsaúde Auth] Token cache cleared');
  } catch (error) {
    console.error('[Ninsaúde Auth] Error clearing token cache:', error);
    throw error;
  }
}

/**
 * Get token status (for monitoring/debugging)
 *
 * @returns {Promise<Object>} Token status information
 */
export async function getTokenStatus() {
  const redis = await getRedisClient();

  try {
    const accessToken = await redis.get(OAUTH_CONFIG.accessTokenKey);
    const refreshToken = await redis.get(OAUTH_CONFIG.refreshTokenKey);
    const accessTTL = accessToken ? await redis.ttl(OAUTH_CONFIG.accessTokenKey) : -2;
    const refreshTTL = refreshToken ? await redis.ttl(OAUTH_CONFIG.refreshTokenKey) : -2;

    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenTTL: accessTTL,
      refreshTokenTTL: refreshTTL,
      accessTokenExpiry: accessTTL > 0 ? new Date(Date.now() + accessTTL * 1000).toISOString() : null,
      refreshTokenExpiry: refreshTTL > 0 ? new Date(Date.now() + refreshTTL * 1000).toISOString() : null
    };
  } catch (error) {
    console.error('[Ninsaúde Auth] Error getting token status:', error);
    return {
      hasAccessToken: false,
      hasRefreshToken: false,
      error: error.message
    };
  }
}

// Export for testing
export const _testing = {
  OAUTH_CONFIG,
  validateConfig,
  requestAccessToken,
  requestTokenRefresh,
  storeTokens,
  getCachedAccessToken,
  getCachedRefreshToken,
  acquireTokenLock,
  releaseTokenLock
};
