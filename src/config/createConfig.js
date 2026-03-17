import { site, business } from './config.base.js';

// Safe environment variable access for both Node and Browser (Vite)
const getEnvVar = (viteKey, nextKey) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[viteKey];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[nextKey] || process.env[viteKey];
  }
  return undefined;
};

const isProd = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.PROD;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV === 'production';
  }
  return true; // Default to true in unknown environments for safety
};

const defaultConfig = {
  app: {
    environment: isProd() ? 'production' : 'development',
    version: getEnvVar('VITE_APP_VERSION', 'NEXT_PUBLIC_APP_VERSION') || '2.0.1'
  },
  analytics: {
    enabled: isProd(),
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
  },
  // Add site and business from base config
  site,
  business
};

const envConfig = {
  analytics: {
    gaId: getEnvVar('VITE_GA_ID', 'NEXT_PUBLIC_GA_ID') || undefined,
    gtmId: getEnvVar('VITE_GTM_ID', 'NEXT_PUBLIC_GTM_ID') || undefined,
    metaPixelId: getEnvVar('VITE_META_PIXEL_ID', 'NEXT_PUBLIC_META_PIXEL_ID') || undefined
  }
};

const FALLBACK_ANALYTICS = {
  gaId: 'G-LXWRK8ELS6',
  gtmId: 'GTM-KF2NP85D'
};

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
