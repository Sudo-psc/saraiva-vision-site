/**
 * ConfirmDialog Component - WCAG 3.3.6 Error Prevention (AAA)
 * Prevents critical errors through confirmation dialogs
 * Designed for senior users with clear language and large buttons
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { requiresErrorPrevention, type ErrorPreventionOptions } from '@/lib/a11y/wcag-aaa';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: 'normal' | 'warning' | 'danger';
  children?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  severity = 'normal',
  children
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Check if this action requires error prevention
  const errorPrevention = requiresErrorPrevention(action);

  // Focus management - WCAG 2.4.3
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus confirm button (dangerous action) or cancel button (safe default)
      setTimeout(() => {
        if (severity === 'danger') {
          // For dangerous actions, focus cancel button first
          const cancelButton = dialogRef.current?.querySelector(
            '[data-action="cancel"]'
          ) as HTMLButtonElement;
          cancelButton?.focus();
        } else {
          confirmButtonRef.current?.focus();
        }
      }, 100);
    } else {
      // Restore previous focus when dialog closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen, severity]);

  // Keyboard navigation - WCAG 2.1.1
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key closes dialog
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Tab key traps focus inside dialog
      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Severity styling
  const severityClasses = {
    normal: 'dialog-normal',
    warning: 'dialog-warning',
    danger: 'dialog-danger'
  };

  const iconMap = {
    normal: 'ℹ️',
    warning: '⚠️',
    danger: '🚨'
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="dialog-backdrop"
        onClick={onClose}
        aria-hidden="true"
        data-testid="dialog-backdrop"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`confirm-dialog ${severityClasses[severity]}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <div className="dialog-content">
          {/* Icon */}
          <div className="dialog-icon" aria-hidden="true">
            {iconMap[severity]}
          </div>

          {/* Header */}
          <header className="dialog-header">
            <h2 id="dialog-title" className="dialog-title">
              {title}
            </h2>
          </header>

          {/* Message */}
          <div id="dialog-message" className="dialog-message">
            <p>{message}</p>
            {children}
          </div>

          {/* Error Prevention Notice */}
          {errorPrevention && errorPrevention.confirmationRequired && (
            <div className="dialog-notice" role="status">
              <span className="notice-icon" aria-hidden="true">
                ⚠️
              </span>
              <span className="notice-text">
                Esta ação é importante e não pode ser desfeita. Por favor, confirme sua escolha.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="dialog-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-dialog btn-cancel"
              data-action="cancel"
              aria-label={`${cancelText}. Pressione para voltar sem fazer alterações`}
            >
              <span className="btn-icon" aria-hidden="true">
                ✕
              </span>
              <span className="btn-text">{cancelText}</span>
            </button>

            <button
              ref={confirmButtonRef}
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`btn-dialog btn-confirm ${severity === 'danger' ? 'btn-danger' : ''}`}
              data-action="confirm"
              aria-label={`${confirmText}. Pressione para confirmar a ação`}
            >
              <span className="btn-icon" aria-hidden="true">
                ✓
              </span>
              <span className="btn-text">{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Hook for using ConfirmDialog
 */
export function useConfirmDialog() {
  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    action: string;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    severity?: 'normal' | 'warning' | 'danger';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    action: '',
    title: '',
    message: ''
  });

  const openDialog = (config: Omit<typeof dialogState, 'isOpen'>) => {
    setDialogState({
      ...config,
      isOpen: true
    });
  };

  const closeDialog = () => {
    setDialogState((prev) => ({
      ...prev,
      isOpen: false
    }));
  };

  const confirm = () => {
    if (dialogState.onConfirm) {
      dialogState.onConfirm();
    }
  };

  return {
    dialogState,
    openDialog,
    closeDialog,
    confirm,
    ConfirmDialog: (props: Partial<ConfirmDialogProps>) => (
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        onConfirm={confirm}
        action={dialogState.action}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        severity={dialogState.severity}
        {...props}
      />
    )
  };
}

export default ConfirmDialog;
