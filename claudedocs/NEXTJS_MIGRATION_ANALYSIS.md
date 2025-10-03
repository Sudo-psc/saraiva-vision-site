# Next.js 14+ App Router - Análise de Migração

**Projeto**: Saraiva Vision Site
**Status**: Análise Inicial Completa
**Data**: 2025-10-02
**Arquitetura Alvo**: Next.js 14+ App Router

---

## 📊 Resumo Executivo

**Stack Atual**: React 18.2 + Vite + React Router 6.16
**Stack Alvo**: Next.js 14+ App Router + React Server Components

### Compatibilidade Geral
- ✅ **80% das dependências** são diretamente compatíveis
- ⚠️ **20% precisam de adaptação** (react-helmet-async, react-router-dom, workbox)
- ✅ **Radix UI, Framer Motion, Tailwind** totalmente compatíveis
- ✅ **i18next** compatível (requer configuração Next.js)

---

## 🔄 Classificação de Componentes

### Server Components (Renderização no Servidor)

**Páginas Estáticas** - Conteúdo que pode ser pre-renderizado:
```
✅ src/pages/AboutPage.jsx → app/sobre/page.tsx
✅ src/pages/ServicesPage.jsx → app/servicos/page.tsx
✅ src/pages/FAQPage.jsx → app/faq/page.tsx
✅ src/pages/PrivacyPolicyPage.jsx → app/privacy/page.tsx
✅ src/pages/LensesPage.jsx → app/lentes/page.tsx
```

**Blog Layouts** - Estrutura estática com slots para Client Components:
```
✅ src/components/blog/BlogPostLayout.jsx → Server Component wrapper
✅ src/components/blog/PostPageTemplate.jsx → Server Component
✅ src/components/blog/AuthorProfile.jsx → Server Component (dados estáticos)
✅ src/components/blog/RelatedPosts.jsx → Server Component (lista estática)
```

**SEO & Schema.org** - Migrar para Next.js Metadata API:
```
🔄 src/components/SEOHead.jsx → app/*/metadata export
🔄 src/components/SchemaMarkup.jsx → generateMetadata() + JSON-LD
🔄 src/components/LocalBusinessSchema.jsx → Metadata API
```

**Footer & Static Sections**:
```
⚠️ src/components/EnhancedFooter.jsx → Híbrido (wrapper Server, conteúdo Client)
✅ src/components/FooterNAP.jsx → Server Component (NAP data)
✅ src/components/footer/Weekdays.jsx → Server Component
```

---

### Client Components ('use client' obrigatório)

**Navegação & Interatividade**:
```javascript
'use client'
❌ src/components/Navbar.jsx → useState, useEffect, scroll listeners
❌ src/components/ScrollToTop.jsx → scroll behavior
❌ src/components/StickyCTA.jsx → sticky positioning + state
❌ src/components/CTAModal.jsx → modal state
```

**Formulários & Input**:
```javascript
'use client'
❌ src/components/Contact.jsx → form state, validation
❌ src/components/ContactFormEnhanced.jsx → complex form logic
❌ src/components/AppointmentBooking.jsx → booking flow state
```

**Multimídia & Terceiros**:
```javascript
'use client'
❌ src/components/AudioPlayer.jsx → media player state
❌ src/components/SpotifyEmbed.jsx → iframe embeds
❌ src/components/GoogleMapNew.jsx → Google Maps API
❌ src/components/GoogleMapSimple.jsx → Google Maps API
❌ src/components/instagram/* → Instagram API + state
```

**Animações & Efeitos**:
```javascript
'use client'
❌ Todos os componentes com framer-motion
❌ src/components/Hero.jsx → motion animations
❌ src/components/ui/InteractiveCarousel.jsx → carousel state
❌ src/components/ui/beams-background.tsx → canvas animations
```

