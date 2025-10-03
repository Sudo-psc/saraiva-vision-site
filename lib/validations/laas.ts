/**
 * LAAS Lead Form Validation
 * Zod schemas for lead capture with LGPD compliance
 */

import { z } from 'zod';

/**
 * Lead form validation schema
 * Matches the HeroSection calculator form
 */
export const laasLeadFormSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome contém caracteres inválidos'),

  whatsapp: z
    .string()
    .regex(
      /^(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[-\s]?\d{4}$/,
      'WhatsApp inválido. Use formato: (33) 99999-9999'
    )
    .transform((phone) => phone.replace(/\D/g, '')), // Remove non-digits

  email: z
    .string()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .toLowerCase(),

  lgpdConsent: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Você deve concordar com a Política de Privacidade',
    }),

  // Honeypot field for spam prevention
  honeypot: z.string().optional(),
});

export type LaasLeadFormInput = z.infer<typeof laasLeadFormSchema>;

/**
 * Lead response from API
 */
export interface LaasLeadResponse {
  success: boolean;
  message: string;
  leadId?: string;
  estimatedSavings?: {
    monthly: number;
    yearly: number;
  };
  error?: string;
  code?: string;
}
