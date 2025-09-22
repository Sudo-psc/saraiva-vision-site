import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import FooterWithAccessibility from './FooterWithAccessibility';
import { useGlassMorphism } from '@/hooks/useGlassMorphism';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useAccessibility } from '../hooks/useAccessibility';
import PerformanceAwareWrapper from './ErrorBoundaries/PerformanceAwareWrapper';
import { cn } from '@/lib/utils';

/**
 * Enhanced Footer component with glass morphism effects and performance monitoring
 * Wraps the existing Footer component with modern visual enhancements
 */
const EnhancedFooter = ({
    className = '',
    glassOpacity = 0.1,
    enableAnimations = true,
    beamIntensity = 'medium',
    enablePerformanceMonitoring = true
}) => {
    const {
        capabilities,
        glassIntensity,
        getGlassClasses,
        getGlassStyles,
        shouldEnableGlass
    } = useGlassMorphism();

    // Performance monitoring
    const {
        performanceLevel,
        getOptimizedSettings,
        deviceCapabilities
    } = usePerformanceMonitor({
        targetFPS: 60,
        enableAutoAdjustment: enablePerformanceMonitoring
    });

    // Reduced motion detection
    const { prefersReducedMotion, getAnimationSettings } = useReducedMotion();

    // Accessibility features
    const {
        isHighContrast,
        isKeyboardUser,
        announce,
        getAriaAttributes,
        getFocusStyles
    } = useAccessibility({
        enableAnnouncements: true,
        enableFocusManagement: true,
        enableKeyboardNavigation: true
    });

    // Intersection observer for performance optimization
    const [footerRef, isIntersecting] = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '100px'
    });

    // Memoize glass styles with custom opacity
    const glassStyles = useMemo(() => {
        const baseStyles = getGlassStyles(glassIntensity);
        return {
            ...baseStyles,
            '--glass-opacity': glassOpacity.toString()
        };
    }, [getGlassStyles, glassIntensity, glassOpacity]);

    // Get performance-optimized settings
    const optimizedSettings = useMemo(() => {
        const baseSettings = getOptimizedSettings();
        return getAnimationSettings(baseSettings);
    }, [getOptimizedSettings, getAnimationSettings]);

    // Determine if effects should be active based on performance and preferences
    const effectsActive = useMemo(() => {
        return shouldEnableGlass() &&
            enableAnimations &&
            isIntersecting &&
            !prefersReducedMotion &&
            optimizedSettings.enableGlass &&
            performanceLevel !== 'low';
    }, [shouldEnableGlass, enableAnimations, isIntersecting, prefersReducedMotion, optimizedSettings.enableGlass, performanceLevel]);

    // Glass layer classes
    const glassClasses = useMemo(() => {
        if (!effectsActive) return '';

        return getGlassClasses(glassIntensity, 'enhanced-footer-glass');
    }, [effectsActive, getGlassClasses, glassIntensity]);

    // Container animation variants with performance optimization
    const containerVariants = useMemo(() => ({
        hidden: {
            opacity: 0,
            y: prefersReducedMotion ? 0 : 20
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: prefersReducedMotion ? 0 : optimizedSettings.animationDuration / 1000,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    }), [prefersReducedMotion, optimizedSettings.animationDuration]);

    // Fallback component for performance issues
    const FallbackFooter = () => (
        <div className={cn('enhanced-footer-fallback', className)}>
            <FooterWithAccessibility
                enableGlassEffects={false}
                enableAnimations={false}
            />
        </div>
    );

    return (
        <PerformanceAwareWrapper
            className="enhanced-footer-wrapper"
            fallback={<FallbackFooter />}
            enableMonitoring={enablePerformanceMonitoring}
        >
            {({ settings, isVisible, hasError }) => (
                <motion.div
                    ref={footerRef}
                    className={cn(
                        'enhanced-footer-container relative overflow-hidden',
                        `performance-${performanceLevel}`,
                        prefersReducedMotion && 'reduced-motion',
                        isHighContrast && 'high-contrast',
                        isKeyboardUser && 'keyboard-user',
                        className
                    )}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isIntersecting ? "visible" : "hidden"}
                    style={effectsActive ? glassStyles : {}}
                    {...getAriaAttributes('glass-container', {
                        role: 'contentinfo',
                        label: 'Enhanced footer with glass morphism effects'
                    })}
                >
                    {/* Glass morphism background layer */}
                    {effectsActive && settings.enableGlass && (
                        <div
                            className={cn(
                                'absolute inset-0 pointer-events-none',
                                'enhanced-footer-glass-layer',
                                glassClasses,
                                // High contrast mode adjustments
                                isHighContrast && 'forced-colors:bg-Canvas forced-colors:border-CanvasText'
                            )}
                            style={{
                                background: isHighContrast ?
                                    'transparent' :
                                    `linear-gradient(135deg, 
                      rgba(255, 255, 255, ${settings.glassOpacity || glassOpacity * 0.8}), 
                      rgba(255, 255, 255, ${(settings.glassOpacity || glassOpacity) * 0.4})
                    )`,
                                backdropFilter: deviceCapabilities.supportsBackdropFilter && !isHighContrast ?
                                    `blur(${settings.glassBlur || 20}px) saturate(150%)` : 'none',
                                WebkitBackdropFilter: deviceCapabilities.supportsBackdropFilter && !isHighContrast ?
                                    `blur(${settings.glassBlur || 20}px) saturate(150%)` : 'none',
                                border: isHighContrast ?
                                    '1px solid CanvasText' :
                                    `1px solid rgba(255, 255, 255, ${(settings.glassOpacity || glassOpacity) * 2})`,
                                borderTop: isHighContrast ?
                                    '1px solid CanvasText' :
                                    `1px solid rgba(255, 255, 255, ${(settings.glassOpacity || glassOpacity) * 3})`,
                                boxShadow: isHighContrast ?
                                    'none' :
                                    `0 8px 32px rgba(0, 0, 0, 0.1),
                     inset 0 1px 0 rgba(255, 255, 255, ${(settings.glassOpacity || glassOpacity) * 2})`
                            }}
                            {...getAriaAttributes('animated-element', { decorative: true })}
                        />
                    )}

                    {/* Enhanced Footer Content with Accessibility */}
                    <div className="relative z-10">
                        <FooterWithAccessibility
                            enableGlassEffects={effectsActive && settings.enableGlass}
                            enableAnimations={effectsActive && optimizedSettings.enableAnimations}
                        />
                    </div>

                    {/* Performance indicator for debugging (development only) */}
                    {process.env.NODE_ENV === 'development' && effectsActive && (
                        <div
                            className="absolute top-4 right-4 z-50 text-xs bg-black/50 text-white px-2 py-1 rounded"
                            aria-hidden="true"
                        >
                            Performance: {performanceLevel} | Glass: {settings.enableGlass ? 'ON' : 'OFF'}
                            {hasError && ' | ERROR'} | HC: {isHighContrast ? 'ON' : 'OFF'} | KB: {isKeyboardUser ? 'ON' : 'OFF'}
                        </div>
                    )}

                    {/* Accessibility announcements region */}
                    <div
                        aria-live="polite"
                        aria-atomic="true"
                        className="sr-only"
                        id="enhanced-footer-announcements"
                    />

                    {/* Skip link for keyboard users */}
                    {isKeyboardUser && (
                        <a
                            href="#main-content"
                            className={cn(
                                'sr-only focus:not-sr-only',
                                'absolute top-4 left-4 z-50',
                                'bg-blue-600 text-white px-4 py-2 rounded',
                                'focus:outline-none focus:ring-2 focus:ring-white'
                            )}
                        >
                            Skip to main content
                        </a>
                    )}
                </motion.div>
            )}
        </PerformanceAwareWrapper>
    );
};

export default React.memo(EnhancedFooter);