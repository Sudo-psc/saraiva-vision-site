/**
 * Liquid Theme Hook
 * Provides liquid glass theme classes and utilities
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

const liquidVariants = {
    primary: 'liquid-glass-primary',
    secondary: 'liquid-glass-secondary',
    tertiary: 'liquid-glass-tertiary',
    accent: 'liquid-glass-accent'
};

const liquidSizes = {
    sm: 'liquid-sm',
    md: 'liquid-md',
    lg: 'liquid-lg',
    xl: 'liquid-xl'
};

/**
 * Hook for applying liquid glass classes
 * @param {string} baseClasses - Base CSS classes
 * @param {Object} options - Configuration options
 * @returns {string} Combined CSS classes
 */
export function useLiquidClasses(baseClasses = '', options = {}) {
    const {
        variant = 'primary',
        size = 'md',
        responsive = false,
        animated = true,
        glass = true
    } = options;

    return useMemo(() => {
        const classes = [baseClasses];

        // Add liquid variant
        if (glass && liquidVariants[variant]) {
            classes.push(liquidVariants[variant]);
        }

        // Add size classes
        if (liquidSizes[size]) {
            classes.push(liquidSizes[size]);
        }

        // Add responsive classes
        if (responsive) {
            classes.push('liquid-responsive');
        }

        // Add animation classes
        if (animated) {
            classes.push('liquid-animated');
        }

        return cn(...classes);
    }, [baseClasses, variant, size, responsive, animated, glass]);
}

/**
 * Hook for liquid theme context
 * @returns {Object} Theme utilities and state
 */
export function useLiquidTheme() {
    return useMemo(() => ({
        variants: liquidVariants,
        sizes: liquidSizes,
        getVariantClass: (variant) => liquidVariants[variant] || liquidVariants.primary,
        getSizeClass: (size) => liquidSizes[size] || liquidSizes.md
    }), []);
}

export default useLiquidClasses;