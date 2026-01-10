import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';
import { Button } from '@/components/ui/button.jsx';
import {
  Zap,
  ShieldCheck,
  CheckCircle,
  Clock,
  Award,
  MapPin,
  Brain,
  Activity,
  Timer,
  Sparkles,
  ArrowRight,
  Eye,
  Star,
  BadgeCheck,
  Heart,
  Info,
  X,
  Search,
  Headphones
} from 'lucide-react';

const IRPLPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showNeuroModal, setShowNeuroModal] = useState(false);

  // Schema.org MedicalProcedure for IRPL treatment
  const medicalProcedureSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: 'IRPL E-Eye - Luz Pulsada Regulada para Olho Seco',
    alternateName: ['Intense Regulated Pulsed Light', 'IRPL para DGM', 'Luz Pulsada Oftalmológica'],
    procedureType: 'http://schema.org/NoninvasiveProcedure',
    description: 'Tratamento não invasivo de luz pulsada regulada (IRPL) com dispositivo E-Eye para Disfunção das Glândulas de Meibômio (DGM) e olho seco evaporativo. Tecnologia francesa aprovada pela ANVISA.',
    howPerformed: 'Aplicação de pulsos de luz calibrados nas regiões infraorbital e zigomática, estimulando vias neurológicas para restaurar a função das glândulas de Meibômio.',
    preparation: 'Avaliação completa com meibografia, aplicação de gel protetor e óculos de segurança.',
    followup: 'Protocolo de 3-4 sessões com intervalos de 2-4 semanas, seguido de manutenção anual conforme avaliação.',
    status: 'http://schema.org/ActiveActionStatus',
    bodyLocation: 'Região periocular (infraorbital e zigomática)',
    relevantSpecialty: {
      '@type': 'MedicalSpecialty',
      name: 'Ophthalmology'
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
        addressCountry: 'BR'
      },
      telephone: '+55-33-99860-1427'
    }
  };

  const seo = {
    title: 'IRPL E-Eye para Olho Seco e DGM em Caratinga | Saraiva Vision',
    description: 'IRPL E-Eye para olho seco e Disfunção das Glândulas de Meibômio (DGM) em Caratinga, MG. Tecnologia aprovada pela ANVISA, não invasiva, com avaliação completa da superfície ocular.',
    keywords: 'IRPL Caratinga, E-Eye Caratinga, olho seco Caratinga, DGM Caratinga, disfunção glândulas de Meibômio, meibografia Caratinga, luz pulsada oftalmológica, oftalmologista Caratinga, TFOS DEWS III, tratamento olho seco luz pulsada, luz intensa pulsada oftalmologia',
    structuredData: medicalProcedureSchema
  };

  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Não Invasivo',
      description: 'Aplicado na região periocular, sem cortes e sem contato direto com a superfície ocular.'
    },
    {
      icon: Clock,
      title: 'Sessões Objetivas',
      description: 'Atendimento em consultório, com tempo curto por sessão e retorno à rotina no mesmo dia.'
    },
    {
      icon: Timer,
      title: 'Controle Sustentado',
      description: 'Pode contribuir para estabilidade do filme lacrimal com acompanhamento e manutenção individualizados.'
    },
    {
      icon: Brain,
      title: 'Estímulo Funcional',
      description: 'Atua em vias neurológicas relacionadas à secreção meibomiana, com base em evidências clínicas.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Avaliação Completa',
      description: 'Diagnóstico com meibografia, classificação do fenótipo e definição do protocolo personalizado.'
    },
    {
      number: '02',
      title: 'Preparação',
      description: 'Aplicação de gel protetor e óculos de segurança. O procedimento é realizado em consultório.'
    },
    {
      number: '03',
      title: 'Aplicação IRPL',
      description: 'Pulsos de luz calibrados nas regiões infraorbital e zigomática. Indolor e confortável.'
    },
    {
      number: '04',
      title: 'Protocolo Completo',
      description: 'Em geral 3 a 4 sessões, com intervalos de 2 a 4 semanas. Manutenção conforme avaliação.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 scroll-block-internal">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cyan-50 via-white to-sky-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-4 py-2 text-sm font-semibold">
                    <Award className="w-4 h-4" />
                    <span>Exclusivo no interior de MG</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 px-4 py-2 text-sm font-semibold">
                    <Star className="w-4 h-4" />
                    <span>IRPL E-Eye • DGM</span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  IRPL E-Eye para <span className="text-cyan-600">Olho Seco e DGM</span> em Caratinga
                </h1>

                <p className="text-lg text-slate-700 leading-relaxed">
                  Tecnologia de luz pulsada regulada (<strong>IRPL®</strong>) com dispositivo E-Eye, aprovada pela
                  ANVISA, indicada para manejo do olho seco relacionado à Disfunção das Glândulas de Meibômio.
                  Na literatura, é reconhecida como padrão-ouro não invasivo para DGM.
                  O protocolo é não invasivo e faz parte de um plano clínico individualizado, conforme avaliação
                  da superfície ocular.
                </p>

                  <div className="flex items-center gap-3 bg-white border border-cyan-200 rounded-xl p-4 shadow-sm">
                    <MapPin className="w-6 h-6 text-cyan-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Disponível em Caratinga e região</p>
                      <p className="text-sm text-slate-600">Disponibilidade exclusiva no interior de Minas Gerais</p>
                    </div>
                  </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => navigate('/agendamento')}
                    className="bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white px-6 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl"
                  >
                    Agendar Avaliação de Olho Seco
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/olho-seco')}
                    className="border-cyan-600 text-cyan-700 hover:bg-cyan-50 px-6 py-3 rounded-xl text-base font-semibold"
                  >
                    Ver Programa Olho Seco
                  </Button>
                </div>
              </div>

              {/* Card E-Eye com Imagem do Equipamento */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 shadow-2xl">
                {/* Imagem do Equipamento E-Eye */}
                <div className="relative rounded-xl overflow-hidden mb-6 border border-white/20">
                  <img
                    src="/E-eye/e-eye-equipAnvisa.jpeg"
                    alt="Equipamento E-Eye IRPL com certificação ANVISA - tecnologia francesa para tratamento de olho seco"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                    ANVISA Aprovado
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-cyan-300 font-semibold">Tecnologia E-Eye</p>
                    <p className="text-2xl font-bold">IRPL® Francês</p>
                  </div>
                </div>

                <p className="text-slate-300 mb-6 leading-relaxed">
                  O E-Eye utiliza a tecnologia IRPL® (Intense Regulated Pulsed Light), desenvolvida para
                  uso oftalmológico na DGM. A indicação é feita após avaliação clínica e diagnóstico da
                  superfície ocular.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <span>Aprovado pela ANVISA e CE Mark</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <span>Equipamento médico dedicado à oftalmologia</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <span>Protocolos alinhados a diretrizes internacionais</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <span>Diferente do IPL convencional (estético)</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <p className="text-sm text-cyan-200">
                    <strong className="text-white">Importante:</strong> IRPL® não é IPL estético.
                    O objetivo é atuar na DGM com pulsos regulados e parâmetros clínicos adequados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Como o IRPL® Trata o Olho Seco?
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                O IRPL® atua em mecanismos associados à Disfunção das Glândulas de Meibômio (DGM),
                contribuindo para estabilidade do filme lacrimal dentro de um plano multimodal.
              </p>
            </div>

            {/* Infográfico Como Funciona */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 items-center">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-cyan-200">
                <img
                  src="/E-eye/como_funciona_e-eye.jpeg"
                  alt="Infográfico explicando como o tratamento E-Eye IRPL funciona - mecanismo de ação da luz pulsada nas glândulas de Meibômio"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-cyan-200 bg-slate-900 aspect-video">
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
                  Vídeo Demonstrativo
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-cyan-200 overflow-hidden shadow-xl mb-12">
              <div className="px-6 py-4 bg-gradient-to-r from-cyan-600 to-sky-600 text-white">
                <h3 className="text-lg font-semibold">Vídeo: IRPL com E-Eye em ação</h3>
                <p className="text-sm text-cyan-100">Demonstração clínica do procedimento e da aplicação</p>
              </div>
              <div className="aspect-video">
                <video
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full h-full object-cover"
                  poster="/E-eye/E-eye-equip.jpeg"
                >
                  <source src="/Videos/E-%20Eye%20IRPL%C2%AE.mp4" type="video/mp4" />
                  Seu navegador não suporta a tag de vídeo.
                </video>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Por que o E-Eye é diferente</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  O E-Eye utiliza tecnologia IRPL® com pulsos regulados e homogêneos, desenvolvidos para
                  uso oftalmológico na DGM. É o único dispositivo aprovado pela ANVISA para olho seco
                  relacionado à Disfunção das Glândulas de Meibômio.
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  A indicação é clínica e individual, com avaliação completa da superfície ocular.
                  Em Caratinga e região, o acesso a essa tecnologia é exclusivo no interior de Minas Gerais.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-600">
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200">Aprovado pela ANVISA</span>
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200">IRPL® E-Eye</span>
                  <span className="px-3 py-1 rounded-full bg-white border border-slate-200">Exclusivo na região</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <img
                    src="/E-eye/e-eye-equipAnvisa.jpeg"
                    alt="Equipamento E-Eye com certificação ANVISA para tratamento de olho seco por DGM"
                    className="w-full h-auto rounded-xl"
                    loading="lazy"
                  />
                  <p className="text-xs text-slate-600 mt-3">Equipamento E-Eye com certificação ANVISA.</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <img
                    src="/E-eye/infografico IRPL.jpeg"
                    alt="Infográfico sobre o tratamento IRPL para olho seco por DGM"
                    className="w-full h-auto rounded-xl"
                    loading="lazy"
                  />
                  <p className="text-xs text-slate-600 mt-3">Resumo visual do mecanismo IRPL®.</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <img
                    src="/E-eye/anatomia_DGM-lagrima.jpeg"
                    alt="Ilustração da anatomia da lágrima e da DGM"
                    className="w-full h-auto rounded-xl"
                    loading="lazy"
                  />
                  <p className="text-xs text-slate-600 mt-3">Camadas da lágrima e papel da DGM.</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <img
                    src="/E-eye/exemplo-meibografia.jpeg"
                    alt="Exemplo de meibografia para avaliação das glândulas de Meibômio"
                    className="w-full h-auto rounded-xl"
                    loading="lazy"
                  />
                  <p className="text-xs text-slate-600 mt-3">Meibografia para diagnóstico preciso.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Mecanismo de Ação */}
              <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-2xl p-8 border border-cyan-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Brain className="w-8 h-8 text-cyan-600" />
                    <h3 className="text-2xl font-bold text-slate-900">Reeducação Neurológica</h3>
                  </div>
                  <button
                    onClick={() => setShowNeuroModal(true)}
                    className="flex items-center gap-2 text-cyan-700 hover:text-cyan-900 hover:bg-cyan-100 px-3 py-2 rounded-lg transition-colors text-sm font-semibold"
                    aria-label="Saiba mais sobre o efeito neurológico do IRPL"
                  >
                    <Info className="w-4 h-4" />
                    <span>Entenda o Mecanismo</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold shrink-0">1</div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Alvo Estratégico</h4>
                      <p className="text-sm text-slate-600">Pulsos aplicados nas regiões infraorbital e zigomática, onde passam os nervos parassimpáticos.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold shrink-0">2</div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Microgradiente Térmico</h4>
                      <p className="text-sm text-slate-600">Trens de pulsos calibrados penetram até 5mm, criando estímulo nervoso controlado.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold shrink-0">3</div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Liberação de Neurotransmissores</h4>
                      <p className="text-sm text-slate-600">Reativa a comunicação neural que "ordena" as glândulas a secretar normalmente.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefícios vs IPL */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-slate-900">IRPL® vs IPL Convencional</h3>
                </div>

                {/* Imagem comparativa */}
                <div className="relative rounded-xl overflow-hidden mb-6 border border-slate-200">
                  <img
                    src="/E-eye/comparativo-e-eye.jpeg"
                    alt="Comparativo entre IRPL E-Eye e IPL convencional - diferenças técnicas e resultados"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <p className="font-semibold text-emerald-800 mb-2">IRPL® (E-Eye)</p>
                      <ul className="space-y-1 text-emerald-700">
                        <li>• Projetado para oftalmologia</li>
                        <li>• Pulsos regulados e homogêneos</li>
                        <li>• Foco em DGM e superfície ocular</li>
                        <li>• Protocolo clínico individualizado</li>
                      </ul>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="font-semibold text-slate-700 mb-2">IPL Convencional</p>
                      <ul className="space-y-1 text-slate-600">
                        <li>• Projetado para estética</li>
                        <li>• Energia com decaimento no pulso</li>
                        <li>• Indicação primária dermatológica</li>
                        <li>• Não é dedicado à oftalmologia</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Nota clínica:</strong> IRPL® utiliza parâmetros regulados e protocolo
                      oftalmológico específico, com indicação após avaliação da superfície ocular.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefícios Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-cyan-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Protocolo de Tratamento */}
        <section className="bg-slate-50 py-16">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Protocolo de Tratamento IRPL
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                O ciclo é definido após avaliação clínica e pode incluir 3 a 4 sessões, com ajustes conforme resposta.
              </p>
            </div>

            {/* Imagens do protocolo e aplicação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-cyan-200">
                <img
                  src="/E-eye/aplicacao-e-eye2.jpeg"
                  alt="Aplicação do tratamento E-Eye IRPL na região periocular - procedimento não invasivo e indolor"
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white text-sm font-medium">
                    Aplicação do IRPL® na região periocular
                  </p>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-cyan-200">
                <img
                  src="/E-eye/protocolo-eye.jpeg"
                  alt="Protocolo de tratamento E-Eye IRPL - sessões e acompanhamento"
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white text-sm font-medium">
                    Protocolo padrão de tratamento
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative">
                  <div className="text-5xl font-black text-cyan-100 absolute top-4 right-4">{step.number}</div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-4xl font-bold text-cyan-600 mb-2">3-4</p>
                  <p className="text-slate-600">Sessões no ciclo inicial</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-cyan-600 mb-2">10-15</p>
                  <p className="text-slate-600">Minutos por sessão</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-cyan-600 mb-2">1</p>
                  <p className="text-slate-600">Plano de manutenção individual</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">O que esperar na avaliação</h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  A avaliação inclui histórico clínico, exame da superfície ocular e, quando indicado,
                  testes específicos para definir o tipo de olho seco. O objetivo é identificar o fenótipo
                  e montar um plano seguro e eficaz.
                </p>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Meibografia para analisar as glândulas de Meibômio.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Avaliação de estabilidade do filme lacrimal e sinais de inflamação.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Orientações de cuidados diários e ajustes de rotina.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Segurança e contraindicações</h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  O IRPL® é um procedimento não invasivo, indicado após avaliação médica. Algumas condições
                  exigem cuidado especial ou contraindicam o tratamento, por isso a decisão é individual.
                </p>
                <ul className="space-y-3 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                    <span>Gestação, uso de fármacos fotossensibilizantes ou pele muito bronzeada.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                    <span>Lesões ativas na área tratada ou infecções oculares em curso.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                    <span>Uso de lentes de contato deve ser ajustado conforme orientação médica.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Indicações */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Para Quem é Indicado?
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Olho Seco Evaporativo</p>
                      <p className="text-sm text-slate-600">Quadro associado à Disfunção das Glândulas de Meibômio (DGM)</p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Blefarite Crônica</p>
                      <p className="text-sm text-slate-600">Inflamação persistente das pálpebras com obstrução glandular</p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Sintomas Persistentes</p>
                      <p className="text-sm text-slate-600">Ardor, areia, vermelhidão ou fotofobia apesar do cuidado inicial</p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Preparo para Cirurgias Oculares</p>
                      <p className="text-sm text-slate-600">Otimização da superfície antes de catarata ou refrativa</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-6">
                  Por Que Escolher a Saraiva Vision?
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-3 bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <Award className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Exclusivo no Interior de MG</p>
                      <p className="text-sm text-slate-600">Disponível em Caratinga e região</p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <Eye className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Diagnóstico Completo</p>
                      <p className="text-sm text-slate-600">Meibografia e classificação clínica alinhadas ao TFOS DEWS III</p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <Heart className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Plano Individualizado</p>
                      <p className="text-sm text-slate-600">Conduta definida após avaliação da superfície ocular</p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <ShieldCheck className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Equipamento Original</p>
                      <p className="text-sm text-slate-600">E-Eye francês com certificação ANVISA e CE Mark</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Podcast Section */}
        <section className="bg-gradient-to-br from-slate-50 to-cyan-50 py-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 text-cyan-700 px-4 py-2 text-sm font-semibold mb-4">
                <Headphones className="w-4 h-4" />
                <span>Podcast Saraiva Vision</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Ouça sobre o Tratamento IRPL
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Dr. Philipe Saraiva explica como o IRPL E-Eye revoluciona o tratamento
                do olho seco causado pela Disfunção das Glândulas de Meibômio.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-cyan-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">IRPL E-Eye: Tratamento Inovador para Olho Seco e DGM</h3>
                  <p className="text-sm text-slate-600">Saúde Ocular em Foco • Dr. Philipe Saraiva Cruz</p>
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

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium">IRPL</span>
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium">E-Eye</span>
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium">Olho Seco</span>
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-xs font-medium">DGM</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/podcast"
                className="inline-flex items-center gap-2 text-cyan-700 hover:text-cyan-900 font-semibold transition-colors"
              >
                Ver todos os episódios
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="bg-gradient-to-r from-cyan-600 to-sky-600 py-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Agende Sua Avaliação para IRPL E-Eye
            </h2>
            <p className="text-lg text-cyan-100 mb-8 max-w-2xl mx-auto">
              Descubra se o IRPL® é indicado para o seu caso. Avaliação completa com meibografia
              e classificação clínica da superfície ocular.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => navigate('/agendamento')}
                className="bg-white text-cyan-700 hover:bg-cyan-50 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                Agendar Avaliação de Olho Seco
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <button
                onClick={() => window.open('https://wa.me/5533998601427?text=Olá! Gostaria de saber mais sobre o tratamento IRPL para olho seco.', '_blank')}
                className="border-2 border-white text-white hover:bg-white/20 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300"
              >
                Falar pelo WhatsApp
              </button>
            </div>
            <p className="text-sm text-cyan-200 mt-6">
              A indicação e a resposta ao tratamento variam conforme cada paciente e devem ser avaliadas pelo oftalmologista.
            </p>
            <p className="text-sm text-cyan-200 mt-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga, MG
            </p>
          </div>
        </section>

        {/* Modal: Efeito Neurológico do IRPL */}
        {showNeuroModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="neuro-modal-title"
          >
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-sky-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-7 h-7" />
                    <h2 id="neuro-modal-title" className="text-2xl font-bold">
                      O Efeito Neurológico do IRPL®
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowNeuroModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Fechar modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Introdução */}
                <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-5">
                  <p className="text-slate-700 leading-relaxed">
                    <strong className="text-cyan-900">O IRPL® com E-Eye</strong> utiliza pulsos regulados para
                    atuar em vias neurais relacionadas à secreção das glândulas de Meibômio. O objetivo
                    é favorecer a função glandular dentro de um plano terapêutico individualizado.
                  </p>
                </div>

                {/* Mecanismo de Ação */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-600" />
                    Como Funciona o Estímulo Neurológico
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold shrink-0">1</div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Alvo Periorbital e Zigomático</h4>
                        <p className="text-sm text-slate-600">
                          Os pulsos de luz são aplicados nas regiões periorbital e zigomática, áreas relacionadas
                          ao trajeto de fibras nervosas relevantes para a função lacrimal.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold shrink-0">2</div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Estimulação Parassimpática</h4>
                        <p className="text-sm text-slate-600">
                          A energia luminosa busca estimular vias do sistema nervoso autônomo que influenciam
                          a secreção glandular, contribuindo para a homeostase do filme lacrimal.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold shrink-0">3</div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Reeducação Autonômica</h4>
                        <p className="text-sm text-slate-600">
                          O objetivo é favorecer o restabelecimento funcional das glândulas de Meibômio,
                          associado a higiene palpebral, lubrificação e medidas ambientais quando indicadas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Efeito Neurológico - Imagem do E-Eye */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-cyan-600" />
                    Diagrama do Efeito Neurológico IRPL®
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <img
                      src="/E-eye/Efeito_neurológico_e-eye.jpeg"
                      alt="Diagrama ilustrando o efeito neurológico do IRPL E-Eye nas glândulas de Meibômio - estimulação parassimpática"
                      className="w-full h-auto rounded-lg border border-slate-300"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Ilustração do mecanismo de ação neurológica do IRPL® nas regiões periorbital e zigomática
                    </p>
                  </div>
                </div>

                {/* Infográfico IRPL */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-cyan-600" />
                    Infográfico: Como o IRPL® Pode Ajudar
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <img
                      src="/E-eye/infografico IRPL.jpeg"
                      alt="Infográfico explicando os benefícios e mecanismo de ação do tratamento IRPL para olho seco"
                      className="w-full h-auto rounded-lg border border-slate-300"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      Resumo visual dos benefícios e mecanismo de ação do IRPL®
                    </p>
                  </div>
                </div>

                {/* Resultados Duradouros */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-emerald-900 mb-3 flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Acompanhamento e Manutenção
                  </h3>
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    A resposta ao IRPL® varia conforme a gravidade da DGM, hábitos e fatores ambientais.
                    O seguimento clínico orienta a necessidade de sessões de manutenção e ajustes do plano.
                  </p>
                </div>

                {/* Diferença IRPL vs IPL */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-amber-900 mb-3">A Diferença Crucial: IRPL® ≠ IPL Estético</h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Equipamentos IPL convencionais são projetados para dermatologia e estética. O <strong>E-Eye IRPL®</strong>
                    é voltado à oftalmologia, com pulsos regulados e protocolo clínico específico para DGM,
                    sempre com indicação médica.
                  </p>
                </div>

                {/* CTA Footer */}
                <div className="bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-xl p-6 text-center">
                  <p className="text-lg font-semibold mb-4">Quer saber se o IRPL® é indicado para o seu caso?</p>
                  <Button
                    onClick={() => {
                      setShowNeuroModal(false);
                      navigate('/agendamento');
                    }}
                    className="bg-white text-cyan-700 hover:bg-cyan-50 px-6 py-3 rounded-xl font-semibold"
                  >
                    Agendar Avaliação
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <EnhancedFooter />
    </div>
  );
};

export default IRPLPage;
