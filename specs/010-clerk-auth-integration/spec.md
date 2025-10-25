# Clerk Auth Integration - Especificação Técnica Detalhada

**Version**: 1.0
**Status**: Draft
**Created**: 2025-10-25
**Updated**: 2025-10-25

## 1. Contexto e Motivação

### 1.1 Estado Atual

O Saraiva Vision é atualmente uma aplicação **100% pública** sem sistema de autenticação:

- ❌ Nenhum sistema de login/cadastro
- ❌ Nenhum user database schema
- ❌ Nenhuma proteção de rotas
- ❌ Nenhum gerenciamento de sessão ativo
- ⚠️ Variáveis de ambiente Supabase configuradas mas não utilizadas
- ⚠️ Healthcare Session Manager implementado mas nunca chamado
- ✅ Stripe Pricing Table funcional (mas sem user accounts)
- ✅ Webhook infrastructure presente (sem business logic)

### 1.2 Necessidade

Com a implementação de planos de assinatura (Básico, Padrão, Premium) em três modalidades (Presencial, Flex, Online), torna-se imperativo:

1. **Identificar usuários**: Saber quem assinou qual plano
2. **Controlar acesso**: Gating de conteúdo premium por tier
3. **Gerenciar lifecycle**: Criar, atualizar, cancelar assinaturas
4. **Compliance LGPD**: Gestão adequada de dados pessoais de saúde
5. **Auditoria**: Rastreamento de ações sensíveis

### 1.3 Por Que Clerk?

| Critério | Clerk | Auth0 | Supabase Auth | AWS Cognito |
|----------|-------|-------|---------------|-------------|
| **Time-to-market** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Developer Experience** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **UI Components** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| **MFA/OAuth** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Preço (pequena escala)** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Preço (grande escala)** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **React/Next.js Support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Compliance (LGPD/GDPR)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**Decisão**: Clerk oferece o melhor equilíbrio para um time enxuto focado em React/Vite com necessidade de lançamento rápido.

---

## 2. Arquitetura Detalhada

