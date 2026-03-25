import React, { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import FAQSchema from '@/components/FAQSchema';
import EnhancedFooter from '@/components/EnhancedFooter';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import SpotifyEmbed from '@/components/SpotifyEmbed';
import Testimonials from '@/components/Testimonials';
import {
  Zap,
  ShieldCheck,
  MapPin,
  Award,
  Clock,
  CheckCircle,
  ChevronDown,
  Headphones,
  MessageCircle,
  Car,
  Navigation,
  Star,
  HeartPulse,
} from 'lucide-react';

/**
 * IRPLValeDoAcoPage - Landing page de conversão para pacientes do Vale do Aço
 * Route: /irpl-e-eye-vale-do-aco
 * @author Dr. Philipe Saraiva Cruz
 */
const IRPLValeDoAcoPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const medicalProcedureSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: 'IRPL E-Eye — Intense Regulated Pulsed Light para Olho Seco',
    alternateName: ['IRPL', 'E-Eye', 'Luz Pulsada Regulada Oftalmológica', 'IPL Oftalmológica'],
    procedureType: 'http://schema.org/NoninvasiveProcedure',
    description:
      'Tratamento não invasivo de luz pulsada regulada (IRPL) com dispositivo E-Eye para Disfunção das Glândulas de Meibômio (DGM) e olho seco evaporativo. Tecnologia francesa aprovada pela ANVISA. Disponível em Caratinga, MG, a aproximadamente 1h30 do Vale do Aço (Ipatinga, Coronel Fabriciano, Timóteo).',
    howPerformed:
      'Aplicação de pulsos de luz calibrados nas regiões infraorbital e zigomática, estimulando vias neurológicas para restaurar a função das glândulas de Meibômio. Realizado em consultório, sem anestesia.',
    preparation:
      'Avaliação completa com meibografia, aplicação de gel protetor e óculos de segurança.',
    followup:
      'Protocolo de 3 sessões nos dias 0, 15 e 45. Manutenção anual conforme avaliação individual.',
    status: 'http://schema.org/ActiveActionStatus',
    bodyLocation: 'Região periocular (infraorbital e zigomática)',
    relevantSpecialty: {
      '@type': 'MedicalSpecialty',
      name: 'Ophthalmology',
    },
    availableService: {
      '@type': 'MedicalClinic',
      name: 'Clínica Saraiva Vision',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Rua Catarina Maria Passos, 97',
        addressLocality: 'Caratinga',
        addressRegion: 'MG',
        postalCode: '35300-000',
        addressCountry: 'BR',
      },
      telephone: '+55-33-99860-1427',
    },
  };

  const faqs = [
    {
      question: 'O que é o IRPL E-Eye e como ele trata o olho seco?',
      answer:
        'O E-Eye é o primeiro dispositivo médico do mundo desenvolvido especificamente para o tratamento de olho seco causado por Disfunção das Glândulas de Meibômio (DGM). Ele utiliza a tecnologia patenteada IRPL® (Intense Regulated Pulsed Light), que emite pulsos de luz calibrados nas regiões infraorbital e zigomática do rosto. Esses pulsos estimulam vias neurológicas ligadas à secreção meibomiana, favorecendo a restauração da camada lipídica da lágrima e reduzindo a evaporação excessiva que causa o olho seco evaporativo. O E-Eye é aprovado pela ANVISA e pela CE europeia, sendo o único dispositivo de IPL oftalmológica com essa indicação específica no Brasil.',
    },
    {
      question: 'Quantas sessões de IRPL são necessárias e qual o intervalo?',
      answer:
        'O protocolo padrão do IRPL E-Eye consiste em 3 sessões, realizadas nos dias 0, 15 e 45. Cada sessão dura entre 10 e 15 minutos e é realizada em consultório, sem necessidade de internação ou anestesia. A maioria dos pacientes começa a perceber melhora dos sintomas após a primeira ou segunda sessão. Após o ciclo inicial, pode ser necessária uma sessão de manutenção anual, dependendo da resposta individual e da gravidade da DGM.',
    },
    {
      question: 'O tratamento IRPL dói? Quais são os efeitos colaterais?',
      answer:
        'O IRPL E-Eye é um procedimento indolor. Durante a aplicação, o paciente pode sentir um leve aquecimento na pele da região periocular, semelhante a uma luz de sol morna. Não há cortes, agulhas ou contato direto com o olho. Os efeitos colaterais são raros e transitórios, podendo incluir leve vermelhidão local que desaparece em horas. O paciente retorna à rotina normalmente no mesmo dia do procedimento. A sessão requer apenas que o paciente não use lentes de contato no dia e evite exposição solar intensa por 48 horas.',
    },
    {
      question: 'Por quanto tempo duram os resultados do IRPL?',
      answer:
        'A durabilidade dos resultados varia conforme a gravidade da DGM e fatores individuais como hábitos, ambiente de trabalho e doenças sistêmicas associadas. Em geral, pacientes relatam melhora sustentada dos sintomas de 6 meses a mais de 2 anos após o ciclo inicial. O acompanhamento regular com o oftalmologista é essencial para avaliar a necessidade de sessões de manutenção e ajustar o plano terapêutico. O IRPL não cura a DGM, mas pode controlar significativamente a progressão e os sintomas quando indicado corretamente.',
    },
    {
      question: 'Como funciona para pacientes do Vale do Aço que querem fazer IRPL em Caratinga?',
      answer:
        'A Saraiva Vision atende regularmente pacientes de Ipatinga, Coronel Fabriciano, Timóteo e outras cidades do Vale do Aço e região. Caratinga fica a aproximadamente 1h30 de Ipatinga pela BR-458. O processo começa com uma avaliação gratuita de 15 minutos pelo WhatsApp, onde nossa equipe entende o seu caso e verifica se o IRPL E-Eye é indicado. Caso seja, agendamos a consulta de avaliação completa com meibografia, e as sessões de IRPL são realizadas em datas programadas. Muitos pacientes do Vale do Aço realizam duas sessões no mesmo dia de deslocamento, respeitando o intervalo mínimo de dias entre elas.',
    },
    {
      question: 'IRPL E-Eye é diferente de IPL estético? Por que não fazer em clínica de estética?',
      answer:
        'Sim, existe uma diferença fundamental. O E-Eye utiliza a tecnologia IRPL® (Intense Regulated Pulsed Light), com pulsos uniformes e regulados desenvolvidos especificamente para uso oftalmológico na DGM. Dispositivos IPL convencionais, usados em clínicas de estética, são desenvolvidos para dermatologia e possuem características técnicas distintas: a energia decai ao longo do pulso, a faixa espectral é diferente e os parâmetros não são calibrados para superfície ocular. O IRPL E-Eye é o único dispositivo com aprovação ANVISA para essa indicação específica. Realizar IPL estético como substituto ao IRPL oftalmológico não é recomendado e pode ser ineficaz ou inseguro.',
    },
  ];

  const benefits = [
    {
      icon: Award,
      title: 'Único IRPL da Região',
      description:
        'O E-Eye é exclusivo no interior de Minas Gerais. Pacientes do Vale do Aço têm em Caratinga o acesso mais próximo a essa tecnologia sem precisar ir a Belo Horizonte ou São Paulo.',
    },
    {
      icon: ShieldCheck,
      title: 'Aprovado pela ANVISA',
      description:
        'O E-Eye é o único dispositivo de luz pulsada regulada aprovado pela ANVISA especificamente para DGM no Brasil. Tecnologia francesa com certificação CE europeia e histórico clínico validado.',
    },
    {
      icon: Zap,
      title: 'Sem Dor, Sem Cortes',
      description:
        'Procedimento não invasivo aplicado na região periocular. Sem anestesia, sem cortes, sem downtime. O paciente retorna às atividades normais no mesmo dia da sessão.',
    },
    {
      icon: HeartPulse,
      title: 'Resultados em Poucas Sessões',
      description:
        'Protocolo de 3 sessões em 45 dias. Muitos pacientes percebem redução dos sintomas já após a primeira sessão. Melhora sustentada de até 2 anos com protocolo de manutenção.',
    },
  ];

  const symptomOptions = [
    { value: 'olho-seco-cronico', label: 'Olho seco crônico' },
    { value: 'uso-colirio-excessivo', label: 'Uso excessivo de colírio' },
    { value: 'dgm-diagnosticada', label: 'DGM já diagnosticada' },
    { value: 'falha-tratamentos', label: 'Falha em tratamentos anteriores' },
    { value: 'ardencia-constante', label: 'Ardência constante nos olhos' },
  ];

  const whatsappURL =
    'https://wa.me/5533998601427?text=Ol%C3%A1!%20Sou%20do%20Vale%20do%20A%C3%A7o%20e%20gostaria%20de%20saber%20mais%20sobre%20o%20tratamento%20IRPL%20E-Eye%20em%20Caratinga.%20Pode%20me%20ajudar%3F';

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const citiesServed = [
    { city: 'Ipatinga', distance: '~90 km', time: '~1h20' },
    { city: 'Coronel Fabriciano', distance: '~100 km', time: '~1h30' },
    { city: 'Timóteo', distance: '~110 km', time: '~1h35' },
    { city: 'Santana do Paraíso', distance: '~95 km', time: '~1h25' },
    { city: 'Belo Oriente', distance: '~85 km', time: '~1h15' },
    { city: 'João Monlevade', distance: '~120 km', time: '~1h45' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        title="IRPL E-Eye no Vale do Aço | Tratamento Olho Seco | Saraiva Vision Caratinga"
        description="IRPL E-Eye para olho seco disponível perto do Vale do Aço. Atendemos pacientes de Ipatinga, Coronel Fabriciano e Timóteo em Caratinga, MG. Aprovado ANVISA. Agende sua avaliação."
        keywords="IRPL Vale do Aço, E-Eye Ipatinga, olho seco Coronel Fabriciano, oftalmologista Timóteo, IRPL perto Vale do Aço"
        structuredData={medicalProcedureSchema}
      />
      <FAQSchema faqs={faqs} />

      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32">

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cyan-50 via-white to-sky-50">
          <div className="max-w-[90rem] mx-auto px-6 lg:px-12 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16 items-start">

              {/* Left: Text */}
              <div className="space-y-7">
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-4 py-2 text-sm font-semibold">
                    <Award className="w-4 h-4" />
                    Único no Interior de MG
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-4 py-2 text-sm font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    ANVISA Aprovado
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  IRPL E-Eye para Olho Seco —{' '}
                  <span className="text-cyan-600">Perto do Vale do Aço</span>
                </h1>

                <p className="text-xl text-slate-700 leading-relaxed">
                  Pacientes de <strong>Ipatinga, Coronel Fabriciano, Timóteo</strong> e toda a
                  região não precisam ir até Belo Horizonte. A Saraiva Vision em{' '}
                  <strong>Caratinga</strong> oferece o tratamento{' '}
                  <strong>IRPL E-Eye aprovado pela ANVISA</strong>, a apenas{' '}
                  <strong>~1h30 do Vale do Aço</strong>.
                </p>

                {/* Distance callout */}
                <div className="bg-white border border-cyan-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Navigation className="w-6 h-6 text-cyan-600 shrink-0" />
                    <p className="font-bold text-slate-900">Distância do Vale do Aço a Caratinga</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {citiesServed.map((item) => (
                      <div
                        key={item.city}
                        className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-center"
                      >
                        <p className="font-semibold text-slate-900 text-sm">{item.city}</p>
                        <p className="text-cyan-600 font-bold text-sm">{item.time}</p>
                        <p className="text-slate-500 text-xs">{item.distance}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: '4.9/5', label: 'Avaliação Google' },
                    { value: '3', label: 'Sessões no protocolo' },
                    { value: 'ANVISA', label: 'Aprovado ANVISA/CE' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="text-center bg-white rounded-xl border border-slate-200 p-3 shadow-sm"
                    >
                      <p className="text-xl font-bold text-cyan-600">{stat.value}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Lead Capture Form */}
              <div>
                <LeadCaptureForm
                  symptomOptions={symptomOptions}
                  pageContext="IRPL E-Eye Vale do Aço"
                  ctaText="Agendar Avaliação Gratuita de 15min"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Why Come to Caratinga */}
        <section className="bg-white py-20 lg:py-24 border-t border-slate-100">
          <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Por Que Pacientes do Vale do Aço Vêm a Caratinga para IRPL
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                O IRPL E-Eye não está disponível em todas as cidades. Na região do Vale do Aço,
                a alternativa mais próxima seria Belo Horizonte. Caratinga representa uma opção
                significativamente mais acessível em distância e logística.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 p-6 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center mb-5">
                    <benefit.icon className="w-7 h-7 text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{benefit.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who is IRPL for */}
        <section className="bg-gradient-to-br from-slate-50 to-cyan-50 py-20 lg:py-24 border-t border-slate-200">
          <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">

              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Para Quem o IRPL E-Eye É Indicado
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-8">
                  O IRPL é indicado para pacientes com olho seco de origem evaporativa, associado
                  à Disfunção das Glândulas de Meibômio (DGM). A indicação é definida após avaliação
                  clínica completa com meibografia.
                </p>

                <ul className="space-y-4">
                  {[
                    {
                      title: 'Olho seco crônico resistente a colírios',
                      desc: 'Pacientes que usam lubrificantes há meses sem melhora consistente dos sintomas.',
                    },
                    {
                      title: 'DGM moderada a grave confirmada por meibografia',
                      desc: 'Atrofia das glândulas de Meibômio documentada em exame de imagem infravermelha.',
                    },
                    {
                      title: 'Blefarite crônica com obstrução meibomiana',
                      desc: 'Inflamação persistente das pálpebras com bloqueio das glândulas e secreção anormal.',
                    },
                    {
                      title: 'Falha em tratamentos prévios para olho seco',
                      desc: 'Casos onde higiene palpebral, ômega-3 e lubrificantes não foram suficientes.',
                    },
                    {
                      title: 'Preparo para cirurgia ocular',
                      desc: 'Otimização da superfície ocular antes de cirurgia de catarata ou refrativa.',
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                      <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                        <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-5">
                {/* How it works */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-lg mb-5 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-cyan-600" />
                    Como Funciona a Jornada para o IRPL
                  </h3>
                  <ol className="space-y-4">
                    {[
                      {
                        step: '01',
                        title: 'Contato inicial gratuito',
                        desc: 'Fale com nossa equipe pelo WhatsApp. Entendemos seu caso e confirmamos se o IRPL é candidato adequado.',
                      },
                      {
                        step: '02',
                        title: 'Avaliação com meibografia',
                        desc: 'Consulta em Caratinga com exame completo da superfície ocular e meibografia para confirmar indicação.',
                      },
                      {
                        step: '03',
                        title: 'Protocolo de 3 sessões',
                        desc: 'Sessões nos dias 0, 15 e 45. Muitos pacientes do Vale do Aço otimizam as viagens com agendamento estratégico.',
                      },
                      {
                        step: '04',
                        title: 'Acompanhamento e manutenção',
                        desc: 'Consultas de seguimento para avaliar resposta e definir necessidade de manutenção anual.',
                      },
                    ].map((item) => (
                      <li key={item.step} className="flex gap-4">
                        <div className="w-9 h-9 rounded-full bg-cyan-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                          <p className="text-slate-600 text-xs mt-0.5">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Route info */}
                <div className="bg-cyan-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <Car className="w-6 h-6" />
                    <h3 className="font-bold text-lg">Vindo do Vale do Aço a Caratinga</h3>
                  </div>
                  <p className="text-cyan-100 text-sm leading-relaxed mb-4">
                    A rota mais comum é pela <strong>BR-458</strong> saindo de Ipatinga em direção
                    a Caratinga. Estrada sinalizada, com boa infraestrutura. A clínica fica no bairro
                    Santa Zita, com fácil acesso e estacionamento próximo.
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-xs text-cyan-200">De Ipatinga</p>
                      <p className="font-bold">~1h20 min</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-xs text-cyan-200">De Coronel Fabriciano</p>
                      <p className="font-bold">~1h30 min</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-cyan-100">
                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Rua Catarina Maria Passos, 97 — Santa Zita, Caratinga, MG</span>
                  </div>
                </div>

                {/* Google rating */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">4.9 / 5 no Google</p>
                    <p className="text-slate-600 text-sm">Mais de 150 avaliações de pacientes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Podcast Section */}
        <section className="bg-white py-16 lg:py-20 border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-4 py-2 text-sm font-semibold mb-4">
                <Headphones className="w-4 h-4" />
                Podcast Saraiva Vision
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Ouça: IRPL E-Eye e o Tratamento do Olho Seco
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Dr. Philipe Saraiva explica como o IRPL E-Eye funciona, quem são os candidatos
                ideais e o que esperar do tratamento em linguagem clara e acessível.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shrink-0">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Saúde Ocular em Foco</p>
                  <p className="text-sm text-slate-600">Dr. Philipe Saraiva Cruz • Oftalmologista</p>
                </div>
              </div>
              <SpotifyEmbed type="show" id="6sHIG7HbhF1w5O63CTtxwV" compact />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Testimonials limit={3} />

        {/* FAQ Section */}
        <section className="bg-slate-50 py-20 lg:py-24 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Perguntas Frequentes sobre o IRPL E-Eye
              </h2>
              <p className="text-lg text-slate-600">
                Dúvidas comuns de pacientes do Vale do Aço e região sobre o tratamento.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                    aria-expanded={openFAQ === index}
                  >
                    <span className="font-semibold text-slate-900 text-base">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-6">
                      <p className="text-slate-700 leading-relaxed text-sm">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-cyan-600 to-sky-700 py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white rounded-full px-4 py-2 text-sm font-semibold mb-6">
              <Navigation className="w-4 h-4" />
              ~1h30 do Vale do Aço — Ipatinga, Coronel Fabriciano, Timóteo
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Agende sua Avaliação Gratuita de 15min via WhatsApp
            </h2>
            <p className="text-lg text-cyan-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Nossa equipe irá entender o seu caso pelo WhatsApp e confirmar se o IRPL E-Eye
              é indicado para você. Sem compromisso, sem custo. Pacientes do Vale do Aço
              são atendidos regularmente em Caratinga.
            </p>
            <a
              href={whatsappURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-green-500/40 transition-all hover:scale-105"
            >
              <MessageCircle className="w-6 h-6" />
              Falar pelo WhatsApp agora
            </a>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-cyan-200">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Rua Catarina Maria Passos, 97 — Santa Zita, Caratinga, MG
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                IRPL E-Eye aprovado ANVISA
              </span>
            </div>
            <p className="text-cyan-200 text-xs mt-4 max-w-xl mx-auto">
              A indicação do IRPL E-Eye é definida após avaliação médica individual com meibografia.
              Resultados podem variar conforme a gravidade da DGM e características do paciente.
            </p>
          </div>
        </section>

      </main>

      <EnhancedFooter />
    </div>
  );
};

export default IRPLValeDoAcoPage;
