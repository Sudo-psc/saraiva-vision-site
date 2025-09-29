/**
 * Enhanced GraphQL Client with SSL/TLS, CORS error handling and fallback mechanisms
 * Provides resilient GraphQL requests with proper error classification and REST API fallback
 */

import { getGraphQLEndpoint, WORDPRESS_CONFIG, isProduction } from '../config/wp';

/**
 * GraphQL Error Types
 */
export enum GraphQLErrorType {
  NETWORK = 'network',
  SSL = 'ssl',
  CORS = 'cors',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

/**
 * GraphQL Error Details
 */
export interface GraphQLErrorDetails {
  type: GraphQLErrorType;
  message: string;
  cause?: unknown;
  statusCode?: number;
  endpoint?: string;
  timestamp: string;
  userAgent?: string;
}

/**
 * Custom GraphQL Error with detailed information
 */
export class GraphQLError extends Error {
  public readonly details: GraphQLErrorDetails;

  constructor(message: string, type: GraphQLErrorType = GraphQLErrorType.UNKNOWN, cause?: unknown, statusCode?: number) {
    super(message);
    this.name = 'GraphQLError';

    this.details = {
      type,
      message,
      cause,
      statusCode,
      endpoint: getGraphQLEndpoint(),
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
    };
  }

  /**
   * Check if error is SSL/TLS related
   */
  isSSLError(): boolean {
    return this.details.type === GraphQLErrorType.SSL;
  }

  /**
   * Check if error is CORS related
   */
  isCORSError(): boolean {
    return this.details.type === GraphQLErrorType.CORS;
  }

  /**
   * Check if error is network related
   */
  isNetworkError(): boolean {
    return this.details.type === GraphQLErrorType.NETWORK;
  }

  /**
   * Check if error is timeout related
   */
  isTimeoutError(): boolean {
    return this.details.type === GraphQLErrorType.TIMEOUT;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    switch (this.details.type) {
      case GraphQLErrorType.SSL:
        return 'Não foi possível conectar ao servidor devido a um problema de segurança. Por favor, tente novamente mais tarde.';
      case GraphQLErrorType.CORS:
        return 'Erro de acesso entre domínios. Por favor, entre em contato com o suporte técnico.';
      case GraphQLErrorType.TIMEOUT:
        return 'A conexão demorou muito tempo. Por favor, verifique sua internet e tente novamente.';
      case GraphQLErrorType.NETWORK:
        return 'Erro de conexão com o servidor. Por favor, verifique sua internet e tente novamente.';
      case GraphQLErrorType.SERVER:
        return 'O servidor encontrou um problema. Por favor, tente novamente mais tarde.';
      default:
        return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
    }
  }
}

/**
 * GraphQL Request Options
 */
export interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, unknown>;
  signal?: AbortSignal;
  retries?: number;
  retryDelay?: number;
}

/**
 * GraphQL Response Structure
 */
export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
    extensions?: Record<string, unknown>;
  }>;
  extensions?: Record<string, unknown>;
}

/**
 * WordPress REST API Post Structure (for fallback)
 */
export interface WordPressPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  modified: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  _embedded?: {
    author?: Array<{ name: string; avatar_urls?: Record<string, string> }>;
    'wp:featuredmedia'?: Array<{ source_url?: string; alt_text?: string }>;
    'wp:term'?: Array<Array<{ name: string; slug: string }>>;
  };
}

/**
 * Fallback Strategy Configuration
 */
export interface FallbackConfig {
  enabled: boolean;
  restApiUrl: string;
  maxFallbackRetries: number;
  fallbackTimeout: number;
}

/**
 * Enhanced Request Options with Fallback Support
 */
export interface EnhancedGraphQLRequestOptions extends GraphQLRequestOptions {
  enableFallback?: boolean;
  fallbackCacheKey?: string;
  cacheTTL?: number;
}

