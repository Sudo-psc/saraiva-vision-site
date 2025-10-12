import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { useLensesSEO } from '../hooks/useSEO';
import EnhancedFooter from '../components/EnhancedFooter';
import ContactLenses from '../components/ContactLenses';
import { CheckCircle, Eye, Package, ArrowRight } from 'lucide-react';

const LensesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const seoData = useLensesSEO();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8; // 20% slower
    }
  }, []);

  const adaptationSteps = [
    {
      iconImage: '/icons_social/consulta-aval.jpeg',
      title: 'Consulta de Avaliação',
      description: 'Agendamento com oftalmologista especializado para avaliação completa da sua visão e necessidades.'
    },
    {
      iconImage: '/icons_social/selecao_personal_copy.jpeg',
      title: 'Exames Especializados',
      description: 'Realização de topografia de córnea e testes de adaptação para garantir o ajuste perfeito.'
    },
    {
      iconImage: '/icons_social/consulta-aval.jpeg',
      title: 'Seleção Personalizada',
      description: 'Escolha das lentes ideais com base no seu estilo de vida, necessidades visuais e conforto.'
    },
    {
      iconImage: '/icons_social/regular.jpeg',
      title: 'Treinamento e Orientação',
      description: 'Instrução completa sobre higienização, manuseio correto e cuidados diários com suas lentes.'
    }
  ];

  const subscriptionBenefits = [
    {
      iconImage: '/icons_social/troca_garan.jpeg',
      title: 'Entrega Regular',
      description: 'Receba suas lentes de contato no conforto da sua casa, com periodicidade personalizada.'
    },
    {
      iconImage: '/icons_social/Perplexity 2025-10-10 02.31.25.png',
      title: 'Acompanhamento Médico',
      description: 'Consultas periódicas com oftalmologista para monitorar a saúde ocular e ajustes necessários.'
    },
    {
      iconImage: '/icons_social/frete.jpeg',
      title: 'Frete Incluso',
      description: 'Entrega gratuita em toda Caratinga e região, sem custos adicionais de envio.'
    },
    {
      iconImage: '/icons_social/acompanhamento_med.jpeg',
      title: 'Garantia de Qualidade',
      description: 'Lentes de marcas premium com certificação ANVISA e garantia de procedência.'
    }
  ];

  return (
    <>
      <SEOHead {...seoData} />
      <main className="flex-1 pt-32 md:pt-36 lg:pt-40 mx-[4%] md:mx-[6%] lg:mx-[8%]">
        {/* Hero Section */}
        <section className="!mb-3 !pt-0 !pb-0 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-1.5 shadow-sm">
            <Package className="w-4 h-4" />
            <span>Plano de Assinatura</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-gray-900 via-cyan-900 to-cyan-800 bg-clip-text text-transparent">
            Lentes de Contato com Assinatura
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Praticidade, economia e saúde ocular com acompanhamento especializado
          </p>
        </section>

        {/* Full-width Video Section */}
        <section className="!mb-5 !pt-0 !pb-0">
          <div className="w-full bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              className="w-full h-auto object-cover"
              autoPlay
              loop
              muted
              playsInline
              style={{ maxHeight: '600px' }}
            >
              <source src="/Videos/Hero-12.mp4" type="video/mp4" />
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          </div>
        </section>

        {/* Two Column Layout - Information Only */}
        <section className="!mb-5 !pt-0 !pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
            {/* Left Column - Adaptation Process */}
            <div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-4 md:p-5 border border-cyan-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <span>Processo de Adaptação</span>
                </h3>
                <div className="space-y-2">
                  {adaptationSteps.map((step, index) => (
                    <div key={index} className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-xl p-2.5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0">
                        <img
                          src={step.iconImage}
                          alt={step.title}
                          className="w-9 h-9 rounded-lg object-cover shadow-sm"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-0.5 text-sm md:text-base">{step.title}</h4>
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Subscription Benefits */}
            <div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 md:p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <span>Benefícios da Assinatura</span>
                </h3>
                <div className="space-y-2">
                  {subscriptionBenefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2 bg-white/90 backdrop-blur-sm rounded-xl p-2.5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0">
                        <img
                          src={benefit.iconImage}
                          alt={benefit.title}
                          className="w-9 h-9 rounded-lg object-cover shadow-sm"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-0.5 text-sm md:text-base">{benefit.title}</h4>
                        <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full-width Call to Action - Why Choose Us */}
        <section className="!mb-6 !pt-0 !pb-0">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-2xl p-4 md:p-6 text-white shadow-xl hover:shadow-2xl transition-shadow">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-5 flex items-center justify-center gap-3 text-white">
                <CheckCircle className="w-7 h-7 text-white" />
                <span>Por que escolher a Saraiva Vision?</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Mais de 5 anos de experiência em adaptação de lentes</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Equipe de oftalmologistas especializados</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Marcas premium certificadas pela ANVISA</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Atendimento personalizado e acompanhamento contínuo</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-cyan-500/30 text-center">
                <p className="text-sm md:text-base text-cyan-100 flex items-center justify-center gap-2">
                  <span>Localizado em Caratinga/MG • Atendemos toda a região</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Plans CTA Section */}
        <section className="!mb-6 !pt-0 !pb-0">
          <div className="bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 rounded-2xl p-6 md:p-8 text-center shadow-2xl border-2 border-cyan-400/30 hover:border-cyan-400/50 transition-all">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-cyan-400/20 backdrop-blur-sm text-cyan-200 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Package className="w-5 h-5" />
                <span>Planos de Assinatura</span>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Pronto para começar?
              </h3>

              <p className="text-lg md:text-xl text-cyan-100 mb-6 leading-relaxed">
                Escolha o plano ideal para você e tenha suas lentes de contato com entrega regular,
                acompanhamento médico e muito mais!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => navigate('/planosonline')}
                  className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3 group"
                >
                  <Package className="w-6 h-6" />
                  <span className="text-lg">Ver Planos Disponíveis</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <p className="text-sm text-cyan-200/70 mt-4">
                Pagamento seguro via Asaas • Entrega em toda região
              </p>
            </div>
          </div>
        </section>

        {/* Full-width Contact Lenses Section */}
        <ContactLenses />
      </main>
      <EnhancedFooter />
    </>
  );
};

export default LensesPage;
