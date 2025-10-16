const defaultConfig = {
  app: {
    environment: import.meta.env.MODE || 'production',
    version: import.meta.env.VITE_APP_VERSION || '2.0.1'
  },
  analytics: {
    enabled: import.meta.env.PROD,
    gaId: '',
    gtmId: '',
    metaPixelId: ''
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
};

const envConfig = {
  analytics: {
    gaId: import.meta.env.VITE_GA_ID || undefined,
    gtmId: import.meta.env.VITE_GTM_ID || undefined,
    metaPixelId: import.meta.env.VITE_META_PIXEL_ID || undefined
  }
};

const FALLBACK_ANALYTICS = {
  gaId: 'G-LXWRK8ELS6',
  gtmId: 'GTM-KF2NP85D'
};

/**
 * Deeply merges `source` into `target` and returns a new object.
 *
 * Merges plain (non-array) objects recursively. Keys with `undefined` values in `source` are ignored.
 * For arrays and non-object values, `source` overwrites `target`.
 * @param {Object} target - Base object whose properties are used when not overridden.
 * @param {Object} source - Object with properties to merge into `target`.
 * @returns {Object} A new object containing the merged result.
 */
function deepMerge(target, source) {
  const output = { ...target };
  Object.keys(source).forEach((key) => {
    const value = source[key];
    if (value === undefined) {
      return;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      output[key] = deepMerge(output[key] || {}, value);
    } else {
      output[key] = value;
    }
  });
  return output;
}

/**
 * Builds the application runtime configuration by merging defaults, environment values, global window overrides, and provided runtime overrides.
 * @param {Object} runtimeOverrides - Configuration values applied last to override earlier settings.
 * @returns {Object} The merged configuration object. The `analytics` field is normalized so `gaId` and `gtmId` use provided values or fallback IDs when missing. 
 */
export function createConfig(runtimeOverrides = {}) {
  const globalConfig = typeof window !== 'undefined' ? window.__APP_CONFIG__ || {} : {};
  const merged = deepMerge(defaultConfig, envConfig);
  const withGlobal = deepMerge(merged, globalConfig);
  const withRuntime = deepMerge(withGlobal, runtimeOverrides);
  const analytics = {
    ...withRuntime.analytics,
    gaId: withRuntime.analytics.gaId || FALLBACK_ANALYTICS.gaId,
    gtmId: withRuntime.analytics.gtmId || FALLBACK_ANALYTICS.gtmId
  };
  return {
    ...withRuntime,
    analytics
  };
}

export default createConfig;