'use client';

import { useState } from 'react';
import { Shield, Award, Eye, UserCheck } from 'lucide-react';
import { trackCtaClick, trackLeadGeneration } from '@/lib/laas/analytics';
import { LAAS_WHATSAPP_NUMBER, SOCIAL_PROOF_BADGES } from '@/lib/laas/config';
import type { LaasFormData } from '@/types/laas';

const BADGE_ICONS = {
  'Selo de Qualidade': Award,
  'Aprovado ANVISA': Shield,
  'Lentes Premium': Eye,
  'CRM Médico Responsável': UserCheck,
};

export function HeroSection() {
  const [formData, setFormData] = useState<LaasFormData>({
    nome: '',
    whatsapp: '',
    email: '',
    lgpdConsent: false,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lgpdConsent) {
      alert('Por favor, aceite os termos da LGPD para continuar.');
      return;
    }

    trackLeadGeneration('calculadora_economia');

    // TODO: Implementar envio para API
    console.log('Lead gerado:', formData);
    alert('Obrigado! Em breve entraremos em contato para calcular sua economia.');

    // Reset form
    setFormData({
      nome: '',
      whatsapp: '',
      email: '',
      lgpdConsent: false,
    });
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

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Nunca mais fique sem lentes
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
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="(00) 00000-0000"
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

              <button
                type="submit"
                className="w-full bg-primary text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
              >
                Calcule sua economia
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
