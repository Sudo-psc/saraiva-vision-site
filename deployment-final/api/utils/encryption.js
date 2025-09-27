/**
 * Server-side encryption utilities for LGPD compliance
 * Handles encryption of sensitive data at rest in database
 */

import crypto from 'crypto';

export class ServerEncryption {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;

        // In production, this should come from environment variables
        this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateKey();

        if (!process.env.ENCRYPTION_KEY) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('ENCRYPTION_KEY environment variable is required in production');
            }
            console.warn('WARNING: Using default encryption key for development only');
        }
    }

    /**
     * Generate a secure encryption key
     */
    generateKey() {
        return crypto.randomBytes(this.keyLength);
    }

    /**
     * Encrypt sensitive data for database storage
     */
    encrypt(plaintext) {
        try {
            if (!plaintext) return null;

            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
            cipher.setAAD(Buffer.from('lgpd-saraiva-vision'));

            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const tag = cipher.getAuthTag();

            return {
                encrypted,
                iv: iv.toString('hex'),
                tag: tag.toString('hex'),
                algorithm: this.algorithm
            };
        } catch (error) {
            console.error('Server encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt sensitive data from database
     */
    decrypt(encryptedData) {
        try {
            if (!encryptedData || !encryptedData.encrypted) return null;

            const { encrypted, iv, tag } = encryptedData;

            const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
            decipher.setAAD(Buffer.from('lgpd-saraiva-vision'));
            decipher.setAuthTag(Buffer.from(tag, 'hex'));

            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Server decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Hash sensitive data for indexing (one-way)
     */
    hash(data, salt = null) {
        try {
            if (!data) return null;

            const actualSalt = salt || crypto.randomBytes(16).toString('hex');
            const hash = crypto.pbkdf2Sync(data, actualSalt, 10000, 64, 'sha512');

            return {
                hash: hash.toString('hex'),
                salt: actualSalt
            };
        } catch (error) {
            console.error('Server hashing error:', error);
            throw new Error('Failed to hash data');
        }
    }

    /**
     * Verify hashed data
     */
    verifyHash(data, storedHash, salt) {
        try {
            const { hash } = this.hash(data, salt);
            return hash === storedHash;
        } catch (error) {
            console.error('Hash verification error:', error);
            return false;
        }
    }

    /**
     * Generate secure random token
     */
    generateSecureToken(length = 32) {
        try {
            return crypto.randomBytes(length).toString('hex');
        } catch (error) {
            console.error('Token generation error:', error);
            throw new Error('Failed to generate secure token');
        }
    }

    /**
     * Encrypt personal data fields in database record
     */
    encryptPersonalData(record) {
        try {
            const sensitiveFields = [
                'email',
                'phone',
                'patient_email',
                'patient_phone',
                'patient_name',
                'name',
                'cpf',
                'rg',
                'address',
                'medical_history',
                'notes',
                'message'
            ];

            const encryptedRecord = { ...record };

            sensitiveFields.forEach(field => {
                if (encryptedRecord[field] && typeof encryptedRecord[field] === 'string') {
                    encryptedRecord[field] = this.encrypt(encryptedRecord[field]);
                }
            });

            return encryptedRecord;
        } catch (error) {
            console.error('Personal data encryption error:', error);
            throw new Error('Failed to encrypt personal data');
        }
    }

    /**
     * Decrypt personal data fields from database record
     */
    decryptPersonalData(encryptedRecord) {
        try {
            const sensitiveFields = [
                'email',
                'phone',
                'patient_email',
                'patient_phone',
                'patient_name',
                'name',
                'cpf',
                'rg',
                'address',
                'medical_history',
                'notes',
                'message'
            ];

            const decryptedRecord = { ...encryptedRecord };

            sensitiveFields.forEach(field => {
                if (decryptedRecord[field] && typeof decryptedRecord[field] === 'object') {
                    decryptedRecord[field] = this.decrypt(decryptedRecord[field]);
                }
            });

            return decryptedRecord;
        } catch (error) {
            console.error('Personal data decryption error:', error);
            throw new Error('Failed to decrypt personal data');
        }
    }
}

// Singleton instance
export const serverEncryption = new ServerEncryption();