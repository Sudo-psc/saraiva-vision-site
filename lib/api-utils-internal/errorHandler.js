/**
 * Comprehensive Error Handler for Saraiva Vision API
 * Provides standardized error responses, user-friendly messages, and fallback mechanisms
 * Requirements: 3.4, 4.5, 7.5, 9.5
 */

import { logEvent } from '../../src/lib/eventLogger.js';
import { createLogger } from '../../src/lib/logger.js';

/**
 * Standard HTTP status codes for API responses
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};

/**
 * Error categories for classification
 */
export const ERROR_CATEGORIES = {
    VALIDATION: 'validation',
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    RATE_LIMIT: 'rate_limit',
    EXTERNAL_SERVICE: 'external_service',
    DATABASE: 'database',
    NETWORK: 'network',
    SECURITY: 'security',
    BUSINESS_LOGIC: 'business_logic',
    SYSTEM: 'system'
};

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * Comprehensive error mapping with user-friendly messages and recovery guidance
 */
export const ERROR_MAPPINGS = {
    // Validation Errors (400)
    'VALIDATION_ERROR': {
        status: HTTP_STATUS.BAD_REQUEST,
        category: ERROR_CATEGORIES.VALIDATION,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'Os dados fornecidos são inválidos.',
        technicalMessage: 'Request validation failed',
        recovery: 'Verifique os campos obrigatórios e tente novamente.',
        ariaLabel: 'Erro de validação: dados inválidos fornecidos',
        retryable: false,
        logLevel: 'warn'
    },
    'MISSING_REQUIRED_FIELDS': {
        status: HTTP_STATUS.BAD_REQUEST,
        category: ERROR_CATEGORIES.VALIDATION,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'Campos obrigatórios não foram preenchidos.',
        technicalMessage: 'Required fields are missing',
        recovery: 'Preencha todos os campos obrigatórios e tente novamente.',
        ariaLabel: 'Erro de validação: campos obrigatórios não preenchidos',
        retryable: false,
        logLevel: 'warn'
    },
    'INVALID_EMAIL_FORMAT': {
        status: HTTP_STATUS.BAD_REQUEST,
        category: ERROR_CATEGORIES.VALIDATION,
        severity: ERROR_SEVERITY.LOW,
        userMessage: 'O formato do email é inválido.',
        technicalMessage: 'Email format validation failed',
        recovery: 'Verifique o formato do email (exemplo: nome@dominio.com).',
        ariaLabel: 'Erro no campo email: formato inválido',
        retryable: false,
        logLevel: 'info'
    },
    'INVALID_PHONE_FORMAT': {
        status: HTTP_STATUS.BAD_REQUEST,
        category: ERROR_CATEGORIES.VALIDATION,
        severity: ERROR_SEVERITY.LOW,
        userMessage: 'O formato do telefone é inválido.',
        technicalMessage: 'Phone format validation failed',
        recovery: 'Insira um número de telefone válido com DDD (exemplo: 11999999999).',
        ariaLabel: 'Erro no campo telefone: formato inválido',
        retryable: false,
        logLevel: 'info'
    },
    'CONSENT_REQUIRED': {
        status: HTTP_STATUS.BAD_REQUEST,
        category: ERROR_CATEGORIES.VALIDATION,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'É necessário aceitar os termos de privacidade para continuar.',
        technicalMessage: 'LGPD consent not provided',
        recovery: 'Marque a caixa de consentimento e tente novamente.',
        ariaLabel: 'Erro de consentimento: aceitação dos termos é obrigatória',
        retryable: false,
        logLevel: 'warn'
    },

    // Authentication/Authorization Errors (401/403)
    'UNAUTHORIZED': {
        status: HTTP_STATUS.UNAUTHORIZED,
        category: ERROR_CATEGORIES.AUTHENTICATION,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Acesso não autorizado.',
        technicalMessage: 'Authentication required',
        recovery: 'Faça login novamente para continuar.',
        ariaLabel: 'Erro de autenticação: acesso não autorizado',
        retryable: true,
        logLevel: 'warn'
    },
    'FORBIDDEN': {
        status: HTTP_STATUS.FORBIDDEN,
        category: ERROR_CATEGORIES.AUTHORIZATION,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Você não tem permissão para realizar esta ação.',
        technicalMessage: 'Insufficient permissions',
        recovery: 'Entre em contato com o administrador se necessário.',
        ariaLabel: 'Erro de autorização: permissões insuficientes',
        retryable: false,
        logLevel: 'warn'
    },

    // Rate Limiting Errors (429)
    'RATE_LIMIT_EXCEEDED': {
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        category: ERROR_CATEGORIES.RATE_LIMIT,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'Muitas tentativas realizadas. Aguarde um momento.',
        technicalMessage: 'Rate limit exceeded',
        recovery: 'Aguarde alguns minutos antes de tentar novamente.',
        ariaLabel: 'Erro de limite: muitas tentativas realizadas',
        retryable: true,
        retryAfter: 300, // 5 minutes
        logLevel: 'warn'
    },
    'SPAM_DETECTED': {
        status: HTTP_STATUS.BAD_REQUEST,
        category: ERROR_CATEGORIES.SECURITY,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Atividade suspeita detectada.',
        technicalMessage: 'Spam detection triggered',
        recovery: 'Aguarde alguns minutos e tente novamente.',
        ariaLabel: 'Erro de segurança: atividade suspeita detectada',
        retryable: true,
        retryAfter: 600, // 10 minutes
        logLevel: 'warn'
    },

    // External Service Errors (502/503/504)
    'EMAIL_SERVICE_UNAVAILABLE': {
        status: HTTP_STATUS.BAD_GATEWAY,
        category: ERROR_CATEGORIES.EXTERNAL_SERVICE,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Serviço de email temporariamente indisponível.',
        technicalMessage: 'Email service connection failed',
        recovery: 'Tente novamente em alguns minutos ou entre em contato por telefone.',
        ariaLabel: 'Erro de serviço: email indisponível',
        retryable: true,
        fallback: {
            action: 'queue_for_retry',
            message: 'Sua mensagem foi salva e será enviada assim que o serviço for restaurado.'
        },
        logLevel: 'error'
    },
    'SMS_SERVICE_UNAVAILABLE': {
        status: HTTP_STATUS.BAD_GATEWAY,
        category: ERROR_CATEGORIES.EXTERNAL_SERVICE,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Serviço de SMS temporariamente indisponível.',
        technicalMessage: 'SMS service connection failed',
        recovery: 'Tente novamente em alguns minutos. Você receberá confirmação por email.',
        ariaLabel: 'Erro de serviço: SMS indisponível',
        retryable: true,
        fallback: {
            action: 'email_only',
            message: 'Confirmação será enviada apenas por email.'
        },
        logLevel: 'error'
    },
    'WORDPRESS_UNAVAILABLE': {
        status: HTTP_STATUS.BAD_GATEWAY,
        category: ERROR_CATEGORIES.EXTERNAL_SERVICE,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'Sistema de conteúdo temporariamente indisponível.',
        technicalMessage: 'WordPress CMS connection failed',
        recovery: 'Tente recarregar a página em alguns minutos.',
        ariaLabel: 'Erro de serviço: sistema de conteúdo indisponível',
        retryable: true,
        fallback: {
            action: 'cached_content',
            message: 'Exibindo conteúdo em cache.'
        },
        logLevel: 'error'
    },
    'OPENAI_UNAVAILABLE': {
        status: HTTP_STATUS.BAD_GATEWAY,
        category: ERROR_CATEGORIES.EXTERNAL_SERVICE,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'Assistente virtual temporariamente indisponível.',
        technicalMessage: 'OpenAI API connection failed',
        recovery: 'Tente novamente em alguns minutos ou entre em contato diretamente.',
        ariaLabel: 'Erro de serviço: assistente virtual indisponível',
        retryable: true,
        fallback: {
            action: 'static_responses',
            message: 'Para agendamentos, ligue (33) 99860-1427 ou use nosso WhatsApp.'
        },
        logLevel: 'error'
    },

    // Database Errors (500/503)
    'DATABASE_CONNECTION_ERROR': {
        status: HTTP_STATUS.SERVICE_UNAVAILABLE,
        category: ERROR_CATEGORIES.DATABASE,
        severity: ERROR_SEVERITY.CRITICAL,
        userMessage: 'Serviço temporariamente indisponível.',
        technicalMessage: 'Database connection failed',
        recovery: 'Tente novamente em alguns minutos.',
        ariaLabel: 'Erro de sistema: serviço temporariamente indisponível',
        retryable: true,
        logLevel: 'error'
    },
    'DATABASE_TIMEOUT': {
        status: HTTP_STATUS.GATEWAY_TIMEOUT,
        category: ERROR_CATEGORIES.DATABASE,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'A operação demorou mais que o esperado.',
        technicalMessage: 'Database operation timeout',
        recovery: 'Tente novamente com uma conexão mais estável.',
        ariaLabel: 'Erro de tempo: operação demorou muito para completar',
        retryable: true,
        logLevel: 'error'
    },

    // Business Logic Errors (409/422)
    'APPOINTMENT_SLOT_UNAVAILABLE': {
        status: HTTP_STATUS.CONFLICT,
        category: ERROR_CATEGORIES.BUSINESS_LOGIC,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'O horário selecionado não está mais disponível.',
        technicalMessage: 'Appointment slot conflict detected',
        recovery: 'Escolha outro horário disponível.',
        ariaLabel: 'Erro de agendamento: horário não disponível',
        retryable: false,
        logLevel: 'info'
    },
    'APPOINTMENT_OUTSIDE_HOURS': {
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        category: ERROR_CATEGORIES.BUSINESS_LOGIC,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'Horário fora do funcionamento da clínica.',
        technicalMessage: 'Appointment time outside business hours',
        recovery: 'Escolha um horário entre 08:00 e 18:00, de segunda a sexta-feira.',
        ariaLabel: 'Erro de agendamento: horário fora do funcionamento',
        retryable: false,
        logLevel: 'info'
    },

    // Security Errors (400/403)
    'SECURITY_THREAT_DETECTED': {
        status: HTTP_STATUS.BAD_REQUEST,
        category: ERROR_CATEGORIES.SECURITY,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Solicitação bloqueada por motivos de segurança.',
        technicalMessage: 'Security threat detected in request',
        recovery: 'Verifique os dados enviados e tente novamente.',
        ariaLabel: 'Erro de segurança: solicitação bloqueada',
        retryable: false,
        logLevel: 'warn'
    },
    'INVALID_JSON': {
        status: HTTP_STATUS.BAD_REQUEST,
        category: ERROR_CATEGORIES.VALIDATION,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'Formato de dados inválido.',
        technicalMessage: 'Invalid JSON in request body',
        recovery: 'Recarregue a página e tente novamente.',
        ariaLabel: 'Erro de formato: dados inválidos',
        retryable: true,
        logLevel: 'warn'
    },

    // System Errors (500)
    'INTERNAL_SERVER_ERROR': {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        category: ERROR_CATEGORIES.SYSTEM,
        severity: ERROR_SEVERITY.CRITICAL,
        userMessage: 'Ocorreu um erro interno do sistema.',
        technicalMessage: 'Internal server error',
        recovery: 'Tente novamente em alguns minutos. Se persistir, entre em contato conosco.',
        ariaLabel: 'Erro do sistema: erro interno',
        retryable: true,
        logLevel: 'error'
    },
    'METHOD_NOT_ALLOWED': {
        status: HTTP_STATUS.METHOD_NOT_ALLOWED,
        category: ERROR_CATEGORIES.VALIDATION,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'Método de solicitação não permitido.',
        technicalMessage: 'HTTP method not allowed',
        recovery: 'Recarregue a página e tente novamente.',
        ariaLabel: 'Erro de método: solicitação não permitida',
        retryable: false,
        logLevel: 'warn'
    },

    // Network Errors
    'NETWORK_ERROR': {
        status: HTTP_STATUS.BAD_GATEWAY,
        category: ERROR_CATEGORIES.NETWORK,
        severity: ERROR_SEVERITY.HIGH,
        userMessage: 'Erro de conexão de rede.',
        technicalMessage: 'Network connection failed',
        recovery: 'Verifique sua conexão com a internet e tente novamente.',
        ariaLabel: 'Erro de rede: falha na conexão',
        retryable: true,
        logLevel: 'error'
    },
    'TIMEOUT_ERROR': {
        status: HTTP_STATUS.GATEWAY_TIMEOUT,
        category: ERROR_CATEGORIES.NETWORK,
        severity: ERROR_SEVERITY.MEDIUM,
        userMessage: 'A conexão expirou.',
        technicalMessage: 'Request timeout',
        recovery: 'Tente novamente com uma conexão mais estável.',
        ariaLabel: 'Erro de tempo: conexão expirou',
        retryable: true,
        logLevel: 'warn'
    }
};

