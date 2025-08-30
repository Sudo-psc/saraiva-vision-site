import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { getServiceIcon } from '@/components/icons/ServiceIcons';

const CompactServiceCard = ({ service, index }) => {
  // Different gradient backgrounds for visual variety
  const gradients = [
    'bg-gradient-to-br from-blue-50 via-white to-indigo-50/50',
    'bg-gradient-to-br from-green-50 via-white to-emerald-50/50', 
    'bg-gradient-to-br from-purple-50 via-white to-violet-50/50',
    'bg-gradient-to-br from-orange-50 via-white to-amber-50/50',
    'bg-gradient-to-br from-teal-50 via-white to-cyan-50/50',
    'bg-gradient-to-br from-rose-50 via-white to-pink-50/50'
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`group p-6 ${gradients[index % gradients.length]} backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
      whileHover={{ y: -6, scale: 1.02 }}
    >
      {/* Subtle decorative element */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/40 to-transparent rounded-full blur-xl"></div>
    {/* Enhanced icon with gradient background */}
    <div className="w-20 h-20 mb-4 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/80 to-slate-50/80 ring-0 group-hover:ring-2 ring-blue-300/40 transition-all duration-300 ease-out shadow-sm group-hover:shadow-md backdrop-blur-sm relative z-10">
      <div className="w-18 h-18 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 drop-shadow-[0_6px_12px_rgba(59,130,246,0.25)]">
        {service.icon}
      </div>
    </div>

    {/* Title */}
    <h3 className="text-lg font-semibold text-slate-800 mb-2 text-center">
      {service.title}
    </h3>

    {/* One-line benefit */}
    <p className="text-sm text-slate-600 text-center mb-4 leading-relaxed">
      {service.benefit}
    </p>

    {/* Saiba mais link */}
    <Link
      to={`/servico/${service.id}`}
      className="inline-flex items-center justify-center gap-1 w-full py-2 px-4 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group/button"
    >
      <span>Saiba mais</span>
      <ArrowRight className="w-4 h-4 transition-transform group-hover/button:translate-x-1" />
    </Link>
  </motion.div>
);
};

const CompactServices = () => {
  const { t } = useTranslation();

  const serviceItems = useMemo(() => [
    {
      id: 'consultas-oftalmologicas',
      icon: getServiceIcon('consultas-oftalmologicas', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3" }),
      title: t('services.items.consultations.title'),
      benefit: 'Diagnóstico preciso e rápido'
    },
    {
      id: 'exames-de-refracao',
      icon: getServiceIcon('exames-de-refracao', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3" }),
      title: t('services.items.refraction.title'),
      benefit: 'Tecnologia de ponta'
    },
    {
      id: 'tratamentos-especializados',
      icon: getServiceIcon('tratamentos-especializados', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3" }),
      title: t('services.items.specialized.title'),
      benefit: 'Cuidado personalizado'
    },
    {
      id: 'cirurgias-oftalmologicas',
      icon: getServiceIcon('cirurgias-oftalmologicas', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3" }),
      title: t('services.items.surgeries.title'),
      benefit: 'Procedimentos seguros'
    },
    {
      id: 'acompanhamento-pediatrico',
      icon: getServiceIcon('acompanhamento-pediatrico', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3" }),
      title: t('services.items.pediatric.title'),
      benefit: 'Especialista em crianças'
    },
    {
      id: 'laudos-especializados',
      icon: getServiceIcon('laudos-especializados', { className: "w-full h-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-3" }),
      title: t('services.items.reports.title'),
      benefit: 'Relatórios detalhados'
    }
  ], [t]);

  // Shuffle services for varied ordering on refresh
  const shuffledItems = useMemo(() => {
    const arr = [...serviceItems];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [serviceItems]);

  // Featured count responsive: 4 on small screens, otherwise 6
  const computeFeatured = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return 6;
    return window.matchMedia('(max-width: 640px)').matches ? 4 : 6;
  };
  const [featuredCount, setFeaturedCount] = useState(computeFeatured());
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = () => setFeaturedCount(mq.matches ? 4 : 6);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Persisted toggle for show all
  const storageKey = 'sv_showAllCompactServices';
  const getInitialShowAll = () => {
    if (typeof window === 'undefined') return false;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw === '1';
    } catch (_) { return false; }
  };
  const [showAll, setShowAll] = useState(getInitialShowAll());
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, showAll ? '1' : '0');
    } catch (_) {}
  }, [showAll]);
  const visibleItems = showAll ? shuffledItems : shuffledItems.slice(0, featuredCount);

  return (
    <section id="services" className="py-16 bg-gradient-to-b from-white via-slate-50/30 to-white relative">
      {/* Section Divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t('services.title', 'Nossos Serviços')}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tecnologia avançada e cuidado especializado para sua visão
          </p>
        </motion.div>

        {/* Compact Services Grid (randomized, featured subset by default) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {visibleItems.map((service, index) => (
            <CompactServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {/* View All Services CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowAll(v => !v)}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border transition-colors ${showAll ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'}`}
            >
              {showAll ? t('services.show_less', 'Mostrar menos') : t('services.view_all', 'Ver todos os serviços')}
            </button>
            <Link
              to="/servicos"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              {t('services.learn_more', 'Saiba Mais')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CompactServices;
