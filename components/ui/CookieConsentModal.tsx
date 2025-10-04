'use client';

/**
 * CookieConsentModal Component
 * LGPD-compliant cookie consent management with banner and modal
 * Phase 4: UI Components Migration (Vite → Next.js 15)
 *
 * Features:
 * - LGPD compliance with granular consent categories
 * - localStorage persistence with timestamps
 * - Radix Dialog for accessibility (WCAG AAA)
 * - Focus trap and keyboard navigation
 * - Framer Motion animations
 * - Auto-show banner on first visit
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X, CheckCircle, XCircle, Settings, Cookie } from 'lucide-react';
import { Button } from './button';
import type { CookieConsentModalProps, CookieBannerProps, ConsentPreferences, ConsentCategory } from '@/types/ui';
import {
  getConsent,
  setConsent,
  acceptAll,
  acceptNecessaryOnly,
  shouldShowConsentBanner,
} from '@/lib/utils/consentMode';

// Default consent categories
const DEFAULT_CATEGORIES: ConsentCategory[] = [
  {
    id: 'analytics_storage',
    name: 'Cookies Analíticos',
    description: 'Nos ajudam a entender como os visitantes interagem com o site (Google Analytics). Dados anônimos.',
    required: false,
  },
  {
    id: 'ad_storage',
    name: 'Cookies de Marketing',
    description: 'Rastreiam visitas para exibir anúncios relevantes (Meta Pixel, Google Ads).',
    required: false,
  },
  {
    id: 'ad_personalization',
    name: 'Personalização de Anúncios',
    description: 'Personaliza anúncios baseado em seus interesses e comportamento.',
    required: false,
  },
];

/**
 * CookieConsentModal Component
 * Main modal for managing cookie preferences
 */
export const CookieConsentModal: React.FC<CookieConsentModalProps> = ({
  isOpen,
  onClose,
  onAcceptAll: externalAcceptAll,
  onRejectAll: externalRejectAll,
  onSavePreferences: externalSavePreferences,
  initialPreferences,
  categories = DEFAULT_CATEGORIES,
  className = '',
}) => {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_personalization: 'denied',
  });

  useEffect(() => {
    if (isOpen) {
      const currentConsent = getConsent();
      setPreferences({
        analytics_storage: currentConsent.analytics_storage || 'denied',
        ad_storage: currentConsent.ad_storage || 'denied',
        ad_personalization: currentConsent.ad_personalization || 'denied',
        ...initialPreferences,
      });
    }
  }, [isOpen, initialPreferences]);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
    externalAcceptAll?.();
    onClose();
  }, [externalAcceptAll, onClose]);

  const handleRejectAll = useCallback(() => {
    acceptNecessaryOnly();
    externalRejectAll?.();
    onClose();
  }, [externalRejectAll, onClose]);

  const handleSavePreferences = useCallback(() => {
    setConsent(preferences);
    externalSavePreferences?.(preferences);
    onClose();
  }, [preferences, externalSavePreferences, onClose]);

  const togglePreference = useCallback((key: keyof ConsentPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: prev[key] === 'granted' ? 'denied' : 'granted',
    }));
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
          />
        </Dialog.Overlay>

        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed left-1/2 top-1/2 z-[10000] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl max-w-2xl w-[calc(100%-2rem)] max-h-[90vh] overflow-hidden flex flex-col ${className}`}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <Dialog.Title className="text-2xl font-bold text-slate-900">
                Preferências de Cookies
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  aria-label="Fechar modal"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <Dialog.Description className="text-slate-700 leading-relaxed">
                Utilizamos cookies para melhorar sua experiência em nosso site, personalizar conteúdo e analisar nosso
                tráfego. Você pode gerenciar suas preferências abaixo.
              </Dialog.Description>

              <div className="space-y-4">
                {/* Necessary Cookies - Always Active */}
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

                {/* Customizable Categories */}
                {categories.map((category) => (
                  <div key={category.id} className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{category.name}</h3>
                        <p className="text-sm text-slate-600">{category.description}</p>
                      </div>
                      <button
                        onClick={() => togglePreference(category.id)}
                        disabled={category.required}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          preferences[category.id] === 'granted' ? 'bg-teal-600' : 'bg-slate-300'
                        }`}
                        role="switch"
                        aria-checked={preferences[category.id] === 'granted'}
                        aria-label={`Alternar ${category.name.toLowerCase()}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences[category.id] === 'granted' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Privacy Policy Link */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <strong>Política de Privacidade:</strong> Para mais informações sobre como tratamos seus dados,
                  consulte nossa{' '}
                  <a
                    href="/privacy"
                    className="underline hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  >
                    Política de Privacidade
                  </a>
                  .
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                Rejeitar Todos
              </Button>
              <Button
                onClick={handleSavePreferences}
                variant="secondary"
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
                Salvar Preferências
              </Button>
              <Button
                onClick={handleAcceptAll}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" />
                Aceitar Todos
              </Button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/**
 * CookieBanner Component
 * Floating banner shown on first visit with quick actions
 */
export const CookieBanner: React.FC<CookieBannerProps> = ({
  onOpenModal,
  onAcceptAll: externalAcceptAll,
  position = 'bottom',
  delay = 1000,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldShowConsentBanner()) {
        setIsVisible(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handleAcceptAll = useCallback(() => {
    acceptAll();
    externalAcceptAll?.();
    setIsVisible(false);
  }, [externalAcceptAll]);

  const handleManagePreferences = useCallback(() => {
    setIsVisible(false);
    onOpenModal?.();
  }, [onOpenModal]);

  const positionClasses = {
    bottom: 'bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md',
    top: 'top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md',
    'bottom-left': 'bottom-4 left-4 max-w-md',
    'bottom-right': 'bottom-4 right-4 max-w-md',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: position.includes('bottom') ? 100 : -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position.includes('bottom') ? 100 : -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
          className={`fixed z-[9998] ${positionClasses[position]} ${className}`}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Cookie className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h2 id="cookie-banner-title" className="font-semibold text-slate-900 mb-2">
                    Aviso sobre cookies
                  </h2>
                  <p id="cookie-banner-description" className="text-sm text-slate-700">
                    Usamos cookies para melhorar sua experiência e analisar o uso do site. Ao continuar navegando, você
                    concorda com nossa{' '}
                    <a
                      href="/privacy"
                      className="underline hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:rounded"
                    >
                      Política de Privacidade
                    </a>
                    .
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleAcceptAll}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                    aria-label="Aceitar todos os cookies"
                  >
                    Aceitar Todos
                  </Button>
                  <Button
                    onClick={handleManagePreferences}
                    variant="outline"
                    className="flex-1"
                    aria-label="Gerenciar preferências de cookies"
                  >
                    Gerenciar Preferências
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * CookieConsent Component
 * Unified component that manages both banner and modal
 */
export const CookieConsent: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CookieBanner onOpenModal={() => setIsModalOpen(true)} />
      <CookieConsentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default CookieConsent;
