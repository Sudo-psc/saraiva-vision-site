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

// Enhanced error response mapping with comprehensive validation and service errors
export const ErrorMessages = {
    // Validation errors - Enhanced with accessibility support
    'validation.name_required': {
        userMessage: 'O nome é obrigatório.',
        field: 'name',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Por favor, insira seu nome completo.',
        ariaLabel: 'Erro no campo nome: nome é obrigatório',
        retryable: false
    },
    'validation.name_too_short': {
        userMessage: 'O nome deve ter pelo menos 3 caracteres.',
        field: 'name',
        severity: ErrorSeverity.LOW,
        recovery: 'Por favor, insira seu nome completo.',
        ariaLabel: 'Erro no campo nome: muito curto',
        retryable: false
    },
    'validation.name_too_long': {
        userMessage: 'O nome é muito longo.',
        field: 'name',
        severity: ErrorSeverity.LOW,
        recovery: 'Use no máximo 50 caracteres.',
        ariaLabel: 'Erro no campo nome: muito longo',
        retryable: false
    },
    'validation.name_invalid': {
        userMessage: 'Nome contém caracteres inválidos.',
        field: 'name',
        severity: ErrorSeverity.LOW,
        recovery: 'Use apenas letras e espaços.',
        ariaLabel: 'Erro no campo nome: caracteres inválidos',
        retryable: false
    },
    'validation.invalid': {
        userMessage: 'Valor inválido.',
        field: 'unknown',
        severity: ErrorSeverity.LOW,
        recovery: 'Verifique o valor inserido.',
        ariaLabel: 'Erro de validação: valor inválido',
        retryable: false
    },
    'validation.email_required': {
        userMessage: 'O email é obrigatório.',
        field: 'email',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Por favor, insira um endereço de email válido.',
        ariaLabel: 'Erro no campo email: email é obrigatório',
        retryable: false
    },
    'validation.email_invalid': {
        userMessage: 'Email inválido.',
        field: 'email',
        severity: ErrorSeverity.LOW,
        recovery: 'Verifique o formato do email (ex: nome@dominio.com).',
        ariaLabel: 'Erro no campo email: formato inválido',
        retryable: false
    },
    'validation.email_too_long': {
        userMessage: 'Email muito longo.',
        field: 'email',
        severity: ErrorSeverity.LOW,
        recovery: 'Use no máximo 100 caracteres.',
        ariaLabel: 'Erro no campo email: muito longo',
        retryable: false
    },
    'validation.phone_required': {
        userMessage: 'O telefone é obrigatório.',
        field: 'phone',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Por favor, insira um número de telefone válido.',
        ariaLabel: 'Erro no campo telefone: telefone é obrigatório',
        retryable: false
    },
    'validation.phone_invalid': {
        userMessage: 'Telefone inválido.',
        field: 'phone',
        severity: ErrorSeverity.LOW,
        recovery: 'Insira um número de telefone válido com DDD.',
        ariaLabel: 'Erro no campo telefone: formato inválido',
        retryable: false
    },
    'validation.message_required': {
        userMessage: 'A mensagem é obrigatória.',
        field: 'message',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Por favor, descreva sua consulta ou dúvida.',
        ariaLabel: 'Erro no campo mensagem: mensagem é obrigatória',
        retryable: false
    },
    'validation.message_too_short': {
        userMessage: 'A mensagem é muito curta.',
        field: 'message',
        severity: ErrorSeverity.LOW,
        recovery: 'A mensagem deve ter pelo menos 10 caracteres.',
        ariaLabel: 'Erro no campo mensagem: muito curta',
        retryable: false
    },
    'validation.message_too_long': {
        userMessage: 'A mensagem é muito longa.',
        field: 'message',
        severity: ErrorSeverity.LOW,
        recovery: 'Use no máximo 2000 caracteres.',
        ariaLabel: 'Erro no campo mensagem: muito longa',
        retryable: false
    },
    'validation.message_contains_links': {
        userMessage: 'Links não são permitidos na mensagem.',
        field: 'message',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Remova qualquer link ou URL da mensagem.',
        ariaLabel: 'Erro no campo mensagem: contém links não permitidos',
        retryable: false
    },
    'validation.consent_required': {
        userMessage: 'É necessário aceitar os termos de privacidade.',
        field: 'consent',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Marque a caixa de consentimento para continuar.',
        ariaLabel: 'Erro no consentimento: aceitação dos termos é obrigatória',
        retryable: false
    },

    // Network errors - Enhanced with retry configuration
    'network.offline': {
        userMessage: 'Você está offline.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Verifique sua conexão com a internet e tente novamente.',
        ariaLabel: 'Erro de conexão: sem conexão com a internet',
        retryable: true,
        retryDelay: 2000,
        maxRetries: 5
    },
    'network.timeout': {
        userMessage: 'A conexão expirou.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Tente novamente em alguns instantes.',
        ariaLabel: 'Erro de conexão: tempo limite excedido',
        retryable: true,
        retryDelay: 1000,
        maxRetries: 3
    },
    'network.failed': {
        userMessage: 'Falha na conexão.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Verifique sua conexão e tente novamente.',
        ariaLabel: 'Erro de conexão: falha na comunicação',
        retryable: true,
        retryDelay: 1500,
        maxRetries: 3
    },
    'network.dns_error': {
        userMessage: 'Erro de resolução de DNS.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Verifique sua conexão DNS ou tente novamente mais tarde.',
        ariaLabel: 'Erro de conexão: problema de DNS',
        retryable: true,
        retryDelay: 3000,
        maxRetries: 2
    },

    // API errors - Enhanced with service-specific handling
    'api.missing_token': {
        userMessage: 'Token de verificação ausente.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Recarregue a página e tente novamente.',
        ariaLabel: 'Erro de segurança: token de verificação ausente',
        retryable: true,
        retryDelay: 2000,
        maxRetries: 2
    },
    'api.recaptcha_failed': {
        userMessage: 'Falha na verificação de segurança.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Aguarde alguns instantes e tente novamente.',
        ariaLabel: 'Erro de segurança: falha na verificação reCAPTCHA',
        retryable: true,
        retryDelay: 3000,
        maxRetries: 2
    },
    'api.missing_required_fields': {
        userMessage: 'Campos obrigatórios não preenchidos.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Preencha todos os campos obrigatórios.',
        ariaLabel: 'Erro de validação: campos obrigatórios não preenchidos',
        retryable: false
    },
    'api.rate_limited': {
        userMessage: 'Muitas tentativas. Aguarde um momento.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Aguarde alguns minutos antes de tentar novamente.',
        ariaLabel: 'Erro de limite: muitas tentativas realizadas',
        retryable: true,
        retryDelay: 60000, // 1 minute
        maxRetries: 1
    },
    'api.email_service_error': {
        userMessage: 'Erro no serviço de email.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Tente novamente mais tarde ou entre em contato por telefone.',
        ariaLabel: 'Erro de serviço: falha no envio de email',
        retryable: true,
        retryDelay: 5000,
        maxRetries: 2
    },
    'api.server_error': {
        userMessage: 'Erro interno do servidor.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Tente novamente em alguns minutos.',
        ariaLabel: 'Erro do servidor: erro interno',
        retryable: true,
        retryDelay: 10000,
        maxRetries: 2
    },
    'api.service_unavailable': {
        userMessage: 'Serviço temporariamente indisponível.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Tente novamente em alguns minutos ou entre em contato por telefone.',
        ariaLabel: 'Erro de serviço: serviço indisponível',
        retryable: true,
        retryDelay: 15000,
        maxRetries: 1
    },

    // reCAPTCHA errors - Enhanced with specific retry strategies
    'recaptcha.missing_token': {
        userMessage: 'Verificação de segurança não concluída.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Recarregue a página e tente novamente.',
        ariaLabel: 'Erro de segurança: verificação reCAPTCHA não concluída',
        retryable: true,
        retryDelay: 2000,
        maxRetries: 2
    },
    'recaptcha.missing_secret': {
        userMessage: 'Erro de configuração de segurança.',
        severity: ErrorSeverity.CRITICAL,
        recovery: 'Entre em contato com o suporte técnico.',
        ariaLabel: 'Erro crítico: configuração de segurança incorreta',
        retryable: false
    },
    'recaptcha.verification_failed': {
        userMessage: 'Falha na verificação reCAPTCHA.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Aguarde alguns instantes e tente novamente.',
        ariaLabel: 'Erro de segurança: falha na verificação reCAPTCHA',
        retryable: true,
        retryDelay: 3000,
        maxRetries: 2
    },
    'recaptcha.low_score': {
        userMessage: 'Verificação de segurança falhou.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Tente novamente ou use outro navegador.',
        ariaLabel: 'Erro de segurança: pontuação baixa no reCAPTCHA',
        retryable: true,
        retryDelay: 5000,
        maxRetries: 1
    },
    'recaptcha.network_error': {
        userMessage: 'Erro na verificação de segurança.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Verifique sua conexão e tente novamente.',
        ariaLabel: 'Erro de conexão: falha na verificação de segurança',
        retryable: true,
        retryDelay: 2000,
        maxRetries: 3
    },

    // Email service errors - Enhanced with specific service handling
    'email_service_unavailable': {
        userMessage: 'Serviço de email indisponível.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Tente novamente mais tarde ou entre em contato por telefone.',
        ariaLabel: 'Erro de serviço: serviço de email indisponível',
        retryable: true,
        retryDelay: 10000,
        maxRetries: 2
    },
    'email_send_failed': {
        userMessage: 'Falha ao enviar email.',
        severity: ErrorSeverity.HIGH,
        recovery: 'Tente novamente ou entre em contato diretamente.',
        ariaLabel: 'Erro de envio: falha ao enviar email',
        retryable: true,
        retryDelay: 5000,
        maxRetries: 2
    },
    'email_template_error': {
        userMessage: 'Erro na formatação do email.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Tente novamente. Se persistir, entre em contato por telefone.',
        ariaLabel: 'Erro de formatação: problema no template de email',
        retryable: true,
        retryDelay: 2000,
        maxRetries: 1
    },

    // Generic errors - Enhanced with accessibility
    'unknown': {
        userMessage: 'Ocorreu um erro inesperado.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Tente novamente. Se o problema persistir, entre em contato conosco.',
        ariaLabel: 'Erro desconhecido: ocorreu um problema inesperado',
        retryable: true,
        retryDelay: 3000,
        maxRetries: 2
    },
    'timeout': {
        userMessage: 'A operação demorou mais que o esperado.',
        severity: ErrorSeverity.MEDIUM,
        recovery: 'Tente novamente com uma conexão mais estável.',
        ariaLabel: 'Erro de tempo: operação demorou muito para completar',
        retryable: true,
        retryDelay: 2000,
        maxRetries: 2
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

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
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

    // Validation errors (from form) - Check this first before reCAPTCHA
    if (error.field) {
        return { type: ErrorTypes.VALIDATION, code: `validation.${error.code || 'invalid'}` };
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

// Enhanced retry configuration with different strategies
export const RetryConfig = {
    // Default configuration
    default: {
        maxAttempts: 3,
        baseDelay: 1000, // 1 second
        maxDelay: 30000, // 30 seconds
        backoffFactor: 2,
        jitterFactor: 0.1
    },
    // Network-specific configuration
    network: {
        maxAttempts: 5,
        baseDelay: 2000,
        maxDelay: 60000, // 1 minute
        backoffFactor: 1.5,
        jitterFactor: 0.2
    },
    // API-specific configuration
    api: {
        maxAttempts: 3,
        baseDelay: 1500,
        maxDelay: 45000,
        backoffFactor: 2,
        jitterFactor: 0.15
    },
    // Rate limit configuration
    rateLimit: {
        maxAttempts: 2,
        baseDelay: 60000, // 1 minute
        maxDelay: 300000, // 5 minutes
        backoffFactor: 2,
        jitterFactor: 0.1
    }
};

// Enhanced exponential backoff with configurable strategies
export function calculateRetryDelay(attempt, errorType = 'default', customConfig = null) {
    const config = customConfig || RetryConfig[errorType] || RetryConfig.default;

    const exponentialDelay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt - 1),
        config.maxDelay
    );

    // Add jitter to prevent thundering herd (but ensure we don't exceed maxDelay)
    const jitter = exponentialDelay * config.jitterFactor * Math.random();
    const totalDelay = exponentialDelay + jitter;

    return Math.floor(Math.min(totalDelay, config.maxDelay));
}

// Get retry configuration for specific error
export function getRetryConfig(error) {
    const { type } = classifyError(error);
    const errorConfig = getUserFriendlyError(error);

    // Use error-specific configuration if available
    if (errorConfig.retryable === false) {
        return null; // Not retryable
    }

    // Custom retry configuration from error message
    if (errorConfig.maxRetries !== undefined) {
        return {
            maxAttempts: errorConfig.maxRetries,
            baseDelay: errorConfig.retryDelay || RetryConfig.default.baseDelay,
            shouldRetry: () => errorConfig.retryable !== false
        };
    }

    // Default configurations by error type
    switch (type) {
        case ErrorTypes.NETWORK:
            return {
                ...RetryConfig.network,
                shouldRetry: (err) => err.name === 'NetworkError' || err.name === 'TimeoutError'
            };
        case ErrorTypes.RATE_LIMIT:
            return {
                ...RetryConfig.rateLimit,
                shouldRetry: (err) => err.error === 'rate_limited'
            };
        case ErrorTypes.API:
            return {
                ...RetryConfig.api,
                shouldRetry: (err) => err.status >= 500 || err.name === 'TimeoutError'
            };
        case ErrorTypes.EMAIL_SERVICE:
            return {
                ...RetryConfig.api,
                shouldRetry: (err) => err.error === 'email_service_error' || err.status >= 500
            };
        case ErrorTypes.RECAPTCHA:
            return {
                maxAttempts: 2,
                baseDelay: 3000,
                shouldRetry: (err) => err.code !== 'missing_secret'
            };
        default:
            return RetryConfig.default;
    }
}

// Enhanced retry function with comprehensive error handling
export async function withRetry(fn, options = {}) {
    const config = options.config || RetryConfig.default;
    const maxAttempts = options.maxAttempts || config.maxAttempts;
    const shouldRetry = options.shouldRetry || (() => true);
    const onRetry = options.onRetry || (() => { });
    const errorType = options.errorType || 'default';

    let lastError;
    let attempt = 1;

    while (attempt <= maxAttempts) {
        try {
            const result = await fn();

            // Success - log if this was a retry
            if (attempt > 1) {
                logError(lastError, {
                    action: 'retry_success',
                    attempt,
                    totalAttempts: maxAttempts
                });
            }

            return result;
        } catch (error) {
            lastError = error;

            // Check if we should retry
            if (attempt === maxAttempts || !shouldRetry(error)) {
                // Log final failure
                logError(error, {
                    action: 'retry_failed',
                    attempt,
                    totalAttempts: maxAttempts,
                    finalFailure: true
                });
                throw error;
            }

            // Calculate delay for next attempt
            const delay = calculateRetryDelay(attempt, errorType, config);

            // Notify about retry attempt
            onRetry({
                error,
                attempt,
                maxAttempts,
                delay,
                nextAttemptIn: delay
            });

            // Log retry attempt
            logError(error, {
                action: 'retry_attempt',
                attempt,
                totalAttempts: maxAttempts,
                delay
            });

            // Wait before next attempt
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
        }
    }

    throw lastError;
}

// Specialized retry function for form submissions
export async function withFormRetry(submitFn, formData, options = {}) {
    const retryOptions = {
        ...options,
        onRetry: (retryInfo) => {
            // Announce retry to screen readers
            announceToScreenReader(
                `Tentativa ${retryInfo.attempt} de ${retryInfo.maxAttempts}. ` +
                `Tentando novamente em ${Math.ceil(retryInfo.delay / 1000)} segundos.`
            );

            if (options.onRetry) {
                options.onRetry(retryInfo);
            }
        }
    };

    return withRetry(() => submitFn(formData), retryOptions);
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
    const friendlyError = getUserFriendlyError(error);

    // Check if explicitly marked as non-recoverable
    if (friendlyError.retryable === false) {
        return false;
    }

    // Check severity level
    const nonRecoverableTypes = [ErrorTypes.CRITICAL];
    const { type } = classifyError(error);

    return !nonRecoverableTypes.includes(type) && friendlyError.severity !== ErrorSeverity.CRITICAL;
}

// Accessibility-compliant error announcements for screen readers
export function announceToScreenReader(message, priority = 'polite') {
    if (typeof document === 'undefined') return;

    // Create or get existing announcement element
    let announcer = document.getElementById('error-announcer');
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'error-announcer';
        announcer.setAttribute('aria-live', priority);
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        document.body.appendChild(announcer);
    }

    // Clear previous message and set new one
    announcer.textContent = '';
    setTimeout(() => {
        announcer.textContent = message;
    }, 100);

    // Auto-clear after 10 seconds to prevent accumulation
    setTimeout(() => {
        if (announcer.textContent === message) {
            announcer.textContent = '';
        }
    }, 10000);
}

