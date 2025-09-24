/**
 * Chatbot Appointment Management Tests
 * Tests for appointment modification, cancellation, and waitlist features
 */

import { vi } from 'vitest';

// Mock dependencies
const mockSupabaseAdmin = {
    from: vi.fn(() => ({
        select: vi.fn(() => ({
            eq: vi.fn(() => ({
                single: vi.fn(),
                eq: vi.fn(() => ({
                    single: vi.fn()
                }))
            })),
            order: vi.fn(() => ({
                limit: vi.fn()
            }))
        })),
        update: vi.fn(() => ({
            eq: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn()
                }))
            }))
        })),
        insert: vi.fn(() => ({
            select: vi.fn(() => ({
                single: vi.fn()
            }))
        })),
        rpc: vi.fn()
    })),
    rpc: vi.fn()
};

const mockValidateAppointmentDateTime = vi.fn();
const mockIsSlotAvailable = vi.fn();
const mockGetAlternativeSlots = vi.fn();
const mockLogEvent = vi.fn();
const mockAddToOutbox = vi.fn();
const mockScheduleReminderNotifications = vi.fn();
const mockValidateSecurity = vi.fn();
const mockValidateRequest = vi.fn();
const mockHandleApiError = vi.fn();

// Mock modules
vi.mock('../../src/lib/appointmentAvailability.js', () => ({
    validateAppointmentDateTime: mockValidateAppointmentDateTime,
    isSlotAvailable: mockIsSlotAvailable
}));

vi.mock('../../src/lib/supabase.ts', () => ({
    supabaseAdmin: mockSupabaseAdmin
}));

vi.mock('../../src/lib/eventLogger.js', () => ({
    logEvent: mockLogEvent
}));

vi.mock('../appointments/notifications.js', () => ({
    addToOutbox: mockAddToOutbox,
    scheduleReminderNotifications: mockScheduleReminderNotifications
}));

vi.mock('../utils/securityHeaders.js', () => ({
    applyCorsHeaders: vi.fn(),
    applySecurityHeaders: vi.fn()
}));

vi.mock('../utils/inputValidation.js', () => ({
    validateSecurity: mockValidateSecurity
}));

vi.mock('../contact/rateLimiter.js', () => ({
    validateRequest: mockValidateRequest,
    getClientIP: vi.fn(() => '127.0.0.1')
}));

vi.mock('../utils/errorHandler.js', () => ({
    handleApiError: mockHandleApiError
}));

// Import handlers
import appointmentHandler from '../chatbot/appointment.js';
import waitlistHandler from '../chatbot/waitlist.js';

