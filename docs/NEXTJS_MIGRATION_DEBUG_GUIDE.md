# 🔍 Guia de Depuração - Migração React para Next.js (App Router)

> **Projeto**: Saraiva Vision Site  
> **Status**: Migração Completa (Next.js 15.5.4 + App Router)  
> **Data**: Outubro 2025  
> **Objetivo**: Diagnosticar e resolver problemas de migração de forma sistemática

---

## 📋 Contexto do Projeto

### Arquitetura Atual

| Categoria | Especificação |
|-----------|---------------|
| **Monorepo** | Não (repositório único) |
| **Gerenciador** | npm |
| **Linguagem** | TypeScript + JavaScript |
| **Versões** | React 18.2.0, Next.js 15.5.4 |
| **Router Anterior** | React Router 6 (Vite/SPA) |
| **Router Atual** | Next.js App Router |
| **Estado Global** | React Context + Hooks |
| **Data Fetching** | fetch nativo, SWR em alguns componentes |
| **CSS** | Tailwind CSS (sem CSS Modules) |
| **Imagens** | next/image (migração em andamento), assets em `/public` |
| **Fontes** | next/font/google (Inter) |
| **Autenticação** | Custom (sem NextAuth) |
| **Hospedagem** | VPS Nativo (Nginx + Node.js) |
| **Deployment** | Scripts customizados (não Vercel) |

### Estrutura de Pastas Atual

```
saraiva-vision-site/
├── app/                           # Next.js App Router (PRINCIPAL)
│   ├── layout.tsx                 # Root layout com I18n, fonts
│   ├── page.tsx                   # Homepage com profile selector
│   ├── globals.css                # Tailwind imports
│   ├── error.tsx                  # Error boundary global
│   ├── not-found.tsx              # 404 page
│   ├── loading.tsx                # Loading state global
│   ├── sitemap.ts                 # Dynamic sitemap
│   │
│   ├── api/                       # Route Handlers (15 APIs)
│   │   ├── appointments/
│   │   ├── blog/
│   │   ├── contact/
│   │   ├── health/
│   │   ├── instagram/
│   │   ├── laas/
│   │   ├── profile/
│   │   ├── reviews/
│   │   └── subscription/
│   │
│   ├── blog/
│   │   ├── page.tsx              # Blog index (Server Component)
│   │   └── [slug]/
│   │       └── page.tsx          # Dynamic posts + generateStaticParams
│   │
│   ├── familiar/                 # Perfil Família
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── jovem/                    # Perfil Jovem
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── assinatura/           # Sistema Stripe
│   │
│   └── senior/                   # Perfil Sênior (WCAG AAA)
│       ├── layout.tsx
│       └── page.tsx
│
├── src/                          # Legacy Vite/React (EM DESUSO)
│   ├── components/               # Componentes reutilizáveis (compartilhados)
│   ├── hooks/
│   ├── utils/
│   ├── services/
│   └── data/
│
├── middleware.ts                 # Edge Middleware (Profile Detection)
├── next.config.js                # Next.js config (standalone output)
├── tailwind.config.js            # Tailwind setup
└── tsconfig.json                # TypeScript config (paths aliases)
```

### Objetivo de Renderização por Rota

| Rota | Estratégia | Motivo |
|------|-----------|--------|
| `/` | SSR | Homepage dinâmica com profile selector |
| `/blog` | SSG + ISR | Posts estáticos, revalidação a cada 3600s |
| `/blog/[slug]` | SSG | generateStaticParams pré-renderiza posts |
| `/api/*` | Edge/Node | Route handlers para integrações externas |
| `/familiar/*` | SSR | Conteúdo personalizado por perfil |
| `/jovem/*` | SSR | Animações e interatividade (client components) |
| `/senior/*` | SSR | Acessibilidade WCAG AAA |
| `/contato` | CSR | Formulário com validação client-side |
| `/agendamento` | CSR | Integração com calendário e APIs |

---

