/**
 * Business Logic Unit Tests
 * Tests for core business logic functions and utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addDays, format, isWeekend, setHours, setMinutes } from 'date-fns'

// Mock appointment availability logic
const generateAvailableSlots = (date) => {
    const slots = []
    const startHour = 8
    const endHour = 18
    const slotDuration = 30 // minutes

    // Skip weekends
    if (isWeekend(date)) {
        return slots
    }

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
            const slotTime = setMinutes(setHours(date, hour), minute)
            slots.push(format(slotTime, 'HH:mm'))
        }
    }

    return slots
}

const checkSlotAvailability = async (date, time, existingAppointments = []) => {
    const requestedDateTime = `${date} ${time}`

    // Check if slot is already booked
    const isBooked = existingAppointments.some(apt =>
        apt.appointment_date === date && apt.appointment_time === time
    )

    if (isBooked) {
        return { available: false, reason: 'Horário já ocupado' }
    }

    // Check if it's a valid business hour
    const availableSlots = generateAvailableSlots(new Date(date))
    if (!availableSlots.includes(time)) {
        return { available: false, reason: 'Horário fora do funcionamento' }
    }

    return { available: true }
}

// Mock rate limiting logic
const createRateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 10) => {
    const requests = new Map()

    return {
        checkLimit: (identifier) => {
            const now = Date.now()
            const windowStart = now - windowMs

            // Clean old entries
            for (const [key, timestamps] of requests.entries()) {
                const validTimestamps = timestamps.filter(ts => ts > windowStart)
                if (validTimestamps.length === 0) {
                    requests.delete(key)
                } else {
                    requests.set(key, validTimestamps)
                }
            }

            // Check current identifier
            const userRequests = requests.get(identifier) || []
            const recentRequests = userRequests.filter(ts => ts > windowStart)

            if (recentRequests.length >= maxRequests) {
                return { allowed: false, resetTime: windowStart + windowMs }
            }

            // Add current request
            recentRequests.push(now)
            requests.set(identifier, recentRequests)

            return { allowed: true, remaining: maxRequests - recentRequests.length }
        }
    }
}

// Mock outbox retry logic
const calculateRetryDelay = (attemptNumber, baseDelay = 1000, maxDelay = 300000) => {
    const exponentialDelay = baseDelay * Math.pow(2, attemptNumber - 1)
    const jitter = Math.random() * 0.1 * exponentialDelay
    return Math.min(exponentialDelay + jitter, maxDelay)
}

const shouldRetryError = (error, attemptNumber, maxAttempts = 3) => {
    if (attemptNumber >= maxAttempts) {
        return false
    }

    // Retry on network errors, timeouts, and 5xx status codes
    const retryableErrors = [
        'ECONNRESET',
        'ENOTFOUND',
        'ECONNREFUSED',
        'ETIMEDOUT'
    ]

    if (retryableErrors.includes(error.code)) {
        return true
    }

    if (error.status >= 500 && error.status < 600) {
        return true
    }

    return false
}

describe('Business Logic', () => {
    describe('Appointment Availability', () => {
        it('should generate correct time slots for weekdays', () => {
            const monday = new Date('2024-01-15') // Monday
            const slots = generateAvailableSlots(monday)

            expect(slots).toContain('08:00')
            expect(slots).toContain('08:30')
            expect(slots).toContain('17:30')
            expect(slots).not.toContain('18:00')
            expect(slots).not.toContain('07:30')
        })

        it('should return empty slots for weekends', () => {
            const saturday = new Date('2024-01-13') // Saturday
            const sunday = new Date('2024-01-14') // Sunday

            expect(generateAvailableSlots(saturday)).toHaveLength(0)
            expect(generateAvailableSlots(sunday)).toHaveLength(0)
        })

        it('should detect slot conflicts', async () => {
            const existingAppointments = [
                { appointment_date: '2024-01-15', appointment_time: '09:00' },
                { appointment_date: '2024-01-15', appointment_time: '14:30' }
            ]

            const result1 = await checkSlotAvailability('2024-01-15', '09:00', existingAppointments)
            expect(result1.available).toBe(false)
            expect(result1.reason).toBe('Horário já ocupado')

            const result2 = await checkSlotAvailability('2024-01-15', '10:00', existingAppointments)
            expect(result2.available).toBe(true)
        })

        it('should reject invalid business hours', async () => {
            const result1 = await checkSlotAvailability('2024-01-15', '07:00')
            expect(result1.available).toBe(false)
            expect(result1.reason).toBe('Horário fora do funcionamento')

            const result2 = await checkSlotAvailability('2024-01-15', '18:30')
            expect(result2.available).toBe(false)
            expect(result2.reason).toBe('Horário fora do funcionamento')
        })
    })

    describe('Rate Limiting', () => {
        let rateLimiter

        beforeEach(() => {
            rateLimiter = createRateLimiter(60000, 5) // 5 requests per minute
        })

        it('should allow requests within limit', () => {
            const identifier = 'user123'

            for (let i = 0; i < 5; i++) {
                const result = rateLimiter.checkLimit(identifier)
                expect(result.allowed).toBe(true)
                expect(result.remaining).toBe(4 - i)
            }
        })

        it('should block requests exceeding limit', () => {
            const identifier = 'user123'

            // Use up the limit
            for (let i = 0; i < 5; i++) {
                rateLimiter.checkLimit(identifier)
            }

            // Next request should be blocked
            const result = rateLimiter.checkLimit(identifier)
            expect(result.allowed).toBe(false)
            expect(result.resetTime).toBeDefined()
        })

        it('should handle different identifiers separately', () => {
            const user1 = 'user1'
            const user2 = 'user2'

            // Use up limit for user1
            for (let i = 0; i < 5; i++) {
                rateLimiter.checkLimit(user1)
            }

            // user2 should still be allowed
            const result = rateLimiter.checkLimit(user2)
            expect(result.allowed).toBe(true)
        })
    })

    describe('Retry Logic', () => {
        it('should calculate exponential backoff delays', () => {
            const delay1 = calculateRetryDelay(1, 1000)
            const delay2 = calculateRetryDelay(2, 1000)
            const delay3 = calculateRetryDelay(3, 1000)

            expect(delay1).toBeGreaterThanOrEqual(1000)
            expect(delay1).toBeLessThan(1200) // With jitter
            expect(delay2).toBeGreaterThanOrEqual(2000)
            expect(delay2).toBeLessThan(2400)
            expect(delay3).toBeGreaterThanOrEqual(4000)
            expect(delay3).toBeLessThan(4800)
        })

        it('should respect maximum delay', () => {
            const delay = calculateRetryDelay(10, 1000, 5000)
            expect(delay).toBeLessThanOrEqual(5000)
        })

        it('should determine retryable errors correctly', () => {
            const networkError = { code: 'ECONNRESET' }
            const serverError = { status: 500 }
            const clientError = { status: 400 }
            const unknownError = { message: 'Unknown error' }

            expect(shouldRetryError(networkError, 1)).toBe(true)
            expect(shouldRetryError(serverError, 1)).toBe(true)
            expect(shouldRetryError(clientError, 1)).toBe(false)
            expect(shouldRetryError(unknownError, 1)).toBe(false)
        })

        it('should stop retrying after max attempts', () => {
            const retryableError = { code: 'ECONNRESET' }

            expect(shouldRetryError(retryableError, 1, 3)).toBe(true)
            expect(shouldRetryError(retryableError, 2, 3)).toBe(true)
            expect(shouldRetryError(retryableError, 3, 3)).toBe(false)
        })
    })

    describe('Data Processing', () => {
        it('should sanitize user input', () => {
            const sanitizeInput = (input) => {
                if (typeof input !== 'string') return input

                return input
                    .trim()
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/[<>]/g, '')
            }

            const maliciousInput = '<script>alert("xss")</script>Hello<>'
            const sanitized = sanitizeInput(maliciousInput)

            expect(sanitized).toBe('Hello')
            expect(sanitized).not.toContain('<script>')
            expect(sanitized).not.toContain('<>')
        })

        it('should format Brazilian phone numbers', () => {
            const formatPhone = (phone) => {
                const digits = phone.replace(/\D/g, '')

                if (digits.length === 11) {
                    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
                }
                if (digits.length === 10) {
                    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
                }

                return phone
            }

            expect(formatPhone('11999999999')).toBe('(11) 99999-9999')
            expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
            expect(formatPhone('invalid')).toBe('invalid')
        })

        it('should validate Brazilian timezone', () => {
            const isValidBrazilianTime = (dateString) => {
                try {
                    const date = new Date(dateString)
                    const brazilTime = new Intl.DateTimeFormat('pt-BR', {
                        timeZone: 'America/Sao_Paulo',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).format(date)

                    return brazilTime.match(/^\d{2}:\d{2}$/) !== null
                } catch {
                    return false
                }
            }

            expect(isValidBrazilianTime('2024-01-15T14:30:00-03:00')).toBe(true)
            expect(isValidBrazilianTime('invalid-date')).toBe(false)
        })
    })
})