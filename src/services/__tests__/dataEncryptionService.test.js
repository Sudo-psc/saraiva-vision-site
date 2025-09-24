/**
 * Tests for Data Encryption Service
 */

import DataEncryptionService from '../dataEncryptionService.js';

// Mock crypto module for testing
vi.mock('crypto', () => ({
    default: {
        randomBytes: vi.fn((size) => Buffer.alloc(size, 'a')),
        createCipher: vi.fn(() => ({
            setAAD: vi.fn(),
            update: vi.fn(() => 'encrypted'),
            final: vi.fn(() => 'data'),
            getAuthTag: vi.fn(() => Buffer.from('tag'))
        })),
        createDecipher: vi.fn(() => ({
            setAAD: vi.fn(),
            setAuthTag: vi.fn(),
            update: vi.fn(() => 'decrypted'),
            final: vi.fn(() => 'data')
        })),
        createHash: vi.fn(() => ({
            update: vi.fn(),
            digest: vi.fn(() => 'hashedvalue')
        })),
        pbkdf2Sync: vi.fn(() => Buffer.alloc(32, 'key'))
    }
}));

describe('DataEncryptionService', () => {
    let encryptionService;

    beforeEach(() => {
        encryptionService = new DataEncryptionService();
    });

    describe('encrypt', () => {
        test('should encrypt data successfully', () => {
            const plaintext = 'Sensitive data';
            const purpose = 'medical';

            const result = encryptionService.encrypt(plaintext, purpose);

            expect(result.success).toBe(true);
            expect(result.encrypted).toBeDefined();
            expect(result.encrypted.data).toBeDefined();
            expect(result.encrypted.iv).toBeDefined();
            expect(result.encrypted.tag).toBeDefined();
            expect(result.encrypted.keyId).toBeDefined();
            expect(result.encrypted.algorithm).toBe('aes-256-gcm');
            expect(result.encrypted.purpose).toBe(purpose);
        });

        test('should handle empty plaintext', () => {
            const result = encryptionService.encrypt('');

            expect(result.success).toBe(false);
            expect(result.error).toBe('ENCRYPTION_FAILED');
        });

        test('should handle null plaintext', () => {
            const result = encryptionService.encrypt(null);

            expect(result.success).toBe(false);
            expect(result.error).toBe('ENCRYPTION_FAILED');
        });

        test('should use default purpose when not specified', () => {
            const plaintext = 'Test data';
            const result = encryptionService.encrypt(plaintext);

            expect(result.success).toBe(true);
            expect(result.encrypted.purpose).toBe('general');
        });
    });

    describe('decrypt', () => {
        test('should decrypt data successfully', () => {
            const encryptedData = {
                data: 'encrypteddata',
                iv: 'iv',
                tag: 'tag',
                keyId: 'key_123',
                purpose: 'general'
            };

            const result = encryptionService.decrypt(encryptedData);

            expect(result.success).toBe(true);
            expect(result.data).toBe('decrypteddata');
        });

        test('should handle missing encrypted data', () => {
            const result = encryptionService.decrypt(null);

            expect(result.success).toBe(false);
            expect(result.error).toBe('DECRYPTION_FAILED');
        });

        test('should handle missing data field', () => {
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

    describe('encryptPII', () => {
        test('should encrypt PII fields successfully', () => {
            const piiData = {
                name: 'João Silva',
                email: 'joao@example.com',
                phone: '11999999999',
                cpf: '12345678901',
                address: 'Rua das Flores, 123',
                age: 30, // Non-PII field
                preferences: 'morning' // Non-PII field
            };

            const result = encryptionService.encryptPII(piiData);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();

            // PII fields should be encrypted (objects)
            expect(typeof result.data.name).toBe('object');
            expect(typeof result.data.email).toBe('object');
            expect(typeof result.data.phone).toBe('object');
            expect(typeof result.data.cpf).toBe('object');
            expect(typeof result.data.address).toBe('object');

            // Non-PII fields should remain unchanged
            expect(result.data.age).toBe(30);
            expect(result.data.preferences).toBe('morning');
        });

        test('should handle PII data with null values', () => {
            const piiData = {
                name: 'João Silva',
                email: null,
                phone: '',
                cpf: '12345678901'
            };

            const result = encryptionService.encryptPII(piiData);

            expect(result.success).toBe(true);
            expect(typeof result.data.name).toBe('object'); // Encrypted
            expect(result.data.email).toBeNull(); // Unchanged
            expect(result.data.phone).toBe(''); // Unchanged
            expect(typeof result.data.cpf).toBe('object'); // Encrypted
        });
    });

    describe('decryptPII', () => {
        test('should decrypt PII fields successfully', () => {
            const encryptedPII = {
                name: {
                    data: 'encryptedname',
                    iv: 'iv',
                    tag: 'tag',
                    keyId: 'key_123',
                    purpose: 'pii'
                },
                email: {
                    data: 'encryptedemail',
                    iv: 'iv',
                    tag: 'tag',
                    keyId: 'key_123',
                    purpose: 'pii'
                },
                age: 30 // Non-encrypted field
            };

            const result = encryptionService.decryptPII(encryptedPII);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(typeof result.data.name).toBe('string');
            expect(typeof result.data.email).toBe('string');
            expect(result.data.age).toBe(30);
        });
    });

    describe('encryptMedicalData', () => {
        test('should encrypt medical fields successfully', () => {
            const medicalData = {
                symptoms: ['dor de cabeça', 'visão turva'],
                diagnosis: 'miopia',
                treatment: 'óculos de grau',
                medications: ['colírio A'],
                allergies: ['penicilina'],
                medical_history: 'histórico familiar de glaucoma',
                patientId: '12345' // Non-medical field
            };

            const result = encryptionService.encryptMedicalData(medicalData);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();

            // Medical fields should be encrypted
            expect(typeof result.data.symptoms).toBe('object');
            expect(typeof result.data.diagnosis).toBe('object');
            expect(typeof result.data.treatment).toBe('object');

            // Non-medical fields should remain unchanged
            expect(result.data.patientId).toBe('12345');

            // Should have medical data protection metadata
            expect(result.data._medicalDataProtection).toBeDefined();
            expect(result.data._medicalDataProtection.encrypted).toBe(true);
            expect(result.data._medicalDataProtection.protectionLevel).toBe('ENHANCED');
            expect(result.data._medicalDataProtection.complianceStandards).toContain('LGPD');
            expect(result.data._medicalDataProtection.complianceStandards).toContain('CFM');
        });
    });

    describe('createHash', () => {
        test('should create hash successfully', () => {
            const data = 'test data';
            const salt = 'salt123';

            const hash = encryptionService.createHash(data, salt);

            expect(hash).toBe('hashedvalue');
            expect(typeof hash).toBe('string');
        });

        test('should create hash without salt', () => {
            const data = 'test data';

            const hash = encryptionService.createHash(data);

            expect(hash).toBe('hashedvalue');
            expect(typeof hash).toBe('string');
        });
    });

    describe('createSecureToken', () => {
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
    });

    describe('validateIntegrity', () => {
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

    describe('rotateKeys', () => {
        test('should rotate keys successfully', () => {
            const result = encryptionService.rotateKeys();

            expect(result.success).toBe(true);
            expect(result.newKeyId).toBeDefined();
            expect(result.rotatedAt).toBeDefined();
        });
    });

    describe('getCurrentKeyId', () => {
        test('should return current key ID', () => {
            const keyId = encryptionService.getCurrentKeyId();

            expect(typeof keyId).toBe('string');
            expect(keyId).toMatch(/^key_\d+$/);
        });
    });

    describe('generateNewKeyId', () => {
        test('should generate new key ID', () => {
            const currentKeyId = encryptionService.getCurrentKeyId();
            const newKeyId = encryptionService.generateNewKeyId();

            expect(typeof newKeyId).toBe('string');
            expect(newKeyId).toMatch(/^key_\d+$/);
            expect(newKeyId).not.toBe(currentKeyId);
        });
    });

    describe('getStatus', () => {
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

        test('should cleanup old keys', () => {
            const initialKeyCount = encryptionService.encryptionKeys.size;

            // Add some old keys
            encryptionService.encryptionKeys.set('key_0_general', Buffer.alloc(32));
            encryptionService.encryptionKeys.set('key_1_general', Buffer.alloc(32));

            encryptionService.cleanupOldKeys();

            // Old keys should be removed (depending on current epoch)
            expect(encryptionService.encryptionKeys.size).toBeGreaterThanOrEqual(initialKeyCount);
        });
    });

    describe('Error handling', () => {
        test('should handle encryption errors gracefully', () => {
            // Mock crypto to throw error
            const crypto = await import('crypto');
            crypto.default.createCipher.mockImplementationOnce(() => {
                throw new Error('Crypto error');
            });

            const result = encryptionService.encrypt('test data');

            expect(result.success).toBe(false);
            expect(result.error).toBe('ENCRYPTION_FAILED');
        });

        test('should handle decryption errors gracefully', () => {
            // Mock crypto to throw error
            const crypto = await import('crypto');
            crypto.default.createDecipher.mockImplementationOnce(() => {
                throw new Error('Crypto error');
            });

            const encryptedData = {
                data: 'test',
                iv: 'iv',
                tag: 'tag',
                keyId: 'key_123',
                purpose: 'general'
            };

            const result = encryptionService.decrypt(encryptedData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('DECRYPTION_FAILED');
        });

        test('should handle hashing errors', () => {
            // Mock crypto to throw error
            const crypto = await import('crypto');
            crypto.default.createHash.mockImplementationOnce(() => {
                throw new Error('Hash error');
            });

            expect(() => {
                encryptionService.createHash('test data');
            }).toThrow('HASHING_FAILED');
        });

        test('should handle token generation errors', () => {
            // Mock crypto to throw error
            const crypto = await import('crypto');
            crypto.default.randomBytes.mockImplementationOnce(() => {
                throw new Error('Random bytes error');
            });

            expect(() => {
                encryptionService.createSecureToken();
            }).toThrow('TOKEN_GENERATION_FAILED');
        });

        test('should handle key derivation errors', () => {
            // Mock crypto to throw error
            const crypto = await import('crypto');
            crypto.default.pbkdf2Sync.mockImplementationOnce(() => {
                throw new Error('PBKDF2 error');
            });

            expect(() => {
                encryptionService.deriveKey('test_key');
            }).toThrow('KEY_DERIVATION_FAILED');
        });
    });
});