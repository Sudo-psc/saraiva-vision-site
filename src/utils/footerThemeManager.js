/**
 * Enhanced Footer Theme Manager
 * Manages dynamic theming and CSS custom properties for the enhanced footer
 * Requirements: 1.4, 2.4, 3.4
 */

import { useState, useEffect, useMemo } from 'react';

/**
 * Theme configurations for different contexts
 */
export const themeConfigurations = {
    light: {
        glassOpacity: 0.15,
        glassBlur: 25,
        glassSaturation: 160,
        glassBorderOpacity: 0.2,
        glassShadowOpacity: 0.2,
        socialScale: 1.12,
        beamIntensity: 0.7,
        beamParticleCount: 60
    },

    dark: {
        glassOpacity: 0.08,
        glassBlur: 20,
        glassSaturation: 140,
        glassBorderOpacity: 0.12,
        glassShadowOpacity: 0.4,
        socialScale: 1.1,
        beamIntensity: 0.6,
        beamParticleCount: 50
    },

    auto: {
        glassOpacity: 0.1,
        glassBlur: 20,
        glassSaturation: 150,
        glassBorderOpacity: 0.15,
        glassShadowOpacity: 0.3,
        socialScale: 1.1,
        beamIntensity: 0.6,
        beamParticleCount: 50
    },

    highContrast: {
        glassOpacity: 0.2,
        glassBlur: 15,
        glassSaturation: 120,
        glassBorderOpacity: 0.3,
        glassShadowOpacity: 0.5,
        socialScale: 1.15,
        beamIntensity: 0.8,
        beamParticleCount: 40
    }
};

/**
 * Performance-based theme adjustments
 */
export const performanceAdjustments = {
    high: {
        multiplier: 1.0,
        enableAllEffects: true
    },

    medium: {
        multiplier: 0.8,
        enableAllEffects: true,
        reduceParticles: true
    },

    low: {
        multiplier: 0.5,
        enableAllEffects: false,
        disableGlass: true,
        disableBeams: true
    }
};

/**
 * Responsive theme adjustments
 */
export const responsiveAdjustments = {
    mobile: {
        glassBlurMultiplier: 0.6,
        socialScaleMultiplier: 0.9,
        beamParticleMultiplier: 0.3,
        animationDurationMultiplier: 0.8
    },

    tablet: {
        glassBlurMultiplier: 0.8,
        socialScaleMultiplier: 0.95,
        beamParticleMultiplier: 0.7,
        animationDurationMultiplier: 0.9
    },

    desktop: {
        glassBlurMultiplier: 1.0,
        socialScaleMultiplier: 1.0,
        beamParticleMultiplier: 1.0,
        animationDurationMultiplier: 1.0
    }
};

/**
 * Get the current theme based on system preferences and user settings
 */
export const getCurrentTheme = () => {
    if (typeof window === 'undefined') return 'auto';

    // Check if matchMedia is available (may not be in testing environments)
    if (!window.matchMedia) return 'auto';

    try {
        // Check for high contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            return 'highContrast';
        }

        // Check for color scheme preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }
    } catch (error) {
        // Fallback if matchMedia queries fail
        console.warn('Failed to query media preferences:', error);
    }

    return 'auto';
};

/**
 * Get responsive context based on screen size
 */
export const getResponsiveContext = () => {
    if (typeof window === 'undefined') return 'desktop';

    try {
        const width = window.innerWidth || 1024; // fallback width
        
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    } catch (error) {
        // Fallback if window access fails
        console.warn('Failed to get responsive context:', error);
        return 'desktop';
    }
};

/**
 * Calculate optimized theme values based on context with null safety
 */