## 🚨 Checklist de Diagnóstico Rápido

Execute estas verificações antes de depurar:

### 1. Verificar Build

```bash
# Limpar cache e rebuild
rm -rf .next node_modules/.cache
npm run build

# Verificar erros de TypeScript (se houver)
npx tsc --noEmit

# Verificar ESLint
npm run lint
```

### 2. Verificar Estrutura de Arquivos

```bash
# Confirmar que app/ existe e tem layout.tsx
ls -la app/layout.tsx

# Verificar API routes
find app/api -name "route.ts" -o -name "route.tsx"

# Verificar páginas dinâmicas
find app -name "[*.tsx"
```

### 3. Verificar Dependências

```bash
# Confirmar versão do Next.js
npm list next

# Verificar conflitos de peer dependencies
npm ls react react-dom
```

### 4. Verificar Middleware

```bash
# Confirmar que middleware.ts está na raiz
ls -la middleware.ts

# Testar profile detection
curl -I http://localhost:3000/ -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)"
```

---

## 🔧 Problemas Comuns por Categoria

### 1. Renderização (SSR/SSG/ISR/CSR)

#### ❌ Problema: Hydration Mismatch

**Sintoma**:
```
Error: Hydration failed because the initial UI does not match what was rendered on the server.
```

**Causa Raiz**:
- Acesso a APIs do browser (window, document, localStorage) em Server Components
- Renderização condicional baseada em estado client-side no servidor

**Solução Minimalista**:

```tsx
// ❌ ERRADO (Server Component acessando window)
export default function Component() {
  const width = window.innerWidth; // Quebra no SSR
  return <div>{width}</div>;
}

// ✅ CORRETO (Client Component com guard)
'use client';
import { useEffect, useState } from 'react';

export default function Component() {
  const [width, setWidth] = useState<number | null>(null);
  
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);
  
  if (width === null) return <div>Loading...</div>;
  return <div>{width}</div>;
}
```

**Verificação**:
```bash
# Buscar uso de window/document em Server Components
grep -RIn --include \*.{ts,tsx} -E "window|document" app | grep -v '"use client"'
```

---

#### ❌ Problema: Server Component Usando Hooks

**Sintoma**:
```
Error: You're importing a component that needs useState. It only works in a Client Component.
```

**Causa Raiz**:
- Uso de hooks (useState, useEffect, useContext) em Server Components
- Componente sem diretiva `'use client'`

**Solução**:

```tsx
// ❌ ERRADO (Server Component com hook)
export default function Page() {
  const [count, setCount] = useState(0); // Erro!
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ CORRETO (Client Component)
'use client';
import { useState } from 'react';

export default function Page() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Alternativa Robusta** (Composição Server + Client):

```tsx
// app/page.tsx (Server Component)
import Counter from '@/components/Counter';

export default async function Page() {
  const data = await fetch('https://api.example.com/data').then(r => r.json());
  
  return (
    <div>
      <h1>Servidor: {data.title}</h1>
      <Counter initialCount={data.count} />
    </div>
  );
}

// components/Counter.tsx (Client Component)
'use client';
import { useState } from 'react';

export default function Counter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

---

### 2. Roteamento e Segmentos Dinâmicos

#### ❌ Problema: 404 em Rotas Dinâmicas (SSG)

**Sintoma**:
- `/blog/meu-post` retorna 404 em produção
- Funciona em dev (`npm run dev`) mas não em build (`npm run build`)

**Causa Raiz**:
- Falta `generateStaticParams` para pre-renderizar rotas dinâmicas
- Build estático não sabe quais páginas gerar

**Solução**:

```tsx
// app/blog/[slug]/page.tsx

// ✅ OBRIGATÓRIO para SSG de rotas dinâmicas
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  
  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`).then(r => r.json());
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
```

**Verificação**:
```bash
# Verificar se generateStaticParams existe
grep -r "generateStaticParams" app

