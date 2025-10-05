# Data Model: Ninsaúde API Integration

**Date**: 2025-10-05
**Feature**: 001-ninsaude-integration
**Purpose**: Entity definitions, TypeScript interfaces, validation rules, and state machines

---

## Overview

This data model defines all entities involved in the Ninsaúde appointment booking integration. Ninsaúde API serves as the source of truth - no local database storage. Redis is used only for ephemeral caching (OAuth tokens, retry queue).

**Key Principles**:
- All entities map to Ninsaúde API resources
- TypeScript interfaces ensure type safety across frontend/backend
- Zod schemas provide runtime validation
- State machines enforce business rules
- LGPD compliance through pseudonymization

---

## 1. Patient (Paciente)

### Purpose
Represents an individual patient seeking medical care at Saraiva Vision clinic

### TypeScript Interface
```typescript
// Shared interface (src/types/Patient.ts and api/types/Patient.ts)
interface Patient {
  // Ninsaúde ID (returned after registration)
  id?: string;

  // Required fields (FR-001)
  name: string;                    // Full name
  cpf: string;                     // Brazilian tax ID (format: 000.000.000-00)
  birthDate: string;               // ISO 8601 date (YYYY-MM-DD)
  phone: string;                   // Format: (00) 00000-0000
  email: string;

  // Address (FR-006 - required for full registration)
  address: {
    street: string;                // Logradouro
    number: string;
    complement?: string;           // Optional
    neighborhood: string;          // Bairro
    city: string;
    state: string;                 // UF (2 letters)
    zipCode: string;               // CEP (format: 00000-000)
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
```

### Zod Validation Schema
```typescript
import { z } from 'zod';

export const PatientSchema = z.object({
  name: z.string()
    .min(3, 'Nome completo obrigatório')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),

  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
    .refine(validateCPF, 'CPF com dígitos verificadores inválidos'),

  birthDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)')
    .refine(isValidAge, 'Paciente deve ter entre 0 e 120 anos'),

  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido'),

  email: z.string()
    .email('Email inválido')
    .toLowerCase(),

  address: z.object({
    street: z.string().min(3),
    number: z.string().min(1),
    complement: z.string().optional(),
    neighborhood: z.string().min(2),
    city: z.string().min(2),
    state: z.string().length(2, 'UF deve ter 2 letras').toUpperCase(),
    zipCode: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido')
  }),

  gender: z.enum(['M', 'F', 'Other']).optional(),
  emergencyContact: z.object({
    name: z.string().min(3),
    phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/),
    relationship: z.string().min(3)
  }).optional()
});
```

### Business Rules
1. **CPF Uniqueness**: System must check Ninsaúde for existing patient before creating (FR-003)
2. **CPF Validation**: Must pass checksum validation before API call (FR-002)
3. **Age Validation**: Birth date must result in age 0-120 years
4. **Email Uniqueness**: Recommended but not enforced (Ninsaúde handles)
5. **LGPD**: CPF hashed (SHA-256) in audit logs, never stored locally

### Relationships
- **Has Many**: Appointments
- **Belongs To**: Care Unit (unidade de atendimento)

---

## 2. Appointment (Agendamento)

### Purpose
Represents a scheduled consultation between patient and healthcare professional

### TypeScript Interface
```typescript
interface Appointment {
  // Ninsaúde ID
  id?: string;

  // Patient reference (FK to Ninsaúde patient ID)
  patientId: string;
  patientCPF?: string;             // For lookup only, not stored

  // Professional and location
  professionalId: string;          // Médico/profissional de saúde
  professionalName?: string;       // Read-only from Ninsaúde
  careUnitId: string;              // Unidade de atendimento
  careUnitName?: string;           // Read-only

  // Schedule
  dateTime: string;                // ISO 8601 datetime (YYYY-MM-DDTHH:mm:ss)
  duration: number;                // Minutes (typically 30 or 60)
  appointmentType: 'first_visit' | 'return' | 'follow_up';

  // Status (controlled by state machine)
  status: AppointmentStatus;

  // Specialty
  specialty?: string;              // e.g., "Oftalmologia", "Optometria"

  // Notes
  patientNotes?: string;           // Patient-provided notes
  internalNotes?: string;          // Staff notes (not visible to patient)

  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  cancelledAt?: Date;
  rescheduledFrom?: string;        // Previous appointment ID if rescheduled
}

type AppointmentStatus =
  | 'pending'           // Created but not confirmed
  | 'confirmed'         // Confirmed by clinic
  | 'checked_in'        // Patient arrived
  | 'in_progress'       // Consultation started
  | 'completed'         // Consultation finished
  | 'cancelled'         // Cancelled by patient or clinic
  | 'no_show';          // Patient didn't appear

```

