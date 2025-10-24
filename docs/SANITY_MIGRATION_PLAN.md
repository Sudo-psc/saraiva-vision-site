# Plano de Migração do Blog para Sanity.io

## 📋 Sumário Executivo

Este documento detalha o plano completo para migração do blog da Clínica Saraiva Vision do modelo estático atual (arquivos JavaScript) para o Sanity.io, um CMS headless moderno.

**Status Atual:**
- 32 posts de blog armazenados em `src/data/blogPosts.js` (934 linhas)
- Conteúdo 100% estático, sem CMS
- Imagens otimizadas em `public/Blog/` (WebP/AVIF)
- Build estático com Vite para máxima performance

**Objetivo da Migração:**
- Facilitar gestão de conteúdo para equipe não-técnica
- Permitir atualizações de blog sem deploy de código
- Manter compliance CFM/LGPD
- Preservar SEO e performance existentes
- Adicionar capacidades de preview, versionamento e workflow editorial

## 🎯 Benefícios da Migração para Sanity.io

### Para a Equipe de Conteúdo
- ✅ Interface visual intuitiva para criação e edição de posts
- ✅ Preview em tempo real antes da publicação
- ✅ Versionamento completo com histórico de mudanças
- ✅ Agendamento de publicações
- ✅ Fluxo de aprovação (draft → review → published)
- ✅ Gestão de imagens com upload direto e otimização automática
- ✅ Editor rico com suporte a markdown e blocos customizados

### Para Desenvolvedores
- ✅ API GraphQL e REST para consulta de dados
- ✅ TypeScript auto-gerado dos schemas
- ✅ CDN global (Sanity CDN) para delivery rápido
- ✅ Webhooks para invalidação de cache
- ✅ Schema versionado com migrações
- ✅ Ambiente local de desenvolvimento
- ✅ Backup automático e point-in-time recovery

### Para o Negócio
- ✅ Redução de dependência técnica para updates de conteúdo
- ✅ Colaboração multi-usuário com permissões granulares
- ✅ Conformidade LGPD com controle de dados
- ✅ Analytics de conteúdo integrado
- ✅ Escalabilidade para crescimento futuro

## 📊 Análise da Estrutura Atual

### Modelo de Dados Atual (blogPosts.js)

```javascript
{
  id: number,
  slug: string,
  title: string,
  excerpt: string,
  content: string (HTML),
  author: string,
  date: string (ISO 8601),
  category: string,
  tags: string[],
  image: string (path),
  featured: boolean,
  seo: {
    metaTitle: string,
    metaDescription: string,
    keywords: string[]
  },
  relatedPodcasts: array (optional)
}
```

### Volumetria Atual
- **Total de posts:** 32
- **Categorias identificadas:** 
  - "Dúvidas Frequentes"
  - "Tratamento"
  - (outras a serem catalogadas)
- **Tags:** Variadas por post
- **Imagens:** Todas otimizadas WebP 1200w
- **Conteúdo:** HTML rico com tabelas, listas, callouts
- **Autor principal:** Dr. Philipe Saraiva Cruz (CRM-MG 69.870)

### Componentes Afetados

**Frontend (React):**
- `src/data/blogPosts.js` - Dados estáticos (será substituído)
- `src/data/blogPostsLoader.js` - Loader de posts
- `src/data/blogPostsEnrichment.js` - Enriquecimento de dados
- `src/data/enhancedBlogPosts.js` - Posts processados
- `src/components/blog/BlogPostLayout.jsx` - Layout de post
- `src/components/blog/BlogSEO.jsx` - SEO meta tags
- `src/lib/blogSchemaMarkup.js` - Schema.org markup
- `src/modules/blog/pages/BlogPage.jsx` - Página principal do blog

**Backend (API):**
- `api/src/lib/blogPosts.js` - API de blog posts (se existir)

## 🏗️ Arquitetura Proposta

### Opção 1: Sanity.io com Build-Time Data Fetching (Recomendado)

