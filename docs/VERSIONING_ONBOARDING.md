# 🎓 Onboarding - Sistema de Versionamento

Guia de integração para desenvolvedores começarem a usar o novo sistema.

---

## 📋 Checklist de Integração

### Para Desenvolvedores

- [ ] Ler este documento completo
- [ ] Ler o [Quick Start](./QUICK_START_VERSIONING.md)
- [ ] Testar `npm run commit` localmente
- [ ] Fazer primeiro commit seguindo Conventional Commits
- [ ] Ver o CHANGELOG.md gerado automaticamente

### Para Reviewers

- [ ] Verificar se PRs seguem Conventional Commits
- [ ] Validar descrições de commits
- [ ] Aprovar releases antes de merge para main

### Para Tech Leads

- [ ] Configurar GitHub Secrets (se ainda não configurado)
- [ ] Habilitar GitHub Actions workflows
- [ ] Configurar proteção de branches
- [ ] Treinar equipe no novo sistema

---

## 🚀 Primeiros Passos

### 1. Instalação Local (Já feito no CI)

As dependências já foram instaladas:

```bash
npm ci
```

### 2. Testar Commitizen

```bash
# Fazer uma alteração de teste
echo "# Test" >> test.txt
git add test.txt

# Usar interface interativa
npm run commit

# Seguir prompts:
# - Tipo: chore
# - Escopo: (deixar vazio)
# - Descrição: test commitizen setup
# - Resto: (deixar vazio)

# Desfazer (não fazer push)
git reset HEAD~1
rm test.txt
```

### 3. Entender o Fluxo

```
Desenvolvedor → Commit → Push → GitHub Actions → Release → Deploy
```

---

## 📝 Conventional Commits 101

### Estrutura Básica

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional]

[rodapé opcional]
```

### Tipos Mais Usados

| Tipo | Quando Usar | Exemplo |
|------|-------------|---------|
| `feat` | Nova funcionalidade | `feat(blog): adicionar busca` |
| `fix` | Correção de bug | `fix(api): corrigir timeout` |
| `docs` | Documentação | `docs: atualizar README` |
| `refactor` | Refatoração | `refactor(auth): simplificar lógica` |
| `perf` | Performance | `perf(images): lazy loading` |
| `test` | Testes | `test(login): adicionar testes` |

### Exemplos Reais

```bash
# ✅ BOM
feat(contact): adicionar validação de telefone
fix(blog): corrigir paginação de posts
docs: atualizar guia de deployment
perf(images): implementar WebP

# ❌ RUIM
add feature
fixed bug
update
changes
```

---

## 🎯 Workflows de Uso

### Workflow 1: Feature Simples

```bash
# 1. Criar branch
git checkout -b feature/minha-feature

# 2. Desenvolver e commitar
git add src/components/NovoComponente.jsx
npm run commit
# Tipo: feat
# Escopo: components
# Descrição: adicionar NovoComponente

# 3. Push e PR
git push origin feature/minha-feature
# Criar PR no GitHub para develop

# 4. Após merge, release automática é criada
```

### Workflow 2: Hotfix

```bash
# 1. Branch de hotfix
git checkout main
git checkout -b hotfix/correcao-critica

# 2. Corrigir e commitar
git add src/utils/validation.js
git commit -m "fix(validation): corrigir regex de email"

# 3. PR direto para main
git push origin hotfix/correcao-critica
# Criar PR para main

# 4. Após merge, release e deploy imediatos
```

### Workflow 3: Múltiplos Commits

```bash
# Commit 1: Estrutura
git add src/components/SearchBar.jsx
git commit -m "feat(search): adicionar componente SearchBar"

# Commit 2: Lógica
git add src/services/searchService.js
git commit -m "feat(search): implementar lógica de busca"

# Commit 3: Testes
git add src/__tests__/search.test.js
git commit -m "test(search): adicionar testes unitários"

# Push todos de uma vez
git push origin feature/search-system
```

---

## 🔍 Validação e Preview

### Antes de Commitar

```bash
# Ver o que vai ser commitado
git status
git diff

# Validar mensagem antes de commitar
npm run validate:commit "feat(blog): minha feature"
```

### Antes de Push

```bash
# Ver últimos commits
git log --oneline -5

# Ver preview da próxima versão (se em main/develop)
npm run version:preview

# Testar release localmente (dry run)
npm run release:dry
```

### Depois do Push

```bash
# Ver GitHub Actions
gh run list --limit 5

# Ver última release
gh release view

# Ver CHANGELOG
cat CHANGELOG.md | head -50
```

---

## ❌ Erros Comuns e Soluções

### Erro 1: Commit Rejeitado (Validação)

**Erro:**
```
❌ Mensagem de commit não segue Conventional Commits!
```

**Solução:**
```bash
# Corrigir último commit
git commit --amend -m "feat(blog): mensagem correta"
```

### Erro 2: Release Não Criada

**Problema:** Push para main mas nenhuma release apareceu.

**Causa:** Commits não geram versão (docs, test, chore)

**Solução:**
```bash
# Verificar tipo de commits
git log --oneline -5

