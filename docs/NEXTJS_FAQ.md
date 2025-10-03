# Next.js Migration FAQ

Perguntas frequentes sobre a migração de React + Vite para Next.js 15.

---

## 🤔 Perguntas Gerais

### Por que migrar para Next.js?

**SEO Crítico**: Site médico precisa de indexação perfeita no Google. CSR (Client-Side Rendering) atual dificulta:
- ❌ Crawlers veem HTML vazio (mesmo com prerender)
- ❌ TTI (Time to Interactive) alto = bounce rate maior
- ❌ Blog posts não aparecem em rich snippets do Google

**Next.js resolve:**
- ✅ SSR/SSG = HTML completo para crawlers
- ✅ Metadata API = Open Graph e Schema.org nativos
- ✅ ISR (Incremental Static Regeneration) = blog sempre atualizado
- ✅ Edge Runtime = latência <50ms global

### Quando migrar?

**Recomendado**: Q1 2025 (Janeiro-Março)

**Motivos:**
- ✅ Next.js 15 stable (lançado em Outubro 2024)
- ✅ Turbopack production-ready
- ✅ Período pós-férias (baixo tráfego)
- ✅ 3 meses para testes antes do pico (meio do ano)

### Quanto tempo leva?

**Estimativa**: 9 semanas (2+ meses)

| Fase | Duração |
|------|---------|
| Setup + POC | 1 semana |
| Páginas estáticas | 2 semanas |
| Blog + SEO | 1 semana |
| Páginas dinâmicas | 2 semanas |
| API Routes | 1 semana |
| Compliance + Testes | 1 semana |
| Deploy + Cutover | 1 semana |

**Acelerar**: 6 semanas com 2 desenvolvedores full-time.

---

## 🏗 Arquitetura e Infraestrutura

### Next.js substitui Vite completamente?

**Sim e não.**

**Substitui:**
- ✅ Vite (bundler) → Next.js Turbopack
- ✅ React Router → Next.js App Router
- ✅ react-helmet → Metadata API
- ✅ Scripts de prerender → SSG/ISR nativo

**Mantém:**
- ✅ React 18 (mesmo framework)
- ✅ Tailwind CSS (mesma config)
- ✅ Radix UI (componentes compatíveis)
- ✅ TypeScript (mesmo tsconfig.json)

### Onde hospedar Next.js?

**Opção 1: Vercel (Recomendado para Saraiva Vision)**

**Prós:**
- ✅ Zero config (criadores do Next.js)
- ✅ Edge Network global (<50ms latency)
- ✅ Preview deploys automáticos
- ✅ Analytics integrado
- ✅ Image Optimization incluído
- ✅ HTTPS automático

**Contras:**
- ❌ Custo: $20/mês (Pro plan)
- ❌ Vendor lock-in parcial

**Opção 2: VPS Atual (31.97.129.78)**

**Prós:**
- ✅ Controle total
- ✅ Sem custos adicionais
- ✅ Data residency Brasil (compliance LGPD)

**Contras:**
- ❌ Manutenção manual (PM2, Nginx)
- ❌ Sem Edge Network
- ❌ Scaling manual

**Recomendação**: **Vercel para frontend + VPS para APIs críticas**.

### Preciso mudar o VPS?

**Não.** Duas estratégias:

**Estratégia 1: Híbrida (Recomendado)**
```
Frontend (Next.js SSG) → Vercel Edge
Backend APIs → VPS Brasil (Google Reviews, analytics)
```

**Estratégia 2: Tudo no VPS**
```
Next.js → PM2 (porta 3000)
Nginx → Reverse proxy
```

**Config Nginx:**
```nginx
location / {
  proxy_pass http://localhost:3000;
}
```

---

## 🧩 Componentes e Código

### Todos componentes precisam de 'use client'?

**Não!** Apenas ~60% dos componentes.

**Necessita 'use client':**
- ✅ Componentes com hooks (useState, useEffect, etc.)
- ✅ Event handlers (onClick, onChange, etc.)
- ✅ Browser APIs (window, localStorage, etc.)
- ✅ Libraries com hooks (Framer Motion, Radix UI)

**NÃO necessita:**
- ✅ Componentes estáticos (apenas renderização)
- ✅ Layout e estrutura
- ✅ Footer, Header (sem interação)

**Exemplo Saraiva Vision:**
- ❌ `Footer.jsx` → Server Component
- ✅ `Navbar.jsx` (mobile menu) → Client Component
- ✅ `ContactForm.jsx` (useState) → Client Component
- ❌ `CFMCompliance.jsx` → Server Component

