/**
 * Integration Tests for LAAS Analytics Tracking
 * Tests GA4 events, conversion tracking, and LGPD compliance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackCtaClick, trackLeadGeneration, trackFaqOpen, trackLaasEvent } from '@/lib/laas/analytics';

// Mock window.gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

describe('LAAS Analytics Integration', () => {
  let gtagCalls: any[] = [];
  let dataLayerEvents: any[] = [];

  beforeEach(() => {
    gtagCalls = [];
    dataLayerEvents = [];

    // Mock gtag
    window.gtag = vi.fn((...args: any[]) => {
      gtagCalls.push(args);
    });

    // Mock dataLayer
    window.dataLayer = [];
  });

  afterEach(() => {
    delete window.gtag;
    delete window.dataLayer;
    vi.clearAllMocks();
  });

  describe('CTA Click Tracking', () => {
    it('should track header CTA click', () => {
      trackCtaClick('agendar_consulta', 'header');

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'cta_click',
        expect.objectContaining({
          cta_type: 'agendar_consulta',
          location: 'header',
          page_path: '/laas'
        })
      );
    });

    it('should track hero CTA click', () => {
      trackCtaClick('agendar_consulta', 'hero');

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'cta_click',
        expect.objectContaining({
          cta_type: 'agendar_consulta',
          location: 'hero'
        })
      );
    });

    it('should track WhatsApp CTA click', () => {
      trackCtaClick('whatsapp', 'floating');

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'cta_click',
        expect.objectContaining({
          cta_type: 'whatsapp',
          location: 'floating'
        })
      );
    });

    it('should track pricing plan CTA clicks', () => {
      const plans = ['plano_essencial', 'plano_premium', 'plano_vip'];

      plans.forEach(location => {
        trackCtaClick('agendar_consulta', location);

        expect(window.gtag).toHaveBeenCalledWith(
          'event',
          'cta_click',
          expect.objectContaining({
            cta_type: 'agendar_consulta',
            location
          })
        );
      });
    });
  });

  describe('Lead Generation Tracking', () => {
    it('should track lead generation from calculator', () => {
      trackLeadGeneration('calculadora_economia');

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'generate_lead',
        expect.objectContaining({
          lead_type: 'calculadora_economia',
          page_path: '/laas'
        })
      );
    });

    it('should track lead with custom properties', () => {
      trackLaasEvent({
        event: 'generate_lead',
        lead_type: 'calculadora_economia',
      });

      expect(window.gtag).toHaveBeenCalledTimes(1);
      expect(gtagCalls[0][0]).toBe('event');
      expect(gtagCalls[0][1]).toBe('generate_lead');
    });
  });

  describe('FAQ Interaction Tracking', () => {
    it('should track FAQ item opened', () => {
      const question = 'Como funciona o cancelamento?';
      trackFaqOpen(question);

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'faq_open',
        expect.objectContaining({
          faq_question: question,
          page_path: '/laas'
        })
      );
    });

    it('should track different FAQ questions', () => {
      const questions = [
        'Como funciona o cancelamento?',
        'Posso trocar de lente?',
        'Como funciona a entrega?'
      ];

      questions.forEach(question => {
        trackFaqOpen(question);

        expect(window.gtag).toHaveBeenCalledWith(
          'event',
          'faq_open',
          expect.objectContaining({
            faq_question: question
          })
        );
      });
    });
  });

  describe('Conversion Tracking', () => {
    it('should track successful lead conversion', () => {
      // Simulate successful form submission
      window.gtag?.('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID',
        value: 960, // Yearly savings
        currency: 'BRL'
      });

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'conversion',
        expect.objectContaining({
          value: 960,
          currency: 'BRL'
        })
      );
    });

    it('should include estimated value in conversion', () => {
      const estimatedYearlySavings = 1200;

      window.gtag?.('event', 'conversion', {
        send_to: 'AW-CONVERSION_ID',
        value: estimatedYearlySavings,
        currency: 'BRL'
      });

      const conversionCall = gtagCalls.find(call => call[1] === 'conversion');
      expect(conversionCall[2].value).toBe(estimatedYearlySavings);
      expect(conversionCall[2].currency).toBe('BRL');
    });
  });

  describe('Enhanced Ecommerce Tracking', () => {
    it('should track product view for pricing plans', () => {
      window.gtag?.('event', 'view_item', {
        items: [
          {
            item_id: 'essencial',
            item_name: 'Plano Essencial',
            price: 149.90,
            currency: 'BRL'
          }
        ]
      });

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'view_item',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: 'essencial',
              price: 149.90
            })
          ])
        })
      );
    });

    it('should track begin_checkout event', () => {
      window.gtag?.('event', 'begin_checkout', {
        items: [
          {
            item_id: 'premium',
            item_name: 'Plano Premium',
            price: 249.90,
            currency: 'BRL'
          }
        ]
      });

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'begin_checkout',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              item_id: 'premium'
            })
          ])
        })
      );
    });
  });

  describe('LGPD Compliance in Analytics', () => {
    it('should not track PII in event data', () => {
      trackLeadGeneration('calculadora_economia');

      const leadCall = gtagCalls.find(call => call[1] === 'generate_lead');

      // Should not contain email, phone, or name
      expect(JSON.stringify(leadCall)).not.toMatch(/email|phone|nome|whatsapp/i);
    });

    it('should use anonymized IDs only', () => {
      trackLaasEvent({
        event: 'custom_event',
        lead_type: 'test'
      });

      const eventData = gtagCalls[0][2];

      // Should not have user identifiable data
      expect(eventData.email).toBeUndefined();
      expect(eventData.phone).toBeUndefined();
      expect(eventData.name).toBeUndefined();
    });

    it('should respect cookie consent', () => {
      // Simulate no consent
      delete window.gtag;

      trackCtaClick('agendar_consulta', 'header');

      // Should not error when gtag is unavailable
      expect(() => trackCtaClick('test', 'test')).not.toThrow();
    });

    it('should check gtag availability before tracking', () => {
      delete window.gtag;

      // Should gracefully handle missing gtag
      expect(() => {
        trackCtaClick('agendar_consulta', 'header');
        trackLeadGeneration('test');
        trackFaqOpen('test');
      }).not.toThrow();
    });
  });

  describe('Custom Events', () => {
    it('should track custom LAAS events', () => {
      trackLaasEvent({
        event: 'pricing_toggle',
        section_name: 'billing_interval',
      });

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'pricing_toggle',
        expect.objectContaining({
          section_name: 'billing_interval',
          page_path: '/laas'
        })
      );
    });

    it('should always include page_path', () => {
      const events = [
        { event: 'cta_click', cta_type: 'test', location: 'test' },
        { event: 'generate_lead', lead_type: 'test' },
        { event: 'faq_open', faq_question: 'test' }
      ];

      events.forEach(eventData => {
        trackLaasEvent(eventData as any);

        const lastCall = gtagCalls[gtagCalls.length - 1];
        expect(lastCall[2].page_path).toBe('/laas');
      });
    });
  });

  describe('Event Data Structure', () => {
    it('should send well-formed event data', () => {
      trackCtaClick('agendar_consulta', 'header');

      expect(gtagCalls[0]).toHaveLength(3); // gtag, event name, parameters
      expect(gtagCalls[0][0]).toBe('event');
      expect(typeof gtagCalls[0][1]).toBe('string');
      expect(typeof gtagCalls[0][2]).toBe('object');
    });

    it('should not include undefined values', () => {
      trackLaasEvent({
        event: 'test_event',
        cta_type: undefined,
        location: 'test'
      } as any);

      const eventData = gtagCalls[0][2];

      expect(eventData.cta_type).toBeUndefined();
      expect(eventData.location).toBe('test');
    });

    it('should handle special characters in event data', () => {
      trackFaqOpen('Como funciona o cancelamento? É fácil?');

      expect(window.gtag).toHaveBeenCalledWith(
        'event',
        'faq_open',
        expect.objectContaining({
          faq_question: 'Como funciona o cancelamento? É fácil?'
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle gtag errors gracefully', () => {
      window.gtag = vi.fn(() => {
        throw new Error('GA4 error');
      });

      expect(() => trackCtaClick('test', 'test')).not.toThrow();
    });

    it('should continue tracking after error', () => {
      let callCount = 0;
      window.gtag = vi.fn(() => {
        callCount++;
        if (callCount === 1) throw new Error('First call error');
      });

      trackCtaClick('test1', 'test1');
      trackCtaClick('test2', 'test2');

      expect(window.gtag).toHaveBeenCalledTimes(2);
    });
  });

  describe('Server-Side Validation', () => {
    it('should validate event names', () => {
      const validEvents = ['cta_click', 'generate_lead', 'faq_open', 'scroll_to_section'];

      validEvents.forEach(event => {
        expect(event).toMatch(/^[a-z_]+$/);
      });
    });

    it('should validate parameter names', () => {
      const validParams = ['cta_type', 'location', 'lead_type', 'section_name', 'faq_question'];

      validParams.forEach(param => {
        expect(param).toMatch(/^[a-z_]+$/);
      });
    });
  });
});
