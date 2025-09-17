import { useEffect, useState, useRef } from 'react';

/**
 * Custom hook for Intersection Observer
 * Optimizes performance by observing element visibility
 * @param {Object} options - Intersection Observer options
 * @returns {[React.RefObject, boolean]} - [ref, isIntersecting]
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);
  const { threshold = 0.1, rootMargin = '50px' } = options;

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
        ...options
      }
    );

    const currentRef = ref.current;
    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, options]);

  return [ref, isIntersecting];
};

export default useIntersectionObserver;
