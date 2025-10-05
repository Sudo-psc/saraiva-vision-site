/**
 * Appointment Booking Form Component
 * Multi-step wizard for complete appointment booking flow
 * Steps: (1) CPF/Patient → (2) Slot Selection → (3) Confirmation
 * @module components/ninsaude/AppointmentBookingForm
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import PatientRegistrationForm from './PatientRegistrationForm';
import AppointmentSlotPicker from './AppointmentSlotPicker';

const STEPS = {
  CPF_PATIENT: 1,
  SLOT_SELECTION: 2,
  CONFIRMATION: 3
};

const STEP_LABELS = {
  [STEPS.CPF_PATIENT]: 'Identificação',
  [STEPS.SLOT_SELECTION]: 'Escolha o Horário',
  [STEPS.CONFIRMATION]: 'Confirmação'
};

/**
 * Format CPF input with mask 000.000.000-00
 */
const formatCPF = (value) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

/**
 * Validate CPF using Verhoeff algorithm
 */
const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

const AppointmentBookingForm = ({
  onSubmit,
  onCancel,
  availableSlots = [],
  professionals = [],
  isLoadingSlots = false,
  isSubmitting = false,
  onPatientLookup,
  className
}) => {
  const [currentStep, setCurrentStep] = useState(STEPS.CPF_PATIENT);
  const [cpf, setCpf] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [isCheckingCPF, setIsCheckingCPF] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Handle CPF input
  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
    if (cpfError) setCpfError('');
  };

  // Verify CPF and check if patient exists
  const handleCPFVerification = async () => {
    if (!validateCPF(cpf)) {
      setCpfError('CPF inválido');
      return;
    }

    setIsCheckingCPF(true);
    setCpfError('');

    try {
      // Call patient lookup callback
      if (onPatientLookup) {
        const result = await onPatientLookup(cpf.replace(/\D/g, ''));

        if (result.found) {
          // Existing patient found
          setPatientData(result.patient);
          setIsNewPatient(false);
          setCurrentStep(STEPS.SLOT_SELECTION);
        } else {
          // New patient - show registration form
          setPatientData({ cpf });
          setIsNewPatient(true);
        }
      } else {
        // No lookup callback - assume new patient
        setPatientData({ cpf });
        setIsNewPatient(true);
      }
    } catch (error) {
      setCpfError('Erro ao verificar CPF. Tente novamente.');
    } finally {
      setIsCheckingCPF(false);
    }
  };

  // Handle patient registration
  const handlePatientRegistration = (data) => {
    setPatientData(data);
    setIsNewPatient(false);
    setCurrentStep(STEPS.SLOT_SELECTION);
  };

  // Handle slot selection
  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
  };

  // Handle professional filter change
  const handleProfessionalChange = (professionalId) => {
    setSelectedProfessional(professionalId);
  };

  // Navigate to next step
  const handleNext = () => {
    if (currentStep === STEPS.SLOT_SELECTION && selectedSlot) {
      setCurrentStep(STEPS.CONFIRMATION);
    }
  };

  // Navigate to previous step
  const handleBack = () => {
    if (currentStep === STEPS.CONFIRMATION) {
      setCurrentStep(STEPS.SLOT_SELECTION);
    } else if (currentStep === STEPS.SLOT_SELECTION) {
      setCurrentStep(STEPS.CPF_PATIENT);
      setSelectedSlot(null);
    }
  };

  // Handle final booking confirmation
  const handleConfirmBooking = async () => {
    if (!patientData || !selectedSlot) {
      setBookingError('Dados incompletos. Por favor, verifique as informações.');
      return;
    }

    try {
      setBookingError(null);
      await onSubmit?.({
        patient: patientData,
        slot: selectedSlot,
        professionalId: selectedSlot.professionalId
      });
    } catch (error) {
      setBookingError(error.message || 'Erro ao confirmar agendamento. Tente novamente.');
    }
  };

  // Reset form
  const handleReset = () => {
    setCurrentStep(STEPS.CPF_PATIENT);
    setCpf('');
    setCpfError('');
    setPatientData(null);
    setIsNewPatient(false);
    setSelectedSlot(null);
    setSelectedProfessional(null);
    setBookingError(null);
  };

  return (
    <div className={cn('max-w-4xl mx-auto', className)} data-testid="appointment-booking-form">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {Object.entries(STEP_LABELS).map(([step, label], idx) => {
            const stepNum = parseInt(step);
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;

            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200',
                      isActive && 'bg-blue-600 text-white ring-4 ring-blue-100',
                      isCompleted && 'bg-green-600 text-white',
                      !isActive && !isCompleted && 'bg-gray-200 text-gray-600'
                    )}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <span>{stepNum}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-xs sm:text-sm font-medium mt-2 text-center',
                      isActive && 'text-blue-600',
                      isCompleted && 'text-green-600',
                      !isActive && !isCompleted && 'text-gray-500'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {idx < Object.keys(STEP_LABELS).length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2 transition-all duration-200',
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    )}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
        {/* Step 1: CPF Verification or Patient Registration */}
        {currentStep === STEPS.CPF_PATIENT && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Identificação do Paciente</h2>
              <p className="text-sm text-gray-600">
                Informe seu CPF para verificar se já está cadastrado ou realizar novo cadastro
              </p>
            </div>

            {!isNewPatient ? (
              // CPF Input
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf-input" className="text-sm font-medium text-gray-700">
                    CPF *
                  </Label>
                  <Input
                    id="cpf-input"
                    value={cpf}
                    onChange={handleCPFChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleCPFVerification()}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={cn(cpfError && 'border-red-500 focus-visible:ring-red-500')}
                    aria-invalid={cpfError ? 'true' : 'false'}
                    aria-describedby={cpfError ? 'cpf-error' : undefined}
                  />
                  {cpfError && (
                    <p id="cpf-error" className="text-sm text-red-600" role="alert">
                      {cpfError}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleCPFVerification}
                  disabled={cpf.length !== 14 || isCheckingCPF}
                  variant="medical"
                  size="lg"
                  className="w-full"
                >
                  {isCheckingCPF ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Verificando...</span>
                    </div>
                  ) : (
                    'Continuar'
                  )}
                </Button>
              </div>
            ) : (
              // Patient Registration Form
              <div>
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    CPF não encontrado no sistema. Por favor, preencha o cadastro abaixo para continuar.
                  </p>
                </div>
                <PatientRegistrationForm
                  onSubmit={handlePatientRegistration}
                  initialData={{ cpf }}
                  isLoading={false}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Slot Selection */}
        {currentStep === STEPS.SLOT_SELECTION && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha o Horário</h2>
              <p className="text-sm text-gray-600">
                Selecione a data e horário de sua preferência
              </p>
            </div>

            {/* Patient Info Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{patientData?.name}</p>
                  <p className="text-xs text-gray-600">CPF: {patientData?.cpf}</p>
                </div>
              </div>
            </div>

            <AppointmentSlotPicker
              availableSlots={availableSlots}
              onSlotSelect={handleSlotSelection}
              selectedSlot={selectedSlot}
              isLoading={isLoadingSlots}
              professionals={professionals}
              selectedProfessional={selectedProfessional}
              onProfessionalChange={handleProfessionalChange}
            />

            <div className="flex space-x-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={handleNext}
                disabled={!selectedSlot}
                variant="medical"
                className="flex-1"
              >
                Continuar
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === STEPS.CONFIRMATION && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmação de Agendamento</h2>
              <p className="text-sm text-gray-600">
                Revise os dados antes de confirmar seu agendamento
              </p>
            </div>

            {/* Appointment Summary */}
            <div className="space-y-4">
              {/* Patient Information */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Dados do Paciente</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Nome:</span>
                    <p className="font-medium text-gray-900">{patientData?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">CPF:</span>
                    <p className="font-medium text-gray-900">{patientData?.cpf}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Telefone:</span>
                    <p className="font-medium text-gray-900">{patientData?.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">E-mail:</span>
                    <p className="font-medium text-gray-900">{patientData?.email}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Detalhes da Consulta</span>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="text-gray-600">Data e Horário:</span>
                      <p className="font-medium text-gray-900">
                        {selectedSlot && format(new Date(selectedSlot.datetime), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  {selectedSlot?.professionalName && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <div>
                        <span className="text-gray-600">Profissional:</span>
                        <p className="font-medium text-gray-900">{selectedSlot.professionalName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {bookingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{bookingError}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1"
                disabled={isSubmitting}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                variant="medical"
                size="lg"
                className="flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Confirmando...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-800 leading-relaxed">
                <strong>Importante:</strong> Você receberá uma confirmação por e-mail e WhatsApp.
                Em caso de necessidade de cancelamento, entre em contato com antecedência mínima de 24 horas.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Button */}
      {onCancel && (
        <div className="mt-4 text-center">
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
            disabled={isSubmitting}
          >
            Cancelar agendamento
          </button>
        </div>
      )}

      {/* Accessibility Announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {currentStep === STEPS.CPF_PATIENT && 'Etapa 1: Identificação do paciente'}
        {currentStep === STEPS.SLOT_SELECTION && 'Etapa 2: Escolha do horário'}
        {currentStep === STEPS.CONFIRMATION && 'Etapa 3: Confirmação do agendamento'}
        {isSubmitting && 'Processando agendamento...'}
      </div>
    </div>
  );
};

export default AppointmentBookingForm;
