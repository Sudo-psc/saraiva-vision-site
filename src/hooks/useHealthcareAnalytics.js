/**
 * Healthcare Analytics Hook
 * Custom hook for healthcare-specific event tracking
 * LGPD/CFM Compliant - No PII/PHI tracking
 */

import { useCallback } from 'react';
import { usePostHog } from '../providers/PostHogProvider';

/**
 * useHealthcareAnalytics Hook
 * Provides healthcare-specific tracking methods
 */
export function useHealthcareAnalytics() {
  const { trackEvent, isInitialized, isOptedOut } = usePostHog();

  /**
   * Track page view with healthcare context
   */
  const trackPageView = useCallback((pageName, properties = {}) => {
    if (!isInitialized || isOptedOut) return;

    trackEvent('page_view', {
      page_name: pageName,
      page_type: 'healthcare',
      ...properties
    });
  }, [trackEvent, isInitialized, isOptedOut]);

  /**
   * Track appointment scheduling intent
   */
  const trackAppointmentIntent = useCallback((properties = {}) => {
    trackEvent('appointment_intent', {
      category: 'healthcare',
      action: 'schedule_intent',
      ...properties
    });
  }, [trackEvent]);

  /**
   * Track appointment booking (button click)
   */
  const trackAppointmentBooking = useCallback((source = 'website', properties = {}) => {
    trackEvent('appointment_booking', {
      category: 'conversion',
      action: 'book_appointment',
      source,
      ...properties
    });
  }, [trackEvent]);

  /**
   * Track contact form submission
   */
  const trackContactSubmit = useCallback((formType = 'contact', properties = {}) => {
    trackEvent('contact_form_submitted', {
      category: 'engagement',
      action: 'submit',
      form_type: formType,
      ...properties
    });
  }, [trackEvent]);

  /**
   * Track contact form start (user begins filling)
   */
  const trackContactFormStart = useCallback((formType = 'contact') => {
    trackEvent('contact_form_started', {
      category: 'engagement',
      action: 'form_start',
      form_type: formType
    });
  }, [trackEvent]);

  /**
   * Track blog post view
   */
  const trackBlogView = useCallback((postId, postTitle, category = 'general') => {
    trackEvent('blog_post_viewed', {
      post_id: postId,
      post_title: postTitle,
      post_category: category,
      category: 'content',
      action: 'view'
    });
  }, [trackEvent]);

  /**
   * Track blog post engagement (reading time)
   */
  const trackBlogEngagement = useCallback((postId, timeSpent, scrollDepth = 0) => {
    trackEvent('blog_post_engagement', {
      post_id: postId,
      time_spent_seconds: timeSpent,
      scroll_depth_percentage: scrollDepth,
      category: 'engagement',
      action: 'read'
    });
  }, [trackEvent]);

  /**
   * Track service inquiry
   */
  const trackServiceInquiry = useCallback((serviceName, properties = {}) => {
    trackEvent('service_inquiry', {
      service_name: serviceName,
      category: 'healthcare',
      action: 'inquiry',
      ...properties
    });
  }, [trackEvent]);

  /**
   * Track service page view
   */
  const trackServiceView = useCallback((serviceName, properties = {}) => {
    trackEvent('service_viewed', {
      service_name: serviceName,
      category: 'healthcare',
      action: 'view',
      ...properties
    });
  }, [trackEvent]);

  /**
   * Track doctor profile view
   */
  const trackDoctorProfileView = useCallback((doctorName = 'Dr. Philipe Saraiva Cruz', properties = {}) => {
    trackEvent('doctor_profile_viewed', {
      doctor_name: doctorName,
      category: 'healthcare',
      action: 'profile_view',
      ...properties
    });
  }, [trackEvent]);

  /**
   * Track phone call intent (click on phone number)
   */
  const trackPhoneCall = useCallback((phoneNumber, source = 'website') => {
    trackEvent('phone_call_intent', {
      category: 'conversion',
      action: 'call_intent',
      source,
      phone_number: phoneNumber
    });
  }, [trackEvent]);

  /**
   * Track WhatsApp click
   */
  const trackWhatsAppClick = useCallback((source = 'website', message = 'default') => {
    trackEvent('whatsapp_click', {
      category: 'conversion',
      action: 'whatsapp_intent',
      source,
      message_type: message
    });
  }, [trackEvent]);

  /**
   * Track social media click
   */
  const trackSocialClick = useCallback((platform, action = 'click') => {
    trackEvent('social_media_click', {
      platform,
      category: 'engagement',
      action
    });
  }, [trackEvent]);

  /**
   * Track location/directions click
   */
  const trackLocationClick = useCallback((source = 'map') => {
    trackEvent('location_directions', {
      category: 'engagement',
      action: 'directions',
      source
    });
  }, [trackEvent]);

  /**
   * Track error occurrence
   */
  const trackError = useCallback((errorName, errorMessage, errorContext = {}) => {
    trackEvent('error_occurred', {
      error_name: errorName,
      error_message: errorMessage,
      error_context: errorContext,
      category: 'error',
      action: 'exception'
    });
  }, [trackEvent]);

  /**
   * Track performance metric
   */
  const trackPerformance = useCallback((metricName, metricValue, metricUnit = 'ms') => {
    trackEvent('performance_metric', {
      metric_name: metricName,
      metric_value: metricValue,
      metric_unit: metricUnit,
      category: 'performance',
      action: 'measure'
    });
  }, [trackEvent]);

  /**
   * Track search action
   */
  const trackSearch = useCallback((searchQuery, resultsCount = 0) => {
    trackEvent('search_performed', {
      search_query: searchQuery,
      results_count: resultsCount,
      category: 'engagement',
      action: 'search'
    });
  }, [trackEvent]);

  /**
   * Track newsletter signup
   */
  const trackNewsletterSignup = useCallback((source = 'website') => {
    trackEvent('newsletter_signup', {
      category: 'conversion',
      action: 'subscribe',
      source
    });
  }, [trackEvent]);

  /**
   * Track FAQ interaction
   */
  const trackFAQClick = useCallback((question, category = 'general') => {
    trackEvent('faq_interaction', {
      question,
      faq_category: category,
      category: 'engagement',
      action: 'faq_click'
    });
  }, [trackEvent]);

  /**
   * Track video play
   */
  const trackVideoPlay = useCallback((videoTitle, videoId = null) => {
    trackEvent('video_played', {
      video_title: videoTitle,
      video_id: videoId,
      category: 'engagement',
      action: 'play'
    });
  }, [trackEvent]);

  /**
   * Track file download
   */
  const trackFileDownload = useCallback((fileName, fileType = 'unknown') => {
    trackEvent('file_downloaded', {
      file_name: fileName,
      file_type: fileType,
      category: 'engagement',
      action: 'download'
    });
  }, [trackEvent]);

  /**
   * Track external link click
   */
  const trackExternalLinkClick = useCallback((linkUrl, linkText = '') => {
    trackEvent('external_link_clicked', {
      link_url: linkUrl,
      link_text: linkText,
      category: 'engagement',
      action: 'external_link'
    });
  }, [trackEvent]);

  /**
   * Track user session start
   */
  const trackSessionStart = useCallback(() => {
    trackEvent('session_started', {
      category: 'session',
      action: 'start'
    });
  }, [trackEvent]);

  /**
   * Track user session end
   */
  const trackSessionEnd = useCallback((sessionDuration) => {
    trackEvent('session_ended', {
      session_duration_seconds: sessionDuration,
      category: 'session',
      action: 'end'
    });
  }, [trackEvent]);

  return {
    // Page tracking
    trackPageView,

    // Appointment tracking
    trackAppointmentIntent,
    trackAppointmentBooking,

    // Contact form tracking
    trackContactSubmit,
    trackContactFormStart,

    // Blog tracking
    trackBlogView,
    trackBlogEngagement,

    // Service tracking
    trackServiceInquiry,
    trackServiceView,

    // Doctor profile tracking
    trackDoctorProfileView,

    // Communication tracking
    trackPhoneCall,
    trackWhatsAppClick,
    trackSocialClick,

    // Location tracking
    trackLocationClick,

    // Error tracking
    trackError,

    // Performance tracking
    trackPerformance,

    // Search tracking
    trackSearch,

    // Newsletter tracking
    trackNewsletterSignup,

    // FAQ tracking
    trackFAQClick,

    // Media tracking
    trackVideoPlay,
    trackFileDownload,

    // Navigation tracking
    trackExternalLinkClick,

    // Session tracking
    trackSessionStart,
    trackSessionEnd,

    // State
    isInitialized,
    isOptedOut
  };
}

export default useHealthcareAnalytics;
