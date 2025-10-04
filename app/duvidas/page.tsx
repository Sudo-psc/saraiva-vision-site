import type { Metadata } from 'next';
import FAQ from '@/components/FAQ';
import NewsletterSignup from '@/components/NewsletterSignup';
import ShareButtons from '@/components/ShareButtons';
import Breadcrumbs from '@/components/Breadcrumbs';
import type { BreadcrumbItem } from '@/types/navigation';

export const metadata: Metadata = {
  title: 'Dúvidas Frequentes - Saraiva Vision | Perguntas sobre Oftalmologia',
  description:
    'Tire suas dúvidas sobre consultas, exames e tratamentos oftalmológicos. Respostas de especialistas em saúde ocular em Caratinga-MG.',
  keywords:
    'dúvidas oftalmologia, perguntas oftalmologista, FAQ consulta olhos, exames oftalmológicos Caratinga, consulta oftalmológica dúvidas',
  openGraph: {
    title: 'Dúvidas Frequentes - Saraiva Vision',
    description: 'Encontre respostas para suas perguntas sobre saúde ocular e oftalmologia',
    type: 'website',
  },
};

const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Dúvidas Frequentes', current: true },
];

export default function DuvidasPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Vocês atendem convênio ou particular?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Atendemos os convênios Amor e Saúde e Sindicato, além de atendimento particular. Caso não possua um desses convênios, o atendimento é realizado de forma particular com valores acessíveis.',
        },
      },
      {
        '@type': 'Question',
        name: 'Que tipos de exames oftalmológicos vocês realizam?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Realizamos uma ampla gama de exames oftalmológicos, incluindo: exame de refração, exame de fundo de olho, tonometria (pressão ocular), biomicroscopia, campimetria visual, retinografia, ecobiometria, paquimetria e outros exames especializados.',
        },
      },
      {
        '@type': 'Question',
        name: 'Atendem crianças e fazem exames pediátricos?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, temos especialização em oftalmologia pediátrica. Realizamos exames oftalmológicos em bebês, crianças e adolescentes utilizando técnicas específicas para cada idade.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como funciona o agendamento online?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nosso sistema de agendamento online está disponível 24 horas por dia. Você pode escolher o tipo de consulta, selecionar data e horário disponíveis, e receber confirmação instantânea.',
        },
      },
    ],
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
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Dúvidas Frequentes</h1>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Encontre respostas para as perguntas mais comuns sobre nossos serviços
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div>
              <FAQ />

              <div className="mt-16 bg-blue-50 border border-blue-200 rounded-xl p-6 md:p-8">
                <h2 className="text-xl font-bold text-blue-900 mb-4">
                  Ainda tem dúvidas?
                </h2>
                <p className="text-blue-800 mb-6">
                  Nossa equipe está pronta para ajudar você. Entre em contato através dos
                  nossos canais de atendimento.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://wa.me/5533998601427?text=Olá!%20Tenho%20uma%20dúvida"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href="tel:+553398601427"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Ligar
                  </a>
                </div>
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <ShareButtons
                  title="Dúvidas Frequentes - Saraiva Vision"
                  className="mb-6"
                />

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-bold mb-3">Agende sua Consulta</h3>
                  <p className="text-sm text-blue-100 mb-4">
                    Marque um horário conveniente para você
                  </p>
                  <a
                    href="/agendamento"
                    className="block text-center px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Agendar Agora
                  </a>
                </div>

                <div className="bg-slate-100 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">
                    Atendimento
                  </h3>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div>
                      <div className="font-semibold">Segunda a Sexta</div>
                      <div>8h às 18h</div>
                    </div>
                    <div>
                      <div className="font-semibold">Sábado</div>
                      <div>8h às 12h</div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="mt-16">
            <NewsletterSignup
              title="Receba dicas de saúde ocular"
              subtitle="Junte-se a mais de 5.000 pessoas que recebem conteúdo exclusivo sobre cuidados com a visão"
            />
          </div>
        </div>
      </div>
    </>
  );
}
