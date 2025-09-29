# CLAUDE.md

**Saraiva Vision** - Plataforma médica oftalmológica com compliance CFM/LGPD

## 🎯 Visão Executiva

Saraiva Vision é um site de clínica médica de produção para oftalmologia em Caratinga, MG, Brasil. Utiliza arquitetura VPS nativa sem Docker, com requisitos rigorosos de compliance CFM (Conselho Federal de Medicina) e LGPD (Lei Geral de Proteção de Dados).

**Status**: ✅ Produção ativa | 🏥 Healthcare | 🇧🇷 Mercado brasileiro | ⚖️ CFM/LGPD compliance

## 🛠 Tech Stack & Arquitetura

### Frontend (React SPA)
- **React 18** + **Vite** (build tooling)
- **TypeScript 5.x** (type safety)
- **Tailwind CSS** (design system)
- **Framer Motion** (animações)
- **React Router** (lazy loading)
- **Radix UI** (componentes acessíveis)

### Backend & APIs (VPS Nativo)
- **Node.js 22+** + **Express.js** (API REST)
- **Supabase** (banco principal + auth)
- **Nginx** (web server + proxy)
- **WordPress Headless** (PHP-FPM 8.1+)
- **MySQL** (banco local - WordPress)
- **Redis** (cache e sessões)
- **ES modules** (JavaScript moderno)

### 🔌 Integrações Principais
- Instagram Graph API (feed social)
- WhatsApp Business API (comunicação)
- Google Maps API (localização)
- Resend API (emails)
- Spotify Web API (podcasts)
- WordPress REST API (blog headless)
- Google Business API (avaliações)
- Supabase PostgreSQL (real-time)

## 🚀 Comandos Essenciais

### 🛠 Desenvolvimento
```bash
npm run dev              # Servidor de desenvolvimento (porta 3002)
npm run build            # Build para produção
npm run start            # Alternativa ao comando dev
```

### 🧪 Testes
```bash
npm test                 # Testes em modo watch
npm run test:run         # Executa todos os testes uma vez
npm run test:coverage    # Relatório de cobertura
npm run test:comprehensive  # Testes completos (unit + integration + API + frontend)
npm run test:unit        # Apenas testes unitários
npm run test:integration # Apenas testes de integração
npm run test:api         # Apenas testes de API
```

### 🔧 API Development & Testing
```bash
node api/health-check.js  # Testa endpoints de saúde
node api/contact/test.js  # Testa formulário de contato
npm run validate:api        # Validação completa da API
```

### 🚀 Deploy (VPS Nativo)
```bash
npm run build               # Build da aplicação
# Comandos manuais no VPS:
sudo cp -r dist/* /var/www/html/
sudo systemctl reload nginx
sudo systemctl restart saraiva-api
sudo systemctl status nginx saraiva-api mysql redis php8.1-fpm
```

### 🔍 Validação & Qualidade
```bash
npm run lint                # ESLint code quality
npm run validate:api        # Validação completa da API
```

## 🏗 Arquitetura do Projeto

### Visão Geral (VPS Nativo)
Arquitetura sem Docker para performance otimizada:

- **Frontend (React SPA)**: Arquivos estáticos via Nginx com cache eficiente
- **Backend (Node.js API)**: Serviços REST como systemd services
- **Fluxo**: Usuário → Nginx → Static Files (frontend) / API Proxy (backend) → Node.js Services

### Serviços VPS (Ubuntu/Debian)
Todos os serviços rodam diretamente no host OS:
- **Nginx**: Web server + proxy reverso
- **Node.js**: API REST (systemd service)
- **WordPress**: CMS headless (PHP-FPM 8.1+)
- **MySQL**: Banco local (WordPress)
- **Supabase**: PostgreSQL externo (dados principais)
- **Redis**: Cache e sessões

