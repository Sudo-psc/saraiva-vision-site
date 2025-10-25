# 010 - Clerk Auth Integration

**Status**: 📋 Planning
**Priority**: High
**Estimate**: 6-10 weeks
**Created**: 2025-10-25
**Updated**: 2025-10-25

## Visão Geral

Integração completa do Clerk como solução de autenticação e autorização para a área do assinante do Saraiva Vision, transformando o site de uma plataforma informativa em uma aplicação SaaS completa com gestão de usuários, assinaturas e conteúdo premium.

## Problema

Atualmente o Saraiva Vision é um website 100% público sem sistema de autenticação. Com a expansão para planos de assinatura (Presencial, Flex e Online), há necessidade de:

- Sistema de login/cadastro de pacientes
- Gestão de perfis de usuário
- Controle de acesso a conteúdo premium
- Sincronização com assinaturas Stripe/Asaas
- Dashboard do assinante
- Conformidade LGPD com gestão de dados pessoais

## Solução Proposta

Integrar **Clerk** como plataforma de autenticação completa:

### Funcionalidades Principais

- **Autenticação**: E-mail/senha, Magic Links, OAuth (Google, Apple, GitHub)
- **Multi-factor Authentication (MFA)**: TOTP, SMS, autenticação biométrica
- **Gestão de Sessão**: Tokens JWT seguros, refresh automático
- **Perfis de Usuário**: Dados básicos + metadados de assinatura
- **Área do Assinante**: Dashboard, gerenciamento de plano, histórico
- **Webhooks**: Sincronização bidirecional com Stripe/Asaas
- **LGPD Compliance**: Exportação, exclusão e gestão de dados pessoais

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     CLERK AUTH PLATFORM                      │
│  (User Management, Sessions, MFA, OAuth, Organizations)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ JWT Tokens
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   SARAIVA VISION FRONTEND                    │
│           React/Vite + Clerk React SDK + React Router        │
├─────────────────────────────────────────────────────────────┤
│  Public Routes        │  Protected Routes (Subscriber Area)  │
│  - Home               │  - Dashboard                         │
│  - Services           │  - Profile Management                │
│  - Blog               │  - Subscription Details              │
│  - Contact            │  - Invoice History                   │
│  - Pricing            │  - Content Library (Premium)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND API (Node.js/Express)               │
│                  Port 3001 + Clerk Middleware                │
├─────────────────────────────────────────────────────────────┤
│  Authentication Routes   │   Protected API Endpoints         │
│  - /api/auth/verify      │   - /api/user/profile             │
│  - /api/auth/session     │   - /api/subscription/*           │
│                          │   - /api/content/premium          │
├─────────────────────────────────────────────────────────────┤
│                      Webhook Handlers                        │
│  - Clerk Webhooks: user.created, user.updated, user.deleted │
│  - Stripe Webhooks: subscription.*, invoice.*               │
│  - Asaas Webhooks: payment.*, subscription.*                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL/MySQL)                │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  - users (clerk_id, email, profile_data)                    │
│  - subscriptions (user_id, status, plan, provider)          │
│  - entitlements (user_id, feature_key, limit)               │
│  - invoices (user_id, provider_invoice_id, status)          │
│  - feature_flags (key, plan, limit, description)            │
│  - audit_log (user_id, action, timestamp, metadata)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT PROVIDERS                         │
│  - Stripe (Flex Plans - International)                      │
│  - Asaas (Presencial/Online Plans - Brazil)                 │
└─────────────────────────────────────────────────────────────┘
```

## Benefícios

### Para o Negócio
- ✅ Time-to-market reduzido (UI components prontos)
- ✅ Redução de custos de desenvolvimento e manutenção
- ✅ Conformidade LGPD facilitada
- ✅ Escalabilidade automática de infraestrutura de auth
- ✅ Métricas de engajamento e retenção de usuários

### Para os Usuários
- ✅ Login social (Google, Apple) sem fricção
- ✅ Segurança robusta com MFA
- ✅ Experiência moderna e familiar
- ✅ Gestão facilitada de perfil e assinaturas
- ✅ Recuperação de senha simplificada

### Para o Desenvolvimento
- ✅ SDKs oficiais para React e Node.js
- ✅ Componentes UI prontos e customizáveis
- ✅ Documentação completa e atualizada
- ✅ Dashboard de administração completo
- ✅ Webhooks confiáveis para sincronização

## Fases de Implementação

### Fase 0 - Preparação (1 semana)
- Setup de contas Clerk (dev/staging/prod)
- Definição de papéis e permissões
- Configuração de domínios e variáveis de ambiente
- Documentação de arquitetura

### Fase 1 - Autenticação Básica (1-2 semanas)
- Integração Clerk SDK no frontend
- Componentes SignIn/SignUp
- Fluxos de e-mail/senha e Magic Link
- Proteção de rotas básica

### Fase 2 - Área do Assinante (1-2 semanas)
- Dashboard do assinante
- Gestão de perfil
- Feature flags e gating de conteúdo
- Verificação server-side de entitlements

### Fase 3 - Assinaturas e Webhooks (2-3 semanas)
- Sincronização com Stripe/Asaas
- Webhooks de pagamentos
- Gestão de lifecycle de assinatura
- Reconciliador de dados

### Fase 4 - Segurança Avançada (1-2 semanas)
- MFA/TOTP
- Políticas de senha
- Auditoria e logs
- Exportação/exclusão LGPD

### Fase 5 - Observabilidade e Launch (1-2 semanas)
- Logging estruturado
- Métricas e dashboards
- Testes de carga
- Runbooks de suporte

## Estado Atual

### Implementado ✅
- Estrutura de planos (Básico, Padrão, Premium)
- Páginas de pricing e checkout
- Integração parcial com Stripe Pricing Table
- Webhook infrastructure (sem business logic)
- Healthcare session manager (não utilizado)
- Compliance LGPD básico

### Não Implementado ❌
- Sistema de autenticação (nenhum)
- User database schema
- Protected routes
- User dashboard
- Subscription management
- Webhook business logic
- User profile management
- Role-based access control

## Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Vendor lock-in | Alto | Abstrair camada de auth com ports/adapters |
| Custos crescentes com escala | Médio | Monitorar MAU, otimizar features, tier adequado |
| Incidentes no Clerk | Alto | Graceful degradation, fallbacks, plano de continuidade |
| Falhas de sincronização | Médio | Idempotência, DLQ, reconciliador periódico |
| Complexidade LGPD | Alto | DPA com Clerk, minimização de dados, registros de consentimento |
| Incompatibilidade mobile | Baixo | Testar SDKs React Native/Expo, deep links configurados |

## Estimativa de Custos

### Desenvolvimento (One-time)
- **Equipe**: 1.5 dev FTE × 8 semanas = 12 dev-semanas
- **Custo**: ~R$ 57.600 (assumindo R$ 120/h)

### Operacional (Mensal)
- **Clerk**: R$ 0 - R$ 6/MAU (dependendo do tier e features)
- **Infraestrutura**: R$ 500 - R$ 2.500/mês
- **Pagamentos**: 3-5% por transação (Stripe/Asaas)

### Pequena Escala (100-500 usuários)
- **Total estimado**: R$ 1.000 - R$ 4.000/mês

## Documentos Relacionados

- [spec.md](./spec.md) - Especificação técnica detalhada
- [plan.md](./plan.md) - Plano de implementação faseado
- [tasks.md](./tasks.md) - Lista de tarefas específicas
- [architecture-decision-record.md](./architecture-decision-record.md) - ADR da escolha do Clerk

## Critérios de Sucesso

### Funcionais
- [ ] Usuários conseguem criar conta e fazer login
- [ ] OAuth (Google) funcionando
- [ ] MFA opcional disponível
- [ ] Dashboard do assinante acessível
- [ ] Sincronização Stripe/Asaas 100% funcional
- [ ] Gating de conteúdo premium funcionando
- [ ] Exportação e exclusão LGPD implementadas

### Não-Funcionais
- [ ] Login em < 2 segundos
- [ ] 99.9% uptime (dependente do Clerk SLA)
- [ ] Zero vazamento de dados pessoais
- [ ] Testes E2E cobrindo fluxos críticos
- [ ] Documentação completa para suporte
- [ ] Logs estruturados e métricas configuradas

## Próximos Passos

1. **Aprovação**: Revisão e aprovação deste plano
2. **Setup Inicial**: Criar conta Clerk e configurar ambientes
3. **Schema Design**: Definir database schema para users/subscriptions
4. **Prototipação**: POC básico de login com Clerk
5. **Fase 1 Start**: Iniciar implementação da autenticação básica

---

**Responsável**: Claude Agent
**Aprovador**: Dr. Philipe Saraiva Cruz
**Última Revisão**: 2025-10-25