### 2.1 Componentes de Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLERK PLATFORM                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   User DB    │  │  Session Mgr │  │   OAuth      │          │
│  │   (Hosted)   │  │   (JWT)      │  │   Providers  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │     MFA      │  │ Organizations│  │   Webhooks   │          │
│  │  (TOTP/SMS)  │  │   (B2B)      │  │   (Events)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS + JWT
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   SARAIVA VISION FRONTEND                        │
│                  (React 18 + Vite + React Router)                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    ClerkProvider                            │ │
│  │  (Wraps entire app, manages auth state globally)           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌───────────────────┬──────┴──────┬────────────────────────┐  │
│  │  Public Routes    │  Protected  │   Admin Routes         │  │
│  │  ---------------  │  Routes     │   ----------------     │  │
│  │  /                │  ---------- │   /admin/users         │  │
│  │  /servicos        │  /app/*     │   /admin/subscriptions │  │
│  │  /blog/*          │  /dashboard │   /admin/analytics     │  │
│  │  /planos          │  /profile   │                        │  │
│  │  /contato         │  /invoices  │   (Role: admin only)   │  │
│  │                   │  /library   │                        │  │
│  │  (No auth check)  │             │                        │  │
│  │                   │  (Requires  │                        │  │
│  │                   │  active     │                        │  │
│  │                   │  session)   │                        │  │
│  └───────────────────┴─────────────┴────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Clerk React Components (Pre-built)                │ │
│  │  - <SignIn />                                               │ │
│  │  - <SignUp />                                               │ │
│  │  - <UserProfile />                                          │ │
│  │  - <UserButton />                                           │ │
│  │  - <OrganizationProfile />                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Custom Hooks                                      │ │
│  │  - useAuth() - Authentication state                         │ │
│  │  - useUser() - User data                                    │ │
│  │  - useSession() - Session management                        │ │
│  │  - useOrganization() - Org context (B2B)                    │ │
│  │  - usePlan() - Custom: current subscription plan           │ │
│  │  - useEntitlements() - Custom: feature flags                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls with Bearer Token
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND API (Node.js/Express)                   │
│                        Port 3001 (systemd)                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Clerk Express Middleware (Token Validation)         │ │
│  │  - Verifica JWT signature                                   │ │
│  │  - Extrai user_id do token                                  │ │
│  │  - Attach req.auth object                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌───────────────────┬──────┴──────┬────────────────────────┐  │
│  │  Public Routes    │  Protected  │   Webhook Routes       │  │
│  │  ---------------  │  Routes     │   ----------------     │  │
│  │  /api/health      │             │   /api/webhooks/clerk  │  │
│  │  /api/config      │  Require    │   /api/webhooks/stripe │  │
│  │  /api/contact     │  JWT token  │   /api/webhooks/asaas  │  │
│  │                   │             │                        │  │
│  │                   │  Routes:    │   (HMAC validation)    │  │
│  │                   │  --------   │                        │  │
│  │                   │  /api/user  │                        │  │
│  │                   │  /api/sub   │                        │  │
│  │                   │  /api/content│                       │  │
│  └───────────────────┴─────────────┴────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Business Logic Layer                       │ │
│  │  - UserService (CRUD, profile management)                   │ │
│  │  - SubscriptionService (lifecycle, sync)                    │ │
│  │  - EntitlementService (feature flags, gating)               │ │
│  │  - InvoiceService (history, PDF generation)                 │ │
│  │  - AuditService (logging de ações sensíveis)                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL/MySQL)                    │
│                                                                  │
│  Tables:                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  users         │  │ subscriptions  │  │ feature_flags    │  │
│  │                │  │                │  │                  │  │
│  │ clerk_id (PK)  │  │ id (PK)        │  │ id (PK)          │  │
│  │ email          │  │ user_id (FK)   │  │ key              │  │
│  │ first_name     │  │ provider       │  │ plan             │  │
│  │ last_name      │  │ plan           │  │ limit            │  │
│  │ locale         │  │ status         │  │ description      │  │
│  │ created_at     │  │ trial_end      │  │                  │  │
│  │ updated_at     │  │ cancel_at      │  │                  │  │
│  │                │  │ current_period │  │                  │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│                                                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ entitlements   │  │ invoices       │  │ audit_log        │  │
│  │                │  │                │  │                  │  │
│  │ id (PK)        │  │ id (PK)        │  │ id (PK)          │  │
│  │ user_id (FK)   │  │ user_id (FK)   │  │ user_id (FK)     │  │
│  │ feature_key    │  │ provider_id    │  │ action           │  │
│  │ limit_override │  │ amount         │  │ resource_type    │  │
│  │ expires_at     │  │ currency       │  │ resource_id      │  │
│  │                │  │ status         │  │ ip_address       │  │
│  │                │  │ pdf_url        │  │ user_agent       │  │
│  │                │  │                │  │ metadata (JSON)  │  │
│  │                │  │                │  │ created_at       │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      PAYMENT PROVIDERS                           │
│                                                                  │
│  ┌────────────────────────┐  ┌───────────────────────────────┐ │
│  │    Stripe              │  │    Asaas (Brazil)             │ │
│  │  (Flex Plans)          │  │  (Presencial + Online Plans)  │ │
│  │                        │  │                               │ │
│  │  - Pricing Table       │  │  - PIX/Boleto                 │ │
│  │  - Checkout            │  │  - Parcelamento               │ │
│  │  - Customer Portal     │  │  - Webhook Events             │ │
│  │  - Webhooks            │  │                               │ │
│  └────────────────────────┘  └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Fluxos de Dados Principais

#### Fluxo 1: Signup/Login

```
User → Clerk UI → Clerk Backend → JWT Token → Frontend stores session
                                                    ↓
                                            Backend webhook triggered
                                                    ↓
                                            Create user in app DB
```

**Sequência Detalhada**:

1. Usuário acessa `/sign-up`
2. Componente `<SignUp />` do Clerk renderiza
3. Usuário preenche e-mail/senha ou clica "Login with Google"
4. Clerk valida dados e cria conta
5. Clerk dispara webhook `user.created`
6. Backend recebe webhook e cria registro em `users` table
7. Clerk redireciona para `/dashboard` com JWT token
8. Frontend armazena token em cookie httpOnly
9. Subsequentes requests incluem token no header

#### Fluxo 2: Assinatura de Plano

```
User (authenticated) → Stripe/Asaas Checkout → Payment success
                                                       ↓
                                          Webhook: subscription.created
                                                       ↓
                                          Backend creates subscription record
                                                       ↓
                                          Link subscription to clerk_id
                                                       ↓
                                          User gains access to premium content
```

**Sequência Detalhada**:

1. Usuário logado acessa `/planosflex`
2. Clica em plano desejado no Stripe Pricing Table
3. Stripe Checkout abre (com `client_reference_id=clerk_user_id`)
4. Usuário completa pagamento
5. Stripe dispara `customer.subscription.created` webhook
6. Backend:
   - Valida assinatura do webhook
   - Extrai `clerk_id` do `client_reference_id`
   - Cria record em `subscriptions` table
   - Atualiza `entitlements` table com feature flags
7. Frontend detecta mudança de estado via polling ou WebSocket
8. Dashboard reflete novo plano

#### Fluxo 3: Acesso a Conteúdo Premium

```
User requests /app/premium-content → Backend validates session
                                            ↓
                                    Checks subscription status
                                            ↓
                                    Checks entitlements
                                            ↓
                            Allow (200) or Deny (403 Forbidden)
```

**Sequência Detalhada**:

1. Usuário logado tenta acessar `/app/library/premium-course`
2. Frontend verifica token JWT local
3. Request enviado com `Authorization: Bearer <jwt>`
4. Backend middleware `clerkExpressRequireAuth()`:
   - Valida JWT signature
   - Extrai `clerk_id`
   - Attach `req.auth.userId`
5. Route handler:
   - Busca subscription do user: `SELECT * FROM subscriptions WHERE user_id = clerk_id AND status IN ('active', 'trialing')`
   - Verifica entitlement: `SELECT * FROM entitlements WHERE user_id = clerk_id AND feature_key = 'premium_content'`
   - Se encontrado e válido: retorna conteúdo (200)
   - Se não encontrado: retorna erro (403 Forbidden)
6. Frontend exibe conteúdo ou mensagem de upgrade

### 2.3 Database Schema Detalhado

#### Table: `users`

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  clerk_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  locale VARCHAR(10) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  avatar_url TEXT,

  -- Metadata
  metadata JSON, -- Custom user metadata
  public_metadata JSON, -- Publicly visible metadata
  private_metadata JSON, -- Private server-side metadata

  -- LGPD
  consent_marketing BOOLEAN DEFAULT FALSE,
  consent_analytics BOOLEAN DEFAULT FALSE,
  consent_granted_at TIMESTAMP,
  data_retention_until TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  INDEX idx_clerk_id (clerk_id),
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);
```

#### Table: `subscriptions`

```sql
CREATE TABLE subscriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,

  -- Provider info
  provider ENUM('stripe', 'asaas') NOT NULL,
  provider_subscription_id VARCHAR(255) NOT NULL,
  provider_customer_id VARCHAR(255) NOT NULL,

  -- Plan info
  plan ENUM('basico', 'padrao', 'premium') NOT NULL,
  plan_type ENUM('presencial', 'flex', 'online') NOT NULL,

  -- Status
  status ENUM(
    'active',
    'trialing',
    'past_due',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'unpaid'
  ) NOT NULL DEFAULT 'incomplete',

  -- Billing
  currency VARCHAR(3) DEFAULT 'BRL',
  amount DECIMAL(10,2),
  interval ENUM('month', 'year') NOT NULL DEFAULT 'month',

  -- Trial
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,

  -- Lifecycle
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancel_at TIMESTAMP,
  canceled_at TIMESTAMP,
  ended_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_provider_sub (provider, provider_subscription_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_provider (provider),
  INDEX idx_current_period_end (current_period_end)
);
```

#### Table: `feature_flags`

```sql
CREATE TABLE feature_flags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(100) NOT NULL UNIQUE,
  plan ENUM('basico', 'padrao', 'premium', 'all') NOT NULL DEFAULT 'all',
  limit_value INT DEFAULT NULL, -- NULL = unlimited
  description TEXT,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_plan (plan),
  INDEX idx_key (key)
);

-- Seed data
INSERT INTO feature_flags (key, plan, limit_value, description) VALUES
('lenses_per_year', 'basico', 12, 'Número de pares de lentes por ano'),
('lenses_per_year', 'padrao', 13, 'Número de pares de lentes por ano'),
('lenses_per_year', 'premium', 14, 'Número de pares de lentes por ano'),
('online_consults_per_year', 'basico', 1, 'Consultas online por ano'),
('online_consults_per_year', 'padrao', 2, 'Consultas online por ano'),
('online_consults_per_year', 'premium', 4, 'Consultas online por ano'),
('presential_consults_per_year', 'basico', 1, 'Consultas presenciais por ano'),
('presential_consults_per_year', 'padrao', 2, 'Consultas presenciais por ano'),
('presential_consults_per_year', 'premium', 2, 'Consultas presenciais por ano'),
('priority_scheduling', 'padrao', NULL, 'Agendamento prioritário'),
('priority_scheduling', 'premium', NULL, 'Agendamento prioritário'),
('complementary_exams', 'premium', NULL, 'Exames complementares inclusos'),
('premium_content_access', 'premium', NULL, 'Acesso a conteúdo premium'),
('whatsapp_24h', 'padrao', NULL, 'Suporte WhatsApp 24h'),
('whatsapp_24h', 'premium', NULL, 'Suporte WhatsApp 24h');
```

#### Table: `entitlements`

```sql
CREATE TABLE entitlements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  feature_key VARCHAR(100) NOT NULL,

  -- Override values (NULL = use default from feature_flags)
  limit_override INT DEFAULT NULL,
  usage_count INT DEFAULT 0,

  -- Lifecycle
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_feature (user_id, feature_key),
  INDEX idx_expires_at (expires_at)
);
```

#### Table: `invoices`

```sql
CREATE TABLE invoices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  subscription_id BIGINT,

  -- Provider info
  provider ENUM('stripe', 'asaas') NOT NULL,
  provider_invoice_id VARCHAR(255) NOT NULL,

  -- Billing
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  status ENUM(
    'draft',
    'open',
    'paid',
    'void',
    'uncollectible'
  ) NOT NULL DEFAULT 'open',

  -- Payment details
  payment_method VARCHAR(50), -- 'card', 'pix', 'boleto'
  paid_at TIMESTAMP,

  -- URLs
  hosted_invoice_url TEXT,
  invoice_pdf_url TEXT,

  -- Period
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  UNIQUE KEY unique_provider_invoice (provider, provider_invoice_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_paid_at (paid_at)
);
```

#### Table: `audit_log`

```sql
CREATE TABLE audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  clerk_id VARCHAR(255), -- Can be NULL for system actions

  -- Action details
  action ENUM(
    'login',
    'logout',
    'signup',
    'profile_update',
    'password_change',
    'mfa_enable',
    'mfa_disable',
    'subscription_create',
    'subscription_update',
    'subscription_cancel',
    'data_export_request',
    'data_deletion_request',
    'admin_action'
  ) NOT NULL,

  resource_type VARCHAR(50), -- 'user', 'subscription', 'invoice'
  resource_id VARCHAR(255),

  -- Context
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSON, -- Additional context

  -- Result
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_id (user_id),
  INDEX idx_clerk_id (clerk_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

---

## 3. Integração com Clerk

### 3.1 Setup Inicial

#### 3.1.1 Criar Conta e Aplicação

1. Criar conta em [clerk.com](https://clerk.com)
2. Criar 3 applications:
   - `saraiva-vision-dev` (desenvolvimento local)
   - `saraiva-vision-staging` (ambiente de teste)
   - `saraiva-vision-prod` (produção)

#### 3.1.2 Configurar Domínios

**Development**:
- Frontend: `http://localhost:3002`
- API: `http://localhost:3001`

**Production**:
- Frontend: `https://saraivavision.com.br`
- API: `https://saraivavision.com.br/api`

#### 3.1.3 Variáveis de Ambiente

```bash
# Frontend (.env)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx # Dev
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx # Prod

# Backend (backend/.env)
CLERK_SECRET_KEY=sk_test_xxx # Dev
CLERK_SECRET_KEY=sk_live_xxx # Prod
CLERK_WEBHOOK_SECRET=whsec_xxx
```

### 3.2 Frontend Integration

#### 3.2.1 Instalação

```bash
npm install @clerk/clerk-react
```

#### 3.2.2 Configuração do Provider

`src/main.jsx`:
```javascript
import { ClerkProvider } from '@clerk/clerk-react';
import { ptBR } from '@clerk/localizations';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

root.render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={clerkPubKey}
      localization={ptBR}
      appearance={{
        baseTheme: undefined, // Use default or custom theme
        variables: {
          colorPrimary: '#0070f3', // Saraiva Vision brand color
          borderRadius: '0.5rem'
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
```

#### 3.2.3 Proteção de Rotas

`src/components/ProtectedRoute.jsx`:
```javascript
import { useAuth } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router-dom';

export function ProtectedRoute({
  redirectTo = '/sign-in',
  requireSubscription = false
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const { subscription } = usePlan(); // Custom hook

  if (!isLoaded) {
    return <LoadingSpinner />;
  }

  if (!isSignedIn) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireSubscription && !subscription?.isActive) {
    return <Navigate to="/app/upgrade" replace />;
  }

  return <Outlet />;
}
```

`src/App.jsx`:
```javascript
import { ProtectedRoute } from './components/ProtectedRoute';
import { SignIn, SignUp } from '@clerk/clerk-react';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
      <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="invoices" element={<InvoicesPage />} />
        </Route>
      </Route>

      {/* Subscription-gated routes */}
      <Route element={<ProtectedRoute requireSubscription />}>
        <Route path="/app/library" element={<LibraryPage />} />
        <Route path="/app/premium-content" element={<PremiumContentPage />} />
      </Route>
    </Routes>
  );
}
```

#### 3.2.4 Custom Hooks

`src/hooks/usePlan.js`:
```javascript
import { useUser } from '@clerk/clerk-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function usePlan() {
  const { user } = useUser();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data } = await axios.get('/api/subscription', {
        headers: {
          Authorization: `Bearer ${await user?.getToken()}`
        }
      });
      return data;
    },
    enabled: !!user
  });

  return {
    subscription,
    isLoading,
    isActive: subscription?.status === 'active' || subscription?.status === 'trialing',
    plan: subscription?.plan,
    planType: subscription?.plan_type
  };
}
```

`src/hooks/useEntitlements.js`:
```javascript
export function useEntitlements() {
  const { user } = useUser();

  const { data: entitlements } = useQuery({
    queryKey: ['entitlements', user?.id],
    queryFn: async () => {
      const { data } = await axios.get('/api/entitlements', {
        headers: {
          Authorization: `Bearer ${await user?.getToken()}`
        }
      });
      return data;
    },
    enabled: !!user
  });

  const hasFeature = (featureKey) => {
    return entitlements?.some(e =>
      e.feature_key === featureKey &&
      (!e.expires_at || new Date(e.expires_at) > new Date())
    );
  };

  const getFeatureLimit = (featureKey) => {
    const entitlement = entitlements?.find(e => e.feature_key === featureKey);
    return entitlement?.limit_override ?? entitlement?.limit_value ?? null;
  };

  return {
    entitlements,
    hasFeature,
    getFeatureLimit
  };
}
```

### 3.3 Backend Integration

#### 3.3.1 Instalação

```bash
cd api
npm install @clerk/clerk-sdk-node
npm install @clerk/express
```

#### 3.3.2 Middleware Configuration

`api/src/middleware/clerk.js`:
```javascript
import { clerkClient, clerkMiddleware } from '@clerk/express';

