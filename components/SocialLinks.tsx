/**
 * Social Links Component - Next.js 15
 * Unified social media links with 3D effects and responsive behavior
 * Merged from SocialLinks.jsx and ResponsiveSocialIcons.jsx
 */

'use client';

import { useState, useCallback, useRef, useEffect, CSSProperties, TouchEvent } from 'react';
import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { NAP_CANONICAL } from '@/lib/napCanonical';
import type {
  SocialLinksProps,
  SocialLink,
  SocialShareProps,
  ShareLink,
  DeviceType,
} from '@/types/social';

const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
} as const;

/**
 * Detect device type based on screen width
 */
const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return deviceType;
};

/**
 * Main SocialLinks Component with 3D effects
 */
export default function SocialLinks({
  variant = 'horizontal',
  showLabels = false,
  size = 'md',
  className = '',
  enableAnimation = true,
  enable3D = true,
  enableGlassBubble = true,
}: SocialLinksProps) {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [touchedIcon, setTouchedIcon] = useState<string | null>(null);
  const deviceType = useDeviceType();
  const iconsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const socialLinks: SocialLink[] = [
    {
      name: 'Instagram',
      url: NAP_CANONICAL.social.instagram.url,
      icon: SOCIAL_ICONS.instagram,
      label: NAP_CANONICAL.social.instagram.handle,
      hoverColor: 'hover:bg-pink-500',
    },
    {
      name: 'Facebook',
      url: NAP_CANONICAL.social.facebook.url,
      icon: SOCIAL_ICONS.facebook,
      label: NAP_CANONICAL.social.facebook.handle,
      hoverColor: 'hover:bg-blue-600',
    },
    {
      name: 'YouTube',
      url: NAP_CANONICAL.social.youtube.url,
      icon: SOCIAL_ICONS.youtube,
      label: NAP_CANONICAL.social.youtube.handle,
      hoverColor: 'hover:bg-red-600',
    },
  ];

  // Handle hover interactions
  const handleMouseEnter = useCallback(
    (iconName: string) => {
      if (deviceType === 'desktop' && enableAnimation) {
        setHoveredIcon(iconName);
      }
    },
    [deviceType, enableAnimation]
  );

  const handleMouseLeave = useCallback(() => {
    if (deviceType === 'desktop') {
      setHoveredIcon(null);
    }
  }, [deviceType]);

  // Handle touch interactions
  const handleTouchStart = useCallback(
    (iconName: string, event: TouchEvent<HTMLDivElement>) => {
      if (!enableAnimation) return;

      event.preventDefault();
      setTouchedIcon(iconName);

      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }

      // Clear touch state after animation
      setTimeout(() => {
        setTouchedIcon(null);
      }, 200);
    },
    [enableAnimation]
  );

  // Get 3D transform based on state and device
  const getIconTransform = useCallback(
    (iconName: string): string => {
      const isHovered = hoveredIcon === iconName;
      const isTouched = touchedIcon === iconName;

      if (!enable3D || !enableAnimation) {
        if (isHovered || isTouched) {
          return 'scale(1.1)';
        }
        return 'scale(1)';
      }

      // 3D transforms for supported devices
      if (isHovered && deviceType === 'desktop') {
        return 'perspective(1000px) rotateX(-15deg) rotateY(15deg) translateZ(50px) scale(1.2)';
      }

      if (isTouched && deviceType !== 'desktop') {
        const scale = 1.05;
        if (deviceType === 'tablet' && enable3D) {
          return `perspective(1000px) rotateX(-10deg) rotateY(10deg) translateZ(25px) scale(${scale})`;
        }
        return `scale(${scale})`;
      }

      return 'scale(1)';
    },
    [hoveredIcon, touchedIcon, enable3D, enableAnimation, deviceType]
  );

  // Get glass bubble styles
  const getGlassBubbleStyles = useCallback(
    (iconName: string): CSSProperties => {
      const isHovered = hoveredIcon === iconName;

      if (!enableGlassBubble || !isHovered || deviceType !== 'desktop') {
        return {
          width: '0',
          height: '0',
          opacity: 0,
        };
      }

      return {
        width: '120%',
        height: '120%',
        opacity: 0.3,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      };
    },
    [hoveredIcon, enableGlassBubble, deviceType]
  );

  const layoutClasses =
    variant === 'vertical'
      ? 'flex flex-col gap-3'
      : variant === 'grid'
      ? 'grid grid-cols-3 gap-3'
      : 'flex items-center gap-3';

  return (
    <div
      className={`${layoutClasses} ${className}`}
      role="navigation"
      aria-label="Redes sociais da Clínica Saraiva Vision"
    >
      {socialLinks.map((social) => {
        const Icon = social.icon;
        const iconTransform = getIconTransform(social.name);
        const bubbleStyles = getGlassBubbleStyles(social.name);
        const isHovered = hoveredIcon === social.name;

        return (
          <div
            key={social.name}
            ref={(el) => {
              iconsRef.current[social.name] = el;
            }}
            className="relative"
            style={{
              transform: iconTransform,
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              touchAction: 'manipulation',
            }}
            onMouseEnter={() => handleMouseEnter(social.name)}
            onMouseLeave={handleMouseLeave}
            onTouchStart={(e) => handleTouchStart(social.name, e)}
          >
            {/* Glass Bubble Effect */}
            {enableGlassBubble && (
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none -z-10"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
                  transition: 'all 0.3s ease-out',
                  ...bubbleStyles,
                }}
                aria-hidden="true"
              />
            )}

            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                ${containerSizes[size]}
                flex items-center justify-center
                rounded-full
                bg-gray-700 text-white
                ${social.hoverColor} hover:text-white
                transition-colors duration-300
                focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2
                ${showLabels ? 'gap-2 px-4 py-2 w-auto' : ''}
              `}
              style={{
                filter: isHovered
                  ? 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3))'
                  : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                transition: 'filter 0.3s ease-out',
              }}
              aria-label={`Visitar ${social.name} - ${social.label}`}
            >
              <Icon className={iconSizes[size]} aria-hidden="true" />
              {showLabels && <span className="text-sm font-medium">{social.name}</span>}
            </a>
          </div>
        );
      })}

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }

        @media (prefers-contrast: high) {
          a {
            border: 1px solid currentColor;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * SocialShare Component for content sharing
 */
export function SocialShare({ url, title, variant = 'minimal', className = '' }: SocialShareProps) {
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const shareLinks: ShareLink[] = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Twitter',
      icon: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
      color: 'bg-gray-900 hover:bg-gray-800',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      color: 'bg-blue-700 hover:bg-blue-800',
    },
  ];

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-600 mr-1">Compartilhar:</span>
        {shareLinks.map((social) => {
          const Icon = social.icon;
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${social.color} text-white
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400
              `}
              aria-label={`Compartilhar no ${social.name}`}
            >
              <Icon className="w-4 h-4" />
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-semibold text-gray-900">Compartilhe este conteúdo</h4>
      <div className="flex flex-wrap gap-2">
        {shareLinks.map((social) => {
          const Icon = social.icon;
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg
                ${social.color} text-white text-sm font-medium
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400
              `}
              aria-label={`Compartilhar no ${social.name}`}
            >
              <Icon className="w-5 h-5" />
              <span>{social.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
