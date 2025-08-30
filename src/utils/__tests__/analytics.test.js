import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the consent module before importing analytics
vi.mock('@/utils/consentMode', () => ({
  hasConsent: vi.fn(() => false),
  onConsentChange: vi.fn(),
}));

import { trackConversion, trackGA, trackMeta } from '@/utils/analytics';
import { hasConsent } from '@/utils/consentMode';

const STORAGE_KEY = 'sv_consent_v1';

describe('analytics (consent-aware)', () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    vi.clearAllMocks();
    // Reset globals
    window.gtag = vi.fn();
    window.fbq = vi.fn();
    
    // Reset consent mocks to default (no consent)
    vi.mocked(hasConsent).mockReturnValue(false);
  });

  it('does not send events without consent', () => {
    // Ensure no consent by default
    vi.mocked(hasConsent).mockReturnValue(false);

    trackGA('custom_event');

    expect(window.gtag).not.toHaveBeenCalled();
    expect(window.fbq).not.toHaveBeenCalled();
  });

  it('sends GA events when analytics consent granted', () => {
    const gtagSpy = vi.fn();
    window.gtag = gtagSpy;
    vi.mocked(hasConsent).mockReturnValue(true);

    trackConversion('cta_open_modal');
    expect(gtagSpy).toHaveBeenCalled();
    const first = gtagSpy.mock.calls[0];
    expect(first[0]).toBe('event');
    expect(first[1]).toBe('cta_click');
  });

  it('sends Meta events when marketing consent granted', () => {
    const fbqSpy = vi.fn();
    window.fbq = fbqSpy;
    // Mock marketing consent but not analytics for Meta only
    vi.mocked(hasConsent).mockImplementation((type) => type === 'ad_storage');

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
    // Mock both consents granted
    vi.mocked(hasConsent).mockReturnValue(true);

    trackConversion('email_click');
    expect(gtagSpy).toHaveBeenCalled();
    expect(fbqSpy).toHaveBeenCalled();
  });
});

