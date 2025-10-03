# Next.js Migration Guide - Saraiva Vision

**Versão**: 1.0.0 | **Data**: Outubro 2025 | **Status**: Planejamento

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Motivação e Benefícios](#motivação-e-benefícios)
3. [Análise da Arquitetura Atual](#análise-da-arquitetura-atual)
4. [Estratégia de Migração](#estratégia-de-migração)
5. [Plano de Implementação](#plano-de-implementação)
6. [Checklist de Migração](#checklist-de-migração)
7. [Considerações de Compliance](#considerações-de-compliance)
8. [Performance e SEO](#performance-e-seo)
9. [Deployment e Infraestrutura](#deployment-e-infraestrutura)
10. [Riscos e Mitigação](#riscos-e-mitigação)

---

## 🎯 Visão Geral

Este documento detalha o plano de migração do **Saraiva Vision** de React + Vite (Client-Side Rendering) para **Next.js 15** (Server-Side Rendering + Static Generation).

### Stack Atual vs Stack Futura

| Componente | Atual (Vite + React) | Futuro (Next.js) |
|------------|---------------------|------------------|
| **Framework** | React 18.2.0 SPA | Next.js 15 (App Router) |
| **Bundler** | Vite 7.1.7 | Turbopack/Webpack (Next.js) |
| **Rendering** | Client-Side (CSR) | SSR + SSG + ISR |
| **Routing** | React Router v6 | Next.js App Router |
| **API Routes** | Express.js separado | Next.js API Routes |
| **Build Tool** | Vite ESBuild | Next.js (Turbopack) |
| **TypeScript** | Partial strict | Full strict |
| **Deployment** | Static files (Nginx) | Node.js server + Static |

---

## 💡 Motivação e Benefícios

### Problemas Atuais

1. **SEO Limitado**: CSR dificulta indexação do Google (mesmo com prerender)
2. **Performance Inicial**: TTI (Time to Interactive) alto em conexões lentas
3. **Blog Estático**: Sem hot-reload em desenvolvimento de conteúdo
4. **API Separada**: Complexidade de deploy com Express.js separado
5. **Build Complexity**: Scripts customizados para prerender e blog

### Benefícios do Next.js

#### 🚀 Performance
- **SSR/SSG**: HTML pré-renderizado, TTI reduzido em ~40%
- **Automatic Code Splitting**: Por rota e componente
- **Image Optimization**: next/image com WebP/AVIF automático
- **Edge Runtime**: Deploy em CDN global (Vercel Edge)

#### 🔍 SEO
- **HTML Completo**: Crawler bots recebem conteúdo renderizado
- **Metadata API**: SEO dinâmico por página (Open Graph, Schema.org)
- **Sitemap Automático**: Geração de sitemap.xml e robots.txt

#### 🏥 Compliance
- **Server-Side Validation**: Validação CFM/LGPD antes do render
- **Edge Functions**: Geolocation-based compliance (EEA, Brasil)
- **Secure Headers**: Security headers automáticos

#### 🛠 Developer Experience
- **File-Based Routing**: Sem configuração de rotas
- **API Routes**: Backend integrado ao frontend
- **TypeScript Native**: Suporte first-class
- **Hot Reload**: Fast Refresh para tudo

---

## 📊 Análise da Arquitetura Atual

### Estrutura de Pastas (Vite + React)

```
src/
├── components/        # 101 componentes React
│   ├── ui/           # Radix UI + shadcn
│   ├── compliance/   # CFM/LGPD
│   └── instagram/    # Integração Instagram
├── pages/            # 21 páginas com React Router
├── hooks/            # 47 custom hooks
├── lib/              # 33 utilitários
├── data/             # Dados estáticos (blogPosts.js)
├── config/           # Configurações (CFM, env)
└── __tests__/        # 28 testes Vitest

api/                  # Backend Express.js separado
├── google-reviews/   # Google Places API
├── analytics/        # Analytics tracking
└── __tests__/        # 12 testes API
```

### Dependências Críticas

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.16.0",      // ❌ Remover
  "react-helmet-async": "^2.0.5",     // ❌ Substituir por Metadata API
  "framer-motion": "^12.23.19",       // ✅ Compatível
  "@radix-ui/*": "latest",            // ✅ Compatível
  "tailwindcss": "^3.3.3",            // ✅ Compatível
  "vitest": "^3.2.4",                 // ⚠️ Migrar para Jest/Vitest Next.js
  "@googlemaps/js-api-loader": "^1.16.10", // ✅ Compatível
  "posthog-js": "^1.200.0",           // ✅ Compatível
  "zod": "^3.25.76"                   // ✅ Compatível
}
```

### Rotas Existentes (React Router)

```jsx
// src/App.jsx - 15 rotas principais
/                       → HomePageLayout
/servicos               → ServicesPage
/servicos/:serviceId    → ServiceDetailPage
/sobre                  → AboutPage
/lentes                 → LensesPage
/faq                    → FAQPage
/artigos/catarata       → MedicalArticleExample
/podcast                → PodcastPageConsolidated
/podcast/:slug          → PodcastPageConsolidated (dynamic)
/blog                   → BlogPage
/blog/:slug             → BlogPage (dynamic)
/privacy                → PrivacyPolicyPage
/check                  → CheckPage (subdomain check.saraivavision.com.br)
```

---

## 🛣 Estratégia de Migração

### Abordagem Recomendada: **Incremental (Phase-by-Phase)**

#### Opção 1: Big Bang (❌ Não Recomendado)
- Migrar tudo de uma vez
- Alto risco, downtime potencial
- Difícil rollback

#### Opção 2: Incremental (✅ Recomendado)
- Migrar página por página
- Next.js rodando em paralelo ao Vite
- Nginx proxy por rota
- Zero downtime

### Fases da Migração

```
Fase 0: Setup Inicial (1 semana)
  ↓
Fase 1: Páginas Estáticas (2 semanas)
  ↓
Fase 2: Blog + SEO (1 semana)
  ↓
Fase 3: Páginas Dinâmicas (2 semanas)
  ↓
Fase 4: API Routes (1 semana)
  ↓
Fase 5: Compliance + Testes (1 semana)
  ↓
Fase 6: Deploy + Cutover (1 semana)
```

---

## 📝 Plano de Implementação

### Fase 0: Setup Inicial

#### 1. Criar Projeto Next.js

```bash
# Criar novo projeto Next.js 15 com App Router
npx create-next-app@latest saraiva-vision-nextjs --typescript --tailwind --app --use-npm

# Estrutura inicial
cd saraiva-vision-nextjs
```

#### 2. Configurar TypeScript Strict

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": false,
    "strict": true,                    // ✅ Ativar strict mode
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]              // ✅ Manter alias @/
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

#### 3. Configurar next.config.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compliance CFM/LGPD
  reactStrictMode: true,
  
  // Performance
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Images
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: [
      'saraivavision.com.br',
      'www.saraivavision.com.br',
      'lh3.googleusercontent.com', // Google Reviews
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 ano
  },
  
  // Headers de segurança CFM/LGPD
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  
  // Redirects 301
  async redirects() {
    return [
      {
        source: '/servico/:serviceId',
        destination: '/servicos/:serviceId',
        permanent: true,
      },
      {
        source: '/wp-admin',
        destination: '/blog',
        permanent: true,
      },
    ];
  },
  
  // Rewrite para subdomain check.saraivavision.com.br
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/check',
        has: [
          {
            type: 'host',
            value: 'check.saraivavision.com.br',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
```

#### 4. Estrutura de Pastas Next.js

```
saraiva-vision-nextjs/
├── src/
│   ├── app/                      # App Router
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page (/)
│   │   ├── servicos/
│   │   │   ├── page.tsx         # /servicos
│   │   │   └── [serviceId]/
│   │   │       └── page.tsx     # /servicos/:serviceId
│   │   ├── blog/
│   │   │   ├── page.tsx         # /blog
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # /blog/:slug
│   │   ├── podcast/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── sobre/page.tsx
│   │   ├── lentes/page.tsx
│   │   ├── faq/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── api/                 # API Routes
│   │       ├── google-reviews/route.ts
│   │       ├── analytics/route.ts
│   │       └── health/route.ts
│   ├── components/              # ✅ Copiar de src/components/
│   ├── hooks/                   # ✅ Copiar de src/hooks/
│   ├── lib/                     # ✅ Copiar de src/lib/
│   ├── config/                  # ✅ Copiar de src/config/
│   └── data/                    # ✅ Copiar de src/data/
├── public/                      # ✅ Copiar de public/
├── __tests__/                   # Testes
└── next.config.js
```

---

### Fase 1: Páginas Estáticas (SSG)

#### Páginas para Migrar (SSG - Static Site Generation)

```
✅ /sobre         → app/sobre/page.tsx
✅ /lentes        → app/lentes/page.tsx
✅ /faq           → app/faq/page.tsx
✅ /privacy       → app/privacy/page.tsx
```

#### Exemplo: Migrar `/sobre` (AboutPage)

**Antes (Vite + React Router):**

```jsx
// src/pages/AboutPage.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>Sobre - Clínica Saraiva Vision</title>
        <meta name="description" content="..." />
      </Helmet>
      <Navbar />
      <main>
        <h1>Sobre Nós</h1>
        {/* conteúdo */}
      </main>
      <Footer />
    </>
  );
}
```

**Depois (Next.js App Router):**

```tsx
// src/app/sobre/page.tsx
import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ✅ Metadata API (substitui react-helmet)
export const metadata: Metadata = {
  title: 'Sobre - Clínica Saraiva Vision',
  description: '...',
  openGraph: {
    title: 'Sobre - Clínica Saraiva Vision',
    description: '...',
    url: 'https://saraivavision.com.br/sobre',
    images: ['/og-image.jpg'],
  },
};

export default function SobrePage() {
  return (
    <>
      <Navbar />
      <main>
        <h1>Sobre Nós</h1>
        {/* conteúdo */}
      </main>
      <Footer />
    </>
  );
}

// ✅ Static Generation (build time)
export const dynamic = 'force-static';
```

---

### Fase 2: Blog + SEO (SSG com ISR)

#### Blog Posts Migration

**Antes (Dados Estáticos):**

```javascript
// src/data/blogPosts.js
export const blogPosts = [
  {
    id: 'descolamento-de-retina',
    title: 'Descolamento de Retina: Sintomas e Tratamentos',
    slug: 'descolamento-de-retina',
    excerpt: '...',
    content: '...',
    publishedAt: '2025-01-15',
    coverImage: '/Blog/descolamento-retina-cover.webp',
    author: { name: 'Dr. Saraiva', crm: 'CRM/MG 12345' },
    category: 'Doenças Retinianas',
  },
  // ... 99 posts
];
```

**Depois (Markdown + Gray Matter):**

```bash
# Criar estrutura de conteúdo
mkdir -p content/blog

# Converter blogPosts.js para arquivos .md
# Script: scripts/convert-blog-to-markdown.js
```

```markdown
---
title: "Descolamento de Retina: Sintomas e Tratamentos"
slug: descolamento-de-retina
excerpt: "..."
publishedAt: 2025-01-15
coverImage: /Blog/descolamento-retina-cover.webp
author:
  name: Dr. Saraiva
  crm: CRM/MG 12345
category: Doenças Retinianas
tags:
  - retina
  - urgência
  - cirurgia
cfmCompliance: true
---

# Descolamento de Retina: Sintomas e Tratamentos

**Aviso CFM**: Este artigo possui caráter informativo...

<!-- conteúdo do post -->
```

#### Blog Page Implementation

```tsx
// src/app/blog/page.tsx
import { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import BlogList from '@/components/BlogList';

export const metadata: Metadata = {
  title: 'Blog | Saraiva Vision',
  description: 'Artigos sobre saúde ocular...',
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  
  return (
    <main>
      <h1>Blog Saraiva Vision</h1>
      <BlogList posts={posts} />
    </main>
  );
}

// ✅ ISR: Revalidar a cada 1 hora
export const revalidate = 3600;
```

```tsx
// src/app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';
import CFMCompliance from '@/components/compliance/CFMCompliance';

interface Props {
  params: { slug: string };
}

// ✅ Metadata Dinâmica (Open Graph, Schema.org)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  if (!post) return {};
  
  return {
    title: `${post.title} | Saraiva Vision`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      type: 'article',
      publishedTime: post.publishedAt,
    },
    // Schema.org
    other: {
      '@context': 'https://schema.org',
      '@type': 'MedicalArticle',
      headline: post.title,
      author: {
        '@type': 'Physician',
        name: post.author.name,
        medicalSpecialty: 'Oftalmologia',
      },
    },
  };
}

// ✅ Static Paths (SSG para todos os posts)
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  
  if (!post) notFound();
  
  return (
    <article>
      {post.cfmCompliance && <CFMCompliance />}
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

// ✅ ISR: Revalidar a cada 24h
export const revalidate = 86400;
```

#### Blog Utilities

```typescript
// src/lib/blog.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const postsDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  coverImage: string;
  author: {
    name: string;
    crm: string;
  };
  category: string;
  cfmCompliance: boolean;
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  
  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: marked(content),
      publishedAt: data.publishedAt,
      coverImage: data.coverImage,
      author: data.author,
      category: data.category,
      cfmCompliance: data.cfmCompliance ?? false,
    };
  });
  
  // Ordenar por data (mais recente primeiro)
  return posts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    
    return {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: marked(content),
      publishedAt: data.publishedAt,
      coverImage: data.coverImage,
      author: data.author,
      category: data.category,
      cfmCompliance: data.cfmCompliance ?? false,
    };
  } catch {
    return null;
  }
}
```

---

### Fase 3: Páginas Dinâmicas (SSR/SSG)

#### Serviços (/servicos/:serviceId)

```tsx
// src/app/servicos/[serviceId]/page.tsx
import { Metadata } from 'next';
import { getServiceById, getAllServices } from '@/lib/services';
import { notFound } from 'next/navigation';
import ServiceDetail from '@/components/ServiceDetail';

interface Props {
  params: { serviceId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getServiceById(params.serviceId);
  
  if (!service) return {};
  
  return {
    title: `${service.title} | Saraiva Vision`,
    description: service.description,
  };
}

export async function generateStaticParams() {
  const services = await getAllServices();
  return services.map((service) => ({ serviceId: service.id }));
}

export default async function ServiceDetailPage({ params }: Props) {
  const service = await getServiceById(params.serviceId);
  
  if (!service) notFound();
  
  return <ServiceDetail service={service} />;
}

// ✅ SSG + ISR
export const revalidate = 3600;
```

---

### Fase 4: API Routes

#### Google Reviews API

**Antes (Express.js):**

```javascript
// api/google-reviews/index.js
import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const reviews = await fetchGoogleReviews();
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

**Depois (Next.js API Route):**

```typescript
// src/app/api/google-reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ReviewSchema = z.object({
  author: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string(),
  date: z.string(),
});

export async function GET(request: NextRequest) {
  try {
    const placeId = process.env.GOOGLE_PLACE_ID;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    if (!placeId || !apiKey) {
      return NextResponse.json(
        { error: 'Missing API credentials' },
        { status: 500 }
      );
    }
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=reviews,rating,user_ratings_total`
    );
    
    const data = await response.json();
    
    // Validar com Zod
    const reviews = data.result?.reviews?.map((r: any) => 
      ReviewSchema.parse({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        date: r.time,
      })
    ) || [];
    
    return NextResponse.json({ reviews }, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// ✅ Edge Runtime (deploy em CDN)
export const runtime = 'edge';
```

---

### Fase 5: Compliance + Testes

#### CFM Compliance Middleware

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Headers de segurança CFM/LGPD
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );
  
  // LGPD: Cookie consent tracking
  const hasConsent = request.cookies.get('cookie-consent');
  if (!hasConsent && request.nextUrl.pathname !== '/privacy') {
    response.headers.set('X-LGPD-Consent', 'required');
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

#### Testes Migration (Vitest → Jest)

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

---

### Fase 6: Deploy + Cutover

#### Opção 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy staging
vercel --prod=false

# Deploy produção
vercel --prod
```

**Configuração Vercel:**

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["gru1"],  // São Paulo (Brasil)
  "env": {
    "GOOGLE_PLACES_API_KEY": "@google-places-api-key",
    "GOOGLE_PLACE_ID": "@google-place-id",
    "RESEND_API_KEY": "@resend-api-key"
  }
}
```

#### Opção 2: VPS (Manter Infraestrutura Atual)

```bash
# Build Next.js standalone
npm run build

# PM2 para Node.js server
pm2 start npm --name "saraiva-nextjs" -- start
pm2 save
pm2 startup
```

**Nginx Config:**

```nginx
# /etc/nginx/sites-available/saraivavision.com.br

server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;
    
    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    
    # Next.js server
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files (Next.js já serve otimizado)
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## ✅ Checklist de Migração

### Setup Inicial
- [ ] Criar projeto Next.js 15
- [ ] Configurar TypeScript strict mode
- [ ] Configurar Tailwind CSS
- [ ] Configurar ESLint + Prettier
- [ ] Setup path alias (@/)
- [ ] Configurar variáveis de ambiente

### Componentes
- [ ] Copiar pasta `src/components/` → `src/components/`
- [ ] Atualizar imports React Router → Next.js Link
- [ ] Remover react-helmet → usar Metadata API
- [ ] Testar todos componentes UI (Radix, shadcn)
- [ ] Validar Framer Motion (client components)

### Páginas Estáticas (SSG)
- [ ] Migrar `/sobre`
- [ ] Migrar `/lentes`
- [ ] Migrar `/faq`
- [ ] Migrar `/privacy`
- [ ] Testar SEO metadata
- [ ] Validar performance (Lighthouse)

### Blog
- [ ] Converter blogPosts.js → Markdown
- [ ] Implementar `/blog` (lista)
- [ ] Implementar `/blog/[slug]` (post)
- [ ] Migrar CFM compliance warnings
- [ ] Testar ISR (revalidate)
- [ ] Validar Schema.org markup

### Páginas Dinâmicas
- [ ] Migrar `/servicos`
- [ ] Migrar `/servicos/[serviceId]`
- [ ] Migrar `/podcast`
- [ ] Migrar `/podcast/[slug]`
- [ ] Migrar `/check` (subdomain)
- [ ] Testar generateStaticParams

### API Routes
- [ ] Migrar `/api/google-reviews`
- [ ] Migrar `/api/analytics`
- [ ] Migrar `/api/health`
- [ ] Validar rate limiting
- [ ] Testar Edge Runtime

### Compliance
- [ ] Implementar middleware LGPD
- [ ] Validar CFM disclaimers
- [ ] Security headers
- [ ] Cookie consent
- [ ] Audit logs

### Testes
- [ ] Migrar testes Vitest → Jest
- [ ] Testes de componentes
- [ ] Testes de API routes
- [ ] Testes E2E (Playwright)
- [ ] Coverage mínimo 80%

### Deploy
- [ ] Setup Vercel/VPS
- [ ] Configurar domínio
- [ ] SSL certificates
- [ ] Environment variables
- [ ] Monitoring (Sentry, LogRocket)
- [ ] Analytics (PostHog)

### Cutover
- [ ] Deploy staging
- [ ] Testes de carga
- [ ] Backup completo VPS atual
- [ ] Update DNS
- [ ] Monitor erros (24h)
- [ ] Rollback plan

---

## 🏥 Considerações de Compliance

### CFM (Conselho Federal de Medicina)

#### Validação Automática
```typescript
// src/lib/cfm-validation.ts
import { z } from 'zod';

const MedicalContentSchema = z.object({
  hasDisclaimer: z.boolean(),
  authorCRM: z.string().regex(/^CRM\/[A-Z]{2} \d+$/),
  category: z.enum(['medical', 'educational', 'informational']),
  reviewedBy: z.string().optional(),
});

export function validateCFMCompliance(content: any) {
  try {
    MedicalContentSchema.parse(content);
    return { valid: true };
  } catch (error) {
    return { valid: false, errors: error.errors };
  }
}
```

### LGPD (Lei Geral de Proteção de Dados)

#### Consent Management
```typescript
// src/app/api/consent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Salvar consent no cookie
  cookies().set('cookie-consent', JSON.stringify({
    analytics: body.analytics ?? false,
    marketing: body.marketing ?? false,
    timestamp: new Date().toISOString(),
  }), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 31536000, // 1 ano
  });
  
  return NextResponse.json({ success: true });
}
```

---

## 🚀 Performance e SEO

### Core Web Vitals (Metas Next.js)

| Métrica | Atual (Vite) | Meta (Next.js) | Melhoria |
|---------|--------------|----------------|----------|
| **LCP** | 2.8s | < 2.0s | -28% |
| **FID** | 120ms | < 100ms | -16% |
| **CLS** | 0.15 | < 0.1 | -33% |
| **TTI** | 4.5s | < 3.0s | -33% |
| **TBT** | 450ms | < 300ms | -33% |

### Image Optimization

```tsx
// Antes (Vite)
<img src="/images/doctor.jpg" alt="Dr. Saraiva" />

// Depois (Next.js)
import Image from 'next/image';

<Image
  src="/images/doctor.jpg"
  alt="Dr. Saraiva"
  width={800}
  height={600}
  priority  // LCP optimization
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### SEO Improvements

#### Sitemap Automático
```typescript
// src/app/sitemap.ts
import { getAllPosts } from '@/lib/blog';

export default async function sitemap() {
  const posts = await getAllPosts();
  
  const blogUrls = posts.map((post) => ({
    url: `https://saraivavision.com.br/blog/${post.slug}`,
    lastModified: post.publishedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));
  
  return [
    {
      url: 'https://saraivavision.com.br',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://saraivavision.com.br/servicos',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...blogUrls,
  ];
}
```

#### Robots.txt
```typescript
// src/app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/_next/'],
    },
    sitemap: 'https://saraivavision.com.br/sitemap.xml',
  };
}
```

---

## 🛠 Deployment e Infraestrutura

### Vercel (Recomendado)

**Vantagens:**
- ✅ Zero config para Next.js
- ✅ Edge Network global (< 50ms latency)
- ✅ Automatic HTTPS
- ✅ Preview deploys por PR
- ✅ Analytics integrado
- ✅ Image Optimization incluído

**Desvantagens:**
- ❌ Custo (Pro: $20/mês)
- ❌ Vendor lock-in

### VPS Nativo (Atual)

**Vantagens:**
- ✅ Controle total
- ✅ Custo fixo (já pago)
- ✅ Compliance data residency (Brasil)

**Desvantagens:**
- ❌ Manutenção manual
- ❌ Scaling manual
- ❌ Sem Edge Network

### Recomendação: Híbrido

```
Frontend (Next.js SSG) → Vercel Edge (global)
    ↓
Backend APIs → VPS Brasil (31.97.129.78)
    ↓
Database → VPS Brasil
```

---

## ⚠️ Riscos e Mitigação

### Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Breaking changes em componentes** | Alta | Médio | Testes abrangentes, migração incremental |
| **Performance degradation** | Baixa | Alto | Benchmarks antes/depois, monitoring |
| **SEO temporary drop** | Média | Alto | Redirects 301, sitemap update imediato |
| **API downtime** | Baixa | Alto | Blue-green deployment, rollback plan |
| **Compliance issues** | Baixa | Crítico | Audit antes do deploy, legal review |

### Rollback Plan

```bash
# Em caso de falha crítica após cutover

# 1. Reverter DNS para VPS antigo
# (TTL: 300s, propagação < 5min)

# 2. Reverter Nginx config
sudo cp /etc/nginx/sites-available/saraivavision.old.conf \
        /etc/nginx/sites-available/saraivavision.conf
sudo nginx -s reload

# 3. Restart Vite app (backup)
pm2 restart saraiva-vite

# 4. Verificar health
curl https://saraivavision.com.br/api/health
```

---

## 📊 Timeline Estimado

| Fase | Duração | Dependências |
|------|---------|--------------|
| **Fase 0: Setup** | 1 semana | - |
| **Fase 1: Páginas Estáticas** | 2 semanas | Fase 0 |
| **Fase 2: Blog + SEO** | 1 semana | Fase 1 |
| **Fase 3: Páginas Dinâmicas** | 2 semanas | Fase 2 |
| **Fase 4: API Routes** | 1 semana | Fase 3 |
| **Fase 5: Compliance + Testes** | 1 semana | Fase 4 |
| **Fase 6: Deploy + Cutover** | 1 semana | Fase 5 |
| **TOTAL** | **9 semanas** | - |

---

## 📚 Recursos

### Documentação Oficial
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

### Ferramentas
- [next-codemod](https://nextjs.org/docs/app/building-your-application/upgrading/codemods) - Automated migrations
- [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer) - Bundle size analysis
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) - Performance monitoring

### Referências Internas
- `docs/ARCHITECTURE_SUMMARY.md` - Arquitetura atual
- `CLAUDE.md` - Documentação do projeto
- `docs/deployment/DEPLOYMENT_GUIDE.md` - Deploy atual

---

## 🎯 Próximos Passos

1. **Aprovação Stakeholders**: Apresentar este guia para aprovação
2. **POC (Proof of Concept)**: Migrar 1 página estática como teste
3. **Setup Ambiente**: Criar repositório Next.js paralelo
4. **Iniciar Fase 1**: Migrar páginas estáticas

---

**Última Atualização**: Outubro 2025
**Autor**: Equipe Saraiva Vision
**Status**: Em Revisão
