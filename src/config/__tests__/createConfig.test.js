import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createConfig } from '../createConfig.js';

describe('createConfig', () => {
  let originalEnv;
  let originalWindow;

  beforeEach(() => {
    // Save original values
    originalEnv = { ...import.meta.env };
    originalWindow = global.window;
    
    // Setup fresh window object
    global.window = {
      __APP_CONFIG__: undefined
    };
    
    // Reset import.meta.env to test defaults
    vi.stubGlobal('import', {
      meta: {
        env: {
          MODE: 'test',
          PROD: false,
          VITE_APP_VERSION: '2.0.1',
          VITE_GA_ID: undefined,
          VITE_GTM_ID: undefined,
          VITE_META_PIXEL_ID: undefined
        }
      }
    });
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.unstubAllGlobals();
  });

  describe('default configuration', () => {
    it('should create config with default values', () => {
      const config = createConfig();

      expect(config.app).toEqual({
        environment: 'test',
        version: '2.0.1'
      });
      expect(config.analytics.enabled).toBe(false);
      expect(config.features.lazyWidgets).toBe(true);
    });

    it('should enable all widgets by default', () => {
      const config = createConfig();

      expect(config.widgets).toEqual({
        accessibility: { enabled: true },
        stickyCta: { enabled: true },
        ctaModal: { enabled: true },
        toaster: { enabled: true },
        cookieManager: { enabled: true },
        serviceWorkerNotification: { enabled: true }
      });
    });

    it('should use fallback analytics IDs', () => {
      const config = createConfig();

      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
      expect(config.analytics.gtmId).toBe('GTM-KF2NP85D');
      expect(config.analytics.metaPixelId).toBeUndefined();
    });

    it('should handle production mode correctly', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            MODE: 'production',
            PROD: true,
            VITE_APP_VERSION: '2.0.1'
          }
        }
      });

      const config = createConfig();

      expect(config.app.environment).toBe('production');
      expect(config.analytics.enabled).toBe(true);
    });
  });

  describe('environment variable merging', () => {
    it('should use env vars when provided', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            MODE: 'production',
            PROD: true,
            VITE_APP_VERSION: '3.0.0',
            VITE_GA_ID: 'G-CUSTOM123',
            VITE_GTM_ID: 'GTM-CUSTOM456',
            VITE_META_PIXEL_ID: '123456789'
          }
        }
      });

      const config = createConfig();

      expect(config.app.version).toBe('3.0.0');
      expect(config.analytics.gaId).toBe('G-CUSTOM123');
      expect(config.analytics.gtmId).toBe('GTM-CUSTOM456');
      expect(config.analytics.metaPixelId).toBe('123456789');
    });

    it('should fall back to default analytics IDs when env vars are empty', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            MODE: 'production',
            PROD: true,
            VITE_GA_ID: '',
            VITE_GTM_ID: '',
            VITE_META_PIXEL_ID: ''
          }
        }
      });

      const config = createConfig();

      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
      expect(config.analytics.gtmId).toBe('GTM-KF2NP85D');
    });

    it('should not override with undefined env vars', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            MODE: 'production',
            PROD: true,
            VITE_GA_ID: undefined,
            VITE_GTM_ID: undefined,
            VITE_META_PIXEL_ID: undefined
          }
        }
      });

      const config = createConfig();

      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
      expect(config.analytics.gtmId).toBe('GTM-KF2NP85D');
    });
  });

  describe('global config merging', () => {
    it('should merge window.__APP_CONFIG__ when available', () => {
      global.window.__APP_CONFIG__ = {
        analytics: {
          gaId: 'G-GLOBAL123',
          metaPixelId: 'GLOBAL456'
        },
        features: {
          lazyWidgets: false
        }
      };

      const config = createConfig();

      expect(config.analytics.gaId).toBe('G-GLOBAL123');
      expect(config.analytics.metaPixelId).toBe('GLOBAL456');
      expect(config.analytics.gtmId).toBe('GTM-KF2NP85D'); // fallback still applied
      expect(config.features.lazyWidgets).toBe(false);
    });

    it('should deeply merge nested config objects', () => {
      global.window.__APP_CONFIG__ = {
        widgets: {
          toaster: { enabled: false },
          accessibility: { enabled: false }
        }
      };

      const config = createConfig();

      expect(config.widgets.toaster.enabled).toBe(false);
      expect(config.widgets.accessibility.enabled).toBe(false);
      expect(config.widgets.stickyCta.enabled).toBe(true); // unchanged
      expect(config.widgets.ctaModal.enabled).toBe(true); // unchanged
    });

    it('should handle SSR environment (no window)', () => {
      const originalWindow = global.window;
      global.window = undefined;

      const config = createConfig();

      expect(config).toBeDefined();
      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');

      global.window = originalWindow;
    });
  });

  describe('runtime overrides', () => {
    it('should accept runtime overrides', () => {
      const config = createConfig({
        analytics: {
          gaId: 'G-RUNTIME123',
          enabled: false
        },
        features: {
          lazyWidgets: false
        }
      });

      expect(config.analytics.gaId).toBe('G-RUNTIME123');
      expect(config.analytics.enabled).toBe(false);
      expect(config.features.lazyWidgets).toBe(false);
    });

    it('should prioritize runtime overrides over all other sources', () => {
      global.window.__APP_CONFIG__ = {
        analytics: {
          gaId: 'G-GLOBAL123'
        }
      };

      vi.stubGlobal('import', {
        meta: {
          env: {
            MODE: 'production',
            PROD: true,
            VITE_GA_ID: 'G-ENV123'
          }
        }
      });

      const config = createConfig({
        analytics: {
          gaId: 'G-RUNTIME123'
        }
      });

      // Runtime should win
      expect(config.analytics.gaId).toBe('G-RUNTIME123');
    });

    it('should deeply merge runtime overrides', () => {
      const config = createConfig({
        widgets: {
          toaster: { enabled: false },
          customWidget: { enabled: true, option: 'test' }
        }
      });

      expect(config.widgets.toaster.enabled).toBe(false);
      expect(config.widgets.stickyCta.enabled).toBe(true); // unchanged
      expect(config.widgets.customWidget).toEqual({
        enabled: true,
        option: 'test'
      });
    });

    it('should handle empty runtime overrides', () => {
      const config = createConfig({});

      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
      expect(config.features.lazyWidgets).toBe(true);
    });
  });

  describe('fallback analytics IDs', () => {
    it('should always set gaId even if all sources are empty', () => {
      const config = createConfig({
        analytics: {
          gaId: undefined
        }
      });

      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
    });

    it('should always set gtmId even if all sources are empty', () => {
      const config = createConfig({
        analytics: {
          gtmId: undefined
        }
      });

      expect(config.analytics.gtmId).toBe('GTM-KF2NP85D');
    });

    it('should not set fallback for metaPixelId', () => {
      const config = createConfig();

      expect(config.analytics.metaPixelId).toBeUndefined();
    });

    it('should preserve provided analytics IDs over fallback', () => {
      const config = createConfig({
        analytics: {
          gaId: 'G-CUSTOM',
          gtmId: 'GTM-CUSTOM'
        }
      });

      expect(config.analytics.gaId).toBe('G-CUSTOM');
      expect(config.analytics.gtmId).toBe('GTM-CUSTOM');
    });
  });

  describe('deep merge behavior', () => {
    it('should not merge arrays', () => {
      const config = createConfig({
        customArray: [1, 2, 3]
      });

      expect(config.customArray).toEqual([1, 2, 3]);
    });

    it('should skip undefined values during merge', () => {
      const config = createConfig({
        analytics: {
          gaId: undefined,
          metaPixelId: 'META123'
        }
      });

      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6'); // fallback applied
      expect(config.analytics.metaPixelId).toBe('META123');
    });

    it('should handle null values', () => {
      const config = createConfig({
        analytics: {
          metaPixelId: null
        }
      });

      expect(config.analytics.metaPixelId).toBeNull();
    });

    it('should preserve false boolean values', () => {
      const config = createConfig({
        analytics: {
          enabled: false
        },
        features: {
          lazyWidgets: false
        }
      });

      expect(config.analytics.enabled).toBe(false);
      expect(config.features.lazyWidgets).toBe(false);
    });

    it('should preserve zero numeric values', () => {
      const config = createConfig({
        customTimeout: 0
      });

      expect(config.customTimeout).toBe(0);
    });

    it('should handle deeply nested objects', () => {
      const config = createConfig({
        level1: {
          level2: {
            level3: {
              value: 'deep'
            }
          }
        }
      });

      expect(config.level1.level2.level3.value).toBe('deep');
    });
  });

  describe('edge cases', () => {
    it('should handle missing import.meta.env gracefully', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {}
        }
      });

      const config = createConfig();

      expect(config.app.environment).toBe('production');
      expect(config.app.version).toBe('2.0.1');
    });

    it('should create valid config with all nulls', () => {
      const config = createConfig({
        analytics: {
          gaId: null,
          gtmId: null,
          metaPixelId: null
        }
      });

      // Fallbacks should still apply for gaId and gtmId
      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
      expect(config.analytics.gtmId).toBe('GTM-KF2NP85D');
      expect(config.analytics.metaPixelId).toBeNull();
    });

    it('should handle circular references in window.__APP_CONFIG__', () => {
      const circular = { self: null };
      circular.self = circular;
      global.window.__APP_CONFIG__ = circular;

      // Should not throw
      expect(() => createConfig()).not.toThrow();
    });

    it('should be immutable between calls', () => {
      const config1 = createConfig();
      const config2 = createConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);

      config1.analytics.gaId = 'MODIFIED';
      expect(config2.analytics.gaId).not.toBe('MODIFIED');
    });
  });

  describe('production vs development', () => {
    it('should disable analytics in development', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            MODE: 'development',
            PROD: false
          }
        }
      });

      const config = createConfig();

      expect(config.analytics.enabled).toBe(false);
    });

    it('should enable analytics in production', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            MODE: 'production',
            PROD: true
          }
        }
      });

      const config = createConfig();

      expect(config.analytics.enabled).toBe(true);
    });

    it('should allow runtime override of analytics enabled flag', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            MODE: 'production',
            PROD: true
          }
        }
      });

      const config = createConfig({
        analytics: {
          enabled: false
        }
      });

      expect(config.analytics.enabled).toBe(false);
    });
  });

  describe('type coercion and validation', () => {
    it('should handle string booleans from env vars', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            MODE: 'production',
            PROD: 'true' // string instead of boolean
          }
        }
      });

      const config = createConfig();

      // PROD is truthy, so analytics should be enabled
      expect(config.analytics.enabled).toBe(true);
    });

    it('should preserve original types in config', () => {
      const config = createConfig();

      expect(typeof config.analytics.enabled).toBe('boolean');
      expect(typeof config.app.version).toBe('string');
      expect(typeof config.features.lazyWidgets).toBe('boolean');
      expect(typeof config.widgets).toBe('object');
    });

    it('should handle empty string IDs correctly', () => {
      vi.stubGlobal('import', {
        meta: {
          env: {
            VITE_GA_ID: '',
            VITE_GTM_ID: ''
          }
        }
      });

      const config = createConfig();

      // Empty strings should trigger fallbacks
      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
      expect(config.analytics.gtmId).toBe('GTM-KF2NP85D');
    });
  });
});