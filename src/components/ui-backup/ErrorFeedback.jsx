import React, { useEffect, useRef } from 'react';
import { AlertTriangle, RefreshCw, WifiOff, Shield, Mail, Phone, X, Loader2 } from 'lucide-react';
import {
    getUserFriendlyError,
    getRecoverySteps,
    getSeverityIndicator,
    isRecoverable,
    announceError,
    getRetryConfig
} from '@/lib/errorHandling';

const ErrorFeedback = ({
    error,
    onRetry,
    onDismiss,
    className = '',
    showRecoverySteps = true,
    showContactInfo = true,
    compact = false,
    retryAttempt = 0,
    maxRetries = 3,
    isRetrying = false,
    autoAnnounce = true
}) => {
    const errorRef = useRef(null);
    const previousError = useRef(null);

    if (!error) return null;

    const friendlyError = getUserFriendlyError(error);
    const recoverySteps = getRecoverySteps(error);
    const severityIndicator = getSeverityIndicator(friendlyError.severity);
    const canRecover = isRecoverable(error);
    const retryConfig = getRetryConfig(error);
    const canRetry = onRetry && canRecover && retryConfig && retryAttempt < maxRetries;

    // Announce error to screen readers when error changes
    useEffect(() => {
        if (autoAnnounce && error && error !== previousError.current) {
            announceError(error, {
                action: 'Erro no formulário',
                retryAttempt: retryAttempt > 0 ? retryAttempt : undefined
            });
            previousError.current = error;
        }
    }, [error, autoAnnounce, retryAttempt]);

    // Focus management for accessibility
    useEffect(() => {
        if (errorRef.current && !compact) {
            errorRef.current.focus();
        }
    }, [error, compact]);

    if (compact) {
        return (
            <div
                ref={errorRef}
                className={`p-3 rounded-lg border ${className}`}
                style={{
                    backgroundColor: `${severityIndicator.color}10`,
                    borderColor: `${severityIndicator.color}30`
                }}
                role="alert"
                aria-live="polite"
                aria-labelledby="error-message"
                tabIndex={-1}
            >
                <div className="flex items-start gap-2">
                    <span
                        className="text-lg"
                        role={severityIndicator.role}
                        aria-label={severityIndicator.ariaLabel}
                    >
                        {severityIndicator.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                        <p id="error-message" className="text-sm font-medium text-gray-800">
                            {friendlyError.userMessage}
                        </p>
                        {retryAttempt > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                                Tentativa {retryAttempt} de {maxRetries}
                            </p>
                        )}
                        {canRetry && (
                            <button
                                onClick={onRetry}
                                disabled={isRetrying}
                                className="mt-1 text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center gap-1"
                                aria-describedby="retry-description"
                            >
                                {isRetrying ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <RefreshCw size={12} />
                                )}
                                {isRetrying ? 'Tentando...' : 'Tentar novamente'}
                            </button>
                        )}
                        {canRetry && (
                            <span id="retry-description" className="sr-only">
                                Clique para tentar enviar o formulário novamente
                            </span>
                        )}
                    </div>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="text-gray-400 hover:text-gray-600 p-0.5"
                            aria-label="Fechar mensagem de erro"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={errorRef}
            className={`p-4 rounded-lg border ${className}`}
            style={{
                backgroundColor: `${severityIndicator.color}10`,
                borderColor: `${severityIndicator.color}30`
            }}
            role="alert"
            aria-live="assertive"
            aria-labelledby="error-title"
            aria-describedby="error-description"
            tabIndex={-1}
        >
            {/* Error Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0">
                    <span
                        className="text-2xl"
                        role={severityIndicator.role}
                        aria-label={severityIndicator.ariaLabel}
                    >
                        {severityIndicator.icon}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 id="error-title" className="text-lg font-semibold text-gray-800">
                            {severityIndicator.label}
                        </h4>
                        {friendlyError.field && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                Campo: {friendlyError.field}
                            </span>
                        )}
                        {retryAttempt > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                                Tentativa {retryAttempt}/{maxRetries}
                            </span>
                        )}
                    </div>
                    <p id="error-description" className="text-gray-700">
                        {friendlyError.userMessage}
                    </p>
                    {friendlyError.ariaLabel && (
                        <span className="sr-only">{friendlyError.ariaLabel}</span>
                    )}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        aria-label="Fechar mensagem de erro"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Recovery Steps */}
            {showRecoverySteps && recoverySteps.length > 0 && (
                <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <AlertTriangle size={14} />
                        O que você pode fazer:
                    </h5>
                    <ul className="space-y-1">
                        {recoverySteps.map((step, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-gray-400 mt-0.5">•</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
                {canRetry && (
                    <button
                        onClick={onRetry}
                        disabled={isRetrying}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        aria-describedby="retry-info"
                    >
                        {isRetrying ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <RefreshCw size={16} />
                        )}
                        {isRetrying ? 'Tentando...' : 'Tentar novamente'}
                    </button>
                )}

                {canRetry && (
                    <div id="retry-info" className="sr-only">
                        {retryConfig ?
                            `Tentativa ${retryAttempt + 1} de ${maxRetries}. ${retryConfig.maxAttempts - retryAttempt - 1} tentativas restantes.` :
                            'Clique para tentar novamente'
                        }
                    </div>
                )}

                {friendlyError.type === 'network' && (
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                        aria-label="Recarregar a página para tentar resolver problemas de conexão"
                    >
                        <WifiOff size={16} />
                        Recarregar página
                    </button>
                )}
            </div>

            {/* Contact Information */}
            {showContactInfo && (
                <div className="border-t pt-3">
                    <p className="text-sm text-gray-600 mb-2">
                        Se o problema persistir, entre em contato diretamente:
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="tel:+5533998601427"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            <Phone size={16} />
                            +55 33 99860-1427
                        </a>
                        <a
                            href="mailto:saraivavision@gmail.com"
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            <Mail size={16} />
                            saraivavision@gmail.com
                        </a>
                    </div>
                </div>
            )}

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-xs">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                        Detalhes técnicos (dev only)
                    </summary>
                    <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-gray-600 overflow-x-auto">
                        <div>Tipo: {friendlyError.type}</div>
                        <div>Código: {friendlyError.code}</div>
                        <div>Severidade: {friendlyError.severity}</div>
                        {error.message && <div>Mensagem: {error.message}</div>}
                        {error.stack && <div>Stack: {error.stack}</div>}
                    </div>
                </details>
            )}
        </div>
    );
};

// Specialized error components for common scenarios
export const NetworkError = ({ onRetry, onDismiss, className }) => (
    <ErrorFeedback
        error={{ name: 'NetworkError' }}
        onRetry={onRetry}
        onDismiss={onDismiss}
        className={className}
        showContactInfo={true}
    />
);

export const RateLimitError = ({ onRetry, onDismiss, className }) => (
    <ErrorFeedback
        error={{ error: 'rate_limited' }}
        onRetry={onRetry}
        onDismiss={onDismiss}
        className={className}
        showContactInfo={true}
    />
);

export const RecaptchaError = ({ onRetry, onDismiss, className }) => (
    <ErrorFeedback
        error={{ error: 'recaptcha_failed' }}
        onRetry={onRetry}
        onDismiss={onDismiss}
        className={className}
        showContactInfo={true}
    />
);

export const EmailServiceError = ({ onRetry, onDismiss, className }) => (
    <ErrorFeedback
        error={{ error: 'email_service_error' }}
        onRetry={onRetry}
        onDismiss={onDismiss}
        className={className}
        showContactInfo={true}
    />
);

// Toast-friendly error component
export const ErrorToast = ({ error, onRetry, onDismiss }) => {
    const friendlyError = getUserFriendlyError(error);
    const severityIndicator = getSeverityIndicator(friendlyError.severity);

    return (
        <div className="p-3 rounded-lg shadow-lg max-w-sm" style={{
            backgroundColor: `${severityIndicator.color}10`,
            border: `1px solid ${severityIndicator.color}30`
        }}>
            <div className="flex items-start gap-2">
                <span className="text-lg">{severityIndicator.icon}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                        {friendlyError.userMessage}
                    </p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-1 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            <RefreshCw size={12} />
                            Tentar novamente
                        </button>
                    )}
                </div>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-gray-400 hover:text-gray-600 p-0.5"
                        aria-label="Fechar"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorFeedback;
