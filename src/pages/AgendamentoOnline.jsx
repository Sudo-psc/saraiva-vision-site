import { Helmet } from 'react-helmet-async';
import AppointmentScheduler from '@/components/scheduling/AppointmentScheduler';
import { Toaster } from '@/components/ui/toaster';

export default function AgendamentoOnline() {
  return (
    <>
      <Helmet>
        <title>Agendamento Online - Clínica Saraiva Vision | Caratinga - MG</title>
        <meta
          name="description"
          content="Agende sua consulta oftalmológica online na Clínica Saraiva Vision em Caratinga/MG. Sistema rápido, seguro e com horários em tempo real."
        />
        <meta
          name="keywords"
          content="agendamento online, consulta oftalmológica, Saraiva Vision, Caratinga, MG, oftalmologista, agendar consulta"
        />
        <meta property="og:title" content="Agendamento Online - Saraiva Vision" />
        <meta
          property="og:description"
          content="Agende sua consulta oftalmológica de forma rápida e segura na Clínica Saraiva Vision."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://saraivavision.com.br/agendamento" />
        <link rel="canonical" href="https://saraivavision.com.br/agendamento" />
      </Helmet>

      <div className="min-h-screen">
        <AppointmentScheduler />
        <Toaster />
      </div>
    </>
  );
}
