import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing accessibility preferences
 * Handles high contrast mode, reduced motion, and other accessibility settings
 */
const useAccessibilityPreferences = () => {
    // State for accessibility preferences
    const [preferences, setPreferences] = useState({
        highContrast: false,
        reducedMotion: false,
        forceFocus: false,
        largeText: false,
        darkMode: false,
        colorBlindFriendly: false
    });

    const [systemPreferences, setSystemPreferences] = useState({
        highContrast: false,
        reducedMotion: false,
        darkMode: false
    });

    // Detect system preferences
    const detectSystemPreferences = useCallback(() => {
        const newSystemPrefs = {
            // High contrast detection
            highContrast:
                window.matchMedia('(prefers-contrast: high)').matches ||
                window.matchMedia('(-ms-high-contrast: active)').matches ||
                window.matchMedia('(-ms-high-contrast: black-on-white)').matches ||
                window.matchMedia('(-ms-high-contrast: white-on-black)').matches,

            // Reduced motion detection
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

            // Dark mode detection
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
        };

        setSystemPreferences(newSystemPrefs);

        // Update preferences to match system if not manually overridden
        setPreferences(prev => ({
            ...prev,
            highContrast: prev.highContrast || newSystemPrefs.highContrast,
            reducedMotion: prev.reducedMotion || newSystemPrefs.reducedMotion,
            darkMode: prev.darkMode || newSystemPrefs.darkMode
        }));
    }, []);

    // Initialize and listen for system preference changes
    useEffect(() => {
        detectSystemPreferences();

        // Create media query listeners
        const mediaQueries = [
            { query: '(prefers-contrast: high)', key: 'highContrast' },
            { query: '(-ms-high-contrast: active)', key: 'highContrast' },
            { query: '(prefers-reduced-motion: reduce)', key: 'reducedMotion' },
            { query: '(prefers-color-scheme: dark)', key: 'darkMode' }
        ];

        const listeners = mediaQueries.map(({ query, key }) => {
            const mq = window.matchMedia(query);
            const listener = () => detectSystemPreferences();

            if (mq.addEventListener) {
                mq.addEventListener('change', listener);
            } else {
                // Fallback for older browsers
                mq.addListener(listener);
            }

            return { mq, listener };
        });

        return () => {
            listeners.forEach(({ mq, listener }) => {
                if (mq.removeEventListener) {
                    mq.removeEventListener('change', listener);
                } else {
                    mq.removeListener(listener);
                }
            });
        };
    }, [detectSystemPreferences]);

    // Load saved preferences from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('accessibility-preferences');
            if (saved) {
                const savedPrefs = JSON.parse(saved);
                setPreferences(prev => ({ ...prev, ...savedPrefs }));
            }
        } catch (error) {
            console.warn('Failed to load accessibility preferences:', error);
        }
    }, []);

    // Save preferences to localStorage
    const savePreferences = useCallback((newPrefs) => {
        try {
            localStorage.setItem('accessibility-preferences', JSON.stringify(newPrefs));
        } catch (error) {
            console.warn('Failed to save accessibility preferences:', error);
        }
    }, []);

    // Update individual preference
    const updatePreference = useCallback((key, value) => {
        setPreferences(prev => {
            const newPrefs = { ...prev, [key]: value };
            savePreferences(newPrefs);
            return newPrefs;
        });
    }, [savePreferences]);

    // Toggle preference
    const togglePreference = useCallback((key) => {
        updatePreference(key, !preferences[key]);
    }, [preferences, updatePreference]);

    // Reset to system defaults
    const resetToSystemDefaults = useCallback(() => {
        const systemDefaults = {
            highContrast: systemPreferences.highContrast,
            reducedMotion: systemPreferences.reducedMotion,
            darkMode: systemPreferences.darkMode,
            forceFocus: false,
            largeText: false,
            colorBlindFriendly: false
        };

        setPreferences(systemDefaults);
        savePreferences(systemDefaults);
    }, [systemPreferences, savePreferences]);

    // Get CSS classes based on preferences
    const getAccessibilityClasses = useCallback(() => {
        const classes = [];

        if (preferences.highContrast) classes.push('high-contrast');
        if (preferences.reducedMotion) classes.push('reduced-motion');
        if (preferences.forceFocus) classes.push('force-focus');
        if (preferences.largeText) classes.push('large-text');
        if (preferences.darkMode) classes.push('dark-mode');
        if (preferences.colorBlindFriendly) classes.push('colorblind-friendly');

        return classes.join(' ');
    }, [preferences]);

    // Get CSS custom properties for theming
    const getAccessibilityStyles = useCallback(() => {
        const styles = {};

        if (preferences.highContrast) {
            styles['--contrast-ratio'] = '7:1';
            styles['--border-width'] = '2px';
            styles['--focus-ring-width'] = '3px';
        }

        if (preferences.reducedMotion) {
            styles['--animation-duration'] = '0.01ms';
            styles['--transition-duration'] = '0.01ms';
        }

        if (preferences.largeText) {
            styles['--font-size-multiplier'] = '1.25';
            styles['--line-height-multiplier'] = '1.5';
        }

        return styles;
    }, [preferences]);

    // Check if animations should be disabled
    const shouldReduceMotion = useCallback(() => {
        return preferences.reducedMotion || systemPreferences.reducedMotion;
    }, [preferences.reducedMotion, systemPreferences.reducedMotion]);

    // Get high contrast color scheme
    const getHighContrastColors = useCallback(() => {
        if (!preferences.highContrast) return null;

        return {
            background: preferences.darkMode ? '#000000' : '#ffffff',
            foreground: preferences.darkMode ? '#ffffff' : '#000000',
            accent: preferences.darkMode ? '#ffff00' : '#0000ff',
            border: preferences.darkMode ? '#ffffff' : '#000000',
            focus: '#ff0000',
            visited: '#800080',
            error: '#ff0000',
            success: '#008000',
            warning: '#ff8c00'
        };
    }, [preferences.highContrast, preferences.darkMode]);

    // Generate accessible color combinations
    const getAccessibleColors = useCallback((baseColor, context = 'normal') => {
        const highContrastColors = getHighContrastColors();

        if (highContrastColors) {
            switch (context) {
                case 'primary':
                    return {
                        background: highContrastColors.accent,
                        color: highContrastColors.background,
                        border: highContrastColors.foreground
                    };
                case 'secondary':
                    return {
                        background: highContrastColors.background,
                        color: highContrastColors.foreground,
                        border: highContrastColors.foreground
                    };
                case 'error':
                    return {
                        background: highContrastColors.error,
                        color: highContrastColors.background,
                        border: highContrastColors.foreground
                    };
                case 'success':
                    return {
                        background: highContrastColors.success,
                        color: highContrastColors.background,
                        border: highContrastColors.foreground
                    };
                default:
                    return {
                        background: highContrastColors.background,
                        color: highContrastColors.foreground,
                        border: highContrastColors.border
                    };
            }
        }

        // Return original colors if not in high contrast mode
        return null;
    }, [getHighContrastColors]);

    // Animation configuration based on preferences
    const getAnimationConfig = useCallback(() => {
        if (shouldReduceMotion()) {
            return {
                duration: 0.01,
                ease: 'linear',
                stagger: 0,
                spring: false,
                bounce: false
            };
        }

        return {
            duration: 0.3,
            ease: 'easeOut',
            stagger: 0.1,
            spring: true,
            bounce: true
        };
    }, [shouldReduceMotion]);

    // Focus management utilities
    const getFocusStyles = useCallback(() => {
        const baseStyles = {
            outline: 'none',
            boxShadow: '0 0 0 2px #3b82f6'
        };

        if (preferences.highContrast) {
            return {
                ...baseStyles,
                boxShadow: '0 0 0 3px #ff0000',
                outline: '2px solid #ff0000',
                outlineOffset: '2px'
            };
        }

        if (preferences.forceFocus) {
            return {
                ...baseStyles,
                boxShadow: '0 0 0 3px #3b82f6',
                outline: '2px solid #3b82f6'
            };
        }

        return baseStyles;
    }, [preferences.highContrast, preferences.forceFocus]);

    // Validate color contrast
    const validateContrast = useCallback((foreground, background) => {
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

        const l1 = getLuminance(foreground);
        const l2 = getLuminance(background);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        return {
            ratio,
            aa: ratio >= 4.5,
            aaa: ratio >= 7,
            aaLarge: ratio >= 3
        };
    }, []);

    return {
        // State
        preferences,
        systemPreferences,

        // Actions
        updatePreference,
        togglePreference,
        resetToSystemDefaults,

        // Utilities
        getAccessibilityClasses,
        getAccessibilityStyles,
        shouldReduceMotion,
        getHighContrastColors,
        getAccessibleColors,
        getAnimationConfig,
        getFocusStyles,
        validateContrast,

        // Helpers
        isHighContrast: preferences.highContrast,
        isReducedMotion: preferences.reducedMotion,
        isDarkMode: preferences.darkMode,
        isLargeText: preferences.largeText,
        isForceFocus: preferences.forceFocus,
        isColorBlindFriendly: preferences.colorBlindFriendly
    };
};

export default useAccessibilityPreferences;