/**
 * Instagram Rate Limiter Service
 * Implements intelligent rate limiting for Instagram API requests
 */

class InstagramRateLimiter {
    constructor() {
        this.requestCounts = new Map(); // Track requests per endpoint
        this.rateLimits = new Map(); // Store rate limit configurations
        this.requestHistory = []; // Track request history for analytics
        this.blockedRequests = new Map(); // Track blocked requests
        this.retryQueue = []; // Queue for retry requests

        // Default rate limits (Instagram API limits)
        this.defaultLimits = {
            'instagram-basic-display': {
                requests: 200, // requests per hour
                window: 3600000, // 1 hour in milliseconds
                burst: 10, // max burst requests
                burstWindow: 60000 // 1 minute burst window
            },
            'instagram-graph': {
                requests: 200,
                window: 3600000,
                burst: 10,
                burstWindow: 60000
            },
            'posts': {
                requests: 100,
                window: 3600000,
                burst: 5,
                burstWindow: 60000
            },
            'stats': {
                requests: 300,
                window: 3600000,
                burst: 15,
                burstWindow: 60000
            }
        };

        // Initialize rate limits
        this.initializeRateLimits();

        // Start cleanup interval
        this.startCleanupInterval();
    }

    /**
     * Initialize rate limits with default values
     */
    initializeRateLimits() {
        Object.entries(this.defaultLimits).forEach(([endpoint, limits]) => {
            this.rateLimits.set(endpoint, {
                ...limits,
                currentRequests: 0,
                burstRequests: 0,
                windowStart: Date.now(),
                burstWindowStart: Date.now(),
                lastRequest: null
            });
        });
    }

    /**
     * Check if request is allowed
     */
    async isRequestAllowed(endpoint, options = {}) {
        const {
            userId = 'anonymous',
            priority = 'normal', // 'low', 'normal', 'high', 'critical'
            bypassBurst = false
        } = options;

        const limits = this.rateLimits.get(endpoint);
        if (!limits) {
            // No limits configured, allow request
            return {
                allowed: true,
                reason: 'no-limits-configured'
            };
        }

        const now = Date.now();

        // Reset windows if expired
        if (now - limits.windowStart >= limits.window) {
            limits.currentRequests = 0;
            limits.windowStart = now;
        }

        if (now - limits.burstWindowStart >= limits.burstWindow) {
            limits.burstRequests = 0;
            limits.burstWindowStart = now;
        }

        // Check burst limits first (unless bypassed)
        if (!bypassBurst && limits.burstRequests >= limits.burst) {
            const waitTime = limits.burstWindow - (now - limits.burstWindowStart);

            this.recordBlockedRequest(endpoint, userId, 'burst-limit', waitTime);

            return {
                allowed: false,
                reason: 'burst-limit-exceeded',
                waitTime,
                retryAfter: new Date(now + waitTime)
            };
        }

        // Check main rate limits
        if (limits.currentRequests >= limits.requests) {
            const waitTime = limits.window - (now - limits.windowStart);

            this.recordBlockedRequest(endpoint, userId, 'rate-limit', waitTime);

            return {
                allowed: false,
                reason: 'rate-limit-exceeded',
                waitTime,
                retryAfter: new Date(now + waitTime)
            };
        }

        // Check for priority-based throttling
        if (priority === 'low' && this.shouldThrottleLowPriority(endpoint)) {
            return {
                allowed: false,
                reason: 'low-priority-throttled',
                waitTime: 30000, // 30 seconds
                retryAfter: new Date(now + 30000)
            };
        }

        return {
            allowed: true,
            reason: 'within-limits',
            remainingRequests: limits.requests - limits.currentRequests,
            remainingBurst: limits.burst - limits.burstRequests
        };
    }

    /**
     * Record a successful request
     */
    recordRequest(endpoint, options = {}) {
        const {
            userId = 'anonymous',
            responseTime = 0,
            statusCode = 200,
            dataSize = 0
        } = options;

        const limits = this.rateLimits.get(endpoint);
        if (limits) {
            limits.currentRequests++;
            limits.burstRequests++;
            limits.lastRequest = Date.now();
        }

        // Record in history for analytics
        this.requestHistory.push({
            timestamp: Date.now(),
            endpoint,
            userId,
            responseTime,
            statusCode,
            dataSize,
            type: 'success'
        });

        // Keep history manageable
        if (this.requestHistory.length > 1000) {
            this.requestHistory = this.requestHistory.slice(-500);
        }
    }

    /**
     * Record a blocked request
     */
    recordBlockedRequest(endpoint, userId, reason, waitTime) {
        const key = `${endpoint}-${userId}`;
        const blocked = this.blockedRequests.get(key) || {
            count: 0,
            firstBlocked: Date.now(),
            lastBlocked: Date.now(),
            reasons: new Map()
        };

        blocked.count++;
        blocked.lastBlocked = Date.now();

        const reasonCount = blocked.reasons.get(reason) || 0;
        blocked.reasons.set(reason, reasonCount + 1);

        this.blockedRequests.set(key, blocked);

        // Record in history
        this.requestHistory.push({
            timestamp: Date.now(),
            endpoint,
            userId,
            reason,
            waitTime,
            type: 'blocked'
        });
    }

