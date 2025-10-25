# Gap Analysis: Estado Atual vs. Requisitos da Integração Clerk

**Version**: 1.0
**Status**: Active
**Created**: 2025-10-25
**Updated**: 2025-10-25

## Resumo Executivo

Este documento identifica as lacunas (gaps) entre o **estado atual** do Saraiva Vision e os **requisitos necessários** para implementar a integração completa com Clerk Auth e sistema de assinaturas.

### Prioridade de Implementação
- 🔴 **Crítico**: Bloqueador para funcionalidade básica
- 🟡 **Alto**: Necessário para produção
- 🟢 **Médio**: Melhoria incremental
- ⚪ **Baixo**: Nice-to-have

---

## 1. Autenticação e Autorização

### 1.1 Frontend Authentication

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Clerk SDK** | ❌ Não instalado | ✅ `@clerk/clerk-react` instalado e configurado | Instalar pacote + ClerkProvider | 🔴 Crítico |
| **Sign In Page** | ❌ Não existe | ✅ Componente `<SignIn />` em `/sign-in` | Criar rota e integrar componente | 🔴 Crítico |
| **Sign Up Page** | ❌ Não existe | ✅ Componente `<SignUp />` em `/sign-up` | Criar rota e integrar componente | 🔴 Crítico |
| **User Button** | ❌ Não existe | ✅ `<UserButton />` no header | Adicionar ao Layout | 🔴 Crítico |
| **Protected Routes** | ❌ Todas as rotas são públicas | ✅ ProtectedRoute wrapper para `/app/*` | Criar componente de proteção | 🔴 Crítico |
| **Auth Hooks** | ❌ Não existem | ✅ `useAuth()`, `useUser()`, `useSession()` | Importar do Clerk SDK | 🔴 Crítico |
| **OAuth Providers** | ❌ Não configurado | ✅ Google, Apple (opcional) | Configurar no Clerk Dashboard | 🟡 Alto |
| **MFA/TOTP** | ❌ Não implementado | ✅ Opcional para usuários, obrigatório para admin | Configurar no Clerk Dashboard | 🟡 Alto |
| **Magic Links** | ❌ Não implementado | ✅ Opção alternativa de login | Habilitar no Clerk | 🟢 Médio |
| **Session Management** | ⚠️ HealthcareSessionManager existe mas não usado | ✅ Clerk gerencia sessões automaticamente | Remover código legado | ⚪ Baixo |

**Estimativa**: 1-2 semanas

---

### 1.2 Backend Authentication

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Clerk SDK** | ❌ Não instalado | ✅ `@clerk/clerk-sdk-node` e `@clerk/express` | Instalar pacotes | 🔴 Crítico |
| **JWT Middleware** | ❌ Não existe | ✅ `clerkMiddleware()` global + `requireAuth()` | Criar middleware | 🔴 Crítico |
| **Token Validation** | ❌ Nenhuma validação | ✅ Validar assinatura JWT em cada request | Implementar no middleware | 🔴 Crítico |
| **User Context** | ❌ Não existe | ✅ `req.auth.userId` disponível em rotas protegidas | Configurar middleware | 🔴 Crítico |
| **Role Validation** | ❌ Não implementado | ✅ `requireRole('admin')` para rotas admin | Criar middleware RBAC | 🟡 Alto |
| **API Routes** | ⚠️ Todas públicas | ✅ `/api/user/*`, `/api/subscription/*` protegidas | Aplicar middleware | 🔴 Crítico |
| **Session Revocation** | ❌ Não implementado | ✅ Clerk gerencia revogação | Nenhum (automático) | ✅ Completo |

**Estimativa**: 1 semana

---

## 2. User Management

### 2.1 Database Schema

