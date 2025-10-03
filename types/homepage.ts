/**
 * Homepage Component Types
 * Type definitions for homepage sections and conversion components
 */

import { LucideIcon } from 'lucide-react';

/**
 * Trust Signal Item
 */
export interface TrustItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color: 'blue' | 'amber' | 'green' | 'purple';
}

/**
 * Partnership Logo
 */
export interface Partnership {
  name: string;
  logo: string;
  alt?: string;
}

/**
 * Trust Statistics
 */
export interface TrustStats {
  satisfaction: string;
  patients: string;
  years: string;
}

/**
 * TrustSignals Component Props
 */
export interface TrustSignalsProps {
  className?: string;
  trustItems?: TrustItem[];
  partnerships?: Partnership[];
  stats?: TrustStats;
}

/**
 * Humanized Care Story
 */
export interface CareStory {
  id: string;
  patientName?: string;
  patientInitials?: string;
  story: string;
  condition?: string;
  outcome?: string;
  image?: string;
  rating?: number;
}

/**
 * Care Value Proposition
 */
export interface CareValue {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
}

/**
 * HumanizedCare Component Props
 */
export interface HumanizedCareProps {
  className?: string;
  stories?: CareStory[];
  values?: CareValue[];
  showTestimonials?: boolean;
}

/**
 * Blog Post Preview (for LatestBlogPosts)
 */
export interface BlogPostPreview {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  coverImage?: string;
  category: string;
  date: string;
  publishedAt?: string;
  author?: {
    name: string;
    role?: string;
    avatar?: string;
  };
  tags?: string[];
  readTime?: number;
}

/**
 * LatestBlogPosts Component Props
 */
export interface LatestBlogPostsProps {
  className?: string;
  limit?: number;
  category?: string;
  showLoadMore?: boolean;
  posts?: BlogPostPreview[];
}

/**
 * Scroll State for Sticky Elements
 */
export interface ScrollState {
  scrollY: number;
  scrollPercentage: number;
  isVisible: boolean;
  direction?: 'up' | 'down';
}

/**
 * Animation Variants for Homepage Sections
 */
export interface AnimationVariants {
  initial: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  animate: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  exit?: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
  };
}

/**
 * Conversion Metrics Tracking
 */
export interface ConversionMetrics {
  sectionName: string;
  ctaType: string;
  ctaLabel: string;
  position: string;
  variant?: string;
}

/**
 * A/B Testing Variant
 */
export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  config: Record<string, any>;
}
