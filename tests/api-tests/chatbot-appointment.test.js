/**
 * Chatbot Appointment API Tests
 * Tests for appointment booking through chatbot interface
 */

import { vi } from 'vitest';

// Mock dependencies
const mockSupabaseAdmin = {
    from: vi.fn(() => ({
        insert: vi.fn(() => ({
            select: vi.fn(() => ({
                single: vi.fn()
            }))
        }))
    })),
    rpc: vi.fn()
};

const mockGetAvailableSlots = vi.fn();
const mockGetAvailableSlotsForNextDays = vi.fn();
const mockValidateAppointmentDateTime = vi.fn();
const mockIsSlotAvailable = vi.fn();
const mockValidateAppointmentData = vi.fn();
const mockGenerateConfirmationToken = vi.fn();
const mockAddToOutbox = vi.fn();
const mockScheduleReminderNotifications = vi.fn();
const mockLogEvent = vi.fn();
const mockValidateSecurity = vi.fn();
const mockValidateRequest = vi.fn();
const mockHandleApiError = vi.fn();

// Mock modules
vi.mock('../../src/lib/appointmentAvailability.js', () => ({
    getAvailableSlots: mockGetAvailableSlots,
    getAvailableSlotsForNextDays: mockGetAvailableSlotsForNextDays,
    validateAppointmentDateTime: mockValidateAppointmentDateTime,
    isSlotAvailable: mockIsSlotAvailable
}));

vi.mock('../appointments/validation.js', () => ({
    validateAppointmentData: mockValidateAppointmentData
}));

vi.mock('../appointments/utils.js', () => ({
    generateConfirmationToken: mockGenerateConfirmationToken
}));

vi.mock('../appointments/notifications.js', () => ({
    addToOutbox: mockAddToOutbox,
    scheduleReminderNotifications: mockScheduleReminderNotifications
}));

vi.mock('../../src/lib/supabase.ts', () => ({
    supabaseAdmin: mockSupabaseAdmin
}));

