import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  Sun,
  Droplet,
  Monitor,
  Wind,
  Clock,
  Activity,
  ThermometerSun,
  Glasses
} from 'lucide-react';

/**
 * Checklist Interativo de Gravidade de Sintomas de Olho Seco
 * Baseado no OSDI (Ocular Surface Disease Index) simplificado
 * Autor: Dr. Philipe Saraiva Cruz
 */
const SymptomChecklist = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const symptoms = useMemo(() => [
    {
      id: 'burning',
      icon: ThermometerSun,
      question: 'Sensação de ardor ou queimação nos olhos',
      description: 'Sensação de calor ou irritação persistente'
    },
    {
      id: 'gritty',
      icon: Eye,
      question: 'Sensação de areia ou corpo estranho',
      description: 'Como se houvesse partículas nos olhos'
    },
    {
      id: 'dryness',
      icon: Droplet,
      question: 'Secura ou ressecamento ocular',
      description: 'Olhos parecem secos, sem lubrificação'
    },
    {
      id: 'blurry',
      icon: Glasses,
      question: 'Visão embaçada que oscila',
      description: 'Visão que melhora ao piscar'
    },
    {
      id: 'photophobia',
      icon: Sun,
      question: 'Sensibilidade à luz (fotofobia)',
      description: 'Incômodo em ambientes claros'
    },
    {
      id: 'screen',
      icon: Monitor,
      question: 'Piora ao usar telas (computador, celular)',
      description: 'Sintomas aumentam com uso de dispositivos'
    },
    {
      id: 'wind',
      icon: Wind,
      question: 'Piora com ar-condicionado ou vento',
      description: 'Sintomas intensificam em ambientes secos'
    },
    {
      id: 'morning',
      icon: Clock,
      question: 'Olhos grudados ou desconfortáveis ao acordar',
      description: 'Dificuldade para abrir os olhos pela manhã'
    },
    {
      id: 'tearing',
      icon: Activity,
      question: 'Lacrimejamento excessivo (paradoxal)',
      description: 'Olhos lacrimejam mesmo estando secos'
    },
    {
      id: 'redness',
      icon: Eye,
      question: 'Vermelhidão persistente',
      description: 'Olhos frequentemente avermelhados'
    }
  ], []);

  const frequencyOptions = [
    { value: 0, label: 'Nunca', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 1, label: 'Raramente', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    { value: 2, label: 'Às vezes', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { value: 3, label: 'Frequente', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { value: 4, label: 'Sempre', color: 'bg-rose-100 text-rose-700 border-rose-200' }
  ];

  const handleAnswer = useCallback((symptomId, value) => {
    setAnswers(prev => ({
      ...prev,
      [symptomId]: value
    }));
  }, []);

  const calculateScore = useMemo(() => {
    const answeredQuestions = Object.values(answers);
    if (answeredQuestions.length === 0) return 0;

    const totalScore = answeredQuestions.reduce((sum, val) => sum + val, 0);
    const maxScore = symptoms.length * 4;
    return Math.round((totalScore / maxScore) * 100);
  }, [answers, symptoms.length]);

  const getSeverityLevel = useCallback((score) => {
    if (score <= 12) return {
      level: 'normal',
      label: 'Normal',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      description: 'Seus olhos parecem saudáveis. Continue mantendo bons hábitos de higiene ocular.',
      recommendation: 'Mantenha pausas regulares durante uso de telas e hidratação adequada.'
    };
    if (score <= 32) return {
      level: 'mild',
      label: 'Leve',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      description: 'Sintomas leves de olho seco. Pode se beneficiar de medidas preventivas.',
      recommendation: 'Considere lágrimas artificiais e higiene palpebral. Uma avaliação pode ajudar.'
    };
    if (score <= 55) return {
      level: 'moderate',
      label: 'Moderado',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      description: 'Sintomas moderados que merecem atenção. Tratamento pode melhorar sua qualidade de vida.',
      recommendation: 'Recomendamos avaliação especializada para diagnóstico preciso e tratamento adequado.'
    };
    if (score <= 75) return {
      level: 'severe',
      label: 'Significativo',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Sintomas significativos de olho seco. Tratamento especializado é importante.',
      recommendation: 'Avaliação completa com meibografia recomendada. O tratamento IRPL pode ser indicado.'
    };
    return {
      level: 'very_severe',
      label: 'Intenso',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      description: 'Sintomas intensos que impactam sua qualidade de vida. Busque tratamento especializado.',
      recommendation: 'Avaliação urgente recomendada. Protocolos avançados como IRPL podem trazer alívio significativo.'
    };
  }, []);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === symptoms.length;
  const severity = getSeverityLevel(calculateScore);

  const resetChecklist = useCallback(() => {
    setAnswers({});
    setShowResults(false);
  }, []);

  if (showResults && allAnswered) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Header de Resultado */}
        <div className={`${severity.bgColor} ${severity.borderColor} border-b p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Resultado da Avaliação</h3>
            <button
              onClick={resetChecklist}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refazer
            </button>
          </div>

          <div className="flex items-center gap-6">
            {/* Score Circle */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(calculateScore / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  className={severity.color}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${severity.color}`}>{calculateScore}</span>
              </div>
            </div>

            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${severity.bgColor} ${severity.color} border ${severity.borderColor} mb-2`}>
                {severity.level === 'normal' && <CheckCircle2 className="w-4 h-4" />}
                {severity.level === 'mild' && <Sparkles className="w-4 h-4" />}
                {['moderate', 'severe', 'very_severe'].includes(severity.level) && <AlertTriangle className="w-4 h-4" />}
                <span>Gravidade: {severity.label}</span>
              </div>
              <p className="text-slate-700">{severity.description}</p>
            </div>
          </div>
        </div>

        {/* Recomendação */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              Recomendação
            </h4>
            <p className="text-slate-700 text-sm">{severity.recommendation}</p>
          </div>

          {/* Resumo dos Sintomas */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-sm">Seus sintomas mais frequentes:</h4>
            <div className="flex flex-wrap gap-2">
              {symptoms
                .filter(s => answers[s.id] >= 3)
                .map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex items-center gap-2 bg-rose-50 text-rose-700 rounded-full px-3 py-1 text-sm border border-rose-200">
                      <Icon className="w-4 h-4" />
                      <span>{s.question.split(' ').slice(0, 3).join(' ')}...</span>
                    </div>
                  );
                })}
              {symptoms.filter(s => answers[s.id] >= 3).length === 0 && (
                <span className="text-sm text-slate-500">Nenhum sintoma frequente identificado</span>
              )}
            </div>
          </div>

          {/* CTA */}
          {severity.level !== 'normal' && (
            <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-xl p-5 text-white">
              <h4 className="font-bold text-lg mb-2">Agende sua avaliação especializada</h4>
              <p className="text-cyan-100 text-sm mb-4">
                Diagnóstico completo com meibografia e classificação TFOS DEWS III para identificar a causa exata dos seus sintomas.
              </p>
              <Button
                onClick={() => undefined}
                className="bg-white text-cyan-700 hover:bg-cyan-50 font-semibold"
              >
                Clínica encerrada
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-slate-500 text-center">
            Este questionário é apenas para autoavaliação e não substitui uma consulta médica profissional.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="w-7 h-7" />
          <h3 className="text-xl font-bold">Avalie seus Sintomas de Olho Seco</h3>
        </div>
        <p className="text-cyan-100 text-sm">
          Responda com que frequência você sente cada sintoma para avaliar a gravidade do seu olho seco.
        </p>
        {/* Progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progresso</span>
            <span>{answeredCount}/{symptoms.length} respondidas</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / symptoms.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] sm:max-h-[500px] overflow-y-auto scroll-smooth">
        {symptoms.map((symptom) => {
          const Icon = symptom.icon;
          const isAnswered = answers[symptom.id] !== undefined;

          return (
            <div
              key={symptom.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isAnswered
                  ? 'border-cyan-200 bg-cyan-50/50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isAnswered ? 'bg-cyan-100 text-cyan-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{symptom.question}</p>
                  <p className="text-xs text-slate-500">{symptom.description}</p>
                </div>
                {isAnswered && <CheckCircle2 className="w-5 h-5 text-cyan-600 shrink-0" />}
              </div>

              {/* Frequency Options */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {frequencyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(symptom.id, option.value)}
                    className={`py-2.5 px-2 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-200 min-h-[44px] ${
                      answers[symptom.id] === option.value
                        ? `${option.color} ring-2 ring-offset-1 ring-current`
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-6 bg-slate-50 border-t border-slate-200">
        <Button
          onClick={() => setShowResults(true)}
          disabled={!allAnswered}
          className={`w-full py-3 text-base font-semibold rounded-xl transition-all duration-200 ${
            allAnswered
              ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-lg hover:shadow-xl'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          {allAnswered ? (
            <>
              Ver Resultado
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            `Responda mais ${symptoms.length - answeredCount} perguntas`
          )}
        </Button>
      </div>
    </div>
  );
};

export default SymptomChecklist;
