'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScrollToTopProps, ScrollProgress } from '@/types/navigation';
import { cn } from '@/lib/utils';

/**
 * ScrollToTop Component
 * Scrolls to top on route changes + floating button with progress indicator
 *
 * Features:
 * - Auto-scroll on navigation (Next.js 15 App Router)
 * - Floating button appears after scrolling threshold
 * - Circular progress indicator showing scroll position
 * - WCAG AAA accessibility with keyboard support
 * - Smooth scroll animation
 * - Skip link integration (skip to top)
 *
 * @example
 * // Default usage (auto-scroll on navigation)
 * <ScrollToTop />
 *
 * @example
 * // With button appearing after 400px
 * <ScrollToTop showAt={400} />
 */
export default function ScrollToTop({
  showAt = 300,
  smooth = true,
  className = '',
  icon,
  ariaLabel = 'Voltar ao topo da página',
  behavior = 'smooth'
}: ScrollToTopProps) {
  const pathname = usePathname();
  const [scrollProgress, setScrollProgress] = useState<ScrollProgress>({
    progress: 0,
    isVisible: false
  });

  // Calculate scroll progress
  const calculateScrollProgress = useCallback(() => {
    if (typeof window === 'undefined') return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const isVisible = scrollTop > showAt;

    setScrollProgress({ progress, isVisible });
  }, [showAt]);

  // Handle scroll events with throttling
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateScrollProgress, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    calculateScrollProgress(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [calculateScrollProgress]);

  // Auto-scroll to top on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }, 10);

    return () => clearTimeout(timer);
  }, [pathname, smooth]);

  // Scroll to top handler
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: behavior
    });
  }, [behavior]);

  // Keyboard handler
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      scrollToTop();
    }
  }, [scrollToTop]);

  // Progress circle radius and circumference
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress.progress / 100) * circumference;

  return (
    <AnimatePresence>
      {scrollProgress.isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel}
          title={ariaLabel}
          className={cn(
            'fixed bottom-8 right-8 z-50',
            'w-12 h-12 rounded-full',
            'bg-gradient-to-br from-blue-500 to-blue-600',
            'text-white shadow-lg hover:shadow-xl',
            'flex items-center justify-center',
            'focus:outline-none focus-visible:ring-2',
            'focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            'transition-shadow duration-200',
            'group relative',
            className
          )}
        >
          {/* Progress circle */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-white/20"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-white transition-all duration-100"
            />
          </svg>

          {/* Icon */}
          <span className="relative z-10 group-hover:scale-110 transition-transform duration-200">
            {icon || <ArrowUp className="w-5 h-5" aria-hidden="true" />}
          </span>

          {/* Tooltip */}
          <span
            className={cn(
              'absolute bottom-full right-0 mb-2',
              'px-3 py-1.5 rounded-lg',
              'bg-slate-900 text-white text-sm',
              'whitespace-nowrap opacity-0',
              'group-hover:opacity-100 group-focus:opacity-100',
              'transition-opacity duration-200',
              'pointer-events-none'
            )}
            aria-hidden="true"
          >
            Voltar ao topo
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * Simple variant without progress indicator
 */
export function ScrollToTopSimple({
  showAt = 300,
  className = '',
  ariaLabel = 'Voltar ao topo da página'
}: Pick<ScrollToTopProps, 'showAt' | 'className' | 'ariaLabel'>) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.pageYOffset > showAt);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAt]);

  // Auto-scroll on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        'fixed bottom-8 right-8 z-50',
        'w-12 h-12 rounded-full',
        'bg-blue-600 hover:bg-blue-700',
        'text-white shadow-lg',
        'flex items-center justify-center',
        'focus:outline-none focus-visible:ring-2',
        'focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'transition-colors duration-200',
        className
      )}
    >
      <ArrowUp className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}

/**
 * Hook for programmatic scroll to top
 */
export function useScrollToTop() {
  const scrollToTop = useCallback((smooth = true) => {
    window.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  const scrollToElement = useCallback((elementId: string, smooth = true, offset = 0) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }, []);

  return { scrollToTop, scrollToElement };
}

/**
 * Skip to top link for accessibility
 * Should be placed at the top of the page, visually hidden unless focused
 */
export function SkipToTop({ href = '#top' }: { href?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-4 focus:left-4 focus:z-50',
        'px-4 py-2 rounded-lg',
        'bg-blue-600 text-white font-medium',
        'focus:outline-none focus-visible:ring-2',
        'focus-visible:ring-blue-500 focus-visible:ring-offset-2'
      )}
    >
      Voltar ao topo
    </a>
  );
}