# Testar build localmente
npm run build
npm run start
curl http://localhost:3000/blog/test-post
```

---

#### ❌ Problema: Trailing Slash Causando 404

**Sintoma**:
- `/blog/` funciona mas `/blog` retorna 404 (ou vice-versa)

**Solução no Next.js**:

```javascript
// next.config.js
const nextConfig = {
  trailingSlash: false, // Consistente: sem trailing slash
  // ou
  trailingSlash: true, // Consistente: com trailing slash
};

export default nextConfig;
```

**Solução no Nginx** (VPS):

```nginx
# nginx.conf
location /blog {
    try_files $uri $uri/ /blog/index.html =404;
}

# Redirect trailing slash
rewrite ^/(.*)/$ /$1 permanent;
```

---

### 3. Data Fetching (Cache, Revalidate, Dynamic)

#### ❌ Problema: Cache Desatualizado (ISR não Revalida)

**Sintoma**:
- Dados antigos aparecem mesmo após atualização no backend
- Blog posts não atualizam após deploy

**Causa Raiz**:
- Falta configuração de `revalidate` ou `cache`
- Cache padrão do Next.js é agressivo (cache indefinido)

**Solução com ISR**:

```tsx
// app/blog/page.tsx

// ✅ Revalidar a cada 1 hora (3600 segundos)
export const revalidate = 3600;

export default async function BlogIndex() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 3600 },
  }).then(r => r.json());
  
  return (
    <div>
      {posts.map((post: any) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

**Alternativa com No-Cache**:

```tsx
// app/api/health/route.ts

export async function GET() {
  const data = await fetch('https://api.example.com/status', {
    cache: 'no-store', // Sempre busca dados frescos
  }).then(r => r.json());
  
  return Response.json(data);
}
```

**Verificação**:
```bash
# Buscar rotas sem política de cache definida
find app -name "page.tsx" -exec grep -L "revalidate\|cache:" {} \;

# Testar headers de cache
curl -I http://localhost:3000/blog
```

---

#### ❌ Problema: Fetch em Client Component

**Sintoma**:
- Loading spinners lentos
- Dados não aparecem no primeiro render
- SEO ruim (Google não vê conteúdo)

**Solução (Mover para Server Component)**:

```tsx
// ❌ EVITAR (Client Component com fetch)
'use client';
import { useEffect, useState } from 'react';

export default function Page() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  
  if (!data) return <div>Loading...</div>;
  return <div>{data.title}</div>;
}

// ✅ PREFERIR (Server Component)
export default async function Page() {
  const data = await fetch('/api/data').then(r => r.json());
  
  return <div>{data.title}</div>;
}
```

---

### 4. SEO e Metadata

#### ❌ Problema: Meta Tags Não Aparecem

**Sintoma**:
- `<head>` não tem meta tags personalizadas
- Google Search Console mostra títulos genéricos

**Solução com Metadata API**:

```tsx
// app/blog/[slug]/page.tsx

import type { Metadata } from 'next';

// ✅ Metadata estática
export const metadata: Metadata = {
  title: 'Meu Blog',
  description: 'Artigos sobre oftalmologia',
};

// ✅ Metadata dinâmica (para rotas dinâmicas)
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`)
    .then(r => r.json());
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: post.coverImage }],
    },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`)
    .then(r => r.json());
  
  return <article>{post.content}</article>;
}
```

**Verificação**:
```bash
# Verificar se metadata está implementada
grep -r "export.*metadata\|generateMetadata" app

# Testar meta tags no HTML
curl http://localhost:3000/blog/test-post | grep "<title>"
```

---

### 5. Assets (Imagens e Fontes)

#### ❌ Problema: `<img>` Não Otimizadas

**Sintoma**:
- Imagens grandes sem lazy loading
- Lighthouse score baixo (Performance)

**Solução com next/image**:

