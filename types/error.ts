/**
 * Comprehensive Error Type Definitions for Saraiva Vision
 * Next.js 15 compatible error handling types
 * WCAG AAA compliant error structures
 */

import { ReactNode } from 'react';

/**
 * Error Type Categories
 */
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  API = 'api',
  RATE_LIMIT = 'rate_limit',
  RECAPTCHA = 'recaptcha',
  EMAIL_SERVICE = 'email_service',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  CLIENT = 'client',
  ANIMATION = 'animation',
  PERFORMANCE = 'performance',
  GLASS_EFFECT = 'glass_effect',
  UNKNOWN = 'unknown',
}

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
  LOW = 'low',         // User can continue, minor issue
  MEDIUM = 'medium',   // User action required, but recoverable
  HIGH = 'high',       // Critical error, blocks functionality
  CRITICAL = 'critical' // System failure, requires immediate attention
}

/**
 * Error Categories for classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  EXTERNAL_SERVICE = 'external_service',
  INTERNAL = 'internal',
  USER_INPUT = 'user_input',
  SYSTEM = 'system',
}

/**
 * HTTP Status Code mapping
 */
export enum HttpStatus {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * Base Error Interface
 */
export interface BaseError {
  code: string;
  message: string;
  userMessage: string;
  type: ErrorType;
  severity: ErrorSeverity;
  category?: ErrorCategory;
  timestamp?: string;
  retryable: boolean;
  recovery?: string;
  ariaLabel?: string;
  field?: string;
  statusCode?: HttpStatus;
}

/**
 * Validation Error
 */
export interface ValidationError extends BaseError {
  type: ErrorType.VALIDATION;
  field: string;
  value?: unknown;
  constraints?: Record<string, string>;
  validationErrors?: Array<{
    field: string;
    message: string;
    constraint?: string;
  }>;
}

/**
 * Network Error
 */
export interface NetworkError extends BaseError {
  type: ErrorType.NETWORK;
  statusCode?: number;
  url?: string;
  method?: string;
  retryDelay?: number;
  maxRetries?: number;
  timeout?: number;
}

/**
 * API Error
 */
export interface APIError extends BaseError {
  type: ErrorType.API;
  statusCode: HttpStatus;
  endpoint?: string;
  method?: string;
  requestId?: string;
  details?: Record<string, unknown>;
}

/**
 * Rate Limit Error
 */
export interface RateLimitError extends BaseError {
  type: ErrorType.RATE_LIMIT;
  retryAfter?: number; // seconds
  limit?: number;
  remaining?: number;
  resetAt?: string;
}

/**
 * Authentication Error
 */
export interface AuthenticationError extends BaseError {
  type: ErrorType.AUTHENTICATION;
  statusCode: HttpStatus.UNAUTHORIZED;
  redirectUrl?: string;
}

/**
 * Authorization Error
 */
export interface AuthorizationError extends BaseError {
  type: ErrorType.AUTHORIZATION;
  statusCode: HttpStatus.FORBIDDEN;
  requiredPermissions?: string[];
}

/**
 * Not Found Error
 */
export interface NotFoundError extends BaseError {
  type: ErrorType.NOT_FOUND;
  statusCode: HttpStatus.NOT_FOUND;
  resourceType?: string;
  resourceId?: string;
}

/**
 * Server Error
 */
export interface ServerError extends BaseError {
  type: ErrorType.SERVER;
  statusCode: HttpStatus;
  stack?: string;
  component?: string;
}

/**
 * Animation Error (for AnimationErrorBoundary)
 */
export interface AnimationError extends BaseError {
  type: ErrorType.ANIMATION;
  animationName?: string;
  component?: string;
  stack?: string;
}

/**
 * Performance Error (for PerformanceErrorBoundary)
 */
export interface PerformanceError extends BaseError {
  type: ErrorType.PERFORMANCE;
  metric?: string;
  value?: number;
  threshold?: number;
  component?: string;
}

/**
 * Glass Effect Error (for GlassEffectErrorBoundary)
 */
export interface GlassEffectError extends BaseError {
  type: ErrorType.GLASS_EFFECT;
  supportsBackdropFilter?: boolean;
  fallbackAvailable?: boolean;
}

/**
 * Union type for all errors
 */
export type AppError =
  | ValidationError
  | NetworkError
  | APIError
  | RateLimitError
  | AuthenticationError
  | AuthorizationError
  | NotFoundError
  | ServerError
  | AnimationError
  | PerformanceError
  | GlassEffectError
  | BaseError;

/**
 * Error Display Configuration
 */
export interface ErrorDisplayConfig {
  type?: 'inline' | 'toast' | 'modal' | 'banner';
  showRecovery?: boolean;
  autoFocus?: boolean;
  dismissible?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  className?: string;
}

/**
 * Error Boundary Props
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: AppError) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
}

/**
 * Error Boundary State
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitterFactor: number;
  shouldRetry?: (error: AppError) => boolean;
}

/**
 * Retry Context
 */
export interface RetryContext {
  attempt: number;
  maxAttempts: number;
  delay: number;
  error: AppError;
  nextAttemptIn?: number;
}

/**
 * Error Log Entry
 */
export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  error: AppError;
  context?: Record<string, unknown>;
  userAgent?: string;
  url?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  resolved?: boolean;
  resolvedAt?: string;
}

