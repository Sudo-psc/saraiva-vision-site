import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';

import { CheckCircle, Package, Star, Award, Crown, ArrowRight, MapPin, AlertCircle } from 'lucide-react';
import { PLAN_PAYMENT_LINKS } from '@/config/plans';
import { usePlansSEO } from '@/hooks/useSEO';

const PlansPage = () => {

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
        '1 consulta online',
        '1 consulta presencial com médico',
        'Acompanhamento médico mensal',
        '1 exame de topografia e meibografia incluídos por ano',
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
        'Consultas online incluídas',
        '1 exame de topografia e meibografia incluídos por ano',
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
        'Consultas online com prioridade',
        '1 exame de topografia e meibografia incluídos por ano',
        'Exames complementares inclusos',
        'Kit premium de higienização'
      ],
      highlight: false
    }
  ];

  const seoData = usePlansSEO(plans);

  return (
    <>
      <SEOHead {...seoData} />

      <main className="min-h-screen pt-24 md:pt-32 lg:pt-40 pb-16 px-4 md:px-[6%] lg:px-[8%]">
        {/* Hero Section */}
        <section className="!mb-0 !pb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-1.5 shadow-sm">
            <Package className="w-4 h-4" />
            <span>Planos de Assinatura</span>
          </div>
          <h1 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-gray-900 via-cyan-900 to-cyan-800 bg-clip-text text-transparent">
            Escolha o Plano Ideal Para Você
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-3">
            Lentes de contato com entrega regular, acompanhamento médico e economia garantida
          </p>
        </section>

        {/* Plans Grid */}
        <section className="!pt-0 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 mt-8">
            {plans.map((plan) => {
              const IconComponent = plan.icon;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-gradient-to-br ${plan.bgGradient} rounded-2xl p-5 md:p-6 border ${plan.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 ${plan.highlight ? 'ring-2 ring-blue-400 lg:transform lg:scale-105' : ''
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
        <section className="!py-4 mb-4">
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
                      <p className="font-semibold text-gray-900">Consultas Online:</p>
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
        <section className="!py-4 mb-4">
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
                Consultas online + Entrega em todo Brasil + Preços mais acessíveis
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
        <section className="!py-4 mb-4">
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
                  <span className="text-sm md:text-base">Suporte via WhatsApp e consultas online</span>
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

        {/* SEO Content Section - Long-tail Keywords */}
        <section className="!py-4 mb-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-200">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Qual o Melhor Plano de Lentes de Contato Para Você?
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-3 leading-relaxed">
                Escolher o <strong>plano de assinatura de lentes de contato</strong> ideal depende das suas necessidades visuais e estilo de vida.
                Na <strong>Saraiva Vision em Caratinga/MG</strong>, oferecemos três opções: <strong>Básico (R$ 100/mês)</strong>,
                <strong> Padrão (R$ 149,99/mês)</strong> e <strong>Premium (R$ 179,99/mês)</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div className="bg-cyan-50 rounded-xl p-3 border border-cyan-200">
                  <h4 className="font-bold text-gray-900 mb-1.5 text-sm">Plano Básico</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Ideal para <strong>iniciantes</strong> ou uso eventual. Inclui 12 pares de <strong>lentes gelatinosas</strong>,
                    1 consulta presencial e acompanhamento online mensal.
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-300">
                  <h4 className="font-bold text-gray-900 mb-1.5 text-sm">Plano Padrão</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Mais escolhido! <strong>13 pares de lentes premium</strong>, 2 consultas presenciais/ano,
                    prioridade no agendamento e <strong>frete expresso grátis</strong>.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 via-slate-50 to-yellow-50 rounded-xl p-3 border border-slate-300">
                  <h4 className="font-bold text-gray-900 mb-1.5 text-sm">Plano Premium</h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Experiência VIP com <strong>14 pares de lentes multifocais</strong>, exames complementares inclusos
                    e <strong>kit premium de higienização</strong>.
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mt-4 mb-3 leading-relaxed text-sm">
                Todos os planos incluem: <strong>entrega mensal gratuita em Caratinga e região</strong>, consultas com
                <strong> oftalmologista especializado</strong>, lembretes de troca e garantia de <strong>lentes certificadas ANVISA</strong>.
                Compare os preços e benefícios acima e escolha o plano ideal para suas necessidades!
              </p>
            </div>
          </div>
        </section>

        {/* CTA para planos flex (sem fidelidade) */}
        <section className="mb-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-4 md:p-5 shadow-lg text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Prefere planos sem fidelidade?
            </h3>
            <p className="text-gray-600 mb-3">
              Conheça nossos planos presenciais flex: cancele quando quiser, sem multas ou burocracia
            </p>
            <Link
              to="/planosflex"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Ver Planos Sem Fidelidade
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="!py-4 mb-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 text-center">
              Perguntas Frequentes sobre Planos de Lentes de Contato
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Como funciona a entrega das lentes de contato?</h4>
                <p className="text-sm text-gray-600">
                  As lentes são entregues mensalmente no seu endereço cadastrado, sem custo adicional de frete para Caratinga e região. Você recebe automaticamente antes de acabar suas lentes atuais.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">As consultas oftalmológicas estão incluídas no plano?</h4>
                <p className="text-sm text-gray-600">
                  Sim! Todos os planos incluem consultas de acompanhamento com oftalmologista, tanto presenciais quanto online, para garantir a saúde dos seus olhos.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Qual a diferença entre os planos Básico, Padrão e Premium?</h4>
                <p className="text-sm text-gray-600">
                  A principal diferença está na quantidade de lentes (12, 13 ou 14 pares), frequência de consultas presenciais, prioridade no agendamento e benefícios adicionais como kit de higienização premium no plano Premium.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Posso cancelar minha assinatura a qualquer momento?</h4>
                <p className="text-sm text-gray-600">
                  O plano tem duração de 12 meses com parcelamento mensal. As condições de cancelamento antecipado variam conforme o plano escolhido. Entre em contato para mais detalhes.
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">As lentes são certificadas pela ANVISA?</h4>
                <p className="text-sm text-gray-600">
                  Sim, trabalhamos exclusivamente com lentes de marcas premium certificadas pela ANVISA, garantindo qualidade, segurança e procedência dos produtos.
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
