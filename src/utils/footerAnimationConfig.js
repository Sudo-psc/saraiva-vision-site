/**
 * Enhanced Footer Animation Configuration
 * Optimized timing and easing functions for smooth interactions
 * Requirements: 2.4, 3.4
 */

// Optimized easing functions for different animation types
export const easingFunctions = {
    // Smooth entrance animations
    entrance: [0.4, 0, 0.2, 1], // cubic-bezier for smooth entry

    // Interactive hover animations
    hover: [0.25, 0.46, 0.45, 0.94], // easeOutQuart for responsive feel

    // Glass morphism transitions
    glass: [0.16, 1, 0.3, 1], // easeOutExpo for liquid feel

    // 3D transform animations
    transform3D: [0.34, 1.56, 0.64, 1], // easeOutBack for bounce effect

    // Beam background animations
    beam: [0.25, 0.1, 0.25, 1], // easeOut for continuous motion

    // Exit animations
    exit: [0.4, 0, 1, 1], // easeInOut for clean exit

    // Spring animations for social icons
    spring: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 1
    },

    // Gentle spring for glass effects
    gentleSpring: {
        type: "spring",
        stiffness: 200,
        damping: 25,
        mass: 0.8
    }
};

// Optimized timing configurations
export const timingConfig = {
    // Footer container animations
    container: {
        entrance: 0.6,
        exit: 0.4
    },

    // Glass layer animations
    glass: {
        entrance: 0.8,
        exit: 0.5,
        delay: 0.2
    },

    // Social icon animations
    socialIcon: {
        hover: 0.2,
        transform: 0.3,
        bubble: 0.4,
        stagger: 0.1
    },

    // Beam background animations
    beam: {
        particle: 2.0,
        wave: 3.0,
        fade: 1.5
    },

    // Scroll to top button
    scrollButton: {
        hover: 0.2,
        press: 0.1,
        transform: 0.25
    }
};

// Animation variants for different components
export const animationVariants = {
    // Enhanced Footer container
    footerContainer: {
        hidden: {
            opacity: 0,
            y: 50,
            scale: 0.98
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: timingConfig.container.entrance,
                ease: easingFunctions.entrance,
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            y: 30,
            scale: 0.95,
            transition: {
                duration: timingConfig.container.exit,
                ease: easingFunctions.exit
            }
        }
    },

    // Glass morphism layer
    glassLayer: {
        hidden: {
            opacity: 0,
            scale: 0.95,
            y: 20,
            backdropFilter: "blur(0px)"
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            backdropFilter: "blur(20px)",
            transition: {
                duration: timingConfig.glass.entrance,
                ease: easingFunctions.glass,
                delay: timingConfig.glass.delay
            }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: 10,
            backdropFilter: "blur(0px)",
            transition: {
                duration: timingConfig.glass.exit,
                ease: easingFunctions.exit
            }
        }
    },

    // Social icon 3D animations
    socialIcon3D: {
        default: {
            rotateX: 0,
            rotateY: 0,
            translateZ: 0,
            scale: 1,
            transition: {
                duration: timingConfig.socialIcon.transform,
                ease: easingFunctions.hover
            }
        },
        hover: {
            rotateX: -15,
            rotateY: 15,
            translateZ: 50,
            scale: 1.1,
            transition: {
                duration: timingConfig.socialIcon.hover,
                ease: easingFunctions.transform3D
            }
        },
        tap: {
            scale: 0.95,
            rotateX: -10,
            rotateY: 10,
            transition: {
                duration: timingConfig.socialIcon.hover * 0.5,
                ease: easingFunctions.hover
            }
        }
    },

    // Glass bubble effect for social icons
    glassBubble: {
        hidden: {
            scale: 0,
            opacity: 0,
            backdropFilter: "blur(0px)"
        },
        visible: {
            scale: 1,
            opacity: 1,
            backdropFilter: "blur(15px)",
            transition: {
                duration: timingConfig.socialIcon.bubble,
                ease: easingFunctions.glass,
                type: "spring",
                stiffness: 200,
                damping: 20
            }
        },
        exit: {
            scale: 0.8,
            opacity: 0,
            backdropFilter: "blur(0px)",
            transition: {
                duration: timingConfig.socialIcon.hover,
                ease: easingFunctions.exit
            }
        }
    },

    // Scroll to top button
    scrollButton: {
        default: {
            scale: 1,
            rotateY: 0,
            transition: {
                duration: timingConfig.scrollButton.transform,
                ease: easingFunctions.hover
            }
        },
        hover: {
            scale: 1.1,
            rotateY: 10,
            transition: {
                duration: timingConfig.scrollButton.hover,
                ease: easingFunctions.transform3D
            }
        },
        tap: {
            scale: 0.95,
            transition: {
                duration: timingConfig.scrollButton.press,
                ease: easingFunctions.hover
            }
        }
    },

    // Stagger animation for footer sections
    footerSection: {
        hidden: {
            opacity: 0,
            y: 30
        },
        visible: (index) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: easingFunctions.entrance,
                delay: index * 0.1
            }
        })
    }
};

// Performance-optimized animation settings
export const performanceConfig = {
    // Reduced motion settings
    reducedMotion: {
        duration: 0,
        ease: "linear",
        spring: {
            type: "tween",
            duration: 0
        }
    },

    // Low performance device settings
    lowPerformance: {
        duration: timingConfig.container.entrance * 0.5,
        ease: easingFunctions.entrance,
        disableTransforms: true,
        disableBackdropFilter: true
    },

    // Mobile optimizations
    mobile: {
        duration: timingConfig.container.entrance * 0.8,
        ease: easingFunctions.entrance,
        reduceComplexity: true,
        simplifyTransforms: true
    }
};

// Responsive animation adjustments
export const responsiveAnimations = {
    mobile: {
        socialIcon: {
            hover: timingConfig.socialIcon.hover * 1.2, // Slightly slower for touch
            transform: timingConfig.socialIcon.transform * 0.8
        },
        glass: {
            entrance: timingConfig.glass.entrance * 0.7,
            delay: timingConfig.glass.delay * 0.5
        }
    },

    tablet: {
        socialIcon: {
            hover: timingConfig.socialIcon.hover * 1.1,
            transform: timingConfig.socialIcon.transform * 0.9
        },
        glass: {
            entrance: timingConfig.glass.entrance * 0.85,
            delay: timingConfig.glass.delay * 0.7
        }
    },

    desktop: {
        // Use default timings for desktop
        ...timingConfig
    }
};

// Animation utility functions
export const getOptimizedVariant = (baseVariant, deviceCapabilities, reducedMotion) => {
    if (reducedMotion) {
        return {
            ...baseVariant,
            transition: performanceConfig.reducedMotion
        };
    }

    if (deviceCapabilities.performanceLevel === 'low') {
        return {
            ...baseVariant,
            transition: {
                ...baseVariant.transition,
                ...performanceConfig.lowPerformance
            }
        };
    }

    return baseVariant;
};

export const getResponsiveTimings = (screenSize) => {
    return responsiveAnimations[screenSize] || responsiveAnimations.desktop;
};

// Stagger configuration for multiple elements
export const staggerConfig = {
    footerSections: {
        staggerChildren: 0.1,
        delayChildren: 0.2
    },
    socialIcons: {
        staggerChildren: 0.05,
        delayChildren: 0.3
    },
    glassElements: {
        staggerChildren: 0.15,
        delayChildren: 0.1
    }
};

export default {
    easingFunctions,
    timingConfig,
    animationVariants,
    performanceConfig,
    responsiveAnimations,
    getOptimizedVariant,
    getResponsiveTimings,
    staggerConfig
};