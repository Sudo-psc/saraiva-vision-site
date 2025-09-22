/**
 * Unit tests for Google Business Environment Configuration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GoogleBusinessConfig, { googleBusinessConfig } from '../googleBusinessEnv.js';

// Mock crypto module
vi.mock('crypto', () => ({
    default: {
        randomBytes: vi.fn(() => Buffer.from('1234567890123456')),
        createCipher: vi.fn(() => ({
            update: vi.fn(() => 'encrypted'),
            final: vi.fn(() => 'data'),
            getAuthTag: vi.fn(() => Buffer.from('authTag')),
        })),
        createDecipher: vi.fn(() => ({
            setAuthTag: vi.fn(),
            update: vi.fn(() => 'decrypted'),
            final: vi.fn(() => 'data'),
        })),
    },
}));

describe('GoogleBusinessConfig', () => {
    let config;
    let originalEnv;

    beforeEach(() => {
        // Save original environment
        originalEnv = { ...process.env };

        // Set up test environment
        process.env.GOOGLE_BUSINESS_ENCRYPTION_KEY = 'test-encryption-key-32-characters-long';
        process.env.GOOGLE_BUSINESS_CLIENT_ID = 'test-client-id';
        process.env.GOOGLE_BUSINESS_CLIENT_SECRET = 'test-client-secret';
        process.env.GOOGLE_BUSINESS_REFRESH_TOKEN = 'test-refresh-token';

        config = new GoogleBusinessConfig();
    });

    afterEach(() => {
        // Restore original environment
        process.env = originalEnv;
        vi.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with encryption key from environment', () => {
            expect(config.encryptionKey).toBe('test-encryption-key-32-characters-long');
            expect(config.credentials).toBeNull();
        });

        it('should throw error when encryption key is missing', () => {
            delete process.env.GOOGLE_BUSINESS_ENCRYPTION_KEY;

            expect(() => new GoogleBusinessConfig()).toThrow('GOOGLE_BUSINESS_ENCRYPTION_KEY environment variable is required');
        });
    });

    describe('getCredentials', () => {
        it('should return cached credentials if available', async () => {
            const testCredentials = {
                clientId: 'cached-client-id',
                clientSecret: 'cached-client-secret',
                refreshToken: 'cached-refresh-token',
            };

            config.credentials = testCredentials;

            const result = await config.getCredentials();

            expect(result).toEqual(testCredentials);
        });

        it('should get credentials from environment variables', async () => {
            const result = await config.getCredentials();

            expect(result).toEqual({
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                refreshToken: 'test-refresh-token',
            });
        });

        it('should throw error when no credentials are found', async () => {
            delete process.env.GOOGLE_BUSINESS_CLIENT_ID;
            delete process.env.GOOGLE_BUSINESS_CLIENT_SECRET;
            delete process.env.GOOGLE_BUSINESS_REFRESH_TOKEN;

            config = new GoogleBusinessConfig();

            await expect(config.getCredentials()).rejects.toThrow('No Google Business API credentials found');
        });

        it('should cache credentials after first retrieval', async () => {
            const result1 = await config.getCredentials();
            const result2 = await config.getCredentials();

            expect(result1).toEqual(result2);
            expect(config.credentials).toEqual(result1);
        });
    });

    describe('storeCredentials', () => {
        it('should encrypt and store credentials', async () => {
            const testCredentials = {
                clientId: 'new-client-id',
                clientSecret: 'new-client-secret',
                refreshToken: 'new-refresh-token',
            };

            const result = await config.storeCredentials(testCredentials);

            expect(result).toBe(true);
            expect(config.credentials).toEqual(testCredentials);
        });

        it('should handle encryption errors', async () => {
            const crypto = await import('crypto');
            crypto.default.createCipher.mockImplementation(() => {
                throw new Error('Encryption failed');
            });

            const testCredentials = {
                clientId: 'test-client-id',
                clientSecret: 'test-client-secret',
                refreshToken: 'test-refresh-token',
            };

            await expect(config.storeCredentials(testCredentials)).rejects.toThrow('Failed to store encrypted credentials');
        });
    });

    describe('validateEnvironment', () => {
        it('should return valid when all required variables are present', () => {
            const validation = config.validateEnvironment();

            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should return invalid when required variables are missing', () => {
            delete process.env.GOOGLE_BUSINESS_CLIENT_ID;
            delete process.env.GOOGLE_BUSINESS_CLIENT_SECRET;

            const validation = config.validateEnvironment();

            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Missing required environment variable: GOOGLE_BUSINESS_CLIENT_ID');
            expect(validation.errors).toContain('Missing required environment variable: GOOGLE_BUSINESS_CLIENT_SECRET');
        });

        it('should warn about missing optional variables', () => {
            const validation = config.validateEnvironment();

            expect(validation.warnings).toContain('Optional environment variable not set: GOOGLE_BUSINESS_LOCATION_ID');
            expect(validation.warnings).toContain('Optional environment variable not set: GOOGLE_BUSINESS_API_TIMEOUT');
            expect(validation.warnings).toContain('Optional environment variable not set: GOOGLE_BUSINESS_CACHE_TTL');
        });

        it('should validate encryption key length', () => {
            process.env.GOOGLE_BUSINESS_ENCRYPTION_KEY = 'short-key';

            const validation = config.validateEnvironment();

            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('GOOGLE_BUSINESS_ENCRYPTION_KEY must be at least 32 characters long');
        });
    });

    describe('getConfig', () => {
        it('should return configuration with default values', () => {
            const configObj = config.getConfig();

            expect(configObj).toEqual({
                locationId: undefined,
                apiTimeout: 10000,
                cacheTtl: 86400,
                maxRetries: 3,
                rateLimitBuffer: 50,
            });
        });

        it('should return configuration with custom values', () => {
            process.env.GOOGLE_BUSINESS_LOCATION_ID = 'test-location-id';
            process.env.GOOGLE_BUSINESS_API_TIMEOUT = '15000';
            process.env.GOOGLE_BUSINESS_CACHE_TTL = '43200';
            process.env.GOOGLE_BUSINESS_MAX_RETRIES = '5';
            process.env.GOOGLE_BUSINESS_RATE_LIMIT_BUFFER = '25';

            const configObj = config.getConfig();

            expect(configObj).toEqual({
                locationId: 'test-location-id',
                apiTimeout: 15000,
                cacheTtl: 43200,
                maxRetries: 5,
                rateLimitBuffer: 25,
            });
        });

        it('should handle invalid numeric values', () => {
            process.env.GOOGLE_BUSINESS_API_TIMEOUT = 'invalid';
            process.env.GOOGLE_BUSINESS_CACHE_TTL = 'not-a-number';

            const configObj = config.getConfig();

            expect(configObj.apiTimeout).toBeNaN();
            expect(configObj.cacheTtl).toBeNaN();
        });
    });

    describe('clearCredentials', () => {
        it('should clear cached credentials', async () => {
            // First get credentials to cache them
            await config.getCredentials();
            expect(config.credentials).not.toBeNull();

            // Clear credentials
            config.clearCredentials();
            expect(config.credentials).toBeNull();
        });
    });

    describe('singleton instance', () => {
        it('should export a singleton instance', () => {
            expect(googleBusinessConfig).toBeInstanceOf(GoogleBusinessConfig);
        });

        it('should maintain state across imports', async () => {
            const testCredentials = {
                clientId: 'singleton-test',
                clientSecret: 'singleton-secret',
                refreshToken: 'singleton-token',
            };

            await googleBusinessConfig.storeCredentials(testCredentials);

            // Create new instance to verify singleton behavior
            const newConfig = new GoogleBusinessConfig();
            expect(newConfig).not.toBe(googleBusinessConfig);

            // But the singleton should maintain its state
            expect(googleBusinessConfig.credentials).toEqual(testCredentials);
        });
    });

    describe('encryption/decryption', () => {
        it('should encrypt data correctly', () => {
            const testData = 'sensitive-information';
            const encrypted = config._encrypt(testData);

            expect(encrypted).toHaveProperty('encrypted');
            expect(encrypted).toHaveProperty('iv');
            expect(encrypted).toHaveProperty('authTag');
            expect(typeof encrypted.encrypted).toBe('string');
            expect(typeof encrypted.iv).toBe('string');
            expect(typeof encrypted.authTag).toBe('string');
        });

        it('should decrypt data correctly', () => {
            const encryptedData = {
                encrypted: 'encrypteddata',
                iv: '1234567890123456',
                authTag: 'authTag',
            };

            const decrypted = config._decrypt(encryptedData);

            expect(decrypted).toBe('decrypteddata');
        });
    });
});