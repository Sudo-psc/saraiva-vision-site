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
        <div className="flex-1 pt-32 md:pt-40 pb-8">
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

              <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ minHeight: '800px' }}>
                <iframe
                  src="https://apolo.ninsaude.com/a/saraivavision/"
                  title="Sistema de Agendamento Online - Saraiva Vision"
                  className="w-full border-0"
                  style={{
                    height: '100vh',
                    minHeight: '800px',
                    maxHeight: '1200px'
                  }}
                  allowFullScreen
                  loading="eager"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                />
              </div>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  💡 <strong>Dica:</strong> Tenha em mãos seus dados pessoais e informações do convênio (se aplicável)
                </p>
                <p className="mt-2">
                  Em caso de dúvidas, entre em contato conosco pelo WhatsApp ou telefone
                </p>
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
