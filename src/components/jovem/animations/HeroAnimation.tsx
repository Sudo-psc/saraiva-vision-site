/**
 * Hero Animation Component
 * Animated hero section for Jovem profile
 * Features: gradient background, staggered text reveal, floating CTA
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../../lib/animations/hooks';
import { staggerContainer, staggerItem, gradientAnimation, float } from '../../../lib/animations/variants';

export interface HeroAnimationProps {
  title: string;
  subtitle?: string;
  cta?: React.ReactNode;
  backgroundGradient?: [string, string];
  className?: string;
}

export const HeroAnimation: React.FC<HeroAnimationProps> = ({
  title,
  subtitle,
  cta,
  backgroundGradient = ['#667eea', '#764ba2'],
  className = ''
}) => {
  const prefersReducedMotion = useReducedMotion();

  const titleWords = title.split(' ');

  return (
    <div className={`hero-animation relative overflow-hidden ${className}`}>
      {/* Animated Gradient Background */}
      {!prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 -z-10"
          style={{
            background: `linear-gradient(135deg, ${backgroundGradient[0]} 0%, ${backgroundGradient[1]} 100%)`,
            backgroundSize: '200% 200%'
          }}
          variants={gradientAnimation}
          initial="initial"
          animate="animate"
        />
      )}

      {/* Content Container */}
      <motion.div
        className="hero-content relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4 py-16 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Title with Staggered Word Animation */}
        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          variants={staggerContainer}
        >
          {titleWords.map((word, index) => (
            <motion.span
              key={index}
              className="inline-block mr-3"
              variants={staggerItem}
              style={{ willChange: 'transform, opacity' }}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            className="text-xl md:text-2xl text-white/90 max-w-2xl mb-8"
            variants={staggerItem}
            style={{ willChange: 'transform, opacity' }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* CTA with Float Animation */}
        {cta && (
          <motion.div
            variants={prefersReducedMotion ? staggerItem : float}
            initial={prefersReducedMotion ? "hidden" : "initial"}
            animate={prefersReducedMotion ? "visible" : "animate"}
            style={{ willChange: 'transform' }}
          >
            {cta}
          </motion.div>
        )}

        {/* Scroll Indicator */}
        {!prefersReducedMotion && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            variants={float}
            initial="initial"
            animate="animate"
          >
            <div className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2">
              <motion.div
                className="w-1 h-2 bg-white/50 rounded-full"
                animate={{
                  y: [0, 12, 0],
                  opacity: [1, 0, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Decorative Elements */}
      {!prefersReducedMotion && (
        <>
          {/* Floating Orbs */}
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/10 backdrop-blur-md"
            animate={{
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{ willChange: 'transform' }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white/10 backdrop-blur-md"
            animate={{
              y: [0, 20, 0],
              scale: [1, 1.15, 1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
            style={{ willChange: 'transform' }}
          />
        </>
      )}
    </div>
  );
};

export default HeroAnimation;
