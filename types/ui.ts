/**
 * UI Component Types
 * Comprehensive type definitions for advanced UI components
 * Phase 4: UI Components Migration (Vite → Next.js 15)
 */

import { ReactNode, MouseEvent, KeyboardEvent } from 'react';
import type { VariantProps } from 'class-variance-authority';

// ============================================================================
// BASE TYPES
// ============================================================================

export type Variant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type Size = 'default' | 'sm' | 'lg' | 'icon';
export type ConsentValue = 'granted' | 'denied';

// ============================================================================
// MODAL TYPES
// ============================================================================

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface ModalProps extends BaseModalProps {
  footer?: ReactNode;
  header?: ReactNode;
}

// ============================================================================
// COOKIE CONSENT TYPES
// ============================================================================

export interface ConsentPreferences {
  analytics_storage: ConsentValue;
  ad_storage: ConsentValue;
  ad_personalization: ConsentValue;
  ad_user_data?: ConsentValue;
  functionality_storage?: ConsentValue;
  personalization_storage?: ConsentValue;
  security_storage?: ConsentValue;
}

export interface ConsentCategory {
  id: keyof ConsentPreferences;
  name: string;
  description: string;
  required: boolean;
  icon?: ReactNode;
}

export interface CookieConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onSavePreferences?: (preferences: ConsentPreferences) => void;
  initialPreferences?: Partial<ConsentPreferences>;
  categories?: ConsentCategory[];
  className?: string;
}

export interface CookieBannerProps {
  onOpenModal?: () => void;
  onAcceptAll?: () => void;
  position?: 'bottom' | 'top' | 'bottom-left' | 'bottom-right';
  delay?: number;
  className?: string;
}

// ============================================================================
// CTA MODAL TYPES
// ============================================================================

export interface CTAAction {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  badge?: string;
  disabled?: boolean;
  className?: string;
}

export interface CTAModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  actions?: CTAAction[];
  footer?: ReactNode;
  className?: string;
}

// ============================================================================
// TOAST TYPES
// ============================================================================

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastAction {
  label: string;
  onClick: () => void;
  altText?: string;
}

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: ToastAction;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export interface ToastProps extends Omit<Toast, 'id'> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ToasterProps {
  position?: ToastPosition;
  maxToasts?: number;
  duration?: number;
  className?: string;
}

export interface UseToastReturn {
  toast: (props: Omit<Toast, 'id'>) => Toast;
  toasts: Toast[];
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ============================================================================
// CARD TYPES
// ============================================================================

export type CardVariant = 'default' | 'outlined' | 'ghost' | 'gradient' | 'elevated';
export type CardSize = 'sm' | 'md' | 'lg';

export interface CardProps {
  variant?: CardVariant;
  size?: CardSize;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  className?: string;
  children: ReactNode;
  asChild?: boolean;
}

export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export interface CardTitleProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  children: ReactNode;
}

export interface CardDescriptionProps {
  className?: string;
  children: ReactNode;
}

export interface CardContentProps {
  className?: string;
  children: ReactNode;
}

export interface CardFooterProps {
  className?: string;
  children: ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
}

// ============================================================================
// BUTTON TYPES (Enhanced)
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  asChild?: boolean;
  fullWidth?: boolean;
}

// ============================================================================
// DIALOG/CONFIRM TYPES
// ============================================================================

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  className?: string;
}

// ============================================================================
// FOCUS TRAP TYPES
// ============================================================================

export interface FocusTrapOptions {
  autoFocus?: boolean;
  returnFocus?: boolean;
  clickOutsideDeactivates?: boolean;
  onEscape?: () => void;
}

// ============================================================================
// SCROLL LOCK TYPES
// ============================================================================

export interface ScrollLockOptions {
  reserveScrollBarGap?: boolean;
  allowPinchZoom?: boolean;
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

export type AnimationPreset =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'zoom';

export interface AnimationConfig {
  preset?: AnimationPreset;
  duration?: number;
  delay?: number;
  easing?: string;
}

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

export interface A11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-modal'?: boolean;
  'aria-hidden'?: boolean;
  role?: string;
}

// ============================================================================
// PORTAL TYPES
// ============================================================================

export interface PortalProps {
  children: ReactNode;
  container?: Element | null;
  id?: string;
}

// ============================================================================
// COMPOUND COMPONENT TYPES
// ============================================================================

export interface CompoundComponentProps {
  children: ReactNode;
  className?: string;
}
