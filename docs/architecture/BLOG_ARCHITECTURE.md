# Arquitetura do Blog - Saraiva Vision

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-28
**Status**: Documentação oficial ✅

## Visão Geral

O blog da Saraiva Vision opera em modo **híbrido** combinando Sanity CMS (fonte primária) com fallback estático (garantia de confiabilidade). Esta arquitetura oferece:

- ✅ **100% de uptime** - Fallback automático para conteúdo estático se Sanity falhar
- ⚡ **Performance otimizada** - Leituras via CDN com cache agressivo
- 🔄 **Atualizações sem deploy** - Conteúdo atualizado sem necessidade de redeploy
- 🛡️ **Circuit breaker** - Previne falhas em cascata
- 📊 **Monitoramento integrado** - Health checks e estatísticas de cache

> **Nota**: Para documentação técnica completa da integração Sanity, consulte [SANITY_INTEGRATION_GUIDE.md](./SANITY_INTEGRATION_GUIDE.md)

## Arquitetura Atual (2025)

### Sistema Híbrido: Sanity CMS + Fallback Estático

```
┌─────────────────────────────────────────────┐
│         BlogPage Component                  │
│      (React Router Lazy Loaded)             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│    blogDataService.js (API Principal)        │
│    - Circuit breaker pattern                 │
│    - Cache em memória                        │
│    - Health check tracking                   │
│    - Orquestração de fallback                │
└───────┬──────────────────────┬───────────────┘
        │                      │
  ┌─────▼──────┐        ┌──────▼────────────┐
  │ Sanity CMS │        │ Static Fallback   │
  │ (Primário) │        │ (Confiabilidade)  │
  └─────┬──────┘        └──────┬────────────┘
        │                      │
        │                      │
  ┌─────▼──────┐        ┌──────▼────────────┐
  │ 25 posts   │        │ enhancedBlogPosts │
  │ CDN cache  │        │ Lazy loaded       │
  │ 5s timeout │        │ Always available  │
  └────────────┘        └───────────────────┘
```

### Fluxo de Requisição

1. **Tentativa Sanity** (se circuit breaker permitir):
   - Busca dados via Sanity API
   - Timeout: 5 segundos
   - Retry exponencial (2 tentativas)
   - Cache CDN global

2. **Fallback Automático** (em caso de falha):
   - Carrega posts estáticos
   - Lazy import (só carrega quando necessário)
   - Zero dependência de rede
   - Sempre disponível

## Estrutura de Dados

### Blog Posts (`src/data/blogPosts.js`)

```javascript
export const blogPosts = [
  {
    id: 1,
    slug: "como-ia-transforma-exames-oftalmologicos",
    title: "Como a Inteligência Artificial Está Transformando...",
    excerpt: "Descubra como a IA está revolucionando...",
    content: "Artigo completo em formato markdown/HTML...",
    image: "/Blog/ia-oftalmologia-optimized-1200w.webp",
    author: "Dr. Philipe Saraiva Cruz",
    authorBio: "Oftalmologista CRM-MG 69.870...",
    date: "2025-01-15",
    lastModified: "2025-01-15",
    category: "Tecnologia",
    tags: ["IA", "Inovação", "Diagnóstico"],
    readTime: "8 min",
    featured: true,
    relatedPosts: [2, 3],
    seo: {
      title: "Como a IA Transforma Exames Oftalmológicos | Saraiva Vision",
      description: "Inteligência artificial revoluciona diagnóstico...",
      keywords: "IA oftalmologia, diagnóstico, exames, tecnologia médica"
    }
  },
  // ... mais posts
];
```

### Podcast Episodes (`src/data/podcastEpisodes.js`)

```javascript
export const podcastEpisodes = [
  {
    id: 1,
    slug: "ceratocone-sintomas-tratamento",
    title: "Ceratocone: Sintomas, Diagnóstico e Tratamento",
    description: "Entenda o que é ceratocone...",
    spotifyId: "2OMkCLT6oZlzDC0RqPZAVR",
    publishDate: "2025-01-20",
    duration: "28:45",
    category: "Doenças Oculares",
    season: 1,
    episode: 1,
    transcript: {
      content: "Transcrição completa do episódio...",
      keywords: ["ceratocone", "córnea", "tratamento"],
      topics: ["Diagnóstico", "Sintomas", "Crosslinking"]
    }
  },
  // ... mais episódios
];
```

## Design e UI/UX

### Layout de Blog Posts

O blog utiliza **design horizontal moderno** com cards empilhados verticalmente:

#### Características do Design (2025-10-30)

