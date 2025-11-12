import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, AlertCircle, Loader2, Phone,
  User, MessageSquare, Shield, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  trackFormStart,
  trackFieldInteraction,
  trackFieldCompletion,
  trackValidationError,
  trackFormSubmission,
  trackFormProgress,
  setupAbandonmentTracking,
  clearFormTracking
} from '@/utils/formTracking';
import {
  saveFormProgress,
  loadFormProgress,
  hasFormProgress,
  clearFormProgress
} from '@/utils/formAutoSave';

/**
 * Formulário Otimizado de Agendamento
 *
 * Versão A: 3 campos (nome, telefone, motivo)
 * Versão B: 4 campos (+ convênio)
 *
 * Features:
 * - Validação em tempo real com react-hook-form
 * - Auto-save de progresso
 * - Tracking GA4 completo
 * - Mobile-optimized (teclados apropriados)
 * - Mensagens de erro amigáveis
 * - Indicador de progresso visual
 * - Integração com API
 *
 * @author Dr. Philipe Saraiva Cruz
 */

const FORM_NAME = 'appointment_booking';

const MOTIVOS_CONSULTA = [
  { value: 'primeira-consulta', label: 'Primeira Consulta' },
  { value: 'retorno', label: 'Retorno' },
  { value: 'exame-vista', label: 'Exame de Vista para Óculos' },
  { value: 'lentes-contato', label: 'Lentes de Contato' },
  { value: 'cirurgia', label: 'Cirurgia (Catarata, Pterígio, etc.)' },
  { value: 'olho-seco', label: 'Olho Seco / Meibografia' },
  { value: 'glaucoma', label: 'Glaucoma' },
  { value: 'urgencia', label: 'Urgência Oftalmológica' },
  { value: 'outro', label: 'Outro' }
];

const CONVENIOS = [
  { value: 'particular', label: 'Particular (sem convênio)' },
  { value: 'unimed', label: 'Unimed' },
  { value: 'bradesco', label: 'Bradesco Saúde' },
  { value: 'amil', label: 'Amil' },
  { value: 'sulamerica', label: 'SulAmérica' },
  { value: 'notredame', label: 'NotreDame Intermédica' },
  { value: 'outros', label: 'Outro Convênio' }
];

