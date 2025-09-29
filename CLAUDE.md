# CLAUDE.md

**Saraiva Vision** - Plataforma médica oftalmológica com compliance CFM/LGPD

## 🎯 Visão Executiva

Clínica oftalmológica em Caratinga, MG, Brasil. Arquitetura VPS nativa sem Docker, com compliance CFM e LGPD.

**Status**: ✅ Produção ativa | 🏥 Healthcare | 🇧🇷 Mercado brasileiro | ⚖️ CFM/LGPD compliance

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript 5.x + Vite
- Tailwind CSS + Framer Motion + React Router
- Radix UI (componentes acessíveis)

### Backend & APIs (VPS Nativo)
- Node.js 22+ + Express.js
- Supabase (banco + auth)
- Nginx (web server + proxy)
- WordPress Headless (PHP-FPM 8.1+)
- MySQL + Redis + ES modules

### 🔌 Integrações Principais
- Instagram Graph API, WhatsApp Business API
- Google Maps API, Google Places API (avaliações em tempo real)
- Resend API, Spotify Web API
- WordPress External API (blog.saraivavision.com.br)
- WordPress JWT Admin API (cms.saraivavision.com.br)
- Supabase PostgreSQL (real-time)

### 🔐 WordPress JWT Integration
Autenticação segura para operações administrativas:

**Arquivos Chave**:
- `api/src/wordpress-jwt-client.js` - Cliente JWT
- `api/src/routes/wordpress-admin.js` - Rotas admin CRUD
- `src/config/env.ts` - Validação Zod

**Funcionalidades**:
- Autenticação JWT automática com refresh
- CRUD posts via REST API
- Health checks e error recovery
- Segurança com token validation e rate limiting

### ⭐ Google Reviews Integration
Sistema de avaliações em tempo real:

**Arquivos Chave**:
- `src/components/CompactGoogleReviews.jsx`
- `src/hooks/useGoogleReviews.js`
- `api/src/routes/google-reviews.js`

**Funcionalidades**:
- Real-time reviews da API Google Places
- Profile photos autênticas
- Intelligent fallback com retry automático
- Rate limiting (30 req/min)

**Dados Atuais**: 136 avaliações, média 4.9/5.0

## 🚀 Comandos Essenciais

### Desenvolvimento
```bash
npm run dev              # Servidor dev (porta 3002)
npm run build            # Build produção
npm run start            # Alternativa dev
```

### Testes
```bash
npm test                 # Testes watch
npm run test:run         # Executa todos os testes
npm run test:coverage    # Relatório cobertura
npm run test:comprehensive  # Testes completos
npm run test:unit        # Testes unitários
npm run test:integration # Testes integração
npm run test:api         # Testes API
```

### API & Deploy
```bash
node api/health-check.js  # Testa saúde endpoints
node api/contact/test.js  # Testa contato
npm run validate:api        # Valida API completa
npm run build               # Build aplicação
# Deploy VPS: sudo cp -r dist/* /var/www/html/
```

### Qualidade
```bash
npm run lint                # ESLint
npm run validate:api        # Valida API
```

## 🏗 Arquitetura

### Visão Geral (VPS Nativo)
- **Frontend**: Arquivos estáticos via Nginx
- **Backend**: Node.js API como systemd service
- **Fluxo**: Usuário → Nginx → Static Files/API Proxy → Node.js

### Serviços VPS
- Nginx (web server + proxy)
- Node.js API (systemd service)
- WordPress CMS (PHP-FPM 8.1+)
- MySQL (WordPress local)
- Supabase PostgreSQL (dados principais)
- Redis (cache e sessões)

### 📁 Estrutura de Diretórios
```
src/
├── components/          # React components
│   ├── ui/             # Design system (Radix UI)
│   ├── compliance/     # CFM compliance
│   ├── instagram/      # Instagram integration
│   └── __tests__/      # Testes
├── pages/              # Rotas lazy loading
├── hooks/              # Hooks personalizados
├── lib/                # Utilitários + LGPD
├── contexts/           # Context providers
├── utils/              # Helper functions
├── services/           # Integrações externas
├── config/             # Configuração
├── workers/            # Web Workers
└── styles/             # CSS global

api/                    # Backend Node.js/Express
├── contact/            # Formulário contato
├── appointments/       # Agendamentos
├── podcast/            # Podcasts
├── google-reviews/     # Google reviews
├── instagram/          # Instagram API
├── wordpress/          # WordPress integration
├── middleware/         # Security
└── __tests__/          # API tests

docs/                   # Config e documentação
```

### 🎯 Padrões Arquiteturais
- **Componentes**: Páginas em `src/pages/`, UI reutilizável em `src/components/`
- **API**: Estrutura dual (`api/` legado + `api/src/` moderno)
- **Auth**: Supabase Auth com RBAC (user/admin/super_admin)
- **State**: React Context + local state + Supabase subscriptions
- **Error Handling**: Error Boundaries + tracking + graceful fallbacks

### 🗃 Database Schema (Supabase)
- `contact_messages` - Contato pacientes (LGPD compliant)
- `appointments` - Agendamentos com lembretes
- `message_outbox` - Fila email/SMS assíncrona
- `podcast_episodes` - Gerenciamento podcasts com RSS
- `profiles` - Auth com RBAC
- `event_log` - Logging eventos e performance
- `review_cache` - Cache Google Business reviews

### 🧪 Estratégia de Testes
- Unit Tests (React Testing Library + Vitest)
- Integration Tests (Vitest + Supertest)
- E2E Tests para fluxos críticos
- Performance Tests (Core Web Vitals)
- Coverage mínimo 80% para funcionalidades core

## 📋 Guidelines de Desenvolvimento

