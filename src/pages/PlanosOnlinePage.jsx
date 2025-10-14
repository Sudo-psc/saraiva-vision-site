import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';
import JotformChatbot from '@/components/JotformChatbot';
import { CheckCircle, Package, Star, Award, Crown, ArrowRight, Wifi, Video } from 'lucide-react';

const PlanosOnlinePage = () => {

  const seoData = {
    title: 'Planos Online de Lentes de Contato | Saraiva Vision',
    description: 'Planos de assinatura de lentes de contato 100% online com telemedicina. Atendimento em todo Brasil com entrega nacional.',
    keywords: 'planos online lentes, telemedicina lentes contato, lentes online Brasil',
    canonicalUrl: 'https://saraivavision.com.br/planosonline',
    ogImage: 'https://saraivavision.com.br/og-image.jpg'
  };

  const plans = [
    {
      id: 'basico-online',
      name: 'Plano Básico Online',
      icon: Package,
      iconColor: 'from-cyan-500 to-cyan-600',
      bgGradient: 'from-cyan-50 to-cyan-100',
      borderColor: 'border-cyan-200',
      price: '12x de R$ 89,00',
      paymentLink: 'https://saraivavision.com.br/pagamentobasicoonline',
      badge: '100% Online',
      badgeColor: 'bg-cyan-100 text-cyan-700',
      description: 'Plano básico de lentes de contato com acompanhamento 100% online via telemedicina.',
      features: [
        '12 pares de lentes gelatinosas asféricas',
        '1 consulta de telemedicina por ano',
        'Acompanhamento médico mensal online',
        'Lembretes mensais de troca',
        'Entrega em casa sem custo adicional',
        'Atendimento em todo o Brasil'
      ],
      highlight: false
    },
    {
      id: 'padrao-online',
      name: 'Plano Padrão Online',
      icon: Star,
      iconColor: 'from-slate-400 via-cyan-400 to-slate-500',
      bgGradient: 'from-slate-50 via-cyan-50 to-slate-100',
      borderColor: 'border-slate-300',
      price: '12x de R$ 119,00',
      paymentLink: 'https://saraivavision.com.br/pagamentopadraoonline',
      badge: 'Mais Popular',
      badgeColor: 'bg-gradient-to-r from-slate-100 to-cyan-100 text-slate-700',
      description: 'Plano completo com lentes premium e acompanhamento online prioritário.',
      features: [
        'Todos os benefícios do Plano Básico',
        '13 pares de lentes gelatinosas premium',
        '2 consultas de telemedicina por ano',
        'Prioridade no agendamento',
        'Frete expresso grátis',
        'Suporte via WhatsApp 24/7'
      ],
      highlight: true
    },
    {
      id: 'premium-online',
      name: 'Plano Premium Online',
      icon: Crown,
      iconColor: 'from-cyan-400 via-slate-300 to-yellow-400',
      bgGradient: 'from-cyan-50 via-slate-50 to-yellow-50',
      borderColor: 'border-slate-300',
      price: '12x de R$ 149,00',
      paymentLink: 'https://saraivavision.com.br/pagamentopremiumonline',
      badge: 'Premium',
      badgeColor: 'bg-gradient-to-r from-cyan-100 via-slate-100 to-yellow-100 text-slate-700',
      description: 'Experiência VIP online com lentes multifocais e atendimento personalizado exclusivo.',
      features: [
        'Todos os benefícios do Plano Padrão',
        '14 pares de lentes premium multifocais',
        '4 consultas de telemedicina por ano',
        'Kit premium de higienização',
        'Atendimento personalizado exclusivo'
      ],
      highlight: false
    }
  ];

  return (
    <>
      <SEOHead {...seoData} />
      <JotformChatbot />
      <main className="min-h-screen pt-32 md:pt-36 lg:pt-40 pb-12 mx-[4%] md:mx-[6%] lg:mx-[8%]">
        {/* Hero Section */}
        <section className="mb-3 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-2 shadow-sm">
            <Wifi className="w-4 h-4" />
            <span>100% Online</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1.5 bg-gradient-to-r from-gray-900 via-cyan-900 to-cyan-800 bg-clip-text text-transparent">
            Planos Online de Lentes de Contato
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-3">
            Atendimento 100% por telemedicina • Válido em todo o Brasil • Sem necessidade de consulta presencial
          </p>
        </section>

        {/* Aviso Online */}
        <section className="mb-5">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-4 md:p-5 shadow-lg">
            <div className="flex items-start gap-3 mb-3">
              <Video className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                  Atendimento 100% Online
                </h3>
                <div className="space-y-2 text-sm md:text-base text-gray-800">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Telemedicina Completa:</p>
                      <p>Todas as consultas e acompanhamentos são realizados por <span className="font-bold">videochamada</span></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Cobertura Nacional:</p>
                      <p>Atendemos <span className="font-bold">todo o território brasileiro</span></p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Package className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Entrega em Todo Brasil:</p>
                      <p>Receba suas lentes em qualquer lugar do país</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Plans Grid */}
        <section className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
            {plans.map((plan) => {
              const IconComponent = plan.icon;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-gradient-to-br ${plan.bgGradient} rounded-2xl p-4 md:p-5 border ${plan.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 ${
                    plan.highlight ? 'ring-2 ring-blue-400 transform scale-105' : ''
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">
                        RECOMENDADO
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${plan.iconColor} rounded-xl flex items-center justify-center shadow-md mb-2`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className={`${plan.badgeColor} px-3 py-1 rounded-full text-xs font-semibold mb-2`}>
                      {plan.badge}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {plan.name}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {plan.description}
                    </p>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {plan.price}
                    </div>
                    <p className="text-xs text-gray-500">ou à vista com desconto</p>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-2">
                        <CheckCircle className={`w-4 h-4 ${
                          plan.id.includes('basico') ? 'text-cyan-600' :
                          plan.id.includes('padrao') ? 'text-slate-600' :
                          'text-cyan-600'
                        } flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <a
                      href={plan.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 w-full text-center ${
                        plan.id.includes('basico')
                          ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800'
                          : plan.id.includes('padrao')
                            ? 'bg-gradient-to-r from-slate-600 via-cyan-600 to-slate-700 hover:from-slate-700 hover:via-cyan-700 hover:to-slate-800 shadow-cyan-200/50'
                            : 'bg-gradient-to-r from-cyan-600 via-slate-600 to-yellow-600 hover:from-cyan-700 hover:via-slate-700 hover:to-yellow-700 shadow-cyan-200/50'
                      } text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                    >
                      Assinar Agora
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-5">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-2xl p-4 md:p-5 text-white shadow-xl">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center justify-center gap-3 text-white">
                <Award className="w-6 h-6 text-white" />
                <span>Por que escolher nossos planos online?</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3">
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Economia de até 50% comparado aos planos presenciais</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Consultas de telemedicina com oftalmologistas</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Atendimento em todo o Brasil</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Lentes premium certificadas pela ANVISA</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Entrega nacional gratuita</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Suporte via WhatsApp e telemedicina</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-cyan-500/30 text-center">
                <p className="text-sm md:text-base text-cyan-100 flex items-center justify-center gap-2">
                  <span className="text-xl">🌐</span>
                  <span>Clínica Saraiva Vision • Atendimento Online • Todo o Brasil</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-5">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
              Perguntas Frequentes
            </h3>
            <div className="space-y-2.5">
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1.5">Como funcionam as consultas online?</h4>
                <p className="text-sm text-gray-600">
                  Todas as consultas são realizadas por videochamada com oftalmologistas especializados. Você pode fazer as consultas de onde estiver, com total comodidade e segurança.
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1.5">Como funciona a entrega?</h4>
                <p className="text-sm text-gray-600">
                  As lentes são entregues mensalmente no seu endereço cadastrado, sem custo adicional de frete para todo o Brasil. Você recebe automaticamente antes de acabar suas lentes atuais.
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1.5">Preciso ir à clínica alguma vez?</h4>
                <p className="text-sm text-gray-600">
                  Não! Os planos online são 100% por telemedicina. Todo o acompanhamento e consultas são feitas online. Se desejar consulta presencial, veja nossos planos tradicionais.
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1.5">Qual a diferença entre os planos online e presenciais?</h4>
                <p className="text-sm text-gray-600">
                  Os planos online oferecem todo atendimento por telemedicina com preços mais acessíveis. Os planos presenciais incluem consultas na clínica em Caratinga, Ipatinga ou Belo Horizonte.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA para planos presenciais */}
        <section className="mb-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-2xl p-4 md:p-5 shadow-lg text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Prefere atendimento presencial?
            </h3>
            <p className="text-gray-600 mb-3">
              Conheça nossos planos com consultas presenciais em Caratinga, Ipatinga e Belo Horizonte
            </p>
            <Link
              to="/planos"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Ver Planos Presenciais
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <EnhancedFooter />
    </>
  );
};

export default PlanosOnlinePage;
