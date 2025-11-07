import { useEffect } from 'react';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';
import {
  Bell,
  Gift,
  Crown,
  Calendar,
  Sparkles,
  CheckCircle2,
  Users,
  TrendingUp,
  Mail
} from 'lucide-react';

const WaitlistPage = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://form.jotform.com/jsform/252956707366065';
    script.type = 'text/javascript';
    script.async = true;

    const container = document.getElementById('jotform-container');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container && script.parentNode === container) {
        container.removeChild(script);
      }
    };
  }, []);

  const benefits = [
    {
      icon: Gift,
      title: 'Ofertas Exclusivas',
      description: 'Acesso antecipado a promoções e descontos especiais em serviços e produtos'
    },
    {
      icon: Crown,
      title: 'Prioridade VIP',
      description: 'Seja o primeiro a conhecer novos tratamentos e tecnologias oftalmológicas'
    },
    {
      icon: Calendar,
      title: 'Agendamento Preferencial',
      description: 'Prioridade no agendamento de consultas e procedimentos especializados'
    },
    {
      icon: Sparkles,
      title: 'Conteúdo Exclusivo',
      description: 'Dicas de saúde ocular, artigos científicos e novidades do Dr. Philipe Saraiva'
    }
  ];

  const stats = [
    { icon: Users, value: '2.500+', label: 'Pacientes Atendidos' },
    { icon: TrendingUp, value: '4.9/5', label: 'Avaliação Google' },
    { icon: CheckCircle2, value: '100%', label: 'Satisfação' }
  ];

  return (
    <>
      <SEOHead
        title="SVlentes - Assinatura de lentes de contato com acompanhamento médico em caratinga."
        description="Primeiro plano de assinatura de lentes de contato com acompanhamento médico no brasil. Comodidade e segurança. Frete grátis e entrega garantida."
        canonicalPath="/waitlist"
        keywords="assinatura lentes de contato, lentes de contato caratinga, acompanhamento médico, SVlentes, plano assinatura lentes"
        image="/img/logo_prata.jpeg"
      />

      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50">
        {/* Hero Section */}
        <div className="pt-32 md:pt-36 lg:pt-40 pb-12 mx-[4%] md:mx-[6%] lg:mx-[8%]">
          <div className="max-w-6xl mx-auto">

            {/* Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 px-4 py-2 rounded-full text-sm font-bold mb-4 shadow-md animate-pulse">
                <Crown className="w-4 h-4" />
                <span>Lista VIP Exclusiva</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 via-cyan-900 to-cyan-800 bg-clip-text text-transparent">
                Junte-se à Nossa Lista VIP
              </h1>

              <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-3">
                Receba ofertas exclusivas, descontos especiais e acesso antecipado a novidades
              </p>

              <div className="flex items-center justify-center gap-2 text-cyan-700 font-semibold">
                <Mail className="w-5 h-5" />
                <span className="text-base">100% gratuito • Sem spam • Cancele quando quiser</span>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-cyan-200 text-center">
                    <Icon className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Benefits Grid */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-300 rounded-2xl p-6 md:p-8 shadow-xl mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-cyan-600" />
                  Benefícios Exclusivos
                </h2>
                <p className="text-gray-700">Veja tudo o que você ganha ao se cadastrar</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                          <p className="text-sm text-gray-700 leading-relaxed">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-200">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 px-4 py-2 rounded-full text-sm font-semibold mb-3">
                  <Bell className="w-4 h-4" />
                  <span>Cadastro Rápido • Menos de 1 minuto</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  Preencha seus dados para começar
                </h3>
              </div>

              <div id="jotform-container" className="min-h-[400px]" />
            </div>

            {/* Trust Badges */}
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-md">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                <CheckCircle2 className="w-12 h-12 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">
                    Seus Dados Estão Seguros
                  </h4>
                  <p className="text-gray-700 text-sm">
                    Seguimos rigorosamente a LGPD (Lei Geral de Proteção de Dados) e normas do CFM.
                    Seus dados são criptografados e nunca compartilhados com terceiros.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 text-center">
                Perguntas Frequentes
              </h3>
              <div className="space-y-4 max-w-3xl mx-auto">
                <details className="group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                  <summary className="font-semibold text-gray-900 list-none flex items-center justify-between">
                    <span>📧 Com que frequência receberei e-mails?</span>
                    <span className="text-cyan-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-700 mt-3 text-sm leading-relaxed">
                    Enviamos em média 2-3 e-mails por mês com conteúdo relevante, ofertas exclusivas e novidades.
                    Você pode ajustar suas preferências ou cancelar a qualquer momento.
                  </p>
                </details>

                <details className="group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                  <summary className="font-semibold text-gray-900 list-none flex items-center justify-between">
                    <span>🎁 Quais tipos de ofertas vou receber?</span>
                    <span className="text-cyan-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-700 mt-3 text-sm leading-relaxed">
                    Descontos em consultas, exames e procedimentos, pacotes promocionais de lentes de contato,
                    acesso antecipado a novos tratamentos e tecnologias, e muito mais!
                  </p>
                </details>

                <details className="group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                  <summary className="font-semibold text-gray-900 list-none flex items-center justify-between">
                    <span>🔒 Meus dados estão protegidos?</span>
                    <span className="text-cyan-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-700 mt-3 text-sm leading-relaxed">
                    Sim! Seguimos rigorosamente a LGPD e normas do CFM. Seus dados são criptografados,
                    armazenados de forma segura e nunca compartilhados com terceiros sem seu consentimento.
                  </p>
                </details>

                <details className="group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer">
                  <summary className="font-semibold text-gray-900 list-none flex items-center justify-between">
                    <span>❌ Posso cancelar a inscrição?</span>
                    <span className="text-cyan-600 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="text-gray-700 mt-3 text-sm leading-relaxed">
                    Claro! Você pode cancelar sua inscrição a qualquer momento clicando no link de descadastro
                    presente em todos os nossos e-mails. Sem complicações, sem perguntas.
                  </p>
                </details>
              </div>
            </div>

          </div>
        </div>

        <EnhancedFooter />
      </div>
    </>
  );
};

export default WaitlistPage;