```
┌─────────────────────────────────────────────────────────────┐
│                      Sanity Studio                          │
│              (studio.sanity.io ou self-hosted)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ - Criação de posts                                    │  │
│  │ - Upload de imagens                                   │  │
│  │ - Preview em tempo real                               │  │
│  │ - Workflow editorial (draft/published)                │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Sanity Content Lake │
            │   (sanity.io dataset) │
            └───────────┬───────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
  ┌───────────────┐          ┌────────────────┐
  │  Build Time   │          │   Runtime      │
  │  (Vite Build) │          │   (Opcional)   │
  └───────┬───────┘          └────────┬───────┘
          │                           │
          ▼                           ▼
  fetch posts via              On-demand ISR
  Sanity API                   ou Client fetch
          │                           │
          ▼                           │
  Generate static                     │
  pages to dist/                      │
          │                           │
          └────────────┬──────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  Nginx Server  │
              │ Static + Proxy │
              └────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │   Production   │
              │   saraivavision│
              └────────────────┘
```

**Vantagens:**
- ✅ Mantém performance de site estático atual
- ✅ SEO otimizado (conteúdo no HTML inicial)
- ✅ Sem dependência runtime do Sanity (resiliente)
- ✅ Custos menores (menos API calls)
- ✅ Compatible com arquitetura Vite existente

**Desvantagens:**
- ⚠️ Requer rebuild para ver mudanças no site
- ⚠️ Setup de webhooks para trigger builds

### Opção 2: Sanity.io com Runtime Fetching (Híbrido)

```
Frontend (Runtime) ──→ Cache Layer (Redis) ──→ Sanity API
                              ↓
                    Fallback to cached data
```

**Vantagens:**
- ✅ Conteúdo atualiza sem rebuild
- ✅ Preview de posts draft para autorizados
- ✅ Mais flexível para A/B testing

**Desvantagens:**
- ⚠️ Maior complexidade
- ⚠️ Dependência runtime do Sanity
- ⚠️ Custos maiores de API
- ⚠️ Necessita SSR ou client-side fetch (impacto SEO)

### **Recomendação: Opção 1 (Build-Time) com Webhooks**

Para o caso da Saraiva Vision, a Opção 1 é ideal porque:
1. Mantém a performance e SEO atuais
2. Posts médicos não mudam frequentemente (não precisa update instantâneo)
3. Alinha com stack Vite estático existente
4. Custos otimizados

**Adição sugerida:** Sistema de webhook para trigger automático de rebuild quando post é publicado/editado no Sanity.

## 📐 Schema Sanity.io Proposto

### Document Type: `blogPost`