**LatestBlogPosts** (`src/components/LatestBlogPosts.jsx`):
- 📱 **Layout responsivo**: Horizontal em desktop, vertical em mobile
- 🎨 **Cards empilhados**: Máximo 3 posts recentes em coluna única
- 🎭 **Barra de categoria**: Accent bar colorida à esquerda
- 📊 **Duas colunas**: Excerpt + Learning Points lado a lado
- ✨ **Efeitos de hover**: Scale, glow, e transições suaves
- 🎯 **CTA integrado**: Botão "Ler artigo completo" em destaque

**BlogPage** (`src/modules/blog/pages/BlogPage.jsx`):
- 📚 **Lista completa**: Todos os posts em layout horizontal
- 🔍 **Busca e filtros**: Search bar + category filters
- 📄 **Paginação**: 6 posts por página
- 🎨 **Consistência visual**: Mesmo design do LatestBlogPosts

#### Mapeamento de Cores por Categoria

```javascript
const categoryColors = {
  'Prevenção': 'from-emerald-500 to-teal-500',      // Verde
  'Tratamentos': 'from-blue-500 to-cyan-500',        // Azul
  'Tecnologia': 'from-purple-500 to-indigo-500',     // Roxo
  'Dúvidas Frequentes': 'from-amber-500 to-orange-500', // Laranja
  'default': 'from-gray-500 to-slate-500'            // Cinza
};
```

#### Hierarquia Tipográfica

- **Título**: `text-2xl md:text-3xl lg:text-4xl font-serif` (36-48px)
- **Excerpt**: `text-base md:text-lg` (16-18px)
- **Metadata**: `text-xs` (12px)
- **Learning Points**: `text-sm` (14px)

#### Vantagens do Design Horizontal

- ✅ **Melhor escaneabilidade**: Linha do tempo vertical natural
- ✅ **Mais espaço para conteúdo**: Cards largos permitem mais texto
- ✅ **Destaque para títulos**: Tipografia grande e dominante
- ✅ **Foco no conteúdo**: Menos distrações visuais
- ✅ **Acessibilidade**: Estrutura semântica com roles ARIA

## Fluxo de Build

### 1. Desenvolvimento Local

```bash
# Editar conteúdo
vim src/data/blogPosts.js

# Dev server com hot reload
npm run dev:vite

# Preview no navegador
http://localhost:3002/blog
```

### 2. Build Process

```bash
# Executar build completo
npm run build:vite

# O que acontece:
# 1. scripts/build-blog-posts.js valida estrutura
# 2. Vite compila React + TypeScript
# 3. Tailwind CSS otimizado
# 4. Code splitting automático
# 5. Image optimization (WebP/AVIF)
# 6. scripts/prerender-pages.js gera HTML estático
```

### 3. Deployment

```bash
# Deploy rápido (90% dos casos)
sudo npm run deploy:quick

# Arquivo copiado: dist/ → /var/www/saraivavision/current/
```

## Vantagens da Arquitetura Estática

### Performance
- ⚡ **TTI (Time to Interactive)**: <2s
- ⚡ **LCP (Largest Contentful Paint)**: <2.5s
- ⚡ **Zero database queries**
- ⚡ **CDN-friendly** (todo conteúdo cacheável)

### SEO
- 🔍 **Pre-rendering**: HTML completo disponível para crawlers
- 🔍 **Schema.org**: BlogPosting structured data em cada post
- 🔍 **Meta tags**: Title, description, OG tags otimizados
- 🔍 **Sitemap**: Gerado automaticamente no build

### Segurança
- 🔒 **Zero SQL injection** (sem database)
- 🔒 **Zero XSS via CMS** (sem admin interface)
- 🔒 **Content versioning** via Git
- 🔒 **Auditável**: Todo conteúdo em version control

### Manutenção
- 🛠️ **Git-based workflow**: Pull requests para novos posts
- 🛠️ **Type safety**: TypeScript valida estrutura
- 🛠️ **Automated tests**: Validação de links, imagens, formato
- 🛠️ **No dependencies**: Sem updates de WordPress/plugins

## Comparação: Híbrido vs Estático vs WordPress

