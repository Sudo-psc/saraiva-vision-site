/**
 * Analytics Service com Retry e Fallback
 * Usa fetch-with-retry para enviar eventos de analytics
 */

import { AnalyticsService } from '../../scripts/fetch-with-retry.js';

// Initialize analytics service
const analytics = new AnalyticsService();

// Wrapper para GA4
export async function trackGA4Event(eventName, params = {}) {
  // Tentar via GTM/dataLayer primeiro
  if (window.dataLayer && window.gtag) {
    try {
      window.gtag('event', eventName, params);
      console.log('[Analytics] GA4 event tracked via dataLayer:', eventName);
      return true;
    } catch (error) {
      console.warn('[Analytics] dataLayer failed, using backend:', error);
    }
  }

  // Fallback: enviar via backend com retry
  try {
    await analytics.sendGA({
      event: eventName,
      ...params,
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer
    });

    console.log('[Analytics] GA4 event sent via backend:', eventName);
    return true;

  } catch (error) {
    console.error('[Analytics] Failed to track GA4 event:', error);

    // Adicionar breadcrumb no error tracker
    if (window.errorTracker) {
      window.errorTracker.addBreadcrumb('analytics', 'ga4_failed', {
        event: eventName,
        error: error.message
      });
    }

    return false;
  }
}

// Wrapper para GTM
export async function trackGTMEvent(event, data = {}) {
  // Tentar via dataLayer primeiro
  if (window.dataLayer) {
    try {
      window.dataLayer.push({
        event,
        ...data
      });
      console.log('[Analytics] GTM event tracked via dataLayer:', event);
      return true;
    } catch (error) {
      console.warn('[Analytics] dataLayer push failed, using backend:', error);
    }
  }

  // Fallback: enviar via backend com retry
  try {
    await analytics.sendGTM({
      event,
      ...data,
      timestamp: Date.now(),
      url: window.location.href
    });

    console.log('[Analytics] GTM event sent via backend:', event);
    return true;

  } catch (error) {
    console.error('[Analytics] Failed to track GTM event:', error);

    if (window.errorTracker) {
      window.errorTracker.addBreadcrumb('analytics', 'gtm_failed', {
        event,
        error: error.message
      });
    }

    return false;
  }
}

// Pageview tracking
export async function trackPageview(path = window.location.pathname) {
  const params = {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href
  };

  await trackGA4Event('page_view', params);
  await trackGTMEvent('pageview', params);
}

// Click tracking
export async function trackClick(label, category = 'engagement') {
  await trackGA4Event('click', {
    event_category: category,
    event_label: label,
    page_path: window.location.pathname
  });
}

// Conversion tracking
export async function trackConversion(value, currency = 'BRL') {
  await trackGA4Event('conversion', {
    value,
    currency,
    page_path: window.location.pathname
  });
}

// Form submission
export async function trackFormSubmit(formName) {
  await trackGA4Event('form_submit', {
    form_name: formName,
    page_path: window.location.pathname
  });

  await trackGTMEvent('form_submission', {
    formName,
    url: window.location.href
  });
}

// Export analytics service instance
export { analytics };
export default analytics;