```javascript
// schemas/blogPost.js
export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Conteúdo', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'metadata', title: 'Metadados' },
    { name: 'medical', title: 'Compliance Médico' }
  ],
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required().max(100),
      group: 'content'
    },
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: input => input
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      },
      validation: Rule => Rule.required(),
      group: 'content'
    },
    {
      name: 'excerpt',
      title: 'Resumo',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required().max(300),
      group: 'content'
    },
    {
      name: 'content',
      title: 'Conteúdo',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text (Acessibilidade)',
              validation: Rule => Rule.required()
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Legenda'
            }
          ]
        },
        {
          type: 'object',
          name: 'callout',
          title: 'Callout',
          fields: [
            {
              name: 'type',
              type: 'string',
              options: {
                list: ['info', 'warning', 'success', 'error']
              }
            },
            { name: 'title', type: 'string' },
            { name: 'content', type: 'text' }
          ]
        },
        {
          type: 'object',
          name: 'table',
          title: 'Tabela',
          fields: [
            { name: 'caption', type: 'string' },
            {
              name: 'rows',
              type: 'array',
              of: [{
                type: 'object',
                fields: [
                  {
                    name: 'cells',
                    type: 'array',
                    of: [{ type: 'string' }]
                  }
                ]
              }]
            }
          ]
        }
      ],
      group: 'content'
    },
    {
      name: 'featuredImage',
      title: 'Imagem de Capa',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette']
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          validation: Rule => Rule.required()
        }
      ],
      validation: Rule => Rule.required(),
      group: 'content'
    },
    {
      name: 'category',
      title: 'Categoria',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: Rule => Rule.required(),
      group: 'metadata'
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      },
      group: 'metadata'
    },
    {
      name: 'author',
      title: 'Autor',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: Rule => Rule.required(),
      group: 'metadata'
    },
    {
      name: 'publishedAt',
      title: 'Data de Publicação',
      type: 'datetime',
      validation: Rule => Rule.required(),
      group: 'metadata'
    },
    {
      name: 'featured',
      title: 'Post em Destaque',
      type: 'boolean',
      initialValue: false,
      group: 'metadata'
    },
    {
      name: 'seoTitle',
      title: 'Meta Title',
      type: 'string',
      validation: Rule => Rule.max(60),
      group: 'seo'
    },
    {
      name: 'seoDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.max(160),
      group: 'seo'
    },
    {
      name: 'seoKeywords',
      title: 'Keywords (SEO)',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      group: 'seo'
    },
    {
      name: 'relatedPodcasts',
      title: 'Podcasts Relacionados',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'podcastEpisode' }] }],
      group: 'metadata'
    },
    {
      name: 'cfmCompliant',
      title: 'Revisado CFM',
      type: 'boolean',
      description: 'Post revisado conforme diretrizes CFM',
      initialValue: false,
      group: 'medical'
    },
    {
      name: 'medicalReviewDate',
      title: 'Data da Revisão Médica',
      type: 'date',
      group: 'medical'
    },
    {
      name: 'medicalReviewer',
      title: 'Revisor Médico',
      type: 'reference',
      to: [{ type: 'author' }],
      group: 'medical'
    },
    {
      name: 'medicalDisclaimer',
      title: 'Disclaimer Médico Customizado',
      type: 'text',
      rows: 2,
      group: 'medical'
    }
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'featuredImage',
      publishedAt: 'publishedAt'
    },
    prepare(selection) {
      const { author, publishedAt } = selection
      return {
        ...selection,
        subtitle: `${author} - ${new Date(publishedAt).toLocaleDateString('pt-BR')}`
      }
    }
  },
  orderings: [
    {
      title: 'Data de Publicação (Mais Recente)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }]
    },
    {
      title: 'Título A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }]
    }
  ]
}
```

### Document Type: `category`

```javascript
// schemas/category.js
export default {
  name: 'category',
  title: 'Categoria',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Descrição',
      type: 'text'
    }
  ]
}
```

### Document Type: `author`

```javascript
// schemas/author.js
export default {
  name: 'author',
  title: 'Autor',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nome',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'crm',
      title: 'CRM',
      type: 'string',
      description: 'Registro profissional (ex: CRM-MG 69.870)'
    },
    {
      name: 'bio',
      title: 'Biografia',
      type: 'text'
    },
    {
      name: 'image',
      title: 'Foto',
      type: 'image',
      options: { hotspot: true }
    }
  ]
}
```

## 🔄 Estratégia de Migração de Dados

### Fase 1: Setup e Preparação

**1.1 Criar Projeto Sanity**
```bash
npm create sanity@latest -- --project saraiva-vision --dataset production
```

**1.2 Configurar Schemas**
- Criar schemas conforme especificado acima
- Adicionar validações personalizadas
- Configurar preview customizado

**1.3 Desenvolver Script de Migração**

