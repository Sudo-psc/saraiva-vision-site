'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { ServiceCardProps } from '@/types/services';

/**
 * Gradient configurations for visual variety
 */
const GRADIENTS = [
  'bg-gradient-to-br from-blue-50 via-blue-25 to-indigo-50',
  'bg-gradient-to-br from-green-50 via-emerald-25 to-teal-50',
  'bg-gradient-to-br from-cyan-50 via-cyan-25 to-teal-50',
  'bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50',
  'bg-gradient-to-br from-teal-50 via-cyan-25 to-sky-50',
  'bg-gradient-to-br from-blue-50 via-cyan-25 to-teal-50'
] as const;

const HOVER_GRADIENTS = [
  'group-hover:from-blue-100 group-hover:via-blue-50 group-hover:to-indigo-100',
  'group-hover:from-green-100 group-hover:via-emerald-50 group-hover:to-teal-100',
  'group-hover:from-cyan-100 group-hover:via-cyan-50 group-hover:to-teal-100',
  'group-hover:from-orange-100 group-hover:via-amber-50 group-hover:to-yellow-100',
  'group-hover:from-teal-100 group-hover:via-cyan-50 group-hover:to-sky-100',
  'group-hover:from-blue-100 group-hover:via-cyan-50 group-hover:to-teal-100'
] as const;

/**
 * ServiceCard - Individual service card with animations
 *
 * Features:
 * - Framer Motion animations
 * - Gradient backgrounds with hover effects
 * - Accessible focus states
 * - Responsive design
 * - TypeScript typed
 *
 * @example
 * ```tsx
 * <ServiceCard
 *   service={{
 *     id: 'consultas',
 *     title: 'Consultas',
 *     benefit: 'Atendimento especializado',
 *     icon: <Icon />
 *   }}
 *   index={0}
 * />
 * ```
 */
export const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(
  ({ service, index = 0, className = '' }, ref) => {
    const { t } = useTranslation();

    // Cycle through gradients based on index
    const gradient = GRADIENTS[index % GRADIENTS.length];
    const hoverGradient = HOVER_GRADIENTS[index % HOVER_GRADIENTS.length];

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        whileInView={{ y: 0, opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease: 'easeOut'
        }}
        whileHover={{ y: -8, scale: 1.03 }}
        exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.3 } }}
        className={`
          group relative p-8
          ${gradient}
          ${hoverGradient}
          backdrop-blur-sm rounded-3xl
          border border-slate-200/80 hover:border-blue-300/60
          shadow-lg hover:shadow-2xl
          transition-all duration-500
          overflow-hidden
          focus-within:ring-2 focus-within:ring-blue-500/20
          ${className}
        `}
        aria-label={service.title}
      >
        {/* Decorative Elements */}
        <div
          className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-bl from-white/30 to-transparent rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"
          aria-hidden="true"
        />
        <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
          <Sparkles className="w-5 h-5 text-blue-500" aria-hidden="true" />
        </div>

        {/* Icon Container */}
        <div className="w-24 h-24 mb-6 mx-auto flex items-center justify-center rounded-3xl bg-gradient-to-br from-white/90 to-white/70 ring-1 ring-slate-200/80 group-hover:ring-blue-200/60 transition-all duration-500 ease-out shadow-xl group-hover:shadow-2xl backdrop-blur-sm relative z-10 group-hover:scale-110">
          <div className="w-20 h-20 transition-all duration-500 ease-out group-hover:scale-125 group-hover:rotate-6 drop-shadow-[0_8px_16px_rgba(59,130,246,0.3)]">
            {service.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 mb-3 text-center group-hover:text-blue-900 transition-colors duration-300 leading-tight">
          {service.title}
        </h3>

        {/* Benefit Description */}
        <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 font-medium line-clamp-4">
          {service.benefit}
        </p>

        {/* Call to Action */}
        <Link
          href={`/servicos/${service.id}`}
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 text-sm font-bold text-blue-700 bg-white/80 hover:bg-white border border-blue-200/50 hover:border-blue-300 rounded-xl transition-all duration-300 group/button hover:shadow-lg backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
          aria-label={`${t('services.learn_more')} sobre ${service.title}`}
        >
          <span>{t('services.learn_more')}</span>
          <ArrowRight
            className="w-4 h-4 transition-transform group-hover/button:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </motion.div>
    );
  }
);

ServiceCard.displayName = 'ServiceCard';

export default ServiceCard;