| Tabela | Estado Atual | Requisito | Gap | Prioridade |
|--------|--------------|-----------|-----|------------|
| **users** | ❌ Não existe | ✅ Tabela com clerk_id, email, profile | Criar schema e migração | 🔴 Crítico |
| **subscriptions** | ❌ Não existe | ✅ Tabela com user_id, plan, status, provider | Criar schema e migração | 🔴 Crítico |
| **feature_flags** | ❌ Não existe | ✅ Tabela com key, plan, limit | Criar schema e seed data | 🔴 Crítico |
| **entitlements** | ❌ Não existe | ✅ Tabela user_id + feature_key + limit | Criar schema | 🔴 Crítico |
| **invoices** | ❌ Não existe | ✅ Tabela com user_id, provider_invoice_id | Criar schema | 🟡 Alto |
| **audit_log** | ❌ Não existe | ✅ Tabela de auditoria de ações sensíveis | Criar schema | 🟡 Alto |

**Estimativa**: 3-5 dias

---

### 2.2 User Profile

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Profile Page** | ❌ Não existe | ✅ `/app/profile` com dados editáveis | Criar página | 🔴 Crítico |
| **Avatar Upload** | ❌ Não implementado | ✅ Upload via Clerk `<UserProfile />` | Usar componente Clerk | 🟢 Médio |
| **Email Change** | ❌ Não implementado | ✅ Clerk gerencia mudanças de e-mail | Nenhum (automático) | ✅ Completo |
| **Password Change** | ❌ Não implementado | ✅ Clerk gerencia mudanças de senha | Nenhum (automático) | ✅ Completo |
| **Profile API** | ❌ Não existe | ✅ `/api/user/profile` GET/PUT | Criar endpoints | 🔴 Crítico |

**Estimativa**: 3-5 dias

---

## 3. Subscription Management

### 3.1 Stripe Integration

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Pricing Table** | ✅ Implementado em `/planosflex` | ✅ Funcional com client_reference_id | Adicionar clerk_user_id ao metadata | 🔴 Crítico |
| **Checkout** | ✅ Stripe Checkout funciona | ✅ Passar clerk_id no checkout | Modificar integração | 🔴 Crítico |
| **Customer Portal** | ❌ Não configurado | ✅ Portal para usuários gerenciarem assinaturas | Configurar Stripe Portal + link | 🟡 Alto |
| **Webhook Handler** | ⚠️ Infraestrutura existe, sem business logic | ✅ Processar subscription.*, invoice.* | Implementar handlers | 🔴 Crítico |
| **Subscription Sync** | ❌ Não implementado | ✅ Sincronizar status Stripe → DB | Criar serviço de sync | 🔴 Crítico |
| **Idempotency** | ❌ Não implementado | ✅ Garantir webhooks idempotentes | Adicionar deduplicação | 🟡 Alto |
| **Reconciliation Job** | ❌ Não existe | ✅ Job diário para consistência | Criar cron job | 🟢 Médio |

**Estimativa**: 2-3 semanas

---

### 3.2 Asaas Integration

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Payment Links** | ✅ Configurados em `plans.js` | ✅ Links funcionais | Adicionar user tracking | 🟡 Alto |
| **Webhook Handler** | ❌ Não existe | ✅ Processar payment.*, subscription.* | Criar handler | 🔴 Crítico |
| **Subscription Sync** | ❌ Não implementado | ✅ Sincronizar status Asaas → DB | Criar serviço de sync | 🔴 Crítico |
| **PIX/Boleto** | ✅ Suportado pelo Asaas | ✅ Usuários podem pagar via PIX/Boleto | Configuração existente OK | ✅ Completo |

**Estimativa**: 1-2 semanas

---

## 4. Área do Assinante

### 4.1 Dashboard

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Dashboard Page** | ❌ Não existe | ✅ `/app/dashboard` com overview | Criar página | 🔴 Crítico |
| **Current Plan Widget** | ❌ Não existe | ✅ Mostrar plano ativo, status, próxima renovação | Criar componente | 🔴 Crítico |
| **Usage Metrics** | ❌ Não implementado | ✅ Lentes restantes, consultas usadas | Criar componente + API | 🟡 Alto |
| **Quick Actions** | ❌ Não existe | ✅ Links para perfil, faturas, suporte | Criar componente | 🟢 Médio |
| **Notifications** | ❌ Não implementado | ✅ Alertas de renovação, falhas de pagamento | Criar sistema de notificações | 🟢 Médio |

**Estimativa**: 1 semana

---

