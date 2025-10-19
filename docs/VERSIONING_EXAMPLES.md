# 📚 Exemplos Práticos de Versionamento

Este documento mostra exemplos reais de como usar o sistema de versionamento.

## 🎯 Cenários Comuns

### Cenário 1: Nova Feature no Blog

**Situação:** Você implementou um sistema de comentários no blog.

```bash
# Fazer alterações
git add src/components/BlogComments.jsx
git add src/pages/BlogPost.jsx

# Usar commitizen (recomendado)
npm run commit

# Ou commit manual
git commit -m "feat(blog): adicionar sistema de comentários

- Componente BlogComments com validação
- Integração com API de comentários
- Paginação e ordenação
- Moderação de spam"

git push origin develop
```

**Resultado:**
- Versão: `1.2.3` → `1.3.0-beta.1` (develop)
- Depois do merge para main: `1.3.0` (production)
- CHANGELOG: Nova seção "✨ Features" com descrição
- Release notes: Publicadas no GitHub
- Deploy: Automático para beta/production

---

### Cenário 2: Correção de Bug Crítico

**Situação:** Bug na validação de email do formulário de contato.

```bash
git add src/utils/validation.js
git add src/components/ContactForm.jsx

npm run commit
# Tipo: fix
# Escopo: contact
# Descrição: corrigir validação de email com caracteres especiais

git push origin main
```

**Resultado:**
- Versão: `1.3.0` → `1.3.1`
- CHANGELOG: Seção "🐛 Bug Fixes"
- Deploy: Automático para production
- Release notes: Publicadas imediatamente

---

### Cenário 3: Melhoria de Performance

**Situação:** Otimização no carregamento de imagens.

```bash
git add src/utils/imageLoader.js
git add src/components/BlogImage.jsx

git commit -m "perf(images): implementar lazy loading e WebP

- Lazy loading com IntersectionObserver
- Conversão automática para WebP
- Fallback para JPEG
- Redução de 60% no tamanho das imagens"

git push origin develop
```

**Resultado:**
- Versão: `1.3.1` → `1.3.2-beta.1`
- CHANGELOG: Seção "⚡ Performance Improvements"
- Métricas: Redução documentada no release notes

---

### Cenário 4: Breaking Change (Major)

**Situação:** Migração da API de v1 para v2 com mudanças incompatíveis.

```bash
git add src/api/
git add src/services/

git commit -m "feat(api)!: migrar para API v2

BREAKING CHANGE: API v1 foi removida. Endpoints mudaram:
- GET /api/posts → GET /api/v2/blog/posts
- POST /api/contact → POST /api/v2/contact/submit
- Autenticação agora requer header X-API-Version: 2

Migração necessária para clientes da API."

git push origin main
```

**Resultado:**
- Versão: `1.3.2` → `2.0.0` (MAJOR bump!)
- CHANGELOG: Seção especial "⚠️ BREAKING CHANGES"
- Release notes: Destaque para mudanças incompatíveis
- Notificação: Alerta para todos stakeholders

---

### Cenário 5: Múltiplos Commits (Feature Branch)

**Situação:** Feature grande desenvolvida em branch separada.

```bash
git checkout -b feature/search-system
git push origin feature/search-system

# Commit 1: Estrutura básica
git add src/components/SearchBar.jsx
git commit -m "feat(search): adicionar componente SearchBar"

# Commit 2: Lógica de busca
git add src/services/searchService.js
git commit -m "feat(search): implementar lógica de busca"

# Commit 3: Resultados
git add src/components/SearchResults.jsx
git commit -m "feat(search): adicionar componente de resultados"

# Commit 4: Testes
git add src/__tests__/search.test.js
git commit -m "test(search): adicionar testes para sistema de busca"

# Merge para develop
git checkout develop
git merge feature/search-system
git push origin develop
```

**Resultado:**
- Versão: `2.0.0` → `2.1.0-beta.1`
- CHANGELOG: Todas as features consolidadas
- Release notes: Lista completa de funcionalidades
- Feature branch: Pode ser deletada após merge

---

### Cenário 6: Hotfix em Production

**Situação:** Bug crítico descoberto em produção.

```bash
git checkout main
git pull origin main

# Criar branch de hotfix
git checkout -b hotfix/security-patch

# Fazer correção
git add src/middleware/auth.js
git commit -m "fix(security): corrigir vulnerabilidade XSS

CVE-2024-XXXX: Sanitização de input no formulário
Prioridade: CRÍTICA"

# Merge direto para main
git checkout main
git merge hotfix/security-patch
git push origin main
```

**Resultado:**
- Versão: `2.1.0` → `2.1.1` (imediato)
- Deploy: Automático e urgente
- CHANGELOG: Seção "🐛 Bug Fixes" com tag [SECURITY]
- Notificação: Alerta imediato para equipe

