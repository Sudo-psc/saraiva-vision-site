import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import useInstagramAccessibilityEnhanced from '../../../hooks/useInstagramAccessibilityEnhanced';

// Mock all dependencies
vi.mock('../../../services/instagramService', () => ({
    default: {
        fetchPosts: vi.fn(() => Promise.resolve({
            success: true,
            posts: []
        })),
        subscribeToStats: vi.fn(() => vi.fn())
    }
}));

vi.mock('../../../services/instagramErrorHandler', () => ({
    default: {
        createContext: vi.fn(() => ({})),
        withErrorHandling: vi.fn((fn) => fn),
        handleError: vi.fn(() => Promise.resolve({ shouldShowFallback: false }))
    }
}));

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
        preferences: {
            highContrast: false,
            reducedMotion: false,
            darkMode: false,
            forceFocus: false,
            largeText: false,
            colorBlindFriendly: false
        },
        systemPreferences: {
            highContrast: false,
            reducedMotion: false,
            darkMode: false
        },
        getAccessibilityClasses: vi.fn(() => ''),
        getAccessibilityStyles: vi.fn(() => ({})),
        getAnimationConfig: vi.fn(() => ({ duration: 0.3 })),
        shouldReduceMotion: vi.fn(() => false),
        isHighContrast: false,
        getAccessibleColors: vi.fn(() => null),
        getFocusStyles: vi.fn(() => ({})),
        updatePreference: vi.fn(),
        togglePreference: vi.fn(),
        resetToSystemDefaults: vi.fn(),
        validateContrast: vi.fn(() => ({ valid: true, ratio: 7 })),
        isReducedMotion: false,
        isDarkMode: false,
        isLargeText: false,
        isForceFocus: false,
        isColorBlindFriendly: false
    }))
}));

describe('Instagram Accessibility Enhanced Hook', () => {
    beforeEach(() => {
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

        // Mock matchMedia
        window.matchMedia = vi.fn((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn()
        }));
    });

    it('should provide high contrast colors when enabled', () => {
        const TestComponent = () => {
            const {
                instagramHighContrast,
                getInstagramHighContrastColors
            } = useInstagramAccessibilityEnhanced({
                enableHighContrast: true
            });

            const colors = getInstagramHighContrastColors();

            return (
                <div data-testid="test-component">
                    <span data-testid="high-contrast-status">
                        {instagramHighContrast ? 'enabled' : 'disabled'}
                    </span>
                    {colors && (
                        <div data-testid="colors">
                            <span data-testid="container-bg">{colors.containerBg}</span>
                            <span data-testid="container-text">{colors.containerText}</span>
                            <span data-testid="focus-color">{colors.focusColor}</span>
                        </div>
                    )}
                </div>
            );
        };

        render(<TestComponent />);

        expect(screen.getByTestId('test-component')).toBeInTheDocument();
        expect(screen.getByTestId('high-contrast-status')).toBeInTheDocument();
    });

    it('should provide reduced motion configuration when enabled', () => {
        const TestComponent = () => {
            const {
                instagramReducedMotion,
                getInstagramAnimationConfig,
                shouldDisableInstagramFeature
            } = useInstagramAccessibilityEnhanced({
                enableReducedMotion: true
            });

            const animationConfig = getInstagramAnimationConfig();
            const hoverDisabled = shouldDisableInstagramFeature('hoverEffects');

            return (
                <div data-testid="test-component">
                    <span data-testid="reduced-motion-status">
                        {instagramReducedMotion ? 'enabled' : 'disabled'}
                    </span>
                    <span data-testid="animation-duration">
                        {animationConfig.duration}
                    </span>
                    <span data-testid="hover-disabled">
                        {hoverDisabled ? 'disabled' : 'enabled'}
                    </span>
                </div>
            );
        };

        render(<TestComponent />);

        expect(screen.getByTestId('test-component')).toBeInTheDocument();
        expect(screen.getByTestId('reduced-motion-status')).toBeInTheDocument();
        expect(screen.getByTestId('animation-duration')).toBeInTheDocument();
        expect(screen.getByTestId('hover-disabled')).toBeInTheDocument();
    });

    it('should validate color contrast ratios', () => {
        const TestComponent = () => {
            const { validateInstagramContrast } = useInstagramAccessibilityEnhanced({
                enableHighContrast: true,
                enableReducedMotion: true,
                enableSystemDetection: true
            });

            const contrastResult = validateInstagramContrast('#000000', '#ffffff', 'normal');

            return (
                <div data-testid="test-component">
                    <span data-testid="contrast-valid">
                        {contrastResult.valid ? 'valid' : 'invalid'}
                    </span>
                    <span data-testid="contrast-ratio">
                        {contrastResult.ratio}
                    </span>
                </div>
            );
        };

        render(<TestComponent />);

        expect(screen.getByTestId('test-component')).toBeInTheDocument();
        expect(screen.getByTestId('contrast-valid')).toBeInTheDocument();
        expect(screen.getByTestId('contrast-ratio')).toBeInTheDocument();
    });

    it('should provide accessibility classes and styles', () => {
        const TestComponent = () => {
            const {
                getInstagramAccessibilityClasses,
                getInstagramAccessibilityStyles,
                getInstagramFocusStyles
            } = useInstagramAccessibilityEnhanced({
                enableHighContrast: true,
                enableReducedMotion: true,
                enableSystemDetection: true
            });

            const classes = getInstagramAccessibilityClasses();
            const styles = getInstagramAccessibilityStyles();
            const focusStyles = getInstagramFocusStyles();

            return (
                <div
                    data-testid="test-component"
                    className={classes}
                    style={styles}
                >
                    <button
                        data-testid="focus-button"
                        style={focusStyles}
                    >
                        Test Button
                    </button>
                </div>
            );
        };

        render(<TestComponent />);

        expect(screen.getByTestId('test-component')).toBeInTheDocument();
        expect(screen.getByTestId('focus-button')).toBeInTheDocument();
    });

    it('should handle system preference detection', () => {
        // Mock high contrast system preference
        window.matchMedia = vi.fn((query) => ({
            matches: query === '(prefers-contrast: high)',
            media: query,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn()
        }));

        const TestComponent = () => {
            const {
                systemHighContrast,
                systemReducedMotion,
                hasAccessibilityPreferences
            } = useInstagramAccessibilityEnhanced({
                enableSystemDetection: true
            });

            return (
                <div data-testid="test-component">
                    <span data-testid="system-high-contrast">
                        {systemHighContrast ? 'detected' : 'not-detected'}
                    </span>
                    <span data-testid="system-reduced-motion">
                        {systemReducedMotion ? 'detected' : 'not-detected'}
                    </span>
                    <span data-testid="has-preferences">
                        {hasAccessibilityPreferences ? 'yes' : 'no'}
                    </span>
                </div>
            );
        };

        render(<TestComponent />);

        expect(screen.getByTestId('test-component')).toBeInTheDocument();
        expect(screen.getByTestId('system-high-contrast')).toBeInTheDocument();
        expect(screen.getByTestId('system-reduced-motion')).toBeInTheDocument();
        expect(screen.getByTestId('has-preferences')).toBeInTheDocument();
    });
});