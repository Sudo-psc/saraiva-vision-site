/**
 * Chatbot Performance Monitoring Service
 * Tracks performance metrics, response times, and optimization opportunities
 */

import { createClient } from '@supabase/supabase-js';

class ChatbotPerformanceMonitor {
    constructor() {
        this.supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // In-memory metrics for real-time monitoring
        this.metrics = {
            requests: {
                total: 0,
                successful: 0,
                failed: 0,
                cached: 0
            },
            responseTime: {
                total: 0,
                count: 0,
                min: Infinity,
                max: 0,
                samples: []
            },
            tokens: {
                total: 0,
                requests: 0,
                average: 0
            },
            cache: {
                hits: 0,
                misses: 0,
                hitRate: 0
            },
            errors: {
                total: 0,
                byType: new Map(),
                recent: []
            },
            performance: {
                slowRequests: 0,
                fastRequests: 0,
                averageResponseTime: 0
            }
        };

        // Performance thresholds
        this.thresholds = {
            slowResponseTime: 5000, // 5 seconds
            fastResponseTime: 1000, // 1 second
            maxSampleSize: 1000,
            maxRecentErrors: 100
        };

        // Start monitoring intervals
        this.startMonitoring();
    }

    /**
     * Record a request with performance metrics
     */
    recordRequest(requestData) {
        const {
            success = true,
            responseTime = 0,
            tokensUsed = 0,
            cacheHit = false,
            error = null,
            metadata = {}
        } = requestData;

        // Update request counts
        this.metrics.requests.total++;
        if (success) {
            this.metrics.requests.successful++;
        } else {
            this.metrics.requests.failed++;
        }

        if (cacheHit) {
            this.metrics.requests.cached++;
        }

        // Update response time metrics
        if (responseTime > 0) {
            this.metrics.responseTime.total += responseTime;
            this.metrics.responseTime.count++;
            this.metrics.responseTime.min = Math.min(this.metrics.responseTime.min, responseTime);
            this.metrics.responseTime.max = Math.max(this.metrics.responseTime.max, responseTime);

            // Add to samples (keep only recent samples)
            this.metrics.responseTime.samples.push({
                time: Date.now(),
                responseTime,
                cacheHit,
                tokensUsed
            });

            if (this.metrics.responseTime.samples.length > this.thresholds.maxSampleSize) {
                this.metrics.responseTime.samples.shift();
            }

            // Update performance categories
            if (responseTime > this.thresholds.slowResponseTime) {
                this.metrics.performance.slowRequests++;
            } else if (responseTime < this.thresholds.fastResponseTime) {
                this.metrics.performance.fastRequests++;
            }

            // Update average response time
            this.metrics.performance.averageResponseTime =
                this.metrics.responseTime.total / this.metrics.responseTime.count;
        }

        // Update token metrics
        if (tokensUsed > 0) {
            this.metrics.tokens.total += tokensUsed;
            this.metrics.tokens.requests++;
            this.metrics.tokens.average = this.metrics.tokens.total / this.metrics.tokens.requests;
        }

        // Update cache metrics
        if (cacheHit) {
            this.metrics.cache.hits++;
        } else {
            this.metrics.cache.misses++;
        }

        const totalCacheRequests = this.metrics.cache.hits + this.metrics.cache.misses;
        if (totalCacheRequests > 0) {
            this.metrics.cache.hitRate = (this.metrics.cache.hits / totalCacheRequests) * 100;
        }

        // Record errors
        if (error) {
            this.recordError(error, metadata);
        }

        // Store detailed metrics in database periodically
        this.maybeStoreMetrics();
    }

    /**
     * Record an error with details
     */
    recordError(error, metadata = {}) {
        this.metrics.errors.total++;

        const errorType = error.type || error.name || 'unknown';
        const currentCount = this.metrics.errors.byType.get(errorType) || 0;
        this.metrics.errors.byType.set(errorType, currentCount + 1);

        // Add to recent errors
        this.metrics.errors.recent.push({
            timestamp: Date.now(),
            type: errorType,
            message: error.message || error.toString(),
            metadata
        });

        // Keep only recent errors
        if (this.metrics.errors.recent.length > this.thresholds.maxRecentErrors) {
            this.metrics.errors.recent.shift();
        }
    }

