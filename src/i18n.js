import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '@/locales/en/translation.json';
import ptTranslation from '@/locales/pt/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: import.meta.env.DEV,
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'en'],
    detection: {
      // Avoid unexpected browser-language switching; prefer explicit user choice
      order: ['localStorage', 'cookie', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: enTranslation,
      },
      pt: {
        translation: ptTranslation,
      },
    },
    react: {
      useSuspense: false, // Disable suspense to prevent context issues
    },
  });

export default i18n;
