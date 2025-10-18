# F. Estratégia de Testes e Qualidade

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-18

---

## Pirâmide de Testes

```
        E2E (5%)
       /        \
      /  Integração (25%)
     /            \
    /   Unitários (70%)
   /________________\
```

**Meta de Coverage**: 85%+ (config system crítico)

---

## 1. Testes Unitários (Vitest)

### 1.1 ConfigService Tests

```typescript
// src/__tests__/config/ConfigService.test.ts
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { ConfigService } from '@/lib/config/ConfigService';

describe('ConfigService', () => {
  let config: ConfigService;

  beforeAll(async () => {
    config = ConfigService.getInstance();
    await config.load();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = ConfigService.getInstance();
      const instance2 = ConfigService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should not allow direct instantiation', () => {
      // @ts-expect-error - Testing private constructor
      expect(() => new ConfigService()).toThrow();
    });
  });

  describe('load() method', () => {
    it('should load config successfully', async () => {
      expect(config.getVersion()).toMatch(/^\d+\.\d+\.\d+$/);
      expect(config.getEnvironment()).toMatch(/^(development|staging|production)$/);
    });

    it('should calculate content hash', () => {
      const hash = config.getContentHash();
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should cache load promise', async () => {
      const promise1 = config.load();
      const promise2 = config.load();
      expect(promise1).toBe(promise2);
    });
  });

  describe('get() method', () => {
    it('should get top-level values', () => {
      const siteName = config.get('site.name');
      expect(siteName).toBeTruthy();
      expect(typeof siteName).toBe('string');
    });

    it('should get deeply nested values', () => {
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

    it('should handle null/undefined in path', () => {
      const value = config.get('site.nonexistent.deep.path', 'FALLBACK');
      expect(value).toBe('FALLBACK');
    });
  });

  describe('t() translation method', () => {
    it('should translate pt-BR keys', () => {
      const text = config.t('pt-BR', 'nav.home');
      expect(text).toBeTruthy();
      expect(text).not.toBe('nav.home'); // Não deve retornar a key
    });

    it('should translate en-US keys', () => {
      const text = config.t('en-US', 'nav.home');
      expect(text).toBeTruthy();
    });

    it('should return fallback for missing translation', () => {
      const text = config.t('pt-BR', 'missing.key', 'Fallback Text');
      expect(text).toBe('Fallback Text');
    });

    it('should return key if no fallback provided', () => {
      const text = config.t('pt-BR', 'missing.key');
      expect(text).toBe('missing.key');
    });

    it('should handle non-existent locale', () => {
      const text = config.t('fr-FR', 'any.key', 'Fallback');
      expect(text).toBe('Fallback');
    });
  });

  describe('getMenu() method', () => {
    it('should get header menu', () => {
      const menu = config.getMenu('pt-BR', 'header');
      expect(Array.isArray(menu)).toBe(true);
      expect(menu.length).toBeGreaterThan(0);
    });

    it('should have required menu item properties', () => {
      const menu = config.getMenu('pt-BR', 'header');
      const firstItem = menu[0];

      expect(firstItem).toHaveProperty('label');
      expect(firstItem).toHaveProperty('href');
      expect(typeof firstItem.label).toBe('string');
      expect(typeof firstItem.href).toBe('string');
    });

    it('should return empty array for missing menu', () => {
      const menu = config.getMenu('pt-BR', 'nonexistent' as any);
      expect(menu).toEqual([]);
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

    it('should be deterministic for same userId', () => {
      const flag = 'newPricingPage';
      const enabled1 = config.isFeatureEnabled(flag);
      const enabled2 = config.isFeatureEnabled(flag);
      expect(enabled1).toBe(enabled2);
    });

    it('should respect rollout percentage', () => {
      // Testar com múltiplos userIds simulados
      const results: boolean[] = [];
      for (let i = 0; i < 100; i++) {
        // Simular diferentes userIds
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(`user-${i}`);
        const enabled = config.isFeatureEnabled('newPricingPage');
        results.push(enabled);
      }

      const enabledCount = results.filter(Boolean).length;
      const expectedPercentage = config.get('featureFlags.newPricingPage.rolloutPercentage', 0);

      // Deve estar próximo do esperado (±10%)
      expect(enabledCount).toBeGreaterThanOrEqual(expectedPercentage - 10);
      expect(enabledCount).toBeLessThanOrEqual(expectedPercentage + 10);
    });
  });
});
```

---

### 1.2 PlanService Tests

