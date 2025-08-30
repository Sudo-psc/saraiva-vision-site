import { describe, it, beforeEach, expect, vi } from 'vitest';

// Mock consent module first, then import analytics to ensure it sees the mocked functions
vi.mock('@/utils/consentMode', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    hasConsent: vi.fn((type) => type === 'analytics_storage'),
    onConsentChange: vi.fn(() => () => {})
  };
});

import { trackGA, trackMeta, bindConsentUpdates, trackEnhancedConversion } from '../analytics.js';
import { hasConsent, onConsentChange } from '@/utils/consentMode';

describe('analytics (consent-aware)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // GA / Meta stubs
    window.gtag = vi.fn();
    window.fbq = vi.fn();
  });

  it('trackGA não envia sem vendor pronto ou sem consentimento', () => {
    // Sem consent para analytics (override momentâneo)
    hasConsent.mockReturnValue(false);
    expect(trackGA('event_test')).toBe(false);

    // Com consent mas sem gtag
    hasConsent.mockReturnValue(true);
    const old = window.gtag;
    delete window.gtag;
    expect(trackGA('event_test')).toBe(false);
    window.gtag = old;
  });

  it('trackGA envia quando há consent e gtag', () => {
    hasConsent.mockReturnValue(true);
    const ok = trackGA('my_event', { a: 1 });
    expect(ok).toBe(true);
    expect(window.gtag).toHaveBeenCalledWith('event', 'my_event', { a: 1 });
  });

  it('trackMeta respeita consentimento de marketing', () => {
    // Sem consent para marketing
    hasConsent.mockImplementation((type) => type === 'analytics_storage' ? true : false);
    expect(trackMeta('Lead', { x: 1 })).toBe(false);
  });

  it('bindConsentUpdates propaga mudanças para gtag e fbq', () => {
    // Faça o callback ser chamado imediatamente com consent concedido
    onConsentChange.mockImplementation((cb) => { cb({ ad_storage: 'granted', analytics_storage: 'granted' }); return () => {}; });

    bindConsentUpdates();
    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', expect.objectContaining({ analytics_storage: 'granted' }));
    expect(window.fbq).toHaveBeenCalledWith('consent', 'grant');
  });

  it('trackEnhancedConversion inclui user_data quando há consentimento', async () => {
    // Conceder ad_user_data e analytics_storage
    hasConsent.mockImplementation((type) => ['ad_user_data', 'analytics_storage'].includes(type));
    window.gtag = vi.fn();

    await trackEnhancedConversion('conv', { email: 'USER@EXAMPLE.com', phone: '+55 (33) 98888-7777' });

    // Apenas validação de presença das chaves user_data (hash pode ser pass-through sem crypto.subtle)
    expect(window.gtag).toHaveBeenCalled();
    const args = window.gtag.mock.calls.find(c => c[0] === 'event');
    expect(args[2]).toHaveProperty('user_data');
    expect(args[2].user_data).toHaveProperty('sha256_email_address');
    expect(args[2].user_data).toHaveProperty('sha256_phone_number');
  });
});
