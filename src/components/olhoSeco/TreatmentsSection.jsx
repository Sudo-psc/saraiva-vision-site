import React from 'react';
import { Droplets, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';

const treatmentItems = [
  'Protocolos alinhados ao TFOS DEWS III com estratificação por severidade',
  'Plugs lacrimais para casos de deficiência aquosa refratária',
  'Microesfoliação da margem palpebral e desobstrução glandular assistida',
  'Terapias térmicas, higiene palpebral guiada e colírios anti-inflamatórios',
  'Suplementação de ômega-3 e abordagem nutricional para estabilidade lipídica',
  'Monitoramento fotográfico e reavaliação periódica dos marcadores objetivos'
];

const TreatmentsSection = () => {
  return (
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
  );
};

export default TreatmentsSection;
