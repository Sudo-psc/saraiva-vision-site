'use client';

/**
 * SkipLinks Component
 * Accessibility skip links for keyboard navigation
 * Phase 4: UI Components Migration (Vite → Next.js 15)
 *
 * Features:
 * - Skip to main content
 * - Skip to navigation
 * - Skip to footer
 * - WCAG AAA accessibility
 * - Focus management
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Individual skip link component
 */
function SkipLink({ href, children, className = '' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Visually hidden until focused
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-4 focus:left-4 focus:z-[100]',
        'px-4 py-2 rounded-lg',
        'bg-blue-600 text-white font-medium',
        'focus:outline-none focus-visible:ring-2',
        'focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        'transition-all duration-200',
        'hover:bg-blue-700',
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * SkipLinks Component
 * Provides multiple skip links for accessibility
 */
export function SkipLinks() {
  return (
    <div className="skip-links" aria-label="Links de navegação rápida">
      <SkipLink href="#main-content">
        Pular para conteúdo principal
      </SkipLink>
      <SkipLink href="#navigation">
        Pular para navegação
      </SkipLink>
      <SkipLink href="#footer">
        Pular para rodapé
      </SkipLink>
    </div>
  );
}

/**
 * SkipToMain Component
 * Single skip link to main content
 */
export function SkipToMain() {
  return (
    <SkipLink href="#main-content">
      Pular para conteúdo principal
    </SkipLink>
  );
}

/**
 * SkipToNavigation Component
 * Single skip link to navigation
 */
export function SkipToNavigation() {
  return (
    <SkipLink href="#navigation">
      Pular para navegação
    </SkipLink>
  );
}

/**
 * SkipToFooter Component
 * Single skip link to footer
 */
export function SkipToFooter() {
  return (
    <SkipLink href="#footer">
      Pular para rodapé
    </SkipLink>
  );
}

export default SkipLinks;