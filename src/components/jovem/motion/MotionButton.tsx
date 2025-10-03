/**
 * MotionButton Component
 * Animated button component for Jovem profile
 * Features: gradient backgrounds, hover effects, ripple animation
 */

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useReducedMotion } from '../../../lib/animations/hooks';
import { buttonHover, ripple } from '../../../lib/animations/variants';

export interface MotionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Full width button
   */
  fullWidth?: boolean;
  /**
   * Loading state
   */
  loading?: boolean;
  /**
   * Icon element
   */
  icon?: React.ReactNode;
  /**
   * Icon position
   */
  iconPosition?: 'left' | 'right';
  /**
   * Enable ripple effect
   */
  rippleEffect?: boolean;
}

export const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = 'left',
      rippleEffect = true,
      className = '',
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

    const baseStyles: React.CSSProperties = {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: size === 'lg' ? '1.125rem' : size === 'sm' ? '0.875rem' : '1rem',
      fontWeight: 600,
      padding: size === 'lg' ? '1rem 2rem' : size === 'sm' ? '0.5rem 1rem' : '0.75rem 1.5rem',
      minWidth: '44px',
      minHeight: '44px',
      borderRadius: '0.75rem',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      width: fullWidth ? '100%' : 'auto',
      border: 'none',
      outline: 'none',
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'linear-gradient(135deg, #d946ef, #8b5cf6)',
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(217, 70, 239, 0.3)'
      },
      secondary: {
        background: 'linear-gradient(135deg, #8b5cf6, #10b981)',
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#d946ef',
        border: '2px solid #d946ef',
        backdropFilter: 'blur(10px)'
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#1f2937'
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (rippleEffect && !prefersReducedMotion) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setRipples(prev => [...prev, { x, y, id }]);
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== id));
        }, 600);
      }

      onClick?.(e);
    };

    const combinedStyles = {
      ...baseStyles,
      ...variantStyles[variant]
    };

    if (prefersReducedMotion || disabled || loading) {
      return (
        <button
          ref={ref}
          style={combinedStyles}
          className={`motion-button motion-button-${variant} ${className}`}
          disabled={disabled || loading}
          onClick={handleClick}
          {...props}
        >
          {loading && <span aria-hidden="true">⏳</span>}
          {!loading && icon && iconPosition === 'left' && (
            <span aria-hidden="true">{icon}</span>
          )}
          {children}
          {!loading && icon && iconPosition === 'right' && (
            <span aria-hidden="true">{icon}</span>
          )}
        </button>
      );
    }

    return (
      <motion.button
        ref={ref}
        style={{ ...combinedStyles, willChange: 'transform' }}
        className={`motion-button motion-button-${variant} ${className}`}
        disabled={disabled || loading}
        onClick={handleClick}
        variants={buttonHover}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        {...props}
      >
        {loading && <span aria-hidden="true">⏳</span>}
        {!loading && icon && iconPosition === 'left' && (
          <span aria-hidden="true">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span aria-hidden="true">{icon}</span>
        )}

        {/* Ripple Effect */}
        {rippleEffect && ripples.map(({ x, y, id }) => (
          <motion.span
            key={id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 0,
              height: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              pointerEvents: 'none'
            }}
            variants={ripple}
            initial="initial"
            animate="animate"
          />
        ))}
      </motion.button>
    );
  }
);

MotionButton.displayName = 'MotionButton';

export default MotionButton;