### Radix UI funciona no Next.js?

**Sim**, mas todos componentes Radix precisam de `'use client'`.

**Antes (Vite):**
```jsx
// src/components/ui/dialog.jsx
import * as DialogPrimitive from '@radix-ui/react-dialog';
export const Dialog = DialogPrimitive.Root;
```

**Depois (Next.js):**
```tsx
// src/components/ui/dialog.tsx
'use client';  // ← Adicionar apenas esta linha

import * as DialogPrimitive from '@radix-ui/react-dialog';
export const Dialog = DialogPrimitive.Root;
```

**Solução**: Criar componentes wrapper Client em `src/components/ui/` e usar em Server Components.

### Framer Motion funciona?

**Sim**, mas precisa de `'use client'`.

**Padrão:**
```tsx
// src/components/AnimatedCard.tsx
'use client';

import { motion } from 'framer-motion';

export default function AnimatedCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {children}
    </motion.div>
  );
}
```

**Uso em Server Component:**
```tsx
// src/app/page.tsx (Server Component)
import AnimatedCard from '@/components/AnimatedCard';

export default function HomePage() {
  return (
    <AnimatedCard>
      <h1>Hello World</h1>
    </AnimatedCard>
  );
}
```

### Como migrar React Router?

**Mudanças principais:**

| React Router | Next.js |
|--------------|---------|
| `<Link to="/sobre">` | `<Link href="/sobre">` |
| `useNavigate()` | `useRouter()` (next/navigation) |
| `useParams()` | `params` prop (pages) |
| `<Routes>` | File-based routing |

**Exemplo:**

**Antes:**
```jsx
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  
  return (
    <nav>
      <Link to="/servicos">Serviços</Link>
      <button onClick={() => navigate('/contato')}>Contato</button>
    </nav>
  );
}
```

**Depois:**
```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

function Navbar() {
  const router = useRouter();
  
  return (
    <nav>
      <Link href="/servicos">Serviços</Link>
      <button onClick={() => router.push('/contato')}>Contato</button>
    </nav>
  );
}
```

---

## 📝 Blog e Conteúdo

### O que acontece com blogPosts.js?

**Converter para Markdown** (arquivo `.md` por post).

**Antes:**
```javascript
// src/data/blogPosts.js
export const blogPosts = [
  {
    id: 'catarata',
    title: 'Catarata: Sintomas e Tratamentos',
    content: '<p>Conteúdo...</p>',
  },
];
```

**Depois:**
```markdown
---
title: "Catarata: Sintomas e Tratamentos"
slug: catarata
publishedAt: 2025-01-15
---

# Catarata: Sintomas e Tratamentos

Conteúdo em Markdown...
```

**Vantagens:**
- ✅ Hot-reload ao editar posts (dev mode)
- ✅ Git-friendly (diff visível)
- ✅ Syntax highlighting em editores
- ✅ Fácil exportar/importar

**Script automático**: `scripts/convert-blog-to-markdown.js`

### Como funciona ISR para blog?

**ISR = Incremental Static Regeneration**

**Estratégia:**
```tsx
// src/app/blog/[slug]/page.tsx

export default async function BlogPost({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  return <Article post={post} />;
}

// ✅ Revalidar a cada 24 horas
export const revalidate = 86400;
```

**Comportamento:**
1. Build time: Gera HTML estático de todos posts
2. Deploy: Servir versão estática (super rápido)
3. Após 24h: Próximo visitante dispara rebuild
4. Novo HTML gerado em background
5. Próximo visitante recebe versão atualizada

**Resultado**: Blog sempre rápido + sempre atualizado.

### Schema.org funciona automático?

**Parcialmente.** Precisa configurar.

**Metadata API:**
```tsx
export const metadata: Metadata = {
  title: 'Catarata - Saraiva Vision',
  description: '...',
  other: {
    '@context': 'https://schema.org',
    '@type': 'MedicalArticle',
    headline: 'Catarata: Sintomas e Tratamentos',
    author: {
      '@type': 'Physician',
      name: 'Dr. Saraiva',
      medicalSpecialty: 'Oftalmologia',
    },
  },
};
```

**Ainda melhor:** Criar componente `<StructuredData>`.

```tsx
// src/components/StructuredData.tsx
export default function StructuredData({ type, data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type,
          ...data,
        }),
      }}
    />
  );
}
```

