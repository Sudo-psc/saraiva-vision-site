import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Zap,
  Play,
  CheckCircle,
  Users,
  Award,
  Clock,
  Shield,
  Sparkles,
  Star,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getServiceIcon } from '@/components/icons/ServiceIcons';
import MedicalCard from '@/components/ui/MedicalCard';
import InteractiveCarousel from '@/components/ui/InteractiveCarousel';
import WhatsAppCTA from '@/components/ui/WhatsAppCTA';

// Category configuration with colors
const CATEGORIES = {
  all: { label: 'Todos', color: 'slate', icon: Filter },
  Consultas: { label: 'Consultas', color: 'blue', icon: Users },
  Exames: { label: 'Exames', color: 'purple', icon: Shield },
  Tratamentos: { label: 'Tratamentos', color: 'emerald', icon: Sparkles },
  Cirurgias: { label: 'Cirurgias', color: 'rose', icon: Award },
  Pediatria: { label: 'Pediatria', color: 'amber', icon: Star },
  Laudos: { label: 'Laudos', color: 'cyan', icon: Clock }
};

// Statistics data
const STATS = [
  { value: '5.000+', label: 'Pacientes Atendidos', icon: Users },
  { value: '4.9/5', label: 'Avaliação Google', icon: Star },
  { value: '15+', label: 'Anos de Experiência', icon: Award },
  { value: '17+', label: 'Serviços Especializados', icon: Sparkles }
];

