import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  PerformanceMonitorOptions,
  PerformanceMonitorReturn,
  PerformanceLevel,
  OptimizedSettings,
} from '@/types/performance';

/**
 * Performance monitoring hook that tracks frame rates and adjusts effects
 * Implements graceful degradation based on device capabilities
 *
 * @param options - Configuration for performance monitoring
 * @returns Performance monitoring state and controls
 *
 * @example
 * ```tsx
 * const monitor = usePerformanceMonitor({
 *   targetFPS: 60,
 *   enableAutoAdjustment: true
 * });
 *
 * if (monitor.performanceLevel === 'low') {
 *   // Disable expensive effects
 * }
 * ```
 */
export const usePerformanceMonitor = (
  options: PerformanceMonitorOptions = {}
): PerformanceMonitorReturn => {
  const {
    targetFPS = 60,
    degradationThreshold = 45,
    criticalThreshold = 30,
    sampleSize = 60,
    enableAutoAdjustment = true,
  } = options;

  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>('high');
  const [currentFPS, setCurrentFPS] = useState<number>(60);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);

  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number | null>(null);
  const performanceObserverRef = useRef<PerformanceObserver | null>(null);

  // Calculate FPS from frame times
  const calculateFPS = useCallback((frameTimes: number[]): number => {
    if (frameTimes.length < 2) return 60;

    const totalTime = frameTimes[frameTimes.length - 1] - frameTimes[0];
    const frameCount = frameTimes.length - 1;

    return Math.round(1000 / (totalTime / frameCount));
  }, []);

  // Determine performance level based on FPS
  const getPerformanceLevel = useCallback(
    (fps: number): PerformanceLevel => {
      if (fps >= degradationThreshold) return 'high';
      if (fps >= criticalThreshold) return 'medium';
      return 'low';
    },
    [degradationThreshold, criticalThreshold]
  );

  // Frame monitoring loop
  const monitorFrame = useCallback(() => {
    const currentTime = performance.now();

    frameTimesRef.current.push(currentTime);

    // Keep only recent samples
    if (frameTimesRef.current.length > sampleSize) {
      frameTimesRef.current.shift();
    }

    // Calculate and update FPS every few frames
    if (frameTimesRef.current.length >= 10) {
      const fps = calculateFPS(frameTimesRef.current);
      setCurrentFPS(fps);

      if (enableAutoAdjustment) {
        const newLevel = getPerformanceLevel(fps);
        if (newLevel !== performanceLevel) {
          setPerformanceLevel(newLevel);
        }
      }
    }

    lastFrameTimeRef.current = currentTime;

    if (isMonitoring) {
      animationFrameRef.current = requestAnimationFrame(monitorFrame);
    }
  }, [
    isMonitoring,
    performanceLevel,
    calculateFPS,
    getPerformanceLevel,
    enableAutoAdjustment,
    sampleSize,
  ]);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (!isMonitoring) {
      setIsMonitoring(true);
      frameTimesRef.current = [];
      lastFrameTimeRef.current = performance.now();
    }
  }, [isMonitoring]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Manual performance level override
  const setManualPerformanceLevel = useCallback((level: PerformanceLevel) => {
    setPerformanceLevel(level);
  }, []);

  // Get performance-adjusted settings
  const getOptimizedSettings = useCallback((): OptimizedSettings => {
    switch (performanceLevel) {
      case 'high':
        return {
          glassBlur: 20,
          glassOpacity: 0.1,
          beamParticleCount: 50,
          animationDuration: 300,
          enableComplexAnimations: true,
          enable3DTransforms: true,
          enableBackdropFilter: true,
        };
      case 'medium':
        return {
          glassBlur: 10,
          glassOpacity: 0.05,
          beamParticleCount: 25,
          animationDuration: 200,
          enableComplexAnimations: true,
          enable3DTransforms: true,
          enableBackdropFilter: true,
        };
      case 'low':
        return {
          glassBlur: 5,
          glassOpacity: 0.02,
          beamParticleCount: 10,
          animationDuration: 100,
          enableComplexAnimations: false,
          enable3DTransforms: false,
          enableBackdropFilter: false,
        };
      default:
        return {
          glassBlur: 20,
          glassOpacity: 0.1,
          beamParticleCount: 50,
          animationDuration: 300,
          enableComplexAnimations: true,
          enable3DTransforms: true,
          enableBackdropFilter: true,
        };
    }
  }, [performanceLevel]);

  // Setup Performance Observer for additional metrics
  useEffect(() => {
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        performanceObserverRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();

          // Monitor long tasks that could affect performance
          entries.forEach((entry) => {
            if (entry.entryType === 'longtask' && entry.duration > 50) {
              if (process.env.NODE_ENV === 'development') {
                console.warn('Long task detected:', entry.duration + 'ms');
              }

              // Automatically degrade performance if long tasks are frequent
              if (enableAutoAdjustment && performanceLevel === 'high') {
                setPerformanceLevel('medium');
              }
            }
          });
        });

        performanceObserverRef.current.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('PerformanceObserver not supported:', error);
        }
      }
    }

    return () => {
      if (performanceObserverRef.current) {
        performanceObserverRef.current.disconnect();
        performanceObserverRef.current = null;
      }
    };
  }, [enableAutoAdjustment, performanceLevel]);

  // Start monitoring when component mounts
  useEffect(() => {
    startMonitoring();

    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  // Monitor frame rate
  useEffect(() => {
    if (isMonitoring) {
      animationFrameRef.current = requestAnimationFrame(monitorFrame);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMonitoring, monitorFrame]);

  return {
    performanceLevel,
    currentFPS,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    setManualPerformanceLevel,
    getOptimizedSettings,
    metrics: {
      targetFPS,
      currentFPS,
      performanceLevel,
      isOptimal: currentFPS >= targetFPS * 0.9,
    },
  };
};

export default usePerformanceMonitor;
