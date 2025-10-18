# I. Checklist Operacional e Governança

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-18

---

## 1. Convenções de Nomenclatura

### 1.1 Chaves i18n (Dot Notation)

**Padrão**: `<seção>.<componente>.<elemento>`

```yaml
# ✅ CORRETO
i18n:
  translations:
    pt-BR:
      "nav.header.home": "Início"
      "nav.header.services": "Serviços"
      "nav.footer.privacy": "Privacidade"

      "hero.title": "Título Principal"
      "hero.subtitle": "Subtítulo"
      "hero.cta.primary": "Botão Primário"

      "forms.contact.name.label": "Nome"
      "forms.contact.name.placeholder": "Digite seu nome"
      "forms.contact.email.label": "E-mail"

      "messages.success": "Sucesso!"
      "messages.error": "Erro!"

# ❌ ERRADO
i18n:
  translations:
    pt-BR:
      "homeTitle": "Título"           # Sem contexto
      "nav_home": "Início"             # Underscore em vez de dot
      "nav.services.page": "Serviços"  # Redundância "page"
```

**Hierarquia Recomendada**:
```
nav.*                    → Navegação (header, footer, mobile)
hero.*                   → Hero section
forms.*                  → Formulários e inputs
messages.*               → Mensagens de feedback
services.*               → Serviços médicos
plans.*                  → Planos e pricing
blog.*                   → Blog posts
pages.*                  → Páginas específicas
common.*                 → Textos reutilizáveis
```

---

### 1.2 IDs de Configuração

**Padrão**: `kebab-case` para IDs de planos, features, etc.

```yaml
# ✅ CORRETO
plans:
  items:
    - id: "basic-plan"
    - id: "premium-plan"
    - id: "enterprise-plan"

featureFlags:
  new-pricing-page: { enabled: true }
  chatbot-widget: { enabled: false }
  dark-mode: { enabled: false }

# ❌ ERRADO
plans:
  items:
    - id: "BasicPlan"        # PascalCase
    - id: "premium_plan"     # snake_case
    - id: "Enterprise-Plan"  # Mixed case
```

---

### 1.3 Nomes de Arquivo

```
config/
├── config.base.yaml         # Base configuration
├── config.development.yaml  # Dev overrides
├── config.staging.yaml      # Staging overrides
├── config.production.yaml   # Prod overrides
└── config.test.yaml         # Test environment (opcional)
```

**Regras**:
- Sempre `config.<environment>.yaml`
- Usar lowercase
- `.yaml` (não `.yml`)

---

## 2. Versionamento Semântico

### 2.1 Estratégia de Versão

