// Unified component interface exports
// Central export point for all UI components with unified interfaces

// Base components
export { default as MedicalCard } from './MedicalCard';
export { default as InteractiveCarousel } from './InteractiveCarousel';
export { default as SafeImage } from './SafeImage';
export { default as OptimizedImage } from './OptimizedImage';

// Existing UI components
export { Button } from './button';
export { toast, useToast } from './toast';
export { Toaster } from './toaster';

// Component-specific exports
export { default as PodcastEpisodeCard } from '../PodcastEpisodeCard';
export { default as ServicesEnhanced } from '../ServicesEnhanced';
export { default as PodcastPageEnhanced } from '../../pages/PodcastPageEnhanced';

// Type exports for TypeScript support
export type {
  BaseCardProps,
  MediaContent,
  ActionButton,
  PodcastEpisode,
  AudioPlayerProps,
  InteractiveCarouselProps,
  ServiceItem,
  MedicalSEOProps,
  Size,
  Variant,
  ColorTheme,
  BorderRadius,
  HoverEffect,
  MotionPreset,
  AspectRatio
} from '../../types/components';

// Utility exports
export {
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
} from '../../utils/componentUtils';

// Hook exports
export {
  useAnimationConfig,
  useMediaLoader,
  useCarousel,
  useAccessibility,
  useFocusManagement
} from '../../hooks/useUnifiedComponents';