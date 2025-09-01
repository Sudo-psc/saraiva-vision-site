import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Eye } from 'lucide-react';
import { clinicInfo } from '@/lib/clinicInfo';
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
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  const [heroSrc, setHeroSrc] = useState('/img/hero.png');
  const handleHeroError = useCallback(() => {
    if (heroSrc !== '/img/drphilipe_perfil.png') setHeroSrc('/img/drphilipe_perfil.png');
  }, [heroSrc]);

  return (
    <section id="home" className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-hero-gradient">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(67,100,247,0.1),transparent_60%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(0,82,212,0.1),transparent_60%)]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-2 w-fit mx-auto lg:mx-0">
              <span className="mr-2">✦</span> {t('hero.partner')}
            </div>

            <h1 className="text-5xl md:text-6xl">
              <Trans i18nKey="hero.title">
                Cuidando da sua <span className="text-gradient">visão</span> com excelência
              </Trans>
            </h1>

            <p className="md:pr-10">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <Button size="xl" variant="cta" className="gap-2 shadow-2xl" onClick={handleAgendarClick}>
                <Calendar size={20} />
                {t('hero.schedule_button')}
              </Button>

              <Button variant="outline" size="lg" className="gap-2" onClick={handleNossosServicosClick}>
                {t('hero.services_button')}
                <ArrowRight size={20} />
              </Button>
            </div>

            {/* Micro-roadmap copy below hero primary actions */}
            <p className="text-sm text-slate-700 mt-2 font-medium" aria-live="polite">
              {t('hero.microcopy_fast_confirmation')}
              <button onClick={handleAgendarContato} className="ml-2 text-blue-700 hover:underline">{t('hero.more_contact_options')}</button>
            </p>

            <div className="flex items-center gap-4 pt-6 justify-center lg:justify-start">
              <div className="flex -space-x-4">
                <div className="relative group">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-white ring-2 ring-blue-100/60 shadow-md flex items-center justify-center overflow-hidden hover:scale-110 transition-all duration-300">
                    <img
                      src="/img/patient-avatar-1.svg"
                      alt={t('ui.alt.satisfied_patient_1', 'Paciente satisfeito 1')}
                      className="w-12 h-12 object-contain"
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="relative group">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-white ring-2 ring-blue-100/60 shadow-md flex items-center justify-center overflow-hidden hover:scale-110 transition-all duration-300">
                    <img
                      src="/img/patient-avatar-2.svg"
                      alt={t('ui.alt.satisfied_patient_2', 'Paciente satisfeito 2')}
                      className="w-12 h-12 object-contain"
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold border-2 border-white shadow-lg text-sm hover:scale-110 transition-all duration-300 ring-2 ring-white/50 hover:ring-4 hover:ring-amber-200">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-extrabold">+5k</span>
                      <div className="flex -mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-2 h-2 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center ring-1 ring-white">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="text-slate-600 text-sm">
                <Trans i18nKey="hero.patients_served">
                  <span className="font-semibold text-slate-700">Mais de 5.000 pacientes</span> atendidos com satisfação
                </Trans>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-soft-medium">
              <img
                src={heroSrc}
                alt={t('ui.alt.hero_image', 'Família sorrindo - Saraiva Vision')}
                width={800}
                height={640}
                loading="eager"
                fetchpriority="high"
                decoding="async"
                sizes="(min-width: 1024px) 800px, 100vw"
                onError={handleHeroError}
                className="block w-full h-auto aspect-[4/3] object-cover object-center"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:-left-12 md:-bottom-4 glass-card p-4 max-w-xs"
            >
              <div className="flex items-start gap-4">
                <div className="icon-container bg-blue-100">
                  <Eye size={24} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{t('hero.advanced_tech_title')}</h3>
                  <p className="text-sm">{t('hero.advanced_tech_desc')}</p>
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
