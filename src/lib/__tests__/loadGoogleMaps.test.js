import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadGoogleMaps, resetGoogleMapsLoader } from '../loadGoogleMaps';
import { isValidGoogleMapsKey, resolveGoogleMapsApiKey } from '../googleMapsKey';

// Mock the googleMapsKey module to avoid actual API calls
vi.mock('../googleMapsKey', () => ({
  isValidGoogleMapsKey: vi.fn((key) => {
    if (!key || key.includes('invalid')) return false;
    return key.startsWith('AIza') && key.length >= 30;
  }),
  resolveGoogleMapsApiKey: vi.fn().mockResolvedValue('AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms'),
  fetchRuntimeKey: vi.fn().mockResolvedValue('AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms')
}));

describe('loadGoogleMaps', () => {
  beforeEach(() => {
    resetGoogleMapsLoader();

    // Comprehensive browser environment mocking
    global.window = {
      google: undefined,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      location: { href: 'http://localhost:3002' }
    };

    // Mock document with proper script element creation
    global.document = {
      querySelector: vi.fn(),
      createElement: vi.fn().mockImplementation((tagName) => {
        if (tagName === 'script') {
          const scriptElement = {
            src: '',
            async: false,
            defer: false,
            onload: null,
            onerror: null,
            setAttribute: vi.fn(),
            getAttribute: vi.fn(),
            appendChild: vi.fn(),
            removeChild: vi.fn(),
            parentNode: null
          };
          // Simulate script loading by calling onload asynchronously
          setTimeout(() => {
            if (scriptElement.onload) {
              scriptElement.onload();
            }
          }, 10);
          return scriptElement;
        }
        return {};
      }),
      head: {
        appendChild: vi.fn().mockImplementation((element) => {
          // Simulate successful script append
          element.parentNode = document.head;
          return element;
        }),
        removeChild: vi.fn(),
        querySelector: vi.fn(),
        querySelectorAll: vi.fn()
      },
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      }
    };

    global.navigator = {
      onLine: true,
      userAgent: 'Mozilla/5.0 (Node.js) AppleWebKit/537.36',
      sendBeacon: vi.fn()
    };

    // Mock fetch API
    global.fetch = vi.fn();
    global.Request = vi.fn();
    global.Response = vi.fn();

    // Clear all mocks
    vi.clearAllMocks();
  });

  it('rejects when offline', async () => {
    navigator.onLine = false;
    await expect(loadGoogleMaps('key')).rejects.toThrow('Sem conexão com a internet');
  });

  it('loads Google Maps successfully with valid key', async () => {
    const mockGoogleMaps = {
      maps: {
        importLibrary: vi.fn().mockResolvedValue({})
      }
    };

    // Mock the Google Maps loading process
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName) => {
      if (tagName === 'script') {
        const scriptElement = originalCreateElement(tagName);

        // Override onload to simulate Google Maps loading
        Object.defineProperty(scriptElement, 'onload', {
          set: function(callback) {
            // Simulate the Google Maps callback mechanism
            setTimeout(() => {
              // Create the global google object
              window.google = mockGoogleMaps;

              // Simulate the callback being called
              const callbackName = 'googleMapsCallback';
              if (window[callbackName]) {
                window[callbackName]();
              }

              // Call the onload handler
              if (callback) callback();
            }, 50);
          },
          get: function() { return null; }
        });

        return scriptElement;
      }
      return originalCreateElement(tagName);
    });

    const result = await loadGoogleMaps('AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms');
    expect(result).toBe(mockGoogleMaps);
    expect(window.google).toBe(mockGoogleMaps);
  });

  it('handles script loading error', async () => {
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName) => {
      if (tagName === 'script') {
        const scriptElement = originalCreateElement(tagName);

        // Override onerror to simulate loading failure
        Object.defineProperty(scriptElement, 'onerror', {
          set: function(callback) {
            setTimeout(() => {
              if (callback) callback(new Error('Script load failed'));
            }, 50);
          },
          get: function() { return null; }
        });

        return scriptElement;
      }
      return originalCreateElement(tagName);
    });

    await expect(loadGoogleMaps('invalid-key')).rejects.toThrow();
  });

  it('handles timeout when loading takes too long', async () => {
    vi.useFakeTimers();

    // Mock createElement that never calls onload
    const originalCreateElement = document.createElement;
    document.createElement = vi.fn().mockImplementation((tagName) => {
      if (tagName === 'script') {
        const scriptElement = originalCreateElement(tagName);
        // Don't trigger onload to simulate timeout
        return scriptElement;
      }
      return originalCreateElement(tagName);
    });

    const loadPromise = loadGoogleMaps('test-key');

    // Fast-forward time to trigger timeout
    vi.advanceTimersByTime(31000);

    await expect(loadPromise).rejects.toThrow('Google Maps API timeout');

    vi.useRealTimers();
  });

  it('resolves with existing google.maps if already loaded', async () => {
    const existingGoogleMaps = {
      maps: {
        importLibrary: vi.fn()
      }
    };

    window.google = existingGoogleMaps;

    const result = await loadGoogleMaps('any-key');
    expect(result).toBe(existingGoogleMaps);
  });

  it('validates API key format', async () => {
    const { isValidGoogleMapsKey: mockIsValid } = await import('../googleMapsKey');

    // Test with invalid keys
    mockIsValid.mockReturnValue(false);

    await expect(loadGoogleMaps('invalid-key')).rejects.toThrow('Invalid Google Maps API key');
  });

  it('handles alternative loading method', async () => {
    const mockGoogleMaps = {
      maps: {
        importLibrary: vi.fn().mockResolvedValue({})
      }
    };

    // Mock the alternative loading path
    vi.spyOn(document.head, 'appendChild').mockImplementation((element) => {
      setTimeout(() => {
        window.google = mockGoogleMaps;
        if (element.onload) element.onload();
      }, 50);
      return element;
    });

    const result = await loadGoogleMaps('AIzaSyDvio5w5mQVZWZGBnPrys1uTwTQBglmFms');
    expect(result).toBe(mockGoogleMaps);
  });
});
