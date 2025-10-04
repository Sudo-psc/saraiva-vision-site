import { Metadata } from 'next';
import Services from '@/components/Services';
import SectionWrapper from '@/components/SectionWrapper';
import ContactSection from '@/components/ContactSection';
import Link from 'next/link';
import { ArrowRight, Eye, Microscope, Heart, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Serviços Oftalmológicos Completo - Saraiva Vision | Caratinga-MG',
  description: 'Conheça nossos serviços oftalmológicos completos: consultas, exames de refração, cirurgias, tratamentos especializados e acompanhamento pediátrico. Tecnologia de ponta em Caratinga-MG.',
  keywords: [
    'serviços oftalmológicos',
    'exames oftalmológicos',
    'cirurgia ocular',
    'consulta oftalmológica',
    'tratamento oftalmológico',
    'exame de vista',
    'Caratinga-MG',
    'oftalmologista',
    'clínica oftalmológica'
  ],
  openGraph: {
    title: 'Serviços Oftalmológicos Completo - Saraiva Vision',
    description: 'Serviços oftalmológicos completos com tecnologia de ponta em Caratinga-MG. Consultas, exames, cirurgias e tratamentos especializados.',
    url: 'https://saraivavision.com.br/servicos',
    type: 'website',
    images: [
      {
        url: 'https://saraivavision.com.br/og-servicos.jpg',
        width: 1200,
        height: 630,
        alt: 'Serviços Oftalmológicos - Saraiva Vision'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Serviços Oftalmológicos Completo - Saraiva Vision',
    description: 'Serviços oftalmológicos completos com tecnologia de ponta em Caratinga-MG.',
    images: ['https://saraivavision.com.br/og-servicos.jpg']
  },
  alternates: {
    canonical: 'https://saraivavision.com.br/servicos'
  }
};

// Schema.org structured data for services page
const servicesPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: 'Saraiva Vision - Serviços Oftalmológicos',
  description: 'Clínica oftalmológica completa com serviços de consultas, exames, cirurgias e tratamentos especializados',
  url: 'https://saraivavision.com.br/servicos',
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
    name: 'Serviços Oftalmológicos',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'DiagnosticProcedure',
          name: 'Consulta Oftalmológica Completa',
          description: 'Avaliação completa da saúde ocular com exames especializados'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'DiagnosticProcedure',
          name: 'Exames de Refração',
          description: 'Medida da graduação visual para prescrição de óculos e lentes'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'TherapeuticProcedure',
          name: 'Cirurgias Oftalmológicas',
          description: 'Procedimentos cirúrgicos para tratamento de diversas condições oculares'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'MedicalProcedure',
          name: 'Acompanhamento Pediátrico',
          description: 'Avaliação e tratamento oftalmológico para crianças e adolescentes'
        }
      }
    ]
  }
};

export default function ServicosPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesPageSchema) }}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <SectionWrapper
          id="servicos-hero"
          background="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50"
          spacing="section-2xl"
          centerContent={true}
          overline="Nossos Serviços"
          title="Cuidado Oftalmológico Completo"
          subtitle="Oferecemos uma ampla gama de serviços oftalmológicos com tecnologia de ponta para garantir a saúde dos seus olhos"
          titleLevel="h1"
          enableAnimations={true}
        >
          {/* Specialities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/15 via-cyan-500/15 to-teal-500/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Eye className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Consultas</h3>
              <p className="text-slate-600 text-sm">Avaliação completa da saúde ocular</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/15 via-pink-500/15 to-rose-500/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Microscope className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Exames</h3>
              <p className="text-slate-600 text-sm">Diagnóstico preciso com tecnologia avançada</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/15 to-cyan-500/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Tratamentos</h3>
              <p className="text-slate-600 text-sm">Cuidados especializados para cada condição</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/15 to-red-500/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Prevenção</h3>
              <p className="text-slate-600 text-sm">Acompanhamento e cuidados preventivos</p>
            </div>
          </div>
        </SectionWrapper>

        {/* Services Carousel */}
        <Services full={true} autoplay={true} />

        {/* Additional Services Section */}
        <SectionWrapper
          id="servicos-adicionais"
          background="bg-white"
          spacing="section-lg"
          overline="Atendimento Especializado"
          title="Cuidados Para Todas as Idades"
          subtitle="Oferecemos atendimento personalizado para cada fase da vida, desde bebês até idosos"
          centerContent={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-6 mx-auto">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Pediatria</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Triagem visual em recém-nascidos</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Detecção de ambliopia (olho preguiçoso)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Acompanhamento do desenvolvimento visual</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Adaptação de óculos infantis</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center mb-6 mx-auto">
                <Microscope className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Adultos</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Exames de refração completos</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Detecção de glaucoma e catarata</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Tratamento de doenças oculares</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Adaptação de lentes de contato</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-6 mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Seniores</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Acompanhamento de catarata</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Prevenção e tratamento de glaucoma</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Tratamento de degeneração macular</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Reabilitação visual</span>
                </li>
              </ul>
            </div>
          </div>
        </SectionWrapper>

        {/* Technology Section */}
        <SectionWrapper
          id="tecnologia"
          background="bg-gradient-to-br from-slate-50 to-blue-50/30"
          spacing="section-lg"
          overline="Tecnologia Avançada"
          title="Equipamentos de Ponta"
          subtitle="Utilizamos tecnologia moderna para garantir diagnósticos precisos e tratamentos eficazes"
          centerContent={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: 'Biomicroscópio', desc: 'Avaliação detalhada das estruturas oculares anteriores' },
              { name: 'Tonômetro de Aplicação', desc: 'Medida precisa da pressão intraocular' },
              { name: 'Retinógrafo Digital', desc: 'Documentação do fundo de olho em alta resolução' },
              { name: 'Topógrafo Corneano', desc: 'Mapeamento completo da superfície corneana' },
              { name: 'Paquímetro Ultrassônico', desc: 'Medida da espessura corneana' },
              { name: 'Campímetro Computadorizado', desc: 'Avaliação do campo visual periférico' }
            ].map((equipment, index) => (
              <div key={index} className="p-6 bg-white rounded-xl shadow-soft border border-slate-100 hover:shadow-md transition-shadow">
                <h4 className="text-lg font-semibold text-slate-900 mb-2">{equipment.name}</h4>
                <p className="text-slate-600 text-sm">{equipment.desc}</p>
              </div>
            ))}
          </div>
        </SectionWrapper>

        {/* CTA Section */}
        <SectionWrapper
          id="cta-agendamento"
          background="bg-gradient-to-r from-blue-600 to-cyan-600"
          spacing="section-lg"
          centerContent={true}
          title="Agende Sua Consulta"
          subtitle="Cuide da sua visão com quem entende do assunto. Agende sua avaliação hoje mesmo."
          titleLevel="h2"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/agendamento"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              Agendar Online
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contato"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold"
            >
              Fale Conosco
            </Link>
          </div>
        </SectionWrapper>

        {/* Contact Section */}
        <ContactSection />
      </main>
    </>
  );
}