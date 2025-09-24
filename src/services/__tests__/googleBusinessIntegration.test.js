import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GoogleBusinessService from '../googleBusinessService.js';
import GoogleBusinessConfig from '../googleBusinessConfig.js';

describe('Google Business Integration', () => {
    let service;
    let config;

    beforeEach(() => {
        service = new GoogleBusinessService();
        config = new GoogleBusinessConfig();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Service and Config Integration', () => {
        it('should initialize service with config credentials', async () => {
            // Set up configuration
            config.setCredentials('test-api-key', 'test-access-token');
            config.setLocationId('accounts/123/locations/456');

            // Get encrypted credentials
            const encryptedCredentials = config.config.apiCredentials;
            const encryptionKey = config.encryptionKey;

            // Mock validation to avoid actual API calls
            vi.spyOn(service, 'validateCredentials').mockResolvedValue(true);

            // Initialize service with config credentials
            const result = await service.initialize(encryptedCredentials, encryptionKey);

            expect(result).toBe(true);
            expect(service.apiKey).toBe('test-api-key');
            expect(service.accessToken).toBe('test-access-token');
        });

        it('should handle configuration validation errors', () => {
            // Test incomplete configuration
            const validation = config.validateConfig();

            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Location ID is required');
            expect(validation.errors).toContain('API credentials are required');
        });

        it('should handle service initialization with invalid config', async () => {
            // Set invalid credentials
            config.setCredentials('short', 'short');

            const encryptedCredentials = config.config.apiCredentials;
            const encryptionKey = config.encryptionKey;

            await expect(
                service.initialize(encryptedCredentials, encryptionKey)
            ).rejects.toThrow('Invalid credentials or encryption key');
        });
    });
});