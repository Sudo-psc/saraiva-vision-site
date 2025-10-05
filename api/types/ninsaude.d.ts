/**
 * TypeScript Type Definitions for Ninsaúde API Integration
 *
 * Defines interfaces for all 8 entities from data-model.md:
 * 1. Patient (Paciente)
 * 2. Appointment (Agendamento)
 * 3. Professional (Profissional)
 * 4. Care Unit (Unidade de Atendimento)
 * 5. Available Time Slot (Horário Disponível)
 * 6. Notification (Notificação)
 * 7. Queued Request (Requisição Enfileirada)
 * 8. OAuth Token (Cache Only)
 *
 * Also exports Zod schemas for runtime validation
 */

import { z } from 'zod';

// ============================================================================
// 1. Patient (Paciente)
// ============================================================================

export interface Patient {
  // Ninsaúde ID (returned after registration)
  id?: string;

  // Required fields (FR-001)
  name: string; // Full name
  cpf: string; // Brazilian tax ID (format: 000.000.000-00)
  birthDate: string; // ISO 8601 date (YYYY-MM-DD)
  phone: string; // Format: (00) 00000-0000
  email: string;

  // Address (FR-006)
  address: {
    street: string; // Logradouro
    number: string;
    complement?: string; // Optional
    neighborhood: string; // Bairro
    city: string;
    state: string; // UF (2 letters)
    zipCode: string; // CEP (format: 00000-000)
  };

  // Optional fields
  gender?: 'M' | 'F' | 'Other';
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  // Metadata (not sent to Ninsaúde)
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// 2. Appointment (Agendamento)
// ============================================================================

export type AppointmentStatus =
  | 'pending' // Created but not confirmed
  | 'confirmed' // Confirmed by clinic
  | 'checked_in' // Patient arrived
  | 'in_progress' // Consultation started
  | 'completed' // Consultation finished
  | 'cancelled' // Cancelled by patient or clinic
  | 'no_show'; // Patient didn't appear

export interface Appointment {
  // Ninsaúde ID
  id?: string;

  // Patient reference (FK to Ninsaúde patient ID)
  patientId: string;
  patientCPF?: string; // For lookup only, not stored

  // Professional and location
  professionalId: string; // Médico/profissional de saúde
  professionalName?: string; // Read-only from Ninsaúde
  careUnitId: string; // Unidade de atendimento
  careUnitName?: string; // Read-only

  // Schedule
  dateTime: string; // ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss)
  duration: number; // Minutes (typically 30 or 60)
  appointmentType: 'first_visit' | 'return' | 'follow_up';

  // Status (controlled by state machine)
  status: AppointmentStatus;

  // Specialty
  specialty?: string; // e.g., "Oftalmologia", "Optometria"

  // Notes
  patientNotes?: string; // Patient-provided notes
  internalNotes?: string; // Staff notes (not visible to patient)

  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  cancelledAt?: Date;
  rescheduledFrom?: string; // Previous appointment ID if rescheduled
}

// ============================================================================
// 3. Professional (Profissional)
// ============================================================================

export interface TimeSlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday
  startTime: string; // HH:mm format
  endTime: string;
  duration: number; // Appointment duration in minutes
}

export interface Professional {
  // Ninsaúde ID (read-only)
  id: string;

  // Basic info
  name: string;
  crm?: string; // Medical license number (CFM)
  specialty: string; // e.g., "Oftalmologista"

  // Schedule
  availableHours?: TimeSlot[]; // Read from Ninsaúde

  // Metadata (from Ninsaúde)
  careUnits: string[]; // IDs of units where professional works
  active: boolean;
}

// ============================================================================
// 4. Care Unit (Unidade de Atendimento)
// ============================================================================

export interface CareUnit {
  // Ninsaúde ID (read-only)
  id: string;

  // Basic info
  name: string;
  active: boolean;

  // Address
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // Supported specialties
  specialties: string[];

  // Metadata
  phone?: string;
  hours?: string; // e.g., "Seg-Sex: 8h-18h"
}

// ============================================================================
// 5. Available Time Slot (Horário Disponível)
// ============================================================================

export interface AvailableSlot {
  // Slot identification
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  dateTime: string; // ISO 8601 combined

  // Professional and location
  professionalId: string;
  professionalName: string;
  careUnitId: string;
  careUnitName: string;

  // Slot details
  duration: number; // Minutes
  specialty: string;

  // Availability
  available: boolean; // Real-time availability flag
  remainingSlots?: number; // If professional has multiple rooms

  // Metadata
  fetchedAt: Date; // When this data was retrieved
}

// ============================================================================
// 6. Notification (Notificação)
// ============================================================================

export type NotificationType = 'email' | 'whatsapp';

export type NotificationChannel = 'resend_api' | 'evolution_api';

export type NotificationEvent =
  | 'booking_confirmation'
  | 'booking_reminder' // 24h before
  | 'cancellation_confirmation'
  | 'rescheduling_confirmation';

export type NotificationStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'retry_scheduled';

export interface Notification {
  // Identification
  id: string; // UUID

  // Reference
  appointmentId: string;
  patientId: string;

  // Notification details
  type: NotificationType;
  channel: NotificationChannel;
  event: NotificationEvent;

  // Recipient
  recipient: string; // Email or phone number
  recipientHash?: string; // SHA-256 hash for audit logs

  // Content
  subject?: string; // For email
  message: string;

  // Delivery tracking
  status: NotificationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  retryCount: number;
  errorMessage?: string;

