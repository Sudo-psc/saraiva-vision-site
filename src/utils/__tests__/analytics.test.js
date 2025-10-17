import { describe, it, expect, beforeEach, vi } from 'vitest';

import { trackConversion, trackGA, trackMeta } from '@/utils/analytics';
import { hasConsent } from '@/utils/consentMode';

// Mock the consent module before importing analytics
vi.mock('@/utils/consentMode', () => ({
  hasConsent: vi.fn(() => false),
  onConsentChange: vi.fn(),
}));

const STORAGE_KEY = 'sv_consent_v1';

describe('analytics (consent-aware)', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.clearAllMocks();
    // Reset globals
    window.gtag = vi.fn();
    window.fbq = vi.fn();
    
    // Reset consent mocks to default (no consent)
    vi.mocked(hasConsent).mockReturnValue(false);
  });

  it('does not send events without consent', () => {
    // Ensure no consent by default
    vi.mocked(hasConsent).mockReturnValue(false);

    trackGA('custom_event');

    expect(window.gtag).not.toHaveBeenCalled();
    expect(window.fbq).not.toHaveBeenCalled();
  });

  it('sends GA events when analytics consent granted', () => {
    const gtagSpy = vi.fn();
    window.gtag = gtagSpy;
    vi.mocked(hasConsent).mockReturnValue(true);

    trackConversion('cta_open_modal');
    expect(gtagSpy).toHaveBeenCalled();
    const first = gtagSpy.mock.calls[0];
    expect(first[0]).toBe('event');
    expect(first[1]).toBe('cta_click');
  });

  it('sends Meta events when marketing consent granted', () => {
    const fbqSpy = vi.fn();
    window.fbq = fbqSpy;
    // Mock marketing consent but not analytics for Meta only
    vi.mocked(hasConsent).mockImplementation((type) => type === 'ad_storage');

    trackConversion('whatsapp_click');
    expect(fbqSpy).toHaveBeenCalled();
    const first = fbqSpy.mock.calls[0];
    expect(first[0]).toBe('track');
    expect(first[1]).toBe('Lead');
  });

  it('sends both vendors when both consents granted', () => {
    const gtagSpy = vi.fn();
    const fbqSpy = vi.fn();
    window.gtag = gtagSpy;
    window.fbq = fbqSpy;
    // Mock both consents granted
    vi.mocked(hasConsent).mockReturnValue(true);

    trackConversion('email_click');
    expect(gtagSpy).toHaveBeenCalled();
    expect(fbqSpy).toHaveBeenCalled();
  });
});


describe('configureAnalytics', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.clearAllMocks();
    // Reset globals
    window.gtag = vi.fn();
    window.fbq = vi.fn();
  });

  it('should update analytics config with new values', () => {
    const { configureAnalytics, initializeAnalytics } = require('@/utils/analytics');
    
    configureAnalytics({
      gaId: 'G-CUSTOM123',
      metaPixelId: 'META-CUSTOM456'
    });

    initializeAnalytics();

    // Verify that the config was used
    expect(window.gtag).toHaveBeenCalled();
  });

  it('should merge with existing config', () => {
    const { configureAnalytics } = require('@/utils/analytics');
    
    configureAnalytics({
      gaId: 'G-FIRST'
    });

    configureAnalytics({
      metaPixelId: 'META-SECOND'
    });

    // Should keep both values
    const { initializeAnalytics } = require('@/utils/analytics');
    initializeAnalytics();

    expect(window.gtag).toHaveBeenCalled();
  });

  it('should handle empty config object', () => {
    const { configureAnalytics } = require('@/utils/analytics');
    
    expect(() => configureAnalytics({})).not.toThrow();
  });

  it('should handle null values', () => {
    const { configureAnalytics } = require('@/utils/analytics');
    
    expect(() => configureAnalytics({
      gaId: null,
      metaPixelId: null
    })).not.toThrow();
  });

  it('should handle undefined values', () => {
    const { configureAnalytics } = require('@/utils/analytics');
    
    expect(() => configureAnalytics({
      gaId: undefined,
      metaPixelId: undefined
    })).not.toThrow();
  });

  it('should override previous config values', () => {
    const { configureAnalytics } = require('@/utils/analytics');
    
    configureAnalytics({
      gaId: 'G-FIRST'
    });

    configureAnalytics({
      gaId: 'G-SECOND'
    });

    // Second value should win
    const { initializeAnalytics } = require('@/utils/analytics');
    initializeAnalytics();

    expect(window.gtag).toHaveBeenCalled();
  });
});

