'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { i18nConfig } from './config';

import ptTranslation from '../../locales/pt/translation.json';
import ptCommon from '../../locales/pt/common.json';
import enTranslation from '../../locales/en/translation.json';

const resources = {
  pt: {
    translation: ptTranslation,
    common: ptCommon,
  },
  en: {
    translation: enTranslation,
    common: {},
  },
} as const;

i18n
  .use(initReactI18next)
  .init({
    lng: i18nConfig.defaultLocale,
    fallbackLng: i18nConfig.defaultLocale,
    resources,
    ns: ['translation', 'common'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    react: {
      useSuspense: false,
    },
  })
  .catch((error) => {
    console.error('Failed to initialize i18n:', error);
  });

export default i18n;
