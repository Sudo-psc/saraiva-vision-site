import React, { useEffect, useRef, useState } from 'react';
import { SafeHelmet } from '@/components/SafeHelmet';
import EnhancedFooter from '../components/EnhancedFooter';

const NINSAUDE_URL = 'https://apolo.ninsaude.com/a/saraivavision/';

const AgendamentoPage = () => {
  const iframeRef = useRef(null);
  const [iframeKey] = useState(() => Date.now()); // Stable key prevents re-renders

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prevent parent scroll interference when iframe is focused
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeFocus = () => {
      // Temporarily disable smooth scroll on body when iframe is active
      document.body.style.scrollBehavior = 'auto';
    };

    const handleIframeBlur = () => {
      // Re-enable smooth scroll when iframe loses focus
      document.body.style.scrollBehavior = 'smooth';
    };

    iframe.addEventListener('mouseenter', handleIframeFocus);
    iframe.addEventListener('mouseleave', handleIframeBlur);
    iframe.addEventListener('touchstart', handleIframeFocus, { passive: true });

    return () => {
      iframe.removeEventListener('mouseenter', handleIframeFocus);
      iframe.removeEventListener('mouseleave', handleIframeBlur);
      iframe.removeEventListener('touchstart', handleIframeFocus);
      document.body.style.scrollBehavior = 'smooth';
    };
  }, []);

  return (
    <>
      <SafeHelmet
        title="Agendamento Online - Saraiva Vision"
        description="Agende sua consulta online com o Dr. Philipe Saraiva de forma rápida e prática. Sistema de agendamento integrado Nin Saúde."
        keywords="agendamento online, consulta oftalmologia, Dr. Philipe Saraiva, Nin Saúde, marcar consulta"
        url="https://saraivavision.com.br/agendamento"
      >
        <link rel="canonical" href="https://saraivavision.com.br/agendamento" />
      </SafeHelmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Mobile-first spacing with extra top padding to clear navbar */}
        <div className="flex-1 pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-6 md:pb-10 lg:pb-12">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              {/* Header Section - Mobile Optimized */}
              <div className="text-center mb-4 sm:mb-6 md:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 px-2">
                  Agendamento Online
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-2 sm:mb-3 px-4">
                  Agende sua consulta com o Dr. Philipe Saraiva de forma rápida e segura.
                </p>
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                  Siga o fluxo e, em menos de 2 minutos, sua consulta estará agendada.
                </p>
              </div>

              {/* Iframe Container - Isolated from parent scroll system */}
              <div className="relative mb-4 sm:mb-6 md:mb-8 z-10 ninsaude-iframe-container">
                <div className="bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-xl overflow-hidden">
                  <iframe
                    ref={iframeRef}
                    key={iframeKey}
                    src={NINSAUDE_URL}
                    title="Sistema de Agendamento Online - Saraiva Vision"
                    className="w-full border-0 ninsaude-iframe"
                    style={{
                      // Mobile: 70vh, Tablet: 80vh, Desktop: 86vh
                      height: 'clamp(500px, 70vh, 1035px)',
                      minHeight: '500px',
                      maxHeight: '1035px'
                    }}
                    allowFullScreen
                    loading="eager"
                    referrerPolicy="no-referrer-when-downgrade"
                    allow="payment *; geolocation *; camera *; microphone *; clipboard-write *; clipboard-read *; fullscreen *"
                  />
                </div>
              </div>

              {/* Tips Section - Mobile Optimized */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-l-4 border-blue-500 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-md mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <span className="text-2xl sm:text-3xl" role="img" aria-label="Dica">💡</span>
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                      Dicas para um agendamento rápido:
                    </h3>
                    <ul className="space-y-2 sm:space-y-2.5 text-sm sm:text-base text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                        <span className="flex-1">Tenha em mãos seus dados pessoais (RG, CPF, telefone)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                        <span className="flex-1">Se tiver convênio médico, prepare o número da carteirinha</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5" aria-hidden="true">✓</span>
                        <span className="flex-1">Escolha um horário que seja confortável para você</span>
                      </li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-xs sm:text-sm text-gray-600">
                        <strong className="text-gray-800">Dúvidas?</strong> Entre em contato pelo WhatsApp ou telefone:{' '}
                        <a
                          href="tel:+5533998601427"
                          className="font-semibold text-blue-700 hover:text-blue-800 underline decoration-blue-300 hover:decoration-blue-500 transition-colors inline-block mt-1 sm:mt-0"
                          aria-label="Ligar para (33) 99860-1427"
                        >
                          (33) 99860-1427
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EnhancedFooter />
      </div>
    </>
  );
};

export default AgendamentoPage;
