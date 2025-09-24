/**
 * Comprehensive System Integration Tests for AI Chatbot Widget
 * Tests complete workflows including appointment booking, medical referrals, and LGPD compliance
 * Requirements: 2.1, 2.2, 3.1, 3.2, 5.1, 5.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatbotWidget } from '../../components/chatbot/ChatbotWidget';
import { geminiService } from '../../services/geminiService';
import { chatbotAppointmentService } from '../../services/chatbotAppointmentService';
import { lgpdPrivacyManager } from '../../services/lgpdPrivacyManager';
import { cfmComplianceEngine } from '../../services/cfmComplianceEngine';
import { conversationStateManager } from '../../services/conversationStateManager';

// Mock external services
vi.mock('../../services/geminiService');
vi.mock('../../services/chatbotAppointmentService');
vi.mock('../../services/lgpdPrivacyManager');
vi.mock('../../services/cfmComplianceEngine');
vi.mock('../../services/conversationStateManager');

describe('Chatbot System Integration Tests', () => {
    let user;
    let mockSessionId;

    beforeEach(() => {
        user = userEvent.setup();
        mockSessionId = 'test-session-123';

        // Reset all mocks
        vi.clearAllMocks();

        // Setup default mock responses
        conversationStateManager.createSession.mockResolvedValue({
            sessionId: mockSessionId,
            success: true
        });

        lgpdPrivacyManager.checkConsent.mockResolvedValue({
            hasConsent: true,
            consentTypes: ['data_processing', 'medical_data']
        });

        cfmComplianceEngine.validateResponse.mockResolvedValue({
            isCompliant: true,
            requiredDisclaimers: [],
            emergencyDetected: false,
            medicalAdviceDetected: false
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Complete Chatbot Workflow with Appointment Booking (Req 2.1, 2.2)', () => {
        it('should handle complete appointment booking workflow', async () => {
            // Mock appointment availability
            chatbotAppointmentService.checkAvailability.mockResolvedValue({
                success: true,
                availableSlots: [
                    {
                        id: 'slot-1',
                        date: '2024-01-15',
                        time: '10:00',
                        type: 'consultation'
                    },
                    {
                        id: 'slot-2',
                        date: '2024-01-15',
                        time: '14:00',
                        type: 'consultation'
                    }
                ]
            });

            // Mock Gemini responses for appointment flow
            geminiService.generateResponse
                .mockResolvedValueOnce({
                    content: 'Olá! Como posso ajudá-lo hoje? Posso agendar uma consulta para você.',
                    safetyRatings: [],
                    finishReason: 'STOP',
                    usage: { totalTokens: 50 }
                })
                .mockResolvedValueOnce({
                    content: 'Perfeito! Vou verificar os horários disponíveis para consulta. Que tipo de consulta você precisa?',
                    safetyRatings: [],
                    finishReason: 'STOP',
                    usage: { totalTokens: 75 }
                })
                .mockResolvedValueOnce({
                    content: 'Encontrei horários disponíveis. Você prefere manhã ou tarde?',
                    safetyRatings: [],
                    finishReason: 'STOP',
                    usage: { totalTokens: 60 }
                });

            // Mock appointment booking
            chatbotAppointmentService.bookAppointment.mockResolvedValue({
                success: true,
                appointmentId: 'apt-123',
                confirmationCode: 'CONF-456'
            });

            render(<ChatbotWidget />);

            // Wait for initial load
            await waitFor(() => {
                expect(screen.getByText(/como posso ajudá-lo/i)).toBeInTheDocument();
            });

            // User requests appointment
            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Gostaria de agendar uma consulta');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            // Wait for response
            await waitFor(() => {
                expect(screen.getByText(/verificar os horários disponíveis/i)).toBeInTheDocument();
            });

            // User specifies consultation type
            await user.type(messageInput, 'Consulta oftalmológica de rotina');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            // Wait for availability response
            await waitFor(() => {
                expect(screen.getByText(/horários disponíveis/i)).toBeInTheDocument();
            });

            // User selects time preference
            await user.type(messageInput, 'Prefiro pela manhã');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            // Verify appointment booking flow was triggered
            expect(chatbotAppointmentService.checkAvailability).toHaveBeenCalledWith({
                timePreferences: expect.any(String),
                appointmentType: expect.any(String)
            });

            // Verify conversation state management
            expect(conversationStateManager.updateConversation).toHaveBeenCalled();
        });

        it('should handle appointment booking with waitlist when no slots available', async () => {
            // Mock no availability
            chatbotAppointmentService.checkAvailability.mockResolvedValue({
                success: true,
                availableSlots: [],
                waitlistAvailable: true
            });

            geminiService.generateResponse.mockResolvedValue({
                content: 'Não temos horários disponíveis no momento, mas posso colocá-lo na lista de espera.',
                safetyRatings: [],
                finishReason: 'STOP',
                usage: { totalTokens: 80 }
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Preciso agendar uma consulta urgente');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/lista de espera/i)).toBeInTheDocument();
            });

            expect(chatbotAppointmentService.checkAvailability).toHaveBeenCalled();
        });
    });

    describe('Medical Referral System Validation (Req 3.1, 3.2)', () => {
        it('should validate medical referral workflow with compliance checks', async () => {
            // Mock referral service
            const mockReferralService = {
                processReferralRequest: vi.fn().mockResolvedValue({
                    success: true,
                    referralId: 'ref-123',
                    recommendedSpecialists: [
                        {
                            name: 'Dr. Silva',
                            specialty: 'Retina',
                            contact: '(11) 1234-5678'
                        }
                    ]
                })
            };

            // Mock CFM compliance for referral
            cfmComplianceEngine.validateResponse.mockResolvedValue({
                isCompliant: true,
                requiredDisclaimers: ['Esta é uma orientação inicial. Consulte sempre um médico.'],
                emergencyDetected: false,
                medicalAdviceDetected: true
            });

            geminiService.generateResponse
                .mockResolvedValueOnce({
                    content: 'Entendo que você precisa de um encaminhamento. Vou coletar algumas informações.',
                    safetyRatings: [],
                    finishReason: 'STOP',
                    usage: { totalTokens: 60 }
                })
                .mockResolvedValueOnce({
                    content: 'Com base nos sintomas relatados, recomendo consulta com especialista em retina. Esta é uma orientação inicial. Consulte sempre um médico.',
                    safetyRatings: [],
                    finishReason: 'STOP',
                    usage: { totalTokens: 90 }
                });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);

            // User requests referral
            await user.type(messageInput, 'Estou vendo pontos pretos na visão, preciso de encaminhamento');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/coletar algumas informações/i)).toBeInTheDocument();
            });

            // Provide additional symptoms
            await user.type(messageInput, 'Os pontos aparecem principalmente quando olho para o céu');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/especialista em retina/i)).toBeInTheDocument();
                expect(screen.getByText(/esta é uma orientação inicial/i)).toBeInTheDocument();
            });

            // Verify CFM compliance was checked
            expect(cfmComplianceEngine.validateResponse).toHaveBeenCalled();
        });

        it('should handle emergency detection in referral requests', async () => {
            cfmComplianceEngine.validateResponse.mockResolvedValue({
                isCompliant: true,
                requiredDisclaimers: ['EMERGÊNCIA MÉDICA DETECTADA'],
                emergencyDetected: true,
                medicalAdviceDetected: true
            });

            geminiService.generateResponse.mockResolvedValue({
                content: 'ATENÇÃO: Seus sintomas podem indicar uma emergência médica. Procure atendimento médico imediatamente ou ligue para 192.',
                safetyRatings: [],
                finishReason: 'STOP',
                usage: { totalTokens: 100 }
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Perdi a visão de repente no olho direito');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/emergência médica/i)).toBeInTheDocument();
                expect(screen.getByText(/192/i)).toBeInTheDocument();
            });

            expect(cfmComplianceEngine.validateResponse).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: expect.stringContaining('Perdi a visão')
                })
            );
        });
    });

    describe('LGPD Privacy Features and User Rights (Req 5.1, 5.4)', () => {
        it('should handle LGPD consent workflow', async () => {
            // Mock initial consent check as false
            lgpdPrivacyManager.checkConsent.mockResolvedValueOnce({
                hasConsent: false,
                consentTypes: []
            });

            lgpdPrivacyManager.requestConsent.mockResolvedValue({
                success: true,
                consentId: 'consent-123'
            });

            render(<ChatbotWidget />);

            // Should show consent notice
            await waitFor(() => {
                expect(screen.getByText(/política de privacidade/i)).toBeInTheDocument();
                expect(screen.getByText(/aceitar/i)).toBeInTheDocument();
            });

            // User accepts consent
            await user.click(screen.getByRole('button', { name: /aceitar/i }));

            await waitFor(() => {
                expect(lgpdPrivacyManager.requestConsent).toHaveBeenCalledWith({
                    sessionId: mockSessionId,
                    consentTypes: ['data_processing', 'medical_data'],
                    ipAddress: expect.any(String)
                });
            });
        });

        it('should handle user data deletion request', async () => {
            lgpdPrivacyManager.processDataDeletion.mockResolvedValue({
                success: true,
                deletionId: 'del-123',
                estimatedCompletion: '30 days'
            });

            geminiService.generateResponse.mockResolvedValue({
                content: 'Entendi que você deseja excluir seus dados. Vou processar sua solicitação conforme a LGPD.',
                safetyRatings: [],
                finishReason: 'STOP',
                usage: { totalTokens: 70 }
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Quero excluir todos os meus dados pessoais');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/excluir seus dados/i)).toBeInTheDocument();
            });

            expect(lgpdPrivacyManager.processDataDeletion).toHaveBeenCalledWith({
                sessionId: mockSessionId,
                requestType: 'complete_deletion'
            });
        });

        it('should handle user data export request', async () => {
            lgpdPrivacyManager.exportUserData.mockResolvedValue({
                success: true,
                exportId: 'exp-123',
                downloadUrl: 'https://example.com/export/exp-123'
            });

            geminiService.generateResponse.mockResolvedValue({
                content: 'Vou preparar a exportação dos seus dados. Você receberá um link para download em breve.',
                safetyRatings: [],
                finishReason: 'STOP',
                usage: { totalTokens: 65 }
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Gostaria de baixar uma cópia dos meus dados');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/exportação dos seus dados/i)).toBeInTheDocument();
            });

            expect(lgpdPrivacyManager.exportUserData).toHaveBeenCalledWith({
                sessionId: mockSessionId
            });
        });

        it('should handle consent withdrawal', async () => {
            lgpdPrivacyManager.withdrawConsent.mockResolvedValue({
                success: true,
                withdrawalId: 'with-123'
            });

            geminiService.generateResponse.mockResolvedValue({
                content: 'Seu consentimento foi retirado. Não processaremos mais seus dados pessoais.',
                safetyRatings: [],
                finishReason: 'STOP',
                usage: { totalTokens: 55 }
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Quero retirar meu consentimento para uso dos dados');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/consentimento foi retirado/i)).toBeInTheDocument();
            });

            expect(lgpdPrivacyManager.withdrawConsent).toHaveBeenCalledWith({
                sessionId: mockSessionId,
                consentTypes: ['data_processing', 'medical_data']
            });
        });
    });

    describe('End-to-End Integration Scenarios', () => {
        it('should handle complete patient journey from inquiry to appointment', async () => {
            // Setup mocks for complete journey
            geminiService.generateResponse
                .mockResolvedValueOnce({
                    content: 'Olá! Posso ajudá-lo com informações sobre nossos serviços ou agendar uma consulta.',
                    safetyRatings: [],
                    finishReason: 'STOP',
                    usage: { totalTokens: 50 }
                })
                .mockResolvedValueOnce({
                    content: 'Oferecemos consultas oftalmológicas completas, cirurgias de catarata, tratamento de glaucoma e muito mais.',
                    safetyRatings: [],
                    finishReason: 'STOP',
                    usage: { totalTokens: 70 }
                })
                .mockResolvedValueOnce({
                    content: 'Perfeito! Vou agendar uma consulta para você. Preciso de algumas informações.',
                    safetyRatings: [],
                    finishReason: 'STOP',
                    usage: { totalTokens: 60 }
                });

            chatbotAppointmentService.checkAvailability.mockResolvedValue({
                success: true,
                availableSlots: [
                    { id: 'slot-1', date: '2024-01-15', time: '10:00' }
                ]
            });

            chatbotAppointmentService.bookAppointment.mockResolvedValue({
                success: true,
                appointmentId: 'apt-123'
            });

            render(<ChatbotWidget />);

            // Initial greeting
            await waitFor(() => {
                expect(screen.getByText(/posso ajudá-lo/i)).toBeInTheDocument();
            });

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);

            // User asks about services
            await user.type(messageInput, 'Que tipos de consulta vocês fazem?');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/consultas oftalmológicas/i)).toBeInTheDocument();
            });

            // User decides to book
            await user.type(messageInput, 'Gostaria de agendar uma consulta');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/agendar uma consulta/i)).toBeInTheDocument();
            });

            // Verify all services were called in sequence
            expect(geminiService.generateResponse).toHaveBeenCalledTimes(3);
            expect(conversationStateManager.updateConversation).toHaveBeenCalled();
        });
    });
});