### Zod Validation Schema
```typescript
export const AppointmentSchema = z.object({
  patientId: z.string().uuid('ID do paciente inválido'),

  professionalId: z.string().uuid('ID do profissional inválido'),

  careUnitId: z.string().uuid('ID da unidade inválido'),

  dateTime: z.string()
    .datetime('Data/hora inválida')
    .refine(isFutureDateTime, 'Agendamento deve ser no futuro')
    .refine(isBusinessHours, 'Fora do horário de atendimento'),

  duration: z.number()
    .int()
    .min(15, 'Duração mínima: 15 minutos')
    .max(180, 'Duração máxima: 3 horas'),

  appointmentType: z.enum(['first_visit', 'return', 'follow_up']),

  status: z.enum([
    'pending', 'confirmed', 'checked_in',
    'in_progress', 'completed', 'cancelled', 'no_show'
  ]),

  specialty: z.string().optional(),

  patientNotes: z.string()
    .max(500, 'Observações muito longas')
    .optional(),

  internalNotes: z.string()
    .max(1000)
    .optional()
});
```

### State Machine
```typescript
const appointmentStateMachine = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['checked_in', 'cancelled', 'no_show'],
  checked_in: ['in_progress', 'cancelled'],
  in_progress: ['completed'],
  completed: [],                      // Terminal state
  cancelled: [],                      // Terminal state
  no_show: []                        // Terminal state
};

function canTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return appointmentStateMachine[from].includes(to);
}
```

### Business Rules
1. **Slot Availability**: Must verify slot is available before booking (FR-010)
2. **Race Condition Check**: Re-verify availability immediately before final confirmation (FR-010a)
3. **No Overlaps**: System prevents double-booking same professional/time
4. **Cancellation Window**: Allow cancellation up to 24h before appointment (configurable)
5. **Rescheduling**: Creates new appointment, links to old via `rescheduledFrom` (FR-014a)
6. **Business Hours**: Appointments only during clinic hours (8:00-18:00, Mon-Fri)
7. **Same-Day Booking**: Spec Q4 deferred - default allow with 2h minimum notice

### Relationships
- **Belongs To**: Patient
- **Belongs To**: Professional (read-only)
- **Belongs To**: Care Unit
- **Has Many**: Notifications

---

## 3. Professional (Profissional)

### Purpose
Healthcare provider (doctor, optometrist) performing consultations

### TypeScript Interface
```typescript
interface Professional {
  // Ninsaúde ID (read-only)
  id: string;

  // Basic info
  name: string;
  crm?: string;                    // Medical license number (CFM)
  specialty: string;               // e.g., "Oftalmologista"

  // Schedule
  availableHours?: TimeSlot[];     // Read from Ninsaúde

  // Metadata (from Ninsaúde)
  careUnits: string[];             // IDs of units where professional works
  active: boolean;
}

interface TimeSlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;  // 0=Sunday
  startTime: string;                      // HH:mm format
  endTime: string;
  duration: number;                       // Appointment duration in minutes
}
```

### Business Rules
1. **Read-Only**: Professionals managed in Ninsaúde admin, not via website
2. **Availability Lookup**: Frontend queries `/api/ninsaude/availability?professionalId=X&date=Y`
3. **Active Only**: Only show active professionals in booking flow

### Relationships
- **Has Many**: Appointments
- **Works At Many**: Care Units

---

## 4. Care Unit (Unidade de Atendimento)

### Purpose
Physical clinic location where appointments take place

### TypeScript Interface
```typescript
interface CareUnit {
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
  hours?: string;                  // e.g., "Seg-Sex: 8h-18h"
}
```

### Business Rules
1. **Read-Only**: Care units managed in Ninsaúde admin
2. **Single Location**: Saraiva Vision currently operates from one unit (Caratinga, MG)
3. **Spec Q17**: Deferred - assume single location, architecture supports multiple

### Relationships
- **Has Many**: Professionals
- **Has Many**: Appointments

---

## 5. Available Time Slot (Horário Disponível)

### Purpose
Represents open appointment times for booking

### TypeScript Interface
```typescript
interface AvailableSlot {
  // Slot identification
  date: string;                    // YYYY-MM-DD
  time: string;                    // HH:mm
  dateTime: string;                // ISO 8601 combined

  // Professional and location
  professionalId: string;
  professionalName: string;
  careUnitId: string;
  careUnitName: string;

  // Slot details
  duration: number;                // Minutes
  specialty: string;

  // Availability
  available: boolean;              // Real-time availability flag
  remainingSlots?: number;         // If professional has multiple rooms

  // Metadata
  fetchedAt: Date;                 // When this data was retrieved
}
```

### Zod Validation Schema
```typescript
export const AvailableSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  professionalId: z.string().uuid(),
  duration: z.number().int().positive(),
  available: z.boolean()
});
```

