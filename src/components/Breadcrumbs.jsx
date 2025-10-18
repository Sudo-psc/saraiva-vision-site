import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Home } from 'lucide-react';

/**
 * Breadcrumbs Component with Schema.org Markup
 * Accessible breadcrumb navigation with SEO-optimized structured data
 *
 * @param {Object} props
 * @param {Array<{label: string, href?: string, current?: boolean}>} props.items - Breadcrumb items
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showHome - Show home icon (default: true)
 */
const Breadcrumbs = ({ items = [], className = '', showHome = true }) => {
  const { t } = useTranslation();
  const baseUrl = 'https://saraivavision.com.br';

  if (!items || items.length === 0) return null;

  // Build complete breadcrumb chain with home
  const allItems = showHome
    ? [{ label: 'Home', href: '/' }, ...items]
    : items;

  // Generate Schema.org BreadcrumbList for SEO
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems
      .filter(item => item.href) // Only include items with href
      .map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: `${baseUrl}${item.href}`,
      })),
  };

  return (
    <>
      {/* Schema Markup for SEO */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Visual Breadcrumbs */}
      <nav aria-label={t('navigation.breadcrumb', 'Trilha de navegação')} className={className}>
        <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-600">
          {allItems.map((item, idx) => {
            const isLast = idx === allItems.length - 1;
            const isHome = idx === 0 && showHome;

            return (
              <li key={`${item.label}-${idx}`} className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="px-2 py-1 rounded-lg hover:text-cyan-700 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 flex items-center gap-1"
                    aria-label={isHome ? 'Voltar para página inicial' : item.label}
                  >
                    {isHome && <Home className="w-4 h-4" aria-hidden="true" />}
                    <span className={isHome ? 'sr-only' : ''}>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={`px-2 py-1 flex items-center gap-1 ${isLast ? 'text-slate-800 font-semibold' : ''}`}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {isHome && <Home className="w-4 h-4" aria-hidden="true" />}
                    <span className={isHome ? 'sr-only' : ''}>{item.label}</span>
                  </span>
                )}
                {!isLast && (
                  <span className="mx-1 text-slate-400" aria-hidden="true">›</span>
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

