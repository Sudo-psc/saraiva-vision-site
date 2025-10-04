'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbsProps, BreadcrumbListSchema } from '@/types/navigation';
import { cn } from '@/lib/utils';

/**
 * Breadcrumbs Component
 * Accessible breadcrumb navigation with schema.org BreadcrumbList support
 *
 * Features:
 * - WCAG AAA compliant with proper ARIA labels
 * - Schema.org BreadcrumbList for SEO
 * - Next.js 15 Link integration
 * - Automatic path generation or manual items
 * - Keyboard navigation support
 * - Responsive design with Tailwind CSS
 *
 * @example
 * // Automatic breadcrumbs from path
 * <Breadcrumbs />
 *
 * @example
 * // Manual breadcrumbs
 * <Breadcrumbs items={[
 *   { label: 'Home', href: '/' },
 *   { label: 'Services', href: '/servicos' },
 *   { label: 'Current Page', current: true }
 * ]} />
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = '',
  ariaLabel,
  separator
}) => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const defaultAriaLabel = ariaLabel || t('navigation.breadcrumb', 'Trilha de navegação');

  // Generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = React.useMemo(() => {
    if (items && items.length > 0) {
      return items;
    }

    // Generate from pathname
    const pathSegments = pathname.split('/').filter(Boolean);

    const generatedItems = [
      { label: t('navigation.home', 'Início'), href: '/', current: false }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Convert segment to readable label
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      generatedItems.push({
        label,
        href: currentPath,
        current: isLast
      });
    });

    return generatedItems;
  }, [items, pathname, t]);

  // Don't render on homepage with auto-generation
  if (!items && breadcrumbItems.length === 1) {
    return null;
  }

  // Generate schema.org BreadcrumbList
  const breadcrumbSchema: BreadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && !item.current && { item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://saraivavision.com.br'}${item.href}` })
    }))
  };

  const defaultSeparator = <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden="true" />;

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label={defaultAriaLabel}
        className={cn('mb-8', className)}
      >
        <ol
          className="flex flex-wrap items-center gap-2 text-sm"
          role="list"
        >
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isHome = index === 0;

            return (
              <li
                key={`${item.label}-${index}`}
                className="flex items-center gap-2"
              >
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
                      'text-slate-600 hover:text-blue-700',
                      'hover:bg-blue-50 transition-colors',
                      'focus:outline-none focus-visible:ring-2',
                      'focus-visible:ring-blue-600 focus-visible:ring-offset-2',
                      'underline-offset-4 hover:underline'
                    )}
                    aria-label={isHome ? t('navigation.back_to_home', 'Voltar para página inicial') : `${t('navigation.navigate_to', 'Navegar para')} ${item.label}`}
                  >
                    {isHome && (
                      <Home className="w-4 h-4" aria-hidden="true" />
                    )}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5',
                      isLast
                        ? 'text-slate-800 font-semibold'
                        : 'text-slate-600'
                    )}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {isHome && (
                      <Home className="w-4 h-4" aria-hidden="true" />
                    )}
                    <span>{item.label}</span>
                  </span>
                )}

                {!isLast && (
                  <span className="flex-shrink-0" aria-hidden="true">
                    {separator || defaultSeparator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;

/**
 * Compact variant for mobile or tight spaces
 */
export function BreadcrumbsCompact({
  items,
  className = '',
  ariaLabel
}: BreadcrumbsProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const defaultAriaLabel = ariaLabel || t('navigation.breadcrumb', 'Trilha de navegação');

  const currentPage = React.useMemo(() => {
    if (items && items.length > 0) {
      return items[items.length - 1];
    }

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    const lastSegment = segments[segments.length - 1];
    return {
      label: lastSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    };
  }, [items, pathname]);

  if (!currentPage) return null;

  return (
    <nav aria-label={defaultAriaLabel} className={cn('mb-4', className)}>
      <ol className="flex items-center gap-2 text-sm" role="list">
        <li>
          <Link
            href="/"
            className={cn(
              'inline-flex items-center gap-1 text-slate-600',
              'hover:text-blue-700 transition-colors',
              'focus:outline-none focus-visible:ring-2',
              'focus-visible:ring-blue-600 focus-visible:ring-offset-1'
            )}
            aria-label={t('navigation.back_to_home', 'Voltar para página inicial')}
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">{t('navigation.home', 'Início')}</span>
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </li>
        <li>
          <span
            className="text-slate-800 font-medium"
            aria-current="page"
          >
            {currentPage.label}
          </span>
        </li>
      </ol>
    </nav>
  );
}
