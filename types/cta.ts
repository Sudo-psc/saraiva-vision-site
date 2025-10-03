/**
 * CTA Component Types
 * Type definitions for Call-to-Action components and conversion elements
 */

import { LucideIcon } from 'lucide-react';

/**
 * CTA Variant Types
 */
export type CTAVariant =
  | 'hero'
  | 'sticky'
  | 'fixed'
  | 'inline'
  | 'floating'
  | 'banner'
  | 'sidebar'
  | 'footer'
  | 'default';

/**
 * CTA Button Size
 */
export type CTASize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * CTA Color Theme
 */
export type CTATheme =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gradient';

/**
 * CTA Position for Sticky/Fixed Elements
 */
export interface CTAPosition {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
}

/**
 * Sticky CTA Configuration
 */
export interface StickyCTAConfig {
  variant?: CTAVariant;
  showAfterScroll?: number; // pixels or percentage
  hideOnScroll?: boolean;
  hideAfterScroll?: number;
  position?: CTAPosition;
  animation?: 'slide' | 'fade' | 'scale' | 'bounce';
  dismissible?: boolean;
  cookieKey?: string; // for remembering dismissal
  expiryDays?: number;
}

/**
 * StickyCTA Component Props
 */
export interface StickyCTAProps {
  className?: string;
  config?: StickyCTAConfig;
  onDismiss?: () => void;
  onCTAClick?: () => void;
}

/**
 * Fixed CTA Configuration
 */
export interface FixedCTAConfig extends StickyCTAConfig {
  expanded?: boolean;
  autoExpand?: boolean;
  expandDelay?: number;
  pulseAnimation?: boolean;
}

/**
 * FixedCTA Component Props
 */
export interface FixedCTAProps {
  className?: string;
  config?: FixedCTAConfig;
  onExpand?: () => void;
  onCollapse?: () => void;
}

/**
 * Contact Option for Multi-Option CTAs
 */
export interface ContactOption {
  icon: LucideIcon;
  label: string;
  href: string;
  color: string;
  description?: string;
  external?: boolean;
  trackingLabel?: string;
}

/**
 * Inline CTA Context
 */
export type InlineCTAContext =
  | 'article'
  | 'service'
  | 'about'
  | 'testimonial'
  | 'faq'
  | 'general';

/**
 * InlineAppointmentCTA Props
 */
export interface InlineAppointmentCTAProps {
  context?: InlineCTAContext;
  className?: string;
  variant?: 'default' | 'compact' | 'expanded';
  showStats?: boolean;
}

/**
 * Conversion Element Type
 */
export type ConversionElementType =
  | 'cta'
  | 'trust-badge'
  | 'review'
  | 'clinic-info'
  | 'service-highlight'
  | 'emergency-notice';

/**
 * Trust Badge Configuration
 */
export interface TrustBadge {
  icon?: LucideIcon;
  label: string;
  value?: string;
  verified?: boolean;
}

/**
 * TrustBadges Props
 */
export interface TrustBadgesProps {
  author?: {
    name: string;
    credentials?: string[];
    crm?: string;
    specialties?: string[];
  };
  badges?: TrustBadge[];
  className?: string;
}

/**
 * Clinic Information
 */
export interface ClinicInfo {
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    mapUrl?: string;
  };
  hours: {
    weekdays: string;
    saturday?: string;
    sunday?: string;
  };
  rating?: number;
  reviewCount?: number;
}

/**
 * ClinicInfoCard Props
 */
export interface ClinicInfoCardProps {
  clinic?: ClinicInfo;
  compact?: boolean;
  className?: string;
}

/**
 * Review Highlight
 */
export interface ReviewHighlight {
  rating: number;
  count: number;
  recentReview?: {
    text: string;
    author: string;
    date?: string;
  };
}

/**
 * ReviewsHighlight Props
 */
export interface ReviewsHighlightProps {
  rating?: number;
  count?: number;
  showRecentReview?: boolean;
  recentReview?: ReviewHighlight['recentReview'];
  className?: string;
}

/**
 * Emergency Notice Props
 */
export interface EmergencyNoticeProps {
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * Service CTA Configuration
 */
export interface ServiceCTA {
  name: string;
  icon: string | LucideIcon;
  slug: string;
  description?: string;
}

/**
 * ServicesCTA Props
 */
export interface ServicesCTAProps {
  services?: ServiceCTA[];
  limit?: number;
  className?: string;
}

/**
 * CTA Analytics Event
 */
export interface CTAAnalyticsEvent {
  eventName: string;
  ctaVariant: CTAVariant;
  ctaPosition: string;
  ctaLabel: string;
  timestamp: number;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

/**
 * CTA Performance Metrics
 */
export interface CTAMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  cvr: number; // Conversion rate
  dismissals?: number;
  avgTimeToClick?: number;
}

/**
 * A/B Test Configuration for CTAs
 */
export interface CTATestConfig {
  testId: string;
  variants: Array<{
    id: string;
    weight: number;
    config: Partial<StickyCTAConfig | FixedCTAConfig>;
  }>;
  isActive: boolean;
  startDate: string;
  endDate?: string;
}

/**
 * CTA Accessibility Configuration
 */
export interface CTAAccessibilityConfig {
  ariaLabel: string;
  role?: string;
  tabIndex?: number;
  focusable?: boolean;
  announceChanges?: boolean;
}

/**
 * CTA Mobile Optimization
 */
export interface CTAMobileConfig {
  fullWidth?: boolean;
  fixedBottom?: boolean;
  safeAreaInset?: boolean;
  hapticFeedback?: boolean;
  swipeToDismiss?: boolean;
}
