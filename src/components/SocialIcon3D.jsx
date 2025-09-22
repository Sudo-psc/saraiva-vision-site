import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * SocialIcon3D Component
 * 
 * A 3D interactive social media icon with glass morphism effects, hover animations,
 * and liquid bubble transformations. Implements perspective transforms and depth shadows
 * for a realistic 3D appearance.
 * 
 * Requirements covered: 2.1, 2.2, 2.4, 2.5
 */

const SocialIcon3D = ({
    social,
    index,
    isHovered,
    onHover,
    className,
    ...props
}) => {
    const [isClicked, setIsClicked] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Handle mouse movement for dynamic 3D rotation based on cursor position
    const handleMouseMove = useCallback((e) => {
        if (!isHovered) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        setMousePosition({ x: mouseX, y: mouseY });
    }, [isHovered]);

    // Handle hover state changes
    const handleMouseEnter = useCallback(() => {
        onHover(social.name);
    }, [social.name, onHover]);

    const handleMouseLeave = useCallback(() => {
        onHover(null);
        setMousePosition({ x: 0, y: 0 });
    }, [onHover]);

    // Handle click animation
    const handleClick = useCallback((e) => {
        e.preventDefault();
        setIsClicked(true);

        // Reset click state after animation
        setTimeout(() => {
            setIsClicked(false);
            // Open link after animation completes
            if (social.href) {
                window.open(social.href, '_blank', 'noopener,noreferrer');
            }
        }, 200);
    }, [social.href]);

    // Calculate dynamic rotation based on mouse position
    const rotateX = isHovered ? (mousePosition.y / 10) * -1 : 0;
    const rotateY = isHovered ? (mousePosition.x / 10) : 0;

    // Animation variants for the main icon container
    const iconVariants = {
        default: {
            scale: 1,
            rotateX: 0,
            rotateY: 0,
            translateZ: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3
            }
        },
        hovered: {
            scale: 1.1,
            rotateX: rotateX,
            rotateY: rotateY,
            translateZ: 50,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25,
                duration: 0.2
            }
        },
        clicked: {
            scale: 0.95,
            rotateX: rotateX,
            rotateY: rotateY,
            translateZ: 30,
            transition: {
                type: "spring",
                stiffness: 600,
                damping: 20,
                duration: 0.1
            }
        }
    };

    // Get current animation state
    const getCurrentVariant = () => {
        if (isClicked) return 'clicked';
        if (isHovered) return 'hovered';
        return 'default';
    };

    return (
        <div
            className={cn(
                "relative cursor-pointer select-none",
                "transform-gpu", // Enable GPU acceleration
                className
            )}
            style={{
                perspective: "1000px",
                transformStyle: "preserve-3d"
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            {...props}
        >
            {/* Main Icon Container with 3D transforms */}
            <motion.div
                className="relative z-10"
                variants={iconVariants}
                animate={getCurrentVariant()}
                style={{
                    transformStyle: "preserve-3d"
                }}
            >
                {/* Icon Image with enhanced styling */}
                <motion.div
                    className={cn(
                        "relative w-12 h-12 rounded-full overflow-hidden",
                        "bg-white/10 backdrop-blur-sm",
                        "border border-white/20",
                        "transition-all duration-300",
                        // Multiple layered shadows for depth
                        "shadow-[0_4px_8px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1),0_16px_32px_rgba(0,0,0,0.1)]",
                        isHovered && "shadow-[0_8px_16px_rgba(0,0,0,0.2),0_16px_32px_rgba(0,0,0,0.15),0_32px_64px_rgba(0,0,0,0.1)]"
                    )}
                >
                    <img
                        src={social.image}
                        alt={social.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                    />

                    {/* Glass overlay effect */}
                    <div
                        className={cn(
                            "absolute inset-0",
                            "bg-gradient-to-br from-white/20 via-transparent to-transparent",
                            "opacity-0 transition-opacity duration-300",
                            isHovered && "opacity-100"
                        )}
                    />
                </motion.div>

                {/* Icon label */}
                <motion.span
                    className={cn(
                        "absolute -bottom-8 left-1/2 transform -translate-x-1/2",
                        "text-xs font-medium text-white/80",
                        "whitespace-nowrap pointer-events-none",
                        "transition-all duration-300",
                        isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    )}
                >
                    {social.name}
                </motion.span>
            </motion.div>

            {/* Glass Bubble Effect */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            transformStyle: "preserve-3d"
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Main glass bubble */}
                        <div
                            className={cn(
                                "absolute inset-0 rounded-full",
                                "bg-gradient-to-br from-white/10 via-white/5 to-transparent",
                                "backdrop-blur-md border border-white/20",
                                "transform-gpu"
                            )}
                            style={{
                                transform: `translateZ(-20px) scale(1.5)`,
                                filter: "blur(0.5px)"
                            }}
                        />

                        {/* Secondary bubble layer for liquid effect */}
                        <motion.div
                            className={cn(
                                "absolute inset-0 rounded-full",
                                "bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10",
                                "backdrop-blur-lg border border-white/10"
                            )}
                            style={{
                                transform: `translateZ(-30px) scale(1.8)`,
                            }}
                            animate={{
                                scale: [1.8, 2.0, 1.8],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />

                        {/* Tertiary bubble for depth */}
                        <motion.div
                            className={cn(
                                "absolute inset-0 rounded-full",
                                "bg-gradient-to-br from-white/5 to-transparent",
                                "backdrop-blur-2xl border border-white/5"
                            )}
                            style={{
                                transform: `translateZ(-40px) scale(2.2)`,
                            }}
                            animate={{
                                scale: [2.2, 2.5, 2.2],
                                opacity: [0.1, 0.2, 0.1],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Depth shadows - multiple layers for realistic 3D appearance */}
            <div
                className={cn(
                    "absolute inset-0 pointer-events-none",
                    "transition-all duration-300",
                    isHovered ? "opacity-100" : "opacity-0"
                )}
                style={{
                    transform: `translateZ(-60px) scale(0.8)`,
                }}
            >
                {/* Primary shadow */}
                <div
                    className="absolute inset-0 rounded-full bg-black/20 blur-md"
                    style={{ transform: "translateY(10px)" }}
                />

                {/* Secondary shadow for more depth */}
                <div
                    className="absolute inset-0 rounded-full bg-black/10 blur-lg"
                    style={{ transform: "translateY(20px) scale(1.2)" }}
                />

                {/* Tertiary shadow for maximum depth */}
                <div
                    className="absolute inset-0 rounded-full bg-black/5 blur-xl"
                    style={{ transform: "translateY(30px) scale(1.4)" }}
                />
            </div>
        </div>
    );
};

export default React.memo(SocialIcon3D);