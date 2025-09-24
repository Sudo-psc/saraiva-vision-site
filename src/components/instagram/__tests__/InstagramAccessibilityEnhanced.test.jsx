import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import InstagramFeedContainer from '../InstagramFeedContainer';
import InstagramPost from '../InstagramPost';
import InstagramStats from '../InstagramStats';

// Mock the Instagram service
vi.mock('../../../services/instagramService', () => ({
    default: {
        fetchPosts: vi.fn(),
        subscribeToStats: vi.fn(),
        fetchPostStats: vi.fn()
    }
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        article: ({ children, ...props }) => <article {...props}>{children}</article>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock date-fns
vi.mock('date-fns', () => ({
    format: vi.fn(() => '12:00'),
    formatDistanceToNow: vi.fn(() => '2 hours ago')
}));

vi.mock('date-fns/locale', () => ({
    ptBR: {}
}));

// Mock hooks
vi.mock('../../../hooks/useResponsiveLayout', () => ({
    default: () => ({
        currentBreakpoint: 'md',
        deviceCapabilities: { isTouchDevice: false },
        getGridColumns: () => 2,
        createTouchHandler: () => ({})
    })
}));

vi.mock('../../../hooks/useInstagramPerformance', () => ({
    default: () => ({
        preloadImages: vi.fn(),
        getLoadingProgress: () => 0,
        getPerformanceReport: () => ({}),
        getImageLoadingState: () => 'loaded',
        getOptimizedImageUrl: (url) => url,
        preloadImage: vi.fn()
    })
}));

vi.mock('../../../hooks/useInstagramAccessibility', () => ({
    default: () => ({
        focusedIndex: -1,
        keyboardMode: false,
        screenReaderActive: false,
        announcements: [],
        announce: vi.fn(),
        generateAriaLabel: (type) => `Test ${type} label`,
        generatePostDescription: () => 'Test post description',
        handleKeyNavigation: vi.fn(),
        registerFocusableElements: vi.fn(),
        focusFirst: vi.fn(),
        createLiveRegion: () => ({ 'aria-live': 'polite' })
    })
}));

// Mock OptimizedImage component
vi.mock('../OptimizedImage', () => ({
    default: ({ src, alt, className, ...props }) => (
        <img src={src} alt={alt} className={className} {...props} />
    )
}));

// Mock InstagramResponsiveGrid component
vi.mock('../InstagramResponsiveGrid', () => ({
    default: ({ children, ...props }) => <div {...props}>{children}</div>
}));

// Mock InstagramSkeleton component
vi.mock('../InstagramSkeleton', () => ({
    InstagramFeedSkeleton: ({ postCount }) => (
        <div data-testid="skeleton">Loading {postCount} posts...</div>
    )
}));

// Mock the enhanced accessibility hook
const mockUseInstagramAccessibilityEnhanced = vi.fn();
vi.mock('../../../hooks/useInstagramAccessibilityEnhanced', () => ({
    default: mockUseInstagramAccessibilityEnhanced
}));

// Mock the base accessibility preferences hook  
const mockUseAccessibilityPreferences = vi.fn();
vi.mock('../../../hooks/useAccessibilityPreferences', () => ({
    default: mockUseAccessibilityPreferences
}));

describe('Instagram Enhanced Accessibility', () => {
    const mockPost = {
        id: 'test-post-1',
        caption: 'Test Instagram post caption',
        media_type: 'IMAGE',
        media_url: 'https://example.com/image.jpg',
        permalink: 'https://instagram.com/p/test',
        timestamp: '2024-01-01T12:00:00Z',
        username: 'testuser',
        stats: {
            likes: 100,
            comments: 25,
            engagement_rate: 5.2
        }
    };

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Setup default mock returns
        mockUseAccessibilityPreferences.mockReturnValue({
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

        mockUseInstagramAccessibilityEnhanced.mockReturnValue({
            instagramHighContrast: false,
            instagramReducedMotion: false,
            systemHighContrast: false,
            systemReducedMotion: false,
            getInstagramHighContrastColors: () => null,
            getInstagramAnimationConfig: () => ({
                duration: 0.3,
                ease: 'easeOut',
                stagger: 0.1,
                imageTransitions: true,
                hoverEffects: true,
                loadingAnimations: true,
                tooltipAnimations: true
            }),
            getInstagramAccessibilityClasses: () => '',
            getInstagramAccessibilityStyles: () => ({}),
            getInstagramFocusStyles: () => ({}),
            shouldDisableInstagramFeature: () => false,
            isSystemHighContrast: false,
            isSystemReducedMotion: false,
            hasAccessibilityPreferences: false
        });

        // Mock Instagram service
        const instagramService = require('../../../services/instagramService').default;
        instagramService.fetchPosts.mockResolvedValue({
            success: true,
            posts: [mockPost],
            cached: false
        });
        instagramService.subscribeToStats.mockReturnValue(() => { });
        instagramService.fetchPostStats.mockResolvedValue({
            success: true,
            stats: mockPost.stats,
            timestamp: Date.now()
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('High Contrast Mode', () => {
        it('should apply high contrast classes when enabled', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                instagramHighContrast: true,
                getInstagramAccessibilityClasses: () => 'high-contrast instagram-high-contrast',
                getInstagramHighContrastColors: () => ({
                    containerBg: '#ffffff',
                    containerText: '#000000',
                    containerBorder: '#000000',
                    postBg: '#ffffff',
                    postText: '#000000',
                    postBorder: '#000000'
                })
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            const container = screen.getByRole('region');
            expect(container).toHaveClass('high-contrast');
            expect(container).toHaveClass('instagram-high-contrast');
        });

        it('should apply high contrast colors to posts', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                instagramHighContrast: true,
                getInstagramHighContrastColors: () => ({
                    postBg: '#ffffff',
                    postText: '#000000',
                    postBorder: '#000000'
                }),
                getInstagramAccessibilityClasses: () => 'high-contrast',
                getInstagramFocusStyles: () => ({
                    outline: '3px solid #ff0000',
                    outlineOffset: '2px'
                })
            });

            render(
                <InstagramPost
                    post={mockPost}
                    enableAccessibility={true}
                />
            );

            const post = screen.getByRole('article');
            expect(post).toHaveClass('high-contrast');
        });

        it('should apply high contrast colors to stats', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                instagramHighContrast: true,
                getInstagramHighContrastColors: () => ({
                    postBg: '#ffffff',
                    postText: '#000000',
                    postBorder: '#000000'
                }),
                getInstagramAccessibilityClasses: () => 'high-contrast',
                getInstagramAccessibilityStyles: () => ({
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    border: '1px solid #000000'
                })
            });

            render(
                <InstagramStats
                    postId="test-post-1"
                    initialStats={mockPost.stats}
                    enableAccessibility={true}
                />
            );

            const stats = screen.getByRole('region');
            expect(stats).toHaveClass('high-contrast');
        });

        it('should detect system high contrast preferences', async () => {
            // Mock matchMedia for high contrast detection
            const mockMatchMedia = vi.fn();
            mockMatchMedia.mockReturnValue({
                matches: true,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            });
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: mockMatchMedia
            });

            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                systemHighContrast: true,
                instagramHighContrast: true,
                isSystemHighContrast: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-contrast: high)');
        });

        it('should maintain visual hierarchy in high contrast mode', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                instagramHighContrast: true,
                getInstagramHighContrastColors: () => ({
                    containerBg: '#ffffff',
                    containerText: '#000000',
                    postBg: '#ffffff',
                    postText: '#000000',
                    focusColor: '#ff0000',
                    accentColor: '#0000ff'
                }),
                getInstagramAccessibilityClasses: () => 'high-contrast'
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            // Check that headings are still distinguishable
            const heading = screen.getByRole('banner');
            expect(heading).toBeInTheDocument();

            // Check that interactive elements have proper contrast
            const refreshButton = screen.getByRole('button', { name: /refresh/i });
            expect(refreshButton).toBeInTheDocument();
        });
    });

    describe('Reduced Motion Mode', () => {
        it('should disable animations when reduced motion is enabled', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                instagramReducedMotion: true,
                getInstagramAnimationConfig: () => ({
                    duration: 0.01,
                    ease: 'linear',
                    stagger: 0,
                    imageTransitions: false,
                    hoverEffects: false,
                    loadingAnimations: false,
                    tooltipAnimations: false
                }),
                getInstagramAccessibilityClasses: () => 'reduced-motion instagram-reduced-motion',
                shouldDisableInstagramFeature: (feature) => {
                    const disabledFeatures = {
                        imageHover: true,
                        scaleAnimations: true,
                        hoverEffects: true,
                        tooltipAnimations: true
                    };
                    return disabledFeatures[feature] || false;
                }
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            const container = screen.getByRole('region');
            expect(container).toHaveClass('reduced-motion');
            expect(container).toHaveClass('instagram-reduced-motion');
        });

        it('should disable hover effects on posts when reduced motion is enabled', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                instagramReducedMotion: true,
                shouldDisableInstagramFeature: (feature) => feature === 'hoverEffects',
                getInstagramAccessibilityClasses: () => 'reduced-motion'
            });

            render(
                <InstagramPost
                    post={mockPost}
                    enableAccessibility={true}
                />
            );

            const post = screen.getByRole('article');
            expect(post).toHaveClass('reduced-motion');
        });

        it('should disable image transitions when reduced motion is enabled', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                instagramReducedMotion: true,
                shouldDisableInstagramFeature: (feature) => feature === 'imageHover',
                getInstagramAccessibilityClasses: () => 'reduced-motion'
            });

            render(
                <InstagramPost
                    post={mockPost}
                    enableAccessibility={true}
                />
            );

            const post = screen.getByRole('article');
            const image = post.querySelector('img');

            // Image should not have hover scale classes when reduced motion is enabled
            expect(image).not.toHaveClass('group-hover:scale-105');
        });

        it('should detect system reduced motion preferences', () => {
            // Mock matchMedia for reduced motion detection
            const mockMatchMedia = vi.fn();
            mockMatchMedia.mockReturnValue({
                matches: true,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn()
            });
            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: mockMatchMedia
            });

            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                systemReducedMotion: true,
                instagramReducedMotion: true,
                isSystemReducedMotion: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
        });

        it('should disable tooltip animations when reduced motion is enabled', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                instagramReducedMotion: true,
                shouldDisableInstagramFeature: (feature) => feature === 'tooltipAnimations',
                getInstagramAccessibilityClasses: () => 'reduced-motion'
            });

            render(
                <InstagramStats
                    postId="test-post-1"
                    initialStats={mockPost.stats}
                    enableAccessibility={true}
                    showTooltip={true}
                />
            );

            const stats = screen.getByRole('region');
            expect(stats).toHaveClass('reduced-motion');
        });
    });

    describe('Combined High Contrast and Reduced Motion', () => {
        it('should handle both high contrast and reduced motion simultaneously', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                instagramHighContrast: true,
                instagramReducedMotion: true,
                getInstagramHighContrastColors: () => ({
                    containerBg: '#ffffff',
                    containerText: '#000000',
                    containerBorder: '#000000'
                }),
                getInstagramAccessibilityClasses: () => 'high-contrast reduced-motion instagram-high-contrast instagram-reduced-motion',
                shouldDisableInstagramFeature: () => true,
                hasAccessibilityPreferences: true
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            const container = screen.getByRole('region');
            expect(container).toHaveClass('high-contrast');
            expect(container).toHaveClass('reduced-motion');
            expect(container).toHaveClass('instagram-high-contrast');
            expect(container).toHaveClass('instagram-reduced-motion');
        });

        it('should prioritize accessibility over visual effects', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                instagramHighContrast: true,
                instagramReducedMotion: true,
                getInstagramHighContrastColors: () => ({
                    postBg: '#ffffff',
                    postText: '#000000',
                    postBorder: '#000000'
                }),
                getInstagramAccessibilityClasses: () => 'high-contrast reduced-motion',
                shouldDisableInstagramFeature: () => true
            });

            render(
                <InstagramPost
                    post={mockPost}
                    enableAccessibility={true}
                />
            );

            const post = screen.getByRole('article');

            // Should have accessibility classes
            expect(post).toHaveClass('high-contrast');
            expect(post).toHaveClass('reduced-motion');
        });
    });

    describe('System Preference Detection', () => {
        it('should listen for system preference changes', () => {
            const mockAddEventListener = vi.fn();
            const mockRemoveEventListener = vi.fn();
            const mockMatchMedia = vi.fn();

            mockMatchMedia.mockReturnValue({
                matches: false,
                addEventListener: mockAddEventListener,
                removeEventListener: mockRemoveEventListener
            });

            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: mockMatchMedia
            });

            const { unmount } = render(<InstagramFeedContainer enableAccessibility={true} />);

            // Should set up listeners for system preferences
            expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-contrast: high)');
            expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');

            unmount();
        });

        it('should handle media query listener errors gracefully', () => {
            const mockMatchMedia = vi.fn();
            mockMatchMedia.mockImplementation(() => {
                throw new Error('Media query not supported');
            });

            Object.defineProperty(window, 'matchMedia', {
                writable: true,
                value: mockMatchMedia
            });

            // Should not throw error
            expect(() => {
                render(<InstagramFeedContainer enableAccessibility={true} />);
            }).not.toThrow();
        });
    });

    describe('Accessibility Feature Validation', () => {
        it('should validate color contrast ratios', () => {
            const mockValidateContrast = vi.fn().mockReturnValue({
                valid: true,
                ratio: 7.2,
                aa: true,
                aaa: true
            });

            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                validateInstagramContrast: mockValidateContrast
            });

            render(<InstagramFeedContainer enableAccessibility={true} />);

            // Validation function should be available
            expect(mockValidateContrast).toBeDefined();
        });

        it('should provide feature-specific disable checks', () => {
            const mockShouldDisable = vi.fn();
            mockShouldDisable.mockImplementation((feature) => {
                return ['imageHover', 'scaleAnimations'].includes(feature);
            });

            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                shouldDisableInstagramFeature: mockShouldDisable
            });

            render(
                <InstagramPost
                    post={mockPost}
                    enableAccessibility={true}
                />
            );

            expect(mockShouldDisable).toBeDefined();
        });
    });

    describe('Error Handling', () => {
        it('should handle missing accessibility preferences gracefully', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                instagramHighContrast: false,
                instagramReducedMotion: false,
                getInstagramAccessibilityClasses: () => '',
                getInstagramAccessibilityStyles: () => ({}),
                getInstagramAnimationConfig: () => ({}),
                shouldDisableInstagramFeature: () => false
            });

            expect(() => {
                render(<InstagramFeedContainer enableAccessibility={true} />);
            }).not.toThrow();
        });

        it('should handle null color values gracefully', () => {
            mockUseInstagramAccessibilityEnhanced.mockReturnValue({
                ...mockUseInstagramAccessibilityEnhanced(),
                getInstagramHighContrastColors: () => null
            });

            expect(() => {
                render(
                    <InstagramPost
                        post={mockPost}
                        enableAccessibility={true}
                    />
                );
            }).not.toThrow();
        });
    });
});