/**
 * Create standardized error response
 * @param {string} errorCode - Error code from ERROR_MAPPINGS
 * @param {Object} options - Additional options
 * @returns {Object} Standardized error response
 */
export function createErrorResponse(errorCode, options = {}) {
    const mapping = ERROR_MAPPINGS[errorCode] || ERROR_MAPPINGS['INTERNAL_SERVER_ERROR'];
    const requestId = options.requestId || generateRequestId();
    const timestamp = new Date().toISOString();

    const errorResponse = {
        success: false,
        error: {
            code: errorCode,
            message: mapping.userMessage,
            category: mapping.category,
            severity: mapping.severity,
            recovery: mapping.recovery,
            retryable: mapping.retryable || false,
            timestamp,
            requestId
        }
    };

    // Add field-specific information for validation errors
    if (options.field) {
        errorResponse.error.field = options.field;
    }

    // Add validation details
    if (options.validationErrors) {
        errorResponse.error.validationErrors = options.validationErrors;
    }

    // Add retry information
    if (mapping.retryAfter) {
        errorResponse.error.retryAfter = mapping.retryAfter;
    }

    // Add fallback information
    if (mapping.fallback) {
        errorResponse.error.fallback = mapping.fallback;
    }

    // Add accessibility information
    if (mapping.ariaLabel) {
        errorResponse.error.ariaLabel = mapping.ariaLabel;
    }

    // Add additional context
    if (options.context) {
        errorResponse.error.context = options.context;
    }

    return {
        response: errorResponse,
        status: mapping.status,
        logLevel: mapping.logLevel
    };
}

