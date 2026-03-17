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
  Clock,
  Microscope,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Headphones,
  Users,
  FileText,
  Award,
  Zap,
} from 'lucide-react';

/**
 * Landing Page - Primeira Consulta de Olho Seco
 * Route: /consulta-primeira-vez-olho-seco
 *
 * Conversion-focused page for patients booking their first specialized dry eye
 * consultation in Caratinga, MG. Emphasizes no-referral access, same-day results,
 * and the TFOS DEWS III protocol.
 *
 * @author Dr. Philipe Saraiva Cruz
 */

// --- Data ---

const SYMPTOM_OPTIONS = [
  { value: 'ardencia-queimacao', label: 'Ardência ou queimação nos olhos' },
  { value: 'visao-embacada', label: 'Visão embaçada (especialmente à tarde)' },
  { value: 'sensacao-areia', label: 'Sensação de areia ou corpo estranho' },
  { value: 'lacrimejamento', label: 'Lacrimejamento excessivo (choro espontâneo)' },
  { value: 'cansaco-telas', label: 'Cansaço visual intenso ao usar telas' },
];

const BENEFITS = [
  {
    icon: Clock,
    title: 'Avaliação completa — 60 minutos',
    description:
      'Dedicamos uma hora exclusiva para entender seu histórico, aplicar questionários clínicos validados (OSDI) e realizar todos os exames da sessão. Sem pressa, sem consulta relâmpago.',
    highlight: 'Sem encaminhamento',
  },
  {
    icon: Microscope,
    title: 'Meibografia inclusa na consulta',
    description:
      'A meibografia é o exame de imagem das glândulas de Meibômio, estruturas responsáveis pela camada lipídica da lágrima. Pioneiros neste exame em Caratinga, com documentação fotográfica desde a primeira visita.',
    highlight: 'Pioneiros em Caratinga',
  },
  {
    icon: FileText,
    title: 'Protocolo TFOS DEWS III',
    description:
      'Seguimos o consenso internacional de 2017 e atualizações de 2025 para classificação do fenótipo de olho seco: evaporativo, aquoso-deficiente ou misto. Diagnóstico preciso é a base do tratamento efetivo.',
    highlight: 'Referência mundial',
  },
  {
    icon: ClipboardList,
    title: 'Plano de tratamento personalizado',
    description:
      'Ao final da consulta, você recebe um plano terapêutico escalonado em linguagem clara: o que tratar primeiro, quais medicações usar, quando retornar. Você sai com um roteiro, não apenas com um diagnóstico.',
    highlight: 'Resultado no mesmo dia',
  },
];

const EXAM_STEPS = [
  {
    code: 'OSDI',
    name: 'Questionário OSDI',
    detail:
      'Instrumento validado internacionalmente para quantificar a gravidade dos sintomas e o impacto na qualidade de vida. Base para classificação inicial.',
  },
  {
    code: 'FBUT',
    name: 'Tempo de Ruptura do Filme Lacrimal (TBUT/FBUT)',
    detail:
      'Mede quantos segundos a camada lacrimal permanece estável após o piscar. Valores abaixo de 10 segundos indicam instabilidade lacrimal.',
  },
  {
    code: 'MEI',
    name: 'Meibografia',
    detail:
      'Infravermelho de alta definição que visualiza a estrutura das glândulas de Meibômio. Detecta atrofia, dilatação ductal e infiltração adiposa. Inclusa na primeira consulta.',
  },
  {
    code: 'OSM',
    name: 'Análise da Osmolaridade Lacrimal',
    detail:
      'Biomarcador objetivo da hiperosmolaridade lacrimal, um dos critérios diagnósticos centrais do TFOS DEWS III para olho seco.',
  },
  {
    code: 'LV',
    name: 'Coloração com Lisamina Verde',
    detail:
      'Corante que evidencia células mortas e mucina degradada na conjuntiva e córnea, marcando dano epitelial por deficiência lacrimal.',
  },
  {
    code: 'MCS',
    name: 'Meniscometria',
    detail:
      'Avaliação da altura do menisco lacrimal inferior, indicando o volume de reserva de lágrima disponível na margem palpebral.',
  },
];

