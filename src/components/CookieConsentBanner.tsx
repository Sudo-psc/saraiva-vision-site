'use client';

import { useState, useEffect } from 'react';
import { CookieConsentManager } from '@/lib/privacy/cookie-consent';

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    const consent = CookieConsentManager.getConsent();
    setIsVisible(!consent);
  }, []);
  
  const handleAcceptAll = () => {
    CookieConsentManager.setConsent({
      necessary: true,
      analytics: true,
      personalization: true,
      marketing: true,
    });
    setIsVisible(false);
  };
  
  const handleRejectAll = () => {
    CookieConsentManager.setConsent({
      necessary: true,
      analytics: false,
      personalization: false,
      marketing: false,
    });
    setIsVisible(false);
  };
  
  const handleSavePreferences = (preferences: {
    analytics: boolean;
    personalization: boolean;
    marketing: boolean;
  }) => {
    CookieConsentManager.setConsent({
      necessary: true,
      ...preferences,
    });
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg p-6 z-50">
      <div className="max-w-7xl mx-auto">
        {!showDetails ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Usamos cookies para personalizar sua experiência e melhorar nosso site. 
                Seus dados são processados localmente no seu navegador, respeitando sua privacidade.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Personalizar
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Rejeitar Todos
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aceitar Todos
              </button>
            </div>
          </div>
        ) : (
          <CookiePreferences
            onSave={handleSavePreferences}
            onBack={() => setShowDetails(false)}
          />
        )}
      </div>
    </div>
  );
}

interface CookiePreferencesProps {
  onSave: (preferences: { analytics: boolean; personalization: boolean; marketing: boolean }) => void;
  onBack: () => void;
}

function CookiePreferences({ onSave, onBack }: CookiePreferencesProps) {
  const [preferences, setPreferences] = useState({
    analytics: false,
    personalization: false,
    marketing: false,
  });
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Preferências de Cookies</h3>
      
      <div className="space-y-3">
        <div className="flex items-start justify-between p-3 bg-gray-50 rounded">
          <div className="flex-1">
            <h4 className="font-medium text-sm">Necessários</h4>
            <p className="text-xs text-gray-600 mt-1">
              Essenciais para o funcionamento do site
            </p>
          </div>
          <span className="text-xs text-gray-500">Sempre ativo</span>
        </div>
        
        <div className="flex items-start justify-between p-3 bg-gray-50 rounded">
          <div className="flex-1">
            <h4 className="font-medium text-sm">Personalização</h4>
            <p className="text-xs text-gray-600 mt-1">
              Adapta o conteúdo ao seu perfil
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.personalization}
              onChange={(e) => setPreferences({ ...preferences, personalization: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-start justify-between p-3 bg-gray-50 rounded">
          <div className="flex-1">
            <h4 className="font-medium text-sm">Análise</h4>
            <p className="text-xs text-gray-600 mt-1">
              Nos ajuda a entender como melhorar
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.analytics}
              onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex items-start justify-between p-3 bg-gray-50 rounded">
          <div className="flex-1">
            <h4 className="font-medium text-sm">Marketing</h4>
            <p className="text-xs text-gray-600 mt-1">
              Conteúdos relevantes e ofertas
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.marketing}
              onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          Voltar
        </button>
        <button
          onClick={() => onSave(preferences)}
          className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Salvar Preferências
        </button>
      </div>
    </div>
  );
}
