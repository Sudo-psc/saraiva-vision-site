'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { HomeData } from '@/types/home';

interface HeroSectionProps {
  data: HomeData | null;
  error: string | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ data, error }) => {
  // Fallback data if API fails
  const fallbackData: HomeData = {
    title: 'Cuidando da sua visão com excelência',
    subtitle: 'Agende sua consulta hoje mesmo e tenha acesso aos melhores cuidados oftalmológicos.',
    imageUrl: '/images/hero.webp',
    ctaButtons: [
      { label: 'Agendar Consulta', link: '/contato', primary: true },
      { label: 'Saiba Mais', link: '#services', primary: false }
    ],
    promoText: 'Mês de Setembro com 50% de desconto em consultas iniciais!'
  };

  const heroData = data || fallbackData;

  const handleAgendarClick = () => {
    // Use clinic scheduling URL or fallback to contact
    const clinicUrl = process.env.NEXT_PUBLIC_CLINIC_URL || '/contato';
    window.open(clinicUrl, '_blank');
  };

  const handleServicesClick = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="scroll-block-internal isolate relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden overflow-x-hidden bg-hero-enhanced min-h-[100dvh]"
    >
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_60%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.08),transparent_60%)]"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-400/5 via-cyan-400/8 to-teal-400/5 rounded-full blur-3xl animate-pulse-soft"></div>
      </div>

      <div className="container mx-auto px-6 md:px-8 lg:px-[6%] xl:px-[7%] 2xl:px-[8%] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-6 text-center lg:text-left"
          >
            {/* Partner Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-2 w-fit mx-auto lg:mx-0">
              <span className="mr-2">✦</span>
              <span>Clínica Oftalmológica</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                {heroData.title}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="md:pr-10 text-lg text-gray-700 leading-relaxed">
              {heroData.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              {heroData.ctaButtons.map((button, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {button.primary ? (
                    <button
                      onClick={handleAgendarClick}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-4 focus:ring-blue-300"
                    >
                      <Calendar size={20} />
                      {button.label}
                    </button>
                  ) : (
                    <button
                      onClick={handleServicesClick}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white/90 backdrop-blur-sm border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 focus:ring-4 focus:ring-blue-200"
                    >
                      {button.label}
                      <ArrowRight size={20} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Usando dados locais devido a erro na API: {error}
                </p>
              </div>
            )}

            {/* Trust indicators */}
            <div className="flex items-center gap-4 pt-6 justify-center lg:justify-start">
              <div className="flex -space-x-4">
                {/* Patient avatars would go here */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-md">
                  <span className="text-xs">5k+</span>
                </div>
              </div>
              <p className="text-slate-600 text-sm">
                Mais de 5.000 pacientes atendidos com satisfação
              </p>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="hero-image-container relative z-10 rounded-3xl overflow-hidden shadow-3d hover:shadow-3d-hover transition-all duration-500 card-hover bg-gradient-to-br from-blue-50 to-cyan-50">
              <img
                src={heroData.imageUrl}
                alt="Família sorrindo - Saraiva Vision"
                className="block w-full h-auto aspect-[4/3] object-cover object-center rounded-3xl transition-transform duration-700 hover:scale-105"
                loading="eager"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/hero-1280w.webp'; // Fallback image
                }}
              />
            </div>

            {/* Floating card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:-left-12 md:-bottom-4 glass-card p-4 max-w-xs"
            >
              <div className="flex items-start gap-4">
                <div className="icon-container bg-blue-100">
                  <Calendar size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Tecnologia Avançada</h3>
                  <p className="text-sm text-slate-600">Equipamentos de última geração para o melhor diagnóstico.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
