/**
 * Ninsaúde OAuth2 Token Validation Middleware
 * Validates token expiry, auto-refreshes if needed, injects token into request context
 * Requirements: T031, OAuth2 token management with 15-minute expiry
 */

import crypto from 'crypto';

/**
 * Token validation configuration
 */
const TOKEN_CONFIG = {
    expiryThresholdMs: 5 * 60 * 1000, // 5 minutes in milliseconds
    redisKeyPrefix: 'ninsaude:token',
    tokenRefreshEndpoint: '/api/ninsaude/auth/refresh'
};

/**
 * Get token data from Redis cache
 * @param {Object} redisClient - Redis client instance
 * @returns {Promise<Object|null>} Token data or null if not found
 */
async function getTokenFromCache(redisClient) {
    try {
        const tokenKey = `${TOKEN_CONFIG.redisKeyPrefix}:access`;
        const tokenData = await redisClient.get(tokenKey);

        if (!tokenData) {
            return null;
        }

        return JSON.parse(tokenData);
    } catch (error) {
        console.error('Redis token retrieval error:', error);
        return null;
    }
}

/**
 * Check if token is expired or near expiry
 * @param {Object} tokenData - Token data object
 * @returns {boolean} True if token needs refresh
 */
function needsRefresh(tokenData) {
    if (!tokenData || !tokenData.expiresAt) {
        return true;
    }

    const now = Date.now();
    const expiresAt = new Date(tokenData.expiresAt).getTime();
    const timeUntilExpiry = expiresAt - now;

    // Refresh if less than 5 minutes remaining
    return timeUntilExpiry < TOKEN_CONFIG.expiryThresholdMs;
}

/**
 * Refresh OAuth2 access token
 * @param {Object} redisClient - Redis client instance
 * @returns {Promise<Object>} Refreshed token data
 */
async function refreshToken(redisClient) {
    try {
        // Get refresh token from Redis
        const refreshTokenKey = `${TOKEN_CONFIG.redisKeyPrefix}:refresh`;
        const refreshTokenData = await redisClient.get(refreshTokenKey);

        if (!refreshTokenData) {
            throw new Error('No refresh token available');
        }

        const { refreshToken } = JSON.parse(refreshTokenData);

        // Call token refresh endpoint (implementation in auth.js)
        const response = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3002'}${TOKEN_CONFIG.tokenRefreshEndpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Token refresh failed');
        }

        const newTokenData = await response.json();
        return newTokenData.data;
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
}

/**
 * Store token data in Redis with TTL
 * @param {Object} redisClient - Redis client instance
 * @param {Object} tokenData - Token data to store
 */
async function storeTokenInCache(redisClient, tokenData) {
    try {
        const tokenKey = `${TOKEN_CONFIG.redisKeyPrefix}:access`;
        const expiresAt = new Date(tokenData.expiresAt).getTime();
        const now = Date.now();
        const ttlSeconds = Math.floor((expiresAt - now) / 1000);

        if (ttlSeconds > 0) {
            await redisClient.setex(
                tokenKey,
                ttlSeconds,
                JSON.stringify(tokenData)
            );
        }
    } catch (error) {
        console.error('Redis token storage error:', error);
    }
}

/**
 * Validate and inject OAuth2 token middleware
 * @param {Object} redisClient - Redis client instance (injected by app setup)
 * @returns {Function} Express middleware function
 */
export function validateToken(redisClient) {
    return async (req, res, next) => {
        try {
            // Skip validation for public endpoints (if any)
            if (req.path.includes('/auth/login') || req.path.includes('/auth/callback')) {
                return next();
            }

            // Retrieve token from Redis cache
            let tokenData = await getTokenFromCache(redisClient);

            // Check if token needs refresh
            if (needsRefresh(tokenData)) {
                try {
                    // Attempt token refresh
                    tokenData = await refreshToken(redisClient);

                    // Store refreshed token
                    await storeTokenInCache(redisClient, tokenData);
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);

                    // Return 401 Unauthorized if refresh fails
                    return res.status(401).json({
                        success: false,
                        error: {
                            code: 'token_refresh_failed',
                            message: 'Falha ao renovar token de autenticação.',
                            category: 'authentication',
                            severity: 'high',
                            recovery: 'Faça login novamente para continuar.',
                            retryable: true,
                            timestamp: new Date().toISOString(),
                            requestId: req.security?.requestId || crypto.randomUUID()
                        }
                    });
                }
            }

            // Validate token structure
            if (!tokenData || !tokenData.accessToken) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'invalid_token',
                        message: 'Token de autenticação inválido ou ausente.',
                        category: 'authentication',
                        severity: 'high',
                        recovery: 'Faça login novamente.',
                        retryable: false,
                        timestamp: new Date().toISOString(),
                        requestId: req.security?.requestId || crypto.randomUUID()
                    }
                });
            }

            // Inject token into request context
            req.ninsaudeToken = {
                accessToken: tokenData.accessToken,
                expiresAt: tokenData.expiresAt,
                tokenType: tokenData.tokenType || 'Bearer',
                scope: tokenData.scope || []
            };

            // Set authorization header for downstream requests
            req.headers['x-ninsaude-token'] = tokenData.accessToken;

            next();
        } catch (error) {
            console.error('Token validation middleware error:', error);

            return res.status(500).json({
                success: false,
                error: {
                    code: 'token_validation_error',
                    message: 'Erro ao validar autenticação.',
                    category: 'system',
                    severity: 'critical',
                    recovery: 'Tente novamente em alguns instantes.',
                    retryable: true,
                    timestamp: new Date().toISOString(),
                    requestId: req.security?.requestId || crypto.randomUUID()
                }
            });
        }
    };
}

/**
 * Helper function to manually refresh token
 * Can be used by other modules for proactive refresh
 * @param {Object} redisClient - Redis client instance
 * @returns {Promise<Object>} Refreshed token data
 */
export async function forceRefreshToken(redisClient) {
    const tokenData = await refreshToken(redisClient);
    await storeTokenInCache(redisClient, tokenData);
    return tokenData;
}

export default validateToken;
