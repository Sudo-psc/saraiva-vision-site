import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';
import JotformChatbot from '@/components/JotformChatbot';
import { CheckCircle, Crown, ArrowLeft, Phone, Sparkles, Star, Shield, Award, Zap, Users, MapPin, AlertCircle, Package } from 'lucide-react';
import { PLAN_PAYMENT_LINKS } from '@/config/plans';

const PlanPremiumPage = () => {
  const { t } = useTranslation();
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const playVideo = () => {
        video.muted = true;
        video.play()
          .then(() => {
          })
          .catch(err => {
          });
      };

      if (video.readyState >= 3) {
        playVideo();
      } else {
        video.addEventListener('canplay', playVideo, { once: true });
      }
    }
  }, []);

  const seoData = {
    title: 'Plano Premium de Lentes de Contato | Saraiva Vision',
    description: 'Experiência VIP com as melhores lentes e atendimento personalizado exclusivo para você e sua família.',
    keywords: 'plano premium lentes, lentes VIP, assinatura lentes premium',
    canonicalUrl: 'https://saraivavision.com.br/planopremium',
    ogImage: 'https://saraivavision.com.br/og-image.jpg'
  };

  const features = [
    'Todos os benefícios do Plano Padrão',
    '14 pares de lentes premium multifocais',
    '2 consultas presenciais por ano',
    'Consultas online com prioridade',
    '1 exame de topografia e meibografia incluídos por ano',
    'Exames complementares inclusos',
    'Kit premium de higienização',
    'Atendimento domiciliar disponível',
    '20% de desconto em cirurgias',
    'Segundo titular sem custo adicional'
  ];

  const extraBenefits = [
    {
      icon: Sparkles,
      title: 'Experiência VIP',
      description: 'Atendimento exclusivo e personalizado para você',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Star,
      title: 'Lentes Premium Multifocais',
      description: '14 pares das melhores lentes do mercado incluídas',
      gradient: 'from-amber-500 to-amber-600'
    },
    {
      icon: Users,
      title: 'Segundo Titular Grátis',
      description: 'Inclua um familiar sem custo adicional',
      gradient: 'from-slate-500 to-slate-600'
    },
    {
      icon: Award,
      title: 'Descontos Exclusivos',
      description: '20% de desconto em todos os procedimentos cirúrgicos',
      gradient: 'from-blue-600 to-blue-700'
    }
  ];

  return (
    <>
      <SEOHead {...seoData} />
      <JotformChatbot />

      {/* Background Premium com Gradiente */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02ek0yNCA0MmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      </div>

      <main className="flex-1 pt-16 md:pt-20 lg:pt-24 mx-[4%] md:mx-[6%] lg:mx-[8%] relative">
        {/* Back Navigation */}
        <div className="mb-6 animate-fade-in">
          <Link
            to="/planos"
            className="inline-flex items-center gap-2 text-blue-900 bg-white hover:bg-blue-50 font-bold px-4 py-2 rounded-lg shadow-lg border-2 border-blue-300 transition-all duration-300 group hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Voltar para Planos</span>
          </Link>
        </div>

        {/* Hero Section with Glassmorphism */}
        <section className="mb-5 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 items-center">
            {/* Content */}
            <div className="space-y-3 sm:space-y-4 bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl border-2 border-amber-400/30">
              {/* Badge Premium com Brilho */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-blue-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-amber-500/50 group hover:scale-105 transition-all duration-500">
                <Crown className="w-4 h-4 group-hover:rotate-12 transition-transform duration-500" />
                <span>Premium VIP</span>
                <Sparkles className="w-3 h-3 animate-pulse" />
              </div>

              {/* Título */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 bg-clip-text text-transparent">
                Plano Premium
              </h1>

              {/* Descrição */}
              <p className="text-base sm:text-lg md:text-xl text-gray-900 leading-relaxed font-semibold">
                Experiência <span className="text-amber-600 font-bold bg-amber-100 px-2 py-1 rounded">VIP</span> com as melhores lentes e atendimento personalizado exclusivo para você e sua família.
              </p>

              {/* Price Box com Destaque */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-amber-500 to-blue-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-blue-50 to-amber-50 rounded-2xl p-6 border-2 border-blue-300 shadow-2xl group-hover:scale-105 group-hover:shadow-blue-500/50 transition-all duration-500">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900">
                      12x de R$ 179,99
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-semibold">ou à vista com <span className="text-amber-600 font-bold bg-amber-100 px-2 py-0.5 rounded">desconto especial</span></p>

                  {/* Barra de destaque */}
                  <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"></div>
                </div>
              </div>

              {/* Botões Premium com Animações */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                {/* Botão Principal com Brilho Animado */}
                <a
                  href={PLAN_PAYMENT_LINKS.premium}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-amber-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-400/60 transition-all duration-500 transform hover:scale-105 text-center overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Assinar Agora
                    <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  </span>
                </a>

                {/* Botão Secundário */}
                <a
                  href="https://wa.me/message/2QFZJG3EDJZVF1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-1 flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-900 hover:bg-blue-50 hover:border-amber-500 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105"
                >
                  <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Falar com Especialista
                </a>
              </div>
            </div>

            {/* Video com Borda Luminosa */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-amber-500 to-blue-500 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-pulse"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/50 ring-2 ring-white/10 group-hover:ring-amber-400/50 transition-all duration-500">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover min-h-[400px] lg:min-h-[500px]"
                  loop
                  playsInline
                  muted
                  preload="auto"
                >
                  <source src="/Videos/hero-plano-premium.mp4" type="video/mp4" />
                  Seu navegador não suporta a reprodução de vídeos.
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* Aviso de Cobertura Geográfica */}
        <section className="mb-4 animate-fade-in-up" style={{animationDelay: '0.15s'}}>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl">
            <div className="flex items-start gap-2 mb-2">
              <div className="bg-white rounded-xl p-3 shadow-lg">
                <AlertCircle className="w-7 h-7 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Importante: Cobertura de Atendimento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      <p className="font-bold text-gray-900">Consultas Presenciais</p>
                    </div>
                    <p className="text-sm text-gray-700">Disponíveis apenas em <span className="font-bold text-amber-700">Caratinga, Ipatinga e Belo Horizonte/MG</span></p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="font-bold text-gray-900">Consultas Online</p>
                    </div>
                    <p className="text-sm text-gray-700">Válida em <span className="font-bold text-green-700">todo o território nacional</span></p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-md border-2 border-cyan-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-cyan-600" />
                      <p className="font-bold text-gray-900">Entrega de Lentes</p>
                    </div>
                    <p className="text-sm text-gray-700">Válida em <span className="font-bold text-cyan-700">todo o território nacional</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="text-center mb-4 sm:mb-5 bg-white/95 backdrop-blur-xl rounded-2xl py-3 sm:py-4 px-4 sm:px-8 shadow-lg border-2 border-blue-300 mx-auto inline-block">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-1 sm:mb-2">
              O que está incluído?
            </h2>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent rounded-full"></div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-amber-500/10 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 md:p-6 border-2 border-blue-300 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group flex items-start gap-3 bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 border-2 border-blue-200 hover:border-amber-400 hover:scale-105 transition-all duration-500 hover:shadow-xl"
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <CheckCircle className="w-5 h-5 text-blue-600 group-hover:text-amber-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-all duration-300" />
                    <span className="text-base text-gray-900 font-bold">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Extra Benefits com Ícones */}
        <section className="mb-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="text-center mb-4 sm:mb-5 bg-white/95 backdrop-blur-xl rounded-2xl py-3 sm:py-4 px-4 sm:px-8 shadow-lg border-2 border-blue-300 mx-auto inline-block">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-1 sm:mb-2">
              Por que escolher este plano?
            </h2>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {extraBenefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={index}
                  className="group relative"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-amber-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 border-2 border-blue-300 shadow-xl hover:shadow-2xl group-hover:scale-105 group-hover:border-amber-400 transition-all duration-500">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${benefit.gradient} mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-800 font-semibold leading-relaxed">{benefit.description}</p>

                    {/* Barra decorativa */}
                    <div className="mt-4 h-0.5 w-0 bg-gradient-to-r from-blue-500 to-amber-500 group-hover:w-full transition-all duration-500"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Final Premium */}
        <section className="mb-4 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-amber-500 to-blue-600 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-white via-blue-50 to-amber-50 rounded-3xl p-5 sm:p-6 md:p-8 text-center border-4 border-amber-400 shadow-2xl overflow-hidden">
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent -translate-x-full animate-shimmer"></div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-900 via-blue-700 to-blue-900 bg-clip-text text-transparent">
                Pronto para a experiência Premium?
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-5 max-w-2xl mx-auto text-gray-900 font-bold leading-relaxed">
                Assine agora e tenha acesso <span className="text-white bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 rounded-lg shadow-lg font-black">VIP</span> a todos os benefícios exclusivos do nosso plano mais completo
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a
                  href={PLAN_PAYMENT_LINKS.premium}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-110 relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  <span className="relative flex items-center justify-center gap-2">
                    <Crown className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Assinar Plano Premium
                  </span>
                </a>

                <Link
                  to="/planos"
                  className="bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-900 font-bold py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                >
                  Ver Outros Planos
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <EnhancedFooter />

      {/* Estilos de Animação e Overrides */}
      <style jsx>{`
        /* Override global section padding com +10% e mobile-first */
        section {
          padding-top: 10px !important;
          padding-bottom: 10px !important;
        }

        @media (min-width: 640px) {
          section {
            padding-top: 12px !important;
            padding-bottom: 12px !important;
          }
        }

        @media (min-width: 768px) {
          section {
            padding-top: 14px !important;
            padding-bottom: 14px !important;
          }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          to {
            transform: translateX(100%);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out backwards;
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </>
  );
};

// PlanPremiumPage não recebe props, mas adicionamos PropTypes para consistência
PlanPremiumPage.propTypes = {};
PlanPremiumPage.defaultProps = {};

export default PlanPremiumPage;
