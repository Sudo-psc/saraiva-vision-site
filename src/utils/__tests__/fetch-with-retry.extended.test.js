/**
 * Fetch with Retry Extended Test Suite
 *
 * Testa cenários avançados:
 * - Parse auto/json/text/none
 * - 204/304/empty body
 * - sendBeacon/fetch fallback
 * - Circuit breaker para terceiros
 * - Timeout e AbortController
 * - Sanitização de logs
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    fetchWithRetry,
    trackEvent,
    isTransientError,
    calculateBackoff,
    resetAllCircuitBreakers
} from '../fetch-with-retry.js';

describe('Fetch With Retry - Extended Tests', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
        global.AbortController = class {
            signal = { aborted: false };
            abort() {
                this.signal.aborted = true;
            }
        };
        global.navigator = {
            sendBeacon: vi.fn().mockReturnValue(true)
        };
        global.window = { location: { origin: 'http://localhost' } };
        resetAllCircuitBreakers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        resetAllCircuitBreakers();
    });

    describe('Parse modes', () => {
        it('should handle parse="auto" with JSON content-type', async () => {
            const mockData = { id: 1, name: 'Test' };
            global.fetch.mockResolvedValue({
                ok: true,
                status: 200,
                headers: new Map([['content-type', 'application/json']]),
                json: () => Promise.resolve(mockData),
                clone: () => ({
                    text: () => Promise.resolve(JSON.stringify(mockData))
                })
            });

            const result = await fetchWithRetry('https://api.test.com/data', {
                parse: 'auto'
            });

            expect(result.ok).toBe(true);
            expect(result.data).toEqual(mockData);
        });

        it('should handle parse="auto" with text content-type', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                status: 200,
                headers: new Map([['content-type', 'text/plain']]),
                clone: () => ({
                    text: () => Promise.resolve('Plain text response')
                }),
                text: () => Promise.resolve('Plain text response')
            });

            const result = await fetchWithRetry('https://api.test.com/data', {
                parse: 'auto'
            });

            expect(result.ok).toBe(true);
            expect(result.data).toBeNull();
            expect(result.rawText).toBe('Plain text response');
        });

        it('should handle parse="json" with fallback to text on error', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                status: 200,
                headers: new Map([['content-type', 'application/json']]),
                json: () => Promise.reject(new Error('Invalid JSON')),
                clone: () => ({
                    text: () => Promise.resolve('invalid json')
                }),
                bodyUsed: false
            });

            const result = await fetchWithRetry('https://api.test.com/data', {
                parse: 'json'
            });

            expect(result.ok).toBe(true);
            expect(result.data).toBeNull();
            expect(result.rawText).toBe('invalid json');
        });

        it('should handle parse="text" explicitly', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                status: 200,
                headers: new Map(),
                clone: () => ({
                    text: () => Promise.resolve('Text response')
                }),
                text: () => Promise.resolve('Text response')
            });

            const result = await fetchWithRetry('https://api.test.com/data', {
                parse: 'text'
            });

            expect(result.ok).toBe(true);
            expect(result.rawText).toBe('Text response');
        });

        it('should handle parse="none" by ignoring body', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                status: 200,
                headers: new Map()
            });

            const result = await fetchWithRetry('https://api.test.com/data', {
                parse: 'none'
            });

            expect(result.ok).toBe(true);
            expect(result.data).toBeNull();
            expect(result.rawText).toBe('');
        });
    });

    describe('Special HTTP statuses', () => {
        it('should handle 204 No Content', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                status: 204,
                headers: new Map()
            });

            const result = await fetchWithRetry('https://api.test.com/delete', {
                retries: 0
            });

            expect(result.ok).toBe(true);
            expect(result.status).toBe(204);
            expect(result.data).toBeNull();
            expect(result.rawText).toBe('');
        });

        it('should handle 304 Not Modified', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                status: 304,
                headers: new Map()
            });

            const result = await fetchWithRetry('https://api.test.com/cached');

            expect(result.ok).toBe(true);
            expect(result.status).toBe(304);
            expect(result.data).toBeNull();
        });

        it('should handle empty response body', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                status: 200,
                headers: new Map([['content-type', 'application/json']]),
                clone: () => ({
                    text: () => Promise.resolve('')
                }),
                text: () => Promise.resolve(''),
                bodyUsed: false
            });

            const result = await fetchWithRetry('https://api.test.com/empty');

            expect(result.ok).toBe(true);
            expect(result.data).toBeNull();
        });
    });

    describe('Retry with Retry-After header', () => {
        it('should respect Retry-After header', async () => {
            let attempt = 0;
            global.fetch.mockImplementation(() => {
                attempt++;
                if (attempt === 1) {
                    return Promise.resolve({
                        ok: false,
                        status: 429,
                        headers: new Map([['retry-after', '2']]),
                        statusText: 'Too Many Requests'
                    });
                }
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    headers: new Map([['content-type', 'application/json']]),
                    json: () => Promise.resolve({ success: true }),
                    clone: () => ({
                        text: () => Promise.resolve('{"success": true}')
                    })
                });
            });

            const result = await fetchWithRetry('https://api.test.com/rate-limited', {
                retries: 1,
                retryDelayBaseMs: 10 // Override for test speed
            });

            expect(result.ok).toBe(true);
            expect(attempt).toBe(2);
        });
    });

    describe('Circuit breaker for third-party domains', () => {
        it('should use different settings for third-party domains', async () => {
            // Fail google.com multiple times to open circuit breaker
            global.fetch.mockRejectedValue(new Error('Network error'));

            for (let i = 0; i < 3; i++) {
                await fetchWithRetry('https://www.google.com/ccm/collect', {
                    retries: 0,
                    thirdPartyMode: true
                });
            }

            // Circuit should be open
            const result = await fetchWithRetry('https://www.google.com/ccm/collect', {
                retries: 0,
                thirdPartyMode: true
            });

            expect(result.ok).toBe(false);
            expect(result.error.name).toBe('CircuitBreakerOpen');
        });

        it('should auto-detect third-party domains', async () => {
            global.fetch.mockRejectedValue(new Error('Network error'));

            const result = await fetchWithRetry('https://www.googletagmanager.com/gtm.js', {
                retries: 0
            });

            expect(result.ok).toBe(false);
        });
    });

    describe('trackEvent with sendBeacon', () => {
        it('should use sendBeacon when available', async () => {
            const result = await trackEvent('https://analytics.example.com/collect', {
                event: 'page_view',
                page: '/home'
            });

            expect(result.ok).toBe(true);
            expect(result.method).toBe('beacon');
            expect(navigator.sendBeacon).toHaveBeenCalled();
        });

        it('should fallback to fetch when sendBeacon fails', async () => {
            navigator.sendBeacon = vi.fn().mockReturnValue(false);

            global.fetch.mockResolvedValue({
                ok: true,
                status: 200,
                headers: new Map()
            });

            const result = await trackEvent('https://analytics.example.com/collect', {
                event: 'page_view'
            });

            expect(result.ok).toBe(true);
            expect(result.method).toBe('fetch');
        });

        it('should skip when circuit breaker is open', async () => {
            // Open circuit breaker by failing multiple times
            global.fetch.mockRejectedValue(new Error('Network error'));

            for (let i = 0; i < 3; i++) {
                await trackEvent('https://analytics.example.com/collect', {});
            }

            // Circuit should be open now
            navigator.sendBeacon = vi.fn();
            const result = await trackEvent('https://analytics.example.com/collect', {
                event: 'test'
            });

            expect(result.skipped).toBe(true);
            expect(result.method).toBe('circuit-breaker');
            expect(navigator.sendBeacon).not.toHaveBeenCalled();
        });

        it('should respect disableThirdPartyTracking flag', async () => {
            const result = await trackEvent('https://www.google-analytics.com/collect', {
                event: 'test'
            }, {
                disableThirdPartyTracking: true
            });

            expect(result.ok).toBe(false);
            expect(result.skipped).toBe(true);
            expect(result.method).toBe('disabled');
        });
    });

    describe('Timeout with AbortController', () => {
        it('should timeout after specified time', async () => {
            global.fetch.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve({
                    ok: true,
                    status: 200,
                    headers: new Map()
                }), 1000))
            );

            const result = await fetchWithRetry('https://api.test.com/slow', {
                timeoutMs: 50,
                retries: 0
            });

            expect(result.ok).toBe(false);
            expect(result.error.name).toBe('TimeoutError');
        });

        it('should merge external AbortSignal with timeout signal', async () => {
            const externalController = new AbortController();

            global.fetch.mockImplementation(() =>
                new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (externalController.signal.aborted) {
                            reject(new DOMException('Aborted', 'AbortError'));
                        } else {
                            resolve({
                                ok: true,
                                status: 200,
                                headers: new Map()
                            });
                        }
                    }, 100);
                })
            );

            const promise = fetchWithRetry('https://api.test.com/data', {
                signal: externalController.signal,
                timeoutMs: 500,
                retries: 0
            });

            // Abort externally
            setTimeout(() => externalController.abort(), 50);

            const result = await promise;
            expect(result.ok).toBe(false);
        });
    });

    describe('isTransientError helper', () => {
        it('should identify timeout errors as transient', () => {
            const error = new Error('timeout');
            error.name = 'TimeoutError';

            expect(isTransientError(error)).toBe(true);
        });

        it('should identify abort errors as transient', () => {
            const error = new DOMException('Aborted', 'AbortError');
            expect(isTransientError(error)).toBe(true);
        });

        it('should identify network errors as transient', () => {
            const error = new Error('Failed to fetch');
            expect(isTransientError(error)).toBe(true);
        });

        it('should identify 5xx status as transient', () => {
            expect(isTransientError(null, { status: 500 })).toBe(true);
            expect(isTransientError(null, { status: 503 })).toBe(true);
        });

        it('should identify 429 as transient', () => {
            expect(isTransientError(null, { status: 429 })).toBe(true);
        });

        it('should not identify 4xx errors as transient', () => {
            expect(isTransientError(null, { status: 400 })).toBe(false);
            expect(isTransientError(null, { status: 404 })).toBe(false);
        });
    });

    describe('calculateBackoff', () => {
        it('should calculate exponential backoff', () => {
            const delay0 = calculateBackoff(0, 100, 50);
            const delay1 = calculateBackoff(1, 100, 50);
            const delay2 = calculateBackoff(2, 100, 50);

            expect(delay0).toBeGreaterThanOrEqual(50); // 100 + jitter
            expect(delay0).toBeLessThanOrEqual(150);

            expect(delay1).toBeGreaterThanOrEqual(150); // 200 + jitter
            expect(delay1).toBeLessThanOrEqual(250);

            expect(delay2).toBeGreaterThanOrEqual(350); // 400 + jitter
            expect(delay2).toBeLessThanOrEqual(450);
        });

        it('should respect Retry-After header', () => {
            const headers = new Map([['retry-after', '5']]);
            const delay = calculateBackoff(0, 100, 50, headers);

            expect(delay).toBe(5000); // 5 seconds
        });

        it('should handle invalid Retry-After gracefully', () => {
            const headers = new Map([['retry-after', 'invalid']]);
            const delay = calculateBackoff(0, 100, 50, headers);

            // Should fallback to exponential
            expect(delay).toBeGreaterThanOrEqual(50);
            expect(delay).toBeLessThanOrEqual(150);
        });
    });

    describe('Callbacks', () => {
        it('should call onAttempt before each attempt', async () => {
            const onAttempt = vi.fn();

            global.fetch.mockRejectedValue(new Error('Network error'));

            await fetchWithRetry('https://api.test.com/data', {
                retries: 2,
                onAttempt,
                retryDelayBaseMs: 10
            });

            expect(onAttempt).toHaveBeenCalledTimes(3); // Initial + 2 retries
        });

        it('should call onSuccess on successful request', async () => {
            const onSuccess = vi.fn();

            global.fetch.mockResolvedValue({
                ok: true,
                status: 200,
                headers: new Map([['content-type', 'application/json']]),
                json: () => Promise.resolve({ data: 'test' }),
                clone: () => ({
                    text: () => Promise.resolve('{"data": "test"}')
                })
            });

            await fetchWithRetry('https://api.test.com/data', {
                onSuccess
            });

            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
                status: 200,
                duration: expect.any(Number)
            }));
        });

        it('should call onError on each failure', async () => {
            const onError = vi.fn();

            global.fetch.mockRejectedValue(new Error('Network error'));

            await fetchWithRetry('https://api.test.com/data', {
                retries: 2,
                onError,
                retryDelayBaseMs: 10
            });

            expect(onError).toHaveBeenCalledTimes(3);
        });
    });

    describe('Custom acceptableStatus', () => {
        it('should accept custom status validation', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 404,
                headers: new Map([['content-type', 'application/json']]),
                json: () => Promise.resolve({ error: 'Not found' }),
                clone: () => ({
                    text: () => Promise.resolve('{"error": "Not found"}')
                })
            });

            const result = await fetchWithRetry('https://api.test.com/data', {
                acceptableStatus: (s) => s === 404 || (s >= 200 && s < 300)
            });

            expect(result.ok).toBe(true);
            expect(result.status).toBe(404);
        });
    });

    describe('Error handling', () => {
        it('should handle bodyUsed Response gracefully', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                status: 200,
                headers: new Map([['content-type', 'application/json']]),
                bodyUsed: true,
                clone: () => ({
                    text: () => Promise.reject(new Error('Body already used')),
                    bodyUsed: true
                }),
                text: () => Promise.reject(new Error('Body already used'))
            });

            const result = await fetchWithRetry('https://api.test.com/data');

            // Should not crash, returns empty rawText
            expect(result.ok).toBe(true);
            expect(result.rawText).toBe('');
        });
    });
});
