import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shouldShowConsentBanner, acceptAll } from '@/utils/consentMode';

const CookieBanner = ({ onOpenModal }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldShowConsentBanner()) {
        setIsVisible(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setIsVisible(false);
  };

  const handleManagePreferences = () => {
    setIsVisible(false);
    if (onOpenModal) {
      onOpenModal();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
          className="cookie-banner"
        >
          <div className="cookie-banner-content">
            <h2 id="cookie-banner-title" className="sr-only">
              Aviso sobre cookies
            </h2>

            <div className="cookie-banner-text">
              <p id="cookie-banner-description" className="text-sm text-slate-700">
                Usamos cookies para melhorar sua experiência e analisar o uso do site. 
                Ao continuar navegando, você concorda com nossa{' '}
                <a 
                  href="/privacy" 
                  className="underline hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:rounded"
                >
                  Política de Privacidade
                </a>.
              </p>
            </div>

            <div className="cookie-banner-actions">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="btn-accept-all"
                aria-label="Aceitar todos os cookies"
              >
                Aceitar Todos
              </button>

              <button
                type="button"
                onClick={handleManagePreferences}
                className="btn-manage"
                aria-label="Gerenciar preferências de cookies"
              >
                Gerenciar Preferências
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
