# E. Plano de Migração Detalhado

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-18

---

## Visão Geral

**Estratégia**: Rollout gradual com feature flags + rollback garantido
**Duração Total**: 7 semanas (1 dev full-time)
**Critério de Sucesso**: 0 downtime + melhoria na DX

---

## Fase 1: Setup Inicial (Semana 1)

### 1.1 Instalação de Dependências

```bash
cd /home/saraiva-vision-site

# Instalar dependências novas
npm install --save zod js-yaml
npm install --save-dev @rollup/plugin-yaml @types/js-yaml

# Verificar instalação
npm list zod js-yaml @rollup/plugin-yaml
```

**Checklist**:
- [ ] `zod@^3.22.4` instalado
- [ ] `js-yaml@^4.1.0` instalado
- [ ] `@rollup/plugin-yaml@^4.0.1` instalado
- [ ] TypeScript types instalados
- [ ] package.json atualizado

---

### 1.2 Estrutura de Diretórios

```bash
# Criar estrutura de pastas
mkdir -p config
mkdir -p src/lib/config
mkdir -p src/hooks/config
mkdir -p src/__tests__/config

# Verificar criação
tree config src/lib/config src/hooks/config
```

**Estrutura Final**:
```
/home/saraiva-vision-site/
├── config/
│   ├── config.base.yaml
│   ├── config.development.yaml
│   ├── config.staging.yaml
│   └── config.production.yaml
├── src/
│   ├── lib/
│   │   └── config/
│   │       ├── ConfigService.ts
│   │       ├── PlanService.ts
│   │       ├── config.schema.ts
│   │       └── buildCssVars.ts
│   └── hooks/
│       └── config/
│           ├── useConfig.ts
│           ├── useTranslation.ts
│           └── useFeatureFlag.ts
└── src/__tests__/
    └── config/
        ├── ConfigService.test.ts
        ├── PlanService.test.ts
        └── schema.test.ts
```

**Checklist**:
- [ ] Pastas criadas
- [ ] Estrutura validada com `tree`
- [ ] Permissões corretas (755 para dirs)

---

### 1.3 Configuração do Vite

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import yaml from '@rollup/plugin-yaml';  // ← NOVO

export default defineConfig({
  plugins: [
    react(),
    yaml(),  // ← Adicionar suporte a YAML
  ],

  // ... resto da config existente
});
```

**Test**:
```bash
# Build de teste
npm run build:vite

# Deve compilar sem erros
# Output esperado: "✓ built in Xs"
```

**Checklist**:
- [ ] `@rollup/plugin-yaml` importado
- [ ] Plugin adicionado ao array
- [ ] Build test passou
- [ ] Hot reload funciona em dev

---

### 1.4 Criar config.base.yaml

```bash
# Copiar template completo
cat > config/config.base.yaml <<'EOF'
# Ver conteúdo completo em 02-schema-configuracao.md
version: "1.0.0"
environment: production

site:
  name: "Saraiva Vision"
  domain: "saraivavision.com.br"
  baseUrl: "https://saraivavision.com.br"

business:
  name: "Clínica Saraiva Vision"
  # ... NAP completo
# ... resto das seções
EOF
```

**Validação**:
```bash
# Verificar YAML válido
npx js-yaml config/config.base.yaml

# Deve retornar JSON sem erros
```

**Checklist**:
- [ ] `config.base.yaml` criado (300+ linhas)
- [ ] YAML syntax válida
- [ ] Todas as 10 seções presentes
- [ ] Env vars marcadas com `${}`

---

**Entregáveis da Fase 1**:
- ✅ Dependências instaladas
- ✅ Estrutura de pastas criada
- ✅ Vite configurado com YAML
- ✅ config.base.yaml completo

**Tempo Estimado**: 2 dias
**Risco**: 🟢 Baixo

---

## Fase 2: Schema e Validação (Semana 1-2)

### 2.1 Criar Zod Schema

```typescript
// src/lib/config/config.schema.ts
import { z } from 'zod';

// Schemas auxiliares
const PhoneSchema = z.string().regex(
  /^\+\d{12,15}$/,
  "Phone must be in E.164 format (+5533999096030)"
);

const EmailSchema = z.string().email();

const GeoCoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const LocalizedStringSchema = z.record(
  z.enum(['pt-BR', 'en-US']),
  z.string()
);

// Schema principal
export const ConfigSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  environment: z.enum(['development', 'staging', 'production']),

  site: z.object({
    name: z.string().min(1),
    domain: z.string().min(1),
    baseUrl: z.string().url(),
    social: z.object({
      facebook: z.string().url().optional(),
      instagram: z.string().url().optional(),
      youtube: z.string().url().optional(),
      linkedin: z.string().url().optional(),
      whatsapp: PhoneSchema,
    }),
  }),

  business: z.object({
    name: z.string().min(1),
    legalName: z.string().min(1),

    address: z.object({
      street: z.string().min(1),
      number: z.string().min(1),
      city: z.string().min(1),
      state: z.string().length(2),
      zipCode: z.string().regex(/^\d{5}-?\d{3}$/),
      geo: GeoCoordinatesSchema,
    }),

    phone: z.object({
      main: PhoneSchema,
      whatsapp: PhoneSchema,
    }),

    email: z.object({
      contact: EmailSchema,
      doctor: EmailSchema,
      support: EmailSchema.optional(),
    }),
  }),

  i18n: z.object({
    defaultLocale: z.string(),
    supportedLocales: z.array(z.string()),
    translations: z.record(z.string(), z.record(z.string(), z.string())),
  }),

  theme: z.object({
    tokens: z.object({
      colors: z.record(z.string(), z.any()),
      typography: z.object({
        fontFamily: z.record(z.string(), z.array(z.string())),
        fontSize: z.record(z.string(), z.string()),
      }),
      spacing: z.record(z.string(), z.string()),
    }),
  }),

  // ... resto dos schemas (ver anexo completo)
});

export type Config = z.infer<typeof ConfigSchema>;
```

**Test Suite**:
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

  it('should reject invalid phone format', () => {
    const invalidConfig = {
      business: {
        phone: {
          main: '33 3321-2071',  // ❌ Sem código país
        },
      },
    };

    const result = ConfigSchema.partial().safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const invalidConfig = {
      business: {
        email: {
          contact: 'not-an-email',  // ❌ Email inválido
        },
      },
    };

    const result = ConfigSchema.partial().safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });
});
```

**Run Tests**:
```bash
npm run test src/__tests__/config/schema.test.ts

# Deve passar 3/3 testes
```

**Checklist**:
- [ ] `config.schema.ts` criado (200+ linhas)
- [ ] Schema cobre todas as seções
- [ ] Tests criados e passando
- [ ] Type exports funcionando

---

### 2.2 CLI Validator Script

```javascript
#!/usr/bin/env node
// scripts/config-validate.js

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const { ConfigSchema } = require('../src/lib/config/config.schema');

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
    console.log(`⚠️  ${file} - SKIPPED (file not found)`);
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
      console.log(`❌ ${file} - INVALID`);
      console.log('\n   Errors:');

      const formatted = result.error.format();
      Object.entries(formatted).forEach(([key, value]) => {
        if (key !== '_errors') {
          console.log(`   - ${key}: ${JSON.stringify(value)}`);
        }
      });

      console.log('');
      hasErrors = true;
    }
  } catch (error) {
    console.log(`❌ ${file} - PARSE ERROR`);
    console.log(`   ${error.message}\n`);
    hasErrors = true;
  }
});

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
node scripts/config-validate.js

# Adicionar ao package.json
npm pkg set scripts.validate:config="node scripts/config-validate.js"

# Usar via npm
npm run validate:config
```

**Checklist**:
- [ ] Script criado e executável
- [ ] Valida todos os arquivos YAML
- [ ] npm script adicionado
- [ ] Integrado no CI (opcional)

---

**Entregáveis da Fase 2**:
- ✅ Zod schema completo
- ✅ Tests de validação
- ✅ CLI validator script

**Tempo Estimado**: 3 dias
**Risco**: 🟡 Médio (schema pode precisar ajustes)

---

## Fase 3: ConfigService Core (Semana 2)

### 3.1 Implementar ConfigService

