# Migração do Parser de Markdown: Eliminação de Buffer no Cliente

## 📋 Resumo Executivo

**Problema**: O parser `gray-matter` usava a API `Buffer` do Node.js no navegador, causando `ReferenceError: Can't find variable: Buffer`.

**Solução Implementada**: Build-time processing - processar Markdown em **Node.js durante o build**, gerar JSON estático, e consumir no navegador.

**Resultado**: Bundle 100% browser-safe, sem dependências de Node.js no runtime do cliente.

---

## 🔍 Diagnóstico da Causa Raiz

### Problema Identificado

```
[Error] ReferenceError: Can't find variable: Buffer
  toFile — vendor-misc-CHDNhPXk.js:66:927
  nt — vendor-misc-CHDNhPXk.js:66:1929
  y — index-CYQ-uNuX.js:2769:1640
```

### Causa Raiz

1. **`src/content/blog/index.js`** importava `gray-matter` e `marked` para processar arquivos `.md` **no navegador**
2. `gray-matter@4.0.3` usa internamente `js-yaml` que depende de `Buffer.from()` (API Node.js)
3. Vite **não fornece polyfills automáticos** de Node.js por padrão (diferente do Webpack 4)
4. Resultado: Bundle tentava acessar `Buffer` no runtime do navegador → **crash**

### Arquivos Afetados (Antes da Correção)

- `src/content/blog/index.js:7` → `import matter from 'gray-matter'`
- `src/content/blog/index.js:47` → `matter(content)` executado no navegador
- Dependências Node: `gray-matter` → `js-yaml` → `Buffer.from()`

---

## ✅ Solução Implementada

### Estratégia: Build-Time Processing

**Princípio**: Processar Markdown em **Node.js durante o build**, eliminar completamente `Buffer` do bundle do navegador.

### Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  .md files      │ --> │  build-blog-     │ --> │  posts.json     │
│  (frontmatter   │     │  posts.js        │     │  (static JSON)  │
│  + markdown)    │     │  (Node.js)       │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │  Browser        │
                                                  │  (import JSON)  │
                                                  └─────────────────┘
```

### Componentes Criados

#### 1. `scripts/build-blog-posts.js` (Node.js)

**Função**: Processar todos `.md` files em build-time:
- Ler arquivos `.md` do filesystem (Node.js `fs`)
- Corrigir automaticamente sintaxe YAML inválida no frontmatter
- Parsear frontmatter + conteúdo Markdown usando `gray-matter` (Node.js only)
- Converter Markdown → HTML usando `marked`
- Gerar `src/content/blog/posts.json` (JSON estático)

**Execução**: `node scripts/build-blog-posts.js` (roda automaticamente no `npm run build`)

#### 2. `src/content/blog/index.js` (Refatorado - Browser-Safe)

**Antes** (❌ Browser quebrava):
```javascript
import matter from 'gray-matter'; // Node.js dependency
import { marked } from 'marked';

function loadPosts() {
  const posts = import.meta.glob('./*.md', { eager: true, as: 'raw' });

  for (const [filepath, content] of Object.entries(posts)) {
    const { data, content: markdownContent } = matter(content); // Buffer error!
    const htmlContent = markdownToHtml(markdownContent);
    // ...
  }
}
```

**Depois** (✅ Browser-safe):
```javascript
import postsData from './posts.json'; // Pure JSON import

