/**
 * Resend Email Service Unit Tests
 * Tests for email service integration, template generation, and retry logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Resend SDK
const mockResend = {
    emails: {
        send: vi.fn()
    }
}

vi.mock('resend', () => ({
    Resend: vi.fn(() => mockResend)
}))

// Mock crypto for consistent IDs in tests
vi.mock('crypto', () => ({
    default: {
        randomBytes: vi.fn(() => Buffer.from('test-random-bytes-123456789012')),
        createHmac: vi.fn(() => ({
            update: vi.fn(() => ({
                digest: vi.fn(() => 'test-hmac-digest')
            }))
        })),
        timingSafeEqual: vi.fn(() => true)
    },
    randomBytes: vi.fn(() => Buffer.from('test-random-bytes-123456789012')),
    createHmac: vi.fn(() => ({
        update: vi.fn(() => ({
            digest: vi.fn(() => 'test-hmac-digest')
        }))
    })),
    timingSafeEqual: vi.fn(() => true)
}))

describe('Resend Email Service', () => {
    let emailService

    beforeEach(async () => {
        vi.clearAllMocks()
        
        // Set up environment variables
        process.env.RESEND_API_KEY = 'test-api-key'
        process.env.DOCTOR_EMAIL = 'doctor@saraivavision.com.br'
        
        // Dynamic import to ensure mocks are applied
        emailService = await import('../contact/emailService.js')
    })

    afterEach(() => {
        vi.resetAllMocks()
        delete process.env.RESEND_API_KEY
        delete process.env.DOCTOR_EMAIL
    })

    describe('sendContactEmail', () => {
        it('should send email successfully with valid contact data', async () => {
            const contactData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Gostaria de agendar uma consulta',
                id: 'test-contact-id'
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'resend-email-id-123' },
                error: null
            })

            const result = await emailService.sendContactEmail(contactData)

            expect(result.success).toBe(true)
            expect(result.messageId).toBe('resend-email-id-123')
            expect(result.contactId).toBe('test-contact-id')
            expect(result.timestamp).toBeDefined()

            expect(mockResend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: 'Saraiva Vision <contato@saraivavision.com.br>',
                    to: ['doctor@saraivavision.com.br'],
                    replyTo: 'joao@example.com',
                    subject: 'Novo contato do site - João Silva',
                    html: expect.stringContaining('João Silva'),
                    text: expect.stringContaining('João Silva'),
                    headers: expect.objectContaining({
                        'X-Priority': '1',
                        'X-Mailer': 'SaraivaVision-ContactForm',
                        'X-Contact-ID': 'test-contact-id'
                    })
                })
            )
        })

        it('should generate unique ID if not provided', async () => {
            const contactData = {
                name: 'Maria Santos',
                email: 'maria@example.com',
                phone: '11888888888',
                message: 'Consulta urgente'
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'resend-email-id-456' },
                error: null
            })

            const result = await emailService.sendContactEmail(contactData)

            expect(result.success).toBe(true)
            expect(result.contactId).toBe('746573742d72616e646f6d2d62797465732d313233343536373839303132')
            expect(mockResend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-Contact-ID': '746573742d72616e646f6d2d62797465732d313233343536373839303132'
                    })
                })
            )
        })

        it('should sanitize input data properly', async () => {
            const contactData = {
                name: 'João <script>alert("xss")</script> Silva',
                email: '  JOAO@EXAMPLE.COM  ',
                phone: '(11) 99999-9999',
                message: 'Mensagem com <script>javascript:void(0)</script> código malicioso'
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'resend-email-id-789' },
                error: null
            })

            const result = await emailService.sendContactEmail(contactData)

            expect(result.success).toBe(true)
            expect(mockResend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    replyTo: 'joao@example.com',
                    subject: expect.stringContaining('João  Silva'),
                    html: expect.not.stringContaining('<script>'),
                    text: expect.not.stringContaining('<script>')
                })
            )
        })

        it('should format Brazilian phone numbers correctly', async () => {
            const testCases = [
                { input: '11999999999', expected: '(11) 99999-9999' },
                { input: '1133334444', expected: '(11) 3333-4444' },
                { input: '(11) 99999-9999', expected: '(11) 99999-9999' },
                { input: '11 99999-9999', expected: '(11) 99999-9999' },
                { input: '+55 11 99999-9999', expected: '(11) 99999-9999' }
            ]

            for (const testCase of testCases) {
                const contactData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: testCase.input,
                    message: 'Test message'
                }

                mockResend.emails.send.mockResolvedValue({
                    data: { id: 'test-id' },
                    error: null
                })

                await emailService.sendContactEmail(contactData)

                expect(mockResend.emails.send).toHaveBeenCalledWith(
                    expect.objectContaining({
                        html: expect.stringContaining(testCase.expected),
                        text: expect.stringContaining(testCase.expected)
                    })
                )

                mockResend.emails.send.mockClear()
            }
        })

        it('should include LGPD compliance information in email', async () => {
            const contactData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Test message'
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await emailService.sendContactEmail(contactData)

            expect(mockResend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: expect.stringContaining('LGPD'),
                    text: expect.stringContaining('LGPD')
                })
            )
        })

        it('should handle Resend API errors', async () => {
            const contactData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Test message'
            }

            mockResend.emails.send.mockResolvedValue({
                data: null,
                error: { message: 'API key is invalid' }
            })

            const result = await emailService.sendContactEmail(contactData)

            expect(result.success).toBe(false)
            expect(result.error.code).toBe('EMAIL_SEND_FAILED')
            expect(result.error.details).toContain('API key is invalid')
        })

        it('should retry on transient failures', async () => {
            const contactData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Test message'
            }

            // First two attempts fail, third succeeds
            mockResend.emails.send
                .mockRejectedValueOnce(new Error('Network timeout'))
                .mockRejectedValueOnce(new Error('Service temporarily unavailable'))
                .mockResolvedValue({
                    data: { id: 'success-after-retry' },
                    error: null
                })

            const result = await emailService.sendContactEmail(contactData)

            expect(result.success).toBe(true)
            expect(result.messageId).toBe('success-after-retry')
            expect(mockResend.emails.send).toHaveBeenCalledTimes(3)
        })

        it('should fail after maximum retry attempts', async () => {
            const contactData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Test message'
            }

            mockResend.emails.send.mockRejectedValue(new Error('Persistent error'))

            const result = await emailService.sendContactEmail(contactData)

            expect(result.success).toBe(false)
            expect(result.error.code).toBe('EMAIL_SEND_FAILED')
            expect(result.error.message).toBe('Failed to send email after maximum retries')
            expect(mockResend.emails.send).toHaveBeenCalledTimes(3)
        })

        it('should handle network errors gracefully', async () => {
            const contactData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Test message'
            }

            mockResend.emails.send.mockRejectedValue(new Error('ENOTFOUND resend.com'))

            const result = await emailService.sendContactEmail(contactData)

            expect(result.success).toBe(false)
            expect(result.error.details).toContain('ENOTFOUND')
        })
    })

    describe('validateEmailServiceConfig', () => {
        it('should validate correct configuration', () => {
            process.env.RESEND_API_KEY = 'test-key'
            process.env.DOCTOR_EMAIL = 'doctor@example.com'

            const result = emailService.validateEmailServiceConfig()

            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
        })

        it('should detect missing RESEND_API_KEY', () => {
            delete process.env.RESEND_API_KEY
            process.env.DOCTOR_EMAIL = 'doctor@example.com'

            const result = emailService.validateEmailServiceConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors).toContain('RESEND_API_KEY environment variable is not set')
        })

        it('should detect missing DOCTOR_EMAIL', () => {
            process.env.RESEND_API_KEY = 'test-key'
            delete process.env.DOCTOR_EMAIL

            const result = emailService.validateEmailServiceConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors).toContain('DOCTOR_EMAIL environment variable is not set')
        })

        it('should detect invalid DOCTOR_EMAIL format', () => {
            process.env.RESEND_API_KEY = 'test-key'
            process.env.DOCTOR_EMAIL = 'invalid-email'

            const result = emailService.validateEmailServiceConfig()

            expect(result.isValid).toBe(false)
            expect(result.errors).toContain('DOCTOR_EMAIL environment variable is not a valid email address')
        })
    })

    describe('checkEmailServiceHealth', () => {
        it('should return healthy status with valid configuration', async () => {
            process.env.RESEND_API_KEY = 'test-key'
            process.env.DOCTOR_EMAIL = 'doctor@example.com'

            const result = await emailService.checkEmailServiceHealth()

            expect(result.healthy).toBe(true)
            expect(result.message).toBe('Email service is configured correctly')
            expect(result.config.doctorEmail).toBe('doctor@example.com')
            expect(result.config.resendConfigured).toBe(true)
        })

        it('should return unhealthy status with invalid configuration', async () => {
            delete process.env.RESEND_API_KEY
            delete process.env.DOCTOR_EMAIL

            const result = await emailService.checkEmailServiceHealth()

            expect(result.healthy).toBe(false)
            expect(result.error).toBe('Configuration error')
            expect(result.details).toContain('RESEND_API_KEY environment variable is not set')
            expect(result.details).toContain('DOCTOR_EMAIL environment variable is not set')
        })

        it('should handle template generation errors', async () => {
            process.env.RESEND_API_KEY = 'test-key'
            process.env.DOCTOR_EMAIL = 'doctor@example.com'

            // Mock template generation to throw error
            vi.doMock('../contact/emailService.js', () => ({
                ...emailService,
                createEmailObject: vi.fn(() => {
                    throw new Error('Template error')
                })
            }))

            // Re-import to get mocked version
            const mockedEmailService = await import('../contact/emailService.js')
            const result = await mockedEmailService.checkEmailServiceHealth()

            expect(result.healthy).toBe(false)
            expect(result.error).toBe('Health check failed')
        })
    })

    describe('Email Templates', () => {
        it('should generate HTML template with proper structure', async () => {
            const contactData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Consulta oftalmológica'
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await emailService.sendContactEmail(contactData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            
            expect(emailCall.html).toContain('<!DOCTYPE html>')
            expect(emailCall.html).toContain('João Silva')
            expect(emailCall.html).toContain('joao@example.com')
            expect(emailCall.html).toContain('(11) 99999-9999')
            expect(emailCall.html).toContain('Consulta oftalmológica')
            expect(emailCall.html).toContain('Saraiva Vision')
        })

        it('should generate text template as fallback', async () => {
            const contactData = {
                name: 'Maria Santos',
                email: 'maria@example.com',
                phone: '11888888888',
                message: 'Emergência oftalmológica'
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await emailService.sendContactEmail(contactData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            
            expect(emailCall.text).toContain('NOVO CONTATO - SARAIVA VISION')
            expect(emailCall.text).toContain('Maria Santos')
            expect(emailCall.text).toContain('maria@example.com')
            expect(emailCall.text).toContain('(11) 88888-8888')
            expect(emailCall.text).toContain('Emergência oftalmológica')
        })

        it('should include timestamp in both HTML and text templates', async () => {
            const fixedDate = new Date('2024-01-15T10:30:00Z')
            const contactData = {
                name: 'Test User',
                email: 'test@example.com',
                phone: '11999999999',
                message: 'Test message',
                timestamp: fixedDate
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await emailService.sendContactEmail(contactData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            const expectedDate = fixedDate.toLocaleString('pt-BR')
            
            expect(emailCall.html).toContain(expectedDate)
            expect(emailCall.text).toContain(expectedDate)
        })
    })

    describe('Input Sanitization', () => {
        it('should remove script tags from name', async () => {
            const contactData = {
                name: 'João <script>alert("xss")</script> Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Test message'
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await emailService.sendContactEmail(contactData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            expect(emailCall.html).not.toContain('<script>')
            expect(emailCall.text).not.toContain('<script>')
        })

        it('should remove javascript: protocols', async () => {
            const contactData = {
                name: 'Test User',
                email: 'test@example.com',
                phone: '11999999999',
                message: 'Click javascript:alert("xss") here'
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await emailService.sendContactEmail(contactData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            expect(emailCall.html).not.toContain('javascript:')
            expect(emailCall.text).not.toContain('javascript:')
        })

        it('should handle invalid email addresses', async () => {
            const contactData = {
                name: 'Test User',
                email: 'invalid-email-format',
                phone: '11999999999',
                message: 'Test message'
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await emailService.sendContactEmail(contactData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            expect(emailCall.replyTo).toBe('')
        })

        it('should handle non-string inputs gracefully', async () => {
            const contactData = {
                name: null,
                email: undefined,
                phone: 12345,
                message: ['array', 'message']
            }

            mockResend.emails.send.mockResolvedValue({
                data: { id: 'test-id' },
                error: null
            })

            await emailService.sendContactEmail(contactData)

            const emailCall = mockResend.emails.send.mock.calls[0][0]
            expect(emailCall.subject).toContain('Novo contato do site - ')
            expect(emailCall.replyTo).toBe('')
        })
    })
})