```typescript
// src/__tests__/config/PlanService.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { PlanService } from '@/lib/config/PlanService';
import { ConfigService } from '@/lib/config/ConfigService';

describe('PlanService', () => {
  let planService: PlanService;

  beforeAll(async () => {
    const config = ConfigService.getInstance();
    await config.load();
    planService = new PlanService();
  });

  describe('getPlans()', () => {
    it('should return array of plans', () => {
      const plans = planService.getPlans('pt-BR', 'monthly');
      expect(Array.isArray(plans)).toBe(true);
      expect(plans.length).toBeGreaterThan(0);
    });

    it('should have required plan properties', () => {
      const plans = planService.getPlans('pt-BR', 'monthly');
      const plan = plans[0];

      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('description');
      expect(plan).toHaveProperty('price');
      expect(plan).toHaveProperty('priceFormatted');
      expect(plan).toHaveProperty('features');
      expect(plan).toHaveProperty('cta');
    });

    it('should format prices correctly for monthly', () => {
      const plans = planService.getPlans('pt-BR', 'monthly');
      const plan = plans[0];

      expect(plan.priceFormatted).toMatch(/^R\$\s\d{1,3}(.\d{3})*,\d{2}$/);
      expect(plan.savings).toBeUndefined();
    });

    it('should format prices correctly for yearly', () => {
      const plans = planService.getPlans('pt-BR', 'yearly');
      const plan = plans[0];

      expect(plan.priceFormatted).toMatch(/^R\$\s\d{1,3}(.\d{3})*,\d{2}$/);
      expect(plan.savings).toBeDefined();
      expect(plan.savingsFormatted).toMatch(/^R\$\s\d{1,3}(.\d{3})*,\d{2}$/);
    });

    it('should calculate savings correctly', () => {
      const monthlyPlans = planService.getPlans('pt-BR', 'monthly');
      const yearlyPlans = planService.getPlans('pt-BR', 'yearly');

      const monthlyPlan = monthlyPlans[0];
      const yearlyPlan = yearlyPlans[0];

      const expectedSavings = (monthlyPlan.price * 12) - yearlyPlan.price;
      expect(yearlyPlan.savings).toBe(expectedSavings);
    });

    it('should translate plan names and descriptions', () => {
      const ptBRPlans = planService.getPlans('pt-BR', 'monthly');
      const enUSPlans = planService.getPlans('en-US', 'monthly');

      expect(ptBRPlans[0].name).not.toBe(enUSPlans[0].name);
    });
  });

  describe('formatPrice()', () => {
    it('should format BRL correctly', () => {
      const formatted = planService.formatPrice(29900, 'BRL', 'pt-BR');
      expect(formatted).toBe('R$ 299,00');
    });

    it('should format USD correctly', () => {
      const formatted = planService.formatPrice(29900, 'USD', 'en-US');
      expect(formatted).toBe('$299.00');
    });

    it('should handle zero', () => {
      const formatted = planService.formatPrice(0, 'BRL', 'pt-BR');
      expect(formatted).toBe('R$ 0,00');
    });

    it('should handle large amounts', () => {
      const formatted = planService.formatPrice(99999999, 'BRL', 'pt-BR');
      expect(formatted).toMatch(/^R\$\s\d{1,3}(.\d{3})*,\d{2}$/);
    });
  });

  describe('getDiscountPercentage()', () => {
    it('should calculate discount correctly', () => {
      const monthlyPrice = 29900; // R$ 299/mês
      const yearlyPrice = 298800; // R$ 2.988/ano (17% desc)

      const discount = planService.getDiscountPercentage(monthlyPrice, yearlyPrice);
      expect(discount).toBeGreaterThanOrEqual(16); // ~17%
      expect(discount).toBeLessThanOrEqual(18);
    });
  });
});
```

---

### 1.3 Schema Validation Tests

