/**
 * Appointments API Tests
 * Tests for appointment booking, availability, and confirmation endpoints
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import appointmentsHandler from '../appointments/index.js'
import availabilityHandler from '../appointments/availability.js'
import confirmHandler from '../appointments/confirm.js'

// Mock Supabase
vi.mock('../../src/lib/supabase.js', () => ({
    supabaseAdmin: {
        from: vi.fn(() => ({
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn()
                }))
            })),
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

// Mock availability functions
vi.mock('../../src/lib/appointmentAvailability.js', () => ({
    validateAppointmentDateTime: vi.fn(),
    isSlotAvailable: vi.fn(),
    getAvailableSlots: vi.fn(),
    getAvailableSlotsForNextDays: vi.fn()
}))

// Mock validation functions
vi.mock('../appointments/validation.js', () => ({
    validateAppointmentData: vi.fn(),
    validateConfirmationToken: vi.fn(),
    validateStatusTransition: vi.fn()
}))

// Mock utilities
vi.mock('../appointments/utils.js', () => ({
    generateConfirmationToken: vi.fn(() => 'test-token-123'),
    generateRequestId: vi.fn(() => 'test-request-id')
}))

// Mock notifications
vi.mock('../appointments/notifications.js', () => ({
    addToOutbox: vi.fn()
}))

// Mock event logger
vi.mock('../../src/lib/eventLogger.js', () => ({
    logEvent: vi.fn()
}))

describe('Appointments API', () => {
    let req, res

    beforeEach(() => {
        req = {
            method: 'POST',
            body: {},
            query: {},
            headers: {}
        }
        res = {
            status: vi.fn(() => res),
            json: vi.fn(() => res),
            setHeader: vi.fn(() => res)
        }
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/appointments', () => {
        it('creates appointment successfully', async () => {
            const { supabaseAdmin } = await import('../../src/lib/supabase.js')
            const { validateAppointmentData } = await import('../appointments/validation.js')
            const { validateAppointmentDateTime, isSlotAvailable } = await import('../../src/lib/appointmentAvailability.js')
            const { addToOutbox } = await import('../appointments/notifications.js')

            // Mock successful validation
            validateAppointmentData.mockReturnValue({ isValid: true })
            validateAppointmentDateTime.mockReturnValue({ isValid: true })
            isSlotAvailable.mockResolvedValue(true)

            // Mock successful database insert
            const mockAppointment = {
                id: 'test-id',
                patient_name: 'João Silva',
                patient_email: 'joao@email.com',
                patient_phone: '(11) 99999-9999',
                appointment_date: '2024-01-15',
                appointment_time: '09:00',
                status: 'pending',
                confirmation_token: 'test-token-123'
            }

            supabaseAdmin.from().insert().select().single.mockResolvedValue({
                data: mockAppointment,
                error: null
            })

            // Mock successful notification scheduling
            addToOutbox.mockResolvedValue('message-id')

            req.body = {
                patient_name: 'João Silva',
                patient_email: 'joao@email.com',
                patient_phone: '(11) 99999-9999',
                appointment_date: '2024-01-15',
                appointment_time: '09:00'
            }

            await appointmentsHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        appointment: expect.objectContaining({
                            id: 'test-id',
                            patient_name: 'João Silva'
                        })
                    })
                })
            )
        })

        it('returns validation error for invalid data', async () => {
            const { validateAppointmentData } = await import('../appointments/validation.js')

            validateAppointmentData.mockReturnValue({
                isValid: false,
                errors: [
                    { field: 'patient_name', message: 'Nome é obrigatório' }
                ]
            })

            req.body = {
                patient_name: '',
                patient_email: 'invalid-email',
                patient_phone: '',
                appointment_date: '2024-01-15',
                appointment_time: '09:00'
            }

            await appointmentsHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'VALIDATION_ERROR'
                    })
                })
            )
        })

        it('returns conflict error when slot is unavailable', async () => {
            const { validateAppointmentData } = await import('../appointments/validation.js')
            const { validateAppointmentDateTime, isSlotAvailable } = await import('../../src/lib/appointmentAvailability.js')

            validateAppointmentData.mockReturnValue({ isValid: true })
            validateAppointmentDateTime.mockReturnValue({ isValid: true })
            isSlotAvailable.mockResolvedValue(false)

            req.body = {
                patient_name: 'João Silva',
                patient_email: 'joao@email.com',
                patient_phone: '(11) 99999-9999',
                appointment_date: '2024-01-15',
                appointment_time: '09:00'
            }

            await appointmentsHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(409)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'SLOT_UNAVAILABLE'
                    })
                })
            )
        })

        it('handles database constraint violation', async () => {
            const { supabaseAdmin } = await import('../../src/lib/supabase.js')
            const { validateAppointmentData } = await import('../appointments/validation.js')
            const { validateAppointmentDateTime, isSlotAvailable } = await import('../../src/lib/appointmentAvailability.js')

            validateAppointmentData.mockReturnValue({ isValid: true })
            validateAppointmentDateTime.mockReturnValue({ isValid: true })
            isSlotAvailable.mockResolvedValue(true)

            // Mock database constraint violation
            supabaseAdmin.from().insert().select().single.mockResolvedValue({
                data: null,
                error: {
                    code: '23505',
                    constraint: 'appointments_unique_slot'
                }
            })

            req.body = {
                patient_name: 'João Silva',
                patient_email: 'joao@email.com',
                patient_phone: '(11) 99999-9999',
                appointment_date: '2024-01-15',
                appointment_time: '09:00'
            }

            await appointmentsHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(409)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'SLOT_UNAVAILABLE'
                    })
                })
            )
        })
    })

    describe('GET /api/appointments/availability', () => {
        beforeEach(() => {
            req.method = 'GET'
        })

        it('returns availability for specific date', async () => {
            const { getAvailableSlots } = await import('../../src/lib/appointmentAvailability.js')
            const { validateAppointmentDateTime } = await import('../../src/lib/appointmentAvailability.js')

            validateAppointmentDateTime.mockReturnValue({ isValid: true })
            getAvailableSlots.mockResolvedValue([
                { slot_time: '09:00', is_available: true },
                { slot_time: '09:30', is_available: true }
            ])

            req.query = { date: '2024-01-15' }

            await availabilityHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        availability: {
                            '2024-01-15': [
                                { slot_time: '09:00', is_available: true },
                                { slot_time: '09:30', is_available: true }
                            ]
                        }
                    })
                })
            )
        })

        it('returns availability for next N days', async () => {
            const { getAvailableSlotsForNextDays } = await import('../../src/lib/appointmentAvailability.js')

            getAvailableSlotsForNextDays.mockResolvedValue({
                '2024-01-15': [
                    { slot_time: '09:00', is_available: true }
                ],
                '2024-01-16': [
                    { slot_time: '14:00', is_available: true }
                ]
            })

            req.query = { days: '7' }

            await availabilityHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(getAvailableSlotsForNextDays).toHaveBeenCalledWith(7)
        })

        it('returns error for invalid date format', async () => {
            const { validateAppointmentDateTime } = await import('../../src/lib/appointmentAvailability.js')

            validateAppointmentDateTime.mockReturnValue({
                isValid: false,
                error: 'Invalid date format'
            })

            req.query = { date: 'invalid-date' }

            await availabilityHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'INVALID_DATE'
                    })
                })
            )
        })
    })

    describe('GET /api/appointments/confirm', () => {
        beforeEach(() => {
            req.method = 'GET'
        })

        it('returns appointment details for valid token', async () => {
            const { supabaseAdmin } = await import('../../src/lib/supabase.js')
            const { validateConfirmationToken } = await import('../appointments/validation.js')

            validateConfirmationToken.mockReturnValue({ isValid: true })

            const mockAppointment = {
                id: 'test-id',
                patient_name: 'João Silva',
                appointment_date: '2024-01-15',
                appointment_time: '09:00',
                status: 'pending',
                notes: null,
                created_at: '2024-01-01T00:00:00Z'
            }

            supabaseAdmin.from().select().eq().single.mockResolvedValue({
                data: mockAppointment,
                error: null
            })

            req.query = { token: 'valid-token-123' }

            await confirmHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        appointment: expect.objectContaining({
                            id: 'test-id',
                            patient_name: 'João Silva'
                        })
                    })
                })
            )
        })

        it('returns error for invalid token', async () => {
            const { validateConfirmationToken } = await import('../appointments/validation.js')

            validateConfirmationToken.mockReturnValue({
                isValid: false,
                error: 'Token inválido'
            })

            req.query = { token: 'invalid-token' }

            await confirmHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'INVALID_TOKEN'
                    })
                })
            )
        })

        it('returns error for expired appointment', async () => {
            const { supabaseAdmin } = await import('../../src/lib/supabase.js')
            const { validateConfirmationToken } = await import('../appointments/validation.js')

            validateConfirmationToken.mockReturnValue({ isValid: true })

            // Mock past appointment
            const pastDate = new Date()
            pastDate.setDate(pastDate.getDate() - 1)

            const mockAppointment = {
                id: 'test-id',
                patient_name: 'João Silva',
                appointment_date: pastDate.toISOString().split('T')[0],
                appointment_time: '09:00',
                status: 'pending'
            }

            supabaseAdmin.from().select().eq().single.mockResolvedValue({
                data: mockAppointment,
                error: null
            })

            req.query = { token: 'valid-token-123' }

            await confirmHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(400)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'APPOINTMENT_EXPIRED'
                    })
                })
            )
        })
    })

    describe('POST /api/appointments/confirm', () => {
        beforeEach(() => {
            req.method = 'POST'
        })

        it('confirms appointment successfully', async () => {
            const { supabaseAdmin } = await import('../../src/lib/supabase.js')
            const { validateConfirmationToken, validateStatusTransition } = await import('../appointments/validation.js')

            validateConfirmationToken.mockReturnValue({ isValid: true })
            validateStatusTransition.mockReturnValue({ isValid: true })

            const futureDate = new Date()
            futureDate.setDate(futureDate.getDate() + 1)

            const mockAppointment = {
                id: 'test-id',
                patient_name: 'João Silva',
                appointment_date: futureDate.toISOString().split('T')[0],
                appointment_time: '09:00',
                status: 'pending',
                patient_email: 'joao@email.com'
            }

            const mockUpdatedAppointment = {
                ...mockAppointment,
                status: 'confirmed',
                confirmed_at: new Date().toISOString()
            }

            supabaseAdmin.from().select().eq().single.mockResolvedValue({
                data: mockAppointment,
                error: null
            })

            supabaseAdmin.from().update().eq().select().single.mockResolvedValue({
                data: mockUpdatedAppointment,
                error: null
            })

            req.body = {
                token: 'valid-token-123',
                action: 'confirm'
            }

            await confirmHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        appointment: expect.objectContaining({
                            status: 'confirmed'
                        }),
                        message: 'Appointment confirmed successfully'
                    })
                })
            )
        })

        it('cancels appointment successfully', async () => {
            const { supabaseAdmin } = await import('../../src/lib/supabase.js')
            const { validateConfirmationToken, validateStatusTransition } = await import('../appointments/validation.js')

            validateConfirmationToken.mockReturnValue({ isValid: true })
            validateStatusTransition.mockReturnValue({ isValid: true })

            const futureDate = new Date()
            futureDate.setDate(futureDate.getDate() + 1)

            const mockAppointment = {
                id: 'test-id',
                patient_name: 'João Silva',
                appointment_date: futureDate.toISOString().split('T')[0],
                appointment_time: '09:00',
                status: 'pending',
                patient_email: 'joao@email.com'
            }

            const mockUpdatedAppointment = {
                ...mockAppointment,
                status: 'cancelled'
            }

            supabaseAdmin.from().select().eq().single.mockResolvedValue({
                data: mockAppointment,
                error: null
            })

            supabaseAdmin.from().update().eq().select().single.mockResolvedValue({
                data: mockUpdatedAppointment,
                error: null
            })

            req.body = {
                token: 'valid-token-123',
                action: 'cancel'
            }

            await confirmHandler(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        appointment: expect.objectContaining({
                            status: 'cancelled'
                        }),
                        message: 'Appointment cancelled successfully'
                    })
                })
            )
        })
    })
})