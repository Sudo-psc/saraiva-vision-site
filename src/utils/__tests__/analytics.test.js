import { describe, it, expect, beforeEach, vi } from 'vitest';
import { trackConversion, trackGA, trackMeta } from '@/utils/analytics';

const STORAGE_KEY = 'sv_consent_v1';

describe('analytics (consent-aware)', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    // Reset globals
    window.gtag = undefined;
    window.fbq = undefined;
  });

  it('does not send events without consent', () => {
    const gtagSpy = vi.fn();
    const fbqSpy = vi.fn();
    window.gtag = gtagSpy;
    window.fbq = fbqSpy;

    trackConversion('whatsapp_click');
    trackConversion('cta_open_modal');
    trackGA('custom_event');
    trackMeta('Lead');

    expect(gtagSpy).not.toHaveBeenCalled();
    expect(fbqSpy).not.toHaveBeenCalled();
  });

  it('sends GA events when analytics consent granted', () => {
    const gtagSpy = vi.fn();
    window.gtag = gtagSpy;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, marketing: false }));

    trackConversion('cta_open_modal');
    expect(gtagSpy).toHaveBeenCalled();
    const first = gtagSpy.mock.calls[0];
    expect(first[0]).toBe('event');
    expect(first[1]).toBe('cta_click');
  });

  it('sends Meta events when marketing consent granted', () => {
    const fbqSpy = vi.fn();
    window.fbq = fbqSpy;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: false, marketing: true }));

    trackConversion('whatsapp_click');
    expect(fbqSpy).toHaveBeenCalled();
    const first = fbqSpy.mock.calls[0];
    expect(first[0]).toBe('track');
    expect(first[1]).toBe('Lead');
  });

  it('sends both vendors when both consents granted', () => {
    const gtagSpy = vi.fn();
    const fbqSpy = vi.fn();
    window.gtag = gtagSpy;
    window.fbq = fbqSpy;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, marketing: true }));

    trackConversion('email_click');
    expect(gtagSpy).toHaveBeenCalled();
    expect(fbqSpy).toHaveBeenCalled();
  });
});

