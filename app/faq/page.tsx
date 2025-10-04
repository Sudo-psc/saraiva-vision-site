import { Metadata } from 'next';
import FAQ from '@/components/FAQ';
import SectionWrapper from '@/components/SectionWrapper';
import ContactSection from '@/components/ContactSection';
import Link from 'next/link';
import { ArrowRight, HelpCircle, Search, Calendar, Clock, Phone, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ - Perguntas Frequentes | Saraiva Vision | Caratinga-MG',
  description: 'Encontre respostas para as dúvidas mais comuns sobre serviços oftalmológicos, consultas, exames, cirurgias e lentes de contato. Tudo que você precisa saber sobre a Saraiva Vision.',
  keywords: [
    'FAQ oftalmologia',
    'perguntas frequentes oftalmologista',
    'dúvidas consulta oftalmológica',
    'exames oftalmológicos dúvidas',
    'cirurgia ocular perguntas',
    'lentes de contato dúvidas',
    'Saraiva Vision FAQ',
    'oftalmologista Caratinga'
  ],
  openGraph: {
    title: 'FAQ - Perguntas Frequentes - Saraiva Vision',
    description: 'Encontre respostas para todas as suas dúvidas sobre serviços oftalmológicos em Caratinga-MG.',
    url: 'https://saraivavision.com.br/faq',
    type: 'website',
    images: [
      {
        url: 'https://saraivavision.com.br/og-faq.jpg',
        width: 1200,
        height: 630,
        alt: 'FAQ - Saraiva Vision'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ - Perguntas Frequentes - Saraiva Vision',
    description: 'Encontre respostas para suas dúvidas sobre oftalmologia em Caratinga-MG.',
    images: ['https://saraivavision.com.br/og-faq.jpg']
  },
  alternates: {
    canonical: 'https://saraivavision.com.br/faq'
  }
};

// Schema.org structured data for FAQ page
const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  name: 'FAQ - Saraiva Vision',
  description: 'Perguntas frequentes sobre serviços oftalmológicos',
  url: 'https://saraivavision.com.br/faq',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Vocês atendem convênio ou particular?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Atendemos os convênios Amor e Saúde e Sindicato, além de atendimento particular. Caso não possua um desses convênios, o atendimento é realizado de forma particular com valores acessíveis.'
      }
    },
    {
      '@type': 'Question',
      name: 'Que tipos de exames oftalmológicos vocês realizam?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Realizamos uma ampla gama de exames oftalmológicos, incluindo: exame de refração, exame de fundo de olho, tonometria, biomicroscopia, campimetria visual, retinografia, ecobiometria, paquimetria e outros exames especializados.'
      }
    },
    {
      '@type': 'Question',
      name: 'Atendem crianças e fazem exames pediátricos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim, temos especialização em oftalmologia pediátrica. Realizamos exames oftalmológicos em bebês, crianças e adolescentes utilizando técnicas específicas para cada idade.'
      }
    },
    {
      '@type': 'Question',
      name: 'Fazem cirurgias oftalmológicas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sim, realizamos diversos tipos de cirurgias oftalmológicas, incluindo cirurgia de catarata, cirurgia de pterígio, cirurgias de pálpebras, e outros procedimentos.'
      }
    },
    {
      '@type': 'Question',
      name: 'Como funciona o agendamento online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nosso sistema de agendamento online está disponível 24 horas por dia. Você pode escolher o tipo de consulta, selecionar data e horário disponíveis, e receber confirmação instantânea.'
      }
    }
  ],
  publisher: {
    '@type': 'MedicalClinic',
    name: 'Saraiva Vision',
    url: 'https://saraivavision.com.br',
    telephone: '+55-33-99860-1427',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua Coronel Celestino, 07',
      addressLocality: 'Caratinga',
      addressRegion: 'MG',
      postalCode: '35300-000',
      addressCountry: 'BR'
    }
  }
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <SectionWrapper
          id="faq-hero"
          background="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50"
          spacing="section-2xl"
          centerContent={true}
          overline="Central de Ajuda"
          title="Perguntas Frequentes"
          subtitle="Encontre respostas rápidas para as dúvidas mais comuns sobre nossos serviços oftalmológicos"
          titleLevel="h1"
          enableAnimations={true}
        >
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">50+</div>
              <div className="text-slate-600 text-sm">Perguntas Respondidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-slate-600 text-sm">Suporte Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">15+</div>
              <div className="text-slate-600 text-sm">Anos de Experiência</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-slate-600 text-sm">Pacientes Atendidos</div>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link
              href="/agendamento"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Calendar className="w-5 h-5" />
              Agendar Consulta
            </Link>
            <Link
              href="https://wa.me/5533998601427"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </Link>
            <Link
              href="tel:+5533998601427"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
            >
              <Phone className="w-5 h-5" />
              Ligar Agora
            </Link>
          </div>
        </SectionWrapper>

        {/* Categories Navigation */}
        <SectionWrapper
          id="faq-categories"
          background="bg-white"
          spacing="section-lg"
          overline="Navegue por Categoria"
          title="Tópicos Mais Buscados"
          subtitle="Encontre rapidamente o que procura por categorias organizadas"
          centerContent={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: Calendar,
                title: 'Agendamento',
                description: 'Como marcar consultas, horários, cancelamentos',
                count: 8
              },
              {
                icon: HelpCircle,
                title: 'Consultas',
                description: 'Tipos de consultas, o que esperar, preparo',
                count: 12
              },
              {
                icon: Search,
                title: 'Exames',
                description: 'Tipos de exames, preparação, resultados',
                count: 15
              },
              {
                icon: Clock,
                title: 'Cirurgias',
                description: 'Procedimentos, preparo, recuperação',
                count: 10
              },
              {
                icon: HelpCircle,
                title: 'Lentes de Contato',
                description: 'Adaptação, tipos, cuidados, preços',
                count: 7
              },
              {
                icon: Calendar,
                title: 'Convênios',
                description: 'Planos aceitos, cobertura, autorizações',
                count: 5
              },
              {
                icon: HelpCircle,
                title: 'Pediatria',
                description: 'Atendimento infantil, exames, cuidados',
                count: 6
              },
              {
                icon: Search,
                title: 'Prevenção',
                description: 'Cuidados, sintomas, quando procurar',
                count: 9
              }
            ].map((category, index) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.title}
                  className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 text-left group"
                  onClick={() => {
                    const element = document.getElementById('faq-main');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                      {category.count} perguntas
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>
        </SectionWrapper>

        {/* Main FAQ Component */}
        <section id="faq-main" className="py-0">
          <FAQ />
        </section>

        {/* Additional Help Section */}
        <SectionWrapper
          id="faq-additional-help"
          background="bg-gradient-to-br from-blue-50 to-indigo-50/50"
          spacing="section-lg"
          overline="Ainda com Dúvidas?"
          title="Canais de Atendimento"
          subtitle="Entre em contato conosco através de diversos canais para esclarecer qualquer dúvida"
          centerContent={true}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">WhatsApp</h3>
              <p className="text-slate-600 mb-6">
                Resposta rápida durante o horário comercial. Tire dúvidas e agende consultas.
              </p>
              <Link
                href="https://wa.me/5533998601427"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                Iniciar Conversa
              </Link>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Telefone</h3>
              <p className="text-slate-600 mb-6">
                Fale diretamente com nossa equipe. Atendimento de segunda a sábado.
              </p>
              <Link
                href="tel:+5533998601427"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Phone className="w-5 h-5" />
                (33) 99860-1427
              </Link>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Agendamento Online</h3>
              <p className="text-slate-600 mb-6">
                Escolha data e horário disponíveis 24/7. Confirmação imediata.
              </p>
              <Link
                href="/agendamento"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Calendar className="w-5 h-5" />
                Agendar Agora
              </Link>
            </div>
          </div>
        </SectionWrapper>

        {/* Office Hours Section */}
        <SectionWrapper
          id="faq-office-hours"
          background="bg-white"
          spacing="section-lg"
          centerContent={true}
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
              Horário de Atendimento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Consultas e Exames</h3>
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Segunda a Sexta</span>
                    <span className="font-medium text-slate-900">08:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sábado</span>
                    <span className="font-medium text-slate-900">08:00 - 12:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domingo</span>
                    <span className="font-medium text-slate-500">Fechado</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 border border-red-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Emergências</h3>
                <div className="space-y-3 text-slate-600">
                  <p className="text-sm leading-relaxed">
                    Para emergências oftalmológicas, estamos disponíveis 24 horas por contato telefônico.
                  </p>
                  <Link
                    href="tel:+5533998601427"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    Emergência: (33) 99860-1427
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Location Section */}
        <SectionWrapper
          id="faq-location"
          background="bg-gradient-to-br from-slate-50 to-blue-50/30"
          spacing="section-lg"
          overline="Onde Estamos"
          title="Localização e Acesso"
          subtitle="Venha nos visitar em nossa clínica no centro de Caratinga"
          centerContent={true}
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Endereço</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Rua Coronel Celestino, 07<br />
                    Centro - Caratinga, MG<br />
                    CEP: 35300-000
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Como Chegar</h3>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Localizado no centro da cidade</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Próximo ao comércio central</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Estacionamento disponível nas proximidades</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Acesso fácil de transporte público</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Informações Adicionais</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">✓</span>
                      </div>
                      <span>Acessibilidade completa</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">✓</span>
                      </div>
                      <span>Sala de espera confortável</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">✓</span>
                      </div>
                      <span>Ambiente climatizado</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">✓</span>
                      </div>
                      <span>Wi-Fi disponível</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/contato"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full justify-center"
                >
                  Ver Mapa e Rotas
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </SectionWrapper>

        {/* Contact Section */}
        <ContactSection />
      </main>
    </>
  );
}