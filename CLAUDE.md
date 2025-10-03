# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Saraiva Vision** - Plataforma médica oftalmológica com compliance CFM/LGPD

## 🎯 Visão Executiva

Clínica oftalmológica em Caratinga, MG, Brasil. VPS nativo, compliance CFM/LGPD.

**Status**: ✅ Produção | 🏥 Healthcare | 🇧🇷 Brasil | ⚖️ CFM/LGPD
**URL**: https://saraivavision.com.br
**VPS**: 31.97.129.78 (Node.js 22+, Nginx, Redis, SSL Let's Encrypt)

## 🛠 Tech Stack

**🚧 EM MIGRAÇÃO**: React/Vite → Next.js 15 (App Router)

**Atual (Coexistência)**:
- **Legacy**: React 18 + Vite 7.1.7 (em deprecação)
- **Next.js**: 15.5.4 + App Router (produção)
- **Styling**: Tailwind CSS + Radix UI
- **Backend**: Node.js 22+ + Express.js (API separada)
- **Infra**: Nginx (reverse proxy + static) + Redis (cache)

**Integrações**: Google Maps/Places API, Resend (email), Instagram/WhatsApp/Spotify APIs
**Database**: Nenhum - blog estático em `src/data/blogPosts.js`

**Migração Status**: Ver `docs/NEXTJS_MIGRATION_GUIDE.md` e `docs/PHASE_1_COMPLETE.md`

### ⭐ Features Principais

**Google Reviews (136 avaliações, 4.9/5.0)**:
- Real-time API Google Places
- Rate limiting 30 req/min
- Fallback automático

**Blog Estático**:
- Zero dependências externas
- Dados em `src/data/blogPosts.js`
- Rota `/blog` via React Router
- SEO-friendly, client-side search

## 🚀 Comandos Essenciais

### Desenvolvimento

**Next.js (primário)**:
```bash
npm run dev              # Next.js dev server (porta 3000)
npm run build            # Next.js production build
npm start                # Next.js production server
```

**Vite (legacy - deprecado)**:
```bash
npm run dev:vite         # Vite dev server (porta 3002)
npm run build:vite       # Vite build + prerender
npm run build:norender   # Vite build sem prerender
```

### Testes

**Frameworks disponíveis**: Jest (legado) + Vitest (atual) + Playwright (E2E)

```bash
# Vitest (preferencial)
npm run test:vitest              # Watch mode
npm run test:vitest:run          # Run once
npm run test:vitest:coverage     # Com coverage
npm run test:api                 # API tests apenas
npm run test:frontend            # Frontend tests apenas

# Jest (legacy)
npm run test:jest                # Jest watch
npm run test:jest:coverage       # Jest coverage

# E2E (Playwright)
npm run test:e2e                 # E2E headless
npm run test:e2e:ui              # E2E com UI
npm run test:e2e:headed          # E2E com browser visível
npm run test:e2e:debug           # E2E debug mode
npm run test:profiles            # Testes de perfis (familiar/jovem/senior)
npm run test:accessibility       # Testes a11y

# Comprehensive
npm run test:comprehensive       # Todos os testes (unit + integration + a11y + e2e)

# Teste específico
npx vitest run path/to/file.test.js
npx jest path/to/file.test.js
```

### Deploy

```bash
npm run deploy              # Deploy completo VPS (backup + build + copy + reload)
npm run deploy:quick        # Deploy rápido (90% dos casos - apenas copy + reload)
npm run deploy:health       # Health check pós-deploy
npm run validate:api        # Valida sintaxe e encoding API
```

**Script direto no VPS**:
```bash
sudo bash /home/saraiva-vision-site/DEPLOY_NOW.sh
```

### Blog & Imagens

```bash
npm run optimize:images         # Otimiza imagens blog (WebP/AVIF)
npm run verify:blog-images      # Valida referências de imagens
npm run test:cover-images       # Testa capas do blog
npm run validate:blog-compliance # Valida compliance CFM
npm run audit:blog-images       # Auditoria completa imagens
```

### Validação

```bash
npm run validate:api            # Sintaxe + encoding API
npm run validate:bundle         # Valida client bundle
npm run lint                    # ESLint check
npm run production:check        # Build + test completo
```

## 🏗 Arquitetura

### Visão Geral

**Fluxo de Request**:
```
User → Nginx (31.97.129.78)
  ├─ Next.js: / → Next.js server (standalone)
  ├─ Static: /public → Nginx serve diretamente
  ├─ API: /api/* → Next.js API Routes + Express.js backend separado
  └─ Cache: Redis (sessões, rate limiting, Google Reviews)
```

**Deployment**: VPS nativo (sem Docker), Node.js 22+, SSL Let's Encrypt
**Database**: Nenhum - blog/conteúdo em arquivos estáticos

### 📁 Estrutura de Pastas

**🚧 IMPORTANTE**: Projeto em migração - coexistência Vite (legacy) + Next.js (novo)

```
├── app/                    # 🆕 Next.js App Router (produção)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── blog/              # Blog routes
│   ├── familiar/          # Profile: Familiar
│   ├── jovem/             # Profile: Jovem (com assinatura)
│   ├── senior/            # Profile: Senior
│   └── api/               # Next.js API Routes
│       ├── contact/       # Contact form
│       ├── reviews/       # Google Reviews
│       ├── appointments/  # Agendamentos
│       └── subscription/  # Stripe subscriptions
│
├── components/            # React components (reutilizáveis)
│   ├── ui/               # Radix UI + shadcn
│   ├── blog/             # Blog components
│   ├── navigation/       # Profile navigation
│   ├── forms/            # Form components
│   └── subscription/     # Subscription UI
│
├── lib/                  # Utilities & libraries
│   ├── a11y/            # Accessibility utilities
│   ├── emails/          # Email templates (Resend)
│   ├── swr/             # SWR configuration
│   └── utils.ts         # General utilities
│
├── hooks/               # Custom React hooks
├── types/               # TypeScript definitions
├── styles/              # Global CSS
│
├── src/                 # 🔴 LEGACY Vite app (em deprecação)
│   ├── components/      # Componentes antigos
│   ├── pages/          # React Router pages
│   ├── hooks/          # Hooks antigos
│   ├── lib/            # Utils antigos
│   └── data/           # blogPosts.js (fonte de verdade)
│
├── api/                # 🔴 Express.js separado (ainda em uso)
│   └── __tests__/      # API tests
│
├── tests/              # Test suites
│   ├── a11y/          # Accessibility tests
│   ├── e2e/           # Playwright E2E
│   ├── api/           # API tests
│   └── components/    # Component tests
│
├── scripts/           # Build & deploy scripts
├── docs/              # Documentação extensa
└── public/            # Static assets
```

### 🔑 Arquivos Críticos

**Next.js Configuration**:
- `next.config.js` - Config principal (standalone output)
- `middleware.ts` - Profile detection & routing
- `app/layout.tsx` - Root layout com providers

**TypeScript**:
- `tsconfig.json` - Config TS com path aliases (`@/*`)
- `types/*.ts` - Type definitions

**Testing**:
- `vitest.config.js` - Vitest config (preferencial)
- `jest.config.cjs` - Jest config (legacy)
- `playwright.config.ts` - Playwright E2E

**Data Source**:
- `src/data/blogPosts.js` - ⚠️ Fonte única de posts (ainda em src/ legacy)

### 💾 Data & Testes
**Storage**: Blog estático em JS, Redis cache, assets via Nginx
**Testes**: Vitest + React Testing Library, jsdom, coverage 80% mínimo
**State**: React Context + local state

## 📋 Guidelines de Desenvolvimento

### Convenções de Código

**Naming**:
- Componentes React: `PascalCase.tsx` (ex: `ContactForm.tsx`)
- Hooks: `camelCase.ts` (ex: `useAuth.ts`)
- Utils/libs: `camelCase.ts` ou `kebab-case.ts`
- Testes: `.test.ts/.test.tsx` ou `__tests__/` directory
- API routes: `route.ts` (Next.js convention)

**Imports**:
- Use path alias `@/` para imports absolutos
- `@/components/*` - Components (tanto `components/` quanto `src/components/`)
- `@/lib/*` - Libraries & utilities
- `@/types/*` - Type definitions
- `@/hooks/*` - Custom hooks
- Configurado em `tsconfig.json`

**TypeScript**:
- `strict: false` - Compatibilidade com código legacy
- `noImplicitAny: true` - Mas pelo menos evite `any` implícito
- Prefira types explícitos em funções públicas
- Ver `types/*.ts` para tipos compartilhados

**Code Style**:
- ESLint: `npm run lint` antes de commit
- Tailwind CSS: Classes utilitárias apenas (sem CSS customizado)
- Formatting: Prettier (configurado no ESLint)

### Environment & Secrets

**Local Development**:
- `.env.local` - Variáveis locais (não commitar)
- `.env.example` - Template com variáveis necessárias

**Variáveis Obrigatórias**:
```bash
# Google APIs
VITE_GOOGLE_MAPS_API_KEY=       # Google Maps embed
VITE_GOOGLE_PLACES_API_KEY=     # Reviews API
VITE_GOOGLE_PLACE_ID=           # Place ID da clínica

# Email
RESEND_API_KEY=                 # Resend para contact form

# Stripe (assinatura Jovem)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

**Dev Servers**:
- Next.js: `localhost:3000` (HMR, Fast Refresh)
- Vite (legacy): `localhost:3002`
- API separada: Configurada no `next.config.js` como proxy

## ⚡ Performance & Segurança

**Bundle**: Lazy loading, code splitting, tree shaking, ESBuild minification, chunks <250KB, prerendering SEO
**Runtime**: React.memo, debounced inputs, IntersectionObserver, Web Vitals tracking, GPU acceleration

### 🔒 Compliance

**CFM**: Validação automatizada, medical disclaimers, PII detection, compliance scoring
**LGPD**: Consent management, data anonymization, audit logging, SHA-256 cache keys
**API**: Input validation (Zod), rate limiting, CORS, security headers
**Auth**: Sistema removido - site público sem login

## 🎯 SEO & Schema.org

**Schema.org**: MedicalClinic, Physician, LocalBusiness, MedicalProcedure, FAQPage
**Rich Snippets**: Informações negócio, procedimentos médicos, FAQ, avaliações pacientes
**Files**: `src/lib/schemaMarkup.js`, `src/hooks/useSEO.js`, `src/utils/schemaValidator.js`

## 🛠 Common Development Tasks

### Adicionar Nova Página Next.js

1. Criar arquivo em `app/[rota]/page.tsx`:
```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Título da Página',
  description: 'Descrição SEO',
};