export const calculateOptimizedTheme = (
    baseTheme = 'auto',
    performanceLevel = 'high',
    responsiveContext = 'desktop',
    customOverrides = {}
) => {
    const baseConfig = themeConfigurations[baseTheme] || themeConfigurations.auto;
    const perfAdjustment = performanceAdjustments[performanceLevel] || performanceAdjustments.high;
    const respAdjustment = responsiveAdjustments[responsiveContext] || responsiveAdjustments.desktop;

    // Apply performance multiplier with null safety
    const perfAdjustedConfig = {
        ...baseConfig,
        glassOpacity: Math.max(0, (baseConfig.glassOpacity || 0.1) * (perfAdjustment.multiplier || 1)),
        glassBlur: Math.max(0, (baseConfig.glassBlur || 20) * (perfAdjustment.multiplier || 1)),
        beamIntensity: Math.max(0, (baseConfig.beamIntensity || 0.6) * (perfAdjustment.multiplier || 1)),
        beamParticleCount: Math.max(0, Math.round((baseConfig.beamParticleCount || 50) * (perfAdjustment.multiplier || 1)))
    };

    // Apply responsive adjustments with null safety
    const finalConfig = {
        ...perfAdjustedConfig,
        glassBlur: Math.max(0, (perfAdjustedConfig.glassBlur || 20) * (respAdjustment.glassBlurMultiplier || 1)),
        socialScale: Math.max(0.5, (perfAdjustedConfig.socialScale || 1.1) * (respAdjustment.socialScaleMultiplier || 1)),
        beamParticleCount: Math.max(0, Math.round((perfAdjustedConfig.beamParticleCount || 50) * (respAdjustment.beamParticleMultiplier || 1))),
        animationDuration: Math.max(0.1, (0.6 * (respAdjustment.animationDurationMultiplier || 1)))
    };

    // Apply custom overrides with validation
    const mergedConfig = {
        ...finalConfig,
        ...customOverrides
    };

    // Ensure performance constraints are respected and no null values
    const result = {
        ...mergedConfig,
        // Ensure no null values with explicit defaults
        glassOpacity: mergedConfig.glassOpacity ?? 0.1,
        glassBlur: mergedConfig.glassBlur ?? 20,
        glassSaturation: mergedConfig.glassSaturation ?? 150,
        glassBorderOpacity: mergedConfig.glassBorderOpacity ?? 0.15,
        glassShadowOpacity: mergedConfig.glassShadowOpacity ?? 0.3,
        socialScale: mergedConfig.socialScale ?? 1.1,
        beamIntensity: mergedConfig.beamIntensity ?? 0.6,
        beamParticleCount: mergedConfig.beamParticleCount ?? 50,
        animationDuration: mergedConfig.animationDuration ?? 0.6
    };

    // Apply performance constraints that can zero out values
    if (perfAdjustment.disableGlass) {
        result.glassOpacity = 0;
        result.glassBlur = 0;
    }
    
    if (perfAdjustment.disableBeams) {
        result.beamIntensity = 0;
        result.beamParticleCount = 0;
    }

    return result;
};

/**
 * Generate CSS custom properties object with null-safe fallbacks
 */
export const generateCSSCustomProperties = (themeConfig) => {
    // Provide fallback values for null/undefined properties
    const safeTheme = {
        glassOpacity: 0.1,
        glassBlur: 20,
        glassSaturation: 150,
        glassBorderOpacity: 0.15,
        glassShadowOpacity: 0.3,
        socialScale: 1.1,
        beamIntensity: 0.6,
        beamParticleCount: 50,
        animationDuration: 0.6,
        ...themeConfig
    };

    return {
        '--footer-glass-opacity': (safeTheme.glassOpacity ?? 0.1).toString(),
        '--footer-glass-blur': `${safeTheme.glassBlur ?? 20}px`,
        '--footer-glass-saturation': `${safeTheme.glassSaturation ?? 150}%`,
        '--footer-glass-border-opacity': (safeTheme.glassBorderOpacity ?? 0.15).toString(),
        '--footer-glass-shadow-opacity': (safeTheme.glassShadowOpacity ?? 0.3).toString(),
        '--footer-social-scale': (safeTheme.socialScale ?? 1.1).toString(),
        '--footer-beam-intensity': (safeTheme.beamIntensity ?? 0.6).toString(),
        '--footer-beam-particle-count': Math.round(safeTheme.beamParticleCount ?? 50).toString(),
        '--footer-animation-duration': `${safeTheme.animationDuration ?? 0.6}s`,
        '--footer-animation-delay': '0.2s',
        '--footer-animation-easing': 'cubic-bezier(0.4, 0, 0.2, 1)'
    };
};

/**
 * Apply theme to DOM element
 */
export const applyThemeToElement = (element, themeConfig) => {
    if (!element) return;

    const customProperties = generateCSSCustomProperties(themeConfig);

    Object.entries(customProperties).forEach(([property, value]) => {
        element.style.setProperty(property, value);
    });

    // Set theme data attribute for CSS selectors
    const currentTheme = getCurrentTheme();
    element.setAttribute('data-theme', currentTheme);
};

/**
 * React hook for dynamic theme management
 */
