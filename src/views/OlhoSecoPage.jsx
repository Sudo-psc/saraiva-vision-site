import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';
import { Button } from '@/components/ui/button.jsx';
import { Droplets, ShieldCheck, CheckCircle, Microscope, Timer, Activity, Leaf, Sparkles, ArrowRight, Gauge } from 'lucide-react';

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

  const treatmentItems = React.useMemo(
    () => [
      t('olhoSeco.treatmentItems.0'),
      t('olhoSeco.treatmentItems.1'),
      t('olhoSeco.treatmentItems.2'),
      t('olhoSeco.treatmentItems.3'),
      t('olhoSeco.treatmentItems.4'),
      t('olhoSeco.treatmentItems.5')
    ],
    [t]
  );

  const seo = {
    title: 'Clínica de Olho Seco | Diagnóstico e Tratamento com TFOS DEWS III | Saraiva Vision',
    description: 'Protocolos completos para diagnóstico e tratamento de olho seco com meibografia, FBUT, meniscometria, testes de Schirmer e lisamina verde, seguindo TFOS DEWS III.',
    keywords: 'olho seco, TFOS DEWS III, meibografia, FBUT, meniscometria, lisamina verde, Schirmer, plugs lacrimais, microesfoliação palpebral'
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead {...seo} />
      <main className="flex-1 pt-20 sm:pt-24 md:pt-28 lg:pt-32 scroll-block-internal">
        <section className="bg-gradient-to-br from-cyan-50 via-white to-sky-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-16 space-y-10">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-semibold w-fit">
                <ShieldCheck className="w-4 h-4" />
                <span>Protocolo alinhado ao TFOS DEWS III</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                <div className="lg:col-span-3 space-y-4">
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                    Centro dedicado ao diagnóstico e tratamento de olho seco
                  </h1>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Avaliação completa baseada em evidências para identificar a causa dos sintomas e oferecer terapias personalizadas que restauram o conforto ocular e a função do filme lacrimal.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                      <Droplets className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-semibold text-slate-800">Linha de cuidado integral</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                      <Microscope className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-semibold text-slate-800">Exames específicos para olho seco</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                      <CheckCircle className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-semibold text-slate-800">Estratificação objetiva de severidade</span>
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
                  </div>
                </div>
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-soft-light space-y-4">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-10 h-10 text-cyan-600" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-600">Linha avançada</p>
                      <p className="text-xl font-bold text-slate-900">Programa olho seco</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-slate-700">
                    <p>Classificação por fenótipo evaporativo, aquoso e neurosensorial.</p>
                    <p>Plano terapêutico com metas mensuráveis e reavaliação trimestral.</p>
                    <p>Integração de exames fotográficos e dados objetivos em cada visita.</p>
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
                      <span>Documentação em imagem</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-600" />
                      <span>Conforto e higiene guiada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-light p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Microscope className="w-6 h-6 text-cyan-700" />
                    <h2 className="text-2xl font-bold text-slate-900">Diagnóstico completo e rastreável</h2>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Todos os exames seguem a terminologia e os fluxos decisórios do TFOS DEWS III para correlacionar sintomas, estabilidade do filme lacrimal e saúde meibomiana, permitindo identificar a causa raiz do desconforto ocular.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diagnosticItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="flex gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                          <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                            <p className="text-sm text-slate-700 leading-relaxed">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-light p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Droplets className="w-6 h-6 text-cyan-700" />
                    <h2 className="text-2xl font-bold text-slate-900">Tratamentos personalizados</h2>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Os protocolos combinam intervenções estruturais, anti-inflamatórias e de reabilitação da superfície ocular, sempre ajustados ao fenótipo do olho seco e à resposta clínica de cada paciente.
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {treatmentItems.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-3">
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
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-300" />
                    <div>
                      <p className="text-sm text-emerald-200 font-semibold">Conformidade</p>
                      <p className="text-xl font-bold">TFOS DEWS III</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm leading-relaxed">
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-300 mt-1" />
                      <span>Classificação estruturada por sinais, sintomas e marcadores objetivos.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-300 mt-1" />
                      <span>Documentação fotográfica de glândulas e superfície ocular.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-300 mt-1" />
                      <span>Registro seriado de FBUT, Schirmer e meniscometria.</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-300 mt-1" />
                      <span>Consentimento informado e proteção de dados conforme LGPD.</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => navigate('/agendamento')}
                    className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold"
                  >
                    Agendar avaliação
                  </Button>
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
          </div>
        </section>
      </main>
      <EnhancedFooter />
    </div>
  );
};

export default OlhoSecoPage;
