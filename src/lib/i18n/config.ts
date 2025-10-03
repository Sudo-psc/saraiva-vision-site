export const i18nConfig = {
  defaultLocale: 'pt',
  locales: ['pt', 'en'],
} as const;

export type Locale = (typeof i18nConfig.locales)[number];

export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
};
