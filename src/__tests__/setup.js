/**
 * Test setup configuration
 * Sets up environment variables and mocks for testing
 */

import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Set up environment variables for tests
process.env.RESEND_API_KEY = 'test-resend-key'
process.env.NODE_ENV = 'test'

// Note: Supabase integration removed - mocks removed

// Mock appointment availability functions
vi.mock('../lib/appointmentAvailability.js', () => ({
    formatDateBR: vi.fn((date) => date.split('-').reverse().join('/')),
    formatTimeBR: vi.fn((time) => time),
    getDayNameBR: vi.fn(() => 'Segunda-feira'),
    validateAppointmentDateTime: vi.fn(() => ({ isValid: true })),
    isSlotAvailable: vi.fn(() => Promise.resolve(true)),
    getAvailableSlots: vi.fn(() => Promise.resolve([])),
    getAvailableSlotsForNextDays: vi.fn(() => Promise.resolve({}))
}))

// Mock fetch globally
global.fetch = vi.fn()

// Mock IntersectionObserver with functional implementation
global.IntersectionObserver = class IntersectionObserver {
    constructor(callback, options = {}) {
        this.callback = callback
        this.options = options
        this.observed = new Set()
        this.root = options.root || null
        this.rootMargin = options.rootMargin || '0px'
        this.threshold = options.threshold || 0
    }

    observe(element) {
        if (!element) return
        this.observed.add(element)

        // Immediately trigger callback with isIntersecting: true for testing
        // This simulates the element being visible in the viewport
        if (this.callback) {
            const entries = [{
                target: element,
                isIntersecting: true,
                boundingClientRect: element.getBoundingClientRect?.() || {},
                intersectionRatio: 1,
                time: Date.now(),
                rootBounds: null,
                intersectionRect: {}
            }]

            // Use setTimeout to simulate async behavior
            setTimeout(() => {
                this.callback(entries, this)
            }, 0)
        }
    }

    unobserve(element) {
        this.observed.delete(element)
    }

    disconnect() {
        this.observed.clear()
    }

    takeRecords() {
        return []
    }
}

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
}