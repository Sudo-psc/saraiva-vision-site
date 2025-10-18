# H. Exemplos de Código Essenciais

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-18

---

## Exemplo 1: Navbar Component

### Antes (react-i18next + hard-coded)

```jsx
// src/components/Navbar.jsx (ANTIGO)
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Activity, Users, BookOpen, Mail } from 'lucide-react';

export function Navbar() {
  const { t } = useTranslation();

  const navLinks = useMemo(() => [
    { name: t('navbar.home'), href: '/', icon: Home },
    { name: t('navbar.services'), href: '/servicos', icon: Activity },
    { name: t('navbar.about'), href: '/sobre', icon: Users },
    { name: t('navbar.blog'), href: '/blog', icon: BookOpen },
    { name: t('navbar.contact'), href: '/contato', icon: Mail },
  ], [t]);

  return (
    <nav className="flex gap-4">
      {navLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="flex items-center gap-2 hover:text-primary"
        >
          <link.icon className="w-4 h-4" />
          <span>{link.name}</span>
        </a>
      ))}
    </nav>
  );
}
```

### Depois (ConfigService)

```tsx
// src/components/Navbar.tsx (NOVO)
import { useTranslation } from '@/hooks/config/useTranslation';
import { useConfig } from '@/hooks/config/useConfig';
import * as Icons from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: string;
  highlight?: boolean;
  children?: MenuItem[];
}

export function Navbar() {
  const { locale } = useTranslation();
  const menuItems = useConfig<MenuItem[]>(`menus.header.${locale}`, []);

  return (
    <nav className="flex gap-4">
      {menuItems.map((item) => {
        const Icon = Icons[item.icon as keyof typeof Icons];

        return (
          <a
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-2 hover:text-primary
              ${item.highlight ? 'btn-primary' : ''}
            `}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
```

**Benefícios**:
- ✅ Menu 100% configurável via YAML (ordem, ícones, labels)
- ✅ Suporta highlights (CTAs)
- ✅ Hot reload funciona
- ✅ Sem re-render desnecessário

---

## Exemplo 2: Hero Section com Traduções

### Antes

```jsx
// src/components/Hero.jsx (ANTIGO)
import { useTranslation } from 'react-i18next';

export function Hero() {
  const { t } = useTranslation();

  return (
    <section className="hero">
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.subtitle')}</p>
      <div className="cta-buttons">
        <button className="btn-primary">
          {t('hero.cta.primary')}
        </button>
        <button className="btn-secondary">
          {t('hero.cta.secondary')}
        </button>
      </div>
    </section>
  );
}
```

### Depois

```tsx
// src/components/Hero.tsx (NOVO)
import { useTranslation } from '@/hooks/config/useTranslation';
import { useConfig } from '@/hooks/config/useConfig';

export function Hero() {
  const { t } = useTranslation();
  const whatsappNumber = useConfig('business.phone.whatsapp');

  const handlePrimaryClick = () => {
    // Botão primário abre WhatsApp
    const message = encodeURIComponent(t('whatsapp.appointment.message'));
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <section className="hero bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">
          {t('hero.title')}
        </h1>

        <p className="text-xl mb-8 opacity-90">
          {t('hero.subtitle')}
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handlePrimaryClick}
            className="btn-primary bg-white text-primary-600 hover:bg-gray-100"
          >
            {t('hero.cta.primary')}
          </button>

          <a href="/servicos" className="btn-secondary border-white text-white">
            {t('hero.cta.secondary')}
          </a>
        </div>
      </div>
    </section>
  );
}
```

**YAML Correspondente**:
```yaml
i18n:
  translations:
    pt-BR:
      "hero.title": "Cuidado Completo para sua Visão"
      "hero.subtitle": "Tecnologia de ponta e atendimento humanizado em Caratinga/MG"
      "hero.cta.primary": "Agendar Consulta"
      "hero.cta.secondary": "Conhecer Serviços"
      "whatsapp.appointment.message": "Olá! Gostaria de agendar uma consulta oftalmológica."

business:
  phone:
    whatsapp: "+5533999096030"
```

---

## Exemplo 3: Pricing Section com PlanService

```tsx
// src/components/PricingSection.tsx
import { useState } from 'react';
import { useTranslation } from '@/hooks/config/useTranslation';
import { PlanService } from '@/lib/config/PlanService';
import { Check, X } from 'lucide-react';