**Widgets & Features**:
```javascript
'use client'
❌ src/components/GoogleReviewsWidget.jsx → API fetching + state
❌ src/components/GoogleReviewsIntegration.jsx → reviews state
❌ src/components/LatestEpisodes.jsx → podcast episodes state
❌ src/components/LatestBlogPosts.jsx → blog posts state (pode ser Server!)
❌ src/components/Accessibility.jsx → accessibility controls state
❌ src/components/CookieManager.jsx → cookie consent state
❌ src/components/LanguageSwitcher.jsx → i18n state
```

**UI Interativos (Radix UI)**:
```javascript
'use client'
❌ src/components/ui/Alert.jsx → state
❌ src/components/ui/button.jsx → interactions
❌ src/components/ui/toast.jsx → notification state
❌ src/components/ui/toaster.jsx → toast management
```

---

### Componentes Híbridos (Requerem Refatoração)

**Padrão Recomendado**: Wrapper Server Component + Client Children

```typescript
// ✅ Server Component Wrapper
// app/blog/[slug]/page.tsx
export default async function BlogPostPage({ params }) {
  const post = await getBlogPost(params.slug); // Server-side data fetch

  return (
    <BlogPostLayout post={post}>
      {/* Client components para interatividade */}
      <ShareWidget /> {/* 'use client' */}
      <TableOfContents /> {/* 'use client' se interativo */}
      <CommentSection /> {/* 'use client' */}
    </BlogPostLayout>
  );
}

// ✅ BlogPostLayout pode ser Server Component
// Apenas partes interativas precisam 'use client'
```

**Componentes para Refatorar**:
```
⚠️ src/components/blog/BlogPostLayout.jsx
   → Wrapper Server + Client slots para ShareWidget, TOC, Comments

⚠️ src/components/EnhancedFooter.jsx
   → Footer structure Server + interactive elements Client

⚠️ src/pages/HomePage.jsx
   → Layout Server + Hero/Services/Contact Client

⚠️ src/components/Services.jsx
   → Lista Server + interactive cards Client
```

---

## 📦 Análise de Dependências

### ✅ Totalmente Compatíveis (Sem Mudanças)

```json
{
  "@radix-ui/*": "Todas as versões compatíveis",
  "framer-motion": "^12.23.19 - Client Components",
  "lucide-react": "^0.285.0",
  "tailwindcss": "^3.3.3",
  "@tailwindcss/typography": "^0.5.19",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^1.14.0",
  "date-fns": "^4.1.0",
  "dayjs": "^1.11.18",
  "dompurify": "^3.2.7",
  "marked": "^16.3.0",
  "zod": "^3.25.76",
  "prop-types": "^15.8.1",
  "@googlemaps/js-api-loader": "^1.16.10 - Client Component",
  "web-vitals": "^5.1.0",
  "posthog-js": "^1.200.0"
}
```

### 🔄 Requerem Adaptação Next.js

#### 1. `react-helmet-async` → **Next.js Metadata API**

**Antes (React)**:
```jsx
import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>Saraiva Vision</title>
  <meta name="description" content="..." />
</Helmet>
```

**Depois (Next.js)**:
```typescript
// app/page.tsx ou app/*/page.tsx
export const metadata = {
  title: 'Saraiva Vision',
  description: '...',
  openGraph: {
    title: 'Saraiva Vision',
    description: '...',
    images: ['/og-image.jpg'],
  },
};
```

**Migração**:
- ❌ Remover `react-helmet-async`
- ✅ Usar `export const metadata` em cada page.tsx
- ✅ Usar `generateMetadata()` para dynamic routes
- ✅ Converter SEOHead.jsx para metadata objects

---

#### 2. `react-router-dom` → **Next.js App Router**

**Antes (React Router)**:
```jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/servicos" element={<ServicesPage />} />
  <Route path="/blog/:slug" element={<BlogPostPage />} />
</Routes>
```

**Depois (Next.js File-Based Routing)**:
```
app/
├── page.tsx              → /
├── servicos/
│   └── page.tsx          → /servicos
├── blog/
│   ├── page.tsx          → /blog
│   └── [slug]/
│       └── page.tsx      → /blog/:slug
```

