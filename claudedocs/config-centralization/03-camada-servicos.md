# C. Camada de Serviços - ConfigService e PlanService

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-18

---

## Visão Geral da Arquitetura

```
config.yaml → ConfigService (singleton) → React Hooks → Components
                     ↓
              PlanService (business logic)
                     ↓
              Formatação + Cálculos
```

---

## 1. ConfigService (Singleton Core)

### 1.1 Responsabilidades

- ✅ Carregar e validar YAML (base + env overrides)
- ✅ Deep merge de configurações
- ✅ Validação com Zod schema
- ✅ Cache de configuração em memória
- ✅ Hot reload em desenvolvimento
- ✅ Acesso type-safe a valores
- ✅ Content hash para cache busting

---

### 1.2 Interface Pública

```typescript
// src/lib/config/ConfigService.ts
export interface IConfigService {
  // Lifecycle
  load(): Promise<void>;

  // Getters
  get<T>(path: string, defaultValue?: T): T;
  t(locale: string, key: string, fallback?: string): string;
  getMenu(locale: string, area: 'header' | 'footer' | 'mobile'): MenuItem[];
  getPlans(locale: string): PlanConfig[];

  // Feature Flags
  isFeatureEnabled(feature: string): boolean;

  // Metadata
  getContentHash(): string;
  getVersion(): string;
  getEnvironment(): string;
}
```

---

### 1.3 Implementação Completa

```typescript
// src/lib/config/ConfigService.ts
import yaml from 'js-yaml';
import { ConfigSchema, type Config } from './config.schema';
import { deepMerge } from '@/utils/deepMerge';

class ConfigService implements IConfigService {
  private static instance: ConfigService | null = null;
  private config: Config | null = null;
  private contentHash: string = '';
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public async load(): Promise<void> {
    // Evitar múltiplas cargas simultâneas
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this._load();
    return this.loadPromise;
  }

  private async _load(): Promise<void> {
    try {
      const startTime = performance.now();

      // 1. Carregar base config
      const baseResponse = await fetch('/config/config.base.yaml');
      if (!baseResponse.ok) {
        throw new Error(`Failed to fetch base config: ${baseResponse.status}`);
      }
      const baseText = await baseResponse.text();
      const baseConfig = yaml.load(baseText) as any;

      // 2. Carregar env override (se existir)
      const env = import.meta.env.MODE; // 'development' | 'production'
      let envConfig = {};

      try {
        const envResponse = await fetch(`/config/config.${env}.yaml`);
        if (envResponse.ok) {
          const envText = await envResponse.text();
          envConfig = yaml.load(envText) as any;
          console.log(`[Config] Loaded ${env} overrides`);
        }
      } catch (error) {
        // Env override é opcional
        console.log(`[Config] No ${env} overrides found (optional)`);
      }

      // 3. Deep merge (env overrides base)
      const mergedConfig = deepMerge(baseConfig, envConfig);

      // 4. Validar com Zod
      const result = ConfigSchema.safeParse(mergedConfig);

      if (!result.success) {
        console.error('[Config] Validation errors:', result.error.format());
        throw new Error('Invalid configuration schema');
      }

      // 5. Salvar config validado
      this.config = result.data;

      // 6. Calcular hash para cache busting
      this.contentHash = this.calculateHash(JSON.stringify(this.config));

      const loadTime = (performance.now() - startTime).toFixed(2);

      console.log(`[Config] ✅ Loaded v${this.config.version} (${this.config.environment}) in ${loadTime}ms`);
      console.log(`[Config] Hash: ${this.contentHash.substring(0, 8)}`);

      // 7. Setup hot reload em dev
      if (import.meta.hot) {
        this.setupHotReload();
      }
    } catch (error) {
      console.error('[Config] Failed to load:', error);
      this.loadPromise = null;
      throw error;
    }
  }

  private setupHotReload() {
    import.meta.hot!.accept(() => {
      console.log('[Config] 🔥 Hot reload detected, reloading config...');
      this.loadPromise = null;
      this.load().then(() => {
        // Notificar subscribers (hooks React)
        window.dispatchEvent(new CustomEvent('config-update'));
      });
    });
  }

  public get<T = any>(path: string, defaultValue?: T): T {
    if (!this.config) {
      throw new Error('[Config] Not loaded. Call load() first.');
    }

    const keys = path.split('.');
    let value: any = this.config;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return defaultValue as T;
      }
    }

    return value as T;
  }

  public t(locale: string, key: string, fallback?: string): string {
    const translations = this.get<Record<string, Record<string, string>>>('i18n.translations');

    if (!translations || !translations[locale]) {
      return fallback || key;
    }

    return translations[locale][key] || fallback || key;
  }

  public getMenu(locale: string, area: 'header' | 'footer' | 'mobile'): any[] {
    return this.get(`menus.${area}.${locale}`, []);
  }

  public getPlans(locale: string): any[] {
    return this.get('plans.items', []);
  }

  public isFeatureEnabled(feature: string): boolean {
    const flag = this.get(`featureFlags.${feature}`);

    if (!flag || !flag.enabled) {
      return false;
    }

    // Rollout percentual
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const userId = this.getUserId();
      const hash = this.simpleHash(`${userId}:${feature}`);
      const bucket = hash % 100;

      return bucket < flag.rolloutPercentage;
    }

    return true;
  }

  public getContentHash(): string {
    return this.contentHash;
  }

  public getVersion(): string {
    return this.get('version', '0.0.0');
  }

  public getEnvironment(): string {
    return this.get('environment', 'development');
  }

  // Helpers privados

  private calculateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private getUserId(): string {
    // Persistent user ID para rollout consistente
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('userId', userId);
    }
    return userId;
  }
}

export default ConfigService;
export { ConfigService };
```

