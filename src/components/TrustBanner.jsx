/**
 * Trust Banner Component
 * Elemento de destaque no topo da página inicial com link para Google Maps
 * Posicionamento estratégico para máxima visibilidade e credibilidade
 */

import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, X, TrendingUp, Shield, Award, Users } from 'lucide-react';

const TRUST_CONFIG = {
  rating: 4.9,
  totalReviews: 150,
  placeUrl: 'https://maps.google.com/?cid=17367763261775232199',
  autoHideDelay: 15000, // 15 segundos para auto-esconder
  showAfterScroll: 200, // mostrar após scroll de 200px
};

const TrustBanner = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Trigger enter animation after mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto-hide após delay
  useEffect(() => {
    if (isDismissed) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      setIsDismissed(true);
    }, TRUST_CONFIG.autoHideDelay);

    return () => clearTimeout(timer);
  }, [isDismissed]);

  // Detectar scroll para mostrar novamente
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > TRUST_CONFIG.showAfterScroll;
      setHasScrolled(scrolled);

      if (scrolled && !isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleTrustClick = () => {
    // Track analytics se disponível
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        event_category: 'trust_banner',
        event_label: 'google_reviews_link',
      });
    }
  };

  const renderStars = () => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(TRUST_CONFIG.rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  if (!isVisible || isDismissed) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-cyan-600 to-blue-600 shadow-lg hidden md:block ${className}`}
      style={{
        transform: mounted ? 'translateY(0)' : 'translateY(100%)',
        opacity: mounted ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.3s ease',
      }}
    >
          <div className="max-w-7xl mx-auto px-[7%] py-3">
            <div className="flex items-center justify-between">
              {/* Conteúdo Principal - Link para Google */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Ícone de Confiança */}
                <div className="flex-shrink-0">
                  <div className="p-2 bg-white/20 rounded-full">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Texto Principal */}
                <div className="flex-1 min-w-0">
                  <a
                    href={TRUST_CONFIG.placeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleTrustClick}
                    className="flex items-center gap-3 text-white hover:text-white/90 transition-colors group"
                  >
                    {/* Avaliação Visual */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {renderStars()}
                      <span className="font-bold text-lg">
                        {TRUST_CONFIG.rating}
                      </span>
                    </div>

                    {/* Texto Principal */}
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline font-medium text-white/95">
                        {TRUST_CONFIG.totalReviews} avaliações verificadas no Google
                      </span>
                      <span className="sm:hidden font-medium text-white/95">
                        {TRUST_CONFIG.totalReviews} avaliações verificadas
                      </span>
                      <ExternalLink className="w-3 h-3 text-white/70 group-hover:text-white/90 transition-colors flex-shrink-0" />
                    </div>
                  </a>
                </div>

                {/* Indicadores de Confiança */}
                <div className="hidden md:flex items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>96% satisfação</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>10+ anos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    <span>Especialistas</span>
                  </div>
                </div>
              </div>

              {/* Botão de Dismiss */}
              <button
                onClick={handleDismiss}
                className="ml-4 p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200 flex-shrink-0"
                aria-label="Fechar banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Barra de Progresso */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-white/60 origin-left"
                style={{
                  animation: `trustbar-shrink ${TRUST_CONFIG.autoHideDelay}ms linear forwards`,
                }}
              />
            </div>
          </div>
        </div>
  );
};

export default TrustBanner;