# i18n Configuration for Next.js App Router

## Architecture

**Solution**: react-i18next with Next.js 15 App Router  
**Justification**: Simpler migration path, maintains existing setup, excellent client-side performance

## File Structure

```
src/
├── lib/
│   └── i18n/
│       ├── config.ts          # i18n configuration (locales, default locale)
│       ├── client.ts          # Client-side i18n setup
│       └── server.ts          # Server-side translation utilities
├── components/
│   └── providers/
│       └── I18nProvider.tsx   # Client provider component
├── hooks/
│   └── useI18n.ts            # Custom hook for translations
└── locales/
    ├── pt/
    │   ├── translation.json
    │   └── common.json
    └── en/
        └── translation.json
```

## Configuration Files

### 1. `src/lib/i18n/config.ts`
Centralized configuration for locales and settings.

### 2. `src/lib/i18n/client.ts`
Client-side i18n initialization using react-i18next. Used in Client Components.

### 3. `src/lib/i18n/server.ts`
Server-side utilities for loading translations in Server Components and Server Actions.

### 4. `src/components/providers/I18nProvider.tsx`
Provider component that wraps the app and provides i18n context to client components.

### 5. `src/hooks/useI18n.ts`
Custom hook that wraps useTranslation with type safety.

## Usage

### Root Layout (Server Component)

```tsx
// app/layout.tsx
import { I18nProvider } from '@/components/providers/I18nProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <I18nProvider locale="pt">
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

### Client Components

```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export function MyComponent() {
  const { t } = useI18n();

  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
    </div>
  );
}
```

### Server Components

```tsx
import { getDictionary, getNestedValue } from '@/lib/i18n/server';

export default async function MyPage() {
  const dict = await getDictionary('pt');
  
  return (
    <div>
      <h1>{getNestedValue(dict, 'hero.title')}</h1>
      <p>{getNestedValue(dict, 'hero.subtitle')}</p>
    </div>
  );
}
```

### Using Trans Component for Rich Text

```tsx
'use client';

import { Trans, useTranslation } from 'react-i18next';

export function Hero() {
  const { t } = useTranslation();
  
  return (
    <h1>
      <Trans i18nKey="hero.title">
        Cuidando da sua <span className="text-gradient">visão</span> com excelência
      </Trans>
    </h1>
  );
}
```

## Adding New Languages

1. Create new locale folder: `src/locales/es/`
2. Add translation file: `src/locales/es/translation.json`
3. Update `src/lib/i18n/config.ts`:
```typescript
export const i18nConfig = {
  defaultLocale: 'pt',
  locales: ['pt', 'en', 'es'], // Add 'es'
} as const;

export const localeNames: Record<Locale, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español', // Add name
};
```
4. Update `src/lib/i18n/client.ts` and `src/lib/i18n/server.ts` to include Spanish resources

## Language Switcher Example

```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';
import { i18nConfig, localeNames } from '@/lib/i18n/config';

export function LanguageSwitcher() {
  const { locale, changeLanguage } = useI18n();
  
  return (
    <select value={locale} onChange={(e) => changeLanguage(e.target.value)}>
      {i18nConfig.locales.map((loc) => (
        <option key={loc} value={loc}>
          {localeNames[loc]}
        </option>
      ))}
    </select>
  );
}
```

## Migration Guide for Existing Components

### Before (Vite-style):
```tsx
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <div>{t('key')}</div>;
}
```

### After (Next.js App Router):
```tsx
'use client'; // Add this directive

import { useI18n } from '@/hooks/useI18n'; // Use custom hook

function Component() {
  const { t } = useI18n();
  return <div>{t('key')}</div>;
}
```

**Changes required:**
1. Add `'use client'` directive
2. Import from `@/hooks/useI18n` instead of `react-i18next`
3. Everything else stays the same!

## Advanced Features

### Namespace Usage

```tsx
const { t } = useTranslation(['translation', 'common']);

t('translation:hero.title'); // From translation.json
t('common:logo_alt');        // From common.json
```

### Interpolation

```tsx
// In translation.json:
// "greeting": "Hello, {{name}}!"

t('greeting', { name: 'John' }); // "Hello, John!"
```

### Pluralization

```tsx
// In translation.json:
// "items": "{{count}} item",
// "items_plural": "{{count}} items"

t('items', { count: 1 });  // "1 item"
t('items', { count: 5 });  // "5 items"
```

## Performance Considerations

- **Client Components**: react-i18next loads translations on mount, minimal overhead
- **Server Components**: Translations loaded at build time, zero client JS
- **Code Splitting**: Next.js automatically code-splits by route
- **Bundle Size**: react-i18next + i18next ≈ 15KB gzipped

## Best Practices

1. **Use Server Components when possible** - Better performance, no client JS
2. **Keep translations organized** - Use nested keys for structure
3. **Avoid inline translations** - Always use translation keys
4. **Type safety** - Consider adding TypeScript types for translation keys
5. **Lazy loading** - Load translations only when needed

## Troubleshooting

### Translation keys not found
- Check that locale files are in correct location: `src/locales/[locale]/`
- Verify import paths in `client.ts` and `server.ts`
- Ensure JSON files are valid

### Hydration errors
- Make sure `'use client'` directive is present in client components
- Verify I18nProvider wraps your app in layout.tsx

### Locale not changing
- Check that I18nProvider receives correct locale prop
- Verify useEffect in I18nProvider is running

## Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [i18next Documentation](https://www.i18next.com/)