### 📁 Estrutura de Diretórios
```
src/
├── components/          # Componentes React
│   ├── ui/             # Design system (Radix UI)
│   ├── icons/          # Ícones personalizados
│   ├── blog/           # Blog components
│   ├── compliance/     # CFM compliance
│   ├── instagram/      # Instagram integration
│   ├── ErrorBoundaries/ # Error handling
│   └── __tests__/      # Testes de componentes
├── pages/              # Páginas de rota (lazy loading)
├── hooks/              # Hooks personalizados (CFM compliance)
├── lib/                # Utilitários e configurações
│   ├── lgpd/           # LGPD compliance
│   └── __tests__/      # Testes de bibliotecas
├── contexts/           # Context providers
├── utils/              # Helper functions
├── services/           # Integrações externas
├── config/             # Arquivos de configuração
├── workers/            # Web Workers (CFM validation)
└── styles/             # CSS global

api/                    # Backend Node.js/Express
├── contact/            # Formulário de contato
├── appointments/       # Sistema de agendamentos
├── podcast/            # Gerenciamento de podcasts
├── monitoring/         # Health checks
├── google-reviews/     # Integração Google Reviews
├── instagram/          # Instagram API proxy
├── wordpress/          # Integração WordPress
├── middleware/         # Security & validation
└── __tests__/          # API tests

docs/                   # Scripts e documentação
├── WORDPRESS_BLOG_SPECS.md    # Especificações
├── install-wordpress-blog.sh  # Instalação WordPress
├── deploy-wordpress-blog.sh   # Deploy WordPress
└── monitor-wordpress-blog.sh  # Monitoramento
```

### 🎯 Padrões Arquiteturais

#### Componentes
- **Páginas**: `src/pages/` - rotas e layouts
- **UI Reutilizável**: `src/components/` com testes co-locados
- **Design System**: `src/components/ui/` (Radix UI)
- **Hooks Personalizados**: `src/hooks/` - lógica compartilhada

#### API Architecture
- **Estrutura Dual**: `api/` (legado) + `api/src/` (moderno)
- **Express.js**: ES modules + JavaScript moderno
- **Database**: Supabase + TypeScript + RLS policies
- **WordPress**: REST API + GraphQL com proxy SSL/CORS
- **Auth**: Supabase Auth com RBAC (user/admin/super_admin)
- **Message Queue**: Supabase `message_outbox` para emails/SMS
- **Compliance**: CFM validation com Web Workers
- **Security**: Rate limiting, Zod schemas, CORS
- **Real-time**: Supabase websockets

#### State Management
- **React Context**: Auth, Analytics, Widgets
- **Local State**: interações UI
- **Real-time**: Supabase subscriptions
- **Custom Hooks**: abstração de lógica complexa

#### Error Handling
- **Error Boundaries**: globais para React
- **Error Tracking**: `src/utils/errorTracking.js`
- **API Errors**: HTTP status codes adequados
- **Graceful Fallbacks**: falha de serviços externos

### 🗃 Database Schema

#### Supabase Tables
Principais tabelas em `src/lib/supabase.ts`:
- `contact_messages` - Formulário de contato (LGPD compliant)
- `appointments` - Agendamentos de pacientes com sistema de lembretes
- `message_outbox` - Fila de mensagens assíncronas (email/SMS)
- `podcast_episodes` - Gerenciamento de podcasts com RSS
- `profiles` - Autenticação e autorização com RBAC
- `event_log` - Logging de eventos e performance
- `review_cache` - Cache de Google Business reviews

#### WordPress Database
Conteúdo WordPress via MySQL:
- `wp_posts` - Posts e páginas com metadados CFM
- `wp_users` - Usuários admin com controle de acesso
- `wp_postmeta` - Metadados de posts (CFM compliance + SEO)
- `wp_terms` - Categorias e tags
- Tabelas customizadas para CFM compliance e audit logs

