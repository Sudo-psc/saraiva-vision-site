import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, AlertCircle, CheckCircle, Phone, MessageCircle, Mail, WifiOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { CONTACT } from '@/lib/constants';
import ReCAPTCHA from 'react-google-recaptcha';

const ContactFormEnhanced = ({ onSuccess }) => {
  const { toast } = useToast();
  const recaptchaRef = useRef(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [recaptchaFailed, setRecaptchaFailed] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState(null);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const MAX_ATTEMPTS_WITHOUT_RECAPTCHA = 3;
  const RATE_LIMIT_WINDOW = 3600000; // 1 hora em ms

  const validateField = (name, value) => {
    const validators = {
      name: (v) => {
        if (!v || v.trim().length < 2) return 'Por favor, informe seu nome completo';
        if (v.trim().length > 100) return 'Nome muito longo';
        return null;
      },
      email: (v) => {
        if (!v) return 'Por favor, informe seu e-mail';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(v)) return 'E-mail inválido. Exemplo: nome@email.com';
        return null;
      },
      phone: (v) => {
        if (!v) return 'Por favor, informe seu telefone para contato';
        const phoneRegex = /^\(?(\d{2})\)?[\s-]?9?\d{4}[\s-]?\d{4}$/;
        if (!phoneRegex.test(v.replace(/\D/g, ''))) {
          return 'Telefone inválido. Use o formato (33) 99999-9999';
        }
        return null;
      },
      message: (v) => {
        if (!v || v.trim().length < 10) return 'Mensagem muito curta. Mínimo 10 caracteres';
        if (v.trim().length > 1000) return 'Mensagem muito longa. Máximo 1000 caracteres';
        return null;
      }
    };

    const error = validators[name]?.(value);
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    if (touched.phone) {
      const error = validateField('phone', formatted);
      setErrors(prev => ({ ...prev, phone: error }));
    }
  };

  const checkRateLimit = () => {
    const submissions = JSON.parse(localStorage.getItem('contact_submissions') || '[]');
    const now = Date.now();
    
    const recentSubmissions = submissions.filter(time => (now - time) < RATE_LIMIT_WINDOW);
    
    if (recentSubmissions.length >= MAX_ATTEMPTS_WITHOUT_RECAPTCHA && !recaptchaToken) {
      return {
        limited: true,
        remaining: MAX_ATTEMPTS_WITHOUT_RECAPTCHA - recentSubmissions.length
      };
    }
    
    localStorage.setItem('contact_submissions', JSON.stringify([...recentSubmissions, now]));
    return { limited: false };
  };

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
    setRecaptchaFailed(false);
    setRecaptchaError(null);
  };

  const handleRecaptchaError = () => {
    setRecaptchaFailed(true);
    setRecaptchaError('Verificação de segurança falhou. Você pode enviar mesmo assim (limite: 3 envios por hora).');
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) validationErrors[key] = error;
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setTouched({ name: true, email: true, phone: true, message: true });
      
      const firstError = Object.keys(validationErrors)[0];
      document.getElementById(firstError)?.focus();
      
      return;
    }

    const rateLimitCheck = checkRateLimit();
    if (rateLimitCheck.limited) {
      toast({
        variant: 'destructive',
        title: 'Limite de envios atingido',
        description: 'Por segurança, complete a verificação abaixo ou aguarde 1 hora.'
      });
      setShowFallback(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitAttempts(prev => prev + 1);

    try {
      const payload = {
        ...formData,
        recaptchaToken: recaptchaToken || 'fallback',
        timestamp: new Date().toISOString()
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setShowSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setErrors({});
      setTouched({});
      
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }

      if (onSuccess) onSuccess(data);

    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      
      setShowFallback(true);
      
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar mensagem',
        description: 'Tente novamente ou use nossos contatos diretos abaixo.'
      });
    } finally {
      setIsSubmitting(false);
    }
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
                  <li>💬 Para urgências: <a href={whatsappUrl} className="text-green-700 underline font-medium">WhatsApp</a></li>
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
            {/* Resumo de Erros (acessibilidade) */}
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
                  {Object.entries(errors).map(([field, error]) => (
                    error && <li key={field}>
                      <a href={`#${field}`} className="underline hover:text-red-900">
                        {error}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Campo Nome */}
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

            {/* Campo E-mail */}
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

            {/* Campo Telefone */}
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

            {/* Campo Mensagem */}
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

            {/* reCAPTCHA (condicional) */}
            {!recaptchaFailed && process.env.REACT_APP_RECAPTCHA_SITE_KEY && (
              <div className="recaptcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                  onExpired={handleRecaptchaExpired}
                  onErrored={handleRecaptchaError}
                  hl="pt-BR"
                />
              </div>
            )}

            {/* Mensagem Fallback */}
            {(recaptchaFailed || submitAttempts >= 2) && (
              <div className="fallback-notice bg-amber-50 border border-amber-200 rounded-lg p-4" role="alert">
                <p className="text-sm text-amber-900 flex items-start gap-2">
                  <WifiOff className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    {recaptchaError || 
                      `Você pode enviar mesmo assim (limite: ${MAX_ATTEMPTS_WITHOUT_RECAPTCHA} envios por hora) ou usar nossos contatos diretos.`}
                  </span>
                </p>
              </div>
            )}

            {/* Botão Submit */}
            <Button
              type="submit"
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className="btn-submit w-full"
              aria-live="polite"
            >
              {isSubmitting ? (
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
            </Button>

            {/* Contatos Alternativos (Fallback) */}
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
};

export default ContactFormEnhanced;
