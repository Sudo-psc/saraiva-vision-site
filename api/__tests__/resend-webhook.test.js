/**
 * Resend Webhook Unit Tests
 * Tests for Resend webhook handler, signature verification, and event processing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMocks } from 'node-mocks-http'
import crypto from 'crypto'

// Mock Supabase admin client
const mockSupabaseAdmin = {
    from: vi.fn(() => ({
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
        })),
        insert: vi.fn(() => Promise.resolve({ data: [{ id: 'test-event-id' }], error: null }))
    }))
}

vi.mock('../../src/lib/supabase.ts', () => ({
    supabaseAdmin: mockSupabaseAdmin
}))

describe('Resend Webhook Handler', () => {
    let webhookHandler

    beforeEach(async () => {
        vi.clearAllMocks()
        process.env.RESEND_WEBHOOK_SECRET = 'test-webhook-secret'
        
        // Dynamic import to ensure mocks are applied
        const module = await import('../webhooks/resend.js')
        webhookHandler = module.default
    })

    afterEach(() => {
        vi.resetAllMocks()
        delete process.env.RESEND_WEBHOOK_SECRET
    })

    describe('HTTP Method Validation', () => {
        it('should only allow POST requests', async () => {
            const { req, res } = createMocks({
                method: 'GET',
                body: {}
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(405)
            expect(res.getHeader('Allow')).toBe('POST')
            expect(JSON.parse(res._getData())).toEqual({
                success: false,
                error: 'Method not allowed'
            })
        })

        it('should accept POST requests', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature('{"type":"email.sent","data":{"email_id":"test-123","headers":{"X-Message-ID":"test-message-id"}}}')
                },
                body: {
                    type: 'email.sent',
                    data: {
                        email_id: 'test-123',
                        headers: {
                            'X-Message-ID': 'test-message-id'
                        }
                    }
                }
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
        })
    })

    describe('Signature Verification', () => {
        it('should verify valid webhook signatures', async () => {
            const payload = JSON.stringify({
                type: 'email.sent',
                data: {
                    email_id: 'test-123',
                    headers: {
                        'X-Message-ID': 'test-message-id'
                    }
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
        })

        it('should reject invalid webhook signatures', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': 't=1234567890,v1=invalid-signature'
                },
                body: {
                    type: 'email.sent',
                    data: {
                        email_id: 'test-123'
                    }
                }
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(401)
            expect(JSON.parse(res._getData())).toEqual({
                success: false,
                error: 'Invalid signature'
            })
        })

        it('should reject requests with old timestamps', async () => {
            const oldTimestamp = Math.floor(Date.now() / 1000) - 400 // 400 seconds ago
            const payload = '{"type":"email.sent","data":{"email_id":"test-123"}}'
            const signature = crypto
                .createHmac('sha256', 'test-webhook-secret')
                .update(`${oldTimestamp}.${payload}`)
                .digest('hex')

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': `t=${oldTimestamp},v1=${signature}`
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(401)
        })

        it('should handle missing webhook secret gracefully', async () => {
            delete process.env.RESEND_WEBHOOK_SECRET

            const { req, res } = createMocks({
                method: 'POST',
                headers: {},
                body: {
                    type: 'email.sent',
                    data: {
                        email_id: 'test-123',
                        headers: {
                            'X-Message-ID': 'test-message-id'
                        }
                    }
                }
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
        })
    })

    describe('Event Processing', () => {
        beforeEach(() => {
            process.env.RESEND_WEBHOOK_SECRET = 'test-webhook-secret'
        })

        it('should process email.sent events correctly', async () => {
            const payload = JSON.stringify({
                type: 'email.sent',
                data: {
                    email_id: 'test-email-123',
                    headers: {
                        'X-Message-ID': 'test-message-id'
                    }
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            
            expect(response.success).toBe(true)
            expect(response.data.status).toBe('sent')
            expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('message_outbox')
        })

        it('should process email.delivered events correctly', async () => {
            const payload = JSON.stringify({
                type: 'email.delivered',
                data: {
                    email_id: 'test-email-123',
                    metadata: {
                        messageId: 'test-message-id'
                    }
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            
            expect(response.success).toBe(true)
            expect(response.data.status).toBe('delivered')
        })

        it('should process email.bounced events correctly', async () => {
            const payload = JSON.stringify({
                type: 'email.bounced',
                data: {
                    email_id: 'test-email-123',
                    bounce_type: 'hard',
                    tags: ['msg_test-message-id']
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            
            expect(response.success).toBe(true)
            expect(response.data.status).toBe('failed')
        })

        it('should process email.complained events correctly', async () => {
            const payload = JSON.stringify({
                type: 'email.complained',
                data: {
                    email_id: 'test-email-123',
                    headers: {
                        'X-Message-ID': 'test-message-id'
                    }
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            
            expect(response.success).toBe(true)
            expect(response.data.status).toBe('failed')
        })

        it('should handle email.delivery_delayed events', async () => {
            const payload = JSON.stringify({
                type: 'email.delivery_delayed',
                data: {
                    email_id: 'test-email-123',
                    delay: '30 minutes',
                    headers: {
                        'X-Message-ID': 'test-message-id'
                    }
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            
            expect(response.success).toBe(true)
            expect(response.data.action).toBe('logged_delay')
        })

        it('should handle unknown event types', async () => {
            const payload = JSON.stringify({
                type: 'unknown.event',
                data: {
                    email_id: 'test-email-123'
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(400)
            const response = JSON.parse(res._getData())
            
            expect(response.success).toBe(false)
            expect(response.error).toBe('Unknown event type')
        })

        it('should handle events without message ID', async () => {
            const payload = JSON.stringify({
                type: 'email.sent',
                data: {
                    email_id: 'test-email-123'
                    // No message ID in headers, metadata, or tags
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(400)
            const response = JSON.parse(res._getData())
            
            expect(response.success).toBe(false)
            expect(response.error).toBe('No message ID found')
        })
    })

    describe('Database Integration', () => {
        it('should handle database update errors gracefully', async () => {
            // Mock database error
            mockSupabaseAdmin.from.mockReturnValue({
                update: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        select: vi.fn(() => Promise.resolve({ 
                            data: null, 
                            error: new Error('Database error') 
                        }))
                    }))
                })),
                insert: vi.fn(() => Promise.resolve({ data: [{ id: 'test-event-id' }], error: null }))
            })

            const payload = JSON.stringify({
                type: 'email.sent',
                data: {
                    email_id: 'test-email-123',
                    headers: {
                        'X-Message-ID': 'test-message-id'
                    }
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(400)
            const response = JSON.parse(res._getData())
            
            expect(response.success).toBe(false)
            expect(response.error).toBe('Database error')
        })

        it('should log webhook events to event_log table', async () => {
            const payload = JSON.stringify({
                type: 'email.sent',
                data: {
                    email_id: 'test-email-123',
                    headers: {
                        'X-Message-ID': 'test-message-id'
                    }
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            
            // Verify event logging was called
            expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('event_log')
        })
    })

    describe('Error Handling', () => {
        it('should handle unexpected errors gracefully', async () => {
            // Mock a function to throw an error
            mockSupabaseAdmin.from.mockImplementation(() => {
                throw new Error('Unexpected error')
            })

            const payload = JSON.stringify({
                type: 'email.sent',
                data: {
                    email_id: 'test-email-123',
                    headers: {
                        'X-Message-ID': 'test-message-id'
                    }
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(500)
            const response = JSON.parse(res._getData())
            
            expect(response.success).toBe(false)
            expect(response.error).toBe('Internal server error')
            expect(response.processingTime).toMatch(/\d+ms/)
        })

        it('should include processing time in all responses', async () => {
            const payload = JSON.stringify({
                type: 'email.sent',
                data: {
                    email_id: 'test-email-123',
                    headers: {
                        'X-Message-ID': 'test-message-id'
                    }
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            const response = JSON.parse(res._getData())
            expect(response.processingTime).toMatch(/\d+ms/)
        })
    })

    describe('Message ID Extraction', () => {
        it('should extract message ID from X-Message-ID header', async () => {
            const payload = JSON.stringify({
                type: 'email.sent',
                data: {
                    email_id: 'test-email-123',
                    headers: {
                        'X-Message-ID': 'header-message-id'
                    }
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            expect(response.data.messageId).toBe('header-message-id')
        })

        it('should extract message ID from metadata', async () => {
            const payload = JSON.stringify({
                type: 'email.sent',
                data: {
                    email_id: 'test-email-123',
                    metadata: {
                        messageId: 'metadata-message-id'
                    }
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            expect(response.data.messageId).toBe('metadata-message-id')
        })

        it('should extract message ID from tags', async () => {
            const payload = JSON.stringify({
                type: 'email.sent',
                data: {
                    email_id: 'test-email-123',
                    tags: ['msg_tag-message-id', 'other-tag']
                }
            })

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'resend-signature': generateValidSignature(payload)
                },
                body: JSON.parse(payload)
            })

            await webhookHandler(req, res)

            expect(res._getStatusCode()).toBe(200)
            const response = JSON.parse(res._getData())
            expect(response.data.messageId).toBe('tag-message-id')
        })
    })
})

/**
 * Helper function to generate valid webhook signatures for testing
 */
function generateValidSignature(payload) {
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = crypto
        .createHmac('sha256', 'test-webhook-secret')
        .update(`${timestamp}.${payload}`)
        .digest('hex')
    
    return `t=${timestamp},v1=${signature}`
}