/**
 * Error Recovery Strategy
 */
export interface ErrorRecoveryStrategy {
  canRecover: boolean;
  recoverySteps: string[];
  automaticRecovery?: () => Promise<void>;
  manualRecoveryRequired?: boolean;
}

/**
 * Fallback Information
 */
export interface FallbackInfo {
  message: string;
  active: boolean;
  degradedFeatures?: string[];
  alternativeAction?: {
    label: string;
    action: () => void;
  };
}

/**
 * Error Context for Enhanced Errors
 */
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  breadcrumbs?: Array<{
    timestamp: string;
    category: string;
    message: string;
    level: 'info' | 'warning' | 'error';
  }>;
}

/**
 * Enhanced Error with Context
 */
export interface EnhancedError extends BaseError {
  originalError?: Error;
  context?: ErrorContext;
  fallback?: FallbackInfo;
  recovery?: string;
  retryConfig?: RetryConfig;
  logged?: boolean;
  announced?: boolean;
}

/**
 * Error Handler Options
 */
export interface ErrorHandlerOptions {
  log?: boolean;
  announce?: boolean;
  retry?: boolean;
  fallback?: boolean;
  display?: boolean;
  displayConfig?: ErrorDisplayConfig;
  context?: ErrorContext;
}

/**
 * Accessibility Error Announcement
 */
export interface ErrorAnnouncement {
  message: string;
  priority: 'polite' | 'assertive';
  announced: boolean;
  timestamp: string;
}

/**
 * Performance Degradation Level
 */
export enum PerformanceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Glass Effect Support
 */
export interface GlassEffectSupport {
  supportsBackdropFilter: boolean;
  supportsFilter: boolean;
  supportsBlur: boolean;
  fallbackMode: boolean;
}

/**
 * Animation Error Context
 */
