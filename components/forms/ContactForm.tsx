'use client';

import React, { useState, useRef, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, AlertCircle, CheckCircle, Phone, MessageCircle, Mail, Shield } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { CONTACT } from '@/lib/constants';
import { submitContactAction } from '../../app/actions/contact';
import type { ContactFormData, ContactFormErrors } from '../../types/contact';

interface ContactFormProps {
  onSuccess?: () => void;
}

export default function ContactForm({ onSuccess }: ContactFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const validateField = (name: keyof ContactFormData, value: string | boolean): string | null => {
    switch (name) {
      case 'name':
        if (typeof value !== 'string') return null;
        if (!value || value.trim().length < 2) return 'Por favor, informe seu nome completo';
        if (value.trim().length > 100) return 'Nome muito longo';
        return null;

      case 'email':
        if (typeof value !== 'string') return null;
        if (!value) return 'Por favor, informe seu e-mail';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'E-mail inválido. Exemplo: nome@email.com';
        return null;

      case 'phone':
        if (typeof value !== 'string') return null;
        if (!value) return 'Por favor, informe seu telefone para contato';
        const phoneRegex = /^\(?(\d{2})\)?[\s-]?9?\d{4}[\s-]?\d{4}$/;
        if (!phoneRegex.test(value.replace(/\D/g, ''))) {
          return 'Telefone inválido. Use o formato (33) 99999-9999';
        }
        return null;

      case 'message':
        if (typeof value !== 'string') return null;
        if (!value || value.trim().length < 10) return 'Mensagem muito curta. Mínimo 10 caracteres';
        if (value.trim().length > 1000) return 'Mensagem muito longa. Máximo 1000 caracteres';
        return null;

      case 'consent':
        if (typeof value !== 'boolean') return null;
        if (!value) return 'Você deve aceitar os termos de privacidade';
        return null;

      default:
        return null;
    }
  };

  const handleChange = (e: { target: { name: string; type: string; value: string; checked?: boolean } }) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev: ContactFormData) => ({ ...prev, [name]: newValue }));

    if (touched[name]) {
      const error = validateField(name as keyof ContactFormData, newValue);
      setErrors((prev: ContactFormErrors) => ({
        ...prev,
        [name]: error || undefined,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name as keyof ContactFormData, value);
    setErrors((prev: ContactFormErrors) => ({
      ...prev,
      [name]: error || undefined,
    }));
  };

  const formatPhone = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData((prev: ContactFormData) => ({ ...prev, phone: formatted }));

    if (touched.phone) {
      const error = validateField('phone', formatted);
      setErrors((prev: ContactFormErrors) => ({ ...prev, phone: error || undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors: ContactFormErrors = {};
    (Object.keys(formData) as Array<keyof ContactFormData>).forEach((key) => {
      if (key !== 'honeypot') {
        const error = validateField(key, formData[key]);
        if (error) validationErrors[key] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ name: true, email: true, phone: true, message: true, consent: true });

      const firstError = Object.keys(validationErrors)[0];
      document.getElementById(firstError)?.focus();

      return;
    }

    startTransition(async () => {
      try {
        const result = await submitContactAction(formData);

        if (result.success) {
          setShowSuccess(true);
          setFormData({ name: '', email: '', phone: '', message: '', consent: false, honeypot: '' });
          setErrors({});
          setTouched({});

          toast({
            title: 'Mensagem enviada com sucesso!',
            description: 'Entraremos em contato em breve.',
            duration: 5000,
          });

          if (onSuccess) onSuccess();
        } else {
          setErrors(result.errors || {});
          toast({
            variant: 'destructive',
            title: 'Erro ao enviar mensagem',
            description: result.message || 'Tente novamente ou use nossos contatos diretos.',
          });
          setShowFallback(true);
        }
      } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao enviar mensagem',
          description: 'Tente novamente ou use nossos contatos diretos abaixo.',
        });
        setShowFallback(true);
      }
    });
  };

  const whatsappUrl = `https://wa.me/${CONTACT.PHONE.NUMBER}?text=${encodeURIComponent(
    `Olá! Gostaria de agendar uma consulta.\n\nNome: ${formData.name}\nTelefone: ${formData.phone}\nMensagem: ${formData.message}`
  )}`;

  return (
    <div className="max-w-2xl mx-auto">
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
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
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
                    💬 Para urgências: <a href={whatsappUrl} className="text-green-700 underline font-medium">WhatsApp</a>
                  </li>
                </ul>

                <button
                  onClick={() => setShowSuccess(false)}
                  className="mt-4 text-sm text-green-700 underline hover:text-green-900"
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
            {Object.keys(errors).length > 0 && Object.values(touched).some(Boolean) && (
              <div
                role="alert"
                className="error-summary bg-red-50 border border-red-200 rounded-lg p-4"
                aria-live="assertive"
              >
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Corrija os seguintes erros:
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-red-800">
                  {Object.entries(errors).map(
                    ([field, error]) =>
                      error && (
                        <li key={field}>
                          <a href={`#${field}`} className="underline hover:text-red-900">
                            {error}
                          </a>
                        </li>
                      )
                  )}
                </ul>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nome Completo <span className="text-red-500" aria-label="obrigatório">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${errors.name && touched.name ? 'input-error' : ''}`}
                aria-invalid={!!(errors.name && touched.name)}
                aria-describedby={errors.name && touched.name ? 'name-error' : 'name-hint'}
                placeholder="João da Silva"
                autoComplete="name"
                required
              />
              {!errors.name && (
                <p id="name-hint" className="form-hint">
                  Nome e sobrenome
                </p>
              )}
              {errors.name && touched.name && (
                <p id="name-error" className="form-error" role="alert">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                E-mail <span className="text-red-500" aria-label="obrigatório">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`form-input ${errors.email && touched.email ? 'input-error' : ''}`}
                aria-invalid={!!(errors.email && touched.email)}
                aria-describedby={errors.email && touched.email ? 'email-error' : 'email-hint'}
                placeholder="joao@email.com"
                autoComplete="email"
                required
              />
              {!errors.email && (
                <p id="email-hint" className="form-hint">
                  Enviaremos a confirmação para este e-mail
                </p>
              )}
              {errors.email && touched.email && (
                <p id="email-error" className="form-error" role="alert">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Telefone/WhatsApp <span className="text-red-500" aria-label="obrigatório">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                onBlur={handleBlur}
                className={`form-input ${errors.phone && touched.phone ? 'input-error' : ''}`}
                aria-invalid={!!(errors.phone && touched.phone)}
                aria-describedby={errors.phone && touched.phone ? 'phone-error' : 'phone-hint'}
                placeholder="(33) 99999-9999"
                autoComplete="tel-national"
                required
              />
              {!errors.phone && (
                <p id="phone-hint" className="form-hint">
                  Digite com DDD. Ex: (33) 99860-1427
                </p>
              )}
              {errors.phone && touched.phone && (
                <p id="phone-error" className="form-error" role="alert">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Mensagem <span className="text-red-500" aria-label="obrigatório">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={4}
                className={`form-input ${errors.message && touched.message ? 'input-error' : ''}`}
                aria-invalid={!!(errors.message && touched.message)}
                aria-describedby={errors.message && touched.message ? 'message-error' : 'message-hint'}
                placeholder="Descreva o motivo do contato..."
                required
              />
              {!errors.message && (
                <p id="message-hint" className="form-hint">
                  Mínimo 10 caracteres ({formData.message.length}/1000)
                </p>
              )}
              {errors.message && touched.message && (
                <p id="message-error" className="form-error" role="alert">
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                  {errors.message}
                </p>
              )}
            </div>

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

            <div className="pt-2">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      Proteção de Dados Pessoais (LGPD)
                    </h4>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Seus dados serão utilizados exclusivamente para responder à sua consulta médica.
                    </p>
                  </div>
                </div>

                <label
                  className={`inline-flex items-start gap-3 cursor-pointer p-3 rounded-md border-2 transition-colors ${
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
                      Ao marcar esta opção, você autoriza o uso dos seus dados conforme a LGPD.
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
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || Object.keys(errors).length > 0}
              className="btn-submit w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-live="polite"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" aria-hidden="true" />
                  Enviar Mensagem
                </>
              )}
            </button>

            {showFallback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="fallback-contacts bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6"
              >
                <h3 className="font-semibold text-blue-900 mb-4">Contatos Diretos</h3>
                <div className="grid gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                  >
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">WhatsApp</div>
                      <div className="text-xs text-slate-600">{CONTACT.PHONE.DISPLAY}</div>
                    </div>
                  </a>

                  <a
                    href={CONTACT.PHONE.HREF}
                    className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Telefone</div>
                      <div className="text-xs text-slate-600">{CONTACT.PHONE.DISPLAY}</div>
                    </div>
                  </a>

                  <a
                    href={`mailto:${CONTACT.EMAIL}`}
                    className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                  >
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">E-mail</div>
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
