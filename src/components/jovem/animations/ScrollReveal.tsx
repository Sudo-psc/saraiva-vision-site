/**
 * ScrollReveal Component
 * Wrapper component that reveals children on scroll
 * Optimized with IntersectionObserver
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useScrollReveal } from '../../../lib/animations/hooks';
import { scrollReveal } from '../../../lib/animations/variants';

export interface ScrollRevealProps {
  children: React.ReactNode;
  /**
   * Animation variant to use (default: slideUp)
   */
  variant?: 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'fadeIn' | 'scaleIn' | 'custom';
  /**
   * Custom variants (only used when variant='custom')
   */
  customVariants?: Variants;
  /**
   * Only reveal once (default: true)
   */
  once?: boolean;
  /**
   * Amount of element that must be visible (0-1, default: 0.3)
   */
  amount?: number;
  /**
   * Delay before animation (in seconds)
   */
  delay?: number;
  /**
   * Animation duration (in seconds)
   */
  duration?: number;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Container element type (default: 'div')
   */
  as?: keyof JSX.IntrinsicElements;
}

const variantPresets: Record<string, Variants> = {
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  slideDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 }
  },
  slideLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  slideRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  }
};

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  variant = 'slideUp',
  customVariants,
  once = true,
  amount = 0.3,
  delay = 0,
  duration = 0.6,
  className = '',
  as = 'div'
}) => {
  const { ref, inView } = useScrollReveal({ once, amount });

  const variants = variant === 'custom' && customVariants
    ? customVariants
    : variantPresets[variant] || variantPresets.slideUp;

  const MotionComponent = motion[as] as any;

  return (
    <MotionComponent
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </MotionComponent>
  );
};

/**
 * Staggered ScrollReveal Component
 * Reveals children one by one with stagger effect
 */
export interface StaggeredScrollRevealProps {
  children: React.ReactNode;
  /**
   * Stagger delay between children (in seconds, default: 0.1)
   */
  staggerDelay?: number;
  /**
   * Initial delay before first child (in seconds, default: 0)
   */
  initialDelay?: number;
  /**
   * Animation duration per child (in seconds, default: 0.4)
   */
  duration?: number;
  /**
   * Only reveal once (default: true)
   */
  once?: boolean;
  /**
   * Amount of element that must be visible (0-1, default: 0.3)
   */
  amount?: number;
  /**
   * Additional className for container
   */
  className?: string;
}

export const StaggeredScrollReveal: React.FC<StaggeredScrollRevealProps> = ({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  duration = 0.4,
  once = true,
  amount = 0.3,
  className = ''
}) => {
  const { ref, inView } = useScrollReveal({ once, amount });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          style={{ willChange: 'transform, opacity' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ScrollReveal;
