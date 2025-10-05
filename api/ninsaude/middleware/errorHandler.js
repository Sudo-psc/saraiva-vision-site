/**
 * Ninsaúde Error Handler Middleware
 * Centralized error handling with Ninsaúde API error mapping and user-friendly messages
 * Requirements: T034, LGPD compliance, CFM medical disclaimers
 */

import crypto from 'crypto';

/**
 * Ninsaúde-specific error mappings
 * Maps Ninsaúde API errors to user-friendly Brazilian Portuguese messages
 */
const NINSAUDE_ERROR_MAPPINGS = {
    // Authentication Errors
    'invalid_token': {
        status: 401,
        userMessage: 'Sessão expirada. Faça login novamente.',
        category: 'authentication',
        severity: 'high',
        recovery: 'Clique em "Entrar" e autentique novamente.',
        retryable: true
    },
    'token_expired': {
        status: 401,
        userMessage: 'Sua sessão expirou. Autentique-se novamente.',
        category: 'authentication',
        severity: 'high',
        recovery: 'Recarregue a página e faça login novamente.',
        retryable: true
    },
    'unauthorized': {
        status: 401,
        userMessage: 'Acesso não autorizado ao sistema Ninsaúde.',
        category: 'authentication',
        severity: 'high',
        recovery: 'Entre em contato com o administrador do sistema.',
        retryable: false
    },

    // Patient Errors
    'patient_not_found': {
        status: 404,
        userMessage: 'Paciente não encontrado no sistema.',
        category: 'business_logic',
        severity: 'medium',
        recovery: 'Verifique o CPF informado ou registre um novo paciente.',
        retryable: false
    },
    'patient_already_exists': {
        status: 409,
        userMessage: 'Já existe um paciente cadastrado com este CPF.',
        category: 'business_logic',
        severity: 'medium',
        recovery: 'Use a opção "Buscar paciente" para localizar o cadastro existente.',
        retryable: false
    },
    'invalid_cpf': {
        status: 400,
        userMessage: 'CPF inválido. Verifique o número informado.',
        category: 'validation',
        severity: 'low',
        recovery: 'Insira um CPF válido no formato XXX.XXX.XXX-XX ou apenas números.',
        retryable: false
    },

    // Appointment Errors
    'appointment_not_found': {
        status: 404,
        userMessage: 'Agendamento não encontrado.',
        category: 'business_logic',
        severity: 'medium',
        recovery: 'Verifique o código do agendamento ou entre em contato conosco.',
        retryable: false
    },
    'slot_unavailable': {
        status: 409,
        userMessage: 'Horário não disponível. Outro paciente reservou este horário.',
        category: 'business_logic',
        severity: 'medium',
        recovery: 'Escolha outro horário disponível na agenda.',
        retryable: false
    },
    'slot_conflict': {
        status: 409,
        userMessage: 'Conflito de horário detectado.',
        category: 'business_logic',
        severity: 'medium',
        recovery: 'Atualize a página e selecione um novo horário.',
        retryable: true
    },
    'appointment_past_date': {
        status: 400,
        userMessage: 'Não é possível agendar para datas passadas.',
        category: 'validation',
        severity: 'low',
        recovery: 'Selecione uma data e horário futuros.',
        retryable: false
    },
    'appointment_outside_hours': {
        status: 400,
        userMessage: 'Horário fora do expediente da clínica.',
        category: 'business_logic',
        severity: 'medium',
        recovery: 'Escolha um horário entre 08:00 e 18:00, de segunda a sexta-feira.',
        retryable: false
    },

    // Ninsaúde API Errors
    'ninsaude_unavailable': {
        status: 503,
        userMessage: 'Sistema Ninsaúde temporariamente indisponível.',
        category: 'external_service',
        severity: 'high',
        recovery: 'Aguarde alguns minutos e tente novamente. Para urgências, ligue (33) 99860-1427.',
        retryable: true,
        retryAfter: 300
    },
    'ninsaude_timeout': {
        status: 504,
        userMessage: 'Tempo de resposta do sistema excedido.',
        category: 'external_service',
        severity: 'high',
        recovery: 'Tente novamente. Se o problema persistir, entre em contato conosco.',
        retryable: true,
        retryAfter: 60
    },
    'ninsaude_rate_limit': {
        status: 429,
        userMessage: 'Limite de solicitações atingido. Aguarde um momento.',
        category: 'rate_limit',
        severity: 'medium',
        recovery: 'Aguarde alguns minutos antes de tentar novamente.',
        retryable: true,
        retryAfter: 60
    },

    // Validation Errors
    'validation_error': {
        status: 400,
        userMessage: 'Dados inválidos ou incompletos.',
        category: 'validation',
        severity: 'medium',
        recovery: 'Verifique os campos obrigatórios e tente novamente.',
        retryable: false
    },
    'missing_required_fields': {
        status: 400,
        userMessage: 'Preencha todos os campos obrigatórios.',
        category: 'validation',
        severity: 'medium',
        recovery: 'Campos obrigatórios estão marcados com asterisco (*).',
        retryable: false
    },

    // Generic Errors
    'internal_error': {
        status: 500,
        userMessage: 'Erro interno do sistema.',
        category: 'system',
        severity: 'critical',
        recovery: 'Tente novamente em alguns minutos. Se persistir, contate o suporte.',
        retryable: true
    },
    'network_error': {
        status: 502,
        userMessage: 'Erro de conexão com o sistema.',
        category: 'network',
        severity: 'high',
        recovery: 'Verifique sua conexão com a internet e tente novamente.',
        retryable: true
    }
};

