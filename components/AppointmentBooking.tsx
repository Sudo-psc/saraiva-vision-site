'use client';

/**
 * Appointment Booking Component - Next.js App Router
 * Patient-facing appointment scheduling interface
 * WCAG 2.1 AA compliant, LGPD compliant
 * Features: Date/time selection, form validation, optimistic updates, accessibility
 */

import React, { useState, useCallback, useTransition, useRef, useEffect } from 'react';
import { MessageCircle, Phone, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { z } from 'zod';
import type {
  AvailabilityResponse,
  CreateAppointmentResponse,
  AppointmentData,
  TimeSlot,
} from '@/types/appointment';
import { clinicInfo } from '@/lib/clinicInfo';
import { formatDateBR, formatTimeBR, getDayNameBR } from '@/lib/appointmentAvailability';

const appointmentSchema = z.object({
  patient_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Nome deve conter apenas letras'),
  patient_email: z
    .string()
    .email('Email deve ter um formato válido')
    .max(100, 'Email muito longo'),
  patient_phone: z
    .string()
    .regex(
      /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/,
      'Telefone deve ter um formato válido (ex: (11) 99999-9999)'
    ),
  notes: z.string().max(500, 'Observações devem ter no máximo 500 caracteres').optional(),
  lgpd_consent: z.boolean().refine((val) => val === true, {
    message: 'Você deve concordar com os termos de privacidade',
  }),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface ContactInfo {
  whatsapp: string;
  phone: string;
  phoneDisplay: string;
  externalUrl?: string;
}

interface AvailabilityState {
  data: AvailabilityResponse | null;
  error: string | null;
  isLoading: boolean;
}

const AppointmentBooking: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [patientData, setPatientData] = useState<AppointmentFormData>({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    notes: '',
    lgpd_consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState(false);
  const [appointmentResult, setAppointmentResult] = useState<AppointmentData | null>(null);
  const [, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorAnnouncerRef = useRef<HTMLDivElement>(null);

  const [availabilityState, setAvailabilityState] = useState<AvailabilityState>({
    data: null,
    error: null,
    isLoading: true,
  });

  const loadAvailability = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setAvailabilityState((prev) => ({ ...prev, isLoading: true }));
    }

    try {
      const response = await fetch('/api/appointments/availability?days=14');
      const result: AvailabilityResponse = await response.json();

      if (response.ok && result.success) {
        setAvailabilityState({
          data: result,
          error: null,
          isLoading: false,
        });
      } else {
        setAvailabilityState({
          data: null,
          error: result.error?.message || 'Erro ao carregar disponibilidade',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      setAvailabilityState({
        data: null,
        error: 'Erro ao carregar disponibilidade. Verifique sua conexão.',
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    loadAvailability();

    const intervalId = setInterval(() => {
      loadAvailability(false);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [loadAvailability]);

  const availability = availabilityState.data?.data?.availability || {};
  const schedulingEnabled = availabilityState.data?.data?.schedulingEnabled !== false;
  const contactInfo: ContactInfo = availabilityState.data?.data?.contact || {
    whatsapp: clinicInfo.whatsapp,
    phone: clinicInfo.phone,
    phoneDisplay: clinicInfo.phoneDisplay,
    externalUrl: clinicInfo.onlineSchedulingUrl,
  };

  const announceError = useCallback((message: string) => {
    setGlobalError(message);
    if (errorAnnouncerRef.current) {
      errorAnnouncerRef.current.textContent = message;
    }
  }, []);

  const handleDateTimeSelection = useCallback(
    (date: string, time: string) => {
      startTransition(() => {
        setSelectedDate(date);
        setSelectedTime(time);
        setStep(2);
        setErrors({});
        setGlobalError('');
      });
    },
    []
  );

  const handleInputChange = useCallback(
    (field: keyof AppointmentFormData, value: string | boolean) => {
      setPatientData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      setGlobalError('');
    },
    []
  );

  const validateForm = useCallback((): boolean => {
    try {
      appointmentSchema.parse(patientData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        announceError('Por favor, corrija os erros no formulário');
      }
      return false;
    }
  }, [patientData, announceError]);

  const handleSubmitAppointment = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setGlobalError('');

    try {
      const appointmentPayload = {
        ...patientData,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentPayload),
      });

      const result: CreateAppointmentResponse = await response.json();

      if (result.success && result.data) {
        setAppointmentResult(result.data.appointment);
        setSuccess(true);
        setStep(3);
        loadAvailability();
      } else {
        if (result.error?.code === 'SLOT_UNAVAILABLE') {
          announceError('Este horário não está mais disponível. Por favor, escolha outro horário.');
          setStep(1);
          loadAvailability();
        } else {
          announceError(result.error?.message || 'Erro ao agendar consulta. Tente novamente.');
        }
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      announceError('Erro ao agendar consulta. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, patientData, selectedDate, selectedTime, announceError, loadAvailability]);

  const resetBooking = useCallback(() => {
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setPatientData({
      patient_name: '',
      patient_email: '',
      patient_phone: '',
      notes: '',
      lgpd_consent: false,
    });
    setErrors({});
    setGlobalError('');
    setSuccess(false);
    setAppointmentResult(null);
    loadAvailability();
  }, [loadAvailability]);

  const whatsappLink = contactInfo.whatsapp
    ? `https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        'Olá! Gostaria de agendar uma consulta na Saraiva Vision.'
      )}`
    : null;
  const phoneLink = contactInfo.phone ? `tel:${contactInfo.phone.replace(/\D/g, '')}` : null;

  const renderContactOptions = ({ title, description }: { title: string; description: string }) => (
    <div className="space-y-4 text-center">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{description}</p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label={`Abrir WhatsApp para contato ${contactInfo.phoneDisplay || ''}`}
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            WhatsApp {contactInfo.phoneDisplay || ''}
          </a>
        )}
        {phoneLink && (
          <a
            href={phoneLink}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-blue-600 text-blue-700 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`Ligar para ${contactInfo.phoneDisplay || 'a clínica'}`}
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            Ligar {contactInfo.phoneDisplay ? `(${contactInfo.phoneDisplay})` : ''}
          </a>
        )}
        {contactInfo.externalUrl && (
          <a
            href={contactInfo.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Abrir agenda externa"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            Abrir agenda externa
          </a>
        )}
      </div>
    </div>
  );

  if (!schedulingEnabled && !availabilityState.error && availabilityState.data) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-6">
            <h2 className="text-2xl font-bold">Agendamento Online Temporariamente Indisponível</h2>
            <p className="mt-2 opacity-90">Nossa equipe está atualizando os horários disponíveis.</p>
          </div>
          <div className="p-6 space-y-6">
            {renderContactOptions({
              title: 'Agende agora com nossa equipe',
              description: 'Entre em contato pelos canais abaixo e finalizaremos seu agendamento imediatamente.',
            })}
            <p className="text-xs text-gray-500 text-center">
              Agenda online indisponível. Assim que normalizar, atualizaremos automaticamente aqui.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (availabilityState.error || (!availabilityState.data && !availabilityState.isLoading)) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-600 text-white p-6">
            <h2 className="text-2xl font-bold">Erro ao Carregar Disponibilidade</h2>
            <p className="mt-2 opacity-90">Não foi possível carregar os horários disponíveis.</p>
          </div>
          <div className="p-6 space-y-6">
            {renderContactOptions({
              title: 'Entre em contato conosco',
              description: 'Nossa equipe pode ajudá-lo a agendar sua consulta.',
            })}
            <button
              onClick={() => loadAvailability()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Tentar carregar horários novamente"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (availabilityState.isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" aria-hidden="true" />
          <p className="mt-4 text-gray-600">Carregando horários disponíveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div
        className="bg-white rounded-lg shadow-lg overflow-hidden"
        role="region"
        aria-label="Formulário de agendamento de consulta"
      >
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl font-bold">Agendar Consulta</h1>
          <p className="mt-2 opacity-90">Dr. Philipe Saraiva - Oftalmologista</p>
        </div>

        <div className="bg-gray-50 px-6 py-4">
          <nav aria-label="Progresso do agendamento">
            <ol className="flex items-center justify-between">
              <li className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'
                  }`}
                  aria-current={step === 1 ? 'step' : undefined}
                >
                  1
                </div>
                <span className="ml-2 font-medium">Escolher Horário</span>
              </li>
              <li className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'
                  }`}
                  aria-current={step === 2 ? 'step' : undefined}
                >
                  2
                </div>
                <span className="ml-2 font-medium">Dados Pessoais</span>
              </li>
              <li className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'
                  }`}
                  aria-current={step === 3 ? 'step' : undefined}
                >
                  3
                </div>
                <span className="ml-2 font-medium">Confirmação</span>
              </li>
            </ol>
          </nav>
        </div>

        <div
          ref={errorAnnouncerRef}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="sr-only"
        />

        {globalError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6" role="alert">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" aria-hidden="true" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{globalError}</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Escolha a data e horário</h2>

            {Object.keys(availability).length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-gray-600">Não há horários disponíveis no momento.</p>
                {renderContactOptions({
                  title: 'Fale com a recepção',
                  description: 'Nosso time pode encontrar o melhor horário para você por telefone ou WhatsApp.',
                })}
                <button
                  onClick={() => loadAvailability()}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Atualizar horários disponíveis"
                >
                  Atualizar horários
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {Object.entries(availability).map(([date, slots]) => (
                  <div key={date} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      {getDayNameBR(date)}, {formatDateBR(date)}
                    </h3>
                    <div
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                      role="group"
                      aria-label={`Horários disponíveis para ${getDayNameBR(date)}, ${formatDateBR(date)}`}
                    >
                      {(slots as TimeSlot[]).map((slot) => (
                        <button
                          key={`${date}-${slot.slot_time}`}
                          onClick={() => handleDateTimeSelection(date, slot.slot_time)}
                          disabled={!slot.is_available}
                          className="px-3 py-2 border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label={`Selecionar horário ${formatTimeBR(slot.slot_time)}`}
                          aria-disabled={!slot.is_available}
                        >
                          {formatTimeBR(slot.slot_time)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Dados pessoais</h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800">Horário selecionado:</h3>
              <p className="text-blue-700">
                {getDayNameBR(selectedDate)}, {formatDateBR(selectedDate)} às {formatTimeBR(selectedTime)}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmitAppointment();
              }}
              className="grid gap-4"
            >
              <div>
                <label htmlFor="patient_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo <span aria-label="obrigatório">*</span>
                </label>
                <input
                  type="text"
                  id="patient_name"
                  value={patientData.patient_name}
                  onChange={(e) => handleInputChange('patient_name', e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errors.patient_name ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Seu nome completo"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.patient_name}
                  aria-describedby={errors.patient_name ? 'patient_name-error' : undefined}
                />
                {errors.patient_name && (
                  <p id="patient_name-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.patient_name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="patient_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span aria-label="obrigatório">*</span>
                </label>
                <input
                  type="email"
                  id="patient_email"
                  value={patientData.patient_email}
                  onChange={(e) => handleInputChange('patient_email', e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errors.patient_email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="seu@email.com"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.patient_email}
                  aria-describedby={errors.patient_email ? 'patient_email-error' : undefined}
                />
                {errors.patient_email && (
                  <p id="patient_email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.patient_email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="patient_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone <span aria-label="obrigatório">*</span>
                </label>
                <input
                  type="tel"
                  id="patient_phone"
                  value={patientData.patient_phone}
                  onChange={(e) => handleInputChange('patient_phone', e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errors.patient_phone ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="(11) 99999-9999"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.patient_phone}
                  aria-describedby={errors.patient_phone ? 'patient_phone-error' : undefined}
                />
                {errors.patient_phone && (
                  <p id="patient_phone-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.patient_phone}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Observações (opcional)
                </label>
                <textarea
                  id="notes"
                  value={patientData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className={`w-full px-3 py-2 border ${
                    errors.notes ? 'border-red-500' : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  rows={3}
                  placeholder="Informações adicionais sobre sua consulta..."
                  aria-describedby={errors.notes ? 'notes-error' : undefined}
                />
                {errors.notes && (
                  <p id="notes-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.notes}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="lgpd_consent"
                    checked={patientData.lgpd_consent}
                    onChange={(e) => handleInputChange('lgpd_consent', e.target.checked)}
                    className={`mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 ${
                      errors.lgpd_consent ? 'border-red-500' : ''
                    }`}
                    required
                    aria-required="true"
                    aria-invalid={!!errors.lgpd_consent}
                    aria-describedby="lgpd_consent-description lgpd_consent-error"
                  />
                  <label htmlFor="lgpd_consent" className="ml-2 text-sm text-gray-700">
                    <span id="lgpd_consent-description">
                      Concordo com o armazenamento dos meus dados pessoais de acordo com a{' '}
                      <a
                        href="/politica-de-privacidade"
                        className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Política de Privacidade (LGPD)
                      </a>{' '}
                      <span aria-label="obrigatório">*</span>
                    </span>
                  </label>
                </div>
                {errors.lgpd_consent && (
                  <p id="lgpd_consent-error" className="mt-1 ml-6 text-sm text-red-600" role="alert">
                    {errors.lgpd_consent}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">Após confirmar seu agendamento:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Você receberá um email de confirmação</li>
                  <li>Lembretes serão enviados 24h e 2h antes da consulta</li>
                  <li>Chegue com 15 minutos de antecedência</li>
                </ul>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  disabled={isSubmitting}
                  aria-label="Voltar para seleção de horário"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={isSubmitting ? 'Agendando consulta...' : 'Confirmar agendamento'}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  {isSubmitting ? 'Agendando...' : 'Agendar Consulta'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && success && appointmentResult && (
          <div className="p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Consulta agendada com sucesso!
              </h2>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-800 mb-2">Detalhes da consulta:</h3>
                <dl className="text-green-700 space-y-1">
                  <div>
                    <dt className="inline font-semibold">Paciente: </dt>
                    <dd className="inline">{appointmentResult.patient_name}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Data: </dt>
                    <dd className="inline">
                      {getDayNameBR(appointmentResult.appointment_date)},{' '}
                      {formatDateBR(appointmentResult.appointment_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Horário: </dt>
                    <dd className="inline">{formatTimeBR(appointmentResult.appointment_time)}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold">Status: </dt>
                    <dd className="inline">Pendente de confirmação</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-800 mb-2">Próximos passos:</h3>
                <ul className="text-blue-700 text-sm space-y-1" aria-label="Próximos passos">
                  <li className="flex items-start">
                    <span aria-hidden="true">✓ </span>
                    <span className="ml-1">Confirmação enviada por email e SMS</span>
                  </li>
                  <li className="flex items-start">
                    <span aria-hidden="true">✓ </span>
                    <span className="ml-1">Lembretes serão enviados 24h e 2h antes da consulta</span>
                  </li>
                  <li className="flex items-start">
                    <span aria-hidden="true">✓ </span>
                    <span className="ml-1">Chegue com 15 minutos de antecedência</span>
                  </li>
                  <li className="flex items-start">
                    <span aria-hidden="true">✓ </span>
                    <span className="ml-1">Traga documento com foto e óculos/lentes atuais</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={resetBooking}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Agendar uma nova consulta"
              >
                Agendar Nova Consulta
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;
