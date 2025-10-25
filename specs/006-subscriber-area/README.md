# Spec 006 - Portal do Assinante

**Status**: ⏳ Planning Phase
**Priority**: High
**Start Date**: TBD
**Target Launch**: TBD (14 weeks after kickoff)
**Version**: 1.0.0

---

## 📋 Overview

Portal de autoatendimento completo para assinantes de planos de lentes de contato da Saraiva Vision. O sistema permitirá gerenciamento de assinaturas, rastreamento de entregas, upload de prescrições, agendamento de consultas e suporte integrado.

## 🎯 Objetivos

- **Reduzir carga operacional**: 70% das solicitações resolvidas via portal
- **Aumentar retenção**: +15% através de melhor experiência
- **Melhorar NPS**: ≥8.0 para assinantes do portal
- **Compliance**: 100% conformidade LGPD/CFM

## 📚 Documentação

### Core Documents
- **[spec.md](./spec.md)** - Especificação completa de requisitos funcionais
- **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)** - Arquitetura técnica detalhada
- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Status de implementação

### Quick Links
- [Requisitos Funcionais](#requisitos-funcionais)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Success Metrics](#success-metrics)

---

## 🚀 Principais Features

### ✅ Fase 1: MVP (4 semanas)
- Autenticação (email/senha, magic link, OAuth)
- Dashboard com visão geral
- Detalhes da assinatura
- Histórico de pagamentos
- Download de faturas

### ⏳ Fase 2: Self-Service (3 semanas)
- Upgrade/downgrade de plano
- Pausar/cancelar assinatura
- Rastreamento de entregas
- Atualização de endereço

### ⏳ Fase 3: Prescrições e Consultas (3 semanas)
- Upload de prescrições
- Aprovação médica de prescrições
- Agendamento de consultas
- Lembretes automáticos

### ⏳ Fase 4: Suporte (2 semanas)
- Central de ajuda (FAQs)
- Sistema de tickets
- Chat via WhatsApp
- Gerenciamento LGPD

### ⏳ Fase 5: PWA (2 semanas)
- Progressive Web App
- Offline support
- Push notifications
- Performance optimization

---

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build)
- React Router v6
- Zustand + React Query
- Tailwind CSS + shadcn/ui
- Supabase Auth Client

### Backend
- Node.js 20 (Express)
- Supabase (PostgreSQL)
- Redis (cache)
- Stripe API
- Resend (email)
- Supabase Storage

### Infrastructure
- VPS 31.97.129.78 (existing)
- Nginx (reverse proxy)
- systemd (process manager)
- Sentry + PostHog (monitoring)

---

## 📊 Requisitos Funcionais

### RF-001: Autenticação
- Login com email/senha
- Magic link (passwordless)
- OAuth (Google, Facebook)
- Two-Factor Authentication (2FA)
- Recuperação de senha

### RF-002: Dashboard
- Status da assinatura
- Próxima entrega
- Consultas agendadas
- Notificações importantes
- Ações rápidas

### RF-003: Gerenciamento de Assinatura
- Visualizar detalhes do plano
- Histórico de pagamentos
- Fazer upgrade/downgrade
- Pausar/retomar (Flex apenas)
- Cancelar assinatura

### RF-004: Entregas
- Rastreamento em tempo real
- Histórico de entregas
- Atualizar endereço
- Reagendar entrega
- Confirmar recebimento

### RF-005: Prescrições
- Visualizar prescrição atual
- Upload de nova prescrição
- Histórico de prescrições
- Alertas de expiração
- Aprovação médica

### RF-006: Agendamento
- Agendar consulta (presencial/online)
- Reagendar até 24h antes
- Cancelar até 24h antes
- Histórico de consultas
- Confirmação via WhatsApp

### RF-007: Configurações
- Editar dados pessoais
- Atualizar email/telefone
- Preferências de comunicação
- Gerenciar consentimentos LGPD
- Exportar/excluir dados

### RF-008: Suporte
- FAQs contextuais
- Sistema de tickets
- Chat via WhatsApp
- Histórico de atendimento
- Avaliação NPS

---

## 📅 Roadmap

### Phase 1: MVP (4 weeks)
**Objetivo**: Portal funcional com features essenciais

**Deliverables**:
- ✅ Assinantes podem fazer login
- ✅ Dashboard mostra status da assinatura
- ✅ Histórico de pagamentos disponível
- ✅ Download de faturas em PDF

**Timeline**: Semanas 1-4

---

### Phase 2: Self-Service (3 weeks)
**Objetivo**: Gerenciamento completo da assinatura

**Deliverables**:
- ✅ Upgrade/downgrade sem contato humano
- ✅ Cancelamento self-service
- ✅ Rastreamento de entregas
- ✅ Atualização de endereço

**Timeline**: Semanas 5-7

