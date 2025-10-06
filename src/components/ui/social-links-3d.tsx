import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import SocialIcon3D from '@/components/SocialIcon3D';
import { useFooterAccessibility } from '@/hooks/useFooterAccessibility';
import {
    animationVariants,
    getOptimizedVariant,
    staggerConfig,
    easingFunctions,
    timingConfig
} from '@/utils/footerAnimationConfig';

/**
 * Enhanced SocialLinks3D Component
 * 
 * Container component for 3D social media icons with coordinated hover states
 * and glass morphism effects. Manages the interaction between multiple 3D icons
 * and provides smooth transitions between states.
 * 
 * Requirements covered: 2.1, 2.2, 2.4, 2.5
 */

interface Social {
    name: string;
    href: string;
    image: string;
    color?: string;
}

interface SocialLinks3DProps extends React.HTMLAttributes<HTMLDivElement> {
    socials: Social[];
    spacing?: 'compact' | 'normal' | 'wide';
    enableGlassContainer?: boolean;
}

export function SocialLinks3D({
    socials,
    spacing = 'normal',
    enableGlassContainer = true,
    className,
    ...props
}: SocialLinks3DProps) {
    const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
    const [containerHovered, setContainerHovered] = useState(false);

    // Use accessibility hook
    const {
        shouldReduceMotion,
        shouldDisableGlass,
        announcementText,
        announce
    } = useFooterAccessibility();

    // Handle individual icon hover states
    const handleIconHover = useCallback((socialName: string | null) => {
        setHoveredSocial(socialName);

        // Announce hover state changes for screen readers
        if (socialName) {
            announce(`Hovering over ${socialName} social media icon`);
        }
    }, [announce]);

    // Handle container hover for coordinated effects
    const handleContainerEnter = useCallback(() => {
        setContainerHovered(true);
    }, []);

    const handleContainerLeave = useCallback(() => {
        setContainerHovered(false);
        setHoveredSocial(null);
    }, []);

    // Get spacing classes based on spacing prop
    const getSpacingClass = () => {
        switch (spacing) {
            case 'compact':
                return 'gap-2';
            case 'wide':
                return 'gap-8';
            default:
                return 'gap-4';
        }
    };

    // Optimized container animation variants
    const containerVariants = useMemo(() => ({
        default: {
            scale: 1,
            transition: easingFunctions.gentleSpring
        },
        hovered: {
            scale: 1.02,
            transition: {
                ...easingFunctions.spring,
                stiffness: 400,
                damping: 25
            }
        }
    }), []);

    // Optimized stagger animation for icons
    const iconsContainerVariants = useMemo(() => ({
        default: {
            transition: {
                ...staggerConfig.socialIcons,
                staggerChildren: timingConfig.socialIcon.stagger,
                delayChildren: 0
            }
        },
        hovered: {
            transition: {
                ...staggerConfig.socialIcons,
                staggerChildren: timingConfig.socialIcon.stagger * 0.5,
                delayChildren: 0.1
            }
        }
    }), []);

    return (
        <motion.div
            className={cn(
                "relative flex items-center justify-center",
                getSpacingClass(),
                // Glass morphism container styling
                enableGlassContainer && !shouldDisableGlass && [
                    "p-4 rounded-2xl",
                    "bg-gradient-to-br from-white/5 via-white/2 to-transparent",
                    "backdrop-blur-sm border border-white/10",
                    "transition-all duration-500",
                    containerHovered && [
                        "bg-gradient-to-br from-white/10 via-white/5 to-transparent",
                        "backdrop-blur-md border-white/20",
                        "shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
                    ]
                ],
                className
            )}
            variants={shouldReduceMotion ? undefined : containerVariants}
            animate={!shouldReduceMotion && containerHovered ? 'hovered' : 'default'}
            onMouseEnter={handleContainerEnter}
            onMouseLeave={handleContainerLeave}
            style={{
                perspective: shouldReduceMotion ? "none" : "1200px",
                transformStyle: shouldReduceMotion ? "flat" : "preserve-3d"
            }}
            role="group"
            aria-label="Social media links"
            aria-describedby="social-links-description"
            {...props}
        >
            {/* Background glow effect */}
            {containerHovered && !shouldReduceMotion && !shouldDisableGlass && (
                <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                        duration: timingConfig.socialIcon.bubble,
                        ease: easingFunctions.glass
                    }}
                >
                    <div
                        className={cn(
                            "absolute inset-0 rounded-2xl",
                            "bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10",
                            "blur-xl"
                        )}
                    />
                </motion.div>
            )}

            {/* Icons container with stagger animation */}
            <motion.div
                className="relative flex items-center gap-inherit"
                variants={shouldReduceMotion ? undefined : iconsContainerVariants}
                animate={!shouldReduceMotion && containerHovered ? 'hovered' : 'default'}
                style={{
                    transformStyle: shouldReduceMotion ? "flat" : "preserve-3d"
                }}
            >
                {socials.map((social, index) => (
                    <motion.div
                        key={social.name}
                        className={cn(
                            "relative transition-all duration-300",
                            // Dim non-hovered icons when one is hovered
                            hoveredSocial && hoveredSocial !== social.name
                                ? "opacity-40 scale-95"
                                : "opacity-100 scale-100"
                        )}
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20, rotateX: -90 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : {
                            opacity: 1,
                            y: 0,
                            rotateX: 0,
                            transition: {
                                delay: index * timingConfig.socialIcon.stagger,
                                ...easingFunctions.spring,
                                stiffness: 300,
                                damping: 25
                            }
                        }}
                    >
                        <SocialIcon3D
                            social={social}
                            index={index}
                            isHovered={hoveredSocial === social.name}
                            onHover={handleIconHover}
                            className="transform-gpu"
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* Ambient lighting effect */}
            {hoveredSocial && !shouldReduceMotion && !shouldDisableGlass && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                        duration: timingConfig.socialIcon.hover,
                        ease: easingFunctions.hover
                    }}
                >
                    <div
                        className={cn(
                            "absolute inset-0 rounded-2xl",
                            "bg-gradient-to-br from-white/5 to-transparent",
                            "blur-2xl"
                        )}
                        style={{
                            transform: "translateZ(-50px) scale(1.5)"
                        }}
                    />
                </motion.div>
            )}

            {/* Performance optimization: Preload hover states */}
            <div className="sr-only">
                {socials.map((social) => (
                    <link
                        key={`preload-${social.name}`}
                        rel="preload"
                        href={social.image}
                        as="image"
                    />
                ))}
            </div>

            {/* Screen reader announcements */}
            {announcementText && (
                <div
                    className="sr-only"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {announcementText}
                </div>
            )}

            {/* Hidden description for screen readers */}
            <div id="social-links-description" className="sr-only">
                Social media links with 3D hover effects. Use Tab to navigate between icons, Enter or Space to open links, and arrow keys for quick navigation.
            </div>
        </motion.div>
    );
}

export default SocialLinks3D;