/**
 * GraphQL Client with SSL/TLS and CORS error handling
 * Provides resilient GraphQL requests with proper error classification
 */

import { getGraphQLEndpoint, WORDPRESS_CONFIG } from '../config/wp';

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
 * Execute GraphQL query with TypeScript typing
 */
export async function gqlQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options?: Pick<GraphQLRequestOptions, 'signal' | 'retries' | 'retryDelay'>
): Promise<T> {
  return executeGraphQLRequest<T>({
    query,
    variables,
    ...options
  });
}

/**
 * Execute GraphQL mutation with TypeScript typing
 */
export async function gqlMutation<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  options?: Pick<GraphQLRequestOptions, 'signal' | 'retries' | 'retryDelay'>
): Promise<T> {
  return executeGraphQLRequest<T>({
    query,
    variables,
    ...options
  });
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