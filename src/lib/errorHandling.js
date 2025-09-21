/**
 * Comprehensive Error Handling and User Feedback System
 * Provides structured error mapping, user-friendly messages, and recovery mechanisms
 */

/**
 * A dictionary of defined error types.
 * @enum {string}
 */
export const ErrorTypes = {
    /** An error related to data validation. */
    VALIDATION: 'validation',
    /** An error related to network connectivity. */
    NETWORK: 'network',
    /** An error originating from the server-side API. */
    API: 'api',
    /** A rate-limiting error. */
    RATE_LIMIT: 'rate_limit',
    /** An error from the reCAPTCHA service. */
    RECAPTCHA: 'recaptcha',
    /** An error from the email sending service. */
    EMAIL_SERVICE: 'email_service',
    /** An unknown or unclassified error. */
    UNKNOWN: 'unknown'
};

/**
 * A dictionary of defined error severity levels.
 * @enum {string}
 */
export const ErrorSeverity = {
    /** The user can continue; a minor, often recoverable issue. */
    LOW: 'low',      // User can continue, minor issue
    /** User action is required, but the error is recoverable. */
    MEDIUM: 'medium', // User action required, but recoverable
    /** A critical error that blocks a specific functionality. */
    HIGH: 'high',    // Critical error, blocks functionality
    /** A system-level failure that requires immediate attention. */
    CRITICAL: 'critical' // System failure, requires immediate attention
};

/**
 * A map of error codes to user-friendly messages, severity levels, and recovery suggestions.
 * @type {Object<string, {userMessage: string, field?: string, severity: ErrorSeverity, recovery: string}>}
 */
export const ErrorMessages = {
    // Validation errors
    'validation.name_too_short': {
        userMessage: 'O nome deve ter pelo menos 3 caracteres.',
        field: 'name',
        severity: ErrorSeverity.LOW,
        recovery: 'Por favor, insira seu nome completo.'
    },
    'validation.name_too_long': {
        userMessage: 'O nome é muito longo.',
        field: 'name',
        severity: ErrorSeverity.LOW,
        recovery: 'Use no máximo 50 caracteres.'
    },
    'validation.name_invalid': {
        userMessage: 'Nome contém caracteres inválidos.',
        field: 'name',
        severity: ErrorSeverity.LOW,
        recovery: 'Use apenas letras e espaços.'
    },
    'validation.email_invalid': {
        userMessage: 'Email inválido.',
        field: 'email',
        severity: ErrorSeverity.LOW,
        recovery: 'Verifique o formato do email (ex: nome@dominio.com).'
    },
    'validation.email_too_long': {
        userMessage: 'Email muito longo.',
        field: 'email',
        severity: ErrorSeverity.LOW,
        recovery: 'Use no máximo 100 caracteres.'
    },
    'validation.phone_invalid': {
        userMessage: 'Telefone inválido.',
        field: 'phone',
        severity: ErrorSeverity.LOW,
        recovery: 'Insira um número de telefone válido com DDD.'
    },
    'validation.message_too_short': {
        userMessage: 'A mensagem é muito curta.',
        field: 'message',
        severity: ErrorSeverity.LOW,
        recovery: 'A mensagem deve ter pelo menos 10 caracteres.'
    },
    'validation.message_too_long': {
        userMessage: 'A mensagem é muito longa.',
        field: 'message',
        severity: ErrorSeverity.LOW,
        recovery: 'Use no máximo 1000 caracteres.'
    },
    'validation.message_contains_links': {
        userMessage: 'Links não são permitidos na mensagem.',
        field: 'message',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Remova qualquer link ou URL da mensagem.'
    },
    'validation.consent_required': {
        userMessage: 'É necessário aceitar os termos de privacidade.',
        field: 'consent',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Marque a caixa de consentimento para continuar.'
    },

    // Network errors
    'network.offline': {
        userMessage: 'Você está offline.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Verifique sua conexão com a internet e tente novamente.'
    },
    'network.timeout': {
        userMessage: 'A conexão expirou.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Tente novamente em alguns instantes.'
    },
    'network.failed': {
        userMessage: 'Falha na conexão.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Verifique sua conexão e tente novamente.'
    },

    // API errors
    'api.missing_token': {
        userMessage: 'Token de verificação ausente.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Recarregue a página e tente novamente.'
    },
    'api.recaptcha_failed': {
        userMessage: 'Falha na verificação de segurança.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Aguarde alguns instantes e tente novamente.'
    },
    'api.missing_required_fields': {
        userMessage: 'Campos obrigatórios não preenchidos.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Preencha todos os campos obrigatórios.'
    },
    'api.rate_limited': {
        userMessage: 'Muitas tentativas. Aguarde um momento.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Aguarde alguns minutos antes de tentar novamente.'
    },
    'api.email_service_error': {
        userMessage: 'Erro no serviço de email.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Tente novamente mais tarde ou entre em contato por telefone.'
    },

    // reCAPTCHA errors
    'recaptcha.missing_token': {
        userMessage: 'Verificação de segurança não concluída.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Recarregue a página e tente novamente.'
    },
    'recaptcha.missing_secret': {
        userMessage: 'Erro de configuração de segurança.',
        severity: ErrorSeverity.CRITICAL,
        recovery: 'Entre em contato com o suporte técnico.'
    },
    'recaptcha.verification_failed': {
        userMessage: 'Falha na verificação reCAPTCHA.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Aguarde alguns instantes e tente novamente.'
    },
    'recaptcha.low_score': {
        userMessage: 'Verificação de segurança falhou.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Tente novamente ou use outro navegador.'
    },
    'recaptcha.network_error': {
        userMessage: 'Erro na verificação de segurança.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Verifique sua conexão e tente novamente.'
    },

    // Email service errors
    'email_service_unavailable': {
        userMessage: 'Serviço de email indisponível.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Tente novamente mais tarde ou entre em contato por telefone.'
    },
    'email_send_failed': {
        userMessage: 'Falha ao enviar email.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Tente novamente ou entre em contato diretamente.'
    },

    // Generic errors
    'unknown': {
        userMessage: 'Ocorreu um erro inesperado.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Tente novamente. Se o problema persistir, entre em contato conosco.'
    }
};

