import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';
import JotformChatbot from '@/components/JotformChatbot';
import { CheckCircle, Package, ArrowLeft, Phone, MapPin, AlertCircle } from 'lucide-react';
import { PLAN_PAYMENT_LINKS } from '@/config/plans';

const PlanBasicoPage = () => {
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
    title: 'Plano Básico de Lentes de Contato | Saraiva Vision',
    description: 'Pioneiro no Brasil, nosso plano básico de assinatura de lentes de contato oferece tudo para você usar suas lentes com segurança e praticidade.',
    keywords: 'plano básico lentes, lentes mensais, assinatura lentes básico',
    canonicalUrl: 'https://saraivavision.com.br/planobasico',
    ogImage: 'https://saraivavision.com.br/og-image.jpg'
  };

  const features = [
    '12 pares de lentes gelatinosas asféricas',
    '1 consulta online',
    '1 consulta presencial com médico',
    'Acompanhamento médico mensal',
    'Lembretes mensais de troca',
    'Entrega em casa sem custo adicional',
    '12 meses de lentes novinhas'
  ];

  const extraBenefits = [
    {
      title: 'Economia Garantida',
      description: 'Até 40% mais barato que comprar lentes avulsas'
    },
    {
      title: 'Praticidade Total',
      description: 'Receba suas lentes todo mês sem preocupação'
    },
    {
      title: 'Acompanhamento Médico',
      description: 'Consultas online e presencial incluídas'
    }
  ];

  return (
    <>
      <SEOHead {...seoData} />
      <JotformChatbot />
      <main className="flex-1 pt-32 md:pt-36 lg:pt-40 mx-[4%] md:mx-[6%] lg:mx-[8%]">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            to="/planos"
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Planos
          </Link>
        </div>

        {/* Hero Section with Video */}
        <section className="!mb-8 !pt-0 !pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
                <Package className="w-4 h-4" />
                <span>Pioneiro no Brasil</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent">
                Plano Básico
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-6">
                Pioneiro no Brasil, nosso plano básico de assinatura de lentes de contato oferece tudo para você usar suas lentes com segurança e praticidade.
              </p>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 border border-cyan-200 mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  12x de R$ 100,00
                </div>
                <p className="text-sm text-gray-600">ou à vista com desconto</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={PLAN_PAYMENT_LINKS.basico}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
                >
                  Assinar Agora
                </a>
                <a
                  href="https://wa.me/message/2QFZJG3EDJZVF1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 font-semibold py-4 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Phone className="w-5 h-5" />
                  Falar com Especialista
                </a>
              </div>
            </div>

            {/* Video */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-cyan-900 to-slate-900">
              <video
                ref={videoRef}
                className="w-full h-full object-cover min-h-[400px] lg:min-h-[500px]"
                loop
                playsInline
                muted
                preload="auto"
              >
                <source src="/Videos/hero-plano-basico.mp4" type="video/mp4" />
                Seu navegador não suporta a reprodução de vídeos.
              </video>
            </div>
          </div>
        </section>

        {/* Aviso de Cobertura Geográfica */}
        <section className="!mb-8 !pt-0 !pb-0">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-5 md:p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                  Importante: Cobertura de Atendimento
                </h3>
                <div className="space-y-3 text-sm md:text-base text-gray-800">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Consultas Presenciais:</p>
                      <p>Disponíveis apenas em <span className="font-bold">Caratinga, Ipatinga e Belo Horizonte/MG</span></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Telemedicina:</p>
                      <p>Válida em <span className="font-bold">todo o território nacional</span></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Package className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Entrega de Lentes:</p>
                      <p>Válida em <span className="font-bold">todo o território nacional</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="!mb-8 !pt-0 !pb-0">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            O que está incluído?
          </h2>
          <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 md:p-8 border border-cyan-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-4">
                  <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <span className="text-base text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Extra Benefits */}
        <section className="!mb-8 !pt-0 !pb-0">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            Por que escolher este plano?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {extraBenefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="!mb-8 !pt-0 !pb-0">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Pronto para começar?
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white">
              Assine agora o Plano Básico e tenha lentes de contato com entrega regular e acompanhamento médico
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={PLAN_PAYMENT_LINKS.basico}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-cyan-600 hover:bg-cyan-50 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Assinar Plano Básico
              </a>
              <Link
                to="/planos"
                className="bg-cyan-800 hover:bg-cyan-900 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Ver Outros Planos
              </Link>
            </div>
          </div>
        </section>
      </main>
      <EnhancedFooter />
    </>
  );
};

export default PlanBasicoPage;
