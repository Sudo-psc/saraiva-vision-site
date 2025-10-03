/**
 * Framer Motion Animation Variants Library
 * Reusable animation variants for Jovem profile
 * Saraiva Vision - Performance-optimized animations
 */

import { Variants } from 'framer-motion';

/**
 * Fade In Variants
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Slide Up Variants
 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

/**
 * Slide Down Variants
 */
export const slideDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

/**
 * Slide Left Variants
 */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

/**
 * Slide Right Variants
 */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

/**
 * Scale In Variants
 */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

/**
 * Stagger Container Variants
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

/**
 * Stagger Item Variants
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
};

/**
 * Card Hover Variants (Jovem Profile)
 */
export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 8px 24px rgba(217, 70, 239, 0.15)'
  },
  hover: {
    scale: 1.05,
    y: -8,
    boxShadow: '0 20px 40px rgba(217, 70, 239, 0.3)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  }
};

/**
 * Button Hover Variants (Jovem Profile)
 */
export const buttonHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.05,
    y: -2,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1
    }
  }
};

/**
 * Gradient Background Animation Variants
 */
export const gradientAnimation: Variants = {
  initial: {
    backgroundPosition: '0% 50%'
  },
  animate: {
    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    transition: {
      duration: 10,
      ease: 'linear',
      repeat: Infinity
    }
  }
};

/**
 * Pulse Variants (for Popular/Featured tags)
 */
export const pulse: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

/**
 * Float Variants (for scroll indicators)
 */
export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

/**
 * Flip Card Variants
 */
export const flipCard: Variants = {
  front: {
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  back: {
    rotateY: 180,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

/**
 * Shimmer Loading Variants
 */
export const shimmer: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity
    }
  }
};

/**
 * Page Transition Variants
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

/**
 * Scroll Reveal Variants
 */
export const scrollReveal: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

/**
 * Number Counter Variants
 */
export const numberCounter: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15
    }
  }
};

/**
 * Magnetic Effect Variants (for interactive elements)
 */
export const magnetic = {
  whileHover: {
    scale: 1.1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

/**
 * Ripple Effect Variants
 */
export const ripple: Variants = {
  initial: { scale: 0, opacity: 1 },
  animate: {
    scale: 2,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

/**
 * Accordion Variants
 */
export const accordion: Variants = {
  closed: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.3,
        ease: [0.04, 0.62, 0.23, 0.98]
      },
      opacity: {
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  },
  open: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
        ease: [0.04, 0.62, 0.23, 0.98]
      },
      opacity: {
        duration: 0.25,
        delay: 0.05,
        ease: 'easeIn'
      }
    }
  }
};

export default {
  fadeIn,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  staggerContainer,
  staggerItem,
  cardHover,
  buttonHover,
  gradientAnimation,
  pulse,
  float,
  flipCard,
  shimmer,
  pageTransition,
  scrollReveal,
  numberCounter,
  magnetic,
  ripple,
  accordion
};
