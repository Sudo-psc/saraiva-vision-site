/**
 * Runtime Environment Configuration
 *
 * Loads sensitive configuration at runtime instead of build-time inlining.
 * This prevents API keys from being hardcoded into the JavaScript bundle.
 *
 * Security Benefits:
 * - API keys not visible in source code or minified bundles
 * - Can rotate keys without rebuilding
 * - Keys served from secure backend endpoint
 */

let envConfig = null;
let configPromise = null;

/**
 * Fetch environment configuration from server
 * Cached after first load for performance
 */
async function fetchEnvConfig() {
  if (envConfig) {
    return envConfig;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      // Always fetch from API endpoint (development and production)
      // This prevents Vite from inlining VITE_ environment variables
      const response = await fetch('/api/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }

      envConfig = await response.json();
      return envConfig;
    } catch (error) {
      console.error('Failed to load environment configuration:', error);

      // Fallback: Use public configuration only
      envConfig = {
        supabaseUrl: 'https://yluhrvsqdohxcnwwrekz.supabase.co',
        wordpressApiUrl: 'https://blog.saraivavision.com.br/wp-json/wp/v2',
        wordpressGraphqlEndpoint: 'https://cms.saraivavision.com.br/graphql',
      };

      return envConfig;
    } finally {
      configPromise = null;
    }
  })();

  return configPromise;
}

/**
 * Get environment configuration value
 * @param {string} key - Configuration key
 * @returns {Promise<string|undefined>} Configuration value
 */
export async function getEnv(key) {
  const config = await fetchEnvConfig();
  return config[key];
}

/**
 * Get all environment configuration
 * @returns {Promise<Object>} Full configuration object
 */
export async function getEnvConfig() {
  return fetchEnvConfig();
}

/**
 * Check if environment is production
 * @returns {boolean}
 */
export function isProduction() {
  return import.meta.env.PROD;
}

/**
 * Check if environment is development
 * @returns {boolean}
 */
export function isDevelopment() {
  return import.meta.env.DEV;
}

export default {
  getEnv,
  getEnvConfig,
  isProduction,
  isDevelopment,
};