---

## 🔒 Compliance e Segurança

### CFM compliance funciona no Next.js?

**Sim**, até melhor.

**Server-Side Validation:**
```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateCFM } from '@/lib/cfm-validation';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;
  
  if (url.startsWith('/blog/') || url.startsWith('/artigos/')) {
    const content = extractContent(request);
    const validation = validateCFM(content);
    
    if (!validation.valid) {
      return NextResponse.redirect(new URL('/compliance-error', request.url));
    }
  }
  
  return NextResponse.next();
}
```

**Vantagens:**
- ✅ Validação antes do render
- ✅ Bloqueia conteúdo não-conforme
- ✅ Audit log server-side

### LGPD está garantida?

**Sim.** Next.js facilita:

**Cookie Consent:**
```tsx
// src/app/layout.tsx
import { cookies } from 'next/headers';
import CookieConsent from '@/components/CookieConsent';

export default async function RootLayout({ children }: Props) {
  const cookieStore = cookies();
  const hasConsent = cookieStore.get('cookie-consent');
  
  return (
    <html>
      <body>
        {children}
        {!hasConsent && <CookieConsent />}
      </body>
    </html>
  );
}
```

**API Route:**
```typescript
// src/app/api/consent/route.ts
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.json();
  
  cookies().set('cookie-consent', JSON.stringify({
    analytics: body.analytics,
    marketing: body.marketing,
    timestamp: new Date().toISOString(),
  }), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 31536000, // 1 ano
  });
  
  return Response.json({ success: true });
}
```

---

## 🚀 Performance e SEO

### Next.js é mais rápido que Vite?

**Depende do cenário.**

**Build Time:**
- Vite (ESBuild): **Mais rápido** (~15s para Saraiva Vision)
- Next.js (Turbopack): **Similar** (~20s)

**Runtime (Navegação):**
- Vite (CSR): **Mais lento** (TTI ~3s)
- Next.js (SSR/SSG): **Muito mais rápido** (TTI ~1s)

**SEO:**
- Vite: **Ruim** (crawlers veem HTML vazio)
- Next.js: **Excelente** (HTML completo)

**Veredito para Saraiva Vision:** Next.js **muito melhor**.

### Core Web Vitals melhora?

**Sim, significativamente.**

| Métrica | Atual (Vite) | Meta (Next.js) | Melhoria |
|---------|--------------|----------------|----------|
| **LCP** | 2.8s | < 2.0s | **-28%** |
| **FID** | 120ms | < 100ms | -16% |
| **CLS** | 0.15 | < 0.1 | **-33%** |
| **TTI** | 4.5s | < 3.0s | **-33%** |

**Motivos:**
- ✅ SSR reduz tempo até conteúdo visível
- ✅ Image Optimization automática (WebP/AVIF)
- ✅ Automatic code splitting por rota
- ✅ Edge Runtime = latência <50ms

### Google vai indexar melhor?

**Sim.** Diferença dramática.

**Antes (Vite CSR):**
```html
<!-- O que o Googlebot vê -->
<div id="root"></div>
<script src="/assets/main-abc123.js"></script>
```

**Depois (Next.js SSR):**
```html
<!-- O que o Googlebot vê -->
<html>
  <head>
    <title>Catarata - Saraiva Vision</title>
    <meta name="description" content="...">
    <script type="application/ld+json">
      {"@type": "MedicalArticle", ...}
    </script>
  </head>
  <body>
    <h1>Catarata: Sintomas e Tratamentos</h1>
    <p>Conteúdo completo renderizado...</p>
  </body>
</html>
```

**Resultado:** Rich snippets, Featured snippets, melhor ranking.

---

## 🧪 Testes

### Vitest funciona com Next.js?

**Sim**, mas Jest é mais integrado.

**Recomendação:** Migrar para **Jest** (suporte oficial Next.js).

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}

module.exports = createJestConfig(customJestConfig)
```

**Alternativa:** Continuar com Vitest (adicionar config Next.js).

### Testes E2E mudam?

**Não.** Playwright continua funcionando.

```typescript
// e2e/blog.spec.ts
import { test, expect } from '@playwright/test';

