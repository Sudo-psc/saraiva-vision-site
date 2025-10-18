# G. Análise de Riscos e Estratégias de Mitigação

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-18

---

## Matriz de Riscos

| ID | Risco | Probabilidade | Impacto | Severidade | Mitigação |
|----|-------|---------------|---------|------------|-----------|
| R1 | Schema validation falha em produção | Baixa | Crítico | 🔴 Alta | Validação no build |
| R2 | Config YAML corrompido | Baixa | Crítico | 🔴 Alta | Backups automáticos |
| R3 | Breaking change sem migração | Média | Alto | 🟡 Média | Versionamento semântico |
| R4 | Performance degradation | Baixa | Médio | 🟢 Baixa | Monitoring + caching |
| R5 | Hot reload quebra estado | Média | Médio | 🟡 Média | State persistence |
| R6 | Dependência circular | Baixa | Alto | 🟡 Média | Lazy loading |
| R7 | Env vars não interpoladas | Média | Médio | 🟡 Média | Validação build-time |
| R8 | Traduções incompletas | Alta | Baixo | 🟢 Baixa | Fallback para pt-BR |
| R9 | Feature flag inconsistente | Baixa | Médio | 🟢 Baixa | Rollout percentual |
| R10 | Build time aumenta >50% | Baixa | Baixo | 🟢 Baixa | Lazy schema validation |

---

## R1: Schema Validation Falha em Produção

### Descrição do Risco
Config YAML passa validação em dev/staging mas falha em produção devido a dados específicos do ambiente.

### Cenário de Falha
```yaml
# config.production.yaml
business:
  phone:
    main: "${VITE_PHONE_MAIN}"  # ← Env var não definida

# Resultado em produção: "${VITE_PHONE_MAIN}" (string literal)
# Validação Zod: ❌ Não passa regex E.164
```

### Impacto
- 🔴 **Crítico**: App não inicializa
- Downtime de 100%
- Usuários veem tela de erro

### Probabilidade
**Baixa** (10%) - Pré-condições:
- Nova env var adicionada
- Não testada em staging
- Deploy direto para produção

### Mitigação Primária: Validação no Build

```bash
#!/bin/bash
# scripts/prebuild.sh

# 1. Interpolar env vars ANTES de validar
export NODE_ENV=production
node scripts/interpolate-env-vars.js

# 2. Validar config final
npm run validate:config || {
  echo "❌ Config validation failed"
  exit 1
}

# 3. Só então fazer build
npm run build:vite
```

```javascript
// scripts/interpolate-env-vars.js
const fs = require('fs');
const yaml = require('js-yaml');

const envFile = process.env.NODE_ENV || 'production';
const configPath = `config/config.${envFile}.yaml`;

if (!fs.existsSync(configPath)) {
  console.log(`No ${envFile} config, skipping`);
  process.exit(0);
}

let content = fs.readFileSync(configPath, 'utf8');

// Interpolar ${VAR} com process.env.VAR
content = content.replace(/\$\{([^}]+)\}/g, (match, varName) => {
  if (!(varName in process.env)) {
    console.error(`❌ Missing env var: ${varName}`);
    process.exit(1);
  }
  return process.env[varName];
});

// Salvar versão interpolada
fs.writeFileSync(
  `config/config.${envFile}.interpolated.yaml`,
  content
);

console.log(`✅ Env vars interpolated for ${envFile}`);
```

### Mitigação Secundária: Fallback Config

```typescript
// src/lib/config/ConfigService.ts
private async _load(): Promise<void> {
  try {
    // ... carregar e validar normalmente
  } catch (error) {
    console.error('[Config] Failed to load, trying fallback...');

    // Fallback: carregar config embeddado
    const fallbackConfig = await import('./config.fallback.json');
    this.config = fallbackConfig.default;

    // Notificar erro mas não quebrar app
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: { component: 'ConfigService', severity: 'critical' },
      });
    }
  }
}
```

### Monitoramento
```typescript
// Alertar se config load falhar
if (!config.config) {
  fetch('/api/alert', {
    method: 'POST',
    body: JSON.stringify({
      type: 'config_load_failure',
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString(),
    }),
  });
}
```