```javascript
// scripts/migrate-to-sanity.js
import { createClient } from '@sanity/client'
import { blogPosts } from '../src/data/blogPosts.js'
import { parse } from 'node-html-parser'
import fs from 'fs'

const client = createClient({
  projectId: 'YOUR_PROJECT_ID',
  dataset: 'production',
  token: process.env.SANITY_WRITE_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false
})

async function migratePost(post) {
  // 1. Upload imagem de capa
  const imageAsset = await uploadImage(post.image)
  
  // 2. Converter HTML para Portable Text (Sanity blocks)
  const portableText = htmlToPortableText(post.content)
  
  // 3. Criar/buscar autor
  const author = await getOrCreateAuthor(post.author)
  
  // 4. Criar/buscar categoria
  const category = await getOrCreateCategory(post.category)
  
  // 5. Criar documento
  const doc = {
    _type: 'blogPost',
    title: post.title,
    slug: { current: post.slug },
    excerpt: post.excerpt,
    content: portableText,
    featuredImage: {
      _type: 'image',
      asset: { _ref: imageAsset._id },
      alt: post.seo.metaDescription
    },
    category: { _ref: category._id },
    tags: post.tags,
    author: { _ref: author._id },
    publishedAt: new Date(post.date).toISOString(),
    featured: post.featured,
    seoTitle: post.seo.metaTitle,
    seoDescription: post.seo.metaDescription,
    seoKeywords: post.seo.keywords,
    cfmCompliant: true,
    medicalReviewDate: post.date
  }
  
  return await client.create(doc)
}

function htmlToPortableText(html) {
  // Usar biblioteca como @sanity/block-tools ou custom parser
  // para converter HTML em Portable Text
  const root = parse(html)
  
  // Implementar lógica de conversão
  // HTML headings → block type 'heading'
  // HTML paragraphs → block type 'normal'
  // HTML images → image blocks
  // HTML tables → custom table blocks
  
  return portableTextBlocks
}

async function uploadImage(imagePath) {
  const filePath = `./public${imagePath}`
  const buffer = fs.readFileSync(filePath)
  return await client.assets.upload('image', buffer, {
    filename: imagePath.split('/').pop()
  })
}

// Executar migração
async function runMigration() {
  console.log(`Migrando ${blogPosts.length} posts...`)
  
  for (const post of blogPosts) {
    try {
      const result = await migratePost(post)
      console.log(`✓ Migrado: ${post.title}`)
    } catch (error) {
      console.error(`✗ Erro em: ${post.title}`, error)
    }
  }
  
  console.log('Migração concluída!')
}

runMigration()
```

### Fase 2: Conversão de Conteúdo

**2.1 Desafios de Conversão HTML → Portable Text**

Posts atuais contêm HTML rico:
- Tabelas complexas
- Listas ordenadas/não-ordenadas
- Callouts customizados
- Imagens inline
- Links externos

**Estratégias:**
1. **Biblioteca oficial:** `@sanity/block-tools` para conversão automática
2. **Custom blocks:** Definir blocos customizados para tabelas e callouts
3. **Revisão manual:** Validar posts críticos após migração

**2.2 Mapeamento de Imagens**

```javascript
// Estratégia de upload de imagens
async function uploadAllImages() {
  const imagesDir = './public/Blog/'
  const images = fs.readdirSync(imagesDir)
  
  const uploadedImages = {}
  
  for (const image of images) {
    const buffer = fs.readFileSync(`${imagesDir}${image}`)
    const asset = await client.assets.upload('image', buffer, {
      filename: image
    })
    uploadedImages[image] = asset._id
  }
  
  // Salvar mapeamento para referência
  fs.writeFileSync(
    './image-mapping.json',
    JSON.stringify(uploadedImages, null, 2)
  )
}
```

### Fase 3: Integração Frontend

**3.1 Instalar Dependências**

```bash
npm install @sanity/client @sanity/image-url
npm install --save-dev @sanity/types
```

**3.2 Cliente Sanity**

```javascript
// src/lib/sanity.js
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID,
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // CDN para production (read-only)
})

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}
```

**3.3 Queries GROQ**

```javascript
// src/lib/sanityQueries.js

// Buscar todos os posts publicados
export const allPostsQuery = `
  *[_type == "blogPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    "featuredImage": featuredImage.asset->url,
    "featuredImageAlt": featuredImage.alt,
    "category": category->title,
    "categorySlug": category->slug.current,
    tags,
    "author": author->{name, crm},
    publishedAt,
    featured,
    seoTitle,
    seoDescription,
    seoKeywords
  }