    /**
     * Get current performance metrics
     */
    getMetrics() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);

        // Calculate recent metrics (last hour)
        const recentSamples = this.metrics.responseTime.samples.filter(
            sample => sample.time > oneHourAgo
        );

        const recentResponseTimes = recentSamples.map(s => s.responseTime);
        const recentCacheHits = recentSamples.filter(s => s.cacheHit).length;

        return {
            timestamp: now,
            requests: { ...this.metrics.requests },
            responseTime: {
                average: this.metrics.performance.averageResponseTime,
                min: this.metrics.responseTime.min === Infinity ? 0 : this.metrics.responseTime.min,
                max: this.metrics.responseTime.max,
                recent: {
                    average: recentResponseTimes.length > 0 ?
                        recentResponseTimes.reduce((a, b) => a + b, 0) / recentResponseTimes.length : 0,
                    p95: this.calculatePercentile(recentResponseTimes, 95),
                    p99: this.calculatePercentile(recentResponseTimes, 99)
                }
            },
            tokens: { ...this.metrics.tokens },
            cache: {
                ...this.metrics.cache,
                recentHitRate: recentSamples.length > 0 ?
                    (recentCacheHits / recentSamples.length) * 100 : 0
            },
            errors: {
                total: this.metrics.errors.total,
                rate: this.metrics.requests.total > 0 ?
                    (this.metrics.errors.total / this.metrics.requests.total) * 100 : 0,
                byType: Object.fromEntries(this.metrics.errors.byType),
                recent: this.metrics.errors.recent.slice(-10) // Last 10 errors
            },
            performance: {
                ...this.metrics.performance,
                efficiency: this.calculateEfficiencyScore(),
                health: this.calculateHealthScore()
            }
        };
    }

    /**
     * Calculate percentile from array of values
     */
    calculatePercentile(values, percentile) {
        if (values.length === 0) return 0;

        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    /**
     * Calculate efficiency score based on various metrics
     */
    calculateEfficiencyScore() {
        let score = 100;

        // Penalize slow response times
        const avgResponseTime = this.metrics.performance.averageResponseTime;
        if (avgResponseTime > this.thresholds.slowResponseTime) {
            score -= 30;
        } else if (avgResponseTime > this.thresholds.fastResponseTime) {
            score -= 10;
        }

        // Reward high cache hit rate
        if (this.metrics.cache.hitRate > 80) {
            score += 10;
        } else if (this.metrics.cache.hitRate < 30) {
            score -= 20;
        }

        // Penalize high error rate
        const errorRate = this.metrics.requests.total > 0 ?
            (this.metrics.errors.total / this.metrics.requests.total) * 100 : 0;

        if (errorRate > 10) {
            score -= 40;
        } else if (errorRate > 5) {
            score -= 20;
        }

        // Reward token efficiency
        if (this.metrics.tokens.average > 0 && this.metrics.tokens.average < 1000) {
            score += 5;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate overall health score
     */
    calculateHealthScore() {
        const metrics = this.getMetrics();
        let score = 100;

        // Response time health
        if (metrics.responseTime.average > 10000) {
            score -= 40;
        } else if (metrics.responseTime.average > 5000) {
            score -= 20;
        } else if (metrics.responseTime.average > 3000) {
            score -= 10;
        }

        // Error rate health
        if (metrics.errors.rate > 15) {
            score -= 50;
        } else if (metrics.errors.rate > 10) {
            score -= 30;
        } else if (metrics.errors.rate > 5) {
            score -= 15;
        }

        // Success rate health
        const successRate = this.metrics.requests.total > 0 ?
            (this.metrics.requests.successful / this.metrics.requests.total) * 100 : 100;

        if (successRate < 80) {
            score -= 30;
        } else if (successRate < 90) {
            score -= 15;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Get performance insights and recommendations
     */
    getPerformanceInsights() {
        const metrics = this.getMetrics();
        const insights = [];

        // Response time insights
        if (metrics.responseTime.average > this.thresholds.slowResponseTime) {
            insights.push({
                type: 'warning',
                category: 'response_time',
                message: `Average response time (${Math.round(metrics.responseTime.average)}ms) exceeds threshold`,
                recommendation: 'Consider optimizing API calls or increasing cache usage',
                priority: 'high'
            });
        }

        // Cache insights
        if (metrics.cache.hitRate < 50) {
            insights.push({
                type: 'info',
                category: 'cache',
                message: `Cache hit rate is low (${Math.round(metrics.cache.hitRate)}%)`,
                recommendation: 'Review caching strategy and consider expanding cacheable content',
                priority: 'medium'
            });
        }

        // Error insights
        if (metrics.errors.rate > 5) {
            insights.push({
                type: 'error',
                category: 'errors',
                message: `Error rate is high (${Math.round(metrics.errors.rate)}%)`,
                recommendation: 'Investigate recent errors and improve error handling',
                priority: 'high'
            });
        }

        // Token usage insights
        if (metrics.tokens.average > 2000) {
            insights.push({
                type: 'warning',
                category: 'tokens',
                message: `Average token usage is high (${Math.round(metrics.tokens.average)} tokens)`,
                recommendation: 'Optimize prompts and conversation context management',
                priority: 'medium'
            });
        }

        // Performance insights
        const slowRequestRate = this.metrics.requests.total > 0 ?
            (this.metrics.performance.slowRequests / this.metrics.requests.total) * 100 : 0;

        if (slowRequestRate > 20) {
            insights.push({
                type: 'warning',
                category: 'performance',
                message: `${Math.round(slowRequestRate)}% of requests are slow`,
                recommendation: 'Investigate slow requests and optimize bottlenecks',
                priority: 'high'
            });
        }

        return insights;
    }

    /**
     * Store metrics in database periodically
     */
    async maybeStoreMetrics() {
        // Store metrics every 100 requests or every 5 minutes
        const shouldStore = this.metrics.requests.total % 100 === 0 ||
            (Date.now() - (this.lastMetricsStore || 0)) > 5 * 60 * 1000;

        if (shouldStore) {
            await this.storeMetrics();
        }
    }

    /**
     * Store current metrics in database
     */
    async storeMetrics() {
        try {
            const metrics = this.getMetrics();
            const insights = this.getPerformanceInsights();

            const { error } = await this.supabase
                .from('chatbot_performance_metrics')
                .insert({
                    timestamp: new Date().toISOString(),
                    metrics: metrics,
                    insights: insights,
                    health_score: metrics.performance.health,
                    efficiency_score: metrics.performance.efficiency
                });

            if (error) {
                console.error('Error storing performance metrics:', error);
            } else {
                this.lastMetricsStore = Date.now();
            }

        } catch (error) {
            console.error('Error storing performance metrics:', error);
        }
    }

    /**
     * Get historical performance data
     */
    async getHistoricalMetrics(timeRange = '24h') {
        try {
            let startTime;
            const now = new Date();

            switch (timeRange) {
                case '1h':
                    startTime = new Date(now.getTime() - 60 * 60 * 1000);
                    break;
                case '24h':
                    startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            }

            const { data, error } = await this.supabase
                .from('chatbot_performance_metrics')
                .select('*')
                .gte('timestamp', startTime.toISOString())
                .order('timestamp', { ascending: true });

            if (error) {
                console.error('Error fetching historical metrics:', error);
                return [];
            }

            return data || [];

        } catch (error) {
            console.error('Error fetching historical metrics:', error);
            return [];
        }
    }

    /**
     * Generate performance report
     */
    async generatePerformanceReport(timeRange = '24h') {
        const currentMetrics = this.getMetrics();
        const historicalData = await this.getHistoricalMetrics(timeRange);
        const insights = this.getPerformanceInsights();

        // Calculate trends
        const trends = this.calculateTrends(historicalData);

        return {
            summary: {
                timeRange,
                generatedAt: new Date().toISOString(),
                totalRequests: currentMetrics.requests.total,
                successRate: (currentMetrics.requests.successful / currentMetrics.requests.total) * 100,
                averageResponseTime: currentMetrics.responseTime.average,
                cacheHitRate: currentMetrics.cache.hitRate,
                errorRate: currentMetrics.errors.rate,
                healthScore: currentMetrics.performance.health,
                efficiencyScore: currentMetrics.performance.efficiency
            },
            current: currentMetrics,
            trends,
            insights,
            recommendations: this.generateRecommendations(currentMetrics, trends, insights)
        };
    }

    /**
     * Calculate performance trends from historical data
     */
    calculateTrends(historicalData) {
        if (historicalData.length < 2) {
            return {
                responseTime: 'stable',
                errorRate: 'stable',
                cacheHitRate: 'stable',
                throughput: 'stable'
            };
        }

        const recent = historicalData.slice(-5); // Last 5 data points
        const older = historicalData.slice(0, 5); // First 5 data points

        const calculateTrend = (recentValues, olderValues) => {
            const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
            const olderAvg = olderValues.reduce((a, b) => a + b, 0) / olderValues.length;

            const change = ((recentAvg - olderAvg) / olderAvg) * 100;

            if (Math.abs(change) < 5) return 'stable';
            return change > 0 ? 'increasing' : 'decreasing';
        };

        return {
            responseTime: calculateTrend(
                recent.map(d => d.metrics.responseTime.average),
                older.map(d => d.metrics.responseTime.average)
            ),
            errorRate: calculateTrend(
                recent.map(d => d.metrics.errors.rate),
                older.map(d => d.metrics.errors.rate)
            ),
            cacheHitRate: calculateTrend(
                recent.map(d => d.metrics.cache.hitRate),
                older.map(d => d.metrics.cache.hitRate)
            ),
            throughput: calculateTrend(
                recent.map(d => d.metrics.requests.total),
                older.map(d => d.metrics.requests.total)
            )
        };
    }

    /**
     * Generate actionable recommendations
     */
    generateRecommendations(metrics, trends, insights) {
        const recommendations = [];

        // Response time recommendations
        if (metrics.responseTime.average > 3000) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Optimize Response Time',
                description: 'Average response time is above optimal threshold',
                actions: [
                    'Implement response caching for common queries',
                    'Optimize Gemini API calls and context management',
                    'Consider request batching for similar queries'
                ]
            });
        }

        // Cache recommendations
        if (metrics.cache.hitRate < 60) {
            recommendations.push({
                category: 'caching',
                priority: 'medium',
                title: 'Improve Cache Strategy',
                description: 'Cache hit rate could be improved',
                actions: [
                    'Expand cacheable content categories',
                    'Implement intelligent cache warming',
                    'Review cache TTL settings for different content types'
                ]
            });
        }

        // Error handling recommendations
        if (metrics.errors.rate > 3) {
            recommendations.push({
                category: 'reliability',
                priority: 'high',
                title: 'Reduce Error Rate',
                description: 'Error rate is above acceptable threshold',
                actions: [
                    'Implement better error handling and retry logic',
                    'Add circuit breakers for external API calls',
                    'Improve input validation and sanitization'
                ]
            });
        }

        // Token optimization recommendations
        if (metrics.tokens.average > 1500) {
            recommendations.push({
                category: 'efficiency',
                priority: 'medium',
                title: 'Optimize Token Usage',
                description: 'Average token consumption is high',
                actions: [
                    'Optimize conversation context management',
                    'Implement smarter prompt engineering',
                    'Use conversation summarization for long chats'
                ]
            });
        }

        return recommendations;
    }

    /**
     * Start monitoring intervals
     */
    startMonitoring() {
        // Store metrics every 5 minutes
        setInterval(async () => {
            await this.storeMetrics();
        }, 5 * 60 * 1000);

        // Reset some metrics daily
        setInterval(() => {
            this.resetDailyMetrics();
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Reset daily metrics
     */
    resetDailyMetrics() {
        // Keep cumulative metrics but reset daily counters
        this.metrics.performance.slowRequests = 0;
        this.metrics.performance.fastRequests = 0;

        // Clear old samples
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.metrics.responseTime.samples = this.metrics.responseTime.samples.filter(
            sample => sample.time > oneDayAgo
        );

        // Clear old errors
        this.metrics.errors.recent = this.metrics.errors.recent.filter(
            error => error.timestamp > oneDayAgo
        );
    }

    /**
     * Get real-time performance status
     */
    getRealtimeStatus() {
        const metrics = this.getMetrics();

        return {
            status: metrics.performance.health > 80 ? 'healthy' :
                metrics.performance.health > 60 ? 'warning' : 'critical',
            health: metrics.performance.health,
            efficiency: metrics.performance.efficiency,
            responseTime: metrics.responseTime.average,
            cacheHitRate: metrics.cache.hitRate,
            errorRate: metrics.errors.rate,
            activeRequests: this.metrics.requests.total,
            lastUpdate: Date.now()
        };
    }
}

// Export singleton instance
export default new ChatbotPerformanceMonitor();