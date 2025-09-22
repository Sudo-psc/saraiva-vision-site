import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import SocialIcon3D from '@/components/SocialIcon3D';

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

    // Handle individual icon hover states
    const handleIconHover = useCallback((socialName: string | null) => {
        setHoveredSocial(socialName);
    }, []);

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

    // Container animation variants
    const containerVariants = {
        default: {
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        hovered: {
            scale: 1.02,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
            }
        }
    };

    // Stagger animation for icons
    const iconsContainerVariants = {
        default: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0
            }
        },
        hovered: {
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            className={cn(
                "relative flex items-center justify-center",
                getSpacingClass(),
                // Glass morphism container styling
                enableGlassContainer && [
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
            variants={containerVariants}
            animate={containerHovered ? 'hovered' : 'default'}
            onMouseEnter={handleContainerEnter}
            onMouseLeave={handleContainerLeave}
            style={{
                perspective: "1200px",
                transformStyle: "preserve-3d"
            }}
            {...props}
        >
            {/* Background glow effect */}
            {containerHovered && (
                <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                >
                    <div
                        className={cn(
                            "absolute inset-0 rounded-2xl",
                            "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10",
                            "blur-xl"
                        )}
                    />
                </motion.div>
            )}

            {/* Icons container with stagger animation */}
            <motion.div
                className="relative flex items-center gap-inherit"
                variants={iconsContainerVariants}
                animate={containerHovered ? 'hovered' : 'default'}
                style={{
                    transformStyle: "preserve-3d"
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
                        initial={{ opacity: 0, y: 20, rotateX: -90 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            rotateX: 0,
                            transition: {
                                delay: index * 0.1,
                                type: "spring",
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
            {hoveredSocial && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
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
        </motion.div>
    );
}

export default SocialLinks3D;