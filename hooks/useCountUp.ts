/**
 * useCountUp Hook
 * Animates numbers from start to end value with easing
 * Used for animated counters in stats dashboards
 */

import { useEffect, useRef, useState } from 'react';

export interface UseCountUpOptions {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  delay?: number;
  easingFn?: (t: number) => number;
  separator?: string;
  prefix?: string;
  suffix?: string;
  onComplete?: () => void;
  autoStart?: boolean;
}

export interface UseCountUpReturn {
  value: string;
  rawValue: number;
  isAnimating: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  update: (newEnd: number) => void;
}

/**
 * Default easing function (ease-out cubic)
 */
const defaultEasing = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Format number with separators and affixes
 */
const formatNumber = (
  value: number,
  decimals: number,
  separator: string,
  prefix: string,
  suffix: string
): string => {
  const fixed = value.toFixed(decimals);
  const parts = fixed.split('.');

  // Add thousand separators
  if (separator) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  const formatted = parts.join('.');
  return `${prefix}${formatted}${suffix}`;
};

/**
 * useCountUp Hook
 * Provides animated number counting functionality
 */
export function useCountUp(options: UseCountUpOptions): UseCountUpReturn {
  const {
    start: startValue = 0,
    end,
    duration = 2000,
    decimals = 0,
    delay = 0,
    easingFn = defaultEasing,
    separator = '',
    prefix = '',
    suffix = '',
    onComplete,
    autoStart = true,
  } = options;

  const [value, setValue] = useState<string>(
    formatNumber(startValue, decimals, separator, prefix, suffix)
  );
  const [rawValue, setRawValue] = useState<number>(startValue);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const currentStartRef = useRef<number>(startValue);
  const currentEndRef = useRef<number>(end);

  /**
   * Animation loop
   */
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
    const easedProgress = easingFn(progress);

    const currentValue =
      currentStartRef.current +
      (currentEndRef.current - currentStartRef.current) * easedProgress;

    setRawValue(currentValue);
    setValue(formatNumber(currentValue, decimals, separator, prefix, suffix));

    if (progress < 1) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      startTimeRef.current = null;
      if (onComplete) {
        onComplete();
      }
    }
  };

  /**
   * Start animation
   */
  const start = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    startTimeRef.current = null;

    if (delay > 0) {
      setTimeout(() => {
        frameRef.current = requestAnimationFrame(animate);
      }, delay);
    } else {
      frameRef.current = requestAnimationFrame(animate);
    }
  };

  /**
   * Pause animation
   */
  const pause = () => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    setIsAnimating(false);
    startTimeRef.current = null;
  };

  /**
   * Reset to start value
   */
  const reset = () => {
    pause();
    setRawValue(startValue);
    setValue(formatNumber(startValue, decimals, separator, prefix, suffix));
    currentStartRef.current = startValue;
  };

  /**
   * Update end value (for dynamic changes)
   */
  const update = (newEnd: number) => {
    currentStartRef.current = rawValue;
    currentEndRef.current = newEnd;
    start();
  };

  /**
   * Auto-start effect
   */
  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Update when end value changes
   */
  useEffect(() => {
    currentEndRef.current = end;
    if (autoStart && !isAnimating) {
      update(end);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end]);

  return {
    value,
    rawValue,
    isAnimating,
    start,
    pause,
    reset,
    update,
  };
}

/**
 * Pre-configured easing functions
 */
export const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  easeInExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    return t < 0.5
      ? Math.pow(2, 20 * t - 10) / 2
      : (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
};

export default useCountUp;