```tsx
// ❌ EVITAR
<img src="/images/hero.jpg" alt="Hero" />

// ✅ USAR next/image
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // para imagens acima da dobra
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

**Migração em Massa**:

```bash
# Encontrar <img> não migrados
grep -r '<img' app src --include="*.tsx" --include="*.jsx"
```

---

#### ❌ Problema: Fontes Não Carregam (FOUT/FOUC)

**Sintoma**:
- Flash de texto sem estilo
- Fontes do Google lentas

**Solução com next/font**:

```tsx
// app/layout.tsx

import { Inter, Roboto_Mono } from 'next/font/google';

// ✅ Pré-carrega fontes no build
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

**Verificação**:
```bash
# Confirmar que fontes estão no layout.tsx
grep -A 5 "next/font" app/layout.tsx

# Testar FOUT no DevTools (Network -> Disable Cache)
```

---

### 6. CSS e Estilização (FOUC, Tailwind)

#### ❌ Problema: Tailwind Classes Não Aplicadas

**Sintoma**:
- Estilos não aparecem em produção
- Classes Tailwind "desaparecem" no build

**Causa Raiz**:
- Falta de paths corretos no `tailwind.config.js`
- Conteúdo não incluído no purge/content

**Solução**:

```javascript
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}', // Se usar src/
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**Verificação**:
```bash
# Verificar se globals.css importa Tailwind
grep -A 3 "tailwindcss" app/globals.css

# Rebuild e verificar bundle CSS
npm run build
ls -lh .next/static/css/
```

---

### 7. Autenticação e Middleware

#### ❌ Problema: Middleware Muito Lento (>100ms)

**Sintoma**:
- Páginas lentas para carregar
- Header `X-Middleware-Duration` alto

**Solução (Otimizar Middleware)**:

```typescript
// middleware.ts

// ✅ Edge Runtime (global, low-latency)
export const config = {
  runtime: 'edge',
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)).*)',
  ],
};

export default async function middleware(request: NextRequest) {
  const startTime = Date.now();
  
  // ✅ Lógica síncrona (sem await desnecessário)
  const profile = request.cookies.get('profile')?.value || 'familiar';
  
  const response = NextResponse.next();
  response.headers.set('X-User-Profile', profile);
  
  // ⚠️ EVITAR: Chamadas de API no middleware
  // const user = await fetch('/api/user'); // Lento!
  
  const duration = Date.now() - startTime;
  if (duration > 50) {
    console.warn(`[Middleware] Slow execution: ${duration}ms`);
  }
  
  return response;
}
```

**Verificação**:
```bash
# Medir performance do middleware
curl -I http://localhost:3000/ -H "X-Debug: true"

# Verificar logs do Next.js
npm run dev
```

---

### 8. Configuração e Build

#### ❌ Problema: Build Falha com TypeScript Errors

**Sintoma**:
```
Type error: Property 'X' does not exist on type 'Y'
```

**Solução Temporária** (apenas em migração):

```javascript
// next.config.js

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Temporário durante migração
  },
  eslint: {
    ignoreDuringBuilds: true, // ⚠️ Temporário
  },
};

export default nextConfig;
```

**Solução Robusta** (Corrigir tipos):

```bash
# Instalar tipos faltantes
npm install --save-dev @types/node @types/react @types/react-dom

# Verificar erros
npx tsc --noEmit

# Corrigir imports
```

---

#### ❌ Problema: Variáveis de Ambiente Não Funcionam

**Sintoma**:
- `process.env.NEXT_PUBLIC_API_URL` retorna `undefined`

**Solução**:

```bash
# .env.local (para desenvolvimento)
NEXT_PUBLIC_API_URL=https://api.example.com
API_SECRET_KEY=secret123 # Apenas servidor

# .env.production (para build de produção)
NEXT_PUBLIC_API_URL=https://api.saraivavision.com.br
```

**Regras**:
- Variáveis com `NEXT_PUBLIC_` são expostas no cliente
- Variáveis sem prefixo são apenas servidor (API routes, SSR)
- Reiniciar dev server após mudar `.env`

**Verificação**:
```bash
# Testar no servidor
node -e "console.log(process.env.API_SECRET_KEY)"

