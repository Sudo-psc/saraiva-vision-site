/**
 * Contact API Unit Tests
 * Tests for contact form API endpoint, validation schemas, and business logic
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMocks } from 'node-mocks-http'

// Mock external dependencies
vi.mock('../contact/emailService.js', () => ({
    sendContactEmail: vi.fn()
}))

vi.mock('../contact/outboxService.js', () => ({
    addToOutbox: vi.fn()
}))

vi.mock('../contact/rateLimiter.js', () => ({
    checkRateLimit: vi.fn()
}))

vi.mock('../../src/lib/supabase.ts', () => ({
    supabase: {
        from: vi.fn(() => ({
            insert: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({ data: [{ id: 'test-id' }], error: null }))
            }))
        }))
    }
}))

describe('Contact API Endpoint', () => {
    let contactHandler

    beforeEach(async () => {
        vi.clearAllMocks()
        // Dynamic import to ensure mocks are applied
        const module = await import('../contact/index.js')
        contactHandler = module.default
    })

    afterEach(() => {
        vi.resetAllMocks()
    })

    describe('POST /api/contact', () => {
        it('should successfully process valid contact form submission', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: {
                    name: 'João Silva',
                    email: 'joao@example.com',
                    phone: '11999999999',
                    message: 'Gostaria de agendar uma consulta',
                    consent: true
                }
            })

            const { checkRateLimit } = await import('../contact/rateLimiter.js')
            const { sendContactEmail } = await import('../contact/emailService.js')

            checkRateLimit.mockResolvedValue(true)
            sendContactEmail.mockResolvedValue({ success: true, messageId: 'test-id' })

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            expect(JSON.parse(res._getData())).toEqual({
                success: true,
                message: 'Mensagem enviada com sucesso!'
            })
            expect(sendContactEmail).toHaveBeenCalledWith({
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                message: 'Gostaria de agendar uma consulta'
            })
        })

        it('should reject submission without consent', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: {
                    name: 'João Silva',
                    email: 'joao@example.com',
                    phone: '11999999999',
                    message: 'Test message',
                    consent: false
                }
            })

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(400)
            expect(JSON.parse(res._getData())).toEqual({
                success: false,
                error: 'Consentimento LGPD é obrigatório'
            })
        })

        it('should handle rate limiting', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: {
                    name: 'João Silva',
                    email: 'joao@example.com',
                    phone: '11999999999',
                    message: 'Test message',
                    consent: true
                }
            })

            const { checkRateLimit } = await import('../contact/rateLimiter.js')
            checkRateLimit.mockResolvedValue(false)

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(429)
            expect(JSON.parse(res._getData())).toEqual({
                success: false,
                error: 'Muitas tentativas. Tente novamente em alguns minutos.'
            })
        })

        it('should validate required fields', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: {
                    name: '',
                    email: 'invalid-email',
                    phone: '',
                    message: '',
                    consent: true
                }
            })

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(400)
            const response = JSON.parse(res._getData())
            expect(response.success).toBe(false)
            expect(response.error).toContain('validation')
        })

        it('should handle email service failures with outbox fallback', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-forwarded-for': '192.168.1.1'
                },
                body: {
                    name: 'João Silva',
                    email: 'joao@example.com',
                    phone: '11999999999',
                    message: 'Test message',
                    consent: true
                }
            })

            const { checkRateLimit } = await import('../contact/rateLimiter.js')
            const { sendContactEmail } = await import('../contact/emailService.js')
            const { addToOutbox } = await import('../contact/outboxService.js')

            checkRateLimit.mockResolvedValue(true)
            sendContactEmail.mockRejectedValue(new Error('Email service unavailable'))
            addToOutbox.mockResolvedValue({ success: true })

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            expect(addToOutbox).toHaveBeenCalled()
        })
    })

    describe('OPTIONS /api/contact', () => {
        it('should handle CORS preflight requests', async () => {
            const { req, res } = createMocks({
                method: 'OPTIONS'
            })

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            expect(res.getHeader('Access-Control-Allow-Methods')).toContain('POST')
        })
    })

    describe('Unsupported methods', () => {
        it('should return 405 for GET requests', async () => {
            const { req, res } = createMocks({
                method: 'GET'
            })

            await contactHandler(req, res)

            expect(res._getStatusCode()).toBe(405)
        })
    })
})