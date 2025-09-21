import { describe, it, expect } from 'vitest'

describe('Test Setup', () => {
    it('should have testing environment configured', () => {
        expect(process.env.RESEND_API_KEY).toBe('test-api-key')
        expect(process.env.DOCTOR_EMAIL).toBe('test@example.com')
    })

    it('should have fetch mocked', () => {
        expect(global.fetch).toBeDefined()
        expect(typeof global.fetch).toBe('function')
    })
})