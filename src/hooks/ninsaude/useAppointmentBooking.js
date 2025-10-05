/**
 * Custom hook for appointment booking workflow
 *
 * Provides multi-step booking wizard state management with:
 * - Step validation and progression logic
 * - Data persistence across steps
 * - Slot availability checking before confirmation
 *
 * Steps:
 * 1. Patient Registration (skip if existing patient)
 * 2. Select Professional/Specialty
 * 3. Select Date & Time Slot
 * 4. Review & Confirm
 * 5. Confirmation Success
 *
 * @example
 * const {
 *   currentStep,
 *   bookingData,
 *   goToNextStep,
 *   goToPreviousStep,
 *   updateBookingData,
 *   canProceed
 * } = useAppointmentBooking({
 *   onBookingComplete: (appointment) => console.log('Booked!', appointment)
 * });
 */

import { useState, useCallback, useMemo } from 'react';
import { useNinsaude } from './useNinsaude';

// Booking wizard steps
const STEPS = {
  PATIENT_REGISTRATION: 1,
  SELECT_PROFESSIONAL: 2,
  SELECT_DATETIME: 3,
  REVIEW_CONFIRM: 4,
  SUCCESS: 5,
};

const STEP_NAMES = {
  [STEPS.PATIENT_REGISTRATION]: 'Cadastro do Paciente',
  [STEPS.SELECT_PROFESSIONAL]: 'Escolha o Profissional',
  [STEPS.SELECT_DATETIME]: 'Escolha Data e Horário',
  [STEPS.REVIEW_CONFIRM]: 'Revisão e Confirmação',
  [STEPS.SUCCESS]: 'Confirmação',
};

// Initial booking data
const INITIAL_BOOKING_DATA = {
  // Step 1: Patient
  patient: null,
  patientId: null,

  // Step 2: Professional
  professionalId: null,
  professionalName: null,
  specialty: null,
  careUnitId: null,
  careUnitName: null,

  // Step 3: DateTime
  selectedDate: null,
  selectedTime: null,
  selectedSlot: null,

  // Step 4: Additional info
  appointmentType: 'first_visit',
  patientNotes: '',

  // Result
  appointment: null,
};

/**
 * Appointment booking workflow hook
 */
