/**
 * Chatbot Configuration Management
 * Handles environment variables and secure configuration
 */

class ChatbotConfig {
    constructor() {
        this.config = this.loadConfiguration();
        this.validateConfiguration();
    }

    /**
     * Load configuration from environment variables
     */
    loadConfiguration() {
        return {
            // Google Gemini API Configuration
            gemini: {
                apiKey: process.env.GOOGLE_GEMINI_API_KEY,
                model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
                maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 8192,
                temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
                topK: parseInt(process.env.GEMINI_TOP_K) || 40,
                topP: parseFloat(process.env.GEMINI_TOP_P) || 0.95,
            },

            // Rate Limiting Configuration
            rateLimiting: {
                maxRequestsPerMinute: parseInt(process.env.CHATBOT_RATE_LIMIT_RPM) || 60,
                maxRequestsPerHour: parseInt(process.env.CHATBOT_RATE_LIMIT_RPH) || 1000,
                maxTokensPerUser: parseInt(process.env.CHATBOT_MAX_TOKENS_PER_USER) || 50000,
                windowSizeMinutes: parseInt(process.env.CHATBOT_RATE_WINDOW) || 1,
            },

            // Security Configuration
            security: {
                enableInputValidation: process.env.CHATBOT_INPUT_VALIDATION !== 'false',
                maxMessageLength: parseInt(process.env.CHATBOT_MAX_MESSAGE_LENGTH) || 2000,
                enableContentFiltering: process.env.CHATBOT_CONTENT_FILTERING !== 'false',
                sessionTimeout: parseInt(process.env.CHATBOT_SESSION_TIMEOUT) || 1800000, // 30 minutes
                enableEncryption: process.env.CHATBOT_ENABLE_ENCRYPTION !== 'false',
            },

            // Medical Compliance Configuration
            medical: {
                enableCFMCompliance: process.env.CHATBOT_CFM_COMPLIANCE !== 'false',
                enableEmergencyDetection: process.env.CHATBOT_EMERGENCY_DETECTION !== 'false',
                requireMedicalDisclaimers: process.env.CHATBOT_MEDICAL_DISCLAIMERS !== 'false',
                emergencyKeywords: (process.env.CHATBOT_EMERGENCY_KEYWORDS ||
                    'emergência,socorro,dor intensa,perda de visão,sangramento,acidente').split(','),
                medicalTerms: (process.env.CHATBOT_MEDICAL_TERMS ||
                    'diagnóstico,receita,medicamento,tratamento,cirurgia,doença').split(','),
            },

            // LGPD Privacy Configuration
            privacy: {
                enableLGPDCompliance: process.env.CHATBOT_LGPD_COMPLIANCE !== 'false',
                dataRetentionDays: parseInt(process.env.CHATBOT_DATA_RETENTION_DAYS) || 365,
                enableConsentManagement: process.env.CHATBOT_CONSENT_MANAGEMENT !== 'false',
                enableDataEncryption: process.env.CHATBOT_DATA_ENCRYPTION !== 'false',
                enableAuditLogging: process.env.CHATBOT_AUDIT_LOGGING !== 'false',
            },

            // Database Configuration
            database: {
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
                supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
                enableConnectionPooling: process.env.CHATBOT_DB_POOLING !== 'false',
                maxConnections: parseInt(process.env.CHATBOT_DB_MAX_CONNECTIONS) || 10,
            },

            // Feature Flags
            features: {
                enableAppointmentBooking: process.env.CHATBOT_APPOINTMENT_BOOKING !== 'false',
                enableReferralManagement: process.env.CHATBOT_REFERRAL_MANAGEMENT !== 'false',
                enableWebSocketSupport: process.env.CHATBOT_WEBSOCKET_SUPPORT !== 'false',
                enableCaching: process.env.CHATBOT_ENABLE_CACHING !== 'false',
                enableAnalytics: process.env.CHATBOT_ENABLE_ANALYTICS !== 'false',
            },

            // Environment Configuration
            environment: {
                nodeEnv: process.env.NODE_ENV || 'development',
                isDevelopment: process.env.NODE_ENV === 'development',
                isProduction: process.env.NODE_ENV === 'production',
                isTest: process.env.NODE_ENV === 'test',
                logLevel: process.env.CHATBOT_LOG_LEVEL || 'info',
            }
        };
    }

    /**
     * Validate required configuration
     */
    validateConfiguration() {
        const errors = [];

        // Validate required API keys
        if (!this.config.gemini.apiKey) {
            errors.push('GOOGLE_GEMINI_API_KEY is required');
        }

        if (!this.config.database.supabaseUrl) {
            errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
        }

        if (!this.config.database.supabaseAnonKey) {
            errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
        }

        // Validate numeric configurations
        if (this.config.gemini.maxTokens <= 0) {
            errors.push('GEMINI_MAX_TOKENS must be a positive number');
        }

        if (this.config.rateLimiting.maxRequestsPerMinute <= 0) {
            errors.push('CHATBOT_RATE_LIMIT_RPM must be a positive number');
        }

        if (this.config.security.maxMessageLength <= 0) {
            errors.push('CHATBOT_MAX_MESSAGE_LENGTH must be a positive number');
        }

        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
        }
    }

    /**
     * Get configuration for a specific section
     */
    get(section) {
        return this.config[section] || {};
    }

    /**
     * Get all configuration
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Check if a feature is enabled
     */
    isFeatureEnabled(feature) {
        return this.config.features[feature] === true;
    }

    /**
     * Get sanitized configuration (without sensitive data)
     */
    getSanitizedConfig() {
        const sanitized = { ...this.config };

        // Remove sensitive information
        if (sanitized.gemini) {
            sanitized.gemini.apiKey = sanitized.gemini.apiKey ? '[CONFIGURED]' : '[NOT_CONFIGURED]';
        }

        if (sanitized.database) {
            sanitized.database.supabaseServiceKey = sanitized.database.supabaseServiceKey ? '[CONFIGURED]' : '[NOT_CONFIGURED]';
        }

        return sanitized;
    }

    /**
     * Update configuration at runtime (for testing)
     */
    updateConfig(section, updates) {
        if (this.config[section]) {
            this.config[section] = { ...this.config[section], ...updates };
        }
    }

    /**
     * Get health check information
     */
    getHealthInfo() {
        return {
            configurationValid: true,
            requiredKeysPresent: {
                geminiApiKey: !!this.config.gemini.apiKey,
                supabaseUrl: !!this.config.database.supabaseUrl,
                supabaseAnonKey: !!this.config.database.supabaseAnonKey,
            },
            environment: this.config.environment.nodeEnv,
            featuresEnabled: Object.entries(this.config.features)
                .filter(([, enabled]) => enabled)
                .map(([feature]) => feature),
            timestamp: new Date().toISOString()
        };
    }
}

// Export singleton instance
export default new ChatbotConfig();