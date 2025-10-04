import { useState, useEffect, useCallback } from 'react';
import type {
  ReducedMotionReturn,
  AnimationSettings,
  MotionCSSProperties,
  AnimationType,
} from '@/types/performance';

/**
 * Hook for detecting and respecting user's reduced motion preferences
 * Implements accessibility compliance for motion-sensitive users
 *
 * @returns Reduced motion state and animation utilities
 *
 * @example
 * ```tsx
 * const { prefersReducedMotion, shouldAnimate, getAnimationSettings } = useReducedMotion();
 *
 * const settings = getAnimationSettings({
 *   duration: 300,
 *   animate: true
 * });
 *
 * // settings.duration will be 0 if user prefers reduced motion
 * ```
 */
export const useReducedMotion = (): ReducedMotionReturn => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

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
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Use addEventListener if available, otherwise use deprecated addListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      // @ts-ignore - deprecated but needed for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        // @ts-ignore - deprecated but needed for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Get animation settings based on reduced motion preference
  const getAnimationSettings = useCallback(
    (defaultSettings: AnimationSettings = {}): AnimationSettings => {
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
          enableColorChanges: true, // Keep color changes as they're less problematic
        };
      }

      return {
        ...defaultSettings,
        animate: true,
        enableParticles: true,
        enableTransforms: true,
        enableBlur: true,
        enableOpacityChanges: true,
        enableColorChanges: true,
      };
    },
    [prefersReducedMotion]
  );

  // Get CSS custom properties for reduced motion
  const getMotionCSSProperties = useCallback((): MotionCSSProperties => {
    if (prefersReducedMotion) {
      return {
        '--animation-duration': '0s',
        '--animation-delay': '0s',
        '--transition-duration': '0s',
        '--transform-scale': '1',
        '--transform-rotate': '0deg',
        '--transform-translate': '0px',
        '--blur-amount': '0px',
        '--particle-count': '0',
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
      '--particle-count': 'var(--default-particles, 50)',
    };
  }, [prefersReducedMotion]);

  // Check if specific animation type should be enabled
  const shouldAnimate = useCallback(
    (animationType: AnimationType = 'default'): boolean => {
      if (prefersReducedMotion) {
        // Allow certain safe animations even with reduced motion
        const safeAnimations: AnimationType[] = ['fade', 'opacity', 'color'];
        return safeAnimations.includes(animationType);
      }
      return true;
    },
    [prefersReducedMotion]
  );

  // Get Framer Motion animation variants that respect reduced motion
  const getMotionVariants = useCallback(
    (variants: Record<string, any> = {}): Record<string, any> => {
      if (prefersReducedMotion) {
        // Create static variants for reduced motion
        const reducedVariants: Record<string, any> = {};
        Object.keys(variants).forEach((key) => {
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
            rotateZ: 0,
          };
        });
        return reducedVariants;
      }
      return variants;
    },
    [prefersReducedMotion]
  );

  // Get safe animation configuration for libraries like Framer Motion
  const getSafeAnimationConfig = useCallback(
    (config: Record<string, any> = {}): Record<string, any> => {
      const baseConfig = {
        duration: 0.3,
        ease: 'easeInOut',
        ...config,
      };

      if (prefersReducedMotion) {
        return {
          ...baseConfig,
          duration: 0,
          ease: 'linear',
          animate: false,
        };
      }

      return baseConfig;
    },
    [prefersReducedMotion]
  );

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
    isReady: isInitialized,
  };
};

export default useReducedMotion;