/**
 * Classifies an error object into a structured type and code.
 *
 * @param {object} error The error object to classify.
 * @returns {{type: ErrorTypes, code: string}} An object containing the classified error type and code.
 */
export function classifyError(error) {
    if (!error) return { type: ErrorTypes.UNKNOWN, code: 'unknown' };

    // Network errors
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
        return { type: ErrorTypes.NETWORK, code: 'network.failed' };
    }

    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT_ERROR') {
        return { type: ErrorTypes.NETWORK, code: 'network.timeout' };
    }

    if (!navigator.onLine) {
        return { type: ErrorTypes.NETWORK, code: 'network.offline' };
    }

    // API errors
    if (error.error) {
        switch (error.error) {
            case 'missing_token':
                return { type: ErrorTypes.API, code: 'api.missing_token' };
            case 'recaptcha_failed':
                return { type: ErrorTypes.RECAPTCHA, code: 'api.recaptcha_failed' };
            case 'missing_required_fields':
                return { type: ErrorTypes.API, code: 'api.missing_required_fields' };
            case 'rate_limited':
                return { type: ErrorTypes.RATE_LIMIT, code: 'api.rate_limited' };
            case 'email_service_error':
                return { type: ErrorTypes.EMAIL_SERVICE, code: 'api.email_service_error' };
            default:
                return { type: ErrorTypes.API, code: error.error };
        }
    }

    // reCAPTCHA specific errors
    if (error.code) {
        switch (error.code) {
            case 'missing_token':
                return { type: ErrorTypes.RECAPTCHA, code: 'recaptcha.missing_token' };
            case 'missing_secret':
                return { type: ErrorTypes.RECAPTCHA, code: 'recaptcha.missing_secret' };
            case 'verification_failed':
                return { type: ErrorTypes.RECAPTCHA, code: 'recaptcha.verification_failed' };
            case 'low_score':
                return { type: ErrorTypes.RECAPTCHA, code: 'recaptcha.low_score' };
            case 'network_error':
                return { type: ErrorTypes.RECAPTCHA, code: 'recaptcha.network_error' };
            default:
                return { type: ErrorTypes.UNKNOWN, code: error.code };
        }
    }

    // Validation errors (from form)
    if (error.field) {
        return { type: ErrorTypes.VALIDATION, code: `validation.${error.code || 'unknown'}` };
    }

    // Default fallback
    return { type: ErrorTypes.UNKNOWN, code: 'unknown' };
}

/**
 * Gets a user-friendly error object based on a raw error.
 * It classifies the error and retrieves the corresponding message, severity, and recovery steps.
 *
 * @param {object} error The raw error object.
 * @returns {object} A comprehensive, user-friendly error object.
 */
export function getUserFriendlyError(error) {
    const { type, code } = classifyError(error);
    const errorConfig = ErrorMessages[code] || ErrorMessages['unknown'];

    return {
        ...errorConfig,
        type,
        code,
        originalError: error
    };
}

/**
 * Default configuration for retry logic.
 * @type {{maxAttempts: number, baseDelay: number, maxDelay: number, backoffFactor: number}}
 */
export const RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffFactor: 2
};

/**
 * Calculates the delay for the next retry attempt using exponential backoff with jitter.
 *
 * @param {number} attempt The current attempt number (starting from 1).
 * @returns {number} The calculated delay in milliseconds.
 */
export function calculateRetryDelay(attempt) {
    const delay = Math.min(
        RetryConfig.baseDelay * Math.pow(RetryConfig.backoffFactor, attempt - 1),
        RetryConfig.maxDelay
    );
    return delay + Math.random() * 1000; // Add jitter
}

