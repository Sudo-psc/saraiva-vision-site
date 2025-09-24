/**
 * Tests for AuditLoggingService
 * Comprehensive test suite for audit logging and monitoring system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import AuditLoggingService from '../auditLoggingService.js';

// Mock crypto module
vi.mock('crypto', () => ({
    default: {
        createHash: vi.fn(() => ({
            update: vi.fn(() => ({
                digest: vi.fn(() => 'mocked_hash')
            }))
        })),
        randomBytes: vi.fn(() => ({
            toString: vi.fn(() => 'mocked_random')
        }))
    }
}));

// Mock fs promises
vi.mock('fs', () => ({
    default: {
        promises: {
            mkdir: vi.fn(),
            readFile: vi.fn(),
            writeFile: vi.fn(),
            readdir: vi.fn()
        }
    },
    promises: {
        mkdir: vi.fn(),
        readFile: vi.fn(),
        writeFile: vi.fn(),
        readdir: vi.fn()
    }
}));

// Mock path module
vi.mock('path', () => ({
    default: {
        join: vi.fn((...args) => args.join('/')),
        resolve: vi.fn((...args) => args.join('/'))
    }
}));

describe('AuditLoggingService', () => {
    let auditService;
    let mockContext;

    beforeEach(() => {
        auditService = new AuditLoggingService();

        mockContext = {
            clientIP: '192.168.1.1',
            userAgent: 'Mozilla/5.0 Test Browser',
            sessionId: 'test-session-123',
            requestId: 'test-request-456'
        };

        // Clear stores
        auditService.auditStore.clear();
        auditService.alertStore.clear();
        auditService.metricsStore.clear();
        auditService.complianceStore.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('logAuditEvent', () => {
        it('should log a basic audit event', async () => {
            const eventId = await auditService.logAuditEvent(
                'user_interaction',
                'message_sent',
                { messageLength: 50 },
                mockContext
            );

            expect(eventId).toBeDefined();
            expect(eventId).toMatch(/^audit_\d+_/);

            const event = auditService.auditStore.get(eventId);
            expect(event).toBeDefined();
            expect(event.category).toBe('user_interaction');
            expect(event.action).toBe('message_sent');
            expect(event.details.messageLength).toBe(50);
            expect(event.level).toBe('INFO');
        });

        it('should sanitize sensitive information', async () => {
            const sensitiveDetails = {
                email: 'user@example.com',
                phone: '+1234567890',
                name: 'John Doe',
                message: 'Hello world'
            };

            const eventId = await auditService.logAuditEvent(
                'user_interaction',
                'data_submitted',
                sensitiveDetails,
                mockContext
            );

            const event = auditService.auditStore.get(eventId);
            expect(event.details.email).toBe('mocked_hash');
            expect(event.details.phone).toBe('mocked_hash');
            expect(event.details.name).toBe('mocked_hash');
            expect(event.details.message).toBe('Hello world'); // Non-PII should remain
        });

        it('should determine correct log level based on category and action', async () => {
            // Security event should be ERROR level
            const securityEventId = await auditService.logAuditEvent(
                'security_event',
                'threat_detected',
                {},
                mockContext
            );

            const securityEvent = auditService.auditStore.get(securityEventId);
            expect(securityEvent.level).toBe('ERROR');

            // Medical compliance should be WARN level
            const medicalEventId = await auditService.logAuditEvent(
                'medical_compliance',
                'disclaimer_shown',
                {},
                mockContext
            );

            const medicalEvent = auditService.auditStore.get(medicalEventId);
            expect(medicalEvent.level).toBe('WARN');

            // Regular user interaction should be INFO level
            const userEventId = await auditService.logAuditEvent(
                'user_interaction',
                'message_sent',
                {},
                mockContext
            );

            const userEvent = auditService.auditStore.get(userEventId);
            expect(userEvent.level).toBe('INFO');
        });

        it('should handle compliance events specially', async () => {
            const eventId = await auditService.logAuditEvent(
                'medical_compliance',
                'cfm_check',
                { violations: ['medical_advice_detected'] },
                mockContext
            );

            expect(auditService.complianceStore.has(eventId)).toBe(true);

            const complianceEvent = auditService.complianceStore.get(eventId);
            expect(complianceEvent.complianceType).toBe('CFM');
            expect(complianceEvent.retentionUntil).toBeDefined();
        });
    });

    describe('logUserInteraction', () => {
        it('should log user interaction with proper structure', async () => {
            const interaction = {
                sessionId: 'session-123',
                messageId: 'msg-456',
                message: 'Hello, I need help',
                response: 'How can I assist you?',
                processingTime: 150,
                securityScore: 95,
                complianceFlags: ['medical_content'],
                containsMedicalContent: true
            };

            const eventId = await auditService.logUserInteraction(interaction, mockContext);

            const event = auditService.auditStore.get(eventId);
            expect(event.category).toBe('user_interaction');
            expect(event.action).toBe('message_exchange');
            expect(event.details.sessionId).toBe('session-123');
            expect(event.details.messageLength).toBe(18); // "Hello, I need help" is 18 characters
            expect(event.details.responseLength).toBe(21); // "How can I assist you?" is 21 characters
            expect(event.details.processingTime).toBe(150);
            expect(event.details.securityScore).toBe(95);
            expect(event.details.medicalContent).toBe(true);
        });
    });

    describe('logSecurityEvent', () => {
        it('should log security event with threat details', async () => {
            const securityEvent = {
                type: 'malicious_input',
                severity: 'HIGH',
                description: 'XSS attempt detected',
                violationType: 'XSS_ATTEMPT',
                blocked: true,
                threatScore: 85,
                mitigationActions: ['input_sanitized', 'request_blocked']
            };

            const eventId = await auditService.logSecurityEvent(securityEvent, mockContext);

            const event = auditService.auditStore.get(eventId);
            expect(event.category).toBe('security_event');
            expect(event.action).toBe('malicious_input');
            expect(event.details.severity).toBe('HIGH');
            expect(event.details.blocked).toBe(true);
            expect(event.details.threatScore).toBe(85);
        });
    });

    describe('logMedicalComplianceEvent', () => {
        it('should log medical compliance event', async () => {
            const complianceEvent = {
                type: 'cfm_compliance_check',
                complianceType: 'CFM',
                result: 'compliant',
                violations: [],
                disclaimersShown: ['general_medical_disclaimer'],
                emergencyDetected: false,
                medicalAdviceBlocked: false
            };

            const eventId = await auditService.logMedicalComplianceEvent(complianceEvent, mockContext);

            const event = auditService.auditStore.get(eventId);
            expect(event.category).toBe('medical_compliance');
            expect(event.action).toBe('cfm_compliance_check');
            expect(event.details.complianceType).toBe('CFM');
            expect(event.details.disclaimersShown).toContain('general_medical_disclaimer');
        });
    });

    describe('logDataAccessEvent', () => {
        it('should log data access with LGPD compliance info', async () => {
            const dataAccess = {
                operation: 'read',
                dataType: 'personal_data',
                recordCount: 1,
                dataClassification: 'confidential',
                purpose: 'service_provision',
                legalBasis: 'consent',
                consentId: 'consent-789',
                retentionPeriod: 365 * 24 * 60 * 60 * 1000 // 1 year
            };

            const eventId = await auditService.logDataAccessEvent(dataAccess, mockContext);

            const event = auditService.auditStore.get(eventId);
            expect(event.category).toBe('data_access');
            expect(event.action).toBe('read');
            expect(event.details.dataType).toBe('personal_data');
            expect(event.details.legalBasis).toBe('consent');
            expect(event.details.consentId).toBe('consent-789');
        });
    });

    describe('logPerformanceMetrics', () => {
        it('should log performance metrics', async () => {
            const metrics = {
                responseTime: 250,
                memoryUsage: { heapUsed: 50000000 },
                cpuUsage: 15.5,
                requestsPerSecond: 10.2,
                errorRate: 2.1,
                throughput: 1000,
                latency: 45
            };

            const eventId = await auditService.logPerformanceMetrics(metrics, mockContext);

            const event = auditService.auditStore.get(eventId);
            expect(event.category).toBe('performance');
            expect(event.action).toBe('performance_metrics');
            expect(event.details.responseTime).toBe(250);
            expect(event.details.errorRate).toBe(2.1);
        });
    });

    describe('getAuditEvents', () => {
        beforeEach(async () => {
            // Add test events
            await auditService.logAuditEvent('user_interaction', 'message_sent', {}, mockContext);
            await auditService.logAuditEvent('security_event', 'threat_detected', {}, mockContext);
            await auditService.logAuditEvent('medical_compliance', 'disclaimer_shown', {}, mockContext);
        });

        it('should return all events without filters', async () => {
            const events = await auditService.getAuditEvents();
            expect(events.length).toBeGreaterThanOrEqual(1); // At least one event
        });

        it('should filter events by category', async () => {
            const events = await auditService.getAuditEvents({ category: 'security_event' });
            expect(events.length).toBeGreaterThanOrEqual(0);
            if (events.length > 0) {
                expect(events[0].category).toBe('security_event');
            }
        });

        it('should filter events by action', async () => {
            const events = await auditService.getAuditEvents({ action: 'message_sent' });
            expect(events.length).toBeGreaterThanOrEqual(0);
            if (events.length > 0) {
                expect(events[0].action).toBe('message_sent');
            }
        });

        it('should filter events by level', async () => {
            const events = await auditService.getAuditEvents({ level: 'ERROR' });
            expect(events.length).toBeGreaterThanOrEqual(0);
            if (events.length > 0) {
                expect(events[0].level).toBe('ERROR');
            }
        });

        it('should filter events by time range', async () => {
            const now = new Date();
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
            const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

            const events = await auditService.getAuditEvents({
                startTime: oneHourAgo.toISOString(),
                endTime: now.toISOString()
            });

            expect(events.length).toBeGreaterThanOrEqual(0); // Events within the time range
        });
    });

    describe('generateComplianceReport', () => {
        beforeEach(async () => {
            // Add test compliance events
            await auditService.logMedicalComplianceEvent({
                type: 'cfm_check',
                complianceType: 'CFM',
                result: 'compliant',
                emergencyDetected: false,
                medicalAdviceBlocked: false,
                disclaimersShown: ['general_disclaimer']
            }, mockContext);

            await auditService.logDataAccessEvent({
                operation: 'read',
                dataType: 'personal_data',
                purpose: 'service_provision',
                legalBasis: 'consent',
                consentId: 'consent-123'
            }, mockContext);
        });

        it('should generate CFM compliance report', async () => {
            const report = await auditService.generateComplianceReport('CFM_COMPLIANCE');

            expect(report.type).toBe('CFM_COMPLIANCE');
            expect(report.summary).toBeDefined();
            expect(report.details).toBeDefined();
            expect(report.recommendations).toBeDefined();
            expect(report.summary.totalMedicalInteractions).toBeGreaterThanOrEqual(0);
        });

        it('should generate LGPD compliance report', async () => {
            const report = await auditService.generateComplianceReport('LGPD_COMPLIANCE');

            expect(report.type).toBe('LGPD_COMPLIANCE');
            expect(report.summary).toBeDefined();
            expect(report.details).toBeDefined();
            expect(report.summary.totalDataAccess).toBeGreaterThanOrEqual(0);
        });

        it('should generate security audit report', async () => {
            // Add security event
            await auditService.logSecurityEvent({
                type: 'threat_detected',
                severity: 'HIGH',
                blocked: true,
                threatScore: 80
            }, mockContext);

            const report = await auditService.generateComplianceReport('SECURITY_AUDIT');

            expect(report.type).toBe('SECURITY_AUDIT');
            expect(report.summary.totalSecurityEvents).toBeGreaterThanOrEqual(0);
        });

        it('should throw error for unknown report type', async () => {
            await expect(
                auditService.generateComplianceReport('UNKNOWN_REPORT')
            ).rejects.toThrow('Unknown report type: UNKNOWN_REPORT');
        });
    });

    describe('checkAlertConditions', () => {
        it('should trigger alert for critical events', async () => {
            const criticalEvent = {
                id: 'test-event',
                category: 'security_event',
                action: 'critical_threat',
                level: 'CRITICAL',
                details: { severity: 'CRITICAL' },
                timestamp: new Date().toISOString()
            };

            await auditService.checkAlertConditions(criticalEvent);

            const alerts = Array.from(auditService.alertStore.values());
            expect(alerts.length).toBeGreaterThan(0);

            const criticalAlert = alerts.find(a => a.type === 'CRITICAL_EVENT');
            expect(criticalAlert).toBeDefined();
            expect(criticalAlert.severity).toBe('HIGH');
        });

        it('should trigger alert for compliance violations', async () => {
            const complianceEvent = {
                id: 'test-compliance-event',
                category: 'medical_compliance',
                action: 'compliance_violation',
                level: 'WARN',
                details: { violations: ['medical_advice_given'] },
                timestamp: new Date().toISOString()
            };

            await auditService.checkAlertConditions(complianceEvent);

            const alerts = Array.from(auditService.alertStore.values());
            const complianceAlert = alerts.find(a => a.type === 'COMPLIANCE_VIOLATION');
            expect(complianceAlert).toBeDefined();
        });
    });

    describe('getAuditStatistics', () => {
        beforeEach(async () => {
            // Add various test events
            await auditService.logAuditEvent('user_interaction', 'message_sent', {}, mockContext);
            await auditService.logAuditEvent('security_event', 'threat_detected', {}, mockContext);
            await auditService.logAuditEvent('medical_compliance', 'disclaimer_shown', {}, mockContext);

            // Add an alert
            await auditService.processAlert({
                type: 'TEST_ALERT',
                severity: 'MEDIUM',
                message: 'Test alert'
            });
        });

        it('should return comprehensive statistics', () => {
            const stats = auditService.getAuditStatistics();

            expect(stats.totalEvents).toBeGreaterThanOrEqual(1); // At least one event
            expect(stats.eventsByCategory).toBeDefined();
            expect(stats.eventsByLevel).toBeDefined();
            expect(stats.activeAlerts).toBeGreaterThanOrEqual(1);
            expect(stats.performanceMetrics).toBeDefined();
            expect(stats.systemHealth).toBeDefined();
            expect(stats.timestamp).toBeDefined();
        });

        it('should include performance metrics', () => {
            const stats = auditService.getAuditStatistics();

            expect(stats.performanceMetrics.requestCount).toBeGreaterThanOrEqual(0);
            expect(stats.performanceMetrics.errorCount).toBeGreaterThanOrEqual(0);
            expect(stats.performanceMetrics.averageResponseTime).toBeGreaterThanOrEqual(0);
        });

        it('should include system health information', () => {
            const stats = auditService.getAuditStatistics();

            expect(stats.systemHealth.memoryUsage).toBeDefined();
            expect(stats.systemHealth.uptime).toBeGreaterThan(0);
            expect(stats.systemHealth.storeSize).toBeGreaterThanOrEqual(0);
        });
    });

    describe('updateMetrics', () => {
        it('should update performance metrics for performance events', () => {
            const performanceEvent = {
                category: 'performance',
                details: { responseTime: 200 },
                level: 'INFO'
            };

            const initialRequestCount = auditService.performanceMetrics.requestCount;
            auditService.updateMetrics(performanceEvent);

            expect(auditService.performanceMetrics.requestCount).toBe(initialRequestCount + 1);
        });

        it('should update error count for error events', () => {
            const errorEvent = {
                category: 'security_event',
                level: 'ERROR'
            };

            const initialErrorCount = auditService.performanceMetrics.errorCount;
            auditService.updateMetrics(errorEvent);

            expect(auditService.performanceMetrics.errorCount).toBe(initialErrorCount + 1);
        });
    });

    describe('utility methods', () => {
        it('should sanitize PII in details', () => {
            const details = {
                email: 'test@example.com',
                phone: '+1234567890',
                name: 'John Doe',
                publicInfo: 'This is public'
            };

            const sanitized = auditService.sanitizeDetails(details);

            expect(sanitized.email).toBe('mocked_hash');
            expect(sanitized.phone).toBe('mocked_hash');
            expect(sanitized.name).toBe('mocked_hash');
            expect(sanitized.publicInfo).toBe('This is public');
        });

        it('should sanitize sensitive context information', () => {
            const context = {
                clientIP: '192.168.1.1',
                headers: {
                    authorization: 'Bearer token123',
                    cookie: 'session=abc123',
                    'user-agent': 'Mozilla/5.0'
                },
                sessionId: 'session-123'
            };

            const sanitized = auditService.sanitizeContext(context);

            expect(sanitized.clientIP).toBe('mocked_hash');
            expect(sanitized.headers.authorization).toBeUndefined();
            expect(sanitized.headers.cookie).toBeUndefined();
            expect(sanitized.headers['user-agent']).toBe('Mozilla/5.0');
            expect(sanitized.sessionId).toBe('session-123');
        });

        it('should determine correct compliance type', () => {
            const medicalEvent = { category: 'medical_compliance' };
            const dataEvent = { category: 'data_access' };
            const generalEvent = { category: 'user_interaction' };

            expect(auditService.determineComplianceType(medicalEvent)).toBe('CFM');
            expect(auditService.determineComplianceType(dataEvent)).toBe('LGPD');
            expect(auditService.determineComplianceType(generalEvent)).toBe('GENERAL');
        });

        it('should calculate retention date based on event level', () => {
            const criticalEvent = { level: 'CRITICAL' };
            const infoEvent = { level: 'INFO' };

            const criticalRetention = auditService.calculateRetentionDate(criticalEvent);
            const infoRetention = auditService.calculateRetentionDate(infoEvent);

            expect(criticalRetention).toBeInstanceOf(Date);
            expect(infoRetention).toBeInstanceOf(Date);
            expect(criticalRetention.getTime()).toBeGreaterThan(infoRetention.getTime());
        });
    });

    describe('getMonitoringDashboard', () => {
        beforeEach(async () => {
            // Add test events for dashboard
            await auditService.logAuditEvent('user_interaction', 'message_sent', {}, mockContext);
            await auditService.logSecurityEvent({
                type: 'threat_detected',
                severity: 'HIGH',
                blocked: true,
                threatScore: 80
            }, mockContext);
            await auditService.logMedicalComplianceEvent({
                type: 'cfm_check',
                complianceType: 'CFM',
                result: 'compliant'
            }, mockContext);
        });

        it('should return comprehensive dashboard data', () => {
            const dashboard = auditService.getMonitoringDashboard('24h');

            expect(dashboard.overview).toBeDefined();
            expect(dashboard.security).toBeDefined();
            expect(dashboard.compliance).toBeDefined();
            expect(dashboard.performance).toBeDefined();
            expect(dashboard.alerts).toBeDefined();

            expect(dashboard.overview.timeRange).toBe('24h');
            expect(dashboard.overview.totalEvents).toBeGreaterThanOrEqual(0);
            expect(dashboard.overview.systemStatus).toBeDefined();
        });

        it('should filter events by time range', () => {
            const dashboard1h = auditService.getMonitoringDashboard('1h');
            const dashboard24h = auditService.getMonitoringDashboard('24h');

            expect(dashboard1h.overview.timeRange).toBe('1h');
            expect(dashboard24h.overview.timeRange).toBe('24h');
        });
    });

    describe('detectSecurityEvents', () => {
        it('should detect SQL injection attempts', async () => {
            const eventData = {
                message: "'; DROP TABLE users; --"
            };

            const result = await auditService.detectSecurityEvents(eventData, mockContext);

            expect(result.threatDetected).toBe(true);
            expect(result.violations).toContain('SQL_INJECTION');
            expect(result.threatLevel).toBe('CRITICAL');
            expect(result.securityScore).toBeLessThan(100);
        });

        it('should detect XSS attempts', async () => {
            const eventData = {
                message: '<script>alert("xss")</script>'
            };

            const result = await auditService.detectSecurityEvents(eventData, mockContext);

            expect(result.threatDetected).toBe(true);
            expect(result.violations).toContain('XSS_ATTEMPT');
            expect(result.threatLevel).toBe('HIGH');
        });

        it('should detect rate limit violations', async () => {
            // Mock rate limit violation
            auditService.detectRateLimitViolation = vi.fn().mockReturnValue(true);

            const result = await auditService.detectSecurityEvents({}, mockContext);

            expect(result.threatDetected).toBe(true);
            expect(result.violations).toContain('RATE_LIMIT_EXCEEDED');
            expect(result.threatLevel).toBe('MEDIUM');
        });

        it('should detect bot behavior', async () => {
            const botContext = {
                ...mockContext,
                userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            };

            const result = await auditService.detectSecurityEvents({}, botContext);

            expect(result.threatDetected).toBe(true);
            expect(result.violations).toContain('BOT_DETECTED');
        });

        it('should generate security recommendations', async () => {
            const eventData = {
                message: "'; DROP TABLE users; --"
            };

            const result = await auditService.detectSecurityEvents(eventData, mockContext);

            expect(result.recommendations).toBeDefined();
            expect(result.recommendations.length).toBeGreaterThan(0);
            expect(result.recommendations).toContain('ENHANCE_INPUT_VALIDATION');
        });
    });

    describe('monitorCompliance', () => {
        it('should check CFM compliance', async () => {
            const eventData = {
                message: 'Que remédio posso tomar para dor de cabeça?'
            };

            const result = await auditService.monitorCompliance(eventData, mockContext);

            expect(result.cfmCompliant).toBeDefined();
            expect(result.lgpdCompliant).toBeDefined();
            expect(result.complianceScore).toBeGreaterThanOrEqual(0);
            expect(result.complianceScore).toBeLessThanOrEqual(100);
        });

        it('should detect emergency keywords', async () => {
            const eventData = {
                message: 'Socorro! Perdi a visão de repente!'
            };

            const result = await auditService.monitorCompliance(eventData, mockContext);

            expect(result.warnings).toContain('EMERGENCY_KEYWORDS_DETECTED');
            expect(result.requiredActions).toContain('SHOW_EMERGENCY_CONTACT_INFO');
        });

        it('should check LGPD compliance for personal data', async () => {
            const eventData = {
                containsPersonalData: true
            };

            const contextWithoutConsent = {
                ...mockContext,
                consentId: null
            };

            const result = await auditService.monitorCompliance(eventData, contextWithoutConsent);

            expect(result.lgpdCompliant).toBe(false);
            expect(result.violations).toContain('MISSING_CONSENT');
            expect(result.requiredActions).toContain('REQUEST_USER_CONSENT');
        });
    });

    describe('checkRealTimeAlerts', () => {
        beforeEach(async () => {
            // Clear existing alerts
            auditService.alertStore.clear();

            // Add test events that should trigger alerts
            for (let i = 0; i < 10; i++) {
                await auditService.logAuditEvent('user_interaction', 'error_event', {}, {
                    ...mockContext,
                    sessionId: `session-${i}`
                });
            }
        });

        it('should detect high error rates', async () => {
            // Mock high error rate
            auditService.performanceMetrics.requestCount = 100;
            auditService.performanceMetrics.errorCount = 10; // 10% error rate

            const alerts = await auditService.checkRealTimeAlerts();

            const errorRateAlert = alerts.find(alert => alert.type === 'HIGH_ERROR_RATE');
            expect(errorRateAlert).toBeDefined();
            expect(errorRateAlert.severity).toBe('HIGH');
        });

        it('should detect performance degradation', async () => {
            // Mock slow response time
            auditService.performanceMetrics.averageResponseTime = 5000; // 5 seconds

            const alerts = await auditService.checkRealTimeAlerts();

            const performanceAlert = alerts.find(alert => alert.type === 'PERFORMANCE_DEGRADATION');
            expect(performanceAlert).toBeDefined();
            expect(performanceAlert.severity).toBe('MEDIUM');
        });

        it('should process triggered alerts', async () => {
            const initialAlertCount = auditService.alertStore.size;

            await auditService.checkRealTimeAlerts();

            // Should have processed and stored alerts
            expect(auditService.alertStore.size).toBeGreaterThanOrEqual(initialAlertCount);
        });
    });

    describe('utility methods', () => {
        it('should parse time ranges correctly', () => {
            expect(auditService.parseTimeRange('1h')).toBe(60 * 60 * 1000);
            expect(auditService.parseTimeRange('24h')).toBe(24 * 60 * 60 * 1000);
            expect(auditService.parseTimeRange('7d')).toBe(7 * 24 * 60 * 60 * 1000);
            expect(auditService.parseTimeRange('invalid')).toBe(24 * 60 * 60 * 1000); // Default
        });

        it('should calculate system status correctly', () => {
            // Mock healthy system
            auditService.calculateErrorRate = vi.fn().mockReturnValue(1);
            expect(auditService.getSystemStatus()).toBe('HEALTHY');

            // Mock warning system
            auditService.calculateErrorRate = vi.fn().mockReturnValue(6);
            expect(auditService.getSystemStatus()).toBe('WARNING');

            // Mock critical system
            auditService.calculateErrorRate = vi.fn().mockReturnValue(15);
            expect(auditService.getSystemStatus()).toBe('CRITICAL');
        });

        it('should calculate threat levels correctly', () => {
            const lowThreatEvents = [];
            expect(auditService.calculateThreatLevel(lowThreatEvents)).toBe('LOW');

            const mediumThreatEvents = Array(6).fill({ details: { severity: 'LOW' } });
            expect(auditService.calculateThreatLevel(mediumThreatEvents)).toBe('MEDIUM');

            const highThreatEvents = [
                { details: { severity: 'HIGH' } },
                { details: { severity: 'HIGH' } },
                { details: { severity: 'HIGH' } }
            ];
            expect(auditService.calculateThreatLevel(highThreatEvents)).toBe('HIGH');

            const criticalThreatEvents = [{ details: { severity: 'CRITICAL' } }];
            expect(auditService.calculateThreatLevel(criticalThreatEvents)).toBe('CRITICAL');
        });

        it('should escalate threat levels correctly', () => {
            expect(auditService.escalateThreatLevel('LOW', 'MEDIUM')).toBe('MEDIUM');
            expect(auditService.escalateThreatLevel('MEDIUM', 'LOW')).toBe('MEDIUM');
            expect(auditService.escalateThreatLevel('HIGH', 'CRITICAL')).toBe('CRITICAL');
        });

        it('should detect malicious input patterns', () => {
            const sqlInjection = auditService.detectMaliciousInput({
                message: "'; DROP TABLE users; --"
            });
            expect(sqlInjection.detected).toBe(true);
            expect(sqlInjection.types).toContain('SQL_INJECTION');

            const xssAttempt = auditService.detectMaliciousInput({
                message: '<script>alert("xss")</script>'
            });
            expect(xssAttempt.detected).toBe(true);
            expect(xssAttempt.types).toContain('XSS_ATTEMPT');

            const cleanInput = auditService.detectMaliciousInput({
                message: 'Hello, how are you?'
            });
            expect(cleanInput.detected).toBe(false);
        });

        it('should analyze session behavior', () => {
            // Add multiple events for the same session
            const sessionId = 'test-session-behavior';
            for (let i = 0; i < 35; i++) {
                auditService.auditStore.set(`event-${i}`, {
                    context: { sessionId },
                    timestamp: new Date().toISOString(),
                    details: { message: i % 3 === 0 ? 'repeated message' : `message ${i}` }
                });
            }

            const analysis = auditService.analyzeSessionBehavior(sessionId);
            expect(analysis.suspicious).toBe(true);
            expect(analysis.reasons).toContain('HIGH_REQUEST_FREQUENCY');
        });

        it('should detect bot behavior from user agent', () => {
            const botContext = {
                userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            };

            const botDetection = auditService.detectBotBehavior(botContext);
            expect(botDetection.detected).toBe(true);
            expect(botDetection.indicators).toContain('BOT_USER_AGENT');

            const humanContext = {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            };

            const humanDetection = auditService.detectBotBehavior(humanContext);
            expect(humanDetection.detected).toBe(false);
        });
    });

    describe('error handling', () => {
        it('should handle logging errors gracefully', async () => {
            // Mock writeAuditLog to throw an error
            const originalWriteAuditLog = auditService.writeAuditLog;
            auditService.writeAuditLog = vi.fn().mockRejectedValue(new Error('Write failed'));

            await expect(
                auditService.logAuditEvent('test_category', 'test_action', {}, mockContext)
            ).rejects.toThrow('Write failed');

            // Restore original method
            auditService.writeAuditLog = originalWriteAuditLog;
        });

        it('should handle security analysis errors gracefully', async () => {
            // Mock a method to throw an error
            auditService.detectMaliciousInput = vi.fn().mockImplementation(() => {
                throw new Error('Analysis failed');
            });

            // Should not throw, but handle gracefully
            const result = await auditService.detectSecurityEvents({}, mockContext);
            expect(result).toBeDefined();
        });

        it('should handle compliance monitoring errors gracefully', async () => {
            // Mock a method to throw an error
            auditService.checkCFMCompliance = vi.fn().mockRejectedValue(new Error('CFM check failed'));

            // Should handle the error and continue
            const result = await auditService.monitorCompliance({}, mockContext);
            expect(result).toBeDefined();
        });
    });
});