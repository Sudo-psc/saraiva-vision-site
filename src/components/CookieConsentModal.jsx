import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Settings } from 'lucide-react';
import { Button } from './ui/button';

const CookieConsentModal = ({ onClose }) => {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const saved = localStorage.getItem('cookieConsent');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    setPreferences(allAccepted);
    if (onClose) onClose();
  };

  const handleRejectAll = () => {
    const rejected = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    localStorage.setItem('cookieConsent', JSON.stringify(rejected));
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    setPreferences(rejected);
    if (onClose) onClose();
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    localStorage.setItem('cookieConsentTimestamp', new Date().toISOString());
    if (onClose) onClose();
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-labelledby="cookie-modal-title"
          aria-modal="true"
        >
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 id="cookie-modal-title" className="text-2xl font-bold text-slate-900">
              Preferências de Cookies
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-slate-700 leading-relaxed">
              Utilizamos cookies para melhorar sua experiência em nosso site, personalizar conteúdo e analisar nosso tráfego. 
              Você pode gerenciar suas preferências abaixo.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Cookies Necessários</h3>
                    <p className="text-sm text-slate-600">
                      Essenciais para o funcionamento básico do site. Não podem ser desativados.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-teal-600" aria-label="Sempre ativo" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Cookies Analíticos</h3>
                    <p className="text-sm text-slate-600">
                      Nos ajudam a entender como os visitantes interagem com o site (Google Analytics).
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                      preferences.analytics ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={preferences.analytics}
                    aria-label="Alternar cookies analíticos"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Cookies de Marketing</h3>
                    <p className="text-sm text-slate-600">
                      Usados para rastrear visitantes e exibir anúncios relevantes.
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('marketing')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                      preferences.marketing ? 'bg-teal-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={preferences.marketing}
                    aria-label="Alternar cookies de marketing"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <strong>Política de Privacidade:</strong> Para mais informações sobre como tratamos seus dados, 
                consulte nossa <a href="/politica-privacidade" className="underline hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded">Política de Privacidade</a>.
              </p>
            </div>
          </div>

          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="flex-1 border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              <XCircle className="w-4 h-4 mr-2" aria-hidden="true" />
              Rejeitar Todos
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
              Salvar Preferências
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
              Aceitar Todos
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CookieConsentModal;
