import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Bot, Lock, Globe, Shield, Wifi, WifiOff } from 'lucide-react';
import { clinicInfo } from '@/lib/clinicInfo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { submitContactForm, FallbackStrategies, useConnectionStatus, networkMonitor } from '@/lib/apiUtils';
import { getUserFriendlyError, getRecoverySteps, logError } from '@/lib/errorHandling';
import ErrorFeedback, { NetworkError, RateLimitError, RecaptchaError, EmailServiceError } from '@/components/ui/ErrorFeedback';

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    consent: false,
    // Honeypot field for spam protection
    website: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showAlternativeContacts, setShowAlternativeContacts] = useState(false);
  const { ready: recaptchaReady, execute: executeRecaptcha } = useRecaptcha();
  const { isOnline } = useConnectionStatus();

  // Input sanitization helper
  const sanitizeInput = (input) => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  const validators = {
    name: (v) => {
      const sanitized = sanitizeInput(v);
      if (sanitized.length < 3) return t('contact.validation.name_min', 'Nome deve ter pelo menos 3 caracteres');
      if (sanitized.length > 50) return t('contact.validation.name_max', 'Nome muito longo (máximo 50 caracteres)');
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(sanitized)) return t('contact.validation.name_invalid', 'Nome deve conter apenas letras');
      return true;
    },
    email: (v) => {
      const sanitized = sanitizeInput(v);
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(sanitized)) return t('contact.validation.email_invalid', 'Email inválido');
      if (sanitized.length > 100) return t('contact.validation.email_max', 'Email muito longo');
      return true;
    },
    phone: (v) => {
      const cleaned = v.replace(/\D/g, '');
      if (cleaned.length < 10 || cleaned.length > 13) return t('contact.validation.phone_invalid', 'Telefone inválido');
      return true;
    },
    message: (v) => {
      const sanitized = sanitizeInput(v);
      if (sanitized.length < 10) return t('contact.validation.message_min', 'Mensagem deve ter pelo menos 10 caracteres');
      if (sanitized.length > 1000) return t('contact.validation.message_max', 'Mensagem muito longa (máximo 1000 caracteres)');
      // Check for suspicious patterns
      if (/(https?:\/\/|www\.|\.com|\.org|\.net)/gi.test(sanitized)) {
        return t('contact.validation.no_links', 'Links não são permitidos na mensagem');
      }
      return true;
    },
    consent: (v) => v === true || t('contact.validation.consent_required', 'É necessário aceitar os termos'),
    // With reCAPTCHA v3, we acquire a token on submit; do not require manual widget
    recaptcha: () => true
  };



  const phoneNumber = "5533998601427";
  const whatsappLink = `https://wa.me/${phoneNumber}`;
  const chatbotLink = "https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica?model=gpt-4o";

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!touched[name]) setTouched(prev => ({ ...prev, [name]: true }));

    const rule = validators[name];
    if (rule) {
      const result = rule(value);
      setErrors(prev => ({ ...prev, [name]: result === true ? undefined : result }));
    }
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const rule = validators[field];
      if (rule) {
        const result = rule(formData[field]);
        if (result !== true) newErrors[field] = result;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setSubmissionError(null);
    setShowAlternativeContacts(false);

    // Check connection status first
    if (!isOnline) {
      setSubmissionError({ name: 'NetworkError', message: 'No internet connection' });
      return;
    }

    // Honeypot spam protection
    if (formData.website && formData.website.trim() !== '') {
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
      setSubmissionError({ error: 'rate_limited' });
      return;
    }

    if (!validateAll()) {
      setTouched({ name: true, email: true, phone: true, message: true, recaptcha: true });
      setSubmissionError({
        field: Object.keys(errors)[0] || 'validation',
        code: 'validation_failed'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Execute reCAPTCHA v3 to obtain token
      const token = await executeRecaptcha('contact');
      if (!token) {
        setSubmissionError({ code: 'missing_token' });
        setIsSubmitting(false);
        return;
      }

      // Use the enhanced API utility
      const submissionData = {
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

      toast({
        title: t('contact.toast_success_title'),
        description: t('contact.toast_success_desc'),
        duration: 5000,
      });

      // Reset form
      setFormData({ name: '', email: '', phone: '', message: '', consent: false, website: '' });
      setTouched({});
      setErrors({});
      setRecaptchaToken(null);

    } catch (error) {
      console.error('Form submission error:', error);
      setSubmissionError(error);

      // Log the error for debugging
      logError(error, {
        action: 'contact_form_submission',
        retryCount,
        formData: { name: formData.name, email: formData.email }
      });

      // Try to store for retry if it's a recoverable error
      if (retryCount < 3 && (error.name === 'NetworkError' || error.status >= 500)) {
        const stored = FallbackStrategies.storeForRetry(submissionData);
        if (stored) {
          toast({
            title: 'Mensagem salva',
            description: 'Sua mensagem foi salva e será enviada quando a conexão for restabelecida.',
            duration: 4000,
          });
        }
      }

      // Show alternative contacts for critical errors
      if (error.status === 500 || error.name === 'NetworkError') {
        setShowAlternativeContacts(true);
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
          <button type="button" onClick={() => window.dispatchEvent(new Event('open-floating-cta'))} className="hover:underline font-medium text-left">
            +55 33 99860-1427
          </button>
          <span className="sr-only">+55 33 99860-1427</span>
        </div>
      ),
      subDetails: (
        <button type="button" onClick={() => window.dispatchEvent(new Event('open-floating-cta'))} className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-semibold">
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
    <section id="contact" className="py-16 md:py-20 bg-subtle-gradient scroll-block-internal">
      <div className="container mx-auto px-4 md:px-6 lg:px-[2.5%] xl:px-[3%] 2xl:px-[3.5%]">
        <div className="text-center mb-16">
          <motion.h2
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
              <h3 className="mb-6">{t('contact.form_title')}</h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Mobile-First Touch-Optimized Form Fields */}
                <div>
                  <label htmlFor="name" className="block text-base font-medium text-slate-700 mb-2 md:text-sm md:mb-1.5">
                    {t('contact.name_label', 'Nome completo')} <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text" id="name" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required
                    className={`form-input mobile-touch-input ${errors.name ? 'border-red-400 focus:ring-red-300' : touched.name ? 'border-green-400' : ''}`}
                    placeholder={t('contact.name_placeholder')}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'error-name' : undefined}
                    style={{ fontSize: '16px', minHeight: '48px', padding: '12px 16px' }}
                  />
                  {errors.name && <p id="error-name" className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>}
                </div>

                {/* Mobile: Stack vertically, Desktop: Side by side */}
                <div className="space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:gap-5">
                  <div>
                    <label htmlFor="email" className="block text-base font-medium text-slate-700 mb-2 md:text-sm md:mb-1.5">
                      {t('contact.email_label', 'E-mail')} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="email" id="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required
                      className={`form-input mobile-touch-input ${errors.email ? 'border-red-400 focus:ring-red-300' : touched.email ? 'border-green-400' : ''}`}
                      placeholder={t('contact.email_placeholder')}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'error-email' : undefined}
                      inputMode="email"
                      style={{ fontSize: '16px', minHeight: '48px', padding: '12px 16px' }}
                    />
                    {errors.email && <p id="error-email" className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-base font-medium text-slate-700 mb-2 md:text-sm md:mb-1.5">
                      {t('contact.phone_label', 'Telefone')} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required
                      className={`form-input mobile-touch-input ${errors.phone ? 'border-red-400 focus:ring-red-300' : touched.phone ? 'border-green-400' : ''}`}
                      placeholder={t('contact.phone_placeholder')}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'error-phone' : undefined}
                      inputMode="tel"
                      style={{ fontSize: '16px', minHeight: '48px', padding: '12px 16px' }}
                    />
                    {errors.phone && <p id="error-phone" className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>}
                  </div>
                </div>

                {/* Honeypot field - hidden from users, only bots will fill it */}
                <input
                  type="text"
                  name="website"
                  value={formData.website}
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
                  <textarea
                    id="message" name="message" value={formData.message} onChange={handleChange} onBlur={handleBlur} required
                    rows="4"
                    className={`form-input mobile-touch-input ${errors.message ? 'border-red-400 focus:ring-red-300' : touched.message ? 'border-green-400' : ''}`}
                    placeholder={t('contact.message_placeholder')}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'error-message' : undefined}
                    style={{ fontSize: '16px', minHeight: '120px', padding: '12px 16px', resize: 'vertical', overscrollBehavior: 'none' }}
                  ></textarea>
                  {errors.message && <p id="error-message" className="mt-2 text-sm text-red-600 font-medium">{errors.message}</p>}
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-start gap-2 text-xs text-blue-800 bg-blue-50 border border-blue-200 p-3 rounded-md cursor-pointer">
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleChange}
                      aria-invalid={!!errors.consent}
                      aria-describedby={errors.consent ? 'error-consent' : undefined}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <Lock size={14} className="mt-0.5 text-blue-600" />
                    <span dangerouslySetInnerHTML={{ __html: t('privacy.form_consent_html') }} />
                  </label>
                  {errors.consent && <p id="error-consent" className="mt-1 text-xs text-red-600">{errors.consent}</p>}
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

                <Button
                  disabled={isSubmitting || !isOnline}
                  type="submit"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2 disabled:opacity-60"
                  aria-busy={isSubmitting}
                >
                  <Send className="h-5 w-5" />
                  {isRetrying
                    ? `Tentando novamente (${retryCount + 1}/3)...`
                    : isSubmitting
                      ? t('contact.sending_label', 'Enviando...')
                      : !isOnline
                        ? 'Sem conexão'
                        : t('contact.send_button', 'Enviar Mensagem')
                  }
                </Button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col space-y-6"
          >
            {/* Expose clinic name for tests and SR, without altering visual UI */}
            <div className="sr-only">{clinicInfo.name}</div>
            <a href={clinicInfo.onlineSchedulingUrl} target="_blank" rel="noopener noreferrer" className="block modern-card-alt p-6 group mb-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Globe className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-blue-700">{t('contact.online_scheduling_title')}</h4>
                  <div className="mt-1">{t('contact.online_scheduling_desc')}</div>
                  <div className="text-blue-600 text-sm mt-1 font-semibold">{t('contact.online_scheduling_benefit')}</div>
                </div>
              </div>
            </a>
            <a href={chatbotLink} target="_blank" rel="noopener noreferrer" className="block modern-card-alt p-6 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Bot className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-green-700">{t('contact.chatbot_title')}</h4>
                  <div className="mt-1">{t('contact.chatbot_desc')}</div>
                  <div className="text-green-600 text-sm mt-1 font-semibold">{t('contact.chatbot_availability')}</div>
                </div>
              </div>
            </a>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="modern-card p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="icon-container">
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
    </section>
  );
};

export default Contact;
