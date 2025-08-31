import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getServiceIcon } from '@/components/icons/ServiceIcons';

const CompactServiceCard = React.forwardRef(({ service, index }, ref) => {
  // Enhanced gradient backgrounds for visual variety
  const gradients = [
    'bg-gradient-to-br from-blue-50 via-blue-25 to-indigo-50',
    'bg-gradient-to-br from-green-50 via-emerald-25 to-teal-50',
    'bg-gradient-to-br from-purple-50 via-violet-25 to-indigo-50',
    'bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50',
    'bg-gradient-to-br from-teal-50 via-cyan-25 to-sky-50',
    'bg-gradient-to-br from-rose-50 via-pink-25 to-purple-50'
  ];

  const hoverGradients = [
    'group-hover:from-blue-100 group-hover:via-blue-50 group-hover:to-indigo-100',
    'group-hover:from-green-100 group-hover:via-emerald-50 group-hover:to-teal-100',
    'group-hover:from-purple-100 group-hover:via-violet-50 group-hover:to-indigo-100',
    'group-hover:from-orange-100 group-hover:via-amber-50 group-hover:to-yellow-100',
    'group-hover:from-teal-100 group-hover:via-cyan-50 group-hover:to-sky-100',
    'group-hover:from-rose-100 group-hover:via-pink-50 group-hover:to-purple-100'
  ];

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ y: 30, opacity: 0, scale: 0.95 }}
      whileInView={{ y: 0, opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className={`group relative p-8 ${gradients[index % gradients.length]} ${hoverGradients[index % hoverGradients.length]} backdrop-blur-sm rounded-3xl border border-white/50 hover:border-blue-200/60 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}
      whileHover={{ y: -8, scale: 1.03 }}
      exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.3 } }}
    >
      {/* Enhanced decorative elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-bl from-white/30 to-transparent rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
        <Sparkles className="w-5 h-5 text-blue-500" />
      </div>

      {/* Enhanced icon container */}
      <div className="w-24 h-24 mb-6 mx-auto flex items-center justify-center rounded-3xl bg-gradient-to-br from-white/90 to-white/70 ring-2 ring-white/50 group-hover:ring-blue-200/60 transition-all duration-500 ease-out shadow-xl group-hover:shadow-2xl backdrop-blur-sm relative z-10 group-hover:scale-110">
        <div className="w-20 h-20 transition-all duration-500 ease-out group-hover:scale-125 group-hover:rotate-6 drop-shadow-[0_8px_16px_rgba(59,130,246,0.3)]">
          {service.icon}
        </div>
      </div>

      {/* Enhanced title */}
      <h3 className="text-xl font-bold text-slate-900 mb-3 text-center group-hover:text-blue-900 transition-colors duration-300 leading-tight">
        {service.title}
      </h3>

      {/* Enhanced benefit description */}
      <p className="text-sm text-slate-600 text-center mb-6 leading-relaxed group-hover:text-slate-700 transition-colors duration-300 font-medium">
        {service.benefit}
      </p>

      {/* Enhanced call to action */}
      <Link
        to={`/servico/${service.id}`}
        className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 text-sm font-bold text-blue-700 bg-white/80 hover:bg-white border border-blue-200/50 hover:border-blue-300 rounded-xl transition-all duration-300 group/button hover:shadow-lg backdrop-blur-sm"
      >
        <span>Saiba mais</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover/button:translate-x-1" />
      </Link>
    </motion.div>
  );
});

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
  const [showAll, setShowAll] = useState(() => getInitialShowAll());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(storageKey, showAll ? '1' : '0');
    } catch (_) { }
  }, [showAll]);
  const visibleItems = showAll ? shuffledItems : shuffledItems.slice(0, featuredCount);

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-slate-50/30 via-white to-blue-50/20 backdrop-blur-sm relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-100/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Enhanced section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/70 text-blue-800 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>Nossos Serviços</span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 bg-clip-text text-transparent">
              Cuidamos da sua visão
            </span>
            <br />
            <span className="text-slate-800">com excelência</span>
          </h2>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Oferecemos tratamentos especializados e de última geração para preservar e melhorar sua saúde ocular
          </p>
        </motion.div>

        {/* Enhanced services grid */}
        <motion.div
          layout="position"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-16"
        >
          <AnimatePresence mode="popLayout">
            {visibleItems.map((service, index) => (
              <CompactServiceCard key={service.id} service={service} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced view all section */}
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
                onClick={(e) => {
                  e.preventDefault();
                  setShowAll(v => !v);
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm group"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <span className="text-lg">
                  {showAll ? t('services.show_less', 'Ver menos serviços') : t('services.view_all', 'Ver todos os serviços')}
                </span>
                <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${showAll ? 'rotate-180' : 'group-hover:translate-x-1'}`} />
              </motion.button>
            )}

            <Link
              to="/servicos"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 hover:bg-white text-slate-700 font-bold border-2 border-slate-200 hover:border-blue-300 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm group hover:scale-105"
            >
              <span className="text-lg">{t('services.learn_more', 'Página de Serviços')}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CompactServices;
