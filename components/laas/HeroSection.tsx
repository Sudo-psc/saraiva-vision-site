'use client';

import { useState } from 'react';
import { Shield, Award, Eye, UserCheck, Loader2 } from 'lucide-react';
import { trackCtaClick, trackLeadGeneration } from '@/lib/laas/analytics';
import { LAAS_WHATSAPP_NUMBER, SOCIAL_PROOF_BADGES } from '@/lib/laas/config';
import type { LaasFormData } from '@/types/laas';
import { laasLeadFormSchema, type LaasLeadResponse } from '@/lib/validations/laas';

const BADGE_ICONS = {
  'Selo de Qualidade': Award,
  'Aprovado ANVISA': Shield,
  'Lentes Premium': Eye,
  'CRM Médico Responsável': UserCheck,
};

// A/B Test variants for headline
const HEADLINE_VARIANTS = {
  A: 'Nunca mais fique sem lentes',
  B: 'Suas lentes de contato com cuidado médico, sem o trabalho de lembrar de comprar',
};

const ACTIVE_VARIANT =
  (process.env.NEXT_PUBLIC_HERO_HEADLINE_VARIANT as 'A' | 'B') || 'A';

export function HeroSection() {
  const [formData, setFormData] = useState<LaasFormData>({
    nome: '',
    whatsapp: '',
    email: '',
    lgpdConsent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [estimatedSavings, setEstimatedSavings] = useState<{
    monthly: number;
    yearly: number;
  } | null>(null);

  const handleAgendarClick = () => {
    trackCtaClick('agendar_consulta', 'hero');
    const element = document.getElementById('planos');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleWhatsAppClick = () => {
    trackCtaClick('whatsapp', 'hero');
    const message = encodeURIComponent('Olá! Quero saber mais sobre o LAAS.');
    window.open(`https://wa.me/${LAAS_WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  /**
   * Format phone number with mask (XX) XXXXX-XXXX
   */
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');

    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }

    // Limit to 11 digits
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, whatsapp: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Client-side validation with Zod
    const validationResult = laasLeadFormSchema.safeParse(formData);

    if (!validationResult.success) {
      const firstError = Object.values(validationResult.error.flatten().fieldErrors)[0]?.[0];
      setSubmitError(firstError || 'Dados inválidos. Verifique os campos.');
      setIsSubmitting(false);
      return;
    }

    trackLeadGeneration('calculadora_economia');

    try {
      const response = await fetch('/api/laas/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: LaasLeadResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro ao enviar formulário');
      }

      // Success!
      setSubmitSuccess(true);
      setEstimatedSavings(data.estimatedSavings || null);

      // Reset form
      setFormData({
        nome: '',
        whatsapp: '',
        email: '',
        lgpdConsent: false,
      });

      // Track successful lead in GA4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          send_to: 'AW-CONVERSION_ID', // Replace with actual conversion ID
          value: data.estimatedSavings?.yearly || 960,
          currency: 'BRL',
        });
      }
    } catch (error: any) {
      console.error('Lead submission error:', error);
      setSubmitError(
        error.message || 'Erro ao enviar formulário. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Coluna Esquerda - Conteúdo Principal */}
          <div className="space-y-6">
            {/* Tag Pioneiro */}
            <div className="inline-block">
              <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold">
                🇧🇷 PIONEIRO NO BRASIL
              </span>
            </div>

            {/* Headline - A/B Test */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {HEADLINE_VARIANTS[ACTIVE_VARIANT]}
            </h1>

            {/* Sub-headline */}
            <p className="text-xl text-gray-600 leading-relaxed">
              Assinatura integrada com logística e consulta, envio semestral otimizado
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAgendarClick}
                className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
              >
                Agendar Consulta
              </button>
              <button
                onClick={handleWhatsAppClick}
                className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/5 transition-all"
              >
                Falar no WhatsApp
              </button>
            </div>

            {/* Badges de Prova Social */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              {SOCIAL_PROOF_BADGES.map((badge) => {
                const Icon = BADGE_ICONS[badge as keyof typeof BADGE_ICONS];
                return (
                  <div
                    key={badge}
                    className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm border"
                  >
                    <Icon className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700">{badge}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna Direita - Calculadora de Economia */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border">
            {/* Imagem Placeholder Médico */}
            <div className="mb-6">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg h-48 flex items-center justify-center">
                <Eye className="h-20 w-20 text-primary opacity-50" />
              </div>
              <p className="text-center mt-3 text-sm text-gray-600">
                Dr. Saraiva - CRM/MG {process.env.NEXT_PUBLIC_CRM_MEDICO || 'XXXXX'}
              </p>
            </div>

            {/* Título do Formulário */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Calcule sua economia
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Veja quanto você pode economizar com o LAAS
            </p>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  id="nome"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  required
                  value={formData.whatsapp}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="(33) 99999-9999"
                  maxLength={15}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="lgpd"
                  required
                  checked={formData.lgpdConsent}
                  onChange={(e) => setFormData({ ...formData, lgpdConsent: e.target.checked })}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="lgpd" className="text-sm text-gray-600">
                  Concordo com a{' '}
                  <a href="/politica-privacidade" className="text-primary hover:underline">
                    Política de Privacidade
                  </a>{' '}
                  e autorizo o uso dos meus dados conforme a LGPD
                </label>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              {/* Success Message */}
              {submitSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 font-medium mb-2">
                    Obrigado! Em breve entraremos em contato.
                  </p>
                  {estimatedSavings && (
                    <div className="text-xs text-green-600 space-y-1">
                      <p>
                        💰 Economia estimada: <strong>R$ {estimatedSavings.monthly.toFixed(2)}/mês</strong>
                      </p>
                      <p>
                        📊 Economia anual: <strong>R$ {estimatedSavings.yearly.toFixed(2)}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || submitSuccess}
                className="w-full bg-primary text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : submitSuccess ? (
                  '✓ Enviado com sucesso!'
                ) : (
                  'Calcule sua economia'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