```typescript
// src/lib/config/ConfigService.ts
import yaml from 'js-yaml';
import { ConfigSchema, type Config } from './config.schema';
import { deepMerge } from '@/utils/deepMerge';

class ConfigService {
  private static instance: ConfigService | null = null;
  private config: Config | null = null;
  private contentHash: string = '';

  private constructor() {
    // Singleton privado
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  public async load(): Promise<void> {
    try {
      // Carregar base config
      const baseResponse = await fetch('/config/config.base.yaml');
      const baseText = await baseResponse.text();
      const baseConfig = yaml.load(baseText) as any;

      // Carregar env override (se existir)
      const env = import.meta.env.MODE; // 'development', 'production'
      let envConfig = {};

      try {
        const envResponse = await fetch(`/config/config.${env}.yaml`);
        if (envResponse.ok) {
          const envText = await envResponse.text();
          envConfig = yaml.load(envText) as any;
        }
      } catch {
        // Env override opcional
      }

      // Deep merge
      const mergedConfig = deepMerge(baseConfig, envConfig);

      // Validar com Zod
      const result = ConfigSchema.safeParse(mergedConfig);

      if (!result.success) {
        console.error('Config validation failed:', result.error.format());
        throw new Error('Invalid configuration');
      }

      this.config = result.data;
      this.contentHash = this.calculateHash(JSON.stringify(this.config));

      console.log(`✅ Config loaded (v${this.config.version}, hash: ${this.contentHash.substring(0, 8)})`);

      // Hot reload em dev
      if (import.meta.hot) {
        import.meta.hot.accept(() => {
          console.log('🔥 Config hot reload...');
          this.load();
        });
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      throw error;
    }
  }

  public get<T = any>(path: string, defaultValue?: T): T {
    if (!this.config) {
      throw new Error('Config not loaded. Call load() first.');
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
      return (hash % 100) < flag.rolloutPercentage;
    }

    return true;
  }

  public getContentHash(): string {
    return this.contentHash;
  }

  private calculateHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
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
    // Get or create persistent user ID
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

**Test Suite**:
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

  it('should be singleton', () => {
    const instance1 = ConfigService.getInstance();
    const instance2 = ConfigService.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should get nested values', () => {
    const siteName = config.get('site.name');
    expect(siteName).toBe('Saraiva Vision');

    const phone = config.get('business.phone.main');
    expect(phone).toMatch(/^\+\d{12,15}$/);
  });

  it('should return default for missing keys', () => {
    const missing = config.get('nonexistent.key', 'DEFAULT');
    expect(missing).toBe('DEFAULT');
  });

  it('should translate keys', () => {
    const text = config.t('pt-BR', 'nav.home');
    expect(text).toBe('Início');

    const fallback = config.t('pt-BR', 'missing.key', 'Fallback');
    expect(fallback).toBe('Fallback');
  });

  it('should get menus', () => {
    const headerMenu = config.getMenu('pt-BR', 'header');
    expect(Array.isArray(headerMenu)).toBe(true);
    expect(headerMenu.length).toBeGreaterThan(0);
    expect(headerMenu[0]).toHaveProperty('label');
    expect(headerMenu[0]).toHaveProperty('href');
  });

  it('should check feature flags', () => {
    const enabled = config.isFeatureEnabled('podcastPage');
    expect(typeof enabled).toBe('boolean');
  });

  it('should have content hash', () => {
    const hash = config.getContentHash();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });
});
```

**Checklist**:
- [ ] ConfigService implementado (150+ linhas)
- [ ] Singleton pattern
- [ ] Deep merge de env overrides
- [ ] Validação Zod integrada
- [ ] Hot reload em dev
- [ ] Tests passando (7/7)

---

**Entregáveis da Fase 3**:
- ✅ ConfigService completo
- ✅ Deep merge strategy
- ✅ Feature flags com rollout
- ✅ Tests unitários

**Tempo Estimado**: 4 dias
**Risco**: 🟡 Médio

---

## Fase 4: React Hooks (Semana 3)

### 4.1 Hook useConfig

