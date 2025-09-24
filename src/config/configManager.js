/**
 * Configuration Manager
 * Centralized configuration management with validation and environment handling
 * Requirements: 6.1, 6.2, 8.1
 */

import environments from './environments.js';
import { z } from 'zod';

// Configuration validation schemas
const apiConfigSchema = z.object({
    baseUrl: z.string().url(),
    timeout: z.number().positive(),
    retries: z.number().min(1).max(10),
    rateLimit: z.object({
        windowMs: z.number().positive(),
        maxRequests: z.number().positive()
    })
});

const geminiConfigSchema = z.object({
    model: z.string().min(1),
    maxTokens: z.number().positive(),
    temperature: z.number().min(0).max(2),
    safetySettings: z.array(z.object({
        category: z.string(),
        threshold: z.string()
    }))
});

const securityConfigSchema = z.object({
    encryption: z.object({
        algorithm: z.string(),
        keyRotationDays: z.number().positive()
    }),
    session: z.object({
        maxAge: z.number().positive(),
        secure: z.boolean(),
        httpOnly: z.boolean()
    }),
    cors: z.object({
        origin: z.array(z.string()),
        credentials: z.boolean()
    })
});

const complianceConfigSchema = z.object({
    cfm: z.object({
        strictMode: z.boolean(),
        emergencyResponseTime: z.number().positive(),
        disclaimerRequired: z.boolean()
    }),
    lgpd: z.object({
        consentRequired: z.boolean(),
        dataRetentionDays: z.number().positive(),
        auditLogging: z.boolean()
    })
});

const featuresConfigSchema = z.object({
    realTimeChat: z.boolean(),
    appointmentBooking: z.boolean(),
    medicalReferrals: z.boolean(),
    voiceInput: z.boolean(),
    fileUpload: z.boolean(),
    multiLanguage: z.boolean()
});

const environmentConfigSchema = z.object({
    name: z.string(),
    api: apiConfigSchema,
    gemini: geminiConfigSchema,
    database: z.object({
        connectionPool: z.object({
            min: z.number().min(1),
            max: z.number().min(1),
            acquireTimeoutMillis: z.number().positive(),
            idleTimeoutMillis: z.number().positive()
        }),
        ssl: z.boolean(),
        logging: z.boolean()
    }),
    cache: z.object({
        ttl: z.number().positive(),
        maxSize: z.number().positive(),
        enabled: z.boolean()
    }),
    security: securityConfigSchema,
    compliance: complianceConfigSchema,
    monitoring: z.object({
        enabled: z.boolean(),
        logLevel: z.enum(['debug', 'info', 'warn', 'error']),
        metricsInterval: z.number().positive(),
        healthCheckInterval: z.number().positive()
    }),
    features: featuresConfigSchema
});

class ConfigManager {
    constructor() {
        this.currentEnvironment = process.env.NODE_ENV || 'development';
        this.config = null;
        this.overrides = new Map();
        this.validators = new Map();
        this.listeners = new Map();

        this.initialize();
    }

    initialize() {
        try {
            this.loadEnvironmentConfig();
            this.validateConfiguration();
            this.applyEnvironmentOverrides();
            this.setupConfigWatching();
        } catch (error) {
            console.error('Configuration initialization failed:', error);
            throw new Error(`Configuration initialization failed: ${error.message}`);
        }
    }

    loadEnvironmentConfig() {
        const envConfig = environments[this.currentEnvironment];

        if (!envConfig) {
            throw new Error(`Environment configuration not found: ${this.currentEnvironment}`);
        }

        this.config = { ...envConfig };
    }

    validateConfiguration() {
        try {
            environmentConfigSchema.parse(this.config);
        } catch (error) {
            console.error('Configuration validation failed:', error.errors);
            throw new Error(`Configuration validation failed: ${error.message}`);
        }
    }

    applyEnvironmentOverrides() {
        // Apply environment variable overrides
        const envOverrides = {
            'GEMINI_API_KEY': ['gemini', 'apiKey'],
            'DATABASE_URL': ['database', 'url'],
            'REDIS_URL': ['cache', 'url'],
            'ENCRYPTION_KEY': ['security', 'encryption', 'key'],
            'SESSION_SECRET': ['security', 'session', 'secret'],
            'LOG_LEVEL': ['monitoring', 'logLevel'],
            'FEATURE_MEDICAL_REFERRALS': ['features', 'medicalReferrals'],
            'FEATURE_VOICE_INPUT': ['features', 'voiceInput'],
            'FEATURE_FILE_UPLOAD': ['features', 'fileUpload'],
            'CFM_STRICT_MODE': ['compliance', 'cfm', 'strictMode'],
            'LGPD_CONSENT_REQUIRED': ['compliance', 'lgpd', 'consentRequired']
        };

        Object.entries(envOverrides).forEach(([envVar, configPath]) => {
            const value = process.env[envVar];
            if (value !== undefined) {
                this.setNestedValue(this.config, configPath, this.parseEnvValue(value));
            }
        });
    }

