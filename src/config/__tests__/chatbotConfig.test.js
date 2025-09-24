/**
 * Tests for Chatbot Configuration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock environment variables
const mockEnvVars = {
    GOOGLE_GEMINI_API_KEY: 'test-gemini-key',
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
    NODE_ENV: 'test',
    GEMINI_MODEL: 'gemini-2.0-flash-exp',
    GEMINI_MAX_TOKENS: '4096',
    GEMINI_TEMPERATURE: '0.8',
    CHATBOT_RATE_LIMIT_RPM: '30',
    CHATBOT_MAX_MESSAGE_LENGTH: '1000',
    CHATBOT_CFM_COMPLIANCE: 'true',
    CHATBOT_LGPD_COMPLIANCE: 'true',
    CHATBOT_APPOINTMENT_BOOKING: 'true'
};

describe('ChatbotConfig', () => {
    let chatbotConfig;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Mock environment variables
        Object.entries(mockEnvVars).forEach(([key, value]) => {
            vi.stubEnv(key, value);
        });

        // Dynamic import to ensure mocks are applied
        const { default: ChatbotConfig } = await import('../chatbotConfig.js');
        chatbotConfig = ChatbotConfig;
    });

    describe('initialization', () => {
        it('should load configuration from environment variables', () => {
            expect(chatbotConfig).toBeDefined();

            const config = chatbotConfig.getAll();
            expect(config.gemini.apiKey).toBe('test-gemini-key');
            expect(config.gemini.model).toBe('gemini-2.0-flash-exp');
            expect(config.gemini.maxTokens).toBe(4096);
            expect(config.gemini.temperature).toBe(0.8);
        });

        it('should use default values when environment variables are not set', async () => {
            // Clear specific env vars
            vi.stubEnv('GEMINI_MODEL', '');
            vi.stubEnv('GEMINI_MAX_TOKENS', '');

            // Re-import to get fresh instance
            delete require.cache[require.resolve('../chatbotConfig.js')];
            const { default: freshConfig } = await import('../chatbotConfig.js');

            const config = freshConfig.getAll();
            expect(config.gemini.model).toBe('gemini-2.0-flash-exp'); // default
            expect(config.gemini.maxTokens).toBe(8192); // default
        });
    });

    describe('configuration validation', () => {
        it('should validate required configuration successfully', () => {
            expect(() => chatbotConfig.validateConfiguration()).not.toThrow();
        });

        it('should throw error for missing required API key', async () => {
            vi.stubEnv('GOOGLE_GEMINI_API_KEY', '');

            expect(() => {
                delete require.cache[require.resolve('../chatbotConfig.js')];
                require('../chatbotConfig.js');
            }).toThrow('Configuration validation failed');
        });

        it('should throw error for missing Supabase URL', async () => {
            vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');

            expect(() => {
                delete require.cache[require.resolve('../chatbotConfig.js')];
                require('../chatbotConfig.js');
            }).toThrow('Configuration validation failed');
        });

        it('should validate numeric configurations', async () => {
            vi.stubEnv('GEMINI_MAX_TOKENS', '0');

            expect(() => {
                delete require.cache[require.resolve('../chatbotConfig.js')];
                require('../chatbotConfig.js');
            }).toThrow('GEMINI_MAX_TOKENS must be a positive number');
        });
    });

    describe('configuration access', () => {
        it('should get configuration by section', () => {
            const geminiConfig = chatbotConfig.get('gemini');
            expect(geminiConfig).toHaveProperty('apiKey');
            expect(geminiConfig).toHaveProperty('model');
            expect(geminiConfig).toHaveProperty('maxTokens');
        });

        it('should return empty object for non-existent section', () => {
            const nonExistent = chatbotConfig.get('nonexistent');
            expect(nonExistent).toEqual({});
        });

        it('should check feature flags', () => {
            expect(chatbotConfig.isFeatureEnabled('enableAppointmentBooking')).toBe(true);
            expect(chatbotConfig.isFeatureEnabled('nonExistentFeature')).toBe(false);
        });
    });

    describe('sanitized configuration', () => {
        it('should sanitize sensitive information', () => {
            const sanitized = chatbotConfig.getSanitizedConfig();

            expect(sanitized.gemini.apiKey).toBe('[CONFIGURED]');
            expect(sanitized.database.supabaseServiceKey).toBe('[CONFIGURED]');

            // Non-sensitive data should remain
            expect(sanitized.gemini.model).toBe('gemini-2.0-flash-exp');
            expect(sanitized.rateLimiting.maxRequestsPerMinute).toBe(30);
        });

        it('should show [NOT_CONFIGURED] for missing keys', async () => {
            vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

            delete require.cache[require.resolve('../chatbotConfig.js')];
            const { default: configWithMissingKey } = await import('../chatbotConfig.js');

            const sanitized = configWithMissingKey.getSanitizedConfig();
            expect(sanitized.database.supabaseServiceKey).toBe('[NOT_CONFIGURED]');
        });
    });

    describe('health information', () => {
        it('should provide health check information', () => {
            const health = chatbotConfig.getHealthInfo();

            expect(health).toHaveProperty('configurationValid', true);
            expect(health).toHaveProperty('requiredKeysPresent');
            expect(health.requiredKeysPresent.geminiApiKey).toBe(true);
            expect(health.requiredKeysPresent.supabaseUrl).toBe(true);
            expect(health).toHaveProperty('environment', 'test');
            expect(health).toHaveProperty('featuresEnabled');
            expect(health).toHaveProperty('timestamp');
        });

        it('should list enabled features', () => {
            const health = chatbotConfig.getHealthInfo();
            expect(health.featuresEnabled).toContain('enableAppointmentBooking');
        });
    });

    describe('runtime configuration updates', () => {
        it('should allow runtime configuration updates', () => {
            chatbotConfig.updateConfig('rateLimiting', { maxRequestsPerMinute: 100 });

            const rateLimitConfig = chatbotConfig.get('rateLimiting');
            expect(rateLimitConfig.maxRequestsPerMinute).toBe(100);
        });

        it('should not create new sections', () => {
            chatbotConfig.updateConfig('nonExistentSection', { test: 'value' });

            const config = chatbotConfig.get('nonExistentSection');
            expect(config).toEqual({});
        });
    });
});