```typescript
// src/hooks/config/useConfig.ts
import { useSyncExternalStore } from 'react';
import { ConfigService } from '@/lib/config/ConfigService';

const config = ConfigService.getInstance();

// Store subscribers
const subscribers = new Set<() => void>();

function subscribe(callback: () => void) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notifySubscribers() {
  subscribers.forEach(callback => callback());
}

// Hot reload listener
if (import.meta.hot) {
  import.meta.hot.on('config-update', () => {
    notifySubscribers();
  });
}

export function useConfig<T = any>(path: string, defaultValue?: T): T {
  const value = useSyncExternalStore(
    subscribe,
    () => config.get<T>(path, defaultValue),
    () => config.get<T>(path, defaultValue)
  );

  return value;
}
```

### 4.2 Hook useTranslation

```typescript
// src/hooks/config/useTranslation.ts
import { useCallback } from 'react';
import { useConfig } from './useConfig';

export function useTranslation(locale?: string) {
  const defaultLocale = useConfig('i18n.defaultLocale', 'pt-BR');
  const activeLocale = locale || defaultLocale;

  const t = useCallback(
    (key: string, fallback?: string) => {
      const config = ConfigService.getInstance();
      return config.t(activeLocale, key, fallback);
    },
    [activeLocale]
  );

  return { t, locale: activeLocale };
}
```

### 4.3 Hook useFeatureFlag

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

**Checklist**:
- [ ] `useConfig` implementado
- [ ] `useTranslation` implementado
- [ ] `useFeatureFlag` implementado
- [ ] Hot reload funcionando
- [ ] Tipos TypeScript corretos

---

**Entregáveis da Fase 4**:
- ✅ 3 hooks React customizados
- ✅ Hot reload integrado
- ✅ Type-safe APIs

**Tempo Estimado**: 2 dias
**Risco**: 🟢 Baixo

---

## Fase 5: Migração Gradual de Componentes (Semana 3-5)

### Estratégia de Rollout

```
Semana 3: Componentes de layout (5-10 arquivos)
  ↓
Semana 4: Páginas principais (10-15 arquivos)
  ↓
Semana 5: Features específicas (15-20 arquivos)
```

### 5.1 Migração de Navbar (Exemplo)

**ANTES**:
```jsx
// src/components/Navbar.jsx (versão antiga)
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
    <nav>
      {navLinks.map(link => (
        <a key={link.href} href={link.href}>
          <link.icon /> {link.name}
        </a>
      ))}
    </nav>
  );
}
```

**DEPOIS**:
```jsx
// src/components/Navbar.jsx (versão nova)
import { useTranslation } from '@/hooks/config/useTranslation';
import { useConfig } from '@/hooks/config/useConfig';
import * as Icons from 'lucide-react';

export function Navbar() {
  const { locale } = useTranslation();
  const menuItems = useConfig(`menus.header.${locale}`, []);

  return (
    <nav>
      {menuItems.map(item => {
        const Icon = Icons[item.icon]; // Dynamic icon lookup

        return (
          <a
            key={item.href}
            href={item.href}
            className={item.highlight ? 'btn-primary' : ''}
          >
            {Icon && <Icon />}
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
```

**Benefícios**:
- ✅ Menu totalmente configurável via YAML
- ✅ Sem hard-coding de links
- ✅ Ordem, ícones, e highlight dinâmicos
- ✅ Hot reload funciona

**Checklist por Componente**:
- [ ] Remover `react-i18next` imports
- [ ] Usar `useConfig()` para dados estruturados
- [ ] Usar `useTranslation()` para textos
- [ ] Testar hot reload
- [ ] Validar visual não mudou

---

### 5.2 Lista de Componentes a Migrar

**Alta Prioridade** (Semana 3):
1. ✅ Navbar (navegação)
2. ✅ Footer (links + info)
3. ✅ SEOHead (metadados)
4. ✅ Hero (CTA)
5. ✅ ContactForm (labels)

**Média Prioridade** (Semana 4):
6. ServicesGrid (lista de serviços)
7. PricingSection (planos)
8. TestimonialsCarousel (depoimentos)
9. BlogList (listagem)
10. AboutPage (sobre)

**Baixa Prioridade** (Semana 5):
11. PodcastPage (podcast)
12. FAQSection (perguntas)
13. TeamSection (equipe)
14. LocationMap (mapa)
15. CookieBanner (LGPD)

---

### 5.3 Processo por Componente

