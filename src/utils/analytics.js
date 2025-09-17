// Consent-aware analytics helpers for GA4 and Meta Pixel
// - Integrates with Google Consent Mode v2
// - No-ops when consent not granted or vendor not loaded

import { hasConsent, onConsentChange } from '@/utils/consentMode';

// Enhanced consent checking with Consent Mode v2
const hasAnalyticsConsent = () => hasConsent('analytics_storage');
const hasMarketingConsent = () => hasConsent('ad_storage');
const hasUserDataConsent = () => hasConsent('ad_user_data');

// Lightweight guards so calls are safe when tags aren’t present
const isDataLayerReady = () => typeof window !== 'undefined' && Array.isArray(window.dataLayer);

/**
 * Pushes a structured event to the GTM dataLayer.
 * This is the primary function for sending analytics data.
 * @param {string} eventName - The name of the event (e.g., 'generate_lead').
 * @param {object} params - Additional data associated with the event.
 */
function pushToDataLayer(eventName, params = {}) {
  if (!hasAnalyticsConsent() || !isDataLayerReady()) {
    return false;
  }
  try {
    const utmParams = getStoredUTMParameters();
    window.dataLayer.push({
      event: eventName,
      ...utmParams,
      ...params,
    });
    return true;
  } catch (error) {
    console.warn(`DataLayer push error for event '${eventName}':`, error);
    return false;
  }
}


// High-level conversions commonly used in this site
export function trackConversion(type, context = {}) {
  const params = {
    value: context.value ?? 0,
    currency: context.currency ?? 'BRL',
    ...context
  };

  switch (type) {
    case 'whatsapp_click':
      pushToDataLayer('generate_lead', {
        channel: 'whatsapp',
        source_page_path: window.location.pathname,
        ...params
      });
      break;
    case 'phone_click':
      pushToDataLayer('generate_lead', {
        channel: 'phone',
        source_page_path: window.location.pathname,
        ...params
      });
      break;
    case 'form_submission':
      pushToDataLayer('generate_lead', {
        channel: 'form',
        form_name: params.form_name || 'unknown_form',
        source_page_path: window.location.pathname,
        ...params
      });
      break;
    case 'map_click':
      pushToDataLayer('engagement', {
        action: 'map_click',
        map_destination: params.map_destination || 'unknown',
        source_page_path: window.location.pathname,
        ...params
      });
      break;
    case 'chatwoot_open':
      pushToDataLayer('engagement', {
        action: 'chat_open',
        chat_widget: 'chatwoot',
        source_page_path: window.location.pathname,
        ...params
      });
      break;
    default:
      // Fallback for generic events
      pushToDataLayer(type, params);
      break;
  }
}

/**
 * Initializes global event listeners to automatically track key interactions.
 * This uses event delegation for efficiency.
 */
export function initGlobalTrackers() {
  if (typeof window === 'undefined') return;

  document.body.addEventListener('click', (event) => {
    const target = event.target;

    // Track clicks on links (<a> tags)
    const link = target.closest('a');
    if (link && link.href) {
      const href = link.href;
      if (href.startsWith('tel:')) {
        trackConversion('phone_click', { phone_number: href.replace('tel:', '') });
        return;
      }
      if (href.includes('wa.me') || href.includes('api.whatsapp.com')) {
        trackConversion('whatsapp_click', { link_url: href });
        return;
      }
      if (href.includes('maps.google.com') || href.includes('/maps')) {
        trackConversion('map_click', { map_destination: href });
        return;
      }
    }

    // Track clicks on Chatwoot widget
    if (target.closest('.woot-widget-bubble, .woot-launcher')) {
       trackConversion('chatwoot_open');
    }
  });

  // Track form submissions
  document.body.addEventListener('submit', (event) => {
    const form = event.target.closest('form');
    if (form) {
      const formName = form.getAttribute('name') || form.id || 'unknown_form';
      trackConversion('form_submission', { form_name: formName });
    }
  });
}


// --- EXISTING FUNCTIONS (MODIFIED TO USE PUSHTODATALAYER) ---

// Generic GA4 event (legacy, prefer pushToDataLayer)
export function trackGA(eventName, params = {}) {
  return pushToDataLayer(eventName, params);
}

// Generic Meta Pixel event
export function trackMeta(eventName, params = {}) {
  if (!hasMarketingConsent() || typeof window.fbq !== 'function') return false;
  try {
    window.fbq('track', eventName, params);
    return true;
  } catch (error) {
    console.warn('Meta tracking error:', error);
    return false;
  }
}

export function bindConsentUpdates() {
  if (typeof window === 'undefined') return;
  onConsentChange((consent) => {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        ad_storage: consent.ad_storage || 'denied',
        analytics_storage: consent.analytics_storage || 'denied',
        ad_user_data: consent.ad_user_data || 'denied',
        ad_personalization: consent.ad_personalization || 'denied',
      });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('consent', consent.ad_storage === 'granted' ? 'grant' : 'revoke');
    }
  });
}

export function persistUTMParameters() {
  if (typeof window === 'undefined') return;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
      if (urlParams.has(param)) {
        utmParams[param] = urlParams.get(param);
      }
    });
    if (Object.keys(utmParams).length > 0) {
      sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
    }
  } catch (error) {
    console.warn('UTM persistence error:', error);
  }
}

export function getStoredUTMParameters() {
  if (typeof window === 'undefined') return {};
  try {
    const stored = sessionStorage.getItem('utm_params');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
}