### 4.2 Invoice Management

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Invoice List** | ❌ Não existe | ✅ `/app/invoices` com histórico | Criar página | 🟡 Alto |
| **Invoice Details** | ❌ Não existe | ✅ Detalhes de cada fatura | Criar modal/página | 🟡 Alto |
| **PDF Download** | ❌ Não implementado | ✅ Download de PDF das faturas | Integrar com Stripe/Asaas | 🟡 Alto |
| **Payment Status** | ❌ Não implementado | ✅ Badge visual (paid/pending/failed) | Criar componente | 🟡 Alto |
| **Invoice API** | ❌ Não existe | ✅ `/api/invoices` GET | Criar endpoint | 🟡 Alto |

**Estimativa**: 3-5 dias

---

### 4.3 Content Library (Premium)

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Library Page** | ❌ Não existe | ✅ `/app/library` com conteúdo premium | Criar página | 🟢 Médio |
| **Feature Gating** | ❌ Não implementado | ✅ Verificar entitlements antes de acesso | Criar middleware/guard | 🔴 Crítico |
| **Content API** | ❌ Não existe | ✅ `/api/content/premium` protegido | Criar endpoint | 🟢 Médio |
| **Access Control** | ❌ Não implementado | ✅ 403 Forbidden se sem permissão | Implementar lógica | 🔴 Crítico |

**Estimativa**: 1 semana

---

## 5. Feature Flags & Entitlements

### 5.1 Feature Flag System

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Feature Flags DB** | ❌ Não existe | ✅ Tabela `feature_flags` populada | Criar e seed | 🔴 Crítico |
| **Entitlements Service** | ❌ Não implementado | ✅ Serviço para grant/check/revoke | Criar serviço | 🔴 Crítico |
| **Frontend Hook** | ❌ Não existe | ✅ `useEntitlements()` hook | Criar hook customizado | 🔴 Crítico |
| **Backend Middleware** | ❌ Não existe | ✅ `requireFeature('key')` middleware | Criar middleware | 🔴 Crítico |
| **Auto-grant on Subscribe** | ❌ Não implementado | ✅ Webhook cria entitlements automaticamente | Implementar lógica | 🔴 Crítico |

**Estimativa**: 1 semana

---

## 6. Webhooks

### 6.1 Clerk Webhooks

| Evento | Estado Atual | Requisito | Gap | Prioridade |
|--------|--------------|-----------|-----|------------|
| **user.created** | ❌ Não tratado | ✅ Criar registro em `users` table | Implementar handler | 🔴 Crítico |
| **user.updated** | ❌ Não tratado | ✅ Atualizar registro de usuário | Implementar handler | 🟡 Alto |
| **user.deleted** | ❌ Não tratado | ✅ Cascade delete + cancelar subscriptions | Implementar handler | 🟡 Alto |
| **session.ended** | ❌ Não tratado | ✅ Log de auditoria | Implementar handler | 🟢 Médio |
| **Webhook Endpoint** | ❌ Não existe | ✅ `/api/webhooks/clerk` | Criar rota | 🔴 Crítico |
| **Signature Verification** | ❌ Não implementado | ✅ Validar assinatura svix | Implementar validação | 🔴 Crítico |

**Estimativa**: 3-5 dias

---

### 6.2 Stripe Webhooks

| Evento | Estado Atual | Requisito | Gap | Prioridade |
|--------|--------------|-----------|-----|------------|
| **subscription.created** | ⚠️ Handler stub existe | ✅ Criar subscription em DB | Implementar lógica | 🔴 Crítico |
| **subscription.updated** | ⚠️ Handler stub existe | ✅ Atualizar status e período | Implementar lógica | 🔴 Crítico |
| **subscription.deleted** | ⚠️ Handler stub existe | ✅ Marcar como canceled | Implementar lógica | 🔴 Crítico |
| **invoice.payment_succeeded** | ⚠️ Handler stub existe | ✅ Criar invoice record | Implementar lógica | 🟡 Alto |
| **invoice.payment_failed** | ⚠️ Handler stub existe | ✅ Notificar usuário, mudar status | Implementar lógica | 🟡 Alto |
| **Idempotency** | ❌ Não implementado | ✅ Prevenir duplicação de eventos | Adicionar deduplicação | 🟡 Alto |

