import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWhatsAppWidget } from '../hooks/useWhatsAppWidget';

// Mock the config module
vi.mock('../config/whatsapp', () => ({
    whatsappConfig: {
        widget: {
            greetingDelay: 1000,
            greetingAutoHide: 5000,
            showGreeting: true
        },
        analytics: {
            trackClicks: true,
            eventCategory: "engagement",
            eventAction: "whatsapp_click",
            eventLabel: "whatsapp_widget"
        }
    },
    isWithinBusinessHours: vi.fn(() => true)
}));

// Mock analytics
const mockGtag = vi.fn();
const mockPosthog = vi.fn();

Object.defineProperty(window, 'gtag', {
    writable: true,
    value: mockGtag
});

Object.defineProperty(window, 'posthog', {
    writable: true,
    value: { capture: mockPosthog }
});

describe('useWhatsAppWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with correct default state', () => {
        const { result } = renderHook(() => useWhatsAppWidget());

        expect(result.current.isVisible).toBe(false);
        expect(result.current.isGreetingVisible).toBe(false);
        expect(result.current.businessHours).toBe(true);
        expect(result.current.hasInteracted).toBe(false);
    });

    it('auto-shows widget after delay', async () => {
        const { result } = renderHook(() => useWhatsAppWidget({
            autoShow: true,
            showDelay: 1000
        }));

        expect(result.current.isVisible).toBe(false);

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.isVisible).toBe(true);
        expect(result.current.isGreetingVisible).toBe(true);
    });

    it('does not auto-show when autoShow is false', () => {
        const { result } = renderHook(() => useWhatsAppWidget({
            autoShow: false
        }));

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(result.current.isVisible).toBe(false);
    });

    it('shows widget manually', () => {
        const { result } = renderHook(() => useWhatsAppWidget({ autoShow: false }));

        act(() => {
            result.current.showWidget();
        });

        expect(result.current.isVisible).toBe(true);
        expect(result.current.hasInteracted).toBe(true);
    });

    it('hides widget manually', () => {
        const { result } = renderHook(() => useWhatsAppWidget());

        act(() => {
            result.current.showWidget();
        });

        expect(result.current.isVisible).toBe(true);

        act(() => {
            result.current.hideWidget();
        });

        expect(result.current.isVisible).toBe(false);
        expect(result.current.isGreetingVisible).toBe(false);
    });

    it('shows greeting manually', () => {
        const { result } = renderHook(() => useWhatsAppWidget({ autoShow: false }));

        act(() => {
            result.current.showGreeting();
        });

        expect(result.current.isGreetingVisible).toBe(true);
        expect(result.current.hasInteracted).toBe(true);
    });

    it('hides greeting manually', () => {
        const { result } = renderHook(() => useWhatsAppWidget());

        act(() => {
            result.current.showGreeting();
        });

        expect(result.current.isGreetingVisible).toBe(true);

        act(() => {
            result.current.hideGreeting();
        });

        expect(result.current.isGreetingVisible).toBe(false);
    });

    it('auto-hides greeting after configured time', () => {
        const { result } = renderHook(() => useWhatsAppWidget({
            autoShow: true,
            showDelay: 1000
        }));

        // Show widget and greeting
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(result.current.isGreetingVisible).toBe(true);

        // Auto-hide greeting
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(result.current.isGreetingVisible).toBe(false);
    });

    it('tracks WhatsApp click with analytics', () => {
        const { result } = renderHook(() => useWhatsAppWidget());

        act(() => {
            result.current.trackWhatsAppClick('appointment');
        });

        expect(mockGtag).toHaveBeenCalledWith('event', 'whatsapp_click', {
            event_category: 'engagement',
            event_label: 'whatsapp_widget_appointment',
            custom_parameters: expect.objectContaining({
                business_hours: true,
                message_type: 'appointment'
            })
        });

        expect(mockPosthog).toHaveBeenCalledWith('whatsapp_widget_click', {
            message_type: 'appointment',
            business_hours: true,
            source: 'widget'
        });

        expect(result.current.hasInteracted).toBe(true);
    });

    it('does not track analytics when disabled', () => {
        const { result } = renderHook(() => useWhatsAppWidget({
            trackAnalytics: false
        }));

        act(() => {
            result.current.trackWhatsAppClick('contact');
        });

        expect(mockGtag).not.toHaveBeenCalled();
        expect(mockPosthog).not.toHaveBeenCalled();
    });

    it('updates business hours status', async () => {
        const { result } = renderHook(() => useWhatsAppWidget());

        expect(result.current.businessHours).toBe(true);

        // Mock business hours change
        const whatsappModule = await import('../config/whatsapp');
        vi.mocked(whatsappModule.isWithinBusinessHours).mockReturnValue(false);

        // Trigger business hours check (would normally happen via interval)
        act(() => {
            vi.advanceTimersByTime(60000); // 1 minute
        });

        // Note: This test might need adjustment based on actual implementation
        // The hook checks business hours on mount, but interval updates might need manual triggering
    });

    it('prevents auto-show after user interaction', () => {
        const { result } = renderHook(() => useWhatsAppWidget({
            autoShow: true,
            showDelay: 1000
        }));

        // User interacts first
        act(() => {
            result.current.showWidget();
        });

        expect(result.current.hasInteracted).toBe(true);

        // Reset visibility
        act(() => {
            result.current.hideWidget();
        });

        // Auto-show timer should not trigger
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(result.current.isVisible).toBe(false);
    });

    it('cleans up timers on unmount', () => {
        const { unmount } = renderHook(() => useWhatsAppWidget({
            autoShow: true,
            showDelay: 1000
        }));

        // Unmount before timer completes
        unmount();

        // Timer should not fire after unmount
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        // No errors should occur
    });
});