### Business Rules
1. **Real-Time Lookup**: Always fetch from Ninsaúde API, never cache slots
2. **Race Condition**: Re-verify availability before final booking confirmation (FR-010b)
3. **Date Range**: Default show 7 days ahead, allow 30 days max
4. **Buffer Time**: If same-day allowed, require 2h minimum notice

### Relationships
- **Linked To**: Professional
- **Linked To**: Care Unit

---

## 6. Notification (Notificação)

### Purpose
Communication sent to patient about appointment events

### TypeScript Interface
```typescript
interface Notification {
  // Identification
  id: string;                      // UUID

  // Reference
  appointmentId: string;
  patientId: string;

  // Notification details
  type: NotificationType;
  channel: NotificationChannel;
  event: NotificationEvent;

  // Recipient
  recipient: string;               // Email or phone number
  recipientHash?: string;          // SHA-256 hash for audit logs

  // Content
  subject?: string;                // For email
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

type NotificationType = 'email' | 'whatsapp';

type NotificationChannel = 'resend_api' | 'evolution_api';

type NotificationEvent =
  | 'booking_confirmation'
  | 'booking_reminder'            // 24h before
  | 'cancellation_confirmation'
  | 'rescheduling_confirmation';

type NotificationStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'retry_scheduled';
```

### Zod Validation Schema
```typescript
export const NotificationSchema = z.object({
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid(),

  type: z.enum(['email', 'whatsapp']),
  channel: z.enum(['resend_api', 'evolution_api']),
  event: z.enum([
    'booking_confirmation',
    'booking_reminder',
    'cancellation_confirmation',
    'rescheduling_confirmation'
  ]),

  recipient: z.union([
    z.string().email(),              // Email
    z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)  // Phone
  ]),

  message: z.string().min(10).max(1000),

  status: z.enum(['pending', 'sent', 'delivered', 'failed', 'retry_scheduled']),

  retryCount: z.number().int().min(0).max(3)
});
```

### Business Rules
1. **Dual Delivery**: Always send both email AND WhatsApp (FR-020, FR-020a)
2. **Retry Logic**: Max 3 retry attempts with exponential backoff
3. **Delivery Confirmation**: Log success/failure for audit trail
4. **LGPD**: Hash recipient in audit logs (recipientHash)
5. **Templates**: Predefined message templates for each event type

### State Machine
```typescript
const notificationStateMachine = {
  pending: ['sent', 'failed'],
  sent: ['delivered', 'failed'],
  delivered: [],                   // Terminal state (success)
  failed: ['retry_scheduled'],
  retry_scheduled: ['sent', 'failed']
};
```

### Relationships
- **Belongs To**: Appointment
- **Belongs To**: Patient

---

## 7. Queued Request (Requisição Enfileirada)

### Purpose
Failed API operation awaiting retry or manual processing

### TypeScript Interface
```typescript
interface QueuedRequest {
  // Identification
  id: string;                      // UUID

  // Request details
  requestType: QueuedRequestType;
  endpoint: string;                // Ninsaúde API endpoint
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload: unknown;                // Request body

  // Patient context
  patientData?: Partial<Patient>;  // For manual processing
  appointmentData?: Partial<Appointment>;

  // Retry tracking
  retryCount: number;
  maxRetries: number;              // Default 3
  nextRetryAt?: Date;
  lastError?: string;

  // Status
  status: QueuedRequestStatus;
  createdAt: Date;
  processedAt?: Date;
  escalatedAt?: Date;

  // TTL
  expiresAt: Date;                 // 24h from creation
}

type QueuedRequestType =
  | 'patient_registration'
  | 'appointment_booking'
  | 'appointment_cancellation'
  | 'appointment_rescheduling';

type QueuedRequestStatus =
  | 'queued'
  | 'retrying'
  | 'completed'
  | 'failed'
  | 'escalated_to_manual';
```

### Zod Validation Schema
```typescript
export const QueuedRequestSchema = z.object({
  requestType: z.enum([
    'patient_registration',
    'appointment_booking',
    'appointment_cancellation',
    'appointment_rescheduling'
  ]),

  endpoint: z.string().url(),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']),
  payload: z.unknown(),

  retryCount: z.number().int().min(0).max(3),
  maxRetries: z.number().int().positive(),

  status: z.enum([
    'queued', 'retrying', 'completed', 'failed', 'escalated_to_manual'
  ]),

  expiresAt: z.date().refine(
    (date) => date > new Date(),
    'Expiry must be in the future'
  )
});
```

