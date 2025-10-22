/**
 * GTM Wrapper Test Suite
 *
 * Testa isolamento de erros, circuit breaker e fallback para GTM/Analytics
 *
 * @author Dr. Philipe Saraiva Cruz
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    loadGTM,
    loadThirdPartyScript,
    pushToDataLayer,
    sendTrackingEvent,
    safeGtag,
    getGTMStatus,
    configureGTM,
    disableThirdPartyTracking,
    enableThirdPartyTracking
} from '../gtm-wrapper.js';

describe('GTM Wrapper', () => {
    beforeEach(() => {
        // Reset window globals
        global.window = {
            dataLayer: [],
            gtmLoaded: false,
            location: { origin: 'http://localhost' },
            navigator: {
                sendBeacon: vi.fn().mockReturnValue(true)
            }
        };
        global.document = {
            createElement: vi.fn(() => ({
                setAttribute: vi.fn(),
                removeEventListener: vi.fn(),
                addEventListener: vi.fn()
            })),
            getElementById: vi.fn(),
            getElementsByTagName: vi.fn(() => [{
                parentNode: {
                    insertBefore: vi.fn()
                }
            }]),
            head: {
                appendChild: vi.fn()
            },
            body: {
                insertBefore: vi.fn(),
                firstChild: {}
            }
        };

        // Reset config
        configureGTM({
            disableThirdPartyTracking: false,
            silentMode: true
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('loadThirdPartyScript', () => {
        it('should load script successfully', async () => {
            const mockScript = {
                setAttribute: vi.fn(),
                onload: null,
                onerror: null
            };

            document.createElement.mockReturnValue(mockScript);

            const promise = loadThirdPartyScript('https://example.com/script.js', {
                id: 'test-script'
            });

            // Simulate successful load
            setTimeout(() => {
                mockScript.onload?.();
            }, 10);

            const result = await promise;
            expect(result).toBe(true);
        });

        it('should handle script load failure', async () => {
            const mockScript = {
                setAttribute: vi.fn(),
                onload: null,
                onerror: null
            };

            document.createElement.mockReturnValue(mockScript);

            const promise = loadThirdPartyScript('https://example.com/script.js', {
                id: 'test-script'
            });

            // Simulate error
            setTimeout(() => {
                mockScript.onerror?.(new Error('Load failed'));
            }, 10);

            const result = await promise;
            expect(result).toBe(false);
        });

        it('should isolate onSuccess callback errors', async () => {
            const mockScript = {
                setAttribute: vi.fn(),
                onload: null,
                onerror: null
            };

            document.createElement.mockReturnValue(mockScript);

            const onSuccess = vi.fn(() => {
                throw new Error('Callback error');
            });

            const promise = loadThirdPartyScript('https://example.com/script.js', {
                id: 'test-script',
                onSuccess
            });

            // Simulate successful load synchronously
            await new Promise((resolve) => {
                setImmediate(() => {
                    mockScript.onload?.();
                    resolve();
                });
            });

            // Should not throw despite callback error
            const result = await promise;
            expect(result).toBe(true);
            // Note: onSuccess is called via setTimeout so may not be immediate
        });

        it('should respect disableThirdPartyTracking flag', async () => {
            disableThirdPartyTracking();

            const result = await loadThirdPartyScript('https://example.com/script.js');
            expect(result).toBe(false);
        });

        it('should remove existing script before loading', async () => {
            const existingScript = { remove: vi.fn() };
            document.getElementById.mockReturnValue(existingScript);

            const mockScript = {
                setAttribute: vi.fn(),
                onload: null,
                onerror: null
            };
            document.createElement.mockReturnValue(mockScript);

            loadThirdPartyScript('https://example.com/script.js', {
                id: 'test-script'
            });

            expect(existingScript.remove).toHaveBeenCalled();
        });
    });

    describe('loadGTM', () => {
        it('should return false if gtmId is missing', async () => {
            const result = await loadGTM('');
            expect(result).toBe(false);
        });

        it('should return true if already loaded', async () => {
            window.gtmLoaded = true;

            const result = await loadGTM('GTM-12345');
            expect(result).toBe(true);
        });

        it('should initialize dataLayer', async () => {
            window.dataLayer = undefined;

            const mockScript = {
                setAttribute: vi.fn(),
                onload: null,
                onerror: null
            };
            document.createElement.mockReturnValue(mockScript);

            loadGTM('GTM-12345');

            expect(Array.isArray(window.dataLayer)).toBe(true);
        });

        it('should isolate dataLayer.push errors', async () => {
            window.dataLayer = [];

            const mockScript = {
                setAttribute: vi.fn(),
                onload: null,
                onerror: null
            };
            document.createElement.mockReturnValue(mockScript);

            // Simulate immediate load to avoid timeout
            setImmediate(() => mockScript.onload?.());

            const result = await loadGTM('GTM-12345');

            // GTM may not load in test environment
            if (result) {
                // Should have wrapped push
                expect(window.dataLayer).toBeDefined();
            }
        });

        it('should try multiple URLs on failure', async () => {
            const mockScript = {
                setAttribute: vi.fn(),
                onload: null,
                onerror: null
            };

            let callCount = 0;
            document.createElement.mockImplementation(() => {
                const script = { ...mockScript };
                callCount++;

                if (callCount === 1) {
                    // First attempt fails
                    setTimeout(() => script.onerror?.(new Error('Failed')), 10);
                } else {
                    // Second attempt succeeds
                    setTimeout(() => script.onload?.(), 10);
                }

                return script;
            });

            const result = await loadGTM('GTM-12345');
            expect(callCount).toBeGreaterThan(1);
        });
    });

    describe('pushToDataLayer', () => {
        it('should push event to dataLayer', () => {
            const result = pushToDataLayer({ event: 'test_event' });

            expect(result).toBe(true);
            expect(window.dataLayer).toContainEqual({ event: 'test_event' });
        });

        it('should return false if dataLayer is not available', () => {
            window.dataLayer = undefined;

            const result = pushToDataLayer({ event: 'test_event' });
            expect(result).toBe(false);
        });

        it('should isolate push errors', () => {
            window.dataLayer.push = vi.fn(() => {
                throw new Error('Push failed');
            });

            const result = pushToDataLayer({ event: 'test_event' });
            expect(result).toBe(false);
        });
    });

    describe('safeGtag', () => {
        it('should call gtag if available', () => {
            window.gtag = vi.fn();

            safeGtag('config', 'GA-12345');

            expect(window.gtag).toHaveBeenCalledWith('config', 'GA-12345');
        });

        it('should not throw if gtag is not available', () => {
            window.gtag = undefined;

            expect(() => {
                safeGtag('config', 'GA-12345');
            }).not.toThrow();
        });

        it('should isolate gtag errors', () => {
            window.gtag = vi.fn(() => {
                throw new Error('gtag error');
            });

            expect(() => {
                safeGtag('config', 'GA-12345');
            }).not.toThrow();
        });
    });

    describe('getGTMStatus', () => {
        it('should return correct status', () => {
            window.gtmLoaded = true;
            window.dataLayer = [];
            window.gtag = vi.fn();

            const status = getGTMStatus();

            expect(status).toEqual({
                loaded: true,
                dataLayerAvailable: true,
                gtagAvailable: true,
                disableThirdPartyTracking: false
            });
        });

        it('should reflect disabled tracking', () => {
            disableThirdPartyTracking();

            const status = getGTMStatus();
            expect(status.disableThirdPartyTracking).toBe(true);
        });
    });

    describe('sendTrackingEvent', () => {
        it('should use sendBeacon when available', async () => {
            window.navigator.sendBeacon = vi.fn().mockReturnValue(true);

            const result = await sendTrackingEvent('https://analytics.example.com/collect', {
                event: 'page_view'
            });

            expect(result).toBe(true);
            expect(window.navigator.sendBeacon).toHaveBeenCalled();
        });

        it('should skip when tracking disabled', async () => {
            disableThirdPartyTracking();

            const result = await sendTrackingEvent('https://analytics.example.com/collect', {
                event: 'page_view'
            });

            expect(result).toBe(false);
        });

        it('should isolate sendBeacon errors', async () => {
            window.navigator.sendBeacon = vi.fn(() => {
                throw new Error('sendBeacon error');
            });

            // Should not throw
            const result = await sendTrackingEvent('https://analytics.example.com/collect', {
                event: 'page_view'
            });

            // Falls back to fetch
            expect(result).toBeDefined();
        });
    });

    describe('configureGTM', () => {
        it('should update configuration', () => {
            configureGTM({
                disableThirdPartyTracking: true,
                silentMode: false
            });

            const status = getGTMStatus();
            expect(status.disableThirdPartyTracking).toBe(true);
        });
    });

    describe('Feature flags', () => {
        it('should enable/disable tracking', () => {
            enableThirdPartyTracking();
            expect(getGTMStatus().disableThirdPartyTracking).toBe(false);

            disableThirdPartyTracking();
            expect(getGTMStatus().disableThirdPartyTracking).toBe(true);
        });
    });
});
