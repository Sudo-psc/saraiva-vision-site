/**
 * LAAS Analytics Helper
 * Google Analytics 4 event tracking
 */

import type { LaasGA4Event } from '@/types/laas';

export const trackLaasEvent = (event: LaasGA4Event) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.event, {
      ...event,
      page_path: '/laas',
    });
  }
};

export const trackCtaClick = (ctaType: string, location: string) => {
  trackLaasEvent({
    event: 'cta_click',
    cta_type: ctaType,
    location,
  });
};

export const trackLeadGeneration = (leadType: string) => {
  trackLaasEvent({
    event: 'generate_lead',
    lead_type: leadType,
  });
};

export const trackSectionScroll = (sectionName: string) => {
  trackLaasEvent({
    event: 'scroll_to_section',
    section_name: sectionName,
  });
};

export const trackFaqOpen = (question: string) => {
  trackLaasEvent({
    event: 'faq_open',
    faq_question: question,
  });
};
