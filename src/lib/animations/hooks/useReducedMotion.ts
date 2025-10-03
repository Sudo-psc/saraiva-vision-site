/**
 * useReducedMotion Hook
 * Detects user's motion preferences for accessibility
 * Respects prefers-reduced-motion media query
 */

import { useEffect, useState } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 * Returns boolean indicating reduced motion preference
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * <motion.div
 *   animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1] }}
 * >
 *   Respects motion preferences
 * </motion.div>
 * ```
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is defined (SSR safety)
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Create listener for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Add event listener (modern browsers)
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
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
};

/**
 * Hook to get animation duration based on reduced motion preference
 * Returns 0 if reduced motion is preferred, otherwise returns provided duration
 */
export const useAnimationDuration = (duration: number = 0.3): number => {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 0 : duration;
};

/**
 * Hook to get appropriate transition based on reduced motion preference
 */
export const useAnimationTransition = <T extends object>(
  normalTransition: T,
  reducedTransition?: T
): T => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return reducedTransition || ({ duration: 0 } as T);
  }

  return normalTransition;
};

/**
 * Hook to conditionally apply animation variants
 * Returns variants object or empty object if reduced motion is preferred
 */
export const useAnimationVariants = <T extends object>(
  variants: T,
  fallback?: T
): T | object => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return fallback || {};
  }

  return variants;
};

/**
 * Detect if device supports hover (not touch-only)
 */
export const useHoverSupport = (): boolean => {
  const [supportsHover, setSupportsHover] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setSupportsHover(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setSupportsHover(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return supportsHover;
};

/**
 * Combined hook for motion and hover preferences
 */
export const useMotionPreferences = () => {
  const prefersReducedMotion = useReducedMotion();
  const supportsHover = useHoverSupport();

  return {
    prefersReducedMotion,
    supportsHover,
    shouldAnimate: !prefersReducedMotion,
    shouldHover: supportsHover && !prefersReducedMotion
  };
};

export default useReducedMotion;
