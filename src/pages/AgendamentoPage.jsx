import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import EnhancedFooter from '../components/EnhancedFooter';

const AgendamentoPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Agendamento Online - Saraiva Vision</title>
        <meta name="description" content="Agende sua consulta online com o Dr. Philipe Saraiva de forma rápida e prática. Sistema de agendamento integrado Nin Saúde." />
        <meta name="keywords" content="agendamento online, consulta oftalmologia, Dr. Philipe Saraiva, Nin Saúde, marcar consulta" />
        <link rel="canonical" href="https://saraivavision.com.br/agendamento" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="flex-1 pt-32 md:pt-40 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8 mt-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Agendamento Online
                </h1>
                <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-3">
                  Agende sua consulta com o Dr. Philipe Saraiva de forma rápida e segura.
                </p>
                <p className="text-base text-gray-600 max-w-2xl mx-auto">
                  Siga o fluxo e, em menos de 2 minutos, sua consulta estará agendada.
                </p>
              </div>

              <div className="relative mb-5 z-10">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                  <iframe
                    src="https://apolo.ninsaude.com/a/saraivavision/"
                    title="Sistema de Agendamento Online - Saraiva Vision"
                    className="w-full border-0"
                    style={{
                      height: '75vh',
                      minHeight: '600px',
                      maxHeight: '900px',
                      position: 'relative',
                      zIndex: 10
                    }}
                    allowFullScreen
                    loading="eager"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-top-navigation-by-user-activation"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-md mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-3xl">💡</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Dicas para um agendamento rápido:
                    </h3>
                    <ul className="space-y-2 text-base text-gray-700">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">✓</span>
                        <span>Tenha em mãos seus dados pessoais (RG, CPF, telefone)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">✓</span>
                        <span>Se tiver convênio médico, prepare o número da carteirinha</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">✓</span>
                        <span>Escolha um horário que seja confortável para você</span>
                      </li>
                    </ul>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-sm text-gray-600">
                        <strong>Dúvidas?</strong> Entre em contato conosco pelo WhatsApp ou telefone: 
                        <span className="font-semibold text-blue-700"> (33) 99860-1427</span>
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
