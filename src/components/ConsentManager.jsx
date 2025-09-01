import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

const STORAGE_KEY = 'sv_consent_v1';

const defaultState = {
  analytics: false,
  marketing: false,
  functional: true,
  timestamp: null
};

export function getConsentState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
}

const ConsentManager = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    const saved = getConsentState();
    if (!saved) setShowBanner(true);
    if (saved) setState(prev => ({ ...prev, ...saved }));
    const handler = () => setOpen(true);
    window.addEventListener('open-privacy-settings', handler);
    return () => window.removeEventListener('open-privacy-settings', handler);
  }, []);

  // Lock body scroll when banner or modal is visible
  useBodyScrollLock(showBanner || open);

  const save = (next) => {
    const payload = { ...next, timestamp: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setState(payload);
    setShowBanner(false);
    setOpen(false);
    window.dispatchEvent(new CustomEvent('consent-updated', { detail: payload }));
  };

  const acceptAll = () => save({ analytics: true, marketing: true, functional: true });
  const rejectAll = () => save({ analytics: false, marketing: false, functional: false });

  const Banner = () => (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:max-w-md z-50 bg-white border border-slate-200 shadow-xl rounded-lg p-4 text-sm space-y-3">
      <p className="text-slate-700">{t('privacy.intro')}</p>
      <div className="flex flex-wrap gap-2 justify-end">
        <button onClick={rejectAll} className="px-3 py-1.5 rounded border text-slate-600 hover:bg-slate-50">{t('common.reject_all', 'Rejeitar')}</button>
        <button onClick={() => setOpen(true)} className="px-3 py-1.5 rounded border text-slate-600 hover:bg-slate-50">{t('common.customize', 'Personalizar')}</button>
        <button onClick={acceptAll} className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700">{t('common.accept_all', 'Aceitar')}</button>
      </div>
    </div>
  );

  const Modal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)}></div>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5 overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-semibold mb-2">{t('privacy.manage_cookies')}</h2>
        <p className="text-xs text-slate-700 mb-4">{t('privacy.intro')}</p>
        {['functional', 'analytics', 'marketing'].map(cat => (
          <label key={cat} className="flex items-start gap-3 py-2 border-b last:border-b-0">
            <input type="checkbox" checked={state[cat]} onChange={e => setState(prev => ({ ...prev, [cat]: e.target.checked }))} />
            <span className="text-sm">
              <strong className="block capitalize">{cat}</strong>
              <span className="text-slate-700 text-xs">
                {cat === 'functional' && t('privacy.cat_functional', 'Melhora funcionalidades do site.')}
                {cat === 'analytics' && t('privacy.cat_analytics', 'Mede uso de forma agregada.')}
                {cat === 'marketing' && t('privacy.cat_marketing', 'Personaliza anúncios e remarketing.')}
              </span>
            </span>
          </label>
        ))}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-slate-700 hover:underline">{t('common.cancel', 'Cancelar')}</button>
          <button onClick={() => save(state)} className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">{t('common.save', 'Salvar')}</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {showBanner && <Banner />}
      {open && <Modal />}
    </>
  );
};

export default ConsentManager;
