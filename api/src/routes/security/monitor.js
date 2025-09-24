/**
 * Security Monitoring API Endpoint
 * Provides security metrics, threat detection logs, and configuration validation
 */

import { supabaseAdmin } from '../../../../../../..../../../../src/lib/supabase.ts';
import { applyCorsHeaders, applySecurityHeaders } from '../utils/securityHeaders.js';
import { validateSecurityConfig, getSecurityConfig } from '../config/security.js';
import { getRateLimitStats } from '../contact/rateLimiter.js';
import { createLogger } from '../../../../../../..../../../../src/lib/logger.js';

/**
 * Security monitoring handler
 */
export default async function handler(req, res) {
    const requestId = `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const logger = createLogger('security-monitor', requestId);

    // Apply security headers (admin type for monitoring endpoint)
    applyCorsHeaders(req, res);
    applySecurityHeaders(res, {
        requestId,
        customHeaders: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    // Only allow GET requests for monitoring
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: {
                code: 'METHOD_NOT_ALLOWED',
                message: 'Only GET requests are allowed',
                timestamp: new Date().toISOString(),
                requestId
            }
        });
    }

    try {
        const { type = 'overview', timeRange = '1h', limit = 100 } = req.query;

        await logger.info('Security monitoring request', {
            type,
            timeRange,
            limit: parseInt(limit)
        });

        switch (type) {
            case 'overview':
                return await getSecurityOverview(req, res, requestId);

            case 'threats':
                return await getThreatLogs(req, res, requestId, timeRange, parseInt(limit));

            case 'rate-limits':
                return await getRateLimitMetrics(req, res, requestId);

            case 'config':
                return await getConfigValidation(req, res, requestId);

            case 'stats':
                return await getSecurityStats(req, res, requestId, timeRange);

            default:
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_TYPE',
                        message: 'Invalid monitoring type. Use: overview, threats, rate-limits, config, stats',
                        timestamp: new Date().toISOString(),
                        requestId
                    }
                });
        }

    } catch (error) {
        await logger.error('Security monitoring error', {
            error_message: error.message,
            error_stack: error.stack
        });

        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Security monitoring failed',
                timestamp: new Date().toISOString(),
                requestId
            }
        });
    }
}

/**
 * Get security overview with key metrics
 */
async function getSecurityOverview(req, res, requestId) {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Get threat detection events from last hour
        const { data: recentThreats, error: threatsError } = await supabaseAdmin
            .from('event_log')
            .select('*')
            .in('event_type', ['security_threat_detected', 'spam_detected', 'rate_limit_exceeded'])
            .gte('created_at', oneHourAgo.toISOString())
            .order('created_at', { ascending: false });

        if (threatsError) {
            throw threatsError;
        }

        // Get successful requests from last hour
        const { data: successfulRequests, error: successError } = await supabaseAdmin
            .from('event_log')
            .select('*')
            .in('event_type', ['contact_submitted', 'appointment_created', 'chatbot_response'])
            .gte('created_at', oneHourAgo.toISOString());

        if (successError) {
            throw successError;
        }

        // Get rate limit statistics
        const rateLimitStats = getRateLimitStats();

        // Calculate threat metrics
        const threatsByType = recentThreats.reduce((acc, threat) => {
            const type = threat.event_type;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        const threatsBySource = recentThreats.reduce((acc, threat) => {
            const source = threat.source || 'unknown';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {});

        // Calculate success rate
        const totalRequests = recentThreats.length + successfulRequests.length;
        const successRate = totalRequests > 0 ? (successfulRequests.length / totalRequests * 100).toFixed(2) : 100;

        // Validate security configuration
        const configValidation = validateSecurityConfig();

        const overview = {
            timestamp: new Date().toISOString(),
            timeRange: '1 hour',
            metrics: {
                totalRequests,
                successfulRequests: successfulRequests.length,
                blockedRequests: recentThreats.length,
                successRate: parseFloat(successRate),
                threatDetectionRate: totalRequests > 0 ? (recentThreats.length / totalRequests * 100).toFixed(2) : 0
            },
            threats: {
                total: recentThreats.length,
                byType: threatsByType,
                bySource: threatsBySource,
                recent: recentThreats.slice(0, 5).map(threat => ({
                    type: threat.event_type,
                    source: threat.source,
                    timestamp: threat.created_at,
                    severity: threat.severity,
                    data: threat.event_data
                }))
            },
            rateLimits: {
                ...rateLimitStats,
                status: rateLimitStats.activeEntries > 100 ? 'high_load' : 'normal'
            },
            configuration: {
                valid: configValidation.valid,
                issues: configValidation.issues.length,
                warnings: configValidation.warnings.length,
                environment: process.env.NODE_ENV
            },
            status: {
                overall: getOverallSecurityStatus(recentThreats.length, configValidation.valid, rateLimitStats.activeEntries),
                lastUpdated: new Date().toISOString()
            }
        };

        return res.status(200).json({
            success: true,
            data: overview,
            requestId
        });

    } catch (error) {
        throw error;
    }
}

/**
 * Get detailed threat detection logs
 */
async function getThreatLogs(req, res, requestId, timeRange, limit) {
    try {
        const timeRangeMs = parseTimeRange(timeRange);
        const since = new Date(Date.now() - timeRangeMs);

        const { data: threats, error } = await supabaseAdmin
            .from('event_log')
            .select('*')
            .in('event_type', [
                'security_threat_detected',
                'spam_detected',
                'rate_limit_exceeded',
                'honeypot_triggered',
                'suspicious_user_agent',
                'xss_attempt_blocked',
                'sql_injection_blocked'
            ])
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        // Analyze threat patterns
        const analysis = {
            totalThreats: threats.length,
            threatTypes: {},
            severityDistribution: {},
            sourceDistribution: {},
            timeDistribution: {},
            topThreats: []
        };

        threats.forEach(threat => {
            // Count by type
            analysis.threatTypes[threat.event_type] = (analysis.threatTypes[threat.event_type] || 0) + 1;

            // Count by severity
            analysis.severityDistribution[threat.severity] = (analysis.severityDistribution[threat.severity] || 0) + 1;

            // Count by source
            const source = threat.source || 'unknown';
            analysis.sourceDistribution[source] = (analysis.sourceDistribution[source] || 0) + 1;

            // Count by hour
            const hour = new Date(threat.created_at).getHours();
            analysis.timeDistribution[hour] = (analysis.timeDistribution[hour] || 0) + 1;
        });

        // Get top threats by frequency
        analysis.topThreats = Object.entries(analysis.threatTypes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([type, count]) => ({ type, count }));

        return res.status(200).json({
            success: true,
            data: {
                threats: threats.map(threat => ({
                    id: threat.id,
                    type: threat.event_type,
                    severity: threat.severity,
                    source: threat.source,
                    timestamp: threat.created_at,
                    data: threat.event_data,
                    // Remove sensitive data from response
                    sanitizedData: sanitizeThreatData(threat.event_data)
                })),
                analysis,
                timeRange,
                limit
            },
            requestId
        });

    } catch (error) {
        throw error;
    }
}

/**
 * Get rate limiting metrics
 */
async function getRateLimitMetrics(req, res, requestId) {
    try {
        const stats = getRateLimitStats();

        // Get rate limit events from last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const { data: rateLimitEvents, error } = await supabaseAdmin
            .from('event_log')
            .select('*')
            .eq('event_type', 'rate_limit_exceeded')
            .gte('created_at', oneDayAgo.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Analyze rate limit patterns
        const analysis = {
            totalViolations: rateLimitEvents.length,
            violationsByHour: {},
            violationsByEndpoint: {},
            topViolators: {}
        };

        rateLimitEvents.forEach(event => {
            const hour = new Date(event.created_at).getHours();
            analysis.violationsByHour[hour] = (analysis.violationsByHour[hour] || 0) + 1;

            const endpoint = event.source || 'unknown';
            analysis.violationsByEndpoint[endpoint] = (analysis.violationsByEndpoint[endpoint] || 0) + 1;
        });

        return res.status(200).json({
            success: true,
            data: {
                currentStats: stats,
                violations: {
                    last24Hours: rateLimitEvents.length,
                    analysis
                },
                configuration: {
                    windowMs: process.env.RATE_LIMIT_WINDOW || '15',
                    maxRequests: process.env.RATE_LIMIT_MAX || '10'
                }
            },
            requestId
        });

    } catch (error) {
        throw error;
    }
}

/**
 * Get security configuration validation
 */
async function getConfigValidation(req, res, requestId) {
    try {
        const validation = validateSecurityConfig();

        // Get configuration for all endpoints
        const configs = {
            contact: getSecurityConfig('contact', 'public'),
            appointments: getSecurityConfig('appointments', 'public'),
            chatbot: getSecurityConfig('chatbot', 'public'),
            dashboard: getSecurityConfig('dashboard', 'admin')
        };

        return res.status(200).json({
            success: true,
            data: {
                validation,
                configurations: configs,
                environment: {
                    nodeEnv: process.env.NODE_ENV,
                    rateLimitWindow: process.env.RATE_LIMIT_WINDOW,
                    rateLimitMax: process.env.RATE_LIMIT_MAX
                }
            },
            requestId
        });

    } catch (error) {
        throw error;
    }
}

/**
 * Get comprehensive security statistics
 */
async function getSecurityStats(req, res, requestId, timeRange) {
    try {
        const timeRangeMs = parseTimeRange(timeRange);
        const since = new Date(Date.now() - timeRangeMs);

        // Get all security-related events
        const { data: events, error } = await supabaseAdmin
            .from('event_log')
            .select('*')
            .in('event_type', [
                'security_threat_detected', 'spam_detected', 'rate_limit_exceeded',
                'contact_submitted', 'appointment_created', 'chatbot_response',
                'api_error', 'validation_failed'
            ])
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        // Calculate comprehensive statistics
        const stats = calculateSecurityStats(events, timeRangeMs);

        return res.status(200).json({
            success: true,
            data: {
                ...stats,
                timeRange,
                generatedAt: new Date().toISOString()
            },
            requestId
        });

    } catch (error) {
        throw error;
    }
}

/**
 * Helper functions
 */

function parseTimeRange(timeRange) {
    const ranges = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
    };

    return ranges[timeRange] || ranges['24h'];
}

function getOverallSecurityStatus(threatCount, configValid, activeRateLimits) {
    if (!configValid) return 'critical';
    if (threatCount > 50) return 'high_risk';
    if (threatCount > 10 || activeRateLimits > 100) return 'elevated';
    return 'normal';
}

function sanitizeThreatData(data) {
    if (!data || typeof data !== 'object') return data;

    const sanitized = { ...data };

    // Remove sensitive fields
    delete sanitized.clientIP;
    delete sanitized.hashedIP;
    delete sanitized.userAgent;
    delete sanitized.email;
    delete sanitized.phone;

    // Truncate long strings
    Object.keys(sanitized).forEach(key => {
        if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
            sanitized[key] = sanitized[key].substring(0, 100) + '...';
        }
    });

    return sanitized;
}

function calculateSecurityStats(events, timeRangeMs) {
    const stats = {
        totalEvents: events.length,
        eventsByType: {},
        eventsBySeverity: {},
        eventsBySource: {},
        timeline: {},
        securityMetrics: {
            threatDetectionRate: 0,
            falsePositiveRate: 0,
            responseTime: 0,
            uptime: 0
        }
    };

    // Process events
    events.forEach(event => {
        // Count by type
        stats.eventsByType[event.event_type] = (stats.eventsByType[event.event_type] || 0) + 1;

        // Count by severity
        stats.eventsBySeverity[event.severity] = (stats.eventsBySeverity[event.severity] || 0) + 1;

        // Count by source
        const source = event.source || 'unknown';
        stats.eventsBySource[source] = (stats.eventsBySource[source] || 0) + 1;

        // Timeline (by hour)
        const hour = new Date(event.created_at).getHours();
        stats.timeline[hour] = (stats.timeline[hour] || 0) + 1;
    });

    // Calculate security metrics
    const threatEvents = events.filter(e =>
        ['security_threat_detected', 'spam_detected', 'rate_limit_exceeded'].includes(e.event_type)
    );

    const successEvents = events.filter(e =>
        ['contact_submitted', 'appointment_created', 'chatbot_response'].includes(e.event_type)
    );

    const totalRequests = threatEvents.length + successEvents.length;

    if (totalRequests > 0) {
        stats.securityMetrics.threatDetectionRate = (threatEvents.length / totalRequests * 100).toFixed(2);
    }

    return stats;
}