# Testar no cliente
curl http://localhost:3000/ | grep "NEXT_PUBLIC_API_URL"
```

---

### 9. Ambiente e Variáveis

#### ❌ Problema: Code Split Excessivo (Bundle Gigante)

**Sintoma**:
- Arquivos JS > 500KB
- Lighthouse score baixo

**Solução com Dynamic Import**:

```tsx
// ❌ Import estático (carrega tudo)
import HeavyComponent from '@/components/HeavyComponent';

// ✅ Dynamic import (lazy loading)
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Carregando...</div>,
  ssr: false, // Desabilita SSR se não for necessário
});

export default function Page() {
  return <HeavyComponent />;
}
```

**Verificação**:
```bash
# Analisar bundle
npm run build
npx @next/bundle-analyzer

# Verificar tamanho dos chunks
ls -lh .next/static/chunks/
```

---

## 📦 Scripts de Verificação Rápida

### Script 1: Detectar "use client" Faltante

```bash
#!/bin/bash
# detect-client-components.sh

echo "🔍 Buscando componentes que precisam de 'use client'..."

# Buscar hooks de React sem 'use client'
grep -r "useState\|useEffect\|useContext" app --include="*.tsx" --include="*.ts" \
  | grep -v '"use client"' \
  | while read -r line; do
    echo "⚠️  $line"
  done

echo "✅ Busca completa!"
```

### Script 2: Validar Metadata

```bash
#!/bin/bash
# validate-metadata.sh

echo "🔍 Verificando metadata em rotas..."

find app -name "page.tsx" | while read -r file; do
  if ! grep -q "metadata\|generateMetadata" "$file"; then
    echo "❌ Falta metadata: $file"
  else
    echo "✅ OK: $file"
  fi
done
```

### Script 3: Verificar Imagens Não Otimizadas

```bash
#!/bin/bash
# check-unoptimized-images.sh

echo "🔍 Buscando <img> tags não otimizadas..."

grep -r '<img' app src --include="*.tsx" --include="*.jsx" \
  | grep -v "next/image" \
  | while read -r line; do
    echo "⚠️  $line"
  done

echo "✅ Sugestão: Use <Image> do next/image"
```

---

## 🧪 Plano de Teste

### 1. Testes de Navegação

```bash
# Rotas estáticas
curl -I http://localhost:3000/
curl -I http://localhost:3000/blog
curl -I http://localhost:3000/contato

# Rotas dinâmicas
curl -I http://localhost:3000/blog/primeiro-post
curl -I http://localhost:3000/familiar
curl -I http://localhost:3000/jovem
curl -I http://localhost:3000/senior

# 404 esperado
curl -I http://localhost:3000/pagina-inexistente

# API routes
curl http://localhost:3000/api/health
curl http://localhost:3000/api/blog
```

### 2. Snapshot de HTML (Hydration Check)

```bash
# Capturar HTML renderizado no servidor
curl http://localhost:3000/ > ssr-snapshot.html

# Comparar com HTML após hidratação (usar DevTools)
# Buscar diferenças que causam hydration mismatch
```

### 3. Lighthouse e Web Vitals

```bash
# Rodar Lighthouse (requer Chrome)
npx lighthouse http://localhost:3000 --view

# Métricas esperadas:
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 90+
# - SEO: 100
```

### 4. Teste de Revalidação (ISR)

```bash
# 1. Build com ISR
npm run build
npm run start

# 2. Acessar rota com revalidate
curl http://localhost:3000/blog

# 3. Verificar headers de cache
# Cache-Control: s-maxage=3600, stale-while-revalidate

