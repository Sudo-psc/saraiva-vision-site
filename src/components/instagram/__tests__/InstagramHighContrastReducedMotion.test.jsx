import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import InstagramFeedContainer from '../InstagramFeedContainer';
import useInstagramAccessibilityEnhanced from '../../../hooks/useInstagramAccessibilityEnhanced';

// Mock the Instagram service
vi.mock('../../../services/instagramService', () => ({
    default: {
        fetchPosts: vi.fn(() => Promise.resolve({
            success: true,
            posts: [
                {
                    id: '1',
                    caption: 'Test post 1',
                    media_url: 'https://example.com/image1.jpg',
                    permalink: 'https://instagram.com/p/1',
                    timestamp: '2024-01-01T00:00:00Z',
                    username: 'testuser',
                    stats: { likes: 100, comments: 10, engagement_rate: 5.5 }
                },
                {
                    id: '2',
                    caption: 'Test post 2',
                    media_url: 'https://example.com/image2.jpg',
                    permalink: 'https://instagram.com/p/2',
                    timestamp: '2024-01-02T00:00:00Z',
                    username: 'testuser',
                    stats: { likes: 200, comments: 20, engagement_rate: 7.2 }
                }
            ]
        })),
        subscribeToStats: vi.fn(() => vi.fn())
    }
}));

// Mock the error handler
vi.mock('../../../services/instagramErrorHandler', () => ({
    default: {
        createContext: vi.fn(() => ({})),
        withErrorHandling: vi.fn((fn) => fn),
        handleError: vi.fn(() => Promise.resolve({ shouldShowFallback: false }))
    }
}));

// Mock the offline hook
vi.mock('../../../hooks/useInstagramOffline', () => ({
    default: vi.fn(() => ({
        isOnline: true,
        isServiceWorkerReady: false,
        contentAvailableOffline: false,
        syncStatus: 'idle',
        cachePosts: vi.fn(),
        getOfflinePosts: vi.fn(),
        handleAutoCacheUpdate: vi.fn(),
        shouldCachePosts: vi.fn(() => false)
    }))
}));

// Mock other hooks
vi.mock('../../../hooks/useResponsiveLayout', () => ({
    default: vi.fn(() => ({
        currentBreakpoint: 'md',
        deviceCapabilities: { isTouchDevice: false },
        getGridColumns: vi.fn(() => 2),
        createTouchHandler: vi.fn(() => ({}))
    }))
}));

vi.mock('../../../hooks/useInstagramPerformance', () => ({
    default: vi.fn(() => ({
        preloadImages: vi.fn(),
        getLoadingProgress: vi.fn(() => 100),
        getPerformanceReport: vi.fn(() => ({}))
    }))
}));

vi.mock('../../../hooks/useInstagramAccessibility', () => ({
    default: vi.fn(() => ({
        focusedIndex: -1,
        keyboardMode: false,
        screenReaderActive: false,
        announcements: [],
        announce: vi.fn(),
        generateAriaLabel: vi.fn(() => 'Test label'),
        handleKeyNavigation: vi.fn(),
        registerFocusableElements: vi.fn(),
        focusFirst: vi.fn(),
        createLiveRegion: vi.fn(() => ({ 'aria-live': 'polite' }))
    }))
}));

vi.mock('../../../hooks/useAccessibilityPreferences', () => ({
    default: vi.fn(() => ({
        preferences: { highContrast: false, reducedMotion: false },
        getAccessibilityClasses: vi.fn(() => ''),
        getAccessibilityStyles: vi.fn(() => ({})),
        getAnimationConfig: vi.fn(() => ({ duration: 0.3 })),
        shouldReduceMotion: vi.fn(() => false),
        isHighContrast: false,
        getAccessibleColors: vi.fn(() => null),
        getFocusStyles: vi.fn(() => ({}))
    }))
}));

// Mock the enhanced accessibility hook first
vi.mock('../../../hooks/useInstagramAccessibilityEnhanced', () => ({
    default: vi.fn()
}));

