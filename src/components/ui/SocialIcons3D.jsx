import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Enhanced 3D Social Icons component with full accessibility support
 * Provides keyboard navigation, ARIA labels, and screen reader compatibility
 */
const SocialIcons3D = ({
    socials = [],
    className = '',
    enableAnimations = true,
    glassEffect = true,
    onIconClick,
    ...props
}) => {
    const [hoveredIcon, setHoveredIcon] = useState(null);
    const [focusedIcon, setFocusedIcon] = useState(null);
    const [keyboardNavigation, setKeyboardNavigation] = useState(false);
    const containerRef = useRef(null);
    const iconRefs = useRef({});

    const { prefersReducedMotion, getAnimationSettings } = useReducedMotion();
    const animationSettings = getAnimationSettings({ enableAnimations });

    // Handle keyboard navigation
    const handleKeyDown = useCallback((event, socialName, socialHref) => {
        setKeyboardNavigation(true);

        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (onIconClick) {
                    onIconClick(socialName, socialHref);
                } else {
                    window.open(socialHref, '_blank', 'noopener,noreferrer');
                }
                break;
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                focusNextIcon(socialName);
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                focusPreviousIcon(socialName);
                break;
            case 'Home':
                event.preventDefault();
                focusFirstIcon();
                break;
            case 'End':
                event.preventDefault();
                focusLastIcon();
                break;
            case 'Escape':
                event.preventDefault();
                setFocusedIcon(null);
                setHoveredIcon(null);
                break;
        }
    }, [onIconClick]);

    // Focus management functions
    const focusNextIcon = useCallback((currentIcon) => {
        const currentIndex = socials.findIndex(social => social.name === currentIcon);
        const nextIndex = (currentIndex + 1) % socials.length;
        const nextIcon = socials[nextIndex];
        if (iconRefs.current[nextIcon.name]) {
            iconRefs.current[nextIcon.name].focus();
        }
    }, [socials]);

    const focusPreviousIcon = useCallback((currentIcon) => {
        const currentIndex = socials.findIndex(social => social.name === currentIcon);
        const prevIndex = currentIndex === 0 ? socials.length - 1 : currentIndex - 1;
        const prevIcon = socials[prevIndex];
        if (iconRefs.current[prevIcon.name]) {
            iconRefs.current[prevIcon.name].focus();
        }
    }, [socials]);

    const focusFirstIcon = useCallback(() => {
        const firstIcon = socials[0];
        if (firstIcon && iconRefs.current[firstIcon.name]) {
            iconRefs.current[firstIcon.name].focus();
        }
    }, [socials]);

    const focusLastIcon = useCallback(() => {
        const lastIcon = socials[socials.length - 1];
        if (lastIcon && iconRefs.current[lastIcon.name]) {
            iconRefs.current[lastIcon.name].focus();
        }
    }, [socials]);

    // Mouse interaction handlers
    const handleMouseEnter = useCallback((socialName) => {
        if (!keyboardNavigation) {
            setHoveredIcon(socialName);
        }
    }, [keyboardNavigation]);

    const handleMouseLeave = useCallback(() => {
        if (!keyboardNavigation) {
            setHoveredIcon(null);
        }
    }, [keyboardNavigation]);

    const handleFocus = useCallback((socialName) => {
        setFocusedIcon(socialName);
        setHoveredIcon(socialName);
    }, []);

    const handleBlur = useCallback(() => {
        setFocusedIcon(null);
        if (keyboardNavigation) {
            setHoveredIcon(null);
        }
        // Reset keyboard navigation flag after a delay
        setTimeout(() => setKeyboardNavigation(false), 100);
    }, [keyboardNavigation]);

    // Click handler with analytics and accessibility
    const handleClick = useCallback((social) => {
        // Announce to screen readers
        const announcement = `Opening ${social.name} in new tab`;
        const ariaLive = document.createElement('div');
        ariaLive.setAttribute('aria-live', 'polite');
        ariaLive.setAttribute('aria-atomic', 'true');
        ariaLive.className = 'sr-only';
        ariaLive.textContent = announcement;
        document.body.appendChild(ariaLive);

        setTimeout(() => {
            document.body.removeChild(ariaLive);
        }, 1000);

        if (onIconClick) {
            onIconClick(social.name, social.href);
        } else {
            window.open(social.href, '_blank', 'noopener,noreferrer');
        }
    }, [onIconClick]);

    // Animation variants for 3D effects
    const iconVariants = {
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
            scale: animationSettings.enableAnimations ? 1.1 : 1,
            rotateX: animationSettings.enableAnimations ? -15 : 0,
            rotateY: animationSettings.enableAnimations ? 15 : 0,
            translateZ: animationSettings.enableAnimations ? 50 : 0,
            transition: {
                duration: animationSettings.animationDuration / 1000,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        focus: {
            scale: animationSettings.enableAnimations ? 1.05 : 1,
            rotateX: animationSettings.enableAnimations ? -10 : 0,
            rotateY: animationSettings.enableAnimations ? 10 : 0,
            translateZ: animationSettings.enableAnimations ? 30 : 0,
            transition: {
                duration: animationSettings.animationDuration / 1000,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    // Glass bubble animation variants
    const bubbleVariants = {
        hidden: {
            scale: 0,
            opacity: 0,
            transition: {
                duration: 0.2
            }
        },
        visible: {
            scale: 1,
            opacity: glassEffect ? 0.8 : 0,
            transition: {
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                'social-icons-3d-container',
                'flex items-center gap-4',
                'perspective-1000',
                className
            )}
            role="group"
            aria-label="Social media links with 3D effects"
            {...props}
        >
            {socials.map((social, index) => {
                const isActive = hoveredIcon === social.name || focusedIcon === social.name;
                const iconId = `social-icon-${social.name.toLowerCase().replace(/\s+/g, '-')}`;

                return (
                    <div
                        key={social.name}
                        className="relative"
                        style={{ perspective: '1000px' }}
                    >
                        {/* 3D Social Icon */}
                        <motion.button
                            ref={(el) => {
                                if (el) iconRefs.current[social.name] = el;
                            }}
                            id={iconId}
                            className={cn(
                                'social-icon-3d',
                                'relative p-3 rounded-full',
                                'bg-slate-700 hover:bg-slate-600',
                                'text-white transition-colors',
                                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                                'focus:ring-offset-slate-800',
                                // Enhanced focus styles for 3D context
                                focusedIcon === social.name && [
                                    'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-800',
                                    'shadow-lg shadow-blue-500/25'
                                ],
                                // High contrast mode support
                                'forced-colors:border-2 forced-colors:border-ButtonText',
                                'forced-colors:bg-ButtonFace forced-colors:text-ButtonText'
                            )}
                            variants={iconVariants}
                            initial="default"
                            animate={isActive ? (focusedIcon === social.name ? 'focus' : 'hover') : 'default'}
                            whileTap={animationSettings.enableAnimations ? { scale: 0.95 } : {}}
                            onMouseEnter={() => handleMouseEnter(social.name)}
                            onMouseLeave={handleMouseLeave}
                            onFocus={() => handleFocus(social.name)}
                            onBlur={handleBlur}
                            onKeyDown={(e) => handleKeyDown(e, social.name, social.href)}
                            onClick={() => handleClick(social)}
                            aria-label={`Visit our ${social.name} page (opens in new tab)`}
                            aria-describedby={`${iconId}-description`}
                            tabIndex={0}
                            type="button"
                        >
                            {/* Social Icon Image */}
                            <img
                                src={social.image}
                                alt=""
                                className="w-6 h-6 object-contain"
                                loading="lazy"
                                decoding="async"
                                aria-hidden="true"
                            />

                            {/* Screen reader description */}
                            <span
                                id={`${iconId}-description`}
                                className="sr-only"
                            >
                                {social.name} social media profile. Press Enter or Space to open in new tab.
                                Use arrow keys to navigate between social icons.
                            </span>
                        </motion.button>

                        {/* Glass Bubble Effect */}
                        <AnimatePresence>
                            {isActive && glassEffect && animationSettings.enableAnimations && (
                                <motion.div
                                    className={cn(
                                        'absolute inset-0 pointer-events-none',
                                        'rounded-full',
                                        'bg-gradient-to-br from-white/20 to-white/5',
                                        'backdrop-blur-sm border border-white/20',
                                        'shadow-lg shadow-white/10'
                                    )}
                                    variants={bubbleVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    aria-hidden="true"
                                />
                            )}
                        </AnimatePresence>

                        {/* Depth Shadow for 3D Effect */}
                        {isActive && animationSettings.enableAnimations && (
                            <div
                                className={cn(
                                    'absolute inset-0 pointer-events-none',
                                    'rounded-full bg-black/20',
                                    'transform translate-x-1 translate-y-1 -translate-z-10',
                                    'blur-sm'
                                )}
                                style={{
                                    transform: `translateX(${isActive ? '4px' : '0'}) translateY(${isActive ? '4px' : '0'}) translateZ(-10px)`,
                                    transition: 'transform 0.3s ease'
                                }}
                                aria-hidden="true"
                            />
                        )}
                    </div>
                );
            })}

            {/* Live region for screen reader announcements */}
            <div
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
                id="social-icons-announcements"
            >
                {hoveredIcon && `Focused on ${hoveredIcon} social media link`}
            </div>

            {/* Instructions for screen readers */}
            <div className="sr-only" id="social-icons-instructions">
                Use Tab to navigate to social media links. Press Enter or Space to open links.
                Use arrow keys to move between social icons. Press Escape to exit navigation.
            </div>
        </div>
    );
};

export default React.memo(SocialIcons3D);