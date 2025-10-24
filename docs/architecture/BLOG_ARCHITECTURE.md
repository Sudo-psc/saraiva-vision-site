# Arquitetura do Blog - Saraiva Vision

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-24
**Status**: Documentação oficial ✅

## Visão Geral

O blog da Saraiva Vision opera em modo **100% estático** sem CMS (Content Management System) ou WordPress ativo. Todo o conteúdo é bundled no build time para máxima performance e SEO.

## Arquitetura Atual (2025)

### Sistema de Conteúdo Estático

```
┌─────────────────────────────────────────────┐
│  Fonte de Dados: src/data/blogPosts.js     │
│  (JavaScript Objects - Version Controlled)   │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  Build Time Processing                      │
│  - scripts/build-blog-posts.js              │
│  - Vite bundling                            │
│  - Image optimization                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  Production Bundle                          │
│  - Static HTML/JS/CSS                       │
│  - Optimized images (WebP/AVIF)             │
│  - Pre-rendered pages                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│  Nginx serving from:                        │
│  /var/www/saraivavision/current/            │
└─────────────────────────────────────────────┘
```

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

## Comparação: Estático vs WordPress

| Aspecto | Blog Estático (Atual) | WordPress |
|---------|----------------------|-----------|
| **Performance** | Excelente (TTI <2s) | Moderado (TTI 3-5s) |
| **Security** | Alto (sem database) | Médio (requer updates) |
| **Maintenance** | Baixo (Git only) | Alto (updates, plugins) |
| **SEO** | Excelente (pre-render) | Bom (SSR) |
| **Scalability** | Infinito (static files) | Limitado (server resources) |
| **Cost** | Mínimo | Médio/Alto (hosting, backups) |
| **Flexibility** | Alta (código direto) | Média (limitado por plugins) |
| **Content Editing** | Git + Code Editor | GUI (mais fácil para não-dev) |
| **Backup** | Git (automatic) | Manual/Plugin |
| **Rollback** | Instant (git revert) | Complexo (database restore) |

## Histórico: WordPress → Estático

### 2024-08 a 2024-10: Transição
- **Motivo**: Performance, segurança, e manutenção simplificada
- **Migração**: Conteúdo exportado de WordPress para JS objects
- **Status**: WordPress desativado, URL `/wp-admin` redireciona para `/blog`

### Decisões Arquiteturais

1. **Por que não usar Headless CMS?**
   - Volume baixo de posts (< 50 posts/ano)
   - Custo adicional desnecessário
   - Overhead de infraestrutura
   - Git é suficiente para versionamento

2. **Por que não usar Markdown?**
   - JavaScript objects oferecem type safety via TypeScript
   - Melhor integração com código React
   - Validação em build time
   - Structured data mais fácil

3. **Por que não usar Database?**
   - Zero latência de queries
   - Deploy mais simples (apenas arquivos)
   - Backup automático via Git
   - Não precisa de migrations

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

- [Blog Component](/src/modules/blog/pages/BlogPage.jsx)
- [Blog Posts Data](/src/data/blogPosts.js)
- [Build Script](/scripts/build-blog-posts.js)
- [Image Optimization Guide](/docs/performance/IMAGE_OPTIMIZATION.md)
- [SEO Components Guide](/docs/guidelines/SEO_COMPONENTS_GUIDE.md)

---

**Última atualização**: 2025-10-24
**Mantenedor**: Dr. Philipe Saraiva Cruz
**Revisão**: Trimestral ou quando houver mudanças na arquitetura
