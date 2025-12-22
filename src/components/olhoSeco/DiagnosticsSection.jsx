import React from 'react';
import { Microscope, Timer, Activity, Droplets, Gauge, Sparkles } from 'lucide-react';

const diagnosticItems = [
  {
    title: 'Meibografia de alta definição',
    description: 'Visualização direta das glândulas de Meibômio para identificar dropout, obstruções e padrões estruturais da DGM.',
    icon: Microscope
  },
  {
    title: 'FBUT com fluoresceína',
    description: 'Tempo de ruptura do filme lacrimal mensurado em segundos com protocolo TFOS DEWS III para classificar estabilidade.',
    icon: Timer
  },
  {
    title: 'Meniscometria óptica',
    description: 'Medição objetiva da altura do menisco lacrimal para quantificar o volume basal e orientar reposição aquosa.',
    icon: Gauge
  },
  {
    title: 'Corantes vitais com lisamina verde',
    description: 'Mapeamento de áreas de ressecamento epitelial e inflamação da superfície ocular com scoring padronizado.',
    icon: Sparkles
  },
  {
    title: 'Teste de Schirmer I e II',
    description: 'Avaliação quantitativa da produção lacrimal basal e reflexa com interpretação em conjunto com meniscometria.',
    icon: Droplets
  },
  {
    title: 'Avaliação das vias lacrimais',
    description: 'Testes de Jones I e II, sondagem e irrigação para excluir obstruções que perpetuam sintomas de olho seco.',
    icon: Activity
  }
];

const DiagnosticsSection = () => {
  return (
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
  );
};

export default DiagnosticsSection;
