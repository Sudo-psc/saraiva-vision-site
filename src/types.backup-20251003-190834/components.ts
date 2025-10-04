// Base component interface types for unified medical clinic components
import { ReactNode, HTMLAttributes, MouseEvent, KeyboardEvent } from 'react';

// Base HTML element props type utility
export type BaseHTMLProps<T = HTMLDivElement> = Omit<HTMLAttributes<T>, 'children'>;

// Common variant types used across components
export type Size = 'compact' | 'standard' | 'featured' | 'hero';
export type Variant = 'service' | 'episode' | 'testimonial' | 'article' | 'physician';
export type ColorTheme = 'medical' | 'trust' | 'brand' | 'none';
export type BorderRadius = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type HoverEffect = 'subtle' | 'pronounced' | 'none';
export type MotionPreset = 'entrance' | 'hover' | 'exit' | 'none';
export type AspectRatio = '1:1' | '16:9' | '4:3' | 'auto';

// Media content interface
export interface MediaContent {
  type: 'image' | 'audio' | 'video' | 'icon';
  src: string;
  alt: string;
  aspectRatio?: AspectRatio;
  lazy?: boolean;
  placeholder?: string;
  className?: string;
}

// Action button interface
export interface ActionButton {
  label: string;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  icon?: ReactNode;
  href?: string;
  external?: boolean;
  disabled?: boolean;
  loading?: boolean;
  'aria-label'?: string;
}

// Base card properties interface
export interface BaseCardProps extends BaseHTMLProps<HTMLDivElement> {
  // Core Properties
  variant: Variant;
  size?: Size;
  
  // Visual Design
  glassMorphism?: boolean;
  shadow3D?: boolean;
  gradient?: ColorTheme;
  borderRadius?: BorderRadius;
  
  // Interactive Behavior
  interactive?: boolean;
  draggable?: boolean;
  clickable?: boolean;
  hoverEffects?: HoverEffect;
  
  // Accessibility & Compliance
  'aria-label'?: string;
  cfmCompliant?: boolean;
  'data-testid'?: string;
  reducedMotion?: boolean;
  
  // Content Structure
  header?: ReactNode;
  media?: MediaContent;
  body?: ReactNode;
  footer?: ReactNode;
  actions?: ActionButton[];
  
  // Animation Configuration
  animationDelay?: number;
  motionPreset?: MotionPreset;
  stagger?: boolean;
  
  // Event Handlers
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}

// Podcast-specific interfaces
export interface Chapter {
  title: string;
  startTime: number;
  endTime?: number;
  description?: string;
}

export interface PodcastEpisode {
  id: string;
  slug: string;
  title: string;
  description: string;
  src: string;
  cover: string;
  duration: string;
  date: string;
  category: string;
  tags: string[];
  featured?: boolean;
  transcript?: string;
  chapters?: Chapter[];
  spotifyUrl?: string;
}

// Audio player interface
export interface AudioPlayerProps {
  // Episode Management
  episode: PodcastEpisode;
  playlist?: PodcastEpisode[];
  autoPlay?: boolean;
  
  // UI Configuration
  mode: 'inline' | 'modal' | 'mini' | 'sticky';
  theme?: 'medical' | 'dark' | 'light' | 'auto';
  showTranscript?: boolean;
  showChapters?: boolean;
  
  // Player Controls
  playbackRate?: number[];
  skipTime?: number;
  autoNext?: boolean;
  shuffle?: boolean;
  repeat?: 'none' | 'one' | 'all';
  
  // Integration
  spotifyLink?: string;
  shareEnabled?: boolean;
  downloadEnabled?: boolean;
  
  // Callbacks
  onPlay?: (episode: PodcastEpisode) => void;
  onPause?: () => void;
  onComplete?: (episode: PodcastEpisode) => void;
  onClose?: () => void;
  
  // Accessibility
  keyboardShortcuts?: boolean;
  screenReaderOptimized?: boolean;
  highContrast?: boolean;
}

// Interactive carousel interface
export interface InteractiveCarouselProps<T> {
  // Data Management
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T) => string;
  
  // Layout Configuration
  gap?: number;
  cardWidth?: 'auto' | 'fixed' | 'responsive';
  minWidth?: number;
  maxWidth?: number;
  
  // Interaction Modes
  dragToScroll?: boolean;
  wheelToScroll?: boolean;
  keyboardNav?: boolean;
  touchSwipe?: boolean;
  autoPlay?: boolean;
  autoPlaySpeed?: number;
  
  // Navigation Controls
  showArrows?: boolean;
  showIndicators?: boolean;
  arrowPosition?: 'outside' | 'inside' | 'overlay';
  indicatorStyle?: 'dots' | 'lines' | 'thumbnails';
  
  // Snap Configuration
  snapMode?: 'start' | 'center' | 'end' | 'proximity';
  snapForce?: 'mandatory' | 'proximity';
  
  // Visual Effects
  fadeEdges?: boolean;
  parallaxEffect?: boolean;
  perspective3D?: boolean;
  
  // Performance
  lazyLoad?: boolean;
  virtualScroll?: boolean;
  preloadAdjacent?: number;
  
  // Accessibility
  'aria-label'?: string;
  announceChanges?: boolean;
  respectReducedMotion?: boolean;
  focusTrapModal?: boolean;
  
  // Event Handlers
  onScroll?: (index: number) => void;
  onItemClick?: (item: T, index: number) => void;
  onBoundaryReach?: (boundary: 'start' | 'end') => void;
}

// Service-specific interfaces
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  category?: string;
  featured?: boolean;
  testKey?: string;
}

// SEO and Schema interfaces
export interface AlternateLanguage {
  locale: string;
  url: string;
}

export interface MedicalSEOProps {
  // Basic Meta
  title: string;
  description: string;
  keywords?: string[];
  
  // Medical Specific
  medicalSpecialty?: string[];
  procedureTypes?: string[];
  conditionsTreated?: string[];
  
  // Schema.org Types
  schemaType: 'MedicalClinic' | 'Physician' | 'MedicalProcedure' | 'PodcastEpisode' | 'Article';
  schemaData: Record<string, any>;
  
  // Open Graph
  ogImage?: string;
  ogType?: 'website' | 'article' | 'video.episode' | 'music.song';
  
  // Medical Compliance
  lastReviewed?: Date;
  reviewedBy?: string;
  medicalDisclaimer?: boolean;
  cfmCompliance?: boolean;
  
  // Internationalization
  locale?: 'pt-BR' | 'en-US';
  alternateLanguages?: AlternateLanguage[];
  
  // Content Classification
  contentRating?: 'general' | 'mature';
  medicalAudience?: 'patient' | 'professional' | 'both';
}

// Utility type for component variants
export type ComponentWithVariants<T, V extends string> = T & {
  variant: V;
};

// Medical compliance utilities
export interface MedicalComplianceOptions {
  cfmCompliance?: boolean;
  lgpdCompliance?: boolean;
  wcag21AA?: boolean;
  medicalContentReview?: boolean;
  lastReviewed?: Date;
  reviewedBy?: string;
}

// Animation configuration
export interface AnimationConfig {
  reduceMotion?: boolean;
  staggerChildren?: number;
  viewport?: IntersectionObserverInit;
  choreography?: 'entrance' | 'hover' | 'exit';
  duration?: number;
  delay?: number;
  easing?: string;
}