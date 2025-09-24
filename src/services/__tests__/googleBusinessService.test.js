import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GoogleBusinessService from '../googleBusinessService.js';
import CryptoJS from 'crypto-js';

// Mock fetch globally
global.fetch = vi.fn();

describe('GoogleBusinessService', () => {
    let service;
    const mockCredentials = {
        apiKey: 'test-api-key-12345',
        accessToken: 'test-access-token-67890'
    };
    const encryptionKey = 'test-encryption-key';

    beforeEach(() => {
        service = new GoogleBusinessService();
        vi.clearAllMocks();

        // Reset fetch mock
        fetch.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with default values', () => {
            expect(service.baseURL).toBe('https://mybusiness.googleapis.com/v4');
            expect(service.apiKey).toBeNull();
            expect(service.accessToken).toBeNull();
            expect(service.rateLimitRemaining).toBe(1000);
            expect(service.requestTimeout).toBe(10000);
            expect(service.maxRetries).toBe(3);
        });
    });

    describe('initialize', () => {
        it('should initialize with valid encrypted credentials', async () => {
            const encryptedCredentials = CryptoJS.AES.encrypt(
                JSON.stringify(mockCredentials),
                encryptionKey
            ).toString();

            // Mock successful validation
            vi.spyOn(service, 'validateCredentials').mockResolvedValue(true);

            const result = await service.initialize(encryptedCredentials, encryptionKey);

            expect(result).toBe(true);
            expect(service.apiKey).toBe(mockCredentials.apiKey);
            expect(service.accessToken).toBe(mockCredentials.accessToken);
        });

        it('should throw error with invalid encryption key', async () => {
            const encryptedCredentials = CryptoJS.AES.encrypt(
                JSON.stringify(mockCredentials),
                encryptionKey
            ).toString();

            await expect(
                service.initialize(encryptedCredentials, 'wrong-key')
            ).rejects.toThrow('Invalid credentials or encryption key');
        });

        it('should throw error with malformed encrypted data', async () => {
            await expect(
                service.initialize('invalid-encrypted-data', encryptionKey)
            ).rejects.toThrow('Invalid credentials or encryption key');
        });
    });

    describe('validateCredentials', () => {
        it('should validate correct credentials', async () => {
            service.apiKey = mockCredentials.apiKey;
            service.accessToken = mockCredentials.accessToken;

            const result = await service.validateCredentials();
            expect(result).toBe(true);
        });

        it('should throw error for missing API key', async () => {
            service.accessToken = mockCredentials.accessToken;

            await expect(service.validateCredentials()).rejects.toThrow('Missing API credentials');
        });

        it('should throw error for missing access token', async () => {
            service.apiKey = mockCredentials.apiKey;

            await expect(service.validateCredentials()).rejects.toThrow('Missing API credentials');
        });

        it('should throw error for invalid API key format', async () => {
            service.apiKey = 'short';
            service.accessToken = mockCredentials.accessToken;

            await expect(service.validateCredentials()).rejects.toThrow('Invalid API key format');
        });

        it('should throw error for invalid access token format', async () => {
            service.apiKey = mockCredentials.apiKey;
            service.accessToken = 'short';

            await expect(service.validateCredentials()).rejects.toThrow('Invalid access token format');
        });
    });

    describe('authenticateAPI', () => {
        beforeEach(() => {
            service.apiKey = mockCredentials.apiKey;
            service.accessToken = mockCredentials.accessToken;
        });

        it('should authenticate successfully', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue({ accounts: [] }),
                headers: new Map()
            };

            vi.spyOn(service, 'makeRequest').mockResolvedValue({
                ok: true,
                status: 200,
                data: { accounts: [] }
            });

            const result = await service.authenticateAPI();
            expect(result).toBe(true);
        });

        it('should throw error when API key is missing', async () => {
            service.apiKey = null;

            await expect(service.authenticateAPI()).rejects.toThrow('API key not configured');
        });

        it('should throw error on authentication failure', async () => {
            vi.spyOn(service, 'makeRequest').mockRejectedValue(new Error('Authentication failed: 401'));

            await expect(service.authenticateAPI()).rejects.toThrow('Authentication failed: 401');
        });
    });

    describe('makeRequest', () => {
        beforeEach(() => {
            service.apiKey = mockCredentials.apiKey;
            service.accessToken = mockCredentials.accessToken;
        });

        it('should make successful GET request', async () => {
            const mockResponseData = { accounts: [] };
            const mockResponse = {
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue(mockResponseData),
                headers: new Map([
                    ['X-RateLimit-Remaining', '999'],
                    ['X-RateLimit-Reset', '2024-01-01T00:00:00Z']
                ])
            };

            fetch.mockResolvedValue(mockResponse);

            const result = await service.makeRequest('/accounts', 'GET');

            expect(result.ok).toBe(true);
            expect(result.status).toBe(200);
            expect(result.data).toEqual(mockResponseData);
            expect(service.rateLimitRemaining).toBe(999);
        });

        it('should make successful POST request with data', async () => {
            const requestData = { name: 'test' };
            const mockResponseData = { id: '123' };
            const mockResponse = {
                ok: true,
                status: 201,
                json: vi.fn().mockResolvedValue(mockResponseData),
                headers: new Map()
            };

            fetch.mockResolvedValue(mockResponse);

            const result = await service.makeRequest('/accounts', 'POST', requestData);

            expect(result.ok).toBe(true);
            expect(result.status).toBe(201);
            expect(result.data).toEqual(mockResponseData);

            // Verify request was made with correct data
            expect(fetch).toHaveBeenCalledWith(
                'https://mybusiness.googleapis.com/v4/accounts',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(requestData),
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockCredentials.accessToken}`,
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': mockCredentials.apiKey
                    })
                })
            );
        });

        it('should handle 401 authentication error', async () => {
            const mockResponse = {
                ok: false,
                status: 401,
                json: vi.fn().mockResolvedValue({ error: 'Unauthorized' }),
                headers: new Map()
            };

            fetch.mockResolvedValue(mockResponse);

            await expect(
                service.makeRequest('/accounts', 'GET')
            ).rejects.toThrow('Authentication failed - invalid credentials');
        });

        it('should handle 403 forbidden error', async () => {
            const mockResponse = {
                ok: false,
                status: 403,
                json: vi.fn().mockResolvedValue({ error: 'Forbidden' }),
                headers: new Map()
            };

            fetch.mockResolvedValue(mockResponse);

            await expect(
                service.makeRequest('/accounts', 'GET')
            ).rejects.toThrow('Access forbidden - check API permissions');
        });

        it('should handle 429 rate limit error with retry', async () => {
            const mockRateLimitResponse = {
                ok: false,
                status: 429,
                headers: new Map([['Retry-After', '1']])
            };

            const mockSuccessResponse = {
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue({ success: true }),
                headers: new Map()
            };

            fetch
                .mockResolvedValueOnce(mockRateLimitResponse)
                .mockResolvedValueOnce(mockSuccessResponse);

            vi.spyOn(service, 'sleep').mockResolvedValue();

            const result = await service.makeRequest('/accounts', 'GET');

            expect(result.ok).toBe(true);
            expect(service.sleep).toHaveBeenCalledWith(1000); // 1 second
        });

        it('should handle server errors with retry', async () => {
            const mockServerErrorResponse = {
                ok: false,
                status: 500,
                headers: new Map()
            };

            const mockSuccessResponse = {
                ok: true,
                status: 200,
                json: vi.fn().mockResolvedValue({ success: true }),
                headers: new Map()
            };

            fetch
                .mockResolvedValueOnce(mockServerErrorResponse)
                .mockResolvedValueOnce(mockSuccessResponse);

            vi.spyOn(service, 'sleep').mockResolvedValue();

            const result = await service.makeRequest('/accounts', 'GET');

            expect(result.ok).toBe(true);
            expect(service.sleep).toHaveBeenCalled();
        });

        it('should handle timeout errors', async () => {
            const timeoutError = new Error('Request timeout');
            timeoutError.name = 'AbortError';

            fetch.mockRejectedValue(timeoutError);

            await expect(
                service.makeRequest('/accounts', 'GET')
            ).rejects.toThrow('Request timeout - API response took too long');
        });

        it('should retry failed requests up to maxRetries', async () => {
            const mockErrorResponse = {
                ok: false,
                status: 500,
                headers: new Map()
            };

            fetch.mockResolvedValue(mockErrorResponse);
            vi.spyOn(service, 'sleep').mockResolvedValue();

            await expect(
                service.makeRequest('/accounts', 'GET')
            ).rejects.toThrow();

            expect(fetch).toHaveBeenCalledTimes(3); // maxRetries
            expect(service.sleep).toHaveBeenCalledTimes(3); // sleep is called for each retry attempt
        });
    });

    describe('Rate Limit Handling', () => {
        beforeEach(() => {
            service.apiKey = mockCredentials.apiKey;
            service.accessToken = mockCredentials.accessToken;
        });

        it('should update rate limit info from response headers', () => {
            const mockResponse = {
                headers: new Map([
                    ['X-RateLimit-Remaining', '500'],
                    ['X-RateLimit-Reset', '2024-01-01T12:00:00Z']
                ])
            };

            service.updateRateLimitInfo(mockResponse);

            expect(service.rateLimitRemaining).toBe(500);
            expect(service.rateLimitReset).toBe('2024-01-01T12:00:00Z');
        });

        it('should return correct rate limit status', () => {
            service.rateLimitRemaining = 100;
            service.rateLimitReset = '2024-01-01T12:00:00Z';

            const status = service.getRateLimitStatus();

            expect(status).toEqual({
                remaining: 100,
                reset: '2024-01-01T12:00:00Z',
                isLimited: false
            });
        });

        it('should indicate when rate limited', () => {
            service.rateLimitRemaining = 0;

            const status = service.getRateLimitStatus();

            expect(status.isLimited).toBe(true);
        });
    });

    describe('testConnection', () => {
        beforeEach(() => {
            service.apiKey = mockCredentials.apiKey;
            service.accessToken = mockCredentials.accessToken;
        });

        it('should return success for successful connection', async () => {
            vi.spyOn(service, 'makeRequest').mockResolvedValue({
                ok: true,
                status: 200,
                data: {}
            });

            const result = await service.testConnection();

            expect(result.success).toBe(true);
            expect(result.status).toBe(200);
            expect(result.message).toBe('API connection successful');
        });

        it('should return failure for failed connection', async () => {
            vi.spyOn(service, 'makeRequest').mockRejectedValue(new Error('Connection failed'));

            const result = await service.testConnection();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Connection failed');
            expect(result.message).toBe('API connection failed');
        });
    });

    describe('getHealthStatus', () => {
        it('should return health status when initialized', () => {
            service.apiKey = mockCredentials.apiKey;
            service.accessToken = mockCredentials.accessToken;
            service.rateLimitRemaining = 500;

            const status = service.getHealthStatus();

            expect(status.initialized).toBe(true);
            expect(status.rateLimitStatus.remaining).toBe(500);
            expect(status.timestamp).toBeDefined();
        });

        it('should return health status when not initialized', () => {
            const status = service.getHealthStatus();

            expect(status.initialized).toBe(false);
            expect(status.rateLimitStatus.remaining).toBe(1000);
        });
    });

    describe('sleep', () => {
        it('should resolve after specified time', async () => {
            const start = Date.now();
            await service.sleep(100);
            const end = Date.now();

            expect(end - start).toBeGreaterThanOrEqual(90); // Allow some variance
        });
    });
});