---

### Phase 3: Prescriptions & Appointments (3 weeks)
**Objetivo**: Gestão médica integrada

**Deliverables**:
- ✅ Upload e aprovação de prescrições
- ✅ Agendamento de consultas
- ✅ Lembretes automáticos
- ✅ Histórico médico

**Timeline**: Semanas 8-10

---

### Phase 4: Support & Help (2 weeks)
**Objetivo**: Suporte completo integrado

**Deliverables**:
- ✅ Central de ajuda com FAQs
- ✅ Sistema de tickets
- ✅ Conformidade LGPD 100%
- ✅ NPS collection

**Timeline**: Semanas 11-12

---

### Phase 5: PWA & Optimizations (2 weeks)
**Objetivo**: Performance e experiência mobile

**Deliverables**:
- ✅ FCP <2s, LCP <3s
- ✅ PWA instalável
- ✅ Offline support
- ✅ Push notifications

**Timeline**: Semanas 13-14

---

## 📈 Success Metrics

### Business KPIs
| Metric | Target | How Measured |
|--------|--------|--------------|
| Support ticket reduction | 70% | Zendesk metrics |
| Retention rate increase | +15% | Cohort analysis |
| NPS score | ≥8.0 | In-app surveys |
| Self-service rate | 80% | Analytics tracking |
| Lifetime value increase | +20% | Stripe analytics |

### Technical KPIs
| Metric | Target | How Measured |
|--------|--------|--------------|
| Uptime | 99.5% | Monitoring tools |
| First Contentful Paint | <2s (p75) | Lighthouse |
| Largest Contentful Paint | <3s (p75) | Lighthouse |
| Cumulative Layout Shift | <0.1 | Lighthouse |
| API response time | <500ms (p95) | APM tools |
| Error rate | <0.5% | Sentry |

### Adoption KPIs
| Metric | Target | How Measured |
|--------|--------|--------------|
| Account creation (7 days) | 90% | Analytics |
| Monthly active users | 60% | Analytics |
| Dashboard usage | 100% | Page views |
| Deliveries tracking | 80% | Feature usage |
| Invoice downloads | 70% | Download events |

---

## 🔒 Security & Compliance

### Security Measures
- ✅ HTTPS/TLS 1.3 mandatory
- ✅ JWT authentication
- ✅ Row Level Security (RLS)
- ✅ Rate limiting (100 req/min)
- ✅ Input validation (Zod)
- ✅ Audit logging
- ✅ OWASP Top 10 mitigations

### LGPD Compliance
- ✅ Granular consent management
- ✅ Data minimization
- ✅ Anonymized logs
- ✅ Data export (15 days)
- ✅ Data deletion (30 days)
- ✅ Access audit logs
- ✅ DPO contact visible

### CFM Compliance
- ✅ Medical data retention (20 years)
- ✅ Prescription approval workflow
- ✅ Professional credentials validation
- ✅ Medical content accuracy

---

## 👥 Team Structure

| Role | Responsibilities |
|------|------------------|
| **Product Owner** | Requirements, priorities, approval |
| **Tech Lead** | Architecture, code review |
| **Frontend Dev** | React components, UI/UX |
| **Backend Dev** | API, webhooks, integrations |
| **QA Engineer** | Testing, quality assurance |
| **DevOps** | Deployment, monitoring |
| **Security Officer** | Security audit, pen testing |
| **DPO** | LGPD compliance |

---

## 🚧 Current Status

**Phase**: Planning
**Progress**: 0%
**Next Milestone**: Kickoff meeting
**Blockers**: None

### Recent Updates
- 2025-10-25: Initial specification created
- 2025-10-25: System design document completed
- 2025-10-25: Implementation plan defined

### Next Steps
1. Review and approve specification
2. Create GitHub project board
3. Setup Supabase environment
4. Begin Phase 1 implementation

---

## 📞 Contacts

| Role | Name | Contact |
|------|------|---------|
| Product Owner | Dr. Philipe Saraiva Cruz | philipe_cruz@outlook.com |
| DPO | - | dpo@saraivavision.com.br |
| Tech Lead | TBD | - |

---

## 📖 Additional Resources

### External Documentation
- [Stripe API Docs](https://stripe.com/docs/api)
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://github.com/pmndrs/zustand)

### Internal Documentation
- [CLAUDE.md](../../CLAUDE.md) - Development guide
- [Architecture Docs](../../docs/architecture/)
- [Testing Strategy](../../CLAUDE.md#testing-architecture)

### Legal & Compliance
- [LGPD](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [CFM Resolution 1643/2002](https://www.in.gov.br/materia/-/asset_publisher/Kujrw0TZC2Mb/content/id/775819)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: 2025-10-25
**Document Version**: 1.0.0
**Spec Status**: ⏳ Planning
