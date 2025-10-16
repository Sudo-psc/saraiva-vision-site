import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import analyticsInstance, * as analyticsService from '@/services/analytics-service.js';

const { trackGA4Event, trackGTMEvent, trackPageview } = analyticsService;

describe('analytics service contract', () => {
  const originalDataLayer = window.dataLayer;
  const originalGtag = window.gtag;
  const originalErrorTracker = window.errorTracker;
  const originalDocumentReferrer = Object.getOwnPropertyDescriptor(document, 'referrer');
  let sendGAMock;
  let sendGTMMock;

  beforeEach(() => {
    window.dataLayer = [];
    window.gtag = vi.fn();
    window.errorTracker = { addBreadcrumb: vi.fn() };
    sendGAMock = vi.fn().mockResolvedValue(undefined);
    sendGTMMock = vi.fn().mockResolvedValue(undefined);
    analyticsInstance.sendGA = sendGAMock;
    analyticsInstance.sendGTM = sendGTMMock;
  });

  afterEach(() => {
    window.dataLayer = originalDataLayer;
    window.gtag = originalGtag;
    window.errorTracker = originalErrorTracker;
    if (originalDocumentReferrer) {
      Object.defineProperty(document, 'referrer', originalDocumentReferrer);
    }
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it('forwards GA events to gtag when available', async () => {
    const result = await trackGA4Event('cta_click', { label: 'hero' });

    expect(window.gtag).toHaveBeenCalledWith('event', 'cta_click', { label: 'hero' });
    expect(sendGAMock).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('falls back to backend when gtag is unavailable', async () => {
    const now = 1700000000000;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    window.dataLayer = undefined;
    window.gtag = undefined;
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'https://google.com'
    });

    const result = await trackGA4Event('cta_click', { label: 'hero' });

    expect(sendGAMock).toHaveBeenCalledWith({
      event: 'cta_click',
      label: 'hero',
      timestamp: now,
      url: window.location.href,
      referrer: 'https://google.com'
    });
    expect(result).toBe(true);
  });

  it('pushes GTM events and falls back to backend payload', async () => {
    const dataLayerPush = vi.fn();
    window.dataLayer = { push: dataLayerPush };

    const result = await trackGTMEvent('pageview', { path: '/home' });

    expect(dataLayerPush).toHaveBeenCalledWith({ event: 'pageview', path: '/home' });
    expect(sendGTMMock).not.toHaveBeenCalled();
    expect(result).toBe(true);

    window.dataLayer = undefined;
    await trackGTMEvent('pageview', { path: '/home' });
    expect(sendGTMMock).toHaveBeenCalledWith({
      event: 'pageview',
      path: '/home',
      timestamp: expect.any(Number),
      url: window.location.href
    });
  });

  it('tracks pageview using GA4 and GTM contracts', async () => {
    const dataLayerPush = vi.fn();
    window.dataLayer = { push: dataLayerPush };
    window.gtag = vi.fn();

    await trackPageview('/planos');

    expect(window.gtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/planos',
      page_title: document.title,
      page_location: window.location.href
    });
    expect(dataLayerPush).toHaveBeenCalledWith({
      event: 'pageview',
      page_path: '/planos',
      page_title: document.title,
      page_location: window.location.href
    });
  });
});
