import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Calendar, Star, Users, Shield, ArrowRight, Eye } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { useHeroImagePreload } from '@/hooks/useResourcePreload';

const Hero = () => {
  const { t } = useTranslation();
  const { openFloatingCTA } = useWhatsApp();

  // Preload hero image only on homepage
  useHeroImagePreload();

  const handleAgendarClick = () => {
    // Open popup modal for scheduling options
    openFloatingCTA();
  };

  const handleAgendarContato = openFloatingCTA;

  const handleNossosServicosClick = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative py-8 sm:py-12 md:py-section-lg lg:py-section-xl overflow-visible min-h-screen flex items-center"
      style={{
        paddingTop: 'calc(var(--space-section-lg) + var(--space-32))',
        background: 'linear-gradient(135deg, hsl(var(--medical-primary)/0.08) 0%, hsl(var(--soft-gray)/1) 60%)'
      }}
    >
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(67,100,247,0.1),transparent_60%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(0,82,212,0.1),transparent_60%)]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-24 items-center">

          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col space-y-4 sm:space-y-6 md:space-y-8 text-center lg:text-left order-2 lg:order-1 max-w-xl mx-auto lg:mx-0 lg:pl-8 lg:pr-6"
          >
            <div
              className="inline-flex items-center px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-1 sm:mb-2 w-fit mx-auto lg:mx-0"
              style={{
                background: 'hsl(var(--medical-primary) / 0.12)',
                color: 'hsl(var(--medical-primary))'
              }}
            >
              {t('hero.partner')}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-display-sm lg:text-display-md xl:text-display-lg font-bold leading-tight tracking-tight px-2 sm:px-0">
              <Trans i18nKey="hero.title">
                Cuidando da sua <span className="text-gradient">visão</span> com excelência
              </Trans>
            </h1>

            <p className="text-base sm:text-lg md:text-body-xl leading-relaxed sm:leading-loose max-w-prose text-wrap px-2 sm:px-0">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-700 justify-center lg:justify-start px-2 sm:px-0">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: 'hsl(var(--medical-primary))' }} />
                <span className="font-medium">+5k pacientes</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                <span className="font-medium">4,9/5 • 102+ avaliações</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: 'hsl(var(--medical-secondary))' }} />
                <span className="font-medium">Parceiro Amor e Saúde</span>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 md:pt-8 px-2 sm:px-0">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  variant="medical"
                  className="gap-2 sm:gap-3 w-full sm:w-auto text-sm sm:text-base"
                  onClick={handleAgendarClick}
                  style={{
                    background: 'hsl(var(--medical-primary))',
                    color: 'white'
                  }}
                >
                  <Calendar size={16} className="sm:w-5 sm:h-5" />
                  Agendar Consulta
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 sm:gap-3 border-2 w-full sm:w-auto text-sm sm:text-base"
                  onClick={handleNossosServicosClick}
                  style={{
                    borderColor: 'hsl(var(--medical-primary) / 0.3)',
                    color: 'hsl(var(--text-primary))'
                  }}
                >
                  Ver Serviços <ArrowRight size={16} className="sm:w-5 sm:h-5" />
                </Button>
              </div>

              <div className="text-center lg:text-left">
                <p className="text-sm mb-2" style={{ color: 'hsl(var(--text-secondary))' }}>
                  Confirmação instantânea  •  Sem filas  •  Atendimento humanizado
                </p>
              </div>

              <details className="group">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium text-sm text-center lg:text-left list-none flex items-center justify-center lg:justify-start gap-2 py-2">
                  <span>Outras opções de contato</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center lg:justify-start">
                  <Button variant="cta" size="lg" className="gap-2" onClick={handleAgendarContato}>
                    Contato via WhatsApp
                  </Button>
                </div>
              </details>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600 text-center lg:text-left" aria-live="polite">
                {t('hero.microcopy_fast_confirmation')}
              </p>

              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  <OptimizedImage
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop"
                    width={32}
                    height={32}
                    sizes="32px"
                    alt="Paciente satisfeito"
                  />
                  <OptimizedImage
                    className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop"
                    width={32}
                    height={32}
                    sizes="32px"
                    alt="Paciente satisfeito"
                  />
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                    +5k
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
                  <Trans i18nKey="hero.patients_served">
                    <span className="font-semibold text-slate-700">Mais de 5.000 pacientes</span> atendidos com satisfação
                  </Trans>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="relative lg:order-first flex items-center justify-center lg:justify-start px-4 lg:px-0"
          >
            {/* decorative plates behind the main image to mimic layered cards */}
            <div className="hidden lg:block absolute -left-8 -top-4 w-32 h-48 rounded-2xl bg-white shadow-md transform -rotate-6" aria-hidden="true" />
            <div className="hidden lg:block absolute -left-4 top-12 w-48 h-60 rounded-3xl bg-white shadow-lg transform -rotate-3" aria-hidden="true" />

            <div className="relative z-10 rounded-3xl overflow-visible shadow-2xl transition-shadow duration-500 ease-out hover:shadow-3d-hover w-full max-w-[500px] sm:max-w-[560px] lg:max-w-[600px] xl:max-w-[700px] translate-x-0 lg:-translate-x-6 xl:-translate-x-12">
              <div className="bg-white rounded-3xl p-0 md:p-2">
                <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
                  <OptimizedImage
                    priority={true}
                    loading="eager"
                    width={700}
                    height={525}
                    sizes="(min-width: 1200px) 700px, (min-width: 768px) 600px, (min-width: 640px) 500px, 400px"
                    className="w-full h-full rounded-3xl"
                    alt="Família sorrindo - Saraiva Vision"
                    src="/img/hero.png"
                    fallbackSrc="/img/drphilipe_perfil.png"
                    objectFit="cover"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="hidden sm:block absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 lg:-bottom-4 lg:-left-12 glass-card p-2 sm:p-3 md:p-4 max-w-xs w-48 sm:w-56 md:w-64"
        >
          <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
            <div className="icon-container bg-blue-100 flex-shrink-0">
              <Eye size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm md:text-base font-semibold text-slate-900 truncate">{t('hero.advanced_tech_title')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-tight">{t('hero.advanced_tech_desc')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
