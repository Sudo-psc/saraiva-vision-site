import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Eye } from 'lucide-react';
import { clinicInfo } from '@/lib/clinicInfo';
import OptimizedImage from '@/components/ui/OptimizedImage';
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
                <OptimizedImage
                  className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md"
                  src="/img/1006771-5.jpeg"
                  width={48}
                  height={48}
                  alt={t('ui.alt.satisfied_patient_1', 'Paciente satisfeito 1')}
                  fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAyMi4yMzg2IDIyLjIzODYgMjAgMjAgMjBaTTE1IDE1QzE2LjY1NjkgMTUgMTggMTMuNjU2OSAxOCAxMkMxOCA5LjM0MzE1IDE2LjY1NjkgOCA4IDhDOCA2LjM0MzE1IDYuNjU2OSA4IDggOFMxMCA5LjM0MzE1IDEwIDEyQzEwIDEzLjY1NjkgMTEuMzQzMSA4IDE1IDhaIiBmaWxsPSIjOUFBQUFGIi8+Cjxzdmc+Cg=="
                  placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNFNUU3RUIiLz4KPHN2Zz4K"
                />
                <OptimizedImage
                  className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md"
                  src="/img/eng.ana.jpeg"
                  width={48}
                  height={48}
                  alt={t('ui.alt.satisfied_patient_2', 'Enfermeira Ana Lúcia')}
                  fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM2MzY2RjEiLz4KPHBhdGggZD0iTTIwIDIwQzIyLjc2MTQgMjAgMjUgMTcuNzYxNCAyNSAxNUMyNSAyMi4yMzg2IDIyLjIzODYgMjAgMjAgMjBaTTE1IDE1QzE2LjY1NjkgMTUgMTggMTMuNjU2OSAxOCAxMkMxOCA5LjM0MzE1IDE2LjY1NjkgOCA4IDhDOCA2LjM0MzE1IDYuNjU2OSA4IDggOFMxMCA5LjM0MzE1IDEwIDEyQzEwIDEzLjY1NjkgMTEuMzQzMSA4IDE1IDhaIiBmaWxsPSIjOUFBQUFGIi8+Cjwvc3ZnPgo="
                  placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNFNUU3RUIiLz4KPHN2Zz4K"
                />
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-md text-sm hover:scale-105 transition-transform duration-200">
                  +5k
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
              <OptimizedImage
                loading="eager"
                fetchPriority="high"
                width={800}
                height={640}
                sizes="(min-width: 1024px) 800px, 100vw"
                className="w-full h-auto aspect-[4/3] object-cover object-center"
                alt={t('ui.alt.hero_image', 'Família sorrindo - Saraiva Vision')}
                src="/img/hero.png"
                fallbackSrc="/img/drphilipe_perfil.png"
                priority={true}
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
