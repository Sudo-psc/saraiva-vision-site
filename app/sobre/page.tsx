import { Metadata } from 'next';
import SectionWrapper from '@/components/SectionWrapper';
import About from '@/components/About';
import TeamGrid from '@/components/TeamGrid';
import Certificates from '@/components/Certificates';
import ContactSection from '@/components/ContactSection';
import TrustSignals from '@/components/TrustSignals';
import Link from 'next/link';
import { ArrowRight, Award, Building2, Users, Heart, MapPin } from 'lucide-react';
import { teamMembers } from '@/lib/team-data';

export const metadata: Metadata = {
  title: 'Sobre a Saraiva Vision - Clínica Oftalmológica | Caratinga-MG',
  description: 'Conheça a história da Saraiva Vision, clínica oftalmológica referência em Caratinga-MG. Equipe especializada, tecnologia de ponta e 15 anos de cuidado com a saúde ocular.',
  keywords: [
    'sobre Saraiva Vision',
    'clínica oftalmológica Caratinga',
    'Dr. Philipe Saraiva',
    'história clínica oftalmológica',
    'oftalmologista Caratinga-MG',
    'equipe oftalmológica',
    'missão visão valores'
  ],
  openGraph: {
    title: 'Sobre a Saraiva Vision - Clínica Oftalmológica em Caratinga-MG',
    description: 'Conheça nossa história, equipe e compromisso com a saúde ocular há 15 anos em Caratinga-MG.',
    url: 'https://saraivavision.com.br/sobre',
    type: 'website',
    images: [
      {
        url: 'https://saraivavision.com.br/og-sobre.jpg',
        width: 1200,
        height: 630,
        alt: 'Sobre a Saraiva Vision - Clínica Oftalmológica'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre a Saraiva Vision - Clínica Oftalmológica',
    description: 'Conheça nossa história e compromisso com a saúde ocular em Caratinga-MG.',
    images: ['https://saraivavision.com.br/og-sobre.jpg']
  },
  alternates: {
    canonical: 'https://saraivavision.com.br/sobre'
  }
};

// Schema.org structured data for about page
const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: 'Saraiva Vision - Clínica Oftalmológica',
  description: 'Clínica oftalmológica completa em Caratinga-MG, com 15 anos de tradição no cuidado da saúde ocular',
  url: 'https://saraivavision.com.br/sobre',
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
  foundingDate: '2009',
  employee: [
    {
      '@type': 'Person',
      name: 'Dr. Philipe Saraiva',
      jobTitle: 'Oftalmologista',
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Oftalmologista',
        description: 'Médico especialista em oftalmologia'
      }
    }
  ],
  knowsAbout: [
    'Oftalmologia',
    'Saúde Ocular',
    'Cirurgia Oftalmológica',
    'Exames Oftalmológicos',
    'Tratamento Ocular'
  ],
  openingHours: [
    'Mo-Fr 08:00-18:00',
    'Sa 08:00-12:00'
  ],
  slogan: 'Cuidando da sua visão com dedicação e tecnologia',
  areaServed: {
    '@type': 'Place',
    name: 'Caratinga e região'
  }
};

export default function SobrePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <SectionWrapper
          id="sobre-hero"
          background="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50"
          spacing="section-2xl"
          centerContent={true}
          overline="Nossa História"
          title="Há 15 Anos Cuidando da Sua Visão"
          subtitle="A Saraiva Vision nasceu do sonho de oferecer atendimento oftalmológico completo e humanizado para Caratinga e região"
          titleLevel="h1"
          enableAnimations={true}
        >
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-slate-600 text-sm">Anos de Experiência</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-slate-600 text-sm">Pacientes Atendidos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-slate-600 text-sm">Atendimento Humanizado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-slate-600 text-sm">Emergências</div>
            </div>
          </div>
        </SectionWrapper>

        {/* About Component */}
        <About />

        {/* Mission Vision Values */}
        <SectionWrapper
          id="missao-visao-valores"
          background="bg-white"
          spacing="section-lg"
          overline="Nossos Princípios"
          title="Missão, Visão e Valores"
          subtitle="Compromisso com excelência e cuidado humano em cada atendimento"
          centerContent={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500 flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Missão</h3>
              <p className="text-slate-600 leading-relaxed text-center">
                Oferecer atendimento oftalmológico completo e humanizado,
                combinando tecnologia avançada com cuidado pessoal para garantir
                a melhor saúde visual para nossos pacientes.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-500 flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Visão</h3>
              <p className="text-slate-600 leading-relaxed text-center">
                Ser referência em oftalmologia na região, reconhecidos pela
                excelência técnica, atendimento humanizado e compromisso com
                a saúde ocular da comunidade.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Valores</h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Excelência técnica e profissional</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Atendimento humanizado e acolhedor</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Ética e transparência</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Investimento contínuo em tecnologia</span>
                </li>
              </ul>
            </div>
          </div>
        </SectionWrapper>

        {/* Team Section */}
        <SectionWrapper
          id="equipe"
          background="bg-gradient-to-br from-slate-50 to-blue-50/30"
          spacing="section-lg"
          overline="Nossa Equipe"
          title="Profissionais Especializados"
          subtitle="Equipe dedicada e qualificada para oferecer o melhor atendimento oftalmológico"
          centerContent={true}
        >
          <TeamGrid members={teamMembers} />
        </SectionWrapper>

        {/* Structure Section */}
        <SectionWrapper
          id="estrutura"
          background="bg-white"
          spacing="section-lg"
          overline="Nossa Estrutura"
          title="Ambiente Acolhedor e Tecnológico"
          subtitle="Instalações modernas projetadas para seu conforto e segurança"
          centerContent={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Instalações Modernas</h4>
                  <p className="text-slate-600">
                    Espaço planejado para oferecer conforto e acessibilidade,
                    com consultórios equipados e ambiente acolhedor.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Equipamentos de Ponta</h4>
                  <p className="text-slate-600">
                    Tecnologia moderna para diagnósticos precisos e tratamentos
                    eficazes, seguindo os mais altos padrões de qualidade.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">Localização Privilegiada</h4>
                  <p className="text-slate-600">
                    No centro de Caratinga, com fácil acesso, estacionamento
                    próximo e transporte público disponível.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Características</h4>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>3 consultórios equipados</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Sala de exames especializados</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Recepção climatizada</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Acessibilidade completa</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    <span>Estacionamento próximo</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Certifications */}
        <SectionWrapper
          id="certificados"
          background="bg-gradient-to-br from-slate-50 to-blue-50/30"
          spacing="section-lg"
          overline="Qualidade e Confiança"
          title="Nossas Certificações"
          subtitle="Compromisso com a qualidade e segurança dos nossos pacientes"
          centerContent={true}
        >
          <Certificates />
        </SectionWrapper>

        {/* Trust Signals */}
        <SectionWrapper
          id="confianca"
          background="bg-white"
          spacing="section-lg"
          centerContent={true}
        >
          <TrustSignals />
        </SectionWrapper>

        {/* CTA Section */}
        <SectionWrapper
          id="cta-contato"
          background="bg-gradient-to-r from-blue-600 to-cyan-600"
          spacing="section-lg"
          centerContent={true}
          title="Conheça Nossos Serviços"
          subtitle="Agende uma consulta e descubra como podemos cuidar da sua visão"
          titleLevel="h2"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/servicos"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              Nossos Serviços
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/agendamento"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-semibold"
            >
              Agendar Consulta
            </Link>
          </div>
        </SectionWrapper>

        {/* Contact Section */}
        <ContactSection />
      </main>
    </>
  );
}