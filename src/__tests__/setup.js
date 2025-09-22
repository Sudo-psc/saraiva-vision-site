/**
 * Test setup configuration
 * Sets up environment variables and mocks for testing
 */

import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Set up environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.RESEND_API_KEY = 'test-resend-key'
process.env.NODE_ENV = 'test'

// Mock Supabase client
vi.mock('../lib/supabase.ts', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn()
                }))
            })),
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn()
                }))
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn()
                    }))
                }))
            }))
        })),
        rpc: vi.fn()
    },
    supabaseAdmin: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn()
                })),
                order: vi.fn(() => ({
                    order: vi.fn(() => ({
                        limit: vi.fn()
                    }))
                })),
                limit: vi.fn()
            })),
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn()
                }))
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn()
                    }))
                }))
            }))
        })),
        rpc: vi.fn()
    }
}))

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

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn()
}