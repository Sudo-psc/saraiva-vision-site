/**
 * Instagram Service - Client-side service for Instagram API integration
 * Handles posts fetching, statistics, and real-time updates via WebSocket
 */

class InstagramService {
    constructor() {
        this.baseUrl = '/api/instagram';
        this.websocket = null;
        this.subscribers = new Map(); // postId -> Set of callbacks
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start with 1 second
    }

    /**
     * Fetch Instagram posts with optional statistics
     * @param {Object} options - Fetch options
     * @param {number} options.limit - Number of posts to fetch (default: 4)
     * @param {boolean} options.includeStats - Include engagement statistics (default: true)
     * @param {string} options.fields - Custom fields to fetch
     * @returns {Promise<Object>} Posts data with metadata
     */
    async fetchPosts(options = {}) {
        const {
            limit = 4,
            includeStats = true,
            fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username'
        } = options;

        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                includeStats: includeStats.toString(),
                fields
            });

            const response = await fetch(`${this.baseUrl}/posts?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return {
                success: data.success,
                posts: data.data || [],
                cached: data.cached || false,
                cacheAge: data.cache_age || 0,
                total: data.total || 0,
                statsIncluded: data.stats_included || false
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
     * @returns {Promise<Object>} Post statistics
     */
    async fetchPostStats(postId, includeInsights = false) {
        try {
            const params = new URLSearchParams({
                postId,
                includeInsights: includeInsights.toString()
            });

            const response = await fetch(`${this.baseUrl}/stats?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return {
                success: data.success,
                stats: data.data,
                cached: data.cached || false,
                cacheAge: data.cache_age || 0,
                timestamp: data.timestamp
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
     * @returns {Promise<Object>} Bulk statistics data
     */
    async fetchBulkStats(postIds, includeInsights = false) {
        try {
            const response = await fetch(`${this.baseUrl}/stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postIds,
                    includeInsights
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return {
                success: data.success,
                results: data.data || [],
                timestamp: data.timestamp,
                total: data.total || 0
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

            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = (event) => {
                console.log('Instagram WebSocket connected');
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000;
            };

            this.websocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            this.websocket.onclose = (event) => {
                console.log('Instagram WebSocket disconnected:', event.code, event.reason);
                this.handleWebSocketClose();
            };

            this.websocket.onerror = (error) => {
                console.error('Instagram WebSocket error:', error);
            };
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
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({ type: 'ping' }));
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
            connected: this.websocket && this.websocket.readyState === WebSocket.OPEN,
            subscribedPosts: Array.from(this.subscribers.keys()),
            totalSubscribers: Array.from(this.subscribers.values()).reduce((total, set) => total + set.size, 0),
            reconnectAttempts: this.reconnectAttempts
        };
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