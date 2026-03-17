import React, { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import FAQSchema from '@/components/FAQSchema';
import EnhancedFooter from '@/components/EnhancedFooter';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import SpotifyEmbed from '@/components/SpotifyEmbed';
import Testimonials from '@/components/Testimonials';
import {
  Eye,
  Droplets,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Star,
  Award,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  Microscope,
  Heart,
  AlertCircle,
  Headphones,
} from 'lucide-react';

/**
 * Landing Page - Lentes Esclerais para Olho Seco
 * Route: /lentes-esclerais-olho-seco
 *
 * Conversion-focused page targeting patients with severe dry eye and keratoconus
 * seeking scleral lens adaptation in Caratinga, MG.
 *
 * @author Dr. Philipe Saraiva Cruz
 */

// --- Data ---

const SYMPTOM_OPTIONS = [
  { value: 'olho-seco-severo', label: 'Olho seco severo (arde ou irrita o dia todo)' },
  { value: 'ceratocone', label: 'Ceratocone diagnosticado' },
  { value: 'intolerancia-lentes', label: 'Intolerância a lentes de contato convencionais' },
  { value: 'irregularidade-corneal', label: 'Irregularidade corneal ou córnea transplantada' },
  { value: 'sindrome-sjogren', label: 'Síndrome de Sjögren ou doença autoimune' },
];

const BENEFITS = [
  {
    icon: Clock,
    title: 'Conforto o dia todo',
    description:
      'As lentes esclerais saltam sobre a córnea e pousam sobre a esclera, eliminando o atrito direto e proporcionando conforto durante 12 a 16 horas de uso contínuo.',
    badge: 'Diferencial principal',
  },
  {
    icon: Droplets,
    title: 'Reservatório lacrimal integrado',
    description:
      'O espaço entre a lente e a córnea é preenchido com solução salina isotônica. Esse reservatório mantém a superfície ocular hidratada mesmo em casos de olho seco severo.',
    badge: 'Ideal para DED grave',
  },
  {
    icon: Microscope,
    title: 'Adaptação personalizada',
    description:
      'Cada lente é selecionada com base em topografia e biometria corneana individual. Parâmetros de vault, diâmetro e potência são ajustados para cada olho de forma independente.',
    badge: 'Protocolo sob medida',
  },
  {
    icon: Eye,
    title: 'Indicação para ceratocone',
    description:
      'Em córneas irregulares como o ceratocone, as lentes esclerais compensam a irregularidade superficial com a camada de fluido, restaurando a qualidade óptica e a acuidade visual.',
    badge: 'Nível 3 TFOS DEWS III',
  },
];

const FAQS = [
  {
    question: 'O que são lentes esclerais e como funcionam?',
    answer:
      'Lentes esclerais são lentes de contato rígidas de grande diâmetro (geralmente 16 a 24 mm) que se apoiam sobre a esclera — a parte branca do olho — sem tocar a córnea. Esse design cria um espaço entre a lente e a córnea que é preenchido com solução salina estéril, formando um reservatório lacrimal permanente. Isso mantém a superfície ocular constantemente hidratada, aliviando a ardência, a sensação de areia e a visão embaçada causadas pelo olho seco severo. Ao mesmo tempo, a solução de fluido "preenche" irregularidades corneanas como o ceratocone, melhorando significativamente a qualidade óptica.',
  },
  {
    question: 'Lentes esclerais são confortáveis? Dói para colocar?',
    answer:
      'A adaptação inicial exige treino, mas a grande maioria dos pacientes relata que, após dominar a técnica de inserção e remoção — que inclui o uso de ventosa ou tripé de suporte — o conforto durante o uso é superior ao das lentes convencionais. Como a lente não toca a córnea, o atrito e a irritação são mínimos. Pacientes com olho seco severo frequentemente descrevem o uso diário como "transformador", pois eliminam a necessidade de colírios frequentes ao longo do dia.',
  },
  {
    question: 'Para quem são indicadas as lentes esclerais?',
    answer:
      'As lentes esclerais são indicadas principalmente para: (1) Olho seco severo ou refratário a tratamentos convencionais; (2) Ceratocone, ectasia corneana ou irregularidade após cirurgia refrativa; (3) Síndrome de Sjögren e outras doenças autoimunes com comprometimento lacrimal; (4) Córneas transplantadas que necessitam de correção óptica estável; (5) Pacientes intolerantes a lentes de contato convencionais (rígidas ou flexíveis). O TFOS DEWS III as classifica como terapia de nível 3, indicada quando os tratamentos de níveis 1 e 2 não controlam adequadamente os sintomas.',
  },
  {
    question: 'Como é o processo de adaptação? Quantas consultas são necessárias?',
    answer:
      'O processo começa com uma consulta completa de avaliação, que inclui topografia corneana, medidas biométricas e avaliação do filme lacrimal. Com base nesses dados, o especialista seleciona a família de lentes mais adequada. Na consulta de prova, a lente diagnóstica é inserida para avaliação do vault (espaço entre lente e córnea), centralização e conforto inicial. Ajustes de parâmetros são feitos até atingir o resultado ideal. Em média, o processo leva de 2 a 4 consultas. Após a adaptação definitiva, consultas de acompanhamento são agendadas em 1 mês, 3 meses e anualmente para reavaliação da superfície ocular e dos parâmetros da lente.',
  },
];

// --- FAQ Accordion Item ---

const FAQItem = ({ faq, index, isOpen, onToggle }) => (
  <div className="border border-slate-200 rounded-xl overflow-hidden">
    <button
      onClick={() => onToggle(index)}
      className="w-full flex items-start justify-between gap-4 p-5 text-left bg-white hover:bg-slate-50 transition-colors"
      aria-expanded={isOpen}
    >
      <span className="font-semibold text-slate-900 text-base leading-snug">
        {faq.question}
      </span>
      {isOpen ? (
        <ChevronUp className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
      ) : (
        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
      )}
    </button>
    {isOpen && (
      <div className="px-5 pb-5 bg-slate-50 border-t border-slate-100">
        <p className="text-slate-700 leading-relaxed text-sm pt-4">{faq.answer}</p>
      </div>
    )}
  </div>
);

// --- Structured Data ---

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'MedicalDevice',
  name: 'Lente Escleral',
  alternateName: ['Scleral Lens', 'Lente de Contato Escleral'],
  description:
    'Dispositivo óptico de grande diâmetro apoiado sobre a esclera, indicado para olho seco severo, ceratocone e irregularidades corneanas. Forma reservatório lacrimal permanente entre a lente e a córnea.',
  medicalSpecialty: {
    '@type': 'MedicalSpecialty',
    name: 'Ophthalmology',
  },
  relevantSpecialty: {
    '@type': 'MedicalSpecialty',
    name: 'Contact Lens Specialty',
  },
  availableService: {
    '@type': 'MedicalProcedure',
    name: 'Adaptação de Lentes Esclerais',
    procedureType: 'https://schema.org/TherapeuticProcedure',
    provider: {
      '@type': 'MedicalClinic',
      name: 'Saraiva Vision',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Caratinga',
        addressRegion: 'MG',
        addressCountry: 'BR',
      },
      url: 'https://saraivavision.com.br',
    },
  },
};

