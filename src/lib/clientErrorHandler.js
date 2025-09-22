/**
 * Client-Side Error Handler for Saraiva Vision
 * Provides user-friendly error messages, accessibility support, and recovery mechanisms
 * Requirements: 3.4, 4.5, 7.5, 9.5
 */

import { ErrorMessages, getUserFriendlyError, announceToScreenReader, announceError } from './errorHandling.js';

/**
 * Error display types for different UI contexts
 */
export const ERROR_DISPLAY_TYPES = {
    TOAST: 'toast',
    INLINE: 'inline',
    MODAL: 'modal',
    BANNER: 'banner'
};

/**
 * Error action types for user interaction
 */
export const ERROR_ACTIONS = {
    RETRY: 'retry',
    DISMISS: 'dismiss',
    CONTACT: 'contact',
    RELOAD: 'reload',
    NAVIGATE: 'navigate'
};

/**
 * Client-side error handler class
 */
export class ClientErrorHandler {
    constructor(options = {}) {
        this.options = {
            defaultDisplayType: ERROR_DISPLAY_TYPES.TOAST,
            autoRetry: true,
            maxRetries: 3,
            retryDelay: 1000,
            enableAccessibility: true,
            logErrors: true,
            ...options
        };

        this.retryAttempts = new Map();
        this.errorQueue = [];
        this.isProcessing = false;

        // Initialize accessibility features
        if (this.options.enableAccessibility) {
            this.initializeAccessibility();
        }
    }

    /**
     * Initialize accessibility features
     */
    initializeAccessibility() {
        // Create ARIA live region for error announcements
        if (typeof document !== 'undefined' && !document.getElementById('error-announcer')) {
            const announcer = document.createElement('div');
            announcer.id = 'error-announcer';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            announcer.style.cssText = `
                position: absolute !important;
                left: -10000px !important;
                width: 1px !important;
                height: 1px !important;
                overflow: hidden !important;
                clip: rect(1px, 1px, 1px, 1px) !important;
                white-space: nowrap !important;
            `;
            document.body.appendChild(announcer);
        }

        // Create assertive announcer for critical errors
        if (typeof document !== 'undefined' && !document.getElementById('error-announcer-assertive')) {
            const assertiveAnnouncer = document.createElement('div');
            assertiveAnnouncer.id = 'error-announcer-assertive';
            assertiveAnnouncer.setAttribute('aria-live', 'assertive');
            assertiveAnnouncer.setAttribute('aria-atomic', 'true');
            assertiveAnnouncer.className = 'sr-only';
            assertiveAnnouncer.style.cssText = `
                position: absolute !important;
                left: -10000px !important;
                width: 1px !important;
                height: 1px !important;
                overflow: hidden !important;
                clip: rect(1px, 1px, 1px, 1px) !important;
                white-space: nowrap !important;
            `;
            document.body.appendChild(assertiveAnnouncer);
        }
    }

    /**
     * Handle error with comprehensive user feedback
     * @param {Error|Object} error - Error object or API error response
     * @param {Object} options - Handling options
     * @returns {Promise<Object>} Error handling result
     */
    async handleError(error, options = {}) {
        const errorId = this.generateErrorId();
        const context = {
            errorId,
            timestamp: new Date().toISOString(),
            source: options.source || 'client',
            action: options.action || 'unknown',
            ...options.context
        };

        try {
            // Parse and classify the error
            const parsedError = this.parseError(error);
            const friendlyError = getUserFriendlyError(parsedError);

            // Log error if enabled
            if (this.options.logErrors) {
                this.logError(parsedError, context);
            }

            // Create error display configuration
            const displayConfig = this.createDisplayConfig(friendlyError, options);

            // Handle accessibility announcements
            if (this.options.enableAccessibility) {
                this.announceError(friendlyError, context);
            }

            // Display error to user
            const displayResult = await this.displayError(displayConfig);

            // Handle automatic retry if applicable
            if (this.shouldAutoRetry(friendlyError, context)) {
                const retryResult = await this.handleAutoRetry(
                    options.retryFunction,
                    friendlyError,
                    context
                );

                if (retryResult.success) {
                    return {
                        success: true,
                        errorId,
                        action: 'auto_retry_success',
                        attempts: retryResult.attempts
                    };
                }
            }

            return {
                success: false,
                errorId,
                error: friendlyError,
                displayConfig,
                displayResult,
                context
            };

        } catch (handlingError) {
            console.error('Error in error handler:', handlingError);

            // Fallback error handling
            return this.handleFallbackError(error, context);
        }
    }

