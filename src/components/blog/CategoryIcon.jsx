import React from 'react';

const CategoryIcon = ({ category, className = "w-12 h-12" }) => {
  const getIcon = () => {
    const normalizedCategory = category?.toLowerCase() || '';

    if (normalizedCategory.includes('tecnologia') || normalizedCategory.includes('inovação')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" className="fill-cyan-100 dark:fill-cyan-900/30" />
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" className="fill-cyan-600 dark:fill-cyan-400" />
          <circle cx="12" cy="8" r="1.5" className="fill-cyan-700 dark:fill-cyan-300" />
          <circle cx="8" cy="12" r="1.5" className="fill-cyan-700 dark:fill-cyan-300" />
          <circle cx="16" cy="12" r="1.5" className="fill-cyan-700 dark:fill-cyan-300" />
          <circle cx="12" cy="16" r="1.5" className="fill-cyan-700 dark:fill-cyan-300" />
        </svg>
      );
    }

    if (normalizedCategory.includes('tratamento')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" className="fill-green-100 dark:fill-green-900/30" />
          <path d="M13 3h-2v7H4v2h7v7h2v-7h7v-2h-7V3z" className="fill-green-600 dark:fill-green-400" />
          <circle cx="12" cy="12" r="2" className="fill-white dark:fill-green-900" />
        </svg>
      );
    }

    if (normalizedCategory.includes('prevenção')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" className="fill-blue-100 dark:fill-blue-900/30" />
          <path d="M12 2L4 6v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-8-4zm0 18c-4.41-1.06-7-5.28-7-9.5V7.3l7-3.5 7 3.5v3.2c0 4.22-2.59 8.44-7 9.5z" className="fill-blue-600 dark:fill-blue-400" />
          <path d="M10.5 14.5l-2.5-2.5-1 1 3.5 3.5 6-6-1-1-5 5z" className="fill-blue-700 dark:fill-blue-300" />
        </svg>
      );
    }

    if (normalizedCategory.includes('guia') || normalizedCategory.includes('prático')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" className="fill-purple-100 dark:fill-purple-900/30" />
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" className="fill-purple-600 dark:fill-purple-400" />
          <path d="M8 7h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" className="fill-purple-700 dark:fill-purple-300" />
          <circle cx="17" cy="16" r="1" className="fill-purple-700 dark:fill-purple-300" />
        </svg>
      );
    }

    if (normalizedCategory.includes('mito') || normalizedCategory.includes('verdade')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" className="fill-amber-100 dark:fill-amber-900/30" />
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" className="fill-amber-600 dark:fill-amber-400" />
          <path d="M11 7h2v7h-2V7zm0 9h2v2h-2v-2z" className="fill-amber-700 dark:fill-amber-300" />
        </svg>
      );
    }

    if (normalizedCategory.includes('dúvida') || normalizedCategory.includes('frequente')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="10" className="fill-indigo-100 dark:fill-indigo-900/30" />
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" className="fill-indigo-600 dark:fill-indigo-400" />
          <path d="M11.5 16h1.5v1.5h-1.5V16zm.5-12C9.01 4 7 6.01 7 8.5h1.5c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5c0 1.5-1 2.5-2.5 3.5-1 .67-1.5 1.5-1.5 2.5v.5h1.5v-.5c0-.5.5-1 1.5-1.5 1.5-1 2.5-2 2.5-4 0-2.49-2.01-4.5-4.5-4.5z" className="fill-indigo-700 dark:fill-indigo-300" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 24 24" fill="none" className={className}>
        <circle cx="12" cy="12" r="10" className="fill-slate-100 dark:fill-slate-800" />
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" className="fill-slate-600 dark:fill-slate-400" />
        <circle cx="12" cy="12" r="2" className="fill-slate-700 dark:fill-slate-300" />
      </svg>
    );
  };

  return (
    <div className="flex items-center justify-center" aria-hidden="true">
      {getIcon()}
    </div>
  );
};

export default CategoryIcon;
