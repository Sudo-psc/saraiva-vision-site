/**
 * Tests for LGPD Privacy Manager
 */

import LGPDPrivacyManager from '../lgpdPrivacyManager.js';

describe('LGPDPrivacyManager', () => {
    let privacyManager;

    beforeEach(() => {
        privacyManager = new LGPDPrivacyManager();
    });

    describe('validateConsent', () => {
        test('should validate consent for data processing', async () => {
            const sessionId = 'test_session_123';
            const consentType = privacyManager.consentTypes.DATA_PROCESSING;
            const purpose = privacyManager.processingPurposes.CHATBOT_INTERACTION;

            const result = await privacyManager.validateConsent(sessionId, consentType, purpose);

            expect(result).toBeDefined();
            expect(result.consentRequired).toBeDefined();
            expect(result.isValid).toBeDefined();
            expect(result.actions).toBeDefined();
        });

        test('should require consent for marketing purposes', async () => {
            const sessionId = 'test_session_123';
            const consentType = privacyManager.consentTypes.MARKETING;
            const purpose = privacyManager.processingPurposes.MARKETING;

            const result = await privacyManager.validateConsent(sessionId, consentType, purpose);

            expect(result.consentRequired).toBe(true);
            expect(result.actions).toContain('REQUEST_INITIAL_CONSENT');
        });

        test('should not require consent for legitimate interest purposes', async () => {
            const sessionId = 'test_session_123';
            const consentType = privacyManager.consentTypes.DATA_PROCESSING;
            const purpose = privacyManager.processingPurposes.CUSTOMER_SUPPORT;

            const result = await privacyManager.validateConsent(sessionId, consentType, purpose);

            expect(result.consentRequired).toBe(false);
            expect(result.isValid).toBe(true);
            expect(result.legalBasis).toBe(privacyManager.legalBases.LEGITIMATE_INTEREST);
        });

        test('should handle consent validation errors gracefully', async () => {
            // Mock error scenario
            const originalGetConsentRecord = privacyManager.getConsentRecord;
            privacyManager.getConsentRecord = vi.fn().mockRejectedValue(new Error('Database error'));

            // Use a purpose that requires consent to trigger the error path
            const result = await privacyManager.validateConsent('session', 'type', privacyManager.processingPurposes.MARKETING);

            expect(result.isValid).toBe(false);
            expect(result.error).toBe('CONSENT_VALIDATION_ERROR');
            expect(result.actions).toContain('REQUEST_CONSENT');

            // Restore original method
            privacyManager.getConsentRecord = originalGetConsentRecord;
        });
    });

    describe('recordConsent', () => {
        test('should record user consent successfully', async () => {
            const consentData = {
                sessionId: 'test_session_123',
                consentType: privacyManager.consentTypes.DATA_PROCESSING,
                granted: true,
                purpose: privacyManager.processingPurposes.CHATBOT_INTERACTION,
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0 Test Browser',
                consentText: 'I consent to data processing'
            };

            const result = await privacyManager.recordConsent(consentData);

            expect(result.success).toBe(true);
            expect(result.consentId).toBeDefined();
            expect(result.expiresAt).toBeDefined();
            expect(result.rights).toBeDefined();
        });

        test('should handle consent recording errors', async () => {
            const originalStoreConsentRecord = privacyManager.storeConsentRecord;
            privacyManager.storeConsentRecord = vi.fn().mockRejectedValue(new Error('Storage error'));

            const consentData = {
                sessionId: 'test_session_123',
                consentType: privacyManager.consentTypes.DATA_PROCESSING,
                granted: true,
                purpose: privacyManager.processingPurposes.CHATBOT_INTERACTION,
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0 Test Browser',
                consentText: 'I consent to data processing'
            };

            const result = await privacyManager.recordConsent(consentData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('CONSENT_RECORDING_ERROR');

            privacyManager.storeConsentRecord = originalStoreConsentRecord;
        });
    });

    describe('processUserRightsRequest', () => {
        test('should process data access request', async () => {
            const request = {
                sessionId: 'test_session_123',
                rightType: privacyManager.userRights.ACCESS,
                requestData: {}
            };

            const result = await privacyManager.processUserRightsRequest(request);

            expect(result.success).toBe(true);
            expect(result.requestId).toBeDefined();
            expect(result.estimatedCompletion).toBeDefined();
            expect(result.data).toBeDefined();
        });

        test('should process data deletion request', async () => {
            const request = {
                sessionId: 'test_session_123',
                rightType: privacyManager.userRights.DELETION,
                requestData: { reason: 'No longer needed' }
            };

            const result = await privacyManager.processUserRightsRequest(request);

            expect(result.success).toBe(true);
            expect(result.requestId).toBeDefined();
            expect(result.actions).toContain('DATA_DELETION_SCHEDULED');
        });

        test('should process data rectification request', async () => {
            const request = {
                sessionId: 'test_session_123',
                rightType: privacyManager.userRights.RECTIFICATION,
                requestData: { field: 'email', newValue: 'new@example.com' }
            };

            const result = await privacyManager.processUserRightsRequest(request);

            expect(result.success).toBe(true);
            expect(result.actions).toContain('DATA_RECTIFICATION_SCHEDULED');
        });

        test('should process data portability request', async () => {
            const request = {
                sessionId: 'test_session_123',
                rightType: privacyManager.userRights.PORTABILITY,
                requestData: {}
            };

            const result = await privacyManager.processUserRightsRequest(request);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });

        test('should process processing objection request', async () => {
            const request = {
                sessionId: 'test_session_123',
                rightType: privacyManager.userRights.OBJECTION,
                requestData: { purpose: 'marketing' }
            };

            const result = await privacyManager.processUserRightsRequest(request);

            expect(result.success).toBe(true);
            expect(result.actions).toContain('PROCESSING_STOPPED');
        });

        test('should handle unsupported right types', async () => {
            const request = {
                sessionId: 'test_session_123',
                rightType: 'UNSUPPORTED_RIGHT',
                requestData: {}
            };

            const result = await privacyManager.processUserRightsRequest(request);

            expect(result.success).toBe(false);
            expect(result.error).toBe('USER_RIGHTS_PROCESSING_ERROR');
        });
    });

    describe('encryptData', () => {
        test('should encrypt data successfully', () => {
            const data = 'Sensitive information';
            const purpose = 'medical';

            const result = privacyManager.encryptData(data, purpose);

            expect(result.success).toBe(true);
            expect(result.encrypted).toBeDefined();
            expect(result.metadata).toBeDefined();
            expect(result.metadata.algorithm).toBe('AES-256-GCM');
            expect(result.metadata.keyId).toBeDefined();
        });

        test('should handle encryption errors', () => {
            // Test with invalid data
            const result = privacyManager.encryptData(null);

            expect(result.success).toBe(false);
            expect(result.error).toBe('ENCRYPTION_ERROR');
        });
    });

    describe('decryptData', () => {
        test('should decrypt data successfully', () => {
            const originalData = 'Sensitive information';
            const encryptResult = privacyManager.encryptData(originalData);

            expect(encryptResult.success).toBe(true);

            const decryptResult = privacyManager.decryptData(encryptResult.encrypted, encryptResult.metadata);

            expect(decryptResult.success).toBe(true);
            expect(decryptResult.data).toBe(originalData);
        });

        test('should handle decryption errors', () => {
            const result = privacyManager.decryptData(null);

            expect(result.success).toBe(false);
            expect(result.error).toBe('DECRYPTION_ERROR');
        });
    });

    describe('scheduleDataRetention', () => {
        test('should schedule data retention successfully', async () => {
            const dataType = 'CONVERSATION_DATA';
            const identifier = 'conv_123';

            const result = await privacyManager.scheduleDataRetention(dataType, identifier);

            expect(result.success).toBe(true);
            expect(result.retentionId).toBeDefined();
            expect(result.scheduledDeletion).toBeDefined();
        });

        test('should handle retention scheduling errors', async () => {
            const originalStoreRetentionRecord = privacyManager.storeRetentionRecord;
            privacyManager.storeRetentionRecord = vi.fn().mockRejectedValue(new Error('Storage error'));

            const result = await privacyManager.scheduleDataRetention('CONVERSATION_DATA', 'conv_123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('RETENTION_SCHEDULING_ERROR');

            privacyManager.storeRetentionRecord = originalStoreRetentionRecord;
        });
    });

    describe('anonymizeData', () => {
        test('should anonymize personal data', () => {
            const personalData = {
                sessionId: 'session_123',
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                cpf: '12345678901',
                ipAddress: '192.168.1.1',
                userAgent: 'Mozilla/5.0 Test Browser',
                conversationData: 'Some conversation'
            };

            const result = privacyManager.anonymizeData(personalData);

            expect(result.success).toBe(true);
            expect(result.data._anonymized).toBe(true);
            expect(result.data._anonymizedAt).toBeDefined();
            expect(result.data.name).toBeUndefined();
            expect(result.data.email).toBeUndefined();
            expect(result.data.phone).toBeUndefined();
            expect(result.data.cpf).toBeUndefined();
            expect(result.data.sessionId).not.toBe(personalData.sessionId); // Should be hashed
            expect(result.data.conversationData).toBe(personalData.conversationData); // Should remain
        });

        test('should handle anonymization errors', () => {
            // Test with circular reference that would cause JSON.stringify to fail
            const circularData = {};
            circularData.self = circularData;

            const result = privacyManager.anonymizeData(circularData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('ANONYMIZATION_ERROR');
        });
    });

    describe('Helper methods', () => {
        test('should correctly identify consent requirements', () => {
            expect(privacyManager.isConsentRequired(privacyManager.processingPurposes.MARKETING)).toBe(true);
            expect(privacyManager.isConsentRequired(privacyManager.processingPurposes.ANALYTICS)).toBe(true);
            expect(privacyManager.isConsentRequired(privacyManager.processingPurposes.CHATBOT_INTERACTION)).toBe(false);
            expect(privacyManager.isConsentRequired(privacyManager.processingPurposes.APPOINTMENT_BOOKING)).toBe(false);
        });

        test('should validate consent records correctly', () => {
            const validConsent = {
                granted: true,
                revokedAt: null,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
            };

            const expiredConsent = {
                granted: true,
                revokedAt: null,
                expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
            };

            const revokedConsent = {
                granted: true,
                revokedAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };

            const deniedConsent = {
                granted: false,
                revokedAt: null,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
            };

            expect(privacyManager.isConsentValid(validConsent)).toBe(true);
            expect(privacyManager.isConsentValid(expiredConsent)).toBe(false);
            expect(privacyManager.isConsentValid(revokedConsent)).toBe(false);
            expect(privacyManager.isConsentValid(deniedConsent)).toBe(false);
        });

        test('should get correct legal basis for purposes', () => {
            expect(privacyManager.getLegalBasisForPurpose(privacyManager.processingPurposes.CHATBOT_INTERACTION))
                .toBe(privacyManager.legalBases.LEGITIMATE_INTEREST);
            expect(privacyManager.getLegalBasisForPurpose(privacyManager.processingPurposes.APPOINTMENT_BOOKING))
                .toBe(privacyManager.legalBases.CONTRACT);
            expect(privacyManager.getLegalBasisForPurpose(privacyManager.processingPurposes.MEDICAL_REFERRAL))
                .toBe(privacyManager.legalBases.VITAL_INTEREST);
        });

        test('should get correct data categories for purposes', () => {
            const chatbotCategories = privacyManager.getDataCategoriesForPurpose(
                privacyManager.processingPurposes.CHATBOT_INTERACTION
            );
            expect(chatbotCategories).toContain('conversation_data');
            expect(chatbotCategories).toContain('session_data');

            const appointmentCategories = privacyManager.getDataCategoriesForPurpose(
                privacyManager.processingPurposes.APPOINTMENT_BOOKING
            );
            expect(appointmentCategories).toContain('personal_data');
            expect(appointmentCategories).toContain('health_data');
        });

        test('should calculate correct expiration dates', () => {
            const now = new Date();
            const medicalDataExpiration = privacyManager.calculateExpirationDate(
                privacyManager.consentTypes.MEDICAL_DATA
            );
            const marketingExpiration = privacyManager.calculateExpirationDate(
                privacyManager.consentTypes.MARKETING
            );

            expect(medicalDataExpiration > now).toBe(true);
            expect(marketingExpiration > now).toBe(true);
            expect(medicalDataExpiration > marketingExpiration).toBe(true); // Medical data has longer retention
        });

        test('should provide user rights information', () => {
            const rightsInfo = privacyManager.getUserRightsInfo();

            expect(rightsInfo.rights).toBeDefined();
            expect(rightsInfo.rights.length).toBeGreaterThan(0);
            expect(rightsInfo.contact).toBeDefined();
            expect(rightsInfo.contact.dpo).toBeDefined();

            const accessRight = rightsInfo.rights.find(r => r.type === privacyManager.userRights.ACCESS);
            expect(accessRight).toBeDefined();
            expect(accessRight.description).toBeDefined();
            expect(accessRight.timeframe).toBeDefined();
        });
    });

    describe('Utility methods', () => {
        test('should generate unique IDs', () => {
            const consentId1 = privacyManager.generateConsentId();
            const consentId2 = privacyManager.generateConsentId();
            const requestId = privacyManager.generateRequestId();
            const retentionId = privacyManager.generateRetentionId();

            expect(consentId1).not.toBe(consentId2);
            expect(consentId1).toMatch(/^consent_/);
            expect(requestId).toMatch(/^request_/);
            expect(retentionId).toMatch(/^retention_/);
        });

        test('should hash values consistently', () => {
            const value = 'test@example.com';
            const hash1 = privacyManager.hashValue(value);
            const hash2 = privacyManager.hashValue(value);

            expect(hash1).toBe(hash2);
            expect(hash1).not.toBe(value);
            expect(hash1.length).toBeGreaterThan(0);
        });

        test('should hash IP addresses', () => {
            const ip = '192.168.1.1';
            const hashedIp = privacyManager.hashIP(ip);

            expect(hashedIp).not.toBe(ip);
            expect(hashedIp.length).toBeGreaterThan(0);
        });

        test('should sanitize user agents', () => {
            const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
            const sanitized = privacyManager.sanitizeUserAgent(userAgent);

            expect(sanitized).toContain('X.X');
            expect(sanitized).not.toContain('5.0');
            expect(sanitized).not.toContain('10.0');
        });
    });
});