`

// Buscar post por slug
export const postBySlugQuery = `
  *[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    content,
    "featuredImage": featuredImage.asset->url,
    "featuredImageAlt": featuredImage.alt,
    "category": category->{title, slug},
    tags,
    "author": author->{name, crm, bio, "image": image.asset->url},
    publishedAt,
    featured,
    seoTitle,
    seoDescription,
    seoKeywords,
    "relatedPodcasts": relatedPodcasts[]->{ title, slug },
    cfmCompliant,
    medicalReviewDate,
    "medicalReviewer": medicalReviewer->{name, crm},
    medicalDisclaimer
  }
`

// Buscar posts em destaque
export const featuredPostsQuery = `
  *[_type == "blogPost" && featured == true] | order(publishedAt desc) [0...3] {
    _id,
    title,
    slug,
    excerpt,
    "featuredImage": featuredImage.asset->url,
    "category": category->title,
    publishedAt
  }
`
```

**3.4 Fetch de Dados em Build Time**

```javascript
// scripts/fetch-blog-posts.js
import { client } from '../src/lib/sanity.js'
import { allPostsQuery, postBySlugQuery } from '../src/lib/sanityQueries.js'
import fs from 'fs'

async function fetchAndCachePosts() {
  console.log('Fetching blog posts from Sanity...')
  
  const posts = await client.fetch(allPostsQuery)
  
  // Salvar em arquivo estático para build
  fs.writeFileSync(
    './src/data/sanity-blog-posts.json',
    JSON.stringify(posts, null, 2)
  )
  
  console.log(`✓ Cached ${posts.length} posts`)
}

fetchAndCachePosts()
```

**3.5 Atualizar package.json**

```json
{
  "scripts": {
    "fetch:blog": "node scripts/fetch-blog-posts.js",
    "prebuild": "npm run fetch:blog",
    "build:vite": "npm run fetch:blog && vite build && node scripts/prerender-pages.js"
  }
}
```

**3.6 Atualizar Componentes**

```javascript
// src/data/blogPostsLoader.js (atualizado)
import cachedPosts from './sanity-blog-posts.json'

export function getAllPosts() {
  return cachedPosts
}

export function getPostBySlug(slug) {
  return cachedPosts.find(post => post.slug.current === slug)
}

export function getFeaturedPosts() {
  return cachedPosts.filter(post => post.featured)
}
```

### Fase 4: Webhook e CI/CD

**4.1 Configurar Webhook no Sanity**

```javascript
// sanity.config.js
import { defineConfig } from 'sanity'

export default defineConfig({
  // ... outras configs
  
  webhooks: [
    {
      name: 'Trigger Production Build',
      url: 'https://api.saraivavision.com.br/webhooks/sanity-publish',
      on: ['create', 'update', 'delete'],
      filter: '_type == "blogPost"',
      httpMethod: 'POST',
      secret: process.env.SANITY_WEBHOOK_SECRET
    }
  ]
})
```

**4.2 Endpoint de Webhook na API**

```javascript
// api/src/webhooks/sanity.js
import crypto from 'crypto'
import { exec } from 'child_process'

export async function handleSanityWebhook(req, res) {
  // Validar assinatura do webhook
  const signature = req.headers['sanity-webhook-signature']
  const body = JSON.stringify(req.body)
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.SANITY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  // Trigger rebuild
  console.log('Sanity webhook received, triggering rebuild...')
  
  exec('cd /home/saraiva-vision-site && npm run build:vite', (error, stdout, stderr) => {
    if (error) {
      console.error('Build failed:', error)
      return res.status(500).json({ error: 'Build failed' })
    }
    
    console.log('Build completed:', stdout)
    res.json({ success: true, message: 'Build triggered' })
  })
}
```

**4.3 Alternativa: GitHub Actions**

