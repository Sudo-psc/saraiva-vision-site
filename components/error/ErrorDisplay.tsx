/**
 * Error Display Component for Saraiva Vision - Next.js 15
 * Provides accessible error messages with recovery guidance
 * WCAG AAA compliant with full TypeScript support
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { AppError, ErrorDisplayProps } from '@/types/error';
import { ErrorSeverity } from '@/types/error';
import { announceToScreenReader } from '@/lib/errorHandling';

/**
 * Get human-readable field label
 */
function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    name: 'Nome',
    email: 'Email',
    phone: 'Telefone',
    message: 'Mensagem',
    consent: 'Consentimento',
    appointment_date: 'Data do Agendamento',
    appointment_time: 'Horário do Agendamento',
  };

  return labels[field] || field;
}

/**
 * Error Display Component
 */
export function ErrorDisplay({
  error,
  type = 'inline',
  onRetry,
  onDismiss,
  onContact,
  showRecovery = true,
  autoFocus = false,
  className = '',
}: ErrorDisplayProps) {
  const errorRef = useRef<HTMLDivElement>(null);
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
      const priority = [ErrorSeverity.CRITICAL, ErrorSeverity.HIGH].includes(error.severity)
        ? 'assertive'
        : 'polite';

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
      const whatsapp = `https://wa.me/5533998601427?text=Olá, preciso de ajuda com um problema no site.`;

      if (
        window.confirm(
          `Deseja entrar em contato conosco?\n\nTelefone: ${phone}\nOu clique OK para abrir o WhatsApp.`
        )
      ) {
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
      case ErrorSeverity.CRITICAL:
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case ErrorSeverity.HIGH:
        return `${baseStyles} bg-red-50 border-red-400 text-red-700`;
      case ErrorSeverity.MEDIUM:
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      case ErrorSeverity.LOW:
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-700`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-400 text-gray-700`;
    }
  };

  // Get icon based on error severity
  const getSeverityIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return '🚨';
      case ErrorSeverity.HIGH:
        return '❌';
      case ErrorSeverity.MEDIUM:
        return '⚠️';
      case ErrorSeverity.LOW:
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  // Get error title
  const getErrorTitle = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return 'Erro Crítico';
      case ErrorSeverity.HIGH:
        return 'Erro';
      case ErrorSeverity.MEDIUM:
        return 'Atenção';
      case ErrorSeverity.LOW:
        return 'Aviso';
      default:
        return 'Notificação';
    }
  };

  // Render content
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
        <h3 className="text-sm font-medium mb-1">{getErrorTitle()}</h3>

        <div className="text-sm mb-3">
          <p>{error.userMessage || error.message}</p>

          {/* Field-specific error for validation */}
          {error.field && (
            <p className="mt-1 text-xs">
              <strong>Campo:</strong> {getFieldLabel(error.field)}
            </p>
          )}

          {/* Validation errors details */}
          {'validationErrors' in error && error.validationErrors && error.validationErrors.length > 0 && (
            <ul className="mt-2 text-xs list-disc list-inside">
              {error.validationErrors.map((validationError, index) => (
                <li key={index}>{validationError.message}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Recovery guidance */}
        {showRecovery && error.recovery && (
          <div className="text-xs mb-3 p-2 bg-white bg-opacity-50 rounded">
            <p>
              <strong>Como resolver:</strong>
            </p>
            <p>{error.recovery}</p>
          </div>
        )}

        {/* Fallback information */}
        {'fallback' in error && error.fallback && (
          <div className="text-xs mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
            <p>
              <strong>Alternativa:</strong> {error.fallback.message}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Retry button */}
          {error.retryable && onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-describedby={`error-${error.code}-description`}
            >
              {isRetrying ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Tentando...
                </>
              ) : (
                'Tentar Novamente'
              )}
            </button>
          )}

          {/* Contact button for critical/service errors */}
          {([ErrorSeverity.CRITICAL, ErrorSeverity.HIGH].includes(error.severity) ||
            error.category === 'external_service') && (
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
      {error.severity !== ErrorSeverity.CRITICAL && (
        <div className="ml-auto pl-3">
          <button
            onClick={handleDismiss}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Fechar"
          >
            <span className="sr-only">Fechar</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
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
          aria-live={
            [ErrorSeverity.CRITICAL, ErrorSeverity.HIGH].includes(error.severity)
              ? 'assertive'
              : 'polite'
          }
          aria-atomic="true"
          tabIndex={autoFocus ? -1 : undefined}
          id={`error-${error.code}-description`}
        >
          {renderContent()}
        </div>
      );

    case 'modal':
      return (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

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
          aria-live={
            [ErrorSeverity.CRITICAL, ErrorSeverity.HIGH].includes(error.severity)
              ? 'assertive'
              : 'polite'
          }
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
          aria-live={
            [ErrorSeverity.CRITICAL, ErrorSeverity.HIGH].includes(error.severity)
              ? 'assertive'
              : 'polite'
          }
          aria-atomic="true"
          tabIndex={autoFocus ? -1 : undefined}
          id={`error-${error.code}-description`}
        >
          {renderContent()}
        </div>
      );
  }
}

export default ErrorDisplay;
