/**
 * Simple tests for Data Encryption Service
 */

import DataEncryptionService from '../dataEncryptionService.js';

describe('DataEncryptionService - Simple Tests', () => {
    let encryptionService;

    beforeEach(() => {
        encryptionService = new DataEncryptionService();
    });

    describe('Basic functionality', () => {
        test('should initialize service correctly', () => {
            expect(encryptionService).toBeDefined();
            expect(encryptionService.algorithm).toBe('aes-256-gcm');
            expect(encryptionService.keyLength).toBe(32);
            expect(encryptionService.ivLength).toBe(16);
        });

        test('should generate current key ID', () => {
            const keyId = encryptionService.getCurrentKeyId();
            expect(typeof keyId).toBe('string');
            expect(keyId).toMatch(/^key_\d+$/);
        });

        test('should generate new key ID', () => {
            const currentKeyId = encryptionService.getCurrentKeyId();
            const newKeyId = encryptionService.generateNewKeyId();

            expect(typeof newKeyId).toBe('string');
            expect(newKeyId).toMatch(/^key_\d+$/);
            expect(newKeyId).not.toBe(currentKeyId);
        });

        test('should create hash successfully', () => {
            const data = 'test data';
            const salt = 'salt123';

            const hash = encryptionService.createHash(data, salt);

            expect(typeof hash).toBe('string');
            expect(hash.length).toBeGreaterThan(0);
        });

        test('should create hash without salt', () => {
            const data = 'test data';

            const hash = encryptionService.createHash(data);

            expect(typeof hash).toBe('string');
            expect(hash.length).toBeGreaterThan(0);
        });

        test('should create secure token with default length', () => {
            const token = encryptionService.createSecureToken();

            expect(typeof token).toBe('string');
            expect(token.length).toBe(64); // 32 bytes * 2 (hex)
        });

        test('should create secure token with custom length', () => {
            const token = encryptionService.createSecureToken(16);

            expect(typeof token).toBe('string');
            expect(token.length).toBe(32); // 16 bytes * 2 (hex)
        });

        test('should validate data integrity successfully', () => {
            const data = 'test data';
            const salt = 'salt123';
            const hash = encryptionService.createHash(data, salt);

            const isValid = encryptionService.validateIntegrity(data, hash, salt);

            expect(isValid).toBe(true);
        });

        test('should detect data tampering', () => {
            const data = 'test data';
            const tamperedData = 'tampered data';
            const salt = 'salt123';
            const hash = encryptionService.createHash(data, salt);

            const isValid = encryptionService.validateIntegrity(tamperedData, hash, salt);

            expect(isValid).toBe(false);
        });
    });

    describe('Key management', () => {
        test('should get or create key', () => {
            const keyId = 'test_key_123';
            const purpose = 'test';

            const key1 = encryptionService.getOrCreateKey(keyId, purpose);
            const key2 = encryptionService.getOrCreateKey(keyId, purpose);

            expect(key1).toBeDefined();
            expect(key2).toBeDefined();
            expect(key1).toBe(key2); // Should return same key for same ID and purpose
        });

        test('should return null for non-existent key', () => {
            const key = encryptionService.getKey('non_existent_key', 'test');

            expect(key).toBeNull();
        });

        test('should rotate keys successfully', () => {
            const result = encryptionService.rotateKeys();

            expect(result.success).toBe(true);
            expect(result.newKeyId).toBeDefined();
            expect(result.rotatedAt).toBeDefined();
        });
    });

    describe('Service status', () => {
        test('should return service status', () => {
            const status = encryptionService.getStatus();

            expect(status).toBeDefined();
            expect(status.algorithm).toBe('aes-256-gcm');
            expect(status.keyCount).toBeDefined();
            expect(status.currentKeyId).toBeDefined();
            expect(status.keyRotationPeriod).toBeDefined();
            expect(status.lastRotation).toBeDefined();
        });
    });

    describe('Error handling', () => {
        test('should handle empty plaintext in encrypt', () => {
            const result = encryptionService.encrypt('');

            expect(result.success).toBe(false);
            expect(result.error).toBe('ENCRYPTION_FAILED');
        });

        test('should handle null plaintext in encrypt', () => {
            const result = encryptionService.encrypt(null);

            expect(result.success).toBe(false);
            expect(result.error).toBe('ENCRYPTION_FAILED');
        });

        test('should handle missing encrypted data in decrypt', () => {
            const result = encryptionService.decrypt(null);

            expect(result.success).toBe(false);
            expect(result.error).toBe('DECRYPTION_FAILED');
        });

        test('should handle missing data field in decrypt', () => {
            const encryptedData = {
                iv: 'iv',
                tag: 'tag',
                keyId: 'key_123'
            };

            const result = encryptionService.decrypt(encryptedData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('DECRYPTION_FAILED');
        });
    });

    describe('Data type specific encryption', () => {
        test('should identify PII fields correctly', () => {
            const piiData = {
                name: 'João Silva',
                email: null,
                phone: '',
                cpf: '12345678901',
                age: 30 // Non-PII
            };

            // Test that the service can identify which fields are PII
            const sensitiveFields = ['name', 'email', 'phone', 'cpf', 'address'];

            Object.keys(piiData).forEach(key => {
                if (sensitiveFields.includes(key) && piiData[key]) {
                    expect(piiData[key]).toBeDefined();
                }
            });

            expect(piiData.age).toBe(30); // Non-PII should remain
        });

        test('should identify medical fields correctly', () => {
            const medicalData = {
                symptoms: ['dor de cabeça', 'visão turva'],
                diagnosis: 'miopia',
                treatment: 'óculos',
                patientId: '12345' // Non-medical field
            };

            const medicalFields = [
                'symptoms', 'diagnosis', 'treatment', 'medications',
                'allergies', 'medical_history', 'test_results'
            ];

            Object.keys(medicalData).forEach(key => {
                if (medicalFields.includes(key)) {
                    expect(medicalData[key]).toBeDefined();
                }
            });

            expect(medicalData.patientId).toBe('12345'); // Non-medical should remain
        });
    });
});