### 🧪 Estratégia de Testes
- **Unit Tests**: Componentes com React Testing Library + Vitest
- **Integration Tests**: Endpoints API com Vitest + Supertest
- **E2E Tests**: Fluxos críticos de usuário
- **Performance Tests**: Core Web Vitals e otimização
- **Coverage**: Mínimo 80% para funcionalidades core
- **Organização**: Testes co-locados em `__tests__/`
- **API Testing**: Suite separada em `api/__tests__/`
- **Mock Setup**: Configuração centralizada em `src/__tests__/setup.js`

## 📋 Guidelines de Desenvolvimento

### 📝 Convenções
- **Componentes React**: PascalCase (`ContactForm.jsx`)
- **Utilities/Hooks**: camelCase (`useAuth.js`)
- **Constantes**: UPPER_SNAKE_CASE (`API_ENDPOINTS.js`)
- **Test Files**: `.test.jsx` ou `.test.js`
- **Imports**: Use `@/` alias para `src/`, preferir imports absolutos
- **Imports Agrupados**: React, external libraries, internal modules

### 🎨 Code Style
- **ESLint**: React + TypeScript parser (exclui `api/`)
- **TypeScript**: Modo parcial strict (strict: false) para compatibilidade
- **Styling**: Tailwind CSS apenas (evitar inline styles)
- **Componentes**: Preferir composição sobre herança
- **API Linting**: Validação separada com `npm run validate:api`

### ⚙️ Environment
- **Desenvolvimento**: `.env` local
- **Produção**: Variáveis no servidor VPS
- **Variáveis Obrigatórias**: Supabase URL/keys, Google Maps API, Resend API, WordPress
- **Vite**: Prefixo `VITE_` para client-side access

### 🔧 Dev Server (Porta 3002)
- Hot reload e proxy WordPress API (localhost:8083)
- Health check API proxy (localhost:3001)
- CORS headers configurados
- WordPress GraphQL proxy: `/api/wordpress-graphql/graphql`

## ⚡ Performance Considerations

### 📦 Bundle Optimization
- Lazy loading para componentes de rota
- Code splitting em `vite.config.js` com estratégia manual
- Tree shaking enabled para production
- Chunk optimization para vendor dependencies
- ESBuild minification (ES2020 target)
- Assets inline limit aumentado para VPS (8192 bytes)

### 🚀 Runtime Performance
- React.memo para re-renders caros
- Debounced inputs para busca/filtro
- IntersectionObserver para lazy loading
- RequestAnimationFrame para animações suaves
- PerformanceObserver API para monitoramento real-time
- Web Vitals tracking + Core Web Metrics
- GPU acceleration para animações 3D

### 🗄 Database Performance
- Supabase RLS policies para segurança
- Indexed queries para operações comuns
- Connection pooling via Supabase
- Optimistic updates para melhor UX

## 🔒 Segurança & Compliance

### 🔐 Authentication & Authorization
- Supabase Auth para gestão de usuários
- Role-based access control (user/admin/super_admin)
- Protected routes via `ProtectedRoute` component
- Session management com refresh automático

### ⚖️ Compliance Médico (CFM)
- **Sistema CFM compliance** com validação automatizada
- **CFMCompliance Component** (`src/components/compliance/CFMCompliance.jsx`) para validação real-time
- **useCFMCompliance Hook** (`src/hooks/useCFMCompliance.js`) com Web Worker integration
- **Medical disclaimer injection** para todo conteúdo médico
- **CRM identification validation** para responsabilidade médica adequada
- **PII detection e anonymization** para prevenir exposição de dados de pacientes
- **Compliance scoring system** com recomendações acionáveis

### 🛡️ LGPD Compliance
- Consent management system em `src/components/ConsentManager.jsx`
- Data anonymization utilities em `src/lib/lgpd/`
- **CFM-integrated PII protection** com detecção de padrões para CPF, nomes de pacientes, datas de nascimento
- Audit logging para acesso a dados e validação de compliance
- User data deletion capabilities
- **Secure cache keys** usando SHA-256 hashing para prevenir exposição de dados sensíveis

