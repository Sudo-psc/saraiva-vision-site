/**
 * Chatbot Performance Dashboard API
 * Provides performance metrics, monitoring data, and optimization insights
 */

import chatbotPerformanceMonitor from '../../src/services/chatbotPerformanceMonitor.js';
import chatbotCacheService from '../../src/services/chatbotCacheService.js';
import chatbotResourceManager from '../../src/services/chatbotResourceManager.js';
import geminiService from '../../src/services/geminiService.js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Validate request parameters
 */
function validateRequest(req) {
    const { timeRange, metric, action } = req.query;
    const errors = [];

    if (timeRange && !['1h', '24h', '7d', '30d'].includes(timeRange)) {
        errors.push('Invalid timeRange. Must be one of: 1h, 24h, 7d, 30d');
    }

    if (metric && !['responseTime', 'errorRate', 'cacheHitRate', 'throughput'].includes(metric)) {
        errors.push('Invalid metric. Must be one of: responseTime, errorRate, cacheHitRate, throughput');
    }

    if (action && !['overview', 'metrics', 'cache', 'resources', 'report', 'health'].includes(action)) {
        errors.push('Invalid action. Must be one of: overview, metrics, cache, resources, report, health');
    }

    return errors;
}

/**
 * Get performance overview
 */
async function getPerformanceOverview() {
    const currentMetrics = chatbotPerformanceMonitor.getMetrics();
    const cacheStats = chatbotCacheService.getCacheStatistics();
    const resourceStatus = chatbotResourceManager.getResourceStatus();
    const geminiStats = geminiService.getServiceStatistics();

    return {
        summary: {
            status: currentMetrics.performance.health > 80 ? 'healthy' :
                currentMetrics.performance.health > 60 ? 'warning' : 'critical',
            healthScore: currentMetrics.performance.health,
            efficiencyScore: currentMetrics.performance.efficiency,
            uptime: process.uptime(),
            timestamp: Date.now()
        },
        performance: {
            responseTime: {
                average: currentMetrics.responseTime.average,
                p95: currentMetrics.responseTime.recent.p95,
                p99: currentMetrics.responseTime.recent.p99
            },
            throughput: {
                totalRequests: currentMetrics.requests.total,
                successfulRequests: currentMetrics.requests.successful,
                failedRequests: currentMetrics.requests.failed,
                successRate: (currentMetrics.requests.successful / currentMetrics.requests.total) * 100
            },
            errors: {
                rate: currentMetrics.errors.rate,
                total: currentMetrics.errors.total,
                recentErrors: currentMetrics.errors.recent.length
            }
        },
        cache: {
            hitRate: cacheStats.hitRate,
            totalHits: cacheStats.hits,
            totalMisses: cacheStats.misses,
            memoryCacheSize: cacheStats.memoryCacheSize,
            memoryCacheUtilization: cacheStats.memoryCacheUtilization
        },
        resources: {
            connections: {
                active: resourceStatus.connections.active,
                idle: resourceStatus.connections.idle,
                total: resourceStatus.connections.total
            },
            memory: {
                heapUsedMB: resourceStatus.memory.heapUsedMB,
                heapTotalMB: resourceStatus.memory.heapTotalMB,
                rssMB: resourceStatus.memory.rssMB
            },
            load: resourceStatus.load,
            activeRequests: resourceStatus.requests.active,
            queuedRequests: resourceStatus.requests.queued
        },
        gemini: {
            activeContexts: geminiStats.activeContexts,
            activeSessions: geminiStats.activeSessions,
            totalTokensUsed: geminiStats.totalTokensUsed,
            averageTokensPerSession: geminiStats.averageTokensPerSession
        }
    };
}

/**
 * Get detailed metrics
 */
async function getDetailedMetrics(timeRange = '24h') {
    const currentMetrics = chatbotPerformanceMonitor.getMetrics();
    const historicalData = await chatbotPerformanceMonitor.getHistoricalMetrics(timeRange);
    const insights = chatbotPerformanceMonitor.getPerformanceInsights();

    return {
        current: currentMetrics,
        historical: historicalData,
        insights: insights,
        trends: historicalData.length > 1 ?
            chatbotPerformanceMonitor.calculateTrends(historicalData) : null
    };
}

/**
 * Get cache performance data
 */
async function getCachePerformance() {
    const cacheStats = chatbotCacheService.getCacheStatistics();
    const cacheHealth = await chatbotCacheService.getCacheHealth();

    return {
        statistics: cacheStats,
        health: cacheHealth,
        recommendations: []
    };
}

/**
 * Get resource utilization data
 */
function getResourceUtilization() {
    const resourceStatus = chatbotResourceManager.getResourceStatus();
    const recommendations = chatbotResourceManager.getPerformanceRecommendations();

    return {
        status: resourceStatus,
        recommendations: recommendations,
        optimization: {
            connectionPoolEfficiency: resourceStatus.connections.active / resourceStatus.connections.total,
            requestProcessingEfficiency: resourceStatus.requests.avgProcessingTime > 0 ?
                1000 / resourceStatus.requests.avgProcessingTime : 0,
            memoryEfficiency: resourceStatus.memory.heapUsedMB / resourceStatus.memory.heapTotalMB
        }
    };
}

