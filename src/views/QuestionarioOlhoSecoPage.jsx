import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Eye, AlertCircle, CheckCircle, Info,
  ArrowRight, ArrowLeft, Send, Mail,
  Calendar, Phone, MessageCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import EnhancedFooter from '@/components/EnhancedFooter';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { trackGA } from '@/utils/analytics';

/**
 * Questionário de Autoavaliação de Olho Seco
 *
 * Sistema de pontuação: 0-40 pontos
 * - 0-8: Baixo risco
 * - 9-16: Risco moderado
 * - 17-28: Alto risco
 * - 29-40: Risco muito alto
 *
 * @author Dr. Philipe Saraiva Cruz
 */

const QUESTOES = [
  {
    id: 1,
    categoria: 'Sintomas Físicos',
    pergunta: 'Com que frequência você sente sensação de areia ou corpo estranho nos olhos?',
    opcoes: [
      { valor: 0, texto: 'Nunca' },
      { valor: 1, texto: 'Raramente' },
      { valor: 2, texto: 'Às vezes' },
      { valor: 3, texto: 'Frequentemente' },
      { valor: 4, texto: 'Sempre' }
    ]
  },
  {
    id: 2,
    categoria: 'Sintomas Físicos',
    pergunta: 'Você sente ardência ou queimação nos olhos?',
    opcoes: [
      { valor: 0, texto: 'Nunca' },
      { valor: 1, texto: 'Raramente' },
      { valor: 2, texto: 'Às vezes' },
      { valor: 3, texto: 'Frequentemente' },
      { valor: 4, texto: 'Sempre' }
    ]
  },
  {
    id: 3,
    categoria: 'Sintomas Físicos',
    pergunta: 'Seus olhos lacrimejam excessivamente?',
    opcoes: [
      { valor: 0, texto: 'Nunca' },
      { valor: 1, texto: 'Raramente' },
      { valor: 2, texto: 'Às vezes' },
      { valor: 3, texto: 'Frequentemente' },
      { valor: 4, texto: 'Sempre' }
    ]
  },
  {
    id: 4,
    categoria: 'Sintomas Físicos',
    pergunta: 'Você tem visão embaçada que melhora ao piscar?',
    opcoes: [
      { valor: 0, texto: 'Nunca' },
      { valor: 1, texto: 'Raramente' },
      { valor: 2, texto: 'Às vezes' },
      { valor: 3, texto: 'Frequentemente' },
      { valor: 4, texto: 'Sempre' }
    ]
  },
  {
    id: 5,
    categoria: 'Sintomas Físicos',
    pergunta: 'Seus olhos ficam vermelhos com frequência?',
    opcoes: [
      { valor: 0, texto: 'Nunca' },
      { valor: 1, texto: 'Raramente' },
      { valor: 2, texto: 'Às vezes' },
      { valor: 3, texto: 'Frequentemente' },
      { valor: 4, texto: 'Sempre' }
    ]
  },
  {
    id: 6,
    categoria: 'Fatores de Risco',
    pergunta: 'Quanto tempo você passa diariamente em frente a telas (computador, celular, TV)?',
    opcoes: [
      { valor: 0, texto: 'Menos de 2 horas' },
      { valor: 1, texto: '2-4 horas' },
      { valor: 2, texto: '4-6 horas' },
      { valor: 3, texto: '6-8 horas' },
      { valor: 4, texto: 'Mais de 8 horas' }
    ]
  },
  {
    id: 7,
    categoria: 'Fatores de Risco',
    pergunta: 'Você fica exposto a ar condicionado ou ambientes secos?',
    opcoes: [
      { valor: 0, texto: 'Nunca' },
      { valor: 1, texto: 'Raramente' },
      { valor: 2, texto: 'Às vezes' },
      { valor: 3, texto: 'Frequentemente' },
      { valor: 4, texto: 'Sempre' }
    ]
  },
  {
    id: 8,
    categoria: 'Fatores de Risco',
    pergunta: 'Você usa lentes de contato?',
    opcoes: [
      { valor: 0, texto: 'Não uso' },
      { valor: 1, texto: 'Uso ocasionalmente' },
      { valor: 2, texto: 'Uso regularmente' },
      { valor: 3, texto: 'Uso diariamente' },
      { valor: 4, texto: 'Uso com extensão prolongada' }
    ]
  },
  {
    id: 9,
    categoria: 'Histórico Médico',
    pergunta: 'Você já fez alguma cirurgia ocular (LASIK, catarata, etc.)?',
    opcoes: [
      { valor: 0, texto: 'Não' },
      { valor: 1, texto: 'Sim, há mais de 5 anos' },
      { valor: 2, texto: 'Sim, há 2-5 anos' },
      { valor: 3, texto: 'Sim, há 1-2 anos' },
      { valor: 4, texto: 'Sim, há menos de 1 ano' }
    ]
  },
  {
    id: 10,
    categoria: 'Histórico Médico',
    pergunta: 'Você toma medicamentos que podem causar olho seco (anti-histamínicos, antidepressivos, anti-hipertensivos)?',
    opcoes: [
      { valor: 0, texto: 'Não tomo nenhum' },
      { valor: 1, texto: 'Anti-histamínicos ocasionalmente' },
      { valor: 2, texto: 'Antidepressivos' },
      { valor: 3, texto: 'Anti-hipertensivos' },
      { valor: 4, texto: 'Múltiplos medicamentos' }
    ]
  }
];

