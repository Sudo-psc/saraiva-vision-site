import { useEffect, useCallback } from 'react';

/**
 * Custom hook for performance monitoring
 * Tracks Core Web Vitals and component performance
 */
export const usePerformanceMonitor = (componentName = 'Unknown') => {
  
  // Track component mount time
  const trackComponentMount = useCallback(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Only log slow components in development
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(`${componentName} took ${duration.toFixed(2)}ms to mount`);
      }
    };
  }, [componentName]);

  // Track Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    // Track LCP (Largest Contentful Paint)
    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime;
          if (lcp > 2500) { // LCP threshold
            console.warn(`LCP is slow: ${lcp.toFixed(2)}ms`);
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Observer not supported
    }

    // Track memory usage (Chrome only)
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = performance.memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
        
        if (usedMB > 100) { // 100MB threshold
          console.warn(`High memory usage: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB`);
        }
      };

      const memoryInterval = setInterval(checkMemory, 30000); // Check every 30s
      
      return () => {
        observer.disconnect();
        clearInterval(memoryInterval);
      };
    }

    return () => observer.disconnect();
  }, []);

  // Track user interactions
  const trackInteraction = useCallback((action, element = componentName) => {
    if (process.env.NODE_ENV === 'development') {
      performance.mark(`${element}-${action}-start`);
      
      requestAnimationFrame(() => {
        performance.mark(`${element}-${action}-end`);
        performance.measure(
          `${element}-${action}`,
          `${element}-${action}-start`,
          `${element}-${action}-end`
        );
        
        const measure = performance.getEntriesByName(`${element}-${action}`)[0];
        if (measure && measure.duration > 16.67) { // 60fps threshold
          console.warn(`${element} ${action} took ${measure.duration.toFixed(2)}ms`);
        }
      });
    }
  }, [componentName]);

  return {
    trackComponentMount,
    trackInteraction
  };
};

export default usePerformanceMonitor;