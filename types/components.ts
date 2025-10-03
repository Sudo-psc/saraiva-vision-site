/**
 * Component Type Definitions
 * Saraiva Vision - Next.js Migration
 */

export interface NavLink {
  name: string;
  href: string;
  internal: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface ServiceItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  testKey?: string;
}

export interface ReviewData {
  id: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl: string;
    isAnonymous: boolean;
  };
  starRating: number;
  comment: string;
  relativeTimeDescription: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  honeypot: string;
}

export interface ContactDetails {
  icon: React.ReactNode;
  title: string;
  details: React.ReactNode;
  subDetails: React.ReactNode;
}

export interface FieldValidation {
  success: boolean;
  error?: string;
}

export interface SubmissionError {
  name?: string;
  message: string;
  userMessage?: string;
  field?: string;
  code?: string;
  status?: number;
}

export type Size = 'compact' | 'standard' | 'featured' | 'hero';
export type Variant = 'service' | 'episode' | 'testimonial' | 'article' | 'physician';
export type ColorTheme = 'medical' | 'trust' | 'brand' | 'none';
export type BorderRadius = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type HoverEffect = 'subtle' | 'pronounced' | 'none';
export type MotionPreset = 'entrance' | 'hover' | 'exit' | 'none';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success';
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rectangular' | 'text';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export interface CookieBannerProps {
  onOpenModal?: () => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}
