// Consent-aware analytics helpers for GA4 and Meta Pixel
// - Integrates with Google Consent Mode v2
// - No-ops when consent not granted or vendor not loaded

import { hasConsent, onConsentChange } from '@/utils/consentMode';

// Enhanced consent checking with Consent Mode v2
const hasAnalyticsConsent = () => hasConsent('analytics_storage');
const hasMarketingConsent = () => hasConsent('ad_storage');
const hasUserDataConsent = () => hasConsent('ad_user_data');

// Lightweight guards so calls are safe when tags aren’t present
const isGAReady = () => typeof window !== 'undefined' && typeof window.gtag === 'function';
const isMetaReady = () => typeof window !== 'undefined' && typeof window.fbq === 'function';

// Generic GA4 event with Consent Mode v2
export function trackGA(eventName, params = {}) {
  if (!hasAnalyticsConsent()) return false;
  if (!isGAReady()) return false;
  try {
    // Add enhanced conversion data if user data consent is granted
    const enhancedParams = {
      ...params,
      // Add user data for enhanced conversions if consent granted
      ...(hasUserDataConsent() && params.user_data ? { user_data: params.user_data } : {})
    };

    window.gtag('event', eventName, enhancedParams);
    return true;
  } catch (error) {
    console.warn('GA tracking error:', error);
    return false;
  }
}

// Generic Meta Pixel event with Consent Mode v2
export function trackMeta(eventName, params = {}) {
  if (!hasMarketingConsent()) return false;
  if (!isMetaReady()) return false;
  try {
    // Enhanced conversion data
    const enhancedParams = {
      ...params,
      // Add user data for enhanced conversions if consent granted
      ...(hasUserDataConsent() && params.user_data ? params.user_data : {})
    };

    window.fbq('track', eventName, enhancedParams);
    return true;
  } catch (error) {
    console.warn('Meta tracking error:', error);
    return false;
  }
}

// High-level conversions commonly used in this site
// WhatsApp/contact clicks are strong lead signals; map accordingly.
export function trackConversion(type, context = {}) {
  // Normalize context fields
  const params = {
    value: context.value ?? 0,
    currency: context.currency ?? 'BRL',
    ...context
  };

  switch (type) {
    case 'cta_open_modal': {
      // Non-conversion behavioral event
      trackGA('cta_click', { location: 'floating_cta', action: 'open_modal' });
      return;
    }
    case 'schedule_start': {
      // Custom name kept for clarity; can be marked as conversion in GA UI
      trackGA('schedule_start', { method: params.method || 'online' });
      // Optional Ads/Meta signaling
      trackMeta('Schedule');
      return;
    }
    case 'whatsapp_click': {
      const whatsappParams = {
        channel: 'whatsapp',
        phone_number: params.phone_number,
        source: params.source || 'website'
      };

      trackGA('generate_lead', whatsappParams);
      trackMeta('Lead', {
        content_name: 'WhatsApp Contact',
        content_category: 'Contact'
      });
      return;
    }
    case 'phone_click': {
      const phoneParams = {
        channel: 'phone',
        phone_number: params.phone_number,
        source: params.source || 'website'
      };

      trackGA('contact', phoneParams);
      trackMeta('Contact', {
        content_name: 'Phone Contact',
        content_category: 'Contact'
      });
      return;
    }
    case 'email_click': {
      trackGA('contact', {
        channel: 'email',
        source: params.source || 'website'
      });
      trackMeta('Contact', {
        content_name: 'Email Contact',
        content_category: 'Contact'
      });
      return;
    }
    case 'form_submit': {
      trackGA('form_submit', {
        form_name: params.form_name || 'contact_form',
        source: params.source || 'website'
      });
      trackMeta('Contact', {
        content_name: 'Form Submission',
        content_category: 'Form'
      });
      return;
    }
    case 'schedule_modal_open': {
      trackGA('engagement', {
        engagement_time_msec: Date.now(),
        action: 'modal_open',
        modal_name: 'schedule'
      });
      return;
    }
    case 'service_page_view': {
      // Track specific service page views for interest tracking
      trackGA('page_view', {
        page_title: params.service_title || 'Service Page',
        page_location: params.page_url || window.location.href,
        service_id: params.service_id,
        service_category: params.service_category || 'medical_service',
        engagement_time_msec: Date.now()
      });
      trackMeta('ViewContent', {
        content_type: 'service_page',
        content_name: params.service_title || 'Service Page',
        content_category: 'Medical Service',
        content_ids: [params.service_id]
      });
      return;
    }
    case 'service_cta_click': {
      // Track when users click CTA buttons from service pages
      trackGA('select_item', {
        item_list_name: 'service_page',
        items: [{
          item_id: params.service_id,
          item_name: params.service_title,
          item_category: 'medical_service',
          item_variant: params.cta_type || 'schedule'
        }]
      });
      trackMeta('Lead', {
        content_name: `${params.service_title} - ${params.cta_type || 'Schedule'}`,
        content_category: 'Service CTA',
        source: 'service_page'
      });
      return;
    }
    default: {
      // Fallback to GA only
      trackGA(type, params);
    }
  }
}

// Enhanced consent management with Consent Mode v2
export function bindConsentUpdates() {
  if (typeof window === 'undefined') return;

  // Listen for consent changes from our consent manager
  const unsubscribe = onConsentChange((consent) => {
    // Update Google Consent Mode
    if (isGAReady()) {
      window.gtag('consent', 'update', {
        ad_storage: consent.ad_storage || 'denied',
        analytics_storage: consent.analytics_storage || 'denied',
        ad_user_data: consent.ad_user_data || 'denied',
        ad_personalization: consent.ad_personalization || 'denied',
        functionality_storage: consent.functionality_storage || 'granted',
        security_storage: consent.security_storage || 'granted',
        personalization_storage: consent.personalization_storage || 'denied'
      });
    }

    // Update Meta Pixel consent
    if (isMetaReady()) {
      try {
        const marketingGranted = consent.ad_storage === 'granted';
        window.fbq('consent', marketingGranted ? 'grant' : 'revoke');
      } catch (error) {
        console.warn('Meta consent update error:', error);
      }
    }
  });

  return unsubscribe;
}

// Enhanced conversion tracking with hashed user data
export async function trackEnhancedConversion(eventName, userData = {}) {
  if (!hasUserDataConsent()) return false;

  // Hash sensitive data before sending (simple example)
  const hashedData = {};
  if (userData.email) {
    hashedData.sha256_email_address = await hashSHA256(userData.email.toLowerCase().trim());
  }
  if (userData.phone) {
    hashedData.sha256_phone_number = await hashSHA256(userData.phone.replace(/\D/g, ''));
  }

  return trackGA(eventName, {
    user_data: hashedData
  });
}

// Simple SHA-256 hashing utility
async function hashSHA256(text) {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return text;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.warn('Hashing error:', error);
    return text;
  }
}

// UTM parameter persistence
export function persistUTMParameters() {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {};

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
    if (urlParams.has(param)) {
      utmParams[param] = urlParams.get(param);
    }
  });

  if (Object.keys(utmParams).length > 0) {
    try {
      sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
    } catch (error) {
      console.warn('UTM persistence error:', error);
    }
  }
}

// Get stored UTM parameters
export function getStoredUTMParameters() {
  if (typeof window === 'undefined') return {};

  try {
    const stored = sessionStorage.getItem('utm_params');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
}

