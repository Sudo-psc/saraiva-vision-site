import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getServiceIcon } from '@/components/icons/ServiceIcons';

const ServiceCard = ({ service, index }) => (
  <motion.div
    initial={{ y: 30, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.04 }}
    className="group relative flex flex-col items-center text-center p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-transform duration-300"
    whileHover={{ y: -8 }}
  >
    {/* Icon (responsive, centered) */}
    <div className="mb-4 sm:mb-6 flex items-center justify-center">
      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-soft-md">
        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 select-none">
          {service.icon}
        </div>
      </div>
    </div>

    {/* Title */}
    <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-[hsl(var(--medical-primary))] px-2 sm:px-0">
      {service.title}
    </h3>

    {/* Description */}
    <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed mb-4 max-w-prose px-2 sm:px-0">
      {service.description}
    </p>

    {/* Saiba mais button */}
    <Link
      to={`/servico/${service.id}`}
      className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
    >
      <span>Saiba mais</span>
      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
    </Link>
  </motion.div>
);

const Services = () => {
  const { t } = useTranslation();

  // Full catalog of services (types)
  const serviceItems = useMemo(() => [
    {
      id: 'consultas-oftalmologicas',
      icon: getServiceIcon('consultas-oftalmologicas', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.consultations.title'),
      description: t('services.items.consultations.description')
    },
    {
      id: 'exames-de-refracao',
      icon: getServiceIcon('exames-de-refracao', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.refraction.title'),
      description: t('services.items.refraction.description')
    },
    {
      id: 'tratamentos-especializados',
      icon: getServiceIcon('tratamentos-especializados', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.specialized.title'),
      description: t('services.items.specialized.description')
    },
    {
      id: 'cirurgias-oftalmologicas',
      icon: getServiceIcon('cirurgias-oftalmologicas', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.surgeries.title'),
      description: t('services.items.surgeries.description')
    },
    {
      id: 'acompanhamento-pediatrico',
      icon: getServiceIcon('acompanhamento-pediatrico', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.pediatric.title'),
      description: t('services.items.pediatric.description')
    },
    {
      id: 'laudos-especializados',
      icon: getServiceIcon('laudos-especializados', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.reports.title'),
      description: t('services.items.reports.description')
    },
    // Novos exames específicos
    {
      id: 'gonioscopia',
      icon: getServiceIcon('gonioscopia', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.gonioscopy.title'),
      description: t('services.items.gonioscopy.description')
    },
    {
      id: 'mapeamento-de-retina',
      icon: getServiceIcon('mapeamento-de-retina', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.retinaMapping.title'),
      description: t('services.items.retinaMapping.description')
    },
    {
      id: 'topografia-corneana',
      icon: getServiceIcon('topografia-corneana', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.cornealTopography.title'),
      description: t('services.items.cornealTopography.description')
    },
    {
      id: 'paquimetria',
      icon: getServiceIcon('paquimetria', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.pachymetry.title'),
      description: t('services.items.pachymetry.description')
    },
    {
      id: 'retinografia',
      icon: getServiceIcon('retinografia', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.retinography.title'),
      description: t('services.items.retinography.description')
    },
    {
      id: 'campo-visual',
      icon: getServiceIcon('campo-visual', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]" }),
      title: t('services.items.visualField.title'),
      description: t('services.items.visualField.description')
    }
  ], [t]);

  // Utility: shuffle array on each render (changes on refresh)
  const shuffledItems = useMemo(() => {
    const arr = [...serviceItems];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [serviceItems]);

  // Show all vs a random featured subset
  const [showAll, setShowAll] = useState(false);
  const featuredCount = 6;
  const visibleItems = showAll ? shuffledItems : shuffledItems.slice(0, featuredCount);

  return (
    <section id="services" className="py-section-lg md:py-section-xl bg-gradient-to-br from-slate-50 via-blue-50/35 to-indigo-50/50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/7 to-sky-400/7" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/12 to-sky-400/12 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-sky-400/12 to-cyan-400/12 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-heading-xl md:text-display-sm font-bold text-slate-900 mb-6 drop-shadow-sm"
          >
            {t('services.title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-body-xl text-slate-600 max-w-prose mx-auto leading-loose drop-shadow-sm"
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

        {/* Services Grid (randomized each refresh) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {visibleItems.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* Toggle to reveal all service types */}
        <div className="text-center mt-8">
          <Button
            variant={showAll ? 'outline' : 'medical'}
            onClick={() => setShowAll(v => !v)}
            className="px-6"
          >
            {showAll ? t('services.show_less', 'Mostrar menos') : t('services.view_all', 'Ver todos os serviços')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;