describe('Chatbot Appointment Management', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementations
        mockValidateRequest.mockReturnValue({ allowed: true, headers: {} });
        mockValidateSecurity.mockReturnValue({ safe: true, threats: [] });
        mockLogEvent.mockResolvedValue();

        mockReq = {
            method: 'POST',
            body: {},
            headers: {}
        };

        mockRes = {
            status: vi.fn(() => mockRes),
            json: vi.fn(() => mockRes),
            setHeader: vi.fn(() => mockRes),
            end: vi.fn(() => mockRes)
        };
    });

    describe('Appointment Modification', () => {
        beforeEach(() => {
            mockReq.body = {
                action: 'modify',
                sessionId: 'test-session-123',
                appointmentId: 'appt-123',
                appointmentData: {
                    new_appointment_date: '2024-01-20',
                    new_appointment_time: '10:00',
                    reason: 'Schedule conflict'
                }
            };
        });

        it('should successfully modify an appointment', async () => {
            const existingAppointment = {
                id: 'appt-123',
                patient_name: 'João Silva',
                patient_email: 'joao@example.com',
                patient_phone: '11999999999',
                appointment_date: '2024-01-15',
                appointment_time: '09:00',
                session_id: 'test-session-123'
            };

            const updatedAppointment = {
                ...existingAppointment,
                appointment_date: '2024-01-20',
                appointment_time: '10:00',
                updated_at: new Date().toISOString()
            };

            // Mock existing appointment fetch
            mockSupabaseAdmin.from().select().eq().eq().single.mockResolvedValue({
                data: existingAppointment,
                error: null
            });

            // Mock date/time validation
            mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });

            // Mock slot availability check
            mockIsSlotAvailable.mockResolvedValue(true);

            // Mock appointment update
            mockSupabaseAdmin.from().update().eq().select().single.mockResolvedValue({
                data: updatedAppointment,
                error: null
            });

            await appointmentHandler(mockReq, mockRes);

            expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('appointments');
            expect(mockValidateAppointmentDateTime).toHaveBeenCalledWith('2024-01-20', '10:00');
            expect(mockIsSlotAvailable).toHaveBeenCalledWith('2024-01-20', '10:00', 'appt-123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        appointment: expect.objectContaining({
                            appointment_date: '2024-01-20',
                            appointment_time: '10:00'
                        }),
                        changes: expect.objectContaining({
                            dateChanged: true,
                            timeChanged: true
                        })
                    })
                })
            );
        });

        it('should reject modification within 24 hours', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);

            const existingAppointment = {
                id: 'appt-123',
                appointment_date: tomorrow.toISOString().split('T')[0],
                appointment_time: '09:00',
                session_id: 'test-session-123'
            };

            mockSupabaseAdmin.from().select().eq().eq().single.mockResolvedValue({
                data: existingAppointment,
                error: null
            });

            await appointmentHandler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'MODIFICATION_TOO_LATE'
                    })
                })
            );
        });

        it('should handle unavailable new slot', async () => {
            const existingAppointment = {
                id: 'appt-123',
                appointment_date: '2024-01-15',
                appointment_time: '09:00',
                session_id: 'test-session-123'
            };

            mockSupabaseAdmin.from().select().eq().eq().single.mockResolvedValue({
                data: existingAppointment,
                error: null
            });

            mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });
            mockIsSlotAvailable.mockResolvedValue(false);

            // Mock alternative slots
            mockGetAlternativeSlots = vi.fn().mockResolvedValue([
                { date: '2024-01-20', time: '11:00', displayDate: '20/01/2024', displayTime: '11:00' }
            ]);

            await appointmentHandler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(409);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'NEW_SLOT_UNAVAILABLE'
                    }),
                    data: expect.objectContaining({
                        alternativeSlots: expect.any(Array)
                    })
                })
            );
        });
    });

    describe('Appointment Cancellation', () => {
        beforeEach(() => {
            mockReq.body = {
                action: 'cancel',
                sessionId: 'test-session-123',
                appointmentId: 'appt-123',
                reason: 'Personal emergency',
                request_reschedule: false
            };
        });

        it('should successfully cancel an appointment', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7); // 7 days in future

            const existingAppointment = {
                id: 'appt-123',
                patient_name: 'João Silva',
                patient_email: 'joao@example.com',
                patient_phone: '11999999999',
                appointment_date: futureDate.toISOString().split('T')[0],
                appointment_time: '09:00',
                session_id: 'test-session-123',
                status: 'confirmed'
            };

            const cancelledAppointment = {
                ...existingAppointment,
                status: 'cancelled',
                cancellation_reason: 'Personal emergency',
                cancelled_at: new Date().toISOString(),
                late_cancellation: false
            };

            mockSupabaseAdmin.from().select().eq().eq().single.mockResolvedValue({
                data: existingAppointment,
                error: null
            });

            mockSupabaseAdmin.from().update().eq().select().single.mockResolvedValue({
                data: cancelledAppointment,
                error: null
            });

            await appointmentHandler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        appointment: expect.objectContaining({
                            status: 'cancelled',
                            late_cancellation: false
                        }),
                        message: 'Appointment successfully cancelled.'
                    })
                })
            );
        });

        it('should handle late cancellation', async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(9, 0, 0, 0);

            const existingAppointment = {
                id: 'appt-123',
                appointment_date: tomorrow.toISOString().split('T')[0],
                appointment_time: '09:00',
                session_id: 'test-session-123',
                status: 'confirmed'
            };

            const cancelledAppointment = {
                ...existingAppointment,
                status: 'cancelled',
                late_cancellation: true,
                cancelled_at: new Date().toISOString()
            };

            mockSupabaseAdmin.from().select().eq().eq().single.mockResolvedValue({
                data: existingAppointment,
                error: null
            });

            mockSupabaseAdmin.from().update().eq().select().single.mockResolvedValue({
                data: cancelledAppointment,
                error: null
            });

            await appointmentHandler(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        appointment: expect.objectContaining({
                            late_cancellation: true
                        }),
                        message: expect.stringContaining('late cancellation')
                    })
                })
            );
        });

        it('should reject cancellation of already cancelled appointment', async () => {
            const existingAppointment = {
                id: 'appt-123',
                status: 'cancelled',
                session_id: 'test-session-123'
            };

            mockSupabaseAdmin.from().select().eq().eq().single.mockResolvedValue({
                data: existingAppointment,
                error: null
            });

            await appointmentHandler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'ALREADY_CANCELLED'
                    })
                })
            );
        });
    });

    describe('Waitlist Management', () => {
        beforeEach(() => {
            mockReq.body = {
                action: 'join',
                sessionId: 'test-session-123',
                waitlistData: {
                    patient_name: 'Maria Silva',
                    patient_email: 'maria@example.com',
                    patient_phone: '11888888888',
                    preferred_date: '2024-01-25',
                    preferred_time: '14:00',
                    time_flexibility: 'flexible',
                    date_flexibility: 'same_week'
                }
            };
        });

        it('should successfully join waitlist', async () => {
            // Mock no existing entry
            mockSupabaseAdmin.from().select().eq().eq().eq().single.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' } // No rows returned
            });

            const waitlistEntry = {
                id: 'waitlist-123',
                patient_name: 'Maria Silva',
                patient_email: 'maria@example.com',
                patient_phone: '11888888888',
                preferred_date: '2024-01-25',
                preferred_time: '14:00',
                status: 'active',
                created_at: new Date().toISOString()
            };

            mockSupabaseAdmin.from().insert().select().single.mockResolvedValue({
                data: waitlistEntry,
                error: null
            });

            await waitlistHandler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        waitlistEntry: expect.objectContaining({
                            id: 'waitlist-123',
                            status: 'active'
                        }),
                        message: 'Successfully added to waitlist'
                    })
                })
            );
        });

        it('should reject duplicate waitlist entry', async () => {
            const existingEntry = {
                id: 'waitlist-existing',
                patient_email: 'maria@example.com',
                preferred_date: '2024-01-25',
                created_at: new Date().toISOString()
            };

            mockSupabaseAdmin.from().select().eq().eq().eq().single.mockResolvedValue({
                data: existingEntry,
                error: null
            });

            await waitlistHandler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(409);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'ALREADY_ON_WAITLIST'
                    })
                })
            );
        });

        it('should handle leaving waitlist', async () => {
            mockReq.body = {
                action: 'leave',
                sessionId: 'test-session-123',
                waitlistData: {
                    waitlistId: 'waitlist-123',
                    reason: 'Found alternative'
                }
            };

            const existingEntry = {
                id: 'waitlist-123',
                status: 'active',
                session_id: 'test-session-123'
            };

            const updatedEntry = {
                ...existingEntry,
                status: 'cancelled',
                cancelled_at: new Date().toISOString()
            };

            mockSupabaseAdmin.from().select().eq().eq().single.mockResolvedValue({
                data: existingEntry,
                error: null
            });

            mockSupabaseAdmin.from().update().eq().select().single.mockResolvedValue({
                data: updatedEntry,
                error: null
            });

            await waitlistHandler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        message: 'Successfully removed from waitlist'
                    })
                })
            );
        });

        it('should handle updating waitlist preferences', async () => {
            mockReq.body = {
                action: 'update',
                sessionId: 'test-session-123',
                waitlistData: {
                    waitlistId: 'waitlist-123',
                    updates: {
                        preferred_date: '2024-01-30',
                        time_flexibility: 'morning_only'
                    }
                }
            };

            const existingEntry = {
                id: 'waitlist-123',
                status: 'active',
                session_id: 'test-session-123',
                preferred_date: '2024-01-25',
                time_flexibility: 'flexible'
            };

            const updatedEntry = {
                ...existingEntry,
                preferred_date: '2024-01-30',
                time_flexibility: 'morning_only',
                updated_at: new Date().toISOString()
            };

            mockSupabaseAdmin.from().select().eq().eq().eq().single.mockResolvedValue({
                data: existingEntry,
                error: null
            });

            mockSupabaseAdmin.from().update().eq().select().single.mockResolvedValue({
                data: updatedEntry,
                error: null
            });

            await waitlistHandler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        message: 'Waitlist preferences updated successfully',
                        waitlistEntry: expect.objectContaining({
                            preferred_date: '2024-01-30',
                            time_flexibility: 'morning_only'
                        })
                    })
                })
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle appointment not found', async () => {
            mockReq.body = {
                action: 'modify',
                sessionId: 'test-session-123',
                appointmentId: 'nonexistent',
                appointmentData: {}
            };

            mockSupabaseAdmin.from().select().eq().eq().single.mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
            });

            await appointmentHandler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'APPOINTMENT_NOT_FOUND'
                    })
                })
            );
        });

        it('should handle database errors gracefully', async () => {
            mockReq.body = {
                action: 'book',
                sessionId: 'test-session-123',
                appointmentData: {
                    patient_name: 'Test User',
                    patient_email: 'test@example.com',
                    patient_phone: '11999999999',
                    appointment_date: '2024-01-25',
                    appointment_time: '10:00'
                }
            };

            mockSupabaseAdmin.from().insert().select().single.mockRejectedValue(
                new Error('Database connection failed')
            );

            await appointmentHandler(mockReq, mockRes);

            expect(mockHandleApiError).toHaveBeenCalled();
        });
    });
});