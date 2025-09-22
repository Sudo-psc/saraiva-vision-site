/**
 * Utility functions for glass morphism effects
 */

/**
 * Generate glass morphism CSS properties
 * @param {Object} options - Configuration options
 * @returns {Object} CSS properties object
 */
export const generateGlassStyles = ({
    intensity = 'medium',
    opacity = null,
    blur = null,
    saturation = null,
    borderOpacity = null,
    shadowOpacity = null
} = {}) => {
    const intensityMap = {
        subtle: {
            opacity: 0.05,
            blur: 10,
            saturation: 120,
            borderOpacity: 0.1,
            shadowOpacity: 0.05
        },
        medium: {
            opacity: 0.1,
            blur: 20,
            saturation: 150,
            borderOpacity: 0.2,
            shadowOpacity: 0.1
        },
        strong: {
            opacity: 0.15,
            blur: 30,
            saturation: 180,
            borderOpacity: 0.3,
            shadowOpacity: 0.15
        }
    };

    const config = intensityMap[intensity] || intensityMap.medium;

    return {
        background: `linear-gradient(135deg, rgba(255, 255, 255, ${opacity || config.opacity}), rgba(255, 255, 255, ${(opacity || config.opacity) * 0.5}))`,
        backdropFilter: `blur(${blur || config.blur}px) saturate(${saturation || config.saturation}%)`,
        WebkitBackdropFilter: `blur(${blur || config.blur}px) saturate(${saturation || config.saturation}%)`,
        border: `1px solid rgba(255, 255, 255, ${borderOpacity || config.borderOpacity})`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, ${shadowOpacity || config.shadowOpacity}), inset 0 1px 0 rgba(255, 255, 255, ${(borderOpacity || config.borderOpacity) * 0.8})`
    };
};

/**
 * Generate dark theme glass morphism CSS properties
 * @param {Object} options - Configuration options
 * @returns {Object} CSS properties object
 */
export const generateDarkGlassStyles = ({
    intensity = 'medium',
    opacity = null,
    blur = null,
    saturation = null,
    borderOpacity = null,
    shadowOpacity = null
} = {}) => {
    const intensityMap = {
        subtle: {
            opacity: 0.05,
            blur: 10,
            saturation: 120,
            borderOpacity: 0.1,
            shadowOpacity: 0.2
        },
        medium: {
            opacity: 0.1,
            blur: 20,
            saturation: 150,
            borderOpacity: 0.15,
            shadowOpacity: 0.3
        },
        strong: {
            opacity: 0.15,
            blur: 30,
            saturation: 180,
            borderOpacity: 0.2,
            shadowOpacity: 0.4
        }
    };

    const config = intensityMap[intensity] || intensityMap.medium;

    return {
        background: `linear-gradient(135deg, rgba(0, 0, 0, ${opacity || config.opacity}), rgba(0, 0, 0, ${(opacity || config.opacity) * 0.5}))`,
        backdropFilter: `blur(${blur || config.blur}px) saturate(${saturation || config.saturation}%)`,
        WebkitBackdropFilter: `blur(${blur || config.blur}px) saturate(${saturation || config.saturation}%)`,
        border: `1px solid rgba(255, 255, 255, ${borderOpacity || config.borderOpacity})`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, ${shadowOpacity || config.shadowOpacity}), inset 0 1px 0 rgba(255, 255, 255, ${(borderOpacity || config.borderOpacity) * 0.5})`
    };
};

/**
 * Get responsive glass intensity based on screen width and performance
 * @param {number} screenWidth - Current screen width
 * @param {string} performanceLevel - Device performance level
 * @returns {string} Glass intensity level
 */
export const getResponsiveGlassIntensity = (screenWidth, performanceLevel = 'medium') => {
    if (performanceLevel === 'low') return 'subtle';

    if (screenWidth < 480) return 'subtle';
    if (screenWidth < 768) return 'medium';
    if (screenWidth < 1024) return 'medium';

    return performanceLevel === 'high' ? 'strong' : 'medium';
};

/**
 * Check if backdrop-filter is supported
 * @returns {boolean} Support status
 */
export const supportsBackdropFilter = () => {
    if (typeof window === 'undefined') return false;

    const testElement = document.createElement('div');
    testElement.style.backdropFilter = 'blur(1px)';

    const supported = testElement.style.backdropFilter !== '';

    if (!supported) {
        testElement.style.webkitBackdropFilter = 'blur(1px)';
        return testElement.style.webkitBackdropFilter !== '';
    }

    return supported;
};

/**
 * Apply glass morphism classes to document root for global feature detection
 * @param {Object} capabilities - Browser capabilities object
 */
export const applyGlobalGlassClasses = (capabilities) => {
    if (typeof document === 'undefined') return;

    const { documentElement } = document;

    documentElement.classList.toggle('no-backdrop-filter', !capabilities.supportsBackdropFilter);
    documentElement.classList.toggle('no-transform-3d', !capabilities.supportsTransform3D);
    documentElement.classList.toggle('reduced-motion', capabilities.reducedMotion);
    documentElement.classList.toggle('touch-device', capabilities.isTouch);
    documentElement.classList.toggle('low-performance', capabilities.performanceLevel === 'low');
    documentElement.classList.toggle('medium-performance', capabilities.performanceLevel === 'medium');
    documentElement.classList.toggle('high-performance', capabilities.performanceLevel === 'high');
};

/**
 * Create CSS custom properties for glass morphism theming
 * @param {string} intensity - Glass intensity level
 * @returns {Object} CSS custom properties
 */
export const createGlassCustomProperties = (intensity = 'medium') => {
    const intensityMap = {
        subtle: {
            '--glass-opacity': '0.05',
            '--glass-blur': '10px',
            '--glass-saturation': '120%',
            '--glass-border-opacity': '0.1',
            '--glass-shadow-opacity': '0.05'
        },
        medium: {
            '--glass-opacity': '0.1',
            '--glass-blur': '20px',
            '--glass-saturation': '150%',
            '--glass-border-opacity': '0.2',
            '--glass-shadow-opacity': '0.1'
        },
        strong: {
            '--glass-opacity': '0.15',
            '--glass-blur': '30px',
            '--glass-saturation': '180%',
            '--glass-border-opacity': '0.3',
            '--glass-shadow-opacity': '0.15'
        }
    };

    return intensityMap[intensity] || intensityMap.medium;
};

/**
 * Generate fallback styles for browsers without backdrop-filter support
 * @param {string} intensity - Glass intensity level
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {Object} Fallback CSS properties
 */
export const generateFallbackStyles = (intensity = 'medium', isDark = false) => {
    const intensityMap = {
        subtle: isDark ? 0.8 : 0.9,
        medium: isDark ? 0.7 : 0.85,
        strong: isDark ? 0.6 : 0.8
    };

    const opacity = intensityMap[intensity] || intensityMap.medium;
    const baseColor = isDark ? '0, 0, 0' : '255, 255, 255';

    return {
        background: `linear-gradient(135deg, rgba(${baseColor}, ${opacity}), rgba(${baseColor}, ${opacity - 0.1}))`,
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none'
    };
};

export default {
    generateGlassStyles,
    generateDarkGlassStyles,
    getResponsiveGlassIntensity,
    supportsBackdropFilter,
    applyGlobalGlassClasses,
    createGlassCustomProperties,
    generateFallbackStyles
};