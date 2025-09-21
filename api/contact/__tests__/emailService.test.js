import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Resend before importing the module
const mockSend = vi.fn();
vi.mock('resend', () => ({
    Resend: vi.fn().mockImplementation(() => ({
        emails: {
            send: mockSend
        }
    }))
}));

// Import after mocking
const {
    sendContactEmail,
    validateEmailServiceConfig,
    checkEmailServiceHealth
} = await import('../emailService.js');

describe('Email Service', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.clearAllMocks();
        process.env = { ...originalEnv };
        process.env.RESEND_API_KEY = 'test-api-key';
        process.env.DOCTOR_EMAIL = 'philipe_cruz@outlook.com';
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('sendContactEmail', () => {
        const validContactData = {
            name: 'João Silva',
            email: 'joao@example.com',
            phone: '11999887766',
            message: 'Gostaria de agendar uma consulta para avaliação de catarata.',
            timestamp: new Date('2024-01-15T10:30:00Z')
        };

        test('should send email successfully with valid data', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-123' },
                error: null
            });

            const result = await sendContactEmail(validContactData);

            expect(result.success).toBe(true);
            expect(result.messageId).toBe('email-123');
            expect(result.contactId).toBeDefined();
            expect(mockSend).toHaveBeenCalledTimes(1);

            const emailCall = mockSend.mock.calls[0][0];
            expect(emailCall.from).toBe('Saraiva Vision <contato@saraivavision.com.br>');
            expect(emailCall.to).toEqual(['philipe_cruz@outlook.com']);
            expect(emailCall.replyTo).toBe('joao@example.com');
            expect(emailCall.subject).toBe('Novo contato do site - João Silva');
            expect(emailCall.html).toContain('João Silva');
            expect(emailCall.text).toContain('João Silva');
        });

        test('should format Brazilian phone numbers correctly', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-123' },
                error: null
            });

            const contactWithPhone = {
                ...validContactData,
                phone: '11999887766' // 11 digits
            };

            await sendContactEmail(contactWithPhone);

            const emailCall = mockSend.mock.calls[0][0];
            expect(emailCall.html).toContain('(11) 99988-7766');
            expect(emailCall.text).toContain('(11) 99988-7766');
        });

        test('should format landline phone numbers correctly', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-123' },
                error: null
            });

            const contactWithLandline = {
                ...validContactData,
                phone: '1133334444' // 10 digits
            };

            await sendContactEmail(contactWithLandline);

            const emailCall = mockSend.mock.calls[0][0];
            expect(emailCall.html).toContain('(11) 3333-4444');
            expect(emailCall.text).toContain('(11) 3333-4444');
        });

        test('should sanitize input data to prevent XSS', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-123' },
                error: null
            });

            const maliciousData = {
                ...validContactData,
                name: '<script>alert("xss")</script>João Silva',
                message: 'Normal message with <script>alert("xss")</script> injection'
            };

            await sendContactEmail(maliciousData);

            const emailCall = mockSend.mock.calls[0][0];
            expect(emailCall.html).not.toContain('<script>');
            expect(emailCall.text).not.toContain('<script>');
            expect(emailCall.html).toContain('João Silva');
        });

        test('should include LGPD compliance notice in templates', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-123' },
                error: null
            });

            await sendContactEmail(validContactData);

            const emailCall = mockSend.mock.calls[0][0];
            expect(emailCall.html).toContain('LGPD');
            expect(emailCall.html).toContain('consentimento explícito');
            expect(emailCall.text).toContain('LGPD');
            expect(emailCall.text).toContain('consentimento explícito');
        });

        test('should include proper medical branding and clinic information', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-123' },
                error: null
            });

            await sendContactEmail(validContactData);

            const emailCall = mockSend.mock.calls[0][0];
            expect(emailCall.html).toContain('Saraiva Vision');
            expect(emailCall.html).toContain('Clínica Oftalmológica');
            expect(emailCall.text).toContain('Saraiva Vision');
            expect(emailCall.headers['X-Mailer']).toBe('SaraivaVision-ContactForm');
        });

        test('should retry on API failure with exponential backoff', async () => {
            mockSend
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    data: { id: 'email-123' },
                    error: null
                });

            const startTime = Date.now();
            const result = await sendContactEmail(validContactData);
            const endTime = Date.now();

            expect(result.success).toBe(true);
            expect(mockSend).toHaveBeenCalledTimes(3);
            // Should have some delay due to retries
            expect(endTime - startTime).toBeGreaterThan(1000);
        });

        test('should fail after maximum retry attempts', async () => {
            mockSend.mockRejectedValue(new Error('Persistent network error'));

            const result = await sendContactEmail(validContactData);

            expect(result.success).toBe(false);
            expect(result.error.code).toBe('EMAIL_SEND_FAILED');
            expect(result.error.message).toBe('Failed to send email after maximum retries');
            expect(mockSend).toHaveBeenCalledTimes(3); // Max attempts
        });

        test('should handle Resend API errors', async () => {
            mockSend.mockResolvedValue({
                data: null,
                error: { message: 'Invalid API key' }
            });

            const result = await sendContactEmail(validContactData);

            expect(result.success).toBe(false);
            expect(result.error.code).toBe('EMAIL_SEND_FAILED');
            expect(mockSend).toHaveBeenCalledTimes(3); // Should retry
        });

        test('should generate unique contact IDs', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-123' },
                error: null
            });

            const result1 = await sendContactEmail(validContactData);
            const result2 = await sendContactEmail(validContactData);

            expect(result1.contactId).toBeDefined();
            expect(result2.contactId).toBeDefined();
            expect(result1.contactId).not.toBe(result2.contactId);
        });
    });

    describe('validateEmailServiceConfig', () => {
        test('should validate correct configuration', () => {
            const result = validateEmailServiceConfig();

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('should detect missing RESEND_API_KEY', () => {
            delete process.env.RESEND_API_KEY;

            const result = validateEmailServiceConfig();

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('RESEND_API_KEY environment variable is not set');
        });

        test('should detect missing DOCTOR_EMAIL', () => {
            delete process.env.DOCTOR_EMAIL;

            const result = validateEmailServiceConfig();

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('DOCTOR_EMAIL environment variable is not set');
        });

        test('should detect invalid DOCTOR_EMAIL format', () => {
            process.env.DOCTOR_EMAIL = 'invalid-email';

            const result = validateEmailServiceConfig();

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('DOCTOR_EMAIL environment variable is not a valid email address');
        });
    });

    describe('checkEmailServiceHealth', () => {
        test('should return healthy status with valid configuration', async () => {
            const result = await checkEmailServiceHealth();

            expect(result.healthy).toBe(true);
            expect(result.message).toBe('Email service is configured correctly');
            expect(result.config.doctorEmail).toBe('philipe_cruz@outlook.com');
            expect(result.config.resendConfigured).toBe(true);
        });

        test('should return unhealthy status with invalid configuration', async () => {
            delete process.env.RESEND_API_KEY;

            const result = await checkEmailServiceHealth();

            expect(result.healthy).toBe(false);
            expect(result.error).toBe('Configuration error');
            expect(result.details).toContain('RESEND_API_KEY environment variable is not set');
        });

        test('should handle template generation errors', async () => {
            // Mock a scenario where template generation fails
            process.env.DOCTOR_EMAIL = 'invalid-email';

            const result = await checkEmailServiceHealth();

            expect(result.healthy).toBe(false);
        });
    });

    describe('Template Data Mapping', () => {
        test('should properly map and format contact data', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-123' },
                error: null
            });

            const contactData = {
                name: '  Maria Santos  ', // Test trimming
                email: '  MARIA@EXAMPLE.COM  ', // Test email normalization
                phone: '11999887766', // Test phone formatting - 11 digits
                message: 'Mensagem com\nquebras de linha\ne espaços extras   ',
                timestamp: new Date('2024-01-15T10:30:00Z')
            };

            await sendContactEmail(contactData);

            const emailCall = mockSend.mock.calls[0][0];

            // Check that data is properly formatted in templates
            expect(emailCall.html).toContain('Maria Santos');
            expect(emailCall.replyTo).toBe('maria@example.com');
            expect(emailCall.html).toContain('(11) 99988-7766');
            expect(emailCall.text).toContain('15/01/2024'); // Brazilian date format
        });

        test('should preserve message formatting with line breaks', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-123' },
                error: null
            });

            const contactData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999887766',
                message: 'Primeira linha\nSegunda linha\n\nTerceira linha após linha vazia',
                timestamp: new Date()
            };

            await sendContactEmail(contactData);

            const emailCall = mockSend.mock.calls[0][0];

            // HTML template should preserve line breaks
            expect(emailCall.html).toContain('white-space: pre-wrap');
            // Text template should preserve line breaks
            expect(emailCall.text).toContain('Primeira linha\nSegunda linha\n\nTerceira linha');
        });
    });

    describe('Professional Medical Standards', () => {
        test('should include medical practice information in templates', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-123' },
                error: null
            });

            await sendContactEmail({
                name: 'Paciente Teste',
                email: 'paciente@example.com',
                phone: '11999887766',
                message: 'Consulta oftalmológica',
                timestamp: new Date()
            });

            const emailCall = mockSend.mock.calls[0][0];

            // Should include professional medical context
            expect(emailCall.html).toContain('Informações do Paciente');
            expect(emailCall.html).toContain('Clínica Oftalmológica');
            expect(emailCall.subject).toContain('Novo contato do site');

            // Should have proper email headers for medical communications
            expect(emailCall.headers['X-Priority']).toBe('1');
            expect(emailCall.headers['X-Contact-ID']).toBeDefined();
        });

        test('should format timestamps in Brazilian locale', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-123' },
                error: null
            });

            const testDate = new Date('2024-01-15T14:30:00Z');

            await sendContactEmail({
                name: 'Paciente Teste',
                email: 'paciente@example.com',
                phone: '11999887766',
                message: 'Teste de data',
                timestamp: testDate
            });

            const emailCall = mockSend.mock.calls[0][0];

            // Should format date in Brazilian format
            expect(emailCall.html).toContain('15/01/2024');
            expect(emailCall.text).toContain('15/01/2024');
        });
    });
});

