import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'irpl_announcement_seen';

const IRPLAnnouncement = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user already saw the announcement
    const wasSeen = localStorage.getItem(STORAGE_KEY);
    if (wasSeen) return;

    // Show after 1.5 seconds delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(showTimer);
  }, []);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!isVisible) return;

    const dismissTimer = setTimeout(() => {
      handleClose();
    }, 6000);

    return () => clearTimeout(dismissTimer);
  }, [isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    localStorage.setItem(STORAGE_KEY, 'true');

    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  const handleClick = () => {
    handleClose();
    navigate('/irpl');
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
        isClosing ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'
      }`}
    >
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl shadow-2xl p-5 max-w-sm relative overflow-hidden">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent animate-pulse pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Fechar anúncio"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3 h-3" />
            <span>NOVO EM CARATINGA</span>
          </div>

          {/* Title */}
          <h3 className="text-white font-bold text-lg mb-2 leading-tight">
            Tratamento IRPL para Olho Seco
          </h3>

          {/* Description */}
          <p className="text-violet-100 text-sm mb-4 leading-relaxed">
            Tecnologia francesa E-Eye agora disponível no interior de Minas.
            <strong className="text-white"> Resultados de 6 meses a 3 anos.</strong>
          </p>

          {/* CTA */}
          <button
            onClick={handleClick}
            className="w-full bg-white text-violet-700 hover:bg-violet-50 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <span>Saiba Mais</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Auto-dismiss indicator */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="flex-1 h-0.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 animate-[shrink_6s_linear_forwards]" />
            </div>
            <span className="text-xs text-white/60">auto-fechar</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default IRPLAnnouncement;