  // Metadata
  createdAt: Date;
}

// ============================================================================
// 7. Queued Request (Requisição Enfileirada)
// ============================================================================

export type QueuedRequestType =
  | 'patient_registration'
  | 'appointment_booking'
  | 'appointment_cancellation'
  | 'appointment_rescheduling';

export type QueuedRequestStatus =
  | 'queued'
  | 'retrying'
  | 'completed'
  | 'failed'
  | 'escalated_to_manual';

export interface QueuedRequest {
  // Identification
  id: string; // UUID

  // Request details
  requestType: QueuedRequestType;
  endpoint: string; // Ninsaúde API endpoint
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload: unknown; // Request body

  // Patient context
  patientData?: Partial<Patient>; // For manual processing
  appointmentData?: Partial<Appointment>;

  // Retry tracking
  retryCount: number;
  maxRetries: number; // Default 3
  nextRetryAt?: Date;
  lastError?: string;

  // Status
  status: QueuedRequestStatus;
  createdAt: Date;
  processedAt?: Date;
  escalatedAt?: Date;

  // TTL
  expiresAt: Date; // 24h from creation
}

// ============================================================================
// 8. OAuth Token (Cache Only)
// ============================================================================

export interface OAuthToken {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number; // Seconds (900 = 15 minutes)
  issued_at: number; // Unix timestamp
}

export interface CachedToken {
  token: OAuthToken;
  expiresAt: number; // Unix timestamp
  refreshThreshold: number; // Refresh when within 60s of expiry
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

/**
 * CPF validation function (imported from cpfValidator.js)
 */
declare function validateCPF(cpf: string): boolean;
declare function isValidAge(birthDate: string): boolean;
declare function isFutureDateTime(dateTime: string): boolean;
declare function isBusinessHours(dateTime: string): boolean;

export const PatientSchema = z.object({
  name: z
    .string()
    .min(3, 'Nome completo obrigatório')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),

  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
    .refine(validateCPF as any, 'CPF com dígitos verificadores inválidos'),

  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)')
    .refine(isValidAge as any, 'Paciente deve ter entre 0 e 120 anos'),

  phone: z
    .string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido'),

  email: z.string().email('Email inválido').toLowerCase(),

  address: z.object({
    street: z.string().min(3),
    number: z.string().min(1),
    complement: z.string().optional(),
    neighborhood: z.string().min(2),
    city: z.string().min(2),
    state: z.string().length(2, 'UF deve ter 2 letras').toUpperCase(),
    zipCode: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
  }),

  gender: z.enum(['M', 'F', 'Other']).optional(),
  emergencyContact: z
    .object({
      name: z.string().min(3),
      phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/),
      relationship: z.string().min(3),
    })
    .optional(),
});

export const AppointmentSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),

  professionalId: z.string().uuid('ID do profissional inválido'),

  careUnitId: z.string().uuid('ID da unidade inválido'),

  dateTime: z
    .string()
    .datetime('Data/hora inválida')
    .refine(isFutureDateTime as any, 'Agendamento deve ser no futuro')
    .refine(isBusinessHours as any, 'Fora do horário de atendimento'),

  duration: z
    .number()
    .int()
    .min(15, 'Duração mínima: 15 minutos')
    .max(180, 'Duração máxima: 3 horas'),

  appointmentType: z.enum(['first_visit', 'return', 'follow_up']),

  status: z.enum([
    'pending',
    'confirmed',
    'checked_in',
    'in_progress',
    'completed',
    'cancelled',
    'no_show',
  ]),

  specialty: z.string().optional(),

  patientNotes: z.string().max(500, 'Observações muito longas').optional(),

  internalNotes: z.string().max(1000).optional(),
});

export const AvailableSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  professionalId: z.string().uuid(),
  duration: z.number().int().positive(),
  available: z.boolean(),
});

export const NotificationSchema = z.object({
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid(),

  type: z.enum(['email', 'whatsapp']),
  channel: z.enum(['resend_api', 'evolution_api']),
  event: z.enum([
    'booking_confirmation',
    'booking_reminder',
    'cancellation_confirmation',
    'rescheduling_confirmation',
  ]),

  recipient: z.union([
    z.string().email(), // Email
    z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/), // Phone
  ]),

  message: z.string().min(10).max(1000),

  status: z.enum(['pending', 'sent', 'delivered', 'failed', 'retry_scheduled']),

  retryCount: z.number().int().min(0).max(3),
});

export const QueuedRequestSchema = z.object({
  requestType: z.enum([
    'patient_registration',
    'appointment_booking',
    'appointment_cancellation',
    'appointment_rescheduling',
  ]),

  endpoint: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  payload: z.unknown(),

  retryCount: z.number().int().min(0).max(3),
  maxRetries: z.number().int().positive(),

  status: z.enum([
    'queued',
    'retrying',
    'completed',
    'failed',
    'escalated_to_manual',
  ]),

  expiresAt: z.date().refine((date) => date > new Date(), 'Expiry must be in the future'),
});

// ============================================================================
// Export Types from Zod Schemas
// ============================================================================

export type PatientInput = z.infer<typeof PatientSchema>;
export type AppointmentInput = z.infer<typeof AppointmentSchema>;
export type AvailableSlotInput = z.infer<typeof AvailableSlotSchema>;
export type NotificationInput = z.infer<typeof NotificationSchema>;
export type QueuedRequestInput = z.infer<typeof QueuedRequestSchema>;