// Global middleware - attaches req.auth
export const clerkAuth = clerkMiddleware();

// Route protection - requires authenticated session
export const requireAuth = (req, res, next) => {
  if (!req.auth?.userId) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  next();
};

// Role-based protection
export const requireRole = (role) => (req, res, next) => {
  if (!req.auth?.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { orgRole } = req.auth;
  if (orgRole !== role) {
    return res.status(403).json({
      error: 'Forbidden',
      message: `Requires role: ${role}`
    });
  }

  next();
};
```

`api/src/server.js`:
```javascript
import { clerkAuth } from './middleware/clerk.js';

app.use(clerkAuth); // Apply globally

// Protected routes
app.use('/api/user', requireAuth, userRoutes);
app.use('/api/subscription', requireAuth, subscriptionRoutes);
app.use('/api/admin', requireAuth, requireRole('admin'), adminRoutes);
```

#### 3.3.3 Webhook Handler

`api/src/webhooks/clerk-webhook.js`:
```javascript
import { Webhook } from 'svix';
import { db } from '../lib/database.js';

export async function handleClerkWebhook(req, res) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  // Verify webhook signature
  const svix_id = req.headers['svix-id'];
  const svix_timestamp = req.headers['svix-timestamp'];
  const svix_signature = req.headers['svix-signature'];

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt;

  try {
    evt = wh.verify(JSON.stringify(req.body), {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { type, data } = evt;

  try {
    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      case 'session.ended':
        await handleSessionEnded(data);
        break;
      default:
        console.log(`Unhandled event type: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleUserCreated(data) {
  const { id, email_addresses, first_name, last_name, image_url } = data;

  const primaryEmail = email_addresses.find(e => e.id === data.primary_email_address_id);

  await db.query(
    `INSERT INTO users (
      clerk_id, email, first_name, last_name, avatar_url
    ) VALUES (?, ?, ?, ?, ?)`,
    [id, primaryEmail.email_address, first_name, last_name, image_url]
  );

  console.log(`User created: ${id}`);
}

async function handleUserUpdated(data) {
  const { id, email_addresses, first_name, last_name, image_url } = data;

  const primaryEmail = email_addresses.find(e => e.id === data.primary_email_address_id);

  await db.query(
    `UPDATE users SET
      email = ?,
      first_name = ?,
      last_name = ?,
      avatar_url = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE clerk_id = ?`,
    [primaryEmail.email_address, first_name, last_name, image_url, id]
  );

  console.log(`User updated: ${id}`);
}

async function handleUserDeleted(data) {
  const { id } = data;

  // Cascade delete will handle related records
  await db.query('DELETE FROM users WHERE clerk_id = ?', [id]);

  console.log(`User deleted: ${id}`);
}

async function handleSessionEnded(data) {
  // Log session end for analytics
  console.log(`Session ended: ${data.user_id}`);
}
```

---

## 4. Integração com Pagamentos

### 4.1 Stripe Subscription Sync

#### 4.1.1 Stripe Checkout com Client Reference ID

`src/modules/payments/pages/PlanosFlexPage.jsx`:
```javascript
<stripe-pricing-table
  pricing-table-id="prctbl_1SLTeeLs8MC0aCdjujaEGM3N"
  publishable-key="pk_live_51OJdAcLs8MC0aCdjQwfyXkqJQRyRw0Au8D5C2BzxN90ekVz0AFEI6PpG0ELGQzJiRZZkWTu4Rj4BcjNZpiyH3LI800SkEiSITH"
  client-reference-id={user?.id} {/* Pass Clerk user ID */}
  customer-email={user?.primaryEmailAddress?.emailAddress}
/>
```

#### 4.1.2 Stripe Webhook Handler

`api/src/webhooks/stripe-webhook.js`:
```javascript
import Stripe from 'stripe';
import { db } from '../lib/database.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpsert(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
}

async function handleSubscriptionUpsert(subscription) {
  const {
    id,
    customer,
    status,
    items,
    trial_start,
    trial_end,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    cancel_at,
    canceled_at,
    ended_at,
    metadata
  } = subscription;

  // Extract clerk_id from metadata (set during checkout)
  const clerkId = metadata.clerk_user_id;

  if (!clerkId) {
    console.error('Missing clerk_user_id in subscription metadata');
    return;
  }

  // Get user from database
  const [user] = await db.query(
    'SELECT id FROM users WHERE clerk_id = ?',
    [clerkId]
  );

  if (!user) {
    console.error(`User not found for clerk_id: ${clerkId}`);
    return;
  }

  // Extract plan info from line items
  const priceId = items.data[0].price.id;
  const plan = mapPriceToPlan(priceId); // Helper function

  // Upsert subscription
  await db.query(
    `INSERT INTO subscriptions (
      user_id, provider, provider_subscription_id, provider_customer_id,
      plan, plan_type, status, amount, interval,
      trial_start, trial_end, current_period_start, current_period_end,
      cancel_at_period_end, cancel_at, canceled_at, ended_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      status = VALUES(status),
      current_period_start = VALUES(current_period_start),
      current_period_end = VALUES(current_period_end),
      cancel_at_period_end = VALUES(cancel_at_period_end),
      cancel_at = VALUES(cancel_at),
      canceled_at = VALUES(canceled_at),
      ended_at = VALUES(ended_at),
      updated_at = CURRENT_TIMESTAMP`,
    [
      user.id, 'stripe', id, customer,
      plan.name, plan.type, status, items.data[0].price.unit_amount / 100,
      items.data[0].price.recurring.interval,
      trial_start ? new Date(trial_start * 1000) : null,
      trial_end ? new Date(trial_end * 1000) : null,
      new Date(current_period_start * 1000),
      new Date(current_period_end * 1000),
      cancel_at_period_end,
      cancel_at ? new Date(cancel_at * 1000) : null,
      canceled_at ? new Date(canceled_at * 1000) : null,
      ended_at ? new Date(ended_at * 1000) : null
    ]
  );

  // Update entitlements
  await updateEntitlements(user.id, plan.name);

  console.log(`Subscription ${status}: ${id} for user ${clerkId}`);
}

async function updateEntitlements(userId, plan) {
  // Clear existing entitlements
  await db.query('DELETE FROM entitlements WHERE user_id = ?', [userId]);

  // Get feature flags for plan
  const features = await db.query(
    'SELECT * FROM feature_flags WHERE plan = ? OR plan = "all"',
    [plan]
  );

  // Grant entitlements
  for (const feature of features) {
    await db.query(
      `INSERT INTO entitlements (user_id, feature_key, limit_override)
       VALUES (?, ?, ?)`,
      [userId, feature.key, feature.limit_value]
    );
  }
}

function mapPriceToPlan(priceId) {
  const priceMap = {
    'price_basico_flex': { name: 'basico', type: 'flex' },
    'price_padrao_flex': { name: 'padrao', type: 'flex' },
    'price_premium_flex': { name: 'premium', type: 'flex' }
  };

  return priceMap[priceId] || { name: 'basico', type: 'flex' };
}
```

### 4.2 Asaas Integration (Brazil)

Similar webhook handler for Asaas payment events, mapped to the same `subscriptions` table structure.

---

## 5. LGPD Compliance

### 5.1 Data Subject Rights

#### 5.1.1 Data Export

`api/src/routes/user/export.js`:
```javascript
import { clerkClient } from '@clerk/express';

export async function exportUserData(req, res) {
  const userId = req.auth.userId;

  // Get Clerk data
  const clerkUser = await clerkClient.users.getUser(userId);

  // Get app data
  const [user] = await db.query('SELECT * FROM users WHERE clerk_id = ?', [userId]);
  const subscriptions = await db.query('SELECT * FROM subscriptions WHERE user_id = ?', [user.id]);
  const invoices = await db.query('SELECT * FROM invoices WHERE user_id = ?', [user.id]);
  const auditLogs = await db.query('SELECT * FROM audit_log WHERE user_id = ?', [user.id]);

  const exportData = {
    personal_data: {
      clerk_id: clerkUser.id,
      email: clerkUser.emailAddresses,
      name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      phone: clerkUser.phoneNumbers,
      created_at: clerkUser.createdAt
    },
    subscriptions,
    invoices,
    audit_logs: auditLogs
  };

  res.json({
    data: exportData,
    exported_at: new Date().toISOString(),
    format: 'json'
  });
}
```

#### 5.1.2 Data Deletion

`api/src/routes/user/delete.js`:
```javascript
export async function deleteUserData(req, res) {
  const userId = req.auth.userId;

  try {
    // Delete from Clerk
    await clerkClient.users.deleteUser(userId);

    // Database cascades will handle:
    // - users
    // - subscriptions (via FK CASCADE)
    // - entitlements (via FK CASCADE)
    // - invoices (via FK CASCADE)
    // - audit_log (via FK CASCADE)

    // Cancel active subscriptions with providers
    const activeSubscriptions = await db.query(
      `SELECT * FROM subscriptions
       WHERE user_id = (SELECT id FROM users WHERE clerk_id = ?)
       AND status IN ('active', 'trialing')`,
      [userId]
    );

    for (const sub of activeSubscriptions) {
      if (sub.provider === 'stripe') {
        await stripe.subscriptions.cancel(sub.provider_subscription_id);
      } else if (sub.provider === 'asaas') {
        await asaas.subscriptions.cancel(sub.provider_subscription_id);
      }
    }

    res.json({
      message: 'User data deleted successfully',
      deleted_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Deletion failed' });
  }
}
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

```javascript
// __tests__/services/subscription.test.js
import { SubscriptionService } from '../../services/subscription';

describe('SubscriptionService', () => {
  it('should create subscription from Stripe webhook', async () => {
    const webhookPayload = {
      id: 'sub_123',
      customer: 'cus_123',
      status: 'active',
      // ...
    };

    await SubscriptionService.upsertFromStripe(webhookPayload);

    const sub = await db.query('SELECT * FROM subscriptions WHERE provider_subscription_id = ?', ['sub_123']);
    expect(sub).toBeDefined();
    expect(sub.status).toBe('active');
  });

  it('should grant entitlements on subscription creation', async () => {
    await SubscriptionService.updateEntitlements(userId, 'premium');

    const entitlements = await db.query('SELECT * FROM entitlements WHERE user_id = ?', [userId]);
    expect(entitlements.length).toBeGreaterThan(0);
    expect(entitlements.some(e => e.feature_key === 'premium_content_access')).toBe(true);
  });
});
```

### 6.2 Integration Tests

```javascript
// __tests__/integration/auth-flow.test.js
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Authentication Flow', () => {
  it('should redirect unauthenticated users to sign-in', async () => {
    render(<App />);

    // Try to access protected route
    userEvent.click(screen.getByText('Dashboard'));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/sign-in');
    });
  });

  it('should allow authenticated users to access protected routes', async () => {
    // Mock Clerk auth
    const { user } = renderWithAuth(<App />);

    userEvent.click(screen.getByText('Dashboard'));

    await waitFor(() => {
      expect(screen.getByText('Welcome to Dashboard')).toBeInTheDocument();
    });
  });
});
```

### 6.3 E2E Tests

```javascript
// e2e/subscription-flow.spec.js
import { test, expect } from '@playwright/test';

test('complete subscription flow', async ({ page }) => {
  // Login
  await page.goto('/sign-in');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Navigate to pricing
  await page.goto('/planosflex');

  // Click on premium plan
  await page.click('[data-plan="premium"]');

  // Fill Stripe checkout (test mode)
  await page.waitForSelector('iframe[name*="stripe"]');
  const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
  await stripeFrame.fill('[name="cardnumber"]', '4242424242424242');
  await stripeFrame.fill('[name="exp-date"]', '12/34');
  await stripeFrame.fill('[name="cvc"]', '123');
  await stripeFrame.fill('[name="postal"]', '12345');

  // Submit payment
  await page.click('button:has-text("Subscribe")');

  // Verify subscription in dashboard
  await page.waitForURL('/app/dashboard');
  await expect(page.locator('text=Plan: Premium')).toBeVisible();
});
```

---

## 7. Monitoramento e Observabilidade

### 7.1 Métricas Chave

```javascript
// src/lib/metrics.js
import posthog from 'posthog-js';

export const trackEvent = (event, properties = {}) => {
  posthog.capture(event, {
    ...properties,
    timestamp: new Date().toISOString()
  });
};

// Login success/failure
trackEvent('login_success', { method: 'email', userId });
trackEvent('login_failure', { method: 'oauth_google', error: 'oauth_cancelled' });

// Subscription events
trackEvent('subscription_created', { plan: 'premium', provider: 'stripe' });
trackEvent('subscription_cancelled', { plan: 'basico', reason: 'too_expensive' });

// Feature usage
trackEvent('premium_content_accessed', { contentId: '123', userId });
trackEvent('mfa_enabled', { method: 'totp', userId });
```

### 7.2 Logging

```javascript
// api/src/lib/logger.js
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'saraiva-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log authentication events
logger.info('User authenticated', {
  userId: req.auth.userId,
  method: 'jwt',
  ip: req.ip
});

// Log webhook processing
logger.info('Stripe webhook received', {
  type: event.type,
  subscriptionId: event.data.object.id
});
```

### 7.3 Alertas

**Sentry Configuration**:
```javascript
// src/lib/sentry.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});

// Capture authentication errors
Sentry.captureException(new Error('Login failed'), {
  tags: { feature: 'auth' },
  extra: { userId, method }
});
```

---

## 8. Segurança

### 8.1 Content Security Policy

Atualizar `/etc/nginx/sites-enabled/saraivavision`:

```nginx
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://accounts.google.com https://*.clerk.accounts.dev;
  connect-src 'self' https://api.stripe.com https://clerk.saraivavision.com.br https://*.clerk.accounts.dev;
  frame-src 'self' https://js.stripe.com https://accounts.google.com https://*.clerk.accounts.dev;
  img-src 'self' data: https:;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
" always;
```

### 8.2 Rate Limiting

```nginx
# Clerk webhook endpoint
location /api/webhooks/clerk {
  limit_req zone=webhook_limit burst=10 nodelay;
  proxy_pass http://127.0.0.1:3001;
}

# Auth endpoints
location /api/auth {
  limit_req zone=api_limit burst=20 nodelay;
  proxy_pass http://127.0.0.1:3001;
}
```

### 8.3 Session Management

- JWT tokens com expiração de 1 hora
- Refresh token automático antes da expiração
- Revogação de sessão no logout
- Detecção de anomalias (múltiplos logins simultâneos)

---

## 9. Custos Detalhados

### 9.1 Clerk Pricing

| Tier | MAU | Custo/mês (USD) | Custo/mês (BRL) | Features |
|------|-----|-----------------|-----------------|----------|
| **Free** | 0-10,000 | $0 | R$ 0 | Email/Password, OAuth básico |
| **Pro** | 10,000+ | $25 base + $0.02/MAU | R$ 125 + R$ 0.10/MAU | MFA, Organizations, Custom branding |
| **Enterprise** | Custom | Custom | Custom | SLA, Priority support, SSO |

**Exemplo**:
- 500 MAU: Pro tier = $25 + (500 × $0.02) = $35/mês = **R$ 175/mês**
- 2,000 MAU: Pro tier = $25 + (2,000 × $0.02) = $65/mês = **R$ 325/mês**

### 9.2 Infraestrutura

| Serviço | Tier | Custo/mês (BRL) |
|---------|------|-----------------|
| VPS (atual) | - | R$ 0 (já pago) |
| Database (MySQL) | - | R$ 0 (local) ou R$ 150 (managed) |
| Redis Cache | - | R$ 0 (local) ou R$ 100 (managed) |
| CDN/Assets | - | R$ 50 |
| Monitoring (Sentry) | Developer | R$ 100 |
| **Total** | - | **R$ 250-400** |

### 9.3 Payment Processing

| Provider | Taxa | Exemplo (R$ 149,99) |
|----------|------|---------------------|
| Stripe | 4.99% + R$ 0.39 | R$ 7.87 |
| Asaas | 3.99% + R$ 0.40 | R$ 6.39 |

### 9.4 Resumo Mensal (500 usuários ativos)

| Item | Custo (BRL) |
|------|-------------|
| Clerk (Pro tier) | R$ 175 |
| Infraestrutura | R$ 300 |
| Payment fees (variável) | ~R$ 500 |
| **Total Operacional** | **R$ 975/mês** |

---

## 10. Cronograma de Implementação

| Fase | Duração | Entregas |
|------|---------|----------|
| **Fase 0: Preparação** | 1 semana | Setup Clerk, definição de schemas, documentação |
| **Fase 1: Auth Básica** | 1-2 semanas | SignIn/SignUp, protected routes, JWT validation |
| **Fase 2: Área do Assinante** | 1-2 semanas | Dashboard, profile, feature gating |
| **Fase 3: Webhooks** | 2-3 semanas | Stripe/Asaas sync, subscription management |
| **Fase 4: Segurança** | 1-2 semanas | MFA, LGPD compliance, audit logs |
| **Fase 5: Launch** | 1-2 semanas | Monitoring, load testing, runbooks |
| **Total** | **6-10 semanas** | Sistema completo de autenticação e assinaturas |

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Clerk outage | Baixa | Alto | Graceful degradation, mensagem de manutenção |
| Sincronização falha (Stripe/Clerk) | Média | Médio | Job reconciliador diário, alertas |
| Custos excedem orçamento | Média | Alto | Monitorar MAU, implementar tier adequado |
| Complexidade LGPD | Alta | Alto | Consultoria jurídica, DPA com Clerk |
| Problemas de UX | Média | Médio | Testes de usabilidade, feedback beta |

---

## 12. Conclusão

A integração do Clerk como solução de autenticação para o Saraiva Vision é **tecnicamente viável**, **economicamente sustentável** e **estrategicamente alinhada** com os objetivos de negócio.

**Principais Benefícios**:
- Redução de 60-70% do tempo de desenvolvimento vs. solução custom
- Compliance LGPD facilitado
- Escalabilidade automática
- UX moderna e familiar para usuários

**Recomendação**: Aprovar implementação com início na Fase 0 (Preparação).

---

**Aprovação Pendente**: Dr. Philipe Saraiva Cruz
**Próximos Passos**: Criar conta Clerk e iniciar setup de ambientes
