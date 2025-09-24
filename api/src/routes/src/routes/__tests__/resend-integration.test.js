/**
 * Resend Integration Tests
 * End-to-end tests for the complete Resend contact form flow
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMocks } from 'node-mocks-http'

// Mock external dependencies
const mockResend = {
    emails: {
        send: vi.fn()
    }
}

const mockSupabaseAdmin = {
    from: vi.fn(() => ({
        insert: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: [{ id: 'test-submission-id' }], error: null }))
        })),
        update: vi.fn(() => ({
            eq: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({ 
                    data: { 
                        id: 'test-message-id', 
                        status: 'delivered', 
                        message_type: 'contact',
                        recipient: 'test@example.com'
                    }, 
                    error: null 
                }))
            }))
        }))
    }))
}

const mockRecaptcha = {
    verifyRecaptcha: vi.fn()
}

const mockRateLimit = {
    checkRateLimit: vi.fn()
}

const mockOutbox = {
    addToOutbox: vi.fn()
}

vi.mock('resend', () => ({
    Resend: vi.fn(() => mockResend)
}))

vi.mock('../../../../../../..../../../../src/lib/supabase.ts', () => ({
    supabaseAdmin: mockSupabaseAdmin
}))

vi.mock('../contact/recaptcha.js', () => mockRecaptcha)
vi.mock('../contact/rateLimiter.js', () => mockRateLimit)
vi.mock('../contact/outboxService.js', () => mockOutbox)

describe('Resend Integration Tests', () => {
    let contactHandler

    beforeEach(async () => {
        vi.clearAllMocks()
        
        // Set up environment variables
        process.env.RESEND_API_KEY = 'test-api-key'
        process.env.DOCTOR_EMAIL = 'doctor@saraivavision.com.br'
        process.env.RESEND_WEBHOOK_SECRET = 'test-webhook-secret'
        process.env.RECAPTCHA_SECRET_KEY = 'test-recaptcha-secret'
        
        // Set up default mock responses
        mockRecaptcha.verifyRecaptcha.mockResolvedValue({ success: true, score: 0.9 })
        mockRateLimit.checkRateLimit.mockResolvedValue(true)
        mockResend.emails.send.mockResolvedValue({
            data: { id: 'resend-email-id-123' },
            error: null
        })
        
        // Dynamic import to ensure mocks are applied
        const module = await import('../contact/index.js')
        contactHandler = module.default
    })

    afterEach(() => {
        vi.resetAllMocks()
        // Clean up environment variables
        delete process.env.RESEND_API_KEY
        delete process.env.DOCTOR_EMAIL
        delete process.env.RESEND_WEBHOOK_SECRET
        delete process.env.RECAPTCHA_SECRET_KEY
    })

    describe('Complete Contact Form Submission Flow', () => {
        it('should handle successful end-to-end contact form submission', async () => {
            const validContactData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Gostaria de agendar uma consulta oftalmológica',
                consent: true,
                token: 'valid-recaptcha-token',
                action: 'contact'
            }

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1',
                    'user-agent': 'Mozilla/5.0 (compatible test)'
                },
                body: validContactData
            })

            await contactHandler(req, res)

            // Verify response
            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            expect(response.success).toBe(true)
            expect(response.message).toBe('Mensagem enviada com sucesso!')

            // Verify all services were called correctly
            expect(mockRecaptcha.verifyRecaptcha).toHaveBeenCalledWith(
                'valid-recaptcha-token',
                'contact'
            )
            expect(mockRateLimit.checkRateLimit).toHaveBeenCalledWith('192.168.1.1')
            expect(mockResend.emails.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    from: 'Saraiva Vision <contato@saraivavision.com.br>',
                    to: ['doctor@saraivavision.com.br'],
                    replyTo: 'joao@example.com',
                    subject: 'Novo contato do site - João Silva'
                })
            )
            expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('contact_submissions')
        })

        it('should handle email service failure with outbox fallback', async () => {
            const validContactData = {
                name: 'Maria Santos',
                email: 'maria@example.com',
                phone: '11888888888',
                message: 'Consulta urgente',
                consent: true,
                token: 'valid-recaptcha-token',
                action: 'contact'
            }

            // Mock email service failure
            mockResend.emails.send.mockRejectedValue(new Error('Email service unavailable'))
            mockOutbox.addToOutbox.mockResolvedValue({ success: true, id: 'outbox-id-123' })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: validContactData
            })

            await contactHandler(req, res)

            // Should still return success due to outbox fallback
            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            expect(response.success).toBe(true)

            // Verify outbox was used
            expect(mockOutbox.addToOutbox).toHaveBeenCalledWith(
                expect.objectContaining({
                    recipient: 'doctor@saraivavision.com.br',
                    message_type: 'contact_form',
                    priority: 'high'
                })
            )
        })

        it('should reject submission with invalid reCAPTCHA', async () => {
            const invalidContactData = {
                name: 'Potential Bot',
                email: 'bot@spam.com',
                phone: '11999999999',
                message: 'Spam message',
                consent: true,
                token: 'invalid-recaptcha-token',
                action: 'contact'
            }

            mockRecaptcha.verifyRecaptcha.mockResolvedValue({ 
                success: false, 
                score: 0.1,
                'error-codes': ['invalid-input-response']
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: invalidContactData
            })

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(400)
            const response = JSON.parse(res._getData())
            expect(response.success).toBe(false)
            expect(response.error).toContain('reCAPTCHA')

            // Verify email was not sent
            expect(mockResend.emails.send).not.toHaveBeenCalled()
        })

        it('should handle rate limiting correctly', async () => {
            const contactData = {
                name: 'Rate Limited User',
                email: 'user@example.com',
                phone: '11999999999',
                message: 'Too many requests',
                consent: true,
                token: 'valid-recaptcha-token',
                action: 'contact'
            }

            mockRateLimit.checkRateLimit.mockResolvedValue(false)

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: contactData
            })

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(429)
            const response = JSON.parse(res._getData())
            expect(response.success).toBe(false)
            expect(response.error).toContain('Muitas tentativas')

            // Verify email was not sent
            expect(mockResend.emails.send).not.toHaveBeenCalled()
        })

        it('should validate all required fields', async () => {
            const incompleteData = {
                name: '',
                email: 'invalid-email',
                phone: '',
                message: 'a', // too short
                consent: false,
                token: 'valid-recaptcha-token',
                action: 'contact'
            }

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: incompleteData
            })

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(400)
            const response = JSON.parse(res._getData())
            expect(response.success).toBe(false)
            expect(response.error).toContain('validation')

            // Verify email was not sent
            expect(mockResend.emails.send).not.toHaveBeenCalled()
        })

        it('should handle database logging failures gracefully', async () => {
            const validContactData = {
                name: 'Test User',
                email: 'test@example.com',
                phone: '11999999999',
                message: 'Database test message',
                consent: true,
                token: 'valid-recaptcha-token',
                action: 'contact'
            }

            // Mock database failure
            mockSupabaseAdmin.from.mockReturnValue({
                insert: vi.fn(() => ({
                    select: vi.fn(() => Promise.resolve({ 
                        data: null, 
                        error: new Error('Database connection failed') 
                    }))
                }))
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: validContactData
            })

            await contactHandler(req, res)

            // Should still succeed if email was sent successfully
            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            expect(response.success).toBe(true)

            // Verify email was still sent
            expect(mockResend.emails.send).toHaveBeenCalled()
        })
    })

    describe('Webhook Integration Flow', () => {
        let webhookHandler

        beforeEach(async () => {
            const webhookModule = await import('../webhooks/resend.js')
            webhookHandler = webhookModule.default
        })

        it('should process webhook events and update message status', async () => {
            // First, simulate a contact form submission
            const contactData = {
                name: 'Webhook Test User',
                email: 'webhook@example.com',
                phone: '11999999999',
                message: 'Testing webhook integration',
                consent: true,
                token: 'valid-recaptcha-token',
                action: 'contact'
            }

            const { req: contactReq, res: contactRes } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: contactData
            })

            await contactHandler(contactReq, contactRes)
            expect(contactRes._getStatusCode()).toBe(200)

            // Now simulate webhook event for delivery confirmation
            const webhookPayload = {
                type: 'email.delivered',
                data: {
                    email_id: 'resend-email-id-123',
                    headers: {
                        'X-Message-ID': 'test-message-id'
                    }
                }
            }

            const { req: webhookReq, res: webhookRes } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(JSON.stringify(webhookPayload)),
                    'content-type': 'application/json'
                },
                body: webhookPayload
            })

            await webhookHandler(webhookReq, webhookRes)

            expect(webhookRes._getStatusCode()).toBe(200)
            const webhookResponse = JSON.parse(webhookRes._getData())
            expect(webhookResponse.success).toBe(true)
            expect(webhookResponse.data.status).toBe('delivered')
        })

        it('should handle bounced email webhook events', async () => {
            const webhookPayload = {
                type: 'email.bounced',
                data: {
                    email_id: 'resend-email-bounced-123',
                    bounce_type: 'hard',
                    tags: ['msg_bounced-message-id']
                }
            }

            const { req: webhookReq, res: webhookRes } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(JSON.stringify(webhookPayload)),
                    'content-type': 'application/json'
                },
                body: webhookPayload
            })

            await webhookHandler(webhookReq, webhookRes)

            expect(webhookRes._getStatusCode()).toBe(200)
            const webhookResponse = JSON.parse(webhookRes._getData())
            expect(webhookResponse.success).toBe(true)
            expect(webhookResponse.data.status).toBe('failed')

            // Verify database update was called
            expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('message_outbox')
        })
    })

    describe('Error Recovery and Resilience', () => {
        it('should handle complete Resend service outage', async () => {
            const contactData = {
                name: 'Outage Test User',
                email: 'outage@example.com',
                phone: '11999999999',
                message: 'Service outage test',
                consent: true,
                token: 'valid-recaptcha-token',
                action: 'contact'
            }

            // Simulate complete Resend service outage
            mockResend.emails.send.mockRejectedValue(new Error('ENOTFOUND resend.com'))
            mockOutbox.addToOutbox.mockResolvedValue({ success: true, id: 'outage-outbox-id' })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: contactData
            })

            await contactHandler(req, res)

            // Should gracefully fallback to outbox
            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            expect(response.success).toBe(true)

            expect(mockOutbox.addToOutbox).toHaveBeenCalled()
        })

        it('should handle partial service degradation', async () => {
            const contactData = {
                name: 'Degradation Test User',
                email: 'degradation@example.com',
                phone: '11999999999',
                message: 'Service degradation test',
                consent: true,
                token: 'valid-recaptcha-token',
                action: 'contact'
            }

            // Simulate slow but working service
            mockResend.emails.send.mockImplementation(() => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            data: { id: 'slow-email-id' },
                            error: null
                        })
                    }, 100)
                })
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: contactData
            })

            const startTime = Date.now()
            await contactHandler(req, res)
            const endTime = Date.now()

            expect(res._getStatusCode()).toBe(200)
            expect(endTime - startTime).toBeGreaterThan(100)
            expect(mockResend.emails.send).toHaveBeenCalled()
        })

        it('should handle concurrent submissions efficiently', async () => {
            const createSubmission = (id) => ({
                name: `Concurrent User ${id}`,
                email: `user${id}@example.com`,
                phone: '11999999999',
                message: `Concurrent test message ${id}`,
                consent: true,
                token: 'valid-recaptcha-token',
                action: 'contact'
            })

            // Submit 5 concurrent requests
            const promises = []
            for (let i = 1; i <= 5; i++) {
                const { req, res } = createMocks({
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'x-forwarded-for': `192.168.1.${i}`
                    },
                    body: createSubmission(i)
                })

                promises.push(contactHandler(req, res).then(() => res))
            }

            const results = await Promise.all(promises)

            // All submissions should succeed
            results.forEach(res => {
                expect(res._getStatusCode()).toBe(200)
                const response = JSON.parse(res._getData())
                expect(response.success).toBe(true)
            })

            // All emails should have been attempted
            expect(mockResend.emails.send).toHaveBeenCalledTimes(5)
        })
    })

    describe('Data Privacy and Security', () => {
        it('should handle LGPD consent validation', async () => {
            const dataWithoutConsent = {
                name: 'Privacy Test User',
                email: 'privacy@example.com',
                phone: '11999999999',
                message: 'Testing LGPD compliance',
                consent: false,
                token: 'valid-recaptcha-token',
                action: 'contact'
            }

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: dataWithoutConsent
            })

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(400)
            const response = JSON.parse(res._getData())
            expect(response.success).toBe(false)
            expect(response.error).toContain('Consentimento LGPD')

            // Verify no email was sent without consent
            expect(mockResend.emails.send).not.toHaveBeenCalled()
        })

        it('should sanitize malicious input data', async () => {
            const maliciousData = {
                name: 'Test <script>alert("xss")</script> User',
                email: 'test@example.com',
                phone: '11999999999',
                message: 'Message with <img src="x" onerror="alert(1)"> malicious content',
                consent: true,
                token: 'valid-recaptcha-token',
                action: 'contact'
            }

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: maliciousData
            })

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(200)

            // Verify malicious content was sanitized
            const emailCall = mockResend.emails.send.mock.calls[0][0]
            expect(emailCall.html).not.toContain('<script>')
            expect(emailCall.html).not.toContain('onerror=')
            expect(emailCall.text).not.toContain('<script>')
        })
    })
})

/**
 * Helper function to generate valid webhook signatures for testing
 */
function generateValidSignature(payload) {
    const crypto = require('crypto')
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = crypto
        .createHmac('sha256', 'test-webhook-secret')
        .update(`${timestamp}.${payload}`)
        .digest('hex')
    
    return `t=${timestamp},v1=${signature}`
}