# CLAUDE.md - Resumo Saraiva Vision

**Plataforma médica oftalmológica em Caratinga, MG, Brasil com compliance CFM/LGPD**

## � Visão Executiva
- Status: ✅ Produção | 🏥 Healthcare | 🇧🇷 Brasil | ⚖️ CFM/LGPD
- VPS nativo, blog estático, sem database externa

## 🛠 Tech Stack
**Frontend**: React 18 + TypeScript 5.x + Vite + Tailwind + Radix UI
**Backend**: Node.js 22+ + Express.js + Nginx + Redis + ES modules
**Integrações**: Google Maps/Places API, Resend API, Instagram Graph API, WhatsApp/Spotify APIs

## ⭐ Features Principais
**Google Reviews**: 136 avaliações, 4.9/5.0, API real-time, rate limiting 30 req/min
**Blog Estático**: Zero dependências externas, dados em src/data/blogPosts.js, SEO-friendly

## 🚀 Comandos Essenciais
```bash
npm run dev              # Servidor dev (porta 3002)
npm run build            # Build produção + prerender SEO
npm run deploy           # Deploy completo VPS
npm run deploy:quick     # Deploy rápido (90% casos)
npm test                 # Testes watch mode
npm run test:comprehensive  # Suite completa
```

## 🏗 Arquitetura
Frontend (Nginx) → Backend (Node.js API) → Cache (Redis)
Serviços: Nginx (static files + proxy), Node.js API, Redis cache
Arquitetura: 100% estática, sem database externa

## 📋 Guidelines
- Convenções: Componentes React (PascalCase.jsx), Hooks (camelCase.js), testes (.test.js/.jsx)
- Code Style: ESLint, TypeScript 5.x (strict: false), Tailwind CSS apenas
- Environment: .env local, variáveis obrigatórias com prefixo VITE_
- Dev Server: Porta 3002, HMR, CORS configurado

## ⚡ Performance & Segurança
Bundle: Lazy loading, code splitting, chunks <250KB, prerendering SEO
Runtime: React.memo, debounced inputs, IntersectionObserver, Web Vitals tracking

## 🔒 Compliance CFM/LGPD
CFM: Validação automatizada, medical disclaimers, PII detection, compliance scoring
LGPD: Consent management, data anonymization, audit logging, SHA-256 cache keys
API: Input validation (Zod), rate limiting, CORS, security headers

## 🎯 SEO & Schema.org
Schema.org: MedicalClinic, Physician, LocalBusiness, MedicalProcedure, FAQPage
Rich Snippets: Informações negócio, procedimentos médicos, FAQ, avaliações pacientes

## 🛠 Common Tasks
API Endpoint: Criar rota Express.js em api/ + teste + middleware + validação
Componente: Adicionar em src/components/ + teste + exportação reutilizável
Blog Post: Adicionar em src/data/blogPosts.js + CFMCompliance se médico + npm run build + deploy

## 🚀 Deployment
VPS Nativo: npm run build → dist/ via Nginx, Node.js 22+, SSL Let's Encrypt, VPS BR (31.97.129.78)
Deploy: npm run deploy (automatizado) ou npm run deploy:quick (90% casos) → health check

## 🔧 Variáveis Obrigatórias
```bash
VITE_GOOGLE_MAPS_API_KEY
VITE_GOOGLE_PLACES_API_KEY
VITE_GOOGLE_PLACE_ID
RESEND_API_KEY
```

## 🔧 Troubleshooting
Build: Node.js 22+, variáveis ambiente, limpar cache
Data: Verificar src/data/blogPosts.js, datas, Redis
API: journalctl -u saraiva-api, testar local, Nginx proxy
SSL: sudo certbot renew
Performance: Web Vitals, Redis cache, Nginx caching

**Prioridades**: Padrões médicos, compliance acessibilidade, mercado brasileiro, performance optimization.