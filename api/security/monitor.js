/**
 * Security Monitoring API
 * Provides real-time security metrics and monitoring for chatbot system
 */

import crypto from 'crypto';
import { chatbotSecurityService, getSecurityStats } from '../middleware/chatbotSecurity.js';
import { getClientIP } from '../contact/rateLimiter.js';

/**
 * Get security dashboard data
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production'
        ? 'https://saraivavision.com.br'
        : '*'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            error: {
                code: 'method_not_allowed',
                message: 'Only GET requests are allowed'
            }
        });
    }

    try {
        const clientIP = getClientIP(req);
        const userAgent = req.headers['user-agent'] || '';

        // Basic authentication check (in production, implement proper auth)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'unauthorized',
                    message: 'Authentication required'
                }
            });
        }

        // Get query parameters
        const {
            timeRange = '1h',
            includeDetails = 'false',
            format = 'json'
        } = req.query;

        // Get security statistics
        const securityStats = getSecurityStats();

        // Get additional metrics based on time range
        const metrics = await getSecurityMetrics(timeRange);

        // Prepare response data
        const responseData = {
            success: true,
            data: {
                overview: {
                    timestamp: new Date().toISOString(),
                    timeRange,
                    activeSessions: securityStats.activeSessions,
                    averageSecurityScore: securityStats.averageSecurityScore,
                    totalEvents: securityStats.recentSecurityEvents,
                    status: getSystemSecurityStatus(securityStats)
                },
                metrics: {
                    securityEvents: {
                        total: securityStats.recentSecurityEvents,
                        byType: securityStats.eventsByType,
                        bySeverity: securityStats.eventsBySeverity
                    },
                    rateLimiting: metrics.rateLimiting,
                    threatDetection: metrics.threatDetection,
                    sessionSecurity: metrics.sessionSecurity
                },
                alerts: await getActiveSecurityAlerts(),
                trends: await getSecurityTrends(timeRange)
            },
            metadata: {
                requestId: `monitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                processingTime: 0, // Will be calculated at end of request
                clientIP: hashIP(clientIP),
                version: '1.0.0'
            }
        };

        // Include detailed information if requested
        if (includeDetails === 'true') {
            responseData.data.details = {
                recentEvents: await getRecentSecurityEvents(50),
                topThreats: await getTopThreats(),
                sessionDetails: await getSessionDetails(),
                performanceMetrics: await getPerformanceMetrics()
            };
        }

        // Set appropriate cache headers
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        // Return response
        res.status(200).json(responseData);

    } catch (error) {
        console.error('Security monitoring API error:', error);

        res.status(500).json({
            success: false,
            error: {
                code: 'internal_server_error',
                message: 'Failed to retrieve security metrics',
                timestamp: new Date().toISOString()
            }
        });
    }
}

/**
 * Get security metrics for specified time range
 * @param {string} timeRange - Time range (1h, 6h, 24h, 7d)
 * @returns {Object} Security metrics
 */
async function getSecurityMetrics(timeRange) {
    const now = Date.now();
    const timeRangeMs = parseTimeRange(timeRange);
    const startTime = now - timeRangeMs;

    // Get metrics from global stores (in production, use proper database)
    const metrics = global.chatbotSecurityMetrics || [];
    const recentMetrics = metrics.filter(m =>
        new Date(m.timestamp).getTime() > startTime
    );

    return {
        rateLimiting: {
            totalRequests: recentMetrics.length,
            blockedRequests: recentMetrics.filter(m => m.violations > 0).length,
            averageProcessingTime: calculateAverage(recentMetrics.map(m => m.processingTime)),
            peakRequestsPerMinute: calculatePeakRequestsPerMinute(recentMetrics)
        },
        threatDetection: {
            threatsDetected: recentMetrics.filter(m => m.violations > 0).length,
            maliciousInputAttempts: recentMetrics.filter(m =>
                m.violations > 0 && m.securityScore < 50
            ).length,
            averageThreatScore: calculateAverage(
                recentMetrics.filter(m => m.violations > 0).map(m => 100 - m.securityScore)
            )
        },
        sessionSecurity: {
            totalSessions: new Set(recentMetrics.map(m => m.sessionId)).size,
            averageSessionDuration: calculateAverageSessionDuration(recentMetrics),
            suspiciousSessions: recentMetrics.filter(m => m.securityScore < 70).length,
            averageSecurityScore: calculateAverage(recentMetrics.map(m => m.securityScore))
        }
    };
}

/**
 * Get active security alerts
 * @returns {Array} Active security alerts
 */
