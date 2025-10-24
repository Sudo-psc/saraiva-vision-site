import React, { useEffect } from 'react';
import { SafeHelmet } from '@/components/SafeHelmet';
import EnhancedFooter from '../components/EnhancedFooter';

const AssinaturaPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SafeHelmet
        title="Assinatura de Lentes de Contato - Saraiva Vision"
        description="Assine seu plano de lentes de contato com acompanhamento médico. Planos a partir de R$99 com entrega em todo o Brasil."
        keywords="assinatura lentes contato, plano lentes, acompanhamento médico, entrega lentes, Saraiva Vision"
        url="https://saraivavision.com.br/assinatura"
      >
        <link rel="canonical" href="https://saraivavision.com.br/assinatura" />
      </SafeHelmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Mobile-first spacing with extra top padding to clear navbar */}
        <div className="flex-1 pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-6 md:pb-10 lg:pb-12">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Header Section - Mobile Optimized */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 px-2">
                  Assinatura de Lentes de Contato
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-2 sm:mb-3 px-4">
                  Planos a partir de R$99 com acompanhamento médico especializado.
                </p>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                  Preencha o formulário abaixo e garanta já sua assinatura com entrega em todo o Brasil.
                </p>
              </div>

              {/* JotForm Iframe Container - Mobile First with Responsive Heights */}
              <div className="relative mb-4 sm:mb-6 md:mb-8 z-10">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl overflow-hidden">
                  <iframe
                    id="JotFormIFrame-252817233384055"
                    title="Assinatura de Lentes de Contato com Acompanhamento Médico | Planos a partir de R$99 | Entrega em Todo o Brasil"
                    onload="window.parent.scrollTo(0,0)"
                    allowtransparency="true"
                    allow="geolocation; microphone; camera; fullscreen; payment"
                    src="https://pci.jotform.com/form/252817233384055"
                    frameborder="0"
                    style={{
                      minHeight: '539px',
                      width: '100%',
                      border: 'none'
                    }}
                    scrolling="no"
                  />
                </div>
              </div>

              {/* Benefits Section - Mobile Optimized */}
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 border-l-4 border-cyan-500 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-md mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <span className="text-2xl sm:text-3xl" role="img" aria-label="Benefícios">✨</span>
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                      Benefícios da assinatura Saraiva Vision:
                    </h3>
                    <ul className="space-y-2 sm:space-y-2.5 text-sm sm:text-base text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 font-bold flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                        <span className="flex-1">Acompanhamento médico periódico com oftalmologista especializado</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 font-bold flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                        <span className="flex-1">Entrega regular das suas lentes no conforto da sua casa</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 font-bold flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                        <span className="flex-1">Lentes de marcas premium com certificação ANVISA</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-600 font-bold flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                        <span className="flex-1">Suporte especializado para tirar suas dúvidas</span>
                      </li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-cyan-200">
                      <p className="text-xs sm:text-sm text-gray-600">
                        <strong className="text-gray-800">Dúvidas sobre a assinatura?</strong> Entre em contato pelo WhatsApp ou telefone:{' '}
                        <a
                          href="tel:+5533998601427"
                          className="font-semibold text-cyan-700 hover:text-cyan-800 underline decoration-cyan-300 hover:decoration-cyan-500 transition-colors inline-block mt-1 sm:mt-0"
                          aria-label="Ligar para (33) 99860-1427"
                        >
                          (33) 99860-1427
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 border-l-4 border-green-500 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-md">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <span className="text-2xl sm:text-3xl" role="img" aria-label="Segurança">🔒</span>
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                      Ambiente Seguro
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      Seus dados estão seguros. Utilizamos criptografia SSL e seguimos as rigorosas diretrizes da LGPD para proteger suas informações pessoais e dados de saúde.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EnhancedFooter />
      </div>

      {/* JotForm Embed Script */}
      <script src='https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js'></script>
      <script dangerouslySetInnerHTML={{
        __html: `window.jotformEmbedHandler("iframe[id='JotFormIFrame-252817233384055']", "https://pci.jotform.com/")`
      }} />
    </>
  );
};

export default AssinaturaPage;