/**
 * Retry delay with exponential backoff
 */
function getRetryDelay(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
}

/**
 * Classify error based on error details
 */
function classifyError(error: unknown, statusCode?: number): GraphQLErrorType {
  // Network errors
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return GraphQLErrorType.NETWORK;
  }

  // SSL/TLS errors
  if (error instanceof Error && (
    error.message.includes('certificate') ||
    error.message.includes('SSL') ||
    error.message.includes('TLS') ||
    error.message.includes('ERR_CERT_') ||
    error.message.includes('net::ERR_')
  )) {
    return GraphQLErrorType.SSL;
  }

  // CORS errors
  if (error instanceof TypeError && error.message.includes('CORS')) {
    return GraphQLErrorType.CORS;
  }

  // Timeout errors
  if (error instanceof DOMException && error.name === 'AbortError') {
    return GraphQLErrorType.TIMEOUT;
  }

  // Server errors
  if (statusCode && statusCode >= 500) {
    return GraphQLErrorType.SERVER;
  }

  // Validation errors
  if (statusCode && (statusCode === 400 || statusCode === 422)) {
    return GraphQLErrorType.VALIDATION;
  }

  return GraphQLErrorType.UNKNOWN;
}

/**
 * Execute GraphQL request with retry logic and error handling
 */
