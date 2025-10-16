import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  configureAnalytics,
  initGA,
  initMeta,
  trackGA,
  trackMeta,
  trackConversion,
  trackEnhancedConversion,
  initializeAnalytics,
  bindConsentUpdates,
  resetAnalytics,
  getAnalyticsStatus
} from '../analytics.js';
import * as consentMode from '../consentMode.js';

describe('analytics.js - Extended Tests', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset window state
    global.window = {
      location: { href: 'http://localhost/test', pathname: '/test' },
      gtag: undefined,
      dataLayer: undefined,
      fbq: undefined
    };
    document.head.innerHTML = '';
    resetAnalytics();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  describe('initGA', () => {
    it('loads Google Analytics script', () => {
      const appendChildSpy = vi.spyOn(document.head, 'appendChild');
      
      initGA('G-TEST123');

      expect(appendChildSpy).toHaveBeenCalled();
      const scriptCall = appendChildSpy.mock.calls.find(
        call => call[0].tagName === 'SCRIPT'
      );
      expect(scriptCall).toBeDefined();
      const script = scriptCall[0];
      expect(script.src).toContain('googletagmanager.com/gtag/js');
      expect(script.src).toContain('G-TEST123');
      expect(script.async).toBe(true);
    });

    it('does not load twice if already loaded', () => {
      window.gtag = vi.fn();
      const appendChildSpy = vi.spyOn(document.head, 'appendChild');

      initGA('G-TEST123');

      expect(appendChildSpy).not.toHaveBeenCalled();
    });

    it('does not load if gaId is not provided', () => {
      const appendChildSpy = vi.spyOn(document.head, 'appendChild');

      initGA(null);
      initGA(undefined);
      initGA('');

      expect(appendChildSpy).not.toHaveBeenCalled();
    });
  });

  describe('trackGA', () => {
    beforeEach(() => {
      vi.spyOn(consentMode, 'hasConsent').mockReturnValue(true);
    });

    it('tracks event when gtag is available and consent granted', () => {
      window.gtag = vi.fn();

      const result = trackGA('test_event', { label: 'test' });

      expect(result).toBe(true);
      expect(window.gtag).toHaveBeenCalledWith('event', 'test_event', { label: 'test' });
    });

    it('returns false when consent is not granted', () => {
      window.gtag = vi.fn();
      vi.spyOn(consentMode, 'hasConsent').mockReturnValue(false);

      const result = trackGA('test_event');

      expect(result).toBe(false);
      expect(window.gtag).not.toHaveBeenCalled();
    });

    it('handles gtag errors gracefully', () => {
      window.gtag = vi.fn(() => {
        throw new Error('GA Error');
      });

      const result = trackGA('test_event');

      expect(result).toBe(false);
    });
  });

  describe('trackConversion', () => {
    beforeEach(() => {
      vi.spyOn(consentMode, 'hasConsent').mockReturnValue(true);
      window.gtag = vi.fn();
      window.fbq = vi.fn();
    });

    it('tracks conversion in both GA and Meta', () => {
      const result = trackConversion('cta_click', 100, 'USD');

      expect(result.ga).toBe(true);
      expect(result.meta).toBe(true);
      expect(window.gtag).toHaveBeenCalledWith('event', 'cta_click', {
        event_category: 'engagement',
        value: 100,
        currency: 'USD'
      });
      expect(window.fbq).toHaveBeenCalledWith('track', 'Lead', {
        value: 100,
        currency: 'USD'
      });
    });

    it('uses default currency BRL', () => {
      trackConversion('cta_click', 100);

      expect(window.gtag).toHaveBeenCalledWith('event', 'cta_click', {
        event_category: 'engagement',
        value: 100,
        currency: 'BRL'
      });
    });
  });

  describe('getAnalyticsStatus', () => {
    it('returns correct status before initialization', () => {
      const status = getAnalyticsStatus();

      expect(status.gtagLoaded).toBe(false);
      expect(status.metaLoaded).toBe(false);
      expect(status.consentBound).toBe(false);
    });
  });

  describe('resetAnalytics', () => {
    it('resets all analytics state', () => {
      window.gtag = vi.fn();
      window.fbq = vi.fn();
      window.dataLayer = [];

      resetAnalytics();

      expect(window.gtag).toBeUndefined();
      expect(window.fbq).toBeUndefined();
      expect(window.dataLayer).toBeUndefined();

      const status = getAnalyticsStatus();
      expect(status.gtagLoaded).toBe(false);
      expect(status.metaLoaded).toBe(false);
    });
  });
});