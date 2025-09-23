import CryptoJS from 'crypto-js';

/**
 * Google Business Configuration Manager
 * Handles secure storage and management of API credentials and settings
 */
class GoogleBusinessConfig {
    constructor() {
        this.encryptionKey = this.generateEncryptionKey();
        this.config = {
            locationId: null,
            apiCredentials: null,
            displaySettings: {
                maxReviews: 5,
                minRating: 1,
                showAnonymous: true,
                enableFiltering: true
            },
            syncSettings: {
                interval: 24, // hours
                autoSync: true,
                notifyOnErrors: true
            },
            isActive: false
        };
    }

    /**
     * Generate or retrieve encryption key from environment
     */
    generateEncryptionKey() {
        // In production, this should come from environment variables
        const envKey = import.meta.env.VITE_GOOGLE_BUSINESS_ENCRYPTION_KEY;

        if (envKey) {
            return envKey;
        }

        // Generate a key for development (should be stored securely in production)
        const key = CryptoJS.lib.WordArray.random(256 / 8).toString();
        console.warn('Using generated encryption key. Set VITE_GOOGLE_BUSINESS_ENCRYPTION_KEY in production.');
        return key;
    }

    /**
     * Encrypt API credentials
     * @param {Object} credentials - API credentials object
     */
    encryptCredentials(credentials) {
        try {
            const credentialsString = JSON.stringify(credentials);
            const encrypted = CryptoJS.AES.encrypt(credentialsString, this.encryptionKey).toString();
            return encrypted;
        } catch (error) {
            console.error('Failed to encrypt credentials:', error);
            throw new Error('Credential encryption failed');
        }
    }

    /**
     * Decrypt API credentials
     * @param {string} encryptedCredentials - Encrypted credentials string
     */
    decryptCredentials(encryptedCredentials) {
        try {
            const decryptedBytes = CryptoJS.AES.decrypt(encryptedCredentials, this.encryptionKey);
            const credentialsString = decryptedBytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(credentialsString);
        } catch (error) {
            console.error('Failed to decrypt credentials:', error);
            throw new Error('Credential decryption failed');
        }
    }

    /**
     * Set API credentials securely
     * @param {string} apiKey - Google API key
     * @param {string} accessToken - OAuth access token
     * @param {string} refreshToken - OAuth refresh token (optional)
     */
    setCredentials(apiKey, accessToken, refreshToken = null) {
        if (!apiKey || !accessToken) {
            throw new Error('API key and access token are required');
        }

        const credentials = {
            apiKey,
            accessToken,
            refreshToken,
            createdAt: new Date().toISOString()
        };

        this.config.apiCredentials = this.encryptCredentials(credentials);
        return true;
    }

    /**
     * Get decrypted API credentials
     */
    getCredentials() {
        if (!this.config.apiCredentials) {
            return null;
        }

        try {
            return this.decryptCredentials(this.config.apiCredentials);
        } catch (error) {
            console.error('Failed to retrieve credentials:', error);
            return null;
        }
    }

    /**
     * Set location ID
     * @param {string} locationId - Google My Business location ID
     */
    setLocationId(locationId) {
        if (!locationId || typeof locationId !== 'string') {
            throw new Error('Valid location ID is required');
        }

        // Basic validation for location ID format
        if (!locationId.includes('accounts/') || !locationId.includes('locations/')) {
            throw new Error('Invalid location ID format. Expected: accounts/{accountId}/locations/{locationId}');
        }

        this.config.locationId = locationId;
        return true;
    }

    /**
     * Get location ID
     */
    getLocationId() {
        return this.config.locationId;
    }

    /**
     * Update display settings
     * @param {Object} settings - Display settings object
     */
    updateDisplaySettings(settings) {
        const validSettings = {};

        // Only include defined values
        if (settings.maxReviews !== undefined) {
            validSettings.maxReviews = settings.maxReviews;
        }
        if (settings.minRating !== undefined) {
            validSettings.minRating = settings.minRating;
        }
        if (settings.showAnonymous !== undefined) {
            validSettings.showAnonymous = settings.showAnonymous;
        }
        if (settings.enableFiltering !== undefined) {
            validSettings.enableFiltering = settings.enableFiltering;
        }

        // Validate settings
        if (validSettings.maxReviews !== undefined && (validSettings.maxReviews < 1 || validSettings.maxReviews > 50)) {
            throw new Error('maxReviews must be between 1 and 50');
        }

        if (validSettings.minRating !== undefined && (validSettings.minRating < 1 || validSettings.minRating > 5)) {
            throw new Error('minRating must be between 1 and 5');
        }

        this.config.displaySettings = {
            ...this.config.displaySettings,
            ...validSettings
        };

        return true;
    }