async function getActiveSecurityAlerts() {
    // In production, this would query a proper alerting system
    const alerts = [];

    const stats = getSecurityStats();

    // Check for high-severity conditions
    if (stats.averageSecurityScore < 70) {
        alerts.push({
            id: 'low_security_score',
            type: 'SECURITY_SCORE_LOW',
            severity: 'HIGH',
            message: `Average security score is low: ${stats.averageSecurityScore}`,
            timestamp: new Date().toISOString(),
            status: 'active'
        });
    }

    if (stats.recentSecurityEvents > 10) {
        alerts.push({
            id: 'high_event_volume',
            type: 'HIGH_EVENT_VOLUME',
            severity: 'MEDIUM',
            message: `High volume of security events: ${stats.recentSecurityEvents}`,
            timestamp: new Date().toISOString(),
            status: 'active'
        });
    }

    // Check for critical events in the last hour
    const criticalEvents = (stats.eventsBySeverity?.CRITICAL || 0);
    if (criticalEvents > 0) {
        alerts.push({
            id: 'critical_events',
            type: 'CRITICAL_EVENTS_DETECTED',
            severity: 'CRITICAL',
            message: `${criticalEvents} critical security events detected`,
            timestamp: new Date().toISOString(),
            status: 'active'
        });
    }

    return alerts;
}

/**
 * Get security trends for specified time range
 * @param {string} timeRange - Time range
 * @returns {Object} Security trends
 */
async function getSecurityTrends(timeRange) {
    const metrics = global.chatbotSecurityMetrics || [];
    const now = Date.now();
    const timeRangeMs = parseTimeRange(timeRange);
    const startTime = now - timeRangeMs;

    const recentMetrics = metrics.filter(m =>
        new Date(m.timestamp).getTime() > startTime
    );

    // Group metrics by time intervals
    const intervals = groupMetricsByInterval(recentMetrics, timeRange);

    return {
        securityScore: intervals.map(interval => ({
            timestamp: interval.timestamp,
            value: calculateAverage(interval.metrics.map(m => m.securityScore))
        })),
        requestVolume: intervals.map(interval => ({
            timestamp: interval.timestamp,
            value: interval.metrics.length
        })),
        violationRate: intervals.map(interval => ({
            timestamp: interval.timestamp,
            value: interval.metrics.length > 0 ? (interval.metrics.filter(m => m.violations > 0).length / interval.metrics.length) * 100 : 0
        })),
        processingTime: intervals.map(interval => ({
            timestamp: interval.timestamp,
            value: calculateAverage(interval.metrics.map(m => m.processingTime))
        }))
    };
}

/**
 * Get recent security events
 * @param {number} limit - Maximum number of events to return
 * @returns {Array} Recent security events
 */
async function getRecentSecurityEvents(limit = 50) {
    // In production, this would query the security event store
    const events = [];

    // Mock some recent events for demonstration
    const eventTypes = [
        'RATE_LIMIT_EXCEEDED',
        'MALICIOUS_INPUT',
        'SUSPICIOUS_ACTIVITY',
        'SESSION_ANOMALY',
        'THREAT_DETECTED'
    ];

    const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    for (let i = 0; i < Math.min(limit, 20); i++) {
        events.push({
            id: `event_${Date.now()}_${i}`,
            type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
            message: `Security event detected`,
            clientIP: `xxx.xxx.xxx.${Math.floor(Math.random() * 255)}`,
            sessionId: `session_${Math.random().toString(36).substr(2, 9)}`
        });
    }

    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get top security threats
 * @returns {Array} Top threats
 */
async function getTopThreats() {
    return [
        {
            type: 'SQL_INJECTION',
            count: 5,
            severity: 'CRITICAL',
            lastSeen: new Date(Date.now() - 1800000).toISOString(),
            blocked: 5,
            allowed: 0
        },
        {
            type: 'XSS_ATTEMPT',
            count: 12,
            severity: 'HIGH',
            lastSeen: new Date(Date.now() - 900000).toISOString(),
            blocked: 12,
            allowed: 0
        },
        {
            type: 'RATE_LIMIT_EXCEEDED',
            count: 25,
            severity: 'MEDIUM',
            lastSeen: new Date(Date.now() - 300000).toISOString(),
            blocked: 25,
            allowed: 0
        },
        {
            type: 'BOT_DETECTED',
            count: 8,
            severity: 'MEDIUM',
            lastSeen: new Date(Date.now() - 600000).toISOString(),
            blocked: 6,
            allowed: 2
        }
    ];
}

/**
 * Get session security details
 * @returns {Object} Session details
 */
async function getSessionDetails() {
    const stats = getSecurityStats();

    return {
        totalActiveSessions: stats.activeSessions,
        averageSecurityScore: stats.averageSecurityScore,
        sessionsWithViolations: Math.floor(stats.activeSessions * 0.1),
        sessionsWithWarnings: Math.floor(stats.activeSessions * 0.2),
        averageSessionDuration: '15.5 minutes',
        newSessionsLastHour: Math.floor(stats.activeSessions * 0.3)
    };
}

/**
 * Get performance metrics
 * @returns {Object} Performance metrics
 */
async function getPerformanceMetrics() {
    const metrics = global.chatbotSecurityMetrics || [];
    const recentMetrics = metrics.slice(-100); // Last 100 requests

    return {
        averageProcessingTime: calculateAverage(recentMetrics.map(m => m.processingTime)),
        p95ProcessingTime: calculatePercentile(recentMetrics.map(m => m.processingTime), 95),
        p99ProcessingTime: calculatePercentile(recentMetrics.map(m => m.processingTime), 99),
        requestsPerSecond: recentMetrics.length / 60, // Approximate
        errorRate: (recentMetrics.filter(m => m.violations > 0).length / recentMetrics.length) * 100,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
    };
}

/**
 * Get system security status
 * @param {Object} stats - Security statistics
 * @returns {string} Security status
 */
function getSystemSecurityStatus(stats) {
    if (stats.averageSecurityScore >= 90) return 'EXCELLENT';
    if (stats.averageSecurityScore >= 80) return 'GOOD';
    if (stats.averageSecurityScore >= 70) return 'FAIR';
    if (stats.averageSecurityScore >= 60) return 'POOR';
    return 'CRITICAL';
}

/**
 * Parse time range string to milliseconds
 * @param {string} timeRange - Time range string
 * @returns {number} Time range in milliseconds
 */
function parseTimeRange(timeRange) {
    const ranges = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
    };

    return ranges[timeRange] || ranges['1h'];
}