```bash
# 1. Criar branch de feature
git checkout -b config/migrate-navbar

# 2. Modificar componente
# ... editar src/components/Navbar.jsx

# 3. Testar localmente
npm run dev:vite
# Verificar: http://localhost:3002

# 4. Rodar testes
npm run test Navbar.test.jsx

# 5. Build de validação
npm run build:vite

# 6. Commit
git add src/components/Navbar.jsx
git commit -m "config: migrar Navbar para usar ConfigService"

# 7. Merge para main
git checkout main
git merge config/migrate-navbar
git branch -d config/migrate-navbar

# 8. Deploy incremental
sudo npm run deploy:quick
```

---

**Entregáveis da Fase 5**:
- ✅ 15-20 componentes migrados
- ✅ Tests de regressão passando
- ✅ Visual inalterado
- ✅ Performance igual ou melhor

**Tempo Estimado**: 15 dias (1 componente/dia)
**Risco**: 🟡 Médio (risco de quebrar UI)

---

## Fase 6: Integração com Build (Semana 6)

### 6.1 Tailwind Dinâmico

```javascript
// tailwind.config.js (versão migrada)
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// Carregar config YAML
const configPath = path.join(__dirname, 'config/config.base.yaml');
const configContent = fs.readFileSync(configPath, 'utf8');
const config = yaml.load(configContent);

const tokens = config.theme.tokens;

module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],

  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.typography.fontFamily,
      fontSize: tokens.typography.fontSize,
      fontWeight: tokens.typography.fontWeight,
      lineHeight: tokens.typography.lineHeight,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.shadows,
    },
  },

  // ... resto da config
};
```

**Test**:
```bash
# Rebuild com novo config
npm run build:vite

# Verificar classes geradas
grep -r "bg-primary-500" dist/assets/*.css

# Deve encontrar a cor correta
```

**Checklist**:
- [ ] Tailwind lê do YAML
- [ ] Build passa
- [ ] Classes corretas geradas
- [ ] Hot reload funciona

---

### 6.2 CSS Custom Properties

```typescript
// src/lib/config/buildCssVars.ts
import { ConfigService } from './ConfigService';

export function buildCssVars(): string {
  const config = ConfigService.getInstance();
  const tokens = config.get('theme.tokens');

  let css = ':root {\n';

  // Colors
  Object.entries(tokens.colors).forEach(([name, value]) => {
    if (typeof value === 'object') {
      Object.entries(value).forEach(([shade, hex]) => {
        css += `  --color-${name}-${shade}: ${hex};\n`;
      });
    } else {
      css += `  --color-${name}: ${value};\n`;
    }
  });

  // Typography
  Object.entries(tokens.typography.fontFamily).forEach(([name, fonts]) => {
    css += `  --font-${name}: ${fonts.join(', ')};\n`;
  });

  // Spacing
  Object.entries(tokens.spacing).forEach(([name, value]) => {
    css += `  --spacing-${name}: ${value};\n`;
  });

  css += '}\n';
  return css;
}

export function injectCssVars() {
  const css = buildCssVars();
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}
```

**Uso no main.jsx**:
```tsx
// src/main.jsx
import { ConfigService } from '@/lib/config/ConfigService';
import { injectCssVars } from '@/lib/config/buildCssVars';

const config = ConfigService.getInstance();

async function bootstrap() {
  await config.load();
  injectCssVars(); // ← Injetar CSS vars

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
  );
}

bootstrap();
```

**Checklist**:
- [ ] `buildCssVars()` implementado
- [ ] CSS vars injetadas no :root
- [ ] Tailwind pode usar vars
- [ ] Componentes legados funcionam

---

**Entregáveis da Fase 6**:
- ✅ Tailwind lê tokens do YAML
- ✅ CSS vars geradas dinamicamente
- ✅ Build otimizado

**Tempo Estimado**: 3 dias
**Risco**: 🟢 Baixo

---

## Fase 7: Cleanup e Documentação (Semana 7)

### 7.1 Remover Código Legado

```bash
# Arquivos a DELETAR após migração completa
rm src/lib/clinicInfo.js             # ✅ Substituído por config.yaml
rm src/lib/napCanonical.js           # ✅ Duplicação eliminada

# Diretório i18n antigo
rm -rf public/locales/               # ✅ Agora em config.yaml

# react-i18next (opcional se não usado em nada mais)
npm uninstall react-i18next i18next
```

