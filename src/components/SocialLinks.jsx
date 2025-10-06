import { Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { NAP_CANONICAL } from '@/lib/napCanonical';

const SOCIAL_ICONS = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
};

export default function SocialLinks({ 
  variant = 'horizontal', 
  showLabels = false,
  size = 'md',
  className = '' 
}) {
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

  const socialLinks = [
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
      hoverColor: 'hover:bg-cyan-600',
    },
    {
      name: 'YouTube',
      url: NAP_CANONICAL.social.youtube.url,
      icon: SOCIAL_ICONS.youtube,
      label: NAP_CANONICAL.social.youtube.handle,
      hoverColor: 'hover:bg-red-600',
    },
  ];

  const layoutClasses = variant === 'vertical' 
    ? 'flex flex-col gap-3' 
    : 'flex items-center gap-3';

  return (
    <div 
      className={`${layoutClasses} ${className}`}
      role="navigation"
      aria-label="Redes sociais da Clínica Saraiva Vision"
    >
      {socialLinks.map((social) => {
        const Icon = social.icon;
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              ${containerSizes[size]}
              flex items-center justify-center
              rounded-full
              bg-gray-700 text-white
              ${social.hoverColor} hover:text-white
              transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2
              ${showLabels ? 'gap-2 px-4 py-2 w-auto' : ''}
            `}
            aria-label={`Visitar ${social.name} - ${social.label}`}
          >
            <Icon className={iconSizes[size]} aria-hidden="true" />
            {showLabels && (
              <span className="text-sm font-medium">{social.name}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}

export function SocialShare({ 
  url, 
  title, 
  variant = 'minimal',
  className = '' 
}) {
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
      color: 'bg-cyan-600 hover:bg-cyan-700',
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
      color: 'bg-cyan-700 hover:bg-cyan-800',
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