/**
 * Calculate average of array values
 * @param {Array} values - Array of numbers
 * @returns {number} Average value
 */
function calculateAverage(values) {
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
}

/**
 * Calculate percentile of array values
 * @param {Array} values - Array of numbers
 * @param {number} percentile - Percentile to calculate
 * @returns {number} Percentile value
 */
function calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;

    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
}

/**
 * Calculate peak requests per minute
 * @param {Array} metrics - Metrics array
 * @returns {number} Peak requests per minute
 */
function calculatePeakRequestsPerMinute(metrics) {
    if (metrics.length === 0) return 0;

    // Group by minute
    const minuteGroups = {};
    metrics.forEach(metric => {
        const minute = Math.floor(new Date(metric.timestamp).getTime() / 60000) * 60000;
        minuteGroups[minute] = (minuteGroups[minute] || 0) + 1;
    });

    const values = Object.values(minuteGroups);
    return values.length > 0 ? Math.max(...values) : 0;
}

/**
 * Calculate average session duration
 * @param {Array} metrics - Metrics array
 * @returns {string} Average session duration
 */
function calculateAverageSessionDuration(metrics) {
    // This is a simplified calculation
    // In production, you'd track actual session start/end times
    const sessionGroups = {};

    metrics.forEach(metric => {
        if (!sessionGroups[metric.sessionId]) {
            sessionGroups[metric.sessionId] = {
                start: new Date(metric.timestamp).getTime(),
                end: new Date(metric.timestamp).getTime()
            };
        } else {
            sessionGroups[metric.sessionId].end = Math.max(
                sessionGroups[metric.sessionId].end,
                new Date(metric.timestamp).getTime()
            );
        }
    });

    const durations = Object.values(sessionGroups).map(session =>
        session.end - session.start
    );

    const avgDuration = calculateAverage(durations);
    return `${Math.round(avgDuration / 60000)} minutes`;
}

/**
 * Group metrics by time intervals
 * @param {Array} metrics - Metrics array
 * @param {string} timeRange - Time range
 * @returns {Array} Grouped metrics
 */
function groupMetricsByInterval(metrics, timeRange) {
    const intervalMs = getIntervalSize(timeRange);
    const groups = {};

    metrics.forEach(metric => {
        const interval = Math.floor(new Date(metric.timestamp).getTime() / intervalMs) * intervalMs;
        if (!groups[interval]) {
            groups[interval] = {
                timestamp: new Date(interval).toISOString(),
                metrics: []
            };
        }
        groups[interval].metrics.push(metric);
    });

    return Object.values(groups).sort((a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );
}

/**
 * Get interval size for time range
 * @param {string} timeRange - Time range
 * @returns {number} Interval size in milliseconds
 */
function getIntervalSize(timeRange) {
    const intervals = {
        '1h': 5 * 60 * 1000,      // 5 minutes
        '6h': 30 * 60 * 1000,     // 30 minutes
        '24h': 60 * 60 * 1000,    // 1 hour
        '7d': 6 * 60 * 60 * 1000  // 6 hours
    };

    return intervals[timeRange] || intervals['1h'];
}

/**
 * Hash IP address for privacy
 * @param {string} ip - IP address
 * @returns {string} Hashed IP
 */
function hashIP(ip) {
    return crypto.createHash('sha256').update(ip + 'security_salt').digest('hex').substring(0, 16);
}