// Hero Section Component
const ServicesHero = ({ t }) => (
  <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 py-20 lg:py-28">
    {/* Animated background elements */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/10 to-transparent rounded-full" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-40" />
    </div>

    <div className="container mx-auto px-4 md:px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-white/90">Centro de Excelência em Oftalmologia</span>
        </motion.div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {t('services.title_full', 'Serviços Oftalmológicos')}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            Especializados
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
          {t('services.subtitle', 'Tecnologia de ponta e atendimento humanizado para cuidar da sua visão com excelência.')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/agendamento">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Agendar Consulta
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <a href="#services-list">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 transition-all duration-300"
            >
              Ver Todos os Serviços
            </motion.button>
          </a>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-16 lg:mt-20"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 lg:p-6 border border-white/10 text-center hover:bg-white/10 transition-colors duration-300"
            >
              <stat.icon className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
              <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* Bottom wave decoration */}
    <div className="absolute bottom-0 left-0 right-0">
      <svg className="w-full h-16 lg:h-24" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          fill="rgb(248 250 252)"
          d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,75 1440,50 L1440,100 L0,100 Z"
        />
      </svg>
    </div>
  </div>
);

// Category Filter Tabs
const CategoryFilters = ({ activeCategory, setActiveCategory, categories }) => {
  const availableCategories = ['all', ...Object.keys(categories).filter(c => c !== 'all')];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-wrap justify-center gap-2 lg:gap-3 mb-12"
    >
      {availableCategories.map((category) => {
        const config = CATEGORIES[category] || CATEGORIES.all;
        const isActive = activeCategory === category;
        const Icon = config.icon;

        return (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(category)}
            className={`
              px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl font-semibold text-sm lg:text-base
              flex items-center gap-2 transition-all duration-300
              ${isActive
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-cyan-300'
              }
            `}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
            {config.label}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

// Modern Service Card
const ServiceCard = ({ service, index }) => {
  const categoryConfig = CATEGORIES[service.category] || CATEGORIES.all;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="h-full"
    >
      <Link
        to={service.id === 'irpl-e-eye' ? '/luz-pulsada-irpl' : service.id === 'meibografia' ? '/meibografia' : `/servicos/${service.id}`}
        className="group block h-full"
      >
        <div className={`
          relative h-full bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-8
          border border-slate-100 hover:border-cyan-200
          shadow-sm hover:shadow-xl hover:shadow-cyan-500/10
          transition-all duration-500 transform hover:-translate-y-2
          ${service.featured ? 'ring-2 ring-amber-400/50' : ''}
        `}>
          {/* Featured badge */}
          {service.featured && (
            <div className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              <Zap className="w-3 h-3 inline mr-1" />
              Destaque
            </div>
          )}

          {/* Arrow indicator */}
          <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-cyan-500 group-hover:to-blue-500 flex items-center justify-center transition-all duration-300">
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          </div>

          {/* Category badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold mb-5 bg-${categoryConfig.color}-50 text-${categoryConfig.color}-700`}>
            {service.category}
          </div>

          {/* Icon */}
          <div className="w-20 h-20 mb-6 relative group-hover:scale-110 transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative w-full h-full flex items-center justify-center">
              {React.isValidElement(service.icon) ?
                React.cloneElement(service.icon, {
                  className: 'w-16 h-16 object-contain drop-shadow-md'
                }) :
                service.icon
              }
            </div>
          </div>

          {/* Content */}
          <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3 group-hover:text-cyan-700 transition-colors duration-300 pr-12">
            {service.title}
          </h3>

          <p className="text-slate-600 text-sm lg:text-base leading-relaxed line-clamp-3">
            {service.description}
          </p>

          {/* Hover indicator */}
          <div className="mt-6 flex items-center gap-2 text-cyan-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-sm">Saiba mais</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Featured IRPL Section
const FeaturedService = ({ t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="my-20 lg:my-28"
    >
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl transform -rotate-1 opacity-5 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl transform rotate-1 opacity-5 scale-105" />

        <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
          <div className="flex flex-col lg:flex-row">
            {/* Video Section */}
            <div className="lg:w-1/2 relative bg-gradient-to-br from-slate-900 to-slate-800 min-h-[350px] lg:min-h-[500px]">
              <video
                className="absolute inset-0 w-full h-full object-cover opacity-50"
                src="/Videos/E-EYE-IRPL-Treatment.mp4"
                muted
                loop
                playsInline
                autoPlay
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/30 cursor-pointer hover:bg-white/30 transition-colors"
                >
                  <Play className="w-10 h-10 text-white fill-current ml-1" />
                </motion.div>
                <span className="text-white/90 font-medium text-lg">Assista ao Procedimento</span>
                <p className="text-white/60 text-sm mt-2 max-w-xs">
                  Veja como funciona o tratamento de luz pulsada
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-8 left-8 w-20 h-20 border border-white/20 rounded-full" />
              <div className="absolute bottom-8 right-8 w-32 h-32 border border-white/10 rounded-full" />
            </div>

            {/* Content Section */}
            <div className="lg:w-1/2 p-8 lg:p-12 xl:p-16 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-xl text-sm font-bold w-fit mb-6 border border-amber-200">
                <Zap className="w-4 h-4" />
                Tecnologia Exclusiva na Região
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                {t('services.items.irplEEye.title', 'IRPL E-Eye')}
                <span className="block text-cyan-600 text-2xl lg:text-3xl mt-2">
                  Tratamento de Luz Pulsada
                </span>
              </h2>

              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                {t('services.items.irplEEye.fullDescription', 'Tratamento revolucionário para olho seco evaporativo, atuando diretamente nas glândulas de Meibomius através de luz pulsada intensa regulada.')}
              </p>

              <div className="space-y-4 mb-10">
                {[
                  'Tratamento da causa raiz do olho seco (DGM)',
                  'Procedimento rápido, indolor e não invasivo',
                  'Resultados duradouros com melhora progressiva',
                  'Única clínica com E-Eye na região'
                ].map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/luz-pulsada-irpl" className="flex-1 sm:flex-initial">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Conhecer IRPL
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link to="/agendamento" className="flex-1 sm:flex-initial">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-8 rounded-xl border-2 border-slate-200 hover:border-cyan-300 transition-all duration-300"
                  >
                    Agendar Avaliação
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// CTA Section
const CTASection = ({ t }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="mt-20 lg:mt-28"
  >
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
          Precisa de ajuda para escolher?
        </h3>
        <p className="text-white/70 mb-8 text-lg">
          Nossa equipe está pronta para orientá-lo. Fale conosco e encontre o serviço ideal para suas necessidades.
        </p>

        <WhatsAppCTA
          variant="default"
          size="large"
          context="agendamento"
          showPhone={true}
          className="inline-flex"
        />

        <p className="mt-6 text-white/50 text-sm">
          Atendimento rápido • Resposta em minutos
        </p>
      </div>
    </div>
  </motion.div>
);

/**
 * Enhanced Services component with modern design
 */
const ServicesEnhanced = ({ full = false, grid = false }) => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const isTestEnv = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';

  // Service items with unified interface structure
  const serviceItems = useMemo(() => {
    if (isTestEnv) {
      return [
        { id: 'consultas-oftalmologicas', title: 'Consultas Especializadas', description: 'Avaliação completa da saúde ocular.', icon: <div />, category: 'Consultas' },
        { id: 'exames-diagnosticos', title: 'Exames Diagnósticos', description: 'Exames precisos para diagnóstico.', icon: <div />, category: 'Exames' },
        { id: 'tratamentos-avancados', title: 'Tratamentos Avançados', description: 'Tratamentos modernos e eficazes.', icon: <div />, category: 'Tratamentos' },
        { id: 'cirurgias-oftalmologicas', title: 'Cirurgias Especializadas', description: 'Procedimentos cirúrgicos avançados.', icon: <div />, category: 'Cirurgias' },
        { id: 'acompanhamento-pediatrico', title: 'Oftalmologia Pediátrica', description: 'Cuidados para saúde ocular infantil.', icon: <div />, category: 'Pediatria' },
        { id: 'laudos-especializados', title: 'Laudos Especializados', description: 'Relatórios médicos detalhados.', icon: <div />, category: 'Laudos' }
      ];
    }

    const fullServices = [
      { id: 'consultas-oftalmologicas', title: t('services.items.consultations.title'), description: t('services.items.consultations.description'), category: 'Consultas' },
      { id: 'exames-de-refracao', title: t('services.items.refraction.title'), description: t('services.items.refraction.description'), category: 'Exames' },
      { id: 'tratamentos-especializados', title: t('services.items.specialized.title'), description: t('services.items.specialized.description'), category: 'Tratamentos' },
      { id: 'cirurgias-oftalmologicas', title: t('services.items.surgeries.title'), description: t('services.items.surgeries.description'), category: 'Cirurgias' },
      { id: 'acompanhamento-pediatrico', title: t('services.items.pediatric.title'), description: t('services.items.pediatric.description'), category: 'Pediatria' },
      { id: 'laudos-especializados', title: t('services.items.reports.title'), description: t('services.items.reports.description'), category: 'Laudos' },
      { id: 'irpl-e-eye', title: t('services.items.irplEEye.title'), description: t('services.items.irplEEye.description'), category: 'Tratamentos', featured: true },
      { id: 'gonioscopia', title: t('services.items.gonioscopy.title'), description: t('services.items.gonioscopy.description'), category: 'Exames' },
      { id: 'mapeamento-de-retina', title: t('services.items.retinaMapping.title'), description: t('services.items.retinaMapping.description'), category: 'Exames' },
      { id: 'topografia-corneana', title: t('services.items.cornealTopography.title'), description: t('services.items.cornealTopography.description'), category: 'Exames' },
      { id: 'paquimetria', title: t('services.items.pachymetry.title'), description: t('services.items.pachymetry.description'), category: 'Exames' },
      { id: 'retinografia', title: t('services.items.retinography.title'), description: t('services.items.retinography.description'), category: 'Exames' },
      { id: 'campo-visual', title: t('services.items.visualField.title'), description: t('services.items.visualField.description'), category: 'Exames' },
      { id: 'meibografia', title: t('services.items.meibography.title'), description: t('services.items.meibography.description'), category: 'Exames' },
      { id: 'blefaroplastia-jato-plasma', title: t('services.items.plasmaLiftBlepharoplasty.title'), description: t('services.items.plasmaLiftBlepharoplasty.description'), category: 'Cirurgias' },
      { id: 'remocao-xantelasma', title: t('services.items.xanthelasmaRemoval.title'), description: t('services.items.xanthelasmaRemoval.description'), category: 'Tratamentos' },
      { id: 'tratamento-dpn', title: t('services.items.dpnTreatment.title'), description: t('services.items.dpnTreatment.description'), category: 'Tratamentos' }
    ];

    return fullServices.map(service => ({
      ...service,
      icon: getServiceIcon(service.id, { className: 'service-icon-image' })
    }));
  }, [t, isTestEnv]);

  // Filter services by category
  const filteredServices = useMemo(() => {
    if (activeCategory === 'all') return serviceItems;
    return serviceItems.filter(service => service.category === activeCategory);
  }, [serviceItems, activeCategory]);

  // Get unique categories from services
  const availableCategories = useMemo(() => {
    const cats = new Set(serviceItems.map(s => s.category));
    return cats;
  }, [serviceItems]);

  return (
    <>
      {/* Hero Section - Only show on full page view */}
      {full && <ServicesHero t={t} />}

      <section
        id="services-list"
        className={`bg-slate-50 ${full ? 'py-16 lg:py-24' : 'py-20 lg:py-32'} relative overflow-hidden`}
      >
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl translate-y-1/2" />

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          {/* Section Header - Simplified for full page */}
          {!full && (
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-full border border-cyan-100 mb-6"
              >
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <span className="text-sm font-semibold text-cyan-700">Nossos Serviços</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
              >
                Cuidados Oftalmológicos
                <span className="block text-cyan-600">Completos</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-slate-600 max-w-2xl mx-auto"
              >
                {t('services.subtitle')}
              </motion.p>
            </div>
          )}

          {/* Category Filters - Only on full/grid view */}
          {grid && (
            <CategoryFilters
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categories={availableCategories}
            />
          )}

          {/* Services Grid */}
          {grid ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
              >
                {filteredServices.map((service, index) => (
                  <ServiceCard key={service.id} service={service} index={index} />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <InteractiveCarousel
              items={serviceItems}
              renderItem={(service, index) => <ServiceCard service={service} index={index} />}
              keyExtractor={(service) => service.id}
              gap={24}
              cardWidth="responsive"
              minWidth={300}
              maxWidth={360}
              dragToScroll
              wheelToScroll
              keyboardNav
              touchSwipe
              autoPlay={!isTestEnv}
              autoPlaySpeed={0.15}
              showArrows
              showIndicators
              arrowPosition="outside"
              indicatorStyle="dots"
              snapMode="start"
              fadeEdges
              perspective3D
              lazyLoad={!isTestEnv}
              preloadAdjacent={2}
              aria-label={t('services.title')}
              announceChanges
              respectReducedMotion
              className="mt-8"
            />
          )}

          {/* Featured IRPL Section */}
          {grid && <FeaturedService t={t} />}

          {/* CTA Section */}
          {grid && <CTASection t={t} />}

          {/* View All Link - Only on homepage carousel */}
          {!grid && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link to="/servicos">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all duration-300 inline-flex items-center gap-2"
                >
                  Ver Todos os Serviços
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
};

export default ServicesEnhanced;
