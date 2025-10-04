/**
 * Theme-Aware Button Component
 * Saraiva Vision - Adapts to all three profiles
 */

import React from 'react';
import { useTheme, useDesignTokens } from '../ThemeProvider';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = 'left',
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { profile, reducedMotion } = useTheme();
    const tokens = useDesignTokens();

    // Base styles from design tokens
    const baseStyles: React.CSSProperties = {
      fontFamily: tokens.typography.fontFamily.body,
      fontSize: tokens.typography.fontSize.body,
      fontWeight: tokens.typography.fontWeight.medium,
      lineHeight: tokens.typography.lineHeight.normal,
      padding: tokens.spacing.component.padding.button,
      minWidth: tokens.accessibility.minTouchTarget.width,
      minHeight: tokens.accessibility.minTouchTarget.height,
      borderRadius: size === 'lg' ? '1rem' : size === 'sm' ? '0.5rem' : '0.75rem',
      transition: `all ${tokens.motion.duration.normal} ${tokens.motion.easing.default}`,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      width: fullWidth ? '100%' : 'auto',
      border: 'none',
      outline: 'none',
      position: 'relative'
    };

    // Profile-specific variant styles
    const getVariantStyles = (): React.CSSProperties => {
      const styles: Record<string, Record<string, React.CSSProperties>> = {
        familiar: {
          primary: {
            backgroundColor: tokens.colors.brand.primary,
            color: tokens.colors.text.inverse,
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.2)'
          },
          secondary: {
            backgroundColor: tokens.colors.brand.secondary,
            color: tokens.colors.text.inverse,
            boxShadow: '0 2px 8px rgba(217, 70, 239, 0.2)'
          },
          outline: {
            backgroundColor: 'transparent',
            color: tokens.colors.brand.primary,
            border: `2px solid ${tokens.colors.brand.primary}`
          },
          ghost: {
            backgroundColor: 'transparent',
            color: tokens.colors.text.primary
          }
        },
        jovem: {
          primary: {
            background: `linear-gradient(135deg, ${tokens.colors.brand.primary}, ${tokens.colors.brand.accent})`,
            color: tokens.colors.text.inverse,
            boxShadow: '0 8px 24px rgba(217, 70, 239, 0.3)'
          },
          secondary: {
            background: `linear-gradient(135deg, ${tokens.colors.brand.secondary}, #10b981)`,
            color: tokens.colors.text.inverse,
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)'
          },
          outline: {
            backgroundColor: 'transparent',
            color: tokens.colors.brand.primary,
            border: `2px solid ${tokens.colors.brand.primary}`,
            backdropFilter: 'blur(10px)'
          },
          ghost: {
            backgroundColor: 'transparent',
            color: tokens.colors.text.primary
          }
        },
        senior: {
          primary: {
            backgroundColor: tokens.colors.brand.primary,
            color: tokens.colors.text.inverse,
            border: `3px solid ${tokens.colors.border.default}`
          },
          secondary: {
            backgroundColor: tokens.colors.brand.secondary,
            color: tokens.colors.text.inverse,
            border: `3px solid ${tokens.colors.border.default}`
          },
          outline: {
            backgroundColor: tokens.colors.surface.background,
            color: tokens.colors.text.primary,
            border: `3px solid ${tokens.colors.border.default}`
          },
          ghost: {
            backgroundColor: 'transparent',
            color: tokens.colors.text.primary,
            border: `2px solid transparent`
          }
        }
      };

      return styles[profile][variant];
    };

    // Profile-specific size adjustments
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        padding: profile === 'senior' ? '1rem 1.5rem' : '0.5rem 1rem',
        fontSize: profile === 'senior' ? '1rem' : '0.875rem'
      },
      md: {
        padding: tokens.spacing.component.padding.button,
        fontSize: tokens.typography.fontSize.body
      },
      lg: {
        padding: profile === 'senior' ? '1.5rem 2.5rem' : '1rem 2rem',
        fontSize: profile === 'senior' ? '1.25rem' : '1.125rem'
      }
    };

    // Focus styles
    const focusStyles: React.CSSProperties = {
      outline: `${tokens.accessibility.focusRing.width} solid ${tokens.accessibility.focusRing.color}`,
      outlineOffset: tokens.accessibility.focusRing.offset
    };

    const combinedStyles = {
      ...baseStyles,
      ...getVariantStyles(),
      ...sizeStyles[size]
    };

    // Motion variants for jovem profile
    const motionVariants = {
      hover: profile === 'jovem' && !reducedMotion ? { scale: 1.05, y: -2 } : {},
      tap: profile === 'jovem' && !reducedMotion ? { scale: 0.95 } : {}
    };

    const ButtonComponent = reducedMotion || profile === 'senior' ? 'button' : motion.button;

    return (
      <ButtonComponent
        ref={ref}
        style={combinedStyles}
        className={`btn btn-${profile} btn-${variant} ${className}`}
        disabled={disabled || loading}
        whileHover={!reducedMotion && profile !== 'senior' ? motionVariants.hover : undefined}
        whileTap={!reducedMotion && profile !== 'senior' ? motionVariants.tap : undefined}
        onFocus={(e) => {
          Object.assign(e.currentTarget.style, focusStyles);
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
        aria-busy={loading}
        aria-label={props['aria-label'] || (typeof children === 'string' ? children : undefined)}
        {...props}
      >
        {loading && (
          <span className="loading-spinner" aria-hidden="true">
            ⏳
          </span>
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className="button-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="button-icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </ButtonComponent>
    );
  }
);

Button.displayName = 'Button';

export default Button;
