import React, { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import FAQSchema from '@/components/FAQSchema';
import EnhancedFooter from '@/components/EnhancedFooter';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import SpotifyEmbed from '@/components/SpotifyEmbed';
import Testimonials from '@/components/Testimonials';
import {
  Eye,
  Microscope,
  ShieldCheck,
  HeartPulse,
  CheckCircle,
  ChevronDown,
  MapPin,
  Award,
  Headphones,
  MessageCircle,
  Zap,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

/**
 * TratamentoDGMPage - Landing page de conversão para tratamento de DGM em Caratinga
 * Route: /tratamento-dgm-caratinga
 * @author Dr. Philipe Saraiva Cruz
 */
const TratamentoDGMPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const medicalConditionSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: 'Disfunção das Glândulas de Meibômio (DGM)',
    alternateName: ['DGM', 'Meibomian Gland Dysfunction', 'Olho Seco Evaporativo'],
    description:
      'Condição crônica em que as glândulas de Meibômio das pálpebras produzem quantidade insuficiente ou secreção de baixa qualidade da camada lipídica da lágrima, resultando em evaporação acelerada do filme lacrimal e sintomas de olho seco.',
    code: {
      '@type': 'MedicalCode',
      codeValue: 'H02.88',
      codingSystem: 'ICD-10',
    },
    relevantSpecialty: {
      '@type': 'MedicalSpecialty',
      name: 'Ophthalmology',
    },
    signOrSymptom: [
      { '@type': 'MedicalSymptom', name: 'Ardência ocular' },
      { '@type': 'MedicalSymptom', name: 'Sensação de areia nos olhos' },
      { '@type': 'MedicalSymptom', name: 'Visão embaçada intermitente' },
      { '@type': 'MedicalSymptom', name: 'Olhos vermelhos frequentes' },
      { '@type': 'MedicalSymptom', name: 'Intolerância a lentes de contato' },
    ],
    possibleTreatment: [
      { '@type': 'MedicalTherapy', name: 'IRPL E-Eye' },
      { '@type': 'MedicalTherapy', name: 'Meibografia diagnóstica' },
      { '@type': 'MedicalTherapy', name: 'Higiene palpebral' },
    ],
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
      question: 'O que é a Disfunção das Glândulas de Meibômio (DGM)?',
      answer:
        'A DGM é uma condição crônica em que as glândulas de Meibômio, localizadas nas pálpebras, não produzem quantidade ou qualidade adequada da camada lipídica (gordurosa) da lágrima. Sem essa camada protetora, a lágrima evapora rapidamente, causando olho seco evaporativo — a forma mais comum de olho seco. A DGM pode ser assintomática nos estágios iniciais e se agravar progressivamente com o tempo.',
    },
    {
      question: 'Quais são os sintomas mais comuns da DGM?',
      answer:
        'Os sintomas mais frequentes incluem ardência e queimação nos olhos, sensação persistente de areia ou corpo estranho, visão embaçada que melhora com o piscar, olhos vermelhos sem causa infecciosa, intolerância ao uso de lentes de contato, e fotofobia (sensibilidade à luz). Muitos pacientes relatam piora dos sintomas em ambientes com ar-condicionado, ventilação ou após longos períodos de uso de telas.',
    },
    {
      question: 'Como a DGM é diagnosticada?',
      answer:
        'O diagnóstico da DGM é realizado por oftalmologista especializado e inclui avaliação clínica das pálpebras, expressão das glândulas de Meibômio e exames específicos da superfície ocular. O exame mais preciso é a meibografia, que usa luz infravermelha para fotografar as glândulas e avaliar seu grau de atrofia. Além disso, testes de estabilidade do filme lacrimal (TBUT) e marcadores inflamatórios complementam o diagnóstico conforme o protocolo TFOS DEWS III.',
    },
    {
      question: 'Qual o tratamento disponível para DGM em Caratinga?',
      answer:
        'Na Saraiva Vision em Caratinga, o tratamento da DGM é baseado em protocolo multimodal alinhado ao TFOS DEWS III. Após diagnóstico por meibografia, o plano pode incluir higiene palpebral orientada, colírios lubrificantes adequados ao fenótipo, suplementação com ômega-3, e IRPL E-Eye (Intense Regulated Pulsed Light) para casos de DGM moderada a grave. O IRPL E-Eye é o único dispositivo aprovado pela ANVISA especificamente para tratamento da DGM por luz pulsada no Brasil.',
    },
    {
      question: 'A DGM tem cura?',
      answer:
        'A DGM é uma condição crônica que, na maioria dos casos, não tem cura definitiva, mas pode ser controlada de forma eficaz com tratamento adequado. Com o manejo correto — que pode incluir IRPL E-Eye, higiene palpebral e cuidados continuados — é possível reduzir significativamente os sintomas e estabilizar a progressão da doença. O acompanhamento regular com oftalmologista especializado é fundamental para manter a qualidade de vida do paciente.',
    },
    {
      question: 'Quanto tempo leva para ver resultado no tratamento?',
      answer:
        'A resposta ao tratamento varia conforme a gravidade da DGM e o tipo de tratamento empregado. Com o IRPL E-Eye, muitos pacientes relatam melhora dos sintomas já após a primeira ou segunda sessão do protocolo. O protocolo padrão consiste em 3 sessões realizadas nos dias 0, 15 e 45. Resultados mais consistentes são observados após a conclusão do ciclo inicial, podendo durar de 6 meses a mais de 2 anos com manutenção adequada.',
    },
  ];

  const benefits = [
    {
      icon: Microscope,
      title: 'Diagnóstico por Meibografia',
      description:
        'Exame não invasivo com luz infravermelha que fotografa as glândulas de Meibômio em alta definição. Permite classificar o grau de atrofia e planejar tratamento individualizado.',
    },
    {
      icon: Zap,
      title: 'IRPL E-Eye Aprovado ANVISA',
      description:
        'Único dispositivo de luz pulsada regulada aprovado pela ANVISA especificamente para DGM. Tecnologia francesa desenvolvida para uso oftalmológico, sem cortes e sem dor.',
    },
    {
      icon: BookOpen,
      title: 'Protocolo TFOS DEWS III',
      description:
        'Conduta baseada no guia internacional mais atualizado para olho seco. Classificação do fenótipo, identificação dos fatores causais e tratamento escalonado e personalizado.',
    },
    {
      icon: HeartPulse,
      title: 'Acompanhamento Especializado',
      description:
        'Seguimento clínico com reavaliações periódicas para ajuste do plano terapêutico. Orientações de higiene palpebral, hábitos e cuidados ambientais que impactam diretamente no controle da DGM.',
    },
  ];

  const symptomOptions = [
    { value: 'ardencia', label: 'Ardência nos olhos' },
    { value: 'visao-embaçada', label: 'Visão embaçada frequente' },
    { value: 'sensacao-areia', label: 'Sensação de areia nos olhos' },
    { value: 'olho-vermelho', label: 'Olho vermelho frequente' },
    { value: 'lentes-contato', label: 'Intolerância a lentes de contato' },
  ];

  const whatsappURL =
    'https://wa.me/5533998601427?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20o%20tratamento%20de%20DGM%20em%20Caratinga.%20Pode%20me%20ajudar%3F';

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        title="Tratamento de DGM em Caratinga | Glândulas de Meibômio | Saraiva Vision"
        description="Tratamento especializado para Disfunção das Glândulas de Meibômio (DGM) em Caratinga, MG. Meibografia, IRPL E-Eye e acompanhamento personalizado. Agende sua avaliação gratuita."
        keywords="tratamento DGM Caratinga, disfunção glândulas Meibômio, meibografia Caratinga, IRPL DGM, oftalmologista olho seco Caratinga"
        structuredData={medicalConditionSchema}
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
                    Especialista em Superfície Ocular
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 px-4 py-2 text-sm font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    ANVISA Aprovado
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  Tratamento de{' '}
                  <span className="text-cyan-600">DGM em Caratinga</span>:{' '}
                  Diagnóstico Preciso e Controle Efetivo
                </h1>

                <p className="text-xl text-slate-700 leading-relaxed">
                  A <strong>Disfunção das Glândulas de Meibômio (DGM)</strong> é a principal causa de
                  olho seco evaporativo e frequentemente passa anos sem diagnóstico correto. Na Saraiva
                  Vision, utilizamos meibografia de alta definição, protocolo <strong>TFOS DEWS III</strong> e
                  tecnologia <strong>IRPL E-Eye</strong> para um tratamento baseado em evidências.
                </p>

                <div className="flex items-start gap-4 bg-white border border-cyan-200 rounded-xl p-5 shadow-sm">
                  <MapPin className="w-7 h-7 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Saraiva Vision — Caratinga, MG</p>
                    <p className="text-slate-600 text-sm mt-0.5">
                      Rua Catarina Maria Passos, 97 — Santa Zita
                    </p>
                    <p className="text-slate-600 text-sm">
                      Único centro com IRPL E-Eye no interior de Minas Gerais
                    </p>
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  {[
                    { value: '4.9/5', label: 'Avaliação Google' },
                    { value: '500+', label: 'Pacientes atendidos' },
                    { value: 'TFOS', label: 'Protocolo DEWS III' },
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
                  pageContext="Tratamento DGM"
                  ctaText="Agendar Avaliação Gratuita de 15min"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="bg-white py-20 lg:py-24 border-t border-slate-100">
          <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Como Tratamos a DGM na Saraiva Vision
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Cada caso de DGM é único. Nossa abordagem combina diagnóstico de alta precisão com
                as tecnologias mais atuais disponíveis no interior de Minas Gerais.
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

            {/* Warning / Education block */}
            <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-8 flex gap-5">
              <AlertCircle className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 text-lg mb-2">
                  Por que a DGM frequentemente não é diagnosticada?
                </h3>
                <p className="text-amber-800 leading-relaxed">
                  A DGM é uma condição silenciosa nos estágios iniciais. Muitos pacientes passam
                  anos usando colírios lubrificantes sem melhora porque a causa raiz — a disfunção
                  das glândulas de Meibômio — nunca foi investigada. Sem meibografia, o diagnóstico
                  correto simplesmente não é possível. O tratamento genérico prolonga o desconforto
                  sem tratar o problema real.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Happens in Consultation */}
        <section className="bg-gradient-to-br from-slate-50 to-cyan-50 py-20 lg:py-24 border-t border-slate-200">
          <div className="max-w-[90rem] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  O Que Acontece na Sua Avaliação de DGM
                </h2>
                <p className="text-lg text-slate-700 leading-relaxed mb-8">
                  A avaliação da superfície ocular na Saraiva Vision é estruturada para fornecer
                  um diagnóstico completo, não apenas uma triagem. Você sai sabendo exatamente qual
                  é o seu fenótipo de olho seco e qual caminho de tratamento é mais adequado.
                </p>
                <ul className="space-y-4">
                  {[
                    {
                      step: '01',
                      title: 'Anamnese detalhada',
                      desc: 'Histórico de sintomas, medicações, histórico sistêmico e fatores de risco para DGM.',
                    },
                    {
                      step: '02',
                      title: 'Meibografia de alta definição',
                      desc: 'Fotografias infravermelhas das glândulas de Meibômio para visualizar atrofia glandular.',
                    },
                    {
                      step: '03',
                      title: 'Avaliação do filme lacrimal',
                      desc: 'Testes de estabilidade lacrimal, avaliação da superfície corneal e da linha de Marx.',
                    },
                    {
                      step: '04',
                      title: 'Plano terapêutico individualizado',
                      desc: 'Definição do protocolo de tratamento com base no fenótipo e gravidade da DGM.',
                    },
                  ].map((item) => (
                    <li key={item.step} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-slate-600 text-sm mt-0.5">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="w-6 h-6 text-cyan-600" />
                    <h3 className="font-bold text-slate-900">Quem se beneficia da avaliação</h3>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Pacientes com ardência ou sensação de areia nos olhos',
                      'Usuários de colírio lubrificante há mais de 3 meses sem melhora',
                      'Usuários de lentes de contato com desconforto frequente',
                      'Pacientes em preparo para cirurgia de catarata ou refrativa',
                      'Pessoas com olho vermelho recorrente sem causa infecciosa',
                      'Pacientes com diagnóstico prévio de blefarite crônica',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-cyan-600 rounded-2xl p-6 text-white">
                  <h3 className="font-bold text-lg mb-2">Avaliação Gratuita de 15min</h3>
                  <p className="text-cyan-100 text-sm mb-4 leading-relaxed">
                    Não sabe se o seu caso é DGM? Fale com nossa equipe gratuitamente pelo
                    WhatsApp. Em 15 minutos você saberá se a avaliação especializada é indicada
                    para o seu perfil.
                  </p>
                  <a
                    href={whatsappURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-cyan-700 font-semibold px-5 py-3 rounded-xl hover:bg-cyan-50 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Falar pelo WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Podcast / Audio Section */}
        <section className="bg-white py-16 lg:py-20 border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-4 py-2 text-sm font-semibold mb-4">
                <Headphones className="w-4 h-4" />
                Podcast Saraiva Vision
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Ouça: Tudo Sobre DGM e Olho Seco
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Dr. Philipe Saraiva explica em linguagem acessível o que é a DGM, por que ela
                é subdiagnosticada e quais tratamentos realmente funcionam.
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
                Perguntas Frequentes sobre DGM
              </h2>
              <p className="text-lg text-slate-600">
                Respostas para as dúvidas mais comuns sobre diagnóstico e tratamento da DGM.
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
              <MapPin className="w-4 h-4" />
              Caratinga, MG — Único IRPL E-Eye no interior de MG
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Agende sua Avaliação Gratuita de 15min via WhatsApp
            </h2>
            <p className="text-lg text-cyan-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Nossa equipe irá entender o seu caso e indicar se a avaliação especializada de DGM
              é o próximo passo certo para você. Sem compromisso.
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
            <p className="text-cyan-200 text-sm mt-5">
              A indicação de tratamento é definida após avaliação médica individual. Resultados
              podem variar conforme o fenótipo e a gravidade da DGM de cada paciente.
            </p>
          </div>
        </section>

      </main>

      <EnhancedFooter />
    </div>
  );
};

export default TratamentoDGMPage;
