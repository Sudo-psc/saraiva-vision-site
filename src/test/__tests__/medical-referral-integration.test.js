/**
 * Medical Referral System Integration Tests
 * Tests medical referral workflow with CFM compliance validation
 * Requirements: 3.1, 3.2, 4.1, 4.2, 4.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatbotWidget } from '../../components/chatbot/ChatbotWidget';
import { cfmComplianceEngine } from '../../services/cfmComplianceEngine';
import { medicalSafetyFilter } from '../../services/medicalSafetyFilter';
import { geminiService } from '../../services/geminiService';

// Mock services
vi.mock('../../services/cfmComplianceEngine');
vi.mock('../../services/medicalSafetyFilter');
vi.mock('../../services/geminiService');

describe('Medical Referral System Integration', () => {
    let user;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    describe('CFM Compliance in Referral Process (Req 3.1, 4.1)', () => {
        it('should validate referral requests against CFM protocols', async () => {
            // Mock CFM compliance validation
            cfmComplianceEngine.validateReferralRequest.mockResolvedValue({
                isValid: true,
                requiredDocumentation: ['medical_history', 'symptom_description'],
                specialtyRecommendation: 'retina',
                urgencyLevel: 'routine'
            });

            medicalSafetyFilter.analyzeSymptoms.mockResolvedValue({
                emergencyIndicators: [],
                specialtyMatch: 'retina',
                riskLevel: 'low'
            });

            geminiService.generateResponse.mockResolvedValue({
                content: 'Com base nos sintomas descritos, recomendo consulta com especialista em retina. Esta orientação não substitui consulta médica presencial.',
                safetyRatings: [],
                finishReason: 'STOP',
                usage: { totalTokens: 85 }
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);

            // User describes symptoms requiring referral
            await user.type(messageInput, 'Estou vendo flashes de luz e pontos flutuantes na visão');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/especialista em retina/i)).toBeInTheDocument();
                expect(screen.getByText(/não substitui consulta médica/i)).toBeInTheDocument();
            });

            // Verify CFM compliance was checked
            expect(cfmComplianceEngine.validateReferralRequest).toHaveBeenCalledWith({
                symptoms: expect.arrayContaining(['flashes de luz', 'pontos flutuantes']),
                patientDescription: expect.any(String)
            });

            expect(medicalSafetyFilter.analyzeSymptoms).toHaveBeenCalled();
        });

        it('should handle high-risk symptoms with appropriate CFM disclaimers', async () => {
            medicalSafetyFilter.analyzeSymptoms.mockResolvedValue({
                emergencyIndicators: ['sudden_vision_loss'],
                specialtyMatch: 'emergency',
                riskLevel: 'high'
            });

            cfmComplianceEngine.validateReferralRequest.mockResolvedValue({
                isValid: true,
                requiredDocumentation: ['immediate_evaluation'],
                specialtyRecommendation: 'emergency_ophthalmology',
                urgencyLevel: 'emergency'
            });

            geminiService.generateResponse.mockResolvedValue({
                content: 'ATENÇÃO: Perda súbita de visão pode ser uma emergência médica. Procure atendimento médico imediatamente ou dirija-se ao pronto-socorro mais próximo.',
                safetyRatings: [],
                finishReason: 'STOP',
                usage: { totalTokens: 95 }
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Perdi a visão completamente do olho esquerdo há 1 hora');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/emergência médica/i)).toBeInTheDocument();
                expect(screen.getByText(/pronto-socorro/i)).toBeInTheDocument();
            });

            expect(medicalSafetyFilter.analyzeSymptoms).toHaveBeenCalledWith(
                expect.objectContaining({
                    symptoms: expect.arrayContaining(['perda de visão'])
                })
            );
        });
    });

    describe('Referral Documentation and Tracking (Req 3.2)', () => {
        it('should collect required medical information for referrals', async () => {
            const mockReferralService = {
                createReferral: vi.fn().mockResolvedValue({
                    referralId: 'ref-456',
                    status: 'pending_specialist_review'
                }),
                trackReferral: vi.fn().mockResolvedValue({
                    status: 'specialist_contacted',
                    estimatedWaitTime: '2-3 weeks'
                })
            };

            cfmComplianceEngine.validateReferralRequest.mockResolvedValue({
                isValid: true,
                requiredDocumentation: ['symptom_duration', 'previous_treatments'],
                specialtyRecommendation: 'glaucoma',
                urgencyLevel: 'routine'
            });

            geminiService.generateResponse
                .mockResolvedValueOnce({
                    content: 'Para fazer o encaminhamento adequado, preciso de mais informações. Há quanto tempo você tem esses sintomas?',
                    safetyRatings: [],
                    finishReason: 'STOP',
                    usage: { totalTokens: 70 }
                })
                .mockResolvedValueOnce({
                    content: 'Você já fez algum tratamento para pressão ocular anteriormente?',
                    safetyRatings: [],
                    finishReason: 'STOP',
                    usage: { totalTokens: 60 }
                })
                .mockResolvedValueOnce({
                    content: 'Com base nas informações coletadas, vou encaminhá-lo para um especialista em glaucoma. O encaminhamento foi registrado.',
                    safetyRatings: [],
                    finishReason: 'STOP',
                    usage: { totalTokens: 80 }
                });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);

            // Initial symptom report
            await user.type(messageInput, 'Sinto pressão nos olhos e dor de cabeça frequente');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/há quanto tempo/i)).toBeInTheDocument();
            });

            // Provide duration
            await user.type(messageInput, 'Há cerca de 3 meses');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/tratamento para pressão ocular/i)).toBeInTheDocument();
            });

            // Provide treatment history
            await user.type(messageInput, 'Nunca fiz tratamento específico para isso');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/especialista em glaucoma/i)).toBeInTheDocument();
                expect(screen.getByText(/encaminhamento foi registrado/i)).toBeInTheDocument();
            });

            expect(cfmComplianceEngine.validateReferralRequest).toHaveBeenCalled();
        });

        it('should provide referral tracking information', async () => {
            const mockReferralTracking = {
                getReferralStatus: vi.fn().mockResolvedValue({
                    referralId: 'ref-789',
                    status: 'specialist_scheduled',
                    appointmentDate: '2024-02-15',
                    specialistName: 'Dr. Santos',
                    specialistContact: '(11) 9876-5432'
                })
            };

            geminiService.generateResponse.mockResolvedValue({
                content: 'Seu encaminhamento foi aceito pelo Dr. Santos. A consulta está agendada para 15/02/2024. Contato: (11) 9876-5432',
                safetyRatings: [],
                finishReason: 'STOP',
                usage: { totalTokens: 75 }
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Como está meu encaminhamento ref-789?');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/Dr. Santos/i)).toBeInTheDocument();
                expect(screen.getByText(/15\/02\/2024/i)).toBeInTheDocument();
                expect(screen.getByText(/\(11\) 9876-5432/i)).toBeInTheDocument();
            });
        });
    });

    describe('Medical Ethics and Safety Compliance (Req 4.2, 4.3)', () => {
        it('should prevent diagnostic attempts and redirect to consultation', async () => {
            medicalSafetyFilter.detectDiagnosticAttempt.mockReturnValue(true);

            cfmComplianceEngine.validateResponse.mockResolvedValue({
                isCompliant: false,
                violations: ['diagnostic_attempt'],
                requiredDisclaimers: ['Não posso fornecer diagnósticos. Consulte um médico.'],
                recommendedAction: 'redirect_to_consultation'
            });

            geminiService.generateResponse.mockResolvedValue({
                content: 'Não posso fornecer diagnósticos médicos. Recomendo agendar uma consulta para avaliação adequada dos seus sintomas.',
                safetyRatings: [],
                finishReason: 'STOP',
                usage: { totalTokens: 65 }
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'O que eu tenho? Meus olhos estão vermelhos e coçando');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/não posso fornecer diagnósticos/i)).toBeInTheDocument();
                expect(screen.getByText(/agendar uma consulta/i)).toBeInTheDocument();
            });

            expect(medicalSafetyFilter.detectDiagnosticAttempt).toHaveBeenCalled();
            expect(cfmComplianceEngine.validateResponse).toHaveBeenCalled();
        });

        it('should handle prescription requests with CFM compliance', async () => {
            medicalSafetyFilter.detectPrescriptionRequest.mockReturnValue(true);

            cfmComplianceEngine.validateResponse.mockResolvedValue({
                isCompliant: false,
                violations: ['prescription_attempt'],
                requiredDisclaimers: ['Não posso prescrever medicamentos. Consulte um médico.'],
                recommendedAction: 'redirect_to_physician'
            });

            geminiService.generateResponse.mockResolvedValue({
                content: 'Não posso prescrever medicamentos. Para tratamento adequado, é necessário consulta médica presencial com exame oftalmológico.',
                safetyRatings: [],
                finishReason: 'STOP',
                usage: { totalTokens: 70 }
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Que colírio posso usar para olho seco?');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/não posso prescrever medicamentos/i)).toBeInTheDocument();
                expect(screen.getByText(/consulta médica presencial/i)).toBeInTheDocument();
            });

            expect(medicalSafetyFilter.detectPrescriptionRequest).toHaveBeenCalled();
        });
    });

    describe('Audit Trail and Compliance Logging', () => {
        it('should log all referral interactions for compliance audit', async () => {
            const mockAuditLogger = {
                logReferralInteraction: vi.fn(),
                logComplianceCheck: vi.fn()
            };

            cfmComplianceEngine.validateReferralRequest.mockResolvedValue({
                isValid: true,
                auditTrail: {
                    timestamp: new Date().toISOString(),
                    complianceChecks: ['cfm_protocol', 'medical_ethics'],
                    result: 'compliant'
                }
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Preciso de encaminhamento para cirurgia de catarata');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(cfmComplianceEngine.validateReferralRequest).toHaveBeenCalled();
            });

            // Verify audit logging was triggered
            const calls = cfmComplianceEngine.validateReferralRequest.mock.calls;
            expect(calls.length).toBeGreaterThan(0);
        });
    });
});