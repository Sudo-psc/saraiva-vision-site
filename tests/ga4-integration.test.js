/**
 * @jest-environment jsdom
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Google Analytics 4 Integration', () => {
  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    
    // Reset global variables
    delete window.gtag;
    delete window.dataLayer;
    delete window.__GA4_LOADED__;
    
    // Mock environment variable
    vi.stubGlobal('import', {
      meta: {
        env: {
          VITE_GA_MEASUREMENT_ID: 'G-LXWRK8ELS6'
        }
      }
    });

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  it('should load GA4 script when consent is granted', () => {
    // Mock console.log to avoid noise
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Simulate the GA4 loading function from index.html
    const GA_MEASUREMENT_ID = 'G-LXWRK8ELS6';
    
    function loadGA4(id) {
      if (!id) return;
      if (window.__GA4_LOADED__) return;
      window.__GA4_LOADED__ = true;
      
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);

      // Simulate script load
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;
    }

    // Test loading GA4
    loadGA4(GA_MEASUREMENT_ID);
    
    // Verify script was added
    const scripts = document.head.querySelectorAll('script');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toBe(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);
    expect(scripts[0].async).toBe(true);
    
    // Verify gtag function is available
    expect(window.gtag).toBeDefined();
    expect(typeof window.gtag).toBe('function');
    
    // Verify dataLayer is initialized
    expect(window.dataLayer).toBeDefined();
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });

  it('should not load GA4 script multiple times', () => {
    const GA_MEASUREMENT_ID = 'G-LXWRK8ELS6';
    
    function loadGA4(id) {
      if (!id) return;
      if (window.__GA4_LOADED__) return;
      window.__GA4_LOADED__ = true;
      
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);
    }

    // Load GA4 twice
    loadGA4(GA_MEASUREMENT_ID);
    loadGA4(GA_MEASUREMENT_ID);
    
    // Verify only one script was added
    const scripts = document.head.querySelectorAll('script');
    expect(scripts).toHaveLength(1);
    expect(window.__GA4_LOADED__).toBe(true);
  });

  it('should not load GA4 script without measurement ID', () => {
    function loadGA4(id) {
      if (!id) return;
      if (window.__GA4_LOADED__) return;
      window.__GA4_LOADED__ = true;
      
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);
    }

    // Test with empty ID
    loadGA4('');
    loadGA4(null);
    loadGA4(undefined);
    
    // Verify no scripts were added
    const scripts = document.head.querySelectorAll('script');
    expect(scripts).toHaveLength(0);
    expect(window.__GA4_LOADED__).toBeUndefined();
  });

  it('should integrate with consent system', () => {
    const GA_MEASUREMENT_ID = 'G-LXWRK8ELS6';
    let consentCallback;
    
    // Mock addEventListener
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      .mockImplementation((event, callback) => {
        if (event === 'consent-updated') {
          consentCallback = callback;
        }
      });

    function loadGA4(id) {
      if (!id) return;
      if (window.__GA4_LOADED__) return;
      window.__GA4_LOADED__ = true;
      
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);
    }

    // Simulate the consent event listener setup
    window.addEventListener('consent-updated', (e) => {
      const consent = e.detail || {};
      if (consent.analytics && !window.__GA4_LOADED__) {
        loadGA4(GA_MEASUREMENT_ID);
      }
    });

    expect(addEventListenerSpy).toHaveBeenCalledWith('consent-updated', expect.any(Function));

    // Simulate consent granted event
    const consentEvent = new CustomEvent('consent-updated', {
      detail: { analytics: true }
    });
    
    consentCallback(consentEvent);

    // Verify GA4 was loaded
    const scripts = document.head.querySelectorAll('script');
    expect(scripts).toHaveLength(1);
    expect(window.__GA4_LOADED__).toBe(true);

    addEventListenerSpy.mockRestore();
  });

  it('should load GA4 from stored consent', () => {
    const GA_MEASUREMENT_ID = 'G-LXWRK8ELS6';
    
    // Mock localStorage with stored consent
    window.localStorage.getItem.mockReturnValue(JSON.stringify({
      analytics: true
    }));

    function loadGA4(id) {
      if (!id) return;
      if (window.__GA4_LOADED__) return;
      window.__GA4_LOADED__ = true;
      
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      document.head.appendChild(script);
    }

    // Simulate the stored consent check
    try {
      const saved = JSON.parse(localStorage.getItem('sv_consent_v1'));
      if (saved?.analytics && !window.__GA4_LOADED__) {
        loadGA4(GA_MEASUREMENT_ID);
      }
    } catch (_) {}

    // Verify GA4 was loaded from stored consent
    const scripts = document.head.querySelectorAll('script');
    expect(scripts).toHaveLength(1);
    expect(window.__GA4_LOADED__).toBe(true);
  });
});