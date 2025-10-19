# 🚀 Sistema de Versionamento Automático

Este documento descreve o sistema completo de versionamento automático implementado no projeto Saraiva Vision.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Conventional Commits](#conventional-commits)
- [Semantic Versioning](#semantic-versioning)
- [Ferramentas Utilizadas](#ferramentas-utilizadas)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Como Usar](#como-usar)
- [Configuração](#configuração)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema de versionamento automático foi implementado para:

- ✅ Padronizar mensagens de commit usando **Conventional Commits**
- ✅ Auto-incrementar versão no `package.json` seguindo **Semantic Versioning**
- ✅ Gerar `CHANGELOG.md` automaticamente do histórico de commits
- ✅ Criar tags git com a nova versão
- ✅ Publicar release notes detalhadas no GitHub
- ✅ Trigger automático de deploy baseado na versão lançada
- ✅ Notificações para alertar sobre novas versões

---

## 📝 Conventional Commits

### Formato

```
<tipo>[escopo opcional]: <descrição>

[corpo opcional]

[rodapé(s) opcional(is)]
```

### Tipos Suportados

| Tipo | Descrição | Versão | Aparece no CHANGELOG |
|------|-----------|--------|---------------------|
| `feat` | Nova funcionalidade | MINOR | ✅ ✨ Features |
| `fix` | Correção de bug | PATCH | ✅ 🐛 Bug Fixes |
| `perf` | Melhoria de performance | PATCH | ✅ ⚡ Performance |
| `refactor` | Refatoração de código | PATCH | ✅ ♻️ Refactoring |
| `docs` | Documentação | - | ✅ 📝 Documentation |
| `style` | Formatação de código | - | ✅ 💄 Styles |
| `test` | Testes | - | ✅ ✅ Tests |
| `build` | Sistema de build | - | ✅ 📦 Build System |
| `ci` | CI/CD | - | ✅ 🔧 CI/CD |
| `chore` | Tarefas gerais | - | ✅ 🔨 Chores |

### Breaking Changes

Para indicar uma mudança que quebra compatibilidade (MAJOR version bump):

```bash
feat!: remove suporte para API v1

BREAKING CHANGE: A API v1 foi removida. Use a API v2.
```

ou

```bash
feat(api)!: alterar formato de resposta do endpoint /users
```

### Exemplos

```bash
# Nova feature (incrementa MINOR: 1.0.0 -> 1.1.0)
feat(blog): adicionar sistema de comentários

# Correção de bug (incrementa PATCH: 1.1.0 -> 1.1.1)
fix(contact): corrigir validação de email

# Performance (incrementa PATCH: 1.1.1 -> 1.1.2)
perf(images): otimizar carregamento de imagens

# Breaking change (incrementa MAJOR: 1.1.2 -> 2.0.0)
feat(api)!: migrar para novo sistema de autenticação

BREAKING CHANGE: Token JWT agora é obrigatório em todas as rotas

# Sem versão
docs: atualizar README
style: formatar código com prettier
test: adicionar testes para LoginForm
chore: atualizar dependências
```

---

## 🔢 Semantic Versioning

Versões seguem o formato: **MAJOR.MINOR.PATCH**

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): Novas features (backward compatible)
- **PATCH** (0.0.X): Bug fixes e melhorias (backward compatible)

### Pré-releases

Para branch `develop`, versões são marcadas como `beta`:

```
2.1.0-beta.1
2.1.0-beta.2
```

---

## 🛠️ Ferramentas Utilizadas

### 1. Semantic Release

Automação completa do processo de release:

- Analisa commits desde a última release
- Determina o tipo de versão (major/minor/patch)
- Atualiza `package.json` e `CHANGELOG.md`
- Cria tag git
- Publica release no GitHub

### 2. Commitizen

Interface CLI interativa para criar commits padronizados:

```bash
npm run commit
```

### 3. Plugins do Semantic Release

- `@semantic-release/commit-analyzer`: Analisa commits
- `@semantic-release/release-notes-generator`: Gera release notes
- `@semantic-release/changelog`: Atualiza CHANGELOG.md
- `@semantic-release/npm`: Atualiza package.json (sem publicar no npm)
- `@semantic-release/git`: Commita arquivos gerados
- `@semantic-release/github`: Publica release no GitHub

---

## 🔄 Fluxo de Trabalho

### 1. Desenvolvimento Local

```bash
# Fazer alterações no código
git add .

# Usar commitizen para criar commit padronizado
npm run commit

# Seguir prompts interativos:
# - Selecionar tipo (feat, fix, etc)
# - Adicionar escopo (opcional)
# - Escrever descrição curta
# - Adicionar descrição longa (opcional)
# - Indicar breaking changes (se houver)
```

### 2. Push para GitHub

```bash
# Push para develop (beta releases)
git push origin develop

# Ou push para main (production releases)
git push origin main
```

### 3. Automação GitHub Actions

O workflow `.github/workflows/release.yml` é acionado automaticamente:

1. ✅ Valida commits
2. ✅ Executa semantic-release
3. ✅ Determina nova versão
4. ✅ Atualiza package.json e CHANGELOG.md
5. ✅ Cria tag git
6. ✅ Publica release no GitHub com release notes
7. ✅ Trigger deploy automático
8. ✅ Notifica equipe

### 4. Deploy Automático

- **main**: Trigger do workflow de deploy para produção
- **develop**: Trigger do workflow de deploy para beta

---

## 🚀 Como Usar

### Fazer um Commit Usando Commitizen

```bash
# Interface interativa
npm run commit
```

Exemplo de fluxo:

```
? Select the type of change that you're committing: feat
? What is the scope of this change (e.g. component or file name)? blog
? Write a short, imperative tense description of the change: adicionar sistema de busca
? Provide a longer description of the change (optional):
? Are there any breaking changes? No
? Does this change affect any open issues? No
```

### Fazer um Commit Manual (Avançado)

```bash
git commit -m "feat(blog): adicionar sistema de busca"
```

### Testar Release Localmente (Dry Run)

```bash
# Ver qual versão seria gerada sem publicar
npm run release:dry
```

### Forçar Release Manual (CI)

```bash
# Em caso de necessidade
npm run release:ci
```

### Ver Histórico de Releases

- GitHub: https://github.com/Sudo-psc/saraiva-vision-site/releases
- CHANGELOG.md: No repositório

---

## ⚙️ Configuração

### .releaserc.json

Arquivo de configuração do semantic-release:

```json
{
  "branches": [
    "main",
    {
      "name": "develop",
      "prerelease": "beta"
    }
  ],
  "plugins": [...]
}
```

### package.json

Scripts adicionados:

```json
{
  "scripts": {
    "commit": "cz",
    "release": "semantic-release",
    "release:dry": "semantic-release --dry-run",
    "release:ci": "semantic-release --ci"
  },
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
}
```

### GitHub Actions

Workflow `.github/workflows/release.yml` configurado para:

- Branches: `main`, `develop`
- Permissões: `contents: write`, `issues: write`, `pull-requests: write`
- Trigger: Push (exceto `[skip ci]`)

---

## 🐛 Troubleshooting

### Release não foi criada

**Problema:** Push para `main`/`develop` mas nenhuma release foi criada.

**Soluções:**

1. Verificar se commits seguem Conventional Commits:
   ```bash
   git --no-pager log --oneline -5
   ```

2. Verificar se há commits desde última release:
   ```bash
   git tag --sort=-creatordate | head -5
   ```

3. Testar localmente:
   ```bash
   npm run release:dry
   ```

### Versão não incrementou

**Problema:** Release criada mas versão não mudou.

**Causa:** Apenas commits que não geram release (docs, style, test, chore).

**Solução:** Fazer commits do tipo `feat`, `fix`, `perf` ou `refactor`.

### CHANGELOG.md não foi atualizado

**Problema:** Release criada mas CHANGELOG.md não mudou.

**Verificar:**

1. Plugin `@semantic-release/changelog` está instalado
2. Configuração em `.releaserc.json` está correta
3. Permissões do GitHub Actions (`contents: write`)

### Conflito em package.json

**Problema:** Conflito após semantic-release commitar package.json.

**Solução:**

1. Pull antes de push:
   ```bash
   git pull origin main --rebase
   ```

2. Ou usar `[skip ci]` em commits:
   ```bash
   git commit -m "chore: update deps [skip ci]"
   ```

### Deploy não foi trigado

**Problema:** Release criada mas deploy não aconteceu.

**Verificar:**

1. Workflow de deploy existe e está habilitado
2. `repository_dispatch` está configurado corretamente
3. Secrets do GitHub estão configurados

**Solução alternativa:**

Trigger manual do deploy:
```bash
gh workflow run deploy-production.yml
```

---

## 📚 Referências

- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
- [Semantic Versioning](https://semver.org/lang/pt-BR/)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Commitizen](https://commitizen-tools.github.io/commitizen/)
- [Keep a Changelog](https://keepachangelog.com/pt-BR/)

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consultar este documento
2. Verificar [Issues do GitHub](https://github.com/Sudo-psc/saraiva-vision-site/issues)
3. Contatar equipe de desenvolvimento

---

**Última atualização:** 2025-10-19  
**Versão do sistema:** 1.0.0