# Fazer commit que gera versão
git commit -m "fix(api): corrigir endpoint"
```

### Erro 3: Conflito no CHANGELOG

**Problema:** Merge conflict no CHANGELOG.md

**Solução:**
```bash
# CHANGELOG é gerado automaticamente, pode descartar
git checkout --theirs CHANGELOG.md
# ou
git checkout --ours CHANGELOG.md

# Continuar merge
git add CHANGELOG.md
git commit
```

---

## 🎓 Exercícios Práticos

### Exercício 1: Primeiro Commit

```bash
# 1. Criar arquivo de teste
echo "# Teste" > docs/teste.md

# 2. Usar commitizen
git add docs/teste.md
npm run commit

# 3. Selecionar:
#    - Tipo: docs
#    - Descrição: adicionar arquivo de teste
#    - Resto: vazio

# 4. Verificar commit
git log -1

# 5. Limpar
git reset HEAD~1
rm docs/teste.md
```

### Exercício 2: Validação de Mensagens

```bash
# Testar mensagens válidas
npm run validate:commit "feat(blog): nova feature"
npm run validate:commit "fix: corrigir bug"
npm run validate:commit "docs: atualizar guia"

# Testar mensagens inválidas
npm run validate:commit "update code"
npm run validate:commit "fix stuff"
```

### Exercício 3: Preview de Versão

```bash
# Ver versão atual
cat package.json | grep version

# Ver preview (se houver commits)
npm run version:preview

# Ver últimas releases
git tag -l | tail -5
```

---

## 📚 Recursos de Aprendizado

### Documentação

1. **Básico:**
   - [Quick Start](./QUICK_START_VERSIONING.md) - 5 min de leitura

2. **Intermediário:**
   - [Exemplos Práticos](./VERSIONING_EXAMPLES.md) - 10 cenários reais

3. **Avançado:**
   - [Documentação Completa](./VERSIONING.md) - Referência técnica

### Links Externos

- [Conventional Commits](https://www.conventionalcommits.org/pt-br/) - Especificação oficial
- [Semantic Versioning](https://semver.org/lang/pt-BR/) - Guia de versionamento
- [Keep a Changelog](https://keepachangelog.com/pt-BR/) - Boas práticas

### Vídeos (Criar internamente)

- [ ] Vídeo: "Introdução ao Commitizen" (5 min)
- [ ] Vídeo: "Fluxo completo: Commit → Release → Deploy" (10 min)
- [ ] Vídeo: "Troubleshooting comum" (7 min)

---

## 🤝 Convenções da Equipe

### Escopos Sugeridos

Use escopos consistentes para organização:

- `blog` - Funcionalidades do blog
- `contact` - Formulário de contato
- `api` - Backend/API
- `auth` - Autenticação
- `ui` - Componentes de UI
- `images` - Otimização de imagens
- `seo` - SEO e meta tags
- `analytics` - Analytics e tracking
- `deploy` - Scripts de deploy
- `ci` - CI/CD

### Descrições

- ✅ Imperativo: "adicionar", "corrigir", "implementar"
- ❌ Passado: "adicionou", "corrigiu"
- ✅ Minúsculas: "adicionar feature"
- ❌ Maiúsculas: "Adicionar Feature"
- ✅ Sem ponto final: "adicionar feature"
- ❌ Com ponto: "adicionar feature."

---

## 📞 Suporte

### Dúvidas?

1. Consultar [Quick Start](./QUICK_START_VERSIONING.md)
2. Ver [Exemplos Práticos](./VERSIONING_EXAMPLES.md)
3. Ler [FAQ](#faq-perguntas-frequentes)
4. Abrir issue no GitHub

### FAQ: Perguntas Frequentes

**Q: Preciso usar `npm run commit` sempre?**
A: Não é obrigatório, mas é fortemente recomendado para garantir o padrão.

**Q: Posso fazer merge de PRs sem Conventional Commits?**
A: Tecnicamente sim, mas não gerará release. Melhor seguir o padrão.

**Q: Como faço breaking changes?**
A: Adicione `!` após o tipo: `feat(api)!: mudança incompatível`

**Q: E se eu errar um commit?**
A: Use `git commit --amend` antes do push, ou faça um novo commit corrigindo.

**Q: Posso pular o versionamento em commits específicos?**
A: Sim, adicione `[skip ci]` na mensagem: `docs: update [skip ci]`

---

## ✅ Próximos Passos

Após completar este onboarding:

1. ✅ Fazer primeiro commit real usando `npm run commit`
2. ✅ Acompanhar release no GitHub Actions
3. ✅ Ver CHANGELOG.md atualizado
4. ✅ Compartilhar feedback com a equipe
5. ✅ Ajudar colegas no processo

---

**Bem-vindo ao novo sistema de versionamento! 🎉**

**Versão deste guia:** 1.0.0  
**Última atualização:** 2025-10-19