---

### 1.4 deepMerge Utility

```typescript
// src/utils/deepMerge.ts
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}
```

**Test**:
```typescript
const base = { a: 1, b: { c: 2, d: 3 } };
const override = { b: { c: 99 }, e: 4 };
const result = deepMerge(base, override);
// → { a: 1, b: { c: 99, d: 3 }, e: 4 }
```

---

## 2. PlanService (Business Logic)

### 2.1 Responsabilidades

- ✅ Buscar planos do ConfigService
- ✅ Calcular preços com período (monthly/yearly)
- ✅ Formatar valores monetários (BRL)
- ✅ Calcular economia anual
- ✅ Traduzir features para locale
- ✅ Aplicar lógica de destaque (popular, highlight)

---

### 2.2 Interface

```typescript
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number; // Em centavos
  priceFormatted: string; // "R$ 299,00"
  savings?: number; // Economia anual em centavos
  savingsFormatted?: string; // "R$ 101,00"
  features: PlanFeature[];
  cta: string;
  popular: boolean;
  highlight: boolean;
}

export interface PlanFeature {
  label: string;
  included: boolean;
  value?: number | string;
}
```

---

### 2.3 Implementação

```typescript
// src/lib/config/PlanService.ts
import { ConfigService } from './ConfigService';

interface PlanConfig {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  pricing: {
    monthly: number;
    yearly: number;
  };
  features: Array<{
    key: string;
    included: boolean;
    value?: number | string;
    label: Record<string, string>;
  }>;
  cta: Record<string, string>;
  popular?: boolean;
  highlight?: boolean;
}

export class PlanService {
  private config: ConfigService;

  constructor() {
    this.config = ConfigService.getInstance();
  }

  public getPlans(locale: string, period: 'monthly' | 'yearly' = 'monthly'): Plan[] {
    const plansConfig = this.config.get<PlanConfig[]>('plans.items', []);
    const currency = this.config.get('plans.currency', 'BRL');

    return plansConfig.map((planConfig) => this.transformPlan(planConfig, locale, period, currency));
  }

  private transformPlan(
    planConfig: PlanConfig,
    locale: string,
    period: 'monthly' | 'yearly',
    currency: string
  ): Plan {
    const price = planConfig.pricing[period];
    const monthlyPrice = planConfig.pricing.monthly;
    const yearlyPrice = planConfig.pricing.yearly;

    // Calcular economia anual
    const savings = period === 'yearly'
      ? this.calculateSavings(monthlyPrice, yearlyPrice)
      : undefined;

    return {
      id: planConfig.id,
      name: this.getLocalizedString(planConfig.name, locale),
      description: this.getLocalizedString(planConfig.description, locale),
      price,
      priceFormatted: this.formatPrice(price, currency, locale),
      savings,
      savingsFormatted: savings ? this.formatPrice(savings, currency, locale) : undefined,
      features: planConfig.features.map((f) => ({
        label: this.getLocalizedString(f.label, locale),
        included: f.included,
        value: f.value,
      })),
      cta: this.getLocalizedString(planConfig.cta, locale),
      popular: planConfig.popular || false,
      highlight: planConfig.highlight || false,
    };
  }

  private calculateSavings(monthlyPrice: number, yearlyPrice: number): number {
    // Economia = (Mensal × 12) - Anual
    return (monthlyPrice * 12) - yearlyPrice;
  }

  public formatPrice(cents: number, currency: string, locale: string): string {
    const amount = cents / 100;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  private getLocalizedString(obj: Record<string, string>, locale: string): string {
    return obj[locale] || obj['pt-BR'] || Object.values(obj)[0] || '';
  }

  // Helper para calcular desconto percentual
  public getDiscountPercentage(monthlyPrice: number, yearlyPrice: number): number {
    const savings = this.calculateSavings(monthlyPrice, yearlyPrice);
    const totalMonthly = monthlyPrice * 12;
    return Math.round((savings / totalMonthly) * 100);
  }
}
```

