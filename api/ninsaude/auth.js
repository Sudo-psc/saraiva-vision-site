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

import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { getMemoryCache } from './utils/memoryCache.js';

// Cache client (in-memory fallback when Redis not available)
let cacheClient = null;

/**
 * Initialize cache client (uses in-memory cache as fallback)
 * @returns {Promise<Object>} Cache client instance
 */
async function getCacheClient() {
  if (cacheClient) {
    return cacheClient;
  }

  // Try Redis first if configured
  if (process.env.REDIS_URL) {
    try {
      const { createClient } = await import('redis');

      cacheClient = createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 2000,
          reconnectStrategy: () => false // Don't retry on failure
        }
      });

      cacheClient.on('error', () => {
        console.warn('[Ninsaúde Auth] Redis unavailable, falling back to memory cache');
        cacheClient = null;
      });

      await cacheClient.connect();
      console.log('[Ninsaúde Auth] Redis connected successfully');
      return cacheClient;
    } catch (error) {
      console.warn('[Ninsaúde Auth] Redis connection failed, using memory cache');
    }
  }

  // Fallback to in-memory cache
  cacheClient = getMemoryCache();
  await cacheClient.connect();
  return cacheClient;
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
async function acquireTokenLock(cache) {
  try {
    const lockId = crypto.randomUUID();

    // Atomic set operation: only set if key doesn't exist (NX option)
    const result = await cache.set(
      OAUTH_CONFIG.tokenLockKey,
      lockId,
      OAUTH_CONFIG.lockTimeout / 1000, // Convert ms to seconds
      { NX: true } // Only set if doesn't exist
    );

    // Return true if lock was acquired (result === 'OK')
    return result === 'OK';
  } catch (error) {
    console.error('[Ninsaúde Auth] Error acquiring token lock:', error);
    return false;
  }
}

/**
 * Releases distributed lock
 * @param {Object} redis - Redis client instance
 */
async function releaseTokenLock(cache) {
  try {
    await cache.del(OAUTH_CONFIG.tokenLockKey);
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
  const cache = await getCacheClient();

  try {
    // Store access token with 14-minute TTL (1 min safety margin)
    await cache.set(
      OAUTH_CONFIG.accessTokenKey,
      accessToken,
      OAUTH_CONFIG.accessTokenTTL
    );

    // Store refresh token with 7-day TTL
    await cache.set(
      OAUTH_CONFIG.refreshTokenKey,
      refreshToken,
      OAUTH_CONFIG.refreshTokenTTL
    );

    console.log('[Ninsaúde Auth] Tokens stored in cache (access: 14min, refresh: 7days)');
  } catch (error) {
    console.error('[Ninsaúde Auth] Error storing tokens in cache:', error);
    throw error;
  }
}

/**
 * Get access token from Redis cache
 *
 * @returns {Promise<string|null>} Access token or null if not found/expired
 */
async function getCachedAccessToken() {
  const cache = await getCacheClient();

  try {
    const token = await cache.get(OAUTH_CONFIG.accessTokenKey);

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
  const cache = await getCacheClient();

  try {
    return await cache.get(OAUTH_CONFIG.refreshTokenKey);
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
  const cache = await getCacheClient();

  // Try to get cached token first
  const cachedToken = await getCachedAccessToken();
  if (cachedToken) {
    return cachedToken;
  }

  // Need to obtain new token - acquire lock to prevent race conditions
  console.log('[Ninsaúde Auth] No cached token found, acquiring lock...');
  const lockAcquired = await acquireTokenLock(cache);

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
      await releaseTokenLock(cache);
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
    await releaseTokenLock(cache);
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
  const cache = await getCacheClient();
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
  const cache = await getCacheClient();

  try {
    await cache.del(OAUTH_CONFIG.accessTokenKey);
    await cache.del(OAUTH_CONFIG.refreshTokenKey);
    await cache.del(OAUTH_CONFIG.tokenLockKey);
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
  const cache = await getCacheClient();

  try {
    const accessToken = await cache.get(OAUTH_CONFIG.accessTokenKey);
    const refreshToken = await cache.get(OAUTH_CONFIG.refreshTokenKey);

    // Note: In-memory cache doesn't support TTL queries, return simplified status
    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenTTL: accessToken ? 840 : -2, // Estimated TTL
      refreshTokenTTL: refreshToken ? 604800 : -2, // Estimated TTL
      accessTokenExpiry: accessToken ? new Date(Date.now() + 840 * 1000).toISOString() : null,
      refreshTokenExpiry: refreshToken ? new Date(Date.now() + 604800 * 1000).toISOString() : null
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

/**
 * Express Router for Auth Endpoints
 */
const router = express.Router();

/**
 * POST /api/ninsaude/auth/token
 * Get or refresh OAuth2 access token
 */
router.post('/token', async (req, res, next) => {
  try {
    validateConfig();
    const accessToken = await getAccessToken();
    const status = await getTokenStatus();

    res.json({
      success: true,
      accessToken,
      expiresAt: status.accessTokenExpiry,
      tokenType: 'Bearer'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ninsaude/auth/status
 * Get current token status (for monitoring)
 */
router.get('/status', async (req, res, next) => {
  try {
    const status = await getTokenStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ninsaude/auth/refresh
 * Force token refresh
 */
router.post('/refresh', async (req, res, next) => {
  try {
    validateConfig();
    const accessToken = await refreshAccessToken();
    const status = await getTokenStatus();

    res.json({
      success: true,
      accessToken,
      expiresAt: status.accessTokenExpiry,
      tokenType: 'Bearer'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/ninsaude/auth/cache
 * Clear token cache (admin/testing only)
 */
router.delete('/cache', async (req, res, next) => {
  try {
    await clearTokenCache();
    res.json({
      success: true,
      message: 'Token cache cleared successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;

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
