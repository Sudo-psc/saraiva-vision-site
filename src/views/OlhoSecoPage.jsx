import React, { lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';
import { Button } from '@/components/ui/button.jsx';
import { Droplets, ShieldCheck, CheckCircle, Microscope, Timer, Activity, Leaf, Sparkles, ArrowRight, Gauge, AlertCircle, Layers, Eye, Sun, Droplet, Zap, Brain, Award, MapPin, Star, ClipboardCheck, TrendingUp, Loader2, Info, Headphones } from 'lucide-react';

// Lazy load dos componentes interativos para melhor performance
const SymptomChecklist = lazy(() => import('@/components/olhoseco/SymptomChecklist'));
const IRPLProgressSimulator = lazy(() => import('@/components/olhoseco/IRPLProgressSimulator'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-12 bg-slate-50 rounded-2xl border border-slate-200">
    <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
    <span className="ml-3 text-slate-600">Carregando...</span>
  </div>
);

const OlhoSecoPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const diagnosticItems = React.useMemo(
    () => [
      {
        title: t('olhoSeco.diagnosticItems.0.title'),
        description: t('olhoSeco.diagnosticItems.0.description'),
        icon: Microscope
      },
      {
        title: t('olhoSeco.diagnosticItems.1.title'),
        description: t('olhoSeco.diagnosticItems.1.description'),
        icon: Timer
      },
      {
        title: t('olhoSeco.diagnosticItems.2.title'),
        description: t('olhoSeco.diagnosticItems.2.description'),
        icon: Gauge
      },
      {
        title: t('olhoSeco.diagnosticItems.3.title'),
        description: t('olhoSeco.diagnosticItems.3.description'),
        icon: Sparkles
      },
      {
        title: t('olhoSeco.diagnosticItems.4.title'),
        description: t('olhoSeco.diagnosticItems.4.description'),
        icon: Droplets
      },
      {
        title: t('olhoSeco.diagnosticItems.5.title'),
        description: t('olhoSeco.diagnosticItems.5.description'),
        icon: Activity
      }
    ],
    [t]
  );

  // Schema.org MedicalCondition for Dry Eye Disease
  const medicalConditionSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: 'Síndrome do Olho Seco',
    alternateName: ['Dry Eye Disease', 'DED', 'Olho Seco Evaporativo', 'Doença do Olho Seco'],
    description: 'Condição multifatorial da superfície ocular caracterizada por perda da homeostase do filme lacrimal, causando sintomas oculares como desconforto, alterações visuais e potencial dano à superfície ocular.',
    associatedAnatomy: {
      '@type': 'AnatomicalStructure',
      name: 'Superfície Ocular',
      subStructure: [
        { '@type': 'AnatomicalStructure', name: 'Glândulas de Meibômio' },
        { '@type': 'AnatomicalStructure', name: 'Filme Lacrimal' },
        { '@type': 'AnatomicalStructure', name: 'Córnea' }
      ]
    },
    cause: [
      { '@type': 'MedicalCause', name: 'Disfunção das Glândulas de Meibômio (DGM)' },
      { '@type': 'MedicalCause', name: 'Deficiência aquosa' },
      { '@type': 'MedicalCause', name: 'Uso prolongado de telas' },
      { '@type': 'MedicalCause', name: 'Envelhecimento' }
    ],
    signOrSymptom: [
      { '@type': 'MedicalSignOrSymptom', name: 'Ardência ocular' },
      { '@type': 'MedicalSignOrSymptom', name: 'Sensação de areia nos olhos' },
      { '@type': 'MedicalSignOrSymptom', name: 'Visão embaçada' },
      { '@type': 'MedicalSignOrSymptom', name: 'Lacrimejamento paradoxal' }
    ],
    possibleTreatment: [
      { '@type': 'MedicalTherapy', name: 'IRPL E-Eye' },
      { '@type': 'MedicalTherapy', name: 'Plugs Lacrimais' },
      { '@type': 'MedicalTherapy', name: 'Colírios Lubrificantes' },
      { '@type': 'MedicalTherapy', name: 'Microesfoliação Palpebral' }
    ],
    relevantSpecialty: {
      '@type': 'MedicalSpecialty',
      name: 'Ophthalmology'
    }
  };

  const seo = {
    title: 'Centro Especializado em Olho Seco em Caratinga | TFOS DEWS III | Saraiva Vision',
    description: 'Serviço especializado em olho seco em Caratinga, com diagnóstico completo e meibografia, seguindo protocolos TFOS DEWS III e documentação fotográfica seriada.',
    keywords: 'olho seco em Caratinga, meibografia em Caratinga, serviço especializado em olho seco em Caratinga, TFOS DEWS III, meibografia, FBUT, meniscometria, lisamina verde, Schirmer, plugs lacrimais, microesfoliação palpebral, tratamento olho seco, síndrome olho seco',
    structuredData: medicalConditionSchema
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 scroll-block-internal">
        <section className="bg-gradient-to-br from-cyan-50 via-white to-sky-50">
          <div className="max-w-[90rem] mx-auto px-6 lg:px-12 py-12 lg:py-16 space-y-10">
            {/* Hero Section */}
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-semibold w-fit">
                <ShieldCheck className="w-4 h-4" />
                <span>Base científica TFOS DEWS III (2025)</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                <div className="lg:col-span-3 space-y-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                    Centro Especializado em Olho Seco em Caratinga
                  </h1>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Serviço especializado em olho seco em Caratinga, pioneiro em meibografia na cidade, com protocolos diagnósticos alinhados ao TFOS DEWS III para investigação objetiva da superfície ocular, filme lacrimal e vias lacrimais.
                  </p>
                  <div className="text-base text-slate-700 leading-relaxed">
                    Conheça a{' '}
                    <Link
                      to="/meibografia"
                      className="inline-flex items-center gap-2 font-semibold text-cyan-700 hover:text-cyan-800 transition-transform duration-200 hover:scale-105"
                      aria-label="Clique para saber mais sobre o exame de meibografia"
                      title="Clique para saber mais sobre o exame de meibografia"
                    >
                      <img
                        src="/img/meibografia icon.png"
                        alt="Clique para saber mais sobre o exame de meibografia"
                        className="w-5 h-5 object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="underline decoration-cyan-300 underline-offset-4">meibografia</span>
                    </Link>
                    , exame essencial para documentar a função meibomiana e acompanhar a DGM com imagens seriadas.
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                      <Droplets className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-semibold text-slate-800">Meibografia em Caratinga</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                      <Microscope className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-semibold text-slate-800">Diagnóstico objetivo e rastreável</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                      <CheckCircle className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-semibold text-slate-800">Acompanhamento fotográfico seriado</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      onClick={() => navigate('/agendamento')}
                      className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white px-6 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl"
                    >
                      {t('navbar.schedule')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/servicos')}
                      className="border-cyan-600 text-cyan-700 hover:bg-cyan-50 px-6 py-3 rounded-xl text-base font-semibold"
                    >
                      {t('olhoSecoPage.viewAllServices')}
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-cyan-600 text-cyan-700 hover:bg-cyan-50 px-6 py-3 rounded-xl text-base font-semibold"
                    >
                      <Link to="/blog?category=Olho%20Seco">
                        Ler artigos sobre Olho Seco
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-soft-light space-y-4">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-10 h-10 text-cyan-600" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-600">Linha avançada</p>
                      <p className="text-xl font-bold text-slate-900">Programa olho seco em Caratinga</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <p>Classificação por fenótipo evaporativo, aquoso e neurossensorial.</p>
                    <p>Diagnóstico completo em um único local, com exames objetivos e documentação rastreável.</p>
                    <p>Integração de imagem e dados seriados para acompanhamento da DGM.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-600" />
                      <span>CFM e LGPD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-cyan-600" />
                      <span>Relatórios padronizados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Microscope className="w-4 h-4 text-cyan-600" />
                      <span>Documentação fotográfica</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-600" />
                      <span>Conforto e higiene guiada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-light p-8 lg:p-10 space-y-8">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-cyan-700" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Por que este serviço é diferente?</h2>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 text-slate-700">
                <li className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <Microscope className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Pioneirismo em meibografia na cidade, com documentação fotográfica de alta definição.</span>
                </li>
                <li className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <Star className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Único serviço local dedicado exclusivamente ao olho seco em Caratinga.</span>
                </li>
                <li className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Protocolos diagnósticos alinhados ao TFOS DEWS III com critérios internacionais.</span>
                </li>
                <li className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Registro e acompanhamento fotográfico seriado da DGM para seguimento estruturado.</span>
                </li>
                <li className="flex flex-col gap-3 bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <Eye className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Avaliação integrada da superfície ocular e das vias lacrimais no mesmo local.</span>
                </li>
              </ul>
            </div>

            {/* SECTION: O que é a Doença do Olho Seco? */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 lg:p-10 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-amber-500" />
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">O que é a Doença do Olho Seco?</h2>
                  </div>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    A Doença do Olho Seco é uma condição multifatorial da superfície ocular caracterizada pela perda da homeostase (equilíbrio) do filme lacrimal. É acompanhada por sintomas oculares, onde a instabilidade da lágrima, a hiperosmolaridade, a inflamação e danos na superfície ocular, bem como anormalidades neurossensoriais, desempenham papéis causais.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: Eye, text: "Sensação de areia ou corpo estranho" },
                      { icon: Sun, text: "Ardor, queimação e fotofobia" },
                      { icon: Activity, text: "Visão embaçada que oscila" },
                      { icon: Droplet, text: "Lacrimejamento excessivo (paradoxal)" },
                      { icon: AlertCircle, text: "Vermelhidão e irritação crônica" },
                      { icon: Layers, text: "Cansaço visual em telas" }
                    ].map((symptom, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <symptom.icon className="w-5 h-5 text-cyan-600 shrink-0" />
                        <span className="text-sm font-medium text-slate-700">{symptom.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative group">
                  <img 
                    src="/E-eye/sintomas-olho-seco.jpeg" 
                    alt="Infográfico de sintomas do olho seco" 
                    className="rounded-2xl shadow-xl w-full object-cover border border-slate-200 transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-slate-100 hidden md:flex items-center gap-3 max-w-xs">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Sintomas persistentes exigem avaliação clínica especializada.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW SECTION: Anatomia do Filme Lacrimal */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-10 space-y-10">
              <div className="max-w-[60rem]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-cyan-100 p-2 rounded-lg">
                    <Layers className="w-6 h-6 text-cyan-700" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Anatomia do Filme Lacrimal</h2>
                </div>
                <p className="text-lg text-slate-700 leading-relaxed">
                  Para que a visão seja nítida e confortável, a superfície do olho deve estar constantemente coberta por uma película de lágrima estável. Esta lágrima não é apenas "água", mas uma estrutura complexa composta por três camadas principais:
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6 order-2 lg:order-1">
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-5 rounded-xl border-l-4 border-cyan-500">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs">1</span>
                        Camada Lipídica (Gordurosa)
                      </h3>
                      <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                        Produzida pelas Glândulas de Meibômio, esta camada externa impede a evaporação precoce da lágrima. Sua deficiência (DGM) é causa de 86% dos casos de olho seco.
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 p-5 rounded-xl border-l-4 border-blue-500">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
                        Camada Aquosa
                      </h3>
                      <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                        Produzida pelas glândulas lacrimais, compõe o volume da lágrima, fornecendo nutrientes e proteção contra infecções.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-xl border-l-4 border-sky-500">
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs">3</span>
                        Camada de Mucina
                      </h3>
                      <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                        Permite que a lágrima se espalhe uniformemente e "grude" na superfície da córnea, garantindo a estabilidade.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900">
                      <strong>Dica:</strong> A maioria das pessoas com olho seco sofre de um problema na <strong>camada lipídica</strong>, causado pela Disfunção das Glândulas de Meibômio (DGM).
                    </p>
                  </div>
                </div>

                <div className="space-y-6 order-1 lg:order-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <img 
                        src="/E-eye/anatomia_lagrima.jpeg" 
                        alt="Anatomia do filme lacrimal" 
                        className="rounded-xl border border-slate-200 shadow-md w-full"
                      />
                      <p className="text-[10px] text-slate-500 text-center italic uppercase tracking-wider">Estrutura do Filme Lacrimal</p>
                    </div>
                    <div className="space-y-2">
                      <img 
                        src="/E-eye/anatomia_DGM-lagrima.jpeg" 
                        alt="Anatomia DGM e Lágrima" 
                        className="rounded-xl border border-slate-200 shadow-md w-full"
                      />
                      <p className="text-[10px] text-slate-500 text-center italic uppercase tracking-wider">Glândulas de Meibômio e Estabilidade</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW SECTION: Autoavaliação Interativa */}
            <div className="bg-gradient-to-br from-cyan-50 via-white to-sky-50 rounded-2xl border border-cyan-200 p-8 lg:p-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Texto explicativo */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
                      <ClipboardCheck className="w-6 h-6 text-cyan-700" />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Avalie seus Sintomas</h2>
                      <p className="text-cyan-600 font-medium">Autoavaliação interativa de gravidade</p>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    Utilize nossa ferramenta de autoavaliação para identificar a gravidade dos seus sintomas de olho seco.
                    Responda algumas perguntas simples e receba uma orientação personalizada baseada nas suas respostas.
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Avaliação Rápida</p>
                        <p className="text-sm text-slate-600">10 perguntas objetivas sobre seus sintomas diários</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200">
                      <TrendingUp className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Resultado Instantâneo</p>
                        <p className="text-sm text-slate-600">Classificação de gravidade e recomendações personalizadas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200">
                      <ShieldCheck className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">Base Científica</p>
                        <p className="text-sm text-slate-600">Inspirado no questionário OSDI validado clinicamente</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Lembre-se:</strong> Esta autoavaliação é apenas para orientação e não substitui uma consulta médica profissional. Para diagnóstico preciso, agende uma avaliação completa.
                    </p>
                  </div>
                </div>

                {/* Checklist Interativo */}
                <div>
                  <Suspense fallback={<LoadingFallback />}>
                    <SymptomChecklist />
                  </Suspense>
                </div>
              </div>
            </div>

            {/* MODIFIED: Tratamento Escalonado (TFOS DEWS) - Moved to full width */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-light p-8 lg:p-10 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Layers className="w-8 h-8 text-cyan-700" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Tratamento Escalonado</h2>
                    <p className="text-slate-500">Baseado no relatório de manejo e terapia do TFOS DEWS III</p>
                  </div>
                </div>
                <img 
                  src="/E-eye/icone_olho_seco_tratamento.jpeg" 
                  alt="Ícone de tratamento de olho seco" 
                  className="w-16 h-16 rounded-lg object-cover border border-slate-100 shadow-sm hidden md:block"
                />
              </div>
              
              <p className="text-slate-700 leading-relaxed max-w-4xl">
                Adotamos uma abordagem terapêutica em degraus, ajustando a intensidade do tratamento conforme a severidade dos sinais e sintomas. O objetivo é restaurar o equilíbrio da superfície ocular de forma progressiva e personalizada.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Nível 1 */}
                <div className="border-t-4 border-emerald-400 bg-emerald-50/50 p-5 rounded-b-xl hover:shadow-md transition-shadow h-full flex flex-col">
                  <h3 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                    <span className="bg-emerald-200 text-emerald-800 text-xs px-2 py-0.5 rounded-full shrink-0">Nível 1</span>
                    Educação & Modificações
                  </h3>
                  <ul className="text-sm text-slate-700 space-y-2 list-disc pl-4 marker:text-emerald-500 flex-1">
                    <li>Educação sobre a condição, dieta e ambiente.</li>
                    <li>Higiene palpebral e compressas mornas.</li>
                    <li>Lágrimas artificiais (com conservantes leves ou sem).</li>
                    <li>Modificação de medicações sistêmicas (se possível).</li>
                  </ul>
                </div>

                {/* Nível 2 */}
                <div className="border-t-4 border-cyan-400 bg-cyan-50/50 p-5 rounded-b-xl hover:shadow-md transition-shadow h-full flex flex-col">
                  <h3 className="font-bold text-cyan-800 mb-3 flex items-center gap-2">
                    <span className="bg-cyan-200 text-cyan-800 text-xs px-2 py-0.5 rounded-full shrink-0">Nível 2</span>
                    Terapias Específicas
                  </h3>
                  <ul className="text-sm text-slate-700 space-y-2 list-disc pl-4 marker:text-cyan-500 flex-1">
                    <li>Lágrimas artificiais sem conservantes.</li>
                    <li>Tratamentos para Demodex (ácido hipocloroso).</li>
                    <li>Oclusão pontual (plugs lacrimais).</li>
                    <li>Terapias em consultório: Luz Pulsada (IPL) e pulsação térmica.</li>
                    <li>Medicamentos prescritos.</li>
                  </ul>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-cyan-100">
                    <img src="/E-eye/Icon_acdiohipocloroso.jpeg" alt="Ácido Hipocloroso" className="w-8 h-8 rounded shadow-sm border border-white" title="Tratamento para Demodex" />
                    <img src="/E-eye/icon_plugLacrimal.jpeg" alt="Plugs Lacrimais" className="w-8 h-8 rounded shadow-sm border border-white" title="Oclusão pontual" />
                  </div>
                </div>

                {/* Nível 3 */}
                <div className="border-t-4 border-sky-400 bg-sky-50/50 p-5 rounded-b-xl hover:shadow-md transition-shadow h-full flex flex-col">
                  <h3 className="font-bold text-sky-800 mb-3 flex items-center gap-2">
                    <span className="bg-sky-200 text-sky-800 text-xs px-2 py-0.5 rounded-full shrink-0">Nível 3</span>
                    Terapias Avançadas
                  </h3>
                  <ul className="text-sm text-slate-700 space-y-2 list-disc pl-4 marker:text-sky-500 flex-1">
                    <li>Colírio de soro autólogo (produzido a partir do sangue).</li>
                    <li>Lentes de contato terapêuticas ou esclerais.</li>
                    <li>Secretagogos orais.</li>
                  </ul>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-sky-100">
                    <img src="/E-eye/icon_lente_escleral.jpeg" alt="Lente Escleral" className="w-8 h-8 rounded shadow-sm border border-white" title="Lentes Esclerais" />
                  </div>
                </div>

                {/* Nível 4 */}
                <div className="border-t-4 border-rose-400 bg-rose-50/50 p-5 rounded-b-xl hover:shadow-md transition-shadow h-full flex flex-col">
                  <h3 className="font-bold text-rose-800 mb-3 flex items-center gap-2">
                    <span className="bg-rose-200 text-rose-800 text-xs px-2 py-0.5 rounded-full shrink-0">Nível 4</span>
                    Longo Prazo/Cirúrgico
                  </h3>
                  <ul className="text-sm text-slate-700 space-y-2 list-disc pl-4 marker:text-rose-500 flex-1">
                    <li>Corticosteroides tópicos de longa duração.</li>
                    <li>Enxerto de membrana amniótica.</li>
                    <li>Oclusão pontual cirúrgica (permanente).</li>
                    <li>Outras abordagens cirúrgicas.</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Segurança e rastreabilidade</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-full px-4 py-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Foco em conforto e visão funcional</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-light p-6 space-y-6 h-full">
                  <div className="flex items-center gap-3">
                    <Microscope className="w-6 h-6 text-cyan-700" />
                    <h2 className="text-2xl font-bold text-slate-900">Diagnóstico completo em um único local</h2>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    No serviço especializado em olho seco em Caratinga, a avaliação integra superfície ocular, filme lacrimal, vias lacrimais e função meibomiana, com dados objetivos e rastreáveis. Os exames seguem a terminologia e os fluxos decisórios do TFOS DEWS III para correlacionar sintomas, sinais e biomarcadores.
                  </p>
                  
                  {/* DIAGNOSTIC ITEMS GRID: Improved for better horizontal usage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {diagnosticItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="flex flex-col gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors h-full">
                          <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                            <p className="text-xs text-slate-700 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar moved content */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/10">
                      <img
                        src="/icons_social/Badge_TFOS_DEWSIII.png"
                        alt="Diretrizes TFOS DEWS III 2025"
                        className="w-9 h-9 object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-200 font-semibold">Autoridade científica</p>
                      <p className="text-xl font-bold">TFOS DEWS III (2025)</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed">
                    O TFOS DEWS III é o consenso internacional que define critérios diagnósticos e classificação clínica da Doença do Olho Seco. Ele orienta a interpretação conjunta de sintomas, sinais e testes objetivos.
                  </p>
                  <ul className="space-y-2 text-sm leading-relaxed">
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-300 mt-1" />
                      <span>Mais precisão diagnóstica ao integrar superfície ocular, filme lacrimal e função meibomiana.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-300 mt-1" />
                      <span>Documentação fotográfica e parâmetros mensuráveis para seguimento rastreável.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-300 mt-1" />
                      <span>Padronização clínica reconhecida mundialmente para olho seco.</span>
                    </li>
                  </ul>
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate('/agendamento')}
                      className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold"
                    >
                      Agendar avaliação completa de Olho Seco
                    </Button>
                    <p className="text-xs text-slate-200">
                      Diagnóstico objetivo e documentação fotográfica em todas as etapas.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-light p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Leaf className="w-5 h-5 text-cyan-700" />
                    <h3 className="text-xl font-bold text-slate-900">Cuidados contínuos</h3>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Seguimento programado com reavaliação de sintomas, estabilidade do filme lacrimal e ajuste terapêutico progressivo para manter a superfície ocular protegida.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-800">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">Higiene palpebral guiada</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">Lubrificação personalizada</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">Treino ambiental e digital</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">Reforço nutricional</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-light p-6 space-y-6">
              <div className="flex items-center gap-3">
                <Droplets className="w-6 h-6 text-cyan-700" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Meibografia e DGM</h2>
                  <p className="text-sm text-slate-500">Meibografia em Caratinga com documentação seriada</p>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">
                A Disfunção das Glândulas de Meibômio (DGM) é a principal causa de olho seco evaporativo. A{' '}
                <Link
                  to="/meibografia"
                  className="inline-flex items-center gap-2 font-semibold text-cyan-700 hover:text-cyan-800 transition-transform duration-200 hover:scale-105"
                  aria-label="Clique para saber mais sobre o exame de meibografia"
                  title="Clique para saber mais sobre o exame de meibografia"
                >
                  <img
                    src="/img/meibografia icon.png"
                    alt="Clique para saber mais sobre o exame de meibografia"
                    className="w-5 h-5 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="underline decoration-cyan-300 underline-offset-4">meibografia</span>
                </Link>
                {' '}permite visualizar, documentar e acompanhar a estrutura glandular ao longo do tempo, orientando decisões clínicas com base em imagens.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-slate-700">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-cyan-600" />
                  <span>Visualização detalhada das glândulas</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-cyan-600" />
                  <span>Registro fotográfico e comparativo</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-cyan-600" />
                  <span>Seguimento estruturado da DGM</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-cyan-600" />
                  <span>Disponível exclusivamente neste serviço</span>
                </div>
              </div>
            </div>

            {/* IRPL® - Reeducação Neurológica das Glândulas */}
            <div className="bg-gradient-to-br from-cyan-50 via-white to-sky-50 rounded-2xl border border-cyan-200 shadow-soft-light p-6 space-y-6">
                  {/* Badges de Pioneirismo */}
                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-4 py-2 text-sm font-semibold">
                      <Award className="w-4 h-4" />
                      <span>Pioneiros no Interior de MG</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 px-4 py-2 text-sm font-semibold">
                      <Star className="w-4 h-4" />
                      <span>Padrão Ouro Mundial</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-4 py-2 text-sm font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Não Invasivo e Seguro</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Como o IRPL® promove a reeducação neurológica das glândulas?</h2>
                      <p className="text-sm text-cyan-600 font-medium">Tecnologia E-Eye Francesa • Intense Regulated Pulsed Light</p>
                    </div>
                  </div>

                  {/* Video Section for IRPL */}
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border border-cyan-100 bg-slate-900 aspect-video mb-6">
                    <video
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full h-full object-cover"
                      poster="/E-eye/E-eye-equip.jpeg"
                    >
                      <source src="/Videos/E-EYE-IRPL-Treatment.mp4" type="video/mp4" />
                      Seu navegador não suporta a tag de vídeo.
                    </video>
                    <div className="absolute top-4 left-4 bg-cyan-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      Tecnologia E-Eye em Ação
                    </div>
                  </div>

                  {/* Destaque Exclusividade */}
                  <div className="bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-2">Exclusivo no Interior de Minas Gerais</h3>
                        <p className="text-cyan-100 text-sm leading-relaxed">
                          Somos <strong className="text-white">pioneiros no uso do IRPL®</strong> para tratamento de olho seco na região,
                          utilizando o equipamento <strong className="text-white">E-Eye de origem francesa</strong> — considerado
                          <strong className="text-white"> padrão ouro mundial</strong> para tratamento da Disfunção das Glândulas de Meibômio.
                          Procedimento não invasivo, seguro e com resultados duradouros.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    A tecnologia <strong className="text-cyan-700">IRPL® (Intense Regulated Pulsed Light)</strong>, utilizada em dispositivos como o E-Eye, promove a <strong>reeducação neurológica</strong> das glândulas de Meibômio através de um estímulo direto no sistema nervoso autônomo que controla a secreção glandular.
                  </p>

                  <p className="text-slate-700 leading-relaxed">
                    Diferente da luz pulsada (IPL) convencional, que atua principalmente por mecanismos térmicos e vasculares superficiais, o IRPL® foi especificamente projetado para atingir as <strong>vias neurais</strong> que regulam a Unidade Funcional Lacrimal.
                  </p>

                  {/* Mecanismo de Ação */}
                  <div className="bg-white rounded-xl border border-cyan-100 p-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-cyan-600" />
                      <h3 className="text-lg font-bold text-slate-900">O Mecanismo de Ação Neurológica</h3>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      A reeducação neurológica ocorre por meio dos seguintes processos fundamentais:
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-3 bg-cyan-50/50 p-4 rounded-lg border border-cyan-100">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm shrink-0">1</div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Alvo Anatômico Estratégico</h4>
                          <p className="text-sm text-slate-700">Os disparos de luz são aplicados nas <strong>regiões infraorbital e zigomática</strong> da face. Essas áreas são pontos de passagem de ramos do <strong>nervo parassimpático</strong>, que é o principal responsável por enviar ordens de secreção para as glândulas lacrimais e meibomianas.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 bg-cyan-50/50 p-4 rounded-lg border border-cyan-100">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm shrink-0">2</div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Microgradiente de Temperatura</h4>
                          <p className="text-sm text-slate-700">A tecnologia IRPL® utiliza sequências de <strong>pulsos de luz perfeitamente calibrados e "esculturados"</strong> (trens de pulsos). Um único disparo é composto por sub-pulsos com comprimentos de onda variados: alguns penetram até 4 mm na derme, enquanto outros (na faixa de 1200 nm) atingem níveis mais profundos, superiores a <strong>5 mm</strong>. Essa combinação cria um <strong>microgradiente de temperatura</strong> que atua sobre o tecido nervoso.</p>
                        </div>
                      </div>
                      <div className="flex gap-3 bg-cyan-50/50 p-4 rounded-lg border border-cyan-100">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold text-sm shrink-0">3</div>
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-1">Liberação de Neurotransmissores</h4>
                          <p className="text-sm text-slate-700">Esse gradiente térmico controlado estimula o <strong>neurônio pós-ganglionar</strong>, que está conectado aos gânglios parassimpáticos. Esse estímulo provoca a <strong>liberação de neurotransmissores</strong> específicos que interagem diretamente com as glândulas de Meibômio, "ordenando" que elas retomem sua atividade normal de secreção.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Restauração da Função */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-slate-900">Restauração da Função Glandular e Efeito Duradouro</h3>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Ao reativar a comunicação neurológica, o tratamento não apenas derrete o meibum (gordura) obstruído pelo calor, mas <strong className="text-emerald-700">restabelece o fluxo natural de lipídios</strong> e proteínas para o filme lacrimal.
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      Esse processo de "reeducação" justifica o porquê de o efeito ser <strong>cumulativo e de longa duração</strong>. Enquanto tratamentos puramente térmicos podem oferecer alívio por apenas algumas semanas, a estimulação neurológica do IRPL® visa a <strong className="text-emerald-700">restauração funcional sustentada</strong>, com benefícios que podem durar de <strong>6 meses a 3 anos</strong> após o ciclo inicial de tratamento (geralmente composto por 3 a 4 sessões).
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-full px-4 py-2 text-sm">
                        <Timer className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-slate-700">3-4 sessões iniciais</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-emerald-200 rounded-full px-4 py-2 text-sm">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-slate-700">Duração: 6 meses a 3 anos</span>
                      </div>
                    </div>
                  </div>

                  {/* Conclusão */}
                  <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
                    <p className="text-slate-100 leading-relaxed">
                      Em suma, o IRPL® não apenas limpa os "canos" (ductos) das glândulas, mas <strong className="text-sky-300">reativa o "interruptor" (nervo)</strong> que faz a fábrica glandular funcionar de forma autônoma e eficiente novamente.
                    </p>
                  </div>

                  {/* Analogia */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <span className="text-lg">💡</span>
                      </div>
                      <div>
                        <p className="text-sm text-amber-900 leading-relaxed italic">
                          <strong>Analogia:</strong> A reeducação neurológica pelo IRPL® é como restabelecer a energia elétrica e os comandos de um computador que estava travado: não basta apenas limpar o teclado (higiene) ou esquentar o processador (calor); é necessário enviar o sinal correto para que o sistema volte a processar as informações e funcionar por conta própria.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA para página dedicada IRPL */}
                  <Link
                    to="/luz-pulsada-irpl"
                    className="group block bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-700 hover:via-sky-700 hover:to-blue-700 text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-amber-300" />
                          <span className="text-sm font-semibold text-cyan-200 uppercase tracking-wide">Tecnologia Exclusiva</span>
                        </div>
                        <h3 className="text-xl font-bold">Conheça o Tratamento IRPL® E-Eye</h3>
                        <p className="text-sky-100 text-sm">
                          Saiba mais sobre o tratamento revolucionário de luz pulsada para olho seco. Pioneiros no interior de Minas Gerais.
                        </p>
                      </div>
                      <div className="ml-4 shrink-0">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <ArrowRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Podcast sobre IRPL */}
                  <div className="bg-white rounded-xl border border-cyan-100 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center">
                        <Headphones className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-cyan-600 font-semibold uppercase tracking-wider">Podcast</p>
                        <h4 className="font-bold text-slate-900 text-sm">Ouça sobre o IRPL E-Eye</h4>
                      </div>
                    </div>
                    <iframe
                      style={{ borderRadius: '12px' }}
                      src="https://open.spotify.com/embed/episode/3y3EDK6kGHoXQgwm5W1kVp?utm_source=generator&t=0"
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      title="Podcast IRPL E-Eye para Olho Seco"
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium">IRPL</span>
                        <span className="px-2 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium">E-Eye</span>
                        <span className="px-2 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium">DGM</span>
                      </div>
                      <Link to="/podcast" className="text-xs text-cyan-600 hover:text-cyan-800 font-medium flex items-center gap-1">
                        Mais episódios <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>

                  {/* Simulador de Melhora IRPL */}
                  <div className="mt-6">
                    <Suspense fallback={<LoadingFallback />}>
                      <IRPLProgressSimulator />
                    </Suspense>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/10">
                      <img
                        src="/icons_social/Badge_TFOS_DEWSIII.png"
                        alt="Diretrizes TFOS DEWS III 2025"
                        className="w-9 h-9 object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-emerald-200 font-semibold">Autoridade científica</p>
                      <p className="text-xl font-bold">TFOS DEWS III (2025)</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-100 leading-relaxed">
                    O TFOS DEWS III é o consenso internacional que define critérios diagnósticos e classificação clínica da Doença do Olho Seco. Ele orienta a interpretação conjunta de sintomas, sinais e testes objetivos.
                  </p>
                  <ul className="space-y-2 text-sm leading-relaxed">
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-300 mt-1" />
                      <span>Mais precisão diagnóstica ao integrar superfície ocular, filme lacrimal e função meibomiana.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-300 mt-1" />
                      <span>Documentação fotográfica e parâmetros mensuráveis para seguimento rastreável.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-300 mt-1" />
                      <span>Padronização clínica reconhecida mundialmente para olho seco.</span>
                    </li>
                  </ul>
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate('/agendamento')}
                      className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold"
                    >
                      Agendar avaliação completa de Olho Seco
                    </Button>
                    <p className="text-xs text-slate-200">
                      Diagnóstico objetivo e documentação fotográfica em todas as etapas.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-light p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Leaf className="w-5 h-5 text-cyan-700" />
                    <h3 className="text-xl font-bold text-slate-900">Cuidados contínuos</h3>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Seguimento programado com reavaliação de sintomas, estabilidade do filme lacrimal e ajuste terapêutico progressivo para manter a superfície ocular protegida.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-800">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">Higiene palpebral guiada</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">Lubrificação personalizada</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">Treino ambiental e digital</div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">Reforço nutricional</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 lg:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-[60rem]">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Agende uma avaliação completa de olho seco em Caratinga</h2>
                <p className="text-slate-700 leading-relaxed">
                  Diagnóstico objetivo e documentação fotográfica da DGM, com protocolos alinhados ao TFOS DEWS III e acompanhamento seriado da superfície ocular.
                </p>
              </div>
              <Button
                onClick={() => navigate('/agendamento')}
                className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white px-6 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl"
              >
                Agendar avaliação completa de Olho Seco
              </Button>
            </div>
          </div>
        </section>
      </main>
      <EnhancedFooter />
    </div>
  );
};

export default OlhoSecoPage;
