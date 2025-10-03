/**
 * useScrollReveal Hook
 * Reveals elements when they enter the viewport
 * Optimized for performance with IntersectionObserver
 */

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

export interface ScrollRevealOptions {
  /**
   * Only reveal once (default: true)
   */
  once?: boolean;

  /**
   * Amount of element that must be visible (0-1, default: 0.3)
   */
  amount?: number | 'some' | 'all';

  /**
   * Margin around viewport for early/late triggering (default: '0px')
   */
  margin?: string;
}

/**
 * Hook to detect when element enters viewport
 * Returns ref to attach to element and inView state
 *
 * @example
 * ```tsx
 * const { ref, inView } = useScrollReveal({ once: true, amount: 0.5 });
 *
 * <motion.div
 *   ref={ref}
 *   initial="hidden"
 *   animate={inView ? "visible" : "hidden"}
 *   variants={scrollReveal}
 * >
 *   Content revealed on scroll
 * </motion.div>
 * ```
 */
export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const {
    once = true,
    amount = 0.3,
    margin = '0px'
  } = options;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once, amount, margin });

  return { ref, inView: isInView };
};

/**
 * Advanced scroll reveal with callback
 */
export const useScrollRevealWithCallback = (
  callback: (inView: boolean) => void,
  options: ScrollRevealOptions = {}
) => {
  const { ref, inView } = useScrollReveal(options);

  useEffect(() => {
    callback(inView);
  }, [inView, callback]);

  return { ref, inView };
};

/**
 * Staggered scroll reveal for multiple items
 * Returns array of refs and inView states
 */
export const useStaggeredScrollReveal = (
  count: number,
  options: ScrollRevealOptions = {}
) => {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [inViewStates, setInViewStates] = useState<boolean[]>(
    new Array(count).fill(false)
  );

  useEffect(() => {
    const observers = refs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInViewStates(prev => {
              const next = [...prev];
              next[index] = true;
              return next;
            });

            if (options.once) {
              observer.disconnect();
            }
          } else if (!options.once) {
            setInViewStates(prev => {
              const next = [...prev];
              next[index] = false;
              return next;
            });
          }
        },
        {
          threshold: typeof options.amount === 'number' ? options.amount : 0.3,
          rootMargin: options.margin || '0px'
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, [count, options.once, options.amount, options.margin]);

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el;
  };

  return { refs: refs.current, inViewStates, setRef };
};

export default useScrollReveal;
