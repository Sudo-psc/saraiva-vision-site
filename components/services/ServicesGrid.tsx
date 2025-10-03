'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getServiceIcon } from '@/components/icons/ServiceIcons';
import { ServiceCard } from './ServiceCard';
import type { ServicesGridProps, ServiceItem } from '@/types/services';

/**
 * Default services configuration
 * Can be overridden via props
 */
const getDefaultServices = (t: (key: string) => string): ServiceItem[] => [
  {
    id: 'consultas-oftalmologicas',
    icon: getServiceIcon('consultas-oftalmologicas', {
      className: 'w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3'
    }),
    title: t('services.items.consultations.title'),
    benefit: 'Diagnóstico preciso e rápido'
  },
  {
    id: 'exames-de-refracao',
    icon: getServiceIcon('exames-de-refracao', {
      className: 'w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3'
    }),
    title: t('services.items.refraction.title'),
    benefit: 'Tecnologia de ponta'
  },
  {
    id: 'tratamentos-especializados',
    icon: getServiceIcon('tratamentos-especializados', {
      className: 'w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3'
    }),
    title: t('services.items.specialized.title'),
    benefit: 'Cuidado personalizado'
  },
  {
    id: 'cirurgias-oftalmologicas',
    icon: getServiceIcon('cirurgias-oftalmologicas', {
      className: 'w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3'
    }),
    title: t('services.items.surgeries.title'),
    benefit: 'Procedimentos seguros'
  },
  {
    id: 'acompanhamento-pediatrico',
    icon: getServiceIcon('acompanhamento-pediatrico', {
      className: 'w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3'
    }),
    title: t('services.items.pediatric.title'),
    benefit: 'Especialista em crianças'
  },
  {
    id: 'laudos-especializados',
    icon: getServiceIcon('laudos-especializados', {
      className: 'w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3'
    }),
    title: t('services.items.reports.title'),
    benefit: 'Relatórios detalhados'
  }
];

/**
 * ServicesGrid - Modern service display component
 *
 * Features:
 * - Responsive grid layout
 * - Show more/less functionality with localStorage persistence
 * - Framer Motion animations
 * - TypeScript typed
 * - WCAG AA accessible
 * - Mobile-first design
 *
 * @example
 * ```tsx
 * <ServicesGrid
 *   title="Nossos Serviços"
 *   subtitle="Cuidados especializados"
 *   maxVisible={6}
 * />
 * ```
 */
export const ServicesGrid: React.FC<ServicesGridProps> = ({
  services: propServices,
  title,
  subtitle,
  showBadge = true,
  maxVisible,
  className = ''
}) => {
  const { t } = useTranslation();

  // Use provided services or default
  const serviceItems = useMemo(
    () => propServices || getDefaultServices(t),
    [propServices, t]
  );

  // Shuffle services for varied ordering on refresh
  const shuffledItems = useMemo(() => {
    const arr = [...serviceItems];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [serviceItems]);

  // Responsive featured count: 4 on small screens, otherwise 6
  const computeFeatured = (): number => {
    if (maxVisible) return maxVisible;
    if (typeof window === 'undefined' || !window.matchMedia) return 6;
    return window.matchMedia('(max-width: 640px)').matches ? 4 : 6;
  };

  const [featuredCount, setFeaturedCount] = useState(computeFeatured());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = () => setFeaturedCount(maxVisible || (mq.matches ? 4 : 6));
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [maxVisible]);

  // Persisted toggle for show all
  const storageKey = 'sv_showAllCompactServices';
  const getInitialShowAll = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw === '1';
    } catch {
      return false;
    }
  };

  const [showAll, setShowAll] = useState(getInitialShowAll);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, showAll ? '1' : '0');
    } catch {
      // Ignore storage errors
    }
  }, [showAll]);

  const visibleItems = showAll ? shuffledItems : shuffledItems.slice(0, featuredCount);

  return (
    <section
      id="services"
      className={`py-20 bg-gradient-to-b from-slate-50/30 via-white to-blue-50/20 backdrop-blur-sm relative overflow-hidden ${className}`}
      aria-labelledby="services-heading"
    >
      {/* Enhanced background elements */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          {showBadge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/70 text-blue-800 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>{t('services.badge', 'Nossos Serviços')}</span>
            </div>
          )}

          <h2
            id="services-heading"
            className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 bg-clip-text text-transparent">
              {title || 'Cuidamos da sua visão'}
            </span>
            <br />
            <span className="text-slate-800">
              {subtitle || 'com excelência'}
            </span>
          </h2>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Oferecemos tratamentos especializados e de última geração para preservar e
            melhorar sua saúde ocular
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          layout="position"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-16"
          role="list"
          aria-label="Lista de serviços oftalmológicos"
        >
          <AnimatePresence mode="popLayout">
            {visibleItems.map((service, index) => (
              <div key={service.id} role="listitem">
                <ServiceCard service={service} index={index} />
              </div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* View All Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {visibleItems.length < shuffledItems.length && (
              <motion.button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                aria-expanded={showAll}
                aria-label={
                  showAll
                    ? t('services.show_less', 'Ver menos serviços')
                    : t('services.view_all', 'Ver todos os serviços')
                }
              >
                <Sparkles
                  className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300"
                  aria-hidden="true"
                />
                <span className="text-lg">
                  {showAll
                    ? t('services.show_less', 'Ver menos serviços')
                    : t('services.view_all', 'Ver todos os serviços')}
                </span>
                <ArrowRight
                  className={`w-5 h-5 transition-transform duration-300 ${
                    showAll ? 'rotate-180' : 'group-hover:translate-x-1'
                  }`}
                  aria-hidden="true"
                />
              </motion.button>
            )}

            <Link
              href="/servicos"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 hover:bg-white text-slate-700 font-bold border-2 border-slate-200 hover:border-blue-300 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm group hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              aria-label={t('services.learn_more', 'Ir para página de serviços')}
            >
              <span className="text-lg">{t('services.learn_more', 'Página de Serviços')}</span>
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                aria-hidden="true"
              />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesGrid;