| Aspecto | Blog Híbrido (Atual) | Blog Estático | WordPress |
|---------|---------------------|---------------|-----------|
| **Performance** | Excelente (CDN + cache) | Excelente (TTI <2s) | Moderado (TTI 3-5s) |
| **Security** | Alto (API only) | Alto (sem database) | Médio (requer updates) |
| **Maintenance** | Baixo (Sanity managed) | Baixo (Git only) | Alto (updates, plugins) |
| **SEO** | Excelente (pre-render) | Excelente (pre-render) | Bom (SSR) |
| **Scalability** | Infinito (CDN + static) | Infinito (static files) | Limitado (server resources) |
| **Cost** | Baixo (free tier Sanity) | Mínimo | Médio/Alto (hosting, backups) |
| **Flexibility** | Muito Alta (CMS + código) | Alta (código direto) | Média (limitado por plugins) |
| **Content Editing** | Sanity Studio (GUI) | Git + Code Editor | GUI (mais fácil para não-dev) |
| **Backup** | Sanity + Git fallback | Git (automatic) | Manual/Plugin |
| **Rollback** | Instant (Git fallback) | Instant (git revert) | Complexo (database restore) |
| **Uptime** | 100% (fallback garantido) | 100% (static) | 95-99% (server dependent) |
| **Content Updates** | Instant (sem deploy) | Requer deploy | Instant |

## Histórico: WordPress → Estático → Híbrido

### 2024-08 a 2024-10: Transição WordPress → Estático
- **Motivo**: Performance, segurança, e manutenção simplificada
- **Migração**: Conteúdo exportado de WordPress para JS objects
- **Status**: WordPress desativado, URL `/wp-admin` redireciona para `/blog`

### 2025-10-25: Evolução para Sistema Híbrido
- **Motivo**: Flexibilidade de CMS + confiabilidade de estático
- **Implementação**: Sanity CMS como fonte primária
- **Fallback**: Posts estáticos para 100% uptime
- **Status**: 25 posts em Sanity, sistema híbrido em produção

### Decisões Arquiteturais

1. **Por que Sanity CMS agora?**
   - Headless CMS moderno com API robusta
   - Portable Text para conteúdo estruturado
   - CDN global com cache inteligente
   - Mantém fallback estático para confiabilidade
   - Edição de conteúdo sem necessidade de deploy

2. **Por que manter fallback estático?**
   - Garante 100% de disponibilidade (zero downtime)
   - Circuit breaker previne falhas em cascata
   - Custo zero de infraestrutura para fallback
   - Deploy simples (apenas arquivos)
   - Backup automático via Git

3. **Por que não usar apenas Sanity?**
   - Dependência de serviço externo (risco de downtime)
   - Latência de rede pode afetar UX
   - Custo de API requests (embora baixo)
   - Sistema híbrido oferece melhor resiliência

4. **Por que não usar Database tradicional?**
   - Sanity oferece CDN global (melhor que database local)
   - Portable Text mais flexível que HTML/Markdown em DB
   - Sem necessidade de gerenciar infraestrutura
   - Fallback estático elimina risco de database downtime

## Workflow de Publicação

### Adicionar Novo Post

1. **Criar objeto em `src/data/blogPosts.js`**
```javascript
{
  id: getNextId(), // Incremental
  slug: "url-amigavel-do-post",
  title: "Título do Post",
  excerpt: "Resumo de 160 caracteres...",
  content: `
    <p>Conteúdo em HTML ou markdown...</p>
  `,
  image: "/Blog/post-image-optimized-1200w.webp",
  author: "Dr. Philipe Saraiva Cruz",
  date: "2025-10-24",
  category: "Saúde Ocular",
  tags: ["Catarata", "Tratamento"],
  seo: {
    title: "Título SEO (60 chars)",
    description: "Descrição SEO (155 chars)",
    keywords: "palavra1, palavra2, palavra3"
  }
}
```

2. **Otimizar Imagens**
```bash
# Usar script de otimização
npm run optimize:images

# Ou manualmente
cwebp -q 85 image.jpg -o image.webp
avifenc image.jpg image.avif
```

3. **Testar Localmente**
```bash
npm run dev:vite
# Verificar: http://localhost:3002/blog/url-amigavel-do-post
```

4. **Validar Build**
```bash
npm run build:vite
npm run test:cover-images
```

5. **Commit e Deploy**
```bash
git add src/data/blogPosts.js public/Blog/
git commit -m "feat(blog): Adiciona post sobre [assunto]"
git push
sudo npm run deploy:quick
```

### Editar Post Existente

1. **Atualizar campo `lastModified`**
2. **Fazer alterações necessárias**
3. **Seguir passos 3-5 acima**

### Remover Post

1. **Remover objeto de `src/data/blogPosts.js`**
2. **Manter imagem (ou mover para archive)**
3. **Atualizar relatedPosts em outros posts**
4. **Build e deploy**

## SEO e Performance

### Schema.org Markup

Cada post inclui:
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Título do Post",
  "image": "https://saraivavision.com.br/Blog/image.webp",
  "author": {
    "@type": "Person",
    "name": "Dr. Philipe Saraiva Cruz",
    "jobTitle": "Oftalmologista",
    "worksFor": {
      "@type": "MedicalBusiness",
      "name": "Saraiva Vision"
    }
  },
  "datePublished": "2025-10-24",
  "dateModified": "2025-10-24"
}
```

### Image Optimization

```bash
# WebP (suporte amplo, -70% size)
cwebp -q 85 original.jpg -o optimized-1200w.webp