/**
 * Create success response
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {Object} options - Additional options
 * @returns {Object} Standardized success response
 */
export function createSuccessResponse(message, data = {}, options = {}) {
    const requestId = options.requestId || generateRequestId();
    const timestamp = new Date().toISOString();

    return {
        success: true,
        message,
        data,
        timestamp,
        requestId
    };
}

/**
 * Handle API errors with comprehensive logging and response
 * @param {Error} error - The error object
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Object} options - Additional options
 */
export async function handleApiError(error, req, res, options = {}) {
    const requestId = options.requestId || generateRequestId();
    const logger = createLogger(options.source || 'api', requestId);

    // Classify the error
    const errorCode = classifyError(error);
    const errorResponse = createErrorResponse(errorCode, {
        requestId,
        context: options.context,
        ...options
    });

    // Log the error
    await logError(error, {
        requestId,
        source: options.source || 'api',
        endpoint: req.url,
        method: req.method,
        userAgent: req.headers['user-agent'],
        level: errorResponse.logLevel
    }, logger);

    // Set appropriate headers
    if (errorResponse.response.error.retryAfter) {
        res.setHeader('Retry-After', errorResponse.response.error.retryAfter);
    }

    // Handle fallback mechanisms
    if (errorResponse.response.error.fallback) {
        await handleFallback(errorResponse.response.error.fallback, error, options);
    }

    // Send response
    return res.status(errorResponse.status).json(errorResponse.response);
}

