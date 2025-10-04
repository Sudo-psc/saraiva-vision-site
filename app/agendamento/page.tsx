import type { Metadata } from 'next';
import AppointmentBooking from '@/components/AppointmentBooking';
import Breadcrumbs from '@/components/Breadcrumbs';
import type { BreadcrumbItem } from '@/types/navigation';

export const metadata: Metadata = {
  title: 'Agendar Consulta Online - Saraiva Vision | Oftalmologia em Caratinga-MG',
  description:
    'Agende sua consulta oftalmológica online de forma rápida e segura. Dr. Philipe Saraiva - CRM-MG 72910. Atendimento humanizado em Caratinga-MG.',
  keywords:
    'agendar consulta oftalmologista, agendamento online oftalmologia, consulta olhos Caratinga, Dr. Philipe Saraiva, oftalmologista Caratinga MG',
  openGraph: {
    title: 'Agendar Consulta Online - Saraiva Vision',
    description: 'Agende sua consulta oftalmológica online de forma rápida e segura',
    type: 'website',
  },
};

const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Agendamento', current: true },
];

export default function AgendamentoPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'Saraiva Vision - Clínica de Oftalmologia',
    image: 'https://saraivavision.com.br/images/logo.png',
    '@id': 'https://saraivavision.com.br',
    url: 'https://saraivavision.com.br/agendamento',
    telephone: '+55-33-99860-1427',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Coronel Celestino, 07',
      addressLocality: 'Caratinga',
      addressRegion: 'MG',
      postalCode: '35300-035',
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -19.7891,
      longitude: -42.1347,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '12:00',
      },
    ],
    priceRange: '$$',
    medicalSpecialty: 'Ophthalmology',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 md:py-16">
          <div className="absolute inset-0 bg-[url('/images/pattern-dots.svg')] opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs items={breadcrumbItems} className="mb-4 text-blue-100" />
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Agendar Consulta</h1>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Escolha o melhor horário para sua consulta oftalmológica
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <AppointmentBooking />

          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              Informações Importantes
            </h2>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Chegue com 15 minutos de antecedência</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Traga documento com foto e carteirinha do convênio (se aplicável)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Traga seus óculos ou lentes de contato atuais</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Caso precise remarcar, entre em contato com 24h de antecedência</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 text-center text-sm text-slate-600">
            <p>
              Responsável Técnico: Dr. Philipe Saraiva - CRM-MG 72910
            </p>
            <p className="mt-1">
              Especialista em Oftalmologia - RQE 48932
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
