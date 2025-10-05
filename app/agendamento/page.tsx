import type { Metadata } from 'next';
import AppointmentScheduler from '@/components/scheduling/AppointmentScheduler.next';

export const metadata: Metadata = {
  title: 'Agendamento Online - Clínica Saraiva Vision | Caratinga - MG',
  description: 'Agende sua consulta oftalmológica online na Clínica Saraiva Vision em Caratinga/MG. Sistema rápido, seguro e com horários em tempo real.',
  keywords: ['agendamento online', 'consulta oftalmológica', 'Saraiva Vision', 'Caratinga', 'MG', 'oftalmologista', 'agendar consulta'],
  openGraph: {
    title: 'Agendamento Online - Saraiva Vision',
    description: 'Agende sua consulta oftalmológica de forma rápida e segura na Clínica Saraiva Vision.',
    type: 'website',
    url: 'https://saraivavision.com.br/agendamento',
  },
  alternates: {
    canonical: 'https://saraivavision.com.br/agendamento',
  },
};

export default function AgendamentoPage() {
  return <AppointmentScheduler />;
}