const FAQS = [
  {
    question: 'O que acontece na minha primeira consulta de olho seco?',
    answer:
      'A primeira consulta dura aproximadamente 60 minutos e inclui: (1) Anamnese detalhada com histórico médico, uso de medicamentos e hábitos de tela; (2) Aplicação dos questionários OSDI e DEQ-5 para quantificar a gravidade dos sintomas; (3) Realização de exames objetivos: TBUT, meniscometria, lisamina verde e osmolaridade lacrimal; (4) Meibografia com câmera de infravermelho para avaliar as glândulas de Meibômio; (5) Classificação do fenótipo de olho seco (evaporativo, aquoso-deficiente ou misto) conforme o protocolo TFOS DEWS III; (6) Elaboração do plano terapêutico escalonado com explicação em linguagem clara. Você sai da consulta com diagnóstico, imagens e plano de tratamento em mãos.',
  },
  {
    question: 'Quanto tempo dura a consulta e preciso de encaminhamento?',
    answer:
      'A consulta dura em média 60 minutos. Não é necessário encaminhamento médico — você pode agendar diretamente pelo WhatsApp ou pelo formulário desta página. Toda a avaliação é realizada em um único local: anamnese, questionários, exames e meibografia. Não é necessário comparecer em dias diferentes nem realizar exames prévios em outros serviços.',
  },
  {
    question: 'Quais exames são realizados na primeira consulta?',
    answer:
      'Os exames realizados incluem: Tempo de Ruptura do Filme Lacrimal (TBUT/FBUT) — avalia a estabilidade lacrimal; Meniscometria — mede o volume de lágrima disponível; Coloração com Lisamina Verde — detecta dano epitelial na superfície ocular; Meibografia por infravermelho — visualiza a estrutura das glândulas de Meibômio; Avaliação biomicroscópica com lâmpada de fenda — examina pálpebras, margens palpebrais e córnea; e quando indicado, Teste de Schirmer para medir a produção lacrimal. Os resultados e as imagens são analisados ainda na consulta e você recebe o relatório no mesmo dia.',
  },
  {
    question: 'Os resultados dos exames saem no mesmo dia?',
    answer:
      'Sim. Todos os exames realizados na consulta de olho seco têm resultado imediato. As imagens da meibografia são analisadas durante a própria consulta, e o plano terapêutico é definido e explicado ao final do atendimento. Você não precisa aguardar retorno posterior para saber o diagnóstico ou iniciar o tratamento.',
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
  '@type': 'MedicalClinic',
  name: 'Saraiva Vision — Centro de Olho Seco',
  description:
    'Consulta especializada de primeira vez para olho seco em Caratinga, MG. Avaliação completa com meibografia, protocolo TFOS DEWS III e plano de tratamento personalizado no mesmo dia.',
  url: 'https://saraivavision.com.br',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Caratinga',
    addressRegion: 'MG',
    addressCountry: 'BR',
  },
  medicalSpecialty: [
    { '@type': 'MedicalSpecialty', name: 'Ophthalmology' },
    { '@type': 'MedicalSpecialty', name: 'Dry Eye Disease' },
  ],
  availableService: [
    {
      '@type': 'MedicalProcedure',
      name: 'Consulta de Olho Seco — Primeira Vez',
      procedureType: 'https://schema.org/DiagnosticProcedure',
    },
    {
      '@type': 'MedicalProcedure',
      name: 'Meibografia',
      procedureType: 'https://schema.org/DiagnosticProcedure',
    },
    {
      '@type': 'MedicalProcedure',
      name: 'Protocolo TFOS DEWS III',
      procedureType: 'https://schema.org/DiagnosticProcedure',
    },
  ],
};

// --- Main Component ---

