# 🚀 Quick Start - Sistema de Versionamento

Guia rápido para começar a usar o sistema de versionamento automático.

## 📦 Instalação (Já feito)

O sistema já está configurado! Basta começar a usar.

## 🎯 Uso Diário

### 1. Fazer um Commit Padronizado

**Opção 1: Usar Commitizen (Recomendado)**

```bash
# Adicionar arquivos
git add .

# Usar interface interativa
npm run commit
```

Siga os prompts:
1. **Tipo**: Selecione o tipo (feat, fix, docs, etc)
2. **Escopo**: Digite o escopo (opcional) - ex: "blog", "api", "contact"
3. **Descrição**: Digite uma descrição curta (imperativo)
4. **Descrição longa**: Adicione mais detalhes (opcional)
5. **Breaking changes**: Informe se há mudanças incompatíveis
6. **Issues**: Referencie issues se relevante

**Opção 2: Commit Manual**

```bash
git commit -m "feat(blog): adicionar sistema de comentários"
```

### 2. Push para GitHub

```bash
# Para Beta (pré-release)
git push origin develop

# Para Production (release estável)
git push origin main
```

### 3. Aguardar Automação

O GitHub Actions irá:
- ✅ Analisar seus commits
- ✅ Determinar a nova versão
- ✅ Atualizar package.json
- ✅ Gerar/atualizar CHANGELOG.md
- ✅ Criar tag git
- ✅ Publicar release no GitHub
- ✅ Triggear deploy automático
- ✅ Notificar equipe

## 📊 Tipos de Commit e Impacto na Versão

| Commit | Versão Atual | Nova Versão | Tipo |
|--------|--------------|-------------|------|
| `feat: nova feature` | 1.2.3 | 1.3.0 | MINOR |
| `fix: corrigir bug` | 1.2.3 | 1.2.4 | PATCH |
| `perf: melhorar performance` | 1.2.3 | 1.2.4 | PATCH |
| `feat!: breaking change` | 1.2.3 | 2.0.0 | MAJOR |
| `docs: atualizar docs` | 1.2.3 | 1.2.3 | - |

## 🎨 Exemplos Práticos

### Adicionar Nova Feature

```bash
git add src/components/SearchBar.jsx
npm run commit

# Selecionar: feat
# Escopo: search
# Descrição: adicionar barra de busca no blog
git push origin develop  # Para beta
```

Resultado: `1.2.3` → `1.3.0-beta.1`

### Corrigir Bug

```bash
git add src/utils/validation.js
npm run commit

# Selecionar: fix
# Escopo: validation
# Descrição: corrigir validação de email
git push origin main  # Para production
```

Resultado: `1.2.3` → `1.2.4`

### Breaking Change

```bash
git add src/api/auth.js
git commit -m "feat(api)!: migrar para OAuth2

BREAKING CHANGE: API agora requer OAuth2. Tokens antigos não funcionam mais."
git push origin main
```

Resultado: `1.2.3` → `2.0.0`

### Atualizar Documentação (Sem Versão)

```bash
git add README.md
npm run commit

# Selecionar: docs
# Descrição: atualizar instruções de deploy
git push origin develop
```

Resultado: `1.2.3` → `1.2.3` (sem mudança)

## 🔍 Verificar Versão Atual

```bash
# Ver versão no package.json
cat package.json | grep version

# Ver última tag
git describe --tags --abbrev=0

# Ver todas as tags
git tag -l

# Ver releases no GitHub
gh release list
```

## 📝 Ver CHANGELOG

```bash
# Localmente
cat CHANGELOG.md

# No GitHub
open https://github.com/Sudo-psc/saraiva-vision-site/blob/main/CHANGELOG.md

# Ver releases
open https://github.com/Sudo-psc/saraiva-vision-site/releases
```

## 🧪 Testar Antes de Publicar (Dry Run)

```bash
# Ver qual versão seria gerada SEM publicar
npm run release:dry
```

Útil para:
- Verificar se commits estão corretos
- Confirmar qual versão será gerada
- Testar configuração

## 🚨 Comandos Úteis

```bash
# Verificar últimos commits
git --no-pager log --oneline -10

# Ver diferença entre branches
git --no-pager diff main..develop

# Ver status do repositório
git status

# Desfazer último commit (mantendo alterações)
git reset --soft HEAD~1

# Ver histórico de releases
git tag -l --sort=-version:refname | head -10

# Ver detalhes de uma release
git show v1.2.3
```

## ❌ O Que NÃO Fazer

❌ Não editar manualmente package.json (versão)  
❌ Não editar manualmente CHANGELOG.md  
❌ Não criar tags manualmente  
❌ Não usar mensagens de commit genéricas ("fix", "update")  
❌ Não fazer force push em main/develop  
❌ Não pular a convenção de commits  

## ✅ Boas Práticas

✅ Use `npm run commit` sempre que possível  
✅ Escreva descrições claras e concisas  
✅ Use escopos para organizar commits  
✅ Indique breaking changes explicitamente  
✅ Teste em develop antes de merge para main  
✅ Revise o CHANGELOG após cada release  
✅ Monitore os GitHub Actions  

## 🆘 Troubleshooting Rápido

### Release não foi criada

```bash
# Verificar se commits seguem convenção
git --no-pager log --oneline -5

# Testar localmente
npm run release:dry
```

### Versão não mudou

Provável causa: Commits do tipo `docs`, `style`, `test`, `chore` não geram versão.

Solução: Fazer commit do tipo `feat`, `fix`, `perf` ou `refactor`.

### Conflito no push

```bash
# Pull com rebase
git pull origin main --rebase

# Resolver conflitos
# Continuar rebase
git rebase --continue

# Push
git push origin main
```

## 📚 Documentação Completa

Para mais detalhes, consulte:

- [docs/VERSIONING.md](./VERSIONING.md) - Documentação completa
- [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
- [Semantic Versioning](https://semver.org/lang/pt-BR/)

## 📞 Ajuda

Problemas? Consulte a equipe de desenvolvimento ou abra uma issue.

---

**Versão:** 1.0.0  
**Última atualização:** 2025-10-19