/**
 * Map Ninsaúde API error to internal error code
 * @param {Error} error - Error object
 * @returns {string} Mapped error code
 */
function mapNinsaudeError(error) {
    const message = error.message?.toLowerCase() || '';
    const statusCode = error.response?.status || error.statusCode || 500;

    // Check for specific Ninsaúde error patterns
    if (message.includes('token') && message.includes('invalid')) {
        return 'invalid_token';
    }

    if (message.includes('token') && message.includes('expired')) {
        return 'token_expired';
    }

    if (message.includes('patient') && message.includes('not found')) {
        return 'patient_not_found';
    }

    if (message.includes('patient') && message.includes('already exists')) {
        return 'patient_already_exists';
    }

    if (message.includes('cpf') && message.includes('invalid')) {
        return 'invalid_cpf';
    }

    if (message.includes('appointment') && message.includes('not found')) {
        return 'appointment_not_found';
    }

    if (message.includes('slot') && (message.includes('unavailable') || message.includes('conflict'))) {
        return 'slot_unavailable';
    }

    if (message.includes('past date') || message.includes('data passada')) {
        return 'appointment_past_date';
    }

    if (message.includes('outside') && message.includes('hours')) {
        return 'appointment_outside_hours';
    }

    // Map by HTTP status code
    switch (statusCode) {
        case 401:
            return 'unauthorized';
        case 404:
            return error.message?.includes('appointment') ? 'appointment_not_found' : 'patient_not_found';
        case 409:
            return 'slot_conflict';
        case 429:
            return 'ninsaude_rate_limit';
        case 503:
            return 'ninsaude_unavailable';
        case 504:
            return 'ninsaude_timeout';
        default:
            if (statusCode >= 500) {
                return 'internal_error';
            }
            if (statusCode >= 400) {
                return 'validation_error';
            }
            return 'internal_error';
    }
}

/**
 * Create standardized error response
 * @param {string} errorCode - Error code
 * @param {Object} options - Additional options
 * @returns {Object} Error response object
 */
function createErrorResponse(errorCode, options = {}) {
    const mapping = NINSAUDE_ERROR_MAPPINGS[errorCode] || NINSAUDE_ERROR_MAPPINGS['internal_error'];
    const timestamp = new Date().toISOString();
    const requestId = options.requestId || crypto.randomUUID();

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

    // Add retry information if applicable
    if (mapping.retryAfter) {
        errorResponse.error.retryAfter = mapping.retryAfter;
    }

    // Add field-specific information
    if (options.field) {
        errorResponse.error.field = options.field;
    }

    // Add validation errors
    if (options.validationErrors) {
        errorResponse.error.validationErrors = options.validationErrors;
    }

    // Add additional context
    if (options.context) {
        errorResponse.error.context = options.context;
    }

    return {
        response: errorResponse,
        status: mapping.status
    };
}

/**
 * Log error with context
 * @param {Error} error - Error object
 * @param {Object} context - Error context
 */
function logError(error, context) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        code: context.errorCode,
        endpoint: context.endpoint,
        method: context.method,
        requestId: context.requestId,
        statusCode: context.statusCode
    };

    // Log based on severity
    if (context.severity === 'critical' || context.severity === 'high') {
        console.error('[Ninsaúde Error]', logEntry);
    } else {
        console.warn('[Ninsaúde Warning]', logEntry);
    }
}

/**
 * Ninsaúde error handler middleware
 * Must be placed AFTER all routes
 * @returns {Function} Express error handling middleware
 */
export function errorHandler() {
    return (error, req, res, next) => {
        // If headers already sent, delegate to default Express error handler
        if (res.headersSent) {
            return next(error);
        }

        try {
            // Map error to internal error code
            const errorCode = mapNinsaudeError(error);
            const requestId = req.security?.requestId || crypto.randomUUID();

            // Create standardized error response
            const { response, status } = createErrorResponse(errorCode, {
                requestId,
                context: {
                    endpoint: req.path,
                    method: req.method
                }
            });

            // Log error with context
            logError(error, {
                errorCode,
                endpoint: req.path,
                method: req.method,
                requestId,
                statusCode: status,
                severity: response.error.severity
            });

            // Store error code for audit logging
            res.locals.errorCode = errorCode;

            // Set Retry-After header if applicable
            if (response.error.retryAfter) {
                res.setHeader('Retry-After', response.error.retryAfter);
            }

            // Send error response
            return res.status(status).json(response);
        } catch (handlerError) {
            // Fallback error response if error handler itself fails
            console.error('Error handler failed:', handlerError);

            return res.status(500).json({
                success: false,
                error: {
                    code: 'error_handler_failed',
                    message: 'Erro ao processar solicitação.',
                    category: 'system',
                    severity: 'critical',
                    recovery: 'Tente novamente mais tarde.',
                    retryable: true,
                    timestamp: new Date().toISOString(),
                    requestId: req.security?.requestId || crypto.randomUUID()
                }
            });
        }
    };
}

/**
 * Create a Ninsaúde-specific error object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} options - Additional options
 * @returns {Error} Error object
 */
export function createNinsaudeError(code, message, options = {}) {
    const error = new Error(message || code);
    error.code = code;
    error.statusCode = options.statusCode || 500;
    error.response = options.response || null;
    return error;
}

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error handler
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Get error mapping for a specific code
 * @param {string} errorCode - Error code
 * @returns {Object|null} Error mapping
 */
export function getErrorMapping(errorCode) {
    return NINSAUDE_ERROR_MAPPINGS[errorCode] || null;
}

export default errorHandler;
