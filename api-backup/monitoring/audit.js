/**
 * Audit Monitoring API
 * Provides access to audit logs, compliance reports, and monitoring data
 */

import AuditLoggingService from '../../src/services/auditLoggingService.js';
import { getClientIP } from '../contact/rateLimiter.js';

// Initialize audit logging service
const auditService = new AuditLoggingService();

/**
 * Handle audit monitoring requests
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

    try {
        const clientIP = getClientIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const requestId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Log API access
        await auditService.logDataAccessEvent({
            dataType: 'audit_logs',
            operation: 'read',
            purpose: 'monitoring',
            legalBasis: 'legitimate_interest'
        }, {
            clientIP,
            userAgent,
            requestId,
            endpoint: req.url
        });

        // Basic authentication check
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'unauthorized',
                    message: 'Authentication required for audit access'
                }
            });
        }

        // Route based on request method and path
        const { method, query } = req;
        const action = query.action || 'statistics';

        switch (method) {
            case 'GET':
                return await handleGetRequest(req, res, action, auditService);
            case 'POST':
                return await handlePostRequest(req, res, auditService);
            default:
                return res.status(405).json({
                    success: false,
                    error: {
                        code: 'method_not_allowed',
                        message: 'Only GET and POST methods are allowed'
                    }
                });
        }

    } catch (error) {
        console.error('Audit monitoring API error:', error);

        res.status(500).json({
            success: false,
            error: {
                code: 'internal_server_error',
                message: 'Failed to process audit request',
                timestamp: new Date().toISOString()
            }
        });
    }
}

/**
 * Handle GET requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {string} action - Action to perform
 * @param {AuditLoggingService} auditService - Audit service instance
 */
async function handleGetRequest(req, res, action, auditService) {
    const { query } = req;

    switch (action) {
        case 'statistics':
            return await getAuditStatistics(req, res, auditService);

        case 'events':
            return await getAuditEvents(req, res, auditService, query);

        case 'compliance-report':
            return await getComplianceReport(req, res, auditService, query);

        case 'security-dashboard':
            return await getSecurityDashboard(req, res, auditService, query);

        case 'performance-metrics':
            return await getPerformanceMetrics(req, res, auditService, query);

        case 'alerts':
            return await getActiveAlerts(req, res, auditService);

        case 'dashboard':
            return await getMonitoringDashboard(req, res, auditService, query);

        case 'real-time-alerts':
            return await checkRealTimeAlerts(req, res, auditService);

        case 'security-analysis':
            return await performSecurityAnalysis(req, res, auditService, query);

        case 'compliance-monitoring':
            return await performComplianceMonitoring(req, res, auditService, query);

        default:
            return res.status(400).json({
                success: false,
                error: {
                    code: 'invalid_action',
                    message: `Unknown action: ${action}`,
                    availableActions: [
                        'statistics', 'events', 'compliance-report',
                        'security-dashboard', 'performance-metrics', 'alerts'
                    ]
                }
            });
    }
}

/**
 * Handle POST requests
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {AuditLoggingService} auditService - Audit service instance
 */
async function handlePostRequest(req, res, auditService) {
    const { action } = req.body;

    switch (action) {
        case 'generate-report':
            return await generateComplianceReport(req, res, auditService);

        case 'acknowledge-alert':
            return await acknowledgeAlert(req, res, auditService);

        case 'export-logs':
            return await exportAuditLogs(req, res, auditService);

        default:
            return res.status(400).json({
                success: false,
                error: {
                    code: 'invalid_action',
                    message: `Unknown POST action: ${action}`,
                    availableActions: ['generate-report', 'acknowledge-alert', 'export-logs']
                }
            });
    }
}

/**
 * Get audit statistics
 */
async function getAuditStatistics(req, res, auditService) {
    const statistics = auditService.getAuditStatistics();

    res.status(200).json({
        success: true,
        data: {
            overview: {
                totalEvents: statistics.totalEvents,
                activeAlerts: statistics.activeAlerts,
                systemHealth: statistics.systemHealth.storeSize < 10000 ? 'healthy' : 'warning',
                lastUpdated: statistics.timestamp
            },
            breakdown: {
                eventsByCategory: statistics.eventsByCategory,
                eventsByLevel: statistics.eventsByLevel,
                performanceMetrics: {
                    requestCount: statistics.performanceMetrics.requestCount,
                    errorCount: statistics.performanceMetrics.errorCount,
                    averageResponseTime: statistics.performanceMetrics.averageResponseTime,
                    errorRate: statistics.performanceMetrics.requestCount > 0 ?
                        (statistics.performanceMetrics.errorCount / statistics.performanceMetrics.requestCount * 100).toFixed(2) : 0
                }
            },
            systemHealth: statistics.systemHealth
        },
        metadata: {
            requestId: `stats_${Date.now()}`,
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        }
    });
}

