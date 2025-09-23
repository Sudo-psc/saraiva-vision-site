/**
 * Analytics Integration Tests
 * Tests for PostHog analytics integration and LGPD compliance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock PostHog - must be defined before import
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

import analytics from '../lib/analytics';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window and document
Object.defineProperty(window, 'location', {
    value: {
        href: 'https://saraivavision.com.br',
        pathname: '/',
        search: '?utm_source=google&utm_medium=cpc&utm_campaign=test'
    },
    writable: true
});

Object.defineProperty(document, 'title', {
    value: 'Test Page',
    writable: true
});

Object.defineProperty(document, 'referrer', {
    value: 'https://google.com',
    writable: true
});

describe('Analytics Library', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize PostHog with correct configuration', () => {
            const apiKey = 'test-api-key';
            analytics.initialize(apiKey, true);

            expect(mockPostHog.init).toHaveBeenCalledWith(apiKey, expect.objectContaining({
                api_host: 'https://app.posthog.com',
                capture_pageview: false,
                disable_session_recording: true,
                respect_dnt: true,
                secure_cookie: true
            }));
        });

        it('should opt out by default when no consent given', () => {
            analytics.initialize('test-key', false);
            expect(mockPostHog.opt_out_capturing).toHaveBeenCalled();
        });

        it('should not initialize without API key', () => {
            analytics.initialize('', true);
            expect(mockPostHog.init).not.toHaveBeenCalled();
        });
    });

    describe('Consent Management', () => {
        beforeEach(() => {
            analytics.initialize('test-key', false);
            vi.clearAllMocks();
        });

        it('should enable analytics when consent is given', () => {
            analytics.enable();
            expect(mockPostHog.opt_in_capturing).toHaveBeenCalled();
        });

        it('should disable analytics when consent is revoked', () => {
            analytics.disable();
            expect(mockPostHog.opt_out_capturing).toHaveBeenCalled();
        });
    });

    describe('Event Tracking', () => {
        beforeEach(() => {
            analytics.initialize('test-key', true);
            mockPostHog.has_opted_in_capturing.mockReturnValue(true);
            vi.clearAllMocks();
        });

        it('should track funnel events with correct format', () => {
            analytics.trackFunnelEvent('contact_form_view', { test: 'data' });

            expect(mockPostHog.capture).toHaveBeenCalledWith(
                'Funnel: Contact Form Viewed',
                expect.objectContaining({
                    test: 'data',
                    timestamp: expect.any(String),
                    page_url: 'https://saraivavision.com.br',
                    page_title: 'Test Page'
                })
            );
        });

        it('should not track events when opted out', () => {
            mockPostHog.has_opted_in_capturing.mockReturnValue(false);
            analytics.trackFunnelEvent('contact_form_view');
            expect(mockPostHog.capture).not.toHaveBeenCalled();
        });

        it('should track UTM parameters correctly', () => {
            analytics.trackUTMParameters();

            expect(mockPostHog.capture).toHaveBeenCalledWith(
                'UTM Parameters Detected',
                expect.objectContaining({
                    utm_source: 'google',
                    utm_medium: 'cpc',
                    utm_campaign: 'test',
                    referrer: 'https://google.com',
                    landing_page: '/'
                })
            );

            expect(mockPostHog.people.set).toHaveBeenCalledWith({
                $utm_source: 'google',
                $utm_medium: 'cpc',
                $utm_campaign: 'test'
            });
        });

        it('should track page views manually', () => {
            analytics.trackPageView('/test-page');

            expect(mockPostHog.capture).toHaveBeenCalledWith(
                '$pageview',
                expect.objectContaining({
                    $current_url: 'https://saraivavision.com.br',
                    $pathname: '/test-page',
                    $title: 'Test Page'
                })
            );
        });

        it('should track user interactions', () => {
            analytics.trackUserInteraction('click', 'button', { button_id: 'test' });

            expect(mockPostHog.capture).toHaveBeenCalledWith(
                'User Interaction',
                expect.objectContaining({
                    action: 'click',
                    element: 'button',
                    button_id: 'test',
                    page_url: 'https://saraivavision.com.br'
                })
            );
        });

        it('should track appointment metrics', () => {
            analytics.trackAppointmentMetrics('completed', { appointment_id: '123' });

            expect(mockPostHog.capture).toHaveBeenCalledWith(
                'Appointment: Booking Completed',
                expect.objectContaining({
                    appointment_id: '123',
                    timestamp: expect.any(String)
                })
            );
        });

        it('should track web vitals', () => {
            const metric = {
                name: 'LCP',
                value: 2.1,
                rating: 'good'
            };

            analytics.trackWebVitals(metric);

            expect(mockPostHog.capture).toHaveBeenCalledWith(
                'Web Vital',
                expect.objectContaining({
                    metric_name: 'LCP',
                    metric_value: 2.1,
                    metric_rating: 'good',
                    page_url: 'https://saraivavision.com.br'
                })
            );
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            analytics.initialize('test-key', true);
            vi.clearAllMocks();
        });

        it('should handle tracking errors gracefully', () => {
            mockPostHog.capture.mockImplementation(() => {
                throw new Error('PostHog error');
            });

            // Should not throw
            expect(() => {
                analytics.trackFunnelEvent('test_event');
            }).not.toThrow();
        });

        it('should warn about unknown funnel events', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            analytics.trackFunnelEvent('unknown_event');

            expect(consoleSpy).toHaveBeenCalledWith('Unknown funnel event: unknown_event');
            expect(mockPostHog.capture).not.toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('LGPD Compliance', () => {
        it('should not track personal data in events', () => {
            analytics.initialize('test-key', true);

            // This should be handled by the calling code, but let's verify
            // that our library doesn't accidentally log PII
            analytics.trackFunnelEvent('contact_form_submit', {
                has_name: true,
                has_email: true,
                message_length: 100,
                consent_given: true
                // No actual name, email, or message content
            });

            const captureCall = mockPostHog.capture.mock.calls[0];
            const eventData = captureCall[1];

            expect(eventData).not.toHaveProperty('name');
            expect(eventData).not.toHaveProperty('email');
            expect(eventData).not.toHaveProperty('message');
            expect(eventData).toHaveProperty('has_name', true);
            expect(eventData).toHaveProperty('has_email', true);
        });

        it('should respect opt-out preferences', () => {
            analytics.initialize('test-key', true);
            analytics.disable();
            mockPostHog.has_opted_in_capturing.mockReturnValue(false);

            analytics.trackFunnelEvent('test_event');
            expect(mockPostHog.capture).not.toHaveBeenCalled();
        });
    });
});