    /**
     * Parse error from various sources
     * @param {Error|Object} error - Error to parse
     * @returns {Object} Parsed error object
     */
    parseError(error) {
        // API error response
        if (error && error.error && typeof error.error === 'object') {
            return {
                message: error.error.message || 'Unknown error',
                userMessage: error.error.message || 'Unknown error',
                code: error.error.code || 'UNKNOWN_ERROR',
                category: error.error.category || 'unknown',
                severity: error.error.severity || 'medium',
                recovery: error.error.recovery || 'Tente novamente.',
                retryable: error.error.retryable || false,
                field: error.error.field,
                validationErrors: error.error.validationErrors,
                ariaLabel: error.error.ariaLabel,
                fallback: error.error.fallback
            };
        }

        // Standard Error object
        if (error instanceof Error) {
            return {
                message: error.message,
                userMessage: error.message,
                name: error.name,
                code: error.code || 'UNKNOWN_ERROR',
                stack: error.stack
            };
        }

        // String error
        if (typeof error === 'string') {
            return {
                message: error,
                userMessage: error,
                code: 'UNKNOWN_ERROR'
            };
        }

        // Fallback
        return {
            message: 'An unexpected error occurred',
            userMessage: 'Ocorreu um erro inesperado.',
            code: 'UNKNOWN_ERROR'
        };
    }

    /**
     * Create display configuration for error
     * @param {Object} friendlyError - User-friendly error object
     * @param {Object} options - Display options
     * @returns {Object} Display configuration
     */
    createDisplayConfig(friendlyError, options) {
        const displayType = options.displayType || this.options.defaultDisplayType;

        const config = {
            type: displayType,
            error: friendlyError,
            title: this.getErrorTitle(friendlyError),
            message: friendlyError.userMessage || friendlyError.message,
            recovery: friendlyError.recovery,
            severity: friendlyError.severity,
            actions: this.getErrorActions(friendlyError, options),
            accessibility: {
                ariaLabel: friendlyError.ariaLabel || `Erro: ${friendlyError.userMessage || friendlyError.message}`,
                role: 'alert',
                tabIndex: -1
            },
            styling: this.getErrorStyling(friendlyError.severity),
            autoClose: this.shouldAutoClose(friendlyError),
            persistent: friendlyError.severity === 'critical' || friendlyError.severity === 'high'
        };

        // Add field-specific information for validation errors
        if (friendlyError.field) {
            config.field = friendlyError.field;
            config.fieldLabel = this.getFieldLabel(friendlyError.field);
        }

        // Add validation errors details
        if (friendlyError.validationErrors) {
            config.validationErrors = friendlyError.validationErrors;
        }

        // Add fallback information
        if (friendlyError.fallback) {
            config.fallback = friendlyError.fallback;
        }

        return config;
    }

    /**
     * Get error title based on severity and type
     * @param {Object} friendlyError - User-friendly error object
     * @returns {string} Error title
     */
    getErrorTitle(friendlyError) {
        switch (friendlyError.severity) {
            case 'critical':
                return 'Erro Crítico';
            case 'high':
                return 'Erro';
            case 'medium':
                return 'Atenção';
            case 'low':
                return 'Aviso';
            default:
                return 'Notificação';
        }
    }