### 🔐 API Security
- Input validation com Zod schemas
- Rate limiting em formulários de contato
- CORS configuration em Express.js middleware
- Security headers para produção
- **WordPress API security** com endpoints autenticados e validação de conteúdo

## 🎯 SEO & Schema.org Implementation

### 📊 Structured Data Markup
Markup Schema.org compreensivo para SEO médico:

#### Tipos de Schema Implementados
- **MedicalClinic**: Entidade principal com localização, serviços e contato
- **Physician**: Profissionais médicos com credenciais e especialidades
- **MedicalOrganization**: Estrutura organizacional e certificações
- **LocalBusiness**: Otimização para busca local com geo-coordenadas
- **MedicalProcedure**: Serviços e tratamentos disponíveis
- **FAQPage**: FAQ estruturado para rich snippets

#### 📁 Schema Files
- `src/lib/schemaMarkup.js` - Funções principais de geração
- `src/lib/serviceFAQSchema.js` - Schemas FAQ específicos
- `api/src/lib/schemaMarkup.js` - Geração API-side
- `src/utils/schemaValidator.js` - Validação Schema.org
- `src/hooks/useSEO.js` - SEO hook com schema integrado

#### 🌟 Rich Snippets
- Informações de negócio (endereço, horário, contato)
- Procedimentos e serviços médicos
- FAQ com Q&A estruturado
- Credenciais profissionais e certificações
- Avaliações e reviews de pacientes

## 🛠 Common Development Tasks

### ➕ Novo API Endpoint
1. Criar rota em `api/` usando Express.js
2. Adicionar teste em `api/__tests__/`
3. Atualizar TypeScript types se necessário
4. Configurar middleware e validação

### 🎨 Novo Componente
1. Adicionar arquivo em `src/components/` subdirectory apropriado
2. Criar arquivo de teste no mesmo diretório
3. Exportar se reutilizável
4. Adicionar ao design system se for UI primitive

### 📝 Blog Content com CFM Compliance
1. Criar conteúdo no WordPress admin: `https://blog.saraivavision.com.br/wp-admin`
2. Conteúdo automaticamente validado contra regras CFM
3. Usar `CFMCompliance` component para validação real-time em React
4. Medical disclaimers injetados automaticamente por CFM

### 🗃 Database Schema Changes
1. Atualizar types em `src/lib/supabase.ts`
2. Adicionar migration em `database/migrations/`
3. Atualizar funções API relacionadas
4. Adicionar testes correspondentes

### 🌐 WordPress Management (VPS Nativo)
1. **Instalação**: `docs/install-wordpress-blog.sh` como root
2. **Deploy**: `docs/deploy-wordpress-blog.sh` (sem Docker)
3. **Monitoramento**: `docs/monitor-wordpress-blog.sh`
4. **Configuração**: Nginx e PHP-FPM configs em `docs/`

### 📊 Performance Monitoring
- Métricas real-time via `src/hooks/usePerformanceMonitor.js`
- Core Web Vitals tracking
- Error rate monitoring
- Bundle analysis tools disponíveis

## 🚀 Configuração de Deployment

### 🖥️ VPS Nativo (Sem Docker)

#### ⚙️ Server Configuration
Projeto deployado em VPS Linux usando serviços nativos:
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (servido por Nginx)
- **Node.js Version**: 22+ mínimo (conforme package.json engines)
- **Location**: Data center brasileiro (31.97.129.78) para performance local otimizada
- **SSL**: Certificados Let's Encrypt gerenciados por Nginx

#### 🏗️ Arquitetura de Serviços Nativos
Serviços rodando diretamente no Ubuntu/Debian VPS sem containerização:
- **Nginx**: Web server + proxy reverso para APIs
- **Node.js**: Runtime nativo para serviços API
- **MySQL**: Banco nativo para dados relacionais (WordPress, user data)
- **Redis**: Cache nativo e armazenamento de sessões
- **PHP-FPM 8.1+**: WordPress CMS nativo
- **Supabase**: PostgreSQL externo para dados principais

