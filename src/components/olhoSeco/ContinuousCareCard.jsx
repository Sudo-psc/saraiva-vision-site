import React from 'react';
import { Leaf } from 'lucide-react';

const ContinuousCareCard = () => {
  return (
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
  );
};

export default ContinuousCareCard;
