/**
 * Navigation Types
 * TypeScript interfaces for navigation and footer components
 */

import { ReactNode } from 'react';
import { MotionProps } from 'framer-motion';

// ============================================================================
// Breadcrumb Types
// ============================================================================

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  ariaLabel?: string;
  separator?: ReactNode;
}

// ============================================================================
// Scroll Types
// ============================================================================

export interface ScrollToTopProps {
  showAt?: number;
  smooth?: boolean;
  className?: string;
  icon?: ReactNode;
  ariaLabel?: string;
  behavior?: ScrollBehavior;
}

export interface ScrollProgress {
  progress: number;
  isVisible: boolean;
}

// ============================================================================
// Section Wrapper Types
// ============================================================================

export type SectionSpacing = 'section-sm' | 'section' | 'section-lg' | 'section-xl' | 'section-2xl';
export type TitleLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type MaxWidth = 'max-w-2xl' | 'max-w-3xl' | 'max-w-4xl' | 'max-w-5xl' | 'max-w-6xl' | 'max-w-7xl' | 'max-w-full';

export interface SectionWrapperProps {
  id?: string;
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  overline?: string;
  cta?: ReactNode;
  className?: string;
  spacing?: SectionSpacing;
  background?: string;
  maxWidth?: MaxWidth;
  titleLevel?: TitleLevel;
  centerContent?: boolean;
  titleSize?: string;
  enableAnimations?: boolean;
}

// ============================================================================
// Footer Types
// ============================================================================

export interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
  ariaLabel?: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  name: string;
  href: string;
  image: string;
  color: string;
  ariaLabel?: string;
}

export interface WorkingHoursStatus {
  status: 'open' | 'closed' | 'unknown';
  nextOpening?: string;
  closesAt?: string;
  isOpen: boolean;
}

export interface FooterNAPProps {
  variant?: 'full' | 'compact';
  className?: string;
}

export interface EnhancedFooterProps extends Omit<MotionProps, 'children'> {
  className?: string;
  glassOpacity?: number | null;
  glassBlur?: number | null;
  enableAnimations?: boolean;
  useGlassEffect?: boolean;
  showSocial?: boolean;
  showNewsletter?: boolean;
}

export interface FooterSectionComponentProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export interface ContactItemProps {
  children: ReactNode;
  className?: string;
}

export interface ContactLinkProps {
  href: string;
  children: ReactNode;
  external?: boolean;
  icon?: React.ComponentType<{ size?: number }>;
  className?: string;
}

// ============================================================================
// Schema.org Types for Footer/Navigation
// ============================================================================

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItemSchema[];
}

export interface BreadcrumbItemSchema {
  '@type': 'ListItem';
  position: number;
  name: string;
  item?: string;
}

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'MedicalClinic';
  name: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  email: string;
  url: string;
  sameAs: string[];
  openingHoursSpecification?: OpeningHoursSchema[];
}

export interface OpeningHoursSchema {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
}

// ============================================================================
// Accessibility Types
// ============================================================================

export interface A11yNavigationProps {
  skipToMainLabel?: string;
  skipToFooterLabel?: string;
  ariaLabel?: string;
  role?: string;
}

export interface A11yAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
}

// ============================================================================
// Animation Types
// ============================================================================

export interface NavigationAnimationConfig {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  staggerChildren?: number;
  delayChildren?: number;
}

export interface ScrollAnimationConfig {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export type NavigationVariant = 'header' | 'footer' | 'sidebar' | 'breadcrumb';
export type FooterTheme = 'dark' | 'light' | 'glass';
export type ResponsiveBreakpoint = 'mobile' | 'tablet' | 'desktop';

export interface NavigationState {
  isOpen: boolean;
  activeSection?: string;
  scrollPosition: number;
  isScrollingUp: boolean;
}

export interface FooterData {
  phoneNumber: string;
  whatsappLink: string;
  chatbotUrl: string;
  amorSaudeLogo: string;
  currentYear: number;
}