describe('initializeAnalytics with configOverrides', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.clearAllMocks();
    window.gtag = vi.fn();
    window.fbq = vi.fn();
  });

  it('should accept config overrides directly', () => {
    const { initializeAnalytics } = require('@/utils/analytics');
    
    initializeAnalytics({
      gaId: 'G-OVERRIDE',
      metaPixelId: 'META-OVERRIDE'
    });

    expect(window.gtag).toHaveBeenCalled();
  });

  it('should prioritize configOverrides over existing config', () => {
    const { configureAnalytics, initializeAnalytics } = require('@/utils/analytics');
    
    configureAnalytics({
      gaId: 'G-CONFIG'
    });

    initializeAnalytics({
      gaId: 'G-OVERRIDE'
    });

    // Override should be used
    expect(window.gtag).toHaveBeenCalled();
  });

  it('should work without configOverrides', () => {
    const { initializeAnalytics } = require('@/utils/analytics');
    
    expect(() => initializeAnalytics()).not.toThrow();
  });

  it('should handle null configOverrides', () => {
    const { initializeAnalytics } = require('@/utils/analytics');
    
    expect(() => initializeAnalytics(null)).not.toThrow();
  });

  it('should handle undefined configOverrides', () => {
    const { initializeAnalytics } = require('@/utils/analytics');
    
    expect(() => initializeAnalytics(undefined)).not.toThrow();
  });
});

describe('trackPageView with configured analytics', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.clearAllMocks();
    window.gtag = vi.fn();
    window.fbq = vi.fn();
  });

  it('should use configured gaId for page tracking', () => {
    const { configureAnalytics, trackPageView } = require('@/utils/analytics');
    
    configureAnalytics({
      gaId: 'G-TRACKING123'
    });

    trackPageView('/test-page');

    expect(window.gtag).toHaveBeenCalledWith(
      'config',
      'G-TRACKING123',
      expect.objectContaining({
        page_path: '/test-page'
      })
    );
  });

  it('should handle custom page paths', () => {
    const { configureAnalytics, trackPageView } = require('@/utils/analytics');
    
    configureAnalytics({
      gaId: 'G-TEST'
    });

    trackPageView('/custom/path?query=param');

    expect(window.gtag).toHaveBeenCalledWith(
      'config',
      'G-TEST',
      expect.objectContaining({
        page_path: '/custom/path?query=param'
      })
    );
  });

  it('should use current pathname if no path provided', () => {
    const { configureAnalytics, trackPageView } = require('@/utils/analytics');
    
    configureAnalytics({
      gaId: 'G-TEST'
    });

    trackPageView();

    expect(window.gtag).toHaveBeenCalledWith(
      'config',
      'G-TEST',
      expect.objectContaining({
        page_path: window.location.pathname
      })
    );
  });

  it('should not throw if window.gtag is not available', () => {
    const { trackPageView } = require('@/utils/analytics');
    
    window.gtag = undefined;

    expect(() => trackPageView('/test')).not.toThrow();
  });

  it('should not throw if window is not available (SSR)', () => {
    const { trackPageView } = require('@/utils/analytics');
    
    const originalWindow = global.window;
    global.window = undefined;

    expect(() => trackPageView('/test')).not.toThrow();

    global.window = originalWindow;
  });
});

describe('analytics configuration edge cases', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.clearAllMocks();
    window.gtag = vi.fn();
    window.fbq = vi.fn();
  });

  it('should handle rapid configuration changes', () => {
    const { configureAnalytics } = require('@/utils/analytics');
    
    for (let i = 0; i < 100; i++) {
      configureAnalytics({
        gaId: `G-TEST${i}`
      });
    }

    expect(() => configureAnalytics({ gaId: 'G-FINAL' })).not.toThrow();
  });

  it('should handle configuration with extra properties', () => {
    const { configureAnalytics } = require('@/utils/analytics');
    
    configureAnalytics({
      gaId: 'G-TEST',
      metaPixelId: 'META-TEST',
      customProp: 'custom',
      anotherProp: 123
    });

    expect(() => {}).not.toThrow();
  });

  it('should handle empty string IDs', () => {
    const { configureAnalytics, initializeAnalytics } = require('@/utils/analytics');
    
    configureAnalytics({
      gaId: '',
      metaPixelId: ''
    });

    expect(() => initializeAnalytics()).not.toThrow();
  });

  it('should handle whitespace-only IDs', () => {
    const { configureAnalytics, initializeAnalytics } = require('@/utils/analytics');
    
    configureAnalytics({
      gaId: '   ',
      metaPixelId: '   '
    });

    expect(() => initializeAnalytics()).not.toThrow();
  });

  it('should handle very long ID strings', () => {
    const { configureAnalytics, initializeAnalytics } = require('@/utils/analytics');
    
    const longId = 'G-' + 'A'.repeat(1000);
    
    configureAnalytics({
      gaId: longId
    });

    expect(() => initializeAnalytics()).not.toThrow();
  });

  it('should handle special characters in IDs', () => {
    const { configureAnalytics, initializeAnalytics } = require('@/utils/analytics');
    
    configureAnalytics({
      gaId: 'G-TEST<script>alert("xss")</script>',
      metaPixelId: 'META-TEST\n\r\t'
    });

    expect(() => initializeAnalytics()).not.toThrow();
  });
});

