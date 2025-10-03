'use client';

import React, { useState, useEffect } from 'react';
import { List, ChevronRight } from 'lucide-react';
import type { TableOfContentsProps } from '@/types/blog';

/**
 * TableOfContents - Interactive table of contents for blog posts
 * Auto-generates from post headings and tracks active section
 *
 * Features:
 * - Automatic heading detection and observation
 * - Smooth scroll to sections with offset
 * - Active section highlighting
 * - Reading progress indicator
 * - Sticky positioning for always-visible navigation
 * - WCAG AA compliant with proper ARIA labels
 *
 * @example
 * ```tsx
 * <TableOfContents
 *   headings={[
 *     { id: 'section-1', text: 'Introduction', level: 2 },
 *     { id: 'section-2', text: 'Methods', level: 2 }
 *   ]}
 * />
 * ```
 */
export function TableOfContents({ headings = [], className = '' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // IntersectionObserver to track which heading is currently visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%', // Trigger when heading enters middle of viewport
      }
    );

    // Observe all heading elements
    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    headingElements.forEach((el) => observer.observe(el));

    // Cleanup
    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [headings]);

  /**
   * Scroll to heading with smooth animation and offset
   */
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = 100; // Fixed header offset
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = element.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  };

  // Don't render if no headings
  if (!headings || headings.length === 0) return null;

  // Calculate reading progress
  const activeIndex = headings.findIndex((h) => h.id === activeId);
  const progressPercentage = activeIndex >= 0
    ? Math.round(((activeIndex + 1) / headings.length) * 100)
    : 0;

  return (
    <nav
      className={`sticky top-24 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow ${className}`}
      aria-label="Índice do artigo"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
        <div className="p-2 bg-gradient-to-br from-blue-100 to-slate-100 rounded-lg">
          <List className="w-4 h-4 text-blue-600" aria-hidden="true" />
        </div>
        <h2 className="text-sm font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
          Neste Artigo
        </h2>
      </div>

      {/* TOC List */}
      <ul className="space-y-2" role="list">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const isH2 = heading.level === 2;

          return (
            <li key={heading.id}>
              <button
                onClick={() => scrollToHeading(heading.id)}
                className={`group w-full text-left text-sm transition-all duration-200 flex items-start gap-2 rounded-lg p-2 ${
                  isH2 ? 'font-medium' : 'font-normal pl-4'
                } ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
                aria-current={isActive ? 'location' : undefined}
                type="button"
              >
                <ChevronRight
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 transition-transform ${
                    isActive
                      ? 'text-blue-600 transform translate-x-1'
                      : 'text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1'
                  }`}
                  aria-hidden="true"
                />
                <span className="line-clamp-2">{heading.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Progress Indicator */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Progresso de leitura</span>
          <span className="font-medium text-blue-600" aria-live="polite">
            {progressPercentage}%
          </span>
        </div>
        <div
          className="h-1.5 bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso de leitura do artigo"
        >
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </nav>
  );
}

export default TableOfContents;
