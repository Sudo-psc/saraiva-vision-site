import { describe, it, beforeEach, expect, vi } from 'vitest';

// Precisa reimportar o módulo entre testes para resetar singletons/estado
vi.unmock('@/utils/consentMode');
vi.unmock('../consentMode.js');
const importFresh = async () => (await import('../consentMode.js'));

describe('consentMode utils (Consent Mode v2)', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    // limpar gtag para simular ambiente limpo
    delete window.gtag;
    delete window.dataLayer;
  });

  it('acceptAll armazena tudo como granted e shouldShowConsentBanner retorna falso', async () => {
    const mod = await importFresh();
    const res = mod.acceptAll();

    expect(Object.values(res).every(v => v === 'granted')).toBe(true);
    const status = mod.getConsentStatus();
    expect(status.analytics_storage).toBe('granted');
    expect(mod.shouldShowConsentBanner()).toBe(false);
  });

  it('acceptNecessaryOnly concede apenas armazenamento funcional/segurança', async () => {
    const mod = await importFresh();
    const res = mod.acceptNecessaryOnly();
    expect(res.functionality_storage).toBe('granted');
    expect(res.security_storage).toBe('granted');
    expect(res.analytics_storage).toBe('denied');
    expect(res.ad_storage).toBe('denied');
  });
});
