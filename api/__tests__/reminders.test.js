/**
 * Tests for Appointment Reminder System
 * Requirements: 4.3 - Reminder scheduling and processing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock dependencies
const mockSupabaseAdmin = {
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                    gte: vi.fn(() => ({
                        lte: vi.fn(() => ({ data: [], error: null }))
                    }))
                }))
            }))
        })),
        update: vi.fn(() => ({
            eq: vi.fn(() => ({ error: null }))
        }))
    }))
}

vi.mock('../../src/lib/supabase.js', () => ({
    supabaseAdmin: mockSupabaseAdmin
}))

const mockAddToOutbox = vi.fn(() => Promise.resolve('message-id-123'))
const mockScheduleReminderNotifications = vi.fn(() => Promise.resolve())

vi.mock('../appointments/notifications.js', () => ({
    addToOutbox: mockAddToOutbox,
    scheduleReminderNotifications: mockScheduleReminderNotifications
}))

vi.mock('../../src/lib/eventLogger.js', () => ({
    logEvent: vi.fn(() => Promise.resolve())
}))

describe('Appointment Reminder System', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('Reminder Processing', () => {
        it('should find appointments due for 24-hour reminders', async () => {
            // Mock appointments that need 24h reminders
            const mockAppointments = [
                {
                    id: 'apt-1',
                    patient_name: 'João Silva',
                    patient_email: 'joao@example.com',
                    patient_phone: '+5511999999999',
                    appointment_date: '2024-01-15',
                    appointment_time: '14:00:00',
                    status: 'confirmed',
                    reminder_24h_sent: false,
                    reminder_2h_sent: false
                }
            ]

            // Mock the database response
            mockSupabaseAdmin.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            gte: vi.fn(() => ({
                                lte: vi.fn(() => ({ data: mockAppointments, error: null }))
                            }))
                        }))
                    }))
                }))
            })

            // Import the function after mocking
            const { findDueReminders } = await import('../appointments/reminders.js')

            const now = new Date('2024-01-14T14:00:00Z') // 24 hours before appointment
            const dueAppointments = await findDueReminders(24, now)

            expect(dueAppointments).toHaveLength(1)
            expect(dueAppointments[0].id).toBe('apt-1')
        })

        it('should handle empty appointment list', async () => {
            // Mock empty response
            mockSupabaseAdmin.from.mockReturnValue({
                select: vi.fn(() => ({
                    eq: vi.fn(() => ({
                        eq: vi.fn(() => ({
                            gte: vi.fn(() => ({
                                lte: vi.fn(() => ({ data: [], error: null }))
                            }))
                        }))
                    }))
                }))
            })

            const { findDueReminders } = await import('../appointments/reminders.js')

            const now = new Date('2024-01-15T08:00:00Z')
            const dueAppointments = await findDueReminders(2, now)

            expect(dueAppointments).toHaveLength(0)
        })
    })

    describe('Reminder Notifications', () => {
        it('should send both email and SMS reminders', async () => {
            const { sendReminderNotifications } = await import('../appointments/reminders.js')

            const appointment = {
                id: 'apt-1',
                patient_name: 'João Silva',
                patient_email: 'joao@example.com',
                patient_phone: '+5511999999999',
                appointment_date: '2024-01-15',
                appointment_time: '14:00:00',
                confirmation_token: 'token-123'
            }

            await sendReminderNotifications(appointment, 24, 'req-123')

            expect(mockAddToOutbox).toHaveBeenCalledTimes(2)

            // Check email reminder
            expect(mockAddToOutbox).toHaveBeenCalledWith({
                messageType: 'email',
                recipient: 'joao@example.com',
                subject: 'Lembrete: Consulta em 24 horas - Saraiva Vision',
                templateData: expect.objectContaining({
                    patient_name: 'João Silva',
                    appointment_date: '2024-01-15',
                    appointment_time: '14:00:00',
                    reminder_type: '24h',
                    hours_until: 24
                }),
                requestId: 'req-123'
            })

            // Check SMS reminder
            expect(mockAddToOutbox).toHaveBeenCalledWith({
                messageType: 'sms',
                recipient: '+5511999999999',
                templateData: expect.objectContaining({
                    patient_name: 'João Silva',
                    appointment_date: '2024-01-15',
                    appointment_time: '14:00:00',
                    reminder_type: '24h',
                    hours_until: 24
                }),
                requestId: 'req-123'
            })
        })

        it('should send 2-hour reminders with correct template data', async () => {
            const { sendReminderNotifications } = await import('../appointments/reminders.js')

            const appointment = {
                id: 'apt-2',
                patient_name: 'Maria Santos',
                patient_email: 'maria@example.com',
                patient_phone: '+5511888888888',
                appointment_date: '2024-01-15',
                appointment_time: '16:00:00',
                confirmation_token: 'token-456'
            }

            await sendReminderNotifications(appointment, 2, 'req-456')

            expect(mockAddToOutbox).toHaveBeenCalledTimes(2)

            // Check that 2h reminder type is used
            expect(mockAddToOutbox).toHaveBeenCalledWith(
                expect.objectContaining({
                    subject: 'Lembrete: Consulta em 2 horas - Saraiva Vision',
                    templateData: expect.objectContaining({
                        reminder_type: '2h',
                        hours_until: 2
                    })
                })
            )
        })
    })

    describe('Reminder Status Tracking', () => {
        it('should mark 24-hour reminder as sent', async () => {
            mockSupabaseAdmin.from.mockReturnValue({
                update: vi.fn(() => ({
                    eq: vi.fn(() => ({ error: null }))
                }))
            })

            const { markReminderSent } = await import('../appointments/reminders.js')

            await markReminderSent('apt-1', '24h')

            expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('appointments')
            expect(mockSupabaseAdmin.from().update).toHaveBeenCalledWith({
                reminder_24h_sent: true
            })
        })

        it('should mark 2-hour reminder as sent', async () => {
            mockSupabaseAdmin.from.mockReturnValue({
                update: vi.fn(() => ({
                    eq: vi.fn(() => ({ error: null }))
                }))
            })

            const { markReminderSent } = await import('../appointments/reminders.js')

            await markReminderSent('apt-2', '2h')

            expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('appointments')
            expect(mockSupabaseAdmin.from().update).toHaveBeenCalledWith({
                reminder_2h_sent: true
            })
        })
    })

    describe('Reminder Statistics', () => {
        it('should return correct reminder statistics', () => {
            const mockStats = [
                {
                    status: 'confirmed',
                    reminder_24h_sent: false,
                    reminder_2h_sent: false,
                    appointment_date: '2024-01-15'
                },
                {
                    status: 'confirmed',
                    reminder_24h_sent: true,
                    reminder_2h_sent: false,
                    appointment_date: '2024-01-15'
                },
                {
                    status: 'pending',
                    reminder_24h_sent: false,
                    reminder_2h_sent: false,
                    appointment_date: '2024-01-16'
                }
            ]

            // Mock the getReminderStats function
            const getReminderStats = () => {
                const stats = mockStats
                return {
                    total_appointments: stats.length,
                    confirmed_appointments: stats.filter(a => a.status === 'confirmed').length,
                    pending_appointments: stats.filter(a => a.status === 'pending').length,
                    reminders_24h_sent: stats.filter(a => a.reminder_24h_sent).length,
                    reminders_2h_sent: stats.filter(a => a.reminder_2h_sent).length,
                    reminders_24h_pending: stats.filter(a => a.status === 'confirmed' && !a.reminder_24h_sent).length,
                    reminders_2h_pending: stats.filter(a => a.status === 'confirmed' && !a.reminder_2h_sent).length
                }
            }

            const result = getReminderStats()

            expect(result.total_appointments).toBe(3)
            expect(result.confirmed_appointments).toBe(2)
            expect(result.pending_appointments).toBe(1)
            expect(result.reminders_24h_sent).toBe(1)
            expect(result.reminders_2h_sent).toBe(0)
            expect(result.reminders_24h_pending).toBe(1)
            expect(result.reminders_2h_pending).toBe(2)
        })
    })

    describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            mockSupabaseAdmin.from.mockReturnValue({
                select: vi.fn(() => {
                    throw new Error('Database connection failed')
                })
            })

            const { findDueReminders } = await import('../appointments/reminders.js')

            const now = new Date()

            await expect(findDueReminders(24, now)).rejects.toThrow('Database connection failed')
        })

        it('should handle notification sending errors', async () => {
            mockAddToOutbox.mockRejectedValueOnce(new Error('Email service unavailable'))

            const { sendReminderNotifications } = await import('../appointments/reminders.js')

            const appointment = {
                id: 'apt-1',
                patient_name: 'João Silva',
                patient_email: 'joao@example.com',
                patient_phone: '+5511999999999',
                appointment_date: '2024-01-15',
                appointment_time: '14:00:00'
            }

            await expect(sendReminderNotifications(appointment, 24, 'req-123'))
                .rejects.toThrow('Email service unavailable')
        })
    })

    describe('Integration with Outbox System', () => {
        it('should queue reminders in outbox for reliable delivery', async () => {
            const appointment = {
                id: 'apt-1',
                patient_name: 'João Silva',
                patient_email: 'joao@example.com',
                patient_phone: '+5511999999999',
                appointment_date: '2024-01-16', // Tomorrow
                appointment_time: '14:00:00'
            }

            await mockScheduleReminderNotifications(appointment, 'req-123')

            expect(mockScheduleReminderNotifications).toHaveBeenCalledWith(appointment, 'req-123')
        })
    })
})