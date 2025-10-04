'use client';

/**
 * Toaster Component
 * Container for rendering toast notifications with Radix UI
 * Phase 4: UI Components Migration (Vite → Next.js 15)
 *
 * Features:
 * - Toast viewport positioning
 * - Hotkey support for dismissing toasts
 * - Automatic toast management
 * - WCAG AAA accessibility
 */

import React, { useEffect, useState } from 'react';
import { useToast } from './use-toast';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  type ToastProps,
} from './Toast';
import { variantIcons, variantIconColors } from './Toast';

/**
 * Toast container with auto-dismiss and keyboard shortcuts
 */
export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key dismisses all toasts
      if (event.key === 'Escape') {
        toasts.forEach((toast) => toast.dismiss?.());
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mounted, toasts]);

  if (!mounted) return null;

  return (
    <ToastProvider>
      <ToastViewport />
      {toasts.map(function ({ id, title, description, action, variant, icon, ...props }) {
        const IconComponent = icon || variantIcons[variant || 'default'];

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex gap-3">
              {IconComponent && (
                <div className={`flex-shrink-0 w-5 h-5 ${variantIconColors[variant || 'default']}`}>
                  <IconComponent className="w-full h-full" aria-hidden="true" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
    </ToastProvider>
  );
}

/**
 * Toast title component
 */
const ToastTitle = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`text-sm font-semibold ${className || ''}`}
      {...props}
    />
  );
});
ToastTitle.displayName = 'ToastTitle';

/**
 * Toast description component
 */
const ToastDescription = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`text-sm opacity-90 ${className || ''}`}
      {...props}
    />
  );
});
ToastDescription.displayName = 'ToastDescription';

/**
 * Toast close button component
 */
const ToastClose = React.forwardRef<
  React.ElementRef<'button'>,
  React.ComponentPropsWithoutRef<'button'>
>(({ className, ...props }, ref) => {
  const { dismiss } = useToast();

  return (
    <button
      ref={ref}
      type="button"
      className={`absolute right-2 top-2 rounded-md p-1 text-slate-500 opacity-0 transition-opacity hover:text-slate-900 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 ${className || ''}`}
      toast-close=""
      onClick={() => dismiss?.()}
      aria-label="Fechar notificação"
      {...props}
    >
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
});
ToastClose.displayName = 'ToastClose';

export default Toaster;