/**
 * ParallaxSection Component
 * Section with parallax scrolling effect
 * GPU-accelerated for smooth 60fps performance
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useParallax, useParallaxScale, useParallaxOpacity } from '../../../lib/animations/hooks';
import { useReducedMotion } from '../../../lib/animations/hooks';

export interface ParallaxSectionProps {
  children: React.ReactNode;
  /**
   * Parallax speed (-1 to 1, default: 0.5)
   */
  speed?: number;
  /**
   * Enable scale effect (default: false)
   */
  scale?: boolean;
  /**
   * Enable opacity fade (default: false)
   */
  fade?: boolean;
  /**
   * Smooth the parallax effect (default: true)
   */
  smooth?: boolean;
  /**
   * Background image URL
   */
  backgroundImage?: string;
  /**
   * Background overlay color
   */
  overlay?: string;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Min height (default: '50vh')
   */
  minHeight?: string;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  speed = 0.5,
  scale = false,
  fade = false,
  smooth = true,
  backgroundImage,
  overlay,
  className = '',
  minHeight = '50vh'
}) => {
  const prefersReducedMotion = useReducedMotion();

  const y = useParallax({ speed, smooth });
  const scaleValue = useParallaxScale({ speed: speed * 0.2, smooth });
  const opacity = useParallaxOpacity({ speed: speed * 0.3, smooth });

  // Disable parallax if reduced motion is preferred
  if (prefersReducedMotion) {
    return (
      <div
        className={`parallax-section relative ${className}`}
        style={{
          minHeight,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {overlay && (
          <div
            className="absolute inset-0 z-0"
            style={{ backgroundColor: overlay }}
          />
        )}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`parallax-section relative overflow-hidden ${className}`}
      style={{ minHeight }}
    >
      {/* Parallax Background */}
      {backgroundImage && (
        <motion.div
          className="absolute inset-0 -z-10"
          style={{
            y,
            scale: scale ? scaleValue : 1,
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform'
          }}
        />
      )}

      {/* Overlay */}
      {overlay && (
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: overlay,
            opacity: fade ? opacity : 1,
            willChange: fade ? 'opacity' : 'auto'
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

/**
 * Parallax Layer Component
 * Individual layer with independent parallax speed
 */
export interface ParallaxLayerProps {
  children: React.ReactNode;
  /**
   * Parallax speed for this layer (-1 to 1)
   */
  speed: number;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Z-index for layering
   */
  zIndex?: number;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed,
  className = '',
  zIndex = 0
}) => {
  const prefersReducedMotion = useReducedMotion();
  const y = useParallax({ speed, smooth: true });

  if (prefersReducedMotion) {
    return (
      <div className={className} style={{ zIndex }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      style={{
        y,
        zIndex,
        willChange: 'transform'
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Parallax Container Component
 * Container for multiple parallax layers
 */
export interface ParallaxContainerProps {
  children: React.ReactNode;
  /**
   * Additional className
   */
  className?: string;
  /**
   * Min height (default: '100vh')
   */
  minHeight?: string;
}

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  className = '',
  minHeight = '100vh'
}) => {
  return (
    <div
      className={`parallax-container relative overflow-hidden ${className}`}
      style={{ minHeight }}
    >
      {children}
    </div>
  );
};

export default ParallaxSection;
