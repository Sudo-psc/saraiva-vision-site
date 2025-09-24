import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GoogleBusinessConfig from '../googleBusinessConfig.js';
import CryptoJS from 'crypto-js';

// No environment mocking needed for this test

describe('GoogleBusinessConfig', () => {
    let config;

    beforeEach(() => {
        config = new GoogleBusinessConfig();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with default configuration', () => {
            expect(config.config.locationId).toBeNull();
            expect(config.config.apiCredentials).toBeNull();
            expect(config.config.displaySettings).toEqual({
                maxReviews: 5,
                minRating: 1,
                showAnonymous: true,
                enableFiltering: true
            });
            expect(config.config.syncSettings).toEqual({
                interval: 24,
                autoSync: true,
                notifyOnErrors: true
            });
            expect(config.config.isActive).toBe(false);
        });

        it('should generate encryption key when no environment key is available', () => {
            expect(config.encryptionKey).toBeDefined();
            expect(typeof config.encryptionKey).toBe('string');
            expect(config.encryptionKey.length).toBeGreaterThan(10);
        });
    });

    describe('Credential Management', () => {
        const testCredentials = {
            apiKey: 'test-api-key',
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token'
        };

        it('should set and encrypt credentials', () => {
            const result = config.setCredentials(
                testCredentials.apiKey,
                testCredentials.accessToken,
                testCredentials.refreshToken
            );

            expect(result).toBe(true);
            expect(config.config.apiCredentials).toBeDefined();
            expect(typeof config.config.apiCredentials).toBe('string');
        });

        it('should get and decrypt credentials', () => {
            config.setCredentials(
                testCredentials.apiKey,
                testCredentials.accessToken,
                testCredentials.refreshToken
            );

            const retrievedCredentials = config.getCredentials();

            expect(retrievedCredentials.apiKey).toBe(testCredentials.apiKey);
            expect(retrievedCredentials.accessToken).toBe(testCredentials.accessToken);
            expect(retrievedCredentials.refreshToken).toBe(testCredentials.refreshToken);
            expect(retrievedCredentials.createdAt).toBeDefined();
        });

        it('should throw error when setting credentials without API key', () => {
            expect(() => {
                config.setCredentials(null, testCredentials.accessToken);
            }).toThrow('API key and access token are required');
        });

        it('should throw error when setting credentials without access token', () => {
            expect(() => {
                config.setCredentials(testCredentials.apiKey, null);
            }).toThrow('API key and access token are required');
        });

        it('should return null when getting credentials that were never set', () => {
            const credentials = config.getCredentials();
            expect(credentials).toBeNull();
        });

        it('should handle decryption errors gracefully', () => {
            // Manually set invalid encrypted data
            config.config.apiCredentials = 'invalid-encrypted-data';

            const credentials = config.getCredentials();
            expect(credentials).toBeNull();
        });
    });

    describe('Location ID Management', () => {
        const validLocationId = 'accounts/123456789/locations/987654321';

        it('should set valid location ID', () => {
            const result = config.setLocationId(validLocationId);

            expect(result).toBe(true);
            expect(config.config.locationId).toBe(validLocationId);
        });

        it('should get location ID', () => {
            config.setLocationId(validLocationId);

            const locationId = config.getLocationId();
            expect(locationId).toBe(validLocationId);
        });

        it('should throw error for null location ID', () => {
            expect(() => {
                config.setLocationId(null);
            }).toThrow('Valid location ID is required');
        });

        it('should throw error for invalid location ID format', () => {
            expect(() => {
                config.setLocationId('invalid-location-id');
            }).toThrow('Invalid location ID format');
        });

        it('should throw error for non-string location ID', () => {
            expect(() => {
                config.setLocationId(123);
            }).toThrow('Valid location ID is required');
        });
    });

    describe('Display Settings Management', () => {
        it('should update valid display settings', () => {
            const newSettings = {
                maxReviews: 10,
                minRating: 3,
                showAnonymous: false,
                enableFiltering: false
            };

            const result = config.updateDisplaySettings(newSettings);

            expect(result).toBe(true);
            expect(config.config.displaySettings).toEqual(newSettings);
        });

        it('should partially update display settings', () => {
            const partialSettings = {
                maxReviews: 8,
                minRating: 4
            };

            config.updateDisplaySettings(partialSettings);

            expect(config.config.displaySettings.maxReviews).toBe(8);
            expect(config.config.displaySettings.minRating).toBe(4);
            expect(config.config.displaySettings.showAnonymous).toBe(true); // unchanged
            expect(config.config.displaySettings.enableFiltering).toBe(true); // unchanged
        });

        it('should throw error for invalid maxReviews (too low)', () => {
            expect(() => {
                config.updateDisplaySettings({ maxReviews: 0 });
            }).toThrow('maxReviews must be between 1 and 50');
        });

        it('should throw error for invalid maxReviews (too high)', () => {
            expect(() => {
                config.updateDisplaySettings({ maxReviews: 51 });
            }).toThrow('maxReviews must be between 1 and 50');
        });

        it('should throw error for invalid minRating (too low)', () => {
            expect(() => {
                config.updateDisplaySettings({ minRating: 0 });
            }).toThrow('minRating must be between 1 and 5');
        });

        it('should throw error for invalid minRating (too high)', () => {
            expect(() => {
                config.updateDisplaySettings({ minRating: 6 });
            }).toThrow('minRating must be between 1 and 5');
        });
    });

    describe('Sync Settings Management', () => {
        it('should update valid sync settings', () => {
            const newSettings = {
                interval: 12,
                autoSync: false,
                notifyOnErrors: false
            };

            const result = config.updateSyncSettings(newSettings);

            expect(result).toBe(true);
            expect(config.config.syncSettings).toEqual(newSettings);
        });

        it('should partially update sync settings', () => {
            const partialSettings = {
                interval: 6,
                autoSync: false
            };

            config.updateSyncSettings(partialSettings);

            expect(config.config.syncSettings.interval).toBe(6);
            expect(config.config.syncSettings.autoSync).toBe(false);
            expect(config.config.syncSettings.notifyOnErrors).toBe(true); // unchanged
        });

        it('should throw error for invalid interval (too low)', () => {
            expect(() => {
                config.updateSyncSettings({ interval: 0 });
            }).toThrow('interval must be between 1 and 168 hours');
        });

        it('should throw error for invalid interval (too high)', () => {
            expect(() => {
                config.updateSyncSettings({ interval: 169 });
            }).toThrow('interval must be between 1 and 168 hours');
        });
    });

    describe('Active Status Management', () => {
        it('should set active status to true', () => {
            const result = config.setActive(true);

            expect(result).toBe(true);
            expect(config.config.isActive).toBe(true);
        });

        it('should set active status to false', () => {
            config.setActive(true);
            const result = config.setActive(false);

            expect(result).toBe(true);
            expect(config.config.isActive).toBe(false);
        });

        it('should convert truthy values to boolean', () => {
            config.setActive('yes');
            expect(config.config.isActive).toBe(true);

            config.setActive(1);
            expect(config.config.isActive).toBe(true);
        });

        it('should convert falsy values to boolean', () => {
            config.setActive('');
            expect(config.config.isActive).toBe(false);

            config.setActive(0);
            expect(config.config.isActive).toBe(false);
        });
    });

    describe('Configuration Status', () => {
        it('should return false for isConfigured when not configured', () => {
            expect(config.isConfigured()).toBe(false);
        });

        it('should return true for isConfigured when properly configured', () => {
            config.setLocationId('accounts/123/locations/456');
            config.setCredentials('api-key', 'access-token');

            expect(config.isConfigured()).toBe(true);
        });

        it('should return false for isConfigured when missing location ID', () => {
            config.setCredentials('api-key', 'access-token');

            expect(config.isConfigured()).toBe(false);
        });

        it('should return false for isConfigured when missing credentials', () => {
            config.setLocationId('accounts/123/locations/456');

            expect(config.isConfigured()).toBe(false);
        });
    });

    describe('Configuration Export/Import', () => {
        beforeEach(() => {
            config.setLocationId('accounts/123/locations/456');
            config.setCredentials('api-key', 'access-token');
            config.updateDisplaySettings({ maxReviews: 10 });
            config.updateSyncSettings({ interval: 12 });
            config.setActive(true);
        });

        it('should get complete configuration', () => {
            const configData = config.getConfig();

            expect(configData).toEqual({
                locationId: 'accounts/123/locations/456',
                hasCredentials: true,
                displaySettings: {
                    maxReviews: 10,
                    minRating: 1,
                    showAnonymous: true,
                    enableFiltering: true
                },
                syncSettings: {
                    interval: 12,
                    autoSync: true,
                    notifyOnErrors: true
                },
                isActive: true,
                isConfigured: true
            });
        });

        it('should export configuration for storage', () => {
            const exportedConfig = config.exportConfig();

            expect(exportedConfig.locationId).toBe('accounts/123/locations/456');
            expect(exportedConfig.apiCredentials).toBeDefined();
            expect(exportedConfig.displaySettings.maxReviews).toBe(10);
            expect(exportedConfig.syncSettings.interval).toBe(12);
            expect(exportedConfig.isActive).toBe(true);
            expect(exportedConfig.exportedAt).toBeDefined();
        });

        it('should load configuration from storage', () => {
            const savedConfig = config.exportConfig();
            const newConfig = new GoogleBusinessConfig();

            const result = newConfig.loadConfig(savedConfig);

            expect(result).toBe(true);
            expect(newConfig.getLocationId()).toBe('accounts/123/locations/456');
            expect(newConfig.getCredentials()).toBeDefined();
            expect(newConfig.config.displaySettings.maxReviews).toBe(10);
            expect(newConfig.config.syncSettings.interval).toBe(12);
            expect(newConfig.config.isActive).toBe(true);
        });

        it('should handle invalid configuration data during load', () => {
            const result = config.loadConfig(null);
            expect(result).toBe(false);

            const result2 = config.loadConfig('invalid');
            expect(result2).toBe(false);
        });
    });

    describe('Configuration Validation', () => {
        it('should validate complete configuration', () => {
            config.setLocationId('accounts/123/locations/456');
            config.setCredentials('api-key', 'access-token');

            const validation = config.validateConfig();

            expect(validation.isValid).toBe(true);
            expect(validation.errors).toHaveLength(0);
        });

        it('should return errors for incomplete configuration', () => {
            const validation = config.validateConfig();

            expect(validation.isValid).toBe(false);
            expect(validation.errors).toContain('Location ID is required');
            expect(validation.errors).toContain('API credentials are required');
        });

        it('should validate display settings', () => {
            config.setLocationId('accounts/123/locations/456');
            config.setCredentials('api-key', 'access-token');

            expect(() => {
                config.updateDisplaySettings({ maxReviews: 100 }); // Invalid
            }).toThrow('maxReviews must be between 1 and 50');
        });

        it('should validate sync settings', () => {
            config.setLocationId('accounts/123/locations/456');
            config.setCredentials('api-key', 'access-token');

            expect(() => {
                config.updateSyncSettings({ interval: 200 }); // Invalid
            }).toThrow('interval must be between 1 and 168 hours');
        });
    });

    describe('Configuration Reset', () => {
        it('should reset configuration to defaults', () => {
            config.setLocationId('accounts/123/locations/456');
            config.setCredentials('api-key', 'access-token');
            config.setActive(true);

            const result = config.reset();

            expect(result).toBe(true);
            expect(config.config.locationId).toBeNull();
            expect(config.config.apiCredentials).toBeNull();
            expect(config.config.isActive).toBe(false);
            expect(config.config.displaySettings).toEqual({
                maxReviews: 5,
                minRating: 1,
                showAnonymous: true,
                enableFiltering: true
            });
            expect(config.config.syncSettings).toEqual({
                interval: 24,
                autoSync: true,
                notifyOnErrors: true
            });
        });
    });

    describe('Encryption/Decryption', () => {
        const testData = { test: 'data', number: 123 };

        it('should encrypt and decrypt data correctly', () => {
            const encrypted = config.encryptCredentials(testData);
            expect(typeof encrypted).toBe('string');
            expect(encrypted).not.toBe(JSON.stringify(testData));

            const decrypted = config.decryptCredentials(encrypted);
            expect(decrypted).toEqual(testData);
        });

        it('should throw error when encrypting invalid data', () => {
            const circularData = {};
            circularData.self = circularData;

            expect(() => {
                config.encryptCredentials(circularData);
            }).toThrow('Credential encryption failed');
        });

        it('should throw error when decrypting invalid data', () => {
            expect(() => {
                config.decryptCredentials('invalid-encrypted-data');
            }).toThrow('Credential decryption failed');
        });
    });
});