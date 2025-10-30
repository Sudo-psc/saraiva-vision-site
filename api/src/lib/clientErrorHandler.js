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
 * A class for handling client-side errors with user-friendly feedback and recovery mechanisms.
 */
export class ClientErrorHandler {
    /**
     * Creates an instance of ClientErrorHandler.
     * @param {object} [options={}] Configuration options for the error handler.
     */
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
     * Initializes accessibility features, such as ARIA live regions.
     * @private
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
     * Handles an error with comprehensive user feedback, logging, and recovery options.
     *
     * @param {Error|object} error The error object or API error response.
     * @param {object} [options={}] Options for handling the error.
     * @returns {Promise<object>} A promise that resolves with the result of the error handling.
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
     * Parses an error from various sources into a standardized format.
     *
     * @param {Error|object} error The error to parse.
     * @returns {object} The parsed error object.
     * @private
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
     * Creates a configuration object for displaying an error to the user.
     *
     * @param {object} friendlyError The user-friendly error object.
     * @param {object} options Display options.
     * @returns {object} The display configuration object.
     * @private
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
     * Gets the title for an error based on its severity and type.
     *
     * @param {object} friendlyError The user-friendly error object.
     * @returns {string} The error title.
     * @private
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
     * Gets the available actions for an error.
     *
     * @param {object} friendlyError The user-friendly error object.
     * @param {object} options Action options.
     * @returns {Array<object>} An array of available action objects.
     * @private
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
     * Gets the styling for an error based on its severity.
     *
     * @param {string} severity The error severity.
     * @returns {object} The styling configuration object.
     * @private
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
     * Displays an error to the user.
     *
     * @param {object} displayConfig The display configuration object.
     * @returns {Promise<object>} A promise that resolves with the display result.
     * @private
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
     * Displays a toast notification for an error.
     *
     * @param {object} config The display configuration object.
     * @returns {Promise<object>} A promise that resolves with the display result.
     * @private
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
     * Displays an inline error message.
     *
     * @param {object} config The display configuration object.
     * @returns {Promise<object>} A promise that resolves with the display result.
     * @private
     */
    async displayInline(config) {
        // Implementation would update form field or component with error
        console.log('Inline Error:', config);

        return { success: true, type: 'inline' };
    }

    /**
     * Displays a modal error dialog.
     *
     * @param {object} config The display configuration object.
     * @returns {Promise<object>} A promise that resolves with the display result.
     * @private
     */
    async displayModal(config) {
        // Implementation would show modal dialog
        console.log('Modal Error:', config);

        return { success: true, type: 'modal' };
    }

    /**
     * Displays a banner error message.
     *
     * @param {object} config The display configuration object.
     * @returns {Promise<object>} A promise that resolves with the display result.
     * @private
     */
    async displayBanner(config) {
        // Implementation would show banner at top of page
        console.log('Banner Error:', config);

        return { success: true, type: 'banner' };
    }

    /**
     * Announces an error to screen readers.
     *
     * @param {object} friendlyError The user-friendly error object.
     * @param {object} context The error context.
     * @private
     */
    announceError(friendlyError, context) {
        const message = friendlyError.ariaLabel ||
            `Erro: ${friendlyError.userMessage || friendlyError.message}`;

        const priority = ['critical', 'high'].includes(friendlyError.severity) ? 'assertive' : 'polite';

        announceToScreenReader(message, priority);
    }

    /**
     * Checks if an error should be automatically retried.
     *
     * @param {object} friendlyError The user-friendly error object.
     * @param {object} context The error context.
     * @returns {boolean} `true` if the error should be retried, `false` otherwise.
     * @private
     */
    shouldAutoRetry(friendlyError, context) {
        if (!this.options.autoRetry || !friendlyError.retryable) {
            return false;
        }

        const attempts = this.retryAttempts.get(context.errorId) || 0;
        return attempts < this.options.maxRetries;
    }

    /**
     * Handles the automatic retry of a failed operation.
     *
     * @param {function(): Promise<any>} retryFunction The function to retry.
     * @param {object} friendlyError The user-friendly error object.
     * @param {object} context The error context.
     * @returns {Promise<object>} A promise that resolves with the retry result.
     * @private
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
     * Calculates the retry delay with exponential backoff and jitter.
     *
     * @param {number} attempt The current attempt number.
     * @returns {number} The calculated delay in milliseconds.
     * @private
     */
    calculateRetryDelay(attempt) {
        const baseDelay = this.options.retryDelay;
        const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
        const jitter = exponentialDelay * 0.1 * Math.random();

        return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
    }

    /**
     * Handles the manual retry of a failed operation.
     *
     * @param {function(): Promise<any>} retryFunction The function to retry.
     * @param {object} friendlyError The user-friendly error object.
     * @returns {Promise<object>} A promise that resolves with the retry result.
     * @private
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
     * Handles the "contact" action for an error.
     * @private
     */
    handleContact() {
        const contactInfo = {
            phone: '(33) 99860-1427',
            whatsapp: 'https://wa.me/message/2QFZJG3EDJZVF1',
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
     * Dismisses an error.
     *
     * @param {string} errorId The ID of the error to dismiss.
     * @private
     */
    dismissError(errorId) {
        // Implementation would remove error from UI
        console.log('Dismissing error:', errorId);

        this.retryAttempts.delete(errorId);
    }

    /**
     * Checks if an error should be automatically closed.
     *
     * @param {object} friendlyError The user-friendly error object.
     * @returns {boolean} `true` if the error should auto-close, `false` otherwise.
     * @private
     */
    shouldAutoClose(friendlyError) {
        return friendlyError.severity === 'low' || friendlyError.severity === 'medium';
    }

    /**
     * Gets a human-readable label for a form field.
     *
     * @param {string} field The name of the form field.
     * @returns {string} The human-readable label for the field.
     * @private
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
     * Handles a fallback error that occurs within the error handler itself.
     *
     * @param {Error} originalError The original error.
     * @param {object} context The error context.
     * @returns {object} The fallback error result.
     * @private
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
     * Logs an error for monitoring purposes.
     *
     * @param {object} error The error object.
     * @param {object} context The error context.
     * @private
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
     * Generates a unique ID for an error.
     *
     * @returns {string} A unique error ID.
     * @private
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
 * A convenience function for handling client-side errors using the global error handler.
 *
 * @param {Error|object} error The error to handle.
 * @param {object} [options={}] Options for handling the error.
 * @returns {Promise<object>} A promise that resolves with the result of the error handling.
 */
export async function handleClientError(error, options = {}) {
    return await globalErrorHandler.handleError(error, options);
}

/**
 * A convenience function for handling API errors using the global error handler.
 *
 * @param {object} apiResponse The API error response.
 * @param {object} [options={}] Options for handling the error.
 * @returns {Promise<object>} A promise that resolves with the result of the error handling.
 */
export async function handleApiError(apiResponse, options = {}) {
    return await globalErrorHandler.handleError(apiResponse, {
        ...options,
        source: 'api'
    });
}

/**
 * A convenience function for handling form errors using the global error handler.
 *
 * @param {object} formError The form validation error.
 * @param {object} [options={}] Options for handling the error.
 * @returns {Promise<object>} A promise that resolves with the result of the error handling.
 */
export async function handleFormError(formError, options = {}) {
    return await globalErrorHandler.handleError(formError, {
        ...options,
        source: 'form',
        displayType: ERROR_DISPLAY_TYPES.INLINE
    });
}

export default ClientErrorHandler;