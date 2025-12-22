import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button.jsx';
import { Droplets, ShieldCheck, CheckCircle, Microscope, ArrowRight, Sparkles } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
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
  );
};

export default HeroSection;
