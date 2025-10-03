/**
 * Framer Motion Transition Configurations
 * Reusable transition configurations for Jovem profile
 * Saraiva Vision - Optimized for 60fps performance
 */

import { Transition } from 'framer-motion';

/**
 * Spring Transitions (Best for natural feel)
 */
export const spring: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30
};

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 20
};

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 35
};

/**
 * Tween Transitions (Best for controlled timing)
 */
export const fast: Transition = {
  duration: 0.2,
  ease: 'easeOut'
};

export const normal: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1] // Custom cubic-bezier
};

export const slow: Transition = {
  duration: 0.5,
  ease: [0.25, 0.1, 0.25, 1]
};

export const verySlow: Transition = {
  duration: 0.8,
  ease: [0.25, 0.1, 0.25, 1]
};

/**
 * Easing Functions
 */
export const easing = {
  // Standard easings
  linear: [0, 0, 1, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],

  // Custom easings
  default: [0.25, 0.1, 0.25, 1],
  smooth: [0.16, 1, 0.3, 1],
  snappy: [0.5, 0, 0.25, 1],
  bounce: [0.68, -0.55, 0.27, 1.55],

  // Material Design easings
  standard: [0.4, 0, 0.2, 1],
  decelerate: [0, 0, 0.2, 1],
  accelerate: [0.4, 0, 1, 1],

  // Expressive easings
  anticipate: [0.5, -0.2, 0.3, 1.2],
  overshoot: [0.2, 0.95, 0.45, 1.1]
} as const;

/**
 * Page Transition (Optimized for route changes)
 */
export const pageTransition: Transition = {
  duration: 0.4,
  ease: easing.default
};

/**
 * Modal/Dialog Transition
 */
export const modalTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30
};

/**
 * Stagger Timing
 */
export const stagger = {
  fast: {
    staggerChildren: 0.05,
    delayChildren: 0.1
  },
  normal: {
    staggerChildren: 0.1,
    delayChildren: 0.2
  },
  slow: {
    staggerChildren: 0.15,
    delayChildren: 0.3
  }
} as const;

/**
 * Hover Transition (Optimized for interactive elements)
 */
export const hoverTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25
};

/**
 * Card Flip Transition
 */
export const flipTransition: Transition = {
  duration: 0.6,
  ease: easing.default
};

/**
 * Smooth Scroll Transition
 */
export const smoothScroll: Transition = {
  duration: 0.8,
  ease: easing.smooth
};

/**
 * Loading/Shimmer Transition
 */
export const shimmerTransition: Transition = {
  duration: 1.5,
  ease: 'linear',
  repeat: Infinity
};

/**
 * Pulse Transition (for attention-grabbing elements)
 */
export const pulseTransition: Transition = {
  duration: 2,
  ease: 'easeInOut',
  repeat: Infinity
};

/**
 * Float Transition (for floating animations)
 */
export const floatTransition: Transition = {
  duration: 2.5,
  ease: 'easeInOut',
  repeat: Infinity
};

/**
 * Reduced Motion Fallback
 * Use instant transitions when user prefers reduced motion
 */
export const reducedMotion: Transition = {
  duration: 0,
  ease: 'linear'
};

/**
 * GPU-Accelerated Transition
 * Forces hardware acceleration for transform and opacity
 */
export const gpuAccelerated: Transition = {
  duration: 0.3,
  ease: easing.default,
  // @ts-ignore - Custom property for GPU acceleration hint
  willChange: 'transform, opacity'
};

/**
 * Scroll-Triggered Transition
 */
export const scrollTrigger: Transition = {
  duration: 0.6,
  ease: easing.smooth
};

/**
 * Entrance Transition (For elements entering viewport)
 */
export const entrance: Transition = {
  duration: 0.5,
  ease: easing.decelerate
};

/**
 * Exit Transition (For elements leaving viewport)
 */
export const exit: Transition = {
  duration: 0.3,
  ease: easing.accelerate
};

/**
 * Number Counter Transition
 */
export const counterTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 15
};

/**
 * Accordion Transition
 */
export const accordionTransition: Transition = {
  duration: 0.3,
  ease: [0.04, 0.62, 0.23, 0.98]
};

/**
 * Ripple Transition
 */
export const rippleTransition: Transition = {
  duration: 0.6,
  ease: 'easeOut'
};

/**
 * Carousel/Slider Transition
 */
export const carouselTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8
};

/**
 * Helper function to get appropriate transition based on reduced motion preference
 */
export const getTransition = (
  transition: Transition,
  prefersReducedMotion: boolean = false
): Transition => {
  return prefersReducedMotion ? reducedMotion : transition;
};

/**
 * Helper function to create custom stagger timing
 */
export const createStagger = (
  staggerChildren: number = 0.1,
  delayChildren: number = 0
): Transition => ({
  staggerChildren,
  delayChildren
});

export default {
  spring,
  springBouncy,
  springSoft,
  springSnappy,
  fast,
  normal,
  slow,
  verySlow,
  easing,
  pageTransition,
  modalTransition,
  stagger,
  hoverTransition,
  flipTransition,
  smoothScroll,
  shimmerTransition,
  pulseTransition,
  floatTransition,
  reducedMotion,
  gpuAccelerated,
  scrollTrigger,
  entrance,
  exit,
  counterTransition,
  accordionTransition,
  rippleTransition,
  carouselTransition,
  getTransition,
  createStagger
};