export function useAppointmentBooking(options = {}) {
  const {
    onBookingComplete = () => {},
    onStepChange = () => {},
    onError = () => {},
    initialStep = STEPS.PATIENT_REGISTRATION,
  } = options;

  const { getAvailability, bookAppointment, loading: ninsaudeLoading } = useNinsaude();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [bookingData, setBookingData] = useState(INITIAL_BOOKING_DATA);
  const [stepErrors, setStepErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Availability state
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  /**
   * Update booking data
   */
  const updateBookingData = useCallback((updates) => {
    setBookingData(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  /**
   * Validate step data
   */
  const validateStep = useCallback((step) => {
    const errors = {};

    switch (step) {
      case STEPS.PATIENT_REGISTRATION:
        if (!bookingData.patient || !bookingData.patientId) {
          errors.patient = 'Dados do paciente são obrigatórios';
        }
        break;

      case STEPS.SELECT_PROFESSIONAL:
        if (!bookingData.professionalId) {
          errors.professional = 'Selecione um profissional';
        }
        if (!bookingData.careUnitId) {
          errors.careUnit = 'Unidade de atendimento não definida';
        }
        break;

      case STEPS.SELECT_DATETIME:
        if (!bookingData.selectedDate) {
          errors.date = 'Selecione uma data';
        }
        if (!bookingData.selectedTime) {
          errors.time = 'Selecione um horário';
        }
        if (!bookingData.selectedSlot) {
          errors.slot = 'Slot de agendamento não definido';
        }
        break;

      case STEPS.REVIEW_CONFIRM:
        if (!bookingData.appointmentType) {
          errors.appointmentType = 'Tipo de consulta é obrigatório';
        }
        break;

      default:
        break;
    }

    setStepErrors(prev => ({
      ...prev,
      [step]: errors,
    }));

    return Object.keys(errors).length === 0;
  }, [bookingData]);

  /**
   * Check if can proceed to next step
   */
  const canProceed = useMemo(() => {
    return validateStep(currentStep);
  }, [currentStep, validateStep]);

  /**
   * Go to next step
   */
  const goToNextStep = useCallback(async () => {
    // Validate current step
    const isValid = validateStep(currentStep);

    if (!isValid) {
      onError(new Error('Por favor, complete todos os campos obrigatórios'));
      return false;
    }

    // Special handling for datetime step - check slot availability
    if (currentStep === STEPS.SELECT_DATETIME) {
      try {
        setIsProcessing(true);

        // Re-verify slot is still available
        const slots = await getAvailability({
          date: bookingData.selectedDate,
          professionalId: bookingData.professionalId,
        });

        const slotStillAvailable = slots.some(slot =>
          slot.dateTime === bookingData.selectedSlot.dateTime &&
          slot.available
        );

        if (!slotStillAvailable) {
          onError(new Error('Este horário não está mais disponível. Por favor, selecione outro horário.'));
          return false;
        }
      } catch (err) {
        onError(new Error('Erro ao verificar disponibilidade do horário'));
        return false;
      } finally {
        setIsProcessing(false);
      }
    }

    // Move to next step
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    onStepChange(nextStep);

    return true;
  }, [currentStep, bookingData, validateStep, getAvailability, onStepChange, onError]);

  /**
   * Go to previous step
   */
  const goToPreviousStep = useCallback(() => {
    if (currentStep > STEPS.PATIENT_REGISTRATION) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange(prevStep);
    }
  }, [currentStep, onStepChange]);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((step) => {
    if (step >= STEPS.PATIENT_REGISTRATION && step <= STEPS.SUCCESS) {
      setCurrentStep(step);
      onStepChange(step);
    }
  }, [onStepChange]);

  /**
   * Load available slots for selected professional and date
   */
  const loadAvailableSlots = useCallback(async (date, professionalId) => {
    setLoadingSlots(true);

    try {
      const slots = await getAvailability({
        date,
        professionalId: professionalId || bookingData.professionalId,
      });

      setAvailableSlots(slots || []);
      return slots;
    } catch (err) {
      console.error('Error loading slots:', err);
      setAvailableSlots([]);
      onError(new Error('Erro ao carregar horários disponíveis'));
      return [];
    } finally {
      setLoadingSlots(false);
    }
  }, [bookingData.professionalId, getAvailability, onError]);

  /**
   * Confirm booking - final step
   */
  const confirmBooking = useCallback(async () => {
    // Final validation
    if (!canProceed) {
      onError(new Error('Dados do agendamento incompletos'));
      return null;
    }

    setIsProcessing(true);

    try {
      // Prepare appointment data
      const appointmentData = {
        patientId: bookingData.patientId,
        professionalId: bookingData.professionalId,
        careUnitId: bookingData.careUnitId,
        dateTime: bookingData.selectedSlot.dateTime,
        duration: bookingData.selectedSlot.duration || 30,
        appointmentType: bookingData.appointmentType,
        specialty: bookingData.specialty,
        patientNotes: bookingData.patientNotes,
      };

      // Book appointment
      const appointment = await bookAppointment(appointmentData);

      // Update booking data with result
      updateBookingData({ appointment });

      // Move to success step
      setCurrentStep(STEPS.SUCCESS);
      onStepChange(STEPS.SUCCESS);

      // Call completion callback
      onBookingComplete(appointment);

      return appointment;

    } catch (err) {
      const error = new Error(err.message || 'Erro ao confirmar agendamento');
      onError(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [
    bookingData,
    canProceed,
    bookAppointment,
    updateBookingData,
    onBookingComplete,
    onStepChange,
    onError,
  ]);

  /**
   * Reset wizard
   */
  const resetWizard = useCallback(() => {
    setCurrentStep(STEPS.PATIENT_REGISTRATION);
    setBookingData(INITIAL_BOOKING_DATA);
    setStepErrors({});
    setAvailableSlots([]);
    setIsProcessing(false);
  }, []);

  /**
   * Skip patient registration (for existing patients)
   */
  const skipToSelectProfessional = useCallback((patient) => {
    updateBookingData({
      patient,
      patientId: patient.id,
    });
    setCurrentStep(STEPS.SELECT_PROFESSIONAL);
    onStepChange(STEPS.SELECT_PROFESSIONAL);
  }, [updateBookingData, onStepChange]);

  /**
   * Get progress percentage
   */
  const progressPercentage = useMemo(() => {
    const totalSteps = Object.keys(STEPS).length;
    return Math.round((currentStep / totalSteps) * 100);
  }, [currentStep]);

  /**
   * Check if on final step
   */
  const isLastStep = useMemo(() => {
    return currentStep === STEPS.REVIEW_CONFIRM;
  }, [currentStep]);

  /**
   * Check if on first step
   */
  const isFirstStep = useMemo(() => {
    return currentStep === STEPS.PATIENT_REGISTRATION;
  }, [currentStep]);

  return {
    // Step constants
    STEPS,
    STEP_NAMES,

    // Current state
    currentStep,
    currentStepName: STEP_NAMES[currentStep],
    bookingData,
    stepErrors: stepErrors[currentStep] || {},

    // Loading states
    isProcessing: isProcessing || ninsaudeLoading,
    loadingSlots,

    // Availability
    availableSlots,

    // Navigation
    goToNextStep,
    goToPreviousStep,
    goToStep,
    canProceed,
    isFirstStep,
    isLastStep,

    // Data management
    updateBookingData,

    // Utilities
    loadAvailableSlots,
    confirmBooking,
    resetWizard,
    skipToSelectProfessional,

    // Progress
    progressPercentage,
  };
}

export default useAppointmentBooking;