**Uso**:
```typescript
const planService = new PlanService();

const monthlyPlans = planService.getPlans('pt-BR', 'monthly');
// → [{ name: "Plano Básico", priceFormatted: "R$ 299,00", ... }]

const yearlyPlans = planService.getPlans('pt-BR', 'yearly');
// → [{ name: "Plano Básico", priceFormatted: "R$ 2.988,00", savingsFormatted: "R$ 600,00", ... }]
```

---

## 3. React Hooks

### 3.1 useConfig Hook

```typescript
// src/hooks/config/useConfig.ts
import { useSyncExternalStore } from 'react';
import { ConfigService } from '@/lib/config/ConfigService';

const config = ConfigService.getInstance();

// Store de subscribers
const subscribers = new Set<() => void>();

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers() {
  subscribers.forEach((cb) => cb());
}

// Listener para hot reload
if (typeof window !== 'undefined') {
  window.addEventListener('config-update', () => {
    notifySubscribers();
  });
}

export function useConfig<T = any>(path: string, defaultValue?: T): T {
  const value = useSyncExternalStore(
    subscribe,
    () => config.get<T>(path, defaultValue),
    () => config.get<T>(path, defaultValue) // Server-side
  );

  return value;
}
```

**Uso**:
```tsx
function MyComponent() {
  const siteName = useConfig('site.name');
  const phone = useConfig('business.phone.main');

  return <div>{siteName} - {phone}</div>;
}
```

---

### 3.2 useTranslation Hook

```typescript
// src/hooks/config/useTranslation.ts
import { useCallback, useMemo } from 'react';
import { ConfigService } from '@/lib/config/ConfigService';
import { useConfig } from './useConfig';

export function useTranslation(locale?: string) {
  const defaultLocale = useConfig('i18n.defaultLocale', 'pt-BR');
  const activeLocale = locale || defaultLocale;

  const config = useMemo(() => ConfigService.getInstance(), []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return config.t(activeLocale, key, fallback);
    },
    [config, activeLocale]
  );

  return { t, locale: activeLocale };
}
```

**Uso**:
```tsx
function Hero() {
  const { t } = useTranslation();

  return (
    <h1>{t('hero.title', 'Default Title')}</h1>
  );
}
```

---

