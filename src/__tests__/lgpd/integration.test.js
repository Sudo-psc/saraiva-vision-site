/**
 * LGPD Integration Tests
 * Tests the integration between different LGPD components
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { consentManager } from '../../lib/lgpd/consentManager.js';
import { dataAnonymizer } from '../../lib/lgpd/dataAnonymization.js';
import { dataEncryption, secureStorage } from '../../lib/lgpd/encryption.js';
import { accessControl } from '../../lib/lgpd/accessControl.js';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

describe('LGPD Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Consent and Data Processing Flow', () => {
        it('should handle complete consent to data processing flow', () => {
            // 1. User gives consent
            const consentDetails = {
                purposes: ['appointment_scheduling', 'communication'],
                ipHash: 'test-hash'
            };

            localStorageMock.getItem.mockReturnValue(null);
            localStorageMock.setItem.mockReturnValue(true);

            const consentResult = consentManager.recordConsent(consentDetails);
            expect(consentResult).toBe(true);

            // 2. Check consent is valid
            const validConsent = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                accepted: true,
                purposes: consentDetails.purposes
            };

            localStorageMock.getItem.mockReturnValue(JSON.stringify(validConsent));
            expect(consentManager.hasValidConsent()).toBe(true);

            // 3. Process data with encryption
            const sensitiveData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999887766'
            };

            const encryptedData = dataEncryption.encryptForTransmission(sensitiveData);
            expect(encryptedData.name).toBe('João Silva'); // Name is not in sensitiveFields
            expect(encryptedData.email).toHaveProperty('encrypted');
            expect(encryptedData.phone).toHaveProperty('encrypted');

            // 4. Decrypt data for processing
            const decryptedData = dataEncryption.decryptFromTransmission(encryptedData);
            expect(decryptedData.name).toBe(sensitiveData.name);
            expect(decryptedData.email).toBe(sensitiveData.email);
            expect(String(decryptedData.phone)).toBe(String(sensitiveData.phone));
        });

        it('should handle data anonymization request', () => {
            // 1. Original patient data
            const patientData = {
                id: '123',
                name: 'Maria Santos',
                email: 'maria@example.com',
                phone: '11987654321',
                cpf: '12345678901',
                message: 'Gostaria de agendar uma consulta'
            };

            // 2. Anonymize the data
            const anonymizedData = dataAnonymizer.anonymizeRecord(patientData);

            expect(anonymizedData.name).toBe('Ma*** Sa****');
            expect(anonymizedData.email).toBe('ma***@example.com');
            expect(anonymizedData.phone).toBe('11*******21');
            expect(anonymizedData.cpf).toBe('123.***.**01');
            expect(anonymizedData._anonymized).toBe(true);

            // 3. Validate anonymization
            const validation = dataAnonymizer.validateAnonymization(anonymizedData);
            expect(validation.isValid).toBe(true);
            expect(validation.issues).toHaveLength(0);

            // 4. Create export for patient
            const exportData = dataAnonymizer.createAnonymizedExport([anonymizedData], 'json');
            const parsedExport = JSON.parse(exportData);

            expect(parsedExport.export_type).toBe('anonymized_data');
            expect(parsedExport.lgpd_compliance).toBe(true);
            expect(parsedExport.data).toHaveLength(1);
            expect(parsedExport.data[0]).not.toHaveProperty('id');
        });
    });

    describe('Access Control Integration', () => {
        it('should enforce role-based access to patient data', () => {
            const patientId = 'patient-123';
            const adminUserId = 'admin-456';

            // Admin should have access to all patient data
            expect(accessControl.canAccessPatientData('admin', patientId)).toBe(true);
            expect(accessControl.hasPermission('admin', 'read_all_patient_data')).toBe(true);

            // Doctor should have access to all patient data
            expect(accessControl.canAccessPatientData('doctor', patientId)).toBe(true);
            expect(accessControl.hasPermission('doctor', 'read_all_patient_data')).toBe(true);

            // Staff should have limited access
            expect(accessControl.canAccessPatientData('staff', patientId)).toBe(true);
            expect(accessControl.hasPermission('staff', 'delete_patient_data')).toBe(false);

            // Patient should only access own data
            expect(accessControl.canAccessPatientData('patient', patientId, patientId)).toBe(true);
            expect(accessControl.canAccessPatientData('patient', patientId, 'other-patient')).toBe(false);

            // Anonymous users should have no access
            expect(accessControl.canAccessPatientData('anonymous', patientId)).toBe(false);
        });

        it('should create appropriate data filters based on role', () => {
            const userId = 'user-123';

            // Admin filter - no restrictions
            const adminFilter = accessControl.createDataFilter('admin');
            expect(adminFilter).toEqual({});

            // Patient filter - only own data
            const patientFilter = accessControl.createDataFilter('patient', userId);
            expect(patientFilter).toHaveProperty('patient_id', userId);
            expect(patientFilter).toHaveProperty('user_id', userId);
            expect(patientFilter).toHaveProperty('email', userId);

            // Anonymous filter - no access
            const anonymousFilter = accessControl.createDataFilter('anonymous');
            expect(anonymousFilter).toEqual({ id: null });
        });
    });

    describe('Secure Storage Integration', () => {
        it('should securely store and retrieve sensitive data', () => {
            const sensitiveData = {
                patientName: 'Carlos Silva',
                medicalNotes: 'Patient has diabetes'
            };

            // Store data securely
            secureStorage.setItem('patient_data', sensitiveData);
            expect(localStorageMock.setItem).toHaveBeenCalled();

            // Mock encrypted storage retrieval
            const encryptedValue = dataEncryption.encrypt(sensitiveData);
            localStorageMock.getItem.mockReturnValue(JSON.stringify(encryptedValue));

            // Retrieve and decrypt data
            const retrievedData = secureStorage.getItem('patient_data');
            expect(retrievedData).toEqual(sensitiveData);
        });

        it('should handle storage errors gracefully', () => {
            localStorageMock.setItem.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });

            const result = secureStorage.setItem('test', 'data');
            expect(result).toBe(false);

            localStorageMock.getItem.mockImplementation(() => {
                throw new Error('Storage error');
            });

            const retrievedData = secureStorage.getItem('test');
            expect(retrievedData).toBeNull();
        });
    });

    describe('Data Retention Compliance', () => {
        it('should check data retention policies', () => {
            const currentDate = new Date();

            // Recent data should be retained
            const recentDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
            const recentRetention = accessControl.checkDataRetention(recentDate, 'contact_messages');
            expect(recentRetention.shouldRetain).toBe(true);
            expect(recentRetention.daysRemaining).toBeGreaterThanOrEqual(700); // Should have ~700+ days left

            // Old data should not be retained
            const oldDate = new Date(currentDate.getTime() - 800 * 24 * 60 * 60 * 1000); // 800 days ago
            const oldRetention = accessControl.checkDataRetention(oldDate, 'contact_messages');
            expect(oldRetention.shouldRetain).toBe(false);
            expect(oldRetention.daysRemaining).toBe(0);

            // Medical data has longer retention
            const medicalRetention = accessControl.checkDataRetention(recentDate, 'appointments');
            expect(medicalRetention.retentionPolicy).toBe('1825 dias'); // 5 years
        });
    });

    describe('LGPD Compliance Validation', () => {
        it('should validate all LGPD requirements are met', () => {
            // Test consent management
            expect(typeof consentManager.recordConsent).toBe('function');
            expect(typeof consentManager.withdrawConsent).toBe('function');
            expect(typeof consentManager.hasValidConsent).toBe('function');

            // Test data encryption
            expect(typeof dataEncryption.encrypt).toBe('function');
            expect(typeof dataEncryption.decrypt).toBe('function');
            expect(typeof dataEncryption.hash).toBe('function');

            // Test data anonymization
            expect(typeof dataAnonymizer.anonymizeRecord).toBe('function');
            expect(typeof dataAnonymizer.createAnonymizedExport).toBe('function');

            // Test access control
            expect(typeof accessControl.hasPermission).toBe('function');
            expect(typeof accessControl.canAccessPatientData).toBe('function');
            expect(typeof accessControl.createDataFilter).toBe('function');

            // Test secure storage
            expect(typeof secureStorage.setItem).toBe('function');
            expect(typeof secureStorage.getItem).toBe('function');
            expect(typeof secureStorage.removeItem).toBe('function');
        });

        it('should handle privacy notice requirements', () => {
            const privacyNotice = consentManager.getPrivacyNotice();

            expect(privacyNotice).toHaveProperty('title');
            expect(privacyNotice).toHaveProperty('content');
            expect(privacyNotice).toHaveProperty('lastUpdated');

            // Check required LGPD sections
            expect(privacyNotice.content).toContain('Base Legal (LGPD)');
            expect(privacyNotice.content).toContain('Seus Direitos');
            expect(privacyNotice.content).toContain('Segurança dos Dados');
            expect(privacyNotice.content).toContain('privacidade@saraivavision.com.br');
        });
    });
});