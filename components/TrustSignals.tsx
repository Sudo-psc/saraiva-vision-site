/**
 * TrustSignals Component
 * Next.js 15 - Client Component with Animated Counter
 *
 * Displays trust signals including certifications, awards, statistics,
 * and partnerships to build credibility with visitors.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Award, Users, Clock, CheckCircle } from 'lucide-react';
import type { TrustSignalsProps, TrustItem, Partnership } from '@/types/homepage';

const defaultTrustItems: TrustItem[] = [
  {
    icon: CheckCircle,
    title: 'Certificações Nacionais',
    description: 'Reconhecido pelo Conselho Federal de Medicina e entidades médicas brasileiras',
    color: 'blue',
  },
  {
    icon: Award,
    title: 'Prêmios de Excelência',
    description: 'Múltiplos reconhecimentos pela qualidade do atendimento oftalmológico',
    color: 'amber',
  },
  {
    icon: Users,
    title: '5.000+ Pacientes Atendidos',
    description: 'Milhares de vidas transformadas com tratamentos especializados',
    color: 'green',
  },
  {
    icon: Clock,
    title: '15+ Anos de Experiência',
    description: 'Mais de uma década dedicada à saúde ocular em Caratinga e região',
    color: 'purple',
  },
];

const defaultPartnerships: Partnership[] = [
  {
    name: 'Amor e Saúde',
    logo: '/img/partner-amor-saude.svg',
    alt: 'Logo parceiro Amor e Saúde',
  },
  {
    name: 'Bioview',
    logo: '/img/partner-bioview.svg',
    alt: 'Logo parceiro Bioview',
  },
  {
    name: 'Solótica',
    logo: '/img/partner-solotica.svg',
    alt: 'Logo parceiro Solótica',
  },
  {
    name: 'Óticas',
    logo: '/img/partner-oticas.svg',
    alt: 'Logo parceiro Óticas',
  },
];

const getColorClasses = (color: TrustItem['color']): string => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return colors[color] || colors.blue;
};

/**
 * Animated Counter Hook
 * Counts from 0 to target value when element is in view
 */
function useAnimatedCounter(
  targetValue: number,
  duration: number = 2000,
  inView: boolean = false
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(targetValue * easeOut));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration, inView]);

  return count;
}

/**
 * AnimatedStat Component
 */
function AnimatedStat({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  // Extract number from value string (e.g., "98%" -> 98, "5000+" -> 5000)
  const numericValue = parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
  const animatedValue = useAnimatedCounter(numericValue, 2000, inView);

  // Reconstruct display value with original format
  const displayValue = value.includes('%')
    ? `${animatedValue}%`
    : value.includes('+')
    ? `${animatedValue}+`
    : animatedValue.toString();

  return (
    <div ref={ref}>
      <div className={`text-4xl font-bold ${color} mb-2`}>
        {inView ? displayValue : '0'}
      </div>
      <p className="text-slate-600">{label}</p>
    </div>
  );
}

export default function TrustSignals({
  className = '',
  trustItems = defaultTrustItems,
  partnerships = defaultPartnerships,
  stats,
}: TrustSignalsProps) {
  const defaultStats = {
    satisfaction: '98%',
    patients: '5000+',
    years: '15+',
  };

  const statsData = stats || defaultStats;

  return (
    <section className={`py-24 bg-white ${className}`}>
      <div className="container mx-auto px-[7%]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
            <Shield size={16} className="mr-2" />
            Confiança e Credibilidade
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Por Que Confiar em Nosso{' '}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Cuidado
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Reconhecimento, experiência e compromisso com a excelência em saúde ocular
          </p>
        </motion.div>

        {/* Trust Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div
                  className={`w-16 h-16 rounded-xl ${getColorClasses(
                    item.color
                  )} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Partnerships */}
        {partnerships && partnerships.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-center mb-12 text-slate-900">
              Parcerias e Fornecedores de Confiança
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {partnerships.map((partner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <div className="w-32 h-20 bg-slate-100 rounded-lg overflow-hidden opacity-70 hover:opacity-100 transition-opacity duration-300">
                    <img
                      src={partner.logo}
                      alt={partner.alt || `Logo ${partner.name}`}
                      className="w-full h-full object-contain p-2 grayscale group-hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trust Stats with Animated Counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 md:p-12 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <AnimatedStat
              value={statsData.satisfaction}
              label="Taxa de Satisfação"
              color="text-blue-600"
            />
            <AnimatedStat
              value={statsData.patients}
              label="Pacientes Atendidos"
              color="text-green-600"
            />
            <AnimatedStat
              value={statsData.years}
              label="Anos de Experiência"
              color="text-purple-600"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
