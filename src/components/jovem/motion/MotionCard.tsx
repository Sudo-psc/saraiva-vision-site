/**
 * MotionCard Component
 * Animated card component for Jovem profile
 * Features: hover effects, tap feedback, entrance animations
 */

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { useReducedMotion } from '../../../lib/animations/hooks';
import { cardHover } from '../../../lib/animations/variants';

export interface MotionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Enable hover animation (default: true)
   */
  hover?: boolean;
  /**
   * Enable tap feedback (default: false)
   */
  interactive?: boolean;
  /**
   * Card variant style
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  /**
   * Entrance animation delay (in seconds)
   */
  delay?: number;
  /**
   * Custom variants
   */
  customVariants?: Variants;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Click handler
   */
  onClick?: () => void;
}

export const MotionCard: React.FC<MotionCardProps> = ({
  hover = true,
  interactive = false,
  variant = 'default',
  delay = 0,
  customVariants,
  className = '',
  onClick,
  children,
  ...props
}) => {
  const prefersReducedMotion = useReducedMotion();

  const baseStyles = {
    borderRadius: '1.5rem',
    padding: '2rem',
    position: 'relative' as const,
    overflow: 'hidden' as const
  };

  const variantStyles = {
    default: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      boxShadow: '0 8px 24px rgba(217, 70, 239, 0.15)'
    },
    elevated: {
      background: 'linear-gradient(135deg, rgba(217, 70, 239, 0.05), rgba(139, 92, 246, 0.05))',
      boxShadow: '0 12px 32px rgba(217, 70, 239, 0.2)',
      border: '1px solid rgba(217, 70, 239, 0.2)'
    },
    outlined: {
      backgroundColor: 'transparent',
      border: '2px solid rgba(217, 70, 239, 0.5)',
      backdropFilter: 'blur(5px)'
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(217, 70, 239, 0.3)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }
  };

  const entranceVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  if (prefersReducedMotion) {
    return (
      <div
        className={`motion-card ${className}`}
        style={{
          ...baseStyles,
          ...variantStyles[variant],
          cursor: interactive ? 'pointer' : 'default'
        }}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={`motion-card ${className}`}
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        cursor: interactive ? 'pointer' : 'default',
        willChange: hover || interactive ? 'transform' : 'auto'
      }}
      variants={customVariants || entranceVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      whileTap={interactive ? "tap" : undefined}
      onClick={onClick}
      {...(hover && !customVariants ? { ...cardHover } : {})}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * MotionCardHeader Component
 */
export interface MotionCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const MotionCardHeader: React.FC<MotionCardHeaderProps> = ({
  children,
  className = ''
}) => {
  return (
    <div
      className={`motion-card-header ${className}`}
      style={{
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(217, 70, 239, 0.2)'
      }}
    >
      {children}
    </div>
  );
};

/**
 * MotionCardContent Component
 */
export interface MotionCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MotionCardContent: React.FC<MotionCardContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`motion-card-content ${className}`}>
      {children}
    </div>
  );
};

/**
 * MotionCardFooter Component
 */
export interface MotionCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const MotionCardFooter: React.FC<MotionCardFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div
      className={`motion-card-footer ${className}`}
      style={{
        marginTop: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(217, 70, 239, 0.2)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );
};

export default MotionCard;
