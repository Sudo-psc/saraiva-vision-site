import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getServiceIcon } from '@/components/icons/ServiceIcons';

const ServiceCard = ({ service, index }) => (
  <motion.div
    initial={{ y: 40, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.07 }}
    className="group relative flex flex-col items-center text-center p-8 rounded-3xl bg-white/70 backdrop-blur-md shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08),0_4px_12px_-2px_rgba(0,0,0,0.05)] border border-white/50 overflow-hidden will-change-transform"
    whileHover={{ y: -6, rotateX: 4, rotateY: -4 }}
  >
    {/* Ambient gradient halo */}
    <div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(96,165,250,0.35), transparent 60%)' }} />
    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 mix-blend-overlay" style={{ background: 'linear-gradient(140deg, rgba(147,51,234,0.15), rgba(236,72,153,0.12), rgba(59,130,246,0.12))' }} />

    {/* Icon */}
    <motion.div
      className="relative mb-6 w-32 h-32 flex items-center justify-center"
      whileHover={{ scale: 1.1, rotate: 3 }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative w-28 h-28 drop-shadow-lg select-none">
        {service.icon}
      </div>
    </motion.div>

    {/* Title */}
    <motion.h3
      className="text-xl font-semibold mb-3 text-slate-800 tracking-tight"
      whileHover={{ scale: 1.06 }}
    >
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-slate-900 to-slate-700 group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-colors duration-500">
        {service.title}
      </span>
    </motion.h3>

    {/* Description */}
    <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-xs transition-colors group-hover:text-slate-700">
      {service.description}
    </p>

    {/* Saiba mais link styled as button */}
    <Link
      to={`/servico/${service.id}`}
      className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-slate-700 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-blue-50 hover:to-pink-50 border border-slate-200/70 hover:border-blue-300/60 shadow-sm hover:shadow-md transition-all group/button overflow-hidden"
    >
      <span className="relative z-10 group-hover/button:text-blue-700 transition-colors">Saiba mais</span>
      <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover/button:translate-x-1" />
      <span className="absolute inset-0 opacity-0 group-hover/button:opacity-100 bg-gradient-to-r from-blue-200/30 via-purple-200/30 to-pink-200/30 transition-opacity" />
      <span className="absolute -inset-px rounded-full border border-transparent group-hover/button:border-blue-400/40 transition-colors" />
    </Link>

    {/* Subtle bottom gradient edge */}
    <div className="pointer-events-none absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-400/0 via-purple-500/40 to-pink-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
  </motion.div>
);

const Services = () => {
  const { t } = useTranslation();

  const serviceItems = useMemo(() => [
    {
      id: 'consultas-oftalmologicas',
      icon: getServiceIcon('consultas-oftalmologicas', { className: "w-full h-full object-contain" }),
      title: t('services.items.consultations.title'),
      description: t('services.items.consultations.description')
    },
    {
      id: 'exames-de-refracao',
      icon: getServiceIcon('exames-de-refracao', { className: "w-full h-full object-contain" }),
      title: t('services.items.refraction.title'),
      description: t('services.items.refraction.description')
    },
    {
      id: 'tratamentos-especializados',
      icon: getServiceIcon('tratamentos-especializados', { className: "w-full h-full object-contain" }),
      title: t('services.items.specialized.title'),
      description: t('services.items.specialized.description')
    },
    {
      id: 'cirurgias-oftalmologicas',
      icon: getServiceIcon('cirurgias-oftalmologicas', { className: "w-full h-full object-contain" }),
      title: t('services.items.surgeries.title'),
      description: t('services.items.surgeries.description')
    },
    {
      id: 'acompanhamento-pediatrico',
      icon: getServiceIcon('acompanhamento-pediatrico', { className: "w-full h-full object-contain" }),
      title: t('services.items.pediatric.title'),
      description: t('services.items.pediatric.description')
    },
    {
      id: 'laudos-especializados',
      icon: getServiceIcon('laudos-especializados', { className: "w-full h-full object-contain" }),
      title: t('services.items.reports.title'),
      description: t('services.items.reports.description')
    }
  ], [t]);

  return (
    <section id="services" className="py-20 lg:py-28 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 drop-shadow-sm"
          >
            {t('services.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed drop-shadow-sm"
          >
            {t('services.subtitle')}
          </motion.p>

          {/* Decorative Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center mt-8"
          >
            <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg" />
          </motion.div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {serviceItems.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;