---

## R2: Config YAML Corrompido

### Descrição do Risco
Edição manual do YAML introduz erro de syntax (indentação, caracteres inválidos).

### Cenário de Falha
```yaml
# config.base.yaml (CORROMPIDO)
business:
  name: "Clínica Saraiva Vision
  # ↑ String não fechada
  address:
    street: Rua Barão do Rio Branco
    # ↑ Falta aspas
```

### Impacto
- 🔴 **Crítico**: YAML parse falha
- Build quebra
- Deploy bloqueado

### Probabilidade
**Baixa** (15%) - Pré-condições:
- Edição manual sem validação
- Pre-commit hook não configurado
- CI/CD não valida YAML

### Mitigação Primária: Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh

# Validar YAML syntax
if git diff --cached --name-only | grep -q "^config/.*\.yaml$"; then
  echo "🔍 Validating YAML syntax..."

  for file in $(git diff --cached --name-only | grep "^config/.*\.yaml$"); do
    npx js-yaml "$file" > /dev/null 2>&1 || {
      echo "❌ Invalid YAML syntax in $file"
      exit 1
    }
  done

  # Validar schema também
  npm run validate:config || {
    echo "❌ Config schema validation failed"
    exit 1
  }

  echo "✅ YAML validation passed"
fi
```

### Mitigação Secundária: Editor Validation

**VS Code Settings** (`.vscode/settings.json`):
```json
{
  "yaml.schemas": {
    "./src/lib/config/config.schema.json": "config/*.yaml"
  },
  "yaml.validate": true,
  "yaml.customTags": [],
  "files.associations": {
    "*.yaml": "yaml"
  }
}
```

**Gerar JSON Schema**:
```typescript
// scripts/generate-json-schema.ts
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ConfigSchema } from '../src/lib/config/config.schema';
import fs from 'fs';

const jsonSchema = zodToJsonSchema(ConfigSchema, 'ConfigSchema');

fs.writeFileSync(
  'src/lib/config/config.schema.json',
  JSON.stringify(jsonSchema, null, 2)
);

console.log('✅ JSON Schema generated for VS Code validation');
```

### Mitigação Terciária: Backups Automáticos

```bash
# scripts/backup-config.sh (rodar via cron)
#!/bin/bash

