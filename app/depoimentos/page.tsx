import type { Metadata } from 'next';
import Testimonials from '@/components/Testimonials';
import GoogleReviewsWidget from '@/components/GoogleReviewsWidget';
import UnifiedCTA from '@/components/UnifiedCTA';
import Breadcrumbs from '@/components/Breadcrumbs';
import type { BreadcrumbItem } from '@/types/navigation';

export const metadata: Metadata = {
  title: 'Depoimentos - Saraiva Vision | O que dizem nossos pacientes',
  description:
    'Leia os depoimentos de pacientes satisfeitos com o atendimento da Saraiva Vision. Avaliações reais de consultas oftalmológicas em Caratinga-MG.',
  keywords:
    'depoimentos oftalmologista Caratinga, avaliações Saraiva Vision, testemunhos pacientes oftalmologia, reviews Dr. Philipe Saraiva',
  openGraph: {
    title: 'Depoimentos - Saraiva Vision',
    description: 'Veja o que dizem nossos pacientes sobre o atendimento oftalmológico',
    type: 'website',
  },
};

const breadcrumbItems: BreadcrumbItem[] = [
  { label: 'Início', href: '/' },
  { label: 'Depoimentos', current: true },
];

export default function DepoimentosPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://saraivavision.com.br',
    name: 'Saraiva Vision - Clínica de Oftalmologia',
    image: 'https://saraivavision.com.br/images/logo.png',
    url: 'https://saraivavision.com.br/depoimentos',
    telephone: '+55-33-99860-1427',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Coronel Celestino, 07',
      addressLocality: 'Caratinga',
      addressRegion: 'MG',
      postalCode: '35300-035',
      addressCountry: 'BR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '102',
      bestRating: '5',
      worstRating: '1',
    },
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
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Depoimentos dos Nossos Pacientes
              </h1>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Histórias reais de quem confia na Saraiva Vision para cuidar da saúde ocular
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <Testimonials />

          <div className="mt-16">
            <GoogleReviewsWidget
              maxReviews={6}
              showHeader={true}
              showStats={true}
              showViewAllButton={true}
            />
          </div>

          <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Sua Opinião é Importante
            </h2>
            <p className="text-slate-700 text-lg mb-8 max-w-2xl mx-auto">
              Se você já foi nosso paciente, ajude outras pessoas compartilhando sua experiência.
              Sua avaliação nos motiva a continuar oferecendo o melhor atendimento.
            </p>
            <a
              href="https://g.page/r/PLACEHOLDER/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
            >
              Deixar Avaliação no Google
            </a>
          </div>

          <div className="mt-16">
            <UnifiedCTA variant="default" className="max-w-md mx-auto" />
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">4.9</div>
                  <div className="text-xs text-slate-600">Avaliação</div>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">102+</div>
                  <div className="text-xs text-slate-600">Reviews</div>
                </div>
                <div className="w-px h-12 bg-slate-200"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">98%</div>
                  <div className="text-xs text-slate-600">Satisfação</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