/**
 * Classify error to determine appropriate error code
 * @param {Error} error - The error object
 * @returns {string} Error code
 */
function classifyError(error) {
    // Network errors
    if (error.name === 'NetworkError' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return 'NETWORK_ERROR';
    }

    if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
        return 'TIMEOUT_ERROR';
    }

    // Database errors
    if (error.code === 'ECONNRESET' || error.message?.includes('database')) {
        return 'DATABASE_CONNECTION_ERROR';
    }

    // Validation errors
    if (error.name === 'ValidationError' || error.code === 'VALIDATION_ERROR') {
        return 'VALIDATION_ERROR';
    }

    // Rate limiting
    if (error.code === 'RATE_LIMITED' || error.message?.includes('rate limit')) {
        return 'RATE_LIMIT_EXCEEDED';
    }

    // External service errors
    if (error.message?.includes('Resend') || error.message?.includes('email')) {
        return 'EMAIL_SERVICE_UNAVAILABLE';
    }

    if (error.message?.includes('Zenvia') || error.message?.includes('SMS')) {
        return 'SMS_SERVICE_UNAVAILABLE';
    }

    if (error.message?.includes('OpenAI') || error.message?.includes('chatbot')) {
        return 'OPENAI_UNAVAILABLE';
    }

    if (error.message?.includes('WordPress') || error.message?.includes('GraphQL')) {
        return 'WORDPRESS_UNAVAILABLE';
    }

    // Security errors
    if (error.code === 'SECURITY_THREAT' || error.message?.includes('security')) {
        return 'SECURITY_THREAT_DETECTED';
    }

    // JSON parsing errors
    if (error instanceof SyntaxError && error.message?.includes('JSON')) {
        return 'INVALID_JSON';
    }

    // Default to internal server error
    return 'INTERNAL_SERVER_ERROR';
}

