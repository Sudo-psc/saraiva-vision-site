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