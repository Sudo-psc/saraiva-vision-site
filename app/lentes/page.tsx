import { Metadata } from 'next';
import ContactLenses from '@/components/products/ContactLenses';
import ContactSection from '@/components/ContactSection';
import Link from 'next/link';
import { ArrowRight, Eye, Droplets, Star, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Lentes de Contato - Adaptação e Venda | Saraiva Vision | Caratinga-MG',
  description: 'Especialistas em adaptação de lentes de contato em Caratinga-MG. Marcas premium, teste de tolerância, acompanhamento personalizado. Consultas de adaptação com tecnologia avançada.',
  keywords: [
    'lentes de contato Caratinga',
    'adaptação de lentes de contato',
    'teste de lentes de contato',
    'lentes de contato gelatinosas',
    'lentes de contato rígidas',
    'lentes cosméticas',
    'oftalmologista lentes',
    'clínica lentes de contato'
  ],
  openGraph: {
    title: 'Lentes de Contato - Adaptação Profissional - Saraiva Vision',
    description: 'Especialistas em adaptação de lentes de contato com marcas premium e acompanhamento personalizado em Caratinga-MG.',
    url: 'https://saraivavision.com.br/lentes',
    type: 'website',
    images: [
      {
        url: 'https://saraivavision.com.br/og-lentes.jpg',
        width: 1200,
        height: 630,
        alt: 'Lentes de Contato - Saraiva Vision'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lentes de Contato - Adaptação Profissional',
    description: 'Especialistas em adaptação de lentes de contato com tecnologia avançada.',
    images: ['https://saraivavision.com.br/og-lentes.jpg']
  },
  alternates: {
    canonical: 'https://saraivavision.com.br/lentes'
  }
};

// Schema.org structured data for contact lenses page
const contactLensesPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: 'Saraiva Vision - Lentes de Contato',
  description: 'Especialistas em adaptação e venda de lentes de contato em Caratinga-MG',
  url: 'https://saraivavision.com.br/lentes',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Coronel Celestino, 07',
    addressLocality: 'Caratinga',
    addressRegion: 'MG',
    postalCode: '35300-000',
    addressCountry: 'BR'
  },
  telephone: '+55-33-99860-1427',
  email: 'contato@saraivavision.com.br',
  openingHours: [
    'Mo-Fr 08:00-18:00',
    'Sa 08:00-12:00'
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Serviços de Lentes de Contato',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'MedicalProcedure',
          name: 'Consulta de Adaptação de Lentes de Contato',
          description: 'Avaliação completa para adaptação de lentes de contato'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'MedicalProcedure',
          name: 'Teste de Tolerância',
          description: 'Teste de adaptação e tolerância para diferentes tipos de lentes'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'MedicalProcedure',
          name: 'Acompanhamento Pós-Adaptação',
          description: 'Acompanhamento do uso e adaptação das lentes'
        }
      }
    ]
  },
  specialty: 'Oftalmologia',
  medicalSpecialty: 'Adaptação de Lentes de Contato'
};

export default function LentesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLensesPageSchema) }}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-50 via-cyan-50/30 to-indigo-50/50 py-20 lg:py-32 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-cyan-400/5" aria-hidden="true"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse" aria-hidden="true"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse delay-1000" aria-hidden="true"></div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Eye className="w-4 h-4" />
                Especialistas em Lentes de Contato
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Lentes de Contato
                <span className="block text-blue-600 mt-2">
                  Conforto e Visão Perfeita
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Adaptação profissional de lentes de contato com tecnologia avançada e marcas premium.
                Teste de tolerância e acompanhamento personalizado para sua segurança e conforto.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-8 mb-12">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="text-slate-700 font-medium">Marcas Certificadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-slate-700 font-medium">Avaliação Completa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-cyan-600" />
                  <span className="text-slate-700 font-medium">Teste de Tolerância</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/agendamento"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
                >
                  Agendar Adaptação
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contato"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
                >
                  Falar com Especialista
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Contact Lenses Component */}
        <ContactLenses
          showComparison={true}
          className="py-0"
        />

        {/* Additional Information Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Por Que Escolher Nossos Serviços?
                </h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                  Diferenciais que fazem da Saraiva Vision a melhor escolha para suas lentes de contato
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                  <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center mb-6">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Avaliação Completa</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Exame oftalmológico completo antes da adaptação, garantindo que suas lentes
                    sejam seguras e confortáveis para sua saúde ocular.
                  </p>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Medida da curvatura corneana
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Avaliação do filme lacrimal
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Teste de sensibilidade corneana
                    </li>
                  </ul>
                </div>

                <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500 flex items-center justify-center mb-6">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Segurança Primeiro</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Protocolos rigorosos de higiene e esterilização, seguindo as melhores
                    práticas internacionais para sua proteção.
                  </p>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Equipamentos esterilizados
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Lentes de teste descartáveis
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      Ambiente controlado e limpo
                    </li>
                  </ul>
                </div>

                <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mb-6">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Marcas Premium</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Trabalhamos com as melhores marcas do mercado, todas aprovadas pela ANVISA
                    e com comprovação de qualidade e segurança.
                  </p>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                      Alcon, Johnson & Johnson
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                      Bausch + Lomb, Coopervision
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                      Garantia de origem e qualidade
                    </li>
                  </ul>
                </div>

                <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center mb-6">
                    <Droplets className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Acompanhamento</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">
                    Suporte completo desde a primeira adaptação até o acompanhamento
                    permanente, garantindo seu conforto e saúde ocular.
                  </p>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                      Treinamento de colocação/remoção
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                      Orientação de higiene e cuidados
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                      Retornos programados
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <ContactSection />
      </main>
    </>
  );
}