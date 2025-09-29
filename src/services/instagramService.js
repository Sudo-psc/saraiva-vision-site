/**
 * Instagram Service - Client-side service for Instagram API integration
 * Handles posts fetching, statistics, and real-time updates via WebSocket
 */

import { SafeWS } from '../utils/SafeWS.js';

class InstagramService {
    constructor() {
        this.baseUrl = '/api/instagram';
        this.websocket = null;
        this.subscribers = new Map(); // postId -> Set of callbacks
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
        this.apiToken = null; // Store API token for authenticated requests
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * Set API token for authenticated requests
     * @param {string} token - API token
     */
    setApiToken(token) {
        this.apiToken = token;
        if (token) {
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.defaultHeaders['Authorization'];
        }
    }

    /**
     * Get API token
     * @returns {string|null} Current API token
     */
    getApiToken() {
        return this.apiToken;
    }

    /**
     * Fetch Instagram posts with optional statistics
     * @param {Object} options - Fetch options
     * @param {number} options.limit - Number of posts to fetch (default: 4)
     * @param {boolean} options.includeStats - Include engagement statistics (default: true)
     * @param {string} options.fields - Custom fields to fetch
     * @param {string} options.apiToken - Optional API token for this request
     * @returns {Promise<Object>} Posts data with metadata
     */
    async fetchPosts(options = {}) {
        const {
            limit = 4,
            includeStats = true,
            fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username',
            apiToken = null
        } = options;

        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                includeStats: includeStats.toString(),
                fields
            });

            const headers = { ...this.defaultHeaders };
            if (apiToken) {
                headers['Authorization'] = `Bearer ${apiToken}`;
            }

            const response = await fetch(`${this.baseUrl}/posts?${params}`, {
                method: 'GET',
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle security-related errors
                if (response.status === 429) {
                    throw new Error(`Rate limit exceeded. Retry after ${data.retryAfter || 60} seconds`);
                } else if (response.status === 401) {
                    throw new Error('Authentication required. Please provide a valid API token');
                } else if (response.status === 400) {
                    throw new Error(`Invalid request: ${data.error || data.message}`);
                }
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return {
                success: data.success,
                posts: data.data || [],
                cached: data.cached || false,
                cacheAge: data.cache_age || 0,
                total: data.total || 0,
                statsIncluded: data.stats_included || false,
                rateLimitInfo: {
                    limit: response.headers.get('x-ratelimit-limit'),
                    remaining: response.headers.get('x-ratelimit-remaining'),
                    reset: response.headers.get('x-ratelimit-reset')
                }
            };
        } catch (error) {
            console.error('Failed to fetch Instagram posts:', error);
            throw new Error(`Failed to fetch posts: ${error.message}`);
        }
    }

