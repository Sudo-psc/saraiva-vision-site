/**
 * Analytics library for Saraiva Vision
 * Provides a simple interface for tracking events
 */

// Simple no-op analytics for when real tracking is not available
const analytics = {
  trackPageView: (page) => {
    console.log('Analytics: Page view tracked', page);
  },

  trackEvent: (category, action, label, value) => {
    console.log('Analytics: Event tracked', { category, action, label, value });
  },

  trackFunnelEvent: (eventName, metadata = {}) => {
    console.log('Analytics: Funnel event tracked', { eventName, metadata });
  },

  trackUTMParameters: () => {
    console.log('Analytics: UTM parameters tracked');
  },

  trackWebVitals: (metric) => {
    console.log('Analytics: Web vitals tracked', metric);
  },

  trackContactFormView: () => {
    console.log('Analytics: Contact form view tracked');
  },

  trackContactFormSubmit: (metadata = {}) => {
    console.log('Analytics: Contact form submit tracked', metadata);
  },

  trackAppointmentMetrics: (action, metadata = {}) => {
    console.log('Analytics: Appointment metrics tracked', { action, metadata });
  },

  trackUserInteraction: (interactionType, element, metadata = {}) => {
    console.log('Analytics: User interaction tracked', { interactionType, element, metadata });
  },

  trackConversion: (eventName, value = null, currency = 'BRL') => {
    console.log('Analytics: Conversion tracked', { eventName, value, currency });
  },

  trackError: (errorType, errorMessage, metadata = {}) => {
    console.log('Analytics: Error tracked', { errorType, errorMessage, metadata });
  },

  trackPerformanceMetric: (metricName, value, metadata = {}) => {
    console.log('Analytics: Performance metric tracked', { metricName, value, metadata });
  },

  trackCustomEvent: (eventName, parameters = {}) => {
    console.log('Analytics: Custom event tracked', { eventName, parameters });
  },

  trackContactFormInteraction: (action, metadata = {}) => {
    console.log('Analytics: Contact form interaction tracked', { action, metadata });
  },

  trackServiceInteraction: (serviceName, action, metadata = {}) => {
    console.log('Analytics: Service interaction tracked', { serviceName, action, metadata });
  },

  trackBlogInteraction: (action, postSlug = null, metadata = {}) => {
    console.log('Analytics: Blog interaction tracked', { action, postSlug, metadata });
  },

  trackSearchInteraction: (query, resultsCount = null, metadata = {}) => {
    console.log('Analytics: Search interaction tracked', { query, resultsCount, metadata });
  },
};

export default analytics;