    /**
     * Get available actions for error
     * @param {Object} friendlyError - User-friendly error object
     * @param {Object} options - Action options
     * @returns {Array} Array of available actions
     */
    getErrorActions(friendlyError, options) {
        const actions = [];

        // Retry action for retryable errors
        if (friendlyError.retryable && options.retryFunction) {
            actions.push({
                type: ERROR_ACTIONS.RETRY,
                label: 'Tentar Novamente',
                primary: true,
                handler: () => this.handleRetry(options.retryFunction, friendlyError)
            });
        }

        // Contact action for service errors
        if (friendlyError.category === 'external_service' ||
            friendlyError.severity === 'critical' ||
            friendlyError.severity === 'high') {
            actions.push({
                type: ERROR_ACTIONS.CONTACT,
                label: 'Entrar em Contato',
                handler: () => this.handleContact()
            });
        }

        // Reload action for system errors
        if (friendlyError.category === 'system' || friendlyError.code === 'NETWORK_ERROR') {
            actions.push({
                type: ERROR_ACTIONS.RELOAD,
                label: 'Recarregar Página',
                handler: () => window.location.reload()
            });
        }

        // Always include dismiss action
        actions.push({
            type: ERROR_ACTIONS.DISMISS,
            label: 'Fechar',
            handler: () => this.dismissError(friendlyError.errorId)
        });

        return actions;
    }

    /**
     * Get error styling based on severity
     * @param {string} severity - Error severity
     * @returns {Object} Styling configuration
     */
    getErrorStyling(severity) {
        const baseStyles = {
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        };

        switch (severity) {
            case 'critical':
                return {
                    ...baseStyles,
                    backgroundColor: '#fef2f2',
                    borderColor: '#dc2626',
                    color: '#991b1b',
                    icon: '🚨',
                    iconColor: '#dc2626'
                };
            case 'high':
                return {
                    ...baseStyles,
                    backgroundColor: '#fef2f2',
                    borderColor: '#ef4444',
                    color: '#b91c1c',
                    icon: '❌',
                    iconColor: '#ef4444'
                };
            case 'medium':
                return {
                    ...baseStyles,
                    backgroundColor: '#fffbeb',
                    borderColor: '#f59e0b',
                    color: '#92400e',
                    icon: '⚠️',
                    iconColor: '#f59e0b'
                };
            case 'low':
                return {
                    ...baseStyles,
                    backgroundColor: '#f0f9ff',
                    borderColor: '#3b82f6',
                    color: '#1e40af',
                    icon: 'ℹ️',
                    iconColor: '#3b82f6'
                };
            default:
                return {
                    ...baseStyles,
                    backgroundColor: '#f9fafb',
                    borderColor: '#6b7280',
                    color: '#374151',
                    icon: '📝',
                    iconColor: '#6b7280'
                };
        }
    }

    /**
     * Display error to user
     * @param {Object} displayConfig - Display configuration
     * @returns {Promise<Object>} Display result
     */
    async displayError(displayConfig) {
        try {
            switch (displayConfig.type) {
                case ERROR_DISPLAY_TYPES.TOAST:
                    return await this.displayToast(displayConfig);
                case ERROR_DISPLAY_TYPES.INLINE:
                    return await this.displayInline(displayConfig);
                case ERROR_DISPLAY_TYPES.MODAL:
                    return await this.displayModal(displayConfig);
                case ERROR_DISPLAY_TYPES.BANNER:
                    return await this.displayBanner(displayConfig);
                default:
                    return await this.displayToast(displayConfig);
            }
        } catch (displayError) {
            console.error('Error displaying error:', displayError);
            return { success: false, error: displayError };
        }
    }