const ConsultaOlhoSecoPage = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        title="Primeira Consulta de Olho Seco em Caratinga | Avaliação Completa | Saraiva Vision"
        description="Sua primeira consulta especializada em olho seco em Caratinga, MG. Avaliação completa com meibografia, TFOS DEWS III e plano de tratamento personalizado. Agende sua avaliação gratuita."
        keywords="consulta olho seco Caratinga, primeira consulta oftalmologista, avaliação olho seco, oftalmologista especializado olho seco MG"
        structuredData={STRUCTURED_DATA}
      />
      <FAQSchema faqs={FAQS} />

      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32">

        {/* ── Hero Section ────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-cyan-50 via-white to-sky-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16">

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Não precisa de encaminhamento</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 text-cyan-700 px-4 py-2 text-sm font-semibold">
                <Zap className="w-4 h-4" />
                <span>Resultado dos exames no mesmo dia</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Left: Copy */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  Primeira Consulta de{' '}
                  <span className="text-cyan-700">Olho Seco</span>{' '}
                  em Caratinga — Avaliação Completa em 60 Minutos
                </h1>

                <p className="text-lg text-slate-700 leading-relaxed">
                  Ardência, sensação de areia, visão embaçada ou cansaço visual com telas podem ser
                  sinais de Doença do Olho Seco. Nossa consulta de primeira vez inclui meibografia,
                  exames objetivos do filme lacrimal e plano terapêutico personalizado — tudo em um
                  único atendimento.
                </p>

                {/* Key differentiators */}
                <div className="space-y-3">
                  {[
                    'Avaliação completa com meibografia inclusa desde a primeira consulta',
                    'Diagnóstico baseado no protocolo TFOS DEWS III (referência mundial)',
                    'Resultados e imagens dos exames no mesmo dia',
                    'Sem encaminhamento médico — agende diretamente',
                    'Plano de tratamento personalizado ao final da consulta',
                    'Pioneiros em meibografia em Caratinga e região',
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
                    Dr. Philipe Saraiva CRM-MG 69.870
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm text-sm font-semibold text-slate-800">
                    <Users className="w-4 h-4 text-slate-500" />
                    Caratinga, MG
                  </div>
                </div>

                {/* Medical disclaimer */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900 leading-relaxed">
                    As informações desta página são de caráter educativo. O diagnóstico de olho seco
                    e o plano de tratamento são definidos exclusivamente pelo médico durante a
                    consulta presencial.
                  </p>
                </div>
              </div>

              {/* Right: Lead Capture Form */}
              <div>
                <LeadCaptureForm
                  symptomOptions={SYMPTOM_OPTIONS}
                  pageContext="Consulta de Olho Seco — Primeira Vez"
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
                O que torna esta consulta diferente
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Uma avaliação de olho seco completa, não um atendimento genérico de retina ou
                cirurgia. Cada item abaixo faz parte de toda primeira consulta.
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
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                            {benefit.highlight}
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

        {/* ── What to Expect ───────────────────────────────────────────── */}
        <section
          className="py-16 bg-gradient-to-br from-slate-50 via-white to-cyan-50"
          aria-labelledby="exams-title"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Exam list */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-4 py-2 text-sm font-semibold">
                  <Microscope className="w-4 h-4" />
                  <span>O que você vai fazer na consulta</span>
                </div>
                <h2
                  id="exams-title"
                  className="text-3xl md:text-4xl font-bold text-slate-900"
                >
                  Exames realizados na primeira visita
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  Todos os exames abaixo são realizados em um único atendimento de 60 minutos, sem
                  necessidade de retorno em outro dia. Nenhum deles é invasivo ou doloroso.
                </p>
                <div className="space-y-3">
                  {EXAM_STEPS.map(({ code, name, detail }) => (
                    <div
                      key={code}
                      className="flex gap-4 items-start rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="w-12 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {code}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{name}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What you receive */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-cyan-200 bg-white p-8 space-y-6 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900">
                    O que você recebe ao sair da consulta
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        icon: Eye,
                        item: 'Diagnóstico de fenótipo',
                        detail:
                          'Classificação do seu tipo de olho seco: evaporativo (DGM), aquoso-deficiente ou misto.',
                      },
                      {
                        icon: Microscope,
                        item: 'Imagens da meibografia',
                        detail:
                          'Fotografias das suas glândulas de Meibômio para comparação em consultas futuras.',
                      },
                      {
                        icon: ClipboardList,
                        item: 'Plano terapêutico escalonado',
                        detail:
                          'Quais tratamentos iniciar, em que ordem e quando reavaliar — em linguagem simples.',
                      },
                      {
                        icon: FileText,
                        item: 'Relatório clínico padronizado',
                        detail:
                          'Documento com resultados dos exames para compartilhar com outros especialistas se necessário.',
                      },
                      {
                        icon: Droplets,
                        item: 'Orientações de higiene palpebral',
                        detail:
                          'Técnica correta de compressas mornas e limpeza das margens palpebrais para uso domiciliar.',
                      },
                    ].map(({ icon: Icon, item, detail }) => (
                      <div
                        key={item}
                        className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-cyan-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{item}</p>
                          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* No referral notice */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <h3 className="font-bold text-lg">Não precisa de encaminhamento</h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Você pode agendar a consulta diretamente pelo WhatsApp ou pelo formulário acima.
                    Não é necessário passar pelo clínico geral, obter guia de plano de saúde ou
                    aguardar encaminhamento de outro especialista.
                  </p>
                  <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Agendamento direto, sem burocracia
                  </div>
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
                    Entenda o olho seco antes da sua consulta
                  </h2>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                O Dr. Philipe Saraiva explica em linguagem acessível o que é a Doença do Olho Seco,
                como é feito o diagnóstico, quais exames são usados e os tratamentos disponíveis
                em Caratinga. Uma boa forma de chegar à consulta já mais informado.
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
              <h2 id="faq-title" className="text-3xl font-bold text-slate-900 mb-3">
                Dúvidas sobre a primeira consulta
              </h2>
              <p className="text-slate-600">
                O que pacientes costumam perguntar antes de agendar.
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
              Agende sua Avaliação Gratuita de 15min via WhatsApp
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              Uma conversa rápida para entender seu caso, tirar dúvidas sobre a consulta e confirmar
              a disponibilidade de agenda — sem compromisso e sem custo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://wa.me/5533998601427?text=Ol%C3%A1%21+Gostaria+de+agendar+uma+avalia%C3%A7%C3%A3o+gratuita+de+15+min+para+Consulta+de+Olho+Seco+%E2%80%94+Primeira+Vez."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all text-lg"
                aria-label="Agendar avaliação gratuita de olho seco via WhatsApp"
              >
                <MessageCircle className="w-6 h-6" />
                Falar no WhatsApp agora
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-2 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Sem encaminhamento
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Resultado no mesmo dia
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Caratinga, MG
              </span>
            </div>
          </div>
        </section>

      </main>

      <EnhancedFooter />
    </div>
  );
};

export default ConsultaOlhoSecoPage;
