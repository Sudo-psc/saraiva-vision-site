// Utility functions for unified component interfaces
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Size, Variant, ColorTheme, BorderRadius, HoverEffect, MotionPreset } from '@/types/components';

// Enhanced className utility with Tailwind merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Size mapping utilities
export const getSizeClasses = (size: Size): string => {
  const sizeMap = {
    compact: 'p-4 min-w-[240px] max-w-[280px]',
    standard: 'p-6 md:p-8 min-w-[260px] max-w-[300px] md:min-w-[280px] md:max-w-[320px]',
    featured: 'p-8 md:p-10 lg:p-12 min-w-[320px] max-w-[400px]',
    hero: 'p-10 md:p-12 lg:p-16 min-w-[400px] max-w-[600px]'
  };
  return sizeMap[size];
};

// Variant-based styling
export const getVariantClasses = (variant: Variant): string => {
  const variantMap = {
    service: 'glass-morphism gradient-border shadow-3d hover:shadow-3d-hover',
    episode: 'glass-blue card-3d shadow-soft-light',
    testimonial: 'bg-white/80 backdrop-blur-sm shadow-lg',
    article: 'bg-gradient-to-br from-white to-slate-50/50 shadow-md',
    physician: 'bg-white shadow-xl border border-medical-blue-100'
  };
  return variantMap[variant];
};

// Color theme utilities
export const getThemeClasses = (theme: ColorTheme): string => {
  const themeMap = {
    medical: 'border-medical-blue-200/70 hover:border-medical-blue-300/80',
    trust: 'border-trust-green-200/70 hover:border-trust-green-300/80',
    brand: 'border-brand-blue-200/70 hover:border-brand-blue-300/80',
    none: 'border-slate-200/80 hover:border-blue-200/70'
  };
  return themeMap[theme];
};

// Border radius utilities
export const getBorderRadiusClasses = (radius: BorderRadius): string => {
  const radiusMap = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    '2xl': 'rounded-[1.5rem]',
    '3xl': 'rounded-[2rem]'
  };
  return radiusMap[radius];
};

// Hover effect utilities
export const getHoverEffectClasses = (effect: HoverEffect): string => {
  const effectMap = {
    subtle: 'hover:shadow-lg transition-shadow duration-300',
    pronounced: 'hover:shadow-2xl hover:scale-[1.02] transition-all duration-300',
    none: ''
  };
  return effectMap[effect];
};

// Motion preset utilities
export const getMotionPreset = (preset: MotionPreset) => {
  const presetMap = {
    entrance: {
      initial: { opacity: 0, y: 40, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { duration: 0.55, ease: 'easeOut' }
    },
    hover: {
      whileHover: { y: -6, rotateX: 6, rotateY: -6 },
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    exit: {
      exit: { opacity: 0, y: 10, scale: 0.98 },
      transition: { duration: 0.2 }
    },
    none: {}
  };
  return presetMap[preset];
};

// Interactive state utilities
export const getInteractiveClasses = (interactive: boolean, clickable: boolean): string => {
  if (!interactive) return '';
  
  const baseClasses = 'will-change-transform transform-gpu preserve-3d';
  const clickableClasses = clickable 
    ? 'cursor-pointer focus-within:ring-2 focus-within:ring-blue-500/20' 
    : '';
  
  return cn(baseClasses, clickableClasses);
};

// Accessibility utilities
export const getAccessibilityProps = (
  ariaLabel?: string,
  testId?: string,
  reducedMotion?: boolean
) => {
  return {
    'aria-label': ariaLabel,
    'data-testid': testId,
    'data-reduce-motion': reducedMotion,
    ...(reducedMotion && { 'data-no-animation': true })
  };
};

// Medical compliance utilities
export const getMedicalComplianceClasses = (cfmCompliant?: boolean): string => {
  return cfmCompliant ? 'medical-compliant' : '';
};

// Animation delay utilities
export const getAnimationDelay = (delay?: number): React.CSSProperties => {
  return delay ? { animationDelay: `${delay}s` } : {};
};

// Responsive utilities
export const getResponsiveClasses = (size: Size): string => {
  const responsiveMap = {
    compact: 'flex-shrink-0 snap-start',
    standard: 'flex-shrink-0 snap-start',
    featured: 'flex-shrink-0 snap-center',
    hero: 'flex-shrink-0 snap-center w-full'
  };
  return responsiveMap[size];
};

// Grid layout utilities
export const getGridLayoutClasses = (variant: Variant): string => {
  const gridMap = {
    service: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    episode: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6',
    testimonial: 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8',
    article: 'grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10',
    physician: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
  };
  return gridMap[variant];
};

// Validation utilities
export const validateImageSrc = (src: string): boolean => {
  if (!src) return false;
  // Basic validation for common image formats and paths
  return /\.(jpg|jpeg|png|gif|svg|webp|avif)$/i.test(src) || src.startsWith('/') || src.startsWith('data:');
};

export const validateAudioSrc = (src: string): boolean => {
  if (!src) return false;
  // Basic validation for common audio formats
  return /\.(mp3|wav|ogg|m4a|aac)$/i.test(src) || src.startsWith('/');
};

// Performance utilities
export const shouldLazyLoad = (lazy?: boolean, index?: number): boolean => {
  if (lazy === false) return false;
  if (lazy === true) return true;
  // Default: lazy load items after the first 3
  return (index ?? 0) > 2;
};

// Focus management utilities
export const manageFocus = (element: HTMLElement | null, shouldFocus: boolean = true) => {
  if (!element || !shouldFocus) return;
  
  // Ensure element is focusable
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '0');
  }
  
  // Focus with smooth scroll if needed
  element.focus({ preventScroll: false });
  element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export default {
  cn,
  getSizeClasses,
  getVariantClasses,
  getThemeClasses,
  getBorderRadiusClasses,
  getHoverEffectClasses,
  getMotionPreset,
  getInteractiveClasses,
  getAccessibilityProps,
  getMedicalComplianceClasses,
  getAnimationDelay,
  getResponsiveClasses,
  getGridLayoutClasses,
  validateImageSrc,
  validateAudioSrc,
  shouldLazyLoad,
  manageFocus,
  debounce,
  throttle
};