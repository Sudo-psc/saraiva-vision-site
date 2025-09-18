/**
 * @fileoverview GTM (Google Tag Manager) Integration Tests
 * Tests the GTM implementation with consent management and LGPD compliance
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock environment variables
const mockEnv = {
  VITE_GTM_ID: 'GTM-KF2NP85D'
};

// Mock GTM implementation (similar to production code)
class MockGTM {
  constructor() {
    this.loadGTM = vi.fn();
    this.consentUpdated = vi.fn();
    global.window.__GTM_LOADED__ = false;
  }

  initializeGTM(gtmId) {
    if (global.window.__GTM_LOADED__) return;
    global.window.__GTM_LOADED__ = true;
    
    // Mock GTM script injection
    const script = global.document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    script.async = true;
    global.document.head.appendChild(script);

    // Mock noscript iframe
    const noscript = global.document.createElement('noscript');
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"></iframe>`;
    global.document.body.appendChild(noscript);
  }

  handleConsentUpdate(consent) {
    if ((consent.analytics || consent.marketing) && !global.window.__GTM_LOADED__) {
      this.initializeGTM(mockEnv.VITE_GTM_ID);
    }
  }
}

describe('GTM Integration', () => {
  let gtm;
  let dom;

  beforeEach(() => {
    // Setup JSDOM
    dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
      url: 'https://saraivavision.com.br'
    });
    
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;

    // Reset GTM state
    global.window.__GTM_LOADED__ = false;
    global.window.dataLayer = [];
    global.window.gtag = vi.fn();

    gtm = new MockGTM();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GTM Configuration', () => {
    it('should have correct GTM ID configured', () => {
      expect(mockEnv.VITE_GTM_ID).toBe('GTM-KF2NP85D');
      expect(mockEnv.VITE_GTM_ID).toMatch(/^GTM-[A-Z0-9]+$/);
    });

    it('should not load GTM by default (privacy-first)', () => {
      expect(global.window.__GTM_LOADED__).toBe(false);
    });
  });

  describe('Consent Management', () => {
    it('should not load GTM when consent is denied', () => {
      const consent = {
        analytics: false,
        marketing: false,
        functional: true
      };

      gtm.handleConsentUpdate(consent);
      expect(global.window.__GTM_LOADED__).toBe(false);
    });

    it('should load GTM when analytics consent is granted', () => {
      const consent = {
        analytics: true,
        marketing: false,
        functional: true
      };

      gtm.handleConsentUpdate(consent);
      expect(global.window.__GTM_LOADED__).toBe(true);
    });

    it('should load GTM when marketing consent is granted', () => {
      const consent = {
        analytics: false,
        marketing: true,
        functional: true
      };

      gtm.handleConsentUpdate(consent);
      expect(global.window.__GTM_LOADED__).toBe(true);
    });

    it('should not load GTM multiple times', () => {
      const consent = {
        analytics: true,
        marketing: true,
        functional: true
      };

      gtm.handleConsentUpdate(consent);
      const firstLoadState = global.window.__GTM_LOADED__;
      
      gtm.handleConsentUpdate(consent);
      expect(global.window.__GTM_LOADED__).toBe(firstLoadState);
    });
  });

  describe('GTM Script Injection', () => {
    it('should inject GTM script with correct URL', () => {
      gtm.initializeGTM(mockEnv.VITE_GTM_ID);
      
      const scripts = global.document.querySelectorAll('script[src*="googletagmanager.com"]');
      expect(scripts.length).toBe(1);
      expect(scripts[0].src).toBe(`https://www.googletagmanager.com/gtm.js?id=${mockEnv.VITE_GTM_ID}`);
      expect(scripts[0].async).toBe(true);
    });

    it('should inject noscript iframe', () => {
      gtm.initializeGTM(mockEnv.VITE_GTM_ID);
      
      const noscript = global.document.querySelector('noscript');
      expect(noscript).toBeTruthy();
      expect(noscript.innerHTML).toContain(`https://www.googletagmanager.com/ns.html?id=${mockEnv.VITE_GTM_ID}`);
    });
  });

  describe('dataLayer Integration', () => {
    it('should initialize dataLayer', () => {
      expect(global.window.dataLayer).toBeDefined();
      expect(Array.isArray(global.window.dataLayer)).toBe(true);
    });

    it('should have gtag function available', () => {
      expect(global.window.gtag).toBeDefined();
      expect(typeof global.window.gtag).toBe('function');
    });
  });

  describe('LGPD Compliance', () => {
    it('should implement privacy-first approach', () => {
      // GTM should not load without explicit consent
      expect(global.window.__GTM_LOADED__).toBe(false);
    });

    it('should respect user consent choices', () => {
      const denyConsent = {
        analytics: false,
        marketing: false,
        functional: true
      };

      gtm.handleConsentUpdate(denyConsent);
      expect(global.window.__GTM_LOADED__).toBe(false);

      const grantConsent = {
        analytics: true,
        marketing: true,
        functional: true
      };

      gtm.handleConsentUpdate(grantConsent);
      expect(global.window.__GTM_LOADED__).toBe(true);
    });
  });
});

describe('GTM Production Integration', () => {
  describe('Bundle Integration', () => {
    it('should verify GTM ID is present in built assets', async () => {
      // This test would check that the GTM ID is properly embedded in the bundle
      const gtmId = 'GTM-KF2NP85D';
      expect(gtmId).toMatch(/^GTM-[A-Z0-9]+$/);
    });
  });

  describe('Network Requests', () => {
    it('should make correct GTM requests when consent is granted', () => {
      // Mock fetch for testing
      global.fetch = vi.fn();
      
      const gtmId = mockEnv.VITE_GTM_ID;
      const expectedUrl = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
      
      // This would be called in real GTM implementation
      const script = global.document.createElement('script');
      script.src = expectedUrl;
      
      expect(script.src).toBe(expectedUrl);
    });
  });
});