import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/utils/router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Versão corrigida e simplificada do Services sem useAutoplayCarousel
const ServiceCard = ({ service, index }) => {
  const { t } = useTranslation();
  
  return (
    <motion.div
      className="flex-shrink-0 w-80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 mx-3"
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div className="mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {index + 1}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
        {t(`services.${service.id}.title`, service.title)}
      </h3>
      
      <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
        {t(`services.${service.id}.description`, service.description)}
      </p>
      
      <Link
        to={`/servicos/${service.id}`}
        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200"
        aria-label={t('services.learnMore', 'Saiba mais sobre {{title}}', { title: service.title })}
      >
        {t('services.learnMore', 'Saiba mais')}
        <ArrowRight size={16} className="ml-1" />
      </Link>
    </motion.div>
  );
};

function ServicesFixed() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Serviços médicos básicos
  const services = useMemo(() => [
    { id: 'consultas', title: 'Consulta Oftalmológica', description: 'Exame completo da visão e saúde ocular' },
    { id: 'exames', title: 'Exames de Vista', description: 'Avaliação detalhada da acuidade visual' },
    { id: 'refracao', title: 'Exame de Refração', description: 'Medição precisa do grau dos olhos' },
    { id: 'paquimetria', title: 'Paquimetria', description: 'Medição da espessura da córnea' },
    { id: 'tonometria', title: 'Tonometria', description: 'Medição da pressão intraocular' },
    { id: 'biomicroscopia', title: 'Biomicroscopia', description: 'Exame detalhado das estruturas oculares' },
  ], []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  }, [services.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  }, [services.length]);

  return (
    <section id="servicos" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background decorativo simplificado */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wide uppercase rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('services.badge', 'Nossos Serviços')}
          </motion.div>
          
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t('services.title', 'Cuidados Oftalmológicos Completos')}
          </motion.h2>
          
          <motion.p
            className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('services.subtitle', 'Oferecemos uma gama completa de serviços oftalmológicos com tecnologia de ponta e cuidado personalizado.')}
          </motion.p>
        </div>

        {/* Carrossel Simplificado */}
        <div className="relative" aria-label={t('services.title')}>
          {/* Botões de navegação */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200"
            aria-label="Serviços anteriores"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg rounded-full p-3 transition-all duration-200"
            aria-label="Próximos serviços"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>

          {/* Container dos cards */}
          <div className="overflow-hidden mx-12">
            <motion.div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 33.333}%)` }}
            >
              {services.map((service, index) => (
                <div key={service.id} className="w-1/3 px-3">
                  <ServiceCard service={service} index={index} />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Indicadores */}
          <div className="flex justify-center mt-8 space-x-2">
            {services.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Ir para serviço ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/servicos"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {t('services.viewAll', 'Ver Todos os Serviços')}
            <ArrowRight size={20} className="ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default ServicesFixed;