/**
 * WordPress JWT Utilities
 * Helper functions for JWT token management and WordPress API integration
 */

/**
 * Decode JWT token payload (without verification - for client-side use only)
 */
export function decodeJWTPayload(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (error) {
        console.error('Failed to decode JWT payload:', error);
        return null;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token) {
    const payload = decodeJWTPayload(token);
    if (!payload || !payload.exp) {
        return true;
    }

    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiryTime;
}

/**
 * Get time until token expiry
 */
export function getTokenTimeToExpiry(token) {
    const payload = decodeJWTPayload(token);
    if (!payload || !payload.exp) {
        return 0;
    }

    const expiryTime = payload.exp * 1000;
    return Math.max(0, expiryTime - Date.now());
}

/**
 * Format time remaining in human readable format
 */
export function formatTimeRemaining(milliseconds) {
    if (milliseconds <= 0) {
        return 'Expired';
    }

    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
}

/**
 * Safe token storage utilities
 */
export const tokenStorage = {
    /**
     * Store token securely
     */
    setToken: (token, key = 'wp_jwt_token') => {
        try {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(key, token);
            }
        } catch (error) {
            console.error('Failed to store token:', error);
        }
    },

    /**
     * Retrieve stored token
     */
    getToken: (key = 'wp_jwt_token') => {
        try {
            if (typeof window !== 'undefined') {
                return sessionStorage.getItem(key);
            }
        } catch (error) {
            console.error('Failed to retrieve token:', error);
        }
        return null;
    },

    /**
     * Remove stored token
     */
    removeToken: (key = 'wp_jwt_token') => {
        try {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem(key);
            }
        } catch (error) {
            console.error('Failed to remove token:', error);
        }
    },

    /**
     * Clear all WordPress-related tokens
     */
    clearAllTokens: () => {
        const keys = ['wp_jwt_token', 'wp_jwt_expiry', 'wp_user_data'];
        keys.forEach(key => tokenStorage.removeToken(key));
    }
};

/**
 * WordPress API endpoint builders
 */
export const wordpressEndpoints = {
    /**
     * Build REST API endpoint URL
     */
    buildEndpoint: (baseURL, endpoint, params = {}) => {
        const url = new URL(`${baseURL}/wp-json/wp/v2${endpoint}`);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });

        return url.toString();
    },

    /**
     * Common WordPress REST endpoints
     */
    endpoints: {
        posts: '/posts',
        pages: '/pages',
        categories: '/categories',
        tags: '/tags',
        media: '/media',
        users: '/users',
        comments: '/comments',
        settings: '/settings',
        currentUser: '/users/me'
    },

    /**
     * JWT authentication endpoints
     */
    auth: {
        token: '/wp-json/jwt-auth/v1/token',
        validate: '/wp-json/jwt-auth/v1/token/validate'
    }
};

/**
 * WordPress API error handling
 */
export class WordPressAPIError extends Error {
    constructor(message, status, endpoint) {
        super(message);
        this.name = 'WordPressAPIError';
        this.status = status;
        this.endpoint = endpoint;
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            endpoint: this.endpoint
        };
    }
}

/**
 * Validate WordPress API response
 */
export function validateWordPressResponse(response, endpoint) {
    if (!response.ok) {
        throw new WordPressAPIError(
            `WordPress API Error: ${response.statusText}`,
            response.status,
            endpoint
        );
    }

    return response;
}

/**
 * Retry configuration for API calls
 */
export const retryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504]
};

/**
 * Calculate retry delay with exponential backoff
 */
export function calculateRetryDelay(attempt, baseDelay = retryConfig.baseDelay) {
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), retryConfig.maxDelay);
    return delay + Math.random() * 1000; // Add jitter
}

/**
 * Check if status code is retryable
 */
export function isRetryableError(status) {
    return retryConfig.retryableStatusCodes.includes(status);
}

/**
 * WordPress content type helpers
 */
export const contentTypes = {
    /**
     * Check if response is valid WordPress REST API response
     */
    isValidWordPressResponse: (data) => {
        return data && typeof data === 'object';
    },

    /**
     * Validate post data structure
     */
    isValidPost: (post) => {
        return post &&
               typeof post === 'object' &&
               post.id &&
               post.title &&
               post.content;
    },

    /**
     * Validate page data structure
     */
    isValidPage: (page) => {
        return page &&
               typeof page === 'object' &&
               page.id &&
               page.title &&
               page.content;
    }
};

/**
 * Logging utilities for WordPress integration
 */
export const logger = {
    /**
     * Log authentication events
     */
    auth: (action, details = {}) => {
        console.log(`[WordPress Auth] ${action}:`, details);
    },

    /**
     * Log API requests
     */
    api: (method, endpoint, status) => {
        console.log(`[WordPress API] ${method} ${endpoint} -> ${status}`);
    },

    /**
     * Log errors
     */
    error: (context, error) => {
        console.error(`[WordPress Error] ${context}:`, error);
    }
};

/**
 * WordPress permissions and capabilities helpers
 */
export const permissions = {
    /**
     * Common WordPress capabilities
     */
    capabilities: {
        read: 'read',
        editPosts: 'edit_posts',
        publishPosts: 'publish_posts',
        editOthersPosts: 'edit_others_posts',
        manageCategories: 'manage_categories',
        uploadFiles: 'upload_files'
    },

    /**
     * Check if user has specific capability (client-side check)
     */
    hasCapability: (userCapabilities, requiredCapability) => {
        return userCapabilities && userCapabilities.includes(requiredCapability);
    },

    /**
     * Check if user can edit posts
     */
    canEditPosts: (userCapabilities) => {
        return permissions.hasCapability(userCapabilities, permissions.capabilities.editPosts);
    }
};

export default {
    decodeJWTPayload,
    isTokenExpired,
    getTokenTimeToExpiry,
    formatTimeRemaining,
    tokenStorage,
    wordpressEndpoints,
    WordPressAPIError,
    validateWordPressResponse,
    retryConfig,
    calculateRetryDelay,
    isRetryableError,
    contentTypes,
    logger,
    permissions
};