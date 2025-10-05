/**
 * Ninsaúde API Client
 *
 * Configures axios base client with:
 * - OAuth2 token injection via request interceptor
 * - Automatic 401 token refresh via response interceptor
 * - Rate limiting middleware (30 req/min)
 *
 * As per research.md and spec requirements
 */

import axios from 'axios';
import { getToken, storeToken } from './redisClient.js';

/**
 * Rate limiter state
 */
let requestCount = 0;
let windowStart = Date.now();
const RATE_LIMIT = 30; // requests per minute
const WINDOW_MS = 60000; // 1 minute

/**
 * Singleton axios instance
 */
let ninsaudeClient = null;

/**
 * Create axios instance with base configuration
 *
 * @returns {import('axios').AxiosInstance} Configured axios instance
 */
export function createApiClient() {
  const baseURL =
    process.env.NINSAUDE_API_URL || 'https://api.ninsaude.com/v1';

  const client = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  return client;
}

/**
 * Get or create Ninsaúde API client (singleton)
 *
 * @returns {import('axios').AxiosInstance} Configured axios instance with interceptors
 */
export function getNinsaudeClient() {
  if (ninsaudeClient) {
    return ninsaudeClient;
  }

  ninsaudeClient = createApiClient();

  // Request interceptor: Inject OAuth2 token and rate limiting
  ninsaudeClient.interceptors.request.use(
    async (config) => {
      // Check rate limit
      const allowed = await handleRateLimit();
      if (!allowed) {
        throw new Error('Rate limit exceeded (30 requests/minute)');
      }

      // Get access token from Redis
      const accessToken = await getToken('access_token');
      if (!accessToken) {
        throw new Error('Access token not found');
      }

      // Inject Bearer token
      config.headers.Authorization = `Bearer ${accessToken}`;

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: Handle 401 with automatic token refresh
  ninsaudeClient.interceptors.response.use(
    (response) => {
      // Pass through successful responses
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized - attempt token refresh
      if (error.response && error.response.status === 401) {
        try {
          // Refresh access token
          const newAccessToken = await refreshAccessToken();

          // Update authorization header with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry original request with new token
          return ninsaudeClient.request(originalRequest);
        } catch (refreshError) {
          // Token refresh failed - propagate error
          return Promise.reject(refreshError);
        }
      }

      // For all other errors, propagate
      return Promise.reject(error);
    }
  );

  return ninsaudeClient;
}

/**
 * Refresh OAuth2 access token using refresh token
 *
 * @returns {Promise<string>} New access token
 * @throws {Error} If refresh token not found or refresh fails
 */
export async function refreshAccessToken() {
  // Get refresh token from Redis
  const refreshToken = await getToken('refresh_token');
  if (!refreshToken) {
    throw new Error('Refresh token not found');
  }

  const tokenUrl =
    process.env.NINSAUDE_API_URL || 'https://api.ninsaude.com/v1';

  try {
    // Request new access token using refresh token
    const response = await axios.post(`${tokenUrl}/oauth/token`, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.NINSAUDE_CLIENT_ID,
      client_secret: process.env.NINSAUDE_CLIENT_SECRET,
    });

    const { access_token, expires_in } = response.data;

    // Store new access token in Redis with TTL
    await storeToken('access_token', access_token, expires_in);

    return access_token;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    throw error;
  }
}

/**
 * Handle rate limiting (30 requests per minute)
 *
 * @returns {Promise<boolean>} True if request is allowed, false if rate limited
 */
export async function handleRateLimit() {
  const now = Date.now();

  // Reset window if 1 minute has passed
  if (now - windowStart >= WINDOW_MS) {
    windowStart = now;
    requestCount = 0;
  }

  // Check if within rate limit
  if (requestCount < RATE_LIMIT) {
    requestCount++;
    return true;
  }

  // Rate limit exceeded
  return false;
}

/**
 * Check if currently rate limited
 *
 * @returns {boolean} True if rate limited
 */
export function isRateLimited() {
  const now = Date.now();

  // Reset if window expired
  if (now - windowStart >= WINDOW_MS) {
    return false;
  }

  return requestCount >= RATE_LIMIT;
}

/**
 * Manually reset rate limiter (useful for testing)
 *
 * @returns {void}
 */
export function resetRateLimiter() {
  requestCount = 0;
  windowStart = Date.now();
}
