# GitHub Actions Workflows

Este diretório contém os workflows do GitHub Actions para CI/CD, segurança e automação.

## 📋 Workflows Disponíveis

### 1. CI com Jobs Paralelos (`ci-parallel.yml`)
**Triggers:** Push e Pull Requests em `main`, `develop`, `feature/**`

Executa testes, linting, type checking e análise de build em paralelo para feedback rápido.

**Jobs:**
- 📦 Setup e cache de dependências
- 🔍 Lint (ESLint)
- 📝 Type checking (TypeScript)
- 🧪 Testes (unit, integration, api, frontend, e2e)
- 🏗️ Build e análise de bundle
- 🔦 Lighthouse CI (apenas PRs)
- 🔒 Security scan
- 📊 Summary

### 2. Deploy para Beta (`deploy-beta.yml`)
**Triggers:** Push em `develop`, `main`, `feature/**` e Pull Requests

Deploy automático para ambiente beta via webhook no VPS.

**Nota:** O deploy real é feito pelo webhook receiver no VPS.

### 3. Deploy para Produção (`deploy-production.yml`)
**Triggers:** Manual (`workflow_dispatch`)

Deploy para produção com aprovação manual e health checks.

**Requer:**
- Confirmação: Digite "DEPLOY TO PRODUCTION"
- Aprovação manual no GitHub
- Secrets configurados (VPS_HOST, VPS_SSH_KEY)

### 4. Deploy Otimizado (`deploy-production-optimized.yml`)
**Triggers:** Manual (`workflow_dispatch`)

Versão otimizada do deploy de produção com cache avançado e deploy atômico.

### 5. Security Scan (`security-scan.yml`)
**Triggers:**
- Push/PR em `main`, `develop`, `feature/**`
- Schedule diário às 2h AM (horário de Brasília)
- Manual (`workflow_dispatch`)

**Verificações:**
- 🔍 npm audit (critical e high vulnerabilities)
- 📦 Dependency review (PRs)
- 🔐 CodeQL analysis
- 🔑 Secret scanning (TruffleHog)
- 🛡️ OWASP Dependency Check
- 🔒 Security headers check (produção)

### 6. Release & Changelog (`release.yml`)
**Triggers:** Push em `main`/`master` ou manual

Gera releases automáticos baseado em conventional commits.

**Conventional Commits Suportados:**
- `feat:` → Minor version bump
- `fix:` → Patch version bump
- `feat!:` ou `BREAKING CHANGE:` → Major version bump

### 7. Performance Monitoring (`performance-monitoring.yml`)
**Triggers:**
- Schedule: Diário às 6h e 18h (horário de Brasília)
- Push em `main`
- Manual

**Monitora:**
- 📊 Core Web Vitals
- ⚡ Lighthouse scores
- 📦 Bundle sizes
- 🌐 Uptime checks

## 🔐 Secrets Necessários

Configure os seguintes secrets no repositório GitHub:

### Obrigatórios para Deploy
- `VPS_HOST`: IP ou hostname do VPS (ex: `31.97.129.78`)
- `VPS_SSH_KEY`: Chave SSH privada para acesso ao VPS

### Opcionais (APIs)
- `GOOGLE_MAPS_API_KEY`: API key do Google Maps
- `GOOGLE_PLACES_API_KEY`: API key do Google Places
- `GOOGLE_PLACE_ID`: Place ID do Google Business
- `GA_TRACKING_ID`: Google Analytics tracking ID

### Automáticos (GitHub)
- `GITHUB_TOKEN`: Fornecido automaticamente pelo GitHub Actions

## 📝 Configurando Secrets

1. Vá para Settings → Secrets and variables → Actions
2. Clique em "New repository secret"
3. Adicione cada secret com seu valor correspondente

## 🚀 Como Usar

### CI Automático
Push ou crie PR - o workflow `ci-parallel.yml` roda automaticamente.

### Deploy para Beta
Faça push para `develop` - deploy automático via webhook.

### Deploy para Produção
```bash
1. Vá para Actions → Deploy to Production
2. Clique em "Run workflow"
3. Digite "DEPLOY TO PRODUCTION" para confirmar
4. Aguarde aprovação manual
5. Deploy executado
```

### Criar Release
```bash
# Automático (baseado em conventional commits)
git commit -m "feat: nova funcionalidade"
git push origin main

# Manual
Actions → Release & Changelog → Run workflow → Escolha tipo
```

## ⚙️ Node.js Version

Todos os workflows usam **Node.js 22.x** para consistência.

Configurado via variável de ambiente:
```yaml
env:
  NODE_VERSION: '22.x'
```

## 🔧 Manutenção

### Atualizar Actions
Verificar periodicamente por atualizações:
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `actions/cache@v4`
- `actions/upload-artifact@v4`

### Monitorar Falhas
- Verificar tab "Actions" regularmente
- Configurar notificações por email
- Revisar security scan diário

## 📊 Performance

### Cache Strategy
Os workflows usam cache em múltiplos níveis:
- npm cache (setup-node)
- node_modules cache (actions/cache)
- Build artifacts entre jobs

### Tempo de Execução Estimado
- CI Paralelo: ~5-8 minutos
- Security Scan: ~10-15 minutos
- Deploy Beta: ~2-3 minutos (webhook)
- Deploy Produção: ~8-12 minutos

## 🐛 Troubleshooting

### Workflow não executa
✅ Verificar se workflow está no diretório `.github/workflows/`
✅ Validar sintaxe YAML
✅ Verificar branch trigger conditions

### Falha em secrets
✅ Verificar se secrets estão configurados
✅ Verificar nomes exatos dos secrets
✅ Verificar permissões do repositório

### Cache issues
✅ Limpar cache: Settings → Actions → Caches
✅ Verificar cache key no workflow
✅ Invalidar cache alterando dependências

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

---

**Última atualização:** 2025-10-25
**Versão:** 1.0.0