    /**
     * Check if low priority requests should be throttled
     */
    shouldThrottleLowPriority(endpoint) {
        const limits = this.rateLimits.get(endpoint);
        if (!limits) return false;

        // Throttle low priority if we're at 80% of rate limit
        const usagePercent = limits.currentRequests / limits.requests;
        return usagePercent > 0.8;
    }

    /**
     * Add request to retry queue
     */
    addToRetryQueue(request) {
        this.retryQueue.push({
            ...request,
            addedAt: Date.now(),
            retryCount: (request.retryCount || 0) + 1
        });

        // Sort by priority and retry time
        this.retryQueue.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
            const aPriority = priorityOrder[a.priority] || 2;
            const bPriority = priorityOrder[b.priority] || 2;

            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }

            return a.retryAfter - b.retryAfter;
        });

        // Limit queue size
        if (this.retryQueue.length > 100) {
            this.retryQueue = this.retryQueue.slice(0, 100);
        }
    }

    /**
     * Process retry queue
     */
    async processRetryQueue() {
        const now = Date.now();
        const readyRequests = [];

        // Find requests ready for retry
        for (let i = this.retryQueue.length - 1; i >= 0; i--) {
            const request = this.retryQueue[i];

            // Remove expired requests (older than 1 hour)
            if (now - request.addedAt > 3600000) {
                this.retryQueue.splice(i, 1);
                continue;
            }

            // Check if ready for retry
            if (request.retryAfter <= now) {
                const allowed = await this.isRequestAllowed(request.endpoint, {
                    userId: request.userId,
                    priority: request.priority,
                    bypassBurst: request.retryCount > 2 // Bypass burst after multiple retries
                });

                if (allowed.allowed) {
                    readyRequests.push(request);
                    this.retryQueue.splice(i, 1);
                }
            }
        }

        return readyRequests;
    }

    /**
     * Update rate limits based on API response headers
     */
    updateLimitsFromHeaders(endpoint, headers) {
        const limits = this.rateLimits.get(endpoint);
        if (!limits) return;

        // Instagram API headers
        const remaining = headers['x-ratelimit-remaining'];
        const resetTime = headers['x-ratelimit-reset'];
        const limit = headers['x-ratelimit-limit'];

        if (remaining !== undefined) {
            limits.currentRequests = Math.max(0, (limit || limits.requests) - parseInt(remaining));
        }

        if (resetTime !== undefined) {
            const resetTimestamp = parseInt(resetTime) * 1000; // Convert to milliseconds
            limits.windowStart = resetTimestamp - limits.window;
        }

        // Update based on rate limit warnings
        const rateLimitWarning = headers['x-ratelimit-warning'];
        if (rateLimitWarning) {
            console.warn(`Instagram API rate limit warning for ${endpoint}:`, rateLimitWarning);

            // Reduce limits temporarily
            limits.requests = Math.floor(limits.requests * 0.8);
            limits.burst = Math.floor(limits.burst * 0.8);
        }
    }

    /**
     * Get current rate limit status
     */
    getRateLimitStatus(endpoint) {
        const limits = this.rateLimits.get(endpoint);
        if (!limits) {
            return {
                endpoint,
                configured: false
            };
        }

        const now = Date.now();
        const windowRemaining = limits.window - (now - limits.windowStart);
        const burstWindowRemaining = limits.burstWindow - (now - limits.burstWindowStart);

        return {
            endpoint,
            configured: true,
            requests: {
                current: limits.currentRequests,
                limit: limits.requests,
                remaining: limits.requests - limits.currentRequests,
                resetIn: windowRemaining
            },
            burst: {
                current: limits.burstRequests,
                limit: limits.burst,
                remaining: limits.burst - limits.burstRequests,
                resetIn: burstWindowRemaining
            },
            lastRequest: limits.lastRequest,
            status: this.getEndpointStatus(limits)
        };
    }

    /**
     * Get endpoint status
     */
    getEndpointStatus(limits) {
        const requestUsage = limits.currentRequests / limits.requests;
        const burstUsage = limits.burstRequests / limits.burst;

        if (requestUsage >= 1 || burstUsage >= 1) {
            return 'blocked';
        } else if (requestUsage > 0.9 || burstUsage > 0.9) {
            return 'critical';
        } else if (requestUsage > 0.7 || burstUsage > 0.7) {
            return 'warning';
        } else {
            return 'healthy';
        }
    }

    /**
     * Get analytics data
     */
    getAnalytics(timeRange = 3600000) { // Default 1 hour
        const now = Date.now();
        const cutoff = now - timeRange;

        const recentHistory = this.requestHistory.filter(
            record => record.timestamp >= cutoff
        );

        const analytics = {
            timeRange,
            totalRequests: recentHistory.length,
            successfulRequests: recentHistory.filter(r => r.type === 'success').length,
            blockedRequests: recentHistory.filter(r => r.type === 'blocked').length,
            averageResponseTime: 0,
            endpointBreakdown: {},
            blockReasons: {},
            userBreakdown: {}
        };

        // Calculate averages and breakdowns
        let totalResponseTime = 0;
        let responseTimeCount = 0;

        recentHistory.forEach(record => {
            // Endpoint breakdown
            if (!analytics.endpointBreakdown[record.endpoint]) {
                analytics.endpointBreakdown[record.endpoint] = {
                    total: 0,
                    successful: 0,
                    blocked: 0
                };
            }
            analytics.endpointBreakdown[record.endpoint].total++;
            analytics.endpointBreakdown[record.endpoint][record.type === 'success' ? 'successful' : 'blocked']++;

            // Response time
            if (record.responseTime) {
                totalResponseTime += record.responseTime;
                responseTimeCount++;
            }

            // Block reasons
            if (record.type === 'blocked' && record.reason) {
                analytics.blockReasons[record.reason] = (analytics.blockReasons[record.reason] || 0) + 1;
            }

            // User breakdown
            if (!analytics.userBreakdown[record.userId]) {
                analytics.userBreakdown[record.userId] = { total: 0, successful: 0, blocked: 0 };
            }
            analytics.userBreakdown[record.userId].total++;
            analytics.userBreakdown[record.userId][record.type === 'success' ? 'successful' : 'blocked']++;
        });

        analytics.averageResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;
        analytics.successRate = analytics.totalRequests > 0 ?
            (analytics.successfulRequests / analytics.totalRequests) * 100 : 0;

        return analytics;
    }

    /**
     * Configure custom rate limits
     */
    configureRateLimit(endpoint, limits) {
        const existingLimits = this.rateLimits.get(endpoint) || {};

        this.rateLimits.set(endpoint, {
            ...existingLimits,
            ...limits,
            currentRequests: existingLimits.currentRequests || 0,
            burstRequests: existingLimits.burstRequests || 0,
            windowStart: existingLimits.windowStart || Date.now(),
            burstWindowStart: existingLimits.burstWindowStart || Date.now()
        });
    }

    /**
     * Reset rate limits for endpoint
     */
    resetRateLimit(endpoint) {
        const limits = this.rateLimits.get(endpoint);
        if (limits) {
            limits.currentRequests = 0;
            limits.burstRequests = 0;
            limits.windowStart = Date.now();
            limits.burstWindowStart = Date.now();
        }
    }

    /**
     * Get retry recommendations
     */
    getRetryRecommendation(endpoint, userId = 'anonymous') {
        const status = this.getRateLimitStatus(endpoint);
        const blockedKey = `${endpoint}-${userId}`;
        const blocked = this.blockedRequests.get(blockedKey);

        if (!status.configured) {
            return {
                shouldRetry: true,
                waitTime: 0,
                strategy: 'immediate'
            };
        }

        if (status.status === 'blocked') {
            const waitTime = Math.min(status.requests.resetIn, status.burst.resetIn);
            return {
                shouldRetry: true,
                waitTime,
                strategy: 'wait-for-reset',
                retryAfter: new Date(Date.now() + waitTime)
            };
        }

        if (blocked && blocked.count > 5) {
            // Exponential backoff for frequently blocked requests
            const backoffTime = Math.min(1000 * Math.pow(2, blocked.count - 5), 300000); // Max 5 minutes
            return {
                shouldRetry: true,
                waitTime: backoffTime,
                strategy: 'exponential-backoff',
                retryAfter: new Date(Date.now() + backoffTime)
            };
        }

        return {
            shouldRetry: true,
            waitTime: 1000, // Default 1 second
            strategy: 'default-delay'
        };
    }

    /**
     * Start cleanup interval
     */
    startCleanupInterval() {
        setInterval(() => {
            this.cleanup();
            this.processRetryQueue();
        }, 60000); // Run every minute
    }

    /**
     * Cleanup old data
     */
    cleanup() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        // Clean up request history
        this.requestHistory = this.requestHistory.filter(
            record => now - record.timestamp < maxAge
        );

        // Clean up blocked requests
        for (const [key, blocked] of this.blockedRequests.entries()) {
            if (now - blocked.lastBlocked > maxAge) {
                this.blockedRequests.delete(key);
            }
        }

        // Clean up retry queue
        this.retryQueue = this.retryQueue.filter(
            request => now - request.addedAt < 3600000 // 1 hour
        );
    }

    /**
     * Export configuration and state
     */
    exportState() {
        return {
            rateLimits: Object.fromEntries(this.rateLimits),
            analytics: this.getAnalytics(),
            retryQueueSize: this.retryQueue.length,
            blockedRequestsCount: this.blockedRequests.size,
            timestamp: Date.now()
        };
    }

    /**
     * Import configuration
     */
    importConfiguration(config) {
        if (config.rateLimits) {
            Object.entries(config.rateLimits).forEach(([endpoint, limits]) => {
                this.configureRateLimit(endpoint, limits);
            });
        }
    }
}

// Create singleton instance
const instagramRateLimiter = new InstagramRateLimiter();

export default instagramRateLimiter;