test('blog post loads correctly', async ({ page }) => {
  await page.goto('https://saraivavision.com.br/blog/catarata');
  
  await expect(page.locator('h1')).toContainText('Catarata');
  await expect(page.locator('article')).toBeVisible();
});
```

**Diferença:** Testes ficam **mais rápidos** (SSR = HTML imediato).

---

## 💰 Custos

### Qual o custo adicional?

**Opção 1: Vercel**
- **Free tier**: 100GB bandwidth/mês (suficiente?)
- **Pro**: $20/mês (1TB bandwidth)
- **Enterprise**: Custom pricing

**Estimativa Saraiva Vision:**
- Tráfego atual: ~50GB/mês
- **Free tier suficiente** por 6-12 meses
- Depois: **Pro plan ($20/mês)**

**Opção 2: VPS Atual**
- **Custo adicional: $0** (já pago)
- Manter infraestrutura atual

**Recomendação:** Começar com **Vercel Free**, migrar para Pro se necessário.

### Vale a pena financeiramente?

**ROI (Return on Investment):**

**Custos:**
- Desenvolvimento: 9 semanas × R$ 10.000/semana = **R$ 90.000**
- Hospedagem: $20/mês × 12 = **R$ 1.200/ano**
- **Total Ano 1: R$ 91.200**

**Benefícios:**
- SEO melhor → +30% tráfego orgânico
- Conversão melhor (TTI -33%) → +15% agendamentos
- Menos bounce rate → +20% engagement

**Estimativa:** Se gerar **+10 agendamentos/mês** (conservador), ROI em **6-8 meses**.

---

## 🔄 Migração e Rollback

### Posso migrar incrementalmente?

**Sim.** Estratégia recomendada:

**Fase 1:** Next.js em staging (staging.saraivavision.com.br)
**Fase 2:** Migrar 1 página estática (/sobre)
**Fase 3:** A/B test (50% tráfego Vite, 50% Next.js)
**Fase 4:** Migrar blog
**Fase 5:** Cutover completo

**Nginx proxy por rota:**
```nginx
location /sobre {
  proxy_pass http://localhost:3000;  # Next.js
}

location / {
  root /var/www/saraiva-vite;  # Vite (fallback)
}
```

### E se algo der errado?

**Rollback plan (< 5 minutos):**

```bash
# 1. Reverter DNS (se mudou)
# TTL: 300s

# 2. Ativar backup Vite
sudo systemctl start saraiva-vite
sudo nginx -s reload

# 3. Desativar Next.js
pm2 stop saraiva-nextjs

# 4. Health check
curl https://saraivavision.com.br/api/health
```

**Backup automático:** Manter Vite rodando em paralelo por 1 mês após cutover.

---

## 📚 Recursos e Aprendizado

### Equipe precisa aprender Next.js?

**Sim**, mas curva de aprendizado suave.

**Conhecimento atual (Saraiva Vision):**
- ✅ React 18
- ✅ TypeScript
- ✅ Tailwind CSS

**Precisa aprender:**
- 🆕 App Router (file-based routing)
- 🆕 Server Components vs Client Components
- 🆕 Metadata API (substitui react-helmet)
- 🆕 Data fetching (SSR/SSG/ISR)

**Tempo:** 1-2 semanas de estudo + prática.

**Recursos:**
- [Next.js 15 Docs](https://nextjs.org/docs)
- [App Router Tutorial](https://nextjs.org/learn)
- [Vercel YouTube](https://www.youtube.com/@vercelhq)

### Há documentação em português?

**Parcialmente.**

- ✅ Docs oficiais: Inglês (Google Translate funciona bem)
- ✅ Comunidade BR: [Next.js Brasil Discord](https://discord.gg/nextjs-br)
- ✅ Tutoriais BR: YouTube (Filipe Deschamps, Rocketseat)

---

## 🎯 Recomendação Final

### Vale a pena para Saraiva Vision?

**SIM**, pelos motivos:

1. **SEO Crítico**: Site médico **depende** de Google (80% tráfego)
2. **Compliance**: SSR facilita validação CFM/LGPD
3. **Performance**: -33% TTI = menos bounce, mais conversão
4. **Futuro**: Next.js é o padrão da indústria (React recomenda)
5. **Custo-Benefício**: ROI em 6-8 meses

### Quando começar?

**Recomendação:** **Janeiro 2025**

**Cronograma:**
- Dezembro 2024: Planejamento + aprovação
- Janeiro 2025: Setup + POC
- Fevereiro 2025: Migração páginas + blog
- Março 2025: Testes + deploy staging
- Abril 2025: Cutover produção

**Prazo:** **Q1 2025** (antes do pico de tráfego meio do ano).

---

**Última Atualização**: Outubro 2025
**Próximo Review**: Dezembro 2024
