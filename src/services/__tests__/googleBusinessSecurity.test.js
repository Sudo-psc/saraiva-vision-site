import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GoogleBusinessSecurity from '../googleBusinessSecurity';

describe('GoogleBusinessSecurity', () => {
    let security;
    let mockConsole;

    beforeEach(() => {
        mockConsole = {
            warn: vi.fn(),
            log: vi.fn(),
            error: vi.fn()
        };
        global.console = mockConsole;

        security = new GoogleBusinessSecurity({
            dataRetentionPeriod: 30, // Shorter period for testing
            auditLogRetention: 7, // Shorter period for testing
            rateLimitWindow: 1000, // 1 second for testing
            rateLimitMaxRequests: 5, // Lower limit for testing
            enableAutoCleanup: false // Disable auto cleanup for most tests
        });
    });

    afterEach(() => {
        if (security) {
            security.destroy();
        }
        vi.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with default options', () => {
            const defaultSecurity = new GoogleBusinessSecurity();
            expect(defaultSecurity.options.enableInputSanitization).toBe(true);
            expect(defaultSecurity.options.enableXssProtection).toBe(true);
            expect(defaultSecurity.options.dataRetentionPeriod).toBe(365);
            expect(defaultSecurity.options.enableRateLimiting).toBe(true);
        });

        it('should initialize with custom options', () => {
            const customSecurity = new GoogleBusinessSecurity({
                enableInputSanitization: false,
                dataRetentionPeriod: 180,
                rateLimitMaxRequests: 50
            });

            expect(customSecurity.options.enableInputSanitization).toBe(false);
            expect(customSecurity.options.dataRetentionPeriod).toBe(180);
            expect(customSecurity.options.rateLimitMaxRequests).toBe(50);
        });

        it('should set up initial data structures', () => {
            expect(security.requestTracker).toBeInstanceOf(Map);
            expect(security.auditLog).toEqual([]);
            expect(security.cleanupTimer).toBeNull();
        });
    });

    describe('Input Sanitization', () => {
        it('should return non-string data unchanged', () => {
            const testData = { key: 'value' };
            const result = security.sanitizeInput(testData);
            expect(result).toBe(testData);
        });

        it('should remove HTML tags', () => {
            const input = '<script>alert("xss")</script>Hello World';
            const result = security.sanitizeInput(input);
            expect(result).toBe('Hello World');
        });

        it('should remove JavaScript protocols', () => {
            const input = 'javascript:alert("xss")';
            const result = security.sanitizeInput(input);
            expect(result).toBe('');
        });

        it('should remove event handlers', () => {
            const input = 'onclick=alert("xss")';
            const result = security.sanitizeInput(input);
            expect(result).toBe('');
        });

        it('should remove CSS expressions', () => {
            const input = 'expression(alert("xss"))';
            const result = security.sanitizeInput(input);
            expect(result).toBe('');
        });

        it('should remove data URIs', () => {
            const input = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgieHNzIik8L3NjcmlwdD4=';
            const result = security.sanitizeInput(input);
            expect(result).toBe('');
        });

        it('should normalize whitespace', () => {
            const input = 'Hello    World   Test';
            const result = security.sanitizeInput(input);
            expect(result).toBe('Hello World Test');
        });

        it('should trim leading/trailing whitespace', () => {
            const input = '  Hello World  ';
            const result = security.sanitizeInput(input);
            expect(result).toBe('Hello World');
        });

        it('should return input unchanged when sanitization is disabled', () => {
            const disabledSecurity = new GoogleBusinessSecurity({ enableInputSanitization: false });
            const input = '<script>alert("xss")</script>';
            const result = disabledSecurity.sanitizeInput(input);
            expect(result).toBe(input);
        });
    });

    describe('Review Data Sanitization', () => {
        it('should sanitize review comment', () => {
            const review = {
                comment: '<script>alert("xss")</script>Great service!',
                reviewer: {
                    displayName: 'John Doe'
                }
            };

            const result = security.sanitizeReviewData(review);
            expect(result.comment).toBe('Great service!');
            expect(result.reviewer.displayName).toBe('John Doe');
        });

        it('should sanitize reviewer display name', () => {
            const review = {
                comment: 'Great service!',
                reviewer: {
                    displayName: '<script>alert("xss")</script>John Doe'
                }
            };

            const result = security.sanitizeReviewData(review);
            expect(result.reviewer.displayName).toBe('John Doe');
        });

        it('should sanitize review reply comment', () => {
            const review = {
                comment: 'Great service!',
                reviewer: {
                    displayName: 'John Doe'
                },
                reviewReply: {
                    comment: '<script>alert("xss")</script>Thank you for your feedback!'
                }
            };

            const result = security.sanitizeReviewData(review);
            expect(result.reviewReply.comment).toBe('Thank you for your feedback!');
        });

        it('should handle null or undefined review', () => {
            const result1 = security.sanitizeReviewData(null);
            const result2 = security.sanitizeReviewData(undefined);
            expect(result1).toBeNull();
            expect(result2).toBeUndefined();
        });

        it('should handle non-object review', () => {
            const result = security.sanitizeReviewData('not an object');
            expect(result).toBe('not an object');
        });
    });

    describe('API Parameter Validation', () => {
        it('should validate valid locationId', () => {
            const params = { locationId: 'accounts/123456789/locations/987654321' };
            const result = security.validateApiParams(params);
            expect(result.isValid).toBe(true);
            expect(result.sanitized.locationId).toBe(params.locationId);
        });

        it('should reject invalid locationId format', () => {
            const params = { locationId: 'invalid-format' };
            const result = security.validateApiParams(params);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid locationId format');
        });

        it('should validate valid pageSize', () => {
            const params = { pageSize: '10' };
            const result = security.validateApiParams(params);
            expect(result.isValid).toBe(true);
            expect(result.sanitized.pageSize).toBe(10);
        });

        it('should reject pageSize out of range', () => {
            const params = { pageSize: '0' };
            const result = security.validateApiParams(params);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('pageSize must be between 1 and 100');
        });

        it('should validate valid pageToken', () => {
            const params = { pageToken: 'valid-token-123' };
            const result = security.validateApiParams(params);
            expect(result.isValid).toBe(true);
            expect(result.sanitized.pageToken).toBe('valid-token-123');
        });

        it('should reject empty pageToken', () => {
            const params = { pageToken: '' };
            const result = security.validateApiParams(params);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid pageToken');
        });

        it('should validate valid orderBy', () => {
            const params = { orderBy: 'newest' };
            const result = security.validateApiParams(params);
            expect(result.isValid).toBe(true);
            expect(result.sanitized.orderBy).toBe('newest');
        });

        it('should reject invalid orderBy', () => {
            const params = { orderBy: 'invalid' };
            const result = security.validateApiParams(params);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Invalid orderBy value');
        });
    });

    describe('Rate Limiting', () => {
        it('should allow requests within limit', () => {
            const clientId = 'test-client';

            for (let i = 0; i < 5; i++) {
                const result = security.checkRateLimit(clientId);
                expect(result.allowed).toBe(true);
                expect(result.remaining).toBe(5 - i - 1);
            }
        });

        it('should reject requests exceeding limit', () => {
            const clientId = 'test-client';

            // Use up all requests
            for (let i = 0; i < 5; i++) {
                security.checkRateLimit(clientId);
            }

            // Next request should be rejected
            const result = security.checkRateLimit(clientId);
            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });

        it('should reset rate limit after window expires', () => {
            const clientId = 'test-client';

            // Use up all requests
            for (let i = 0; i < 5; i++) {
                security.checkRateLimit(clientId);
            }

            // Simulate time passing (manually clear the tracker)
            security.requestTracker.delete(clientId);

            // Next request should be allowed
            const result = security.checkRateLimit(clientId);
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4);
        });

        it('should allow unlimited requests when rate limiting is disabled', () => {
            const disabledSecurity = new GoogleBusinessSecurity({ enableRateLimiting: false });
            const clientId = 'test-client';

            for (let i = 0; i < 10; i++) {
                const result = disabledSecurity.checkRateLimit(clientId);
                expect(result.allowed).toBe(true);
                expect(result.remaining).toBe(Infinity);
            }
        });
    });

    describe('Audit Logging', () => {
        it('should log audit events when enabled', () => {
            const event = {
                type: 'security_event',
                action: 'test_action',
                clientId: 'test-client',
                details: { test: 'data' },
                severity: 'info'
            };

            security.logAuditEvent(event);

            expect(security.auditLog).toHaveLength(1);
            expect(security.auditLog[0]).toMatchObject({
                type: 'security_event',
                action: 'test_action',
                clientId: 'test-client',
                details: { test: 'data' },
                severity: 'info'
            });
            expect(security.auditLog[0]).toHaveProperty('timestamp');
        });

        it('should not log audit events when disabled', () => {
            const disabledSecurity = new GoogleBusinessSecurity({ enableAuditLogging: false });
            const event = {
                type: 'security_event',
                action: 'test_action'
            };

            disabledSecurity.logAuditEvent(event);

            expect(disabledSecurity.auditLog).toHaveLength(0);
        });

        it('should get audit logs with filters', () => {
            // Add some test events
            security.logAuditEvent({ type: 'security_event', action: 'action1', clientId: 'client1' });
            security.logAuditEvent({ type: 'privacy_event', action: 'action2', clientId: 'client2' });
            security.logAuditEvent({ type: 'security_event', action: 'action3', clientId: 'client1' });

            // Test type filter
            const securityEvents = security.getAuditLogs({ type: 'security_event' });
            expect(securityEvents).toHaveLength(2);

            // Test clientId filter
            const client1Events = security.getAuditLogs({ clientId: 'client1' });
            expect(client1Events).toHaveLength(2);

            // Test limit filter
            const limitedEvents = security.getAuditLogs({ limit: 1 });
            expect(limitedEvents).toHaveLength(1);
        });

        it('should respect audit log retention limit', () => {
            // Add many events to test retention
            for (let i = 0; i < 200; i++) {
                security.logAuditEvent({ type: 'test_event', action: `action${i}` });
            }

            // Should be limited by retention period
            expect(security.auditLog.length).toBeLessThanOrEqual(10080); // 7 days * 24 hours * 60 minutes
        });
    });

    describe('Privacy Compliance', () => {
        it('should generate privacy information', () => {
            const privacyInfo = security.generatePrivacyInfo();

            expect(privacyInfo).toHaveProperty('lgpd');
            expect(privacyInfo).toHaveProperty('gdpr');
            expect(privacyInfo).toHaveProperty('dataProcessing');

            expect(privacyInfo.lgpd).toHaveProperty('applicable');
            expect(privacyInfo.lgpd).toHaveProperty('rights');
            expect(Array.isArray(privacyInfo.lgpd.rights)).toBe(true);

            expect(privacyInfo.gdpr).toHaveProperty('applicable');
            expect(privacyInfo.gdpr).toHaveProperty('rights');
            expect(Array.isArray(privacyInfo.gdpr.rights)).toBe(true);

            expect(privacyInfo.dataProcessing).toHaveProperty('purposes');
            expect(privacyInfo.dataProcessing).toHaveProperty('legalBasis');
        });

        it('should handle data subject access requests', () => {
            const request = {
                type: 'access',
                clientId: 'test-client',
                identifier: 'user123'
            };

            const result = security.handleDataSubjectRequest(request);

            expect(result.success).toBe(true);
            expect(result.data).toHaveProperty('reviews');
            expect(result.data).toHaveProperty('statistics');
        });

        it('should handle data subject deletion requests', () => {
            const request = {
                type: 'deletion',
                clientId: 'test-client',
                identifier: 'user123'
            };

            const result = security.handleDataSubjectRequest(request);

            expect(result.success).toBe(true);
            expect(result.message).toContain('deletion request processed');
        });

        it('should handle data subject rectification requests', () => {
            const request = {
                type: 'rectification',
                clientId: 'test-client',
                identifier: 'user123'
            };

            const result = security.handleDataSubjectRequest(request);

            expect(result.success).toBe(true);
            expect(result.message).toContain('rectification request processed');
        });

        it('should reject unsupported request types', () => {
            const request = {
                type: 'unsupported',
                clientId: 'test-client',
                identifier: 'user123'
            };

            expect(() => {
                security.handleDataSubjectRequest(request);
            }).toThrow('Unsupported request type: unsupported');
        });
    });

    describe('Data Cleanup', () => {
        it('should start and stop data cleanup', () => {
            security.startDataCleanup();
            expect(security.cleanupTimer).not.toBeNull();

            security.stopDataCleanup();
            expect(security.cleanupTimer).toBeNull();
        });

        it('should perform data cleanup', () => {
            const mockDate = new Date('2024-01-15');
            vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

            security.performDataCleanup();

            expect(mockConsole.log).toHaveBeenCalledWith(
                'Data cleanup performed for data older than 2023-12-16T00:00:00.000Z'
            );

            vi.restoreAllMocks();
        });
    });

    describe('Security Reporting', () => {
        it('should generate security report', () => {
            // Add some audit events
            security.logAuditEvent({ type: 'security_event', action: 'test' });
            security.logAuditEvent({ type: 'privacy_event', action: 'test' });

            const report = security.generateSecurityReport();

            expect(report).toHaveProperty('timestamp');
            expect(report).toHaveProperty('configuration');
            expect(report).toHaveProperty('statistics');
            expect(report).toHaveProperty('recentEvents');
            expect(report).toHaveProperty('recommendations');

            expect(report.statistics.totalAuditEvents).toBe(2);
            expect(report.recentEvents).toHaveLength(2);
        });

        it('should generate security recommendations', () => {
            const recommendations = security.generateSecurityRecommendations();

            expect(Array.isArray(recommendations)).toBe(true);

            // All recommendations should have required properties
            recommendations.forEach(rec => {
                expect(rec).toHaveProperty('priority');
                expect(rec).toHaveProperty('category');
                expect(rec).toHaveProperty('recommendation');
            });
        });

        it('should generate recommendations based on configuration', () => {
            const disabledSecurity = new GoogleBusinessSecurity({
                enableInputSanitization: false,
                enableRateLimiting: false,
                enableAuditLogging: false,
                enableLgpdCompliance: false,
                enableGdprCompliance: false,
                dataRetentionPeriod: 400
            });

            const recommendations = disabledSecurity.generateSecurityRecommendations();

            expect(recommendations.length).toBeGreaterThan(0);
            expect(recommendations.some(rec => rec.recommendation.includes('input sanitization'))).toBe(true);
            expect(recommendations.some(rec => rec.recommendation.includes('rate limiting'))).toBe(true);
            expect(recommendations.some(rec => rec.recommendation.includes('audit logging'))).toBe(true);
            expect(recommendations.some(rec => rec.recommendation.includes('privacy compliance'))).toBe(true);
        });
    });

    describe('Resource Cleanup', () => {
        it('should destroy security service properly', () => {
            // Start some features
            security.startDataCleanup();
            security.logAuditEvent({ type: 'test', action: 'test' });

            // Destroy
            security.destroy();

            expect(security.cleanupTimer).toBeNull();
            expect(security.requestTracker.size).toBe(0);
            expect(security.auditLog).toEqual([]);
            expect(mockConsole.log).toHaveBeenCalledWith('Google Business Security Service destroyed');
        });
    });
});
