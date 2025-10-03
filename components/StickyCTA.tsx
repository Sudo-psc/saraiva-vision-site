/**
 * StickyCTA Component
 * Next.js 15 - Client Component with Scroll Detection
 *
 * Sticky CTA that appears after user scrolls past hero section.
 * Mobile-first, dismissible, and WCAG AAA compliant.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import UnifiedCTA from './UnifiedCTA';
import type { StickyCTAProps } from '@/types/cta';

const DEFAULT_SHOW_AFTER_SCROLL = 600; // pixels
const DEFAULT_COOKIE_KEY = 'sticky-cta-dismissed';
const DEFAULT_EXPIRY_DAYS = 7;

/**
 * Cookie utility functions
 */
const setCookie = (name: string, value: string, days: number) => {
  if (typeof window === 'undefined') return;

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export default function StickyCTA({
  className = '',
  config,
  onDismiss,
  onCTAClick,
}: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const showAfterScroll = config?.showAfterScroll || DEFAULT_SHOW_AFTER_SCROLL;
  const cookieKey = config?.cookieKey || DEFAULT_COOKIE_KEY;
  const expiryDays = config?.expiryDays || DEFAULT_EXPIRY_DAYS;
  const dismissible = config?.dismissible !== false; // default true

  useEffect(() => {
    // Check if user has dismissed this CTA before
    if (dismissible) {
      const dismissed = getCookie(cookieKey);
      if (dismissed === 'true') {
        setIsDismissed(true);
        return;
      }
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const shouldShow = scrollPosition > showAfterScroll;
      setIsVisible(shouldShow);
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Check initial scroll position
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, dismissible, cookieKey]);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
    setIsVisible(false);

    if (dismissible) {
      setCookie(cookieKey, 'true', expiryDays);
    }

    onDismiss?.();
  }, [dismissible, cookieKey, expiryDays, onDismiss]);

  const handleCTAClick = useCallback(() => {
    onCTAClick?.();
  }, [onCTAClick]);

  // Don't render if dismissed or not visible
  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Mobile Sticky CTA (hidden on desktop) */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 ${className}`}
        role="complementary"
        aria-label="Botão de agendamento fixo"
      >
        {/* Backdrop for better visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        <div className="relative bg-white shadow-2xl border-t border-slate-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              {/* CTA Button */}
              <div className="flex-1" onClick={handleCTAClick}>
                <UnifiedCTA variant="sticky" />
              </div>

              {/* Dismiss Button (if dismissible) */}
              {dismissible && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Fechar botão de agendamento"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Safe area spacer to prevent content from being hidden behind sticky CTA */}
      <div className="lg:hidden h-20" aria-hidden="true" />
    </>
  );
}
