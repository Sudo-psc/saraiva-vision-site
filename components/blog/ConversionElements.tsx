/**
 * Conversion Elements for Blog Posts
 * Next.js 15 - Client & Server Components
 *
 * Collection of conversion-optimized components for blog posts including:
 * - StickyAppointmentCTA
 * - InlineAppointmentCTA
 * - TrustBadges
 * - ClinicInfoCard
 * - ReviewsHighlight
 * - EmergencyNotice
 * - ServicesCTA
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Calendar, Star, Shield, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  InlineAppointmentCTAProps,
  TrustBadgesProps,
  ClinicInfoCardProps,
  ReviewsHighlightProps,
  EmergencyNoticeProps,
  ServicesCTAProps,
} from '@/types/cta';

/**
 * StickyAppointmentCTA - Floating CTA after scroll threshold
 */
export function StickyAppointmentCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrolled / height) * 100;

      // Show after 50% scroll
      setIsVisible(scrollPercentage > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 animate-slide-up"
      role="complementary"
      aria-label="Botão de agendamento rápido"
    >
      <Button
        asChild
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-4 shadow-2xl hover:shadow-3xl transition-all rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-offset-2"
      >
        <a
          href="https://wa.me/5533998601427?text=Olá!%20Gostaria%20de%20agendar%20uma%20consulta"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Phone className="w-6 h-6 mr-2" aria-hidden="true" />
          <span className="hidden sm:inline">Agendar Consulta</span>
          <span className="sm:hidden">Agendar</span>
        </a>
      </Button>
    </div>
  );
}

/**
 * InlineAppointmentCTA - Inline CTA for blog content
 */
export function InlineAppointmentCTA({
  context = 'article',
  className = '',
  variant = 'default',
  showStats = true,
}: InlineAppointmentCTAProps) {
  return (
    <aside
      className={`my-10 p-6 sm:p-8 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl text-white shadow-2xl ${className}`}
      role="complementary"
      aria-label="Área de agendamento inline"
    >
      <div className="max-w-2xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-2">
          <Calendar className="w-8 h-8" aria-hidden="true" />
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold">
          Identificou-se com este {context}?
        </h3>

        <p className="text-blue-100 text-lg leading-relaxed">
          Não espere os sintomas piorarem. Agende uma avaliação oftalmológica completa com
          equipamentos de última geração.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            asChild
            className="bg-white text-blue-700 hover:bg-gray-100 font-bold px-8 py-4 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-blue-700 transition-all shadow-lg text-lg"
          >
            <a
              href="https://wa.me/5533998601427?text=Olá!%20Li%20o%20artigo%20e%20gostaria%20de%20agendar%20uma%20consulta"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="w-5 h-5 mr-2" aria-hidden="true" />
              WhatsApp: (33) 99860-1427
            </a>
          </Button>

          <Button
            asChild
            className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-4 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-blue-700 transition-all"
          >
            <Link href="/servicos">Conheça Nossos Serviços</Link>
          </Button>
        </div>

        {showStats && (
          <p className="text-sm text-blue-200 pt-4">
            ⚡ Resposta em até 1 hora • 📍 Caratinga, MG • ⭐ 4.9/5 (127 avaliações)
          </p>
        )}
      </div>
    </aside>
  );
}

/**
 * TrustBadges - Display author credentials
 */
