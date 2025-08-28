import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Bot, Lock, Globe } from 'lucide-react';
import { clinicInfo } from '@/lib/clinicInfo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRecaptcha } from '@/hooks/useRecaptcha';

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { ready: recaptchaReady, execute: executeRecaptcha, enabled: recaptchaEnabled } = useRecaptcha();
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
    consent: (v) => v === true || t('contact.validation.consent_required', 'É necessário aceitar os termos')
  };

  // Validate all when data changes on touched fields
  useEffect(() => {
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      if (!touched[field]) return;
      const rule = validators[field];
      if (rule) {
        const result = rule(formData[field]);
        if (result !== true) newErrors[field] = result;
      }
    });
    setErrors(newErrors);
  }, [formData, touched]);

  const phoneNumber = "5533998601427";
  const whatsappLink = `https://wa.me/${phoneNumber}`;
  const chatbotLink = "https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica?model=gpt-4o";

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (!touched[name]) setTouched(prev => ({ ...prev, [name]: true }));
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
      toast({
        title: t('contact.rate_limit_title', 'Aguarde um momento'),
        description: t('contact.rate_limit_desc', 'Aguarde 30 segundos antes de enviar novamente.'),
        variant: 'destructive'
      });
      return;
    }

    if (!validateAll()) {
      setTouched({ name: true, email: true, phone: true, message: true });
      toast({ title: t('contact.toast_error_title'), description: t('contact.toast_error_desc'), variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    localStorage.setItem('lastContactSubmission', now.toString());

    let token = null;
    let action = 'contact';
    if (recaptchaEnabled) {
      if (!recaptchaReady) {
        setIsSubmitting(false);
        toast({
          title: t('contact.toast_error_title'),
          description: t('contact.recaptcha_not_ready', 'Verificação de segurança indisponível. Tente novamente.'),
          variant: 'destructive'
        });
        return;
      }
      token = await executeRecaptcha(action);
      if (!token) {
        setIsSubmitting(false);
        toast({
          title: t('contact.toast_error_title'),
          description: t('contact.recaptcha_error', 'Falha na verificação reCAPTCHA. Tente novamente.'),
          variant: 'destructive'
        });
        return;
      }
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, token, action })
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.details?.message || data?.error || 'server_error');
      }

      toast({
        title: t('contact.toast_success_title'),
        description: t('contact.toast_success_desc'),
        duration: 5000,
      });
      setFormData({ name: '', email: '', phone: '', message: '', consent: false, website: '' });
      setTouched({});
      setErrors({});
    } catch (err) {
      toast({
        title: t('contact.toast_error_title'),
        description: t('contact.server_error', 'Não foi possível enviar. Tente novamente mais tarde.'),
        variant: 'destructive'
      });
      // Allow retry sooner when server failed
      localStorage.removeItem('lastContactSubmission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: t('contact.info.address_title'),
      details: t('contact.info.address_details'),
      subDetails: t('contact.info.address_sub')
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: t('contact.info.phone_title'),
      details: (
        <button onClick={() => window.dispatchEvent(new Event('open-cta-modal'))} className="hover:underline font-medium text-left">
          +55 33 99860-1427
        </button>
      ),
      subDetails: (
        <button onClick={() => window.dispatchEvent(new Event('open-cta-modal'))} className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-semibold">
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
    <section id="contact" className="bg-transparent relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-heading-xl md:text-display-sm font-bold mb-6"
          >
            {t('contact.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-body-xl leading-loose max-w-prose mx-auto"
          >
            {t('contact.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 shadow-3d border-2 border-slate-300/80">
              <h3 className="mb-6">{t('contact.form_title')}</h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Mobile-First Touch-Optimized Form Fields */}
                <div>
                  <label htmlFor="name" className="block text-base font-medium text-slate-700 mb-2 md:text-sm md:mb-1.5">
                    {t('contact.name_label')} <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
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
                      {t('contact.email_label')} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
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
                      {t('contact.phone_label')} <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required
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
                    {t('contact.message_label')} <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="message" name="message" value={formData.message} onChange={handleChange} required
                    rows="4"
                    className={`form-input mobile-touch-input ${errors.message ? 'border-red-400 focus:ring-red-300' : touched.message ? 'border-green-400' : ''}`}
                    placeholder={t('contact.message_placeholder')}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'error-message' : undefined}
                    style={{ fontSize: '16px', minHeight: '120px', padding: '12px 16px', resize: 'vertical' }}
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

                <Button disabled={isSubmitting} type="submit" size="lg" className="w-full flex items-center justify-center gap-2 disabled:opacity-60" aria-busy={isSubmitting}>
                  <Send className="h-5 w-5" />
                  {isSubmitting ? t('contact.sending_label') : t('contact.send_button')}
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
            <a href={clinicInfo.onlineSchedulingUrl} target="_blank" rel="noopener noreferrer" className="block p-6 group mb-4 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-3d hover:shadow-3d-hover transition">
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
            <a href={chatbotLink} target="_blank" rel="noopener noreferrer" className="block p-6 group bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-3d hover:shadow-3d-hover transition">
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
                  className="p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-3d hover:shadow-3d-hover transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="icon-container">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{info.title}</h4>
                      <div className="mt-1 text-sm">{info.details}</div>
                      <div className="text-slate-700 text-sm mt-0.5">{info.subDetails}</div>
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
