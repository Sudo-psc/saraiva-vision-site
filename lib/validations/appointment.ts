/**
 * Appointment Form Validation Schema
 * Using Zod for type-safe validation
 */

import { z } from 'zod';

export const appointmentFormSchema = z.object({
  patient_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome deve conter apenas letras'),

  patient_email: z
    .string()
    .email('Email deve ter um formato válido')
    .max(100, 'Email muito longo')
    .toLowerCase(),

  patient_phone: z
    .string()
    .regex(
      /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/,
      'Telefone deve ter um formato válido (ex: (11) 99999-9999)'
    ),

  notes: z
    .string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
    .default(''),

  lgpd_consent: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Você deve concordar com os termos de privacidade',
    }),

  appointment_date: z.string().min(1, 'Selecione uma data'),

  appointment_time: z.string().min(1, 'Selecione um horário'),

  honeypot: z.string().optional().default(''),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export const validateAppointmentForm = (data: unknown) => {
  return appointmentFormSchema.safeParse(data);
};
