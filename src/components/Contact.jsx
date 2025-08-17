import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  message: '',
  consent: false
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validators = {
    name: (v) => v.trim().length >= 3 || 'Informe pelo menos 3 caracteres.',
    email: (v) => /.+@.+\..+/.test(v) || 'E-mail inválido.',
    phone: (v) => /^(\+?55)?\d{10,13}$/.test(v.replace(/\D/g, '')) || 'Use apenas números com DDD (ex: 33998601427).',
    message: (v) => v.trim().length >= 10 || 'Mensagem muito curta (mín. 10 caracteres).',
    consent: (v) => v === true || 'É necessário consentir com o tratamento dos dados.'
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
  const chatbotLink = "https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica";

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateAll()) {
      setTouched({ name: true, email: true, phone: true, message: true });
      toast({ title: 'Verifique os campos', description: 'Alguns dados precisam de ajuste.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast({
        title: t('contact.toast_success_title'),
        description: t('contact.toast_success_desc'),
        duration: 5000,
      });
  setFormData({ name: '', email: '', phone: '', message: '', consent: false });
      setTouched({});
      setErrors({});
      setIsSubmitting(false);
    }, 800);
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
        <button onClick={() => window.dispatchEvent(new Event('open-floating-cta'))} className="hover:underline font-medium text-left">
          +55 33 99860-1427
        </button>
      ),
      subDetails: (
        <button onClick={() => window.dispatchEvent(new Event('open-floating-cta'))} className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-semibold">
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
    <section id="contact" className="bg-subtle-gradient">
      <div className="container mx-auto px-4 md:px-6">
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
            <div className="bg-white rounded-2xl p-8 shadow-soft-light">
              <h3 className="mb-6">{t('contact.form_title')}</h3>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('contact.name_label')}
                  </label>
                  <input
                    type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                    className={`form-input ${errors.name ? 'border-red-400 focus:ring-red-300' : touched.name ? 'border-green-400' : ''}`}
                    placeholder={t('contact.name_placeholder')}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'error-name' : undefined}
                  />
                  {errors.name && <p id="error-name" className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('contact.email_label')}
                    </label>
                    <input
                      type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                      className={`form-input ${errors.email ? 'border-red-400 focus:ring-red-300' : touched.email ? 'border-green-400' : ''}`}
                      placeholder={t('contact.email_placeholder')}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'error-email' : undefined}
                    />
                    {errors.email && <p id="error-email" className="mt-1 text-xs text-red-600">{errors.email}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                      {t('contact.phone_label')}
                    </label>
                    <input
                      type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required
                      className={`form-input ${errors.phone ? 'border-red-400 focus:ring-red-300' : touched.phone ? 'border-green-400' : ''}`}
                      placeholder={t('contact.phone_placeholder')}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'error-phone' : undefined}
                    />
                    {errors.phone && <p id="error-phone" className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('contact.message_label')}
                  </label>
                  <textarea
                    id="message" name="message" value={formData.message} onChange={handleChange} required rows="4"
                    className={`form-input ${errors.message ? 'border-red-400 focus:ring-red-300' : touched.message ? 'border-green-400' : ''}`}
                    placeholder={t('contact.message_placeholder')}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'error-message' : undefined}
                  ></textarea>
                  {errors.message && <p id="error-message" className="mt-1 text-xs text-red-600">{errors.message}</p>}
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
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
                    <span dangerouslySetInnerHTML={{ __html: t('privacy.form_consent_html') }} />
                  </label>
                  {errors.consent && <p id="error-consent" className="mt-1 text-xs text-red-600">{errors.consent}</p>}
                </div>
                
                <Button disabled={isSubmitting} type="submit" size="lg" className="w-full flex items-center justify-center gap-2 disabled:opacity-60">
                  <Send className="h-5 w-5" />
                  {isSubmitting ? 'Enviando...' : t('contact.send_button')}
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
                    <div>
                      <h4 className="font-bold text-slate-800">{info.title}</h4>
                      <div className="mt-1 text-sm">{info.details}</div>
                      <div className="text-slate-500 text-sm mt-0.5">{info.subDetails}</div>
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