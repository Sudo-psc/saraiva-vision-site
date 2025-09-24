/**
 * Google Business Environment Configuration
 * Handles secure credential storage and environment setup
 */

import crypto from 'crypto';

class GoogleBusinessConfig {
    constructor() {
        this.encryptionKey = this._getEncryptionKey();
        this.credentials = null;
    }

    /**
     * Get encryption key from environment
     * @private
     */
    _getEncryptionKey() {
        const key = process.env.GOOGLE_BUSINESS_ENCRYPTION_KEY;
        if (!key) {
            throw new Error('GOOGLE_BUSINESS_ENCRYPTION_KEY environment variable is required');
        }
        return key;
    }

    /**
     * Get normalized 32-byte encryption key
     * @private
     */
    _getNormalizedKey() {
        return crypto.createHash('sha256').update(this.encryptionKey).digest();
    }

    /**
     * Encrypt sensitive data using AES-256-GCM with explicit IV
     * @private
     */
    _encrypt(text) {
        const algorithm = 'aes-256-gcm';
        const key = this._getNormalizedKey(); // 32-byte key
        const iv = crypto.randomBytes(12); // 12-byte IV for GCM
        const cipher = crypto.createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
        };
    }

    /**
     * Decrypt sensitive data using AES-256-GCM with explicit IV
     * @private
     */
    _decrypt(encryptedData) {
        const algorithm = 'aes-256-gcm';
        const key = this._getNormalizedKey(); // 32-byte key
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const authTag = Buffer.from(encryptedData.authTag, 'hex');
        
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Get Google Business API credentials
     * @returns {Promise<Object>} Decrypted credentials
     */
    async getCredentials() {
        if (this.credentials) {
            return this.credentials;
        }

        try {
            // Try to get from environment variables first
            const envCredentials = this._getCredentialsFromEnv();
            if (envCredentials) {
                this.credentials = envCredentials;
                return this.credentials;
            }

            // If not in env, try to get from encrypted storage
            const storedCredentials = await this._getStoredCredentials();
            if (storedCredentials) {
                this.credentials = storedCredentials;
                return this.credentials;
            }

            throw new Error('No Google Business API credentials found');
        } catch (error) {
            console.error('Failed to retrieve Google Business credentials:', error);
            throw error;
        }
    }

    /**
     * Get credentials from environment variables
     * @private
     */
    _getCredentialsFromEnv() {
        const clientId = process.env.GOOGLE_BUSINESS_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_BUSINESS_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
            return null;
        }

        return {
            clientId,
            clientSecret,
            refreshToken,
        };
    }

    /**
     * Get credentials from encrypted storage
     * @private
     */
    async _getStoredCredentials() {
        // This would typically read from a secure database
        // For now, we'll return null as we're using env vars
        return null;
    }

    /**
     * Store encrypted credentials
     * @param {Object} credentials - Credentials to store
     * @returns {Promise<void>}
     */
    async storeCredentials(credentials) {
        try {
            const encryptedClientId = this._encrypt(credentials.clientId);
            const encryptedClientSecret = this._encrypt(credentials.clientSecret);
            const encryptedRefreshToken = this._encrypt(credentials.refreshToken);

            // Store encrypted credentials (implementation would depend on storage method)
            const encryptedCredentials = {
                clientId: encryptedClientId,
                clientSecret: encryptedClientSecret,
                refreshToken: encryptedRefreshToken,
                createdAt: new Date().toISOString(),
            };

            // In a real implementation, this would be stored in a secure database
            console.log('Credentials encrypted and ready for storage');

            // Update in-memory cache
            this.credentials = credentials;

            return true;
        } catch (error) {
            console.error('Failed to store credentials:', error);
            throw new Error('Failed to store encrypted credentials');
        }
    }

    /**
     * Validate environment configuration
     * @returns {Object} Validation results
     */
    validateEnvironment() {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
        };

        // Check required environment variables
        const requiredVars = [
            'GOOGLE_BUSINESS_CLIENT_ID',
            'GOOGLE_BUSINESS_CLIENT_SECRET',
            'GOOGLE_BUSINESS_REFRESH_TOKEN',
            'GOOGLE_BUSINESS_ENCRYPTION_KEY',
        ];

        requiredVars.forEach(varName => {
            if (!process.env[varName]) {
                validation.isValid = false;
                validation.errors.push(`Missing required environment variable: ${varName}`);
            }
        });

        // Check optional configuration
        const optionalVars = [
            'GOOGLE_BUSINESS_LOCATION_ID',
            'GOOGLE_BUSINESS_API_TIMEOUT',
            'GOOGLE_BUSINESS_CACHE_TTL',
        ];

        optionalVars.forEach(varName => {
            if (!process.env[varName]) {
                validation.warnings.push(`Optional environment variable not set: ${varName}`);
            }
        });

        // Validate encryption key length
        if (process.env.GOOGLE_BUSINESS_ENCRYPTION_KEY &&
            process.env.GOOGLE_BUSINESS_ENCRYPTION_KEY.length < 32) {
            validation.isValid = false;
            validation.errors.push('GOOGLE_BUSINESS_ENCRYPTION_KEY must be at least 32 characters long');
        }

        return validation;
    }

    /**
     * Get configuration settings
     * @returns {Object} Configuration object
     */
    getConfig() {
        return {
            locationId: process.env.GOOGLE_BUSINESS_LOCATION_ID,
            apiTimeout: parseInt(process.env.GOOGLE_BUSINESS_API_TIMEOUT || '10000', 10),
            cacheTtl: parseInt(process.env.GOOGLE_BUSINESS_CACHE_TTL || '86400', 10), // 24 hours
            maxRetries: parseInt(process.env.GOOGLE_BUSINESS_MAX_RETRIES || '3', 10),
            rateLimitBuffer: parseInt(process.env.GOOGLE_BUSINESS_RATE_LIMIT_BUFFER || '50', 10),
        };
    }

    /**
     * Clear cached credentials (for testing or security)
     */
    clearCredentials() {
        this.credentials = null;
    }
}

// Export singleton instance
export const googleBusinessConfig = new GoogleBusinessConfig();
export default GoogleBusinessConfig;