# AVIF (melhor compressão, -90% size)
avifenc --min 20 --max 32 original.jpg optimized-1200w.avif

# Fallback JPEG (legacy browsers)
convert original.jpg -quality 85 -resize 1200x optimized-1200w.jpg
```

### Pre-rendering

`scripts/prerender-pages.js` gera HTML estático para:
- `/` (home)
- `/waitlist`
- Pode ser expandido para `/blog/:slug` (futuro)

## Monitoramento

### Core Web Vitals
- Monitoramento via Google Search Console
- Targets:
  - LCP < 2.5s ✅
  - FID < 100ms ✅
  - CLS < 0.1 ✅

### Analytics
- Google Analytics 4: Pageviews, time on page
- PostHog: Event tracking, user behavior
- Search Console: Impressões, CTR, posição

## Troubleshooting

### Post não aparece no blog
**Causa**: Objeto malformado ou build cache
**Solução**:
```bash
rm -rf dist/ node_modules/.vite/
npm run build:vite
```

### Imagens não carregam
**Causa**: Path incorreto ou formato não otimizado
**Solução**:
- Verificar path: `/Blog/image.webp` (case sensitive)
- Confirmar arquivo em `public/Blog/`
- Rodar `npm run test:cover-images`

### SEO tags incorretas
**Causa**: Falta de validação em seo.title/description
**Solução**: Usar SafeHelmet ou SEOHead que validam automaticamente

### Build falha
**Causa**: Syntax error em blogPosts.js
**Solução**:
```bash
npm run lint
node -c src/data/blogPosts.js
```

## Futuro e Roadmap

### Planejado
- [ ] Adicionar busca client-side com Fuse.js
- [ ] Filtros por categoria e tag
- [ ] Paginação para lista de posts
- [ ] RSS feed gerado no build
- [ ] Newsletter integration (Resend)

### Considerações
- [ ] Avaliar CMS headless se volume > 100 posts/ano
- [ ] Considerar Markdown + Frontmatter se equipe crescer
- [ ] SSG com Next.js ou Astro para blog maior

## Recursos Relacionados

### Documentação Técnica
- **[Sanity Integration Guide](./SANITY_INTEGRATION_GUIDE.md)** - Documentação completa da integração Sanity
- **[Blog No Images Design](/docs/BLOG_NO_IMAGES_DESIGN.md)** - Design sem imagens de capa
- [SEO Components Guide](/docs/guidelines/SEO_COMPONENTS_GUIDE.md)
- [Image Optimization Guide](/docs/performance/IMAGE_OPTIMIZATION.md)

### Código Principal
- [Blog Data Service](/src/services/blogDataService.js) - API principal (USE ESTE)
- [Sanity Blog Service](/src/services/sanityBlogService.js) - Operações Sanity
- [Sanity Client](/src/lib/sanityClient.js) - Cliente universal
- [Blog Component](/src/modules/blog/pages/BlogPage.jsx)
- [React Hooks](/src/hooks/useSanityBlog.js)
- [Portable Text Renderer](/src/components/PortableTextRenderer.jsx)

### Scripts e Testes
- [Integration Test Suite](/scripts/test-sanity-integration.js) - 9 testes
- [Build Script](/scripts/build-blog-posts.js)

### Dados
- [Static Fallback](/src/data/enhancedBlogPosts.js) - Posts estáticos
- [Sanity Export](/src/data/blogPosts.sanity.js) - Export build-time

### Links Externos
- [Sanity Studio](https://saraivavision.sanity.studio) - Editor de conteúdo
- [Sanity Docs](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)

---

**Última atualização**: 2025-10-30
**Mantenedor**: Dr. Philipe Saraiva Cruz
**Versão**: 2.1.0 (Sistema Híbrido + Design Horizontal)
**Revisão**: Trimestral ou quando houver mudanças na arquitetura

### Changelog

**2.1.0** (2025-10-30):
- ✨ Implementado design horizontal para blog post previews
- 🎨 Cards empilhados verticalmente com layout responsivo
- 📊 Duas colunas para excerpt e learning points
- 🎭 Sistema de cores por categoria
- ✨ Efeitos de hover aprimorados
- 📱 Mobile-first design

**2.0.0** (2025-10-28):
- 🔄 Sistema híbrido Sanity CMS + fallback estático
- ⚡ Circuit breaker pattern
- 📊 Cache em memória
- 🎯 100% uptime garantido
