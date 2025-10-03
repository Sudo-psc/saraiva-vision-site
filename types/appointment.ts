/**
 * Appointment API Type Definitions
 * Saraiva Vision - Appointment Booking System
 * LGPD Compliant
 */

export interface TimeSlot {
  slot_time: string;
  is_available: boolean;
  slot_id?: string;
}

export interface AppointmentData {
  id?: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export interface AvailabilityRequestParams {
  days?: number;
  startDate?: string;
  endDate?: string;
}

export interface AvailabilityData {
  availability: Record<string, TimeSlot[]>;
  schedulingEnabled: boolean;
  contact: {
    whatsapp: string;
    phone: string;
    phoneDisplay: string;
    externalUrl: string;
  };
}

export interface AvailabilityResponse {
  success: boolean;
  data?: AvailabilityData;
  error?: {
    message: string;
    code?: string;
  };
  timestamp: string;
}

export interface CreateAppointmentRequest {
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
  honeypot?: string;
}

export interface CreateAppointmentResponse {
  success: boolean;
  data?: {
    id: string;
    appointment: AppointmentData;
    confirmationSent: boolean;
  };
  error?: {
    message: string;
    code?: 'SLOT_UNAVAILABLE' | 'VALIDATION_ERROR' | 'RATE_LIMIT' | 'INTERNAL_ERROR';
  };
  timestamp: string;
}

export interface ListAppointmentsParams {
  startDate?: string;
  endDate?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface ListAppointmentsResponse {
  success: boolean;
  data?: {
    appointments: AppointmentData[];
    total: number;
    limit: number;
    offset: number;
  };
  error?: {
    message: string;
    code?: string;
  };
  timestamp: string;
}