**Estimativa**: 1-2 semanas

---

### 6.3 Asaas Webhooks

| Evento | Estado Atual | Requisito | Gap | Prioridade |
|--------|--------------|-----------|-----|------------|
| **payment.created** | ❌ Não tratado | ✅ Registrar pagamento pendente | Implementar handler | 🔴 Crítico |
| **payment.confirmed** | ❌ Não tratado | ✅ Ativar assinatura | Implementar handler | 🔴 Crítico |
| **payment.overdue** | ❌ Não tratado | ✅ Mudar status para past_due | Implementar handler | 🟡 Alto |
| **subscription.canceled** | ❌ Não tratado | ✅ Marcar como canceled | Implementar handler | 🔴 Crítico |
| **Webhook Endpoint** | ❌ Não existe | ✅ `/api/webhooks/asaas` | Criar rota | 🔴 Crítico |

**Estimativa**: 1 semana

---

## 7. LGPD Compliance

### 7.1 Data Subject Rights

| Direito | Estado Atual | Requisito | Gap | Prioridade |
|---------|--------------|-----------|-----|------------|
| **Data Export** | ❌ Não implementado | ✅ `/api/user/export` retorna todos os dados | Criar endpoint | 🟡 Alto |
| **Data Deletion** | ❌ Não implementado | ✅ `/api/user/delete` remove dados | Criar endpoint | 🟡 Alto |
| **Consent Management** | ⚠️ Parcial (consent flags existem) | ✅ UI para gerenciar consentimentos | Criar interface | 🟡 Alto |
| **Retention Policy** | ❌ Não implementado | ✅ Auto-delete após período configurado | Criar job | 🟢 Médio |
| **DPA with Clerk** | ❌ Não assinado | ✅ Data Processing Agreement assinado | Assinar DPA | 🟡 Alto |

**Estimativa**: 1 semana

---

### 7.2 Audit Logging

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Audit Log Table** | ❌ Não existe | ✅ Tabela `audit_log` com eventos | Criar schema | 🟡 Alto |
| **Login Logging** | ❌ Não implementado | ✅ Log de todos os logins | Implementar logger | 🟡 Alto |
| **Profile Changes** | ❌ Não implementado | ✅ Log de mudanças de perfil | Implementar logger | 🟡 Alto |
| **Subscription Changes** | ❌ Não implementado | ✅ Log de mudanças de plano | Implementar logger | 🟡 Alto |
| **Data Access** | ❌ Não implementado | ✅ Log de acesso a dados sensíveis | Implementar logger | 🟢 Médio |

**Estimativa**: 3-5 dias

---

## 8. Segurança

### 8.1 Network Security

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **CSP Headers** | ⚠️ Existe mas não inclui Clerk | ✅ Adicionar domínios Clerk ao CSP | Atualizar Nginx config | 🔴 Crítico |
| **Rate Limiting** | ✅ Configurado para API | ✅ Rate limit em `/api/webhooks/*` | Configurar zona específica | 🟡 Alto |
| **CORS** | ✅ Configurado | ✅ Whitelist domínios Clerk | Atualizar config | 🟡 Alto |
| **HTTPS** | ✅ Let's Encrypt ativo | ✅ Mantém HTTPS obrigatório | Nenhum | ✅ Completo |

**Estimativa**: 1-2 dias

---

### 8.2 MFA & Password Policies

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **MFA Optional** | ❌ Não configurado | ✅ TOTP/SMS disponível para usuários | Habilitar no Clerk | 🟡 Alto |
| **MFA Enforcement** | ❌ Não configurado | ✅ MFA obrigatório para role admin | Configurar policy | 🟡 Alto |
| **Password Policy** | ❌ Não configurado | ✅ Mínimo 8 chars, complexidade | Configurar no Clerk | 🟡 Alto |
| **Brute Force Protection** | ❌ Não implementado | ✅ Clerk gerencia lockout automático | Nenhum (automático) | ✅ Completo |

**Estimativa**: 2-3 dias

---

## 9. Monitoring & Observability

