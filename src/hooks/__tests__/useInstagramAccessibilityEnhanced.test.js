import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import useInstagramAccessibilityEnhanced from '../useInstagramAccessibilityEnhanced';

// Mock the base accessibility preferences hook
vi.mock('../useAccessibilityPreferences', () => ({
    default: vi.fn()
}));

describe('useInstagramAccessibilityEnhanced', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Get the mocked function and setup default mock return
        const useAccessibilityPreferences = require('../useAccessibilityPreferences').default;
        useAccessibilityPreferences.mockReturnValue({
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
        });

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

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('High Contrast Mode', () => {
        it('should return false for high contrast when disabled', () => {
            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: false,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            expect(result.current.instagramHighContrast).toBe(false);
            expect(result.current.isSystemHighContrast).toBe(false);
        });

        it('should detect system high contrast preferences', () => {
            // Mock high contrast detection
            window.matchMedia = vi.fn().mockImplementation(query => ({
                matches: query === '(prefers-contrast: high)',
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));

            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            expect(result.current.systemHighContrast).toBe(true);
            expect(result.current.instagramHighContrast).toBe(true);
        });

        it('should return high contrast colors when enabled', () => {
            const useAccessibilityPreferences = require('../useAccessibilityPreferences').default;
            useAccessibilityPreferences.mockReturnValue({
                preferences: {
                    highContrast: true,
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
                isHighContrast: true,
                getAccessibleColors: () => null,
                getFocusStyles: () => ({})
            });

            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            const colors = result.current.getInstagramHighContrastColors();
            expect(colors).toBeTruthy();
            expect(colors.containerBg).toBe('#ffffff');
            expect(colors.containerText).toBe('#000000');
            expect(colors.focusColor).toBe('#ff0000');
        });

        it('should return dark mode high contrast colors', () => {
            mockUseAccessibilityPreferences.mockReturnValue({
                ...mockUseAccessibilityPreferences(),
                preferences: {
                    ...mockUseAccessibilityPreferences().preferences,
                    highContrast: true,
                    darkMode: true
                }
            });

            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            const colors = result.current.getInstagramHighContrastColors();
            expect(colors).toBeTruthy();
            expect(colors.containerBg).toBe('#000000');
            expect(colors.containerText).toBe('#ffffff');
            expect(colors.focusColor).toBe('#ffff00');
        });
    });

    describe('Reduced Motion Mode', () => {
        it('should return false for reduced motion when disabled', () => {
            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: false,
                    enableSystemDetection: true
                })
            );

            expect(result.current.instagramReducedMotion).toBe(false);
            expect(result.current.isSystemReducedMotion).toBe(false);
        });

        it('should detect system reduced motion preferences', () => {
            // Mock reduced motion detection
            window.matchMedia = vi.fn().mockImplementation(query => ({
                matches: query === '(prefers-reduced-motion: reduce)',
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            }));

            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            expect(result.current.systemReducedMotion).toBe(true);
            expect(result.current.instagramReducedMotion).toBe(true);
        });

        it('should return disabled animation config when reduced motion is enabled', () => {
            mockUseAccessibilityPreferences.mockReturnValue({
                ...mockUseAccessibilityPreferences(),
                preferences: {
                    ...mockUseAccessibilityPreferences().preferences,
                    reducedMotion: true
                }
            });

            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            const config = result.current.getInstagramAnimationConfig();
            expect(config.duration).toBe(0.01);
            expect(config.imageTransitions).toBe(false);
            expect(config.hoverEffects).toBe(false);
            expect(config.tooltipAnimations).toBe(false);
        });

        it('should disable specific Instagram features when reduced motion is enabled', () => {
            mockUseAccessibilityPreferences.mockReturnValue({
                ...mockUseAccessibilityPreferences(),
                preferences: {
                    ...mockUseAccessibilityPreferences().preferences,
                    reducedMotion: true
                }
            });

            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            expect(result.current.shouldDisableInstagramFeature('imageHover')).toBe(true);
            expect(result.current.shouldDisableInstagramFeature('scaleAnimations')).toBe(true);
            expect(result.current.shouldDisableInstagramFeature('hoverEffects')).toBe(true);
            expect(result.current.shouldDisableInstagramFeature('tooltipAnimations')).toBe(true);
        });
    });

    describe('CSS Classes and Styles', () => {
        it('should return appropriate CSS classes', () => {
            mockUseAccessibilityPreferences.mockReturnValue({
                ...mockUseAccessibilityPreferences(),
                preferences: {
                    ...mockUseAccessibilityPreferences().preferences,
                    highContrast: true,
                    reducedMotion: true,
                    forceFocus: true
                }
            });

            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            const classes = result.current.getInstagramAccessibilityClasses();
            expect(classes).toContain('high-contrast');
            expect(classes).toContain('instagram-high-contrast');
            expect(classes).toContain('reduced-motion');
            expect(classes).toContain('instagram-reduced-motion');
            expect(classes).toContain('force-focus');
        });

        it('should return appropriate CSS styles', () => {
            mockUseAccessibilityPreferences.mockReturnValue({
                ...mockUseAccessibilityPreferences(),
                preferences: {
                    ...mockUseAccessibilityPreferences().preferences,
                    highContrast: true,
                    reducedMotion: true,
                    largeText: true
                }
            });

            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            const styles = result.current.getInstagramAccessibilityStyles();
            expect(styles['--instagram-container-bg']).toBe('#ffffff');
            expect(styles['--instagram-animation-duration']).toBe('0.01ms');
            expect(styles['--instagram-font-size-multiplier']).toBe('1.25');
        });
    });

    describe('Color Contrast Validation', () => {
        it('should validate color contrast ratios', () => {
            mockUseAccessibilityPreferences.mockReturnValue({
                ...mockUseAccessibilityPreferences(),
                preferences: {
                    ...mockUseAccessibilityPreferences().preferences,
                    highContrast: true
                }
            });

            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            const validation = result.current.validateInstagramContrast('#000000', '#ffffff');
            expect(validation.valid).toBe(true);
            expect(validation.ratio).toBeGreaterThan(4.5);
            expect(validation.aa).toBe(true);
        });

        it('should return valid for non-high-contrast mode', () => {
            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            const validation = result.current.validateInstagramContrast('#000000', '#ffffff');
            expect(validation.valid).toBe(true);
            expect(validation.ratio).toBe(null);
        });
    });

    describe('Focus Styles', () => {
        it('should return Instagram-specific focus styles for high contrast', () => {
            mockUseAccessibilityPreferences.mockReturnValue({
                ...mockUseAccessibilityPreferences(),
                preferences: {
                    ...mockUseAccessibilityPreferences().preferences,
                    highContrast: true
                }
            });

            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            const focusStyles = result.current.getInstagramFocusStyles();
            expect(focusStyles.outline).toContain('#ff0000');
            expect(focusStyles.outlineOffset).toBe('2px');
        });
    });

    describe('Error Handling', () => {
        it('should handle matchMedia errors gracefully', () => {
            // Mock matchMedia to throw error
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: vi.fn().mockImplementation(() => {
                    throw new Error('matchMedia not supported');
                })
            });

            expect(() => {
                renderHook(() =>
                    useInstagramAccessibilityEnhanced({
                        enableHighContrast: true,
                        enableReducedMotion: true,
                        enableSystemDetection: true
                    })
                );
            }).not.toThrow();
        });

        it('should handle invalid color values in contrast validation', () => {
            mockUseAccessibilityPreferences.mockReturnValue({
                ...mockUseAccessibilityPreferences(),
                preferences: {
                    ...mockUseAccessibilityPreferences().preferences,
                    highContrast: true
                }
            });

            const { result } = renderHook(() =>
                useInstagramAccessibilityEnhanced({
                    enableHighContrast: true,
                    enableReducedMotion: true,
                    enableSystemDetection: true
                })
            );

            const validation = result.current.validateInstagramContrast('invalid-color', '#ffffff');
            expect(validation.valid).toBe(false);
            expect(validation.error).toBeTruthy();
        });
    });
});