/**
 * Log error with appropriate level and context
 * @param {Error} error - The error object
 * @param {Object} context - Error context
 * @param {Object} logger - Logger instance
 */
async function logError(error, context, logger) {
    const errorInfo = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
        ...context
    };

    switch (context.level) {
        case 'error':
            await logger.error('API Error', errorInfo);
            break;
        case 'warn':
            await logger.warn('API Warning', errorInfo);
            break;
        case 'info':
            await logger.info('API Info', errorInfo);
            break;
        default:
            await logger.error('API Error', errorInfo);
    }

    // Log to event system for monitoring
    await logEvent({
        eventType: 'api_error',
        severity: context.level || 'error',
        source: context.source || 'api',
        requestId: context.requestId,
        eventData: {
            error: error.message,
            endpoint: context.endpoint,
            method: context.method,
            userAgent: context.userAgent?.substring(0, 100)
        }
    });
}

/**
 * Handle fallback mechanisms for service failures
 * @param {Object} fallback - Fallback configuration
 * @param {Error} error - Original error
 * @param {Object} options - Additional options
 */
async function handleFallback(fallback, error, options) {
    const logger = createLogger('fallback', options.requestId);

    try {
        switch (fallback.action) {
            case 'queue_for_retry':
                await logger.info('Queuing for retry due to service failure', {
                    error: error.message,
                    fallback: fallback.action
                });
                // Implementation would queue the operation for retry
                break;

            case 'email_only':
                await logger.info('Falling back to email-only notification', {
                    error: error.message,
                    fallback: fallback.action
                });
                // Implementation would disable SMS and use email only
                break;

            case 'cached_content':
                await logger.info('Serving cached content due to service failure', {
                    error: error.message,
                    fallback: fallback.action
                });
                // Implementation would serve cached content
                break;

            case 'static_responses':
                await logger.info('Using static responses due to service failure', {
                    error: error.message,
                    fallback: fallback.action
                });
                // Implementation would use predefined responses
                break;

            default:
                await logger.warn('Unknown fallback action', {
                    action: fallback.action,
                    error: error.message
                });
        }
    } catch (fallbackError) {
        await logger.error('Fallback mechanism failed', {
            originalError: error.message,
            fallbackError: fallbackError.message,
            fallbackAction: fallback.action
        });
    }
}

