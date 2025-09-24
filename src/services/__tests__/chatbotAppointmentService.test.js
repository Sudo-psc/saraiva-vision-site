/**
 * Chatbot Appointment Service Tests
 * Tests for natural language appointment processing
 */

import { vi } from 'vitest';

// Mock dependencies
const mockGetAvailableSlots = vi.fn();
const mockGetAvailableSlotsForNextDays = vi.fn();
const mockValidateAppointmentDateTime = vi.fn();

vi.mock('../lib/appointmentAvailability.js', () => ({
    getAvailableSlots: mockGetAvailableSlots,
    getAvailableSlotsForNextDays: mockGetAvailableSlotsForNextDays,
    validateAppointmentDateTime: mockValidateAppointmentDateTime
}));

// Import the service after mocking
import chatbotAppointmentService from '../chatbotAppointmentService.js';

describe('ChatbotAppointmentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('detectAppointmentIntent', () => {
        it('should detect appointment intent with high confidence', () => {
            const message = 'Gostaria de agendar uma consulta';
            const result = chatbotAppointmentService.detectAppointmentIntent(message);

            expect(result.intentDetected).toBe(true);
            expect(result.confidence).toBeGreaterThan(0.7);
            expect(result.specificTimeRequested).toBe(false);
            expect(result.urgencyDetected).toBe(false);
        });

        it('should detect urgency in appointment requests', () => {
            const message = 'Preciso agendar uma consulta urgente para hoje';
            const result = chatbotAppointmentService.detectAppointmentIntent(message);

            expect(result.intentDetected).toBe(true);
            expect(result.urgencyDetected).toBe(true);
            expect(result.specificTimeRequested).toBe(true);
        });

        it('should extract time and date preferences', () => {
            const message = 'Quero marcar consulta para amanhã de manhã às 9h';
            const result = chatbotAppointmentService.detectAppointmentIntent(message);

            expect(result.intentDetected).toBe(true);
            expect(result.specificTimeRequested).toBe(true);
            expect(result.extractedInfo.timePreferences).toContain('morning');
            expect(result.extractedInfo.datePreferences).toHaveLength(1);
            expect(result.extractedInfo.datePreferences[0].display).toBe('amanhã');
        });

        it('should not detect intent in unrelated messages', () => {
            const message = 'Qual é o horário de funcionamento da clínica?';
            const result = chatbotAppointmentService.detectAppointmentIntent(message);

            expect(result.intentDetected).toBe(false);
            expect(result.confidence).toBeLessThan(0.5);
        });
    });

    describe('extractTimePreferences', () => {
        it('should extract morning preference', () => {
            const message = 'Prefiro pela manhã';
            const preferences = chatbotAppointmentService.extractTimePreferences(message);

            expect(preferences).toContain('morning');
        });

        it('should extract afternoon preference', () => {
            const message = 'Pode ser à tarde';
            const preferences = chatbotAppointmentService.extractTimePreferences(message);

            expect(preferences).toContain('afternoon');
        });

        it('should extract specific time', () => {
            const message = 'Às 14:30 seria perfeito';
            const preferences = chatbotAppointmentService.extractTimePreferences(message);

            expect(preferences).toContainEqual({
                type: 'specific_time',
                hour: 14,
                minute: 30,
                time: '14:30'
            });
        });

        it('should handle multiple time formats', () => {
            const message = 'Pode ser 9h ou 14:30';
            const preferences = chatbotAppointmentService.extractTimePreferences(message);

            expect(preferences).toContainEqual({
                type: 'specific_time',
                hour: 9,
                minute: 0,
                time: '09:00'
            });
            expect(preferences).toContainEqual({
                type: 'specific_time',
                hour: 14,
                minute: 30,
                time: '14:30'
            });
        });
    });

    describe('extractDatePreferences', () => {
        it('should extract relative dates', () => {
            const message = 'Pode ser amanhã ou depois de amanhã';
            const preferences = chatbotAppointmentService.extractDatePreferences(message);

            expect(preferences).toHaveLength(2);
            expect(preferences[0].type).toBe('relative');
            expect(preferences[0].display).toBe('amanhã');
            expect(preferences[1].display).toBe('depois de amanhã');
        });

        it('should extract weekday preferences', () => {
            const message = 'Prefiro na segunda ou terça-feira';
            const preferences = chatbotAppointmentService.extractDatePreferences(message);

            expect(preferences).toHaveLength(2);
            expect(preferences[0].type).toBe('weekday');
            expect(preferences[0].display).toBe('segunda-feira');
            expect(preferences[1].display).toBe('terça-feira');
        });

        it('should extract specific dates', () => {
            const message = 'Pode ser no dia 15/01 ou 20/01/2024';
            const preferences = chatbotAppointmentService.extractDatePreferences(message);

            expect(preferences).toHaveLength(2);
            expect(preferences[0].type).toBe('specific');
            expect(preferences[1].type).toBe('specific');
        });
    });

    describe('extractAppointmentType', () => {
        it('should extract consultation type', () => {
            const message = 'Quero agendar uma consulta';
            const type = chatbotAppointmentService.extractAppointmentType(message);

            expect(type).toBe('consultation');
        });

        it('should extract follow-up type', () => {
            const message = 'Preciso marcar um retorno';
            const type = chatbotAppointmentService.extractAppointmentType(message);

            expect(type).toBe('follow_up');
        });

        it('should extract examination type', () => {
            const message = 'Gostaria de fazer um exame';
            const type = chatbotAppointmentService.extractAppointmentType(message);

            expect(type).toBe('examination');
        });

        it('should default to consultation', () => {
            const message = 'Quero agendar algo';
            const type = chatbotAppointmentService.extractAppointmentType(message);

            expect(type).toBe('consultation');
        });
    });

    describe('processAppointmentRequest', () => {
        it('should handle initial appointment request', async () => {
            const message = 'Quero agendar uma consulta';
            const result = await chatbotAppointmentService.processAppointmentRequest(message);

            expect(result.success).toBe(true);
            expect(result.response).toContain('Vou ajudá-lo a agendar uma consulta');
            expect(result.nextStep).toBe('collecting_preferences');
            expect(result.suggestedActions).toHaveLength(3);
        });

        it('should show availability when preferences are provided', async () => {
            const message = 'Quero agendar para amanhã de manhã';

            const mockAvailability = {
                '2024-01-16': [
                    { slot_time: '09:00' },
                    { slot_time: '10:00' }
                ]
            };

            mockGetAvailableSlotsForNextDays.mockResolvedValue(mockAvailability);

            const result = await chatbotAppointmentService.processAppointmentRequest(message);

            expect(result.success).toBe(true);
            expect(result.response).toContain('Encontrei os seguintes horários disponíveis');
            expect(result.nextStep).toBe('showing_availability');
            expect(result.availabilityData).toEqual(mockAvailability);
        });

        it('should handle no availability found', async () => {
            const message = 'Quero agendar para amanhã de manhã';

            mockGetAvailableSlotsForNextDays.mockResolvedValue({});

            const result = await chatbotAppointmentService.processAppointmentRequest(message);

            expect(result.success).toBe(true);
            expect(result.response).toContain('Não encontrei horários disponíveis');
            expect(result.nextStep).toBe('collecting_preferences');
        });

        it('should collect patient details after slot selection', async () => {
            const message = 'Quero segunda-feira às 9:00';
            const conversationState = {
                appointmentStep: 'showing_availability',
                availableSlots: {
                    '2024-01-15': [{ slot_time: '09:00' }]
                }
            };

            mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });
            mockGetAvailableSlots.mockResolvedValue([{ slot_time: '09:00' }]);

            const result = await chatbotAppointmentService.processAppointmentRequest(
                message,
                conversationState
            );

            expect(result.success).toBe(true);
            expect(result.response).toContain('Agora preciso de alguns dados');
            expect(result.nextStep).toBe('collecting_details');
            expect(result.conversationState.selectedSlot).toBeDefined();
        });

        it('should confirm appointment when all details are collected', async () => {
            const message = 'João Silva, joao@example.com, 11999999999';
            const conversationState = {
                appointmentStep: 'collecting_details',
                selectedSlot: {
                    date: '2024-01-15',
                    time: '09:00',
                    displayDate: '15/01/2024',
                    displayTime: '09:00'
                },
                patientDetails: {}
            };

            const result = await chatbotAppointmentService.processAppointmentRequest(
                message,
                conversationState
            );

            expect(result.success).toBe(true);
            expect(result.response).toContain('Vou confirmar os dados');
            expect(result.nextStep).toBe('confirming_appointment');
            expect(result.conversationState.patientDetails.name).toBe('João Silva');
            expect(result.conversationState.patientDetails.email).toBe('joao@example.com');
        });

        it('should process final confirmation', async () => {
            const message = 'Sim, confirmo o agendamento';
            const conversationState = {
                appointmentStep: 'confirming_appointment',
                selectedSlot: {
                    date: '2024-01-15',
                    time: '09:00'
                },
                patientDetails: {
                    name: 'João Silva',
                    email: 'joao@example.com',
                    phone: '11999999999'
                },
                appointmentData: {
                    preferences: { appointmentType: 'consultation' }
                }
            };

            const result = await chatbotAppointmentService.processAppointmentRequest(
                message,
                conversationState
            );

            expect(result.success).toBe(true);
            expect(result.action).toBe('BOOK_APPOINTMENT');
            expect(result.appointmentData).toEqual({
                patient_name: 'João Silva',
                patient_email: 'joao@example.com',
                patient_phone: '11999999999',
                appointment_date: '2024-01-15',
                appointment_time: '09:00',
                notes: 'Agendado via chatbot - Tipo: consultation'
            });
        });

        it('should handle correction requests', async () => {
            const message = 'Preciso corrigir alguns dados';
            const conversationState = {
                appointmentStep: 'confirming_appointment'
            };

            const result = await chatbotAppointmentService.processAppointmentRequest(
                message,
                conversationState
            );

            expect(result.success).toBe(true);
            expect(result.response).toContain('Vamos corrigir os dados');
            expect(result.nextStep).toBe('collecting_details');
            expect(result.conversationState.patientDetails).toEqual({});
        });
    });

    describe('parseSlotSelection', () => {
        it('should parse slot selection with date and time', () => {
            const message = 'Quero segunda-feira às 9:00';
            const availableSlots = {
                '2024-01-15': [{ slot_time: '09:00' }, { slot_time: '10:00' }]
            };

            const result = chatbotAppointmentService.parseSlotSelection(message, availableSlots);

            expect(result).toEqual({
                date: '2024-01-15',
                time: '09:00',
                displayDate: expect.any(String),
                displayTime: '09:00'
            });
        });

        it('should return null for invalid selection', () => {
            const message = 'Não sei qual escolher';
            const availableSlots = {
                '2024-01-15': [{ slot_time: '09:00' }]
            };

            const result = chatbotAppointmentService.parseSlotSelection(message, availableSlots);

            expect(result).toBeNull();
        });
    });

    describe('extractPatientDetails', () => {
        it('should extract name, email, and phone', () => {
            const message = 'Meu nome é João Silva, email joao@example.com e telefone (11) 99999-9999';
            const details = chatbotAppointmentService.extractPatientDetails(message);

            expect(details.name).toBe('João Silva');
            expect(details.email).toBe('joao@example.com');
            expect(details.phone).toBe('11999999999');
        });

        it('should extract partial information', () => {
            const message = 'joao@example.com';
            const details = chatbotAppointmentService.extractPatientDetails(message);

            expect(details.email).toBe('joao@example.com');
            expect(details.name).toBeUndefined();
            expect(details.phone).toBeUndefined();
        });

        it('should handle different phone formats', () => {
            const message1 = '11 99999-9999';
            const message2 = '(11) 99999-9999';
            const message3 = '11999999999';

            const details1 = chatbotAppointmentService.extractPatientDetails(message1);
            const details2 = chatbotAppointmentService.extractPatientDetails(message2);
            const details3 = chatbotAppointmentService.extractPatientDetails(message3);

            expect(details1.phone).toBe('11999999999');
            expect(details2.phone).toBe('11999999999');
            expect(details3.phone).toBe('11999999999');
        });
    });

    describe('filterAvailabilityByTimePreferences', () => {
        const mockAvailability = {
            '2024-01-15': [
                { slot_time: '09:00' },
                { slot_time: '14:00' },
                { slot_time: '17:00' }
            ]
        };

        it('should filter by morning preference', () => {
            const filtered = chatbotAppointmentService.filterAvailabilityByTimePreferences(
                mockAvailability,
                ['morning']
            );

            expect(filtered['2024-01-15']).toHaveLength(1);
            expect(filtered['2024-01-15'][0].slot_time).toBe('09:00');
        });

        it('should filter by afternoon preference', () => {
            const filtered = chatbotAppointmentService.filterAvailabilityByTimePreferences(
                mockAvailability,
                ['afternoon']
            );

            expect(filtered['2024-01-15']).toHaveLength(2);
            expect(filtered['2024-01-15'][0].slot_time).toBe('14:00');
            expect(filtered['2024-01-15'][1].slot_time).toBe('17:00');
        });

        it('should filter by specific time', () => {
            const filtered = chatbotAppointmentService.filterAvailabilityByTimePreferences(
                mockAvailability,
                [{ type: 'specific_time', hour: 14 }]
            );

            expect(filtered['2024-01-15']).toHaveLength(1);
            expect(filtered['2024-01-15'][0].slot_time).toBe('14:00');
        });
    });

    describe('formatAvailabilityForDisplay', () => {
        it('should format availability for chat display', () => {
            const availability = {
                '2024-01-15': [
                    { slot_time: '09:00' },
                    { slot_time: '10:00' },
                    { slot_time: '14:00' }
                ],
                '2024-01-16': [
                    { slot_time: '15:00' }
                ]
            };

            const formatted = chatbotAppointmentService.formatAvailabilityForDisplay(availability);

            expect(formatted).toContain('📅');
            expect(formatted).toContain('⏰');
            expect(formatted).toContain('09:00, 10:00, 14:00');
            expect(formatted).toContain('15:00');
        });

        it('should limit displayed slots and show count', () => {
            const availability = {
                '2024-01-15': [
                    { slot_time: '09:00' },
                    { slot_time: '10:00' },
                    { slot_time: '11:00' },
                    { slot_time: '14:00' },
                    { slot_time: '15:00' },
                    { slot_time: '16:00' }
                ]
            };

            const formatted = chatbotAppointmentService.formatAvailabilityForDisplay(availability);

            expect(formatted).toContain('e mais 2 horários');
        });
    });

    describe('validateSlotAvailability', () => {
        it('should validate available slot', async () => {
            mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });
            mockGetAvailableSlots.mockResolvedValue([{ slot_time: '09:00' }]);

            const isValid = await chatbotAppointmentService.validateSlotAvailability('2024-01-15', '09:00');

            expect(isValid).toBe(true);
            expect(mockGetAvailableSlots).toHaveBeenCalledWith('2024-01-15');
        });

        it('should return false for unavailable slot', async () => {
            mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });
            mockGetAvailableSlots.mockResolvedValue([{ slot_time: '10:00' }]);

            const isValid = await chatbotAppointmentService.validateSlotAvailability('2024-01-15', '09:00');

            expect(isValid).toBe(false);
        });

        it('should return false for invalid date/time', async () => {
            mockValidateAppointmentDateTime.mockReturnValue({ isValid: false });

            const isValid = await chatbotAppointmentService.validateSlotAvailability('invalid-date', '09:00');

            expect(isValid).toBe(false);
        });

        it('should handle errors gracefully', async () => {
            mockValidateAppointmentDateTime.mockReturnValue({ isValid: true });
            mockGetAvailableSlots.mockRejectedValue(new Error('Database error'));

            const isValid = await chatbotAppointmentService.validateSlotAvailability('2024-01-15', '09:00');

            expect(isValid).toBe(false);
        });
    });

    describe('getServiceStatistics', () => {
        it('should return service statistics', () => {
            const stats = chatbotAppointmentService.getServiceStatistics();

            expect(stats).toEqual({
                service: 'ChatbotAppointmentService',
                supportedIntents: expect.any(Number),
                timePreferences: expect.any(Number),
                appointmentSteps: expect.any(Number),
                status: 'active'
            });
        });
    });
});