/**
 * Tests for Audit Monitoring API
 * Comprehensive test suite for audit monitoring endpoints and dashboard functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import auditHandler from '../monitoring/audit.js';

// Mock dependencies
vi.mock('../contact/rateLimiter.js', () => ({
    getClientIP: vi.fn(() => '192.168.1.1')
}));

vi.mock('../../src/services/auditLoggingService.js', () => {
    const mockAuditService = {
        getAuditStatistics: vi.fn(),
        getAuditEvents: vi.fn(),
        generateComplianceReport: vi.fn(),
        getMonitoringDashboard: vi.fn(),
        checkRealTimeAlerts: vi.fn(),
        detectSecurityEvents: vi.fn(),
        monitorCompliance: vi.fn(),
        logDataAccessEvent: vi.fn(),
        alertStore: new Map()
    };

    return {
        default: class AuditLoggingService {
            constructor() {
                return mockAuditService;
            }
        }
    };
});

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/monitoring/audit', auditHandler);

describe('Audit Monitoring API', () => {
    let mockAuditService;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Get mock service instance
        const AuditLoggingService = require('../../src/services/auditLoggingService.js').default;
        mockAuditService = new AuditLoggingService();
    });

    describe('GET /api/monitoring/audit', () => {
        it('should require authentication', async () => {
            const response = await request(app)
                .get('/api/monitoring/audit')
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('unauthorized');
        });

        it('should handle OPTIONS requests for CORS', async () => {
            await request(app)
                .options('/api/monitoring/audit')
                .expect(200);
        });

        it('should return audit statistics', async () => {
            const mockStats = {
                totalEvents: 1000,
                eventsByCategory: { user_interaction: 500, security_event: 100 },
                eventsByLevel: { INFO: 800, ERROR: 200 },
                activeAlerts: 5,
                performanceMetrics: { requestCount: 1000, errorCount: 50 },
                systemHealth: { memoryUsage: {}, uptime: 3600, storeSize: 1000 },
                timestamp: new Date().toISOString()
            };

            mockAuditService.getAuditStatistics.mockReturnValue(mockStats);

            const response = await request(app)
                .get('/api/monitoring/audit?action=statistics')
                .set('Authorization', 'Bearer test_token')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.overview.totalEvents).toBe(1000);
            expect(response.body.data.breakdown.eventsByCategory).toEqual(mockStats.eventsByCategory);
        });

        it('should return filtered audit events', async () => {
            const mockEvents = [
                {
                    id: 'event1',
                    timestamp: new Date().toISOString(),
                    category: 'user_interaction',
                    action: 'message_sent',
                    level: 'INFO',
                    details: { messageLength: 50 },
                    context: { sessionId: 'session1', requestId: 'req1' }
                },
                {
                    id: 'event2',
                    timestamp: new Date().toISOString(),
                    category: 'security_event',
                    action: 'threat_detected',
                    level: 'ERROR',
                    details: { severity: 'HIGH' },
                    context: { sessionId: 'session2', requestId: 'req2' }
                }
            ];

            mockAuditService.getAuditEvents.mockResolvedValue(mockEvents);

            const response = await request(app)
                .get('/api/monitoring/audit?action=events&category=security_event&limit=10')
                .set('Authorization', 'Bearer test_token')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.events).toHaveLength(2);
            expect(response.body.data.pagination).toBeDefined();
            expect(mockAuditService.getAuditEvents).toHaveBeenCalledWith({
                startTime: undefined,
                endTime: undefined,
                category: 'security_event',
                action: undefined,
                level: undefined,
                sessionId: undefined
            });
        });

        it('should generate compliance reports', async () => {
            const mockReport = {
                id: 'report123',
                type: 'CFM_COMPLIANCE',
                timestamp: new Date().toISOString(),
                summary: {
                    totalMedicalInteractions: 100,
                    emergencyDetections: 5,
                    complianceRate: 95.5
                },
                details: {
                    emergencyEvents: [],
                    blockedAdvice: [],
                    disclaimerUsage: {}
                },
                recommendations: []
            };

            mockAuditService.generateComplianceReport.mockResolvedValue(mockReport);

            const response = await request(app)
                .get('/api/monitoring/audit?action=compliance-report&type=CFM_COMPLIANCE')
                .set('Authorization', 'Bearer test_token')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.type).toBe('CFM_COMPLIANCE');
            expect(response.body.data.summary.complianceRate).toBe(95.5);
        });

        it('should return monitoring dashboard data', async () => {
            const mockDashboard = {
                overview: {
                    timeRange: '24h',
                    totalEvents: 1000,
                    securityEvents: 50,
                    complianceEvents: 25,
                    performanceEvents: 100,
                    activeAlerts: 3,
                    systemStatus: 'HEALTHY'
                },
                security: {
                    threatLevel: 'LOW',
                    blockedThreats: 10,
                    averageThreatScore: 25,
                    topThreats: [
                        { type: 'XSS_ATTEMPT', count: 5 },
                        { type: 'SQL_INJECTION', count: 3 }
                    ]
                },
                compliance: {
                    cfmCompliance: {
                        totalChecks: 100,
                        violations: 2,
                        complianceRate: 98
                    },
                    lgpdCompliance: {
                        totalDataAccess: 500,
                        consentBasedAccess: 480,
                        complianceRate: 96
                    }
                },
                performance: {
                    averageResponseTime: 250,
                    errorRate: 2.5,
                    throughput: 10.5,
                    resourceUsage: {
                        memory: { usagePercent: 65 }
                    }
                },
                alerts: {
                    critical: [],
                    high: [],
                    medium: [],
                    recentAlerts: []
                }
            };

            mockAuditService.getMonitoringDashboard.mockReturnValue(mockDashboard);

            const response = await request(app)
                .get('/api/monitoring/audit?action=dashboard&timeRange=24h')
                .set('Authorization', 'Bearer test_token')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.overview.systemStatus).toBe('HEALTHY');
            expect(response.body.data.security.threatLevel).toBe('LOW');
            expect(response.body.data.compliance.cfmCompliance.complianceRate).toBe(98);
            expect(response.body.metadata.timeRange).toBe('24h');
        });

        it('should check real-time alerts', async () => {
            const mockAlerts = [
                {
                    type: 'HIGH_ERROR_RATE',
                    severity: 'HIGH',
                    message: 'Error rate is 8.5% (threshold: 5%)',
                    data: { errorRate: 8.5, threshold: 5 },
                    timestamp: new Date().toISOString()
                },
                {
                    type: 'PERFORMANCE_DEGRADATION',
                    severity: 'MEDIUM',
                    message: 'Average response time is 4500ms (threshold: 3000ms)',
                    data: { responseTime: 4500, threshold: 3000 },
                    timestamp: new Date().toISOString()
                }
            ];

            mockAuditService.checkRealTimeAlerts.mockResolvedValue(mockAlerts);

            const response = await request(app)
                .get('/api/monitoring/audit?action=real-time-alerts')
                .set('Authorization', 'Bearer test_token')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.alerts).toHaveLength(2);
            expect(response.body.data.hasNewAlerts).toBe(true);
            expect(response.body.data.alertCount).toBe(2);
        });

        it('should return active alerts', async () => {
            const mockAlerts = [
                {
                    id: 'alert1',
                    type: 'CRITICAL_EVENT',
                    severity: 'CRITICAL',
                    message: 'Critical security event detected',
                    timestamp: new Date().toISOString(),
                    acknowledged: false
                },
                {
                    id: 'alert2',
                    type: 'HIGH_ERROR_RATE',
                    severity: 'HIGH',
                    message: 'Error rate exceeds threshold',
                    timestamp: new Date().toISOString(),
                    acknowledged: true
                }
            ];

            mockAuditService.alertStore.set('alert1', { ...mockAlerts[0], status: 'active' });
            mockAuditService.alertStore.set('alert2', { ...mockAlerts[1], status: 'active' });

            const response = await request(app)
                .get('/api/monitoring/audit?action=alerts')
                .set('Authorization', 'Bearer test_token')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.alerts).toHaveLength(2);
            expect(response.body.data.summary.total).toBe(2);
            expect(response.body.data.summary.critical).toBe(1);
            expect(response.body.data.summary.high).toBe(1);
            expect(response.body.data.summary.unacknowledged).toBe(1);
        });

        it('should handle invalid actions', async () => {
            const response = await request(app)
                .get('/api/monitoring/audit?action=invalid_action')
                .set('Authorization', 'Bearer test_token')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('invalid_action');
            expect(response.body.error.availableActions).toBeDefined();
        });
    });

    describe('POST /api/monitoring/audit', () => {
        it('should generate compliance reports', async () => {
            const mockReport = {
                id: 'report456',
                type: 'LGPD_COMPLIANCE',
                timestamp: new Date().toISOString(),
                summary: {
                    totalDataAccess: 500,
                    consentBasedAccess: 480,
                    complianceRate: 96
                },
                details: {},
                recommendations: []
            };

            mockAuditService.generateComplianceReport.mockResolvedValue(mockReport);

            const response = await request(app)
                .post('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .send({
                    action: 'generate-report',
                    reportType: 'LGPD_COMPLIANCE',
                    filters: {
                        startTime: '2024-01-01T00:00:00Z',
                        endTime: '2024-01-31T23:59:59Z'
                    }
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.type).toBe('LGPD_COMPLIANCE');
            expect(mockAuditService.generateComplianceReport).toHaveBeenCalledWith(
                'LGPD_COMPLIANCE',
                {
                    startTime: '2024-01-01T00:00:00Z',
                    endTime: '2024-01-31T23:59:59Z'
                }
            );
        });

        it('should acknowledge alerts', async () => {
            const alertId = 'alert123';
            mockAuditService.alertStore.set(alertId, {
                id: alertId,
                type: 'HIGH_ERROR_RATE',
                severity: 'HIGH',
                message: 'Error rate exceeds threshold',
                status: 'active',
                acknowledged: false
            });

            const response = await request(app)
                .post('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .send({
                    action: 'acknowledge-alert',
                    alertId: alertId,
                    acknowledgedBy: 'admin@example.com',
                    notes: 'Investigating the issue'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.acknowledged).toBe(true);
            expect(response.body.data.acknowledgedBy).toBe('admin@example.com');

            // Check that alert was updated
            const updatedAlert = mockAuditService.alertStore.get(alertId);
            expect(updatedAlert.acknowledged).toBe(true);
            expect(updatedAlert.acknowledgedBy).toBe('admin@example.com');
            expect(updatedAlert.notes).toBe('Investigating the issue');
        });

        it('should export audit logs', async () => {
            const mockEvents = [
                {
                    id: 'event1',
                    timestamp: new Date().toISOString(),
                    category: 'user_interaction',
                    action: 'message_sent',
                    level: 'INFO',
                    details: { messageLength: 50 }
                }
            ];

            mockAuditService.getAuditEvents.mockResolvedValue(mockEvents);

            const response = await request(app)
                .post('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .send({
                    action: 'export-logs',
                    filters: {
                        category: 'user_interaction',
                        startTime: '2024-01-01T00:00:00Z'
                    },
                    format: 'json'
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.events).toHaveLength(1);
            expect(response.body.data.exportInfo.totalEvents).toBe(1);
            expect(response.body.data.exportInfo.format).toBe('json');
            expect(mockAuditService.logDataAccessEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    dataType: 'audit_logs',
                    operation: 'export',
                    recordCount: 1
                }),
                expect.any(Object)
            );
        });

        it('should perform security analysis', async () => {
            const mockAnalysis = {
                threatDetected: true,
                threatLevel: 'HIGH',
                violations: ['XSS_ATTEMPT'],
                recommendations: ['ENHANCE_INPUT_VALIDATION', 'BLOCK_REQUEST'],
                securityScore: 60
            };

            mockAuditService.detectSecurityEvents.mockResolvedValue(mockAnalysis);

            const response = await request(app)
                .post('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .send({
                    action: 'security-analysis',
                    eventData: {
                        message: '<script>alert("xss")</script>'
                    },
                    context: {
                        sessionId: 'session123',
                        clientIP: '192.168.1.1',
                        userAgent: 'Mozilla/5.0'
                    }
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.threatDetected).toBe(true);
            expect(response.body.data.threatLevel).toBe('HIGH');
            expect(response.body.data.violations).toContain('XSS_ATTEMPT');
            expect(response.body.metadata.analysisType).toBe('automated_security_detection');
        });

        it('should perform compliance monitoring', async () => {
            const mockCompliance = {
                cfmCompliant: false,
                lgpdCompliant: true,
                violations: ['POTENTIAL_MEDICAL_ADVICE'],
                warnings: ['EMERGENCY_KEYWORDS_DETECTED'],
                requiredActions: ['SHOW_MEDICAL_DISCLAIMER', 'SHOW_EMERGENCY_CONTACT_INFO'],
                complianceScore: 75
            };

            mockAuditService.monitorCompliance.mockResolvedValue(mockCompliance);

            const response = await request(app)
                .post('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .send({
                    action: 'compliance-monitoring',
                    eventData: {
                        message: 'Socorro! Que remédio posso tomar para dor?'
                    },
                    context: {
                        sessionId: 'session456',
                        consentId: 'consent123'
                    }
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.cfmCompliant).toBe(false);
            expect(response.body.data.lgpdCompliant).toBe(true);
            expect(response.body.data.violations).toContain('POTENTIAL_MEDICAL_ADVICE');
            expect(response.body.data.requiredActions).toContain('SHOW_MEDICAL_DISCLAIMER');
            expect(response.body.metadata.monitoringType).toBe('automated_compliance_check');
        });

        it('should handle missing data for security analysis', async () => {
            const response = await request(app)
                .post('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .send({
                    action: 'security-analysis'
                    // Missing eventData and context
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('missing_data');
        });

        it('should handle missing data for compliance monitoring', async () => {
            const response = await request(app)
                .post('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .send({
                    action: 'compliance-monitoring',
                    eventData: {
                        message: 'Test message'
                    }
                    // Missing context
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('missing_data');
        });

        it('should handle missing report type for report generation', async () => {
            const response = await request(app)
                .post('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .send({
                    action: 'generate-report'
                    // Missing reportType
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('missing_report_type');
        });

        it('should handle missing alert ID for alert acknowledgment', async () => {
            const response = await request(app)
                .post('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .send({
                    action: 'acknowledge-alert'
                    // Missing alertId
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('missing_alert_id');
        });

        it('should handle non-existent alert for acknowledgment', async () => {
            const response = await request(app)
                .post('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .send({
                    action: 'acknowledge-alert',
                    alertId: 'non-existent-alert'
                })
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('alert_not_found');
        });

        it('should handle invalid POST actions', async () => {
            const response = await request(app)
                .post('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .send({
                    action: 'invalid-action'
                })
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('invalid_action');
            expect(response.body.error.availableActions).toBeDefined();
        });
    });

    describe('Error handling', () => {
        it('should handle service errors gracefully', async () => {
            mockAuditService.getAuditStatistics.mockImplementation(() => {
                throw new Error('Service unavailable');
            });

            const response = await request(app)
                .get('/api/monitoring/audit?action=statistics')
                .set('Authorization', 'Bearer test_token')
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('internal_server_error');
        });

        it('should handle async service errors', async () => {
            mockAuditService.generateComplianceReport.mockRejectedValue(
                new Error('Database connection failed')
            );

            const response = await request(app)
                .get('/api/monitoring/audit?action=compliance-report&type=CFM_COMPLIANCE')
                .set('Authorization', 'Bearer test_token')
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('internal_server_error');
        });

        it('should handle method not allowed', async () => {
            const response = await request(app)
                .put('/api/monitoring/audit')
                .set('Authorization', 'Bearer test_token')
                .expect(405);

            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('method_not_allowed');
        });
    });

    describe('CORS handling', () => {
        it('should set appropriate CORS headers', async () => {
            const response = await request(app)
                .get('/api/monitoring/audit?action=statistics')
                .set('Authorization', 'Bearer test_token')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBeDefined();
            expect(response.headers['access-control-allow-methods']).toBeDefined();
            expect(response.headers['access-control-allow-headers']).toBeDefined();
        });

        it('should handle preflight OPTIONS requests', async () => {
            const response = await request(app)
                .options('/api/monitoring/audit')
                .expect(200);

            expect(response.headers['access-control-allow-origin']).toBeDefined();
            expect(response.headers['access-control-allow-methods']).toBeDefined();
            expect(response.headers['access-control-allow-headers']).toBeDefined();
        });
    });

    describe('Data access logging', () => {
        it('should log data access for audit requests', async () => {
            mockAuditService.getAuditStatistics.mockReturnValue({
                totalEvents: 100,
                eventsByCategory: {},
                eventsByLevel: {},
                activeAlerts: 0,
                performanceMetrics: {},
                systemHealth: {},
                timestamp: new Date().toISOString()
            });

            await request(app)
                .get('/api/monitoring/audit?action=statistics')
                .set('Authorization', 'Bearer test_token')
                .expect(200);

            expect(mockAuditService.logDataAccessEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    dataType: 'audit_logs',
                    operation: 'read',
                    purpose: 'monitoring',
                    legalBasis: 'legitimate_interest'
                }),
                expect.objectContaining({
                    clientIP: '192.168.1.1',
                    userAgent: expect.any(String),
                    requestId: expect.any(String),
                    endpoint: expect.any(String)
                })
            );
        });
    });
});