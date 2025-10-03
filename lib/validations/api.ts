/**
 * Zod Validation Schemas for API Routes
 * Saraiva Vision - CFM/LGPD Compliant Validation
 */

import { z } from 'zod';

// ============================================================================
// Contact Form Validation
// ============================================================================

/**
 * Contact form validation schema
 * Compliant with LGPD (Brazilian data protection law)
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos'),

  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase(),

  phone: z
    .string()
    .regex(
      /^(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[-\s]?\d{4}$/,
      'Telefone inválido. Use formato: (33) 99999-9999'
    )
    .transform((phone) => phone.replace(/\D/g, '')), // Remove non-digits

  message: z
    .string()
    .min(10, 'Mensagem deve ter no mínimo 10 caracteres')
    .max(2000, 'Mensagem deve ter no máximo 2000 caracteres')
    .refine(
      (msg) => msg.trim().length > 0,
      'Mensagem não pode estar vazia'
    ),

  // Honeypot field for spam prevention
  honeypot: z.string().optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ============================================================================
// Google Reviews Validation
// ============================================================================

export const reviewsQuerySchema = z.object({
  placeId: z.string().optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(50))
    .default('5'),
  language: z
    .string()
    .regex(/^[a-z]{2}-[A-Z]{2}$/)
    .default('pt-BR'),
});

export type ReviewsQueryInput = z.infer<typeof reviewsQuerySchema>;

// ============================================================================
// Blog API Validation
// ============================================================================

export const blogListQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .default('1'),
  pageSize: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .default('10'),
  category: z.string().optional(),
  featured: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional(),
  search: z.string().max(200).optional(),
});

export type BlogListQueryInput = z.infer<typeof blogListQuerySchema>;

export const blogSlugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug inválido'),
});

export type BlogSlugParamInput = z.infer<typeof blogSlugParamSchema>;

// ============================================================================
// Profile API Validation
// ============================================================================

export const profileSchema = z.object({
  profile: z.enum(['familiar', 'jovem', 'senior']),
  source: z.enum(['manual', 'auto']).default('manual'),
  confidence: z.number().min(0).max(1).optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// ============================================================================
// Subscription API Validation (NEW for Jovem profile)
// ============================================================================

export const createSubscriptionSchema = z.object({
  planId: z.string().min(1, 'Plan ID é obrigatório'),
  customerEmail: z.string().email('Email inválido'),
  customerName: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  paymentMethodId: z.string().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;

export const subscriptionIdParamSchema = z.object({
  id: z.string().min(1, 'Subscription ID é obrigatório'),
});

export type SubscriptionIdParamInput = z.infer<typeof subscriptionIdParamSchema>;

// ============================================================================
// CFM Compliance Validation
// ============================================================================

/**
 * Validates medical content for CFM compliance
 * Ensures proper medical disclaimers and author information
 */
export const medicalContentSchema = z.object({
  hasDisclaimer: z
    .boolean()
    .refine((val) => val === true, 'Aviso médico obrigatório'),

  authorCRM: z
    .string()
    .regex(
      /^CRM\/[A-Z]{2}\s\d{4,6}$/,
      'CRM inválido. Use formato: CRM/MG 12345'
    ),

  category: z.enum(['medical', 'educational', 'informational']),

  reviewedBy: z.string().optional(),

  reviewedAt: z.string().datetime().optional(),
});

export type MedicalContentInput = z.infer<typeof medicalContentSchema>;

// ============================================================================
// LGPD Consent Validation
// ============================================================================

/**
 * Validates user consent for data processing (LGPD compliance)
 */
export const consentSchema = z.object({
  analytics: z.boolean().default(false),
  marketing: z.boolean().default(false),
  necessary: z.boolean().default(true), // Always true
  timestamp: z.string().datetime(),
  userAgent: z.string().optional(),
  ipAddress: z.string().ip().optional(),
});

export type ConsentInput = z.infer<typeof consentSchema>;

// ============================================================================
// Security Headers Validation
// ============================================================================

export const securityHeadersSchema = z.object({
  'X-Content-Type-Options': z.literal('nosniff'),
  'X-Frame-Options': z.enum(['DENY', 'SAMEORIGIN']),
  'X-XSS-Protection': z.literal('1; mode=block'),
  'Strict-Transport-Security': z.string().regex(/^max-age=\d+/),
  'Referrer-Policy': z.enum([
    'no-referrer',
    'strict-origin-when-cross-origin',
    'same-origin',
  ]),
  'Permissions-Policy': z.string(),
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sanitize HTML content for CFM compliance
 * Removes potentially harmful tags while preserving medical formatting
 */
export function sanitizeMedicalContent(html: string): string {
  // Remove script tags
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');

  // Remove dangerous protocols
  sanitized = sanitized.replace(/javascript:/gi, '');

  return sanitized;
}

/**
 * Validate email for CFM-compliant medical communications
 */
export function validateMedicalEmail(email: string): boolean {
  const schema = z.string().email();
  const result = schema.safeParse(email);

  if (!result.success) return false;

  // Additional checks for medical context
  const blockedDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  const domain = email.split('@')[1];

  return !blockedDomains.includes(domain);
}

/**
 * Anonymize PII data for LGPD compliance in logs
 */
export function anonymizePII(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['email', 'phone', 'cpf', 'rg', 'address'];
  const anonymized = { ...data };

  for (const field of sensitiveFields) {
    if (field in anonymized) {
      const value = String(anonymized[field]);
      anonymized[field] = value.slice(0, 3) + '***' + value.slice(-2);
    }
  }

  return anonymized;
}

/**
 * Rate limit check utility
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
  storage: Map<string, { count: number; resetAt: number }>
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = storage.get(identifier);

  if (!record || now > record.resetAt) {
    const resetAt = now + windowMs;
    storage.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}

// ============================================================================
// Appointment Validation
// ============================================================================

export const appointmentDateTimeSchema = z.object({
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida. Use formato: YYYY-MM-DD')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }, 'Agendamentos são permitidos apenas de segunda a sexta-feira')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'A data deve ser hoje ou uma data futura'),

  appointment_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Horário inválido. Use formato: HH:MM')
    .refine((timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours >= 8 && hours < 18 && (minutes === 0 || minutes === 30);
    }, 'Horários disponíveis: 08:00 às 18:00 em intervalos de 30 minutos'),
});

export const createAppointmentSchema = z.object({
  patient_name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos'),

  patient_email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase(),

  patient_phone: z
    .string()
    .regex(
      /^(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[-\s]?\d{4}$/,
      'Telefone inválido. Use formato: (33) 99999-9999'
    )
    .transform((phone) => phone.replace(/\D/g, '')),

  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida. Use formato: YYYY-MM-DD')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }, 'Agendamentos são permitidos apenas de segunda a sexta-feira')
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, 'A data deve ser hoje ou uma data futura'),

  appointment_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Horário inválido. Use formato: HH:MM')
    .refine((timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours >= 8 && hours < 18 && (minutes === 0 || minutes === 30);
    }, 'Horários disponíveis: 08:00 às 18:00 em intervalos de 30 minutos'),

  notes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional()
    .default(''),

  honeypot: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const availabilityQuerySchema = z.object({
  days: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(30))
    .default('14'),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;
