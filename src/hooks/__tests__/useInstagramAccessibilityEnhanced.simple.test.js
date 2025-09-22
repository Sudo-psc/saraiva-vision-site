import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the base accessibility preferences hook
vi.mock('../useAccessibilityPreferences', () => ({
    default: () => ({
        preferences: {
            highContrast: false,
            reducedMotion: false,
            darkMode: false,
            forceFocus: false,
            largeText: false
        },
        systemPreferences: {
            highContrast: false,
            reducedMotion: false,
            darkMode: false
        },
        getAccessibilityClasses: () => '',
        getAccessibilityStyles: () => ({}),
        getAnimationConfig: () => ({
            duration: 0.3,
            ease: 'easeOut',
            stagger: 0.1
        }),
        shouldReduceMotion: () => false,
        isHighContrast: false,
        getAccessibleColors: () => null,
        getFocusStyles: () => ({})
    })
}));

describe('useInstagramAccessibilityEnhanced', () => {
    beforeEach(() => {
        // Mock matchMedia
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(query => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }))
        });
    });

    it('should be importable', async () => {
        const useInstagramAccessibilityEnhanced = await import('../useInstagramAccessibilityEnhanced');
        expect(useInstagramAccessibilityEnhanced.default).toBeDefined();
        expect(typeof useInstagramAccessibilityEnhanced.default).toBe('function');
    });

    it('should have the expected API', async () => {
        const { renderHook } = await import('@testing-library/react');
        const useInstagramAccessibilityEnhanced = (await import('../useInstagramAccessibilityEnhanced')).default;

        const { result } = renderHook(() =>
            useInstagramAccessibilityEnhanced({
                enableHighContrast: true,
                enableReducedMotion: true,
                enableSystemDetection: true
            })
        );

        // Check that all expected properties exist
        expect(result.current).toHaveProperty('instagramHighContrast');
        expect(result.current).toHaveProperty('instagramReducedMotion');
        expect(result.current).toHaveProperty('getInstagramHighContrastColors');
        expect(result.current).toHaveProperty('getInstagramAnimationConfig');
        expect(result.current).toHaveProperty('getInstagramAccessibilityClasses');
        expect(result.current).toHaveProperty('getInstagramAccessibilityStyles');
        expect(result.current).toHaveProperty('shouldDisableInstagramFeature');
        expect(result.current).toHaveProperty('validateInstagramContrast');
    });

    it('should return correct default values', async () => {
        const { renderHook } = await import('@testing-library/react');
        const useInstagramAccessibilityEnhanced = (await import('../useInstagramAccessibilityEnhanced')).default;

        const { result } = renderHook(() =>
            useInstagramAccessibilityEnhanced({
                enableHighContrast: true,
                enableReducedMotion: true,
                enableSystemDetection: true
            })
        );

        expect(result.current.instagramHighContrast).toBe(false);
        expect(result.current.instagramReducedMotion).toBe(false);
        expect(result.current.systemHighContrast).toBe(false);
        expect(result.current.systemReducedMotion).toBe(false);
        expect(result.current.hasAccessibilityPreferences).toBe(false);
    });
});