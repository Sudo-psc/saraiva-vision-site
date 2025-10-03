/**
 * Theme-Aware Card Component
 * Saraiva Vision - Adapts to all three profiles
 */

import React from 'react';
import { useTheme, useDesignTokens } from '../ThemeProvider';
import { motion } from 'framer-motion';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      interactive = false,
      className = '',
      children,
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
      lineHeight: tokens.typography.lineHeight.normal,
      backgroundColor: tokens.colors.surface.card,
      color: tokens.colors.text.primary,
      borderRadius: padding === 'none' ? 0 : profile === 'senior' ? '0.25rem' : profile === 'jovem' ? '1.5rem' : '1rem',
      transition: `all ${tokens.motion.duration.normal} ${tokens.motion.easing.default}`,
      position: 'relative',
      overflow: 'hidden'
    };

    // Padding styles
    const paddingStyles: Record<string, React.CSSProperties> = {
      none: { padding: 0 },
      sm: { padding: profile === 'senior' ? '1.5rem' : '1rem' },
      md: { padding: tokens.spacing.component.padding.card },
      lg: { padding: profile === 'senior' ? '3rem' : '2.5rem' }
    };

    // Profile-specific variant styles
    const getVariantStyles = (): React.CSSProperties => {
      const styles: Record<string, Record<string, React.CSSProperties>> = {
        familiar: {
          default: {
            backgroundColor: tokens.colors.surface.card,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          },
          elevated: {
            backgroundColor: tokens.colors.surface.card,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
          },
          outlined: {
            backgroundColor: 'transparent',
            border: `2px solid ${tokens.colors.border.default}`
          },
          glass: {
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${tokens.colors.border.default}`
          }
        },
        jovem: {
          default: {
            backgroundColor: tokens.colors.surface.card,
            boxShadow: '0 8px 24px rgba(217, 70, 239, 0.15)'
          },
          elevated: {
            background: `linear-gradient(135deg, rgba(217, 70, 239, 0.05), rgba(139, 92, 246, 0.05))`,
            boxShadow: '0 12px 32px rgba(217, 70, 239, 0.2)',
            border: `1px solid rgba(217, 70, 239, 0.2)`
          },
          outlined: {
            backgroundColor: 'transparent',
            border: `2px solid ${tokens.colors.brand.primary}`,
            backdropFilter: 'blur(5px)'
          },
          glass: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: `1px solid rgba(217, 70, 239, 0.3)`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        },
        senior: {
          default: {
            backgroundColor: tokens.colors.surface.card,
            border: `3px solid ${tokens.colors.border.default}`,
            boxShadow: 'none'
          },
          elevated: {
            backgroundColor: tokens.colors.surface.card,
            border: `3px solid ${tokens.colors.border.default}`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          },
          outlined: {
            backgroundColor: 'transparent',
            border: `3px solid ${tokens.colors.border.default}`
          },
          glass: {
            backgroundColor: tokens.colors.surface.card,
            border: `3px solid ${tokens.colors.border.default}`,
            opacity: 0.95
          }
        }
      };

      return styles[profile][variant];
    };

    // Hover styles
    const hoverStyles: React.CSSProperties = hover
      ? {
          cursor: interactive ? 'pointer' : 'default',
          transform: profile === 'jovem' && !reducedMotion ? 'translateY(-4px)' : 'none',
          boxShadow: profile === 'jovem' ? '0 16px 48px rgba(217, 70, 239, 0.3)' : '0 12px 32px rgba(0, 0, 0, 0.15)'
        }
      : {};

    // Focus styles for interactive cards
    const focusStyles: React.CSSProperties = interactive
      ? {
          outline: `${tokens.accessibility.focusRing.width} solid ${tokens.accessibility.focusRing.color}`,
          outlineOffset: tokens.accessibility.focusRing.offset
        }
      : {};

    const combinedStyles = {
      ...baseStyles,
      ...getVariantStyles(),
      ...paddingStyles[padding]
    };

    // Motion variants for jovem profile
    const motionVariants = {
      hover: hover && profile === 'jovem' && !reducedMotion ? { scale: 1.02, y: -4 } : {},
      tap: interactive && profile === 'jovem' && !reducedMotion ? { scale: 0.98 } : {}
    };

    const CardComponent = reducedMotion || profile === 'senior' ? 'div' : motion.div;

    return (
      <CardComponent
        ref={ref}
        style={combinedStyles}
        className={`card card-${profile} card-${variant} ${interactive ? 'card-interactive' : ''} ${className}`}
        whileHover={!reducedMotion && profile !== 'senior' && hover ? motionVariants.hover : undefined}
        whileTap={!reducedMotion && profile !== 'senior' && interactive ? motionVariants.tap : undefined}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? 'button' : undefined}
        onFocus={
          interactive
            ? (e) => {
                Object.assign(e.currentTarget.style, focusStyles);
              }
            : undefined
        }
        onBlur={
          interactive
            ? (e) => {
                e.currentTarget.style.outline = 'none';
              }
            : undefined
        }
        onMouseEnter={
          hover && (profile === 'familiar' || profile === 'senior')
            ? (e) => {
                Object.assign(e.currentTarget.style, hoverStyles);
              }
            : undefined
        }
        onMouseLeave={
          hover && (profile === 'familiar' || profile === 'senior')
            ? (e) => {
                Object.assign(e.currentTarget.style, combinedStyles);
              }
            : undefined
        }
        {...props}
      >
        {children}
      </CardComponent>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card Header Component
 */
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const tokens = useDesignTokens();

  return (
    <div
      className={`card-header ${className}`}
      style={{
        marginBottom: tokens.spacing.component.gap.element,
        paddingBottom: tokens.spacing.component.gap.element,
        borderBottom: `1px solid ${tokens.colors.border.default}`
      }}
    >
      {children}
    </div>
  );
};

/**
 * Card Title Component
 */
export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const tokens = useDesignTokens();

  return (
    <h3
      className={`card-title ${className}`}
      style={{
        fontFamily: tokens.typography.fontFamily.heading,
        fontSize: tokens.typography.fontSize.h3,
        fontWeight: tokens.typography.fontWeight.semibold,
        lineHeight: tokens.typography.lineHeight.tight,
        color: tokens.colors.text.primary,
        margin: 0
      }}
    >
      {children}
    </h3>
  );
};

/**
 * Card Content Component
 */
export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const tokens = useDesignTokens();

  return (
    <div
      className={`card-content ${className}`}
      style={{
        color: tokens.colors.text.secondary,
        lineHeight: tokens.typography.lineHeight.relaxed
      }}
    >
      {children}
    </div>
  );
};

/**
 * Card Footer Component
 */
export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const tokens = useDesignTokens();

  return (
    <div
      className={`card-footer ${className}`}
      style={{
        marginTop: tokens.spacing.component.gap.element,
        paddingTop: tokens.spacing.component.gap.element,
        borderTop: `1px solid ${tokens.colors.border.default}`,
        display: 'flex',
        gap: tokens.spacing.component.gap.element,
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );
};

export default Card;
