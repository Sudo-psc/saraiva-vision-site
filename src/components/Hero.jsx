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
    <section id="home" className="relative py-section-lg md:py-section-xl overflow-hidden bg-hero-gradient" style={{ paddingTop: 'calc(var(--space-section-lg) + var(--space-32))' }}>
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(67,100,247,0.1),transparent_60%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(0,82,212,0.1),transparent_60%)]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 no-scrollbar-x">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-6 md:space-y-8 text-center lg:text-left"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-2 w-fit mx-auto lg:mx-0">
              {t('hero.partner')}
            </div>

            <h1 className="text-display-sm md:text-display-md lg:text-display-lg font-bold leading-tight tracking-tight">
              <Trans i18nKey="hero.title">
                Cuidando da sua <span className="text-gradient">visão</span> com excelência
              </Trans>
            </h1>

            <p className="text-body-xl leading-loose max-w-prose text-wrap">
              {t('hero.subtitle')}
            </p>

            {/* Inline trust signals with icons */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700 justify-center lg:justify-start">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium">+5k pacientes</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium">4,9/5 • 102+ avaliações</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-medium">Parceiro Amor e Saúde</span>
              </div>
            </div>

            {/* CTA Actions */}
            <div className="space-y-6 pt-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="xl" variant="medical" className="gap-3" onClick={handleAgendarClick}>
                  <Calendar size={20} />
                  Agendar Consulta
                </Button>
                <Button variant="outline" size="xl" className="gap-3 border-2" onClick={handleNossosServicosClick}>
                  Ver Serviços <ArrowRight size={18} />
                </Button>
              </div>

              {/* Trust reinforcement */}
              <div className="text-center lg:text-left">
                <p className="text-sm text-slate-600 mb-2">
                  Confirmação instantânea  •  Sem filas  •  Atendimento humanizado
                </p>
              </div>

              {/* Secondary contact options */}
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

            {/* Microcopy and trust indicators directly below CTAs */}
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
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-soft-medium">
              <div className="relative group">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-3xl overflow-hidden blur-xl scale-110 opacity-40 group-hover:opacity-50 transition-opacity"
                  style={{
                    backgroundImage: 'url(/img/doctor_hero_blur_placeholder.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <OptimizedImage
                  priority={true}
                  loading="eager"
                  width={800}
                  height={640}
                  sizes="(min-width: 1024px) 800px, 100vw"
                  className="w-full h-auto relative rounded-3xl"
                  alt="Dr. Philipe Saraiva - Oftalmologista"
                  src="/img/doctor_hero_original.jpeg"
                  fallbackSrc="/img/drphilipe_perfil.png"
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 lg:-bottom-4 lg:-left-12 glass-card p-3 md:p-4 max-w-xs w-64 md:w-auto"
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