    /**
     * Fetch statistics for a single post
     * @param {string} postId - Instagram post ID
     * @param {boolean} includeInsights - Include detailed insights (default: false)
     * @param {string} apiToken - Optional API token for this request
     * @returns {Promise<Object>} Post statistics
     */
    async fetchPostStats(postId, includeInsights = false, apiToken = null) {
        try {
            const params = new URLSearchParams({
                postId,
                includeInsights: includeInsights.toString()
            });

            const headers = { ...this.defaultHeaders };
            if (apiToken) {
                headers['Authorization'] = `Bearer ${apiToken}`;
            }

            const response = await fetch(`${this.baseUrl}/stats?${params}`, {
                method: 'GET',
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle security-related errors
                if (response.status === 429) {
                    throw new Error(`Rate limit exceeded. Retry after ${data.retryAfter || 60} seconds`);
                } else if (response.status === 401) {
                    throw new Error('Authentication required. Please provide a valid API token');
                } else if (response.status === 400) {
                    throw new Error(`Invalid request: ${data.error || data.message}`);
                }
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return {
                success: data.success,
                stats: data.data,
                cached: data.cached || false,
                cacheAge: data.cache_age || 0,
                timestamp: data.timestamp,
                rateLimitInfo: {
                    limit: response.headers.get('x-ratelimit-limit'),
                    remaining: response.headers.get('x-ratelimit-remaining'),
                    reset: response.headers.get('x-ratelimit-reset')
                }
            };
        } catch (error) {
            console.error(`Failed to fetch stats for post ${postId}:`, error);
            throw new Error(`Failed to fetch post statistics: ${error.message}`);
        }
    }

    /**
     * Fetch statistics for multiple posts
     * @param {string[]} postIds - Array of Instagram post IDs
     * @param {boolean} includeInsights - Include detailed insights (default: false)
     * @param {string} apiToken - Optional API token for this request
     * @returns {Promise<Object>} Bulk statistics data
     */
    async fetchBulkStats(postIds, includeInsights = false, apiToken = null) {
        try {
            const headers = { ...this.defaultHeaders };
            if (apiToken) {
                headers['Authorization'] = `Bearer ${apiToken}`;
            }

            // Validate input for security
            if (!Array.isArray(postIds) || postIds.length === 0) {
                throw new Error('postIds must be a non-empty array');
            }
            if (postIds.length > 50) {
                throw new Error('Cannot fetch stats for more than 50 posts at once');
            }
            if (!postIds.every(id => typeof id === 'string' && id.length > 0)) {
                throw new Error('All postIds must be non-empty strings');
            }

            const response = await fetch(`${this.baseUrl}/stats`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    postIds,
                    includeInsights
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle security-related errors
                if (response.status === 429) {
                    throw new Error(`Rate limit exceeded. Retry after ${data.retryAfter || 60} seconds`);
                } else if (response.status === 401) {
                    throw new Error('Authentication required. Please provide a valid API token');
                } else if (response.status === 400) {
                    throw new Error(`Invalid request: ${data.error || data.message}`);
                }
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return {
                success: data.success,
                results: data.data || [],
                timestamp: data.timestamp,
                total: data.total || 0,
                rateLimitInfo: {
                    limit: response.headers.get('x-ratelimit-limit'),
                    remaining: response.headers.get('x-ratelimit-remaining'),
                    reset: response.headers.get('x-ratelimit-reset')
                }
            };
        } catch (error) {
            console.error('Failed to fetch bulk statistics:', error);
            throw new Error(`Failed to fetch bulk statistics: ${error.message}`);
        }
    }

    /**
     * Subscribe to real-time statistics updates via WebSocket
     * @param {string[]} postIds - Array of post IDs to subscribe to
     * @param {Function} callback - Callback function for updates
     * @param {Object} options - Subscription options
     * @param {number} options.interval - Update interval in milliseconds (default: 300000 = 5 minutes)
     * @returns {Function} Unsubscribe function
     */
    subscribeToStats(postIds, callback, options = {}) {
        const { interval = 300000 } = options; // 5 minutes default

        // Store callback for each post ID
        postIds.forEach(postId => {
            if (!this.subscribers.has(postId)) {
                this.subscribers.set(postId, new Set());
            }
            this.subscribers.get(postId).add(callback);
        });

        // Initialize WebSocket connection if needed
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
            this.initializeWebSocket();
        }

        // Send subscription message when WebSocket is ready
        const subscribe = () => {
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'subscribe',
                    postIds,
                    interval
                }));
            }
        };

        if (this.websocket.readyState === WebSocket.OPEN) {
            subscribe();
        } else {
            this.websocket.addEventListener('open', subscribe, { once: true });
        }

        // Return unsubscribe function
        return () => {
            this.unsubscribeFromStats(postIds, callback);
        };
    }

    /**
     * Unsubscribe from real-time statistics updates
     * @param {string[]} postIds - Array of post IDs to unsubscribe from (optional)
     * @param {Function} callback - Specific callback to remove (optional)
     */
    unsubscribeFromStats(postIds = null, callback = null) {
        if (postIds) {
            postIds.forEach(postId => {
                const postSubscribers = this.subscribers.get(postId);
                if (postSubscribers) {
                    if (callback) {
                        postSubscribers.delete(callback);
                        if (postSubscribers.size === 0) {
                            this.subscribers.delete(postId);
                        }
                    } else {
                        this.subscribers.delete(postId);
                    }
                }
            });

            // Send unsubscribe message
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'unsubscribe',
                    postIds
                }));
            }
        } else {
            // Unsubscribe from all
            this.subscribers.clear();
            if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                this.websocket.send(JSON.stringify({
                    type: 'unsubscribe'
                }));
            }
        }
    }

    /**
     * Initialize WebSocket connection for real-time updates
     * @private
     */
    initializeWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/api/instagram/websocket`;

            this.websocket = new SafeWS(wsUrl, {
                maxRetries: 5,
                baseDelay: 1000,
                maxDelay: 30000,
                onOpen: () => {
                    console.log('Instagram WebSocket connected');
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000;
                },
                onMessage: (data) => {
                    try {
                        const message = JSON.parse(data);
                        this.handleWebSocketMessage(message);
                    } catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                },
                onClose: () => {
                    console.log('Instagram WebSocket disconnected');
                    this.handleWebSocketClose();
                },
                onError: (event) => {
                    console.error('Instagram WebSocket error:', event);
                }
            });

            this.websocket.connect();
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
        }
    }

    /**
     * Handle incoming WebSocket messages
     * @private
     */
    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'connected':
                console.log('Instagram WebSocket connection established:', message.connectionId);
                break;

            case 'subscribed':
                console.log('Subscribed to Instagram stats:', message.postIds);
                break;

            case 'unsubscribed':
                console.log('Unsubscribed from Instagram stats:', message.postIds);
                break;

            case 'stats_update':
                this.handleStatsUpdate(message.postId, message.stats, message.timestamp);
                break;

            case 'stats_error':
                console.error(`Stats error for post ${message.postId}:`, message.error);
                break;

            case 'error':
                console.error('Instagram WebSocket error:', message.message);
                break;

            case 'pong':
                // Handle pong response
                break;

            default:
                console.warn('Unknown WebSocket message type:', message.type);
        }
    }

    /**
     * Handle statistics updates from WebSocket
     * @private
     */
    handleStatsUpdate(postId, stats, timestamp) {
        const postSubscribers = this.subscribers.get(postId);
        if (postSubscribers) {
            postSubscribers.forEach(callback => {
                try {
                    callback({
                        postId,
                        stats,
                        timestamp,
                        realtime: true
                    });
                } catch (error) {
                    console.error('Error in stats update callback:', error);
                }
            });
        }
    }

    /**
     * Handle WebSocket connection close and attempt reconnection
     * @private
     */
    handleWebSocketClose() {
        if (this.subscribers.size > 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

            console.log(`Attempting to reconnect WebSocket in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.initializeWebSocket();
            }, delay);
        }
    }

    /**
     * Send ping to keep WebSocket connection alive
     */
    ping() {
        if (this.websocket) {
            this.websocket.sendSafe(JSON.stringify({ type: 'ping' }));
        }
    }

    /**
     * Close WebSocket connection and cleanup
     */
    disconnect() {
        this.subscribers.clear();
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }

    /**
     * Get connection status
     * @returns {Object} Connection status information
     */
    getConnectionStatus() {
        return {
            connected: this.websocket && this.websocket.isReady(),
            state: this.websocket ? this.websocket.getState() : 'disconnected',
            subscribedPosts: Array.from(this.subscribers.keys()),
            totalSubscribers: Array.from(this.subscribers.values()).reduce((total, set) => total + set.size, 0),
            reconnectAttempts: this.reconnectAttempts,
            hasApiToken: !!this.apiToken
        };
    }

    /**
     * Sanitize input to prevent security issues
     * @param {string} input - Input string to sanitize
     * @param {string} context - Context for sanitization (username, hashtag, caption, etc.)
     * @returns {string} Sanitized string
     */
    sanitizeInput(input, context = 'general') {
        if (typeof input !== 'string') return '';

        // Remove potentially dangerous characters and patterns
        let sanitized = input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/javascript:/gi, '') // Remove javascript protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .trim();

        // Context-specific sanitization
        switch (context) {
            case 'username':
                // Keep only alphanumeric, underscores, and periods
                sanitized = sanitized.replace(/[^A-Za-z0-9._]/g, '');
                break;
            case 'hashtag':
                // Keep only alphanumeric and underscores
                sanitized = sanitized.replace(/[^A-Za-z0-9_]/g, '');
                break;
            case 'caption':
                // Allow basic HTML but remove dangerous elements
                sanitized = sanitized
                    .replace(/<(?!\/?(b|i|u|strong|em|br|p))[^>]*>/gi, ''); // Allow only safe HTML tags
                break;
        }

        return sanitized;
    }

    /**
     * Validate post ID format
     * @param {string} postId - Post ID to validate
     * @returns {boolean} True if valid
     */
    validatePostId(postId) {
        return typeof postId === 'string' &&
            postId.length > 0 &&
            /^[A-Za-z0-9_-]+$/.test(postId);
    }

    /**
     * Handle rate limiting with exponential backoff
     * @param {Function} fn - Function to execute
     * @param {number} maxRetries - Maximum number of retries
     * @returns {Promise} Result of the function
     */
    async withRetry(fn, maxRetries = 3) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                // Check if it's a rate limit error
                if (error.message.includes('Rate limit exceeded') && attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    throw error; // Re-throw non-rate-limit errors or final attempt
                }
            }
        }

        throw lastError;
    }
}

// Create singleton instance
const instagramService = new InstagramService();

// Setup periodic ping to keep connection alive
setInterval(() => {
    instagramService.ping();
}, 30000); // Ping every 30 seconds

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    instagramService.disconnect();
});

export default instagramService;
