/**
 * Enhanced Footer Theme Manager
 * Manages dynamic theming and CSS custom properties for the enhanced footer
 * Requirements: 1.4, 2.4, 3.4
 */

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

    return 'auto';
};

/**
 * Get responsive context based on screen size
 */
export const getResponsiveContext = () => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;

    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

/**
 * Calculate optimized theme values based on context
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

    // Apply performance multiplier
    const perfAdjustedConfig = {
        ...baseConfig,
        glassOpacity: baseConfig.glassOpacity * perfAdjustment.multiplier,
        glassBlur: baseConfig.glassBlur * perfAdjustment.multiplier,
        beamIntensity: baseConfig.beamIntensity * perfAdjustment.multiplier,
        beamParticleCount: Math.round(baseConfig.beamParticleCount * perfAdjustment.multiplier)
    };

    // Apply responsive adjustments
    const finalConfig = {
        ...perfAdjustedConfig,
        glassBlur: perfAdjustedConfig.glassBlur * respAdjustment.glassBlurMultiplier,
        socialScale: perfAdjustedConfig.socialScale * respAdjustment.socialScaleMultiplier,
        beamParticleCount: Math.round(perfAdjustedConfig.beamParticleCount * respAdjustment.beamParticleMultiplier),
        animationDuration: 0.6 * respAdjustment.animationDurationMultiplier
    };

    // Apply custom overrides
    return {
        ...finalConfig,
        ...customOverrides,
        // Ensure performance constraints are respected
        ...(perfAdjustment.disableGlass && { glassOpacity: 0, glassBlur: 0 }),
        ...(perfAdjustment.disableBeams && { beamIntensity: 0, beamParticleCount: 0 })
    };
};

/**
 * Generate CSS custom properties object
 */
export const generateCSSCustomProperties = (themeConfig) => {
    return {
        '--footer-glass-opacity': themeConfig.glassOpacity.toString(),
        '--footer-glass-blur': `${themeConfig.glassBlur}px`,
        '--footer-glass-saturation': `${themeConfig.glassSaturation}%`,
        '--footer-glass-border-opacity': themeConfig.glassBorderOpacity.toString(),
        '--footer-glass-shadow-opacity': themeConfig.glassShadowOpacity.toString(),
        '--footer-social-scale': themeConfig.socialScale.toString(),
        '--footer-beam-intensity': themeConfig.beamIntensity.toString(),
        '--footer-beam-particle-count': themeConfig.beamParticleCount.toString(),
        '--footer-animation-duration': `${themeConfig.animationDuration || 0.6}s`,
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
    const [theme, setTheme] = React.useState(() => getCurrentTheme());
    const [responsiveContext, setResponsiveContext] = React.useState(() => getResponsiveContext());

    // Listen for theme changes
    React.useEffect(() => {
        const mediaQueries = [
            window.matchMedia('(prefers-color-scheme: dark)'),
            window.matchMedia('(prefers-color-scheme: light)'),
            window.matchMedia('(prefers-contrast: high)')
        ];

        const handleThemeChange = () => {
            setTheme(getCurrentTheme());
        };

        mediaQueries.forEach(mq => mq.addEventListener('change', handleThemeChange));

        return () => {
            mediaQueries.forEach(mq => mq.removeEventListener('change', handleThemeChange));
        };
    }, []);

    // Listen for responsive changes
    React.useEffect(() => {
        const handleResize = () => {
            setResponsiveContext(getResponsiveContext());
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate optimized theme
    const optimizedTheme = React.useMemo(() => {
        return calculateOptimizedTheme(
            theme,
            'high', // This should come from performance monitoring
            responsiveContext,
            customOverrides
        );
    }, [theme, responsiveContext, customOverrides]);

    // Generate CSS custom properties
    const cssCustomProperties = React.useMemo(() => {
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