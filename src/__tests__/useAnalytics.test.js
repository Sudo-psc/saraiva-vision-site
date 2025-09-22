/**
 * Analytics Hooks Tests
 * Tests for React analytics hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnalytics, useVisibilityTracking, useScrollTracking } from '../hooks/useAnalytics';
import analytics from '../lib/analytics';

// Mock analytics library
vi.mock('../lib/analytics', () => ({
    default: {
        trackPageView: vi.fn(),
        trackFunnelEvent: vi.fn(),
        trackUTMParameters: vi.fn(),
        trackUserInteraction: vi.fn(),
        trackAppointmentMetrics: vi.fn(),
        trackWebVitals: vi.fn(),
        isEnabled: vi.fn(() => true)
    }
}));

// Mock web-vitals
vi.mock('web-vitals', () => ({
    getCLS: vi.fn((callback) => callback({ name: 'CLS', value: 0.1, rating: 'good' })),
    getFID: vi.fn((callback) => callback({ name: 'FID', value: 50, rating: 'good' })),
    getFCP: vi.fn((callback) => callback({ name: 'FCP', value: 1.2, rating: 'good' })),
    getLCP: vi.fn((callback) => callback({ name: 'LCP', value: 2.0, rating: 'good' })),
    getTTFB: vi.fn((callback) => callback({ name: 'TTFB', value: 400, rating: 'good' }))
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock window properties
Object.defineProperty(window, 'location', {
    value: {
        href: 'https://saraivavision.com.br/test',
        pathname: '/test'
    },
    writable: true
});

Object.defineProperty(document, 'title', {
    value: 'Test Page',
    writable: true
});

describe('useAnalytics Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should track page view and funnel event on mount', async () => {
        renderHook(() => useAnalytics());

        expect(analytics.trackPageView).toHaveBeenCalled();
        expect(analytics.trackFunnelEvent).toHaveBeenCalledWith('page_visit');
    });

    it('should track UTM parameters on mount', async () => {
        renderHook(() => useAnalytics({ trackUTM: true }));

        expect(analytics.trackUTMParameters).toHaveBeenCalled();
    });

    it('should track web vitals when enabled', async () => {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

        renderHook(() => useAnalytics({ trackWebVitals: true }));

        // Wait for dynamic import to resolve
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(getCLS).toHaveBeenCalledWith(analytics.trackWebVitals);
        expect(getFID).toHaveBeenCalledWith(analytics.trackWebVitals);
        expect(getFCP).toHaveBeenCalledWith(analytics.trackWebVitals);
        expect(getLCP).toHaveBeenCalledWith(analytics.trackWebVitals);
        expect(getTTFB).toHaveBeenCalledWith(analytics.trackWebVitals);
    });

    it('should provide tracking functions', () => {
        const { result } = renderHook(() => useAnalytics());

        expect(result.current).toHaveProperty('trackEvent');
        expect(result.current).toHaveProperty('trackInteraction');
        expect(result.current).toHaveProperty('trackAppointment');
        expect(result.current).toHaveProperty('trackFormView');
        expect(result.current).toHaveProperty('trackFormSubmit');
        expect(result.current).toHaveProperty('isEnabled');
    });

    it('should track form view events', () => {
        const { result } = renderHook(() => useAnalytics());

        act(() => {
            result.current.trackFormView('contact');
        });

        expect(analytics.trackFunnelEvent).toHaveBeenCalledWith('contact_form_view');
    });

    it('should track form submit events with sanitized data', () => {
        const { result } = renderHook(() => useAnalytics());

        const formData = {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '123456789',
            message: 'Test message',
            consent: true
        };

        act(() => {
            result.current.trackFormSubmit('contact', formData);
        });

        expect(analytics.trackFunnelEvent).toHaveBeenCalledWith('contact_form_submit', {
            form_type: 'contact',
            has_name: true,
            has_email: true,
            has_phone: true,
            message_length: 12,
            consent_given: true
        });
    });

    it('should track appointment events', () => {
        const { result } = renderHook(() => useAnalytics());

        act(() => {
            result.current.trackAppointment('completed', { appointment_id: '123' });
        });

        expect(analytics.trackAppointmentMetrics).toHaveBeenCalledWith('completed', { appointment_id: '123' });
    });

    it('should track user interactions', () => {
        const { result } = renderHook(() => useAnalytics());

        act(() => {
            result.current.trackInteraction('click', 'button', { button_id: 'test' });
        });

        expect(analytics.trackUserInteraction).toHaveBeenCalledWith('click', 'button', { button_id: 'test' });
    });
});

describe('useVisibilityTracking Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIntersectionObserver.mockClear();
    });

    it('should create IntersectionObserver with correct threshold', () => {
        renderHook(() => useVisibilityTracking('test_event', { threshold: 0.7 }));

        expect(mockIntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            { threshold: 0.7 }
        );
    });

    it('should track event when element becomes visible', () => {
        let observerCallback;
        mockIntersectionObserver.mockImplementation((callback) => {
            observerCallback = callback;
            return {
                observe: vi.fn(),
                unobserve: vi.fn(),
                disconnect: vi.fn()
            };
        });

        renderHook(() => useVisibilityTracking('test_event', { threshold: 0.5 }));

        // Simulate element becoming visible
        act(() => {
            observerCallback([{
                isIntersecting: true,
                intersectionRatio: 0.6
            }]);
        });

        expect(analytics.trackFunnelEvent).toHaveBeenCalledWith('test_event', {
            visibility_threshold: 0.5,
            intersection_ratio: 0.6
        });
    });

    it('should only track once when trackOnce is true', () => {
        let observerCallback;
        mockIntersectionObserver.mockImplementation((callback) => {
            observerCallback = callback;
            return {
                observe: vi.fn(),
                unobserve: vi.fn(),
                disconnect: vi.fn()
            };
        });

        renderHook(() => useVisibilityTracking('test_event', { trackOnce: true }));

        // Simulate element becoming visible twice
        act(() => {
            observerCallback([{
                isIntersecting: true,
                intersectionRatio: 0.6
            }]);
            observerCallback([{
                isIntersecting: true,
                intersectionRatio: 0.8
            }]);
        });

        expect(analytics.trackFunnelEvent).toHaveBeenCalledTimes(1);
    });
});

describe('useScrollTracking Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Mock window properties for scroll tracking
        Object.defineProperty(window, 'pageYOffset', {
            value: 0,
            writable: true
        });

        Object.defineProperty(document.documentElement, 'scrollTop', {
            value: 0,
            writable: true
        });

        Object.defineProperty(document.documentElement, 'scrollHeight', {
            value: 1000,
            writable: true
        });

        Object.defineProperty(window, 'innerHeight', {
            value: 800,
            writable: true
        });
    });

    it('should track scroll milestones', () => {
        renderHook(() => useScrollTracking([25, 50, 75, 100]));

        // Simulate scroll to 25%
        window.pageYOffset = 50; // 50 / (1000 - 800) * 100 = 25%

        act(() => {
            window.dispatchEvent(new Event('scroll'));
        });

        expect(analytics.trackUserInteraction).toHaveBeenCalledWith('scroll', 'page', {
            scroll_depth: 25,
            page_url: 'https://saraivavision.com.br/test'
        });
    });

    it('should only track each milestone once', () => {
        renderHook(() => useScrollTracking([25]));

        // Simulate multiple scrolls past 25%
        window.pageYOffset = 50;

        act(() => {
            window.dispatchEvent(new Event('scroll'));
            window.dispatchEvent(new Event('scroll'));
        });

        expect(analytics.trackUserInteraction).toHaveBeenCalledTimes(1);
    });
});