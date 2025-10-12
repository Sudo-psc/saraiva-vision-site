import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';
import SendPulseChatWidget from '@/components/SendPulseChatWidget';
import { CheckCircle, Package, Star, Award, Crown, ArrowRight, MapPin, AlertCircle } from 'lucide-react';
import { PLAN_PAYMENT_LINKS } from '@/config/plans';

const PlansPage = () => {

  const seoData = {
    title: 'Planos de Assinatura de Lentes de Contato | Saraiva Vision',
    description: 'Conheça nossos planos de assinatura de lentes de contato com entrega regular, acompanhamento médico e frete grátis. Escolha o plano ideal para você.',
    keywords: 'planos lentes de contato, assinatura lentes, lentes mensais, acompanhamento oftalmologista',
    canonicalUrl: 'https://saraivavision.com.br/planos',
    ogImage: 'https://saraivavision.com.br/og-image.jpg'
  };

  const plans = [
    {
      id: 'basico',
      name: 'Plano Básico',
      icon: Package,
      iconColor: 'from-cyan-500 to-cyan-600',
      bgGradient: 'from-cyan-50 to-cyan-100',
      borderColor: 'border-cyan-200',
      price: '12x de R$ 100,00',
      paymentLink: PLAN_PAYMENT_LINKS.basico,
      paymentRoute: '/pagamentobasico',
      internalLink: '/planobasico',
      badge: 'Pioneiro no Brasil',
      badgeColor: 'bg-cyan-100 text-cyan-700',
      description: 'Pioneiro no Brasil, nosso plano básico de assinatura de lentes de contato oferece tudo para você usar suas lentes com segurança e praticidade.',
      features: [
        '12 pares de lentes gelatinosas asféricas',
        '1 consulta por telemedicina',
        '1 consulta presencial com médico',
        'Acompanhamento médico mensal',
        'Lembretes mensais de troca',
        'Entrega em casa sem custo adicional'
      ],
      highlight: false
    },
    {
      id: 'padrao',
      name: 'Plano Padrão',
      icon: Star,
      iconColor: 'from-slate-400 via-cyan-400 to-slate-500',
      bgGradient: 'from-slate-50 via-cyan-50 to-slate-100',
      borderColor: 'border-slate-300',
      price: '12x de R$ 149,99',
      paymentLink: PLAN_PAYMENT_LINKS.padrao,
      paymentRoute: '/pagamentopadrao',
      internalLink: '/planopadrao',
      badge: 'Mais Popular',
      badgeColor: 'bg-gradient-to-r from-slate-100 to-cyan-100 text-slate-700',
      description: 'Nosso plano mais completo com benefícios adicionais para quem busca máximo conforto e acompanhamento profissional.',
      features: [
        'Todos os benefícios do Plano Básico',
        '13 pares de lentes gelatinosas premium',
        '2 consultas presenciais por ano',
        'Consultas de telemedicina ilimitadas',
        'Prioridade no agendamento',
        'Frete expresso grátis'
      ],
      highlight: true
    },
    {
      id: 'premium',
      name: 'Plano Premium',
      icon: Crown,
      iconColor: 'from-cyan-400 via-slate-300 to-yellow-400',
      bgGradient: 'from-cyan-50 via-slate-50 to-yellow-50',
      borderColor: 'border-slate-300',
      price: '12x de R$ 179,99',
      paymentLink: PLAN_PAYMENT_LINKS.premium,
      paymentRoute: '/pagamentopremium',
      internalLink: '/planopremium',
      badge: 'Premium',
      badgeColor: 'bg-gradient-to-r from-cyan-100 via-slate-100 to-yellow-100 text-slate-700',
      description: 'Experiência VIP com as melhores lentes e atendimento personalizado exclusivo para você e sua família.',
      features: [
        'Todos os benefícios do Plano Padrão',
        '14 pares de lentes premium multifocais',
        '2 consultas presenciais por ano',
        'Telemedicina com prioridade',
        'Exames complementares inclusos',
        'Kit premium de higienização'
      ],
      highlight: false
    }
  ];

  return (
    <>
      <SEOHead {...seoData} />
      <SendPulseChatWidget />
      <main className="min-h-screen pt-32 md:pt-36 lg:pt-40 pb-16 mx-[4%] md:mx-[6%] lg:mx-[8%]">
        {/* Hero Section */}
        <section className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-1.5 shadow-sm">
            <Package className="w-4 h-4" />
            <span>Planos de Assinatura</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-gray-900 via-cyan-900 to-cyan-800 bg-clip-text text-transparent">
            Escolha o Plano Ideal Para Você
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Lentes de contato com entrega regular, acompanhamento médico e economia garantida
          </p>
        </section>

        {/* Plans Grid */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
            {plans.map((plan) => {
              const IconComponent = plan.icon;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-gradient-to-br ${plan.bgGradient} rounded-2xl p-5 md:p-6 border ${plan.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 ${plan.highlight ? 'ring-2 ring-blue-400 transform scale-105' : ''
                    }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">
                        RECOMENDADO
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${plan.iconColor} rounded-xl flex items-center justify-center shadow-md mb-3`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <span className={`${plan.badgeColor} px-3 py-1 rounded-full text-xs font-semibold mb-2`}>
                      {plan.badge}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {plan.name}
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">
                      {plan.description}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {plan.price}
                    </div>
                    {plan.price !== 'Sob Consulta' && (
                      <p className="text-xs text-gray-500">ou à vista com desconto</p>
                    )}
                  </div>

                  <div className="space-y-2.5 mb-5">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-2.5">
                        <CheckCircle className={`w-4 h-4 ${plan.id === 'basico' ? 'text-cyan-600' :
                            plan.id === 'padrao' ? 'text-slate-600' :
                              'text-cyan-600'
                          } flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2.5">
                    <Link
                      to={plan.internalLink}
                      className={`flex items-center justify-center gap-2 w-full text-center ${plan.id === 'basico'
                          ? 'bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-700 hover:from-cyan-200 hover:to-cyan-300'
                          : plan.id === 'padrao'
                            ? 'bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:via-cyan-200 hover:to-slate-300'
                            : 'bg-gradient-to-r from-cyan-100 via-slate-100 to-yellow-100 text-slate-700 hover:from-cyan-200 hover:via-slate-200 hover:to-yellow-200'
                        } font-semibold py-3 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300`}
                    >
                      Saiba Mais
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      to={plan.paymentRoute}
                      className={`block w-full text-center ${plan.id === 'basico'
                          ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800'
                          : plan.id === 'padrao'
                            ? 'bg-gradient-to-r from-slate-600 via-cyan-600 to-slate-700 hover:from-slate-700 hover:via-cyan-700 hover:to-slate-800 shadow-cyan-200/50'
                            : 'bg-gradient-to-r from-cyan-600 via-slate-600 to-yellow-600 hover:from-cyan-700 hover:via-slate-700 hover:to-yellow-700 shadow-cyan-200/50'
                        } text-white font-semibold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                    >
                      Assinar Agora
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Aviso de Cobertura Geográfica */}
        <section className="mb-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-2xl p-5 md:p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
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

        {/* CTA para Planos Online */}
        <section className="mb-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                <Package className="w-5 h-5" />
                <span>100% ONLINE</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                Está Fora de MG? Conheça Nossos Planos 100% Online!
              </h3>
              <p className="text-gray-700 mb-5 leading-relaxed">
                Telemedicina ilimitada + Entrega em todo Brasil + Preços mais acessíveis
              </p>
              <Link
                to="/planosonline"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Ver Planos Online
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-6">
          <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-2xl p-5 md:p-6 text-white shadow-xl">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-5 flex items-center justify-center gap-3 text-white">
                <Award className="w-7 h-7 text-white" />
                <span>Por que escolher nossos planos?</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Economia de até 40% comparado à compra avulsa</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Acompanhamento médico especializado incluído</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Entrega regular sem preocupação</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Lentes premium certificadas pela ANVISA</span>
                </div>
                <div className="flex items-start gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <CheckCircle className="w-5 h-5 text-cyan-200 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base">Suporte via WhatsApp e telemedicina</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-cyan-500/30 text-center">
                <p className="text-sm md:text-base text-cyan-100 flex items-center justify-center gap-2">
                  <span className="text-xl">📍</span>
                  <span>Clínica Saraiva Vision • Caratinga/MG • Atendemos toda a região</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-8">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 text-center">
              Perguntas Frequentes
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Como funciona a entrega?</h4>
                <p className="text-sm text-gray-600">
                  As lentes são entregues mensalmente no seu endereço cadastrado, sem custo adicional de frete para Caratinga e região. Você recebe automaticamente antes de acabar suas lentes atuais.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">As consultas estão incluídas?</h4>
                <p className="text-sm text-gray-600">
                  Sim! Todos os planos incluem consultas de acompanhamento com oftalmologista, tanto presenciais quanto por telemedicina, para garantir a saúde dos seus olhos.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Qual a diferença entre os planos?</h4>
                <p className="text-sm text-gray-600">
                  A principal diferença está na quantidade de lentes, frequência de consultas e benefícios adicionais. O Plano Premium oferece mais consultas, atendimento prioritário e descontos em outros serviços.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <EnhancedFooter />
    </>
  );
};

export default PlansPage;