**Componentes a Migrar**:
```jsx
// Substituir useNavigate
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/destino');

// Substituir Link
import Link from 'next/link';
<Link href="/destino">Link</Link>

// Substituir useLocation
import { usePathname, useSearchParams } from 'next/navigation';
const pathname = usePathname();
const searchParams = useSearchParams();

// Substituir useParams
// Em Server Components: { params } via props
// Em Client Components: useParams() do Next.js
```

---

#### 3. `i18next` + `react-i18next` → **Next.js i18n Setup**

**Status**: ✅ Compatível, requer configuração Next.js

**Next.js Config** (`next.config.js`):
```javascript
module.exports = {
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en-US'],
  },
};
```

**Usar com App Router** (via middleware ou biblioteca `next-intl`):
```typescript
// app/[locale]/layout.tsx
import { notFound } from 'next/navigation';

export default function LocaleLayout({ children, params }) {
  const { locale } = params;

  if (!['pt-BR', 'en-US'].includes(locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
```

**Alternativa Recomendada**: Usar `next-intl` (biblioteca otimizada para App Router)

---

#### 4. `workbox-*` → **Next.js PWA**

**Vite Service Worker Atual**:
```javascript
// Workbox com Vite plugin
import { precacheAndRoute } from 'workbox-precaching';
```

**Next.js PWA Options**:

**Opção 1**: `next-pwa` (mais popular)
```bash
npm install next-pwa
```

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // ... next config
});
```

**Opção 2**: Custom Service Worker via `public/sw.js`
- Next.js serve arquivos em `public/` staticamente
- Registrar service worker manualmente via script

---

#### 5. `vite` → **Remover (Next.js tem bundler próprio)**

**Arquivos a Remover**:
```
❌ vite.config.js
❌ @vitejs/plugin-react
❌ todos os scripts Vite no package.json
```

**Migrar para Next.js**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## 🗂️ Estrutura de Diretórios Next.js

### Estrutura Alvo (App Router)

```
saraiva-vision-nextjs/
├── app/
│   ├── layout.tsx                 # Root layout (Navbar, Footer)
│   ├── page.tsx                   # HomePage (/)
│   ├── loading.tsx                # Loading UI
│   ├── error.tsx                  # Error boundary
│   ├── not-found.tsx              # 404 page
│   │
│   ├── servicos/
│   │   ├── page.tsx               # /servicos
│   │   ├── [serviceId]/
│   │   │   └── page.tsx           # /servicos/:id
│   │   └── loading.tsx
│   │
│   ├── blog/
│   │   ├── page.tsx               # /blog (lista)
│   │   ├── [slug]/
│   │   │   ├── page.tsx           # /blog/:slug
│   │   │   └── opengraph-image.tsx # OG image dynamic
│   │   └── loading.tsx
│   │
│   ├── podcast/
│   │   ├── page.tsx               # /podcast
│   │   ├── [slug]/
│   │   │   └── page.tsx           # /podcast/:slug
│   │   └── loading.tsx
│   │
│   ├── sobre/
│   │   └── page.tsx               # /sobre
│   │
│   ├── lentes/
│   │   └── page.tsx               # /lentes
│   │
│   ├── faq/
│   │   └── page.tsx               # /faq
│   │
│   ├── privacy/
│   │   └── page.tsx               # /privacy
│   │
│   ├── api/                       # Route Handlers (substituem Express)
│   │   ├── contact/
│   │   │   └── route.ts           # POST /api/contact
│   │   ├── reviews/
│   │   │   └── route.ts           # GET /api/reviews
│   │   └── instagram/
│   │       └── route.ts           # GET /api/instagram
│   │
│   └── globals.css                # Tailwind imports
│
├── components/
│   ├── server/                    # Server Components
│   │   ├── BlogPostLayout.tsx
│   │   ├── FooterNAP.tsx
│   │   └── ...
│   │
│   ├── client/                    # Client Components
│   │   ├── Navbar.tsx
│   │   ├── Contact.tsx
│   │   ├── AudioPlayer.tsx
│   │   └── ...
│   │
│   └── ui/                        # Shared UI (Client)
│       ├── button.tsx
│       ├── toast.tsx
│       └── ...
│
├── lib/
│   ├── data/
│   │   └── blogPosts.ts           # Blog data (pode ser async)
│   ├── utils/
│   │   └── ...
│   └── schemas/
│       └── schemaMarkup.ts        # Schema.org helpers
│
├── public/
│   ├── images/
│   ├── blog/
│   ├── favicon.ico
│   └── sw.js                      # Service Worker (se custom)
│
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

