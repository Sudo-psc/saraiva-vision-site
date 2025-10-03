'use client';

import React, { useState } from 'react';
import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Check,
  MessageCircle
} from 'lucide-react';
import type { ShareWidgetProps, SharePlatform } from '@/types/blog';

/**
 * ShareWidget - Social sharing component for blog posts
 * Supports Twitter, Facebook, LinkedIn, WhatsApp, and copy link
 *
 * Features:
 * - Multiple platform support with custom icons
 * - Copy to clipboard with visual feedback
 * - Responsive design with hover effects
 * - WCAG AA compliant with proper ARIA labels
 * - Sticky positioning for easy access
 *
 * @example
 * ```tsx
 * <ShareWidget
 *   title="Amazing Blog Post"
 *   url="https://example.com/blog/post"
 * />
 * ```
 */
export function ShareWidget({ title, url, className = '' }: ShareWidgetProps) {
  const [copied, setCopied] = useState(false);

  // Use current URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || (typeof document !== 'undefined' ? document.title : '');

  /**
   * Handle copy link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
    }
  };

  /**
   * Share platform configurations
   */
  const shareLinks: Array<{
    platform: SharePlatform;
    name: string;
    icon: typeof Facebook;
    url: string;
    color: string;
    ariaLabel: string;
  }> = [
    {
      platform: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300',
      ariaLabel: `Compartilhar no Facebook: ${shareTitle}`,
    },
    {
      platform: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: 'hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300',
      ariaLabel: `Compartilhar no Twitter: ${shareTitle}`,
    },
    {
      platform: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400',
      ariaLabel: `Compartilhar no LinkedIn: ${shareTitle}`,
    },
    {
      platform: 'whatsapp',
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`,
      color: 'hover:bg-green-50 hover:text-green-600 hover:border-green-300',
      ariaLabel: `Compartilhar no WhatsApp: ${shareTitle}`,
    },
  ];

  return (
    <aside
      className={`bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow ${className}`}
      aria-label="Opções de compartilhamento"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        <div className="p-2 bg-gradient-to-br from-blue-100 to-slate-100 rounded-lg">
          <Share2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
          Compartilhar
        </h3>
      </div>

      {/* Share Buttons */}
      <div className="space-y-2">
        {shareLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 p-3 rounded-lg border border-slate-100 transition-all ${link.color}`}
              aria-label={link.ariaLabel}
            >
              <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">{link.name}</span>
            </a>
          );
        })}

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
          aria-label="Copiar link do artigo"
          type="button"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium text-green-600">Link copiado!</span>
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium">Copiar link</span>
            </>
          )}
        </button>
      </div>

      {/* Usage Hint */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Compartilhe este artigo com seus amigos e familiares
      </p>
    </aside>
  );
}

export default ShareWidget;