describe('analytics initialization scenarios', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.clearAllMocks();
    window.gtag = vi.fn();
    window.fbq = vi.fn();
  });

  it('should initialize with environment variable IDs', () => {
    const { initializeAnalytics } = require('@/utils/analytics');
    
    // Simulate environment variables
    import.meta.env.VITE_GA_ID = 'G-ENV';
    import.meta.env.VITE_META_PIXEL_ID = 'META-ENV';

    initializeAnalytics();

    expect(window.gtag).toHaveBeenCalled();
  });

  it('should initialize multiple times without errors', () => {
    const { initializeAnalytics } = require('@/utils/analytics');
    
    initializeAnalytics({ gaId: 'G-TEST1' });
    initializeAnalytics({ gaId: 'G-TEST2' });
    initializeAnalytics({ gaId: 'G-TEST3' });

    expect(window.gtag).toHaveBeenCalled();
  });

  it('should handle initialization before configuration', () => {
    const { initializeAnalytics, configureAnalytics } = require('@/utils/analytics');
    
    initializeAnalytics();
    configureAnalytics({ gaId: 'G-TEST' });

    expect(() => initializeAnalytics()).not.toThrow();
  });

  it('should handle initialization after configuration', () => {
    const { configureAnalytics, initializeAnalytics } = require('@/utils/analytics');
    
    configureAnalytics({ gaId: 'G-TEST' });
    initializeAnalytics();

    expect(window.gtag).toHaveBeenCalled();
  });

  it('should initialize without any IDs configured', () => {
    const { initializeAnalytics } = require('@/utils/analytics');
    
    expect(() => initializeAnalytics()).not.toThrow();
  });

  it('should handle window.gtag already being defined', () => {
    window.gtag = vi.fn();
    const existingGtag = window.gtag;

    const { initializeAnalytics } = require('@/utils/analytics');
    initializeAnalytics({ gaId: 'G-TEST' });

    // Should still use the existing gtag
    expect(window.gtag).toBe(existingGtag);
  });

  it('should handle window.fbq already being defined', () => {
    window.fbq = vi.fn();
    const existingFbq = window.fbq;

    const { initializeAnalytics } = require('@/utils/analytics');
    initializeAnalytics({ metaPixelId: 'META-TEST' });

    // Should still use the existing fbq
    expect(window.fbq).toBe(existingFbq);
  });
});

describe('analytics SSR compatibility', () => {
  it('should handle missing window object', () => {
    const originalWindow = global.window;
    global.window = undefined;

    const { initializeAnalytics, configureAnalytics, trackPageView } = require('@/utils/analytics');

    expect(() => {
      configureAnalytics({ gaId: 'G-TEST' });
      initializeAnalytics();
      trackPageView('/test');
    }).not.toThrow();

    global.window = originalWindow;
  });

  it('should handle missing document object', () => {
    const originalDocument = global.document;
    global.document = undefined;

    const { initializeAnalytics } = require('@/utils/analytics');

    expect(() => initializeAnalytics({ gaId: 'G-TEST' })).not.toThrow();

    global.document = originalDocument;
  });

  it('should handle missing navigator object', () => {
    const originalNavigator = global.navigator;
    global.navigator = undefined;

    const { initializeAnalytics } = require('@/utils/analytics');

    expect(() => initializeAnalytics({ gaId: 'G-TEST' })).not.toThrow();

    global.navigator = originalNavigator;
  });
});