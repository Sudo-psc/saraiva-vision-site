'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Bot, Globe, Shield, Wifi, WifiOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
// Simple translation hook for Portuguese
const useTranslations = () => {
  const translations = {
    title: 'Entre em Contato',
    subtitle: 'Agende sua consulta ou tire suas dúvidas',
    nameLabel: 'Nome',
    namePlaceholder: 'Seu nome completo',
    emailLabel: 'E-mail',
    emailPlaceholder: 'seu@email.com',
    phoneLabel: 'Telefone',
    phonePlaceholder: '(33) 9xxxx-xxxx',
    subjectLabel: 'Assunto',
    subjectPlaceholder: 'Escolha um assunto',
    messageLabel: 'Mensagem',
    messagePlaceholder: 'Descreva como podemos ajudar...',
    sendButton: 'Enviar Mensagem',
    sendingButton: 'Enviando...',
    successMessage: 'Mensagem enviada com sucesso!',
    errorMessage: 'Falha ao enviar mensagem. Tente novamente.',
    privacyPolicy: 'Política de Privacidade',
    dataProtection: 'Seus dados estão protegidos',
    consentText: 'Concordo com a ',
    location: 'Localização',
    phone: 'Telefone',
    email: 'E-mail',
    hours: 'Horário de Atendimento',
    // Additional properties for translation calls
    'contact.info.address_title': 'Endereço',
    'contact.info.address_details': 'Caratinga, MG',
    'contact.info.phone_title': 'Telefone',
    'contact.info.phone_whatsapp': 'WhatsApp',
    'contact.info.email_title': 'E-mail',
    'contact.info.email_sub': 'Resposta em até 24h',
    'contact.info.hours_title': 'Horário',
    'contact.info.hours_details': 'Segunda a Sexta, 08h às 18h',
    'contact.info.hours_sub': 'Sábados mediante agendamento',
    'contact.title': 'Entre em Contato',
    'contact.subtitle': 'Agende sua consulta ou tire suas dúvidas. Estamos em contato para ajudar você.',
    'contact.form_title': 'Formulário de Contato',
    'contact.name_label': 'Nome completo',
    'contact.name_placeholder': 'Seu nome completo',
    'contact.email_label': 'E-mail',
    'contact.email_placeholder': 'seu@email.com',
    'contact.phone_label': 'Telefone',
    'contact.phone_placeholder': '(XX) XXXXX-XXXX',
    'contact.message_label': 'Mensagem',
    'contact.message_placeholder': 'Como podemos ajudar?',
    'contact.recaptcha_label': 'Verificação de Segurança',
    'contact.recaptcha_ready': 'Proteção automática reCAPTCHA ativada',
    'contact.recaptcha_not_ready': 'Verificação de segurança indisponível. Tente novamente.',
    'contact.sending_label': 'Enviando mensagem...',
    'contact.send_button': 'Enviar Mensagem',
    'contact.online_scheduling_title': 'Agendamento Online',
    'contact.online_scheduling_desc': 'Agende sua consulta online de forma rápida e segura.',
    'contact.online_scheduling_benefit': 'Disponível 24/7',
    'contact.chatbot_title': 'Assistente Virtual',
    'contact.chatbot_desc': 'Tire suas dúvidas com nosso assistente de IA especializado.',
    'contact.chatbot_availability': 'Disponível imediatamente',
    toast_success_title: 'Mensagem enviada!',
    toast_success_desc: 'Entraremos em contato em breve.',
  };

  const t = (key: string, fallback?: string) => {
    return (translations as any)[key] || fallback || key;
  };

  return { ...translations, t };
};
import { clinicInfo, googleMapsProfileUrl } from '@/lib/clinicInfo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRecaptcha } from '@/hooks/useRecaptcha';
// import ErrorFeedback from '@/components/ui/ErrorFeedback'; // Temporarily commented
import { validateField, validateContactSubmission } from '@/lib/validation';
import { useAnalytics, useVisibilityTracking, useSaraivaTracking } from '@/hooks/useAnalytics';
import { consentManager } from '@/lib/lgpd/consentManager';
import { NAP_CANONICAL, generateWhatsAppURL } from '@/lib/napCanonical';
import { createLogger } from '@/utils/structuredLogger';

