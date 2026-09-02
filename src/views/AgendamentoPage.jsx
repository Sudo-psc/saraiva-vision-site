import React, { useEffect } from 'react';
import { SafeHelmet } from '@/components/SafeHelmet';
import EnhancedFooter from '../components/EnhancedFooter';
import ClinicClosedNotice from '@/components/ClinicClosedNotice';

const AgendamentoPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SafeHelmet
        title="Clínica encerrada — sem agenda | Saraiva Vision"
        description="A Clínica Saraiva Vision está encerrada / em reforma e não recebe agendamentos. Sem consultas presenciais, online ou por WhatsApp."
        keywords="clínica encerrada, sem agenda, Saraiva Vision, Dr. Philipe Saraiva"
        url="https://saraivavision.com.br/agendamento"
      >
        <link rel="canonical" href="https://saraivavision.com.br/agendamento" />
      </SafeHelmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="flex-1 pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-6 md:pb-10 lg:pb-12">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <ClinicClosedNotice variant="page" />
          </div>
        </div>
        <EnhancedFooter />
      </div>
    </>
  );
};

export default AgendamentoPage;
