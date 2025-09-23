import { useState, useEffect } from 'react';

/**
 * Hook for detecting and respecting user's reduced motion preferences
 * Implements accessibility compliance for motion-sensitive users
 */
export const useReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Check if matchMedia is supported
        if (typeof window === 'undefined' || !window.matchMedia) {
            setIsInitialized(true);
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Set initial value
        setPrefersReducedMotion(mediaQuery.matches);
        setIsInitialized(true);

        // Listen for changes
        const handleChange = (event) => {
            setPrefersReducedMotion(event.matches);
        };

        // Use addEventListener if available, otherwise use deprecated addListener
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            // Fallback for older browsers
            mediaQuery.addListener(handleChange);
        }

        // Cleanup
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            } else {
                // Fallback for older browsers
                mediaQuery.removeListener(handleChange);
            }
        };
    }, []);

    // Get animation settings based on reduced motion preference
    const getAnimationSettings = (defaultSettings = {}) => {
        if (prefersReducedMotion) {
            return {
                ...defaultSettings,
                duration: 0,
                delay: 0,
                transition: 'none',
                animate: false,
                enableParticles: false,
                enableTransforms: false,
                enableBlur: false,
                enableOpacityChanges: true, // Keep opacity changes as they're less problematic
                enableColorChanges: true    // Keep color changes as they're less problematic
            };
        }

        return {
            ...defaultSettings,
            animate: true,
            enableParticles: true,
            enableTransforms: true,
            enableBlur: true,
            enableOpacityChanges: true,
            enableColorChanges: true
        };
    };

    // Get CSS custom properties for reduced motion
    const getMotionCSSProperties = () => {
        if (prefersReducedMotion) {
            return {
                '--animation-duration': '0s',
                '--animation-delay': '0s',
                '--transition-duration': '0s',
                '--transform-scale': '1',
                '--transform-rotate': '0deg',
                '--transform-translate': '0px',
                '--blur-amount': '0px',
                '--particle-count': '0'
            };
        }

        return {
            '--animation-duration': '0.3s',
            '--animation-delay': '0.1s',
            '--transition-duration': '0.2s',
            '--transform-scale': 'var(--default-scale, 1.1)',
            '--transform-rotate': 'var(--default-rotate, 15deg)',
            '--transform-translate': 'var(--default-translate, 10px)',
            '--blur-amount': 'var(--default-blur, 20px)',
            '--particle-count': 'var(--default-particles, 50)'
        };
    };

    // Check if specific animation type should be enabled
    const shouldAnimate = (animationType = 'default') => {
        if (prefersReducedMotion) {
            // Allow certain safe animations even with reduced motion
            const safeAnimations = ['fade', 'opacity', 'color'];
            return safeAnimations.includes(animationType);
        }
        return true;
    };

    // Get Framer Motion animation variants that respect reduced motion
    const getMotionVariants = (variants = {}) => {
        if (prefersReducedMotion) {
            // Create static variants for reduced motion
            const reducedVariants = {};
            Object.keys(variants).forEach(key => {
                reducedVariants[key] = {
                    ...variants[key],
                    transition: { duration: 0 },
                    // Remove transforms but keep opacity and color changes
                    x: 0,
                    y: 0,
                    z: 0,
                    scale: 1,
                    rotate: 0,
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0
                };
            });
            return reducedVariants;
        }
        return variants;
    };

    // Get safe animation configuration for libraries like Framer Motion
    const getSafeAnimationConfig = (config = {}) => {
        const baseConfig = {
            duration: 0.3,
            ease: 'easeInOut',
            ...config
        };

        if (prefersReducedMotion) {
            return {
                ...baseConfig,
                duration: 0,
                ease: 'linear',
                animate: false
            };
        }

        return baseConfig;
    };

    return {
        prefersReducedMotion,
        isInitialized,
        getAnimationSettings,
        getMotionCSSProperties,
        shouldAnimate,
        getMotionVariants,
        getSafeAnimationConfig,
        // Utility methods
        isMotionSafe: !prefersReducedMotion,
        isReady: isInitialized
    };
};

export default useReducedMotion;