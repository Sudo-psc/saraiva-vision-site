import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createConfig } from '../createConfig.js';

describe('createConfig', () => {
  const originalWindow = global.window;
  const originalImportMetaEnv = import.meta.env;

  beforeEach(() => {
    // Reset window.__APP_CONFIG__
    if (typeof window !== 'undefined') {
      delete window.__APP_CONFIG__;
    }
    // Reset import.meta.env
    vi.stubEnv('MODE', 'test');
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_APP_VERSION', '2.0.1');
    vi.stubEnv('VITE_GA_ID', undefined);
    vi.stubEnv('VITE_GTM_ID', undefined);
    vi.stubEnv('VITE_META_PIXEL_ID', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns default configuration when no overrides provided', () => {
    const config = createConfig();

    expect(config).toMatchObject({
      app: {
        environment: 'test',
        version: '2.0.1'
      },
      analytics: {
        enabled: false,
        gaId: 'G-LXWRK8ELS6', // Fallback
        gtmId: 'GTM-KF2NP85D' // Fallback
      },
      widgets: {
        accessibility: { enabled: true },
        stickyCta: { enabled: true },
        ctaModal: { enabled: true },
        toaster: { enabled: true },
        cookieManager: { enabled: true },
        serviceWorkerNotification: { enabled: true }
      },
      features: {
        lazyWidgets: true
      }
    });
  });

  it('uses environment variables for analytics IDs when provided', () => {
    vi.stubEnv('VITE_GA_ID', 'G-CUSTOM123');
    vi.stubEnv('VITE_GTM_ID', 'GTM-CUSTOM456');
    vi.stubEnv('VITE_META_PIXEL_ID', '123456789');

    const config = createConfig();

    expect(config.analytics.gaId).toBe('G-CUSTOM123');
    expect(config.analytics.gtmId).toBe('GTM-CUSTOM456');
    expect(config.analytics.metaPixelId).toBe('123456789');
  });

  it('falls back to default analytics IDs when env vars are undefined', () => {
    vi.stubEnv('VITE_GA_ID', undefined);
    vi.stubEnv('VITE_GTM_ID', undefined);

    const config = createConfig();

    expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
    expect(config.analytics.gtmId).toBe('GTM-KF2NP85D');
  });

  it('merges runtime overrides correctly', () => {
    const overrides = {
      widgets: {
        accessibility: { enabled: false },
        customWidget: { enabled: true }
      },
      features: {
        lazyWidgets: false
      }
    };

    const config = createConfig(overrides);

    expect(config.widgets.accessibility.enabled).toBe(false);
    expect(config.widgets.customWidget.enabled).toBe(true);
    expect(config.widgets.stickyCta.enabled).toBe(true); // Not overridden
    expect(config.features.lazyWidgets).toBe(false);
  });

  it('reads from window.__APP_CONFIG__ when available', () => {
    global.window = {
      __APP_CONFIG__: {
        analytics: {
          gaId: 'G-WINDOW123'
        },
        widgets: {
          toaster: { enabled: false }
        }
      }
    };

    const config = createConfig();

    expect(config.analytics.gaId).toBe('G-WINDOW123');
    expect(config.widgets.toaster.enabled).toBe(false);
    expect(config.widgets.stickyCta.enabled).toBe(true); // Not affected

    global.window = originalWindow;
  });

  it('prioritizes runtime overrides over window config', () => {
    global.window = {
      __APP_CONFIG__: {
        analytics: {
          gaId: 'G-WINDOW123'
        }
      }
    };

    const config = createConfig({
      analytics: {
        gaId: 'G-RUNTIME456'
      }
    });

    expect(config.analytics.gaId).toBe('G-RUNTIME456');

    global.window = originalWindow;
  });

  it('handles undefined values in overrides without replacing defaults', () => {
    const config = createConfig({
      analytics: {
        gaId: undefined,
        gtmId: 'GTM-OVERRIDE'
      }
    });

    expect(config.analytics.gaId).toBe('G-LXWRK8ELS6'); // Falls back
    expect(config.analytics.gtmId).toBe('GTM-OVERRIDE');
  });

  it('deep merges nested objects correctly', () => {
    const config = createConfig({
      widgets: {
        accessibility: { enabled: false }
      }
    });

    expect(config.widgets.accessibility.enabled).toBe(false);
    expect(config.widgets.stickyCta.enabled).toBe(true);
    expect(config.widgets.ctaModal.enabled).toBe(true);
  });

  it('sets analytics.enabled to true in production mode', () => {
    vi.stubEnv('PROD', true);

    const config = createConfig();

    expect(config.analytics.enabled).toBe(true);
  });

  it('preserves array values without merging', () => {
    const config = createConfig({
      customArray: ['item1', 'item2']
    });

    expect(config.customArray).toEqual(['item1', 'item2']);
  });

  it('handles null window gracefully in SSR context', () => {
    global.window = undefined;

    const config = createConfig();

    expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
    expect(config.app.environment).toBe('test');

    global.window = originalWindow;
  });

  it('returns consistent config object structure', () => {
    const config1 = createConfig();
    const config2 = createConfig();

    expect(Object.keys(config1)).toEqual(Object.keys(config2));
    expect(config1.app).toBeDefined();
    expect(config1.analytics).toBeDefined();
    expect(config1.widgets).toBeDefined();
    expect(config1.features).toBeDefined();
  });

  it('handles empty runtime overrides', () => {
    const config = createConfig({});

    expect(config.analytics.gaId).toBe('G-LXWRK8ELS6');
    expect(config.features.lazyWidgets).toBe(true);
  });

  it('correctly merges multiple levels of nested objects', () => {
    global.window = {
      __APP_CONFIG__: {
        widgets: {
          accessibility: {
            enabled: false,
            customProp: 'fromWindow'
          }
        }
      }
    };

    const config = createConfig({
      widgets: {
        accessibility: {
          enabled: true
        }
      }
    });

    expect(config.widgets.accessibility.enabled).toBe(true);
    expect(config.widgets.accessibility.customProp).toBe('fromWindow');

    global.window = originalWindow;
  });

  it('handles edge case with metaPixelId fallback', () => {
    const config = createConfig({
      analytics: {
        metaPixelId: undefined
      }
    });

    // metaPixelId should be undefined as there's no fallback for it
    expect(config.analytics.metaPixelId).toBeUndefined();
  });

  it('preserves version from environment', () => {
    vi.stubEnv('VITE_APP_VERSION', '3.5.2');

    const config = createConfig();

    expect(config.app.version).toBe('3.5.2');
  });
});