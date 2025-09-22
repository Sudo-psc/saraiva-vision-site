import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Enhanced Scroll to Top button with glass morphism effects and full accessibility
 * Provides keyboard navigation, ARIA labels, and screen reader compatibility
 */
const ScrollToTopEnhanced = ({
    className = '',
    glassEffect = true,
    enableAnimations = true,
    onScrollComplete,
    ...props
}) => {
    const [isScrolling, setIsScrolling] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const buttonRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    const { prefersReducedMotion, getAnimationSettings } = useReducedMotion();
    const animationSettings = getAnimationSettings({ enableAnimations });

    // Scroll to top function with accessibility announcements
    const scrollToTop = useCallback(() => {
        setIsScrolling(true);

        // Clear any existing timeout
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Announce to screen readers
        const announcement = 'Scrolling to top of page';
        const ariaLive = document.createElement('div');
        ariaLive.setAttribute('aria-live', 'polite');
        ariaLive.setAttribute('aria-atomic', 'true');
        ariaLive.className = 'sr-only';
        ariaLive.textContent = announcement;
        document.body.appendChild(ariaLive);

        // Perform smooth scroll
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // Monitor scroll completion
        const checkScrollComplete = () => {
            if (window.scrollY === 0) {
                setIsScrolling(false);

                // Announce completion
                const completionAnnouncement = 'Reached top of page';
                ariaLive.textContent = completionAnnouncement;

                // Clean up announcement element
                setTimeout(() => {
                    if (document.body.contains(ariaLive)) {
                        document.body.removeChild(ariaLive);
                    }
                }, 1000);

                if (onScrollComplete) {
                    onScrollComplete();
                }
            } else {
                scrollTimeoutRef.current = setTimeout(checkScrollComplete, 100);
            }
        };

        scrollTimeoutRef.current = setTimeout(checkScrollComplete, 100);
    }, [onScrollComplete]);

    // Keyboard event handler
    const handleKeyDown = useCallback((event) => {
        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                scrollToTop();
                break;
            case 'Escape':
                event.preventDefault();
                setIsFocused(false);
                if (buttonRef.current) {
                    buttonRef.current.blur();
                }
                break;
        }
    }, [scrollToTop]);

    // Focus handlers
    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    // Mouse handlers
    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    // Animation variants
    const buttonVariants = {
        default: {
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            translateZ: 0,
            transition: {
                duration: animationSettings.animationDuration / 1000,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        hover: {
            scale: animationSettings.enableAnimations ? 1.05 : 1,
            rotateX: animationSettings.enableAnimations ? -10 : 0,
            rotateY: animationSettings.enableAnimations ? 5 : 0,
            translateZ: animationSettings.enableAnimations ? 20 : 0,
            transition: {
                duration: animationSettings.animationDuration / 1000,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        focus: {
            scale: animationSettings.enableAnimations ? 1.03 : 1,
            rotateX: animationSettings.enableAnimations ? -5 : 0,
            rotateY: animationSettings.enableAnimations ? 3 : 0,
            translateZ: animationSettings.enableAnimations ? 15 : 0,
            transition: {
                duration: animationSettings.animationDuration / 1000,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        scrolling: {
            scale: animationSettings.enableAnimations ? 0.95 : 1,
            rotateZ: animationSettings.enableAnimations ? 360 : 0,
            transition: {
                duration: animationSettings.enableAnimations ? 0.6 : 0,
                ease: 'easeInOut'
            }
        }
    };

    const iconVariants = {
        default: {
            y: 0,
            transition: {
                duration: 0.2
            }
        },
        hover: {
            y: animationSettings.enableAnimations ? -2 : 0,
            transition: {
                duration: 0.2,
                ease: 'easeOut'
            }
        },
        scrolling: {
            y: animationSettings.enableAnimations ? [-2, 2, -2] : 0,
            transition: {
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };

    const isActive = isHovered || isFocused;
    const currentVariant = isScrolling ? 'scrolling' : (isFocused ? 'focus' : (isActive ? 'hover' : 'default'));

    return (
        <div
            className="scroll-to-top-enhanced-container relative"
            style={{ perspective: '1000px' }}
        >
            <motion.button
                ref={buttonRef}
                className={cn(
                    'scroll-to-top-enhanced',
                    'relative p-2.5 rounded-full',
                    'text-white transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    'focus:ring-offset-slate-800',
                    // Glass morphism background
                    glassEffect && [
                        'bg-gradient-to-br from-white/20 to-white/10',
                        'backdrop-blur-md border border-white/20',
                        'shadow-lg shadow-black/25'
                    ],
                    // Fallback background for non-glass effect
                    !glassEffect && 'bg-slate-700 hover:bg-blue-600',
                    // Enhanced focus styles
                    isFocused && [
                        'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-800',
                        'shadow-lg shadow-blue-500/25'
                    ],
                    // High contrast mode support
                    'forced-colors:border-2 forced-colors:border-ButtonText',
                    'forced-colors:bg-ButtonFace forced-colors:text-ButtonText',
                    // Loading state
                    isScrolling && 'cursor-wait',
                    className
                )}
                variants={buttonVariants}
                initial="default"
                animate={currentVariant}
                whileTap={animationSettings.enableAnimations ? { scale: 0.9 } : {}}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onKeyDown={handleKeyDown}
                onClick={scrollToTop}
                disabled={isScrolling}
                aria-label={isScrolling ? 'Scrolling to top of page' : 'Scroll to top of page'}
                aria-describedby="scroll-to-top-description"
                title={isScrolling ? 'Scrolling to top...' : 'Scroll to top'}
                type="button"
                {...props}
            >
                {/* Arrow Icon */}
                <motion.div
                    variants={iconVariants}
                    animate={isScrolling ? 'scrolling' : (isActive ? 'hover' : 'default')}
                    aria-hidden="true"
                >
                    <ArrowUp size={18} />
                </motion.div>

                {/* Glass overlay effect */}
                {glassEffect && isActive && animationSettings.enableAnimations && (
                    <motion.div
                        className={cn(
                            'absolute inset-0 pointer-events-none',
                            'rounded-full',
                            'bg-gradient-to-br from-white/30 to-white/10',
                            'backdrop-blur-sm border border-white/30'
                        )}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        aria-hidden="true"
                    />
                )}

                {/* Loading indicator */}
                {isScrolling && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        aria-hidden="true"
                    >
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </motion.div>
                )}

                {/* Screen reader description */}
                <span
                    id="scroll-to-top-description"
                    className="sr-only"
                >
                    Scroll to the top of the page. Press Enter or Space to activate.
                    {isScrolling && 'Currently scrolling to top.'}
                </span>
            </motion.button>

            {/* Depth shadow for 3D effect */}
            {isActive && animationSettings.enableAnimations && (
                <div
                    className={cn(
                        'absolute inset-0 pointer-events-none',
                        'rounded-full bg-black/20',
                        'blur-sm'
                    )}
                    style={{
                        transform: `translateX(${isActive ? '3px' : '0'}) translateY(${isActive ? '3px' : '0'}) translateZ(-10px)`,
                        transition: 'transform 0.3s ease'
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Status announcements for screen readers */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
                id="scroll-status-announcements"
            >
                {isScrolling && 'Scrolling to top of page'}
            </div>
        </div>
    );
};

export default React.memo(ScrollToTopEnhanced);