```typescript
// src/__tests__/config/schema.test.ts
import { describe, it, expect } from 'vitest';
import { ConfigSchema } from '@/lib/config/config.schema';
import yaml from 'js-yaml';
import fs from 'fs';

describe('Config Schema Validation', () => {
  it('should validate base config', () => {
    const baseConfig = yaml.load(
      fs.readFileSync('config/config.base.yaml', 'utf8')
    );

    const result = ConfigSchema.safeParse(baseConfig);

    if (!result.success) {
      console.error('Validation errors:', result.error.format());
    }

    expect(result.success).toBe(true);
  });

  describe('Phone validation', () => {
    it('should accept E.164 format', () => {
      const config = {
        business: {
          phone: {
            main: '+5533332120071',
            whatsapp: '+5533999096030',
          },
        },
      };

      const result = ConfigSchema.partial().safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        '33 3321-2071',         // Sem código país
        '+55 33 3321-2071',     // Com espaços
        '5533332120071',        // Sem +
        '+55-33-3321-2071',     // Com hífens
      ];

      invalidPhones.forEach((phone) => {
        const config = {
          business: { phone: { main: phone } },
        };

        const result = ConfigSchema.partial().safeParse(config);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Email validation', () => {
    it('should accept valid emails', () => {
      const validEmails = [
        'contato@saraivavision.com.br',
        'philipe_cruz@outlook.com',
        'test+tag@example.com',
      ];

      validEmails.forEach((email) => {
        const config = {
          business: { email: { contact: email } },
        };

        const result = ConfigSchema.partial().safeParse(config);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'not-an-email',
        '@no-local-part.com',
        'no-domain@',
        'spaces in@email.com',
      ];

      invalidEmails.forEach((email) => {
        const config = {
          business: { email: { contact: email } },
        };

        const result = ConfigSchema.partial().safeParse(config);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Geo coordinates validation', () => {
    it('should accept valid coordinates', () => {
      const config = {
        business: {
          address: {
            geo: { lat: -19.7892, lng: -42.1375 },
          },
        },
      };

      const result = ConfigSchema.partial().safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject invalid latitudes', () => {
      const invalidLats = [-91, 91, 200, -100];

      invalidLats.forEach((lat) => {
        const config = {
          business: {
            address: {
              geo: { lat, lng: -42.1375 },
            },
          },
        };

        const result = ConfigSchema.partial().safeParse(config);
        expect(result.success).toBe(false);
      });
    });

    it('should reject invalid longitudes', () => {
      const invalidLngs = [-181, 181, 200, -200];

      invalidLngs.forEach((lng) => {
        const config = {
          business: {
            address: {
              geo: { lat: -19.7892, lng },
            },
          },
        };

        const result = ConfigSchema.partial().safeParse(config);
        expect(result.success).toBe(false);
      });
    });
  });
});
```

---

## 2. Testes de Integração

### 2.1 Config + React Hooks

```typescript
// src/__tests__/integration/config-hooks.test.tsx
import { describe, it, expect, beforeAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useConfig } from '@/hooks/config/useConfig';
import { useTranslation } from '@/hooks/config/useTranslation';
import { useFeatureFlag } from '@/hooks/config/useFeatureFlag';
import { ConfigService } from '@/lib/config/ConfigService';

describe('Config Hooks Integration', () => {
  beforeAll(async () => {
    const config = ConfigService.getInstance();
    await config.load();
  });

  describe('useConfig', () => {
    it('should return config value', () => {
      const { result } = renderHook(() => useConfig('site.name'));

      expect(result.current).toBeTruthy();
      expect(typeof result.current).toBe('string');
    });

    it('should use default value for missing key', () => {
      const { result } = renderHook(() =>
        useConfig('missing.key', 'DEFAULT')
      );

      expect(result.current).toBe('DEFAULT');
    });

    it('should update when config changes', async () => {
      const { result, rerender } = renderHook(() =>
        useConfig('site.name')
      );

      const initialValue = result.current;

      // Simular config update
      window.dispatchEvent(new CustomEvent('config-update'));

      await waitFor(() => {
        rerender();
        // Valor deve ser o mesmo (sem mudança real), mas hook deve re-render
        expect(result.current).toBe(initialValue);
      });
    });
  });

  describe('useTranslation', () => {
    it('should translate keys', () => {
      const { result } = renderHook(() => useTranslation('pt-BR'));

      expect(result.current.t('nav.home')).toBeTruthy();
    });

    it('should use fallback for missing keys', () => {
      const { result } = renderHook(() => useTranslation('pt-BR'));

      const text = result.current.t('missing.key', 'Fallback');
      expect(text).toBe('Fallback');
    });
  });

  describe('useFeatureFlag', () => {
    it('should return boolean', () => {
      const { result } = renderHook(() =>
        useFeatureFlag('podcastPage')
      );

      expect(typeof result.current).toBe('boolean');
    });

    it('should return false for missing flag', () => {
      const { result } = renderHook(() =>
        useFeatureFlag('nonExistentFlag')
      );

      expect(result.current).toBe(false);
    });
  });
});
```

---

### 2.2 Config + Components

```typescript
// src/__tests__/integration/Navbar.integration.test.tsx
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/Navbar';
import { ConfigService } from '@/lib/config/ConfigService';
import { BrowserRouter } from 'react-router-dom';

describe('Navbar Integration', () => {
  beforeAll(async () => {
    const config = ConfigService.getInstance();
    await config.load();
  });

  it('should render menu items from config', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Verificar se links do menu estão renderizados
    const config = ConfigService.getInstance();
    const menuItems = config.getMenu('pt-BR', 'header');

    menuItems.forEach((item) => {
      const link = screen.getByText(item.label);
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', item.href);
    });
  });

  it('should highlight CTA items', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const config = ConfigService.getInstance();
    const menuItems = config.getMenu('pt-BR', 'header');
    const highlightedItem = menuItems.find((item) => item.highlight);

    if (highlightedItem) {
      const element = screen.getByText(highlightedItem.label);
      expect(element.closest('a')).toHaveClass(/primary|highlight/);
    }
  });
});
```