export default function Page() {
  return <div>Conteúdo</div>;
}
```

2. Se precisar layout específico: `app/[rota]/layout.tsx`
3. Testar: `npm run dev` → navegue para rota
4. E2E test: Criar em `tests/e2e/[rota].spec.ts`

### Criar API Route (Next.js)

1. Criar `app/api/[endpoint]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Lógica
  return NextResponse.json({ data: 'resultado' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Validar com Zod
  return NextResponse.json({ success: true });
}
```

2. Adicionar validação Zod em `lib/validations/`
3. Criar teste em `tests/api/[endpoint].test.ts`
4. Testar: `curl http://localhost:3000/api/[endpoint]`

### Adicionar Componente Reutilizável

1. Criar em `components/[categoria]/ComponentName.tsx`
2. Usar TypeScript + props interface:
```typescript
interface Props {
  title: string;
  onAction?: () => void;
}

export function ComponentName({ title, onAction }: Props) {
  return <div>{title}</div>;
}
```

3. Criar teste em `tests/components/ComponentName.test.tsx`
4. Exportar para uso: componente já disponível via `@/components/...`

### Adicionar Blog Post

⚠️ **IMPORTANTE**: Blog data ainda está em `src/data/blogPosts.js` (legacy)

1. Editar `src/data/blogPosts.js`:
```javascript
{
  id: 999,
  title: 'Título do Post',
  slug: 'titulo-do-post',
  excerpt: 'Resumo curto...',
  content: 'Conteúdo markdown...',
  publishedAt: '2025-10-03',
  coverImage: '/Blog/post-cover.avif',
  author: { name: 'Dr. Saraiva', role: 'Oftalmologista' },
  category: 'Saúde Ocular',
  tags: ['tag1', 'tag2'],
  // Se conteúdo médico:
  cfmCompliance: {
    disclaimerRequired: true,
    medicalContentLevel: 'educational',
    // ... ver posts existentes
  }
}
```

2. Adicionar imagem em `public/Blog/` (AVIF preferencial)
3. Validar: `npm run validate:blog-compliance`
4. Verificar imagens: `npm run verify:blog-images`
5. Build: `npm run build`
6. Deploy: `npm run deploy:quick`

### Modificar Middleware (Profile Detection)

1. Editar `middleware.ts` (profile detection logic)
2. Testar com: `npm run test:profiles`
3. Verificar rotas: `/familiar`, `/jovem`, `/senior`

### Adicionar Teste E2E

1. Criar `tests/e2e/[feature].spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test('deve fazer X', async ({ page }) => {
  await page.goto('/rota');
  await expect(page.getByText('Texto')).toBeVisible();
});
```

2. Rodar: `npm run test:e2e:ui` (recomendado para debug)
3. Ou: `npm run test:e2e` (headless)

## 🚀 Deployment

### Infraestrutura VPS

**Server**: 31.97.129.78 (VPS Brasil)
**Stack**: Node.js 22+ + Nginx + Redis + SSL Let's Encrypt
**Deployment**: Nativo (sem Docker, sem container)
**Diretório**: `/home/saraiva-vision-site/`

### Processo de Deploy

**Opção 1: Deploy Completo** (primeira vez ou mudanças críticas)
```bash
npm run deploy
# Faz: backup → build → copy → nginx reload → health check
# Tempo: ~3-5 min
```

**Opção 2: Deploy Rápido** (90% dos casos - apenas código)
```bash
npm run deploy:quick
# Faz: copy → nginx reload
# Tempo: ~30 seg
# Use quando: apenas mudanças em código, sem deps novas
```

**Opção 3: Deploy Direto no VPS**
```bash
# SSH no VPS
ssh root@31.97.129.78

# Rodar script
cd /home/saraiva-vision-site
sudo bash DEPLOY_NOW.sh
```

### Health Check Pós-Deploy

```bash
npm run deploy:health
# Verifica: https://saraivavision.com.br responde 200
```

Ou manual:
```bash
curl -I https://saraivavision.com.br
# Deve retornar: HTTP/2 200
```

### Rollback (Se Necessário)

Backups automáticos em `/home/saraiva-vision-site/backups/`:
```bash
# No VPS
cd /home/saraiva-vision-site
ls -lt backups/  # Lista backups (mais recente primeiro)

# Restaurar backup
sudo cp -r backups/[timestamp]/.next .next
sudo systemctl reload nginx
```

### Nginx & Services

**Nginx config**: `/etc/nginx/sites-enabled/saraivavision`
**Reload Nginx**: `sudo systemctl reload nginx`
**Status**: `sudo systemctl status nginx`

**Node.js API** (se houver serviço separado):
```bash
sudo systemctl status saraiva-api
sudo systemctl restart saraiva-api
journalctl -u saraiva-api -f  # Logs em tempo real
```

**Redis**:
```bash
redis-cli ping  # Deve retornar PONG
sudo systemctl status redis
```

### SSL Certificate

**Auto-renewal** (Let's Encrypt):
```bash
sudo certbot renew --dry-run  # Teste
sudo certbot renew            # Renovação manual se necessário
```

Certificado válido por 90 dias, auto-renova via cron.

## 🔧 Troubleshooting

### Build Errors

**Problema**: Build falha com errors TypeScript
```bash
# Verificar Node.js version
node --version  # Deve ser >= 22.0.0

# Limpar cache e reinstalar
rm -rf node_modules .next .next/cache
npm install

# Build novamente
npm run build
```

**Problema**: Build falha com "Module not found"
- Verificar path aliases em `tsconfig.json`
- Verificar imports usam `@/` corretamente
- Verificar arquivo existe no caminho esperado

### Environment Variables

**Problema**: API keys não funcionam
```bash
# Verificar se .env.local existe
cat .env.local

# Comparar com .env.example
diff .env.local .env.example

# Variáveis Next.js precisam prefixo NEXT_PUBLIC_ para client-side
# Variáveis VITE_ são legacy (ainda usadas em alguns lugares)
```

### API Issues

**Problema**: API route retorna 404
```bash
# Verificar estrutura de pastas
ls -la app/api/[endpoint]/

# Deve ter route.ts ou route.js
# Testar local
curl http://localhost:3000/api/[endpoint]
```

**Problema**: API funciona local mas não em produção
```bash
# No VPS: verificar logs
journalctl -u saraiva-api -n 50

# Verificar Nginx proxy
cat /etc/nginx/sites-enabled/saraivavision | grep api

# Testar API diretamente
curl http://localhost:3000/api/health
```

### Blog Data Issues

**Problema**: Posts não aparecem
```bash
# Verificar src/data/blogPosts.js sintaxe
npm run validate:blog-compliance

# Verificar imagens existem
npm run verify:blog-images

# Build blog data
npm run build:blog
```

**Problema**: Imagens 404
- Imagens devem estar em `public/Blog/`
- Caminhos começam com `/Blog/` (case-sensitive)
- Preferir `.avif` ou `.webp` (performance)
- Verificar: `npm run verify:blog-images`

### Performance Issues

**Problema**: Site lento
```bash
# Verificar Redis está rodando
redis-cli ping

# Verificar cache Nginx
curl -I https://saraivavision.com.br | grep -i cache

# Analisar bundle size
npm run build
# Procurar warnings sobre chunks grandes
```

**Problema**: Google Reviews lentos
- API tem rate limit 30 req/min
- Redis cache por 1 hora
- Fallback automático se API falha

### Deploy Issues

**Problema**: Deploy falha
```bash
# Verificar disk space no VPS
ssh root@31.97.129.78 "df -h"

# Verificar permissões
ssh root@31.97.129.78 "ls -la /home/saraiva-vision-site"

# Limpar builds antigos
ssh root@31.97.129.78 "cd /home/saraiva-vision-site && rm -rf .next"
```

**Problema**: Site não atualiza após deploy
```bash
# Hard refresh browser: Ctrl+Shift+R
# Verificar Nginx servindo correto
curl -I https://saraivavision.com.br

# Recarregar Nginx
sudo systemctl reload nginx

# Verificar service worker cache (se houver)
# Limpar cache browser
```

### Common Errors

**Error**: `Cannot find module '@/components/...'`
- Solution: Verificar `tsconfig.json` paths, reiniciar TS server

**Error**: `Hydration mismatch`
- Solution: SSR vs CSR mismatch - verificar `useEffect` para client-only code

**Error**: `API route not found`
- Solution: Deve ser `route.ts` em `app/api/[name]/`, não `index.ts`

**Error**: `Redis connection failed`
- Solution: `sudo systemctl start redis`, verificar `/etc/redis/redis.conf`

---

## 📚 Documentação Adicional

- **Next.js Migration**: `docs/NEXTJS_MIGRATION_GUIDE.md`
- **Phase 1 Complete**: `docs/PHASE_1_COMPLETE.md`
- **Deployment Guide**: `docs/deployment/DEPLOYMENT_GUIDE.md`
- **Testing Strategy**: `docs/TESTING_STRATEGY.md`
- **WCAG Compliance**: `docs/WCAG_AAA_COMPLIANCE.md`
- **Subscription System**: `docs/SUBSCRIPTION_SYSTEM.md`

---

**Prioridades**: Compliance médico (CFM), LGPD, acessibilidade (WCAG AAA), performance, mercado brasileiro.