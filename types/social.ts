/**
 * Social Media Type Definitions
 * TypeScript types for social links, sharing, and interactions
 */

import { LucideIcon } from 'lucide-react';

/**
 * Social media platform identifiers
 */
export type SocialPlatform =
  | 'instagram'
  | 'facebook'
  | 'youtube'
  | 'linkedin'
  | 'twitter'
  | 'x'
  | 'spotify'
  | 'whatsapp';

/**
 * Social link size variants
 */
export type SocialLinkSize = 'sm' | 'md' | 'lg';

/**
 * Social link layout variants
 */
export type SocialLinkVariant =
  | 'horizontal'
  | 'vertical'
  | 'floating'
  | 'footer'
  | 'grid';

/**
 * Individual social link configuration
 */
export interface SocialLink {
  name: string;
  url: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  label: string;
  handle?: string;
  hoverColor: string;
  ariaLabel?: string;
}

/**
 * Social links component props
 */
export interface SocialLinksProps {
  variant?: SocialLinkVariant;
  showLabels?: boolean;
  size?: SocialLinkSize;
  className?: string;
  enableAnimation?: boolean;
  enable3D?: boolean;
  enableGlassBubble?: boolean;
}

/**
 * Social share component props
 */
export interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  variant?: 'minimal' | 'extended' | 'inline';
  className?: string;
}

/**
 * Social share link configuration
 */
export interface ShareLink {
  name: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  url: string;
  color: string;
  ariaLabel?: string;
}

/**
 * Responsive social icons props
 */
export interface ResponsiveSocialIconsProps {
  socialLinks: Array<{
    name: string;
    href: string;
    image?: string;
    icon?: string;
  }>;
  className?: string;
  enableGlassBubble?: boolean;
  enable3D?: boolean;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Device type for responsive behavior
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Responsive configuration for social icons
 */
export interface ResponsiveSocialConfig {
  hoverScale?: number;
  touchScale?: number;
  rotateX?: string;
  rotateY?: string;
  translateZ?: string;
  duration?: string;
  easing?: string;
}

/**
 * Social interaction tracking event
 */
export interface SocialInteractionEvent {
  platform: SocialPlatform;
  action: 'click' | 'hover' | 'touch' | 'share';
  timestamp: number;
  deviceType?: DeviceType;
}

/**
 * 3D transform configuration
 */
export interface Transform3DConfig {
  enable: boolean;
  perspective?: number;
  rotateX?: number;
  rotateY?: number;
  translateZ?: number;
  scale?: number;
}

/**
 * Glass bubble effect configuration
 */
export interface GlassBubbleConfig {
  enable: boolean;
  width?: string;
  height?: string;
  opacity?: number;
  backdropFilter?: string;
}

/**
 * Social icon animation state
 */
export interface SocialIconState {
  isHovered: boolean;
  isTouched: boolean;
  isActive: boolean;
  transform: string;
}