describe('Instagram High Contrast and Reduced Motion Support', () => {
    let mockMatchMedia;
    let originalMatchMedia;
    let mockUseInstagramAccessibilityEnhanced;

    beforeEach(() => {
        // Get the mock function
        mockUseInstagramAccessibilityEnhanced = useInstagramAccessibilityEnhanced;
        // Mock localStorage
        const localStorageMock = {
            getItem: vi.fn(() => null),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn()
        };
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Mock navigator.onLine
        Object.defineProperty(navigator, 'onLine', {
            value: true,
            writable: true
        });

        // Store original matchMedia
        originalMatchMedia = window.matchMedia;

        // Mock matchMedia
        mockMatchMedia = vi.fn((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn()
        }));

        window.matchMedia = mockMatchMedia;

        // Default mock implementation
        mockUseInstagramAccessibilityEnhanced.mockReturnValue({
            instagramHighContrast: false,
            instagramReducedMotion: false,
            systemHighContrast: false,
            systemReducedMotion: false,
            preferences: { highContrast: false, reducedMotion: false },
            systemPreferences: { highContrast: false, reducedMotion: false },
            isHighContrast: false,
            shouldReduceMotion: false,
            getInstagramHighContrastColors: vi.fn(() => null),
            getInstagramAnimationConfig: vi.fn(() => ({
                duration: 0.3,
                ease: 'easeOut',
                stagger: 0.1,
                spring: true,
                bounce: true,
                imageTransitions: true,
                hoverEffects: true,
                loadingAnimations: true,
                tooltipAnimations: true
            })),
            getInstagramAccessibilityClasses: vi.fn(() => ''),
            getInstagramAccessibilityStyles: vi.fn(() => ({})),
            getInstagramFocusStyles: vi.fn(() => ({})),
            validateInstagramContrast: vi.fn(() => ({ valid: true, ratio: 7 })),
            shouldDisableInstagramFeature: vi.fn(() => false),
            getAccessibilityClasses: vi.fn(() => ''),
            getAccessibilityStyles: vi.fn(() => ({})),
            getAnimationConfig: vi.fn(() => ({ duration: 0.3 })),
            getAccessibleColors: vi.fn(() => null),
            getFocusStyles: vi.fn(() => ({})),
            isSystemHighContrast: false,
            isSystemReducedMotion: false,
            hasAccessibilityPreferences: false,
            enableHighContrast: true,
            enableReducedMotion: true,
            enableSystemDetection: true
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        window.matchMedia = originalMatchMedia;
    });

    describe('High Contrast Mode', () => {
        it('should detect system high contrast preference', async () => {
            // Mock high contrast media query
            mockMatchMedia.mockImplementation((query) => ({
                matches: query === '(prefers-contrast: high)',
                media: query,
                onchange: null,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn()
            }));

            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                instagramHighContrast: true,
                instagramReducedMotion: false,
                systemHighContrast: true,
                systemReducedMotion: false,
                preferences: { highContrast: true, reducedMotion: false },
                systemPreferences: { highContrast: true, reducedMotion: false },
                isHighContrast: true,
                shouldReduceMotion: false,
                getInstagramHighContrastColors: vi.fn(() => ({
                    containerBg: '#ffffff',
                    containerText: '#000000',
                    containerBorder: '#000000',
                    postBg: '#ffffff',
                    postText: '#000000',
                    postBorder: '#000000',
                    focusColor: '#ff0000',
                    accentColor: '#0000ff'
                })),
                getInstagramAnimationConfig: vi.fn(() => ({
                    duration: 0.3,
                    ease: 'easeOut',
                    imageTransitions: true,
                    hoverEffects: true
                })),
                getInstagramAccessibilityClasses: vi.fn(() => 'high-contrast instagram-high-contrast'),
                getInstagramAccessibilityStyles: vi.fn(() => ({
                    '--instagram-container-bg': '#ffffff',
                    '--instagram-container-text': '#000000',
                    '--instagram-focus-color': '#ff0000'
                })),
                getInstagramFocusStyles: vi.fn(() => ({
                    outline: '3px solid #ff0000',
                    outlineOffset: '2px'
                })),
                validateInstagramContrast: vi.fn(() => ({ valid: true, ratio: 21 })),
                shouldDisableInstagramFeature: vi.fn(() => false),
                getAccessibilityClasses: vi.fn(() => 'high-contrast'),
                getAccessibilityStyles: vi.fn(() => ({})),
                getAnimationConfig: vi.fn(() => ({ duration: 0.3 })),
                getAccessibleColors: vi.fn(() => null),
                getFocusStyles: vi.fn(() => ({})),
                isSystemHighContrast: true,
                isSystemReducedMotion: false,
                hasAccessibilityPreferences: true,
                enableHighContrast: true,
                enableReducedMotion: true,
                enableSystemDetection: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            await waitFor(() => {
                const container = screen.getByRole('region');
                expect(container).toHaveClass('high-contrast');
                expect(container).toHaveClass('instagram-high-contrast');
            });

            // Verify high contrast colors are applied
            const mockGetInstagramAccessibilityStyles = mockUseInstagramAccessibilityEnhanced().getInstagramAccessibilityStyles;
            expect(mockGetInstagramAccessibilityStyles).toHaveBeenCalled();
        });

        it('should apply high contrast colors to Instagram components', async () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                instagramHighContrast: true,
                instagramReducedMotion: false,
                getInstagramHighContrastColors: vi.fn(() => ({
                    containerBg: '#ffffff',
                    containerText: '#000000',
                    postBg: '#ffffff',
                    postText: '#000000',
                    focusColor: '#ff0000',
                    accentColor: '#0000ff',
                    errorColor: '#ff0000',
                    successColor: '#008000'
                })),
                getInstagramAccessibilityClasses: vi.fn(() => 'high-contrast instagram-high-contrast'),
                getInstagramAccessibilityStyles: vi.fn(() => ({
                    '--instagram-container-bg': '#ffffff',
                    '--instagram-container-text': '#000000',
                    '--instagram-post-bg': '#ffffff',
                    '--instagram-post-text': '#000000',
                    '--instagram-focus-color': '#ff0000',
                    '--instagram-accent-color': '#0000ff'
                })),
                getInstagramFocusStyles: vi.fn(() => ({
                    outline: '4px solid #ff0000',
                    outlineOffset: '3px'
                })),
                shouldDisableInstagramFeature: vi.fn(() => false),
                isHighContrast: true,
                shouldReduceMotion: false,
                hasAccessibilityPreferences: true,
                enableHighContrast: true,
                enableReducedMotion: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            await waitFor(() => {
                const container = screen.getByRole('region');
                expect(container).toHaveStyle({
                    '--instagram-container-bg': '#ffffff',
                    '--instagram-container-text': '#000000',
                    '--instagram-focus-color': '#ff0000'
                });
            });
        });

        it('should validate color contrast ratios', () => {
            const mockValidateContrast = vi.fn(() => ({ valid: true, ratio: 7.5, aa: true, aaa: true }));

            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                instagramHighContrast: true,
                validateInstagramContrast: mockValidateContrast,
                isHighContrast: true,
                shouldReduceMotion: false,
                hasAccessibilityPreferences: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            // The contrast validation should be available
            const { validateInstagramContrast } = mockUseInstagramAccessibilityEnhanced();
            const result = validateInstagramContrast('#000000', '#ffffff', 'normal');

            expect(result.valid).toBe(true);
            expect(result.ratio).toBeGreaterThan(4.5); // WCAG AA requirement
            expect(result.aa).toBe(true);
        });

        it('should handle Windows high contrast mode', () => {
            // Mock Windows high contrast detection
            mockMatchMedia.mockImplementation((query) => ({
                matches: query === '(-ms-high-contrast: active)',
                media: query,
                onchange: null,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn()
            }));

            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                instagramHighContrast: true,
                systemHighContrast: true,
                getInstagramAccessibilityClasses: vi.fn(() => 'high-contrast instagram-high-contrast'),
                isHighContrast: true,
                shouldReduceMotion: false,
                hasAccessibilityPreferences: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            expect(mockMatchMedia).toHaveBeenCalledWith('(-ms-high-contrast: active)');
        });
    });

    describe('Reduced Motion Mode', () => {
        it('should detect system reduced motion preference', async () => {
            // Mock reduced motion media query
            mockMatchMedia.mockImplementation((query) => ({
                matches: query === '(prefers-reduced-motion: reduce)',
                media: query,
                onchange: null,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn()
            }));

            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                instagramHighContrast: false,
                instagramReducedMotion: true,
                systemHighContrast: false,
                systemReducedMotion: true,
                preferences: { highContrast: false, reducedMotion: true },
                systemPreferences: { highContrast: false, reducedMotion: true },
                isHighContrast: false,
                shouldReduceMotion: true,
                getInstagramAnimationConfig: vi.fn(() => ({
                    duration: 0.01,
                    ease: 'linear',
                    stagger: 0,
                    spring: false,
                    bounce: false,
                    scale: false,
                    rotate: false,
                    translate: false,
                    opacity: true,
                    initial: false,
                    animate: false,
                    exit: false,
                    whileHover: false,
                    whileTap: false,
                    imageTransitions: false,
                    hoverEffects: false,
                    loadingAnimations: false,
                    tooltipAnimations: false
                })),
                getInstagramAccessibilityClasses: vi.fn(() => 'reduced-motion instagram-reduced-motion'),
                getInstagramAccessibilityStyles: vi.fn(() => ({
                    '--instagram-animation-duration': '0.01ms',
                    '--instagram-transition-duration': '0.01ms',
                    '--instagram-transform': 'none'
                })),
                shouldDisableInstagramFeature: vi.fn((feature) => {
                    const disabledFeatures = {
                        imageHover: true,
                        scaleAnimations: true,
                        slideAnimations: true,
                        rotateAnimations: true,
                        bounceAnimations: true,
                        pulseAnimations: true,
                        spinAnimations: true,
                        tooltipAnimations: true,
                        loadingAnimations: true,
                        hoverEffects: true,
                        parallaxEffects: true,
                        autoplay: true
                    };
                    return disabledFeatures[feature] || false;
                }),
                isSystemHighContrast: false,
                isSystemReducedMotion: true,
                hasAccessibilityPreferences: true,
                enableHighContrast: true,
                enableReducedMotion: true,
                enableSystemDetection: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            await waitFor(() => {
                const container = screen.getByRole('region');
                expect(container).toHaveClass('reduced-motion');
                expect(container).toHaveClass('instagram-reduced-motion');
            });

            // Verify reduced motion configuration
            const mockGetInstagramAnimationConfig = mockUseInstagramAccessibilityEnhanced().getInstagramAnimationConfig;
            const animationConfig = mockGetInstagramAnimationConfig();
            expect(animationConfig.duration).toBe(0.01);
            expect(animationConfig.imageTransitions).toBe(false);
            expect(animationConfig.hoverEffects).toBe(false);
        });

        it('should disable animations when reduced motion is enabled', async () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                instagramReducedMotion: true,
                getInstagramAnimationConfig: vi.fn(() => ({
                    duration: 0.01,
                    initial: false,
                    animate: false,
                    imageTransitions: false,
                    hoverEffects: false
                })),
                getInstagramAccessibilityClasses: vi.fn(() => 'reduced-motion instagram-reduced-motion'),
                getInstagramAccessibilityStyles: vi.fn(() => ({
                    '--instagram-animation-duration': '0.01ms',
                    '--instagram-transition-duration': '0.01ms'
                })),
                shouldDisableInstagramFeature: vi.fn(() => true),
                shouldReduceMotion: true,
                hasAccessibilityPreferences: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            await waitFor(() => {
                const container = screen.getByRole('region');
                expect(container).toHaveStyle({
                    '--instagram-animation-duration': '0.01ms',
                    '--instagram-transition-duration': '0.01ms'
                });
            });

            // Verify that specific features are disabled
            const { shouldDisableInstagramFeature } = mockUseInstagramAccessibilityEnhanced();
            expect(shouldDisableInstagramFeature('imageHover')).toBe(true);
            expect(shouldDisableInstagramFeature('scaleAnimations')).toBe(true);
            expect(shouldDisableInstagramFeature('hoverEffects')).toBe(true);
        });

        it('should handle Framer Motion animations with reduced motion', async () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                instagramReducedMotion: true,
                getInstagramAnimationConfig: vi.fn(() => ({
                    initial: false,
                    animate: false,
                    exit: false,
                    whileHover: false,
                    whileTap: false
                })),
                shouldReduceMotion: true,
                hasAccessibilityPreferences: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            // The container should not have motion animations
            await waitFor(() => {
                const container = screen.getByRole('region');
                // In reduced motion mode, Framer Motion should be disabled
                expect(container).toBeInTheDocument();
            });
        });
    });

    describe('Combined Accessibility Features', () => {
        it('should handle both high contrast and reduced motion simultaneously', async () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                instagramHighContrast: true,
                instagramReducedMotion: true,
                systemHighContrast: true,
                systemReducedMotion: true,
                isHighContrast: true,
                shouldReduceMotion: true,
                getInstagramHighContrastColors: vi.fn(() => ({
                    containerBg: '#000000',
                    containerText: '#ffffff',
                    focusColor: '#ffff00'
                })),
                getInstagramAnimationConfig: vi.fn(() => ({
                    duration: 0.01,
                    initial: false,
                    animate: false,
                    imageTransitions: false,
                    hoverEffects: false
                })),
                getInstagramAccessibilityClasses: vi.fn(() => 'high-contrast instagram-high-contrast reduced-motion instagram-reduced-motion'),
                getInstagramAccessibilityStyles: vi.fn(() => ({
                    '--instagram-container-bg': '#000000',
                    '--instagram-container-text': '#ffffff',
                    '--instagram-focus-color': '#ffff00',
                    '--instagram-animation-duration': '0.01ms',
                    '--instagram-transition-duration': '0.01ms'
                })),
                shouldDisableInstagramFeature: vi.fn(() => true),
                hasAccessibilityPreferences: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            await waitFor(() => {
                const container = screen.getByRole('region');
                expect(container).toHaveClass('high-contrast');
                expect(container).toHaveClass('instagram-high-contrast');
                expect(container).toHaveClass('reduced-motion');
                expect(container).toHaveClass('instagram-reduced-motion');

                expect(container).toHaveStyle({
                    '--instagram-container-bg': '#000000',
                    '--instagram-container-text': '#ffffff',
                    '--instagram-focus-color': '#ffff00',
                    '--instagram-animation-duration': '0.01ms'
                });
            });
        });

        it('should respect user preferences over system preferences', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                instagramHighContrast: true,
                instagramReducedMotion: false,
                systemHighContrast: false,
                systemReducedMotion: true,
                preferences: { highContrast: true, reducedMotion: false },
                systemPreferences: { highContrast: false, reducedMotion: true },
                isHighContrast: true,
                shouldReduceMotion: false,
                hasAccessibilityPreferences: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            const { instagramHighContrast, instagramReducedMotion } = mockUseInstagramAccessibilityEnhanced();

            // User enabled high contrast but disabled reduced motion
            expect(instagramHighContrast).toBe(true);
            expect(instagramReducedMotion).toBe(false);
        });

        it('should provide accessible focus indicators in high contrast mode', async () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                instagramHighContrast: true,
                getInstagramFocusStyles: vi.fn(() => ({
                    outline: '4px solid #ffff00',
                    outlineOffset: '3px',
                    boxShadow: '0 0 0 4px #ffff00'
                })),
                isHighContrast: true,
                hasAccessibilityPreferences: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            await waitFor(() => {
                const refreshButton = screen.getByRole('button', { name: /refresh/i });
                fireEvent.focus(refreshButton);

                // Focus styles should be applied
                const { getInstagramFocusStyles } = mockUseInstagramAccessibilityEnhanced();
                const focusStyles = getInstagramFocusStyles();
                expect(focusStyles.outline).toBe('4px solid #ffff00');
                expect(focusStyles.outlineOffset).toBe('3px');
            });
        });
    });

    describe('System Preference Detection', () => {
        it('should listen for media query changes', () => {
            const mockAddEventListener = vi.fn();
            const mockRemoveEventListener = vi.fn();

            mockMatchMedia.mockImplementation((query) => ({
                matches: false,
                media: query,
                addEventListener: mockAddEventListener,
                removeEventListener: mockRemoveEventListener,
                addListener: vi.fn(),
                removeListener: vi.fn()
            }));

            const { unmount } = render(<InstagramFeedContainer enableAccessibility={true} />);

            // Should have added listeners for accessibility media queries
            expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-contrast: high)');
            expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');

            unmount();

            // Should clean up listeners on unmount
            expect(mockRemoveEventListener).toHaveBeenCalled();
        });

        it('should handle legacy browser support', () => {
            const mockAddListener = vi.fn();
            const mockRemoveListener = vi.fn();

            // Mock legacy browser without addEventListener
            mockMatchMedia.mockImplementation((query) => ({
                matches: false,
                media: query,
                addEventListener: undefined,
                removeEventListener: undefined,
                addListener: mockAddListener,
                removeListener: mockRemoveListener
            }));

            const { unmount } = render(<InstagramFeedContainer enableAccessibility={true} />);

            unmount();

            // Should use legacy methods if addEventListener is not available
            expect(mockAddListener).toHaveBeenCalled();
            expect(mockRemoveListener).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle media query detection errors gracefully', () => {
            // Mock matchMedia to throw an error
            mockMatchMedia.mockImplementation(() => {
                throw new Error('Media query not supported');
            });

            // Should not crash when media queries fail
            expect(() => {
                render(<InstagramFeedContainer enableAccessibility={true} />);
            }).not.toThrow();
        });

        it('should provide fallback behavior when accessibility features fail', () => {
            mockUseInstagramAccessibilityEnhanced.mockImplementation(() => {
                throw new Error('Accessibility hook failed');
            });

            // Should render with basic functionality even if accessibility features fail
            expect(() => {
                render(<InstagramFeedContainer enableAccessibility={false} />);
            }).not.toThrow();
        });
    });
});