const logger = createLogger('Contact');

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  honeypot: string; // Anti-spam field
}

interface ContactFormErrors {
  [key: string]: string;
}

interface ValidationState {
  [key: string]: {
    success: boolean;
    error?: string;
  };
}

const Contact: React.FC = () => {
  const { t, ...translations } = useTranslations();
  const { toast } = useToast();

  // Analytics integration
  const { trackFormView, trackFormSubmit, trackInteraction } = useAnalytics();
  const { trackContactInteraction, trackAppointmentRequest } = useSaraivaTracking();
  const contactFormRef = useVisibilityTracking('contact_form_view');

  // Accessibility refs for focus management
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const successMessageRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
    honeypot: ''
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [fieldValidation, setFieldValidation] = useState<ValidationState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [submissionError, setSubmissionError] = useState<any>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState('');
  const { ready: recaptchaReady, execute: executeRecaptcha } = useRecaptcha();

  // Track form view on component mount
  useEffect(() => {
    trackFormView('contact');
    logger.info('Contact form viewed', { component: 'Contact' });
  }, [trackFormView]);

  // Accessibility announcement function
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnounceMessage(message);
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      // Clear after announcement to allow repeated messages
      setTimeout(() => setAnnounceMessage(''), 100);
    }
  };

  // Real-time field validation using the validation library
  const validateFieldRealTime = async (fieldName: string, value: any) => {
    setIsValidating(true);

    try {
      const result = validateField(fieldName, value, formData) as any;

      setFieldValidation(prev => ({
        ...prev,
        [fieldName]: result
      }));

      if (!result.success) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: result.error || 'Campo inv�lido'
        }));
        // Announce validation error to screen readers
        announceToScreenReader(`Erro no campo ${getFieldLabel(fieldName)}: ${result.error}`, 'assertive');
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        // Announce successful validation
        announceToScreenReader(`Campo ${getFieldLabel(fieldName)} v�lido`);
      }
    } catch (error) {
      logger.error('Field validation error', {
        fieldName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      const errorMessage = 'Erro de valida��o';
      setErrors(prev => ({
        ...prev,
        [fieldName]: errorMessage
      }));
      announceToScreenReader(`Erro no campo ${getFieldLabel(fieldName)}: ${errorMessage}`, 'assertive');
    } finally {
      setIsValidating(false);
    }
  };

  // Helper function to get field labels for screen reader announcements
  const getFieldLabel = (fieldName: string): string => {
    const labels: { [key: string]: string } = {
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefone',
      message: 'Mensagem',
      consent: 'Consentimento'
    };
    return labels[fieldName] || fieldName;
  };

  const phoneNumber = NAP_CANONICAL.phone.whatsapp.raw;
  const whatsappLink = generateWhatsAppURL();
  const chatbotLink = "https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica?model=gpt-4o";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type, value } = e.target;
    const target = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? target.checked : undefined;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    // Clear submission success state when user starts typing again
    if (submissionSuccess) {
      setSubmissionSuccess(false);
    }

    // Real-time validation for non-honeypot fields
    if (name !== 'honeypot' && touched[name]) {
      validateFieldRealTime(name, newValue);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Mark field as touched
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }

    // Validate field on blur (except honeypot)
    if (name !== 'honeypot') {
      validateFieldRealTime(name, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startTime = performance.now();
    const operationId = `contact-submit-${Date.now()}`;

    logger.info('Contact form submission started', {
      operationId,
      hasConsent: formData.consent,
      hasRecaptcha: recaptchaReady,
      formDataLength: JSON.stringify(formData).length
    });

    // Clear previous errors
    setSubmissionError(null);

    // Check LGPD consent before processing
    if (!consentManager.hasValidConsent()) {
      const errorMessage = '� necess�rio aceitar os termos de privacidade antes de enviar o formul�rio.';
      setSubmissionError({
        name: 'ConsentError',
        message: 'LGPD consent required',
        userMessage: errorMessage
      });
      announceToScreenReader(errorMessage, 'assertive');
      logger.warn('LGPD consent missing', { operationId });
      return;
    }

    // Announce form submission start
    announceToScreenReader('Enviando formul�rio, aguarde...', 'assertive');

    // Honeypot spam protection
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      // This is likely a bot submission, fail silently
      logger.warn('Spam attempt detected via honeypot field', {
        operationId,
        honeypotValue: formData.honeypot
      });
      setIsSubmitting(true);
      setTimeout(() => setIsSubmitting(false), 2000);
      return;
    }

    // Rate limiting check (simple client-side)
    const lastSubmission = localStorage.getItem('lastContactSubmission');
    const now = Date.now();
    if (lastSubmission && (now - parseInt(lastSubmission)) < 30000) { // 30 seconds
      const errorMessage = 'Muitas tentativas. Aguarde 30 segundos antes de tentar novamente.';
      setSubmissionError({ error: 'rate_limited' });
      announceToScreenReader(errorMessage, 'assertive');
      logger.warn('Rate limit exceeded', { operationId, lastSubmission });
      return;
    }

    const validationResult = validateContactSubmission(formData) as any;

    if (!validationResult.success) {
      setErrors(validationResult.errors || {});
      setTouched({ name: true, email: true, phone: true, message: true, consent: true });
      setSubmissionError({
        field: Object.keys(validationResult.errors || {})[0] || 'validation',
        code: 'validation_failed'
      });

      const firstErrorField = Object.keys(validationResult.errors || {})[0];
      if (firstErrorField) {
        const fieldElement = document.getElementById(firstErrorField) as HTMLInputElement;
        if (fieldElement) {
          fieldElement.focus();
        }
        announceToScreenReader(`Erro de valida��o. Corrija o campo ${getFieldLabel(firstErrorField)} e tente novamente.`, 'assertive');
      }

      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
      }

      logger.warn('Form validation failed', {
        operationId,
        errors: validationResult.errors,
        fieldCount: Object.keys(validationResult.errors || {}).length
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Execute reCAPTCHA v3 to obtain token
      const token = await executeRecaptcha('contact');
      if (!token) {
        setSubmissionError({ code: 'missing_token' });
        logger.error('reCAPTCHA token missing', { operationId });
        return;
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        token: token,
        action: 'contact'
      };

      // Submit to API route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();
      const duration = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Falha no envio');
      }

      // Success
      localStorage.setItem('lastContactSubmission', now.toString());

      // Track successful form submission
      trackFormSubmit('contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        consent: formData.consent
      });

      logger.info('Contact form submitted successfully', {
        operationId,
        duration,
        messageId: result.messageId,
        hasRecaptcha: !!token
      });

      toast({
        title: t('contact.toast_success_title', 'Mensagem enviada!'),
        description: t('contact.toast_success_desc', 'Entraremos em contato em breve.'),
        duration: 5000,
      });

      // Reset form and show success state
      setFormData({ name: '', email: '', phone: '', message: '', consent: false, honeypot: '' });
      setTouched({});
      setErrors({});
      setFieldValidation({});
      setSubmissionSuccess(true);

      // Announce success to screen readers
      announceToScreenReader('Formul�rio enviado com sucesso! Recebemos sua mensagem e entraremos em contato em breve.', 'assertive');

      // Focus on success message for screen readers
      setTimeout(() => {
        if (successMessageRef.current) {
          successMessageRef.current.focus();
        }
      }, 100);

      // Clear success state after 5 seconds
      setTimeout(() => setSubmissionSuccess(false), 5000);

    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const err = error as Error;

      logger.error('Contact form submission failed', {
        operationId,
        error: err.message,
        duration,
        formData: { name: formData.name, email: formData.email }
      });

      setSubmissionError({
        name: err.name || 'SubmissionError',
        message: err.message,
        userMessage: 'Erro ao enviar formul�rio. Tente novamente.'
      });

      // Announce error to screen readers
      const errorMessage = err.message || 'Erro ao enviar formul�rio. Tente novamente.';
      announceToScreenReader(`Erro no envio: ${errorMessage}`, 'assertive');

      toast({
        title: 'Erro no envio',
        description: errorMessage,
        variant: 'destructive' as any,
        duration: 5000,
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  const contactDetails = [
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: t('contact.info.address_title', 'Endere�o'),
      details: (
        <>
          <a
            href={googleMapsProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-700 hover:underline transition-colors cursor-pointer"
            aria-label="Ver localiza��o no Google Maps (nova aba)"
          >
            <span>{typeof clinicInfo.address === 'string' ? clinicInfo.address : t('contact.info.address_details', 'Caratinga, MG')}</span>
          </a>
        </>
      ),
      subDetails: (
        <a
          href={googleMapsProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          =� Ver no Google Maps
        </a>
      )
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: t('contact.info.phone_title', 'Telefone'),
      details: (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('open-cta-modal'))}
            className="hover:underline font-medium text-left"
            aria-label="Ligar para +55 33 99860-1427"
          >
            +55 33 99860-1427
          </button>
          <span className="sr-only">+55 33 99860-1427</span>
        </div>
      ),
      subDetails: (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('open-cta-modal'))}
            className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-semibold"
            aria-label="Contactar via WhatsApp"
          >
            <MessageCircle size={14} /> {t('contact.info.phone_whatsapp', 'WhatsApp')}
          </button>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline flex items-center gap-1 text-sm font-semibold"
          >
            <MessageCircle size={14} /> Auto Atendimento WhatsApp
          </a>
          <a
            href="https://api.whatsapp.com/send/?phone=5533984207437&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-600 hover:underline flex items-center gap-1 text-sm font-semibold"
          >
            <MessageCircle size={14} /> Urg�ncia - Enfermeira Ana
          </a>
        </div>
      )
    },
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: t('contact.info.email_title', 'E-mail'),
      details: <a href="mailto:saraivavision@gmail.com" className="hover:underline">saraivavision@gmail.com</a>,
      subDetails: t('contact.info.email_sub', 'Resposta em at� 24h')
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: t('contact.info.hours_title', 'Hor�rio'),
      details: t('contact.info.hours_details', 'Segunda a Sexta, 08h �s 18h'),
      subDetails: t('contact.info.hours_sub', 'S�bados mediante agendamento')
    }
  ];

  return (
    <section
      id="contact"
      className="py-16 md:py-20 bg-subtle-gradient scroll-block-internal"
      aria-labelledby="contact-heading"
      role="region"
    >
      {/* Skip link for keyboard navigation */}
      <a
        href="#form-title"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:no-underline"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('name')?.focus();
        }}
      >
        Pular para o formul�rio de contato
      </a>

      {/* Screen reader live region for announcements */}
      <div
        ref={liveRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announceMessage}
      </div>

      <div className="container mx-auto px-[7%]">
        <div className="text-center mb-16">
          <motion.h2
            id="contact-heading"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            {t('contact.title', 'Entre em Contato')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            {(() => {
              const raw = t('contact.subtitle', 'Agende sua consulta ou tire suas d�vidas. Estamos em contato para ajudar voc�.');
              try {
                return raw.replace(/em contato/gi, 'em\u200B contato');
              } catch (_) {
                return raw;
              }
            })()}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-soft-light">
              <h3 className="mb-6" id="form-title">{t('contact.form_title', 'Formul�rio de Contato')}</h3>

              <form
                ref={(el) => {
                  formRef.current = el;
                  contactFormRef.current = el;
                }}
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
                aria-labelledby="form-title"
                aria-describedby="form-description"
              >
                <p id="form-description" className="sr-only">
                  Formul�rio de contato para agendar consulta ou tirar d�vidas. Todos os campos marcados com asterisco s�o obrigat�rios.
                </p>

                {/* Form Validation Summary for Screen Readers */}
                {Object.keys(errors).length > 0 && (
                  <div
                    ref={errorSummaryRef}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    role="alert"
                    aria-live="assertive"
                    aria-labelledby="form-errors-title"
                    tabIndex={-1}
                  >
                    <h4 id="form-errors-title" className="text-sm font-semibold text-red-800 mb-2">
                      Por favor, corrija os seguintes erros:
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field}>
                          <a
                            href={`#${field}`}
                            className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(field)?.focus();
                            }}
                          >
                            " {getFieldLabel(field)}: {error}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mobile-First Touch-Optimized Form Fields */}
                <div>
                  <label htmlFor="name" className="block text-base font-medium text-slate-700 mb-2 md:text-sm md:mb-1.5">
                    {t('contact.name_label', 'Nome completo')} <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      autoComplete="name"
                      className={`form-input mobile-touch-input pr-10 ${errors.name
                        ? 'border-red-400 focus:ring-red-300'
                        : fieldValidation.name?.success
                          ? 'border-green-400 focus:ring-green-300'
                          : ''
                        }`}
                      placeholder={t('contact.name_placeholder', 'Seu nome completo')}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'error-name' : fieldValidation.name?.success ? 'success-name' : 'name-help'}
                      aria-required="true"
                      style={{ fontSize: '16px', minHeight: '48px', padding: '12px 16px' }}
                    />
                    <div id="name-help" className="sr-only">
                      Digite seu nome completo. Este campo � obrigat�rio.
                    </div>
                    {/* Validation status icon */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {isValidating && touched.name ? (
                        <Loader2 className="h-4 w-4 text-gray-400 animate-spin" aria-hidden="true" />
                      ) : errors.name ? (
                        <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                      ) : fieldValidation.name?.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                      ) : null}
                    </div>
                  </div>
                  {errors.name && (
                    <p id="error-name" className="mt-2 text-sm text-red-600 font-medium" role="alert">
                      {errors.name}
                    </p>
                  )}
                  {fieldValidation.name?.success && !errors.name && (
                    <p id="success-name" className="mt-2 text-sm text-green-600 font-medium" role="status">
                      Nome v�lido
                    </p>
                  )}
                </div>

                {/* Mobile: Stack vertically, Desktop: Side by side */}
                <div className="space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:gap-5">
                  <div>
                    <label htmlFor="email" className="block text-base font-medium text-slate-700 mb-2 md:text-sm md:mb-1.5">
                      {t('contact.email_label', 'E-mail')} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        autoComplete="email"
                        className={`form-input mobile-touch-input pr-10 ${errors.email
                          ? 'border-red-400 focus:ring-red-300'
                          : fieldValidation.email?.success
                            ? 'border-green-400 focus:ring-green-300'
                            : ''
                          }`}
                        placeholder={t('contact.email_placeholder', 'seu@email.com')}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'error-email' : fieldValidation.email?.success ? 'success-email' : 'email-help'}
                        aria-required="true"
                        inputMode="email"
                        style={{ fontSize: '16px', minHeight: '48px', padding: '12px 16px' }}
                      />
                      <div id="email-help" className="sr-only">
                        Digite um endere�o de e-mail v�lido. Este campo � obrigat�rio.
                      </div>
                      {/* Validation status icon */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {isValidating && touched.email ? (
                          <Loader2 className="h-4 w-4 text-gray-400 animate-spin" aria-hidden="true" />
                        ) : errors.email ? (
                          <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                        ) : fieldValidation.email?.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                        ) : null}
                      </div>
                    </div>
                    {errors.email && (
                      <p id="error-email" className="mt-2 text-sm text-red-600 font-medium" role="alert">
                        {errors.email}
                      </p>
                    )}
                    {fieldValidation.email?.success && !errors.email && (
                      <p id="success-email" className="mt-2 text-sm text-green-600 font-medium" role="status">
                        E-mail v�lido
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-base font-medium text-slate-700 mb-2 md:text-sm md:mb-1.5">
                      {t('contact.phone_label', 'Telefone')} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        autoComplete="tel"
                        className={`form-input mobile-touch-input pr-10 ${errors.phone
                          ? 'border-red-400 focus:ring-red-300'
                          : fieldValidation.phone?.success
                            ? 'border-green-400 focus:ring-green-300'
                            : ''
                          }`}
                        placeholder={t('contact.phone_placeholder', '(XX) XXXXX-XXXX')}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'error-phone' : fieldValidation.phone?.success ? 'success-phone' : 'phone-help'}
                        aria-required="true"
                        inputMode="tel"
                        style={{ fontSize: '16px', minHeight: '48px', padding: '12px 16px' }}
                      />
                      <div id="phone-help" className="sr-only">
                        Digite seu n�mero de telefone com DDD. Formato: (XX) XXXXX-XXXX. Este campo � obrigat�rio.
                      </div>
                      {/* Validation status icon */}
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {isValidating && touched.phone ? (
                          <Loader2 className="h-4 w-4 text-gray-400 animate-spin" aria-hidden="true" />
                        ) : errors.phone ? (
                          <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                        ) : fieldValidation.phone?.success ? (
                          <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                        ) : null}
                      </div>
                    </div>
                    {errors.phone && (
                      <p id="error-phone" className="mt-2 text-sm text-red-600 font-medium" role="alert">
                        {errors.phone}
                      </p>
                    )}
                    {fieldValidation.phone?.success && !errors.phone && (
                      <p id="success-phone" className="mt-2 text-sm text-green-600 font-medium" role="status">
                        Telefone v�lido
                      </p>
                    )}
                  </div>
                </div>

                {/* Honeypot field - hidden from users, only bots will fill it */}
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

                <div>
                  <label htmlFor="message" className="block text-base font-medium text-slate-700 mb-2 md:text-sm md:mb-1.5">
                    {t('contact.message_label', 'Mensagem')} <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      rows={4}
                      maxLength={2000}
                      className={`form-input mobile-touch-input pr-10 ${errors.message
                        ? 'border-red-400 focus:ring-red-300'
                        : fieldValidation.message?.success
                          ? 'border-green-400 focus:ring-green-300'
                          : ''
                        }`}
                      placeholder={t('contact.message_placeholder', 'Como podemos ajudar?')}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'error-message' : fieldValidation.message?.success ? 'success-message' : 'message-help'}
                      aria-required="true"
                      style={{ fontSize: '16px', minHeight: '120px', padding: '12px 16px', resize: 'vertical', overscrollBehavior: 'none' }}
                    ></textarea>
                    {/* Validation status icon */}
                    <div className="absolute top-3 right-3">
                      {isValidating && touched.message ? (
                        <Loader2 className="h-4 w-4 text-gray-400 animate-spin" aria-hidden="true" />
                      ) : errors.message ? (
                        <AlertCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
                      ) : fieldValidation.message?.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                      ) : null}
                    </div>
                  </div>
                  <div className="flex justify-between items-start mt-1">
                    <div className="flex-1">
                      {errors.message && (
                        <p id="error-message" className="text-sm text-red-600 font-medium" role="alert">
                          {errors.message}
                        </p>
                      )}
                      {fieldValidation.message?.success && !errors.message && (
                        <p id="success-message" className="text-sm text-green-600 font-medium" role="status">
                          Mensagem v�lida
                        </p>
                      )}
                      {!errors.message && !fieldValidation.message?.success && (
                        <p id="message-help" className="text-xs text-slate-500">
                          M�nimo 10 caracteres, m�ximo 2000 caracteres
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 ml-2">
                      {formData.message.length}/2000
                    </div>
                  </div>
                </div>

                {/* LGPD Consent Section */}
                <div className="pt-2">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-start gap-3 mb-3">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-900 mb-1">
                          Prote��o de Dados Pessoais (LGPD)
                        </h4>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          Seus dados pessoais ser�o utilizados exclusivamente para responder � sua consulta m�dica.
                          Coletamos apenas as informa��es necess�rias (nome, e-mail, telefone e mensagem) para
                          que Dr. Philipe possa entrar em contato e fornecer orienta��es oftalmol�gicas adequadas.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-blue-100 mb-3">
                      <h5 className="text-xs font-medium text-slate-700 mb-2">Seus direitos:</h5>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>" Acesso aos seus dados pessoais</li>
                        <li>" Corre��o de dados incompletos ou incorretos</li>
                        <li>" Exclus�o dos dados quando solicitado</li>
                        <li>" Portabilidade dos dados para outro prestador</li>
                      </ul>
                    </div>

                    <label
                      className={`inline-flex items-start gap-3 cursor-pointer p-3 rounded-md border-2 transition-colors ${errors.consent
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
                          Ao marcar esta op��o, voc� autoriza o uso dos seus dados conforme descrito acima,
                          em conformidade com a Lei Geral de Prote��o de Dados (LGPD - Lei 13.709/2018).
                        </p>
                      </div>
                      {formData.consent && (
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                      )}
                    </label>

                    {errors.consent && (
                      <p id="error-consent" className="mt-2 text-sm text-red-600 font-medium" role="alert">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        {errors.consent}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 mt-2">
                      Para exercer seus direitos ou esclarecer d�vidas sobre o tratamento de dados,
                      entre em contato conosco atrav�s do e-mail: saraivavision@gmail.com
                    </p>
                  </div>
                </div>

                {/* reCAPTCHA v3 status (no visible widget required) */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {t('contact.recaptcha_label', 'Verifica��o de Seguran�a')}
                    </span>
                  </div>
                  <p className={`text-xs ${recaptchaReady ? 'text-green-600' : 'text-red-500'}`}>
                    {recaptchaReady
                      ? t('contact.recaptcha_ready', 'Prote��o autom�tica reCAPTCHA ativada')
                      : t('contact.recaptcha_not_ready', 'Verifica��o de seguran�a indispon�vel. Tente novamente.')}
                  </p>
                  {!recaptchaReady && (
                    <p className="text-xs text-slate-500 mt-1">
                      Certifique-se de que est� conectado � internet e recarregue a p�gina.
                    </p>
                  )}
                </div>

                {/* Error Feedback */}
                {submissionError && (
                  <div className="mb-4 p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">
                          Erro no envio
                        </h4>
                        <p className="mt-1 text-sm text-red-700">
                          {submissionError.code === 'rate_limit_exceeded'
                            ? 'Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.'
                            : submissionError.code === 'validation_failed'
                            ? 'Por favor, verifique os campos destacados em vermelho.'
                            : 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.'}
                        </p>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={handleSubmit}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            Tentar novamente
                          </button>
                          <button
                            type="button"
                            onClick={() => setSubmissionError(null)}
                            className="ml-4 text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {submissionSuccess && (
                  <div
                    ref={successMessageRef}
                    className="p-4 bg-green-50 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    role="alert"
                    aria-live="assertive"
                    tabIndex={-1}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
                      <div>
                        <h4 className="text-sm font-semibold text-green-800">
                          Mensagem enviada com sucesso!
                        </h4>
                        <p className="text-sm text-green-700 mt-1">
                          Sua mensagem foi recebida! Resposta em at� 24h.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  ref={submitButtonRef}
                  disabled={isSubmitting || !recaptchaReady}
                  type="submit"
                  size="lg"
                  className={`w-full flex items-center justify-center gap-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${submissionSuccess
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'disabled:opacity-60'
                    }`}
                  aria-busy={isSubmitting}
                  aria-describedby="submit-status submit-help"
                  aria-label={
                    isSubmitting
                      ? 'Enviando mensagem, aguarde'
                      : submissionSuccess
                        ? 'Mensagem enviada com sucesso'
                        : !recaptchaReady
                          ? 'Bot�o desabilitado: carregando verifica��o de seguran�a'
                          : 'Enviar mensagem de contato'
                  }
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : submissionSuccess ? (
                    <CheckCircle className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Send className="h-5 w-5" aria-hidden="true" />
                  )}

                  <span>
                    {isSubmitting
                      ? t('contact.sending_label', 'Enviando mensagem...')
                      : submissionSuccess
                        ? 'Mensagem enviada!'
                        : !recaptchaReady
                          ? 'Carregando verifica��o de seguran�a...'
                          : t('contact.send_button', 'Enviar Mensagem')
                    }
                  </span>
                </Button>

                {/* Submit Status and Help for Screen Readers */}
                <div id="submit-status" className="sr-only" aria-live="polite" aria-atomic="true">
                  {isSubmitting && 'Enviando formul�rio, aguarde...'}
                  {submissionSuccess && 'Formul�rio enviado com sucesso'}
                  {submissionError && 'Erro no envio do formul�rio'}
                </div>

                <div id="submit-help" className="sr-only">
                  Para enviar o formul�rio, certifique-se de que todos os campos obrigat�rios est�o preenchidos corretamente e que voc� tem conex�o com a internet.
                </div>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6"
            role="complementary"
            aria-labelledby="contact-options-heading"
          >
            {/* Expose clinic name for tests and SR, without altering visual UI */}
            <div className="sr-only">{clinicInfo.name}</div>

            <h3 id="contact-options-heading" className="sr-only">Op��es de contato e agendamento</h3>

            <a
              href={clinicInfo.onlineSchedulingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block modern-card-alt p-6 group mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl"
              aria-describedby="online-scheduling-desc"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl" aria-hidden="true">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-700">{t('contact.online_scheduling_title', 'Agendamento Online')}</h4>
                  <div className="mt-1" id="online-scheduling-desc">{t('contact.online_scheduling_desc', 'Agende sua consulta online de forma r�pida e segura.')}</div>
                  <div className="text-blue-600 text-sm mt-1 font-semibold">{t('contact.online_scheduling_benefit', 'Dispon�vel 24/7')}</div>
                </div>
              </div>
            </a>

            <a
              href={chatbotLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block modern-card-alt p-6 group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-2xl"
              aria-describedby="chatbot-desc"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl" aria-hidden="true">
                  <Bot className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-green-700">{t('contact.chatbot_title', 'Assistente Virtual')}</h4>
                  <div className="mt-1" id="chatbot-desc">{t('contact.chatbot_desc', 'Tire suas d�vidas com nosso assistente de IA especializado.')}</div>
                  <div className="text-green-600 text-sm mt-1 font-semibold">{t('contact.chatbot_availability', 'Dispon�vel imediatamente')}</div>
                </div>
              </div>
            </a>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" role="list" aria-label="Informa��es de contato">
              {contactDetails.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="modern-card p-6 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                  role="listitem"
                >
                  <div className="flex items-start gap-4">
                    <div className="icon-container" aria-hidden="true">
                      {info.icon}
                    </div>
                    <div className="min-w-0 break-words leading-relaxed">
                      <h4 className="font-bold text-slate-800">{info.title}</h4>
                      <div className="mt-1 text-sm text-wrap">{info.details}</div>
                      <div className="text-slate-500 text-sm mt-0.5 text-wrap">{info.subDetails}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;