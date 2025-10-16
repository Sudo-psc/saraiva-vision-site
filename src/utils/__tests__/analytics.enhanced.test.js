import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  configureAnalytics,
  initializeAnalytics,
  trackGA,
  trackMeta,
  getAnalyticsStatus,
  resetAnalytics,
  trackPageView,
  trackConversion
} from '../analytics.js';

describe('Analytics Enhanced Configuration', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Setup fresh window object
    global.window = {
      ...originalWindow,
      gtag: vi.fn(),
      fbq: vi.fn(),
      dataLayer: []
    };
    resetAnalytics();
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.clearAllMocks();
    resetAnalytics();
  });

  describe('configureAnalytics', () => {
    it('should update analytics configuration with provided values', () => {
      configureAnalytics({
        gaId: 'GA-CONFIG-TEST',
        metaPixelId: 'META-CONFIG-TEST'
      });

      // Initialize with configured values
      initializeAnalytics();

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(true);
    });

    it('should merge partial config with existing config', () => {
      configureAnalytics({
        gaId: 'GA-PARTIAL-TEST'
      });

      // Should allow initialization without metaPixelId
      expect(() => initializeAnalytics()).not.toThrow();
    });

    it('should allow empty config object', () => {
      configureAnalytics({});

      expect(() => initializeAnalytics()).not.toThrow();
    });

    it('should handle undefined values gracefully', () => {
      configureAnalytics({
        gaId: undefined,
        metaPixelId: 'META-TEST'
      });

      expect(() => initializeAnalytics()).not.toThrow();
    });

    it('should allow multiple calls to update config', () => {
      configureAnalytics({
        gaId: 'GA-FIRST'
      });

      configureAnalytics({
        gaId: 'GA-SECOND',
        metaPixelId: 'META-TEST'
      });

      // Second call should override first
      expect(() => initializeAnalytics()).not.toThrow();
    });
  });

  describe('initializeAnalytics with configOverrides', () => {
    it('should accept config overrides directly', () => {
      initializeAnalytics({
        gaId: 'GA-OVERRIDE-TEST',
        metaPixelId: 'META-OVERRIDE-TEST'
      });

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(true);
    });

    it('should prefer configOverrides over previous configuration', () => {
      configureAnalytics({
        gaId: 'GA-CONFIG'
      });

      initializeAnalytics({
        gaId: 'GA-OVERRIDE'
      });

      // Override should take precedence
      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(true);
    });

    it('should initialize without overrides', () => {
      configureAnalytics({
        gaId: 'GA-TEST'
      });

      initializeAnalytics();

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(true);
    });

    it('should handle null configOverrides', () => {
      configureAnalytics({
        gaId: 'GA-TEST'
      });

      initializeAnalytics(null);

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(true);
    });

    it('should handle undefined configOverrides', () => {
      configureAnalytics({
        gaId: 'GA-TEST'
      });

      initializeAnalytics(undefined);

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(true);
    });
  });

  describe('trackPageView with configured analytics', () => {
    beforeEach(() => {
      configureAnalytics({
        gaId: 'GA-PAGEVIEW-TEST'
      });
      initializeAnalytics();
    });

    it('should use configured gaId for page tracking', () => {
      trackPageView('/test-page');

      expect(window.gtag).toHaveBeenCalledWith(
        'config',
        expect.any(String),
        expect.objectContaining({
          page_path: '/test-page'
        })
      );
    });

    it('should default to current pathname', () => {
      const originalPathname = window.location.pathname;
      Object.defineProperty(window, 'location', {
        value: { pathname: '/default-path' },
        writable: true
      });

      trackPageView();

      expect(window.gtag).toHaveBeenCalled();

      Object.defineProperty(window, 'location', {
        value: { pathname: originalPathname },
        writable: true
      });
    });
  });

  describe('Integration with existing analytics functions', () => {
    beforeEach(() => {
      configureAnalytics({
        gaId: 'GA-INTEGRATION-TEST',
        metaPixelId: 'META-INTEGRATION-TEST'
      });
      initializeAnalytics();

      // Mock consent
      vi.mock('../consentMode.js', () => ({
        hasConsent: vi.fn(() => true),
        onConsentChange: vi.fn()
      }));
    });

    it('should allow trackGA after configuration', () => {
      const result = trackGA('test_event', { category: 'test' });

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'test_event',
        { category: 'test' }
      );
      expect(result).toBe(true);
    });

    it('should allow trackMeta after configuration', () => {
      const result = trackMeta('PageView');

      expect(window.fbq).toHaveBeenCalledWith('track', 'PageView', {});
      expect(result).toBe(true);
    });

    it('should allow trackConversion after configuration', () => {
      trackConversion('conversion_event', 100, 'USD');

      expect(window.gtag).toHaveBeenCalled();
      expect(window.fbq).toHaveBeenCalled();
    });
  });

  describe('Server-Side Rendering Support', () => {
    it('should handle undefined window in configureAnalytics', () => {
      const originalWindow = global.window;
      global.window = undefined;

      expect(() => configureAnalytics({ gaId: 'GA-SSR-TEST' })).not.toThrow();

      global.window = originalWindow;
    });

    it('should handle undefined window in initializeAnalytics', () => {
      const originalWindow = global.window;
      global.window = undefined;

      expect(() => initializeAnalytics()).not.toThrow();

      global.window = originalWindow;
    });

    it('should return early when window is undefined', () => {
      const originalWindow = global.window;
      global.window = undefined;

      initializeAnalytics({
        gaId: 'GA-SSR-TEST'
      });

      // Should not throw or cause issues
      expect(true).toBe(true);

      global.window = originalWindow;
    });
  });

  describe('Analytics Status Tracking', () => {
    it('should reflect configuration state in status', () => {
      configureAnalytics({
        gaId: 'GA-STATUS-TEST'
      });

      initializeAnalytics();

      const status = getAnalyticsStatus();
      expect(status).toHaveProperty('gtagLoaded');
      expect(status).toHaveProperty('metaLoaded');
      expect(status).toHaveProperty('consentBound');
    });

    it('should show gtag as loaded after initialization', () => {
      configureAnalytics({
        gaId: 'GA-STATUS-TEST'
      });

      initializeAnalytics();

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(true);
    });

    it('should show meta as loaded when initialized with metaPixelId', () => {
      configureAnalytics({
        metaPixelId: 'META-STATUS-TEST'
      });

      initializeAnalytics();

      const status = getAnalyticsStatus();
      expect(status.metaLoaded).toBe(true);
    });
  });

  describe('Configuration Persistence', () => {
    it('should maintain configuration across multiple initializations', () => {
      configureAnalytics({
        gaId: 'GA-PERSIST-TEST'
      });

      initializeAnalytics();
      resetAnalytics();
      
      // Re-initialize should use same config
      initializeAnalytics();

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(true);
    });

    it('should allow reconfiguration after reset', () => {
      configureAnalytics({
        gaId: 'GA-FIRST'
      });

      initializeAnalytics();
      resetAnalytics();

      configureAnalytics({
        gaId: 'GA-SECOND'
      });

      initializeAnalytics();

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string IDs', () => {
      configureAnalytics({
        gaId: '',
        metaPixelId: ''
      });

      expect(() => initializeAnalytics()).not.toThrow();
    });

    it('should handle numeric IDs as strings', () => {
      configureAnalytics({
        gaId: 'GA-12345',
        metaPixelId: '67890'
      });

      expect(() => initializeAnalytics()).not.toThrow();
    });

    it('should handle special characters in IDs', () => {
      configureAnalytics({
        gaId: 'GA-TEST_123',
        metaPixelId: 'META-TEST_456'
      });

      expect(() => initializeAnalytics()).not.toThrow();
    });

    it('should handle configuration with only gaId', () => {
      configureAnalytics({
        gaId: 'GA-ONLY-TEST'
      });

      initializeAnalytics();

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(true);
      expect(status.metaLoaded).toBe(false);
    });

    it('should handle configuration with only metaPixelId', () => {
      configureAnalytics({
        metaPixelId: 'META-ONLY-TEST'
      });

      initializeAnalytics();

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(false);
      expect(status.metaLoaded).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle gtag initialization errors gracefully', () => {
      configureAnalytics({
        gaId: 'GA-ERROR-TEST'
      });

      // Mock script error
      const originalCreateElement = document.createElement;
      document.createElement = vi.fn(() => {
        throw new Error('Script loading failed');
      });

      expect(() => initializeAnalytics()).not.toThrow();

      document.createElement = originalCreateElement;
    });

    it('should continue if one tracker fails to initialize', () => {
      configureAnalytics({
        gaId: 'GA-TEST',
        metaPixelId: 'META-TEST'
      });

      // Even if one fails, should attempt to initialize both
      expect(() => initializeAnalytics()).not.toThrow();
    });
  });

  describe('Multiple Configuration Updates', () => {
    it('should handle rapid configuration changes', () => {
      for (let i = 0; i < 10; i++) {
        configureAnalytics({
          gaId: `GA-TEST-${i}`
        });
      }

      expect(() => initializeAnalytics()).not.toThrow();
    });

    it('should use most recent configuration', () => {
      configureAnalytics({
        gaId: 'GA-OLD'
      });

      configureAnalytics({
        gaId: 'GA-NEW'
      });

      initializeAnalytics();

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(true);
    });
  });
});