/**
 * Generate unique request ID
 * @returns {string} Unique request ID
 */
function generateRequestId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `req_${timestamp}_${random}`;
}

/**
 * Middleware for handling errors in API routes
 * @param {Object} options - Configuration options
 * @returns {Function} Error handling middleware
 */
export function errorHandlerMiddleware(options = {}) {
    return async (error, req, res, next) => {
        if (res.headersSent) {
            return next(error);
        }

        await handleApiError(error, req, res, {
            source: options.source || 'api',
            requestId: req.security?.requestId || generateRequestId(),
            ...options
        });
    };
}

/**
 * Validate error response format
 * @param {Object} response - Error response to validate
 * @returns {boolean} Whether response is valid
 */
export function validateErrorResponse(response) {
    if (!response || typeof response !== 'object') {
        return false;
    }

    const required = ['success', 'error'];
    const errorRequired = ['code', 'message', 'category', 'severity', 'recovery', 'timestamp', 'requestId'];

    // Check top-level required fields
    if (!required.every(field => field in response)) {
        return false;
    }

    // Check error object required fields
    if (!errorRequired.every(field => field in response.error)) {
        return false;
    }

    // Validate success is false for error responses
    if (response.success !== false) {
        return false;
    }

    return true;
}

/**
 * Get recovery steps for specific error
 * @param {string} errorCode - Error code
 * @param {Object} context - Additional context
 * @returns {Array} Array of recovery steps
 */
export function getRecoverySteps(errorCode, context = {}) {
    const mapping = ERROR_MAPPINGS[errorCode];
    if (!mapping) {
        return ['Tente novamente mais tarde.'];
    }

    const steps = [mapping.recovery];

    // Add category-specific steps
    switch (mapping.category) {
        case ERROR_CATEGORIES.EXTERNAL_SERVICE:
            steps.push('Se o problema persistir, entre em contato conosco:');
            steps.push('Telefone: (33) 99860-1427');
            steps.push('WhatsApp: (33) 99860-1427');
            break;

        case ERROR_CATEGORIES.NETWORK:
            steps.push('Verifique sua conexão Wi-Fi ou dados móveis.');
            steps.push('Tente recarregar a página.');
            break;

        case ERROR_CATEGORIES.RATE_LIMIT:
            steps.push('Aguarde alguns minutos antes de tentar novamente.');
            steps.push('Se precisar de ajuda urgente, ligue diretamente.');
            break;

        case ERROR_CATEGORIES.VALIDATION:
            if (context.field) {
                steps.push(`Verifique o campo "${context.field}" e corrija os dados.`);
            }
            break;
    }

    return steps.filter(step => step && step.trim() !== '');
}

export default {
    createErrorResponse,
    createSuccessResponse,
    handleApiError,
    errorHandlerMiddleware,
    validateErrorResponse,
    getRecoverySteps,
    ERROR_MAPPINGS,
    ERROR_CATEGORIES,
    ERROR_SEVERITY,
    HTTP_STATUS
};