### Business Rules
1. **Retry Strategy**: Exponential backoff (1s, 2s, 4s) max 3 attempts (NFR-005a)
2. **Queue Persistence**: Store in Redis with 24h TTL (NFR-005b)
3. **Background Worker**: Process queue every 5 minutes
4. **Manual Escalation**: After 24h or 3 failed retries → escalate (NFR-005c)
5. **Patient Notification**: Notify patient when escalated to manual (NFR-005d)
6. **FIFO Processing**: Process oldest requests first

### State Machine
```typescript
const queuedRequestStateMachine = {
  queued: ['retrying', 'escalated_to_manual'],
  retrying: ['completed', 'failed', 'queued'],
  completed: [],                   // Terminal state (success)
  failed: ['escalated_to_manual'],
  escalated_to_manual: []          // Terminal state (requires human)
};
```

### Relationships
- **References**: Patient data (not FK, just payload)
- **References**: Appointment data

---

## 8. OAuth Token (Cache Only)

### Purpose
OAuth2 access token for Ninsaúde API authentication

### TypeScript Interface
```typescript
interface OAuthToken {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;              // Seconds (900 = 15 minutes)
  issued_at: number;               // Unix timestamp
}

interface CachedToken {
  token: OAuthToken;
  expiresAt: number;               // Unix timestamp
  refreshThreshold: number;        // Refresh when within 60s of expiry
}
```

### Business Rules
1. **Cache Duration**: 14 minutes (840 seconds) - 1 minute before actual expiry (FR-015)
2. **Auto-Refresh**: Middleware checks and refreshes if within 60s of expiry (FR-016)
3. **No Persistence**: Never store in database, Redis cache only
4. **Backend Only**: Frontend never receives raw tokens

### Storage
```typescript
// Redis key structure
const key = 'ninsaude:oauth_token';
const ttl = 840; // 14 minutes

await redis.setex(key, ttl, JSON.stringify(cachedToken));
```

---

## 9. Entity Relationship Diagram

```
┌─────────────────┐
│   Care Unit     │
│  (Read-Only)    │
└────────┬────────┘
         │
         │ works_at (many-to-many)
         │
┌────────▼────────┐         ┌──────────────────┐
│  Professional   │─────────│ Available Slots  │
│  (Read-Only)    │  has    │  (Ephemeral)     │
└────────┬────────┘         └──────────────────┘
         │
         │ performs (one-to-many)
         │
┌────────▼────────┐         ┌──────────────────┐
│  Appointment    │─────────│   Notification   │
│                 │  has    │                  │
└────────┬────────┘         └──────────────────┘
         │
         │ belongs_to (many-to-one)
         │
┌────────▼────────┐         ┌──────────────────┐
│    Patient      │         │ Queued Request   │
│                 │─────────│  (Redis Queue)   │
└─────────────────┘ ref by └──────────────────┘


Legend:
────  Relationship (Ninsaúde enforced)
─ ─   Soft reference (no FK)
```

---

## 10. Validation Utilities

### Shared Validators
```typescript
// src/lib/validators.ts (shared across frontend/backend)

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/[^\d]/g, '');
  if (cleaned.length !== 11 || /^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  // Calculate check digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  const digit1 = 11 - (sum % 11);
  const check1 = digit1 >= 10 ? 0 : digit1;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  const digit2 = 11 - (sum % 11);
  const check2 = digit2 >= 10 ? 0 : digit2;

  return cleaned[9] === String(check1) && cleaned[10] === String(check2);
}

export function isValidAge(birthDate: string): boolean {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  return age >= 0 && age <= 120;
}

export function isFutureDateTime(dateTime: string): boolean {
  return new Date(dateTime) > new Date();
}

export function isBusinessHours(dateTime: string): boolean {
  const date = new Date(dateTime);
  const day = date.getDay(); // 0=Sunday, 6=Saturday
  const hour = date.getHours();

  // Monday-Friday, 8:00-18:00
  return day >= 1 && day <= 5 && hour >= 8 && hour < 18;
}
```

---

## 11. LGPD Compliance Notes

### Data Minimization (Article 6)
- Only collect data required for appointment booking
- No storage of medical history or diagnoses on website
- Ninsaúde handles long-term data retention

### Pseudonymization (Article 46)
- CPF hashed (SHA-256) in all audit logs
- Email/phone hashed when logging
- Never log full PII in application logs

### Data Retention
- **Redis cache**: Max 24h TTL (tokens 14min, queue 24h)
- **Audit logs**: 5 years (LGPD Article 48 + CFM requirements)
- **No local database**: Zero retention, Ninsaúde is source of truth

### Consent (Article 7)
- Explicit consent checkbox on registration form
- Purpose: "agendamento de consultas e comunicação sobre atendimentos"
- Stored in Ninsaúde, not locally

---

**Data Model Complete**: All entities defined with TypeScript interfaces, Zod schemas, business rules, and state machines