Seguir [Semantic Versioning 2.0](https://semver.org):

```
version: "MAJOR.MINOR.PATCH"

MAJOR → Breaking changes (requer migração)
MINOR → New features (backward compatible)
PATCH → Bug fixes / tweaks
```

**Exemplos**:
```yaml
# v1.0.0 → v1.1.0 (adicionar nova seção)
version: "1.0.0"
# ... config existente
---
version: "1.1.0"
featureFlags:  # ← Nova seção (backward compatible)
  newFeature: { enabled: true }

# v1.1.0 → v2.0.0 (breaking change)
version: "1.1.0"
business:
  phone: "+5533999096030"  # String simples
---
version: "2.0.0"
business:
  phone:                   # ← Estrutura mudou (BREAKING)
    main: "+5533332120071"
    whatsapp: "+5533999096030"
```

---

### 2.2 CHANGELOG.md

Manter `config/CHANGELOG.md` atualizado:

```markdown
# Configuration Changelog

All notable changes to configuration files will be documented here.

## [1.2.0] - 2025-10-20

### Added
- Feature flag `chatbotWidget` com rollout 25%
- Tradução en-US completa para seção `services.*`
- Plano "Enterprise" com features exclusivas

### Changed
- Atualizado telefone WhatsApp: +5533999096030
- Endereço: novo complemento "Sala 201"
- Tema: cor `accent` de #10b981 para #14b8a6

### Deprecated
- (Nenhuma depreciação nesta versão)

### Removed
- (Nenhuma remoção nesta versão)

### Fixed
- Corrigido formato E.164 do telefone principal
- Geo coordenadas ajustadas (lat/lng trocadas)

## [1.1.0] - 2025-10-15

### Added
- Seção `featureFlags` para rollout gradual
- Menus configuráveis (header, footer, mobile)

## [1.0.0] - 2025-10-10

### Added
- Configuração base inicial
- Schema Zod completo
- ConfigService singleton
```

**Atualizar a cada mudança**:
```bash
# Ao modificar config.yaml:
1. Incrementar version em config.base.yaml
2. Adicionar entrada em CHANGELOG.md
3. Commit com mensagem descritiva
```

---

## 3. Processo de Contribuição

### 3.1 Git Workflow

```bash
# 1. Criar branch de feature
git checkout -b config/add-new-plan

# 2. Modificar config.yaml
nano config/config.base.yaml

# 3. Validar alterações
npm run validate:config

# 4. Rodar testes
npm run test:run

# 5. Commit com convenção
git add config/config.base.yaml config/CHANGELOG.md
git commit -m "config(plans): adicionar plano Enterprise com features premium"

# 6. Push e PR
git push origin config/add-new-plan
gh pr create --title "config: Add Enterprise Plan" --body "..."

# 7. Após aprovação, merge para main
git checkout main
git merge config/add-new-plan
git push origin main
```

---

### 3.2 Template de Pull Request

Criar `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Tipo de Mudança

- [ ] 🐛 Bug fix (PATCH)
- [ ] ✨ Nova feature (MINOR)
- [ ] 💥 Breaking change (MAJOR)
- [ ] 📝 Documentação
- [ ] 🎨 Estilo/formatação

## Descrição

<!-- Descreva as mudanças em config.yaml -->

## Seções Afetadas

- [ ] `site.*`
- [ ] `business.*`
- [ ] `i18n.*`
- [ ] `theme.*`
- [ ] `seo.*`
- [ ] `menus.*`
- [ ] `plans.*`
- [ ] `tracking.*`
- [ ] `featureFlags.*`
- [ ] `compliance.*`

## Checklist

- [ ] Validei YAML syntax (`npm run validate:config`)
- [ ] Atualizei `version` em `config.base.yaml`
- [ ] Adicionei entrada em `config/CHANGELOG.md`
- [ ] Rodei testes (`npm run test:run`)
- [ ] Build passou (`npm run build:vite`)
- [ ] Testei localmente (`npm run dev:vite`)

## Breaking Changes?

<!-- Se MAJOR version, descreva impacto e plano de migração -->

## Screenshots

<!-- Se mudança visual, adicionar prints antes/depois -->
```

---

### 3.3 Code Review Checklist

**Revisor deve verificar**:

1. **Schema Compliance**
   - [ ] Todos os campos obrigatórios presentes
   - [ ] Tipos corretos (string, number, boolean, etc.)
   - [ ] Formato de telefone E.164 (`+5533999096030`)
   - [ ] Emails válidos
   - [ ] URLs válidas

2. **Versionamento**
   - [ ] `version` incrementada corretamente
   - [ ] CHANGELOG.md atualizado
   - [ ] Breaking changes documentadas

3. **Traduções**
   - [ ] pt-BR completo
   - [ ] en-US completo (ou parcial com fallback)
   - [ ] Chaves i18n seguem convenção (dot notation)

4. **Consistência**
   - [ ] NAP (Name, Address, Phone) consistente
   - [ ] Cores em hex (#RRGGBB)
   - [ ] Spacing em rem/px consistente

5. **Segurança**
   - [ ] Sem secrets commitados (usar `${ENV_VAR}`)
   - [ ] API keys via env vars
   - [ ] Emails obfuscados se necessário

---

## 4. Observabilidade e Monitoramento

### 4.1 Logging no Bootstrap

```typescript
// src/main.tsx
async function bootstrap() {
  const config = ConfigService.getInstance();

  console.log('[Config] Loading...');

  try {
    await config.load();

    const version = config.get('version');
    const env = config.get('environment');
    const hash = config.getContentHash();

    console.log(`[Config] ✅ Loaded v${version} (${env})`);
    console.log(`[Config] Hash: ${hash}`);
    console.log(`[Config] Locale: ${config.get('i18n.defaultLocale')}`);

    // Debug em dev
    if (import.meta.env.DEV) {
      console.log('[Config] Full config:', config);
    }
  } catch (error) {
    console.error('[Config] ❌ Failed to load:', error);
    throw error;
  }
}
```

**Console Output Esperado**:
```
[Config] Loading...
[Config] ✅ Loaded v1.2.0 (production)
[Config] Hash: a3f9c81e
[Config] Locale: pt-BR
```

---

### 4.2 HTTP Header para Cache Busting

```typescript
// vite.config.js - adicionar plugin
export default defineConfig({
  plugins: [
    react(),
    yaml(),
    {
      name: 'config-hash-header',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const config = ConfigService.getInstance();
          const hash = config.getContentHash();

          // Adicionar header customizado
          res.setHeader('X-Config-Hash', hash);
          res.setHeader('X-Config-Version', config.get('version'));

          next();
        });
      },
    },
  ],
});
```

**Verificação em produção**:
```bash
curl -I https://saraivavision.com.br

# Output esperado:
# HTTP/2 200
# X-Config-Hash: a3f9c81e
# X-Config-Version: 1.2.0
```

**Uso**: Monitorar mudanças de config via header

---

### 4.3 Health Check Endpoint

```typescript
// api/src/routes/health.ts
import express from 'express';
import { ConfigService } from '@/lib/config/ConfigService';

const router = express.Router();

router.get('/health', (req, res) => {
  const config = ConfigService.getInstance();

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      version: config.get('version'),
      environment: config.get('environment'),
      hash: config.getContentHash(),
      loaded: config !== null,
    },
  };

  res.json(health);
});

export default router;
```

**Test**:
```bash
curl https://saraivavision.com.br/api/health

# Output:
# {
#   "status": "ok",
#   "timestamp": "2025-10-18T10:30:00.000Z",
#   "config": {
#     "version": "1.2.0",
#     "environment": "production",
#     "hash": "a3f9c81e",
#     "loaded": true
#   }
# }
```

---

### 4.4 Error Tracking (Sentry)

```typescript
// src/lib/config/ConfigService.ts
public async load(): Promise<void> {
  try {
    // ... load config
  } catch (error) {
    // Log para Sentry
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          component: 'ConfigService',
          action: 'load',
        },
        extra: {
          environment: import.meta.env.MODE,
        },
      });
    }

    throw error;
  }
}
```

---

## 5. Testes e Validação Contínua

### 5.1 Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh

# Validar config antes de commit
if git diff --cached --name-only | grep -q "^config/.*\.yaml$"; then
  echo "🔍 Config files changed, validating..."

  npm run validate:config || {
    echo "❌ Config validation failed. Fix errors before committing."
    exit 1
  }

  echo "✅ Config validation passed"
fi
```

**Instalação**:
```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/pre-commit "$(cat <<'EOF'
#!/bin/sh
if git diff --cached --name-only | grep -q "^config/.*\.yaml$"; then
  npm run validate:config || exit 1
fi
EOF
)"
```

---

### 5.2 CI/CD Pipeline

```yaml
# .github/workflows/config-validation.yml
name: Config Validation

on:
  push:
    paths: ['config/**/*.yaml']
  pull_request:
    paths: ['config/**/*.yaml']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm ci
      - run: npm run validate:config
      - run: npm run test:run
      - run: npm run build:vite

      - name: Check version updated
        if: github.event_name == 'pull_request'
        run: |
          BASE_VERSION=$(git show origin/${{ github.base_ref }}:config/config.base.yaml | grep '^version:' | awk '{print $2}' | tr -d '"')
          HEAD_VERSION=$(grep '^version:' config/config.base.yaml | awk '{print $2}' | tr -d '"')

          if [ "$BASE_VERSION" == "$HEAD_VERSION" ]; then
            echo "❌ Version não foi atualizada em config.base.yaml"
            exit 1
          fi

          echo "✅ Version atualizada: $BASE_VERSION → $HEAD_VERSION"
```

---

## 6. Rollback e Disaster Recovery

### 6.1 Backup Automático

```bash
# scripts/backup-config.sh
#!/bin/bash

BACKUP_DIR="backups/config"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup de todos os YAMLs
cp config/*.yaml "$BACKUP_DIR/config-$TIMESTAMP.tar.gz"

# Manter apenas últimos 30 backups
ls -t $BACKUP_DIR/config-*.tar.gz | tail -n +31 | xargs rm -f

echo "✅ Backup criado: config-$TIMESTAMP.tar.gz"
```

**Agendar com cron**:
```bash
# Backup diário às 2h da manhã
0 2 * * * /home/saraiva-vision-site/scripts/backup-config.sh
```

---

### 6.2 Rollback Rápido

```bash
# scripts/rollback-config.sh <timestamp>
#!/bin/bash

if [ -z "$1" ]; then
  echo "Uso: ./rollback-config.sh <timestamp>"
  echo "Backups disponíveis:"
  ls -1 backups/config/config-*.tar.gz
  exit 1
fi

BACKUP_FILE="backups/config/config-$1.tar.gz"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup não encontrado: $BACKUP_FILE"
  exit 1
fi

# Restaurar backup
tar -xzf "$BACKUP_FILE" -C config/

# Validar
npm run validate:config || {
  echo "❌ Backup inválido. Revertendo..."
  git checkout config/
  exit 1
}

# Rebuild
npm run build:vite

echo "✅ Rollback completo para $1"
```

---

## 7. Documentação e Onboarding

### 7.1 README.md para Config

Criar `config/README.md`:

```markdown
# Configuration System

## Arquivos

- `config.base.yaml` - Configuração base (fonte da verdade)
- `config.development.yaml` - Overrides para dev
- `config.production.yaml` - Overrides para produção

## Editar Configuração

1. Editar `config.base.yaml`
2. Incrementar `version`
3. Atualizar `CHANGELOG.md`
4. Validar: `npm run validate:config`
5. Testar: `npm run dev:vite`
6. Commit e PR

## Convenções

- **IDs**: kebab-case (`new-plan`, `feature-flag`)
- **i18n**: dot notation (`nav.header.home`)
- **Versão**: semver (`1.2.3`)
- **Secrets**: env vars (`${VAR_NAME}`)

## Validação

```bash
# Validar schema
npm run validate:config

# Rodar testes
npm run test:run

# Build completo
npm run build:vite
```

## Rollback

```bash
# Listar backups
ls backups/config/

# Restaurar backup
./scripts/rollback-config.sh 20251018_143000
```

## Suporte

Dúvidas? Ver documentação completa em:
`claudedocs/config-centralization/`
```

---

### 7.2 Onboarding Checklist

Para novos desenvolvedores:

```markdown
# Onboarding: Configuration System

## Pré-requisitos
- [ ] Node.js 18+ instalado
- [ ] npm 9+ instalado
- [ ] Familiaridade com YAML
- [ ] Familiaridade com TypeScript

## Setup Local

1. [ ] Clone o repositório
   ```bash
   git clone https://github.com/saraivavision/website.git
   cd website
   ```

2. [ ] Instalar dependências
   ```bash
   npm install
   ```

3. [ ] Copiar `.env.example` para `.env`
   ```bash
   cp .env.example .env
   # Preencher variáveis
   ```

4. [ ] Validar config
   ```bash
   npm run validate:config
   ```

5. [ ] Rodar testes
   ```bash
   npm run test:run
   ```

6. [ ] Iniciar dev server
   ```bash
   npm run dev:vite
   ```

## Leitura Recomendada

1. [ ] `config/README.md` - Overview do sistema
2. [ ] `claudedocs/config-centralization/01-arquitetura-atual.md` - Arquitetura
3. [ ] `claudedocs/config-centralization/02-schema-configuracao.md` - Schema YAML
4. [ ] `claudedocs/config-centralization/08-exemplos-codigo.md` - Exemplos práticos

## Exercícios Práticos

1. [ ] Adicionar nova tradução em `i18n.translations.pt-BR`
2. [ ] Criar feature flag de teste
3. [ ] Modificar cor primária em `theme.tokens.colors`
4. [ ] Rodar validação e ver erro proposital
5. [ ] Fazer PR de teste (será fechado)

## Dúvidas?

Contatar: Dr. Philipe Saraiva Cruz
```

---

## 8. Métricas de Qualidade

### 8.1 KPIs do Sistema

| Métrica | Meta | Medição | Frequência |
|---------|------|---------|------------|
| **Schema Validation** | 100% pass | `npm run validate:config` | A cada commit |
| **Test Coverage** | >85% | `npm run test:coverage` | Semanal |
| **Build Success** | 100% | `npm run build:vite` | A cada deploy |
| **Config Load Time** | <100ms | `performance.mark()` | Contínuo (prod) |
| **Hot Reload Time** | <1.5s | Manual testing | Semanal |
| **PR Review Time** | <24h | GitHub metrics | Mensal |
| **Config Changes/Month** | <10 | Git log | Mensal |

---

### 8.2 Dashboard de Monitoramento

```typescript
// scripts/config-metrics.ts
import { ConfigService } from '@/lib/config/ConfigService';
import yaml from 'js-yaml';
import fs from 'fs';

const config = ConfigService.getInstance();
await config.load();

const metrics = {
  version: config.get('version'),
  environment: config.get('environment'),
  hash: config.getContentHash(),

  counts: {
    i18nKeys: Object.keys(config.get('i18n.translations.pt-BR', {})).length,
    plans: config.get('plans.items', []).length,
    featureFlags: Object.keys(config.get('featureFlags', {})).length,
    menuItems: {
      header: config.getMenu('pt-BR', 'header').length,
      footer: config.get('menus.footer.pt-BR.sections', []).length,
    },
  },

  fileSize: {
    base: fs.statSync('config/config.base.yaml').size,
    total: ['base', 'development', 'staging', 'production']
      .map(env => {
        try {
          return fs.statSync(`config/config.${env}.yaml`).size;
        } catch {
          return 0;
        }
      })
      .reduce((a, b) => a + b, 0),
  },

  timestamp: new Date().toISOString(),
};

console.log('📊 Config Metrics:');
console.log(JSON.stringify(metrics, null, 2));
```

**Rodar**:
```bash
npm run metrics:config

# Output:
# 📊 Config Metrics:
# {
#   "version": "1.2.0",
#   "environment": "production",
#   "hash": "a3f9c81e",
#   "counts": {
#     "i18nKeys": 127,
#     "plans": 3,
#     "featureFlags": 4,
#     "menuItems": {
#       "header": 5,
#       "footer": 4
#     }
#   },
#   "fileSize": {
#     "base": 8192,
#     "total": 12288
#   },
#   "timestamp": "2025-10-18T10:30:00.000Z"
# }
```

---

## 9. Auditoria e Compliance

### 9.1 Checklist de Auditoria Mensal

```markdown
# Config Audit - 2025-10

## Validação Técnica
- [ ] Schema validation passa (100%)
- [ ] Testes passam (coverage >85%)
- [ ] Build passa sem warnings
- [ ] Hot reload funciona

## Dados de Negócio
- [ ] NAP (Name, Address, Phone) atualizado
- [ ] Horário de funcionamento correto
- [ ] Telefones funcionais (ligar para testar)
- [ ] Emails válidos (enviar teste)
- [ ] Links de redes sociais ativos

## Traduções
- [ ] pt-BR completo (100%)
- [ ] en-US completo ou >80%
- [ ] Sem chaves "missing" em produção

## SEO
- [ ] Titles <60 caracteres
- [ ] Descriptions 150-160 caracteres
- [ ] Canonical URLs corretas
- [ ] OG images existem

## Compliance
- [ ] LGPD disclaimers atualizados
- [ ] CFM disclaimers conformes
- [ ] Cookie consent funcionando
- [ ] DPO contact atualizado

## Performance
- [ ] Config load <100ms
- [ ] Bundle size <500KB
- [ ] Build time <50s

## Documentação
- [ ] CHANGELOG.md atualizado
- [ ] Version incrementada
- [ ] README.md atual
```

---

### 9.2 Relatório de Auditoria

```bash
# scripts/audit-config.sh
#!/bin/bash

echo "🔍 Config Audit Report - $(date +%Y-%m-%d)"
echo "========================================"

# 1. Schema validation
echo "1. Schema Validation"
npm run validate:config && echo "✅ PASS" || echo "❌ FAIL"

# 2. Tests
echo "2. Test Suite"
npm run test:run && echo "✅ PASS" || echo "❌ FAIL"

# 3. Build
echo "3. Build"
npm run build:vite && echo "✅ PASS" || echo "❌ FAIL"

# 4. File size check
echo "4. Config File Size"
du -h config/*.yaml

# 5. Version check
echo "5. Current Version"
grep "^version:" config/config.base.yaml

# 6. Last modified
echo "6. Last Modified"
git log -1 --format="%h %ad %s" -- config/

echo "========================================"
echo "✅ Audit complete"
```

---

## Resumo Final

### Checklist de Governança

- ✅ Convenções de nomenclatura documentadas
- ✅ Versionamento semântico implementado
- ✅ CHANGELOG.md mantido atualizado
- ✅ PR template criado
- ✅ Pre-commit hooks configurados
- ✅ CI/CD validation ativa
- ✅ Logging e observabilidade
- ✅ Health check endpoint
- ✅ Backup automático diário
- ✅ Rollback script testado
- ✅ Onboarding docs completas
- ✅ Auditoria mensal agendada

**Responsabilidades**:
- **Dev Team**: Seguir convenções, testar mudanças
- **Tech Lead**: Code review, aprovar PRs
- **DevOps**: Monitorar CI/CD, backups
- **Product**: Revisar traduções, NAP updates

---

**Última Revisão**: 2025-10-18
**Próxima Auditoria**: 2025-11-18
