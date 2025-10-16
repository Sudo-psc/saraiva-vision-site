import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createConfig } from '../createConfig.js';

describe('createConfig', () => {
  const originalWindow = global.window;
  const originalEnv = { ...import.meta.env };

  beforeEach(() => {
    // Reset window and environment
    global.window = { ...originalWindow };
    delete global.window.__APP_CONFIG__;
  });

  afterEach(() => {
    global.window = originalWindow;
    // Restore environment
    Object.keys(import.meta.env).forEach(key => {
      delete import.meta.env[key];
    });
    Object.assign(import.meta.env, originalEnv);
  });

  describe('Default Configuration', () => {
    it('should return default config when no overrides provided', () => {
      const config = createConfig();

      expect(config).toHaveProperty('app');
      expect(config).toHaveProperty('analytics');
      expect(config).toHaveProperty('widgets');
      expect(config).toHaveProperty('features');
    });

    it('should include fallback analytics IDs', () => {
      const config = createConfig();

      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
      expect(config.analytics.gtmId).toBe('GTM-KF2NP85D');
    });

    it('should enable all widgets by default', () => {
      const config = createConfig();

      expect(config.widgets.accessibility.enabled).toBe(true);
      expect(config.widgets.stickyCta.enabled).toBe(true);
      expect(config.widgets.ctaModal.enabled).toBe(true);
      expect(config.widgets.toaster.enabled).toBe(true);
      expect(config.widgets.cookieManager.enabled).toBe(true);
      expect(config.widgets.serviceWorkerNotification.enabled).toBe(true);
    });

    it('should enable lazy widgets by default', () => {
      const config = createConfig();

      expect(config.features.lazyWidgets).toBe(true);
    });

    it('should use production environment in PROD mode', () => {
      import.meta.env.MODE = 'production';
      import.meta.env.PROD = true;

      const config = createConfig();

      expect(config.analytics.enabled).toBe(true);
    });
  });

  describe('Environment Variables', () => {
    it('should use VITE_GA_ID from environment when provided', () => {
      import.meta.env.VITE_GA_ID = 'GA-ENV-TEST';

      const config = createConfig();

      expect(config.analytics.gaId).toBe('GA-ENV-TEST');
    });

    it('should use VITE_GTM_ID from environment when provided', () => {
      import.meta.env.VITE_GTM_ID = 'GTM-ENV-TEST';

      const config = createConfig();

      expect(config.analytics.gtmId).toBe('GTM-ENV-TEST');
    });

    it('should use VITE_META_PIXEL_ID from environment when provided', () => {
      import.meta.env.VITE_META_PIXEL_ID = 'META-ENV-TEST';

      const config = createConfig();

      expect(config.analytics.metaPixelId).toBe('META-ENV-TEST');
    });

    it('should use VITE_APP_VERSION from environment when provided', () => {
      import.meta.env.VITE_APP_VERSION = '3.0.0';

      const config = createConfig();

      expect(config.app.version).toBe('3.0.0');
    });

    it('should fallback to default version when not provided', () => {
      delete import.meta.env.VITE_APP_VERSION;

      const config = createConfig();

      expect(config.app.version).toBe('2.0.1');
    });

    it('should use MODE from environment for app environment', () => {
      import.meta.env.MODE = 'development';

      const config = createConfig();

      expect(config.app.environment).toBe('development');
    });
  });

  describe('Global Window Configuration', () => {
    it('should merge window.__APP_CONFIG__ with defaults', () => {
      global.window.__APP_CONFIG__ = {
        analytics: {
          gaId: 'GA-WINDOW-TEST'
        }
      };

      const config = createConfig();

      expect(config.analytics.gaId).toBe('GA-WINDOW-TEST');
    });

    it('should not fail when window.__APP_CONFIG__ is undefined', () => {
      delete global.window.__APP_CONFIG__;

      expect(() => createConfig()).not.toThrow();
    });

    it('should prefer window config over environment variables', () => {
      import.meta.env.VITE_GA_ID = 'GA-ENV';
      global.window.__APP_CONFIG__ = {
        analytics: {
          gaId: 'GA-WINDOW'
        }
      };

      const config = createConfig();

      expect(config.analytics.gaId).toBe('GA-WINDOW');
    });
  });

  describe('Runtime Overrides', () => {
    it('should merge runtime overrides with defaults', () => {
      const overrides = {
        analytics: {
          gaId: 'GA-RUNTIME-TEST'
        }
      };

      const config = createConfig(overrides);

      expect(config.analytics.gaId).toBe('GA-RUNTIME-TEST');
    });

    it('should prefer runtime overrides over environment variables', () => {
      import.meta.env.VITE_GA_ID = 'GA-ENV';

      const config = createConfig({
        analytics: {
          gaId: 'GA-RUNTIME'
        }
      });

      expect(config.analytics.gaId).toBe('GA-RUNTIME');
    });

    it('should prefer runtime overrides over window config', () => {
      global.window.__APP_CONFIG__ = {
        analytics: {
          gaId: 'GA-WINDOW'
        }
      };

      const config = createConfig({
        analytics: {
          gaId: 'GA-RUNTIME'
        }
      });

      expect(config.analytics.gaId).toBe('GA-RUNTIME');
    });

    it('should deep merge nested objects', () => {
      const config = createConfig({
        widgets: {
          accessibility: { enabled: false }
        }
      });

      expect(config.widgets.accessibility.enabled).toBe(false);
      expect(config.widgets.stickyCta.enabled).toBe(true); // Other widgets unchanged
    });

    it('should allow disabling features', () => {
      const config = createConfig({
        features: {
          lazyWidgets: false
        }
      });

      expect(config.features.lazyWidgets).toBe(false);
    });

    it('should allow adding custom properties', () => {
      const config = createConfig({
        custom: {
          property: 'value'
        }
      });

      expect(config.custom).toEqual({ property: 'value' });
    });
  });

  describe('Deep Merge Functionality', () => {
    it('should merge nested objects without losing data', () => {
      const config = createConfig({
        analytics: {
          gaId: 'CUSTOM-GA'
        }
      });

      expect(config.analytics.gaId).toBe('CUSTOM-GA');
      expect(config.analytics.gtmId).toBe('GTM-KF2NP85D'); // Fallback preserved
      expect(config.analytics.enabled).toBeDefined();
    });

    it('should not merge arrays (replace them)', () => {
      const config = createConfig({
        customArray: [1, 2, 3]
      });

      expect(config.customArray).toEqual([1, 2, 3]);
    });

    it('should handle undefined values correctly', () => {
      const config = createConfig({
        analytics: {
          gaId: undefined
        }
      });

      // Undefined values should be skipped, falling back to default
      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
    });

    it('should handle null values as replacements', () => {
      const config = createConfig({
        analytics: {
          metaPixelId: null
        }
      });

      expect(config.analytics.metaPixelId).toBeNull();
    });

    it('should merge multiple levels deep', () => {
      const config = createConfig({
        deeply: {
          nested: {
            object: {
              value: 'test'
            }
          }
        }
      });

      expect(config.deeply.nested.object.value).toBe('test');
    });
  });

  describe('Fallback Analytics IDs', () => {
    it('should use fallback GA ID when none provided', () => {
      delete import.meta.env.VITE_GA_ID;

      const config = createConfig();

      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
    });

    it('should use fallback GTM ID when none provided', () => {
      delete import.meta.env.VITE_GTM_ID;

      const config = createConfig();

      expect(config.analytics.gtmId).toBe('GTM-KF2NP85D');
    });

    it('should use empty string for metaPixelId when none provided', () => {
      delete import.meta.env.VITE_META_PIXEL_ID;

      const config = createConfig();

      expect(config.analytics.metaPixelId).toBe('');
    });

    it('should prefer provided IDs over fallbacks', () => {
      const config = createConfig({
        analytics: {
          gaId: 'CUSTOM-GA',
          gtmId: 'CUSTOM-GTM'
        }
      });

      expect(config.analytics.gaId).toBe('CUSTOM-GA');
      expect(config.analytics.gtmId).toBe('CUSTOM-GTM');
    });

    it('should only apply fallback to gaId and gtmId, not metaPixelId', () => {
      const config = createConfig({
        analytics: {
          gaId: '',
          gtmId: ''
        }
      });

      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
      expect(config.analytics.gtmId).toBe('GTM-KF2NP85D');
    });
  });

  describe('Server-Side Rendering', () => {
    it('should handle undefined window gracefully', () => {
      const originalWindow = global.window;
      global.window = undefined;

      expect(() => createConfig()).not.toThrow();

      global.window = originalWindow;
    });

    it('should not access window.__APP_CONFIG__ when window is undefined', () => {
      const originalWindow = global.window;
      global.window = undefined;

      const config = createConfig();

      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6'); // Uses fallback

      global.window = originalWindow;
    });
  });

  describe('Configuration Priority Order', () => {
    it('should apply configs in correct priority: runtime > window > env > default', () => {
      import.meta.env.VITE_GA_ID = 'GA-ENV';
      global.window.__APP_CONFIG__ = {
        analytics: {
          gaId: 'GA-WINDOW'
        }
      };

      const config1 = createConfig();
      expect(config1.analytics.gaId).toBe('GA-WINDOW'); // Window beats env

      const config2 = createConfig({
        analytics: {
          gaId: 'GA-RUNTIME'
        }
      });
      expect(config2.analytics.gaId).toBe('GA-RUNTIME'); // Runtime beats all
    });
  });

  describe('Widget Configuration', () => {
    it('should allow disabling individual widgets', () => {
      const config = createConfig({
        widgets: {
          accessibility: { enabled: false },
          stickyCta: { enabled: false }
        }
      });

      expect(config.widgets.accessibility.enabled).toBe(false);
      expect(config.widgets.stickyCta.enabled).toBe(false);
      expect(config.widgets.ctaModal.enabled).toBe(true); // Others still enabled
    });

    it('should allow widget-specific configuration', () => {
      const config = createConfig({
        widgets: {
          stickyCta: {
            enabled: true,
            position: 'bottom-right',
            delay: 5000
          }
        }
      });

      expect(config.widgets.stickyCta.enabled).toBe(true);
      expect(config.widgets.stickyCta.position).toBe('bottom-right');
      expect(config.widgets.stickyCta.delay).toBe(5000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty override object', () => {
      const config = createConfig({});

      expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
    });

    it('should handle boolean primitive values', () => {
      const config = createConfig({
        features: {
          lazyWidgets: false
        }
      });

      expect(config.features.lazyWidgets).toBe(false);
    });

    it('should handle number primitive values', () => {
      const config = createConfig({
        custom: {
          timeout: 5000
        }
      });

      expect(config.custom.timeout).toBe(5000);
    });

    it('should handle string primitive values', () => {
      const config = createConfig({
        app: {
          environment: 'staging'
        }
      });

      expect(config.app.environment).toBe('staging');
    });
  });
});