# 4. Atualizar conteúdo no backend
# 5. Aguardar tempo de revalidate (ex: 1 hora)
# 6. Confirmar que conteúdo foi atualizado
```

---

## ✅ Checklist Final - Pronto para Produção

### Build e TypeScript

- [ ] `npm run build` executa sem erros
- [ ] TypeScript compila sem erros (`npx tsc --noEmit`)
- [ ] ESLint não tem erros críticos (`npm run lint`)
- [ ] Bundle size < 250KB por chunk principal

### Renderização

- [ ] Nenhum hydration mismatch no console
- [ ] Server Components não usam hooks (useState, useEffect)
- [ ] Client Components têm `'use client'` no topo
- [ ] APIs do browser (window, document) apenas em Client Components

### Roteamento

- [ ] Todas as rotas retornam 200 OK (ou 404 esperado)
- [ ] Rotas dinâmicas têm `generateStaticParams` (para SSG)
- [ ] Trailing slash consistente (com ou sem)
- [ ] Middleware executa em < 50ms

### Data Fetching

- [ ] Rotas com ISR têm `export const revalidate = X`
- [ ] Fetch com `cache: 'no-store'` onde necessário
- [ ] Dados sensíveis apenas em Server Components/API Routes
- [ ] SWR/React Query apenas em Client Components (se necessário)

### SEO

- [ ] Metadata API implementada em todas as rotas
- [ ] `generateMetadata` para rotas dinâmicas
- [ ] Sitemap.xml gerado (`app/sitemap.ts`)
- [ ] Robots.txt configurado
- [ ] Open Graph tags presentes

### Assets

- [ ] Imagens migradas para `next/image`
- [ ] Fontes migradas para `next/font`
- [ ] `priority` em imagens above-the-fold
- [ ] `placeholder="blur"` em imagens grandes

### CSS

- [ ] Tailwind config inclui todos os paths (`app/**/*.tsx`)
- [ ] `globals.css` importa Tailwind (`@tailwind base`, etc.)
- [ ] Sem FOUC (Flash of Unstyled Content)
- [ ] Sem CSS-in-JS (styled-components) em Server Components

### Configuração

- [ ] `next.config.js` válido e otimizado
- [ ] Variáveis de ambiente em `.env.local` e `.env.production`
- [ ] `NEXT_PUBLIC_*` para variáveis do cliente
- [ ] `tsconfig.json` com paths aliases corretos

### Middleware

- [ ] Edge runtime configurado (`export const config`)
- [ ] Matcher exclui assets estáticos
- [ ] Sem chamadas de API bloqueantes
- [ ] Cookies seguros (HttpOnly, Secure em prod)

### Performance

- [ ] Lighthouse Performance > 90
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Time to Interactive (TTI) < 3.5s

### Testes

- [ ] Navegação manual em todas as rotas
- [ ] Testes automatizados (se existirem)
- [ ] Teste de revalidação ISR
- [ ] Teste de middleware (cookies, profile detection)

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev                    # Next.js dev server (port 3000)

# Build
npm run build                  # Produção
npm run start                  # Servidor de produção

# Testes
npm run test                   # Jest
npm run test:e2e               # Playwright E2E

# Linting
npm run lint                   # ESLint
npm run validate:api           # Validar API routes

# Análise
npx @next/bundle-analyzer      # Análise de bundle
npx lighthouse http://localhost:3000  # Lighthouse

# Debugging
node --inspect node_modules/.bin/next dev  # Node debugger
```

---

## 📚 Referências

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Migrating from Vite](https://nextjs.org/docs/app/building-your-application/upgrading/from-vite)
- [Hydration Errors Guide](https://nextjs.org/docs/messages/react-hydration-error)
- [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

---

## 🤝 Contribuindo

Se encontrar problemas não documentados:

1. Adicione à seção relevante deste guia
2. Inclua sintoma, causa raiz e solução
3. Adicione script de verificação se aplicável
4. Teste a solução antes de commitar

---

**Última Atualização**: Outubro 2025  
**Responsável**: Equipe Saraiva Vision  
**Status do Projeto**: ✅ Migração Completa (Next.js 15.5.4)