const OptimizedAppointmentForm = ({ variant = 'A', onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);

  const totalFields = variant === 'B' ? 4 : 3;

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    setValue,
    reset
  } = useForm({
    mode: 'onBlur', // Valida no blur para não ser muito intrusivo
    reValidateMode: 'onChange' // Após primeira validação, valida em mudanças
  });

  const formValues = watch();

  // Contador de campos completados
  const fieldsCompleted = Object.values(formValues).filter(v =>
    v && String(v).trim().length > 0
  ).length;

  const progress = (fieldsCompleted / totalFields) * 100;

  // Track form start ao montar componente
  useEffect(() => {
    trackFormStart(FORM_NAME, variant);

    // Setup tracking de abandono
    const cleanup = setupAbandonmentTracking(
      FORM_NAME,
      () => fieldsCompleted,
      () => totalFields,
      variant
    );

    return cleanup;
  }, []);

  // Auto-save do progresso
  useEffect(() => {
    if (fieldsCompleted > 0) {
      saveFormProgress(FORM_NAME, formValues);
    }
  }, [formValues, fieldsCompleted]);

  // Track progress em milestones
  useEffect(() => {
    if (fieldsCompleted > 0) {
      trackFormProgress(FORM_NAME, fieldsCompleted, totalFields, variant);
    }
  }, [fieldsCompleted]);

  // Restaurar progresso salvo ao montar
  useEffect(() => {
    if (hasFormProgress(FORM_NAME)) {
      const saved = loadFormProgress(FORM_NAME);
      if (saved) {
        Object.keys(saved).forEach(key => {
          setValue(key, saved[key]);
        });
        setShowRestoredNotice(true);
        setTimeout(() => setShowRestoredNotice(false), 5000);
      }
    }
  }, []);

  // Formatar telefone
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  // Handler para telefone com máscara
  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setValue('telefone', formatted, { shouldValidate: touchedFields.telefone });
  };

  // Track field interactions
  const handleFieldFocus = (fieldName) => {
    trackFieldInteraction(FORM_NAME, fieldName, 'focus');
  };

  const handleFieldBlur = (fieldName) => {
    trackFieldInteraction(FORM_NAME, fieldName, 'blur');
    const hasValue = formValues[fieldName] && String(formValues[fieldName]).trim().length > 0;
    trackFieldCompletion(FORM_NAME, fieldName, hasValue);
  };

  // Track validation errors
  useEffect(() => {
    Object.keys(errors).forEach(fieldName => {
      const error = errors[fieldName];
      if (error && error.message) {
        trackValidationError(FORM_NAME, fieldName, error.message);
      }
    });
  }, [errors]);

  // Submit handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Envia para API
      const response = await fetch('/api/agendamento-otimizado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          variant,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar formulário');
      }

      const result = await response.json();

      // Track sucesso
      trackFormSubmission(FORM_NAME, true, variant);

      // Limpa storage
      clearFormProgress(FORM_NAME);
      clearFormTracking(FORM_NAME);

      // Callback de sucesso
      if (onSuccess) {
        onSuccess(result);
      }

      // Reset form
      reset();

    } catch (error) {
      console.error('Erro ao submeter formulário:', error);

      trackFormSubmission(FORM_NAME, false, variant, error.message);

      alert('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente ou entre em contato por telefone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Agende sua Consulta
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>&lt;1 min</span>
          </div>
        </div>
        <p className="text-gray-600">
          Preencha seus dados e entraremos em contato para confirmar
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {fieldsCompleted} de {totalFields} campos preenchidos
          </span>
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-500 to-blue-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Restored Notice */}
      <AnimatePresence>
        {showRestoredNotice && (
          <motion.div
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium">
                Progresso Restaurado
              </p>
              <p className="text-sm text-blue-700">
                Recuperamos os dados que você havia preenchido anteriormente.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nome Completo */}
        <div>
          <label htmlFor="nome" className="block text-sm font-semibold text-gray-700 mb-2">
            Nome Completo *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="nome"
              type="text"
              autoComplete="name"
              placeholder="Ex: João da Silva"
              className={`
                w-full pl-12 pr-4 py-3 border rounded-xl
                text-base
                focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                transition-all
                ${errors.nome
                  ? 'border-red-300 bg-red-50'
                  : touchedFields.nome && !errors.nome
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
                }
              `}
              {...register('nome', {
                required: 'Por favor, informe seu nome completo',
                minLength: {
                  value: 3,
                  message: 'Nome muito curto'
                },
                maxLength: {
                  value: 100,
                  message: 'Nome muito longo'
                },
                pattern: {
                  value: /^[a-zA-ZÀ-ÿ\s]+$/,
                  message: 'Nome deve conter apenas letras'
                }
              })}
              onFocus={() => handleFieldFocus('nome')}
              onBlur={() => handleFieldBlur('nome')}
            />
            {touchedFields.nome && !errors.nome && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            )}
          </div>
          <AnimatePresence>
            {errors.nome && (
              <motion.p
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle className="w-4 h-4" />
                {errors.nome.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Telefone/WhatsApp */}
        <div>
          <label htmlFor="telefone" className="block text-sm font-semibold text-gray-700 mb-2">
            WhatsApp / Telefone *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Ex: (33) 99999-9999"
              className={`
                w-full pl-12 pr-4 py-3 border rounded-xl
                text-base
                focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                transition-all
                ${errors.telefone
                  ? 'border-red-300 bg-red-50'
                  : touchedFields.telefone && !errors.telefone
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
                }
              `}
              {...register('telefone', {
                required: 'Por favor, informe seu telefone',
                pattern: {
                  value: /^\(\d{2}\) \d{4,5}-\d{4}$/,
                  message: 'Telefone inválido. Use (33) 99999-9999'
                }
              })}
              onChange={handlePhoneChange}
              onFocus={() => handleFieldFocus('telefone')}
              onBlur={() => handleFieldBlur('telefone')}
            />
            {touchedFields.telefone && !errors.telefone && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            )}
          </div>
          <AnimatePresence>
            {errors.telefone && (
              <motion.p
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle className="w-4 h-4" />
                {errors.telefone.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Motivo da Consulta */}
        <div>
          <label htmlFor="motivo" className="block text-sm font-semibold text-gray-700 mb-2">
            Motivo da Consulta *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            <select
              id="motivo"
              defaultValue="primeira-consulta"
              className={`
                w-full pl-12 pr-10 py-3 border rounded-xl
                text-base
                appearance-none
                focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                transition-all
                ${errors.motivo
                  ? 'border-red-300 bg-red-50'
                  : touchedFields.motivo && !errors.motivo
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300'
                }
              `}
              {...register('motivo', {
                required: 'Por favor, selecione o motivo da consulta'
              })}
              onFocus={() => handleFieldFocus('motivo')}
              onBlur={() => handleFieldBlur('motivo')}
            >
              {MOTIVOS_CONSULTA.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <AnimatePresence>
            {errors.motivo && (
              <motion.p
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle className="w-4 h-4" />
                {errors.motivo.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Convênio (somente versão B) */}
        {variant === 'B' && (
          <div>
            <label htmlFor="convenio" className="block text-sm font-semibold text-gray-700 mb-2">
              Convênio (Opcional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
              <select
                id="convenio"
                defaultValue="particular"
                className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl text-base appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                {...register('convenio')}
                onFocus={() => handleFieldFocus('convenio')}
                onBlur={() => handleFieldBlur('convenio')}
              >
                {CONVENIOS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || progress < 100}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirmar Agendamento
              </>
            )}
          </Button>
        </div>

        {/* Privacy Notice */}
        <p className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
          <Shield className="w-3 h-3 inline mr-1" />
          Seus dados estão protegidos conforme a LGPD. Usaremos apenas para confirmar seu agendamento.
        </p>
      </form>
    </motion.div>
  );
};

export default OptimizedAppointmentForm;