```yaml
# .github/workflows/sanity-rebuild.yml
name: Rebuild on Sanity Update

on:
  repository_dispatch:
    types: [sanity-update]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build:vite
        env:
          VITE_SANITY_PROJECT_ID: ${{ secrets.SANITY_PROJECT_ID }}
          VITE_SANITY_DATASET: production
      
      - name: Deploy to VPS
        run: |
          # Script de deploy SSH
          scp -r dist/* user@31.97.129.78:/var/www/saraivavision/current/
```

## 🧪 Estratégia de Testes

### Testes de Migração

**1. Validação de Conteúdo**
```javascript
// tests/migration/content-validation.test.js
describe('Migração de Conteúdo', () => {
  it('deve migrar todos os 32 posts', async () => {
    const posts = await client.fetch(allPostsQuery)
    expect(posts).toHaveLength(32)
  })
  
  it('deve preservar todos os campos obrigatórios', async () => {
    const posts = await client.fetch(allPostsQuery)
    
    posts.forEach(post => {
      expect(post.title).toBeDefined()
      expect(post.slug).toBeDefined()
      expect(post.content).toBeDefined()
      expect(post.author).toBeDefined()
      expect(post.publishedAt).toBeDefined()
    })
  })
  
  it('deve manter slugs únicos', async () => {
    const posts = await client.fetch(allPostsQuery)
    const slugs = posts.map(p => p.slug.current)
    const uniqueSlugs = new Set(slugs)
    
    expect(slugs.length).toBe(uniqueSlugs.size)
  })
})
```

**2. Testes de Integração Frontend**
```javascript
// tests/integration/blog-sanity.test.js
describe('Integração Sanity Blog', () => {
  it('deve carregar posts do cache JSON', () => {
    const posts = getAllPosts()
    expect(posts.length).toBeGreaterThan(0)
  })
  
  it('deve renderizar post com dados Sanity', () => {
    const post = getPostBySlug('monovisao-lentes-multifocais')
    expect(post).toBeDefined()
    expect(post.title).toBeDefined()
  })
})
```

**3. Testes de SEO**
```javascript
// tests/seo/blog-seo.test.js
describe('SEO após migração', () => {
  it('deve preservar meta tags de todos os posts', async () => {
    const posts = await client.fetch(allPostsQuery)
    
    posts.forEach(post => {
      expect(post.seoTitle).toBeDefined()
      expect(post.seoDescription).toBeDefined()
      expect(post.seoDescription.length).toBeLessThanOrEqual(160)
    })
  })
})
```

### Testes de Performance

**Benchmark antes/depois:**
- Tempo de build
- Tamanho do bundle
- Time to First Byte (TTFB)
- Lighthouse scores

## 🔐 Segurança e Compliance

### LGPD Compliance

**1. Dados Sensíveis**
- Nenhum dado pessoal de pacientes no blog
- Apenas informações públicas de profissionais (nome, CRM)
- Consentimento documentado para uso de imagens

**2. Configurações Sanity**
```javascript
// Configurar permissões granulares
{
  permissions: [
    {
      name: 'editors',
      permissions: [
        { operation: 'read', filter: '_type == "blogPost"' },
        { operation: 'create', filter: '_type == "blogPost"' },
        { operation: 'update', filter: '_type == "blogPost"' }
      ]
    },
    {
      name: 'reviewers',
      permissions: [
        { operation: 'read', filter: '_type == "blogPost"' }
      ]
    }
  ]
}
```

### Segurança de API

**1. Variáveis de Ambiente**
```bash
# .env.production
VITE_SANITY_PROJECT_ID=abc123def
VITE_SANITY_DATASET=production
SANITY_WRITE_TOKEN=sk... (apenas backend)
SANITY_WEBHOOK_SECRET=webhook_secret_here
```

**2. Rate Limiting**
- Sanity CDN: incluído
- API Webhook: adicionar rate limit no Nginx

## 💰 Análise de Custos

### Plano Sanity.io Recomendado

**Free Tier:**
- ✅ 3 usuários
- ✅ 100K API requests/mês
- ✅ 10GB bandwidth/mês
- ✅ 5GB assets
- ❌ Sem custom roles
- ❌ Sem backup on-demand