---

## 3. Testes End-to-End (Playwright/Cypress)

### 3.1 E2E Test Example

```typescript
// e2e/config-system.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('Config System E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
  });

  test('should load config and render site name', async ({ page }) => {
    // Verificar se config foi carregado (via console log)
    const logs: string[] = [];
    page.on('console', (msg) => logs.push(msg.text()));

    await page.reload();

    // Deve ter log de config loaded
    const configLog = logs.find((log) => log.includes('[Config] ✅ Loaded'));
    expect(configLog).toBeTruthy();
  });

  test('should render menu items from config', async ({ page }) => {
    // Verificar se menu header está renderizado
    const menuItems = await page.locator('nav a').all();
    expect(menuItems.length).toBeGreaterThan(0);

    // Primeiro item deve ser "Início"
    const firstItem = await menuItems[0].textContent();
    expect(firstItem).toContain('Início');
  });

  test('should respect feature flags', async ({ page }) => {
    // Se chatbot está disabled, não deve aparecer
    const chatbot = await page.locator('[data-testid="chatbot-widget"]');
    await expect(chatbot).toHaveCount(0);
  });

  test('should use theme colors from config', async ({ page }) => {
    // Verificar se CSS vars foram injetadas
    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary-500');
    });

    expect(primaryColor).toBeTruthy();
    expect(primaryColor.trim()).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
```

---

## 4. Performance Tests

### 4.1 Config Load Time

```typescript
// src/__tests__/performance/config-load.test.ts
import { describe, it, expect } from 'vitest';
import { ConfigService } from '@/lib/config/ConfigService';

describe('Config Load Performance', () => {
  it('should load config in < 100ms', async () => {
    const config = ConfigService.getInstance();

    const start = performance.now();
    await config.load();
    const end = performance.now();

    const loadTime = end - start;

    console.log(`Config load time: ${loadTime.toFixed(2)}ms`);
    expect(loadTime).toBeLessThan(100);
  });

  it('should have small memory footprint', async () => {
    const config = ConfigService.getInstance();
    await config.load();

    // Estimar tamanho do config em memória
    const configStr = JSON.stringify(config);
    const sizeKB = new Blob([configStr]).size / 1024;

    console.log(`Config size in memory: ${sizeKB.toFixed(2)}KB`);
    expect(sizeKB).toBeLessThan(100); // < 100KB
  });
});
```

---

## 5. Cobertura de Testes

### 5.1 Configuração Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: [
        'src/lib/config/**/*.ts',
        'src/hooks/config/**/*.ts',
        'src/utils/deepMerge.ts',
      ],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
      ],

      // Coverage thresholds
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },
});
```

**Rodar com coverage**:
```bash
npm run test:coverage

# Output:
# File                     | % Stmts | % Branch | % Funcs | % Lines |
# -------------------------|---------|----------|---------|---------|
# config/ConfigService.ts  |   92.5  |   85.7   |   91.2  |   93.1  |
# config/PlanService.ts    |   88.3  |   82.1   |   87.5  |   89.2  |
# hooks/useConfig.ts       |   95.0  |   90.0   |   94.0  |   95.5  |
# -------------------------|---------|----------|---------|---------|
# All files                |   91.2  |   85.9   |   90.2  |   91.8  |
```

---

## 6. CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci

      - name: Validate Config
        run: npm run validate:config

      - name: Run Unit Tests
        run: npm run test:run

      - name: Run Integration Tests
        run: npm run test:integration

      - name: Check Coverage
        run: npm run test:coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: config-system

      - name: Build Test
        run: npm run build:vite
```

---

## Checklist de Qualidade

- [ ] Testes unitários para ConfigService (17+ tests)
- [ ] Testes unitários para PlanService (8+ tests)
- [ ] Testes de validação de schema (15+ tests)
- [ ] Testes de integração com hooks React (6+ tests)
- [ ] Testes de integração com componentes (4+ tests)
- [ ] Testes E2E com Playwright (4+ tests)
- [ ] Testes de performance (<100ms load)
- [ ] Coverage >85% no config system
- [ ] CI/CD pipeline configurado
- [ ] Pre-commit hooks validando config

**Próximos Passos**: Ver riscos e mitigações em [07-riscos-mitigacoes.md](./07-riscos-mitigacoes.md)
