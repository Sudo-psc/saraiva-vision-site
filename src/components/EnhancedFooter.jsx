import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Footer from './Footer';
import { useGlassMorphism } from '@/hooks/useGlassMorphism';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { generateDarkGlassStyles, createGlassCustomProperties } from '@/utils/glassMorphismUtils';
import { cn } from '@/lib/utils';

/**
 * Enhanced Footer component with glass morphism effects
 * Wraps the existing Footer component with modern visual enhancements
 */
const EnhancedFooter = ({
    className = '',
    glassOpacity = null,
    glassBlur = null,
    enableAnimations = true,
    ...props
}) => {
    const {
        capabilities,
        glassIntensity,
        shouldEnableGlass,
        getGlassStyles
    } = useGlassMorphism();

    const [footerRef, isFooterVisible] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '100px'
    });

    const [isAnimationEnabled, setIsAnimationEnabled] = useState(false);

    // Enable animations only when footer is visible and animations are allowed
    useEffect(() => {
        if (isFooterVisible && enableAnimations && !capabilities.reducedMotion) {
            setIsAnimationEnabled(true);
        } else {
            setIsAnimationEnabled(false);
        }
    }, [isFooterVisible, enableAnimations, capabilities.reducedMotion]);

    // Generate glass morphism styles based on current settings
    const glassStyles = useMemo(() => {
        if (!shouldEnableGlass()) {
            return {
                background: 'rgba(30, 41, 59, 0.95)', // Fallback for slate-800
                backdropFilter: 'none'
            };
        }

        return generateDarkGlassStyles({
            intensity: glassIntensity,
            opacity: glassOpacity,
            blur: glassBlur
        });
    }, [shouldEnableGlass, glassIntensity, glassOpacity, glassBlur]);

    // CSS custom properties for dynamic theming
    const customProperties = useMemo(() => {
        const baseProperties = createGlassCustomProperties(glassIntensity);

        // Override with custom values if provided
        if (glassOpacity !== null) {
            baseProperties['--glass-opacity'] = glassOpacity.toString();
        }
        if (glassBlur !== null) {
            baseProperties['--glass-blur'] = `${glassBlur}px`;
        }

        return baseProperties;
    }, [glassIntensity, glassOpacity, glassBlur]);

    // Animation variants for the glass layer
    const glassLayerVariants = {
        hidden: {
            opacity: 0,
            scale: 0.95,
            y: 20
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.2
            }
        }
    };

    // Container animation variants
    const containerVariants = {
        hidden: {
            opacity: 0
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: 'easeOut'
            }
        }
    };

    return (
        <motion.div
            ref={footerRef}
            className={cn('relative overflow-hidden', className)}
            variants={isAnimationEnabled ? containerVariants : undefined}
            initial={isAnimationEnabled ? 'hidden' : false}
            animate={isAnimationEnabled && isFooterVisible ? 'visible' : 'hidden'}
            style={customProperties}
            {...props}
        >
            {/* Glass Morphism Background Layer */}
            {shouldEnableGlass() && (
                <motion.div
                    className="absolute inset-0 z-0"
                    style={glassStyles}
                    variants={isAnimationEnabled ? glassLayerVariants : undefined}
                    initial={isAnimationEnabled ? 'hidden' : false}
                    animate={isAnimationEnabled && isFooterVisible ? 'visible' : 'hidden'}
                    aria-hidden="true"
                />
            )}

            {/* Gradient Overlay for Enhanced Depth */}
            <div
                className="absolute inset-0 z-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent"
                aria-hidden="true"
            />

            {/* Original Footer Content */}
            <div className="relative z-10">
                <Footer />
            </div>

            {/* Performance Indicator (Development Only) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="fixed bottom-4 right-4 z-50 text-xs bg-black/50 text-white p-2 rounded font-mono">
                    <div>Glass: {shouldEnableGlass() ? 'ON' : 'OFF'}</div>
                    <div>Intensity: {glassIntensity}</div>
                    <div>Performance: {capabilities.performanceLevel}</div>
                    <div>Backdrop Filter: {capabilities.supportsBackdropFilter ? 'YES' : 'NO'}</div>
                    <div>Visible: {isFooterVisible ? 'YES' : 'NO'}</div>
                    <div>Animations: {isAnimationEnabled ? 'ON' : 'OFF'}</div>
                </div>
            )}
        </motion.div>
    );
};

export default React.memo(EnhancedFooter);