    /**
     * Display toast notification
     * @param {Object} config - Display configuration
     * @returns {Promise<Object>} Display result
     */
    async displayToast(config) {
        // Implementation would integrate with toast library or custom toast system
        console.log('Toast Error:', config);

        // Simulate toast display
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, type: 'toast', duration: 5000 });
            }, 100);
        });
    }

    /**
     * Display inline error message
     * @param {Object} config - Display configuration
     * @returns {Promise<Object>} Display result
     */
    async displayInline(config) {
        // Implementation would update form field or component with error
        console.log('Inline Error:', config);

        return { success: true, type: 'inline' };
    }

    /**
     * Display modal error dialog
     * @param {Object} config - Display configuration
     * @returns {Promise<Object>} Display result
     */
    async displayModal(config) {
        // Implementation would show modal dialog
        console.log('Modal Error:', config);

        return { success: true, type: 'modal' };
    }

    /**
     * Display banner error message
     * @param {Object} config - Display configuration
     * @returns {Promise<Object>} Display result
     */
    async displayBanner(config) {
        // Implementation would show banner at top of page
        console.log('Banner Error:', config);

        return { success: true, type: 'banner' };
    }

    /**
     * Announce error to screen readers
     * @param {Object} friendlyError - User-friendly error object
     * @param {Object} context - Error context
     */
    announceError(friendlyError, context) {
        const message = friendlyError.ariaLabel ||
            `Erro: ${friendlyError.userMessage || friendlyError.message}`;

        const priority = ['critical', 'high'].includes(friendlyError.severity) ? 'assertive' : 'polite';

        announceToScreenReader(message, priority);
    }

    /**
     * Check if error should auto-retry
     * @param {Object} friendlyError - User-friendly error object
     * @param {Object} context - Error context
     * @returns {boolean} Whether to auto-retry
     */
    shouldAutoRetry(friendlyError, context) {
        if (!this.options.autoRetry || !friendlyError.retryable) {
            return false;
        }

        const attempts = this.retryAttempts.get(context.errorId) || 0;
        return attempts < this.options.maxRetries;
    }

    /**
     * Handle automatic retry
     * @param {Function} retryFunction - Function to retry
     * @param {Object} friendlyError - User-friendly error object
     * @param {Object} context - Error context
     * @returns {Promise<Object>} Retry result
     */
    async handleAutoRetry(retryFunction, friendlyError, context) {
        if (!retryFunction) {
            return { success: false, reason: 'No retry function provided' };
        }

        const attempts = this.retryAttempts.get(context.errorId) || 0;
        const newAttempts = attempts + 1;

        this.retryAttempts.set(context.errorId, newAttempts);

        // Calculate delay
        const delay = this.calculateRetryDelay(newAttempts);

        // Announce retry to screen readers
        if (this.options.enableAccessibility) {
            announceToScreenReader(
                `Tentativa ${newAttempts} de ${this.options.maxRetries}. ` +
                `Tentando novamente em ${Math.ceil(delay / 1000)} segundos.`,
                'polite'
            );
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));

        try {
            const result = await retryFunction();

            // Success - announce and clean up
            if (this.options.enableAccessibility) {
                announceToScreenReader(
                    `Sucesso na tentativa ${newAttempts}. Operação concluída.`,
                    'polite'
                );
            }

            this.retryAttempts.delete(context.errorId);

            return { success: true, attempts: newAttempts, result };
        } catch (retryError) {
            // Retry failed
            if (newAttempts >= this.options.maxRetries) {
                this.retryAttempts.delete(context.errorId);

                if (this.options.enableAccessibility) {
                    announceToScreenReader(
                        `Todas as tentativas falharam. Entre em contato conosco se necessário.`,
                        'assertive'
                    );
                }
            }

            return { success: false, attempts: newAttempts, error: retryError };
        }
    }

    /**
     * Calculate retry delay with exponential backoff
     * @param {number} attempt - Attempt number
     * @returns {number} Delay in milliseconds
     */
    calculateRetryDelay(attempt) {
        const baseDelay = this.options.retryDelay;
        const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
        const jitter = exponentialDelay * 0.1 * Math.random();

        return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
    }

    /**
     * Handle manual retry
     * @param {Function} retryFunction - Function to retry
     * @param {Object} friendlyError - User-friendly error object
     * @returns {Promise<Object>} Retry result
     */
    async handleRetry(retryFunction, friendlyError) {
        try {
            const result = await retryFunction();

            if (this.options.enableAccessibility) {
                announceToScreenReader('Operação realizada com sucesso.', 'polite');
            }

            return { success: true, result };
        } catch (error) {
            // Handle retry error
            return await this.handleError(error, {
                source: 'retry',
                action: 'manual_retry',
                retryFunction
            });
        }
    }

    /**
     * Handle contact action
     */
    handleContact() {
        const contactInfo = {
            phone: '(33) 99860-1427',
            whatsapp: 'https://wa.me/5533998601427',
            email: 'contato@saraivavision.com.br'
        };

        // Implementation would show contact modal or redirect
        console.log('Contact Info:', contactInfo);

        if (this.options.enableAccessibility) {
            announceToScreenReader(
                'Informações de contato: Telefone (33) 99860-1427, WhatsApp disponível.',
                'polite'
            );
        }
    }

    /**
     * Dismiss error
     * @param {string} errorId - Error ID to dismiss
     */
    dismissError(errorId) {
        // Implementation would remove error from UI
        console.log('Dismissing error:', errorId);

        this.retryAttempts.delete(errorId);
    }

    /**
     * Check if error should auto-close
     * @param {Object} friendlyError - User-friendly error object
     * @returns {boolean} Whether error should auto-close
     */
    shouldAutoClose(friendlyError) {
        return friendlyError.severity === 'low' || friendlyError.severity === 'medium';
    }

    /**
     * Get field label for validation errors
     * @param {string} field - Field name
     * @returns {string} Human-readable field label
     */
    getFieldLabel(field) {
        const labels = {
            name: 'Nome',
            email: 'Email',
            phone: 'Telefone',
            message: 'Mensagem',
            consent: 'Consentimento',
            appointment_date: 'Data do Agendamento',
            appointment_time: 'Horário do Agendamento'
        };

        return labels[field] || field;
    }

    /**
     * Handle fallback error when error handler fails
     * @param {Error} originalError - Original error
     * @param {Object} context - Error context
     * @returns {Object} Fallback error result
     */
    handleFallbackError(originalError, context) {
        const fallbackMessage = 'Ocorreu um erro inesperado. Tente novamente ou entre em contato conosco.';

        console.error('Fallback error handling:', originalError);

        if (this.options.enableAccessibility) {
            announceToScreenReader(fallbackMessage, 'assertive');
        }

        return {
            success: false,
            errorId: context.errorId,
            error: {
                message: fallbackMessage,
                severity: 'high',
                retryable: true
            },
            fallback: true
        };
    }

    /**
     * Log error for monitoring
     * @param {Object} error - Error object
     * @param {Object} context - Error context
     */
    logError(error, context) {
        const logEntry = {
            timestamp: context.timestamp,
            errorId: context.errorId,
            source: context.source,
            action: context.action,
            message: error.message,
            code: error.code,
            severity: error.severity,
            userAgent: navigator.userAgent,
            url: window.location.href,
            context
        };

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.group(`🚨 Client Error [${error.severity}]`);
            console.error('Error:', error);
            console.error('Context:', context);
            console.groupEnd();
        }

        // Here you could send to external error tracking service
        // Example: Sentry, LogRocket, etc.
    }

    /**
     * Generate unique error ID
     * @returns {string} Unique error ID
     */
    generateErrorId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        return `err_${timestamp}_${random}`;
    }
}

/**
 * Create global error handler instance
 */
export const globalErrorHandler = new ClientErrorHandler({
    enableAccessibility: true,
    autoRetry: true,
    maxRetries: 3,
    logErrors: true
});

/**
 * Convenience function for handling errors
 * @param {Error|Object} error - Error to handle
 * @param {Object} options - Handling options
 * @returns {Promise<Object>} Error handling result
 */
export async function handleClientError(error, options = {}) {
    return await globalErrorHandler.handleError(error, options);
}

/**
 * Convenience function for handling API errors
 * @param {Object} apiResponse - API error response
 * @param {Object} options - Handling options
 * @returns {Promise<Object>} Error handling result
 */
export async function handleApiError(apiResponse, options = {}) {
    return await globalErrorHandler.handleError(apiResponse, {
        ...options,
        source: 'api'
    });
}

/**
 * Convenience function for handling form errors
 * @param {Object} formError - Form validation error
 * @param {Object} options - Handling options
 * @returns {Promise<Object>} Error handling result
 */
export async function handleFormError(formError, options = {}) {
    return await globalErrorHandler.handleError(formError, {
        ...options,
        source: 'form',
        displayType: ERROR_DISPLAY_TYPES.INLINE
    });
}

export default ClientErrorHandler;