import { useTranslation, Trans } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight, Eye } from 'lucide-react';

import { smoothScrollTo } from '@/utils/scrollUtils';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import UnifiedCTA from '@/components/UnifiedCTA';
import '../styles/design-system.css';
import '../styles/glassMorphism.css';

const Hero = () => {
  const { t } = useTranslation();

  const handleNossosServicosClick = () => {
    smoothScrollTo('#services', {
      offset: -80,
      duration: 800,
      easing: 'easeInOutCubic'
    });
  };

  return (
    <section
      id="home"
      className="scroll-block-internal isolate relative pt-[132px] pb-24 md:pt-[164px] md:pb-32 overflow-hidden overflow-x-hidden bg-hero-enhanced min-h-[100dvh]"
    >
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_60%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.08),transparent_60%)]"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-400/5 via-cyan-400/8 to-teal-400/5 rounded-full blur-3xl animate-pulse-soft"></div>
      </div>

      {/* Conteúdo centralizado com paddings responsivos em vez de margem no section,
          mantendo o background full-bleed e evitando cortes nas laterais. */}
      <div className="container mx-auto px-6 md:px-8 lg:px-[6%] xl:px-[7%] 2xl:px-[8%] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div
            className="flex flex-col space-y-6 text-center lg:text-left"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-cyan-700 text-sm font-medium mb-2 w-fit mx-auto lg:mx-0">
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

            <div className="flex flex-col gap-6 pt-4">
              <UnifiedCTA variant="hero" className="w-full lg:w-auto" />

              <Button
                variant="outline"
                size="lg"
                className="gap-2 glass-card hover:glass-morphism-hover focus-ring transition-all duration-300 w-full lg:w-auto"
                onClick={handleNossosServicosClick}
              >
                {t('hero.services_button')}
                <ArrowRight size={20} />
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-6 justify-center lg:justify-start">
              <div className="flex -space-x-4">
                <div className="relative group">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-white ring-2 ring-blue-100/60 shadow-md flex items-center justify-center overflow-hidden hover:scale-110 transition-all duration-300">
                    <ImageWithFallback
                      src="/img/responsive/avatar-female-blonde-77.webp"
                      alt={t('ui.alt.satisfied_patient_1', 'Paciente satisfeito 1')}
                      className="w-12 h-12 object-cover rounded-full"
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                    />
                  </div >
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div >
                <div className="relative group">
                  <div className="w-12 h-12 rounded-full bg-white border-2 border-white ring-2 ring-blue-100/60 shadow-md flex items-center justify-center overflow-hidden hover:scale-110 transition-all duration-300">
                    <ImageWithFallback
                      src="/img/responsive/avatar-female-brunette-77.webp"
                      alt={t('ui.alt.satisfied_patient_2', 'Paciente satisfeito 2')}
                      className="w-12 h-12 object-cover rounded-full"
                      width={48}
                      height={48}
                      loading="lazy"
                      decoding="async"
                    />
                  </div >
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div >
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
              </div >
              <p className="text-slate-600 text-sm">
                <Trans i18nKey="hero.patients_served">
                  <span className="font-semibold text-slate-700">Mais de 5.000 pacientes</span> atendidos com satisfação
                </Trans>
              </p>
            </div >
          </div >

          <div
            className="relative mt-8 lg:mt-0"
          >
            {/* Enhanced Hero Image Container with Premium Border Design */}
            <div className="hero-image-container relative z-10 group pt-8">
              {/* Decorative Frame */}
              <div className="absolute inset-3 top-11 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-[2rem] opacity-20 group-hover:opacity-30 transition-opacity duration-500 blur-sm"></div>

              {/* Corner Accents */}
              <div className="absolute top-9 left-1 w-16 h-16 border-t-4 border-l-4 border-cyan-400 rounded-tl-2xl z-20"></div>
              <div className="absolute -bottom-2 -right-2 w-16 h-16 border-b-4 border-r-4 border-cyan-400 rounded-br-2xl z-20"></div>

              {/* Floating Badge - Positioned above image */}
              <div className="absolute top-0 right-4 z-30 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg shadow-cyan-500/30 flex items-center gap-2 text-sm font-semibold whitespace-nowrap">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Especialista em Olho Seco
              </div>

              {/* Main Image Container */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-cyan-500/20 border-2 border-white/50 bg-gradient-to-br from-slate-50 to-cyan-50/50 group-hover:shadow-cyan-500/30 transition-all duration-500 mt-4">
                <picture>
                  <source srcSet="/img/hero_dry_eye_relief_2.avif" type="image/avif" />
                  <source srcSet="/img/hero_dry_eye_relief_2.webp" type="image/webp" />
                  <img
                    src="/img/hero_dry_eye_relief_2.png"
                    alt={t('ui.alt.hero_image', 'Tratamento de olho seco - Saraiva Vision')}
                    width={800}
                    height={800}
                    className="block w-full h-auto rounded-3xl transform group-hover:scale-[1.02] transition-transform duration-700"
                    loading="eager"
                    decoding="async"
                    fetchpriority="high"
                  />
                </picture>

                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
              </div>
            </div>

            {/* Enhanced Info Card */}
            <div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:-left-12 md:-bottom-4 backdrop-blur-md bg-white/90 border border-cyan-200/50 shadow-xl shadow-cyan-500/10 rounded-2xl p-5 max-w-xs hover:shadow-cyan-500/20 transition-all duration-300 z-20"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
                  <Eye size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{t('hero.advanced_tech_title')}</h3>
                  <p className="text-sm text-slate-600">{t('hero.advanced_tech_desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div >
      </div >
    </section >
  );
};

export default Hero;