### 9.1 Logging

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Structured Logging** | ❌ Não implementado | ✅ Winston ou Pino com JSON format | Configurar logger | 🟡 Alto |
| **Correlation IDs** | ❌ Não implementado | ✅ Request ID em todos os logs | Adicionar middleware | 🟡 Alto |
| **Log Levels** | ❌ Não configurado | ✅ ENV-based log levels (dev: debug, prod: info) | Configurar | 🟢 Médio |

**Estimativa**: 2-3 dias

---

### 9.2 Metrics

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Login Success Rate** | ❌ Não rastreado | ✅ Track via PostHog | Implementar tracking | 🟢 Médio |
| **Subscription Churn** | ❌ Não rastreado | ✅ Track cancelamentos | Implementar tracking | 🟢 Médio |
| **Webhook Failures** | ❌ Não rastreado | ✅ Alertas em falhas consecutivas | Configurar alertas | 🟡 Alto |
| **API Latency** | ❌ Não rastreado | ✅ Monitor response times | Implementar APM | 🟢 Médio |

**Estimativa**: 3-5 dias

---

## 10. Testing

### 10.1 Test Coverage

| Tipo | Estado Atual | Requisito | Gap | Prioridade |
|------|--------------|-----------|-----|------------|
| **Unit Tests** | ⚠️ Parcial (alguns testes existem) | ✅ 80%+ coverage em services | Adicionar testes | 🟡 Alto |
| **Integration Tests** | ❌ Não existem | ✅ Testes de auth flow, subscription flow | Criar testes | 🟡 Alto |
| **E2E Tests** | ❌ Não existem | ✅ Playwright para fluxos críticos | Criar testes | 🟢 Médio |
| **Webhook Tests** | ⚠️ Estrutura existe | ✅ Testes com payloads reais | Expandir cobertura | 🟡 Alto |

**Estimativa**: 1-2 semanas

---

## 11. DevOps & Deployment

### 11.1 Environment Configuration

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Clerk Keys (Dev)** | ❌ Não configurado | ✅ Clerk dev keys em `.env` | Obter e configurar | 🔴 Crítico |
| **Clerk Keys (Prod)** | ❌ Não configurado | ✅ Clerk prod keys em produção | Obter e configurar | 🔴 Crítico |
| **Webhook URLs** | ❌ Não configurado | ✅ URLs configuradas em Clerk/Stripe/Asaas | Configurar webhooks | 🔴 Crítico |
| **Database Migration** | ❌ Não existe | ✅ Migrations para novas tabelas | Criar migrations | 🔴 Crítico |

**Estimativa**: 2-3 dias

---

### 11.2 CI/CD

| Componente | Estado Atual | Requisito | Gap | Prioridade |
|------------|--------------|-----------|-----|------------|
| **Build Pipeline** | ✅ Existe (`npm run build:vite`) | ✅ Mantém pipeline existente | Nenhum | ✅ Completo |
| **Test Pipeline** | ⚠️ Parcial | ✅ Roda testes antes de deploy | Adicionar ao deploy script | 🟡 Alto |
| **Rollback Strategy** | ✅ Backup via deploy scripts | ✅ Rollback automático em falha | Melhorar scripts | 🟢 Médio |

**Estimativa**: 2-3 dias

---

## Resumo de Gaps por Categoria

