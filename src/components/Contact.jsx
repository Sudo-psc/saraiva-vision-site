import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Bot, Lock, Globe, Shield, Wifi, WifiOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { clinicInfo } from '@/lib/clinicInfo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { submitContactForm, FallbackStrategies, useConnectionStatus, networkMonitor } from '@/lib/apiUtils';
import { getUserFriendlyError, getRecoverySteps, logError } from '@/lib/errorHandling';
import ErrorFeedback, { NetworkError, RateLimitError, RecaptchaError, EmailServiceError } from '@/components/ui/ErrorFeedback';
import { validateField, validateContactSubmission } from '@/lib/validation';
import { useAnalytics, useVisibilityTracking, useSaraivaTracking } from '@/hooks/useAnalytics';
import { consentManager } from '@/lib/lgpd/consentManager';

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Analytics integration
  const { trackFormView, trackFormSubmit, trackInteraction } = useAnalytics();
  const { trackContactInteraction, trackAppointmentRequest } = useSaraivaTracking();
  const contactFormRef = useVisibilityTracking('contact_form_view');

  // Accessibility refs for focus management
  const formRef = useRef(null);
  const submitButtonRef = useRef(null);
  const errorSummaryRef = useRef(null);
  const successMessageRef = useRef(null);
  const liveRegionRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
    // Honeypot field for spam protection
    honeypot: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showAlternativeContacts, setShowAlternativeContacts] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [announceMessage, setAnnounceMessage] = useState('');
  const { ready: recaptchaReady, execute: executeRecaptcha } = useRecaptcha();
  const connectionStatus = useConnectionStatus();
  const { isOnline } = connectionStatus || { isOnline: true };

  // Track form view on component mount
  useEffect(() => {
    trackFormView('contact');
  }, [trackFormView]);

  // Accessibility announcement function
  const announceToScreenReader = (message, priority = 'polite') => {
    setAnnounceMessage(message);
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      // Clear after announcement to allow repeated messages
      setTimeout(() => setAnnounceMessage(''), 100);
    }
  };

  // Real-time field validation using the validation library
  const validateFieldRealTime = async (fieldName, value) => {
    setIsValidating(true);

    try {
      const result = validateField(fieldName, value, formData);

      setFieldValidation(prev => ({
        ...prev,
        [fieldName]: result
      }));

      if (!result.success) {
        setErrors(prev => ({
          ...prev,
          [fieldName]: result.error
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
        announceToScreenReader(`Campo ${getFieldLabel(fieldName)} válido`);
      }
    } catch (error) {
      console.error('Field validation error:', error);
      const errorMessage = 'Erro de validação';
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
  const getFieldLabel = (fieldName) => {
    const labels = {
      name: 'Nome',
      email: 'E-mail',
      phone: 'Telefone',
      message: 'Mensagem',
      consent: 'Consentimento'
    };
    return labels[fieldName] || fieldName;
  };



  const phoneNumber = "5533998601427";
  const whatsappLink = `https://wa.me/${phoneNumber}`;
  const chatbotLink = "https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica?model=gpt-4o";

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
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

  const handleBlur = (e) => {
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

  const validateAll = () => {
    const validationResult = validateContactSubmission(formData);

    if (!validationResult.success) {
      setErrors(validationResult.errors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setSubmissionError(null);
    setShowAlternativeContacts(false);

    // Check LGPD consent before processing
    if (!consentManager.hasValidConsent()) {
      const errorMessage = 'É necessário aceitar os termos de privacidade antes de enviar o formulário.';
      setSubmissionError({
        name: 'ConsentError',
        message: 'LGPD consent required',
        userMessage: errorMessage
      });
      announceToScreenReader(errorMessage, 'assertive');
      return;
    }

    // Announce form submission start
    announceToScreenReader('Enviando formulário, aguarde...', 'assertive');

    // Check connection status first
    if (!isOnline) {
      const errorMessage = 'Sem conexão com a internet. Verifique sua conexão e tente novamente.';
      setSubmissionError({ name: 'NetworkError', message: 'No internet connection' });
      announceToScreenReader(errorMessage, 'assertive');
      return;
    }

    // Honeypot spam protection
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      // This is likely a bot submission, fail silently
      console.warn('Spam attempt detected via honeypot field');
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
      return;
    }

    if (!validateAll()) {
      setTouched({ name: true, email: true, phone: true, message: true, recaptcha: true });
      setSubmissionError({
        field: Object.keys(errors)[0] || 'validation',
        code: 'validation_failed'
      });

      // Focus on first error field and announce validation errors
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const fieldElement = document.getElementById(firstErrorField);
        if (fieldElement) {
          fieldElement.focus();
        }
        announceToScreenReader(`Erro de validação. Corrija o campo ${getFieldLabel(firstErrorField)} e tente novamente.`, 'assertive');
      }

      // Focus on error summary if available
      if (errorSummaryRef.current) {
        errorSummaryRef.current.focus();
      }

      return;
    }

    setIsSubmitting(true);

    // Prepare submission data (available in both try and catch)
    let submissionData = null;

    try {
      // Execute reCAPTCHA v3 to obtain token
      const token = await executeRecaptcha('contact');
      if (!token) {
        setSubmissionError({ code: 'missing_token' });
        setIsSubmitting(false);
        return;
      }

      // Use the enhanced API utility
      submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        consent: formData.consent,
        token: token,
        action: 'contact'
      };

      const result = await submitContactForm(submissionData);

      // Success
      localStorage.setItem('lastContactSubmission', now.toString());
      setRetryCount(0);

      // Track successful form submission
      trackFormSubmit('contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        consent: formData.consent
      });

      toast({
        title: t('contact.toast_success_title'),
        description: t('contact.toast_success_desc'),
        duration: 5000,
      });

      // Reset form and show success state
      setFormData({ name: '', email: '', phone: '', message: '', consent: false, honeypot: '' });
      setTouched({});
      setErrors({});
      setFieldValidation({});
      setRecaptchaToken(null);
      setSubmissionSuccess(true);

      // Announce success to screen readers
      announceToScreenReader('Formulário enviado com sucesso! Recebemos sua mensagem e entraremos em contato em breve.', 'assertive');

      // Focus on success message for screen readers
      setTimeout(() => {
        if (successMessageRef.current) {
          successMessageRef.current.focus();
        }
      }, 100);

      // Clear success state after 5 seconds
      setTimeout(() => setSubmissionSuccess(false), 5000);

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionError(error);

      // Log the error for debugging
      logError(error, {
        action: 'contact_form_submission',
        retryCount,
        formData: { name: formData.name, email: formData.email }
      });

      // Announce error to screen readers
      const errorMessage = getUserFriendlyError(error)?.userMessage || 'Erro ao enviar formulário. Tente novamente.';
      announceToScreenReader(`Erro no envio: ${errorMessage}`, 'assertive');

      // Try to store for retry if it's a recoverable error
      if (retryCount < 3 && (error.name === 'NetworkError' || error.status >= 500)) {
        const stored = FallbackStrategies.storeForRetry(submissionData);
        if (stored) {
          toast({
            title: 'Mensagem salva',
            description: 'Sua mensagem foi salva e será enviada quando a conexão for restabelecida.',
            duration: 4000,
          });
          announceToScreenReader('Mensagem salva para reenvio automático quando a conexão for restabelecida.');
        }
      }

      // Show alternative contacts for critical errors
      if (error.status === 500 || error.name === 'NetworkError') {
        setShowAlternativeContacts(true);
        announceToScreenReader('Erro crítico detectado. Métodos de contato alternativos estão disponíveis abaixo do formulário.');
      }

    } finally {
      setIsSubmitting(false);
    }
  };

  // Retry submission with exponential backoff
  const handleRetry = async () => {
    if (retryCount >= 3) {
      setShowAlternativeContacts(true);
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      // Try to retry failed submissions first
      const retryResult = await FallbackStrategies.retryFailedSubmissions();

      if (retryResult.success && retryResult.retried > 0) {
        toast({
          title: 'Sucesso!',
          description: `${retryResult.retried} mensagem(ns) enviada(s) com sucesso.`,
          duration: 4000,
        });
        setSubmissionError(null);
        setRetryCount(0);
      } else {
        // If no failed submissions to retry, retry the current error
        await handleSubmit(new Event('submit'));
      }
    } catch (error) {
      console.error('Retry failed:', error);
      setSubmissionError(error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Dismiss error
  const handleDismissError = () => {
    setSubmissionError(null);
    setRetryCount(0);
  };

  // Network status change handler
  useEffect(() => {
    const unsubscribe = networkMonitor.subscribe((online) => {
      if (online && submissionError?.name === 'NetworkError') {
        // Auto-retry when coming back online
        handleRetry();
      }
    });

    return unsubscribe;
  }, [submissionError]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Handle Escape key to clear errors or cancel submission
      if (event.key === 'Escape') {
        if (submissionError) {
          handleDismissError();
          announceToScreenReader('Erro dismissado');
        } else if (isSubmitting) {
          // Note: We can't actually cancel the submission, but we can announce
          announceToScreenReader('Não é possível cancelar o envio em andamento');
        }
      }

      // Handle Enter key on error summary to focus first error field
      if (event.key === 'Enter' && event.target === errorSummaryRef.current) {
        event.preventDefault();
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const fieldElement = document.getElementById(firstErrorField);
          if (fieldElement) {
            fieldElement.focus();
          }
        }
      }
    };

    // Add event listener to form
    if (formRef.current) {
      formRef.current.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (formRef.current) {
        formRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [submissionError, isSubmitting, errors]);

  // Focus management for form submission states
  useEffect(() => {
    if (Object.keys(errors).length > 0 && errorSummaryRef.current) {
      // Focus error summary when validation errors appear
      setTimeout(() => {
        errorSummaryRef.current?.focus();
      }, 100);
    }
  }, [errors]);

  // Announce connection status changes
  useEffect(() => {
    if (isOnline !== undefined) {
      announceToScreenReader(
        isOnline
          ? 'Conexão com a internet restabelecida'
          : 'Conexão com a internet perdida'
      );
    }
  }, [isOnline]);

  // reCAPTCHA v3 does not require visible widget handlers

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: t('contact.info.address_title'),
      details: (
        <>
          <span>{typeof clinicInfo.address === 'string' ? clinicInfo.address : t('contact.info.address_details')}</span>
        </>
      ),
      subDetails: t('contact.info.address_sub')
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: t('contact.info.phone_title'),
      details: (
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => window.dispatchEvent(new Event('open-cta-modal'))} className="hover:underline font-medium text-left">
            +55 33 99860-1427
          </button>
          <span className="sr-only">+55 33 99860-1427</span>
        </div>
      ),
      subDetails: (
        <button type="button" onClick={() => window.dispatchEvent(new Event('open-cta-modal'))} className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-semibold">
          <MessageCircle size={14} /> {t('contact.info.phone_whatsapp')}
        </button>
      )
    },
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: t('contact.info.email_title'),
      details: <a href="mailto:saraivavision@gmail.com" className="hover:underline">saraivavision@gmail.com</a>,
      subDetails: t('contact.info.email_sub')
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: t('contact.info.hours_title'),
      details: t('contact.info.hours_details'),
      subDetails: t('contact.info.hours_sub')
    }
  ];

  // Removido: blocos de mapa e imagem solicitados pelo cliente.


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
        Pular para o formulário de contato
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
            {t('contact.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            {(() => {
              const raw = t('contact.subtitle');
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
              <h3 className="mb-6" id="form-title">{t('contact.form_title')}</h3>

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
                  Formulário de contato para agendar consulta ou tirar dúvidas. Todos os campos marcados com asterisco são obrigatórios.
                </p>
                {/* Form Validation Summary for Screen Readers */}
                {Object.keys(errors).length > 0 && (
                  <div
                    ref={errorSummaryRef}
                    className="p-3 bg-red-50 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    role="alert"
                    aria-live="assertive"
                    aria-labelledby="form-errors-title"
                    tabIndex="-1"
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
                            • {getFieldLabel(field)}: {error}
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
                      placeholder={t('contact.name_placeholder')}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'error-name' : fieldValidation.name?.success ? 'success-name' : 'name-help'}
                      aria-required="true"
                      style={{ fontSize: '16px', minHeight: '48px', padding: '12px 16px' }}
                    />
                    <div id="name-help" className="sr-only">
                      Digite seu nome completo. Este campo é obrigatório.
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
                      Nome válido
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
                        placeholder={t('contact.email_placeholder')}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'error-email' : fieldValidation.email?.success ? 'success-email' : 'email-help'}
                        aria-required="true"
                        inputMode="email"
                        style={{ fontSize: '16px', minHeight: '48px', padding: '12px 16px' }}
                      />
                      <div id="email-help" className="sr-only">
                        Digite um endereço de e-mail válido. Este campo é obrigatório.
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
                        E-mail válido
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
                        placeholder={t('contact.phone_placeholder')}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'error-phone' : fieldValidation.phone?.success ? 'success-phone' : 'phone-help'}
                        aria-required="true"
                        inputMode="tel"
                        style={{ fontSize: '16px', minHeight: '48px', padding: '12px 16px' }}
                      />
                      <div id="phone-help" className="sr-only">
                        Digite seu número de telefone com DDD. Formato: (XX) XXXXX-XXXX. Este campo é obrigatório.
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
                        Telefone válido
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
                  tabIndex="-1"
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
                      rows="4"
                      maxLength="2000"
                      className={`form-input mobile-touch-input pr-10 ${errors.message
                        ? 'border-red-400 focus:ring-red-300'
                        : fieldValidation.message?.success
                          ? 'border-green-400 focus:ring-green-300'
                          : ''
                        }`}
                      placeholder={t('contact.message_placeholder')}
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
                          Mensagem válida
                        </p>
                      )}
                      {!errors.message && !fieldValidation.message?.success && (
                        <p id="message-help" className="text-xs text-slate-500">
                          Mínimo 10 caracteres, máximo 2000 caracteres
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
                          Proteção de Dados Pessoais (LGPD)
                        </h4>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          Seus dados pessoais serão utilizados exclusivamente para responder à sua consulta médica.
                          Coletamos apenas as informações necessárias (nome, e-mail, telefone e mensagem) para
                          que Dr. Philipe possa entrar em contato e fornecer orientações oftalmológicas adequadas.
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded border border-blue-100 mb-3">
                      <h5 className="text-xs font-medium text-slate-700 mb-2">Seus direitos:</h5>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Acesso aos seus dados pessoais</li>
                        <li>• Correção de dados incompletos ou incorretos</li>
                        <li>• Exclusão dos dados quando solicitado</li>
                        <li>• Portabilidade dos dados para outro prestador</li>
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
                          Ao marcar esta opção, você autoriza o uso dos seus dados conforme descrito acima,
                          em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
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
                      Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados,
                      entre em contato conosco através do e-mail: saraivavision@gmail.com
                    </p>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    {isOnline ? (
                      <Wifi className="h-4 w-4 text-green-600" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-slate-700">
                      Conexão
                    </span>
                  </div>
                  <p className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
                    {isOnline
                      ? 'Conectado à internet'
                      : 'Sem conexão com a internet'}
                  </p>
                  {!isOnline && (
                    <p className="text-xs text-slate-500 mt-1">
                      Verifique sua conexão para enviar o formulário.
                    </p>
                  )}
                </div>

                {/* reCAPTCHA v3 status (no visible widget required) */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {t('contact.recaptcha_label', 'Verificação de Segurança')}
                    </span>
                  </div>
                  <p className={`text-xs ${recaptchaReady ? 'text-green-600' : 'text-red-500'}`}>
                    {recaptchaReady
                      ? t('contact.recaptcha_ready', 'Proteção automática reCAPTCHA ativada')
                      : t('contact.recaptcha_not_ready', 'Verificação de segurança indisponível. Tente novamente.')}
                  </p>
                  {!recaptchaReady && (
                    <p className="text-xs text-slate-500 mt-1">
                      Certifique-se de que está conectado à internet e recarregue a página.
                    </p>
                  )}
                </div>

                {/* Error Feedback */}
                {submissionError && (
                  <div className="mb-4">
                    <ErrorFeedback
                      error={submissionError}
                      onRetry={retryCount < 3 ? handleRetry : undefined}
                      onDismiss={handleDismissError}
                      compact={true}
                    />
                  </div>
                )}

                {/* Alternative Contact Methods */}
                {showAlternativeContacts && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">
                        Contato Alternativo
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700 mb-2">
                      Não foi possível enviar sua mensagem. Entre em contato diretamente:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href="tel:+5533998601427"
                        className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                      >
                        +55 33 99860-1427
                      </a>
                      <a
                        href="mailto:saraivavision@gmail.com"
                        className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                      >
                        saraivavision@gmail.com
                      </a>
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
                    tabIndex="-1"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
                      <div>
                        <h4 className="text-sm font-semibold text-green-800">
                          Mensagem enviada com sucesso!
                        </h4>
                        <p className="text-sm text-green-700 mt-1">
                          Recebemos sua mensagem e entraremos em contato em breve.
                          Obrigado por escolher a Saraiva Vision.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  ref={submitButtonRef}
                  disabled={isSubmitting || !isOnline || !recaptchaReady}
                  type="submit"
                  size="lg"
                  className={`w-full flex items-center justify-center gap-2 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${submissionSuccess
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    : 'disabled:opacity-60'
                    }`}
                  aria-busy={isSubmitting}
                  aria-describedby="submit-status submit-help"
                  aria-label={
                    isRetrying
                      ? `Tentando novamente, tentativa ${retryCount + 1} de 3`
                      : isSubmitting
                        ? 'Enviando mensagem, aguarde'
                        : submissionSuccess
                          ? 'Mensagem enviada com sucesso'
                          : !isOnline
                            ? 'Botão desabilitado: sem conexão com a internet'
                            : !recaptchaReady
                              ? 'Botão desabilitado: carregando verificação de segurança'
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
                    {isRetrying
                      ? `Tentando novamente (${retryCount + 1}/3)...`
                      : isSubmitting
                        ? t('contact.sending_label', 'Enviando mensagem...')
                        : submissionSuccess
                          ? 'Mensagem enviada!'
                          : !isOnline
                            ? 'Sem conexão com a internet'
                            : !recaptchaReady
                              ? 'Carregando verificação de segurança...'
                              : t('contact.send_button', 'Enviar Mensagem')
                    }
                  </span>
                </Button>

                {/* Submit Status and Help for Screen Readers */}
                <div id="submit-status" className="sr-only" aria-live="polite" aria-atomic="true">
                  {isSubmitting && 'Enviando formulário, aguarde...'}
                  {submissionSuccess && 'Formulário enviado com sucesso'}
                  {submissionError && 'Erro no envio do formulário'}
                </div>

                <div id="submit-help" className="sr-only">
                  Para enviar o formulário, certifique-se de que todos os campos obrigatórios estão preenchidos corretamente e que você tem conexão com a internet.
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

            <h3 id="contact-options-heading" className="sr-only">Opções de contato e agendamento</h3>

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
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-700">{t('contact.online_scheduling_title')}</h4>
                  <div className="mt-1" id="online-scheduling-desc">{t('contact.online_scheduling_desc')}</div>
                  <div className="text-blue-600 text-sm mt-1 font-semibold">{t('contact.online_scheduling_benefit')}</div>
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
                  <h4 className="font-bold text-slate-800 group-hover:text-green-700">{t('contact.chatbot_title')}</h4>
                  <div className="mt-1" id="chatbot-desc">{t('contact.chatbot_desc')}</div>
                  <div className="text-green-600 text-sm mt-1 font-semibold">{t('contact.chatbot_availability')}</div>
                </div>
              </div>
            </a>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" role="list" aria-label="Informações de contato">
              {contactInfo.map((info, index) => (
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

            {/* Blocos de mapa e imagem removidos conforme solicitação. */}

          </motion.div>
        </div>
      </div>

      {/* LGPD Consent Banner - Temporarily removed due to missing import */}
      {/* <ConsentBanner onConsentChange={(hasConsent) => {
        if (hasConsent) {
          announceToScreenReader('Consentimento registrado com sucesso', 'polite');
        }
      }} /> */}
    </section>
  );
};

export default Contact;
