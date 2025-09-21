/**
 * Comprehensive Error Handling and User Feedback System
 * Provides structured error mapping, user-friendly messages, and recovery mechanisms
 */

// Error type definitions
export const ErrorTypes = {
    VALIDATION: 'validation',
    NETWORK: 'network',
    API: 'api',
    RATE_LIMIT: 'rate_limit',
    RECAPTCHA: 'recaptcha',
    EMAIL_SERVICE: 'email_service',
    UNKNOWN: 'unknown'
};

// Error severity levels
export const ErrorSeverity = {
    LOW: 'low',      // User can continue, minor issue
    MEDIUM: 'medium', // User action required, but recoverable
    HIGH: 'high',    // Critical error, blocks functionality
    CRITICAL: 'critical' // System failure, requires immediate attention
};

// Error mapping with user-friendly messages
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

// Error classification helper
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

// Get user-friendly error message
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

// Retry configuration
export const RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffFactor: 2
};

// Exponential backoff helper
export function calculateRetryDelay(attempt) {
    const delay = Math.min(
        RetryConfig.baseDelay * Math.pow(RetryConfig.backoffFactor, attempt - 1),
        RetryConfig.maxDelay
    );
    return delay + Math.random() * 1000; // Add jitter
}

// Retry function with exponential backoff
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

// Error logging utility
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

// Error recovery suggestions
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

// Create error boundary compatible error object
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

// Check if error is recoverable
export function isRecoverable(error) {
    const { type } = classifyError(error);
    const nonRecoverableTypes = [ErrorTypes.CRITICAL];

    return !nonRecoverableTypes.includes(type);
}

// Error severity indicator for UI
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