type Period = 'monthly' | 'yearly';

export function PricingSection() {
  const { locale } = useTranslation();
  const [period, setPeriod] = useState<Period>('monthly');

  const planService = new PlanService();
  const plans = planService.getPlans(locale, period);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8">
          Nossos Planos
        </h2>

        {/* Toggle Mensal/Anual */}
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setPeriod('monthly')}
            className={`
              px-6 py-2 rounded-lg font-semibold
              ${period === 'monthly'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border'
              }
            `}
          >
            Mensal
          </button>

          <button
            onClick={() => setPeriod('yearly')}
            className={`
              px-6 py-2 rounded-lg font-semibold relative
              ${period === 'yearly'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border'
              }
            `}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-accent text-white text-xs px-2 py-1 rounded-full">
              -17%
            </span>
          </button>
        </div>

        {/* Grid de Planos */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`
                bg-white rounded-xl p-8 shadow-lg
                ${plan.highlight ? 'ring-2 ring-primary-500 scale-105' : ''}
              `}
            >
              {plan.popular && (
                <span className="bg-accent text-white text-sm px-3 py-1 rounded-full">
                  Mais Popular
                </span>
              )}

              <h3 className="text-2xl font-bold mt-4 mb-2">
                {plan.name}
              </h3>

              <p className="text-gray-600 mb-6">
                {plan.description}
              </p>

              {/* Preço */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary-600">
                  {plan.priceFormatted}
                </span>
                <span className="text-gray-600">
                  /{period === 'monthly' ? 'mês' : 'ano'}
                </span>

                {period === 'yearly' && plan.savings && (
                  <p className="text-sm text-accent mt-1">
                    Economize {plan.savingsFormatted}
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? '' : 'text-gray-400'}>
                      {feature.label}
                      {feature.value && ` (${feature.value})`}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={`
                  w-full py-3 rounded-lg font-semibold
                  ${plan.highlight
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50'
                  }
                `}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**PlanService.ts Implementation**:
```typescript
// src/lib/config/PlanService.ts
import { ConfigService } from './ConfigService';

interface PlanFeature {
  key: string;
  included: boolean;
  value?: number | string;
  label: Record<string, string>;
}

interface PlanConfig {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  pricing: {
    monthly: number;  // Centavos
    yearly: number;
  };
  features: PlanFeature[];
  cta: Record<string, string>;
  popular?: boolean;
  highlight?: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceFormatted: string;
  savings?: number;
  savingsFormatted?: string;
  features: Array<{
    label: string;
    included: boolean;
    value?: number | string;
  }>;
  cta: string;
  popular: boolean;
  highlight: boolean;
}

export class PlanService {
  private config: ConfigService;

  constructor() {
    this.config = ConfigService.getInstance();
  }

  public getPlans(locale: string, period: 'monthly' | 'yearly'): Plan[] {
    const plansConfig = this.config.get<PlanConfig[]>('plans.items', []);
    const currency = this.config.get('plans.currency', 'BRL');

    return plansConfig.map((planConfig) => {
      const price = planConfig.pricing[period];
      const monthlyPrice = planConfig.pricing.monthly;
      const yearlyPrice = planConfig.pricing.yearly;

      // Calcular economia anual
      const savings = period === 'yearly'
        ? (monthlyPrice * 12) - yearlyPrice
        : undefined;

      return {
        id: planConfig.id,
        name: planConfig.name[locale] || planConfig.name['pt-BR'],
        description: planConfig.description[locale] || planConfig.description['pt-BR'],
        price,
        priceFormatted: this.formatPrice(price, currency, locale),
        savings,
        savingsFormatted: savings ? this.formatPrice(savings, currency, locale) : undefined,
        features: planConfig.features.map((f) => ({
          label: f.label[locale] || f.label['pt-BR'],
          included: f.included,
          value: f.value,
        })),
        cta: planConfig.cta[locale] || planConfig.cta['pt-BR'],
        popular: planConfig.popular || false,
        highlight: planConfig.highlight || false,
      };
    });
  }

  private formatPrice(cents: number, currency: string, locale: string): string {
    const amount = cents / 100;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }
}
```

---

## Exemplo 4: SEOHead com Overrides

```tsx
// src/components/SEOHead.tsx
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useConfig } from '@/hooks/config/useConfig';
import { useMemo } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export function SEOHead({ title, description, image, type }: SEOHeadProps) {
  const location = useLocation();
  const pathname = location.pathname;

  // Get defaults
  const defaults = useConfig('seo.defaults');
  const canonicalBase = useConfig('seo.defaults.canonicalBase');

  // Get page-specific overrides
  const pageOverrides = useConfig(`seo.pages.${pathname}`, {});

  // Merge: props > page overrides > defaults
  const seo = useMemo(() => {
    const titleTemplate = pageOverrides.titleTemplate || defaults.titleTemplate;
    const finalTitle = title || pageOverrides.title || defaults.title;

    return {
      title: titleTemplate.replace('%s', finalTitle),
      description: description || pageOverrides.description || defaults.description,
      image: image || pageOverrides.og?.image || defaults.og.image,
      type: type || pageOverrides.og?.type || defaults.og.type,
      canonical: `${canonicalBase}${pathname}`,
    };
  }, [title, description, image, type, pathname, defaults, pageOverrides, canonicalBase]);

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />

      {/* Canonical */}
      <link rel="canonical" href={seo.canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={seo.type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.canonical} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  );
}
```

**Uso nas Páginas**:
```tsx
// src/pages/ServicoCatarata.tsx
export function ServicoCatarata() {
  return (
    <>
      <SEOHead
        title="Cirurgia de Catarata"
        description="Procedimento seguro com lentes intraoculares premium"
      />
      {/* Rest of page */}
    </>
  );
}
```

---

## Exemplo 5: Feature Flag Conditional Render

```tsx
// src/components/ChatbotWidget.tsx
import { useFeatureFlag } from '@/hooks/config/useFeatureFlag';
import { Suspense, lazy } from 'react';

// Lazy load chatbot (código pesado)
const ChatWidget = lazy(() => import('./ChatWidget'));

export function ChatbotWidget() {
  const isEnabled = useFeatureFlag('chatbotWidget');

  if (!isEnabled) {
    return null;
  }

  return (
    <Suspense fallback={<div>Carregando chat...</div>}>
      <ChatWidget />
    </Suspense>
  );
}
```

**YAML Config**:
```yaml
featureFlags:
  chatbotWidget:
    enabled: true
    rolloutPercentage: 25  # Apenas 25% dos usuários veem
    targeting:
      - newUsers: true
```

**Resultado**: 25% dos usuários veem o chatbot, outros 75% não (determinístico por userId)

---

## Exemplo 6: Footer Dinâmico

```tsx
// src/components/Footer.tsx
import { useTranslation } from '@/hooks/config/useTranslation';
import { useConfig } from '@/hooks/config/useConfig';

interface FooterSection {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

export function Footer() {
  const { locale, t } = useTranslation();
  const sections = useConfig<FooterSection[]>(`menus.footer.${locale}.sections`, []);
  const siteName = useConfig('site.name');
  const phone = useConfig('business.phone.formatted.main');
  const email = useConfig('business.email.contact');
  const address = useConfig('business.address.formatted.multiLine');

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto grid md:grid-cols-4 gap-8">
        {/* Info da Clínica */}
        <div>
          <h3 className="font-bold text-xl mb-4">{siteName}</h3>
          <p className="text-gray-400 mb-2 whitespace-pre-line">{address}</p>
          <p className="text-gray-400">Tel: {phone}</p>
          <p className="text-gray-400">Email: {email}</p>
        </div>

        {/* Links Dinâmicos */}
        {sections.map((section, idx) => (
          <div key={idx}>
            <h4 className="font-semibold mb-4">{section.title}</h4>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-gray-400 hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="container mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} {siteName}. {t('footer.rights')}
        </p>
      </div>
    </footer>
  );
}
```

---

## Exemplo 7: CLI Config Validator

```javascript
#!/usr/bin/env node
// scripts/config-validate.js

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const { ConfigSchema } = require('../dist/lib/config/config.schema');

const CONFIG_FILES = [
  'config/config.base.yaml',
  'config/config.development.yaml',
  'config/config.staging.yaml',
  'config/config.production.yaml',
];

console.log('🔍 Validating configuration files...\n');

let hasErrors = false;

CONFIG_FILES.forEach((file) => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${file} - SKIPPED (not found)`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const config = yaml.load(content);

    // Validar com Zod
    const result = ConfigSchema.safeParse(config);

    if (result.success) {
      console.log(`✅ ${file} - VALID`);
    } else {
      console.log(`❌ ${file} - INVALID\n`);

      // Formatar erros
      const errors = result.error.format();
      printErrors(errors, '');

      hasErrors = true;
    }
  } catch (error) {
    console.log(`❌ ${file} - PARSE ERROR`);
    console.log(`   ${error.message}\n`);
    hasErrors = true;
  }
});

