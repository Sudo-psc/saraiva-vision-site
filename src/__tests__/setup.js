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

// Mock IntersectionObserver for Framer Motion
global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
}

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
}