/**
 * A higher-order function that wraps an async function with retry logic.
 *
 * @param {() => Promise<any>} fn The async function to execute.
 * @param {object} [options={}] Configuration for the retry logic.
 * @param {number} [options.maxAttempts] The maximum number of attempts.
 * @param {(error: object) => boolean} [options.shouldRetry] A function that determines if a retry should be attempted based on the error.
 * @returns {Promise<any>} A promise that resolves with the result of the wrapped function.
 * @throws {object} Throws the last error if all retry attempts fail.
 */
export async function withRetry(fn, options = {}) {
    const maxAttempts = options.maxAttempts || RetryConfig.maxAttempts;
    const shouldRetry = options.shouldRetry || (() => true);

    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === maxAttempts || !shouldRetry(error)) {
                throw error;
            }

            const delay = calculateRetryDelay(attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError;
}

/**
 * Logs an error with its classification and context.
 * In development, it logs to the console. In production, this can be extended
 * to send data to an external error tracking service.
 *
 * @param {object} error The error object to log.
 * @param {object} [context={}] Additional context to include with the log.
 * @returns {{timestamp: string, type: ErrorTypes, code: string, message: string, context: object}} The structured log object.
 */
export function logError(error, context = {}) {
    const errorInfo = classifyError(error);
    const timestamp = new Date().toISOString();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.group(`🚨 Error [${errorInfo.type}]`);
        console.error('Error:', error);
        console.error('Context:', context);
        console.error('Classification:', errorInfo);
        console.groupEnd();
    }

    // Here you could integrate with external error tracking services
    // like Sentry, LogRocket, etc.

    return {
        timestamp,
        type: errorInfo.type,
        code: errorInfo.code,
        message: error.message || 'Unknown error',
        context
    };
}

/**
 * Provides a list of suggested recovery steps for a given error.
 *
 * @param {object} error The error object.
 * @returns {string[]} An array of suggested recovery steps for the user.
 */
export function getRecoverySteps(error) {
    const friendlyError = getUserFriendlyError(error);
    const steps = [];

    // Basic recovery steps
    steps.push(friendlyError.recovery);

    // Additional steps based on error type
    switch (friendlyError.type) {
        case ErrorTypes.NETWORK:
            steps.push('Verifique sua conexão Wi-Fi ou dados móveis.');
            steps.push('Tente recarregar a página.');
            break;

        case ErrorTypes.RECAPTCHA:
            steps.push('Limpe o cache e cookies do navegador.');
            steps.push('Tente usar o modo anônimo do navegador.');
            break;

        case ErrorTypes.RATE_LIMIT:
            steps.push('Aguarde alguns minutos antes de tentar novamente.');
            steps.push('Se precisar de ajuda urgente, ligue diretamente para nós.');
            break;

        case ErrorTypes.EMAIL_SERVICE:
            steps.push('Tente novamente em alguns minutos.');
            steps.push('Entre em contato por telefone: +55 33 99860-1427');
            break;

        default:
            steps.push('Se o problema persistir, entre em contato conosco.');
            break;
    }

    return steps.filter(step => step && step.trim() !== '');
}

/**
 * Creates an error object that is compatible with React Error Boundaries.
 *
 * @param {object} error The original error.
 * @returns {{error: object, errorInfo: object}} An object suitable for being passed to an error boundary component.
 */
export function createErrorBoundaryError(error) {
    const friendlyError = getUserFriendlyError(error);
    return {
        error,
        errorInfo: {
            componentStack: error.stack || '',
            ...friendlyError
        }
    };
}

/**
 * Checks if an error is considered recoverable from a user's perspective.
 *
 * @param {object} error The error object.
 * @returns {boolean} True if the error is recoverable, otherwise false.
 */
export function isRecoverable(error) {
    const { type } = classifyError(error);
    const nonRecoverableTypes = [ErrorTypes.CRITICAL];

    return !nonRecoverableTypes.includes(type);
}

/**
 * Gets UI indicators (color, icon, label) for a given error severity.
 *
 * @param {ErrorSeverity} severity The severity level of the error.
 * @returns {{color: string, icon: string, label: string}} An object with UI indicators.
 */
export function getSeverityIndicator(severity) {
    switch (severity) {
        case ErrorSeverity.LOW:
            return { color: 'yellow', icon: '⚠️', label: 'Atenção' };
        case ErrorSeverity.MEDIUM:
            return { color: 'orange', icon: '🔶', label: 'Aviso' };
        case ErrorSeverity.HIGH:
            return { color: 'red', icon: '🔴', label: 'Erro' };
        case ErrorSeverity.CRITICAL:
            return { color: 'darkred', icon: '🚨', label: 'Crítico' };
        default:
            return { color: 'gray', icon: '❓', label: 'Desconhecido' };
    }
}
