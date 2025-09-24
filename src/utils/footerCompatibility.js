/**
 * Enhanced Footer Cross-Browser Compatibility
 * Provides polyfills and fallbacks for enhanced footer features
 * Requirements: 1.4, 2.4, 3.4, 5.5
 */

/**
 * Browser capability detection
 */
export const browserCapabilities = {
    // Backdrop filter support
    supportsBackdropFilter: (() => {
        if (typeof window === 'undefined') return false;

        const testElement = document.createElement('div');
        testElement.style.backdropFilter = 'blur(1px)';
        testElement.style.webkitBackdropFilter = 'blur(1px)';

        return testElement.style.backdropFilter !== '' || testElement.style.webkitBackdropFilter !== '';
    })(),

    // CSS 3D transforms support
    supports3DTransforms: (() => {
        if (typeof window === 'undefined') return false;

        const testElement = document.createElement('div');
        testElement.style.transform = 'translateZ(0)';
        testElement.style.webkitTransform = 'translateZ(0)';

        return testElement.style.transform !== '' || testElement.style.webkitTransform !== '';
    })(),

    // CSS custom properties support
    supportsCustomProperties: (() => {
        if (typeof window === 'undefined') return false;

        return window.CSS && window.CSS.supports && window.CSS.supports('--test', 'test');
    })(),

    // Intersection Observer support
    supportsIntersectionObserver: (() => {
        if (typeof window === 'undefined') return false;

        return 'IntersectionObserver' in window;
    })(),

    // ResizeObserver support
    supportsResizeObserver: (() => {
        if (typeof window === 'undefined') return false;

        return 'ResizeObserver' in window;
    })(),

    // CSS Grid support
    supportsGrid: (() => {
        if (typeof window === 'undefined') return false;

        return window.CSS && window.CSS.supports && window.CSS.supports('display', 'grid');
    })(),

    // Flexbox support
    supportsFlexbox: (() => {
        if (typeof window === 'undefined') return false;

        return window.CSS && window.CSS.supports && window.CSS.supports('display', 'flex');
    })(),

    // WebGL support
    supportsWebGL: (() => {
        if (typeof window === 'undefined') return false;

        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
        } catch (e) {
            return false;
        }
    })(),

    // Canvas support
    supportsCanvas: (() => {
        if (typeof window === 'undefined') return false;

        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    })(),

    // Touch support
    supportsTouch: (() => {
        if (typeof window === 'undefined') return false;

        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    })(),

    // Reduced motion preference
    prefersReducedMotion: (() => {
        if (typeof window === 'undefined') return false;

        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    })()
};

/**
 * Browser-specific prefixes and fallbacks
 */
export const browserPrefixes = {
    transform: ['transform', 'webkitTransform', 'mozTransform', 'msTransform'],
    backdropFilter: ['backdropFilter', 'webkitBackdropFilter'],
    filter: ['filter', 'webkitFilter'],
    perspective: ['perspective', 'webkitPerspective', 'mozPerspective'],
    transformStyle: ['transformStyle', 'webkitTransformStyle', 'mozTransformStyle'],
    backfaceVisibility: ['backfaceVisibility', 'webkitBackfaceVisibility', 'mozBackfaceVisibility']
};

/**
 * Apply vendor prefixes to CSS properties
 */
export const applyVendorPrefixes = (element, property, value) => {
    if (!element || !property || value === undefined) return;

    const prefixes = browserPrefixes[property] || [property];

    prefixes.forEach(prefixedProperty => {
        try {
            element.style[prefixedProperty] = value;
        } catch (e) {
            // Silently ignore unsupported properties
        }
    });
};

/**
 * Backdrop filter polyfill for unsupported browsers
 */
export const backdropFilterPolyfill = {
    isSupported: browserCapabilities.supportsBackdropFilter,

    apply: (element, blurValue = '20px', fallbackBackground = 'rgba(255, 255, 255, 0.1)') => {
        if (!element) return;

        if (backdropFilterPolyfill.isSupported) {
            applyVendorPrefixes(element, 'backdropFilter', `blur(${blurValue})`);
        } else {
            // Fallback: Use semi-transparent background
            element.style.background = fallbackBackground;
            element.classList.add('no-backdrop-filter');

            // Add subtle box shadow for depth
            element.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        }
    },

    remove: (element) => {
        if (!element) return;

        applyVendorPrefixes(element, 'backdropFilter', 'none');
        element.classList.remove('no-backdrop-filter');
    }
};

/**
 * 3D transforms polyfill for unsupported browsers
 */
