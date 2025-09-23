/**
 * LGPD Data Encryption Utilities
 * Handles encryption/decryption of sensitive data at rest and in transit
 */

import CryptoJS from 'crypto-js';

export class DataEncryption {
    constructor() {
        // In production, these should come from environment variables
        this.encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;
        if (!this.encryptionKey) {
            throw new Error('VITE_ENCRYPTION_KEY environment variable is required');
        }
        this.algorithm = 'AES';
    }

    /**
     * Encrypt sensitive data before storage
     */
    encrypt(data) {
        try {
            if (!data) return null;

            const dataString = typeof data === 'string' ? data : JSON.stringify(data);
            const encrypted = CryptoJS.AES.encrypt(dataString, this.encryptionKey).toString();

            return {
                encrypted: encrypted,
                timestamp: new Date().toISOString(),
                algorithm: this.algorithm
            };
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt sensitive data after retrieval
     */
    decrypt(encryptedData) {
        try {
            if (!encryptedData || !encryptedData.encrypted) return null;

            const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, this.encryptionKey);
            const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

            if (!decryptedString) {
                throw new Error('Failed to decrypt data - invalid key or corrupted data');
            }

            // Try to parse as JSON, fallback to string
            try {
                return JSON.parse(decryptedString);
            } catch {
                return decryptedString;
            }
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Hash sensitive data for indexing (one-way)
     */
    hash(data) {
        try {
            if (!data) return null;

            const dataString = typeof data === 'string' ? data : JSON.stringify(data);
            return CryptoJS.SHA256(dataString).toString();
        } catch (error) {
            console.error('Hashing error:', error);
            throw new Error('Failed to hash data');
        }
    }

    /**
     * Generate secure random token
     */
    generateSecureToken(length = 32) {
        try {
            return CryptoJS.lib.WordArray.random(length).toString();
        } catch (error) {
            console.error('Token generation error:', error);
            throw new Error('Failed to generate secure token');
        }
    }

    /**
     * Encrypt personal data for API transmission
     */
    encryptForTransmission(personalData) {
        try {
            const sensitiveFields = [
                'email',
                'phone',
                'cpf',
                'rg',
                'address',
                'medicalHistory',
                'notes'
            ];

            const encryptedData = { ...personalData };

            sensitiveFields.forEach(field => {
                if (encryptedData[field]) {
                    encryptedData[field] = this.encrypt(encryptedData[field]);
                }
            });

            return encryptedData;
        } catch (error) {
            console.error('Transmission encryption error:', error);
            throw new Error('Failed to encrypt data for transmission');
        }
    }

    /**
     * Decrypt personal data received from API
     */
    decryptFromTransmission(encryptedData) {
        try {
            const sensitiveFields = [
                'email',
                'phone',
                'cpf',
                'rg',
                'address',
                'medicalHistory',
                'notes'
            ];

            const decryptedData = { ...encryptedData };

            sensitiveFields.forEach(field => {
                if (decryptedData[field] && typeof decryptedData[field] === 'object') {
                    decryptedData[field] = this.decrypt(decryptedData[field]);
                }
            });

            return decryptedData;
        } catch (error) {
            console.error('Transmission decryption error:', error);
            throw new Error('Failed to decrypt data from transmission');
        }
    }
}

// Singleton instance
export const dataEncryption = new DataEncryption();

/**
 * Secure storage wrapper for localStorage with encryption
 */
export class SecureStorage {
    constructor() {
        this.encryption = new DataEncryption();
    }

    /**
     * Store encrypted data in localStorage
     */
    setItem(key, value) {
        try {
            const encryptedValue = this.encryption.encrypt(value);
            localStorage.setItem(key, JSON.stringify(encryptedValue));
            return true;
        } catch (error) {
            console.error('Secure storage set error:', error);
            return false;
        }
    }

    /**
     * Retrieve and decrypt data from localStorage
     */
    getItem(key) {
        try {
            const storedValue = localStorage.getItem(key);
            if (!storedValue) return null;

            const encryptedData = JSON.parse(storedValue);
            return this.encryption.decrypt(encryptedData);
        } catch (error) {
            console.error('Secure storage get error:', error);
            return null;
        }
    }

    /**
     * Remove item from localStorage
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Secure storage remove error:', error);
            return false;
        }
    }

    /**
     * Clear all encrypted storage
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Secure storage clear error:', error);
            return false;
        }
    }
}

// Singleton instance
export const secureStorage = new SecureStorage();