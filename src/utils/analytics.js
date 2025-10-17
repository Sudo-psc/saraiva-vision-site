/**
 * Analytics and tracking utilities for Saraiva Vision
 * Handles Google Analytics, Meta Pixel, and consent management
 */

import { hasConsent, onConsentChange } from './consentMode.js';

let analyticsConfig = {
  gaId: import.meta.env.VITE_GA_ID,
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID
};

export function configureAnalytics(config = {}) {
  analyticsConfig = {
    ...analyticsConfig,
    ...config
  };
}

// Global analytics state
let gtagLoaded = false;
let metaLoaded = false;
let consentBound = false;

// Initialize Google Analytics
export function initGA(gaId) {
  if (gtagLoaded || !gaId) return;

  // Check if gtag is already available
  if (typeof window !== 'undefined' && window.gtag) {
    gtagLoaded = true;
    return;
  }

  // Load GTM script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  script.onload = () => {
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', gaId, {
      page_title: document.title,
      page_location: window.location.href,
    });

    gtagLoaded = true;

    // Bind consent updates after gtag is loaded
    if (!consentBound) {
      bindConsentUpdates();
      consentBound = true;
    }
  };

  document.head.appendChild(script);
}

// Initialize Meta Pixel
export function initMeta(pixelId) {
  if (metaLoaded || !pixelId) return;

  // Check if fbq is already available
  if (typeof window !== 'undefined' && window.fbq) {
    metaLoaded = true;
    return;
  }

  // Load Meta Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  script.onload = () => {
    if (typeof window.fbq !== 'function') {
      window.fbq = function() {
        if (window.fbq.callMethod) {
          window.fbq.callMethod.apply(window.fbq, arguments);
        } else {
          window.fbq.queue.push(arguments);
        }
      };
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];
    }

    window.fbq('init', pixelId);
    metaLoaded = true;
  };

  document.head.appendChild(script);
}

// Track Google Analytics event
export function trackGA(eventName, parameters = {}) {
  if (!hasConsent('analytics_storage')) {
    return false;
  }

  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return false;
  }

  try {
    window.gtag('event', eventName, parameters);
    return true;
  } catch (error) {
    console.error('GA tracking error:', error);
    return false;
  }
}

// Track Meta Pixel event
export function trackMeta(eventName, parameters = {}) {
  if (!hasConsent('ad_storage')) {
    return false;
  }

  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return false;
  }

  try {
    window.fbq('track', eventName, parameters);
    return true;
  } catch (error) {
    console.error('Meta tracking error:', error);
    return false;
  }
}

// Track conversion event
export function trackConversion(eventName, value = null, currency = 'BRL') {
  const params = value ? { value, currency } : {};

  // Track in both GA and Meta if consent allows
  const gaTracked = trackGA('cta_click', { event_category: 'engagement', ...params });
  const metaTracked = trackMeta('Lead', params);

  return { ga: gaTracked, meta: metaTracked };
}

// Track enhanced conversion
export function trackEnhancedConversion(parameters = {}) {
  if (!hasConsent('ad_user_data')) {
    return false;
  }

  // Track in Meta if available
  return trackMeta('Lead', parameters);
}

// Bind consent updates to analytics
export function bindConsentUpdates() {
  if (consentBound) return;

  onConsentChange((consent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: consent.analytics_storage || 'denied',
        ad_storage: consent.ad_storage || 'denied',
        ad_user_data: consent.ad_user_data || 'denied',
        ad_personalization: consent.ad_personalization || 'denied',
      });
    }

    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('consent', consent.ad_storage === 'granted' ? 'grant' : 'revoke');
    }
  });

  consentBound = true;
}

// Initialize analytics on app start
export function initializeAnalytics(configOverrides) {
  if (typeof window === 'undefined') return;

  if (configOverrides) {
    configureAnalytics(configOverrides);
  }

  const gaId = analyticsConfig.gaId;
  const metaId = analyticsConfig.metaPixelId;

  if (gaId) {
    initGA(gaId);
  }

  if (metaId) {
    initMeta(metaId);
  }

  // Bind consent updates
  bindConsentUpdates();
}

// Track page view
export function trackPageView(pagePath = window.location.pathname) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', analyticsConfig.gaId, {
      page_path: pagePath,
    });
  }
}

// Track user interaction
export function trackUserInteraction(interactionType, element, metadata = {}) {
  return trackGA('user_interaction', {
    interaction_type: interactionType,
    element_type: element,
    ...metadata,
  });
}

// Track funnel events
export function trackFunnelEvent(eventName, metadata = {}) {
  return trackGA('funnel_event', {
    event_name: eventName,
    ...metadata,
  });
}

// Track appointment metrics
export function trackAppointmentMetrics(action, metadata = {}) {
  return trackGA('appointment_metric', {
    action,
    ...metadata,
  });
}

// Track web vitals
export function trackWebVitals(metric) {
  return trackGA('web_vitals', {
    metric_name: metric.name,
    metric_value: metric.value,
    metric_rating: metric.rating,
  });
}

// Track UTM parameters
export function trackUTMParameters() {
  if (typeof window === 'undefined') return;

  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {};

  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
    const value = urlParams.get(param);
    if (value) {
      utmParams[param] = value;
    }
  });

  if (Object.keys(utmParams).length > 0) {
    trackGA('utm_parameters', utmParams);
  }
}

// Track contact form interactions
export function trackContactFormInteraction(action, metadata = {}) {
  return trackGA('contact_form', {
    action,
    ...metadata,
  });
}

// Track service interactions
export function trackServiceInteraction(serviceName, action, metadata = {}) {
  return trackGA('service_interaction', {
    service_name: serviceName,
    action,
    ...metadata,
  });
}

// Track blog interactions
export function trackBlogInteraction(action, postSlug = null, metadata = {}) {
  return trackGA('blog_interaction', {
    action,
    post_slug: postSlug,
    ...metadata,
  });
}

// Track search interactions
export function trackSearchInteraction(query, resultsCount = null, metadata = {}) {
  return trackGA('search_interaction', {
    query,
    results_count: resultsCount,
    ...metadata,
  });
}

// Track error events
export function trackError(errorType, errorMessage, metadata = {}) {
  return trackGA('exception', {
    description: `${errorType}: ${errorMessage}`,
    fatal: false,
    ...metadata,
  });
}

// Track performance metrics
export function trackPerformanceMetric(metricName, value, metadata = {}) {
  return trackGA('performance_metric', {
    metric_name: metricName,
    metric_value: value,
    ...metadata,
  });
}

// Track custom events
export function trackCustomEvent(eventName, parameters = {}) {
  return trackGA('custom_event', {
    event_name: eventName,
    ...parameters,
  });
}

// Get analytics status
export function getAnalyticsStatus() {
  return {
    gtagLoaded,
    metaLoaded,
    consentBound,
    hasGAConsent: hasConsent('analytics_storage'),
    hasAdConsent: hasConsent('ad_storage'),
  };
}

// Reset analytics (for testing)
export function resetAnalytics() {
  gtagLoaded = false;
  metaLoaded = false;
  consentBound = false;

  if (typeof window !== 'undefined') {
    delete window.gtag;
    delete window.fbq;
    delete window.dataLayer;
  }
}