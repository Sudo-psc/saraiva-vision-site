import React, { useState } from 'react';
import { MessageCircle, User, Phone, ClipboardList, ArrowRight } from 'lucide-react';
import { generateWhatsAppURL } from '@/lib/napCanonical';

/**
 * LeadCaptureForm - Formulário simplificado de captura de leads para landing pages
 *
 * @param {Object} props
 * @param {Array<{value: string, label: string}>} props.symptomOptions - Opções de sintomas
 * @param {string} props.pageContext - Contexto da página para mensagem WhatsApp
 * @param {string} [props.ctaText] - Texto do botão CTA
 * @author Dr. Philipe Saraiva Cruz
 */
const LeadCaptureForm = ({
  symptomOptions = [],
  pageContext = 'Olho Seco',
  ctaText = 'Agende Avaliação Gratuita de 15min',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    symptom: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'whatsapp' ? formatPhone(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedSymptom = symptomOptions.find((s) => s.value === formData.symptom);
    const symptomLabel = selectedSymptom ? selectedSymptom.label : formData.symptom;

    const message = [
      `Olá! Gostaria de agendar uma avaliação gratuita de 15 minutos.`,
      ``,
      `Interesse: ${pageContext}`,
      `Nome: ${formData.name}`,
      `WhatsApp: ${formData.whatsapp}`,
      symptomLabel ? `Sintoma principal: ${symptomLabel}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // GA4 tracking
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'lead_capture_submit',
        lead_page: pageContext,
        lead_symptom: formData.symptom,
      });
    }

    const whatsappUrl = generateWhatsAppURL(message);
    setSubmitted(true);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const isValid =
    formData.name.trim().length >= 2 &&
    formData.whatsapp.replace(/\D/g, '').length >= 10;

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-cyan-500/30 p-6 lg:p-8 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Mensagem enviada!</h3>
        <p className="text-slate-300 mb-4">
          Você foi redirecionado para o WhatsApp. Nossa equipe responderá em breve.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-cyan-400 hover:text-cyan-300 text-sm underline"
        >
          Enviar novamente
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-cyan-500/30 p-6 lg:p-8 shadow-2xl"
    >
      <h3 className="text-lg font-bold text-white mb-1">
        Avaliação Gratuita de 15min
      </h3>
      <p className="text-slate-400 text-sm mb-6">
        Preencha e fale direto com nossa equipe via WhatsApp
      </p>

      {/* Nome */}
      <div className="mb-4">
        <label htmlFor="lead-name" className="sr-only">
          Nome completo
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            id="lead-name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* WhatsApp */}
      <div className="mb-4">
        <label htmlFor="lead-whatsapp" className="sr-only">
          WhatsApp
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            id="lead-whatsapp"
            name="whatsapp"
            type="tel"
            required
            placeholder="(33) 99999-9999"
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Sintoma principal */}
      {symptomOptions.length > 0 && (
        <div className="mb-6">
          <label htmlFor="lead-symptom" className="sr-only">
            Sintoma principal
          </label>
          <div className="relative">
            <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <select
              id="lead-symptom"
              name="symptom"
              value={formData.symptom}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white appearance-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            >
              <option value="" className="bg-slate-800">
                Sintoma principal (opcional)
              </option>
              {symptomOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-800">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-green-500/25"
      >
        <MessageCircle className="w-5 h-5" />
        {ctaText}
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-slate-500 text-xs text-center mt-3">
        Seus dados são protegidos conforme LGPD
      </p>
    </form>
  );
};

export default LeadCaptureForm;
