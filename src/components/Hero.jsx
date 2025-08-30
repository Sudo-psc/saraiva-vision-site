import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Calendar, MessageCircle, Star, Users, Shield, ArrowRight, Eye } from 'lucide-react';
import { clinicInfo } from '@/lib/clinicInfo';
import SafeImage from '@/components/ui/SafeImage';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { safeOpenUrl } from '@/utils/safeNavigation';
import { useHeroImagePreload } from '@/hooks/useResourcePreload';

const Hero = () => {
  const { t } = useTranslation();
  const { openFloatingCTA } = useWhatsApp();

  // Preload hero image only on homepage
  useHeroImagePreload();

  const handleAgendarClick = () => {
    // Use validated scheduling URL with enhanced error handling
    const validUrl = clinicInfo.validateSchedulingUrl();
    if (validUrl) {
      safeOpenUrl(validUrl);
    } else {
      console.error('Scheduling URL validation failed, falling back to contact modal');
      openFloatingCTA();
    }
  };

  const handleAgendarContato = openFloatingCTA;

  const handleNossosServicosClick = () => {
    const servicesElement = document.getElementById('services');
    if (servicesElement && typeof servicesElement.scrollIntoView === 'function') {
      servicesElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative py-section-lg md:py-section-xl overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30" style={{ paddingTop: 'calc(var(--space-section-lg) + var(--space-32))' }}>
      {/* Enhanced background with modern gradients and shapes */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-gradient-to-bl from-blue-100/40 via-sky-50/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[70%] h-[70%] bg-gradient-to-tr from-indigo-100/40 via-blue-50/30 to-transparent rounded-full blur-3xl"></div>
        {/* Geometric background elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-2xl rotate-12 blur-sm"></div>
        <div className="absolute bottom-40 left-16 w-24 h-24 bg-gradient-to-tr from-sky-200/20 to-blue-200/20 rounded-full blur-sm"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 no-scrollbar-x">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-6 md:space-y-8 text-center lg:text-left"
          >
            {/* Enhanced badge with better styling */}
            <div className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 text-sm font-semibold mb-6 w-fit mx-auto lg:mx-0 border border-blue-200/50 shadow-sm">
              <span className="mr-2 text-blue-600">✦</span> {t('hero.partner')}
            </div>

            {/* Enhanced heading with improved gradient text */}
            <h1 className="text-display-sm md:text-display-md lg:text-display-lg font-bold leading-tight tracking-tight mb-6">
              <Trans i18nKey="hero.title">
                Cuidando da sua <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">visão</span> com excelência
              </Trans>
            </h1>

            <p className="text-body-xl leading-loose max-w-prose text-wrap">
              {t('hero.subtitle')}
            </p>

            {/* Enhanced trust signals with better visual design */}
            <div className="flex flex-wrap items-center gap-6 text-sm justify-center lg:justify-start">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-slate-200/50 shadow-sm">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-800">+5k</span>
                <span className="text-slate-600">pacientes</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-slate-200/50 shadow-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-semibold text-slate-800">4,9/5</span>
                <span className="text-slate-600">• 102+ avaliações</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-slate-200/50 shadow-sm">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-slate-800">Parceiro Amor e Saúde</span>
              </div>
            </div>

            {/* Enhanced CTA section with better visual hierarchy */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center lg:justify-start">
              <Button 
                size="xl" 
                variant="cta" 
                className="gap-3 shadow-xl hover:shadow-2xl font-bold px-8 py-4 transform hover:scale-105 transition-all duration-300" 
                onClick={handleAgendarClick}
              >
                <Calendar size={20} />
                {t('hero.schedule_button')}
              </Button>

              <Button 
                variant="outline" 
                size="xl" 
                className="gap-2 border-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 font-semibold" 
                onClick={handleNossosServicosClick}
              >
                {t('hero.services_button')} 
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            {/* Microcopy and trust indicators directly below CTAs */}
            <div className="space-y-4">
              <p className="text-sm text-slate-600 text-center lg:text-left" aria-live="polite">
                {t('hero.microcopy_fast_confirmation')}
              </p>

              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  <SafeImage
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=64&h=64&fit=crop&crop=face"
                    width="32"
                    height="32"
                    alt="Paciente satisfeita após consulta oftalmológica"
                  />
                  <SafeImage
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=64&h=64&fit=crop&crop=face"
                    width="32"
                    height="32"
                    alt="Paciente satisfeito com óculos novos"
                  />
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                    +5k
                  </div>
                </div>
                <p className="text-slate-600 text-sm">
                  <Trans i18nKey="hero.patients_served">
                    <span className="font-semibold text-slate-700">Mais de 5.000 pacientes</span> atendidos com satisfação
                  </Trans>
                </p>
              </div>

              <button
                onClick={handleAgendarContato}
                className="text-blue-700 hover:text-blue-800 font-medium text-sm underline-offset-2 hover:underline transition-colors block text-center lg:text-left"
              >
                {t('hero.more_contact_options')}
              </button>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:order-first"
          >
            {/* Enhanced image container with modern design elements */}
            <div className="relative z-10 group">
              {/* Background glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-200/40 via-indigo-200/40 to-sky-200/40 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Main image container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-slate-200/50">
                <SafeImage
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
                  width="800"
                  height="640"
                  sizes="(min-width: 1024px) 800px, 100vw"
                  className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                  alt="Médico oftalmologista sorrindo para a câmera em uma clínica moderna"
                  src="https://storage.googleapis.com/hostinger-horizons-assets-prod/843bf487-a1d7-4507-b4b0-b823fd326fe0/27e39bc93bb60b968be31edae30bad21.png?format=webp"
                  fallbackSrc="https://storage.googleapis.com/hostinger-horizons-assets-prod/843bf487-a1d7-4507-b4b0-b823fd326fe0/27e39bc93bb60b968be31edae30bad21.png"
                />
              </div>
            </div>

            {/* Enhanced floating card with modern design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 lg:-bottom-6 lg:-left-14 bg-white/95 backdrop-blur-md border border-white/50 shadow-2xl rounded-2xl p-4 md:p-6 max-w-xs w-72 md:w-auto"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                  <Eye size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{t('hero.advanced_tech_title')}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{t('hero.advanced_tech_desc')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