### Convenções
- Componentes React: PascalCase (`ContactForm.jsx`)
- Utilities/Hooks: camelCase (`useAuth.js`)
- Test Files: `.test.jsx` ou `.test.js`
- Imports: Usar `@/` alias para `src/`
- Imports agrupados: React, external, internal

### Code Style
- ESLint (React + TypeScript parser)
- TypeScript parcial strict (strict: false)
- Tailwind CSS apenas (no inline styles)
- API linting separada com `npm run validate:api`

### Environment
- Desenvolvimento: `.env` local
- Produção: Variáveis no VPS
- Variáveis obrigatórias: Supabase, Google Maps, Resend API, WordPress
- Prefixo `VITE_` para client-side access

### Dev Server (Porta 3002)
- Hot reload + proxy WordPress API
- Health check API proxy
- CORS headers configurados

## ⚡ Performance

### Bundle Optimization
- Lazy loading componentes de rota
- Code splitting manual em `vite.config.js`
- Tree shaking + chunk optimization
- ESBuild minification (ES2020 target)
- Assets inline limit: 8192 bytes

### Runtime Performance
- React.memo para re-renders caros
- Debounced inputs + IntersectionObserver
- RequestAnimationFrame + PerformanceObserver
- Web Vitals tracking + GPU acceleration

### Database Performance
- Supabase RLS policies
- Indexed queries + connection pooling
- Optimistic updates

## 🔒 Segurança & Compliance

### Authentication & Authorization
- Supabase Auth + RBAC
- Protected routes via `ProtectedRoute`
- Session management com refresh automático

### ⚖️ CFM Compliance
- Sistema CFM compliance com validação automatizada
- CFMCompliance Component + useCFMCompliance Hook
- Medical disclaimer injection automático
- PII detection e anonymization
- Compliance scoring system

### 🛡️ LGPD Compliance
- Consent management system
- Data anonymization utilities
- CFM-integrated PII protection
- Audit logging + user data deletion
- Secure cache keys (SHA-256 hashing)

### API Security
- Input validation com Zod schemas
- Rate limiting + CORS configuration
- Security headers + WordPress API security

## 🎯 SEO & Schema.org

### Structured Data Markup
Schema.org para SEO médico:
- MedicalClinic, Physician, MedicalOrganization
- LocalBusiness, MedicalProcedure, FAQPage

### Rich Snippets
- Informações negócio (endereço, horário, contato)
- Procedimentos e serviços médicos
- FAQ estruturado + credenciais profissionais
- Avaliações pacientes

### Schema Files
- `src/lib/schemaMarkup.js` - Geração principal
- `src/hooks/useSEO.js` - SEO hook com schema
- `src/utils/schemaValidator.js` - Validação Schema.org

## 🛠 Common Tasks

### Novo API Endpoint
1. Criar rota em `api/` com Express.js
2. Adicionar teste em `api/__tests__/`
3. Atualizar TypeScript types
4. Configurar middleware e validação

### Novo Componente
1. Adicionar em `src/components/` subdirectory
2. Criar teste no mesmo diretório
3. Exportar se reutilizável
4. Adicionar ao design system se UI primitive

### Blog Content (CFM Compliance)
1. Criar conteúdo no WordPress admin
2. Conteúdo validado automaticamente contra CFM
3. Usar CFMCompliance component para validação real-time
4. Medical disclaimers injetados automaticamente

### Database Changes
1. Atualizar types em `src/lib/supabase.ts`
2. Adicionar migration
3. Atualizar funções API
4. Adicionar testes

## 🚀 Deployment

### VPS Nativo (Sem Docker)
- **Build Command**: `npm run build`
- **Output**: `dist` (servido por Nginx)
- **Node.js**: 22+ mínimo
- **Location**: VPS brasileiro (31.97.129.78)
- **SSL**: Let's Encrypt via Nginx

### Processo de Deploy
1. Build: `npm run build` → `dist/`
2. Deploy: Copiar para `/var/www/html/` + reload serviços
3. Static files via Nginx
4. API proxy via Nginx para Node.js
5. Serviços systemd para processos

### Variáveis de Ambiente Obrigatórias
```bash
VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY  # Database
VITE_GOOGLE_MAPS_API_KEY                     # Maps
VITE_WORDPRESS_API_URL=https://blog.saraivavision.com.br  # WordPress
RESEND_API_KEY                               # Email
```

## 🔧 Troubleshooting

### Build Failures
- Verificar Node.js 22+
- Variáveis de ambiente configuradas
- Limpar node_modules e cache

### Database Issues
- Variáveis Supabase corretas
- Checar RLS policies
- Garantir migrations aplicadas

### API Service Errors
- Logs: `journalctl -u saraiva-api`
- Testar localmente: `npm run dev`
- Verificar configuração Nginx proxy
- Testar endpoints: `node api/health-check.js`

### SSL Certificate Issues
- Erros SSL WordPress GraphQL comuns
- Renovar: `sudo certbot renew`
- Verificar: `openssl s_client -connect cms.saraivavision.com.br:443`

### WordPress Integration
- Verificar APIs externas via curl
- Testar GraphQL endpoint
- JWT authentication e token refresh
- CORS configuration

### Google Maps Issues
- InvalidStateError resolvido com SafeWS wrapper
- WebSocket reconexão automática implementada
- Logging detalhado substitui erros globais

### Performance Issues
- Monitorar Core Web Vitals
- Checar status Redis cache
- Verificar configuração Nginx caching
- Usar DevTools Network analysis

---

**Prioridades**: Padrões médicos, compliance acessibilidade, requisitos mercado brasileiro, práticas modernas de desenvolvimento e performance optimization.