// --- Main Component ---

const LentesEscleraisPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        title="Lentes Esclerais para Olho Seco em Caratinga | Adaptação Especializada | Saraiva Vision"
        description="Lentes esclerais para olho seco severo e ceratocone em Caratinga, MG. Adaptação personalizada com oftalmologista especializado. Conforto o dia todo. Agende sua avaliação gratuita."
        keywords="lentes esclerais olho seco, lentes esclerais Caratinga, lentes esclerais ceratocone, adaptação lentes esclerais MG"
        structuredData={STRUCTURED_DATA}
      />
      <FAQSchema faqs={FAQS} />

      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32">

        {/* ── Hero Section ────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-cyan-50 via-white to-sky-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-semibold mb-8">
              <ShieldCheck className="w-4 h-4" />
              <span>Nível 3 TFOS DEWS III — Terapia avançada para olho seco refratário</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Left: Copy */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  Lentes Esclerais para{' '}
                  <span className="text-cyan-700">Olho Seco Severo</span>{' '}
                  e Ceratocone em Caratinga
                </h1>

                <p className="text-lg text-slate-700 leading-relaxed">
                  Quando colírios e tratamentos convencionais já não aliviam a ardência, a sensação
                  de areia e a visão embaçada, as lentes esclerais oferecem conforto contínuo através
                  de um reservatório lacrimal permanente entre a lente e a superfície ocular.
                </p>

                {/* Key differentiators */}
                <div className="space-y-3">
                  {[
                    'Reservatório lacrimal que mantém o olho hidratado o dia todo',
                    'Não toca a córnea — sem atrito, sem irritação',
                    'Corrige irregularidades corneanas (ceratocone, pós-cirurgia)',
                    'Adaptação personalizada com topografia corneana',
                    'Classificada como terapia de nível 3 pelo TFOS DEWS III',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-800 text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Trust signals */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm text-sm font-semibold text-slate-800">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
                    4.9/5 — 136+ avaliações Google
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm text-sm font-semibold text-slate-800">
                    <Award className="w-4 h-4 text-cyan-600" />
                    Especialista em superfície ocular
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm text-sm font-semibold text-slate-800">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Caratinga, MG
                  </div>
                </div>

                {/* Medical disclaimer */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900 leading-relaxed">
                    A adaptação de lentes esclerais exige avaliação presencial completa. A indicação
                    é definida pelo especialista após análise da topografia corneana e da superfície
                    ocular de cada paciente.
                  </p>
                </div>
              </div>

              {/* Right: Lead Capture Form */}
              <div>
                <LeadCaptureForm
                  symptomOptions={SYMPTOM_OPTIONS}
                  pageContext="Lentes Esclerais"
                  ctaText="Agendar Avaliação Gratuita de 15min"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Benefits Grid ────────────────────────────────────────────── */}
        <section className="py-16 bg-white" aria-labelledby="benefits-title">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2
                id="benefits-title"
                className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
              >
                Por que lentes esclerais?
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Quatro razões clínicas que fazem das lentes esclerais a escolha de nível 3
                para casos refratários de olho seco.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BENEFITS.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className="rounded-2xl border border-slate-200 p-6 bg-slate-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-cyan-700" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-lg">{benefit.title}</h3>
                          <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-full px-2 py-0.5">
                            {benefit.badge}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-sm">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How Scleral Lenses Work ──────────────────────────────────── */}
        <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-cyan-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-4 py-2 text-sm font-semibold">
                  <Layers className="w-4 h-4" />
                  <span>Como funciona</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                  A lente que hidrata enquanto você vê
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  Diferentemente das lentes de contato convencionais, que pousam diretamente sobre a
                  córnea, as lentes esclerais são apoiadas sobre a esclera — a parte branca e mais
                  resistente do olho. Entre a lente e a córnea forma-se um espaço, preenchido com
                  solução salina estéril antes de cada inserção.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      step: '1',
                      label: 'Vault sobre a córnea',
                      detail:
                        'A lente não toca a córnea em nenhum momento, eliminando atrito e hipoxia focal.',
                    },
                    {
                      step: '2',
                      label: 'Reservatório de solução salina',
                      detail:
                        'O fluido entre a lente e a córnea age como lágrima artificial de ação contínua.',
                    },
                    {
                      step: '3',
                      label: 'Apoio sobre a esclera',
                      detail:
                        'A esclera suporta o peso da lente com conforto, sem pressão sobre tecidos frágeis.',
                    },
                    {
                      step: '4',
                      label: 'Correção óptica precisa',
                      detail:
                        'A interface fluida neutraliza as irregularidades da córnea, restaurando nitidez visual.',
                    },
                  ].map(({ step, label, detail }) => (
                    <div key={step} className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {step}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{label}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Who it's for */}
              <div className="rounded-2xl border border-cyan-200 bg-white p-8 space-y-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">Quem se beneficia das lentes esclerais?</h3>
                <div className="space-y-4">
                  {[
                    {
                      icon: Droplets,
                      condition: 'Olho seco severo',
                      detail:
                        'Casos refratários ao uso de colírios, plugs lacrimais ou IRPL que ainda apresentam sintomas intensos.',
                    },
                    {
                      icon: Eye,
                      condition: 'Ceratocone e ectasia corneana',
                      detail:
                        'A interface fluida corrige a irregularidade superficial, restaurando a qualidade visual sem cirurgia.',
                    },
                    {
                      icon: ShieldCheck,
                      condition: 'Síndrome de Sjögren',
                      detail:
                        'Doenças autoimunes que comprometem severamente a produção lacrimal e tornam a superfície ocular vulnerável.',
                    },
                    {
                      icon: Microscope,
                      condition: 'Pós-transplante de córnea',
                      detail:
                        'Córneas transplantadas frequentemente apresentam irregularidade residual corrigível com esclerais.',
                    },
                    {
                      icon: Heart,
                      condition: 'Intolerância a lentes convencionais',
                      detail:
                        'Pacientes que não toleram lentes rígidas ou flexíveis comuns encontram nas esclerais conforto superior.',
                    },
                  ].map(({ icon: Icon, condition, detail }) => (
                    <div key={condition} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-cyan-700" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{condition}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Podcast / Audio Section ──────────────────────────────────── */}
        <section className="py-16 bg-white" aria-labelledby="podcast-title">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <div className="rounded-2xl border border-slate-200 p-8 bg-slate-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-cyan-600 font-semibold uppercase tracking-wider">
                    Podcast Saraiva Vision
                  </p>
                  <h2 id="podcast-title" className="text-xl font-bold text-slate-900">
                    Ouça sobre olho seco e tratamentos avançados
                  </h2>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                O Dr. Philipe Saraiva aborda temas como olho seco, ceratocone, lentes esclerais e as
                tecnologias mais recentes disponíveis em Caratinga. Episódios curtos, linguagem
                acessível, conteúdo de referência.
              </p>
              <SpotifyEmbed type="show" id="6sHIG7HbhF1w5O63CTtxwV" compact />
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────────── */}
        <Testimonials limit={3} />

        {/* ── FAQ Section ──────────────────────────────────────────────── */}
        <section className="py-16 bg-white" aria-labelledby="faq-title">
          <div className="max-w-3xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-10">
              <h2
                id="faq-title"
                className="text-3xl font-bold text-slate-900 mb-3"
              >
                Perguntas frequentes
              </h2>
              <p className="text-slate-600">
                Dúvidas comuns sobre lentes esclerais respondidas pelo especialista.
              </p>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, index) => (
                <FAQItem
                  key={index}
                  faq={faq}
                  index={index}
                  isOpen={openFAQ === index}
                  onToggle={toggleFAQ}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="py-16 bg-gradient-to-br from-cyan-50 via-white to-sky-50">
          <div className="max-w-3xl mx-auto px-6 lg:px-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-semibold">
              <MessageCircle className="w-4 h-4" />
              <span>Resposta em até 1 hora no horário comercial</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Agende sua Avaliação Gratuita de 15min
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              Descubra se você é candidato às lentes esclerais em uma avaliação rápida e sem
              compromisso. Nosso especialista em superfície ocular vai entender seu caso e
              orientar o próximo passo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://wa.me/5533998601427?text=Ol%C3%A1%21+Gostaria+de+agendar+uma+avalia%C3%A7%C3%A3o+gratuita+de+15+min+sobre+Lentes+Esclerais."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all text-lg"
                aria-label="Agendar avaliação gratuita via WhatsApp"
              >
                <MessageCircle className="w-6 h-6" />
                Falar no WhatsApp agora
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm text-slate-500">
              Sem encaminhamento necessário. Atendemos em Caratinga, MG.
            </p>
          </div>
        </section>

      </main>

      <EnhancedFooter />
    </div>
  );
};

export default LentesEscleraisPage;
