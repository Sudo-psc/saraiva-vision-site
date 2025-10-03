# i18n Usage Examples

## Client Component Examples

### Basic Usage
```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export function SimpleComponent() {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
      <button>{t('hero.schedule_button')}</button>
    </div>
  );
}
```

### With Variables
```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export function WelcomeMessage({ userName }: { userName: string }) {
  const { t } = useI18n();
  
  return (
    <div>
      <h1>{t('welcome.greeting', { name: userName })}</h1>
      <p>{t('welcome.message', { count: 5 })}</p>
    </div>
  );
}
```

### Rich Text with Trans Component
```tsx
'use client';

import { Trans } from 'react-i18next';

export function HeroSection() {
  return (
    <h1 className="text-5xl">
      <Trans i18nKey="hero.title">
        Cuidando da sua <span className="text-gradient">visão</span> com excelência
      </Trans>
    </h1>
  );
}
```

### Lists and Arrays
```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export function ServicesList() {
  const { t } = useI18n();
  
  const serviceLinks = t('footer.service_links', { returnObjects: true }) as Record<string, string>;
  
  return (
    <ul>
      {Object.entries(serviceLinks).map(([key, value]) => (
        <li key={key}>{value}</li>
      ))}
    </ul>
  );
}
```

### Language Switcher
```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';
import { i18nConfig, localeNames, type Locale } from '@/lib/i18n/config';

export function LanguageSwitcher() {
  const { locale, changeLanguage } = useI18n();
  
  const handleChange = (newLocale: Locale) => {
    changeLanguage(newLocale);
    document.documentElement.lang = newLocale === 'pt' ? 'pt-BR' : newLocale;
  };
  
  return (
    <div className="flex gap-2">
      {i18nConfig.locales.map((loc) => (
        <button
          key={loc}
          onClick={() => handleChange(loc)}
          className={`px-4 py-2 rounded ${
            locale === loc ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          {localeNames[loc]}
        </button>
      ))}
    </div>
  );
}
```

## Server Component Examples

### Basic Page
```tsx
import { getDictionary, getNestedValue } from '@/lib/i18n/server';

export default async function AboutPage() {
  const dict = await getDictionary('pt');
  
  return (
    <div>
      <h1>{getNestedValue(dict, 'about.title')}</h1>
      <p>{getNestedValue(dict, 'about.p1')}</p>
      <p>{getNestedValue(dict, 'about.p2')}</p>
    </div>
  );
}
```

### With Dynamic Locale from URL
```tsx
import { getDictionary, getNestedValue } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/config';

interface PageProps {
  params: { locale: Locale };
}

export default async function LocalizedPage({ params }: PageProps) {
  const dict = await getDictionary(params.locale);
  
  return (
    <div>
      <h1>{getNestedValue(dict, 'page.title')}</h1>
      <p>{getNestedValue(dict, 'page.description')}</p>
    </div>
  );
}
```

### Metadata with Translations
```tsx
import { getDictionary, getNestedValue } from '@/lib/i18n/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary('pt');
  
  return {
    title: getNestedValue(dict, 'homeMeta.title'),
    description: getNestedValue(dict, 'homeMeta.description'),
    keywords: getNestedValue(dict, 'homeMeta.keywords'),
  };
}

export default async function Home() {
  // ... page content
}
```

## Mixed Usage (Server + Client)

### Server Component with Client Children
```tsx
// app/page.tsx (Server Component)
import { getDictionary, getNestedValue } from '@/lib/i18n/server';
import { ContactForm } from '@/components/ContactForm';

export default async function ContactPage() {
  const dict = await getDictionary('pt');
  
  return (
    <div>
      <h1>{getNestedValue(dict, 'contact.title')}</h1>
      <p>{getNestedValue(dict, 'contact.subtitle')}</p>
      
      {/* Client Component */}
      <ContactForm />
    </div>
  );
}

// components/ContactForm.tsx (Client Component)
'use client';

import { useI18n } from '@/hooks/useI18n';

export function ContactForm() {
  const { t } = useI18n();
  
  return (
    <form>
      <label>{t('contact.name_label')}</label>
      <input placeholder={t('contact.name_placeholder')} />
      
      <label>{t('contact.email_label')}</label>
      <input placeholder={t('contact.email_placeholder')} />
      
      <button>{t('contact.send_button')}</button>
    </form>
  );
}
```

## Layout Integration

### Root Layout
```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { I18nProvider } from '@/components/providers/I18nProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Saraiva Vision',
  description: 'Clínica oftalmológica em Caratinga',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body>
        <I18nProvider locale="pt">
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

### With Multiple Providers
```tsx
// app/layout.tsx
import { I18nProvider } from '@/components/providers/I18nProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <I18nProvider locale="pt">
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
```

## Advanced Patterns

### Conditional Translations
```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export function ConditionalMessage({ userType }: { userType: 'familiar' | 'jovem' | 'senior' }) {
  const { t } = useI18n();
  
  const messageKey = `messages.${userType}`;
  
  return <p>{t(messageKey)}</p>;
}
```

### Loading States
```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';
import { useState } from 'react';

export function AsyncComponent() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <button disabled={isLoading}>
      {isLoading ? t('ui.loading') : t('ui.submit')}
    </button>
  );
}
```

### Error Messages
```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export function FormWithValidation() {
  const { t } = useI18n();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (field: string, value: string) => {
    if (!value) {
      setErrors(prev => ({
        ...prev,
        [field]: t('contact.validation.required', { field })
      }));
    }
  };
  
  return (
    <div>
      <input onChange={(e) => validate('email', e.target.value)} />
      {errors.email && (
        <span className="text-red-500">{errors.email}</span>
      )}
    </div>
  );
}
```

### Formatted Dates
```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export function DateDisplay({ date }: { date: Date }) {
  const { t, locale } = useI18n();
  
  const formattedDate = new Intl.DateTimeFormat(
    locale === 'pt' ? 'pt-BR' : 'en-US',
    { dateStyle: 'long' }
  ).format(date);
  
  return (
    <p>
      {t('blog.published_date', { date: formattedDate })}
    </p>
  );
}
```

## Migration Examples

### Before (Old setup with Vite)
```tsx
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();
  return <footer>{t('footer.slogan')}</footer>;
}
```

### After (Next.js App Router)
```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

function Footer() {
  const { t } = useI18n();
  return <footer>{t('footer.slogan')}</footer>;
}
```

### Migrating Existing Components Checklist

1. ✅ Add `'use client'` directive at the top
2. ✅ Change import from `react-i18next` to `@/hooks/useI18n`
3. ✅ Replace `useTranslation()` with `useI18n()`
4. ✅ Test that translations still work
5. ✅ Verify no hydration errors in console

## Best Practices

### ✅ DO:
```tsx
'use client';

import { useI18n } from '@/hooks/useI18n';

export function GoodExample() {
  const { t } = useI18n();
  
  return <h1>{t('page.title')}</h1>;
}
```

### ❌ DON'T:
```tsx
'use client';

export function BadExample() {
  // Don't hardcode strings
  return <h1>Hardcoded title</h1>;
  
  // Don't inline translations
  const title = "Some title";
  return <h1>{title}</h1>;
}
```

## Testing i18n Components

```tsx
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/client';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders translated text', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MyComponent />
      </I18nextProvider>
    );
    
    expect(screen.getByText('Cuidando da sua visão')).toBeInTheDocument();
  });
});
```