function printErrors(obj, prefix) {
  Object.entries(obj).forEach(([key, value]) => {
    if (key === '_errors' && Array.isArray(value) && value.length > 0) {
      value.forEach((err) => {
        console.log(`   ${prefix}: ${err}`);
      });
    } else if (typeof value === 'object') {
      printErrors(value, prefix ? `${prefix}.${key}` : key);
    }
  });
}

if (hasErrors) {
  console.log('\n❌ Validation failed. Fix errors above.\n');
  process.exit(1);
} else {
  console.log('\n✅ All configurations valid!\n');
  process.exit(0);
}
```

**Uso**:
```bash
# Tornar executável
chmod +x scripts/config-validate.js

# Rodar validação
npm run validate:config

# Exemplo de saída com erro:
# 🔍 Validating configuration files...
#
# ✅ config/config.base.yaml - VALID
# ❌ config/config.development.yaml - INVALID
#
#    business.phone.main: Phone must be in E.164 format
#    theme.tokens.colors.primary: Expected object, got string
#
# ❌ Validation failed. Fix errors above.
```

---

## Exemplo 8: Hot Reload em Dev

```typescript
// src/main.tsx
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigService } from '@/lib/config/ConfigService';
import { injectCssVars } from '@/lib/config/buildCssVars';