export interface AnimationErrorContext {
  animationName?: string;
  duration?: number;
  iteration?: number;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * Performance Error Context
 */
export interface PerformanceErrorContext {
  performanceLevel: PerformanceLevel;
  errorCount: number;
  degradationHistory: Array<{
    timestamp: string;
    previousLevel: PerformanceLevel;
    newLevel: PerformanceLevel;
    reason: string;
  }>;
}

/**
 * Error Display Component Props
 */
export interface ErrorDisplayProps {
  error: AppError;
  type?: 'inline' | 'toast' | 'modal' | 'banner';
  onRetry?: () => void | Promise<void>;
  onDismiss?: () => void;
  onContact?: () => void;
  showRecovery?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Error Boundary with Glass Effect Props
 */
export interface GlassEffectErrorBoundaryProps extends ErrorBoundaryProps {
  fallbackComponent?: React.ComponentType<{ supportsBackdropFilter: boolean }>;
  onFallback?: (support: GlassEffectSupport) => void;
}

/**
 * Animation Error Boundary Props
 */
export interface AnimationErrorBoundaryProps extends ErrorBoundaryProps {
  maxRetries?: number;
  showErrorDetails?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Performance Error Boundary Props
 */
export interface PerformanceErrorBoundaryProps extends ErrorBoundaryProps {
  onPerformanceDegradation?: (level: PerformanceLevel, error: Error) => void;
  initialPerformanceLevel?: PerformanceLevel;
}

/**
 * Type guards
 */
export function isValidationError(error: AppError): error is ValidationError {
  return error.type === ErrorType.VALIDATION;
}

export function isNetworkError(error: AppError): error is NetworkError {
  return error.type === ErrorType.NETWORK;
}

export function isAPIError(error: AppError): error is APIError {
  return error.type === ErrorType.API;
}

export function isRateLimitError(error: AppError): error is RateLimitError {
  return error.type === ErrorType.RATE_LIMIT;
}

export function isAuthenticationError(error: AppError): error is AuthenticationError {
  return error.type === ErrorType.AUTHENTICATION;
}

export function isAuthorizationError(error: AppError): error is AuthorizationError {
  return error.type === ErrorType.AUTHORIZATION;
}

export function isNotFoundError(error: AppError): error is NotFoundError {
  return error.type === ErrorType.NOT_FOUND;
}

export function isServerError(error: AppError): error is ServerError {
  return error.type === ErrorType.SERVER;
}

export function isAnimationError(error: AppError): error is AnimationError {
  return error.type === ErrorType.ANIMATION;
}

export function isPerformanceError(error: AppError): error is PerformanceError {
  return error.type === ErrorType.PERFORMANCE;
}

export function isGlassEffectError(error: AppError): error is GlassEffectError {
  return error.type === ErrorType.GLASS_EFFECT;
}

/**
 * Error Factory Functions
 */
export function createValidationError(
  field: string,
  message: string,
  userMessage: string,
  constraints?: Record<string, string>
): ValidationError {
  return {
    type: ErrorType.VALIDATION,
    code: `validation.${field}_invalid`,
    message,
    userMessage,
    field,
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.VALIDATION,
    retryable: false,
    constraints,
    ariaLabel: `Erro no campo ${field}: ${userMessage}`,
  };
}

export function createNetworkError(
  message: string,
  userMessage: string,
  statusCode?: number
): NetworkError {
  return {
    type: ErrorType.NETWORK,
    code: 'network.failed',
    message,
    userMessage,
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.NETWORK,
    retryable: true,
    statusCode,
    retryDelay: 2000,
    maxRetries: 3,
    ariaLabel: `Erro de conexão: ${userMessage}`,
  };
}

export function createAPIError(
  message: string,
  userMessage: string,
  statusCode: HttpStatus,
  endpoint?: string
): APIError {
  return {
    type: ErrorType.API,
    code: `api.${statusCode}`,
    message,
    userMessage,
    severity: statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
    category: ErrorCategory.EXTERNAL_SERVICE,
    retryable: statusCode >= 500,
    statusCode,
    endpoint,
    ariaLabel: `Erro da API: ${userMessage}`,
  };
}

export function createRateLimitError(
  retryAfter?: number,
  limit?: number
): RateLimitError {
  return {
    type: ErrorType.RATE_LIMIT,
    code: 'api.rate_limited',
    message: 'Rate limit exceeded',
    userMessage: 'Muitas tentativas. Aguarde um momento.',
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.EXTERNAL_SERVICE,
    retryable: true,
    retryAfter,
    limit,
    recovery: 'Aguarde alguns minutos antes de tentar novamente.',
    ariaLabel: 'Erro de limite: muitas tentativas realizadas',
  };
}

export function createNotFoundError(
  resourceType: string,
  resourceId?: string
): NotFoundError {
  return {
    type: ErrorType.NOT_FOUND,
    code: 'not_found',
    message: `${resourceType} not found`,
    userMessage: `${resourceType} não encontrado.`,
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.INTERNAL,
    retryable: false,
    statusCode: HttpStatus.NOT_FOUND,
    resourceType,
    resourceId,
    ariaLabel: `Erro 404: ${resourceType} não encontrado`,
  };
}

export function createServerError(
  message: string,
  statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  component?: string
): ServerError {
  return {
    type: ErrorType.SERVER,
    code: `server.${statusCode}`,
    message,
    userMessage: 'Erro interno do servidor. Tente novamente em alguns minutos.',
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.SYSTEM,
    retryable: true,
    statusCode,
    component,
    recovery: 'Tente novamente em alguns minutos.',
    ariaLabel: 'Erro do servidor: erro interno',
  };
}
