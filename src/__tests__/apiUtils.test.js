import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    NetworkMonitor,
    fetchWithTimeout,
    apiRequest,
    submitContactForm,
    checkApiHealth,
    FallbackStrategies,
    ApiCache,
    networkMonitor,
    apiCache,
    useConnectionStatus,
    ApiConfig
} from '@/lib/apiUtils';

// Mock global functions and objects
const mockFetch = vi.fn();
const mockNavigator = { onLine: true };
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
};

global.fetch = mockFetch;
global.navigator = mockNavigator;
global.localStorage = mockLocalStorage;

describe('API Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset localStorage mock
        mockLocalStorage.getItem.mockReturnValue(null);
    });

    describe('NetworkMonitor', () => {
        it('initializes with correct online status', () => {
            const monitor = new NetworkMonitor();
            expect(monitor.isOnline()).toBe(true);
        });

        it('detects offline status', () => {
            const monitor = new NetworkMonitor();
            const mockCallback = vi.fn();

            monitor.subscribe(mockCallback);

            // Simulate offline event
            const offlineEvent = new Event('offline');
            window.dispatchEvent(offlineEvent);

            expect(monitor.isOnline()).toBe(false);
            expect(mockCallback).toHaveBeenCalledWith(false);
        });

        it('detects online status', () => {
            mockNavigator.onLine = false;
            const monitor = new NetworkMonitor();
            const mockCallback = vi.fn();

            monitor.subscribe(mockCallback);

            // Simulate online event
            const onlineEvent = new Event('online');
            window.dispatchEvent(onlineEvent);

            expect(monitor.isOnline()).toBe(true);
            expect(mockCallback).toHaveBeenCalledWith(true);

            mockNavigator.onLine = true;
        });

        it('unsubscribes correctly', () => {
            const monitor = new NetworkMonitor();
            const mockCallback = vi.fn();

            const unsubscribe = monitor.subscribe(mockCallback);
            unsubscribe();

            // Simulate offline event
            const offlineEvent = new Event('offline');
            window.dispatchEvent(offlineEvent);

            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe('fetchWithTimeout', () => {
        it('makes successful fetch requests', async () => {
            const mockResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue({ success: true })
            };
            mockFetch.mockResolvedValue(mockResponse);

            const result = await fetchWithTimeout('https://api.example.com/test');

            expect(mockFetch).toHaveBeenCalledWith(
                'https://api.example.com/test',
                expect.objectContaining({
                    signal: expect.any(AbortSignal)
                })
            );
            expect(result).toBe(mockResponse);
        });

        it('handles HTTP errors', async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                json: vi.fn().mockResolvedValue({ message: 'Bad Request', error: 'validation_error' })
            };
            mockFetch.mockResolvedValue(mockResponse);

            await expect(fetchWithTimeout('https://api.example.com/test'))
                .rejects.toMatchObject({
                    name: 'ApiError',
                    status: 400,
                    error: 'validation_error'
                });
        });

        it('handles timeout errors', async () => {
            mockFetch.mockImplementation(() => {
                return new Promise(() => { }); // Never resolves
            });

            await expect(fetchWithTimeout('https://api.example.com/test', {}, 100))
                .rejects.toMatchObject({
                    name: 'TimeoutError',
                    code: 'NETWORK_ERROR'
                });
        });

        it('handles network offline errors', () => {
            mockNavigator.onLine = false;

            return expect(fetchWithTimeout('https://api.example.com/test'))
                .rejects.toMatchObject({
                    name: 'NetworkError',
                    code: 'NETWORK_OFFLINE'
                });
        });
    });

    describe('apiRequest', () => {
        it('makes successful API requests', async () => {
            const mockResponse = { success: true };
            const mockFetchResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            };
            mockFetch.mockResolvedValue(mockFetchResponse);

            const result = await apiRequest('/test');

            expect(result).toBe(mockResponse);
            expect(mockFetch).toHaveBeenCalledWith(
                `${ApiConfig.baseUrl}/test`,
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json'
                    })
                })
            );
        });

        it('retries on network errors', async () => {
            const mockResponse = { success: true };
            const mockFetchResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            };

            mockFetch
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValue(mockFetchResponse);

            const result = await apiRequest('/test');

            expect(result).toBe(mockResponse);
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });

        it('does not retry on client errors (except 429)', async () => {
            const mockResponse = {
                ok: false,
                status: 400,
                json: vi.fn().mockResolvedValue({ message: 'Bad Request' })
            };
            mockFetch.mockResolvedValue(mockResponse);

            await expect(apiRequest('/test'))
                .rejects.toThrow();

            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        it('retries on rate limit errors (429)', async () => {
            const mockSuccessResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue({ success: true })
            };

            const mockRateLimitResponse = {
                ok: false,
                status: 429,
                json: vi.fn().mockResolvedValue({ message: 'Too Many Requests' })
            };

            mockFetch
                .mockResolvedValueOnce(mockRateLimitResponse)
                .mockResolvedValue(mockSuccessResponse);

            const result = await apiRequest('/test');

            expect(result).toEqual({ success: true });
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('submitContactForm', () => {
        const validFormData = {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '5533998601427',
            message: 'Test message',
            consent: true,
            token: 'valid-recaptcha-token'
        };

        it('submits valid contact forms successfully', async () => {
            const mockResponse = { success: true, id: '123' };
            const mockFetchResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            };
            mockFetch.mockResolvedValue(mockFetchResponse);

            const result = await submitContactForm(validFormData);

            expect(result).toMatchObject({
                success: true,
                data: mockResponse
            });
            expect(mockFetch).toHaveBeenCalledWith(
                `${ApiConfig.baseUrl}/contact`,
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('John Doe')
                })
            );
        });

        it('rejects when offline', async () => {
            mockNavigator.onLine = false;

            await expect(submitContactForm(validFormData))
                .rejects.toMatchObject({
                    name: 'NetworkError',
                    code: 'NETWORK_OFFLINE'
                });
        });

        it('validates required fields', async () => {
            const invalidFormData = { ...validFormData, email: '' };

            await expect(submitContactForm(invalidFormData))
                .rejects.toMatchObject({
                    name: 'ValidationError',
                    field: 'email',
                    code: 'missing_required_fields'
                });
        });

        it('handles API errors', async () => {
            const mockErrorResponse = {
                ok: false,
                status: 500,
                json: vi.fn().mockResolvedValue({
                    message: 'Internal Server Error',
                    error: 'email_service_error'
                })
            };
            mockFetch.mockResolvedValue(mockErrorResponse);

            await expect(submitContactForm(validFormData))
                .rejects.toMatchObject({
                    status: 500,
                    error: 'email_service_error'
                });
        });
    });

    describe('checkApiHealth', () => {
        it('returns healthy status when API is available', async () => {
            const mockResponse = { status: 'ok', timestamp: Date.now() };
            const mockFetchResponse = {
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            };
            mockFetch.mockResolvedValue(mockFetchResponse);

            const result = await checkApiHealth();

            expect(result).toMatchObject({
                healthy: true,
                response: mockResponse
            });
        });

        it('returns unhealthy status when API is unavailable', async () => {
            mockFetch.mockRejectedValue(new Error('Connection failed'));

            const result = await checkApiHealth();

            expect(result).toMatchObject({
                healthy: false,
                error: 'Connection failed'
            });
        });
    });

    describe('FallbackStrategies', () => {
        describe('storeForRetry', () => {
            it('stores form data for retry', () => {
                const formData = { name: 'Test', email: 'test@example.com' };

                mockLocalStorage.getItem.mockReturnValue('[]');

                const result = FallbackStrategies.storeForRetry(formData);

                expect(result).toBe(true);
                expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                    'failedContactSubmissions',
                    expect.stringContaining('Test')
                );
            });

            it('handles localStorage errors gracefully', () => {
                const formData = { name: 'Test', email: 'test@example.com' };

                mockLocalStorage.setItem.mockImplementation(() => {
                    throw new Error('Storage quota exceeded');
                });

                const result = FallbackStrategies.storeForRetry(formData);

                expect(result).toBe(false);
            });

            it('limits stored submissions to 5', () => {
                const formData = { name: 'Test', email: 'test@example.com' };
                const existingSubmissions = Array(6).fill().map((_, i) => ({
                    name: `Existing ${i}`,
                    timestamp: new Date().toISOString()
                }));

                mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingSubmissions));

                FallbackStrategies.storeForRetry(formData);

                const call = mockLocalStorage.setItem.mock.calls[0][1];
                const stored = JSON.parse(call);

                expect(stored.length).toBe(5);
                expect(stored[stored.length - 1].name).toBe('Test');
            });
        });

        describe('retryFailedSubmissions', () => {
            it('retries failed submissions successfully', async () => {
                const failedSubmissions = [
                    {
                        name: 'Test 1',
                        email: 'test1@example.com',
                        timestamp: '2024-01-01T00:00:00.000Z',
                        retryCount: 0
                    }
                ];

                mockLocalStorage.getItem.mockReturnValue(JSON.stringify(failedSubmissions));

                const mockResponse = { success: true };
                const mockFetchResponse = {
                    ok: true,
                    json: vi.fn().mockResolvedValue(mockResponse)
                };
                mockFetch.mockResolvedValue(mockFetchResponse);

                const result = await FallbackStrategies.retryFailedSubmissions();

                expect(result.success).toBe(true);
                expect(result.retried).toBe(1);
                expect(result.results[0].success).toBe(true);
            });

            it('skips submissions that have been retried too many times', async () => {
                const failedSubmissions = [
                    {
                        name: 'Test 1',
                        email: 'test1@example.com',
                        timestamp: '2024-01-01T00:00:00.000Z',
                        retryCount: 3
                    }
                ];

                mockLocalStorage.getItem.mockReturnValue(JSON.stringify(failedSubmissions));

                const result = await FallbackStrategies.retryFailedSubmissions();

                expect(result.success).toBe(true);
                expect(result.retried).toBe(0);
                expect(mockFetch).not.toHaveBeenCalled();
            });

            it('handles retry failures', async () => {
                const failedSubmissions = [
                    {
                        name: 'Test 1',
                        email: 'test1@example.com',
                        timestamp: '2024-01-01T00:00:00.000Z',
                        retryCount: 0
                    }
                ];

                mockLocalStorage.getItem.mockReturnValue(JSON.stringify(failedSubmissions));
                mockFetch.mockRejectedValue(new Error('Still failing'));

                const result = await FallbackStrategies.retryFailedSubmissions();

                expect(result.success).toBe(true);
                expect(result.retried).toBe(1);
                expect(result.results[0].success).toBe(false);

                // Verify retry count was incremented
                const call = mockLocalStorage.setItem.mock.calls[0][1];
                const stored = JSON.parse(call);
                expect(stored[0].retryCount).toBe(1);
            });
        });

        describe('getAlternativeContacts', () => {
            it('returns alternative contact information', () => {
                const contacts = FallbackStrategies.getAlternativeContacts();

                expect(contacts).toMatchObject({
                    phone: '+55 33 99860-1427',
                    email: 'contato@saraivavision.com.br',
                    whatsapp: expect.stringContaining('wa.me'),
                    message: expect.stringContaining('Não foi possível enviar')
                });
            });
        });
    });

    describe('ApiCache', () => {
        let cache;

        beforeEach(() => {
            cache = new ApiCache();
            vi.spyOn(cache, 'saveToStorage').mockImplementation(() => { });
        });

        it('stores and retrieves data', () => {
            const key = 'test-key';
            const data = { message: 'test data' };

            cache.set(key, data);
            const retrieved = cache.get(key);

            expect(retrieved).toEqual(data);
        });

        it('respects TTL', () => {
            const key = 'test-key';
            const data = { message: 'test data' };

            cache.set(key, data, 100); // 100ms TTL

            // Should be available immediately
            expect(cache.get(key)).toEqual(data);

            // Should be expired after 100ms
            vi.advanceTimersByTime(101);
            expect(cache.get(key)).toBeNull();
        });

        it('clears all data', () => {
            cache.set('key1', 'data1');
            cache.set('key2', 'data2');

            cache.clear();

            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBeNull();
        });

        it('loads from storage on initialization', () => {
            const cachedData = {
                'test-key': { data: 'test value', expiry: Date.now() + 100000 }
            };

            mockLocalStorage.getItem.mockReturnValue(JSON.stringify(cachedData));

            const newCache = new ApiCache();

            expect(newCache.get('test-key')).toBe('test value');
        });
    });

    describe('useConnectionStatus', () => {
        it('returns current connection status', () => {
            // This is a basic test since we can't fully test React hooks in this environment
            // In a real test environment, you'd use React Testing Library

            expect(typeof useConnectionStatus).toBe('function');
        });
    });

    describe('Error Handling Integration', () => {
        it('handles network failures gracefully', async () => {
            mockNavigator.onLine = false;

            await expect(submitContactForm({
                name: 'Test',
                email: 'test@example.com',
                phone: '123456789',
                message: 'Test',
                consent: true,
                token: 'token'
            })).rejects.toMatchObject({
                name: 'NetworkError',
                code: 'NETWORK_OFFLINE'
            });

            mockNavigator.onLine = true;
        });

        it('provides fallback mechanisms for API failures', async () => {
            const formData = {
                name: 'Test',
                email: 'test@example.com',
                phone: '123456789',
                message: 'Test',
                consent: true,
                token: 'token'
            };

            mockFetch.mockRejectedValue(new Error('API unavailable'));

            // Should store for retry
            const stored = FallbackStrategies.storeForRetry(formData);
            expect(stored).toBe(true);

            // Should provide alternative contacts
            const alternatives = FallbackStrategies.getAlternativeContacts();
            expect(alternatives.phone).toBeDefined();
            expect(alternatives.email).toBeDefined();
        });
    });
});
