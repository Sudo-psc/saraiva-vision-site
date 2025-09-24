/**
 * LGPD Privacy Integration Tests
 * Tests LGPD compliance features and user rights fulfillment
 * Requirements: 5.1, 5.4, 5.2, 5.3, 5.5, 5.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatbotWidget } from '../../components/chatbot/ChatbotWidget';
import { lgpdPrivacyManager } from '../../services/lgpdPrivacyManager';
import { dataEncryptionService } from '../../services/dataEncryptionService';
import { auditLoggingService } from '../../services/auditLoggingService';

// Mock services
vi.mock('../../services/lgpdPrivacyManager');
vi.mock('../../services/dataEncryptionService');
vi.mock('../../services/auditLoggingService');

describe('LGPD Privacy Integration Tests', () => {
    let user;
    let mockSessionId;

    beforeEach(() => {
        user = userEvent.setup();
        mockSessionId = 'test-session-lgpd-123';
        vi.clearAllMocks();

        // Setup default mocks
        dataEncryptionService.encrypt.mockImplementation((data) => `encrypted_${data}`);
        dataEncryptionService.decrypt.mockImplementation((data) => data.replace('encrypted_', ''));

        auditLoggingService.logDataAccess.mockResolvedValue({ success: true });
        auditLoggingService.logConsentAction.mockResolvedValue({ success: true });
    });

    describe('Consent Management (Req 5.1)', () => {
        it('should present clear privacy notices and obtain explicit consent', async () => {
            lgpdPrivacyManager.checkConsent.mockResolvedValue({
                hasConsent: false,
                consentTypes: [],
                requiresConsent: true
            });

            lgpdPrivacyManager.getPrivacyNotice.mockResolvedValue({
                notice: 'Coletamos seus dados para fornecer assistência médica. Seus dados serão protegidos conforme a LGPD.',
                consentOptions: [
                    { type: 'data_processing', description: 'Processamento de dados pessoais' },
                    { type: 'medical_data', description: 'Processamento de dados de saúde' },
                    { type: 'communication', description: 'Comunicação sobre consultas' }
                ]
            });

            lgpdPrivacyManager.recordConsent.mockResolvedValue({
                success: true,
                consentId: 'consent-123',
                timestamp: new Date().toISOString()
            });

            render(<ChatbotWidget />);

            // Should show privacy notice immediately
            await waitFor(() => {
                expect(screen.getByText(/política de privacidade/i)).toBeInTheDocument();
                expect(screen.getByText(/dados serão protegidos/i)).toBeInTheDocument();
            });

            // Should show consent options
            expect(screen.getByText(/processamento de dados pessoais/i)).toBeInTheDocument();
            expect(screen.getByText(/dados de saúde/i)).toBeInTheDocument();

            // User provides consent
            const dataProcessingCheckbox = screen.getByLabelText(/processamento de dados pessoais/i);
            const medicalDataCheckbox = screen.getByLabelText(/dados de saúde/i);

            await user.click(dataProcessingCheckbox);
            await user.click(medicalDataCheckbox);
            await user.click(screen.getByRole('button', { name: /aceitar/i }));

            await waitFor(() => {
                expect(lgpdPrivacyManager.recordConsent).toHaveBeenCalledWith({
                    sessionId: mockSessionId,
                    consentTypes: ['data_processing', 'medical_data'],
                    ipAddress: expect.any(String),
                    userAgent: expect.any(String),
                    timestamp: expect.any(String)
                });
            });

            expect(auditLoggingService.logConsentAction).toHaveBeenCalledWith({
                action: 'consent_granted',
                sessionId: mockSessionId,
                consentTypes: ['data_processing', 'medical_data']
            });
        });

        it('should handle consent withdrawal requests', async () => {
            lgpdPrivacyManager.checkConsent.mockResolvedValue({
                hasConsent: true,
                consentTypes: ['data_processing', 'medical_data']
            });

            lgpdPrivacyManager.withdrawConsent.mockResolvedValue({
                success: true,
                withdrawalId: 'withdrawal-456',
                effectiveDate: new Date().toISOString()
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Quero retirar meu consentimento para uso dos meus dados');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/retirar consentimento/i)).toBeInTheDocument();
            });

            // Confirm withdrawal
            const confirmButton = screen.getByRole('button', { name: /confirmar retirada/i });
            await user.click(confirmButton);

            await waitFor(() => {
                expect(lgpdPrivacyManager.withdrawConsent).toHaveBeenCalledWith({
                    sessionId: mockSessionId,
                    consentTypes: ['data_processing', 'medical_data'],
                    reason: 'user_request'
                });
            });

            expect(auditLoggingService.logConsentAction).toHaveBeenCalledWith({
                action: 'consent_withdrawn',
                sessionId: mockSessionId,
                withdrawalId: 'withdrawal-456'
            });
        });
    });

    describe('Data Subject Rights (Req 5.4)', () => {
        it('should handle data portability requests', async () => {
            lgpdPrivacyManager.exportUserData.mockResolvedValue({
                success: true,
                exportId: 'export-789',
                downloadUrl: 'https://secure.example.com/export/export-789',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                dataTypes: ['conversations', 'appointments', 'preferences']
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Gostaria de baixar uma cópia de todos os meus dados');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/exportação dos dados/i)).toBeInTheDocument();
            });

            // Confirm export request
            const confirmButton = screen.getByRole('button', { name: /solicitar exportação/i });
            await user.click(confirmButton);

            await waitFor(() => {
                expect(lgpdPrivacyManager.exportUserData).toHaveBeenCalledWith({
                    sessionId: mockSessionId,
                    dataTypes: ['conversations', 'appointments', 'preferences'],
                    format: 'json'
                });
            });

            // Should show download information
            expect(screen.getByText(/link para download/i)).toBeInTheDocument();
            expect(screen.getByText(/24 horas/i)).toBeInTheDocument();
        });

        it('should handle data rectification requests', async () => {
            lgpdPrivacyManager.updateUserData.mockResolvedValue({
                success: true,
                updateId: 'update-321',
                updatedFields: ['name', 'email']
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Preciso corrigir meu nome nos registros');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/corrigir dados/i)).toBeInTheDocument();
            });

            // Provide correction details
            const nameInput = screen.getByLabelText(/nome correto/i);
            await user.type(nameInput, 'João Silva Santos');

            const submitButton = screen.getByRole('button', { name: /enviar correção/i });
            await user.click(submitButton);

            await waitFor(() => {
                expect(lgpdPrivacyManager.updateUserData).toHaveBeenCalledWith({
                    sessionId: mockSessionId,
                    updates: {
                        name: 'João Silva Santos'
                    },
                    reason: 'data_rectification'
                });
            });

            expect(auditLoggingService.logDataAccess).toHaveBeenCalledWith({
                action: 'data_updated',
                sessionId: mockSessionId,
                fields: ['name']
            });
        });

        it('should handle complete data deletion requests', async () => {
            lgpdPrivacyManager.processDataDeletion.mockResolvedValue({
                success: true,
                deletionId: 'deletion-654',
                estimatedCompletion: '30 days',
                dataTypes: ['conversations', 'personal_info', 'medical_data'],
                confirmationRequired: true
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Quero excluir permanentemente todos os meus dados');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/exclusão permanente/i)).toBeInTheDocument();
                expect(screen.getByText(/30 dias/i)).toBeInTheDocument();
            });

            // Show confirmation dialog
            expect(screen.getByText(/esta ação não pode ser desfeita/i)).toBeInTheDocument();

            const confirmDeletionButton = screen.getByRole('button', { name: /confirmar exclusão/i });
            await user.click(confirmDeletionButton);

            await waitFor(() => {
                expect(lgpdPrivacyManager.processDataDeletion).toHaveBeenCalledWith({
                    sessionId: mockSessionId,
                    deletionType: 'complete',
                    reason: 'user_request',
                    confirmed: true
                });
            });

            expect(auditLoggingService.logDataAccess).toHaveBeenCalledWith({
                action: 'data_deletion_requested',
                sessionId: mockSessionId,
                deletionId: 'deletion-654'
            });
        });
    });

    describe('Data Encryption and Security (Req 5.2, 5.3)', () => {
        it('should encrypt sensitive data before storage', async () => {
            lgpdPrivacyManager.checkConsent.mockResolvedValue({
                hasConsent: true,
                consentTypes: ['data_processing', 'medical_data']
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Meu nome é João Silva e meu CPF é 123.456.789-00');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(dataEncryptionService.encrypt).toHaveBeenCalledWith(
                    expect.stringContaining('João Silva')
                );
                expect(dataEncryptionService.encrypt).toHaveBeenCalledWith(
                    expect.stringContaining('123.456.789-00')
                );
            });

            expect(auditLoggingService.logDataAccess).toHaveBeenCalledWith({
                action: 'sensitive_data_processed',
                sessionId: mockSessionId,
                dataTypes: ['personal_info']
            });
        });

        it('should handle data retention periods correctly', async () => {
            const retentionDate = new Date();
            retentionDate.setFullYear(retentionDate.getFullYear() + 2);

            lgpdPrivacyManager.setDataRetention.mockResolvedValue({
                success: true,
                retentionUntil: retentionDate.toISOString(),
                retentionPeriod: '2 years'
            });

            lgpdPrivacyManager.checkDataRetention.mockResolvedValue({
                isValid: true,
                retentionUntil: retentionDate.toISOString(),
                daysRemaining: 730
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Por quanto tempo vocês guardam meus dados?');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(screen.getByText(/2 anos/i)).toBeInTheDocument();
            });

            expect(lgpdPrivacyManager.checkDataRetention).toHaveBeenCalledWith({
                sessionId: mockSessionId
            });
        });
    });

    describe('Privacy Impact Assessment (Req 5.5)', () => {
        it('should conduct privacy impact assessment for medical data processing', async () => {
            const mockPIA = {
                assessPrivacyImpact: vi.fn().mockResolvedValue({
                    riskLevel: 'medium',
                    identifiedRisks: [
                        'medical_data_processing',
                        'third_party_sharing'
                    ],
                    mitigationMeasures: [
                        'end_to_end_encryption',
                        'access_controls',
                        'audit_logging'
                    ],
                    complianceStatus: 'compliant'
                })
            };

            lgpdPrivacyManager.conductPrivacyImpactAssessment = mockPIA.assessPrivacyImpact;

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);
            await user.type(messageInput, 'Tenho diabetes e problemas de visão relacionados');
            await user.click(screen.getByRole('button', { name: /enviar/i }));

            await waitFor(() => {
                expect(mockPIA.assessPrivacyImpact).toHaveBeenCalledWith({
                    dataTypes: ['medical_data', 'health_conditions'],
                    processingPurpose: 'medical_assistance',
                    sessionId: mockSessionId
                });
            });

            expect(auditLoggingService.logDataAccess).toHaveBeenCalledWith({
                action: 'privacy_impact_assessed',
                sessionId: mockSessionId,
                riskLevel: 'medium'
            });
        });
    });

    describe('Cross-Border Data Transfer (Req 5.6)', () => {
        it('should handle international data transfer restrictions', async () => {
            lgpdPrivacyManager.checkDataTransferRestrictions.mockResolvedValue({
                canTransfer: false,
                restrictions: ['medical_data_restriction', 'no_adequacy_decision'],
                requiredSafeguards: ['standard_contractual_clauses', 'encryption']
            });

            render(<ChatbotWidget />);

            const messageInput = screen.getByPlaceholderText / digite sua mensagem/i);
        await user.type(messageInput, 'Posso acessar meus dados quando estiver no exterior?');
        await user.click(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() => {
            expect(screen.getByText(/acesso no exterior/i)).toBeInTheDocument();
            expect(screen.getByText(/restrições aplicáveis/i)).toBeInTheDocument();
        });

        expect(lgpdPrivacyManager.checkDataTransferRestrictions).toHaveBeenCalledWith({
            sessionId: mockSessionId,
            requestOrigin: 'international'
        });
    });
});

describe('Audit and Compliance Monitoring', () => {
    it('should maintain comprehensive audit logs for LGPD compliance', async () => {
        lgpdPrivacyManager.generateComplianceReport.mockResolvedValue({
            reportId: 'report-999',
            period: '2024-01',
            consentActions: 15,
            dataRequests: 8,
            deletionRequests: 2,
            complianceScore: 98
        });

        render(<ChatbotWidget />);

        // Simulate various LGPD-related actions
        const messageInput = screen.getByPlaceholderText(/digite sua mensagem/i);

        // Data access request
        await user.type(messageInput, 'Quais dados vocês têm sobre mim?');
        await user.click(screen.getByRole('button', { name: /enviar/i }));

        await waitFor(() => {
            expect(auditLoggingService.logDataAccess).toHaveBeenCalledWith({
                action: 'data_access_requested',
                sessionId: mockSessionId
            });
        });

        // Verify comprehensive logging
        expect(auditLoggingService.logDataAccess).toHaveBeenCalled();
        expect(auditLoggingService.logConsentAction).toHaveBeenCalled();
    });
});
});