export const useFooterTheme = (customOverrides = {}) => {
    const [theme, setTheme] = useState(() => getCurrentTheme());
    const [responsiveContext, setResponsiveContext] = useState(() => getResponsiveContext());

    // Listen for theme changes
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;

        try {
            const mediaQueries = [
                window.matchMedia('(prefers-color-scheme: dark)'),
                window.matchMedia('(prefers-color-scheme: light)'),
                window.matchMedia('(prefers-contrast: high)')
            ];

            const handleThemeChange = () => {
                setTheme(getCurrentTheme());
            };

            mediaQueries.forEach(mq => {
                if (mq && mq.addEventListener) {
                    mq.addEventListener('change', handleThemeChange);
                }
            });

            return () => {
                mediaQueries.forEach(mq => {
                    if (mq && mq.removeEventListener) {
                        mq.removeEventListener('change', handleThemeChange);
                    }
                });
            };
        } catch (error) {
            console.warn('Failed to set up media query listeners:', error);
        }
    }, []);

    // Listen for responsive changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setResponsiveContext(getResponsiveContext());
        };

        try {
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        } catch (error) {
            console.warn('Failed to set up resize listener:', error);
        }
    }, []);

    // Calculate optimized theme with null safety
    const optimizedTheme = useMemo(() => {
        // Guard against null/undefined theme
        if (!theme) {
            return calculateOptimizedTheme(
                'auto', // fallback theme
                'high',
                responsiveContext || 'desktop',
                customOverrides || {}
            );
        }
        
        return calculateOptimizedTheme(
            theme,
            'high', // This should come from performance monitoring
            responsiveContext,
            customOverrides
        );
    }, [theme, responsiveContext, customOverrides]);

    // Generate CSS custom properties with null safety
    const cssCustomProperties = useMemo(() => {
        // Guard against null/undefined optimizedTheme
        if (!optimizedTheme) {
            return generateCSSCustomProperties({});
        }
        
        return generateCSSCustomProperties(optimizedTheme);
    }, [optimizedTheme]);

    return {
        theme,
        responsiveContext,
        optimizedTheme,
        cssCustomProperties,
        applyTheme: (element) => applyThemeToElement(element, optimizedTheme)
    };
};

/**
 * Theme manager class for advanced usage
 */
export class FooterThemeManager {
    constructor(options = {}) {
        this.options = {
            autoUpdate: true,
            performanceMonitoring: true,
            ...options
        };

        this.currentTheme = getCurrentTheme();
        this.responsiveContext = getResponsiveContext();
        this.performanceLevel = 'high';
        this.customOverrides = {};

        if (this.options.autoUpdate) {
            this.startAutoUpdate();
        }
    }

    startAutoUpdate() {
        // Theme change listeners
        const mediaQueries = [
            window.matchMedia('(prefers-color-scheme: dark)'),
            window.matchMedia('(prefers-color-scheme: light)'),
            window.matchMedia('(prefers-contrast: high)')
        ];

        this.themeChangeHandler = () => {
            this.currentTheme = getCurrentTheme();
            this.updateTheme();
        };

        mediaQueries.forEach(mq => mq.addEventListener('change', this.themeChangeHandler));

        // Responsive change listener
        this.resizeHandler = () => {
            this.responsiveContext = getResponsiveContext();
            this.updateTheme();
        };

        window.addEventListener('resize', this.resizeHandler);
    }

    updateTheme() {
        const optimizedTheme = calculateOptimizedTheme(
            this.currentTheme,
            this.performanceLevel,
            this.responsiveContext,
            this.customOverrides
        );

        // Apply to all enhanced footer elements
        const footerElements = document.querySelectorAll('.enhanced-footer');
        footerElements.forEach(element => {
            applyThemeToElement(element, optimizedTheme);
        });

        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('footerThemeUpdate', {
            detail: { optimizedTheme, manager: this }
        }));
    }

    setPerformanceLevel(level) {
        this.performanceLevel = level;
        this.updateTheme();
    }

    setCustomOverrides(overrides) {
        this.customOverrides = { ...this.customOverrides, ...overrides };
        this.updateTheme();
    }

    destroy() {
        if (this.themeChangeHandler) {
            const mediaQueries = [
                window.matchMedia('(prefers-color-scheme: dark)'),
                window.matchMedia('(prefers-color-scheme: light)'),
                window.matchMedia('(prefers-contrast: high)')
            ];

            mediaQueries.forEach(mq => mq.removeEventListener('change', this.themeChangeHandler));
        }

        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
    }
}

export default {
    themeConfigurations,
    performanceAdjustments,
    responsiveAdjustments,
    getCurrentTheme,
    getResponsiveContext,
    calculateOptimizedTheme,
    generateCSSCustomProperties,
    applyThemeToElement,
    useFooterTheme,
    FooterThemeManager
};