import 'server-only';
import { i18nConfig, type Locale } from './config';

type TranslationFile = Record<string, unknown>;

const dictionaries: Record<Locale, () => Promise<TranslationFile>> = {
  pt: () => import('../../locales/pt/translation.json').then((module) => module.default),
  en: () => import('../../locales/en/translation.json').then((module) => module.default),
};

export async function getDictionary(locale: Locale = i18nConfig.defaultLocale) {
  if (!dictionaries[locale]) {
    console.warn(`Locale "${locale}" not found, falling back to ${i18nConfig.defaultLocale}`);
    return dictionaries[i18nConfig.defaultLocale]();
  }
  return dictionaries[locale]();
}

export function getNestedValue(obj: unknown, path: string, defaultValue = ''): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return defaultValue || path;
    }
  }

  return typeof current === 'string' ? current : defaultValue || path;
}