const getRiskLevel = (score) => {
  if (score <= 8) return 'baixo';
  if (score <= 16) return 'moderado';
  if (score <= 28) return 'alto';
  return 'muito-alto';
};

const getRiskData = (score) => {
  const level = getRiskLevel(score);

  const data = {
    'baixo': {
      titulo: 'Seus olhos parecem saudáveis!',
      icon: CheckCircle,
      cor: 'text-green-600',
      corBg: 'bg-green-50',
      corBorda: 'border-green-200',
      mensagem: 'Ótima notícia! Com base nas suas respostas, você apresenta poucos sinais de olho seco.',
      recomendacoes: [
        'Continue mantendo bons hábitos de saúde ocular',
        'Faça pausas regulares ao usar telas (regra 20-20-20)',
        'Mantenha-se hidratado',
        'Realize exames oftalmológicos anuais de rotina'
      ],
      cta: 'Agendar Check-up Anual',
      urgencia: 'baixa'
    },
    'moderado': {
      titulo: 'Atenção: Sinais Iniciais de Olho Seco',
      icon: Info,
      cor: 'text-yellow-600',
      corBg: 'bg-yellow-50',
      corBorda: 'border-yellow-200',
      mensagem: 'Você apresenta alguns sintomas que merecem atenção. O olho seco em estágio inicial responde muito bem ao tratamento!',
      recomendacoes: [
        'Considere uma avaliação oftalmológica em breve',
        'Implemente hábitos de prevenção imediatamente',
        'Monitore a evolução dos sintomas',
        'Considere realizar meibografia para diagnóstico preciso'
      ],
      cta: 'Agendar Consulta com Desconto',
      urgencia: 'media',
      promocao: true
    },
    'alto': {
      titulo: 'Importante: Sintomas Significativos de Olho Seco',
      icon: AlertCircle,
      cor: 'text-orange-600',
      corBg: 'bg-orange-50',
      corBorda: 'border-orange-200',
      mensagem: 'Suas respostas indicam sintomas moderados a severos de olho seco. Uma avaliação oftalmológica especializada é fortemente recomendada.',
      recomendacoes: [
        'Sintomas podem piorar sem tratamento adequado',
        'Meibografia pode identificar disfunção glandular precoce',
        'Tratamentos eficazes estão disponíveis',
        'Qualidade de vida pode melhorar significativamente'
      ],
      cta: 'AGENDAR URGENTE - Com Desconto',
      urgencia: 'alta',
      promocao: true
    },
    'muito-alto': {
      titulo: 'Urgente: Procure Avaliação Oftalmológica',
      icon: AlertCircle,
      cor: 'text-red-600',
      corBg: 'bg-red-50',
      corBorda: 'border-red-200',
      mensagem: 'ATENÇÃO: Suas respostas indicam sintomas severos de olho seco que requerem avaliação oftalmológica especializada o quanto antes.',
      recomendacoes: [
        'Agende uma consulta nos próximos dias',
        'Considere realizar meibografia para diagnóstico detalhado',
        'Evite automedicação',
        'Prepare-se para discutir todos os sintomas com seu médico'
      ],
      cta: 'AGENDAR CONSULTA PRIORITÁRIA',
      urgencia: 'urgente',
      promocao: true
    }
  };

  return data[level];
};

