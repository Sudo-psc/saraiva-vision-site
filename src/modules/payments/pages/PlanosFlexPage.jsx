import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';
import JotformChatbot from '@/components/JotformChatbot';
import { ArrowLeft, Package, CheckCircle, ArrowRight } from 'lucide-react';

const PlanosFlexPage = () => {
  const seoData = {
    title: 'Planos Flex - Sem Fidelidade | Saraiva Vision',
    description: 'Planos flexíveis de lentes de contato sem fidelidade. Cancele quando quiser, sem burocracia.',
    keywords: 'planos sem fidelidade, lentes contato flexível, planos mensais lentes',
    canonicalUrl: 'https://saraivavision.com.br/planosflex',
    ogImage: 'https://saraivavision.com.br/og-image.jpg'
  };

  useEffect(() => {
    // Load Stripe pricing table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <SEOHead {...seoData} />
      <JotformChatbot />
      <main className="min-h-screen pt-32 md:pt-36 lg:pt-40 pb-12 mx-[4%] md:mx-[6%] lg:mx-[8%]">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            to="/planos"
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Planos Presenciais</span>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="!pt-0 !pb-2 mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-3 shadow-sm">
            <Package className="w-4 h-4" />
            <span>Sem Fidelidade</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 via-cyan-900 to-cyan-800 bg-clip-text text-transparent">
            Planos Presenciais Flex - Sem Fidelidade
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Atendimento presencial em Caratinga • Total flexibilidade • Cancele quando quiser
          </p>
        </section>

        {/* Benefits Section */}
        <section className="!pt-4 !pb-6 mb-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-300 rounded-2xl p-4 md:p-5 shadow-lg">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 text-center">
              Por que escolher o Plano Flex?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Sem Fidelidade</p>
                  <p className="text-sm text-gray-700">Cancele quando quiser, sem multas</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Flexibilidade Total</p>
                  <p className="text-sm text-gray-700">Pause ou retome quando precisar</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Atendimento Presencial</p>
                  <p className="text-sm text-gray-700">Consultas na clínica em Caratinga/MG</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-3">
                <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Entrega em Caratinga e Região</p>
                  <p className="text-sm text-gray-700">Receba suas lentes regularmente</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stripe Pricing Table */}
        <section className="!pt-6 !pb-8 mb-6">
          <div className="max-w-6xl mx-auto">
            <stripe-pricing-table
              pricing-table-id="prctbl_1SLTeeLs8MC0aCdjujaEGM3N"
              publishable-key="pk_live_51OJdAcLs8MC0aCdjQwfyXkqJQRyRw0Au8D5C2BzxN90ekVz0AFEI6PpG0ELGQzJiRZZkWTu4Rj4BcjNZpiyH3LI800SkEiSITH">
            </stripe-pricing-table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="!pt-4 !pb-4 mb-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
              Perguntas Frequentes
            </h3>
            <div className="space-y-2.5">
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1.5">Posso cancelar a qualquer momento?</h4>
                <p className="text-sm text-gray-600">
                  Sim! Não há fidelidade nem taxas de cancelamento. Você pode cancelar seu plano quando quiser através da sua conta.
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1.5">Como funciona o pagamento?</h4>
                <p className="text-sm text-gray-600">
                  O pagamento é processado mensalmente de forma automática. Você pode gerenciar sua assinatura e forma de pagamento a qualquer momento.
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1.5">Qual a diferença entre Flex e os planos anuais?</h4>
                <p className="text-sm text-gray-600">
                  Os planos Flex oferecem total flexibilidade sem fidelidade, mas com valor mensal um pouco maior. Os planos anuais oferecem melhor custo-benefício com compromisso de 12 meses. Ambos incluem atendimento presencial na clínica em Caratinga/MG.
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-1.5">Preciso ir à clínica presencialmente?</h4>
                <p className="text-sm text-gray-600">
                  Sim! Este é um plano presencial. As consultas são realizadas na nossa clínica em Caratinga/MG. Se prefere atendimento 100% online, conheça nossos planos online.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA para planos anuais e online */}
        <section className="mb-6 space-y-2">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-2xl p-4 md:p-5 shadow-lg text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Quer economia maior?
            </h3>
            <p className="text-gray-600 mb-3">
              Nossos planos anuais presenciais oferecem até 30% de desconto com compromisso de 12 meses
            </p>
            <Link
              to="/planos"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Ver Planos Anuais Presenciais
              <Package className="w-4 h-4" />
            </Link>
          </div>

          <div className="max-w-4xl mx-auto bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-4 md:p-5 shadow-lg text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Prefere atendimento 100% online?
            </h3>
            <p className="text-gray-600 mb-3">
              Conheça nossos planos online com consultas por videochamada, válidos em todo o Brasil
            </p>
            <Link
              to="/planosonline"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            >
              Ver Planos Online
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <EnhancedFooter />
    </>
  );
};

export default PlanosFlexPage;
