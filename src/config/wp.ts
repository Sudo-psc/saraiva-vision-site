/**
 * WordPress Configuration
 * Centralized configuration for WordPress CMS and GraphQL integration
 */

export const WORDPRESS_CONFIG = {
  /**
   * GraphQL endpoint for WordPress headless CMS
   * Must be HTTPS with valid certificate in production
   */
  GRAPHQL_ENDPOINT: import.meta.env.VITE_WORDPRESS_GRAPHQL_ENDPOINT || '',

  /**
   * Site URL for WordPress admin and REST API
   */
  SITE_URL: import.meta.env.VITE_WORDPRESS_SITE_URL || '',

  /**
   * Environment flag for debugging
   */
  ENVIRONMENT: import.meta.env.MODE || 'development',

  /**
   * Request timeout in milliseconds
   */
  REQUEST_TIMEOUT: parseInt(import.meta.env.VITE_GRAPHQL_TIMEOUT || '10000', 10),

  /**
   * Maximum retry attempts for failed requests
   */
  MAX_RETRIES: parseInt(import.meta.env.VITE_GRAPHQL_MAX_RETRIES || '3', 10),

  /**
   * Retry delay base in milliseconds (exponential backoff)
   */
  RETRY_DELAY_BASE: parseInt(import.meta.env.VITE_GRAPHQL_RETRY_DELAY || '1000', 10),
} as const;

/**
 * Validate GraphQL endpoint configuration
 * @throws {Error} If endpoint is invalid or missing
 */
export function validateGraphQLEndpoint(): void {
  const { GRAPHQL_ENDPOINT, ENVIRONMENT } = WORDPRESS_CONFIG;

  if (!GRAPHQL_ENDPOINT) {
    throw new Error(
      'GraphQL endpoint is not configured. ' +
      'Please set VITE_WORDPRESS_GRAPHQL_ENDPOINT environment variable.'
    );
  }

  if (ENVIRONMENT === 'production') {
    if (!GRAPHQL_ENDPOINT.startsWith('https://')) {
      throw new Error(
        'GraphQL endpoint must use HTTPS in production. ' +
        `Current endpoint: ${GRAPHQL_ENDPOINT}`
      );
    }

    // Validate domain format (basic check)
    try {
      const url = new URL(GRAPHQL_ENDPOINT);
      if (!url.hostname || url.hostname === 'localhost') {
        throw new Error(
          'GraphQL endpoint must use a valid domain name in production. ' +
          `Current hostname: ${url.hostname}`
        );
      }
    } catch (error) {
      throw new Error(
        `Invalid GraphQL endpoint URL: ${GRAPHQL_ENDPOINT}`
      );
    }
  }
}

/**
 * Get validated GraphQL endpoint
 * @returns {string} Validated GraphQL endpoint URL
 */
export function getGraphQLEndpoint(): string {
  try {
    validateGraphQLEndpoint();
    return WORDPRESS_CONFIG.GRAPHQL_ENDPOINT;
  } catch (error) {
    console.error('GraphQL endpoint validation failed:', error);

    // Fallback for development only
    if (WORDPRESS_CONFIG.ENVIRONMENT === 'development') {
      console.warn('Using development fallback endpoint');
      return 'http://localhost:8080/graphql';
    }

    throw error;
  }
}

/**
 * Check if current environment is production
 * @returns {boolean} True if production environment
 */
export function isProduction(): boolean {
  return WORDPRESS_CONFIG.ENVIRONMENT === 'production';
}

/**
 * Check if SSL certificate validation should be enforced
 * @returns {boolean} True if SSL validation should be enforced
 */
export function shouldEnforceSSL(): boolean {
  return isProduction();
}

export default WORDPRESS_CONFIG;