    /**
     * Update sync settings
     * @param {Object} settings - Sync settings object
     */
    updateSyncSettings(settings) {
        const validSettings = {};

        // Only include defined values
        if (settings.interval !== undefined) {
            validSettings.interval = settings.interval;
        }
        if (settings.autoSync !== undefined) {
            validSettings.autoSync = settings.autoSync;
        }
        if (settings.notifyOnErrors !== undefined) {
            validSettings.notifyOnErrors = settings.notifyOnErrors;
        }

        // Validate settings
        if (validSettings.interval !== undefined && (validSettings.interval < 1 || validSettings.interval > 168)) {
            throw new Error('interval must be between 1 and 168 hours (1 week)');
        }

        this.config.syncSettings = {
            ...this.config.syncSettings,
            ...validSettings
        };

        return true;
    }

    /**
     * Activate or deactivate the integration
     * @param {boolean} active - Whether the integration should be active
     */
    setActive(active) {
        this.config.isActive = Boolean(active);
        return true;
    }

    /**
     * Check if the integration is properly configured
     */
    isConfigured() {
        return !!(
            this.config.locationId &&
            this.config.apiCredentials &&
            this.getCredentials()
        );
    }

    /**
     * Get complete configuration
     */
    getConfig() {
        return {
            locationId: this.config.locationId,
            hasCredentials: !!this.config.apiCredentials,
            displaySettings: { ...this.config.displaySettings },
            syncSettings: { ...this.config.syncSettings },
            isActive: this.config.isActive,
            isConfigured: this.isConfigured()
        };
    }

    /**
     * Load configuration from storage
     * @param {Object} savedConfig - Previously saved configuration
     */
    loadConfig(savedConfig) {
        if (!savedConfig || typeof savedConfig !== 'object') {
            return false;
        }

        try {
            if (savedConfig.locationId) {
                this.config.locationId = savedConfig.locationId;
            }

            if (savedConfig.apiCredentials) {
                this.config.apiCredentials = savedConfig.apiCredentials;
            }

            if (savedConfig.displaySettings) {
                this.config.displaySettings = {
                    ...this.config.displaySettings,
                    ...savedConfig.displaySettings
                };
            }

            if (savedConfig.syncSettings) {
                this.config.syncSettings = {
                    ...this.config.syncSettings,
                    ...savedConfig.syncSettings
                };
            }

            if (typeof savedConfig.isActive === 'boolean') {
                this.config.isActive = savedConfig.isActive;
            }

            return true;
        } catch (error) {
            console.error('Failed to load configuration:', error);
            return false;
        }
    }

    /**
     * Export configuration for storage (without sensitive data)
     */
    exportConfig() {
        return {
            locationId: this.config.locationId,
            apiCredentials: this.config.apiCredentials, // Already encrypted
            displaySettings: { ...this.config.displaySettings },
            syncSettings: { ...this.config.syncSettings },
            isActive: this.config.isActive,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Validate configuration completeness
     */
    validateConfig() {
        const errors = [];

        if (!this.config.locationId) {
            errors.push('Location ID is required');
        }

        if (!this.config.apiCredentials) {
            errors.push('API credentials are required');
        } else {
            try {
                const credentials = this.getCredentials();
                if (!credentials.apiKey || !credentials.accessToken) {
                    errors.push('Invalid API credentials');
                }
            } catch (error) {
                errors.push('Failed to decrypt API credentials');
            }
        }

        if (this.config.displaySettings.maxReviews < 1 || this.config.displaySettings.maxReviews > 50) {
            errors.push('maxReviews must be between 1 and 50');
        }

        if (this.config.displaySettings.minRating < 1 || this.config.displaySettings.minRating > 5) {
            errors.push('minRating must be between 1 and 5');
        }

        if (this.config.syncSettings.interval < 1 || this.config.syncSettings.interval > 168) {
            errors.push('sync interval must be between 1 and 168 hours');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Reset configuration to defaults
     */
    reset() {
        this.config = {
            locationId: null,
            apiCredentials: null,
            displaySettings: {
                maxReviews: 5,
                minRating: 1,
                showAnonymous: true,
                enableFiltering: true
            },
            syncSettings: {
                interval: 24,
                autoSync: true,
                notifyOnErrors: true
            },
            isActive: false
        };

        return true;
    }
}

export default GoogleBusinessConfig;