export function TrustBadges({ author, badges, className = '' }: TrustBadgesProps) {
  const credentials =
    author?.credentials ||
    badges?.map((b) => b.label) || [
      'CRM-MG 12345',
      'Especialista em Catarata',
      'Membro da SBO',
      '10+ anos de experiência',
    ];

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
      <span className="font-semibold text-gray-900">Credenciais:</span>
      <div className="flex flex-wrap gap-2">
        {credentials.map((cred, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
          >
            {cred}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * ClinicInfoCard - Clinic location, hours, contact
 */
export function ClinicInfoCard({ clinic, compact = false, className = '' }: ClinicInfoCardProps) {
  return (
    <div
      className={`grid sm:grid-cols-3 gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200 ${className}`}
    >
      {/* Location */}
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <MapPin className="w-6 h-6 text-blue-600" aria-hidden="true" />
        </div>
        <h4 className="font-bold text-gray-900 mb-1">Localização</h4>
        <p className="text-sm text-gray-600">{clinic?.address.city || 'Caratinga, MG'}</p>
        <Link
          href="/contato#mapa"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1 focus:outline-none focus:underline"
        >
          Ver no mapa →
        </Link>
      </div>

      {/* Hours */}
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <Clock className="w-6 h-6 text-green-600" aria-hidden="true" />
        </div>
        <h4 className="font-bold text-gray-900 mb-1">Horário</h4>
        <p className="text-sm text-gray-600">
          {clinic?.hours.weekdays || 'Segunda a Sexta'}
          <br />
          8h às 18h
        </p>
      </div>

      {/* Contact */}
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
          <Phone className="w-6 h-6 text-purple-600" aria-hidden="true" />
        </div>
        <h4 className="font-bold text-gray-900 mb-1">Contato</h4>
        <a
          href="tel:+5533998601427"
          className="text-sm text-gray-600 hover:text-purple-600 hover:underline focus:outline-none focus:underline"
        >
          {clinic?.phone || '(33) 99860-1427'}
        </a>
      </div>
    </div>
  );
}

/**
 * ReviewsHighlight - Display ratings and recent review
 */
export function ReviewsHighlight({
  rating = 4.9,
  count = 127,
  showRecentReview = true,
  recentReview,
  className = '',
}: ReviewsHighlightProps) {
  const defaultReview = {
    text: 'Excelente atendimento e profissionalismo. Dr. Philipe explicou tudo com muita clareza e paciência.',
    author: 'Maria Silva',
  };

  const reviewData = recentReview || defaultReview;

  return (
    <div
      className={`p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-300 shadow-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-7 h-7 ${
                  i < Math.floor(rating)
                    ? 'text-yellow-400 fill-current'
                    : i < rating
                    ? 'text-yellow-400 fill-current opacity-50'
                    : 'text-gray-300'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{rating.toFixed(1)}</p>
            <p className="text-sm text-gray-600">de 5.0</p>
          </div>
        </div>

        <div className="text-center sm:text-right">
          <p className="text-2xl font-bold text-gray-900">{count}+</p>
          <p className="text-sm text-gray-600">avaliações verificadas</p>
          <Link
            href="/avaliacoes"
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1 inline-block focus:outline-none focus:underline"
          >
            Ver todas →
          </Link>
        </div>
      </div>

      {showRecentReview && (
        <div className="mt-4 pt-4 border-t border-yellow-200">
          <p className="text-sm text-gray-700 italic">"{reviewData.text}"</p>
          <p className="text-xs text-gray-500 mt-2">— {reviewData.author}, paciente</p>
        </div>
      )}
    </div>
  );
}

/**
 * EmergencyNotice - Ophthalmological emergency alert
 */
export function EmergencyNotice({ className = '', variant = 'default' }: EmergencyNoticeProps) {
  return (
    <aside
      role="alert"
      className={`my-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-r-lg ${className}`}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" aria-hidden="true" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-red-900 text-lg mb-2">Emergência Oftalmológica?</h3>
          <p className="text-sm text-red-800 mb-3 leading-relaxed">
            Se você está experimentando perda súbita de visão, dor ocular intensa, trauma ocular
            ou flashes de luz acompanhados de moscas volantes,{' '}
            <strong>procure atendimento médico imediato</strong>.
          </p>
          <Button
            asChild
            className="bg-red-600 hover:bg-red-700 text-white font-bold focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2"
          >
            <a href="tel:+5533998601427">
              <Phone className="w-4 h-4 mr-2" aria-hidden="true" />
              Ligar Agora: (33) 99860-1427
            </a>
          </Button>
        </div>
      </div>
    </aside>
  );
}

/**
 * ServicesCTA - Related services showcase
 */
export function ServicesCTA({ services, limit = 3, className = '' }: ServicesCTAProps) {
  const defaultServices = [
    { name: 'Cirurgia de Catarata', icon: '👁️', slug: 'catarata' },
    { name: 'Exame de Vista Completo', icon: '🔍', slug: 'exames' },
    { name: 'Tratamento de Glaucoma', icon: '💧', slug: 'glaucoma' },
  ];

  const displayServices = services || defaultServices;
  const limitedServices = limit ? displayServices.slice(0, limit) : displayServices;

  return (
    <div className={`my-10 p-8 bg-white border-2 border-gray-200 rounded-2xl shadow-lg ${className}`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Serviços Relacionados</h3>
      <p className="text-gray-600 text-center mb-6">Conheça nossos tratamentos especializados</p>

      <div className="grid sm:grid-cols-3 gap-4">
        {limitedServices.map((service, index) => (
          <Link
            key={index}
            href={`/servicos/${service.slug}`}
            className="p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl transition-all text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="text-4xl mb-2" aria-hidden="true">
              {typeof service.icon === 'string' ? service.icon : '🏥'}
            </div>
            <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/servicos"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold hover:underline focus:outline-none focus:underline"
        >
          Ver todos os serviços →
        </Link>
      </div>
    </div>
  );
}