---

## 🚀 Otimizações Next.js Planejadas

### 1. Image Optimization

**Antes (React)**:
```jsx
<img src="/blog/image.jpg" alt="..." />
```

**Depois (Next.js)**:
```tsx
import Image from 'next/image';

<Image
  src="/blog/image.jpg"
  alt="..."
  width={800}
  height={600}
  priority={isAboveFold}
/>
```

**Benefícios**:
- ✅ Lazy loading automático
- ✅ Responsive images (srcset)
- ✅ WebP/AVIF automático
- ✅ Placeholder blur

---

### 2. Metadata & SEO

**Dynamic Metadata** (blog posts):
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: ['Dr. Philipe Saraiva'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}
```

---

### 3. Loading & Error States

**Loading UI** (`app/blog/loading.tsx`):
```tsx
export default function Loading() {
  return <BlogPostSkeleton />;
}
```

**Error Boundary** (`app/blog/error.tsx`):
```tsx
'use client'

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Erro ao carregar post</h2>
      <button onClick={() => reset()}>Tentar novamente</button>
    </div>
  );
}
```

---

### 4. Data Fetching (Server Components)

**Antes (React - Client-side fetch)**:
```jsx
const [posts, setPosts] = useState([]);
useEffect(() => {
  fetch('/api/blog').then(r => r.json()).then(setPosts);
}, []);
```

**Depois (Next.js - Server Component)**:
```tsx
async function getBlogPosts() {
  // Fetch diretamente no servidor
  const posts = await import('@/lib/data/blogPosts');
  return posts.default;
}

export default async function BlogPage() {
  const posts = await getBlogPosts(); // Sem useState/useEffect!

  return <BlogList posts={posts} />;
}
```

---

### 5. Static Generation (ISR)

**Blog Posts** - Gerar estaticamente:
```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getBlogPosts();

  return posts.map(post => ({
    slug: post.slug,
  }));
}