const QuestionarioOlhoSecoPage = () => {
  const [etapa, setEtapa] = useState('intro'); // intro, questoes, resultado, dados
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [score, setScore] = useState(0);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    idade: '',
    aceitaContato: false
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    // Track page view
    trackGA('Questionario', 'View', 'Olho Seco');
  }, []);

  const handleResposta = (questaoId, valor) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: valor
    }));
  };

  const proximaQuestao = () => {
    if (questaoAtual < QUESTOES.length - 1) {
      setQuestaoAtual(prev => prev + 1);
      trackGA('Questionario', 'Next', `Questao ${questaoAtual + 1}`);
    } else {
      calcularResultado();
    }
  };

  const questaoAnterior = () => {
    if (questaoAtual > 0) {
      setQuestaoAtual(prev => prev - 1);
    }
  };

  const calcularResultado = () => {
    const total = Object.values(respostas).reduce((sum, val) => sum + val, 0);
    setScore(total);
    setEtapa('resultado');
    trackGA('Questionario', 'Complete', `Score: ${total}`);
  };

  const handleSubmitDados = async (e) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const riskData = getRiskData(score);

      // Enviar dados para API
      const response = await fetch('/api/questionario-olho-seco', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          score,
          nivel: getRiskLevel(score),
          respostas,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setEnviado(true);
        trackGA('Questionario', 'Submit', `Score: ${score}, Email: ${formData.email}`);
      } else {
        throw new Error('Erro ao enviar dados');
      }
    } catch (error) {
      console.error('Erro ao enviar questionário:', error);
      alert('Ocorreu um erro ao enviar seus dados. Por favor, entre em contato diretamente.');
    } finally {
      setEnviando(false);
    }
  };

  const progresso = ((questaoAtual + 1) / QUESTOES.length) * 100;
  const questaoRespondida = respostas[QUESTOES[questaoAtual]?.id] !== undefined;

  return (
    <>
      <Helmet>
        <title>Questionário de Olho Seco - Avaliação Gratuita | Saraiva Vision</title>
        <meta name="description" content="Faça uma autoavaliação gratuita para identificar sintomas de olho seco. Questionário desenvolvido por oftalmologista em Caratinga-MG." />
        <meta name="keywords" content="teste olho seco, questionário olho seco, autoavaliação olho seco, sintomas olho seco, meibografia Caratinga" />

        {/* Open Graph */}
        <meta property="og:title" content="Questionário de Olho Seco - Teste Gratuito" />
        <meta property="og:description" content="Descubra se você tem olho seco em 2 minutos. Questionário validado por oftalmologista." />
        <meta property="og:type" content="website" />

        {/* Medical Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "MedicalWebPage",
            "name": "Questionário de Autoavaliação de Olho Seco",
            "description": "Ferramenta de triagem para identificação de sintomas de síndrome do olho seco",
            "author": {
              "@type": "Physician",
              "name": "Dr. Philipe Saraiva Cruz",
              "medicalSpecialty": "Ophthalmology"
            },
            "about": {
              "@type": "MedicalCondition",
              "name": "Síndrome do Olho Seco",
              "alternateName": "Ceratoconjuntivite Seca"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
        <Navbar />

        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <AnimatePresence mode="wait">
            {/* Introdução */}
            {etapa === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-sky-200">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center">
                      <Eye className="w-10 h-10 text-sky-600" />
                    </div>
                    <CardTitle className="text-3xl mb-2">Questionário de Olho Seco</CardTitle>
                    <CardDescription className="text-lg">
                      Avaliação gratuita desenvolvida por Dr. Philipe Saraiva Cruz
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-6">
                      <h3 className="font-semibold text-sky-900 mb-3 flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        Como funciona
                      </h3>
                      <ul className="space-y-2 text-sky-800">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span><strong>10 perguntas</strong> sobre sintomas e hábitos</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span><strong>2 minutos</strong> para completar</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span><strong>Resultado imediato</strong> com recomendações personalizadas</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <span><strong>100% gratuito</strong> e confidencial</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Promoção Especial Outubro
                      </h3>
                      <p className="text-green-800 mb-1">
                        <strong className="text-xl">R$ 100 OFF</strong> no exame de Meibografia
                      </p>
                      <p className="text-sm text-green-700">
                        Diagnóstico preciso das glândulas de Meibômio com tecnologia avançada
                      </p>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2">
                      <p className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Importante:</strong> Este questionário é apenas uma ferramenta de triagem
                          e não substitui consulta médica. Apenas um oftalmologista pode dar diagnóstico definitivo.
                        </span>
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-center">
                    <Button
                      size="lg"
                      onClick={() => {
                        setEtapa('questoes');
                        trackGA('Questionario', 'Start', 'Olho Seco');
                      }}
                      className="bg-sky-600 hover:bg-sky-700"
                    >
                      Iniciar Questionário
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Questões */}
            {etapa === 'questoes' && (
              <motion.div
                key="questoes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  {/* Barra de progresso */}
                  <div className="h-2 bg-gray-200">
                    <motion.div
                      className="h-full bg-sky-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progresso}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {QUESTOES[questaoAtual].categoria}
                      </span>
                      <span className="text-sm font-medium text-sky-600">
                        {questaoAtual + 1} de {QUESTOES.length}
                      </span>
                    </div>
                    <CardTitle className="text-xl">
                      {QUESTOES[questaoAtual].pergunta}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {QUESTOES[questaoAtual].opcoes.map((opcao) => (
                      <motion.button
                        key={opcao.valor}
                        onClick={() => handleResposta(QUESTOES[questaoAtual].id, opcao.valor)}
                        className={`
                          w-full p-4 text-left rounded-lg border-2 transition-all
                          ${respostas[QUESTOES[questaoAtual].id] === opcao.valor
                            ? 'border-sky-600 bg-sky-50 shadow-md'
                            : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{opcao.texto}</span>
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center
                            ${respostas[QUESTOES[questaoAtual].id] === opcao.valor
                              ? 'border-sky-600 bg-sky-600'
                              : 'border-gray-300'
                            }
                          `}>
                            {respostas[QUESTOES[questaoAtual].id] === opcao.valor && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={questaoAnterior}
                      disabled={questaoAtual === 0}
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Anterior
                    </Button>

                    <Button
                      onClick={proximaQuestao}
                      disabled={!questaoRespondida}
                      className="bg-sky-600 hover:bg-sky-700"
                    >
                      {questaoAtual === QUESTOES.length - 1 ? 'Ver Resultado' : 'Próxima'}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Resultado */}
            {etapa === 'resultado' && (() => {
              const riskData = getRiskData(score);
              const IconComponent = riskData.icon;

              return (
                <motion.div
                  key="resultado"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6"
                >
                  {/* Score */}
                  <Card className={`border-2 ${riskData.corBorda} ${riskData.corBg}`}>
                    <CardHeader className="text-center">
                      <div className={`mx-auto mb-4 w-20 h-20 rounded-full flex items-center justify-center ${riskData.corBg} border-2 ${riskData.corBorda}`}>
                        <IconComponent className={`w-10 h-10 ${riskData.cor}`} />
                      </div>
                      <CardTitle className={`text-2xl mb-2 ${riskData.cor}`}>
                        {riskData.titulo}
                      </CardTitle>
                      <div className="text-4xl font-bold text-gray-800">
                        {score} <span className="text-2xl text-gray-500">/ 40 pontos</span>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <p className="text-center text-lg">{riskData.mensagem}</p>

                      <div className="bg-white rounded-lg p-6 space-y-3">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          {riskData.urgencia === 'urgente' || riskData.urgencia === 'alta'
                            ? 'O que você deve fazer:'
                            : 'Recomendações:'}
                        </h3>
                        <ul className="space-y-2">
                          {riskData.recomendacoes.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              {riskData.urgencia === 'urgente' || riskData.urgencia === 'alta' ? (
                                <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${riskData.cor}`} />
                              ) : (
                                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-sky-600" />
                              )}
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {riskData.promocao && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6">
                          <div className="flex items-start gap-4">
                            <Calendar className="w-8 h-8 text-green-600 flex-shrink-0" />
                            <div>
                              <h3 className="font-bold text-green-900 text-xl mb-2">
                                Promoção Especial Outubro
                              </h3>
                              <p className="text-green-800 mb-3">
                                <strong className="text-2xl">R$ 100 OFF</strong> no exame de <strong>Meibografia</strong>
                              </p>
                              <p className="text-sm text-green-700 mb-4">
                                A meibografia é um exame não invasivo que permite visualizar
                                as glândulas de Meibômio e identificar disfunções precocemente.
                              </p>
                              <Button
                                size="lg"
                                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                                onClick={() => setEtapa('dados')}
                              >
                                {riskData.cta}
                                <ArrowRight className="ml-2 w-5 h-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setEtapa('dados')}
                        >
                          <Mail className="mr-2 w-4 h-4" />
                          Receber Resultado por Email
                        </Button>
                        <Button
                          className="flex-1 bg-sky-600 hover:bg-sky-700"
                          onClick={() => window.open('https://wa.me/5533999999999?text=Olá! Fiz o questionário de olho seco e gostaria de agendar uma consulta.', '_blank')}
                        >
                          <MessageCircle className="mr-2 w-4 h-4" />
                          Agendar via WhatsApp
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informações adicionais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Sobre o Olho Seco</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none">
                      <p>
                        A <strong>Síndrome do Olho Seco</strong> é uma condição multifatorial que afeta
                        a superfície ocular e pode causar desconforto significativo e comprometimento visual.
                      </p>
                      <p>
                        As <strong>glândulas de Meibômio</strong> são responsáveis por produzir a camada lipídica
                        das lágrimas, essencial para evitar a evaporação. Quando não funcionam adequadamente,
                        ocorre a disfunção das glândulas de Meibômio (DGM), principal causa de olho seco.
                      </p>
                      <p>
                        O diagnóstico precoce e tratamento adequado podem melhorar significativamente
                        a qualidade de vida e prevenir complicações.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })()}

            {/* Formulário de Dados */}
            {etapa === 'dados' && !enviado && (
              <motion.div
                key="dados"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Receba seu Resultado</CardTitle>
                    <CardDescription>
                      Preencha seus dados para receber o resultado detalhado por email
                      e informações sobre a promoção de meibografia.
                    </CardDescription>
                  </CardHeader>

                  <form onSubmit={handleSubmitDados}>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                        <input
                          type="text"
                          required
                          value={formData.nome}
                          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="Seu nome"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="seu@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Telefone/WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={formData.telefone}
                          onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="(33) 99999-9999"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Idade (opcional)</label>
                        <input
                          type="number"
                          value={formData.idade}
                          onChange={(e) => setFormData(prev => ({ ...prev, idade: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                          placeholder="Sua idade"
                          min="0"
                          max="120"
                        />
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <input
                          type="checkbox"
                          id="aceite"
                          required
                          checked={formData.aceitaContato}
                          onChange={(e) => setFormData(prev => ({ ...prev, aceitaContato: e.target.checked }))}
                          className="mt-1"
                        />
                        <label htmlFor="aceite" className="text-sm text-gray-700 cursor-pointer">
                          Aceito receber informações sobre saúde ocular e ofertas da Saraiva Vision.
                          Li e concordo com a{' '}
                          <a href="/politica-privacidade" target="_blank" className="text-sky-600 hover:underline">
                            Política de Privacidade
                          </a>
                          .
                        </label>
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEtapa('resultado')}
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        disabled={enviando}
                        className="flex-1 bg-sky-600 hover:bg-sky-700"
                      >
                        {enviando ? (
                          <>
                            <Send className="mr-2 w-4 h-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 w-4 h-4" />
                            Receber Resultado
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            )}

            {/* Confirmação de Envio */}
            {etapa === 'dados' && enviado && (
              <motion.div
                key="confirmacao"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl text-green-900">Resultado Enviado!</CardTitle>
                    <CardDescription className="text-green-700">
                      Verifique seu email em alguns minutos
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="bg-white rounded-lg p-6 space-y-4">
                      <p className="text-center">
                        Enviamos seu resultado detalhado para <strong>{formData.email}</strong>
                      </p>

                      <div className="border-t border-gray-200 pt-4">
                        <h3 className="font-semibold mb-3">Próximos passos:</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Verifique sua caixa de entrada (e spam)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Leia atentamente as recomendações personalizadas</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Entre em contato para agendar sua consulta</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.location.href = '/blog'}
                      >
                        Ler Blog sobre Olho Seco
                      </Button>
                      <Button
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => window.open('https://wa.me/553333212293?text=Olá! Fiz o questionário de olho seco e gostaria de agendar uma consulta com a promoção de meibografia.', '_blank')}
                      >
                        <MessageCircle className="mr-2 w-4 h-4" />
                        Agendar Agora
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Informações de Contato */}
          <Card className="mt-8 border-sky-200">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Phone className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Telefone</h3>
                  <p className="text-sm text-gray-600">(33) 3321-2293</p>
                </div>
                <div className="text-center">
                  <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">WhatsApp</h3>
                  <p className="text-sm text-gray-600">(33) 99999-9999</p>
                </div>
                <div className="text-center">
                  <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-sm text-gray-600">contato@saraivavision.com.br</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <EnhancedFooter />
      </div>
    </>
  );
};

export default QuestionarioOlhoSecoPage;
