/**
 * Comprehensive LGPD Privacy Manager Tests
 * Requirements: 5.1, 5.2, 5.3 - LGPD privacy and data protection
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import LGPDPrivacyManager from '../lgpdPrivacyManager.js';
import DataEncryptionService from '../dataEncryptionService.js';

describe('LGPD Privacy Manager - Comprehensive Tests', () => {
    let privacyManager;
    let encryptionService;
    let mockDatabase;

    beforeEach(() => {
        privacyManager = new LGPDPrivacyManager();
        encryptionService = new DataEncryptionService();

        // Mock database operations
        mockDatabase = {
            consents: new Map(),
            userData: new Map(),
            auditLogs: [],
            retentionSchedule: new Map()
        };

        // Mock database methods
        privacyManager.storeConsentRecord = vi.fn().mockImplementation(async (consent) => {
            const id = `consent_${Date.now()}`;
            mockDatabase.consents.set(id, { ...consent, id });
            return { id, success: true };
        });

        privacyManager.getConsentRecord = vi.fn().mockImplementation(async (sessionId, consentType) => {
            for (const [id, consent] of mockDatabase.consents) {
                if (consent.sessionId === sessionId && consent.consentType === consentType) {
                    return consent;
                }
            }
            return null;
        });

        privacyManager.storeUserData = vi.fn().mockImplementation(async (data) => {
            const id = `user_${Date.now()}`;
            mockDatabase.userData.set(id, { ...data, id });
            return { id, success: true };
        });

        privacyManager.logAuditEvent = vi.fn().mockImplementation(async (event) => {
            mockDatabase.auditLogs.push({ ...event, timestamp: new Date() });
            return { success: true };
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('LGPD Article 8 - Consent Management (Requirement 5.1)', () => {
        it('should require explicit consent for data processing', async () => {
            const sessionId = 'test_session_123';
            const consentType = privacyManager.consentTypes.DATA_PROCESSING;
            const purpose = privacyManager.processingPurposes.CHATBOT_INTERACTION;

            const result = await privacyManager.validateConsent(sessionId, consentType, purpose);

            expect(result.consentRequired).toBe(true);
            expect(result.actions).toContain('REQUEST_INITIAL_CONSENT');
            expect(result.legalBasis).toBe(privacyManager.legalBases.CONSENT);
        });

        it('should record consent with all required information', async () => {
            const consentData = {
                sessionId: 'test_session_123',
                consentType: privacyManager.consentTypes.DATA_PROCESSING,
                granted: true,
                purpose: privacyManager.processingPurposes.CHATBOT_INTERACTION,
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0 Test Browser',
                consentText: 'Eu concordo com o processamento dos meus dados para interação com o chatbot',
                timestamp: new Date().toISOString()
            };

            const result = await privacyManager.recordConsent(consentData);

            expect(result.success).toBe(true);
            expect(result.consentId).toBeDefined();
            expect(result.expiresAt).toBeDefined();
            expect(result.rights).toBeDefined();

            // Verify consent was stored with all required fields
            expect(privacyManager.storeConsentRecord).toHaveBeenCalledWith(
                expect.objectContaining({
                    sessionId: consentData.sessionId,
                    consentType: consentData.consentType,
                    granted: true,
                    ipAddress: consentData.ipAddress,
                    userAgent: consentData.userAgent,
                    consentText: consentData.consentText
                })
            );
        });

        it('should validate consent specificity and granularity', async () => {
            const specificConsents = [
                {
                    type: privacyManager.consentTypes.DATA_PROCESSING,
                    purpose: privacyManager.processingPurposes.CHATBOT_INTERACTION,
                    dataCategories: ['conversation_data', 'session_data']
                },
                {
                    type: privacyManager.consentTypes.MEDICAL_DATA,
                    purpose: privacyManager.processingPurposes.APPOINTMENT_BOOKING,
                    dataCategories: ['personal_data', 'health_data']
                },
                {
                    type: privacyManager.consentTypes.MARKETING,
                    purpose: privacyManager.processingPurposes.MARKETING,
                    dataCategories: ['contact_data', 'preference_data']
                }
            ];

            for (const consent of specificConsents) {
                const validation = privacyManager.validateConsentSpecificity(consent);

                expect(validation.isSpecific).toBe(true);
                expect(validation.purposeSpecific).toBe(true);
                expect(validation.dataSpecific).toBe(true);
                expect(validation.granular).toBe(true);
            }
        });

        it('should handle consent withdrawal properly', async () => {
            // First, record consent
            const consentData = {
                sessionId: 'test_session_123',
                consentType: privacyManager.consentTypes.MARKETING,
                granted: true,
                purpose: privacyManager.processingPurposes.MARKETING
            };

            await privacyManager.recordConsent(consentData);

            // Then withdraw consent
            const withdrawalResult = await privacyManager.withdrawConsent(
                consentData.sessionId,
                consentData.consentType
            );

            expect(withdrawalResult.success).toBe(true);
            expect(withdrawalResult.actions).toContain('STOP_PROCESSING');
            expect(withdrawalResult.actions).toContain('NOTIFY_SYSTEMS');
            expect(withdrawalResult.effectiveDate).toBeDefined();
        });
    });

    describe('LGPD Article 9 - Data Subject Rights (Requirement 5.2)', () => {
        it('should process data access requests (Right to Access)', async () => {
            const sessionId = 'test_session_123';

            // Store some test data
            await privacyManager.storeUserData({
                sessionId,
                personalData: { name: 'João Silva', email: 'joao@example.com' },
                conversationData: ['Olá', 'Como posso agendar?'],
                appointmentData: { date: '2024-01-15', time: '10:00' }
            });

            const accessRequest = {
                sessionId,
                rightType: privacyManager.userRights.ACCESS,
                requestData: {}
            };

            const result = await privacyManager.processUserRightsRequest(accessRequest);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data.personalData).toBeDefined();
            expect(result.data.conversationData).toBeDefined();
            expect(result.data.processingPurposes).toBeDefined();
            expect(result.data.dataRetention).toBeDefined();
            expect(result.estimatedCompletion).toBeDefined();
        });

        it('should process data rectification requests (Right to Rectification)', async () => {
            const rectificationRequest = {
                sessionId: 'test_session_123',
                rightType: privacyManager.userRights.RECTIFICATION,
                requestData: {
                    field: 'email',
                    currentValue: 'old@example.com',
                    newValue: 'new@example.com',
                    reason: 'Email address changed'
                }
            };

            const result = await privacyManager.processUserRightsRequest(rectificationRequest);

            expect(result.success).toBe(true);
            expect(result.requestId).toBeDefined();
            expect(result.actions).toContain('DATA_RECTIFICATION_SCHEDULED');
            expect(result.actions).toContain('VERIFY_IDENTITY');
            expect(result.estimatedCompletion).toBeDefined();
        });

        it('should process data erasure requests (Right to be Forgotten)', async () => {
            const erasureRequest = {
                sessionId: 'test_session_123',
                rightType: privacyManager.userRights.DELETION,
                requestData: {
                    reason: 'No longer using the service',
                    dataCategories: ['all']
                }
            };

            const result = await privacyManager.processUserRightsRequest(erasureRequest);

            expect(result.success).toBe(true);
            expect(result.requestId).toBeDefined();
            expect(result.actions).toContain('DATA_DELETION_SCHEDULED');
            expect(result.actions).toContain('VERIFY_LEGAL_OBLIGATIONS');
            expect(result.estimatedCompletion).toBeDefined();
            expect(result.retentionExceptions).toBeDefined();
        });

        it('should process data portability requests (Right to Data Portability)', async () => {
            const portabilityRequest = {
                sessionId: 'test_session_123',
                rightType: privacyManager.userRights.PORTABILITY,
                requestData: {
                    format: 'JSON',
                    includeMetadata: true
                }
            };

            const result = await privacyManager.processUserRightsRequest(portabilityRequest);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data.format).toBe('JSON');
            expect(result.data.exportedData).toBeDefined();
            expect(result.data.metadata).toBeDefined();
            expect(result.data.structuredFormat).toBe(true);
        });

        it('should process objection requests (Right to Object)', async () => {
            const objectionRequest = {
                sessionId: 'test_session_123',
                rightType: privacyManager.userRights.OBJECTION,
                requestData: {
                    purpose: privacyManager.processingPurposes.MARKETING,
                    reason: 'No longer interested in marketing communications'
                }
            };

            const result = await privacyManager.processUserRightsRequest(objectionRequest);

            expect(result.success).toBe(true);
            expect(result.actions).toContain('PROCESSING_STOPPED');
            expect(result.actions).toContain('UPDATE_PREFERENCES');
            expect(result.affectedPurposes).toContain(privacyManager.processingPurposes.MARKETING);
        });

        it('should handle complex rights requests with multiple data categories', async () => {
            const complexRequest = {
                sessionId: 'test_session_123',
                rightType: privacyManager.userRights.ACCESS,
                requestData: {
                    dataCategories: ['personal_data', 'health_data', 'conversation_data'],
                    timeRange: {
                        start: '2024-01-01',
                        end: '2024-12-31'
                    },
                    includeProcessingHistory: true,
                    includeThirdPartySharing: true
                }
            };

            const result = await privacyManager.processUserRightsRequest(complexRequest);

            expect(result.success).toBe(true);
            expect(result.data.personalData).toBeDefined();
            expect(result.data.healthData).toBeDefined();
            expect(result.data.conversationData).toBeDefined();
            expect(result.data.processingHistory).toBeDefined();
            expect(result.data.thirdPartySharing).toBeDefined();
        });
    });

    describe('LGPD Article 46 - Data Security (Requirement 5.3)', () => {
        it('should encrypt sensitive data at rest', () => {
            const sensitiveData = {
                name: 'João Silva',
                cpf: '12345678901',
                email: 'joao@example.com',
                medicalHistory: 'Histórico de glaucoma na família'
            };

            const encryptionResult = privacyManager.encryptData(sensitiveData, 'medical');

            expect(encryptionResult.success).toBe(true);
            expect(encryptionResult.encrypted).toBeDefined();
            expect(encryptionResult.encrypted).not.toBe(JSON.stringify(sensitiveData));
            expect(encryptionResult.metadata.algorithm).toBe('AES-256-GCM');
            expect(encryptionResult.metadata.keyId).toBeDefined();
            expect(encryptionResult.metadata.iv).toBeDefined();
        });

        it('should decrypt data correctly', () => {
            const originalData = {
                sessionId: 'test_123',
                conversation: ['Olá', 'Como posso ajudar?']
            };

            const encrypted = privacyManager.encryptData(originalData);
            const decrypted = privacyManager.decryptData(encrypted.encrypted, encrypted.metadata);

            expect(decrypted.success).toBe(true);
            expect(decrypted.data).toEqual(originalData);
        });

        it('should implement proper key management', () => {
            const keyInfo = privacyManager.getEncryptionKeyInfo();

            expect(keyInfo.currentKeyId).toBeDefined();
            expect(keyInfo.keyRotationSchedule).toBeDefined();
            expect(keyInfo.keyStrength).toBe(256);
            expect(keyInfo.lastRotation).toBeDefined();
            expect(keyInfo.nextRotation).toBeDefined();
        });

        it('should handle data anonymization', () => {
            const personalData = {
                sessionId: 'session_123',
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                cpf: '12345678901',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0 Test Browser',
                conversationData: ['Olá', 'Preciso agendar consulta'],
                appointmentData: { date: '2024-01-15', time: '10:00' }
            };

            const anonymized = privacyManager.anonymizeData(personalData);

            expect(anonymized.success).toBe(true);
            expect(anonymized.data._anonymized).toBe(true);
            expect(anonymized.data._anonymizedAt).toBeDefined();

            // Personal identifiers should be removed or hashed
            expect(anonymized.data.name).toBeUndefined();
            expect(anonymized.data.email).toBeUndefined();
            expect(anonymized.data.phone).toBeUndefined();
            expect(anonymized.data.cpf).toBeUndefined();

            // Session ID should be hashed, not removed
            expect(anonymized.data.sessionId).toBeDefined();
            expect(anonymized.data.sessionId).not.toBe(personalData.sessionId);

            // Non-personal data should remain
            expect(anonymized.data.conversationData).toBeDefined();
            expect(anonymized.data.appointmentData).toBeDefined();
        });

        it('should implement secure data transmission', () => {
            const transmissionConfig = privacyManager.getSecureTransmissionConfig();

            expect(transmissionConfig.tlsVersion).toBe('1.3');
            expect(transmissionConfig.certificateValidation).toBe(true);
            expect(transmissionConfig.encryptionInTransit).toBe(true);
            expect(transmissionConfig.integrityChecks).toBe(true);
        });
    });

    describe('Data Retention and Lifecycle Management', () => {
        it('should schedule automatic data retention', async () => {
            const dataType = 'CONVERSATION_DATA';
            const identifier = 'conv_123';
            const retentionPeriod = privacyManager.getRetentionPeriod(dataType);

            const result = await privacyManager.scheduleDataRetention(dataType, identifier);

            expect(result.success).toBe(true);
            expect(result.retentionId).toBeDefined();
            expect(result.scheduledDeletion).toBeDefined();
            expect(result.retentionPeriod).toBe(retentionPeriod);
        });

        it('should handle different retention periods for different data types', () => {
            const dataTypes = [
                'CONVERSATION_DATA',
                'PERSONAL_DATA',
                'MEDICAL_DATA',
                'CONSENT_RECORDS',
                'AUDIT_LOGS'
            ];

            dataTypes.forEach(dataType => {
                const retentionPeriod = privacyManager.getRetentionPeriod(dataType);
                expect(retentionPeriod).toBeGreaterThan(0);
                expect(typeof retentionPeriod).toBe('number');
            });

            // Medical data should have longer retention than conversation data
            const medicalRetention = privacyManager.getRetentionPeriod('MEDICAL_DATA');
            const conversationRetention = privacyManager.getRetentionPeriod('CONVERSATION_DATA');
            expect(medicalRetention).toBeGreaterThan(conversationRetention);
        });

        it('should execute scheduled data deletion', async () => {
            const retentionId = 'retention_123';
            const deletionResult = await privacyManager.executeScheduledDeletion(retentionId);

            expect(deletionResult.success).toBe(true);
            expect(deletionResult.deletedRecords).toBeDefined();
            expect(deletionResult.auditTrail).toBeDefined();
            expect(deletionResult.completedAt).toBeDefined();
        });
    });

    describe('Audit and Compliance Monitoring', () => {
        it('should log all data processing activities', async () => {
            const processingActivity = {
                sessionId: 'test_session_123',
                activityType: 'DATA_ACCESS',
                dataCategories: ['personal_data', 'conversation_data'],
                purpose: privacyManager.processingPurposes.CHATBOT_INTERACTION,
                legalBasis: privacyManager.legalBases.CONSENT,
                timestamp: new Date()
            };

            const result = await privacyManager.logProcessingActivity(processingActivity);

            expect(result.success).toBe(true);
            expect(privacyManager.logAuditEvent).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'PROCESSING_ACTIVITY',
                    sessionId: processingActivity.sessionId,
                    activityType: processingActivity.activityType
                })
            );
        });

        it('should generate LGPD compliance reports', async () => {
            // Simulate various activities
            const activities = [
                { type: 'CONSENT_GRANTED', sessionId: 'session_1' },
                { type: 'DATA_ACCESS', sessionId: 'session_2' },
                { type: 'DATA_DELETION', sessionId: 'session_3' },
                { type: 'CONSENT_WITHDRAWN', sessionId: 'session_4' }
            ];

            for (const activity of activities) {
                await privacyManager.logAuditEvent(activity);
            }

            const complianceReport = await privacyManager.generateComplianceReport();

            expect(complianceReport.reportId).toBeDefined();
            expect(complianceReport.period).toBeDefined();
            expect(complianceReport.consentMetrics).toBeDefined();
            expect(complianceReport.rightsRequests).toBeDefined();
            expect(complianceReport.dataBreaches).toBeDefined();
            expect(complianceReport.retentionCompliance).toBeDefined();
        });

        it('should detect and report compliance violations', async () => {
            // Simulate a compliance violation
            const violation = {
                type: 'UNAUTHORIZED_ACCESS',
                sessionId: 'session_123',
                description: 'Data accessed without valid consent',
                severity: 'HIGH',
                timestamp: new Date()
            };

            const result = await privacyManager.reportComplianceViolation(violation);

            expect(result.success).toBe(true);
            expect(result.violationId).toBeDefined();
            expect(result.actions).toContain('NOTIFY_DPO');
            expect(result.actions).toContain('INVESTIGATE');
            expect(result.reportingDeadline).toBeDefined();
        });
    });

    describe('Cross-Border Data Transfer', () => {
        it('should validate international data transfer requirements', () => {
            const transferRequest = {
                destinationCountry: 'United States',
                dataCategories: ['personal_data'],
                purpose: 'cloud_storage',
                adequacyDecision: false,
                safeguards: ['standard_contractual_clauses']
            };

            const validation = privacyManager.validateInternationalTransfer(transferRequest);

            expect(validation.isValid).toBe(true);
            expect(validation.requiredSafeguards).toContain('standard_contractual_clauses');
            expect(validation.additionalConsent).toBe(true);
        });

        it('should handle transfers to countries with adequacy decisions', () => {
            const adequateCountryTransfer = {
                destinationCountry: 'Argentina',
                dataCategories: ['personal_data'],
                purpose: 'data_processing',
                adequacyDecision: true
            };

            const validation = privacyManager.validateInternationalTransfer(adequateCountryTransfer);

            expect(validation.isValid).toBe(true);
            expect(validation.additionalConsent).toBe(false);
            expect(validation.requiredSafeguards).toHaveLength(0);
        });
    });

    describe('Performance and Scalability', () => {
        it('should handle high-volume consent processing', async () => {
            const consentRequests = Array.from({ length: 100 }, (_, i) => ({
                sessionId: `session_${i}`,
                consentType: privacyManager.consentTypes.DATA_PROCESSING,
                granted: i % 2 === 0,
                purpose: privacyManager.processingPurposes.CHATBOT_INTERACTION
            }));

            const startTime = performance.now();
            const results = await Promise.all(
                consentRequests.map(consent => privacyManager.recordConsent(consent))
            );
            const endTime = performance.now();

            const processingTime = endTime - startTime;

            expect(results).toHaveLength(100);
            expect(processingTime).toBeLessThan(5000); // Should complete within 5 seconds
            results.forEach(result => {
                expect(result.success).toBe(true);
            });
        });

        it('should efficiently process batch data operations', async () => {
            const dataItems = Array.from({ length: 50 }, (_, i) => ({
                sessionId: `session_${i}`,
                data: { message: `Message ${i}`, timestamp: new Date() }
            }));

            const startTime = performance.now();
            const results = await privacyManager.batchProcessData(dataItems);
            const endTime = performance.now();

            const processingTime = endTime - startTime;

            expect(results.success).toBe(true);
            expect(results.processedCount).toBe(50);
            expect(processingTime).toBeLessThan(2000); // Should complete within 2 seconds
        });
    });

    describe('Error Handling and Recovery', () => {
        it('should handle database connection failures gracefully', async () => {
            // Mock database failure
            privacyManager.storeConsentRecord = vi.fn().mockRejectedValue(new Error('Database connection failed'));

            const consentData = {
                sessionId: 'test_session_123',
                consentType: privacyManager.consentTypes.DATA_PROCESSING,
                granted: true
            };

            const result = await privacyManager.recordConsent(consentData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('CONSENT_RECORDING_ERROR');
            expect(result.retryable).toBe(true);
        });

        it('should implement circuit breaker for external services', async () => {
            // Simulate multiple failures
            for (let i = 0; i < 5; i++) {
                privacyManager.storeConsentRecord = vi.fn().mockRejectedValue(new Error('Service unavailable'));
                await privacyManager.recordConsent({ sessionId: `session_${i}` });
            }

            const circuitState = privacyManager.getCircuitBreakerState();
            expect(circuitState.state).toBe('OPEN');
            expect(circuitState.failureCount).toBeGreaterThanOrEqual(5);
        });
    });
});