---

### Cenário 7: Documentação (Sem Versão)

**Situação:** Atualizar documentação do projeto.

```bash
git add README.md
git add docs/API.md

npm run commit
# Tipo: docs
# Descrição: atualizar guia de API

git push origin develop
```

**Resultado:**
- Versão: `2.1.1` → `2.1.1` (sem mudança)
- CHANGELOG: Seção "📝 Documentation" (sem tag/release)
- Deploy: Não trigado

---

### Cenário 8: Refatoração (Patch)

**Situação:** Refatorar código legado sem mudar funcionalidade.

```bash
git add src/components/Header/
git add src/hooks/useAuth.js

git commit -m "refactor(auth): simplificar lógica de autenticação

- Extrair hook useAuth
- Remover código duplicado
- Melhorar legibilidade
- Sem mudanças funcionais"

git push origin develop
```

**Resultado:**
- Versão: `2.1.1` → `2.1.2-beta.1`
- CHANGELOG: Seção "♻️ Code Refactoring"
- Deploy: Automático para beta

---

### Cenário 9: CI/CD (Sem Versão)

**Situação:** Atualizar workflow do GitHub Actions.

```bash
git add .github/workflows/test.yml

git commit -m "ci: adicionar cache de node_modules no CI

Reduz tempo de build de 5min para 2min"

git push origin main
```

**Resultado:**
- Versão: `2.1.2` → `2.1.2` (sem mudança)
- CHANGELOG: Seção "🔧 CI/CD" (sem tag/release)
- Workflow: Aplicado imediatamente

---

### Cenário 10: Release Manual (Emergência)

**Situação:** Precisar forçar uma release manualmente.

```bash
# Fazer commits normais
git add .
git commit -m "fix(api): corrigir timeout"
git push origin main

# Aguardar GitHub Actions fazer release automática
# OU forçar localmente (emergência)
export GITHUB_TOKEN=<seu-token>
npm run release:ci
```

---

## 🔄 Fluxo Completo: Feature → Beta → Production

```bash
# 1. Desenvolvimento local (feature branch)
git checkout -b feature/newsletter
git add src/components/Newsletter.jsx
git commit -m "feat(newsletter): adicionar componente de newsletter"
git push origin feature/newsletter

# 2. Pull Request para develop
# (criar PR no GitHub)

# 3. Merge para develop (após code review)
git checkout develop
git merge feature/newsletter
git push origin develop

# → Release automática: 2.1.2 → 2.2.0-beta.1
# → Deploy automático para beta.saraivavision.com.br

# 4. Testar em beta
# Validar funcionalidades
# Corrigir bugs se necessário

# 5. Pull Request para main
# (criar PR no GitHub)

# 6. Merge para main (após aprovação)
git checkout main
git merge develop
git push origin main

# → Release automática: 2.2.0-beta.1 → 2.2.0
# → Deploy automático para saraivavision.com.br
# → Release notes publicadas no GitHub
# → Notificação para equipe
```

---

## 📊 Análise de Impacto

Antes de fazer commit, use:

```bash
# Ver preview da versão
npm run version:preview

# Ver últimos commits
git --no-pager log --oneline -10

# Ver diff
git --no-pager diff

# Validar commit message
npm run validate:commit "feat(blog): nova feature"
```

---

## 💡 Dicas e Boas Práticas

### ✅ Faça

- Use `npm run commit` para interface interativa
- Seja descritivo mas conciso nas mensagens
- Use escopos para organizar (blog, api, auth, etc)
- Teste em beta antes de merge para main
- Documente breaking changes claramente
- Agrupe commits relacionados em PRs

### ❌ Não Faça

- Não edite package.json manualmente (versão)
- Não edite CHANGELOG.md manualmente
- Não crie tags manualmente
- Não use mensagens genéricas ("fix", "update")
- Não force push em main/develop
- Não pule conventional commits

---

## 🆘 Comandos de Emergência

### Reverter Release (Rollback)

```bash
# Ver releases
git tag -l

# Reverter para versão anterior
git revert <commit-hash>
git push origin main

# Deploy manual do rollback
gh workflow run deploy-production.yml
```

### Corrigir Commit Message

```bash
# Último commit (não pushed)
git commit --amend -m "feat(blog): mensagem correta"

# Já pushed (cuidado!)
git commit --amend -m "feat(blog): mensagem correta"
git push origin branch-name --force-with-lease
```

### Pular CI/CD

```bash
git commit -m "docs: atualizar README [skip ci]"
```

---

**Documentação completa:** [VERSIONING.md](./VERSIONING.md)  
**Quick Start:** [QUICK_START_VERSIONING.md](./QUICK_START_VERSIONING.md)
