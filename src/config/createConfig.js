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
 * Recursively merges two plain objects into a new object.
 *
 * The result contains all keys from `target` with values from `source` overriding
 * or extending them. If a `source` value is `undefined` that key is skipped.
 * Plain (non-array) nested objects are merged recursively; arrays and non-object
 * values from `source` replace the corresponding `target` values. The function
 * does not mutate the original `target` or `source` objects.
 *
 * @param {Object} target - The base object to merge into.
 * @param {Object} source - The object whose values override or extend `target`.
 * @returns {Object} A new object representing the merged result.
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
 * Builds the application configuration by merging defaults, environment values, any global config, and runtime overrides.
 *
 * @param {Object} [runtimeOverrides={}] - Configuration properties applied last to override any previous configuration.
 * @returns {Object} The final configuration object. The returned `analytics` object will always include `gaId` and `gtmId`, using fallback IDs when those values are not provided.
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