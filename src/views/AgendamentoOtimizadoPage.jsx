import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import EnhancedFooter from '@/components/EnhancedFooter';
import ClinicClosedNotice from '@/components/ClinicClosedNotice';

const AgendamentoOtimizadoPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Clínica encerrada — sem agenda | Saraiva Vision</title>
        <meta
          name="description"
          content="A Clínica Saraiva Vision está encerrada / em reforma e não recebe agendamentos."
        />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="flex-1 pt-28 sm:pt-32 pb-12">
          <div className="container mx-auto px-4">
            <ClinicClosedNotice variant="page" />
          </div>
        </div>
        <EnhancedFooter />
      </div>
    </>
  );
};

export default AgendamentoOtimizadoPage;