// Regenerar a cada 1 hora (ISR)
export const revalidate = 3600;
```

---

### 6. Route Handlers (API)

**Antes (Express.js)**:
```javascript
// api/contact/index.js
app.post('/api/contact', async (req, res) => {
  // ...
});
```

**Depois (Next.js Route Handler)**:
```typescript
// app/api/contact/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Validação com Zod
  const validated = contactSchema.parse(body);

  // Send email via Resend
  await resend.emails.send({...});

  return Response.json({ success: true });
}
```

---

## 📋 Checklist de Migração

### Fase 1: Setup Inicial
- [ ] Instalar Next.js 14+: `npx create-next-app@latest`
- [ ] Configurar TypeScript (recomendado)
- [ ] Migrar Tailwind config
- [ ] Configurar path aliases (`@/*`)
- [ ] Setup ESLint Next.js

### Fase 2: Estrutura & Layout
- [ ] Criar `app/layout.tsx` (root layout)
- [ ] Migrar Navbar para Client Component
- [ ] Migrar EnhancedFooter (híbrido)
- [ ] Criar `app/loading.tsx` e `app/error.tsx`
- [ ] Migrar CSS global (`app/globals.css`)

### Fase 3: Páginas Estáticas
- [ ] Migrar HomePage (`app/page.tsx`)
- [ ] Migrar AboutPage (`app/sobre/page.tsx`)
- [ ] Migrar ServicesPage (`app/servicos/page.tsx`)
- [ ] Migrar FAQPage (`app/faq/page.tsx`)
- [ ] Migrar LensesPage (`app/lentes/page.tsx`)
- [ ] Migrar PrivacyPage (`app/privacy/page.tsx`)

### Fase 4: Dynamic Routes
- [ ] Blog: `app/blog/page.tsx` + `app/blog/[slug]/page.tsx`
- [ ] Podcast: `app/podcast/page.tsx` + `app/podcast/[slug]/page.tsx`
- [ ] Services: `app/servicos/[serviceId]/page.tsx`

### Fase 5: Componentes
- [ ] Classificar todos componentes (Server vs Client)
- [ ] Adicionar `'use client'` nos Client Components
- [ ] Refatorar componentes híbridos
- [ ] Migrar framer-motion components (Client)
- [ ] Migrar formulários (Client)

### Fase 6: SEO & Metadata
- [ ] Converter SEOHead para metadata exports
- [ ] Implementar generateMetadata() para dynamic routes
- [ ] Adicionar opengraph-image.tsx (blog posts)
- [ ] Migrar Schema.org para JSON-LD em metadata

### Fase 7: APIs & Data Fetching
- [ ] Migrar `/api/contact` para Route Handler
- [ ] Migrar `/api/reviews` para Route Handler
- [ ] Migrar `/api/instagram` para Route Handler
- [ ] Implementar server-side data fetching
- [ ] Configurar ISR/revalidation

### Fase 8: Otimizações
- [ ] Substituir `<img>` por `<Image>`
- [ ] Implementar loading states
- [ ] Implementar error boundaries
- [ ] Configurar next.config.js (images, redirects, headers)
- [ ] Setup PWA (next-pwa ou custom)

### Fase 9: i18n
- [ ] Configurar next-intl ou Next.js i18n
- [ ] Migrar traduções
- [ ] Implementar LanguageSwitcher Client Component
- [ ] Testar alternância de idiomas

### Fase 10: Testes & QA
- [ ] Executar Lighthouse (Performance, SEO, Accessibility)
- [ ] Testar todas as rotas
- [ ] Validar formulários
- [ ] Testar service worker/PWA
- [ ] Verificar Core Web Vitals
- [ ] Testar responsividade mobile

---

## ⚠️ Pontos de Atenção

### 1. Service Worker (Workbox)
- Next.js não tem suporte nativo para Workbox
- Opções: `next-pwa` ou custom service worker
- Testar offline functionality após migração

### 2. Environment Variables
- Renomear `VITE_*` para `NEXT_PUBLIC_*` (client-side)
- Variáveis server-only não precisam do prefixo

### 3. Blog Data (`src/data/blogPosts.js`)
- Manter estrutura atual (compatível)
- Considerar migrar para TypeScript (`.ts`)
- Pode usar async data fetching no Server Component

### 4. Google Maps API
- Continuar usando `@googlemaps/js-api-loader`
- Manter como Client Component
- Possível otimização: lazy load via dynamic import

### 5. Instagram Feed
- API fetching pode migrar para Server Component
- UI interativa permanece Client Component
- Considerar SSR para performance

---

## 📈 Benefícios Esperados

### Performance
- ⚡ **FCP** (First Contentful Paint): -40%
- ⚡ **LCP** (Largest Contentful Paint): -50%
- ⚡ **TTI** (Time to Interactive): -30%
- 📦 **Bundle Size**: -20% (tree shaking otimizado)

### SEO
- 🔍 **Indexação**: +100% (Server-Side Rendering)
- 🚀 **Core Web Vitals**: Excelente (>90 Lighthouse)
- 📊 **Metadata**: Dinâmica + Open Graph otimizado

### DX (Developer Experience)
- ✅ File-based routing (mais intuitivo)
- ✅ TypeScript first-class support
- ✅ Built-in optimizations
- ✅ Server Components (less client JS)

---

## 🎯 Próximos Passos

1. ✅ **Análise Completa** (CONCLUÍDO)
2. ⏳ **Setup Next.js Project** (próximo)
3. ⏳ **Migrar Layout & Páginas Estáticas**
4. ⏳ **Migrar Dynamic Routes**
5. ⏳ **Migrar APIs**
6. ⏳ **Testes & Otimizações**

---

**Documento criado em**: 2025-10-02
**Última atualização**: 2025-10-02