### 3.3 useFeatureFlag Hook

```typescript
// src/hooks/config/useFeatureFlag.ts
import { useMemo } from 'react';
import { ConfigService } from '@/lib/config/ConfigService';

export function useFeatureFlag(feature: string): boolean {
  const enabled = useMemo(() => {
    const config = ConfigService.getInstance();
    return config.isFeatureEnabled(feature);
  }, [feature]);

  return enabled;
}
```

**Uso**:
```tsx
function ChatbotWidget() {
  const isEnabled = useFeatureFlag('chatbotWidget');

  if (!isEnabled) return null;

  return <ChatWidget />;
}
```

---

### 3.4 useThemeToken Hook

```typescript
// src/hooks/config/useThemeToken.ts
import { useConfig } from './useConfig';

export function useThemeToken(path: string): string {
  const value = useConfig(`theme.tokens.${path}`, '');
  return value;
}
```

**Uso**:
```tsx
function CustomButton() {
  const primaryColor = useThemeToken('colors.primary.500');

  return (
    <button style={{ backgroundColor: primaryColor }}>
      Click me
    </button>
  );
}
```

---

## 4. CSS Vars Builder

```typescript
// src/lib/config/buildCssVars.ts
import { ConfigService } from './ConfigService';

export function buildCssVars(): string {
  const config = ConfigService.getInstance();
  const tokens = config.get('theme.tokens');

  let css = ':root {\n';

  // Colors
  Object.entries(tokens.colors || {}).forEach(([name, value]) => {
    if (typeof value === 'object') {
      // Nested colors (primary.50, primary.100, etc.)
      Object.entries(value).forEach(([shade, hex]) => {
        css += `  --color-${name}-${shade}: ${hex};\n`;
      });
    } else {
      // Flat colors (accent, success, etc.)
      css += `  --color-${name}: ${value};\n`;
    }
  });

  // Typography
  Object.entries(tokens.typography?.fontFamily || {}).forEach(([name, fonts]) => {
    css += `  --font-${name}: ${(fonts as string[]).join(', ')};\n`;
  });

  Object.entries(tokens.typography?.fontSize || {}).forEach(([name, size]) => {
    css += `  --text-${name}: ${size};\n`;
  });

  // Spacing
  Object.entries(tokens.spacing || {}).forEach(([name, value]) => {
    css += `  --spacing-${name}: ${value};\n`;
  });

  // Border radius
  Object.entries(tokens.borderRadius || {}).forEach(([name, value]) => {
    css += `  --radius-${name}: ${value};\n`;
  });

  // Shadows
  Object.entries(tokens.shadows || {}).forEach(([name, value]) => {
    css += `  --shadow-${name}: ${value};\n`;
  });

  css += '}\n';
  return css;
}

export function injectCssVars() {
  const css = buildCssVars();
  const style = document.createElement('style');
  style.id = 'config-css-vars';
  style.textContent = css;

  // Remover estilo antigo se existir
  const existing = document.getElementById('config-css-vars');
  if (existing) {
    existing.remove();
  }

  document.head.appendChild(style);
}
```

**Uso**:
```typescript
// src/main.tsx
import { injectCssVars } from '@/lib/config/buildCssVars';

async function bootstrap() {
  await config.load();
  injectCssVars(); // ← Injetar CSS vars
  // ...render app
}
```

---

## Resumo da Camada

| Componente | Responsabilidade | API Principal |
|------------|------------------|---------------|
| **ConfigService** | Carregar e validar YAML | `get()`, `t()`, `isFeatureEnabled()` |
| **PlanService** | Lógica de planos | `getPlans()`, `formatPrice()` |
| **useConfig** | Hook React para config | `useConfig(path)` |
| **useTranslation** | Hook para i18n | `t(key)` |
| **useFeatureFlag** | Hook para flags | `useFeatureFlag(name)` |
| **buildCssVars** | Gerar CSS vars | `injectCssVars()` |

**Próximos Passos**: Ver integração com build em [04-integracao-build.md](./04-integracao-build.md)
