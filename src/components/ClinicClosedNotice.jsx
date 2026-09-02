import { BookOpen, Info } from 'lucide-react';
import {
  AUTHOR_SITE_URL,
  CLINIC_CLOSED_COPY,
  getPhysicianCredentials,
} from '@/lib/clinicStatus';

const VARIANT_CLASSES = {
  banner:
    'w-full bg-slate-900 text-white border-b border-slate-700 px-4 py-3',
  hero:
    'w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5 text-left shadow-sm',
  compact:
    'inline-flex max-w-full items-center rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-800',
  card:
    'w-full rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5 text-left',
  page:
    'mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-white px-6 py-10 text-center shadow-lg sm:px-10',
  inline:
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-left',
};

const ClinicClosedNotice = ({
  variant = 'card',
  className = '',
  showAuthorLink = true,
  showCredentials = variant === 'page' || variant === 'hero',
}) => {
  const copy = CLINIC_CLOSED_COPY;
  const isCompact = variant === 'compact';
  const isBanner = variant === 'banner';

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`${VARIANT_CLASSES[variant] || VARIANT_CLASSES.card} ${className}`}
    >
      {isCompact ? (
        <p className="text-sm font-semibold leading-snug">
          {copy.badge} — {copy.subtitle}
        </p>
      ) : (
        <div className={isBanner ? 'mx-auto flex max-w-5xl flex-col gap-1 sm:flex-row sm:items-center sm:justify-between' : 'space-y-3'}>
          <div className="space-y-1">
            <p className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide ${isBanner ? 'text-amber-300' : 'text-amber-800'}`}>
              <Info className="h-4 w-4" aria-hidden="true" />
              {copy.badge}
            </p>
            <h2 className={`font-bold leading-tight ${isBanner ? 'text-base text-white' : variant === 'page' ? 'text-3xl text-slate-900' : 'text-lg text-slate-900'}`}>
              {copy.title}
            </h2>
            <p className={isBanner ? 'text-sm text-slate-200' : 'text-sm font-medium text-slate-700'}>
              {copy.subtitle}
            </p>
            {!isBanner && (
              <p className="text-sm leading-relaxed text-slate-600">
                {copy.description}
              </p>
            )}
          </div>

          <div className={`space-y-2 ${isBanner ? 'text-sm' : ''}`}>
            {showAuthorLink && (
              <a
                href={AUTHOR_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${isBanner ? 'text-cyan-200' : 'text-slate-800'}`}
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>{copy.authorLinkLabel}</span>
              </a>
            )}
            {showAuthorLink && !isBanner && (
              <p className="text-xs text-slate-500">{copy.authorLinkNote}</p>
            )}
            {showCredentials && (
              <p className={`text-xs ${isBanner ? 'text-slate-300' : 'text-slate-500'}`}>
                {getPhysicianCredentials()}
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default ClinicClosedNotice;
