import React, { forwardRef } from 'react';
import { useGlassMorphism } from '../../hooks/useGlassMorphism';

/**
 * GlassContainer - A reusable component that applies glass morphism effects
 * with automatic capability detection and responsive behavior
 */
const GlassContainer = forwardRef(({
    children,
    intensity = 'medium',
    className = '',
    style = {},
    enableGlass = true,
    fallbackClassName = '',
    as: Component = 'div',
    ...props
}, ref) => {
    const {
        capabilities,
        getGlassClasses,
        getGlassStyles,
        shouldEnableGlass
    } = useGlassMorphism();

    // Determine if glass effects should be applied
    const useGlassEffects = enableGlass && shouldEnableGlass();

    // Get appropriate classes
    const glassClasses = useGlassEffects
        ? getGlassClasses(intensity, className)
        : `${fallbackClassName} ${className}`.trim();

    // Get dynamic styles
    const glassStyles = useGlassEffects
        ? { ...getGlassStyles(intensity), ...style }
        : style;

    return (
        <Component
            ref={ref}
            className={glassClasses}
            style={glassStyles}
            data-glass-enabled={useGlassEffects}
            data-performance-level={capabilities.performanceLevel}
            {...props}
        >
            {children}
        </Component>
    );
});

GlassContainer.displayName = 'GlassContainer';

export default GlassContainer;