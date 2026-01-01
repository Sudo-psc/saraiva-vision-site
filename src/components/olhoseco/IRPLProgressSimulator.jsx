import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import {
  Zap,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Sparkles,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  Eye,
  Droplet,
  Sun,
  Monitor,
  Activity,
  Calendar,
  Award
} from 'lucide-react';

/**
 * Simulador Interativo de Melhora com Tratamento IRPL
 * Visualiza a progressão típica do tratamento ao longo das sessões
 * Autor: Dr. Philipe Saraiva Cruz
 */
const IRPLProgressSimulator = () => {
  const navigate = useNavigate();
  const [currentSession, setCurrentSession] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const sessions = useMemo(() => [
    {
      session: 0,
      title: 'Antes do Tratamento',
      subtitle: 'Sintomas de Olho Seco',
      week: 0,
      symptoms: {
        burning: 85,
        dryness: 90,
        blurry: 75,
        fatigue: 80,
        redness: 70
      },
      meibomianFunction: 25,
      tearFilmStability: 3,
      description: 'Glândulas de Meibômio obstruídas e disfuncionais. Filme lacrimal instável com evaporação rápida.',
      improvements: [],
      color: 'rose'
    },
    {
      session: 1,
      title: '1ª Sessão IRPL',
      subtitle: 'Início da Reeducação Neurológica',
      week: 1,
      symptoms: {
        burning: 70,
        dryness: 75,
        blurry: 65,
        fatigue: 70,
        redness: 55
      },
      meibomianFunction: 40,
      tearFilmStability: 5,
      description: 'Primeiros estímulos neurológicos aplicados. Início da desobstrução glandular e liberação de neurotransmissores.',
      improvements: ['Redução inicial do ardor', 'Melhora na qualidade do meibum'],
      color: 'orange'
    },
    {
      session: 2,
      title: '2ª Sessão IRPL',
      subtitle: '2-3 semanas após a 1ª',
      week: 3,
      symptoms: {
        burning: 50,
        dryness: 55,
        blurry: 45,
        fatigue: 50,
        redness: 35
      },
      meibomianFunction: 55,
      tearFilmStability: 7,
      description: 'Reeducação neurológica em progresso. Glândulas começando a responder aos comandos autonômicos.',
      improvements: ['Sintomas notavelmente mais leves', 'Menos desconforto com telas', 'Lacrimejamento mais equilibrado'],
      color: 'amber'
    },
    {
      session: 3,
      title: '3ª Sessão IRPL',
      subtitle: '2-3 semanas após a 2ª',
      week: 6,
      symptoms: {
        burning: 30,
        dryness: 35,
        blurry: 25,
        fatigue: 30,
        redness: 20
      },
      meibomianFunction: 70,
      tearFilmStability: 9,
      description: 'Função glandular restaurada significativamente. Sistema nervoso reeducado enviando comandos adequados.',
      improvements: ['Conforto prolongado', 'Visão mais estável', 'Menos dependência de colírios'],
      color: 'cyan'
    },
    {
      session: 4,
      title: '4ª Sessão (Manutenção)',
      subtitle: '2-3 semanas após a 3ª',
      week: 9,
      symptoms: {
        burning: 15,
        dryness: 20,
        blurry: 10,
        fatigue: 15,
        redness: 10
      },
      meibomianFunction: 85,
      tearFilmStability: 11,
      description: 'Consolidação dos resultados. Glândulas funcionando de forma autônoma e eficiente.',
      improvements: ['Alívio duradouro (6 meses a 3 anos)', 'Qualidade de vida restaurada', 'Superfície ocular saudável'],
      color: 'emerald'
    }
  ], []);

  const symptomLabels = {
    burning: { label: 'Ardor/Queimação', icon: Sun },
    dryness: { label: 'Ressecamento', icon: Droplet },
    blurry: { label: 'Visão Embaçada', icon: Eye },
    fatigue: { label: 'Cansaço Visual', icon: Monitor },
    redness: { label: 'Vermelhidão', icon: Activity }
  };

  const currentData = sessions[currentSession];

  const goToSession = (index) => {
    setCurrentSession(Math.max(0, Math.min(sessions.length - 1, index)));
    setIsPlaying(false);
  };

  const playAnimation = () => {
    if (currentSession >= sessions.length - 1) {
      setCurrentSession(0);
    }
    setIsPlaying(true);
  };

  React.useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (currentSession < sessions.length - 1) {
          setCurrentSession(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentSession, sessions.length]);

  const getColorClasses = (color) => {
    const colors = {
      rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600', fill: 'bg-rose-500' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', fill: 'bg-orange-500' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', fill: 'bg-amber-500' },
      cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600', fill: 'bg-cyan-500' },
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', fill: 'bg-emerald-500' }
    };
    return colors[color] || colors.cyan;
  };

  const colorClasses = getColorClasses(currentData.color);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Simulador de Melhora com IRPL</h3>
            <p className="text-violet-200 text-sm">Veja como funciona a progressão do tratamento</p>
          </div>
        </div>
      </div>

      {/* Session Timeline */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-600">Linha do Tempo do Tratamento</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSession(0)}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={isPlaying ? () => setIsPlaying(false) : playAnimation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors text-sm font-medium"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pausar' : 'Simular'}
            </button>
          </div>
        </div>

        {/* Timeline Dots */}
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 rounded-full" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-violet-500 -translate-y-1/2 rounded-full transition-all duration-500"
            style={{ width: `${(currentSession / (sessions.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {sessions.map((session, index) => (
              <button
                key={index}
                onClick={() => goToSession(index)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  index <= currentSession
                    ? 'bg-violet-600 border-violet-600 text-white scale-110'
                    : 'bg-white border-slate-300 text-slate-400 hover:border-violet-300'
                }`}
              >
                {index === 0 ? '●' : index}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Session Title */}
        <div className={`${colorClasses.bg} ${colorClasses.border} border rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className={`text-lg font-bold ${colorClasses.text}`}>{currentData.title}</h4>
              <p className="text-slate-600 text-sm">{currentData.subtitle}</p>
            </div>
            {currentData.week > 0 && (
              <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 border border-slate-200">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Semana {currentData.week}</span>
              </div>
            )}
          </div>
          <p className="text-slate-700 text-sm">{currentData.description}</p>
        </div>

        {/* Symptom Bars */}
        <div className="space-y-4">
          <h5 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-cyan-600" />
            Intensidade dos Sintomas
          </h5>
          <div className="space-y-3">
            {Object.entries(currentData.symptoms).map(([key, value]) => {
              const symptomInfo = symptomLabels[key];
              const Icon = symptomInfo.icon;
              const barColor =
                value > 70 ? 'bg-rose-500' :
                value > 50 ? 'bg-orange-500' :
                value > 30 ? 'bg-amber-500' :
                value > 15 ? 'bg-cyan-500' : 'bg-emerald-500';

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700">{symptomInfo.label}</span>
                    </div>
                    <span className="font-medium text-slate-900">{value}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Function Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              <span className="text-sm font-medium text-slate-700">Função Meibomiana</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-violet-600">{currentData.meibomianFunction}%</span>
              {currentSession > 0 && (
                <span className="text-emerald-600 text-sm font-medium mb-1">
                  +{currentData.meibomianFunction - sessions[0].meibomianFunction}%
                </span>
              )}
            </div>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${currentData.meibomianFunction}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-5 h-5 text-cyan-600" />
              <span className="text-sm font-medium text-slate-700">Estabilidade Lacrimal</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-cyan-600">{currentData.tearFilmStability}s</span>
              <span className="text-slate-500 text-sm mb-1">FBUT</span>
            </div>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(currentData.tearFilmStability / 12 * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Improvements */}
        {currentData.improvements.length > 0 && (
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <h5 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Melhorias Observadas
            </h5>
            <div className="space-y-2">
              {currentData.improvements.map((improvement, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{improvement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={() => goToSession(currentSession - 1)}
            disabled={currentSession === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentSession === 0
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <div className="flex gap-1">
            {sessions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSession(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentSession ? 'bg-violet-600 w-6' : 'bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => goToSession(currentSession + 1)}
            disabled={currentSession === sessions.length - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentSession === sessions.length - 1
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Próximo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="p-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-lg">Descubra se o IRPL é indicado para você</h4>
            <p className="text-violet-200 text-sm">Avaliação completa com meibografia e diagnóstico personalizado</p>
          </div>
          <Button
            onClick={() => navigate('/agendamento')}
            className="bg-white text-violet-700 hover:bg-violet-50 font-semibold whitespace-nowrap"
          >
            Agendar Avaliação
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IRPLProgressSimulator;