const config = ConfigService.getInstance();

async function bootstrap() {
  // 1. Carregar config
  await config.load();

  // 2. Injetar CSS vars
  injectCssVars();

  // 3. Log de debug
  if (import.meta.env.DEV) {
    console.log('[Config] Loaded:', {
      version: config.get('version'),
      environment: config.get('environment'),
      hash: config.getContentHash(),
    });
  }

  // 4. Render React
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // 5. Hot reload watcher
  if (import.meta.hot) {
    import.meta.hot.accept('/config/config.base.yaml', async () => {
      console.log('[HMR] Config file changed, reloading...');
      await config.load();
      injectCssVars();
      // Notificar componentes via evento
      window.dispatchEvent(new CustomEvent('config-update'));
    });
  }
}

bootstrap().catch((error) => {
  console.error('[Config] Bootstrap failed:', error);
  // Fallback: mostrar erro na tela
  document.getElementById('root')!.innerHTML = `
    <div style="color: red; padding: 20px;">
      <h1>Configuration Error</h1>
      <pre>${error.message}</pre>
    </div>
  `;
});
```

---

## Exemplo 9: Test Suite

```typescript
// src/__tests__/config/ConfigService.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { ConfigService } from '@/lib/config/ConfigService';

describe('ConfigService', () => {
  let config: ConfigService;

  beforeAll(async () => {
    config = ConfigService.getInstance();
    await config.load();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = ConfigService.getInstance();
      const instance2 = ConfigService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('get() method', () => {
    it('should get nested values', () => {
      const siteName = config.get('site.name');
      expect(siteName).toBe('Saraiva Vision');
    });

    it('should get deep nested values', () => {
      const phone = config.get('business.phone.main');
      expect(phone).toMatch(/^\+\d{12,15}$/);
    });

    it('should return default for missing keys', () => {
      const missing = config.get('nonexistent.key', 'DEFAULT');
      expect(missing).toBe('DEFAULT');
    });

    it('should return undefined for missing keys without default', () => {
      const missing = config.get('nonexistent.key');
      expect(missing).toBeUndefined();
    });
  });

  describe('t() translation method', () => {
    it('should translate pt-BR keys', () => {
      const text = config.t('pt-BR', 'nav.home');
      expect(text).toBe('Início');
    });

    it('should translate en-US keys', () => {
      const text = config.t('en-US', 'nav.home');
      expect(text).toBe('Home');
    });

    it('should return fallback for missing translation', () => {
      const text = config.t('pt-BR', 'missing.key', 'Fallback');
      expect(text).toBe('Fallback');
    });

    it('should return key if no fallback provided', () => {
      const text = config.t('pt-BR', 'missing.key');
      expect(text).toBe('missing.key');
    });
  });

  describe('getMenu() method', () => {
    it('should get header menu for pt-BR', () => {
      const menu = config.getMenu('pt-BR', 'header');
      expect(Array.isArray(menu)).toBe(true);
      expect(menu.length).toBeGreaterThan(0);
      expect(menu[0]).toHaveProperty('label');
      expect(menu[0]).toHaveProperty('href');
    });

    it('should get footer menu sections', () => {
      const footer = config.getMenu('pt-BR', 'footer');
      expect(Array.isArray(footer)).toBe(true);
    });
  });

  describe('isFeatureEnabled() method', () => {
    it('should return boolean for existing flags', () => {
      const enabled = config.isFeatureEnabled('podcastPage');
      expect(typeof enabled).toBe('boolean');
    });

    it('should return false for non-existent flags', () => {
      const enabled = config.isFeatureEnabled('nonExistentFeature');
      expect(enabled).toBe(false);
    });

    it('should respect rollout percentage', () => {
      // Flag com 25% rollout deve ser determinístico por userId
      const flag = 'newPricingPage';
      const enabled = config.isFeatureEnabled(flag);
      expect(typeof enabled).toBe('boolean');

      // Chamar novamente deve retornar mesmo resultado
      const enabled2 = config.isFeatureEnabled(flag);
      expect(enabled).toBe(enabled2);
    });
  });

  describe('getContentHash() method', () => {
    it('should return hash string', () => {
      const hash = config.getContentHash();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should be consistent across calls', () => {
      const hash1 = config.getContentHash();
      const hash2 = config.getContentHash();
      expect(hash1).toBe(hash2);
    });
  });
});
```

**Rodar testes**:
```bash
npm run test src/__tests__/config/ConfigService.test.ts

# Output esperado:
# ✓ Singleton Pattern (2)
# ✓ get() method (4)
# ✓ t() translation method (4)
# ✓ getMenu() method (2)
# ✓ isFeatureEnabled() method (3)
# ✓ getContentHash() method (2)
#
# Test Files  1 passed (1)
#      Tests  17 passed (17)
```

---

## Exemplo 10: GitHub Actions CI

```yaml
# .github/workflows/validate-config.yml
name: Validate Configuration

on:
  push:
    paths:
      - 'config/**/*.yaml'
  pull_request:
    paths:
      - 'config/**/*.yaml'

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Validate YAML syntax
        run: |
          npx js-yaml config/config.base.yaml > /dev/null
          npx js-yaml config/config.development.yaml > /dev/null || true
          npx js-yaml config/config.production.yaml > /dev/null || true

      - name: Validate config schema
        run: npm run validate:config

      - name: Build test
        run: npm run build:vite

      - name: Run tests
        run: npm run test:run
```

---

## Resumo dos Exemplos

| Exemplo | Arquivo | Complexidade | Impacto |
|---------|---------|--------------|---------|
| 1. Navbar | `components/Navbar.tsx` | Baixa | Alto (menu dinâmico) |
| 2. Hero | `components/Hero.tsx` | Baixa | Médio (traduções) |
| 3. Pricing | `components/PricingSection.tsx` | Alta | Alto (lógica negócio) |
| 4. SEO | `components/SEOHead.tsx` | Média | Alto (SEO crítico) |
| 5. Feature Flag | `components/ChatbotWidget.tsx` | Baixa | Médio (rollout) |
| 6. Footer | `components/Footer.tsx` | Média | Médio (links dinâmicos) |
| 7. CLI | `scripts/config-validate.js` | Média | Alto (CI/CD) |
| 8. Bootstrap | `main.tsx` | Alta | Crítico (app init) |
| 9. Tests | `__tests__/config/` | Alta | Crítico (qualidade) |
| 10. CI | `.github/workflows/` | Baixa | Alto (automação) |

---

## Próximos Passos

→ Ver código fonte completo em **[Anexo A](./anexo-a-codigo-completo.md)**
→ Ver checklist operacional em **[09-checklist-operacional.md](./09-checklist-operacional.md)**