/**
 * Get audit events with filtering
 */
async function getAuditEvents(req, res, auditService, query) {
    const filters = {
        startTime: query.startTime,
        endTime: query.endTime,
        category: query.category,
        action: query.action,
        level: query.level,
        sessionId: query.sessionId
    };

    const limit = parseInt(query.limit) || 100;
    const offset = parseInt(query.offset) || 0;

    const events = await auditService.getAuditEvents(filters);
    const paginatedEvents = events.slice(offset, offset + limit);

    res.status(200).json({
        success: true,
        data: {
            events: paginatedEvents.map(event => ({
                id: event.id,
                timestamp: event.timestamp,
                category: event.category,
                action: event.action,
                level: event.level,
                details: event.details,
                context: {
                    // Only include non-sensitive context data
                    sessionId: event.context.sessionId,
                    requestId: event.context.requestId
                }
            })),
            pagination: {
                total: events.length,
                limit,
                offset,
                hasMore: offset + limit < events.length
            },
            filters: filters
        },
        metadata: {
            requestId: `events_${Date.now()}`,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Get compliance report
 */
async function getComplianceReport(req, res, auditService, query) {
    const reportType = query.type || 'CFM_COMPLIANCE';
    const filters = {
        startTime: query.startTime || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
        endTime: query.endTime || new Date().toISOString()
    };

    const report = await auditService.generateComplianceReport(reportType, filters);

    res.status(200).json({
        success: true,
        data: report,
        metadata: {
            requestId: `report_${Date.now()}`,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Get security dashboard data
 */
async function getSecurityDashboard(req, res, auditService, query) {
    const timeRange = query.timeRange || '24h';
    const startTime = getStartTimeFromRange(timeRange);

    const filters = {
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        category: 'security_event'
    };

    const securityEvents = await auditService.getAuditEvents(filters);

    const dashboard = {
        overview: {
            totalSecurityEvents: securityEvents.length,
            criticalEvents: securityEvents.filter(e => e.level === 'CRITICAL').length,
            highSeverityEvents: securityEvents.filter(e => e.details.severity === 'HIGH').length,
            threatsBlocked: securityEvents.filter(e => e.details.blocked === true).length,
            timeRange
        },
        trends: {
            hourlyDistribution: getHourlyDistribution(securityEvents),
            threatTypes: getThreatTypeDistribution(securityEvents),
            severityTrends: getSeverityTrends(securityEvents)
        },
        topThreats: getTopThreats(securityEvents),
        recentEvents: securityEvents.slice(-10).reverse() // Last 10 events
    };

    res.status(200).json({
        success: true,
        data: dashboard,
        metadata: {
            requestId: `security_${Date.now()}`,
            timestamp: new Date().toISOString(),
            timeRange
        }
    });
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics(req, res, auditService, query) {
    const statistics = auditService.getAuditStatistics();
    const timeRange = query.timeRange || '1h';

    const performanceData = {
        current: {
            requestsPerSecond: calculateRequestsPerSecond(statistics.performanceMetrics),
            averageResponseTime: statistics.performanceMetrics.averageResponseTime,
            errorRate: statistics.performanceMetrics.requestCount > 0 ?
                (statistics.performanceMetrics.errorCount / statistics.performanceMetrics.requestCount * 100) : 0,
            memoryUsage: statistics.systemHealth.memoryUsage,
            uptime: statistics.systemHealth.uptime
        },
        trends: {
            hourlyMetrics: statistics.performanceMetrics.lastHourMetrics || [],
            dailyMetrics: statistics.performanceMetrics.dailyMetrics || []
        },
        alerts: {
            highMemoryUsage: statistics.systemHealth.memoryUsage.heapUsed > 500 * 1024 * 1024,
            highErrorRate: statistics.performanceMetrics.requestCount > 0 &&
                (statistics.performanceMetrics.errorCount / statistics.performanceMetrics.requestCount) > 0.05,
            lowPerformance: statistics.performanceMetrics.averageResponseTime > 5000
        }
    };

    res.status(200).json({
        success: true,
        data: performanceData,
        metadata: {
            requestId: `performance_${Date.now()}`,
            timestamp: new Date().toISOString(),
            timeRange
        }
    });
}

/**
 * Get active alerts
 */
async function getActiveAlerts(req, res, auditService) {
    const alerts = Array.from(auditService.alertStore.values())
        .filter(alert => alert.status === 'active')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
        success: true,
        data: {
            alerts: alerts.map(alert => ({
                id: alert.id,
                type: alert.type,
                severity: alert.severity,
                message: alert.message,
                timestamp: alert.timestamp,
                acknowledged: alert.acknowledged,
                details: alert.details
            })),
            summary: {
                total: alerts.length,
                critical: alerts.filter(a => a.severity === 'CRITICAL').length,
                high: alerts.filter(a => a.severity === 'HIGH').length,
                medium: alerts.filter(a => a.severity === 'MEDIUM').length,
                unacknowledged: alerts.filter(a => !a.acknowledged).length
            }
        },
        metadata: {
            requestId: `alerts_${Date.now()}`,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Generate compliance report (POST)
 */
async function generateComplianceReport(req, res, auditService) {
    const { reportType, filters, format } = req.body;

    if (!reportType) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'missing_report_type',
                message: 'Report type is required'
            }
        });
    }

    const report = await auditService.generateComplianceReport(reportType, filters || {});

    // If format is specified, could generate different formats (PDF, CSV, etc.)
    if (format === 'csv') {
        // Convert to CSV format
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}_${Date.now()}.csv"`);
        return res.status(200).send(convertReportToCSV(report));
    }

    res.status(200).json({
        success: true,
        data: report,
        metadata: {
            requestId: `generate_report_${Date.now()}`,
            timestamp: new Date().toISOString(),
            format: format || 'json'
        }
    });
}

/**
 * Acknowledge alert (POST)
 */
async function acknowledgeAlert(req, res, auditService) {
    const { alertId, acknowledgedBy, notes } = req.body;

    if (!alertId) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'missing_alert_id',
                message: 'Alert ID is required'
            }
        });
    }

    const alert = auditService.alertStore.get(alertId);
    if (!alert) {
        return res.status(404).json({
            success: false,
            error: {
                code: 'alert_not_found',
                message: 'Alert not found'
            }
        });
    }

    // Update alert
    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date().toISOString();
    alert.notes = notes;

    auditService.alertStore.set(alertId, alert);

    // Log acknowledgment
    await auditService.logAuditEvent(
        'system_event',
        'alert_acknowledged',
        {
            alertId,
            alertType: alert.type,
            acknowledgedBy,
            notes
        }
    );

    res.status(200).json({
        success: true,
        data: {
            alertId,
            acknowledged: true,
            acknowledgedBy,
            acknowledgedAt: alert.acknowledgedAt
        },
        metadata: {
            requestId: `ack_alert_${Date.now()}`,
            timestamp: new Date().toISOString()
        }
    });
}

/**
 * Export audit logs (POST)
 */
async function exportAuditLogs(req, res, auditService) {
    const { filters, format } = req.body;

    const events = await auditService.getAuditEvents(filters || {});

    // Log export request
    await auditService.logDataAccessEvent({
        dataType: 'audit_logs',
        operation: 'export',
        recordCount: events.length,
        purpose: 'compliance_audit',
        legalBasis: 'legitimate_interest'
    }, {
        clientIP: getClientIP(req),
        userAgent: req.headers['user-agent']
    });

    if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.csv"`);
        return res.status(200).send(convertEventsToCSV(events));
    }

    res.status(200).json({
        success: true,
        data: {
            events: events,
            exportInfo: {
                totalEvents: events.length,
                exportedAt: new Date().toISOString(),
                format: format || 'json',
                filters: filters || {}
            }
        },
        metadata: {
            requestId: `export_${Date.now()}`,
            timestamp: new Date().toISOString()
        }
    });
}

// Utility functions

function getStartTimeFromRange(timeRange) {
    const now = new Date();
    switch (timeRange) {
        case '1h':
            return new Date(now.getTime() - 60 * 60 * 1000);
        case '6h':
            return new Date(now.getTime() - 6 * 60 * 60 * 1000);
        case '24h':
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case '7d':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d':
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        default:
            return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
}

function getHourlyDistribution(events) {
    const distribution = {};
    for (let i = 0; i < 24; i++) {
        distribution[i] = 0;
    }

    events.forEach(event => {
        const hour = new Date(event.timestamp).getHours();
        distribution[hour]++;
    });

    return distribution;
}

function getThreatTypeDistribution(events) {
    return events.reduce((acc, event) => {
        const threatType = event.details.violationType || 'unknown';
        acc[threatType] = (acc[threatType] || 0) + 1;
        return acc;
    }, {});
}

function getSeverityTrends(events) {
    return events.reduce((acc, event) => {
        const severity = event.details.severity || 'unknown';
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
    }, {});
}

function getTopThreats(events) {
    const threatCounts = getThreatTypeDistribution(events);
    return Object.entries(threatCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([type, count]) => ({ type, count }));
}

function calculateRequestsPerSecond(metrics) {
    // Simplified calculation
    return metrics.requestCount > 0 ? (metrics.requestCount / 60).toFixed(2) : 0;
}

function convertReportToCSV(report) {
    // Simplified CSV conversion
    let csv = 'Report Type,Generated At,Summary\n';
    csv += `${report.type},${report.timestamp},"${JSON.stringify(report.summary).replace(/"/g, '""')}"\n`;
    return csv;
}

function convertEventsToCSV(events) {
    if (events.length === 0) return 'No events to export';

    const headers = ['ID', 'Timestamp', 'Category', 'Action', 'Level', 'Details'];
    let csv = headers.join(',') + '\n';

    events.forEach(event => {
        const row = [
            event.id,
            event.timestamp,
            event.category,
            event.action,
            event.level,
            `"${JSON.stringify(event.details).replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
    });

    return csv;
}

/**
 * Get comprehensive monitoring dashboard data
 */
async function getMonitoringDashboard(req, res, auditService, query) {
    const timeRange = query.timeRange || '24h';

    try {
        const dashboardData = auditService.getMonitoringDashboard(timeRange);

        res.status(200).json({
            success: true,
            data: dashboardData,
            metadata: {
                requestId: `dashboard_${Date.now()}`,
                timestamp: new Date().toISOString(),
                timeRange
            }
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'dashboard_error',
                message: 'Failed to retrieve dashboard data'
            }
        });
    }
}

/**
 * Check real-time alerts
 */
async function checkRealTimeAlerts(req, res, auditService) {
    try {
        const triggeredAlerts = await auditService.checkRealTimeAlerts();

        res.status(200).json({
            success: true,
            data: {
                alerts: triggeredAlerts,
                alertCount: triggeredAlerts.length,
                hasNewAlerts: triggeredAlerts.length > 0,
                timestamp: new Date().toISOString()
            },
            metadata: {
                requestId: `alerts_check_${Date.now()}`,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Real-time alerts error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'alerts_error',
                message: 'Failed to check real-time alerts'
            }
        });
    }
}

/**
 * Perform security analysis
 */
async function performSecurityAnalysis(req, res, auditService, query) {
    const { eventData, context } = req.body || {};

    if (!eventData || !context) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'missing_data',
                message: 'Event data and context are required for security analysis'
            }
        });
    }

    try {
        const securityAnalysis = await auditService.detectSecurityEvents(eventData, context);

        res.status(200).json({
            success: true,
            data: securityAnalysis,
            metadata: {
                requestId: `security_analysis_${Date.now()}`,
                timestamp: new Date().toISOString(),
                analysisType: 'automated_security_detection'
            }
        });
    } catch (error) {
        console.error('Security analysis error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'security_analysis_error',
                message: 'Failed to perform security analysis'
            }
        });
    }
}

/**
 * Perform compliance monitoring
 */
async function performComplianceMonitoring(req, res, auditService, query) {
    const { eventData, context } = req.body || {};

    if (!eventData || !context) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'missing_data',
                message: 'Event data and context are required for compliance monitoring'
            }
        });
    }

    try {
        const complianceAnalysis = await auditService.monitorCompliance(eventData, context);

        res.status(200).json({
            success: true,
            data: complianceAnalysis,
            metadata: {
                requestId: `compliance_monitoring_${Date.now()}`,
                timestamp: new Date().toISOString(),
                monitoringType: 'automated_compliance_check'
            }
        });
    } catch (error) {
        console.error('Compliance monitoring error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'compliance_monitoring_error',
                message: 'Failed to perform compliance monitoring'
            }
        });
    }
}

// Export the audit service instance for use by other modules
export { auditService };