**Checklist**:
- [ ] clinicInfo.js deletado
- [ ] napCanonical.js deletado
- [ ] /public/locales/ deletado
- [ ] react-i18next desinstalado (se aplicável)
- [ ] Build ainda passa
- [ ] Testes passam

---

### 7.2 Atualizar Documentação

```bash
# Atualizar README.md
cat >> README.md <<'EOF'

## Configuração Centralizada

Este projeto usa um sistema de configuração centralizada baseado em YAML.

### Arquivos
- `config/config.base.yaml` - Configuração base
- `config/config.development.yaml` - Overrides de dev
- `config/config.production.yaml` - Overrides de produção

### Uso
```typescript
import { useConfig } from '@/hooks/config/useConfig';

function MyComponent() {
  const siteName = useConfig('site.name');
  return <h1>{siteName}</h1>;
}
```

Ver documentação completa em `claudedocs/config-centralization/`
EOF
```

**Documentos a Criar**:
1. ✅ `docs/configuration/OVERVIEW.md` - Visão geral
2. ✅ `docs/configuration/HOOKS.md` - Guia de hooks
3. ✅ `docs/configuration/MIGRATION.md` - Guia de migração
4. ✅ `docs/configuration/TROUBLESHOOTING.md` - Troubleshooting

**Checklist**:
- [ ] README.md atualizado
- [ ] Docs criados em /docs/configuration/
- [ ] Comentários inline no código
- [ ] CHANGELOG.md atualizado

---

### 7.3 Validação Final

```bash
# 1. Build completo
npm run build:vite

# 2. Testes completos
npm run test:comprehensive

# 3. Validar config
npm run validate:config

# 4. Deploy de teste
sudo npm run deploy:quick

# 5. Smoke tests em produção
curl -I https://saraivavision.com.br
# Verificar header X-Config-Hash presente
```

**Critérios de Aceitação**:
- ✅ 0 erros de build
- ✅ 100% dos testes passam
- ✅ Config válida em todos os ambientes
- ✅ Deploy sem downtime
- ✅ Visual idêntico ao estado anterior
- ✅ Performance igual ou melhor
- ✅ Hot reload funciona em dev

---

**Entregáveis da Fase 7**:
- ✅ Código legado removido
- ✅ Documentação completa
- ✅ Validação final passando

**Tempo Estimado**: 3 dias
**Risco**: 🟢 Baixo

---

## Estratégia de Rollback

### Rollback Rápido (< 5 minutos)

```bash
# 1. Reverter para release anterior
cd /var/www/saraivavision
sudo rm -f current
sudo ln -s releases/PREVIOUS_RELEASE current

# 2. Recarregar Nginx
sudo systemctl reload nginx

# 3. Verificar
curl -I https://saraivavision.com.br
```

### Rollback de Código (< 30 minutos)

```bash
# 1. Reverter commits
git log --oneline -10  # Identificar hash
git revert COMMIT_HASH

# 2. Rebuild
npm run build:vite

# 3. Deploy
sudo npm run deploy:quick
```

### Rollback de Dependências (< 1 hora)

```bash
# 1. Restaurar package.json anterior
git checkout HEAD~5 -- package.json package-lock.json

# 2. Reinstalar
npm ci

# 3. Rebuild e deploy
npm run build:vite
sudo npm run deploy:quick
```

---

## Métricas de Sucesso

| Métrica | Baseline | Meta | Medição |
|---------|----------|------|---------|
| **Build Time** | 45s | <50s | `npm run build:vite` |
| **Bundle Size** | 450KB | <500KB | `dist/assets/index-*.js` |
| **Config Load Time** | N/A | <100ms | `performance.mark()` |
| **Hot Reload Time** | 1.2s | <1.5s | Dev server response |
| **Test Coverage** | 65% | >85% | `npm run test:coverage` |
| **Duplicação NAP** | 2 fontes | 1 fonte | Auditoria manual |
| **Tempo Onboarding** | ~2h | <30min | Feedback dev novo |

---

## Próximos Passos

→ Ver [08-exemplos-codigo.md](./08-exemplos-codigo.md) para código completo
→ Ver [09-checklist-operacional.md](./09-checklist-operacional.md) para manutenção
