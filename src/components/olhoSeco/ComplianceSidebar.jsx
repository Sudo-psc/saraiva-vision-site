import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { ShieldCheck, CheckCircle } from 'lucide-react';

const ComplianceSidebar = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default ComplianceSidebar;
