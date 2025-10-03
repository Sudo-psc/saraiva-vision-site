/**
 * Scheduling Type Definitions
 * Types for appointment scheduling and time slot management
 */

// Time slot types
export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  date?: Date;
}

export interface DaySchedule {
  date: Date;
  dayOfWeek: number;
  slots: TimeSlot[];
  isAvailable: boolean;
}

// Schedule dropdown types
export interface ScheduleDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
  className?: string;
}

export interface ScheduleOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
  ariaLabel: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

// Appointment types
export interface AppointmentType {
  id: string;
  name: string;
  duration: number; // in minutes
  description?: string;
  requiresExam?: boolean;
}

export interface AvailabilityConfig {
  timezone: string;
  businessHours: {
    [key: number]: { // day of week (0-6)
      open: string; // HH:mm format
      close: string;
      breaks?: Array<{
        start: string;
        end: string;
      }>;
    };
  };
  holidays: string[]; // ISO date strings
  blockedDates: string[];
  slotDuration: number; // in minutes
  advanceBookingDays: number;
  maxBookingDays: number;
}

// Booking types
export interface BookingRequest {
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  source: 'online' | 'whatsapp' | 'phone' | 'contact_form';
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  message: string;
  error?: string;
}

// Schedule state management
export interface ScheduleState {
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedAppointmentType: AppointmentType | null;
  availableSlots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
}

// Scheduling methods
export type SchedulingMethod = 'online' | 'whatsapp' | 'contact_form';

export interface SchedulingMethodConfig {
  method: SchedulingMethod;
  url: string;
  enabled: boolean;
  priority: number;
}

// Contact information for scheduling
export interface SchedulingContactInfo {
  phone: string;
  whatsapp: string;
  email: string;
  onlineSchedulingUrl?: string;
  whatsapp24hUrl?: string;
}

// Timezone handling
export interface TimezoneInfo {
  timezone: string;
  offset: number;
  abbreviation: string;
}

// Working hours display
export interface WorkingHours {
  dayName: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

// Schedule validation
export interface ScheduleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Analytics tracking
export interface SchedulingEvent {
  eventType: 'schedule_open' | 'method_selected' | 'booking_attempted' | 'booking_completed' | 'booking_failed';
  method?: SchedulingMethod;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
