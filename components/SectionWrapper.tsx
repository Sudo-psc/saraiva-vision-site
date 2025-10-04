'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import type { SectionWrapperProps } from '@/types/navigation';
import { cn } from '@/lib/utils';

/**
 * SectionWrapper Component
 * Design System compliant section component with lazy loading
 *
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Framer Motion animations (respects prefers-reduced-motion)
 * - WCAG AAA compliant with proper heading hierarchy
 * - 8pt spacing system
 * - Proper typography hierarchy
 * - Server/Client component separation ready
 *
 * Design Guidelines:
 * - Single headline per section
 * - One short paragraph (max 70 characters per line)
 * - Clear CTAs when needed
 * - Consistent spacing using design tokens
 *
 * @example
 * <SectionWrapper
 *   title="Our Services"
 *   subtitle="Professional eye care solutions"
 *   overline="What We Offer"
 *   cta={<Button>Learn More</Button>}
 * >
 *   <ServiceGrid />
 * </SectionWrapper>
 */
export default function SectionWrapper({
  id,
  children,
  title,
  subtitle,
  overline,
  cta,
  className = '',
  spacing = 'section',
  background = 'bg-white',
  maxWidth = 'max-w-4xl',
  titleLevel = 'h2',
  centerContent = true,
  titleSize = 'heading-xl md:text-display-sm',
  enableAnimations = true,
  ...props
}: SectionWrapperProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const shouldReduceMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle lazy loading
  useEffect(() => {
    if (isInView && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isInView, isLoaded]);

  const TitleComponent = titleLevel as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const spacingClass = `py-${spacing}`;
  const contentAlignment = centerContent ? 'text-center' : 'text-left';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1] as any
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.3,
        ease: [0.25, 0.1, 0.25, 1] as any
      }
    }
  };

  // Disable animations if reduced motion is preferred or disabled
  const animationsEnabled = enableAnimations && !shouldReduceMotion;

  return (
    <motion.section
      id={id}
      ref={ref}
      className={cn(spacingClass, background, className)}
      variants={animationsEnabled ? containerVariants : undefined}
      initial={animationsEnabled ? 'hidden' : undefined}
      animate={animationsEnabled && isInView ? 'visible' : undefined}
      {...props}
    >
      <div className="container mx-auto px-4 md:px-6">
        {(title || subtitle || overline) && (
          <div className={cn(contentAlignment, 'mb-16 md:mb-24')}>
            {overline && (
              <motion.div
                variants={animationsEnabled ? itemVariants : undefined}
                className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6 w-fit mx-auto"
              >
                {overline}
              </motion.div>
            )}

            {title && (
              <motion.div
                variants={animationsEnabled ? itemVariants : undefined}
              >
                <TitleComponent
                  className={cn(
                    `text-${titleSize} font-bold leading-tight mb-6`,
                    'text-slate-900'
                  )}
                >
                  {title}
                </TitleComponent>
              </motion.div>
            )}

            {subtitle && (
              <motion.p
                variants={animationsEnabled ? itemVariants : undefined}
                className={cn(
                  'text-lg md:text-xl leading-relaxed',
                  maxWidth,
                  'mx-auto text-slate-600'
                )}
              >
                {subtitle}
              </motion.p>
            )}

            {cta && (
              <motion.div
                variants={animationsEnabled ? itemVariants : undefined}
                className="mt-8"
              >
                {cta}
              </motion.div>
            )}
          </div>
        )}

        {children && (
          <motion.div
            variants={animationsEnabled ? childVariants : undefined}
          >
            {isLoaded ? children : (
              <div className="min-h-[200px] flex items-center justify-center">
                <LoadingSpinner />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}

/**
 * Compact variant with minimal spacing
 */
export function SectionWrapperCompact({
  children,
  className = '',
  background = 'bg-white',
  ...props
}: Pick<SectionWrapperProps, 'children' | 'className' | 'background' | 'id'>) {
  return (
    <section
      className={cn('py-8 md:py-12', background, className)}
      {...props}
    >
      <div className="container mx-auto px-4 md:px-6">
        {children}
      </div>
    </section>
  );
}

/**
 * Grid variant for multi-column layouts
 */
export function SectionWrapperGrid({
  title,
  subtitle,
  children,
  columns = 3,
  gap = 8,
  className = '',
  background = 'bg-white',
  ...props
}: SectionWrapperProps & { columns?: number; gap?: number }) {
  return (
    <SectionWrapper
      title={title}
      subtitle={subtitle}
      className={className}
      background={background}
      {...props}
    >
      <div
        className={cn(
          'grid gap-${gap}',
          `grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`
        )}
      >
        {children}
      </div>
    </SectionWrapper>
  );
}

/**
 * Loading spinner component
 */
function LoadingSpinner() {
  return (
    <div
      className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"
      role="status"
      aria-label="Carregando conteúdo"
    >
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

/**
 * Hook for section visibility tracking
 */
export function useSectionInView(options?: any) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px',
    ...options
  });

  return { ref, isInView };
}

/**
 * Server Component variant (no animations, no lazy loading)
 * Use this for above-the-fold content or when SSR is critical
 */
export function SectionWrapperServer({
  id,
  children,
  title,
  subtitle,
  overline,
  cta,
  className = '',
  spacing = 'section',
  background = 'bg-white',
  maxWidth = 'max-w-4xl',
  titleLevel = 'h2',
  centerContent = true,
  titleSize = 'heading-xl md:text-display-sm'
}: Omit<SectionWrapperProps, 'enableAnimations'>) {
  const TitleComponent = titleLevel as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

  const spacingClass = `py-${spacing}`;
  const contentAlignment = centerContent ? 'text-center' : 'text-left';

  return (
    <section
      id={id}
      className={cn(spacingClass, background, className)}
    >
      <div className="container mx-auto px-4 md:px-6">
        {(title || subtitle || overline) && (
          <div className={cn(contentAlignment, 'mb-16 md:mb-24')}>
            {overline && (
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6 w-fit mx-auto">
                {overline}
              </div>
            )}

            {title && (
              <TitleComponent
                className={cn(
                  `text-${titleSize} font-bold leading-tight mb-6`,
                  'text-slate-900'
                )}
              >
                {title}
              </TitleComponent>
            )}

            {subtitle && (
              <p
                className={cn(
                  'text-lg md:text-xl leading-relaxed',
                  maxWidth,
                  'mx-auto text-slate-600'
                )}
              >
                {subtitle}
              </p>
            )}

            {cta && (
              <div className="mt-8">
                {cta}
              </div>
            )}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