vi.mock('../../src/lib/eventLogger.js', () => ({
    logEvent: mockLogEvent
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

// Import the handler after mocking
import handler from '../chatbot/appointment.js';

describe('Chatbot Appointment API', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Setup default mock implementations
        mockValidateRequest.mockReturnValue({ allowed: true, headers: {} });
        mockValidateSecurity.mockReturnValue({ safe: true, threats: [] });
        mockLogEvent.mockResolvedValue();

        // Setup mock request and response
        mockReq = {
            method: 'GET',
            query: {},
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

    describe('GET /api/chatbot/appointment', () => {
        it('should return availability for next 7 days by default', async () => {
            const mockAvailability = {
                '2024-01-15': [
                    { slot_time: '09:00' },
                    { slot_time: '10:00' }
                ],
                '2024-01-16': [
                    { slot_time: '14:00' },
                    { slot_time: '15:00' }
                ]
            };

            mockGetAvailableSlotsForNextDays.mockResolvedValue(mockAvailability);

            await handler(mockReq, mockRes);

            expect(mockGetAvailableSlotsForNextDays).toHaveBeenCalledWith(7);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        availability: expect.any(Array),
                        summary: expect.objectContaining({
                            totalDates: 2,
                            totalSlots: 4
                        })
                    })
                })
            );
        });

        it('should filter availability by time preferences', async () => {
            mockReq.query = { timePreferences: 'morning' };

            const mockAvailability = {
                '2024-01-15': [
                    { slot_time: '09:00' },
                    { slot_time: '14:00' }
                ]
            };

            mockGetAvailableSlotsForNextDays.mockResolvedValue(mockAvailability);

            await handler(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        availability: expect.arrayContaining([
                            expect.objectContaining({
                                slots: expect.arrayContaining([
                                    expect.objectContaining({ time: '09:00' })
                                ])
                            })
                        ])
                    })
                })
            );
        });

        it('should handle preferred dates', async () => {
            mockReq.query = { preferredDates: '2024-01-15,2024-01-16' };

            mockGetAvailableSlots
                .mockResolvedValueOnce([{ slot_time: '09:00' }])
                .mockResolvedValueOnce([{ slot_time: '14:00' }]);

            mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });

            await handler(mockReq, mockRes);

            expect(mockGetAvailableSlots).toHaveBeenCalledWith('2024-01-15');
            expect(mockGetAvailableSlots).toHaveBeenCalledWith('2024-01-16');
        });
    });

    describe('POST /api/chatbot/appointment', () => {
        beforeEach(() => {
            mockReq.method = 'POST';
        });

        describe('book action', () => {
            beforeEach(() => {
                mockReq.body = {
                    action: 'book',
                    sessionId: 'test-session-123',
                    appointmentData: {
                        patient_name: 'João Silva',
                        patient_email: 'joao@example.com',
                        patient_phone: '11999999999',
                        appointment_date: '2024-01-15',
                        appointment_time: '09:00',
                        notes: 'Consulta de rotina'
                    }
                };
            });

            it('should successfully book an appointment', async () => {
                // Setup mocks
                mockValidateAppointmentData.mockReturnValue({ isValid: true });
                mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });
                mockIsSlotAvailable.mockResolvedValue(true);
                mockGenerateConfirmationToken.mockReturnValue('ABC123');

                const mockAppointment = {
                    id: 'appt-123',
                    patient_name: 'João Silva',
                    appointment_date: '2024-01-15',
                    appointment_time: '09:00',
                    status: 'pending',
                    confirmation_token: 'ABC123'
                };

                mockSupabaseAdmin.from().insert().select().single.mockResolvedValue({
                    data: mockAppointment,
                    error: null
                });

                await handler(mockReq, mockRes);

                expect(mockValidateAppointmentData).toHaveBeenCalledWith(mockReq.body.appointmentData);
                expect(mockIsSlotAvailable).toHaveBeenCalledWith('2024-01-15', '09:00');
                expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('appointments');
                expect(mockRes.status).toHaveBeenCalledWith(201);
                expect(mockRes.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        data: expect.objectContaining({
                            appointment: expect.objectContaining({
                                id: 'appt-123',
                                confirmation_token: 'ABC123'
                            })
                        })
                    })
                );
            });

            it('should return error for invalid appointment data', async () => {
                mockValidateAppointmentData.mockReturnValue({
                    isValid: false,
                    errors: ['Nome é obrigatório', 'E-mail inválido']
                });

                await handler(mockReq, mockRes);

                expect(mockRes.status).toHaveBeenCalledWith(400);
                expect(mockRes.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: false,
                        error: expect.objectContaining({
                            code: 'VALIDATION_ERROR',
                            details: ['Nome é obrigatório', 'E-mail inválido']
                        })
                    })
                );
            });

            it('should return error for invalid date/time', async () => {
                mockValidateAppointmentData.mockReturnValue({ isValid: true });
                mockValidateAppointmentDateTime.mockReturnValue({
                    isValid: false,
                    error: 'Data deve ser no futuro'
                });

                await handler(mockReq, mockRes);

                expect(mockRes.status).toHaveBeenCalledWith(400);
                expect(mockRes.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: false,
                        error: expect.objectContaining({
                            code: 'INVALID_DATETIME',
                            message: 'Data deve ser no futuro'
                        })
                    })
                );
            });

            it('should return conflict when slot is unavailable', async () => {
                mockValidateAppointmentData.mockReturnValue({ isValid: true });
                mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });
                mockIsSlotAvailable.mockResolvedValue(false);

                await handler(mockReq, mockRes);

                expect(mockRes.status).toHaveBeenCalledWith(409);
                expect(mockRes.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: false,
                        error: expect.objectContaining({
                            code: 'SLOT_UNAVAILABLE'
                        }),
                        data: expect.objectContaining({
                            alternativeSlots: expect.any(Array),
                            waitlistAvailable: true
                        })
                    })
                );
            });

            it('should handle database errors', async () => {
                mockValidateAppointmentData.mockReturnValue({ isValid: true });
                mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });
                mockIsSlotAvailable.mockResolvedValue(true);
                mockGenerateConfirmationToken.mockReturnValue('ABC123');

                mockSupabaseAdmin.from().insert().select().single.mockResolvedValue({
                    data: null,
                    error: { message: 'Database connection failed' }
                });

                await handler(mockReq, mockRes);

                expect(mockHandleApiError).toHaveBeenCalled();
            });
        });

        describe('check_availability action', () => {
            beforeEach(() => {
                mockReq.body = {
                    action: 'check_availability',
                    appointmentData: {
                        appointment_date: '2024-01-15',
                        appointment_time: '09:00'
                    }
                };
            });

            it('should check slot availability', async () => {
                mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });
                mockIsSlotAvailable.mockResolvedValue(true);

                await handler(mockReq, mockRes);

                expect(mockIsSlotAvailable).toHaveBeenCalledWith('2024-01-15', '09:00');
                expect(mockRes.status).toHaveBeenCalledWith(200);
                expect(mockRes.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        data: expect.objectContaining({
                            available: true,
                            date: '2024-01-15',
                            time: '09:00'
                        })
                    })
                );
            });

            it('should return alternatives when slot is unavailable', async () => {
                mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });
                mockIsSlotAvailable.mockResolvedValue(false);
                mockGetAvailableSlotsForNextDays.mockResolvedValue({
                    '2024-01-15': [{ slot_time: '10:00' }],
                    '2024-01-16': [{ slot_time: '09:00' }]
                });

                await handler(mockReq, mockRes);

                expect(mockRes.json).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        data: expect.objectContaining({
                            available: false,
                            alternatives: expect.arrayContaining([
                                expect.objectContaining({
                                    date: '2024-01-15',
                                    time: '10:00'
                                })
                            ])
                        })
                    })
                );
            });
        });

        it('should return error for invalid action', async () => {
            mockReq.body = {
                action: 'invalid_action',
                sessionId: 'test-session'
            };

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'INVALID_ACTION'
                    })
                })
            );
        });
    });

    describe('Security', () => {
        it('should apply rate limiting', async () => {
            mockValidateRequest.mockReturnValue({
                allowed: false,
                type: 'rate_limit',
                message: 'Rate limit exceeded',
                retryAfter: 60,
                headers: { 'X-RateLimit-Remaining': '0' }
            });

            await handler(mockReq, mockRes);

            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', '0');
            expect(mockHandleApiError).toHaveBeenCalled();
        });

        it('should validate input security for POST requests', async () => {
            mockReq.method = 'POST';
            mockReq.body = { action: 'book', maliciousScript: '<script>alert("xss")</script>' };

            mockValidateSecurity.mockReturnValue({
                safe: false,
                threats: [{ type: 'XSS', confidence: 0.9 }],
                confidence: 0.9
            });

            await handler(mockReq, mockRes);

            expect(mockValidateSecurity).toHaveBeenCalledWith(mockReq.body);
            expect(mockLogEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'security_threat_detected',
                    severity: 'warn'
                })
            );
            expect(mockHandleApiError).toHaveBeenCalled();
        });

        it('should handle CORS preflight requests', async () => {
            mockReq.method = 'OPTIONS';

            await handler(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(204);
            expect(mockRes.end).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle method not allowed', async () => {
            mockReq.method = 'DELETE';

            await handler(mockReq, mockRes);

            expect(mockHandleApiError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Method not allowed'
                }),
                mockReq,
                mockRes,
                expect.objectContaining({
                    source: 'chatbot-appointment-api',
                    context: expect.objectContaining({
                        method: 'DELETE',
                        allowedMethods: ['GET', 'POST']
                    })
                })
            );
        });

        it('should handle unexpected errors', async () => {
            mockGetAvailableSlotsForNextDays.mockRejectedValue(new Error('Database connection failed'));

            await handler(mockReq, mockRes);

            expect(mockLogEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'api_error',
                    severity: 'error'
                })
            );
            expect(mockHandleApiError).toHaveBeenCalled();
        });
    });
});