/**
 * Unit tests for Google Business API Service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GoogleBusinessApiService from '../googleBusinessApiService.js';
import { googleBusinessConfig } from '../../config/googleBusinessEnv.js';

// Mock the config module
vi.mock('../../config/googleBusinessEnv.js', () => ({
    googleBusinessConfig: {
        getCredentials: vi.fn(),
    },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('GoogleBusinessApiService', () => {
    let service;
    let mockCredentials;

    beforeEach(() => {
        service = new GoogleBusinessApiService();
        mockCredentials = {
            clientId: 'test-client-id',
            clientSecret: 'test-client-secret',
            refreshToken: 'test-refresh-token',
        };

        // Reset all mocks
        vi.clearAllMocks();

        // Mock successful token response
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                access_token: 'test-access-token',
                expires_in: 3600,
            }),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('authenticateAPI', () => {
        it('should successfully authenticate with valid credentials', async () => {
            googleBusinessConfig.getCredentials.mockResolvedValue(mockCredentials);

            const result = await service.authenticateAPI();

            expect(result).toBe(true);
            expect(service.accessToken).toBe('test-access-token');
            expect(service.tokenExpiry).toBeGreaterThan(Date.now());
        });

        it('should throw error when credentials are missing', async () => {
            googleBusinessConfig.getCredentials.mockResolvedValue({
                clientId: 'test-client-id',
                // Missing clientSecret and refreshToken
            });

            await expect(service.authenticateAPI()).rejects.toThrow('Missing required Google API credentials');
        });

        it('should throw error when token refresh fails', async () => {
            googleBusinessConfig.getCredentials.mockResolvedValue(mockCredentials);
            global.fetch.mockResolvedValue({
                ok: false,
                statusText: 'Unauthorized',
                json: () => Promise.resolve({
                    error: 'invalid_grant',
                    error_description: 'Invalid refresh token',
                }),
            });

            await expect(service.authenticateAPI()).rejects.toThrow('Authentication failed: Token refresh failed: Invalid refresh token');
        });

        it('should handle network errors during authentication', async () => {
            googleBusinessConfig.getCredentials.mockResolvedValue(mockCredentials);
            global.fetch.mockRejectedValue(new Error('Network error'));

            await expect(service.authenticateAPI()).rejects.toThrow('Authentication failed: Network error');
        });
    });

    describe('makeRequest', () => {
        beforeEach(async () => {
            googleBusinessConfig.getCredentials.mockResolvedValue(mockCredentials);
            await service.authenticateAPI();
        });

        it('should make successful API request', async () => {
            const mockResponse = { data: 'test-data' };
            global.fetch.mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockResponse),
                headers: new Map([
                    ['X-RateLimit-Remaining', '999'],
                    ['X-RateLimit-Reset', new Date().toISOString()],
                ]),
            });

            const result = await service.makeRequest('/test-endpoint');

            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(
                'https://mybusiness.googleapis.com/v4/test-endpoint',
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-access-token',
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });

        it('should handle 401 unauthorized error', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 401,
                json: () => Promise.resolve({
                    error: { message: 'Invalid credentials' },
                }),
            });

            await expect(service.makeRequest('/test-endpoint')).rejects.toThrow('Authentication failed - invalid or expired token');
        });

        it('should handle 403 quota exceeded error', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 403,
                json: () => Promise.resolve({
                    error: { message: 'quota exceeded' },
                }),
            });

            await expect(service.makeRequest('/test-endpoint')).rejects.toThrow('API quota exceeded - please try again later');
        });

        it('should handle 429 rate limit error', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 429,
                headers: new Map([['Retry-After', '120']]),
                json: () => Promise.resolve({}),
            });

            await expect(service.makeRequest('/test-endpoint')).rejects.toThrow('Rate limit exceeded - retry after 120 seconds');
        });

        it('should handle server errors (5xx)', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({}),
            });

            await expect(service.makeRequest('/test-endpoint')).rejects.toThrow('Google API server error - please try again later');
        });

        it('should handle request timeout', async () => {
            global.fetch.mockImplementation(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        const error = new Error('Request timeout');
                        error.name = 'AbortError';
                        reject(error);
                    }, 100);
                });
            });

            await expect(service.makeRequest('/test-endpoint')).rejects.toThrow('Request timeout: API took too long to respond');
        });

        it('should refresh token when expired', async () => {
            // Set token to expired
            service.tokenExpiry = Date.now() - 1000;

            const mockResponse = { data: 'test-data' };
            global.fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        access_token: 'new-access-token',
                        expires_in: 3600,
                    }),
                })
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockResponse),
                    headers: new Map(),
                });

            const result = await service.makeRequest('/test-endpoint');

            expect(result).toEqual(mockResponse);
            expect(service.accessToken).toBe('new-access-token');
            expect(global.fetch).toHaveBeenCalledTimes(2); // Token refresh + API call
        });
    });

    describe('handleRateLimit', () => {
        it('should not delay when rate limit is sufficient', async () => {
            service.rateLimitRemaining = 100;
            const startTime = Date.now();

            await service.handleRateLimit();

            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(100); // Should be immediate
        });

        it('should delay when rate limit is low', async () => {
            service.rateLimitRemaining = 5;
            const startTime = Date.now();

            await service.handleRateLimit(1);

            const endTime = Date.now();
            expect(endTime - startTime).toBeGreaterThan(1000); // Should delay at least 1 second
        });

        it('should use exponential backoff for multiple attempts', async () => {
            service.rateLimitRemaining = 5;
            const startTime = Date.now();

            await service.handleRateLimit(3);

            const endTime = Date.now();
            expect(endTime - startTime).toBeGreaterThan(4000); // Should delay at least 4 seconds (2^3 * 1000)
        });

        it('should cap delay at maximum value', async () => {
            service.rateLimitRemaining = 5;
            const startTime = Date.now();

            await service.handleRateLimit(10); // Very high attempt number

            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(35000); // Should not exceed 30 seconds + buffer
        });
    });

    describe('getRateLimitStatus', () => {
        it('should return current rate limit information', () => {
            service.rateLimitRemaining = 100;
            service.rateLimitReset = new Date('2024-01-01T12:00:00Z');

            const status = service.getRateLimitStatus();

            expect(status).toEqual({
                remaining: 100,
                resetTime: new Date('2024-01-01T12:00:00Z'),
                isNearLimit: false,
            });
        });

        it('should indicate when near rate limit', () => {
            service.rateLimitRemaining = 25;

            const status = service.getRateLimitStatus();

            expect(status.isNearLimit).toBe(true);
        });
    });

    describe('isAuthenticated', () => {
        it('should return true when properly authenticated', () => {
            service.accessToken = 'test-token';
            service.tokenExpiry = Date.now() + 3600000; // 1 hour from now

            expect(service.isAuthenticated()).toBe(true);
        });

        it('should return false when token is missing', () => {
            service.accessToken = null;
            service.tokenExpiry = Date.now() + 3600000;

            expect(service.isAuthenticated()).toBe(false);
        });

        it('should return false when token is expired', () => {
            service.accessToken = 'test-token';
            service.tokenExpiry = Date.now() - 1000; // Expired

            expect(service.isAuthenticated()).toBe(false);
        });

        it('should return false when token expires soon', () => {
            service.accessToken = 'test-token';
            service.tokenExpiry = Date.now() + 30000; // Expires in 30 seconds

            expect(service.isAuthenticated()).toBe(false);
        });
    });

    describe('_updateRateLimitInfo', () => {
        it('should update rate limit info from response headers', () => {
            const mockResponse = {
                headers: new Map([
                    ['X-RateLimit-Remaining', '500'],
                    ['X-RateLimit-Reset', '2024-01-01T12:00:00Z'],
                ]),
            };

            service._updateRateLimitInfo(mockResponse);

            expect(service.rateLimitRemaining).toBe(500);
            expect(service.rateLimitReset).toEqual(new Date('2024-01-01T12:00:00Z'));
        });

        it('should handle missing rate limit headers', () => {
            const mockResponse = {
                headers: new Map(),
            };

            const originalRemaining = service.rateLimitRemaining;
            const originalReset = service.rateLimitReset;

            service._updateRateLimitInfo(mockResponse);

            expect(service.rateLimitRemaining).toBe(originalRemaining);
            expect(service.rateLimitReset).toBe(originalReset);
        });
    });
});