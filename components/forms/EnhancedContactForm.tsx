'use client';

import React, { useState, useRef, useTransition, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Phone,
  MessageCircle,
  Mail,
  Shield,
  Wifi,
  WifiOff,
  Clock,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CONTACT, FORM, LGPD } from '@/lib/constants';
import { submitContactAction } from '@/app/actions/contact';
import {
  contactFormSchema,
  validateContactField,
  formatPhoneForDisplay,
  checkRateLimit,
  recordSubmission,
  sanitizeContactData,
} from '@/lib/validations/contact';
import type { ContactFormData } from '@/lib/validations/contact';
import type { ContactFormErrors } from '@/types/contact';
import { z } from 'zod';

interface EnhancedContactFormProps {
  onSuccess?: () => void;
  compact?: boolean;
  showFallbackContacts?: boolean;
}

/**
 * Enhanced Contact Form Component
 *
 * Features:
 * - Real-time validation with Zod
 * - LGPD compliance with consent management
 * - Honeypot spam protection
 * - Rate limiting (client-side)
 * - Accessibility (WCAG AAA compliant)
 * - Mobile-first responsive design
 * - Loading states and error handling
 * - Success feedback with next steps
 * - Fallback contact methods
 * - Network status detection
 */
export default function EnhancedContactForm({
  onSuccess,
  compact = false,
  showFallbackContacts = true,
}: EnhancedContactFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
    honeypot: '',
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [announceMessage, setAnnounceMessage] = useState('');

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      announceToScreenReader('Conexão com a internet restabelecida');
    };

    const handleOffline = () => {
      setIsOnline(false);
      announceToScreenReader('Conexão com a internet perdida', 'assertive');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Screen reader announcements
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnounceMessage(message);
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      setTimeout(() => setAnnounceMessage(''), 100);
    }
  };

  // Field labels for accessibility
  const getFieldLabel = (fieldName: string): string => {
    const labels: Record<string, string> = {
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefone',
      message: 'Mensagem',
      consent: 'Consentimento',
    };
    return labels[fieldName] || fieldName;
  };

  // Real-time field validation
  const validateFieldRealTime = async (fieldName: keyof ContactFormData, value: string | boolean) => {
    if (fieldName === 'honeypot') return;

    setIsValidating(true);

    try {
      const result = validateContactField(fieldName, value);

      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: result.error,
        }));
        announceToScreenReader(`Erro no campo ${getFieldLabel(fieldName)}: ${result.error}`, 'assertive');
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        announceToScreenReader(`Campo ${getFieldLabel(fieldName)} válido`);
      }
    } catch (error) {
      console.error('Field validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (showSuccess) {
      setShowSuccess(false);
    }

    if (touched[name] && name !== 'honeypot') {
      validateFieldRealTime(name as keyof ContactFormData, newValue);
    }
  };

  // Handle blur events
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (!touched[name]) {
      setTouched((prev) => ({ ...prev, [name]: true }));
    }

    if (name !== 'honeypot') {
      validateFieldRealTime(name as keyof ContactFormData, value);
    }
  };

  // Phone number formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneForDisplay(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));

    if (touched.phone) {
      validateFieldRealTime('phone', formatted);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setShowFallback(false);
    announceToScreenReader('Validando formulário...', 'assertive');

    // Check connection status
    if (!isOnline) {
      const errorMessage = 'Sem conexão com a internet. Verifique sua conexão e tente novamente.';
      toast({
        variant: 'destructive',
        title: 'Erro de conexão',
        description: errorMessage,
      });
      announceToScreenReader(errorMessage, 'assertive');
      return;
    }

    // Honeypot spam check
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      console.warn('Spam attempt detected via honeypot field');
      // Fail silently for spam
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return;
    }

    // Rate limiting check
    const rateLimit = checkRateLimit();
    if (!rateLimit.allowed) {
      const resetTime = rateLimit.resetTime?.toLocaleTimeString('pt-BR');
      toast({
        variant: 'destructive',
        title: 'Limite de envios atingido',
        description: `Por segurança, aguarde até ${resetTime} ou use nossos contatos diretos.`,
      });
      setShowFallback(true);
      announceToScreenReader('Limite de envios atingido. Use os contatos diretos abaixo.', 'assertive');
      return;
    }

    // Validate all fields
    try {
      contactFormSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ContactFormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          validationErrors[path] = err.message;
        });

        setErrors(validationErrors);
        setTouched({
          name: true,
          email: true,
          phone: true,
          message: true,
          consent: true,
        });

        const firstError = Object.keys(validationErrors)[0];
        document.getElementById(firstError)?.focus();

        announceToScreenReader(
          `Erro de validação. Corrija o campo ${getFieldLabel(firstError)} e tente novamente.`,
          'assertive'
        );

        return;
      }
    }

    // Submit form
    announceToScreenReader('Enviando formulário, aguarde...', 'assertive');

    startTransition(async () => {
      try {
        const sanitizedData = sanitizeContactData(formData);
        const result = await submitContactAction(sanitizedData);

        if (result.success) {
          // Record submission for rate limiting
          recordSubmission();

          // Success state
          setShowSuccess(true);
          setFormData({
            name: '',
            email: '',
            phone: '',
            message: '',
            consent: false,
            honeypot: '',
          });
          setErrors({});
          setTouched({});

          toast({
            title: 'Mensagem enviada com sucesso!',
            description: 'Entraremos em contato em breve.',
            duration: 5000,
          });

          announceToScreenReader(
            'Formulário enviado com sucesso! Recebemos sua mensagem e entraremos em contato em breve.',
            'assertive'
          );

          if (onSuccess) onSuccess();
        } else {
          setErrors(result.errors || {});
          toast({
            variant: 'destructive',
            title: 'Erro ao enviar mensagem',
            description: result.message || 'Tente novamente ou use nossos contatos diretos.',
          });
          setShowFallback(true);

          announceToScreenReader(
            `Erro no envio: ${result.message || 'Tente novamente ou use os contatos diretos abaixo.'}`,
            'assertive'
          );
        }
      } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao enviar mensagem',
          description: 'Tente novamente ou use nossos contatos diretos abaixo.',
        });
        setShowFallback(true);

        announceToScreenReader('Erro no envio. Use os contatos diretos abaixo.', 'assertive');
      }
    });
  };

  // WhatsApp URL with pre-filled message
  const whatsappUrl = `${CONTACT.PHONE.WHATSAPP_URL}?text=${encodeURIComponent(
    `Olá! Gostaria de agendar uma consulta.\n\nNome: ${formData.name}\nTelefone: ${formData.phone}\nMensagem: ${formData.message}`
  )}`;

  return (
    <div className={compact ? 'max-w-xl' : 'max-w-2xl mx-auto'}>
      {/* Screen reader live region */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announceMessage}
      </div>

      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="success-message"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-4 p-6 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">✓ Mensagem enviada com sucesso!</h3>
                <p className="text-sm text-green-800 mb-3">
                  Recebemos seu contato. Nossa equipe responderá em até 24h úteis.
                </p>
                <p className="text-sm font-medium text-green-900 mb-2">Próximos passos:</p>
                <ul className="text-sm text-green-800 space-y-1 ml-4">
                  <li>📧 Verifique sua caixa de entrada ({formData.email || 'seu e-mail'})</li>
                  <li>📱 Fique atento ao telefone ({formData.phone || 'seu telefone'})</li>
                  <li>
                    💬 Para urgências:{' '}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 underline font-medium"
                    >
                      WhatsApp
                    </a>
                  </li>
                </ul>

                <button
                  onClick={() => setShowSuccess(false)}
                  className="mt-4 text-sm text-green-700 underline hover:text-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
                >
                  Enviar outra mensagem
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            onSubmit={handleSubmit}
            initial={{ opacity: 1 }}
            className="space-y-6"
            noValidate
          >
            {/* Connection status indicator */}
            {!isOnline && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <WifiOff className="w-5 h-5 text-red-600" aria-hidden="true" />
                <span className="text-sm text-red-800">
                  Sem conexão com a internet. Verifique sua conexão para enviar o formulário.
                </span>
              </div>
            )}

            {/* Error summary (accessibility) */}
            {Object.keys(errors).length > 0 && Object.values(touched).some(Boolean) && (
              <div
                role="alert"
                className="error-summary bg-red-50 border border-red-200 rounded-lg p-4"
                aria-live="assertive"
              >
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" aria-hidden="true" />
                  Corrija os seguintes erros:
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-red-800">
                  {Object.entries(errors).map(
                    ([field, error]) =>
                      error && (
                        <li key={field}>
                          <a
                            href={`#${field}`}
                            className="underline hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(field)?.focus();
                            }}
                          >
                            {error}
                          </a>
                        </li>
                      )
                  )}
                </ul>
              </div>
            )}

            {/* Nome */}
            <div className="form-group">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                Nome Completo <span className="text-red-500" aria-label="obrigatório">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name && touched.name
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-slate-300'
                  }`}
                  aria-invalid={!!(errors.name && touched.name)}
                  aria-describedby={errors.name && touched.name ? 'name-error' : 'name-hint'}
                  placeholder="João da Silva"
                  autoComplete="name"
                  required
                  style={{ fontSize: '16px', minHeight: '48px' }} // Prevent zoom on mobile
                />
                {isValidating && touched.name && (
                  <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" aria-hidden="true" />
                )}
              </div>
              {!errors.name && !compact && (
                <p id="name-hint" className="mt-1 text-xs text-slate-500">
                  Nome e sobrenome
                </p>
              )}
              {errors.name && touched.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* E-mail */}
            <div className="form-group">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                E-mail <span className="text-red-500" aria-label="obrigatório">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email && touched.email
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-slate-300'
                  }`}
                  aria-invalid={!!(errors.email && touched.email)}
                  aria-describedby={errors.email && touched.email ? 'email-error' : 'email-hint'}
                  placeholder="joao@email.com"
                  autoComplete="email"
                  inputMode="email"
                  required
                  style={{ fontSize: '16px', minHeight: '48px' }}
                />
                {isValidating && touched.email && (
                  <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" aria-hidden="true" />
                )}
              </div>
              {!errors.email && !compact && (
                <p id="email-hint" className="mt-1 text-xs text-slate-500">
                  Enviaremos a confirmação para este e-mail
                </p>
              )}
              {errors.email && touched.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div className="form-group">
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                Telefone/WhatsApp <span className="text-red-500" aria-label="obrigatório">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.phone && touched.phone
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-slate-300'
                  }`}
                  aria-invalid={!!(errors.phone && touched.phone)}
                  aria-describedby={errors.phone && touched.phone ? 'phone-error' : 'phone-hint'}
                  placeholder="(33) 99999-9999"
                  autoComplete="tel-national"
                  inputMode="tel"
                  required
                  style={{ fontSize: '16px', minHeight: '48px' }}
                />
                {isValidating && touched.phone && (
                  <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" aria-hidden="true" />
                )}
              </div>
              {!errors.phone && !compact && (
                <p id="phone-hint" className="mt-1 text-xs text-slate-500">
                  Digite com DDD. Ex: (33) 99860-1427
                </p>
              )}
              {errors.phone && touched.phone && (
                <p id="phone-error" className="mt-1 text-sm text-red-600 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Mensagem */}
            <div className="form-group">
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">
                Mensagem <span className="text-red-500" aria-label="obrigatório">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={compact ? 3 : 4}
                  maxLength={FORM.VALIDATION.MESSAGE_MAX}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical ${
                    errors.message && touched.message
                      ? 'border-red-400 focus:ring-red-300'
                      : 'border-slate-300'
                  }`}
                  aria-invalid={!!(errors.message && touched.message)}
                  aria-describedby={errors.message && touched.message ? 'message-error' : 'message-hint'}
                  placeholder="Descreva o motivo do contato..."
                  required
                  style={{ fontSize: '16px', minHeight: '120px' }}
                />
                {isValidating && touched.message && (
                  <Loader2 className="absolute right-3 top-3 w-5 h-5 text-gray-400 animate-spin" aria-hidden="true" />
                )}
              </div>
              <div className="flex justify-between items-start mt-1">
                {!errors.message && !compact && (
                  <p id="message-hint" className="text-xs text-slate-500">
                    Mínimo {FORM.VALIDATION.MESSAGE_MIN} caracteres
                  </p>
                )}
                {errors.message && touched.message && (
                  <p id="message-error" className="text-sm text-red-600 flex items-center gap-1" role="alert">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.message}
                  </p>
                )}
                <span className="text-xs text-slate-400 ml-auto">
                  {formData.message.length}/{FORM.VALIDATION.MESSAGE_MAX}
                </span>
              </div>
            </div>

            {/* Honeypot (hidden) */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={handleChange}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {/* LGPD Consent */}
            <div className="pt-2">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Proteção de Dados Pessoais (LGPD)
                    </h4>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Seus dados pessoais serão utilizados exclusivamente para responder à sua consulta médica.
                      Coletamos apenas as informações necessárias (nome, e-mail, telefone e mensagem).
                    </p>
                  </div>
                </div>

                <label
                  className={`inline-flex items-start gap-3 cursor-pointer p-3 rounded-md border-2 transition-colors w-full ${
                    errors.consent
                      ? 'border-red-300 bg-red-50'
                      : formData.consent
                        ? 'border-green-300 bg-green-50'
                        : 'border-blue-200 bg-white hover:bg-blue-25'
                  }`}
                  htmlFor="consent"
                >
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? 'error-consent' : 'consent-description'}
                    aria-required="true"
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2"
                    required
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-slate-800">
                      Concordo com o tratamento dos meus dados pessoais *
                    </span>
                    <p id="consent-description" className="text-xs text-slate-600 mt-1">
                      Ao marcar esta opção, você autoriza o uso dos seus dados conforme descrito acima,
                      em conformidade com a LGPD (Lei 13.709/2018).
                    </p>
                  </div>
                  {formData.consent && (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  )}
                </label>

                {errors.consent && (
                  <p id="error-consent" className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1" role="alert">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {errors.consent}
                  </p>
                )}

                {!compact && (
                  <p className="text-xs text-slate-500 mt-2">
                    Para exercer seus direitos sobre seus dados, entre em contato: {CONTACT.EMAIL}
                  </p>
                )}
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isPending || !isOnline || Object.keys(errors).length > 0}
              className="btn-submit w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-live="polite"
              aria-busy={isPending}
              style={{ minHeight: '48px' }}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  Enviando mensagem...
                </>
              ) : !isOnline ? (
                <>
                  <WifiOff className="w-5 h-5" aria-hidden="true" />
                  Sem conexão com a internet
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" aria-hidden="true" />
                  Enviar Mensagem
                </>
              )}
            </button>

            {/* Fallback contacts */}
            {showFallback && showFallbackContacts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="fallback-contacts bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6"
              >
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" aria-hidden="true" />
                  Contatos Diretos
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  Não foi possível enviar sua mensagem. Entre em contato diretamente:
                </p>
                <div className="grid gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <MessageCircle className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-slate-900">WhatsApp</div>
                      <div className="text-xs text-slate-600">{CONTACT.PHONE.DISPLAY}</div>
                    </div>
                  </a>

                  <a
                    href={CONTACT.PHONE.HREF}
                    className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-slate-900">Telefone</div>
                      <div className="text-xs text-slate-600">{CONTACT.PHONE.DISPLAY}</div>
                    </div>
                  </a>

                  <a
                    href={`mailto:${CONTACT.EMAIL}`}
                    className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-slate-900">E-mail</div>
                      <div className="text-xs text-slate-600">{CONTACT.EMAIL}</div>
                    </div>
                  </a>
                </div>
              </motion.div>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
