/**
 * Contact Form Type Definitions
 *
 * Comprehensive types for contact form data, validation, and API responses.
 * Used across components, validation schemas, and API routes.
 */

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  honeypot: string;
}

export interface ContactFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  consent?: string;
  honeypot?: string;
  general?: string;
  recaptcha?: string;
}

export interface ContactFormState {
  success: boolean;
  message?: string;
  errors?: ContactFormErrors;
  messageId?: string;
}

export interface ContactAPIResponse {
  success: boolean;
  message?: string;
  errors?: ContactFormErrors;
  messageId?: string;
  code?: string;
}

/**
 * Extended contact form data with metadata
 * Used for API submissions and server-side processing
 */
export interface ContactSubmissionData extends ContactFormData {
  recaptchaToken?: string;
  timestamp?: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Rate limiting information
 */
export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetTime?: Date;
  windowMs?: number;
}

/**
 * Validation result for individual fields
 */
export interface FieldValidationResult {
  success: boolean;
  error?: string;
  value?: string | boolean;
}

/**
 * Contact information display
 */
export interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  details: React.ReactNode | string;
  subDetails?: React.ReactNode | string;
  href?: string;
  ariaLabel?: string;
}

/**
 * Form submission status
 */
export type SubmissionStatus = 'idle' | 'validating' | 'submitting' | 'success' | 'error';

/**
 * Network status
 */
export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

/**
 * Analytics event data for form interactions
 */
export interface ContactFormAnalytics {
  formName: string;
  action: 'view' | 'start' | 'submit' | 'success' | 'error';
  timestamp: string;
  errors?: string[];
  duration?: number;
}
