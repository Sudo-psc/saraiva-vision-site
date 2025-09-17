import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Breadcrumbs
 * Accessible breadcrumb navigation for internal pages.
 * items: Array<{ label: string, href?: string, current?: boolean }>
 */
const Breadcrumbs = ({ items = [], className = '' }) => {
  const { t } = useTranslation();

  if (!items || items.length === 0) return null;

  return (
    <nav aria-label={t('navigation.breadcrumb', 'Trilha de navegação')} className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-600">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="flex items-center">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="px-2 py-1 rounded-lg hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={`px-2 py-1 ${isLast ? 'text-slate-800 font-semibold' : ''}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
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
  );
};

export default Breadcrumbs;

