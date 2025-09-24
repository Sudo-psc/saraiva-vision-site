/**
 * Data Encryption Service
 * Provides secure encryption and decryption for sensitive data
 */

import crypto from 'crypto';

class DataEncryptionService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32; // 256 bits
        this.ivLength = 16; // 128 bits
        this.tagLength = 16; // 128 bits

        // In production, these should come from secure environment variables
        this.masterKey = process.env.ENCRYPTION_MASTER_KEY || this.generateMasterKey();
        this.keyRotationPeriod = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds

        this.encryptionKeys = new Map();
        this.initializeKeys();
    }

    /**
     * Initializes encryption keys
     */
    initializeKeys() {
        const currentKeyId = this.getCurrentKeyId();
        if (!this.encryptionKeys.has(currentKeyId)) {
            this.encryptionKeys.set(currentKeyId, this.deriveKey(currentKeyId));
        }
    }

    /**
     * Encrypts sensitive data
     * @param {string} plaintext - Data to encrypt
     * @param {string} purpose - Purpose of encryption (for key derivation)
     * @returns {Object} Encryption result
     */
    encrypt(plaintext, purpose = 'general') {
        try {
            if (!plaintext) {
                throw new Error('Plaintext is required');
            }

            const keyId = this.getCurrentKeyId();
            const key = this.getOrCreateKey(keyId, purpose);
            const iv = crypto.randomBytes(this.ivLength);

            const cipher = crypto.createCipher(this.algorithm, key);
            cipher.setAAD(Buffer.from(purpose)); // Additional authenticated data

            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const tag = cipher.getAuthTag();

            const result = {
                data: encrypted,
                iv: iv.toString('hex'),
                tag: tag.toString('hex'),
                keyId,
                algorithm: this.algorithm,
                purpose,
                timestamp: new Date().toISOString()
            };

            return {
                success: true,
                encrypted: result
            };
        } catch (error) {
            console.error('Encryption error:', error);
            return {
                success: false,
                error: 'ENCRYPTION_FAILED',
                message: error.message
            };
        }
    }

    /**
     * Decrypts encrypted data
     * @param {Object} encryptedData - Encrypted data object
     * @returns {Object} Decryption result
     */
    decrypt(encryptedData) {
        try {
            if (!encryptedData || !encryptedData.data) {
                throw new Error('Encrypted data is required');
            }

            const { data, iv, tag, keyId, purpose } = encryptedData;
            const key = this.getKey(keyId, purpose);

            if (!key) {
                throw new Error('Encryption key not found');
            }

            const decipher = crypto.createDecipher(this.algorithm, key);
            decipher.setAAD(Buffer.from(purpose || 'general'));
            decipher.setAuthTag(Buffer.from(tag, 'hex'));

            let decrypted = decipher.update(data, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return {
                success: true,
                data: decrypted
            };
        } catch (error) {
            console.error('Decryption error:', error);
            return {
                success: false,
                error: 'DECRYPTION_FAILED',
                message: error.message
            };
        }
    }

    /**
     * Encrypts personal identifiable information (PII)
     * @param {Object} piiData - PII data to encrypt
     * @returns {Object} Encrypted PII result
     */
    encryptPII(piiData) {
        try {
            const encryptedPII = {};
            const sensitiveFields = ['name', 'email', 'phone', 'cpf', 'address'];

            for (const [key, value] of Object.entries(piiData)) {
                if (sensitiveFields.includes(key) && value) {
                    const encryptionResult = this.encrypt(value, 'pii');
                    if (encryptionResult.success) {
                        encryptedPII[key] = encryptionResult.encrypted;
                    } else {
                        throw new Error(`Failed to encrypt ${key}`);
                    }
                } else {
                    encryptedPII[key] = value;
                }
            }

            return {
                success: true,
                data: encryptedPII
            };
        } catch (error) {
            console.error('PII encryption error:', error);
            return {
                success: false,
                error: 'PII_ENCRYPTION_FAILED',
                message: error.message
            };
        }
    }

    /**
     * Decrypts personal identifiable information (PII)
     * @param {Object} encryptedPII - Encrypted PII data
     * @returns {Object} Decrypted PII result
     */
    decryptPII(encryptedPII) {
        try {
            const decryptedPII = {};
            const sensitiveFields = ['name', 'email', 'phone', 'cpf', 'address'];

            for (const [key, value] of Object.entries(encryptedPII)) {
                if (sensitiveFields.includes(key) && value && typeof value === 'object') {
                    const decryptionResult = this.decrypt(value);
                    if (decryptionResult.success) {
                        decryptedPII[key] = decryptionResult.data;
                    } else {
                        throw new Error(`Failed to decrypt ${key}`);
                    }
                } else {
                    decryptedPII[key] = value;
                }
            }

            return {
                success: true,
                data: decryptedPII
            };
        } catch (error) {
            console.error('PII decryption error:', error);
            return {
                success: false,
                error: 'PII_DECRYPTION_FAILED',
                message: error.message
            };
        }
    }

    /**
     * Encrypts medical data with enhanced security
     * @param {Object} medicalData - Medical data to encrypt
     * @returns {Object} Encrypted medical data result
     */
    encryptMedicalData(medicalData) {
        try {
            const encryptedData = {};
            const medicalFields = [
                'symptoms', 'diagnosis', 'treatment', 'medications',
                'allergies', 'medical_history', 'test_results'
            ];

            for (const [key, value] of Object.entries(medicalData)) {
                if (medicalFields.includes(key) && value) {
                    const encryptionResult = this.encrypt(JSON.stringify(value), 'medical');
                    if (encryptionResult.success) {
                        encryptedData[key] = encryptionResult.encrypted;
                    } else {
                        throw new Error(`Failed to encrypt medical field ${key}`);
                    }
                } else {
                    encryptedData[key] = value;
                }
            }

            // Add medical data protection metadata
            encryptedData._medicalDataProtection = {
                encrypted: true,
                encryptedAt: new Date().toISOString(),
                protectionLevel: 'ENHANCED',
                complianceStandards: ['LGPD', 'CFM']
            };

            return {
                success: true,
                data: encryptedData
            };
        } catch (error) {
            console.error('Medical data encryption error:', error);
            return {
                success: false,
                error: 'MEDICAL_DATA_ENCRYPTION_FAILED',
                message: error.message
            };
        }
    }

    /**
     * Creates a secure hash of data
     * @param {string} data - Data to hash
     * @param {string} salt - Optional salt
     * @returns {string} Hash result
     */
    createHash(data, salt = '') {
        try {
            const hash = crypto.createHash('sha256');
            hash.update(data + salt);
            return hash.digest('hex');
        } catch (error) {
            console.error('Hashing error:', error);
            throw new Error('HASHING_FAILED');
        }
    }

    /**
     * Creates a secure token
     * @param {number} length - Token length
     * @returns {string} Secure token
     */
    createSecureToken(length = 32) {
        try {
            return crypto.randomBytes(length).toString('hex');
        } catch (error) {
            console.error('Token generation error:', error);
            throw new Error('TOKEN_GENERATION_FAILED');
        }
    }

    /**
     * Validates data integrity
     * @param {string} data - Original data
     * @param {string} hash - Expected hash
     * @param {string} salt - Salt used in hashing
     * @returns {boolean} Validation result
     */
    validateIntegrity(data, hash, salt = '') {
        try {
            const computedHash = this.createHash(data, salt);
            return computedHash === hash;
        } catch (error) {
            console.error('Integrity validation error:', error);
            return false;
        }
    }

    /**
     * Rotates encryption keys
     * @returns {Object} Key rotation result
     */
    rotateKeys() {
        try {
            const newKeyId = this.generateNewKeyId();
            const newKey = this.deriveKey(newKeyId);

            this.encryptionKeys.set(newKeyId, newKey);

            // Keep old keys for decryption of existing data
            this.cleanupOldKeys();

            return {
                success: true,
                newKeyId,
                rotatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Key rotation error:', error);
            return {
                success: false,
                error: 'KEY_ROTATION_FAILED',
                message: error.message
            };
        }
    }

    /**
     * Gets current key ID
     * @returns {string} Current key ID
     */
    getCurrentKeyId() {
        const now = new Date();
        const epoch = Math.floor(now.getTime() / this.keyRotationPeriod);
        return `key_${epoch}`;
    }

    /**
     * Generates a new key ID
     * @returns {string} New key ID
     */
    generateNewKeyId() {
        const now = new Date();
        const epoch = Math.floor(now.getTime() / this.keyRotationPeriod) + 1;
        return `key_${epoch}`;
    }

    /**
     * Derives encryption key from master key and key ID
     * @param {string} keyId - Key identifier
     * @param {string} purpose - Key purpose
     * @returns {Buffer} Derived key
     */
    deriveKey(keyId, purpose = 'general') {
        try {
            const info = `${keyId}_${purpose}`;
            return crypto.pbkdf2Sync(this.masterKey, info, 100000, this.keyLength, 'sha256');
        } catch (error) {
            console.error('Key derivation error:', error);
            throw new Error('KEY_DERIVATION_FAILED');
        }
    }

    /**
     * Gets or creates encryption key
     * @param {string} keyId - Key identifier
     * @param {string} purpose - Key purpose
     * @returns {Buffer} Encryption key
     */
    getOrCreateKey(keyId, purpose = 'general') {
        const keyMapId = `${keyId}_${purpose}`;

        if (!this.encryptionKeys.has(keyMapId)) {
            const key = this.deriveKey(keyId, purpose);
            this.encryptionKeys.set(keyMapId, key);
        }

        return this.encryptionKeys.get(keyMapId);
    }

    /**
     * Gets encryption key
     * @param {string} keyId - Key identifier
     * @param {string} purpose - Key purpose
     * @returns {Buffer|null} Encryption key or null if not found
     */
    getKey(keyId, purpose = 'general') {
        const keyMapId = `${keyId}_${purpose}`;
        return this.encryptionKeys.get(keyMapId) || null;
    }

    /**
     * Generates master key
     * @returns {string} Master key
     */
    generateMasterKey() {
        return crypto.randomBytes(this.keyLength).toString('hex');
    }

    /**
     * Cleans up old encryption keys
     */
    cleanupOldKeys() {
        const currentEpoch = Math.floor(Date.now() / this.keyRotationPeriod);
        const keysToRemove = [];

        for (const keyId of this.encryptionKeys.keys()) {
            const keyEpoch = parseInt(keyId.split('_')[1]);

            // Keep keys from last 3 rotation periods
            if (currentEpoch - keyEpoch > 3) {
                keysToRemove.push(keyId);
            }
        }

        keysToRemove.forEach(keyId => {
            this.encryptionKeys.delete(keyId);
        });
    }

    /**
     * Gets encryption service status
     * @returns {Object} Service status
     */
    getStatus() {
        return {
            algorithm: this.algorithm,
            keyCount: this.encryptionKeys.size,
            currentKeyId: this.getCurrentKeyId(),
            keyRotationPeriod: this.keyRotationPeriod,
            lastRotation: new Date().toISOString()
        };
    }
}

export default DataEncryptionService;