| Categoria | Total de Gaps | Críticos | Alto | Médio | Baixo | Estimativa Total |
|-----------|---------------|----------|------|-------|-------|------------------|
| **Autenticação Frontend** | 10 | 7 | 2 | 1 | 0 | 1-2 semanas |
| **Autenticação Backend** | 7 | 5 | 1 | 0 | 1 | 1 semana |
| **Database Schema** | 6 | 6 | 0 | 0 | 0 | 3-5 dias |
| **User Profile** | 5 | 2 | 0 | 2 | 1 | 3-5 dias |
| **Stripe Integration** | 7 | 4 | 2 | 1 | 0 | 2-3 semanas |
| **Asaas Integration** | 4 | 2 | 1 | 0 | 1 | 1-2 semanas |
| **Dashboard** | 5 | 2 | 1 | 2 | 0 | 1 semana |
| **Invoice Management** | 5 | 0 | 5 | 0 | 0 | 3-5 dias |
| **Content Library** | 4 | 2 | 0 | 2 | 0 | 1 semana |
| **Feature Flags** | 5 | 5 | 0 | 0 | 0 | 1 semana |
| **Clerk Webhooks** | 6 | 3 | 2 | 1 | 0 | 3-5 dias |
| **Stripe Webhooks** | 6 | 3 | 3 | 0 | 0 | 1-2 semanas |
| **Asaas Webhooks** | 5 | 4 | 1 | 0 | 0 | 1 semana |
| **LGPD Compliance** | 5 | 0 | 4 | 1 | 0 | 1 semana |
| **Audit Logging** | 5 | 0 | 3 | 2 | 0 | 3-5 dias |
| **Network Security** | 4 | 1 | 2 | 0 | 1 | 1-2 dias |
| **MFA & Passwords** | 4 | 0 | 3 | 0 | 1 | 2-3 dias |
| **Logging** | 3 | 0 | 2 | 1 | 0 | 2-3 dias |
| **Metrics** | 4 | 0 | 1 | 3 | 0 | 3-5 dias |
| **Testing** | 4 | 0 | 3 | 1 | 0 | 1-2 semanas |
| **Environment** | 4 | 4 | 0 | 0 | 0 | 2-3 dias |
| **CI/CD** | 3 | 0 | 1 | 1 | 1 | 2-3 dias |

**Total de Gaps**: 101 gaps identificados
**Gaps Críticos**: 45 (bloqueadores)
**Gaps Alto**: 33 (necessários para produção)
**Gaps Médio**: 17 (melhorias incrementais)
**Gaps Baixo**: 6 (nice-to-have)

---

## Caminho Crítico de Implementação

### Semana 1-2: Autenticação Básica (Fase 1)
1. ✅ Instalar Clerk SDKs (frontend + backend)
2. ✅ Criar database schema (users, subscriptions, feature_flags, entitlements)
3. ✅ Implementar SignIn/SignUp
4. ✅ Configurar ProtectedRoute
5. ✅ Implementar JWT validation no backend
6. ✅ Configurar Clerk webhooks básicos

### Semana 3-4: Área do Assinante (Fase 2)
1. ✅ Criar Dashboard page
2. ✅ Implementar Profile management
3. ✅ Criar Feature Flag system
4. ✅ Implementar Feature Gating

### Semana 5-7: Webhooks e Pagamentos (Fase 3)
1. ✅ Implementar Stripe webhook handlers
2. ✅ Implementar Asaas webhook handlers
3. ✅ Criar Subscription sync service
4. ✅ Implementar Invoice management
5. ✅ Criar Reconciliation job

### Semana 8: Segurança e Compliance (Fase 4)
1. ✅ Configurar MFA
2. ✅ Implementar LGPD endpoints
3. ✅ Configurar Audit logging
4. ✅ Atualizar CSP headers

### Semana 9-10: Testing e Launch (Fase 5)
1. ✅ Criar testes de integração
2. ✅ Testes E2E
3. ✅ Load testing
4. ✅ Monitoring e alertas
5. ✅ Runbooks de suporte
6. ✅ Go-live

---

## Conclusão

A implementação da integração Clerk requer endereçar **101 gaps** identificados, sendo **45 críticos** que bloqueiam funcionalidade básica. O caminho crítico sugere **6-10 semanas** de desenvolvimento focado.

**Priorização Recomendada**:
1. **Foco Inicial**: Gaps críticos de autenticação e database (Semanas 1-2)
2. **Segunda Onda**: Área do assinante e feature gating (Semanas 3-4)
3. **Terceira Onda**: Integração completa de pagamentos (Semanas 5-7)
4. **Polimento**: Segurança, compliance e observabilidade (Semanas 8-10)

**Dependências Externas**:
- ✅ Conta Clerk criada
- ✅ Webhooks configurados (Clerk, Stripe, Asaas)
- ✅ Chaves de API obtidas
- ✅ Database migration executada

**Próximo Passo**: Iniciar Fase 0 (Preparação) com criação de conta Clerk e setup de ambientes.

---

**Documento Criado**: 2025-10-25
**Próxima Revisão**: Após conclusão da Fase 1
