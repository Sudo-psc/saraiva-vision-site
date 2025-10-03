import { z } from 'zod';

/**
 * Contact Form Validation Schemas
 *
 * Provides comprehensive validation for contact forms with:
 * - Brazilian phone number format validation
 * - LGPD compliance (consent requirement)
 * - Honeypot spam protection
 * - Character limits and sanitization
 */

// Brazilian phone number validation
// Formats: (33) 99999-9999, (33) 9999-9999, 33999999999, 3399999999
const PHONE_REGEX = /^\(?([0-9]{2})\)?[\s-]?9?[0-9]{4}[\s-]?[0-9]{4}$/;

// Email validation (more permissive than default, supports international domains)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Base contact form schema
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo (máximo 100 caracteres)')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome deve conter apenas letras')
    .transform((val) => val.trim()),

  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .regex(EMAIL_REGEX, 'E-mail inválido. Exemplo: nome@email.com')
    .max(255, 'E-mail muito longo')
    .toLowerCase()
    .transform((val) => val.trim()),

  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(PHONE_REGEX, 'Telefone inválido. Use o formato (33) 99999-9999')
    .transform((val) => val.replace(/\D/g, '')) // Remove formatting for storage
    .refine(
      (val) => val.length === 10 || val.length === 11,
      'Telefone deve ter 10 ou 11 dígitos (com DDD)'
    ),

  message: z
    .string()
    .min(10, 'Mensagem muito curta. Mínimo 10 caracteres')
    .max(2000, 'Mensagem muito longa. Máximo 2000 caracteres')
    .transform((val) => val.trim()),

  consent: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Você deve aceitar os termos de privacidade para continuar',
    }),

  // Honeypot field for spam protection (should always be empty)
  honeypot: z.string().max(0).optional().default(''),
});

/**
 * Extended schema with optional reCAPTCHA token
 */
export const contactFormWithCaptchaSchema = contactFormSchema.extend({
  recaptchaToken: z.string().optional(),
});

/**
 * API request schema (server-side validation)
 */
export const contactAPISchema = contactFormWithCaptchaSchema.extend({
  timestamp: z.string().datetime().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().ip().optional(),
});

/**
 * Contact form response schema
 */
export const contactResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  messageId: z.string().uuid().optional(),
  errors: z.record(z.string()).optional(),
  code: z.string().optional(),
});

/**
 * Type exports for TypeScript
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ContactFormWithCaptcha = z.infer<typeof contactFormWithCaptchaSchema>;
export type ContactAPIRequest = z.infer<typeof contactAPISchema>;
export type ContactResponse = z.infer<typeof contactResponseSchema>;

/**
 * Validation helper for individual fields
 */
export function validateContactField(
  field: keyof ContactFormData,
  value: string | boolean
): { success: boolean; error?: string } {
  try {
    const fieldSchema = contactFormSchema.shape[field];
    fieldSchema.parse(value);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Valor inválido',
      };
    }
    return { success: false, error: 'Erro de validação' };
  }
}

/**
 * Sanitize contact form data (remove potential XSS vectors)
 */
export function sanitizeContactData(data: ContactFormData): ContactFormData {
  return {
    name: data.name.replace(/[<>]/g, ''),
    email: data.email.replace(/[<>]/g, ''),
    phone: data.phone.replace(/\D/g, ''),
    message: data.message.replace(/[<>]/g, ''),
    consent: data.consent,
    honeypot: '',
  };
}

/**
 * Format phone number for display
 * Converts 33999999999 -> (33) 99999-9999
 */
export function formatPhoneForDisplay(phone: string): string {
  const numbers = phone.replace(/\D/g, '');

  if (numbers.length === 11) {
    // (33) 99999-9999
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 10) {
    // (33) 9999-9999
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }

  return phone;
}

/**
 * Rate limiting check (client-side)
 */
const RATE_LIMIT_KEY = 'contact_form_submissions';
const RATE_LIMIT_WINDOW = 3600000; // 1 hour in ms
const MAX_SUBMISSIONS = 3;

export function checkRateLimit(): {
  allowed: boolean;
  remaining: number;
  resetTime?: Date;
} {
  if (typeof window === 'undefined') {
    return { allowed: true, remaining: MAX_SUBMISSIONS };
  }

  try {
    const submissions = JSON.parse(
      localStorage.getItem(RATE_LIMIT_KEY) || '[]'
    ) as number[];

    const now = Date.now();
    const recentSubmissions = submissions.filter(
      (time) => now - time < RATE_LIMIT_WINDOW
    );

    const remaining = MAX_SUBMISSIONS - recentSubmissions.length;

    if (remaining <= 0) {
      const oldestSubmission = Math.min(...recentSubmissions);
      const resetTime = new Date(oldestSubmission + RATE_LIMIT_WINDOW);

      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }

    return {
      allowed: true,
      remaining,
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: MAX_SUBMISSIONS };
  }
}

/**
 * Record a form submission for rate limiting
 */
export function recordSubmission(): void {
  if (typeof window === 'undefined') return;

  try {
    const submissions = JSON.parse(
      localStorage.getItem(RATE_LIMIT_KEY) || '[]'
    ) as number[];

    const now = Date.now();
    const recentSubmissions = submissions.filter(
      (time) => now - time < RATE_LIMIT_WINDOW
    );

    recentSubmissions.push(now);

    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentSubmissions));
  } catch (error) {
    console.error('Failed to record submission:', error);
  }
}