    parseEnvValue(value) {
        // Parse boolean values
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;

        // Parse numeric values
        if (!isNaN(value) && !isNaN(parseFloat(value))) {
            return parseFloat(value);
        }

        // Return as string
        return value;
    }

    setNestedValue(obj, path, value) {
        const keys = Array.isArray(path) ? path : path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    getNestedValue(obj, path) {
        const keys = Array.isArray(path) ? path : path.split('.');
        return keys.reduce((current, key) => current?.[key], obj);
    }

    setupConfigWatching() {
        // Watch for environment variable changes in development
        if (this.currentEnvironment === 'development') {
            setInterval(() => {
                this.checkForConfigChanges();
            }, 5000); // Check every 5 seconds
        }
    }

    checkForConfigChanges() {
        // This would typically watch for file changes or environment variable updates
        // For now, we'll just validate the current configuration
        try {
            this.validateConfiguration();
        } catch (error) {
            console.warn('Configuration validation warning:', error.message);
        }
    }

    // Public API methods
    get(path, defaultValue = undefined) {
        if (!path) return this.config;

        const value = this.getNestedValue(this.config, path);
        return value !== undefined ? value : defaultValue;
    }

    set(path, value) {
        this.setNestedValue(this.config, path, value);
        this.overrides.set(path, value);
        this.notifyListeners(path, value);
    }

    getEnvironment() {
        return this.currentEnvironment;
    }

    isProduction() {
        return this.currentEnvironment === 'production';
    }

    isDevelopment() {
        return this.currentEnvironment === 'development';
    }

    isStaging() {
        return this.currentEnvironment === 'staging';
    }

    // Feature flag methods
    isFeatureEnabled(featureName) {
        return this.get(`features.${featureName}`, false);
    }

    enableFeature(featureName) {
        this.set(`features.${featureName}`, true);
    }

    disableFeature(featureName) {
        this.set(`features.${featureName}`, false);
    }

    // Configuration sections
    getApiConfig() {
        return this.get('api');
    }

    getGeminiConfig() {
        return this.get('gemini');
    }

    getDatabaseConfig() {
        return this.get('database');
    }

    getCacheConfig() {
        return this.get('cache');
    }

    getSecurityConfig() {
        return this.get('security');
    }

    getComplianceConfig() {
        return this.get('compliance');
    }

    getMonitoringConfig() {
        return this.get('monitoring');
    }

    getFeaturesConfig() {
        return this.get('features');
    }

    // Validation methods
    validateApiKey() {
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_GEMINI_API_KEY environment variable is required');
        }
        if (apiKey.length < 20) {
            throw new Error('GOOGLE_GEMINI_API_KEY appears to be invalid (too short)');
        }
        return true;
    }

    validateDatabaseConnection() {
        const dbConfig = this.getDatabaseConfig();
        if (!dbConfig) {
            throw new Error('Database configuration is missing');
        }
        return true;
    }

    validateSecuritySettings() {
        const securityConfig = this.getSecurityConfig();

        if (!process.env.ENCRYPTION_KEY) {
            throw new Error('ENCRYPTION_KEY environment variable is required');
        }

        if (this.isProduction() && !securityConfig.session.secure) {
            throw new Error('Session security must be enabled in production');
        }

        return true;
    }

    // Configuration export/import
    exportConfig() {
        return {
            environment: this.currentEnvironment,
            config: { ...this.config },
            overrides: Object.fromEntries(this.overrides),
            timestamp: new Date().toISOString()
        };
    }

    importConfig(configData) {
        if (configData.environment !== this.currentEnvironment) {
            console.warn(`Importing config from different environment: ${configData.environment} -> ${this.currentEnvironment}`);
        }

        // Apply overrides
        Object.entries(configData.overrides || {}).forEach(([path, value]) => {
            this.set(path, value);
        });
    }

    // Event listeners for configuration changes
    addListener(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
    }

    removeListener(path, callback) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).delete(callback);
        }
    }

    notifyListeners(path, value) {
        if (this.listeners.has(path)) {
            this.listeners.get(path).forEach(callback => {
                try {
                    callback(value, path);
                } catch (error) {
                    console.error('Configuration listener error:', error);
                }
            });
        }
    }

    // Health check
    healthCheck() {
        const checks = {
            configLoaded: !!this.config,
            environmentValid: !!environments[this.currentEnvironment],
            apiKeyPresent: !!process.env.GOOGLE_GEMINI_API_KEY,
            encryptionKeyPresent: !!process.env.ENCRYPTION_KEY,
            validationPassed: false
        };

        try {
            this.validateConfiguration();
            checks.validationPassed = true;
        } catch (error) {
            checks.validationError = error.message;
        }

        return {
            healthy: Object.values(checks).every(check => check === true || typeof check === 'string'),
            checks,
            environment: this.currentEnvironment,
            timestamp: new Date().toISOString()
        };
    }
}

// Create singleton instance
const configManager = new ConfigManager();

export default configManager;
export { ConfigManager };