export const transforms3DPolyfill = {
    isSupported: browserCapabilities.supports3DTransforms,

    apply: (element, transforms = {}) => {
        if (!element) return;

        if (transforms3DPolyfill.isSupported) {
            const transformString = Object.entries(transforms)
                .map(([key, value]) => `${key}(${value})`)
                .join(' ');

            applyVendorPrefixes(element, 'transform', transformString);
        } else {
            // Fallback: Use 2D transforms only
            const fallbackTransforms = {};

            if (transforms.translateX) fallbackTransforms.translateX = transforms.translateX;
            if (transforms.translateY) fallbackTransforms.translateY = transforms.translateY;
            if (transforms.scale) fallbackTransforms.scale = transforms.scale;
            if (transforms.rotate) fallbackTransforms.rotate = transforms.rotate;

            const fallbackString = Object.entries(fallbackTransforms)
                .map(([key, value]) => `${key}(${value})`)
                .join(' ');

            applyVendorPrefixes(element, 'transform', fallbackString);
            element.classList.add('no-3d-transforms');
        }
    }
};

/**
 * Intersection Observer polyfill
 */
export const intersectionObserverPolyfill = {
    isSupported: browserCapabilities.supportsIntersectionObserver,

    create: (callback, options = {}) => {
        if (intersectionObserverPolyfill.isSupported) {
            return new IntersectionObserver(callback, options);
        } else {
            // Fallback: Use scroll event listener
            return {
                observe: (element) => {
                    const checkVisibility = () => {
                        const rect = element.getBoundingClientRect();
                        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

                        callback([{
                            target: element,
                            isIntersecting: isVisible,
                            intersectionRatio: isVisible ? 1 : 0
                        }]);
                    };

                    // Initial check
                    checkVisibility();

                    // Listen for scroll events
                    window.addEventListener('scroll', checkVisibility, { passive: true });
                    window.addEventListener('resize', checkVisibility, { passive: true });

                    // Store cleanup function
                    element._intersectionCleanup = () => {
                        window.removeEventListener('scroll', checkVisibility);
                        window.removeEventListener('resize', checkVisibility);
                    };
                },

                unobserve: (element) => {
                    if (element._intersectionCleanup) {
                        element._intersectionCleanup();
                        delete element._intersectionCleanup;
                    }
                },

                disconnect: () => {
                    // Cleanup handled per element
                }
            };
        }
    }
};

/**
 * CSS Custom Properties polyfill
 */
export const customPropertiesPolyfill = {
    isSupported: browserCapabilities.supportsCustomProperties,

    apply: (element, properties = {}) => {
        if (!element) return;

        if (customPropertiesPolyfill.isSupported) {
            Object.entries(properties).forEach(([property, value]) => {
                element.style.setProperty(property, value);
            });
        } else {
            // Fallback: Apply values directly to CSS properties
            const fallbackMap = {
                '--footer-glass-opacity': 'opacity',
                '--footer-glass-blur': 'filter',
                '--footer-social-scale': 'transform',
                '--footer-animation-duration': 'transitionDuration'
            };

            Object.entries(properties).forEach(([property, value]) => {
                const fallbackProperty = fallbackMap[property];
                if (fallbackProperty) {
                    element.style[fallbackProperty] = value;
                }
            });
        }
    }
};

/**
 * Canvas/WebGL fallback for beam animations
 */
export const canvasPolyfill = {
    supportsWebGL: browserCapabilities.supportsWebGL,
    supportsCanvas: browserCapabilities.supportsCanvas,

    createContext: (canvas) => {
        if (!canvas) return null;

        if (canvasPolyfill.supportsWebGL) {
            try {
                return canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            } catch (e) {
                // Fall through to 2D context
            }
        }

        if (canvasPolyfill.supportsCanvas) {
            return canvas.getContext('2d');
        }

        return null;
    },

    getFallbackRenderer: () => {
        // Return CSS-based animation fallback
        return {
            render: () => {
                // Use CSS animations instead of canvas
            },
            destroy: () => {
                // Cleanup CSS animations
            }
        };
    }
};

/**
 * Touch event polyfill for desktop hover simulation
 */
export const touchEventPolyfill = {
    isTouch: browserCapabilities.supportsTouch,

    addHoverSupport: (element, onHover, onLeave) => {
        if (!element) return;

        if (touchEventPolyfill.isTouch) {
            // Touch device: use touch events
            element.addEventListener('touchstart', onHover, { passive: true });
            element.addEventListener('touchend', onLeave, { passive: true });
            element.addEventListener('touchcancel', onLeave, { passive: true });
        } else {
            // Desktop: use mouse events
            element.addEventListener('mouseenter', onHover);
            element.addEventListener('mouseleave', onLeave);
        }

        return () => {
            if (touchEventPolyfill.isTouch) {
                element.removeEventListener('touchstart', onHover);
                element.removeEventListener('touchend', onLeave);
                element.removeEventListener('touchcancel', onLeave);
            } else {
                element.removeEventListener('mouseenter', onHover);
                element.removeEventListener('mouseleave', onLeave);
            }
        };
    }
};

