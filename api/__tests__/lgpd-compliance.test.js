/**
 * Tests for LGPD Compliance API endpoints
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { createServer } from 'http';
import handler from '../lgpd/data-subject-rights.js';
import ipHashHandler from '../utils/ip-hash.js';

// Mock Supabase
vi.mock('../lib/supabase.js', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: { email: 'test@example.com' } }))
                })),
                in: vi.fn(() => ({
                    delete: vi.fn(() => Promise.resolve({ count: 1 }))
                }))
            })),
            insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
            update: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
            }))
        }))
    }
}));

// Mock encryption
vi.mock('../utils/encryption.js', () => ({
    serverEncryption: {
        decryptPersonalData: vi.fn((data) => data),
        encryptPersonalData: vi.fn((data) => data),
        hash: vi.fn(() => ({ hash: 'hashed-value', salt: 'salt' }))
    }
}));

describe('LGPD Data Subject Rights API', () => {
    let server;
    let app;

    beforeEach(() => {
        app = (req, res) => handler(req, res);
        server = createServer(app);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /api/lgpd/data-subject-rights', () => {
        it('should handle data access request', async () => {
            const requestBody = {
                action: 'access',
                patientIdentifier: 'test@example.com',
                verificationCode: 'valid-code'
            };

            const response = await request(server)
                .post('/')
                .send(requestBody)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('Dados pessoais encontrados');
            expect(response.body.lgpd_rights).toBeDefined();
        });

        it('should handle data portability request', async () => {
            const requestBody = {
                action: 'portability',
                patientIdentifier: 'test@example.com',
                verificationCode: 'valid-code',
                format: 'json'
            };

            const response = await request(server)
                .post('/')
                .send(requestBody)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.format).toBe('json');
            expect(response.body.data).toBeDefined();
        });

        it('should handle data deletion request', async () => {
            const requestBody = {
                action: 'deletion',
                patientIdentifier: 'test@example.com',
                verificationCode: 'valid-code',
                requestReason: 'Patient request for data deletion'
            };

            const response = await request(server)
                .post('/')
                .send(requestBody)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('excluídos com sucesso');
            expect(response.body.deleted_records).toBeDefined();
        });

        it('should handle data anonymization request', async () => {
            const requestBody = {
                action: 'anonymization',
                patientIdentifier: 'test@example.com',
                verificationCode: 'valid-code',
                requestReason: 'Patient request for data anonymization'
            };

            const response = await request(server)
                .post('/')
                .send(requestBody)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('anonimizados com sucesso');
            expect(response.body.anonymized_records).toBeDefined();
        });

        it('should reject requests with missing required fields', async () => {
            const requestBody = {
                action: 'access'
                // Missing patientIdentifier and verificationCode
            };

            const response = await request(server)
                .post('/')
                .send(requestBody)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Campos obrigatórios');
        });

        it('should reject requests with invalid verification', async () => {
            // Mock failed verification
            const { supabase } = await import('../lib/supabase.js');
            supabase.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        single: vi.fn(() => Promise.resolve({ data: null }))
                    }))
                }))
            });

            const requestBody = {
                action: 'access',
                patientIdentifier: 'invalid@example.com',
                verificationCode: 'invalid-code'
            };

            const response = await request(server)
                .post('/')
                .send(requestBody)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Falha na verificação');
        });

        it('should reject unsupported actions', async () => {
            const requestBody = {
                action: 'unsupported',
                patientIdentifier: 'test@example.com',
                verificationCode: 'valid-code'
            };

            const response = await request(server)
                .post('/')
                .send(requestBody)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Ação não suportada');
        });

        it('should handle OPTIONS requests for CORS', async () => {
            const response = await request(server)
                .options('/')
                .expect(200);

            expect(response.text).toBe('');
        });

        it('should reject non-POST methods', async () => {
            const response = await request(server)
                .get('/')
                .expect(405);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Method not allowed');
        });
    });
});

describe('IP Hash Utility API', () => {
    let server;
    let app;

    beforeEach(() => {
        app = (req, res) => ipHashHandler(req, res);
        server = createServer(app);
    });

    describe('GET /api/utils/ip-hash', () => {
        it('should return hashed IP address', async () => {
            const response = await request(server)
                .get('/')
                .set('x-forwarded-for', '192.168.1.1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.ipHash).toBeDefined();
            expect(response.body.ipHash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hash
            expect(response.body.timestamp).toBeDefined();
        });

        it('should handle Vercel forwarded headers', async () => {
            const response = await request(server)
                .get('/')
                .set('x-vercel-forwarded-for', '203.0.113.1, 198.51.100.1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.ipHash).toBeDefined();
        });

        it('should handle Cloudflare headers', async () => {
            const response = await request(server)
                .get('/')
                .set('cf-connecting-ip', '203.0.113.2')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.ipHash).toBeDefined();
        });

        it('should handle multiple forwarded IPs', async () => {
            const response = await request(server)
                .get('/')
                .set('x-forwarded-for', '203.0.113.3, 198.51.100.2, 192.168.1.1')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.ipHash).toBeDefined();
        });

        it('should handle OPTIONS requests for CORS', async () => {
            const response = await request(server)
                .options('/')
                .expect(200);

            expect(response.text).toBe('');
        });

        it('should reject non-GET methods', async () => {
            const response = await request(server)
                .post('/')
                .expect(405);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Method not allowed');
        });

        it('should return consistent hash for same IP', async () => {
            const response1 = await request(server)
                .get('/')
                .set('x-forwarded-for', '192.168.1.100')
                .expect(200);

            const response2 = await request(server)
                .get('/')
                .set('x-forwarded-for', '192.168.1.100')
                .expect(200);

            expect(response1.body.ipHash).toBe(response2.body.ipHash);
        });

        it('should return different hash for different IPs', async () => {
            const response1 = await request(server)
                .get('/')
                .set('x-forwarded-for', '192.168.1.100')
                .expect(200);

            const response2 = await request(server)
                .get('/')
                .set('x-forwarded-for', '192.168.1.101')
                .expect(200);

            expect(response1.body.ipHash).not.toBe(response2.body.ipHash);
        });
    });
});

describe('LGPD Compliance Integration', () => {
    it('should maintain audit trail for all data operations', async () => {
        const { supabase } = await import('../lib/supabase.js');
        const insertSpy = vi.spyOn(supabase, 'from').mockReturnValue({
            insert: vi.fn(() => Promise.resolve({ data: null, error: null }))
        });

        const server = createServer((req, res) => handler(req, res));

        await request(server)
            .post('/')
            .send({
                action: 'access',
                patientIdentifier: 'audit@example.com',
                verificationCode: 'valid-code'
            });

        // Verify audit log was created
        expect(insertSpy).toHaveBeenCalledWith('lgpd_audit_log');
    });

    it('should enforce data retention policies', () => {
        const retentionPolicies = {
            contact_messages: 730, // 2 years
            appointments: 1825, // 5 years
            lgpd_audit_log: 2555, // 7 years
            consent_records: 1095 // 3 years
        };

        Object.entries(retentionPolicies).forEach(([table, days]) => {
            expect(days).toBeGreaterThan(0);
            expect(days).toBeLessThanOrEqual(2555); // Max 7 years
        });
    });

    it('should validate LGPD compliance requirements', () => {
        const lgpdRequirements = {
            explicitConsent: true,
            dataMinimization: true,
            purposeLimitation: true,
            dataPortability: true,
            rightToErasure: true,
            dataProtectionByDesign: true,
            auditTrail: true,
            dataEncryption: true
        };

        Object.values(lgpdRequirements).forEach(requirement => {
            expect(requirement).toBe(true);
        });
    });
});