**Growth Plan ($99/mês):**
- ✅ Usuários ilimitados
- ✅ 1M API requests/mês
- ✅ 100GB bandwidth/mês
- ✅ 20GB assets
- ✅ Custom roles e permissions
- ✅ Point-in-time recovery (7 dias)
- ✅ Webhooks ilimitados

**Recomendação Inicial:** Começar com **Free Tier**
- 32 posts = baixo volume
- Build-time fetching = poucas API calls
- Escalar para Growth se necessário

### Custos de Implementação

**Desenvolvimento:**
- Setup Sanity Studio: 4-8h
- Script de migração: 8-16h
- Integração frontend: 8-12h
- Webhook/CI/CD: 4-8h
- Testes e validação: 8-12h
- **Total estimado: 32-56h**

**Infraestrutura:**
- Sanity Free Tier: $0/mês
- VPS atual: sem mudança
- **Total: $0/mês inicialmente**

## 📅 Cronograma de Implementação

### Fase 0: Planejamento (1 semana)
- [ ] Aprovação do plano de migração
- [ ] Definição de stakeholders e responsabilidades
- [ ] Setup de projeto Sanity (trial/free tier)

### Fase 1: Setup e Schema (1 semana)
- [ ] Criar projeto Sanity
- [ ] Configurar schemas (blogPost, category, author)
- [ ] Desenvolver Studio customizado
- [ ] Configurar roles e permissions

### Fase 2: Migração de Dados (1-2 semanas)
- [ ] Desenvolver script de migração
- [ ] Testar migração em dataset staging
- [ ] Migrar dados para dataset production
- [ ] Validar conteúdo migrado (manual + automatizado)
- [ ] Corrigir inconsistências

### Fase 3: Integração Frontend (1-2 semanas)
- [ ] Implementar cliente Sanity
- [ ] Desenvolver queries GROQ
- [ ] Atualizar componentes blog
- [ ] Implementar fetch em build-time
- [ ] Testes de integração

### Fase 4: Webhook e CI/CD (1 semana)
- [ ] Configurar webhook Sanity
- [ ] Implementar endpoint webhook na API
- [ ] Testar trigger automático de build
- [ ] Configurar GitHub Actions (opcional)
- [ ] Monitoramento e logs

### Fase 5: Testes e QA (1 semana)
- [ ] Testes funcionais completos
- [ ] Testes de SEO e performance
- [ ] Testes de acessibilidade
- [ ] Testes de compliance (CFM/LGPD)
- [ ] UAT (User Acceptance Testing)

### Fase 6: Deploy e Monitoramento (1 semana)
- [ ] Deploy em staging
- [ ] Validação final
- [ ] Deploy em production
- [ ] Rollback plan testado
- [ ] Monitoramento pós-deploy (7 dias)

**Prazo Total: 7-9 semanas**

## 🔄 Plano de Rollback

### Cenário 1: Problemas na Migração de Dados
**Ação:**
- Manter `src/data/blogPosts.js` durante período de transição
- Feature flag para alternar entre Sanity e dados estáticos

```javascript
// src/lib/blogDataSource.js
const USE_SANITY = process.env.VITE_USE_SANITY === 'true'

export function getAllPosts() {
  if (USE_SANITY) {
    return import('./sanity-blog-posts.json')
  }
  return import('./blogPosts.js')
}
```

### Cenário 2: Performance Issues
**Ação:**
- Reverter para build estático puro
- Analisar logs e otimizar queries
- Aumentar cache TTL

### Cenário 3: Problemas com Webhook
**Ação:**
- Desabilitar webhook temporariamente
- Builds manuais via script
- Fix e reativação gradual

## 📊 KPIs de Sucesso

### Técnicos
- ✅ 100% dos posts migrados sem perda de dados
- ✅ Tempo de build < 5 minutos
- ✅ Lighthouse SEO score mantido (95+)
- ✅ Nenhuma quebra de URL (301 redirects se necessário)
- ✅ Imagens otimizadas (WebP/AVIF mantidos)