describe('Advanced Email Service Tests', () => {
    describe('Template Rendering Edge Cases', () => {
        it('should handle very long messages with proper formatting', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-long-message' },
                error: null
            });

            const longMessage = 'Este é um teste de mensagem muito longa. '.repeat(50) +
                'Gostaria de agendar uma consulta oftalmológica para avaliação completa da minha visão.';

            const contactData = {
                name: 'Paciente Teste',
                email: 'paciente@example.com',
                phone: '11999887766',
                message: longMessage,
                timestamp: new Date()
            };

            await sendContactEmail(contactData);

            const emailCall = mockSend.mock.calls[0][0];

            // Should handle long messages without truncation
            expect(emailCall.html).toContain(longMessage);
            expect(emailCall.text).toContain(longMessage);

            // Should maintain proper formatting
            expect(emailCall.html).toContain('white-space: pre-wrap');
        });

        it('should handle special characters in patient names', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-special-chars' },
                error: null
            });

            const specialNames = [
                'José María Ñoño',
                'François Müller',
                'Ana-Luiza Costa',
                'Dr. João Carlos Jr.',
                'Maria José da Silva'
            ];

            for (const name of specialNames) {
                const contactData = {
                    name,
                    email: 'test@example.com',
                    phone: '11999887766',
                    message: 'Mensagem de teste com caracteres especiais.',
                    timestamp: new Date()
                };

                await sendContactEmail(contactData);

                const emailCall = mockSend.mock.calls[mockSend.mock.calls.length - 1][0];
                expect(emailCall.html).toContain(name);
                expect(emailCall.subject).toContain(name);
            }
        });

        it('should format different phone number patterns correctly', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-phone-formats' },
                error: null
            });

            const phoneFormats = [
                { input: '11999887766', expected: '(11) 99988-7766' },
                { input: '1133334444', expected: '(11) 3333-4444' },
                { input: '+5511999887766', expected: '+5511999887766' }, // This doesn't get formatted as it has country code
                { input: '+551133334444', expected: '+551133334444' }, // This doesn't get formatted as it has country code
                { input: '(11) 99988-7766', expected: '(11) 99988-7766' },
                { input: '11 99988-7766', expected: '(11) 99988-7766' }
            ];

            for (const { input, expected } of phoneFormats) {
                const contactData = {
                    name: 'Teste Telefone',
                    email: 'teste@example.com',
                    phone: input,
                    message: 'Teste de formatação de telefone.',
                    timestamp: new Date()
                };

                await sendContactEmail(contactData);

                const emailCall = mockSend.mock.calls[mockSend.mock.calls.length - 1][0];
                expect(emailCall.html).toContain(expected);
                expect(emailCall.text).toContain(expected);
            }
        });
    });

    describe('Error Recovery and Resilience', () => {
        it('should handle intermittent network failures', async () => {
            // Simulate intermittent failures
            mockSend
                .mockRejectedValueOnce(new Error('ECONNRESET'))
                .mockRejectedValueOnce(new Error('ETIMEDOUT'))
                .mockResolvedValueOnce({
                    data: { id: 'email-recovered' },
                    error: null
                });

            const contactData = {
                name: 'Resilience Test',
                email: 'resilience@example.com',
                phone: '11999887766',
                message: 'Testing error recovery mechanism.',
                timestamp: new Date()
            };

            const result = await sendContactEmail(contactData);

            expect(result.success).toBe(true);
            expect(result.messageId).toBe('email-recovered');
            expect(mockSend).toHaveBeenCalledTimes(3); // 2 failures + 1 success
        });

        it('should handle API rate limiting from Resend', async () => {
            const rateLimitError = new Error('Rate limit exceeded');
            rateLimitError.status = 429;

            mockSend
                .mockRejectedValueOnce(rateLimitError)
                .mockResolvedValueOnce({
                    data: { id: 'email-after-rate-limit' },
                    error: null
                });

            const contactData = {
                name: 'Rate Limit Test',
                email: 'ratelimit@example.com',
                phone: '11999887766',
                message: 'Testing rate limit handling.',
                timestamp: new Date()
            };

            const result = await sendContactEmail(contactData);

            expect(result.success).toBe(true);
            expect(mockSend).toHaveBeenCalledTimes(2);
        });

        it('should fail gracefully after maximum retries', async () => {
            mockSend.mockRejectedValue(new Error('Persistent failure'));

            const contactData = {
                name: 'Failure Test',
                email: 'failure@example.com',
                phone: '11999887766',
                message: 'Testing maximum retry behavior.',
                timestamp: new Date()
            };

            const result = await sendContactEmail(contactData);

            expect(result.success).toBe(false);
            expect(result.error.code).toBe('EMAIL_SEND_FAILED');
            expect(mockSend).toHaveBeenCalledTimes(3); // Maximum retries
        });
    });

    describe('Template Content Validation', () => {
        it('should include all required medical practice information', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-medical-info' },
                error: null
            });

            const contactData = {
                name: 'Paciente Médico',
                email: 'medico@example.com',
                phone: '11999887766',
                message: 'Consulta sobre procedimento oftalmológico.',
                timestamp: new Date('2024-01-15T10:30:00Z')
            };

            await sendContactEmail(contactData);

            const emailCall = mockSend.mock.calls[0][0];

            // Verify medical practice branding
            expect(emailCall.html).toContain('Saraiva Vision');
            expect(emailCall.html).toContain('Clínica Oftalmológica');

            // Verify professional headers
            expect(emailCall.headers['X-Mailer']).toBe('SaraivaVision-ContactForm');
            expect(emailCall.headers['X-Priority']).toBe('1');
            expect(emailCall.headers['X-Contact-ID']).toMatch(/^[a-f0-9]{32}$/);

            // Verify structured patient information
            expect(emailCall.html).toContain('Informações do Paciente');
            expect(emailCall.html).toContain('Data/Hora:');
            expect(emailCall.html).toContain('15/01/2024');
        });

        it('should include LGPD compliance information', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-lgpd' },
                error: null
            });

            const contactData = {
                name: 'Teste LGPD',
                email: 'lgpd@example.com',
                phone: '11999887766',
                message: 'Teste de conformidade LGPD.',
                timestamp: new Date()
            };

            await sendContactEmail(contactData);

            const emailCall = mockSend.mock.calls[0][0];

            // Verify LGPD compliance notice
            expect(emailCall.html).toContain('LGPD');
            expect(emailCall.html).toContain('consentimento explícito');
            expect(emailCall.html).toContain('Lei Geral de Proteção de Dados');

            // Verify in text version too
            expect(emailCall.text).toContain('LGPD');
            expect(emailCall.text).toContain('consentimento explícito');
        });

        it('should format timestamps in Brazilian locale', async () => {
            mockSend.mockResolvedValue({
                data: { id: 'email-timestamp' },
                error: null
            });

            const testDates = [
                new Date('2024-01-15T14:30:00Z'),
                new Date('2024-12-25T09:15:00Z'),
                new Date('2024-06-10T18:45:00Z')
            ];

            for (const timestamp of testDates) {
                const contactData = {
                    name: 'Teste Data',
                    email: 'data@example.com',
                    phone: '11999887766',
                    message: 'Teste de formatação de data.',
                    timestamp
                };

                await sendContactEmail(contactData);

                const emailCall = mockSend.mock.calls[mockSend.mock.calls.length - 1][0];

                // Should format in Brazilian format (DD/MM/YYYY)
                const expectedDate = timestamp.toLocaleDateString('pt-BR');
                expect(emailCall.html).toContain(expectedDate);
                expect(emailCall.text).toContain(expectedDate);
            }
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle concurrent email sending efficiently', async () => {
            const concurrentEmails = 10;
            const promises = [];

            // Mock successful responses for all emails
            mockSend.mockImplementation(async () => {
                // Simulate realistic API delay
                await new Promise(resolve => setTimeout(resolve, 100));
                return {
                    data: { id: `concurrent-${Date.now()}-${Math.random()}` },
                    error: null
                };
            });

            // Create concurrent email sending promises
            for (let i = 0; i < concurrentEmails; i++) {
                const contactData = {
                    name: `Concurrent User ${i}`,
                    email: `user${i}@example.com`,
                    phone: '11999887766',
                    message: `Concurrent message ${i} for testing.`,
                    timestamp: new Date()
                };

                promises.push(sendContactEmail(contactData));
            }

            const startTime = Date.now();
            const results = await Promise.all(promises);
            const totalTime = Date.now() - startTime;

            // All should succeed
            results.forEach(result => {
                expect(result.success).toBe(true);
                expect(result.messageId).toBeDefined();
            });

            // Should complete concurrently (faster than sequential)
            expect(totalTime).toBeLessThan(concurrentEmails * 150); // Allow some overhead
            expect(mockSend).toHaveBeenCalledTimes(concurrentEmails);
        });

        it('should generate unique contact IDs under load', async () => {
            const iterations = 100;
            const contactIds = new Set();

            mockSend.mockImplementation(async () => ({
                data: { id: `load-test-${Date.now()}` },
                error: null
            }));

            // Generate many emails quickly
            const promises = [];
            for (let i = 0; i < iterations; i++) {
                const contactData = {
                    name: `Load Test ${i}`,
                    email: `load${i}@example.com`,
                    phone: '11999887766',
                    message: `Load test message ${i}.`,
                    timestamp: new Date()
                };

                promises.push(sendContactEmail(contactData));
            }

            const results = await Promise.all(promises);

            // Collect all contact IDs
            results.forEach(result => {
                expect(result.success).toBe(true);
                contactIds.add(result.contactId);
            });

            // All contact IDs should be unique
            expect(contactIds.size).toBe(iterations);
        });
    });

    describe('Configuration Validation', () => {
        it('should detect missing environment variables', () => {
            delete process.env.RESEND_API_KEY;

            const result = validateEmailServiceConfig();

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('RESEND_API_KEY environment variable is not set');
        });

        it('should validate doctor email format', () => {
            process.env.DOCTOR_EMAIL = 'invalid-email-format';

            const result = validateEmailServiceConfig();

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('DOCTOR_EMAIL environment variable is not a valid email address');
        });

        it('should pass with valid configuration', () => {
            process.env.RESEND_API_KEY = 'test-key';
            process.env.DOCTOR_EMAIL = 'valid@example.com';

            const result = validateEmailServiceConfig();

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('Health Check Functionality', () => {
        it('should report healthy status with valid config', async () => {
            process.env.RESEND_API_KEY = 'test-key';
            process.env.DOCTOR_EMAIL = 'test@example.com';

            const health = await checkEmailServiceHealth();

            expect(health.healthy).toBe(true);
            expect(health.message).toBe('Email service is configured correctly');
            expect(health.config.doctorEmail).toBe('test@example.com');
            expect(health.config.resendConfigured).toBe(true);
        });

        it('should report unhealthy status with invalid config', async () => {
            delete process.env.RESEND_API_KEY;

            const health = await checkEmailServiceHealth();

            expect(health.healthy).toBe(false);
            expect(health.error).toBe('Configuration error');
            expect(health.details).toEqual(expect.arrayContaining([
                expect.stringContaining('RESEND_API_KEY')
            ]));
        });
    });
});