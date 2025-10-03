/**
 * useParallax Hook
 * Creates parallax scrolling effects
 * Optimized for 60fps performance
 */

import { useEffect, RefObject } from 'react';
import { useScroll, useTransform, useSpring, MotionValue } from 'framer-motion';

export interface ParallaxOptions {
  /**
   * Speed multiplier (negative for reverse, default: 0.5)
   * 0 = no movement, 1 = move with scroll, -1 = reverse scroll
   */
  speed?: number;

  /**
   * Smooth the parallax effect (default: true)
   */
  smooth?: boolean;

  /**
   * Offset range for parallax (default: [0, 1])
   */
  offset?: [number, number];

  /**
   * Container ref to track scroll (default: window)
   */
  container?: RefObject<HTMLElement>;
}

/**
 * Hook to create parallax scroll effect
 * Returns y transform value to apply to element
 *
 * @example
 * ```tsx
 * const y = useParallax({ speed: 0.5, smooth: true });
 *
 * <motion.div style={{ y }}>
 *   Parallax content
 * </motion.div>
 * ```
 */
export const useParallax = (options: ParallaxOptions = {}): MotionValue<number> => {
  const {
    speed = 0.5,
    smooth = true,
    offset = [0, 1],
    container
  } = options;

  const { scrollYProgress } = useScroll({
    target: container,
    offset: offset as any
  });

  // Calculate parallax range
  const range = speed * 100;
  const y = useTransform(scrollYProgress, [0, 1], [0, range]);

  // Apply smooth spring if enabled
  const smoothY = useSpring(y, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return smooth ? smoothY : y;
};

/**
 * Horizontal parallax effect
 */
export const useParallaxX = (options: ParallaxOptions = {}): MotionValue<number> => {
  const {
    speed = 0.5,
    smooth = true,
    offset = [0, 1],
    container
  } = options;

  const { scrollYProgress } = useScroll({
    target: container,
    offset: offset as any
  });

  const range = speed * 100;
  const x = useTransform(scrollYProgress, [0, 1], [0, range]);

  const smoothX = useSpring(x, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return smooth ? smoothX : x;
};

/**
 * Scale parallax effect (zoom in/out on scroll)
 */
export const useParallaxScale = (options: ParallaxOptions = {}): MotionValue<number> => {
  const {
    speed = 0.2,
    smooth = true,
    offset = [0, 1],
    container
  } = options;

  const { scrollYProgress } = useScroll({
    target: container,
    offset: offset as any
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1 + speed]);

  const smoothScale = useSpring(scale, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return smooth ? smoothScale : scale;
};

/**
 * Opacity parallax effect (fade in/out on scroll)
 */
export const useParallaxOpacity = (options: ParallaxOptions = {}): MotionValue<number> => {
  const {
    speed = 1,
    smooth = false,
    offset = [0, 1],
    container
  } = options;

  const { scrollYProgress } = useScroll({
    target: container,
    offset: offset as any
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 1 - speed]);

  const smoothOpacity = useSpring(opacity, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return smooth ? smoothOpacity : opacity;
};

/**
 * Rotation parallax effect
 */
export const useParallaxRotate = (options: ParallaxOptions = {}): MotionValue<number> => {
  const {
    speed = 45,
    smooth = true,
    offset = [0, 1],
    container
  } = options;

  const { scrollYProgress } = useScroll({
    target: container,
    offset: offset as any
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [0, speed]);

  const smoothRotate = useSpring(rotate, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return smooth ? smoothRotate : rotate;
};

/**
 * Combined parallax effects
 * Returns object with multiple transform values
 */
export const useParallaxMulti = (options: ParallaxOptions = {}) => {
  const y = useParallax(options);
  const scale = useParallaxScale({ ...options, speed: (options.speed || 0.5) * 0.4 });
  const opacity = useParallaxOpacity({ ...options, speed: (options.speed || 0.5) * 0.3 });

  return { y, scale, opacity };
};

/**
 * Mouse parallax effect (follows cursor)
 */
export const useMouseParallax = (strength: number = 20) => {
  const x = useSpring(0, { stiffness: 100, damping: 30 });
  const y = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const xValue = ((clientX - innerWidth / 2) / innerWidth) * strength;
      const yValue = ((clientY - innerHeight / 2) / innerHeight) * strength;

      x.set(xValue);
      y.set(yValue);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [strength, x, y]);

  return { x, y };
};

export default useParallax;
