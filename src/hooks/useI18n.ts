'use client';

import { useTranslation as useTranslationOriginal } from 'react-i18next';
import type { TFunction } from 'i18next';

export function useI18n() {
  const { t, i18n } = useTranslationOriginal();
  
  return {
    t: t as TFunction,
    locale: i18n.language,
    changeLanguage: i18n.changeLanguage.bind(i18n),
  };
}

export { useTranslation } from 'react-i18next';
