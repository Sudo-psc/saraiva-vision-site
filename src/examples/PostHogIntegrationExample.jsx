/**
 * PostHog Integration Example
 * Demonstrates how to use PostHog analytics in Saraiva Vision components
 */

import { useEffect } from 'react';
import { usePostHog } from '../providers/PostHogProvider';
import useHealthcareAnalytics from '../hooks/useHealthcareAnalytics';

/**
 * Example 1: Basic Event Tracking in Component
 */
export function AppointmentBookingButton() {
  const { trackAppointmentBooking } = useHealthcareAnalytics();

  const handleBooking = () => {
    // Track appointment booking
    trackAppointmentBooking('hero_button', {
      appointment_type: 'consultation',
      specialty: 'ophthalmology'
    });

    // Redirect to scheduling
    window.location.href = 'https://saraivavision.com.br/agendamento';
  };

  return (
    <button onClick={handleBooking}>
      Agendar Consulta
    </button>
  );
}

/**
 * Example 2: Page View Tracking with useEffect
 */
export function BlogPostPage({ postId, postTitle }) {
  const { trackBlogView, trackBlogEngagement } = useHealthcareAnalytics();

  useEffect(() => {
    // Track page view when component mounts
    trackBlogView(postId, postTitle, 'healthcare');

    // Track reading time
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackBlogEngagement(postId, timeSpent);
    };
  }, [postId, postTitle, trackBlogView, trackBlogEngagement]);

  return (
    <article>
      <h1>{postTitle}</h1>
      {/* Blog content */}
    </article>
  );
}

/**
 * Example 3: Contact Form with Form Start and Submit Tracking
 */
export function ContactForm() {
  const { trackContactFormStart, trackContactSubmit, trackError } = useHealthcareAnalytics();

  const handleFormFocus = () => {
    trackContactFormStart('contact');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Submit form logic
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ /* form data */ })
      });

      if (response.ok) {
        trackContactSubmit('contact', {
          success: true,
          response_time_ms: 500
        });
      }
    } catch (error) {
      trackError('contact_form_error', error.message, {
        form_type: 'contact'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome"
        onFocus={handleFormFocus}
      />
      <button type="submit">Enviar</button>
    </form>
  );
}

/**
 * Example 4: Feature Flag Usage
 */
export function ExperimentalFeature() {
  const { isFeatureEnabled } = usePostHog();

  const showNewFeature = isFeatureEnabled('new_appointment_flow', false);

  if (!showNewFeature) {
    return <div>Original Feature</div>;
  }

  return <div>New Experimental Feature</div>;
}

/**
 * Example 5: User Identification (LGPD Compliant)
 */
export function UserIdentification() {
  const { identifyUser } = usePostHog();

  useEffect(() => {
    // Only identify with anonymized/hashed user ID
    const userId = 'user_hash_123'; // Never use CPF, email, or PII

    identifyUser(userId, {
      user_type: 'patient',
      signup_date: '2025-01-15',
      // DO NOT include: name, email, CPF, health data
    });
  }, [identifyUser]);

  return null;
}

/**
 * Example 6: WhatsApp Click Tracking
 */
export function WhatsAppButton() {
  const { trackWhatsAppClick } = useHealthcareAnalytics();

  const handleWhatsAppClick = () => {
    trackWhatsAppClick('footer', 'appointment_inquiry');
    window.open('https://wa.me/5581999999999', '_blank');
  };

  return (
    <button onClick={handleWhatsAppClick}>
      Falar no WhatsApp
    </button>
  );
}

/**
 * Example 7: Service View Tracking
 */
export function ServicePage({ serviceName }) {
  const { trackServiceView } = useHealthcareAnalytics();

  useEffect(() => {
    trackServiceView(serviceName, {
      service_category: 'ophthalmology',
      page_section: 'main'
    });
  }, [serviceName, trackServiceView]);

  return (
    <div>
      <h1>{serviceName}</h1>
      {/* Service content */}
    </div>
  );
}

/**
 * Example 8: Phone Call Tracking
 */
export function PhoneButton({ phoneNumber }) {
  const { trackPhoneCall } = useHealthcareAnalytics();

  const handlePhoneClick = () => {
    trackPhoneCall(phoneNumber, 'header');
  };

  return (
    <a href={`tel:${phoneNumber}`} onClick={handlePhoneClick}>
      {phoneNumber}
    </a>
  );
}

/**
 * Example 9: Error Boundary with Tracking
 */
export function ComponentWithErrorTracking() {
  const { trackError } = useHealthcareAnalytics();

  useEffect(() => {
    const handleError = (error) => {
      trackError('component_error', error.message, {
        component: 'ComponentWithErrorTracking',
        stack: error.stack
      });
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [trackError]);

  return <div>Component with error tracking</div>;
}

/**
 * Example 10: Performance Monitoring
 */
export function ComponentWithPerformanceTracking() {
  const { trackPerformance } = useHealthcareAnalytics();

  useEffect(() => {
    const startTime = performance.now();

    // Simulate component work
    return () => {
      const loadTime = performance.now() - startTime;
      trackPerformance('component_load_time', Math.round(loadTime), 'ms');
    };
  }, [trackPerformance]);

  return <div>Component with performance tracking</div>;
}

/**
 * Example 11: LGPD Opt-Out Button
 */
export function AnalyticsOptOutButton() {
  const { optOutTracking, optInTracking, isOptedOut } = usePostHog();

  const handleToggle = () => {
    if (isOptedOut) {
      optInTracking();
    } else {
      optOutTracking();
    }
  };

  return (
    <button onClick={handleToggle}>
      {isOptedOut ? 'Ativar Analytics' : 'Desativar Analytics'}
    </button>
  );
}

/**
 * Example 12: Session Tracking
 */
export function SessionTracker() {
  const { trackSessionStart, trackSessionEnd } = useHealthcareAnalytics();

  useEffect(() => {
    const sessionStart = Date.now();
    trackSessionStart();

    return () => {
      const sessionDuration = Math.floor((Date.now() - sessionStart) / 1000);
      trackSessionEnd(sessionDuration);
    };
  }, [trackSessionStart, trackSessionEnd]);

  return null;
}

// Export all examples
export default {
  AppointmentBookingButton,
  BlogPostPage,
  ContactForm,
  ExperimentalFeature,
  UserIdentification,
  WhatsAppButton,
  ServicePage,
  PhoneButton,
  ComponentWithErrorTracking,
  ComponentWithPerformanceTracking,
  AnalyticsOptOutButton,
  SessionTracker
};
