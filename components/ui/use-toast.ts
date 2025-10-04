/**
 * useToast Hook
 * Enhanced toast notification system with TypeScript, queue management, and variants
 * Phase 4: UI Components Migration (Vite → Next.js 15)
 *
 * Features:
 * - Queue management with max limit
 * - Auto-dismiss with configurable duration
 * - Multiple variants (success, error, warning, info, default)
 * - Action buttons support
 * - Dismiss individual or all toasts
 * - Type-safe with comprehensive interfaces
 */

import { useState, useEffect, useCallback } from 'react';
import type { Toast, ToastVariant, UseToastReturn } from '@/types/ui';

// Configuration
const TOAST_LIMIT = 5;
const DEFAULT_DURATION = 5000;

// Toast counter for unique IDs
let count = 0;
function generateId(): string {
  count = (count + 1) % Number.MAX_VALUE;
  return `toast-${count}-${Date.now()}`;
}

// Toast store state
interface ToastState {
  toasts: Toast[];
}

// Toast store
const toastStore = {
  state: {
    toasts: [],
  } as ToastState,
  listeners: [] as Array<(state: ToastState) => void>,

  getState: () => toastStore.state,

  setState: (nextState: ToastState | ((prev: ToastState) => ToastState)) => {
    if (typeof nextState === 'function') {
      toastStore.state = nextState(toastStore.state);
    } else {
      toastStore.state = { ...toastStore.state, ...nextState };
    }

    toastStore.listeners.forEach((listener) => listener(toastStore.state));
  },

  subscribe: (listener: (state: ToastState) => void) => {
    toastStore.listeners.push(listener);
    return () => {
      toastStore.listeners = toastStore.listeners.filter((l) => l !== listener);
    };
  },
};

/**
 * Add toast to the queue
 */
export const toast = (props: Omit<Toast, 'id'>): Toast => {
  const id = generateId();

  const dismiss = () => {
    toastStore.setState((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  };

  const toastItem: Toast = {
    ...props,
    id,
    duration: props.duration ?? DEFAULT_DURATION,
    dismissible: props.dismissible ?? true,
    onDismiss: () => {
      dismiss();
      props.onDismiss?.();
    },
  };

  toastStore.setState((state) => ({
    toasts: [toastItem, ...state.toasts].slice(0, TOAST_LIMIT),
  }));

  return toastItem;
};

/**
 * Toast helper functions for common variants
 */
export const toastHelpers = {
  success: (props: Omit<Toast, 'id' | 'variant'>) =>
    toast({ ...props, variant: 'success' }),

  error: (props: Omit<Toast, 'id' | 'variant'>) =>
    toast({ ...props, variant: 'error' }),

  warning: (props: Omit<Toast, 'id' | 'variant'>) =>
    toast({ ...props, variant: 'warning' }),

  info: (props: Omit<Toast, 'id' | 'variant'>) =>
    toast({ ...props, variant: 'info' }),

  promise: async <T,>(
    promise: Promise<T>,
    {
      loading,
      success: successMessage,
      error: errorMessage,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ): Promise<T> => {
    const loadingToast = toast({
      title: loading,
      variant: 'default',
      duration: Infinity,
      dismissible: false,
    });

    try {
      const data = await promise;
      toastStore.setState((state) => ({
        toasts: state.toasts.filter((t) => t.id !== loadingToast.id),
      }));
      toast({
        title: typeof successMessage === 'function' ? successMessage(data) : successMessage,
        variant: 'success',
      });
      return data;
    } catch (error) {
      toastStore.setState((state) => ({
        toasts: state.toasts.filter((t) => t.id !== loadingToast.id),
      }));
      toast({
        title: typeof errorMessage === 'function' ? errorMessage(error) : errorMessage,
        variant: 'error',
      });
      throw error;
    }
  },
};

/**
 * useToast hook
 */
export function useToast(): UseToastReturn {
  const [state, setState] = useState<ToastState>(toastStore.getState());

  useEffect(() => {
    const unsubscribe = toastStore.subscribe((state) => {
      setState(state);
    });

    return unsubscribe;
  }, []);

  // Auto-dismiss toasts based on duration
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    state.toasts.forEach((toastItem) => {
      if (toastItem.duration === Infinity || toastItem.duration === 0) {
        return;
      }

      const timeout = setTimeout(() => {
        toastItem.onDismiss?.();
      }, toastItem.duration);

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [state.toasts]);

  const dismiss = useCallback((id: string) => {
    toastStore.setState((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  }, []);

  const dismissAll = useCallback(() => {
    toastStore.setState({ toasts: [] });
  }, []);

  return {
    toast,
    toasts: state.toasts,
    dismiss,
    dismissAll,
  };
}

export default useToast;