### Negócio
- ✅ Tempo para publicar novo post: < 5 minutos (vs. horas antes)
- ✅ Zero dependência de dev para updates de conteúdo
- ✅ Satisfação da equipe de conteúdo: 8/10+
- ✅ Uptime mantido: 99.9%

### Compliance
- ✅ 100% conformidade CFM mantida
- ✅ LGPD compliance verificado
- ✅ Disclaimers médicos presentes em todos os posts

## 🎓 Treinamento

### Para Equipe de Conteúdo
**Documentação a criar:**
- [ ] Manual do Sanity Studio (PT-BR)
- [ ] Guia de criação de posts
- [ ] Boas práticas de SEO
- [ ] Checklist de compliance CFM
- [ ] Troubleshooting comum

**Sessões de Treinamento:**
- [ ] Sessão 1: Introdução ao Sanity (2h)
- [ ] Sessão 2: Criação e edição de posts (2h)
- [ ] Sessão 3: Gestão de imagens e media (1h)
- [ ] Sessão 4: SEO e compliance (1h)

### Para Equipe de Dev
**Documentação técnica:**
- [ ] Arquitetura Sanity integrada
- [ ] Guia de queries GROQ
- [ ] Runbook de troubleshooting
- [ ] Guia de manutenção de schemas

## 📚 Referências e Recursos

### Documentação Oficial
- [Sanity.io Documentation](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Portable Text Specification](https://github.com/portabletext/portabletext)
- [Sanity Client Library](https://www.sanity.io/docs/js-client)

### Ferramentas
- [@sanity/block-tools](https://www.npmjs.com/package/@sanity/block-tools) - HTML to Portable Text
- [sanity-plugin-media](https://www.sanity.io/plugins/sanity-plugin-media) - Media Library
- [sanity-plugin-dashboard-widget-netlify](https://www.sanity.io/plugins/sanity-plugin-dashboard-widget-netlify) - Deploy tracking

### Exemplos de Referência
- [Sanity + Vite Example](https://github.com/sanity-io/sanity-template-vite-react)
- [Blog Migration Guide](https://www.sanity.io/guides/migrate-to-sanity)

## ✅ Próximos Passos

### Imediatos (Esta Semana)
1. [ ] Revisar e aprovar este plano de migração
2. [ ] Criar conta Sanity.io (free tier)
3. [ ] Definir equipe responsável pela migração
4. [ ] Agendar kickoff meeting

### Curto Prazo (Próximas 2 Semanas)
1. [ ] Setup inicial do projeto Sanity
2. [ ] Desenvolvimento do schema em staging
3. [ ] Protótipo de script de migração
4. [ ] Testes iniciais com 5 posts de amostra

### Médio Prazo (1-2 Meses)
1. [ ] Migração completa dos dados
2. [ ] Integração frontend finalizada
3. [ ] Testes e QA completos
4. [ ] Deploy em production

---

## 📝 Notas Finais

Este plano de migração foi desenvolvido considerando:
- ✅ Arquitetura existente (Vite + React)
- ✅ Performance e SEO como prioridades
- ✅ Compliance CFM/LGPD obrigatório
- ✅ Minimal disruption no workflow atual
- ✅ Escalabilidade futura

**Riscos Identificados:**
- ⚠️ Complexidade de conversão HTML → Portable Text
- ⚠️ Tempo de adaptação da equipe ao novo CMS
- ⚠️ Dependência de serviço externo (Sanity)

**Mitigações:**
- ✅ Script de migração robusto com validação
- ✅ Treinamento extensivo da equipe
- ✅ Fallback para dados estáticos em caso de issues
- ✅ Período de transição com ambos sistemas ativos

**Recomendação Final:**
Prosseguir com a migração de forma **incremental e controlada**, mantendo dados estáticos como fallback durante os primeiros 30 dias pós-deploy.

---

**Documento preparado em:** 24 de Outubro de 2025  
**Versão:** 1.0  
**Próxima revisão:** Após aprovação e início da Fase 1
