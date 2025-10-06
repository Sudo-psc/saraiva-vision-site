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

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
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

              <div className="relative mb-5">
                {/* Fundo 3D com gradiente e sombras */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 rounded-3xl transform rotate-1 opacity-90 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-600 rounded-3xl transform -rotate-1 opacity-80 blur-md"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-blue-500 to-indigo-600 rounded-3xl transform rotate-0.5 opacity-70 blur-lg"></div>

                {/* Container principal com efeito 3D */}
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden transform perspective-1000 hover:scale-[1.02] transition-all duration-300 ease-in-out">
                  {/* Efeito de borda 3D */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl opacity-20 blur-xl animate-pulse"></div>

                  {/* Sombra profunda 3D */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-gray-800 via-gray-900 to-black rounded-3xl opacity-30 blur-2xl transform translate-y-8"></div>

                  {/* Iframe com evidenciação 3D */}
                  <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-2 transform translate-y-[-4px]">
                    <div className="bg-white rounded-2xl shadow-inner overflow-hidden">
                      <iframe
                        src="https://apolo.ninsaude.com/a/saraivavision/"
                        title="Sistema de Agendamento Online - Saraiva Vision"
                        className="w-full border-0 rounded-2xl"
                        style={{
                          height: '75vh',
                          minHeight: '600px',
                          maxHeight: '900px',
                          boxShadow: 'inset 0 4px 20px rgba(0, 0, 0, 0.1)'
                        }}
                        allowFullScreen
                        loading="eager"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                      />
                    </div>
                  </div>

                  {/* Efeito de brilho nas bordas */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-y-12"></div>
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
