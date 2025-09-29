// Authentication Middleware for External WordPress Integration
// API key authentication and source validation

import { createErrorResponse } from '../utils/error-handler.js';
import { logger } from '../utils/logger.js';

// API key sources (environment variables)
const API_KEYS = process.env.EXTERNAL_WP_API_KEYS
  ? process.env.EXTERNAL_WP_API_KEYS.split(',').map(key => key.trim())
  : [];

// Admin API keys with elevated privileges
const ADMIN_API_KEYS = process.env.EXTERNAL_WP_ADMIN_API_KEYS
  ? process.env.EXTERNAL_WP_ADMIN_API_KEYS.split(',').map(key => key.trim())
  : [];

/**
 * Validate API key from request
 * @param {string} apiKey - API key to validate
 * @returns {Object} Validation result with user info and privileges
 */
const validateApiKey = (apiKey) => {
  if (!apiKey) {
    return {
      valid: false,
      error: 'API key is required',
      user: null,
      privileges: null
    };
  }

  // Check if it's an admin key
  if (ADMIN_API_KEYS.includes(apiKey)) {
    return {
      valid: true,
      user: {
        id: 'admin',
        type: 'admin',
        name: 'System Administrator'
      },
      privileges: {
        canCreateSources: true,
        canDeleteSources: true,
        canManageAllSources: true,
        canBypassRateLimits: true
      }
    };
  }

  // Check if it's a regular API key
  if (API_KEYS.includes(apiKey)) {
    return {
      valid: true,
      user: {
        id: 'api-user',
        type: 'api',
        name: 'API User'
      },
      privileges: {
        canCreateSources: false,
        canDeleteSources: false,
        canManageAllSources: false,
        canBypassRateLimits: false
      }
    };
  }

  return {
    valid: false,
    error: 'Invalid API key',
    user: null,
    privileges: null
  };
};

/**
 * Extract API key from request headers
 * @param {Object} headers - Request headers
 * @returns {string|null} API key or null if not found
 */
const extractApiKey = (headers) => {
  // Check Authorization header (Bearer token)
  const authHeader = headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = headers['x-api-key'];
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Check API-Key header
  const apiKeyHeader2 = headers['api-key'];
  if (apiKeyHeader2) {
    return apiKeyHeader2;
  }

  return null;
};

/**
 * Authentication middleware
 * Validates API keys and sets user context
 */
export const authenticateRequest = async (req, res, next) => {
  try {
    // Skip authentication for health check endpoint
    if (req.path === '/health') {
      return next();
    }

    const apiKey = extractApiKey(req.headers);
    const authResult = validateApiKey(apiKey);

    if (!authResult.valid) {
      logger.warn('Authentication failed', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        error: authResult.error
      });

      return res.status(401).json(createErrorResponse(
        'AUTHENTICATION_ERROR',
        authResult.error,
        {
          path: req.path,
          timestamp: new Date().toISOString()
        }
      ));
    }

    // Set user context on request
    req.user = authResult.user;
    req.privileges = authResult.privileges;

    logger.info('Authentication successful', {
      path: req.path,
      method: req.method,
      userId: authResult.user.id,
      userType: authResult.user.type,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  } catch (error) {
    logger.error('Authentication middleware error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    res.status(500).json(createErrorResponse(
      'INTERNAL_ERROR',
      'Authentication service unavailable',
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
    ));
  }
};

/**
 * Admin-only middleware
 * Restricts access to administrators only
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.type !== 'admin') {
      logger.warn('Admin access denied', {
        path: req.path,
        method: req.method,
        userId: req.user?.id || 'anonymous',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json(createErrorResponse(
        'AUTHORIZATION_ERROR',
        'Admin privileges required',
        {
          path: req.path,
          timestamp: new Date().toISOString()
        }
      ));
    }

    next();
  } catch (error) {
    logger.error('Admin middleware error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    res.status(500).json(createErrorResponse(
      'INTERNAL_ERROR',
      'Authorization service unavailable',
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
    ));
  }
};

/**
 * Source ownership middleware
 * Validates that the user has permission to access the specified source
 */
export const validateSourceAccess = async (req, res, next) => {
  try {
    const { sourceId } = req.params;

    // Check if user is authenticated
    if (!req.user) {
      logger.warn('Source access attempted without authentication', {
        sourceId,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    // Admin users can access all sources
    if (req.user.type === 'admin') {
      return next();
    }

    // For non-admin users, we would typically check database ownership
    // For now, allow all authenticated users to access sources
    // TODO: Implement proper source ownership validation

    logger.debug('Source access validated', {
      sourceId,
      userId: req.user.id,
      path: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    logger.error('Source access validation error', {
      error: error.message,
      stack: error.stack,
      sourceId: req.params.sourceId,
      userId: req.user?.id,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    res.status(500).json(createErrorResponse(
      'INTERNAL_ERROR',
      'Source access validation failed',
      process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
    ));
  }
};

export default {
  authenticateRequest,
  requireAdmin,
  validateSourceAccess
};