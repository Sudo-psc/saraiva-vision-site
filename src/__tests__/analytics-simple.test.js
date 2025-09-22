/**
 * Simple Analytics Integration Tests
 * Tests for PostHog analytics integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock PostHog before importing analytics
vi.mock('posthog-js', () => ({
    default: {
        init: vi.fn(),
        capture: vi.fn(),
        opt_in_capturing: vi.fn(),
        opt_out_capturing: vi.fn(),
        has_opted_in_capturing: vi.fn(() => true),
        people: {
            set: vi.fn()
        }
    }
}));

describe('Analytics Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock window and document
        Object.defineProperty(window, 'location', {
            value: {
                href: 'https://saraivavision.com.br',
                pathname: '/',
                search: '?utm_source=google&utm_medium=cpc'
            },
            writable: true
        });

        Object.defineProperty(document, 'title', {
            value: 'Test Page',
            writable: true
        });
    });

    it('should import analytics module without errors', async () => {
        const analytics = await import('../lib/analytics');
        expect(analytics.default).toBeDefined();
        expect(typeof analytics.default.initialize).toBe('function');
        expect(typeof analytics.default.trackFunnelEvent).toBe('function');
    });

    it('should have all required tracking functions', async () => {
        const analytics = await import('../lib/analytics');

        expect(analytics.default).toHaveProperty('initialize');
        expect(analytics.default).toHaveProperty('enable');
        expect(analytics.default).toHaveProperty('disable');
        expect(analytics.default).toHaveProperty('trackFunnelEvent');
        expect(analytics.default).toHaveProperty('trackUTMParameters');
        expect(analytics.default).toHaveProperty('trackPageView');
        expect(analytics.default).toHaveProperty('trackUserInteraction');
        expect(analytics.default).toHaveProperty('trackAppointmentMetrics');
        expect(analytics.default).toHaveProperty('trackWebVitals');
    });

    it('should initialize PostHog when called', async () => {
        const posthog = await import('posthog-js');
        const analytics = await import('../lib/analytics');

        analytics.default.initialize('test-key', true);

        expect(posthog.default.init).toHaveBeenCalledWith('test-key', expect.any(Object));
    });

    it('should track funnel events correctly', async () => {
        const posthog = await import('posthog-js');
        const analytics = await import('../lib/analytics');

        analytics.default.initialize('test-key', true);
        analytics.default.trackFunnelEvent('contact_form_view', { test: 'data' });

        expect(posthog.default.capture).toHaveBeenCalledWith(
            'Funnel: Contact Form Viewed',
            expect.objectContaining({
                test: 'data',
                timestamp: expect.any(String)
            })
        );
    });
});