/**
 * Error Display Component for Saraiva Vision
 * Provides accessible error messages with recovery guidance
 * Requirements: 3.4, 4.5, 7.5, 9.5
 */

import React, { useEffect, useRef, useState } from 'react';
import { announceToScreenReader } from '../lib/errorHandling.js';

/**
 * Error Display Component
 * @param {Object} props - Component props
 * @param {Object} props.error - Error object to display
 * @param {string} props.type - Display type (toast, inline, modal, banner)
 * @param {Function} props.onRetry - Retry function
 * @param {Function} props.onDismiss - Dismiss function
 * @param {Function} props.onContact - Contact function
 * @param {boolean} props.showRecovery - Whether to show recovery steps
 * @param {boolean} props.autoFocus - Whether to auto-focus the error
 * @param {string} props.className - Additional CSS classes
 */
export function ErrorDisplay({
    error,
    type = 'inline',
    onRetry,
    onDismiss,
    onContact,
    showRecovery = true,
    autoFocus = false,
    className = ''
}) {
    const errorRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isRetrying, setIsRetrying] = useState(false);

    // Auto-focus error for accessibility
    useEffect(() => {
        if (autoFocus && errorRef.current && isVisible) {
            errorRef.current.focus();
        }
    }, [autoFocus, isVisible]);

    // Announce error to screen readers
    useEffect(() => {
        if (error && isVisible) {
            const message = error.ariaLabel || `Erro: ${error.userMessage || error.message}`;
            const priority = ['critical', 'high'].includes(error.severity) ? 'assertive' : 'polite';

            // Delay announcement to ensure component is rendered
            setTimeout(() => {
                announceToScreenReader(message, priority);
            }, 100);
        }
    }, [error, isVisible]);

    // Handle retry with loading state
    const handleRetry = async () => {
        if (!onRetry || isRetrying) return;

        setIsRetrying(true);

        try {
            await onRetry();

            // Announce success
            announceToScreenReader('Operação realizada com sucesso.', 'polite');

            // Auto-dismiss on successful retry
            if (onDismiss) {
                setTimeout(() => onDismiss(), 1000);
            }
        } catch (retryError) {
            // Announce retry failure
            announceToScreenReader('Tentativa falhou. Tente novamente.', 'assertive');
        } finally {
            setIsRetrying(false);
        }
    };

    // Handle dismiss
    const handleDismiss = () => {
        setIsVisible(false);
        if (onDismiss) {
            onDismiss();
        }
    };

    // Handle contact
    const handleContact = () => {
        if (onContact) {
            onContact();
        } else {
            // Default contact behavior
            const phone = '(33) 99860-1427';
            const whatsapp = `https://wa.me/message/2QFZJG3EDJZVF1?text=Olá, preciso de ajuda com um problema no site.`;

            if (window.confirm(`Deseja entrar em contato conosco?\n\nTelefone: ${phone}\nOu clique OK para abrir o WhatsApp.`)) {
                window.open(whatsapp, '_blank');
            }
        }
    };

    if (!error || !isVisible) {
        return null;
    }

    // Get styling based on error severity
    const getSeverityStyles = () => {
        const baseStyles = 'border-l-4 p-4 rounded-r-lg shadow-sm';

        switch (error.severity) {
            case 'critical':
                return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
            case 'high':
                return `${baseStyles} bg-red-50 border-red-400 text-red-700`;
            case 'medium':
                return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
            case 'low':
                return `${baseStyles} bg-blue-50 border-blue-400 text-cyan-700`;
            default:
                return `${baseStyles} bg-gray-50 border-gray-400 text-gray-700`;
        }
    };

    // Get icon based on error severity
    const getSeverityIcon = () => {
        switch (error.severity) {
            case 'critical':
                return '🚨';
            case 'high':
                return '❌';
            case 'medium':
                return '⚠️';
            case 'low':
                return 'ℹ️';
            default:
                return '📝';
        }
    };

    // Get error title
    const getErrorTitle = () => {
        switch (error.severity) {
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
    };

    // Render different types
    const renderContent = () => (
        <div className="flex items-start">
            <div className="flex-shrink-0">
                <span
                    className="text-xl"
                    role="img"
                    aria-label={`Ícone de ${getErrorTitle().toLowerCase()}`}
                >
                    {getSeverityIcon()}
                </span>
            </div>

            <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium mb-1">
                    {getErrorTitle()}
                </h3>

                <div className="text-sm mb-3">
                    <p>{error.userMessage || error.message}</p>

                    {/* Field-specific error for validation */}
                    {error.field && (
                        <p className="mt-1 text-xs">
                            <strong>Campo:</strong> {getFieldLabel(error.field)}
                        </p>
                    )}

                    {/* Validation errors details */}
                    {error.validationErrors && error.validationErrors.length > 0 && (
                        <ul className="mt-2 text-xs list-disc list-inside">
                            {error.validationErrors.map((validationError, index) => (
                                <li key={index}>
                                    {validationError.message}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recovery guidance */}
                {showRecovery && error.recovery && (
                    <div className="text-xs mb-3 p-2 bg-white bg-opacity-50 rounded">
                        <p><strong>Como resolver:</strong></p>
                        <p>{error.recovery}</p>
                    </div>
                )}

                {/* Fallback information */}
                {error.fallback && (
                    <div className="text-xs mb-3 p-2 bg-blue-50 border border-cyan-200 rounded">
                        <p><strong>Alternativa:</strong> {error.fallback.message}</p>
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                    {/* Retry button */}
                    {error.retryable && onRetry && (
                        <button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-describedby={`error-${error.code}-description`}
                        >
                            {isRetrying ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Tentando...
                                </>
                            ) : (
                                'Tentar Novamente'
                            )}
                        </button>
                    )}

                    {/* Contact button for critical/service errors */}
                    {(['critical', 'high'].includes(error.severity) || error.category === 'external_service') && (
                        <button
                            onClick={handleContact}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Entrar em Contato
                        </button>
                    )}

                    {/* Dismiss button */}
                    <button
                        onClick={handleDismiss}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        aria-label="Fechar notificação de erro"
                    >
                        Fechar
                    </button>
                </div>
            </div>

            {/* Close button for persistent errors */}
            {!['critical'].includes(error.severity) && (
                <div className="ml-auto pl-3">
                    <button
                        onClick={handleDismiss}
                        className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        aria-label="Fechar"
                    >
                        <span className="sr-only">Fechar</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );

    // Render based on type
    switch (type) {
        case 'toast':
            return (
                <div
                    ref={errorRef}
                    className={`fixed top-4 right-4 max-w-sm w-full z-50 ${getSeverityStyles()} ${className}`}
                    role="alert"
                    aria-live={['critical', 'high'].includes(error.severity) ? 'assertive' : 'polite'}
                    aria-atomic="true"
                    tabIndex={autoFocus ? -1 : undefined}
                    id={`error-${error.code}-description`}
                >
                    {renderContent()}
                </div>
            );

        case 'modal':
            return (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div
                            ref={errorRef}
                            className={`inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 ${className}`}
                            tabIndex={-1}
                        >
                            {renderContent()}
                        </div>
                    </div>
                </div>
            );

        case 'banner':
            return (
                <div
                    ref={errorRef}
                    className={`w-full ${getSeverityStyles()} ${className}`}
                    role="alert"
                    aria-live={['critical', 'high'].includes(error.severity) ? 'assertive' : 'polite'}
                    aria-atomic="true"
                    tabIndex={autoFocus ? -1 : undefined}
                    id={`error-${error.code}-description`}
                >
                    {renderContent()}
                </div>
            );

        case 'inline':
        default:
            return (
                <div
                    ref={errorRef}
                    className={`${getSeverityStyles()} ${className}`}
                    role="alert"
                    aria-live={['critical', 'high'].includes(error.severity) ? 'assertive' : 'polite'}
                    aria-atomic="true"
                    tabIndex={autoFocus ? -1 : undefined}
                    id={`error-${error.code}-description`}
                >
                    {renderContent()}
                </div>
            );
    }
}

/**
 * Get human-readable field label
 * @param {string} field - Field name
 * @returns {string} Field label
 */
function getFieldLabel(field) {
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
 * Error Boundary Component for catching React errors
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log error
        console.error('Error Boundary caught an error:', error, errorInfo);

        // Announce to screen readers
        announceToScreenReader(
            'Ocorreu um erro na aplicação. A página será recarregada automaticamente.',
            'assertive'
        );
    }

    render() {
        if (this.state.hasError) {
            return (
                <ErrorDisplay
                    error={{
                        code: 'REACT_ERROR',
                        message: 'Ocorreu um erro inesperado na aplicação.',
                        userMessage: 'Ocorreu um erro inesperado. A página será recarregada.',
                        severity: 'high',
                        recovery: 'Recarregue a página ou tente novamente mais tarde.',
                        retryable: true,
                        ariaLabel: 'Erro na aplicação: erro inesperado ocorreu'
                    }}
                    type="banner"
                    onRetry={() => window.location.reload()}
                    showRecovery={true}
                    autoFocus={true}
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Hook for using error display in functional components
 * @returns {Object} Error display utilities
 */
export function useErrorDisplay() {
    const [errors, setErrors] = useState([]);

    const showError = (error, options = {}) => {
        const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const errorWithId = { ...error, id: errorId };

        setErrors(prev => [...prev, errorWithId]);

        // Auto-remove after timeout for non-critical errors
        if (!['critical', 'high'].includes(error.severity)) {
            setTimeout(() => {
                removeError(errorId);
            }, options.timeout || 5000);
        }

        return errorId;
    };

    const removeError = (errorId) => {
        setErrors(prev => prev.filter(error => error.id !== errorId));
    };

    const clearAllErrors = () => {
        setErrors([]);
    };

    return {
        errors,
        showError,
        removeError,
        clearAllErrors
    };
}

export default ErrorDisplay;