BACKUP_DIR="backups/config"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup com timestamp
tar -czf "$BACKUP_DIR/config-$TIMESTAMP.tar.gz" config/*.yaml

# Manter apenas últimos 30 backups
ls -t "$BACKUP_DIR"/config-*.tar.gz | tail -n +31 | xargs -r rm

echo "✅ Config backed up to $BACKUP_DIR/config-$TIMESTAMP.tar.gz"
```

**Cron Job**:
```bash
# Backup diário às 2h
0 2 * * * /home/saraiva-vision-site/scripts/backup-config.sh
```

---

## R3: Breaking Change Sem Migração

### Descrição do Risco
Mudança na estrutura do config quebra código existente sem plano de migração.

### Cenário de Falha
```yaml
# v1.0.0
business:
  phone: "+5533999096030"  # String simples

# v2.0.0 (BREAKING)
business:
  phone:                   # ← Agora é objeto
    main: "+5533332120071"
    whatsapp: "+5533999096030"

# Código antigo:
const phone = config.get('business.phone');
// v1: "+5533999096030" ✅
// v2: { main: "...", whatsapp: "..." } ❌ Tipo mudou!
```

### Impacto
- 🟡 **Alto**: Componentes quebram
- TypeScript errors
- Runtime errors possíveis

### Probabilidade
**Média** (30%) - Comum em refatorações

### Mitigação Primária: Versionamento Semântico

**Regra**: Breaking changes = MAJOR version bump

```yaml
# config.base.yaml
version: "1.5.2"  # Antes

# Após breaking change
version: "2.0.0"  # MAJOR incrementado
```

**CHANGELOG.md**:
```markdown
## [2.0.0] - 2025-11-01

### BREAKING CHANGES

#### `business.phone` agora é objeto

**Antes (v1.x)**:
```yaml
business:
  phone: "+5533999096030"
```

**Depois (v2.x)**:
```yaml
business:
  phone:
    main: "+5533332120071"
    whatsapp: "+5533999096030"
```

**Migração**:
```typescript
// Antigo
const phone = config.get('business.phone');

// Novo
const phone = config.get('business.phone.main');
const whatsapp = config.get('business.phone.whatsapp');
```

**Deprecation period**: v1.9.0 (2025-10-15) até v2.0.0 (2025-11-01)
```

### Mitigação Secundária: Compatibility Layer

```typescript
// src/lib/config/ConfigService.ts
public get<T = any>(path: string, defaultValue?: T): T {
  // ... implementação normal

  // Compatibility layer para v1.x → v2.x
  if (path === 'business.phone' && typeof value === 'object') {
    console.warn(
      '[Config] DEPRECATED: business.phone agora é objeto. ' +
      'Use business.phone.main ou business.phone.whatsapp'
    );
    return value.main as T; // Fallback para v1 compatibility
  }

  return value as T;
}
```

### Mitigação Terciária: Deprecation Warnings

```typescript
// Adicionar em v1.9.0 (antes do breaking)
export function getBusinessPhone(): string {
  console.warn(
    'getBusinessPhone() is deprecated. ' +
    'Use config.get("business.phone.main") in v2.0.0'
  );

  const phone = config.get('business.phone');
  return typeof phone === 'string' ? phone : phone.main;
}
```

---

## R4: Performance Degradation

### Descrição do Risco
Config load time ou bundle size aumenta significativamente.

### Cenário de Falha
```
v1.0: Config load = 35ms, bundle = 15KB
v2.0: Config load = 250ms, bundle = 80KB

Causa: Validação Zod síncrona pesada
```

### Impacto
- 🟡 **Médio**: UX degradada
- FCP aumenta
- Lighthouse score cai

### Probabilidade
**Baixa** (15%)

### Mitigação Primária: Lazy Validation

```typescript
// src/lib/config/ConfigService.ts
public async load(): Promise<void> {
  // Carregar sem validar
  const mergedConfig = deepMerge(baseConfig, envConfig);

  // Validar apenas em dev/staging
  if (import.meta.env.DEV || import.meta.env.MODE === 'staging') {
    const result = ConfigSchema.safeParse(mergedConfig);
    if (!result.success) {
      console.error('[Config] Validation failed:', result.error);
      throw new Error('Invalid config');
    }
    this.config = result.data;
  } else {
    // Produção: confiar no prebuild validation
    this.config = mergedConfig as Config;
  }
}
```

### Mitigação Secundária: Code Splitting

```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'config-system': [
            './src/lib/config/ConfigService',
            './src/lib/config/config.schema', // ← Schema separado
          ],
        },
      },
    },
  },
});
```

### Monitoramento

```typescript
// Performance marking
performance.mark('config-load-start');
await config.load();
performance.mark('config-load-end');

const measure = performance.measure(
  'config-load',
  'config-load-start',
  'config-load-end'
);

console.log(`[Perf] Config loaded in ${measure.duration.toFixed(2)}ms`);

// Alertar se > 100ms
if (measure.duration > 100) {
  console.warn('[Perf] Config load time exceeded threshold');
}
```

---

## R5: Hot Reload Quebra Estado React

### Descrição do Risco
HMR do config faz componentes React perderem estado.

### Cenário de Falha
```
1. Usuário preenche formulário (estado local)
2. Dev edita config.yaml
3. HMR recarrega config
4. React re-renderiza componente
5. Formulário reseta (estado perdido)
```

### Impacto
- 🟡 **Médio**: DX ruim
- Frustração em dev
- Precisa re-preencher formulários

### Probabilidade
**Média** (40%)

### Mitigação: State Persistence

```typescript
// src/hooks/config/useConfig.ts
export function useConfig<T = any>(path: string, defaultValue?: T): T {
  const value = useSyncExternalStore(
    subscribe,
    () => config.get<T>(path, defaultValue),
    () => config.get<T>(path, defaultValue)
  );

  // Persist state no sessionStorage
  useEffect(() => {
    const key = `config:${path}`;
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [path, value]);

  return value;
}
```

**Restaurar após HMR**:
```typescript
// src/main.tsx
if (import.meta.hot) {
  import.meta.hot.accept('/config/config.base.yaml', async () => {
    // Salvar estado React antes de reload
    const state = {
      formData: document.querySelectorAll('input'),
      scrollPosition: window.scrollY,
    };

    sessionStorage.setItem('hmr-state', JSON.stringify(state));

    // Reload config
    await config.load();

    // Restaurar estado
    const savedState = JSON.parse(sessionStorage.getItem('hmr-state') || '{}');
    window.scrollTo(0, savedState.scrollPosition || 0);
  });
}
```

---

## R6: Dependência Circular

### Descrição do Risco
ConfigService importa utilidade que importa ConfigService.

### Cenário de Falha
```typescript
// ConfigService.ts
import { formatPhone } from '@/utils/formatPhone';

// utils/formatPhone.ts
import { ConfigService } from '@/lib/config/ConfigService';
// ↑ ERRO: Circular dependency
```

### Impacto
- 🟡 **Alto**: Build quebra
- Runtime errors
- Module resolution falha

### Probabilidade
**Baixa** (10%)

### Mitigação: Lazy Imports

```typescript
// ConfigService.ts
public formatBusinessPhone(): string {
  // Lazy import para evitar circular
  const { formatPhone } = await import('@/utils/formatPhone');

  const phone = this.get('business.phone.main');
  return formatPhone(phone);
}
```

**Ou Injeção de Dependência**:
```typescript
// ConfigService.ts
class ConfigService {
  private formatter: PhoneFormatter | null = null;

  public setFormatter(formatter: PhoneFormatter) {
    this.formatter = formatter;
  }

  public formatBusinessPhone(): string {
    if (!this.formatter) {
      throw new Error('Formatter not set');
    }

    const phone = this.get('business.phone.main');
    return this.formatter.format(phone);
  }
}
```

---

## R7-R10: Riscos de Baixa Prioridade

*(Documentação condensada para economizar espaço)*

### R7: Env Vars Não Interpoladas
- **Mitigação**: Script prebuild interpola `${VAR}`
- **Fallback**: Validação falha se `${VAR}` literal

### R8: Traduções Incompletas
- **Mitigação**: Fallback para `pt-BR`
- **Validação**: Script verifica % de tradução

### R9: Feature Flag Inconsistente
- **Mitigação**: Rollout percentual determinístico
- **Override**: Admin pode forçar enabled/disabled

### R10: Build Time Aumenta
- **Mitigação**: Lazy validation em prod
- **Monitoramento**: CI/CD alerta se >50s

---

## Plano de Contingência

### 1. Rollback Rápido (<5 min)

```bash
# Reverter para release anterior
cd /var/www/saraivavision
sudo rm -f current
sudo ln -s releases/PREVIOUS_RELEASE current
sudo systemctl reload nginx
```

### 2. Rollback de Código (<30 min)

```bash
git revert HEAD  # Reverter último commit
npm run build:vite
sudo npm run deploy:quick
```

### 3. Hotfix de Emergência (<1h)

```bash
# Editar config direto em produção (EMERGÊNCIA APENAS)
sudo nano /var/www/saraivavision/current/config/config.production.yaml

# Recarregar app (sem rebuild)
sudo systemctl reload nginx
```

---

## Resumo de Riscos

| Severidade | Quantidade | Mitigação |
|------------|------------|-----------|
| 🔴 Crítica | 2 (R1, R2) | Validação build + Backups |
| 🟡 Alta | 3 (R3, R5, R6) | Versionamento + State persistence |
| 🟢 Baixa | 5 (R4, R7-R10) | Monitoring + Fallbacks |

**Postura Geral**: **Defensiva** - Prevenir > Reagir

---

**Próximos Passos**: Implementação completa do sistema conforme [05-plano-migracao.md](./05-plano-migracao.md)
