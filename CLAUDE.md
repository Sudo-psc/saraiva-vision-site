# CLAUDE.md

**Saraiva Vision** - Plataforma médica oftalmológica com compliance CFM/LGPD

## 🎯 Visão Executiva

Clínica oftalmológica em Caratinga, MG, Brasil. VPS nativo, blog estático, compliance CFM/LGPD.

**Status**: ✅ Produção | 🏥 Healthcare | 🇧🇷 Brasil | ⚖️ CFM/LGPD

## 🛠 Tech Stack

**Frontend**: Next.js 13+ +TypeScript 5.x + Vite + Tailwind + Radix UI
**Backend**: Node.js 22+ + Express.js + Nginx + Redis + ES modules
**Integrações**: Google Maps/Places API, Resend API, WhatsApp/Spotify APIs
**Arquitetura**: 100% estática (WordPress/Supabase removidos)

**🚧 Migração para Next.js**: Ver `docs/NEXTJS_MIGRATION_GUIDE.md`

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

**Desenvolvimento**:
```bash
npm run dev              # Servidor dev (porta 3002)
npm run build            # Build produção + prerender SEO
npm run build:norender   # Build sem prerender
npm run start            # Alternativa dev
```

**Testes**:
```bash
npm test                 # Testes watch mode
npm run test:comprehensive  # Suite completa
npm run test:api         # API tests
npm run test:frontend    # Frontend tests
npx vitest run path/to/file.test.js  # Arquivo específico
```

**Deploy**:
```bash
npm run deploy              # Deploy completo VPS
npm run deploy:quick        # Deploy rápido (90% dos casos)
npm run deploy:health       # Health check pós-deploy
npm run validate:api        # Valida API
```

**Blog**:
```bash
npm run optimize:images     # Otimiza imagens
npm run verify:blog-images  # Valida imagens blog
```

## 🏗 Arquitetura

**Visão Geral**: Frontend (Nginx) → Backend (Node.js API) → Cache (Redis)
**Serviços**: Nginx (static files + proxy), Node.js API, Redis cache
**Arquitetura**: 100% estática, sem database externa

### 📁 Estrutura Principal
```
src/
├── components/         # React components (ui/, compliance/, instagram/)
├── pages/             # Rotas lazy loading
├── hooks/             # Hooks personalizados
├── lib/               # Utilitários + LGPD
├── data/              # Dados estáticos (blogPosts.js)
└── __tests__/         # Testes

api/                   # Backend Node.js/Express (mínimo)
└── __tests__/         # API tests
```

### 💾 Data & Testes
**Storage**: Blog estático em JS, Redis cache, assets via Nginx
**Testes**: Vitest + React Testing Library, jsdom, coverage 80% mínimo
**State**: React Context + local state

## 📋 Guidelines de Desenvolvimento

**Convenções**: Componentes React (PascalCase.jsx), Hooks (camelCase.js), testes (.test.js/.jsx), imports com `@/` alias
**Code Style**: ESLint, TypeScript 5.x (strict: false), Tailwind CSS apenas
**Environment**: `.env` local, variáveis obrigatórias com prefixo `VITE_`
**Dev Server**: Porta 3002, HMR, CORS configurado

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

## 🛠 Common Tasks

**API Endpoint**: Criar rota Express.js em `api/` + teste em `api/__tests__/` + middleware + validação
**Componente**: Adicionar em `src/components/` + teste + exportação reutilizável
**Blog Post**: Adicionar em `src/data/blogPosts.js` seguir estrutura existente + CFMCompliance se médico + `npm run build` + deploy

## 🚀 Deployment

**VPS Nativo**: `npm run build` → dist/ via Nginx, Node.js 22+, SSL Let's Encrypt, VPS BR (31.97.129.78)
**Deploy**: `npm run deploy` (automatizado) ou `npm run deploy:quick` (90% casos) → health check

**Variáveis Obrigatórias**:
```bash
VITE_GOOGLE_MAPS_API_KEY
VITE_GOOGLE_PLACES_API_KEY
VITE_GOOGLE_PLACE_ID
RESEND_API_KEY
```

## 🔧 Troubleshooting

**Build**: Node.js 22+, variáveis ambiente, limpar cache
**Data**: Verificar `src/data/blogPosts.js`, datas, Redis
**API**: `journalctl -u saraiva-api`, testar local, Nginx proxy
**SSL**: `sudo certbot renew`
**Performance**: Web Vitals, Redis cache, Nginx caching

---

**Prioridades**: Padrões médicos, compliance acessibilidade, mercado brasileiro, performance optimization.