#### 📋 Processo de Deployment Nativo
1. **Build**: `npm run build` cria arquivos estáticos em `dist/`
2. **Deploy**: Cópia manual para web directory + reload de serviços
3. **Static Files**: Nginx serve React SPA de `/var/www/html/`
4. **API Proxy**: Nginx redireciona `/api/*` para backend Node.js
5. **Process Management**: serviços systemd para processos Node.js API
6. **No Containerization**: Todos serviços rodam diretamente no host OS

#### 🛠️ Passos de Deployment Manual
```bash
# Build da aplicação
npm run build

# Copiar arquivos estáticos para web directory
sudo cp -r dist/* /var/www/html/

# Reload Nginx para servir novos arquivos
sudo systemctl reload nginx

# Opcional: Restart Node.js API service se atualizado
sudo systemctl restart saraiva-api

# Verificar se serviços estão rodando
sudo systemctl status nginx saraiva-api mysql redis php8.1-fpm
```

### 🔧 Variáveis de Ambiente Obrigatórias
```bash
# Supabase Configuration
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_SERVICE_ROLE_KEY=

# External APIs
VITE_GOOGLE_MAPS_API_KEY=
RESEND_API_KEY=

# WordPress Integration
VITE_WORDPRESS_API_URL=https://blog.saraivavision.com.br/wp-json/wp/v2
VITE_WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql

# WordPress Database (Native VPS)
WORDPRESS_DB_NAME=saraiva_blog
WORDPRESS_DB_USER=wp_blog_user
WORDPRESS_DB_PASSWORD=secure_password

# Development Configuration
NODE_ENV=production
VITE_GRAPHQL_TIMEOUT=15000
VITE_GRAPHQL_MAX_RETRIES=3
```

## 🔧 Troubleshooting de Problemas Comuns

### ❌ Build Failures
- Verificar versão Node.js (requer 22+)
- Verificar se variáveis de ambiente estão configuradas
- Limpar node_modules e npm cache se necessário

### 🔗 Database Connection Issues
- Verificar variáveis de ambiente Supabase
- Checar RLS policies para acesso a dados
- Garantir que migrations foram aplicadas

### 🚨 API Service Errors
- Checar logs com `journalctl -u saraiva-api` ou PM2 logs
- Verificar processo Node.js e uso de memória
- Testar localmente com `npm run dev`
- Checar configuração Nginx proxy em `/etc/nginx/sites-available/`
- Verificar todos serviços nativos: `sudo systemctl status nginx mysql redis php8.1-fpm`
- Testar endpoints individuais: `node api/health-check.js`, `node api/contact/test.js`

### 🔒 SSL Certificate Issues
- Erros SSL WordPress GraphQL são comuns - checar `docs/nginx-cors.conf`
- Usar Certbot para renovação: `sudo certbot renew`
- Verificar configuração SSL: `openssl s_client -connect cms.saraivavision.com.br:443`
- Checar SSL Labs grade: https://www.ssllabs.com/ssltest/

### 🌐 WordPress Integration Issues
- Verificar WordPress rodando na porta 8080: `curl http://localhost:8080/`
- Checar conexão WordPress database: `sudo systemctl status mysql`
- Testar WordPress REST API: `curl http://localhost:8080/wp-json/wp/v2/posts`
- Verificar CORS headers para endpoint GraphQL
- Testar GraphQL proxy: `curl -X POST http://localhost:3002/api/wordpress-graphql/graphql -H "Content-Type: application/json" -d '{"query":"{__typename}"}'`

### ⚡ Performance Issues
- Monitorar Core Web Vitals com `src/hooks/usePerformanceMonitor.js`
- Checar status Redis cache: `sudo systemctl status redis`
- Verificar configuração Nginx caching
- Usar DevTools Network tab para analisar load times

---

Este codebase prioriza padrões da indústria médica, compliance de acessibilidade e requisitos do mercado brasileiro enquanto mantém práticas modernas de desenvolvimento e otimização de performance.