export const blogPosts = postsData; // No processing, just import
```

**Mudança-chave**: Nenhum código Node.js executa no navegador.

---

## 📦 Arquivos Modificados

### Novos Arquivos

1. **`scripts/build-blog-posts.js`**
   Build-time processor (Node.js only)

2. **`src/content/blog/posts.json`** (gerado automaticamente)
   Output estático, importado pelo navegador

### Arquivos Modificados

1. **`src/content/blog/index.js`**
   Refatorado para importar JSON ao invés de processar Markdown

2. **`package.json`**
   Adicionados scripts:
   ```json
   {
     "prebuild": "node scripts/build-blog-posts.js",
     "build:blog": "node scripts/build-blog-posts.js"
   }
   ```

3. **`.gitignore`**
   Adicionado: `src/content/blog/posts.json` (gerado automaticamente)

---

## 🚀 Como Usar

### Build Automático

```bash
npm run build
```

O script `prebuild` executa automaticamente antes do build do Vite.

### Build Manual de Posts

```bash
npm run build:blog
```

Útil para regenerar posts sem rebuild completo da aplicação.

### Adicionar Novo Post

1. Criar `src/content/blog/novo-post.md` com frontmatter YAML:
   ```yaml
   ---
   id: 25
   slug: novo-post
   title: "Título do Post: Com Caracteres Especiais"
   excerpt: "Descrição curta"
   author: Dr. Philipe Saraiva Cruz
   date: 2025-10-01
   category: Prevenção
   tags:
     - tag1
     - tag2
   image: /Blog/imagem.png
   featured: false
   ---
   ```

2. Escrever conteúdo Markdown após o frontmatter

3. Executar `npm run build:blog` (ou apenas `npm run build`)

4. O arquivo `posts.json` será atualizado automaticamente

### Limitações e Considerações

1. **Edição de Posts**: Requer rebuild do JSON (`npm run build:blog`)
2. **Hot Reload**: Mudanças em `.md` não são detectadas automaticamente em `dev` mode
3. **Tamanho do Bundle**: `posts.json` (199KB) é incluído no bundle inicial
4. **Frontmatter YAML**: Valores com caracteres especiais (`:`, `|`, `@`) devem estar entre aspas

---

## 🔧 Troubleshooting

### Erro: "posts.json not found"

**Solução**: Execute `npm run build:blog` antes de `npm run dev` ou `npm run build`

### Erro: "YAML parsing error"

**Causa**: Frontmatter com sintaxe inválida (geralmente valores não quotados com `:`)

**Solução Automática**: O script corrige automaticamente, mas verifique o console output

**Solução Manual**: Adicione aspas em valores com caracteres especiais:
```yaml
# ❌ Errado
title: Post: Subtítulo

# ✅ Correto
title: "Post: Subtítulo"
```

### Posts não aparecem no navegador

1. Verificar se `posts.json` existe: `ls -lh src/content/blog/posts.json`
2. Verificar se o build incluiu o JSON: `npm run build` (deve aparecer no output do Vite)
3. Limpar cache: `rm -rf node_modules/.vite dist/ && npm run build`

---

## 🎯 Validação da Correção

### Testes Realizados

1. ✅ Build completo sem erros
   `npm run build` → Sucesso (22 posts processados)

2. ✅ Nenhuma referência a `gray-matter` no bundle
   `grep -r "gray-matter" dist/assets/*.js` → 0 resultados

3. ✅ `Buffer` não existe no bundle client
   Única ocorrência é no React Router (código legítimo, não API Node.js)

4. ✅ Bundle size: 250MB dist/ (normal para assets + prerender)

5. ✅ `posts.json` gerado: 199KB (22 posts)

### Comandos de Validação

```bash
# Build completo
npm run build

# Verificar ausência de Node.js dependencies no bundle
grep -r "gray-matter\|js-yaml" dist/assets/*.js

# Verificar tamanho do posts.json
ls -lh src/content/blog/posts.json

# Testar em produção
npm run preview
```

---

## 📚 Referências

- **Vite Documentation**: https://vitejs.dev/guide/features.html#json
- **Gray-matter**: https://github.com/jonschlinkert/gray-matter
- **Marked**: https://marked.js.org/
- **Issue Original**: ReferenceError: Can't find variable: Buffer (resolvido)

---

## 📋 Checklist de Migração

- [x] Script build-time criado (`build-blog-posts.js`)
- [x] `src/content/blog/index.js` refatorado (browser-safe)
- [x] `package.json` atualizado com scripts `prebuild` e `build:blog`
- [x] `.gitignore` atualizado (`posts.json` excluded)
- [x] Build testado e validado (22 posts processados)
- [x] Bundle verificado (sem `gray-matter`, sem `Buffer` API)
- [x] Documentação criada (`MARKDOWN_PARSER_MIGRATION.md`)
- [x] Guia de uso documentado (adicionar novos posts)
- [x] Troubleshooting documentado

---

**Status**: ✅ **Migração Completa e Validada**
**Data**: 2025-10-01
**Breaking Changes**: Nenhum (API pública do `blogPosts` permanece idêntica)
