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
  Search
} from 'lucide-react';

const IRPLPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showNeuroModal, setShowNeuroModal] = useState(false);

  const seo = {
    title: 'Luz Pulsada IRPL para Olho Seco em Caratinga | E-Eye | Saraiva Vision',
    description: 'Tratamento de olho seco com luz pulsada IRPL (E-Eye) em Caratinga, MG. Tecnologia francesa, não invasiva e segura. Pioneiros no interior de Minas Gerais. Agende sua avaliação.',
    keywords: 'luz pulsada caratinga, olho seco caratinga, IRPL caratinga, E-Eye caratinga, tratamento olho seco caratinga, luz pulsada olho seco, IPL olho seco, DGM tratamento, glândulas de meibômio, oftalmologista caratinga'
  };

  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Não Invasivo',
      description: 'Procedimento indolor realizado na região periocular, sem contato direto com os olhos.'
    },
    {
      icon: Clock,
      title: 'Sessões Rápidas',
      description: 'Cada sessão dura apenas 10-15 minutos, sem necessidade de recuperação.'
    },
    {
      icon: Timer,
      title: 'Efeito Duradouro',
      description: 'Resultados que podem durar de 6 meses a 3 anos após o ciclo de tratamento.'
    },
    {
      icon: Brain,
      title: 'Reeducação Neurológica',
      description: 'Restaura a comunicação nervosa com as glândulas, não apenas desobstrui.'
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
      description: '3 a 4 sessões espaçadas de 2-3 semanas. Manutenção anual conforme necessidade.'
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
                    <span>Pioneiros no Interior de MG</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 px-4 py-2 text-sm font-semibold">
                    <Star className="w-4 h-4" />
                    <span>Padrão Ouro Mundial</span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  Luz Pulsada IRPL para <span className="text-cyan-600">Olho Seco</span> em Caratinga
                </h1>

                <p className="text-lg text-slate-700 leading-relaxed">
                  Tratamento revolucionário com tecnologia <strong>E-Eye</strong> de origem francesa.
                  Procedimento não invasivo que restaura a função das glândulas de Meibômio através da
                  <strong> reeducação neurológica</strong>, oferecendo alívio duradouro do olho seco.
                </p>

                <div className="flex items-center gap-3 bg-white border border-cyan-200 rounded-xl p-4 shadow-sm">
                  <MapPin className="w-6 h-6 text-cyan-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Exclusivo no Interior de Minas Gerais</p>
                    <p className="text-sm text-slate-600">Único centro com tecnologia E-Eye IRPL na região</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => navigate('/agendamento')}
                    className="bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-700 hover:to-sky-700 text-white px-6 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl"
                  >
                    Agendar Avaliação IRPL
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
                  O E-Eye é o único dispositivo de luz pulsada desenvolvido especificamente para
                  tratamento de olho seco, com tecnologia IRPL® (Intense Regulated Pulsed Light)
                  patenteada pela ESW Vision (França).
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <span>Aprovado pela ANVISA e CE Mark</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <span>Mais de 500.000 tratamentos realizados no mundo</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <span>Eficácia comprovada em estudos clínicos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                    <span>Diferente do IPL convencional (estético)</span>
                  </div>
                </div>

                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <p className="text-sm text-cyan-200">
                    <strong className="text-white">Importante:</strong> O IRPL® não é o mesmo que IPL estético.
                    Foi projetado especificamente para oftalmologia, com pulsos calibrados para
                    estimulação neurológica das glândulas meibomianas.
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
                Diferente de tratamentos convencionais que apenas aliviam sintomas, o IRPL® atua na
                <strong> causa raiz</strong> da Disfunção das Glândulas de Meibômio (DGM).
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
                  className="w-full h-full object-cover"
                  poster="/E-eye/e-eye-equip.jpeg"
                >
                  <source src="/Videos/E-EYE-IRPL-Treatment.mp4" type="video/mp4" />
                  Seu navegador não suporta a tag de vídeo.
                </video>
                <div className="absolute top-4 left-4 bg-cyan-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  Vídeo Demonstrativo
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
                        <li>• Ação neurológica profunda</li>
                        <li>• Efeito duradouro (6m-3 anos)</li>
                        <li>• Restaura função glandular</li>
                      </ul>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="font-semibold text-slate-700 mb-2">IPL Convencional</p>
                      <ul className="space-y-1 text-slate-600">
                        <li>• Projetado para estética</li>
                        <li>• Ação térmica superficial</li>
                        <li>• Efeito temporário (semanas)</li>
                        <li>• Apenas derrete meibum</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                      <strong>Analogia:</strong> O IRPL® não apenas limpa os "canos" (ductos),
                      mas <strong>reativa o interruptor (nervo)</strong> que faz a fábrica glandular
                      funcionar por conta própria.
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
                Um ciclo completo geralmente consiste em 3 a 4 sessões, com resultados progressivos e duradouros.
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
                  <p className="text-4xl font-bold text-cyan-600 mb-2">6m-3a</p>
                  <p className="text-slate-600">Duração dos resultados</p>
                </div>
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
                      <p className="text-sm text-slate-600">Causado por Disfunção das Glândulas de Meibômio (DGM)</p>
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
                      <p className="font-semibold text-slate-900">Falha em Tratamentos Convencionais</p>
                      <p className="text-sm text-slate-600">Pacientes que não melhoraram com colírios e compressas</p>
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
                      <p className="font-semibold text-slate-900">Pioneiros no Interior de MG</p>
                      <p className="text-sm text-slate-600">Primeiro e único centro com E-Eye IRPL na região</p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <Eye className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Diagnóstico Completo</p>
                      <p className="text-sm text-slate-600">Meibografia e classificação TFOS DEWS III inclusos</p>
                    </div>
                  </div>
                  <div className="flex gap-3 bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                    <Heart className="w-5 h-5 text-cyan-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Protocolo Personalizado</p>
                      <p className="text-sm text-slate-600">Tratamento ajustado ao seu fenótipo de olho seco</p>
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

        {/* CTA Final */}
        <section className="bg-gradient-to-r from-cyan-600 to-sky-600 py-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Agende Sua Avaliação para Tratamento IRPL
            </h2>
            <p className="text-lg text-cyan-100 mb-8 max-w-2xl mx-auto">
              Descubra se o tratamento com luz pulsada IRPL é indicado para o seu caso.
              Avaliação completa com meibografia e diagnóstico do fenótipo de olho seco.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => navigate('/agendamento')}
                className="bg-white text-cyan-700 hover:bg-cyan-50 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                Agendar Avaliação IRPL
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://wa.me/5533998601427?text=Olá! Gostaria de saber mais sobre o tratamento IRPL para olho seco.', '_blank')}
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold"
              >
                Falar pelo WhatsApp
              </Button>
            </div>
            <p className="text-sm text-cyan-200 mt-6">
              <MapPin className="w-4 h-4 inline mr-1" />
              Rua Coronel Antônio da Silva, 297 - Centro, Caratinga, MG
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
                    <strong className="text-cyan-900">O tratamento com E-Eye</strong> vai muito além da simples estimulação das Glândulas de Meibômio por meio da luz policromática intensa regulada (IRPL®). O verdadeiro diferencial está no <strong className="text-cyan-900">efeito neurológico</strong> que reeduca o sistema nervoso autônomo.
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
                          Os pulsos de luz alcançam as regiões <strong>periorbital</strong> (abaixo da sobrancelha) e <strong>zigomática</strong> (maçãs do rosto), onde passam importantes ramos do nervo facial.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold shrink-0">2</div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Estimulação Parassimpática</h4>
                        <p className="text-sm text-slate-600">
                          A energia luminosa ativa fibras do <strong>sistema nervoso parassimpático</strong> que controlam a secreção glandular, restaurando a comunicação neural.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold shrink-0">3</div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Ressedução Autonômica</h4>
                        <p className="text-sm text-slate-600">
                          O sistema nervoso autônomo é "reeducado" para retomar o comando adequado das glândulas, não apenas desobstruindo os ductos, mas <strong>restaurando a função</strong>.
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
                    Resultados Duradouros: Até 3 Anos
                  </h3>
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    Diferente de tratamentos que apenas derrete o meibum (efeito temporário de semanas), o IRPL® promove uma <strong>reedução neurológica</strong> que restaura o comando fisiológico das glândulas. Isso explica por que os resultados podem durar de <strong>6 meses a 3 anos</strong> após o ciclo completo de tratamento.
                  </p>
                </div>

                {/* Diferença IRPL vs IPL */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-amber-900 mb-3">A Diferença Crucial: IRPL® ≠ IPL Estético</h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Equipamentos IPL convencionais são projetados para dermatologia e estética. O <strong>E-Eye IRPL®</strong> foi desenvolvido especificamente para oftalmologia, com trens de pulsos calibrados para atingir a profundidade necessária (até 5mm) e promover o estímulo neurológico — algo que IPLs estéticos <strong>não conseguem fazer</strong>.
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
