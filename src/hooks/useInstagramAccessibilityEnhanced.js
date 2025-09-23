import { useState, useEffect, useCallback } from 'react';
import useAccessibilityPreferences from './useAccessibilityPreferences';

/**
 * Enhanced accessibility hook specifically for Instagram components
 * Provides high contrast mode and reduced motion support with Instagram-specific optimizations
 */
const useInstagramAccessibilityEnhanced = ({
    enableHighContrast = true,
    enableReducedMotion = true,
    enableSystemDetection = true
}) => {
    // Base accessibility preferences
    const {
        preferences,
        systemPreferences,
        getAccessibilityClasses,
        getAccessibilityStyles,
        getAnimationConfig,
        shouldReduceMotion,
        isHighContrast,
        getAccessibleColors,
        getFocusStyles
    } = useAccessibilityPreferences();

    // Instagram-specific state
    const [instagramHighContrast, setInstagramHighContrast] = useState(false);
    const [instagramReducedMotion, setInstagramReducedMotion] = useState(false);
    const [systemHighContrast, setSystemHighContrast] = useState(false);
    const [systemReducedMotion, setSystemReducedMotion] = useState(false);

    // Detect system high contrast preferences
    const detectSystemHighContrast = useCallback(() => {
        if (!enableSystemDetection) return false;

        const queries = [
            '(prefers-contrast: high)',
            '(-ms-high-contrast: active)',
            '(-ms-high-contrast: black-on-white)',
            '(-ms-high-contrast: white-on-black)'
        ];

        return queries.some(query => {
            try {
                return window.matchMedia(query).matches;
            } catch (error) {
                console.warn('High contrast detection failed for query:', query);
                return false;
            }
        });
    }, [enableSystemDetection]);

    // Detect system reduced motion preferences
    const detectSystemReducedMotion = useCallback(() => {
        if (!enableSystemDetection) return false;

        try {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (error) {
            console.warn('Reduced motion detection failed');
            return false;
        }
    }, [enableSystemDetection]);

    // Update Instagram-specific accessibility states
    useEffect(() => {
        const updateAccessibilityStates = () => {
            const systemHC = detectSystemHighContrast();
            const systemRM = detectSystemReducedMotion();

            setSystemHighContrast(systemHC);
            setSystemReducedMotion(systemRM);

            // Update Instagram-specific states based on preferences and system detection
            setInstagramHighContrast(
                enableHighContrast && (preferences.highContrast || systemHC)
            );
            setInstagramReducedMotion(
                enableReducedMotion && (preferences.reducedMotion || systemRM)
            );
        };

        updateAccessibilityStates();

        // Listen for system preference changes
        const mediaQueries = [
            { query: '(prefers-contrast: high)', handler: updateAccessibilityStates },
            { query: '(-ms-high-contrast: active)', handler: updateAccessibilityStates },
            { query: '(prefers-reduced-motion: reduce)', handler: updateAccessibilityStates }
        ];

        const listeners = mediaQueries.map(({ query, handler }) => {
            try {
                const mq = window.matchMedia(query);
                const listener = handler;

                if (mq.addEventListener) {
                    mq.addEventListener('change', listener);
                } else {
                    mq.addListener(listener);
                }

                return { mq, listener };
            } catch (error) {
                console.warn('Failed to add media query listener:', query);
                return null;
            }
        }).filter(Boolean);

        return () => {
            listeners.forEach(({ mq, listener }) => {
                try {
                    if (mq.removeEventListener) {
                        mq.removeEventListener('change', listener);
                    } else {
                        mq.removeListener(listener);
                    }
                } catch (error) {
                    console.warn('Failed to remove media query listener');
                }
            });
        };
    }, [
        preferences.highContrast,
        preferences.reducedMotion,
        enableHighContrast,
        enableReducedMotion,
        detectSystemHighContrast,
        detectSystemReducedMotion
    ]);

    // Get Instagram-specific high contrast colors
    const getInstagramHighContrastColors = useCallback(() => {
        if (!instagramHighContrast) return null;

        const isDark = preferences.darkMode || systemPreferences.darkMode;

        return {
            // Container colors
            containerBg: isDark ? '#000000' : '#ffffff',
            containerText: isDark ? '#ffffff' : '#000000',
            containerBorder: isDark ? '#ffffff' : '#000000',

            // Post colors
            postBg: isDark ? '#000000' : '#ffffff',
            postText: isDark ? '#ffffff' : '#000000',
            postBorder: isDark ? '#ffffff' : '#000000',
            postHoverBg: isDark ? '#1a1a1a' : '#f8f9fa',

            // Interactive colors
            focusColor: isDark ? '#ffff00' : '#ff0000',
            accentColor: isDark ? '#00ffff' : '#0000ff',
            accentHover: isDark ? '#0099cc' : '#000080',

            // Semantic colors
            errorColor: isDark ? '#ff6666' : '#ff0000',
            successColor: isDark ? '#66ff66' : '#008000',
            warningColor: isDark ? '#ffcc66' : '#ff8c00',

            // Stats colors
            likesColor: isDark ? '#ff6666' : '#ff0000',
            commentsColor: isDark ? '#00ffff' : '#0000ff',
            engagementColor: isDark ? '#66ff66' : '#008000',

            // Shadow and overlay
            shadowColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.5)',
            overlayColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        };
    }, [instagramHighContrast, preferences.darkMode, systemPreferences.darkMode]);

    // Get Instagram-specific animation configuration
    const getInstagramAnimationConfig = useCallback(() => {
        if (instagramReducedMotion) {
            return {
                // Completely disable animations
                duration: 0.01,
                ease: 'linear',
                stagger: 0,
                spring: false,
                bounce: false,
                scale: false,
                rotate: false,
                translate: false,
                opacity: true, // Keep opacity changes for accessibility

                // Framer Motion specific
                initial: false,
                animate: false,
                exit: false,
                whileHover: false,
                whileTap: false,

                // Instagram specific
                imageTransitions: false,
                hoverEffects: false,
                loadingAnimations: false,
                tooltipAnimations: false
            };
        }

        return {
            // Normal animations
            duration: 0.3,
            ease: 'easeOut',
            stagger: 0.1,
            spring: true,
            bounce: true,
            scale: true,
            rotate: true,
            translate: true,
            opacity: true,

            // Framer Motion specific
            initial: 'hidden',
            animate: 'visible',
            exit: 'hidden',
            whileHover: 'hover',
            whileTap: 'tap',

            // Instagram specific
            imageTransitions: true,
            hoverEffects: true,
            loadingAnimations: true,
            tooltipAnimations: true
        };
    }, [instagramReducedMotion]);

    // Get Instagram-specific CSS classes
    const getInstagramAccessibilityClasses = useCallback(() => {
        const classes = [];

        if (instagramHighContrast) {
            classes.push('high-contrast');
            classes.push('instagram-high-contrast');
        }

        if (instagramReducedMotion) {
            classes.push('reduced-motion');
            classes.push('instagram-reduced-motion');
        }

        if (preferences.darkMode || systemPreferences.darkMode) {
            classes.push('dark-mode');
        }

        if (preferences.forceFocus) {
            classes.push('force-focus');
        }

        if (preferences.largeText) {
            classes.push('large-text');
        }

        return classes.join(' ');
    }, [
        instagramHighContrast,
        instagramReducedMotion,
        preferences.darkMode,
        preferences.forceFocus,
        preferences.largeText,
        systemPreferences.darkMode
    ]);

    // Get Instagram-specific CSS styles
    const getInstagramAccessibilityStyles = useCallback(() => {
        const styles = {};
        const colors = getInstagramHighContrastColors();

        if (instagramHighContrast && colors) {
            // Apply high contrast colors as CSS custom properties
            styles['--instagram-container-bg'] = colors.containerBg;
            styles['--instagram-container-text'] = colors.containerText;
            styles['--instagram-container-border'] = colors.containerBorder;
            styles['--instagram-post-bg'] = colors.postBg;
            styles['--instagram-post-text'] = colors.postText;
            styles['--instagram-post-border'] = colors.postBorder;
            styles['--instagram-post-hover-bg'] = colors.postHoverBg;
            styles['--instagram-focus-color'] = colors.focusColor;
            styles['--instagram-accent-color'] = colors.accentColor;
            styles['--instagram-accent-hover'] = colors.accentHover;
            styles['--instagram-error-color'] = colors.errorColor;
            styles['--instagram-success-color'] = colors.successColor;
            styles['--instagram-warning-color'] = colors.warningColor;
            styles['--instagram-likes-color'] = colors.likesColor;
            styles['--instagram-comments-color'] = colors.commentsColor;
            styles['--instagram-engagement-color'] = colors.engagementColor;
            styles['--instagram-shadow-color'] = colors.shadowColor;
            styles['--instagram-overlay-color'] = colors.overlayColor;
        }

        if (instagramReducedMotion) {
            styles['--instagram-animation-duration'] = '0.01ms';
            styles['--instagram-transition-duration'] = '0.01ms';
            styles['--instagram-transform'] = 'none';
        }

        if (preferences.largeText) {
            styles['--instagram-font-size-multiplier'] = '1.25';
            styles['--instagram-line-height-multiplier'] = '1.5';
        }

        return styles;
    }, [instagramHighContrast, instagramReducedMotion, preferences.largeText, getInstagramHighContrastColors]);

    // Validate color contrast for Instagram elements
    const validateInstagramContrast = useCallback((foreground, background, context = 'normal') => {
        if (!instagramHighContrast) return { valid: true, ratio: null };

        // Simple contrast ratio calculation
        const getLuminance = (color) => {
            const rgb = parseInt(color.replace('#', ''), 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;

            const [rs, gs, bs] = [r, g, b].map(c => {
                c = c / 255;
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });

            return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };

        try {
            const l1 = getLuminance(foreground);
            const l2 = getLuminance(background);
            const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

            // Instagram-specific contrast requirements
            const requirements = {
                normal: 4.5,    // Normal text
                large: 3.0,     // Large text (18pt+ or 14pt+ bold)
                ui: 3.0,        // UI components
                graphics: 3.0   // Graphics and icons
            };

            const required = requirements[context] || requirements.normal;
            const valid = ratio >= required;

            return {
                valid,
                ratio: Math.round(ratio * 100) / 100,
                required,
                aa: ratio >= 4.5,
                aaa: ratio >= 7.0
            };
        } catch (error) {
            console.warn('Contrast validation failed:', error);
            return { valid: false, ratio: null, error: error.message };
        }
    }, [instagramHighContrast]);

    // Get Instagram-specific focus styles
    const getInstagramFocusStyles = useCallback(() => {
        const colors = getInstagramHighContrastColors();

        if (instagramHighContrast && colors) {
            return {
                outline: `3px solid ${colors.focusColor}`,
                outlineOffset: '2px',
                boxShadow: `0 0 0 3px ${colors.focusColor}`,
                borderColor: colors.focusColor
            };
        }

        return getFocusStyles();
    }, [instagramHighContrast, getInstagramHighContrastColors, getFocusStyles]);

    // Check if specific Instagram features should be disabled
    const shouldDisableInstagramFeature = useCallback((feature) => {
        if (!instagramReducedMotion) return false;

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
    }, [instagramReducedMotion]);

    return {
        // State
        instagramHighContrast,
        instagramReducedMotion,
        systemHighContrast,
        systemReducedMotion,

        // Base accessibility
        preferences,
        systemPreferences,
        isHighContrast: instagramHighContrast,
        shouldReduceMotion: instagramReducedMotion,

        // Instagram-specific functions
        getInstagramHighContrastColors,
        getInstagramAnimationConfig,
        getInstagramAccessibilityClasses,
        getInstagramAccessibilityStyles,
        getInstagramFocusStyles,
        validateInstagramContrast,
        shouldDisableInstagramFeature,

        // Base functions (for compatibility)
        getAccessibilityClasses,
        getAccessibilityStyles,
        getAnimationConfig,
        getAccessibleColors,
        getFocusStyles,

        // Utilities
        isSystemHighContrast: systemHighContrast,
        isSystemReducedMotion: systemReducedMotion,
        hasAccessibilityPreferences: instagramHighContrast || instagramReducedMotion,

        // Feature flags
        enableHighContrast,
        enableReducedMotion,
        enableSystemDetection
    };
};

export default useInstagramAccessibilityEnhanced;