/**
 * Performance optimization for older browsers
 */
export const performancePolyfill = {
    requestAnimationFrame: (() => {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            ((callback) => setTimeout(callback, 1000 / 60));
    })(),

    cancelAnimationFrame: (() => {
        return window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.oCancelAnimationFrame ||
            window.msCancelAnimationFrame ||
            clearTimeout;
    })(),

    now: (() => {
        return (window.performance && window.performance.now) ?
            () => window.performance.now() :
            () => Date.now();
    })()
};

/**
 * Initialize all polyfills and compatibility fixes
 */
export const initializeCompatibility = () => {
    // Add browser capability classes to document
    const docElement = document.documentElement;

    Object.entries(browserCapabilities).forEach(([capability, isSupported]) => {
        const className = isSupported ? `supports-${capability.replace(/([A-Z])/g, '-$1').toLowerCase()}` :
            `no-${capability.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        docElement.classList.add(className);
    });

    // Add touch class
    if (browserCapabilities.supportsTouch) {
        docElement.classList.add('touch-device');
    } else {
        docElement.classList.add('no-touch');
    }

    // Add reduced motion class
    if (browserCapabilities.prefersReducedMotion) {
        docElement.classList.add('reduced-motion');
    }

    // Initialize performance polyfills
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = performancePolyfill.requestAnimationFrame;
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = performancePolyfill.cancelAnimationFrame;
    }

    // Log compatibility status in development
    if (process.env.NODE_ENV === 'development') {
        console.group('Enhanced Footer Compatibility');
        console.table(browserCapabilities);
        console.groupEnd();
    }
};

/**
 * Get compatibility-aware configuration
 */
export const getCompatibilityConfig = () => {
    return {
        capabilities: browserCapabilities,
        shouldUseGlass: browserCapabilities.supportsBackdropFilter,
        shouldUse3D: browserCapabilities.supports3DTransforms,
        shouldUseCanvas: browserCapabilities.supportsCanvas || browserCapabilities.supportsWebGL,
        shouldUseIntersectionObserver: browserCapabilities.supportsIntersectionObserver,
        shouldReduceMotion: browserCapabilities.prefersReducedMotion,
        isTouch: browserCapabilities.supportsTouch,

        // Recommended settings based on capabilities
        recommendedSettings: {
            glassIntensity: browserCapabilities.supportsBackdropFilter ? 'medium' : 'none',
            animationComplexity: browserCapabilities.supports3DTransforms ? 'high' : 'low',
            beamRenderer: browserCapabilities.supportsWebGL ? 'webgl' :
                browserCapabilities.supportsCanvas ? 'canvas' : 'css',
            performanceLevel: (
                browserCapabilities.supportsBackdropFilter &&
                browserCapabilities.supports3DTransforms &&
                browserCapabilities.supportsWebGL
            ) ? 'high' : 'medium'
        }
    };
};

/**
 * Apply compatibility fixes to enhanced footer
 */
export const applyCompatibilityFixes = (footerElement) => {
    if (!footerElement) return;

    const config = getCompatibilityConfig();

    // Apply backdrop filter polyfill
    if (!config.shouldUseGlass) {
        footerElement.classList.add('no-backdrop-filter');
    }

    // Apply 3D transform polyfill
    if (!config.shouldUse3D) {
        footerElement.classList.add('no-3d-transforms');
    }

    // Apply performance class
    footerElement.classList.add(`performance-${config.recommendedSettings.performanceLevel}`);

    // Apply touch class
    if (config.isTouch) {
        footerElement.classList.add('touch-device');
    }

    // Apply reduced motion class
    if (config.shouldReduceMotion) {
        footerElement.classList.add('reduced-motion');
    }
};

export default {
    browserCapabilities,
    browserPrefixes,
    applyVendorPrefixes,
    backdropFilterPolyfill,
    transforms3DPolyfill,
    intersectionObserverPolyfill,
    customPropertiesPolyfill,
    canvasPolyfill,
    touchEventPolyfill,
    performancePolyfill,
    initializeCompatibility,
    getCompatibilityConfig,
    applyCompatibilityFixes
};