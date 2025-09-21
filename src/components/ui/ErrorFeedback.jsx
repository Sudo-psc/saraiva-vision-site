import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff, Shield, Mail, Phone, X } from 'lucide-react';
import { getUserFriendlyError, getRecoverySteps, getSeverityIndicator, isRecoverable } from '@/lib/errorHandling';

const ErrorFeedback = ({
    error,
    onRetry,
    onDismiss,
    className = '',
    showRecoverySteps = true,
    showContactInfo = true,
    compact = false
}) => {
    if (!error) return null;

    const friendlyError = getUserFriendlyError(error);
    const recoverySteps = getRecoverySteps(error);
    const severityIndicator = getSeverityIndicator(friendlyError.severity);
    const canRecover = isRecoverable(error);
    const canRetry = onRetry && canRecover;

    if (compact) {
        return (
            <div className={`p-3 rounded-lg border ${className}`} style={{
                backgroundColor: `${severityIndicator.color}10`,
                borderColor: `${severityIndicator.color}30`
            }}>
                <div className="flex items-start gap-2">
                    <span className="text-lg">{severityIndicator.icon}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                            {friendlyError.userMessage}
                        </p>
                        {canRetry && (
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
    }

    return (
        <div className={`p-4 rounded-lg border ${className}`} style={{
            backgroundColor: `${severityIndicator.color}10`,
            borderColor: `${severityIndicator.color}30`
        }}>
            {/* Error Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0">
                    <span className="text-2xl">{severityIndicator.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-semibold text-gray-800">
                            {severityIndicator.label}
                        </h4>
                        {friendlyError.field && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                Campo: {friendlyError.field}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-700">
                        {friendlyError.userMessage}
                    </p>
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
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <RefreshCw size={16} />
                        Tentar novamente
                    </button>
                )}

                {friendlyError.type === 'network' && (
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
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