// Announce error with context
export function announceError(error, context = {}) {
    const friendlyError = getUserFriendlyError(error);
    const severity = getSeverityIndicator(friendlyError.severity);

    let message = `${severity.label}: ${friendlyError.userMessage}`;

    if (friendlyError.field) {
        message = `Erro no campo ${friendlyError.field}: ${friendlyError.userMessage}`;
    }

    if (context.action) {
        message = `${context.action}: ${message}`;
    }

    // Use assertive for high/critical errors, polite for others
    const priority = [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL].includes(friendlyError.severity)
        ? 'assertive'
        : 'polite';

    announceToScreenReader(message, priority);

    return message;
}

// Announce retry attempts
export function announceRetry(attempt, maxAttempts, delay) {
    const message = `Tentativa ${attempt} de ${maxAttempts} falhou. ` +
        `Tentando novamente em ${Math.ceil(delay / 1000)} segundos.`;
    announceToScreenReader(message, 'polite');
}

// Announce success after retry
export function announceRetrySuccess(attempt) {
    const message = attempt > 1
        ? `Sucesso na tentativa ${attempt}. Formulário enviado com êxito.`
        : 'Formulário enviado com sucesso.';
    announceToScreenReader(message, 'polite');
}

// Error severity indicator for UI with accessibility enhancements
export function getSeverityIndicator(severity) {
    switch (severity) {
        case ErrorSeverity.LOW:
            return {
                color: 'yellow',
                icon: '⚠️',
                label: 'Atenção',
                ariaLabel: 'Aviso de atenção',
                role: 'img'
            };
        case ErrorSeverity.MEDIUM:
            return {
                color: 'orange',
                icon: '🔶',
                label: 'Aviso',
                ariaLabel: 'Aviso importante',
                role: 'img'
            };
        case ErrorSeverity.HIGH:
            return {
                color: 'red',
                icon: '🔴',
                label: 'Erro',
                ariaLabel: 'Erro crítico',
                role: 'img'
            };
        case ErrorSeverity.CRITICAL:
            return {
                color: 'darkred',
                icon: '🚨',
                label: 'Crítico',
                ariaLabel: 'Erro crítico do sistema',
                role: 'img'
            };
        default:
            return {
                color: 'gray',
                icon: '❓',
                label: 'Desconhecido',
                ariaLabel: 'Erro desconhecido',
                role: 'img'
            };
    }
}

// Enhanced error boundary compatible error object with accessibility
export function createAccessibleErrorBoundaryError(error, context = {}) {
    const friendlyError = getUserFriendlyError(error);
    const announcement = announceError(error, context);

    return {
        error,
        errorInfo: {
            componentStack: error.stack || '',
            ...friendlyError,
            announcement,
            timestamp: new Date().toISOString(),
            context
        }
    };
}
