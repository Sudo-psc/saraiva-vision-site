/**
 * Tests for ChatbotSecurityService
 * Comprehensive test suite for chatbot security framework
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import ChatbotSecurityService from '../chatbotSecurityService.js';

// Mock dependencies
vi.mock('../medicalSafetyFilter.js', () => ({
    default: class MockMedicalSafetyFilter {
        analyzeSafety(message) {
            return {
                requiresIntervention: message.includes('emergency'),
                emergencyDetected: message.includes('emergency'),
                riskLevel: message.includes('emergency') ? 'CRITICAL' : 'LOW',
                recommendedActions: []
            };
        }
    }
}));

vi.mock('../cfmComplianceEngine.js', () => ({
    default: class MockCFMComplianceEngine {
        analyzeMessage(message) {
            return {
                emergencyDetected: message.includes('emergency'),
                medicalAdviceDetected: message.includes('diagnose'),
                riskLevel: message.includes('emergency') ? 'critical' : 'low',
                recommendedActions: []
            };
        }
    }
}));

vi.mock('../../api/contact/rateLimiter.js', () => ({
    getClientIP: vi.fn(() => '192.168.1.1')
}));

describe('ChatbotSecurityService', () => {
    let securityService;
    let mockRequest;
    let mockContext;

    beforeEach(() => {
        securityService = new ChatbotSecurityService();

        mockRequest = {
            message: 'Hello, I need help with my appointment',
            sessionId: 'test-session-123'
        };

        mockContext = {
            clientIP: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            req: {
                headers: {
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        };

        // Clear any existing stores
        securityService.sessionStore.clear();
        securityService.rateLimitStore.clear();
        securityService.securityEventStore.clear();
        securityService.suspiciousActivityStore.clear();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('validateChatbotRequest', () => {
        it('should validate a normal request successfully', async () => {
            const result = await securityService.validateChatbotRequest(mockRequest, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.sessionId).toBeDefined();
            expect(result.securityScore).toBeGreaterThan(80);
            expect(result.violations).toHaveLength(0);
            expect(result.metadata.timestamp).toBeDefined();
        });

        it('should detect malicious input patterns', async () => {
            const maliciousRequest = {
                ...mockRequest,
                message: '<script>alert("xss")</script>'
            };

            const result = await securityService.validateChatbotRequest(maliciousRequest, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.violations.length).toBeGreaterThan(0);
            expect(result.violations[0].type).toBe('MALICIOUS_INPUT_DETECTED');
            expect(result.securityScore).toBeLessThan(50);
        });

        it('should detect SQL injection attempts', async () => {
            const sqlInjectionRequest = {
                ...mockRequest,
                message: "'; DROP TABLE users; --"
            };

            const result = await securityService.validateChatbotRequest(sqlInjectionRequest, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.violations.some(v => v.type === 'MALICIOUS_INPUT_DETECTED')).toBe(true);
        });

        it('should handle emergency medical situations', async () => {
            const emergencyRequest = {
                ...mockRequest,
                message: 'I have an emergency, I lost my vision suddenly!'
            };

            const result = await securityService.validateChatbotRequest(emergencyRequest, mockContext);

            expect(result.actions.some(a => a.type === 'MEDICAL_INTERVENTION')).toBe(true);
        });

        it('should enforce rate limiting', async () => {
            // Send multiple requests rapidly
            const promises = [];
            for (let i = 0; i < 25; i++) {
                promises.push(securityService.validateChatbotRequest(mockRequest, mockContext));
            }

            const results = await Promise.all(promises);

            // Some requests should be rate limited
            const rateLimitedResults = results.filter(r =>
                r.violations.some(v => v.type === 'RATE_LIMIT_EXCEEDED')
            );

            expect(rateLimitedResults.length).toBeGreaterThan(0);
        });

        it('should validate message length', async () => {
            const longMessageRequest = {
                ...mockRequest,
                message: 'a'.repeat(1500) // Exceeds max length
            };

            const result = await securityService.validateChatbotRequest(longMessageRequest, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.violations.some(v => v.type === 'MESSAGE_TOO_LONG')).toBe(true);
        });

        it('should detect suspicious activity patterns', async () => {
            // Simulate rapid-fire messaging
            const promises = [];
            for (let i = 0; i < 20; i++) {
                promises.push(securityService.validateChatbotRequest({
                    ...mockRequest,
                    message: `Message ${i}`
                }, mockContext));
            }

            const results = await Promise.all(promises);

            // Later requests should have warnings about suspicious activity
            const lastResult = results[results.length - 1];
            expect(lastResult.warnings.some(w => w.type === 'SUSPICIOUS_ACTIVITY')).toBe(true);
        });

        it('should track session consistency', async () => {
            // First request
            const result1 = await securityService.validateChatbotRequest(mockRequest, mockContext);
            expect(result1.isValid).toBe(true);

            // Second request with different IP
            const differentIPContext = {
                ...mockContext,
                clientIP: '10.0.0.1'
            };

            const result2 = await securityService.validateChatbotRequest({
                ...mockRequest,
                sessionId: result1.sessionId
            }, differentIPContext);

            expect(result2.warnings.some(w => w.type === 'IP_CHANGE_DETECTED')).toBe(true);
        });
    });

    describe('validateRateLimit', () => {
        it('should allow requests within rate limits', async () => {
            const result = await securityService.validateRateLimit('192.168.1.1', 'session-123');

            expect(result.allowed).toBe(true);
            expect(result.remaining).toBeDefined();
            expect(result.remaining.messagesPerMinute).toBeLessThan(20);
        });

        it('should block requests exceeding rate limits', async () => {
            // Exhaust rate limit
            for (let i = 0; i < 25; i++) {
                await securityService.validateRateLimit('192.168.1.1', 'session-123');
            }

            const result = await securityService.validateRateLimit('192.168.1.1', 'session-123');

            expect(result.allowed).toBe(false);
            expect(result.type).toBe('RATE_LIMIT_MINUTE');
            expect(result.retryAfter).toBe(60);
        });

        it('should handle different IPs independently', async () => {
            // Exhaust rate limit for first IP
            for (let i = 0; i < 25; i++) {
                await securityService.validateRateLimit('192.168.1.1', 'session-1');
            }

            // Second IP should still be allowed
            const result = await securityService.validateRateLimit('192.168.1.2', 'session-2');

            expect(result.allowed).toBe(true);
        });
    });

    describe('validateInput', () => {
        it('should validate normal input', async () => {
            const result = await securityService.validateInput('Hello, how are you?', mockRequest);

            expect(result.isValid).toBe(true);
            expect(result.violations).toHaveLength(0);
            expect(result.sanitizedMessage).toBe('Hello, how are you?');
        });

        it('should reject empty or invalid input', async () => {
            const result1 = await securityService.validateInput('', mockRequest);
            const result2 = await securityService.validateInput(null, mockRequest);
            const result3 = await securityService.validateInput(123, mockRequest);

            expect(result1.isValid).toBe(false);
            expect(result2.isValid).toBe(false);
            expect(result3.isValid).toBe(false);
        });

        it('should sanitize malicious input', async () => {
            const maliciousInput = '<script>alert("xss")</script>Hello';
            const result = await securityService.validateInput(maliciousInput, mockRequest);

            expect(result.sanitizedMessage).not.toContain('<script>');
            expect(result.sanitizedMessage).not.toContain('alert');
        });

        it('should detect command injection attempts', async () => {
            const commandInjection = 'Hello; rm -rf /';
            const result = await securityService.validateInput(commandInjection, mockRequest);

            expect(result.isValid).toBe(false);
            expect(result.violations.some(v => v.type === 'MALICIOUS_INPUT_DETECTED')).toBe(true);
        });
    });

    describe('validateSession', () => {
        it('should create new session for first request', async () => {
            const result = await securityService.validateSession('new-session', '192.168.1.1', mockContext);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(0);
            expect(securityService.sessionStore.has('new-session')).toBe(true);
        });

        it('should validate existing session', async () => {
            // Create session first
            await securityService.validateSession('existing-session', '192.168.1.1', mockContext);

            // Validate same session
            const result = await securityService.validateSession('existing-session', '192.168.1.1', mockContext);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(0);
        });

        it('should detect IP changes in session', async () => {
            // Create session with first IP
            await securityService.validateSession('ip-change-session', '192.168.1.1', mockContext);

            // Access with different IP
            const result = await securityService.validateSession('ip-change-session', '10.0.0.1', mockContext);

            expect(result.warnings.some(w => w.type === 'IP_CHANGE_DETECTED')).toBe(true);
        });

        it('should detect user agent changes', async () => {
            // Create session with first user agent
            await securityService.validateSession('ua-change-session', '192.168.1.1', mockContext);

            // Access with different user agent
            const differentUAContext = {
                ...mockContext,
                userAgent: 'Different User Agent'
            };

            const result = await securityService.validateSession('ua-change-session', '192.168.1.1', differentUAContext);

            expect(result.warnings.some(w => w.type === 'USER_AGENT_CHANGE')).toBe(true);
        });
    });

    describe('detectSuspiciousActivity', () => {
        it('should detect rapid-fire messaging', async () => {
            const activity = await securityService.detectSuspiciousActivity(
                mockRequest,
                mockContext,
                '192.168.1.1'
            );

            // First request should be normal
            expect(activity.detected).toBe(false);

            // Simulate many rapid requests
            for (let i = 0; i < 20; i++) {
                await securityService.detectSuspiciousActivity(
                    { ...mockRequest, message: `Message ${i}` },
                    mockContext,
                    '192.168.1.1'
                );
            }

            const suspiciousActivity = await securityService.detectSuspiciousActivity(
                mockRequest,
                mockContext,
                '192.168.1.1'
            );

            expect(suspiciousActivity.detected).toBe(true);
            expect(suspiciousActivity.details).toContain('Rapid-fire messaging detected');
        });

        it('should detect repetitive content', async () => {
            const repetitiveMessage = 'Same message repeated';

            // Send same message multiple times
            for (let i = 0; i < 5; i++) {
                await securityService.detectSuspiciousActivity(
                    { ...mockRequest, message: repetitiveMessage },
                    mockContext,
                    '192.168.1.1'
                );
            }

            const activity = await securityService.detectSuspiciousActivity(
                { ...mockRequest, message: repetitiveMessage },
                mockContext,
                '192.168.1.1'
            );

            expect(activity.detected).toBe(true);
            expect(activity.details).toContain('Repetitive content detected');
        });

        it('should detect bot-like user agents', async () => {
            const botContext = {
                ...mockContext,
                userAgent: 'curl/7.68.0'
            };

            const activity = await securityService.detectSuspiciousActivity(
                mockRequest,
                botContext,
                '192.168.1.1'
            );

            expect(activity.detected).toBe(true);
            expect(activity.details).toContain('Bot-like user agent detected');
        });
    });

    describe('sanitizeMessage', () => {
        it('should remove script tags', () => {
            const malicious = '<script>alert("xss")</script>Hello';
            const sanitized = securityService.sanitizeMessage(malicious);

            expect(sanitized).not.toContain('<script>');
            expect(sanitized).not.toContain('alert');
            expect(sanitized).toBe('Hello');
        });

        it('should remove iframe tags', () => {
            const malicious = '<iframe src="evil.com"></iframe>Hello';
            const sanitized = securityService.sanitizeMessage(malicious);

            expect(sanitized).not.toContain('<iframe>');
            expect(sanitized).toBe('Hello');
        });

        it('should remove javascript: URLs', () => {
            const malicious = 'javascript:alert("xss") Hello';
            const sanitized = securityService.sanitizeMessage(malicious);

            expect(sanitized).not.toContain('javascript:');
            expect(sanitized).toBe('alert("xss") Hello');
        });

        it('should remove HTML tags', () => {
            const html = '<div>Hello <b>world</b></div>';
            const sanitized = securityService.sanitizeMessage(html);

            expect(sanitized).not.toContain('<div>');
            expect(sanitized).not.toContain('<b>');
            expect(sanitized).toBe('Hello world');
        });
    });

    describe('getSecurityStats', () => {
        it('should return security statistics', () => {
            // Add some test data
            securityService.sessionStore.set('session1', { securityScore: 90 });
            securityService.sessionStore.set('session2', { securityScore: 80 });

            const stats = securityService.getSecurityStats();

            expect(stats.activeSessions).toBe(2);
            expect(stats.averageSecurityScore).toBe(85);
            expect(stats.timestamp).toBeDefined();
        });
    });

    describe('cleanup methods', () => {
        it('should cleanup expired sessions', () => {
            // Add expired session
            const expiredSession = {
                id: 'expired',
                lastActivity: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
                securityScore: 100
            };

            securityService.sessionStore.set('expired', expiredSession);
            expect(securityService.sessionStore.has('expired')).toBe(true);

            securityService.cleanupExpiredSessions();

            expect(securityService.sessionStore.has('expired')).toBe(false);
        });

        it('should cleanup old rate limit entries', () => {
            // Add old rate limit data
            const oldData = {
                messagesPerMinute: [Date.now() - (25 * 60 * 60 * 1000)], // 25 hours ago
                messagesPerHour: []
            };

            securityService.rateLimitStore.set('ip:old', oldData);
            expect(securityService.rateLimitStore.has('ip:old')).toBe(true);

            securityService.cleanupRateLimitStore();

            expect(securityService.rateLimitStore.has('ip:old')).toBe(false);
        });

        it('should cleanup old security events', () => {
            // Add old security event
            const oldEvent = {
                id: 'old-event',
                timestamp: new Date(Date.now() - (8 * 24 * 60 * 60 * 1000)).toISOString() // 8 days ago
            };

            securityService.securityEventStore.set('old-event', oldEvent);
            expect(securityService.securityEventStore.has('old-event')).toBe(true);

            securityService.cleanupSecurityEvents();

            expect(securityService.securityEventStore.has('old-event')).toBe(false);
        });
    });

    describe('error handling', () => {
        it('should handle validation errors gracefully', async () => {
            // Mock an error in medical safety filter
            const originalAnalyzeSafety = securityService.medicalSafetyFilter.analyzeSafety;
            securityService.medicalSafetyFilter.analyzeSafety = vi.fn(() => {
                throw new Error('Medical filter error');
            });

            const result = await securityService.validateChatbotRequest(mockRequest, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.violations.some(v => v.type === 'SECURITY_VALIDATION_ERROR')).toBe(true);

            // Restore original method
            securityService.medicalSafetyFilter.analyzeSafety = originalAnalyzeSafety;
        });
    });
});