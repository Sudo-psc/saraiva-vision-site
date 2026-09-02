import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, AlertTriangle, Calendar, MessageCircle, ExternalLink } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import EnhancedFooter from '@/components/EnhancedFooter';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button.jsx';

const TesteOlhoSecoPage = () => {
  const navigate = useNavigate();
  
  // --- CONFIGURAÇÃO ---
  const TEST_DURATION = 10; // segundos
  const CIRCLE_RADIUS = 140;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // --- ESTADOS ---
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState(null); // null, 'success', 'failure'
  const [eyesState, setEyesState] = useState('blinking'); // 'blinking', 'open', 'closed'
  const timerIntervalRef = useRef(null);

  // --- LÓGICA DO TESTE ---

  const startTest = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setTimeLeft(TEST_DURATION);
    setTestResult(null);
    setEyesState('open'); // Arregala os olhos

    // Iniciar Loop
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 0.1;
        if (newTime <= 0) {
          clearInterval(timerIntervalRef.current);
          finishTest(true);
          return 0;
        }
        return newTime;
      });
    }, 100);
  };

  const failTest = () => {
    if (!isRunning) return;
    setEyesState('closed'); // Fecha os olhos
    finishTest(false);
  };

  const finishTest = (success) => {
    clearInterval(timerIntervalRef.current);
    setIsRunning(false);
    setTestResult(success ? 'success' : 'failure');

    if (success) {
      setEyesState('blinking'); // Volta ao normal
    } else {
      // Cenário Falha (Piscou)
      // Mantém olhos fechados por um momento depois volta a piscar
      setTimeout(() => {
        setEyesState('blinking');
      }, 1000);
    }
  };

  const resetTest = () => {
    setTimeLeft(TEST_DURATION);
    setTestResult(null);
    setEyesState('blinking');
    setIsRunning(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  // Limpar intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Listener para clique na tela (apenas se estiver rodando e não for botão)
  const handleGlobalClick = (e) => {
    if (isRunning && e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
      // Opcional: failTest(); // Se quiser que qualquer clique falhe o teste
    }
  };

  // --- CÁLCULOS VISUAIS ---
  const progressOffset = CIRCLE_CIRCUMFERENCE - ((timeLeft / TEST_DURATION) * CIRCLE_CIRCUMFERENCE);

  // SEO
  const seo = {
    title: 'Teste Rápido de Olho Seco (10 Segundos) | Saraiva Vision',
    description: 'Faça nosso teste interativo de 10 segundos para identificar sintomas de olho seco. Simples, rápido e online.',
    keywords: 'teste olho seco, teste 10 segundos olho, sintomas olho seco, oftalmologista caratinga'
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a192f] text-white font-sans selection:bg-cyan-500 selection:text-white" onClick={handleGlobalClick}>
      <SEOHead {...seo} />
      
      {/* Navbar simplificada ou completa - aqui usando a completa mas com estilo dark se suportado, senão apenas o cabeçalho simples pedido */}
      <header className="px-6 py-6 flex justify-between items-center max-w-6xl mx-auto w-full z-10 relative">
        <div className="font-bold text-xl text-white">
          Saraiva<span className="text-cyan-400">Vision</span>
        </div>
        <Link 
          to="/olho-seco" 
          className="text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        
        {/* Título e Instrução */}
        <AnimatePresence mode="wait">
          {!isRunning && !testResult && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 z-10"
            >
              <h1 className="text-3xl md:text-4xl font-light mb-2 text-white">Teste de Olho Seco</h1>
              <p className="text-cyan-300 text-lg font-medium">Tente manter os olhos abertos por 10 segundos</p>
            </motion.div>
          )}
          {isRunning && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 z-10"
            >
              <p className="text-white text-2xl font-light">Mantenha os olhos abertos...</p>
            </motion.div>
          )}
          {testResult && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 z-10"
            >
              <h1 className="text-3xl font-bold text-white">
                {testResult === 'success' ? 'Teste Concluído!' : 'Teste Interrompido'}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Container do Personagem e Anel */}
        <div className="relative w-[300px] h-[300px] flex items-center justify-center my-4 z-10">
          
          {/* SVG Ring */}
          <svg className="absolute top-0 left-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              stroke="#112240"
              strokeWidth="8"
              fill="transparent"
              r={CIRCLE_RADIUS}
              cx="150"
              cy="150"
            />
            <motion.circle
              stroke="#06b6d4" // Cyan Primary
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r={CIRCLE_RADIUS}
              cx="150"
              cy="150"
              strokeDasharray={`${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`}
              strokeDashoffset={progressOffset}
              initial={false}
              animate={{ strokeDashoffset: progressOffset }}
              transition={{ duration: 0.1, ease: "linear" }}
              style={{ filter: "drop-shadow(0 0 4px #06b6d4)" }}
            />
          </svg>

          {/* Personagem SVG */}
          <div className="w-[220px] h-[220px] drop-shadow-2xl">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Corpo/Jaleco */}
              <path d="M40,180 Q100,220 160,180 L160,200 L40,200 Z" fill="#ffffff"/>
              <path d="M70,180 L70,200 M130,180 L130,200" stroke="#e2e8f0" strokeWidth="2"/>
              
              {/* Pescoço */}
              <rect x="85" y="130" width="30" height="30" fill="#ffdbac"/>

              {/* Cabeça */}
              <circle cx="100" cy="100" r="50" fill="#ffdbac"/>
              
              {/* Cabelo */}
              <path d="M55,90 Q100,40 145,90 Q145,80 135,60 Q100,30 65,60 Z" fill="#2d3748"/>

              {/* Orelhas */}
              <circle cx="48" cy="100" r="8" fill="#ffdbac"/>
              <circle cx="152" cy="100" r="8" fill="#ffdbac"/>

              {/* Óculos (Armação) */}
              <g stroke="#0a192f" strokeWidth="3" fill="none">
                <circle cx="80" cy="100" r="18"/>
                <line x1="98" y1="100" x2="102" y2="100"/>
                <circle cx="120" cy="100" r="18"/>
                <line x1="62" y1="95" x2="48" y2="92"/> 
                <line x1="138" y1="95" x2="152" y2="92"/>
              </g>

              {/* Olhos (Grupo para animação) */}
              <g>
                {/* Sclera */}
                <circle cx="80" cy="100" r="10" fill="white"/>
                <circle cx="120" cy="100" r="10" fill="white"/>
                
                {/* Íris */}
                <circle cx="80" cy="100" r="5" fill="#3b82f6"/>
                <circle cx="120" cy="100" r="5" fill="#3b82f6"/>
                
                {/* Pupila */}
                <circle cx="80" cy="100" r="2" fill="#000"/>
                <circle cx="120" cy="100" r="2" fill="#000"/>

                {/* Pálpebras - Animadas via Framer Motion */}
                <motion.rect 
                  x="65" y="85" width="30" height="30" fill="#ffdbac"
                  animate={
                    eyesState === 'open' ? { scaleY: 0 } :
                    eyesState === 'closed' ? { scaleY: 1 } :
                    { scaleY: [0, 1, 0] } // Blinking loop
                  }
                  transition={
                    eyesState === 'blinking' 
                    ? { repeat: Infinity, duration: 4, times: [0, 0.96, 1], ease: "linear" } 
                    : { duration: 0.1 }
                  }
                  style={{ originY: 0.45 }} // Pivô na pálpebra
                />
                <motion.rect 
                  x="105" y="85" width="30" height="30" fill="#ffdbac"
                  animate={
                    eyesState === 'open' ? { scaleY: 0 } :
                    eyesState === 'closed' ? { scaleY: 1 } :
                    { scaleY: [0, 1, 0] } // Blinking loop
                  }
                  transition={
                    eyesState === 'blinking' 
                    ? { repeat: Infinity, duration: 4, times: [0, 0.96, 1], ease: "linear" } 
                    : { duration: 0.1 }
                  }
                  style={{ originY: 0.45 }}
                />
              </g>

              {/* Boca */}
              <path d="M90,135 Q100,140 110,135" stroke="#c2410c" strokeWidth="2" fill="none" opacity="0.6"/>
            </svg>
          </div>
        </div>

        {/* Timer Display */}
        <div className={`text-5xl md:text-6xl font-bold text-white transition-opacity duration-300 ${isRunning ? 'opacity-100' : 'opacity-0'} h-20`}>
          {Math.ceil(timeLeft)}
        </div>

        {/* Botões de Ação */}
        <div className="z-20 mt-4 min-h-[80px]">
          {!isRunning && !testResult && (
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={startTest}
              className="bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#0a192f] px-10 py-4 rounded-full text-xl font-bold uppercase tracking-wider shadow-lg"
            >
              Iniciar Teste
            </motion.button>
          )}

          {isRunning && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)", scale: 1.02 }}
              onClick={failTest}
              className="bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-8 py-3 rounded-full text-lg font-semibold uppercase tracking-wide transition-colors"
            >
              Piscar / Parei
            </motion.button>
          )}
        </div>

        {/* Card de Resultado */}
        <AnimatePresence>
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl mt-8 z-20"
            >
              <div className={`bg-[#112240] p-8 rounded-3xl border ${testResult === 'success' ? 'border-green-500' : 'border-amber-500'} shadow-xl text-left`}>
                <div className="flex items-center gap-3 mb-4">
                  {testResult === 'success' ? (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                  )}
                  <h2 className={`text-2xl font-bold ${testResult === 'success' ? 'text-green-500' : 'text-amber-500'}`}>
                    {testResult === 'success' ? 'Parabéns!' : 'Atenção!'}
                  </h2>
                </div>

                <div className="text-slate-300 text-lg leading-relaxed mb-8">
                  {testResult === 'success' ? (
                    <>
                      Você conseguiu manter os olhos abertos por 10 segundos.<br /><br />
                      Isso indica uma <strong>boa estabilidade do filme lacrimal</strong>. No entanto, se você sente desconforto visual em telas, agende uma avaliação preventiva para manter sua saúde ocular em dia.
                    </>
                  ) : (
                    <>
                      Você piscou em <strong>{(TEST_DURATION - timeLeft).toFixed(1)} segundos</strong>.<br /><br />
                      A dificuldade em manter os olhos abertos pode indicar <strong>instabilidade na lágrima (disfunção evaporativa)</strong> ou olho seco. Recomendamos uma avaliação especializada com Meibografia.
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => undefined}
                    className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-[#0a192f] font-bold py-6 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Clínica encerrada
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => void('https://wa.me/5533998601427?text=Fiz o teste de olho seco no site e gostaria de agendar uma avaliação.', '_blank')}
                    className="border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold py-6 rounded-xl flex items-center justify-center gap-2 bg-transparent"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              {/* Links Educativos */}
              <div className="mt-8 text-left bg-[#112240]/50 p-6 rounded-2xl border border-slate-700">
                <h4 className="text-cyan-400 font-semibold uppercase tracking-wider text-sm mb-4">Saiba mais sobre sua saúde ocular</h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/olho-seco" className="text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-colors group">
                      <ExternalLink className="w-4 h-4 text-cyan-500" />
                      <span className="group-hover:translate-x-1 transition-transform">Entenda a Doença do Olho Seco</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/luz-pulsada-irpl" className="text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-colors group">
                      <ExternalLink className="w-4 h-4 text-cyan-500" />
                      <span className="group-hover:translate-x-1 transition-transform">Conheça o tratamento com Luz Pulsada (IRPL)</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/meibografia" className="text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-colors group">
                      <ExternalLink className="w-4 h-4 text-cyan-500" />
                      <span className="group-hover:translate-x-1 transition-transform">O que é Meibografia?</span>
                    </Link>
                  </li>
                </ul>
              </div>

              <button
                onClick={resetTest}
                className="mt-8 text-slate-400 hover:text-white underline underline-offset-4 mb-12"
              >
                Refazer teste
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <EnhancedFooter />
    </div>
  );
};

export default TesteOlhoSecoPage;