/**
 * Generate comprehensive performance report
 */
async function generatePerformanceReport(timeRange = '24h') {
    const report = await chatbotPerformanceMonitor.generatePerformanceReport(timeRange);
    const cacheHealth = await chatbotCacheService.getCacheHealth();
    const resourceStatus = chatbotResourceManager.getResourceStatus();

    return {
        ...report,
        cache: {
            health: cacheHealth,
            statistics: chatbotCacheService.getCacheStatistics()
        },
        resources: {
            status: resourceStatus,
            recommendations: chatbotResourceManager.getPerformanceRecommendations()
        },
        systemHealth: {
            overall: report.summary.healthScore,
            components: {
                performance: report.summary.healthScore,
                cache: cacheHealth.status === 'healthy' ? 100 :
                    cacheHealth.status === 'error' ? 0 : 50,
                resources: resourceStatus.load < 0.8 ? 100 :
                    resourceStatus.load < 0.9 ? 70 : 30
            }
        }
    };
}

/**
 * Get system health status
 */
async function getHealthStatus() {
    const performanceStatus = chatbotPerformanceMonitor.getRealtimeStatus();
    const cacheHealth = await chatbotCacheService.getCacheHealth();
    const resourceStatus = chatbotResourceManager.getResourceStatus();
    const geminiHealth = geminiService.getHealthStatus();

    const componentHealth = {
        performance: performanceStatus.status,
        cache: cacheHealth.status,
        resources: resourceStatus.load < 0.8 ? 'healthy' :
            resourceStatus.load < 0.9 ? 'warning' : 'critical',
        gemini: geminiHealth.status
    };

    const overallHealth = Object.values(componentHealth).every(status => status === 'healthy') ? 'healthy' :
        Object.values(componentHealth).some(status => status === 'critical') ? 'critical' : 'warning';

    return {
        overall: overallHealth,
        components: componentHealth,
        details: {
            performance: {
                status: performanceStatus.status,
                health: performanceStatus.health,
                responseTime: performanceStatus.responseTime,
                errorRate: performanceStatus.errorRate
            },
            cache: {
                status: cacheHealth.status,
                hitRate: cacheHealth.memory?.hitRate || 0,
                totalEntries: cacheHealth.database?.totalEntries || 0
            },
            resources: {
                status: componentHealth.resources,
                load: resourceStatus.load,
                connections: resourceStatus.connections,
                memory: resourceStatus.memory
            },
            gemini: {
                status: geminiHealth.status,
                activeContexts: geminiHealth.statistics.activeContexts,
                totalTokensUsed: geminiHealth.statistics.totalTokensUsed
            }
        },
        timestamp: Date.now()
    };
}

/**
 * Main handler
 */
export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed',
            message: 'Only GET requests are supported'
        });
    }

    try {
        // Validate request
        const validationErrors = validateRequest(req);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                message: 'Request validation failed',
                details: validationErrors
            });
        }

        const { action = 'overview', timeRange = '24h', metric } = req.query;

        let data;

        switch (action) {
            case 'overview':
                data = await getPerformanceOverview();
                break;

            case 'metrics':
                data = await getDetailedMetrics(timeRange);
                break;

            case 'cache':
                data = await getCachePerformance();
                break;

            case 'resources':
                data = getResourceUtilization();
                break;

            case 'report':
                data = await generatePerformanceReport(timeRange);
                break;

            case 'health':
                data = await getHealthStatus();
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action',
                    message: 'Unsupported action requested'
                });
        }

        return res.status(200).json({
            success: true,
            action: action,
            timeRange: timeRange,
            data: data,
            metadata: {
                generatedAt: new Date().toISOString(),
                requestId: req.headers['x-request-id'] || 'unknown'
            }
        });

    } catch (error) {
        console.error('Performance API error:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve performance data',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
}

/**
 * Helper function to get performance trends for specific metric
 */
export async function getMetricTrends(metric, timeRange = '24h') {
    try {
        const { data, error } = await supabase
            .rpc('get_performance_trends', {
                metric_path: `performance.${metric}`,
                time_range: `${timeRange}`,
                bucket_interval: timeRange === '1h' ? '5 minutes' :
                    timeRange === '24h' ? '1 hour' :
                        timeRange === '7d' ? '6 hours' : '1 day'
            });

        if (error) {
            console.error('Error fetching metric trends:', error);
            return [];
        }

        return data || [];

    } catch (error) {
        console.error('Error fetching metric trends:', error);
        return [];
    }
}

/**
 * Helper function to detect performance anomalies
 */
export async function detectAnomalies(timeRange = '24h') {
    try {
        const { data, error } = await supabase
            .rpc('detect_performance_anomalies', {
                threshold_multiplier: 2.0,
                time_range: `${timeRange}`
            });

        if (error) {
            console.error('Error detecting anomalies:', error);
            return [];
        }

        return data || [];

    } catch (error) {
        console.error('Error detecting anomalies:', error);
        return [];
    }
}