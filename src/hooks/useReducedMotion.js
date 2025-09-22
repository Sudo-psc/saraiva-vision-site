import { useState, useEffect } from 'react';

/**
 * Hook to detect and respect user's reduced motion preferences
 * Implements accessibility requirement 6.3
 */
export const useReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        // Check initial preference
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        // Listen for changes
        const handleChange = (event) => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    // Get animation settings based on preference
    const getAnimationSettings = (defaultSettings = {}) => {
        if (prefersReducedMotion) {
            return {
                ...defaultSettings,
                duration: 0,
                delay: 0,
                transition: 'none',
                enableAnimations: false,
                enableBeams: false,
                enable3D: false,
                animationDuration: 0
            };
        }
        return defaultSettings;
    };

    // Safe animation wrapper
    const withReducedMotion = (animationConfig) => {
        if (prefersReducedMotion) {
            return {
                initial: animationConfig.animate || animationConfig.initial,
                animate: animationConfig.animate || animationConfig.initial,
                transition: { duration: 0 }
            };
        }
        return animationConfig;
    };

    return {
        prefersReducedMotion,
        getAnimationSettings,
        withReducedMotion
    };
};

export default useReducedMotion;