export async function executeGraphQLRequest<T = unknown>(
  options: GraphQLRequestOptions
): Promise<T> {
  const {
    query,
    variables = {},
    signal: externalSignal,
    retries = WORDPRESS_CONFIG.MAX_RETRIES,
    retryDelay = WORDPRESS_CONFIG.RETRY_DELAY_BASE
  } = options;

  const endpoint = getGraphQLEndpoint();
  const timeout = WORDPRESS_CONFIG.REQUEST_TIMEOUT;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Combine external and internal signals
    const combinedSignal = externalSignal
      ? AbortSignal.any([externalSignal, controller.signal])
      : controller.signal;

    try {
      console.log(`[GraphQL] Attempt ${attempt + 1}/${retries + 1} to ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': `SaraivaVision-Frontend/${import.meta.env.VITE_APP_VERSION || '1.0.0'}`
        },
        body: JSON.stringify({ query, variables }),
        signal: combinedSignal,
        credentials: 'omit',
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[GraphQL] HTTP ${response.status}:`, errorText);

        throw new GraphQLError(
          `HTTP ${response.status}: ${response.statusText}`,
          classifyError(null, response.status),
          { status: response.status, body: errorText },
          response.status
        );
      }

      // Parse response
      const responseData: GraphQLResponse<T> = await response.json();

      // Handle GraphQL errors
      if (responseData.errors) {
        console.error('[GraphQL] GraphQL errors:', responseData.errors);
        throw new GraphQLError(
          'GraphQL errors returned from server',
          GraphQLErrorType.VALIDATION,
          responseData.errors
        );
      }

      // Handle missing data
      if (!responseData.data) {
        throw new GraphQLError(
          'GraphQL response missing data',
          GraphQLErrorType.VALIDATION
        );
      }

      console.log(`[GraphQL] Success on attempt ${attempt + 1}`);
      return responseData.data as T;

    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      // Log error details
      if (error instanceof GraphQLError) {
        console.error(`[GraphQL] Error (${error.details.type}):`, error.details);
      } else {
        console.error('[GraphQL] Unknown error:', error);
      }

      // Don't retry on certain errors
      if (error instanceof GraphQLError) {
        if (error.details.type === GraphQLErrorType.VALIDATION) {
          throw error; // Don't retry validation errors
        }
      }

      // Don't retry on last attempt
      if (attempt === retries) {
        break;
      }

      // Wait before retry
      const delay = getRetryDelay(attempt, retryDelay);
      console.log(`[GraphQL] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All attempts failed
  if (lastError instanceof GraphQLError) {
    throw lastError;
  }

  throw new GraphQLError(
    'All GraphQL request attempts failed',
    GraphQLErrorType.UNKNOWN,
    lastError
  );
}

/**
 * Execute GraphQL query with TypeScript typing and fallback support
 */
export async function gqlQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options?: Pick<GraphQLRequestOptions, 'signal' | 'retries' | 'retryDelay'> & {
    enableFallback?: boolean;
    fallbackCacheKey?: string;
    cacheTTL?: number;
  }
): Promise<T> {
  const { enableFallback = true, fallbackCacheKey, cacheTTL, ...graphqlOptions } = options || {};

  if (enableFallback) {
    return executeGraphQLRequestWithFallback<T>({
      query,
      variables,
      enableFallback,
      fallbackCacheKey,
      cacheTTL,
      ...graphqlOptions
    });
  }

  return executeGraphQLRequest<T>({
    query,
    variables,
    ...graphqlOptions
  });
}

/**
 * Execute GraphQL mutation with TypeScript typing and fallback support
 */
export async function gqlMutation<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options?: Pick<GraphQLRequestOptions, 'signal' | 'retries' | 'retryDelay'> & {
    enableFallback?: boolean;
    fallbackCacheKey?: string;
    cacheTTL?: number;
  }
): Promise<T> {
  // Mutations typically shouldn't use fallback for data consistency
  const { enableFallback = false, fallbackCacheKey, cacheTTL, ...graphqlOptions } = options || {};

  if (enableFallback) {
    return executeGraphQLRequestWithFallback<T>({
      query,
      variables,
      enableFallback,
      fallbackCacheKey,
      cacheTTL,
      ...graphqlOptions
    });
  }

  return executeGraphQLRequest<T>({
    query,
    variables,
    ...graphqlOptions
  });
}

/**
 * Simple in-memory cache for fallback responses
 */
const fallbackCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Get cached fallback data
 */
function getFallbackCache<T>(key: string): T | null {
  const cached = fallbackCache.get(key);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    fallbackCache.delete(key);
    return null;
  }

  return cached.data as T;
}

/**
 * Set fallback cache data
 */
function setFallbackCache<T>(key: string, data: T, ttl: number = 300000): void {
  fallbackCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

/**
 * Get fallback configuration
 */
function getFallbackConfig(): FallbackConfig {
  return {
    enabled: true,
    restApiUrl: import.meta.env.VITE_WORDPRESS_API_URL || 'https://cms.saraivavision.com.br',
    maxFallbackRetries: 2,
    fallbackTimeout: 8000
  };
}

/**
 * Fetch data from WordPress REST API as fallback
 */
async function fetchFromRESTAPI<T = WordPressPost[]>(
  endpoint: string,
  options: { retries?: number; timeout?: number } = {}
): Promise<T> {
  const { retries = 2, timeout = 8000 } = options;
  const config = getFallbackConfig();
  const url = `${config.restApiUrl}${endpoint}`;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`[REST Fallback] Attempt ${attempt + 1}/${retries + 1} to ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': `SaraivaVision-Frontend/${import.meta.env.VITE_APP_VERSION || '1.0.0'}`
        },
        signal: controller.signal,
        credentials: 'omit',
        mode: 'cors'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[REST Fallback] Success on attempt ${attempt + 1}`);
      return data as T;

    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;
      console.error(`[REST Fallback] Attempt ${attempt + 1} failed:`, error);

      if (attempt === retries) break;

      const delay = getRetryDelay(attempt, 1000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`REST fallback failed after ${retries + 1} attempts: ${lastError}`);
}

/**
 * Execute GraphQL request with fallback to REST API
 */
export async function executeGraphQLRequestWithFallback<T = unknown>(
  options: EnhancedGraphQLRequestOptions
): Promise<T> {
  const {
    enableFallback = true,
    fallbackCacheKey,
    cacheTTL = 300000, // 5 minutes default
    ...graphqlOptions
  } = options;

  // Try cache first for fallback scenarios
  if (fallbackCacheKey) {
    const cached = getFallbackCache<T>(fallbackCacheKey);
    if (cached) {
      console.log(`[GraphQL] Using cached fallback data for key: ${fallbackCacheKey}`);
      return cached;
    }
  }

  try {
    // Try GraphQL first
    return await executeGraphQLRequest<T>(graphqlOptions);
  } catch (error) {
    console.warn(`[GraphQL] Primary request failed, attempting fallback:`, error);

    if (!enableFallback) {
      throw error;
    }

    // Only fallback on specific errors
    if (error instanceof GraphQLError) {
      const { type } = error.details;

      // Don't fallback on validation errors (these are likely request-specific)
      if (type === GraphQLErrorType.VALIDATION) {
        throw error;
      }

      // Fallback on network, SSL, CORS, timeout, and server errors
      if ([GraphQLErrorType.NETWORK, GraphQLErrorType.SSL, GraphQLErrorType.CORS,
           GraphQLErrorType.TIMEOUT, GraphQLErrorType.SERVER].includes(type)) {

        try {
          console.log(`[GraphQL] Attempting REST API fallback due to ${type} error`);

          // Map common GraphQL queries to REST endpoints
          let fallbackData: any;

          if (graphqlOptions.query.includes('posts')) {
            const posts = await fetchFromRESTAPI<WordPressPost[]>('/wp/v2/posts?_embed&per_page=10');
            fallbackData = { posts };
          } else if (graphqlOptions.query.includes('page') || graphqlOptions.query.includes('pages')) {
            const pages = await fetchFromRESTAPI<WordPressPost[]>('/wp/v2/pages?_embed&per_page=10');
            fallbackData = { pages };
          } else {
            // Generic fallback
            fallbackData = {
              posts: await fetchFromRESTAPI<WordPressPost[]>('/wp/v2/posts?_embed&per_page=5')
            };
          }

          // Cache the fallback response
          if (fallbackCacheKey) {
            setFallbackCache(fallbackCacheKey, fallbackData, cacheTTL);
          }

          console.log(`[GraphQL] REST API fallback successful`);
          return fallbackData as T;

        } catch (fallbackError) {
          console.error(`[GraphQL] REST fallback also failed:`, fallbackError);
          throw new GraphQLError(
            `Both GraphQL and REST fallback failed: ${error.message}`,
            GraphQLErrorType.NETWORK,
            { originalError: error, fallbackError }
          );
        }
      }
    }

    // Re-throw original error if no fallback was attempted
    throw error;
  }
}

/**
 * Health check for GraphQL endpoint
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await gqlQuery<{ __typename: string }>(
      'query { __typename }',
      {},
      { retries: 1, retryDelay: 1000 }
    );
    return !!result.__typename;
  } catch (error) {
    console.error('[GraphQL] Health check failed:', error);
    return false;
  }
}

/**
 * Get endpoint status information
 */
export async function getEndpointStatus(): Promise<{
  endpoint: string;
  isHealthy: boolean;
  error?: GraphQLErrorDetails;
  responseTime?: number;
}> {
  const endpoint = getGraphQLEndpoint();
  const startTime = performance.now();

  try {
    await gqlQuery<{ __typename: string }>(
      'query { __typename }',
      {},
      { retries: 1, retryDelay: 1000 }
    );

    const responseTime = performance.now() - startTime;

    return {
      endpoint,
      isHealthy: true,
      responseTime
    };
  } catch (error) {
    const responseTime = performance.now() - startTime;

    if (error instanceof GraphQLError) {
      return {
        endpoint,
        isHealthy: false,
        error: error.details,
        responseTime
      };
    }

    return {
      endpoint,
      isHealthy: false,
      error: {
        type: GraphQLErrorType.UNKNOWN,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      responseTime
    };
  }
}