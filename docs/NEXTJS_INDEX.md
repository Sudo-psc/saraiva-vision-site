# Next.js Migration - Documentation Index

Índice central de toda documentação relacionada à migração para Next.js 15.

---

## 📚 Documentação Disponível

### 1. [Migration Guide](./NEXTJS_MIGRATION_GUIDE.md) ⭐
**Documento principal** com plano completo de migração.

**Conteúdo:**
- Visão geral e motivação
- Análise arquitetura atual
- Estratégia fase a fase
- Plano de implementação (9 semanas)
- Checklist completo
- Compliance CFM/LGPD
- Performance e SEO
- Deploy e infraestrutura
- Riscos e mitigação

**Público:** Todos stakeholders, leitura obrigatória

---

### 2. [Component Migration](./NEXTJS_COMPONENT_MIGRATION.md)
Guia técnico detalhado de migração de componentes React.

**Conteúdo:**
- Server Components vs Client Components
- Padrões de migração (9 cenários)
- React Router → Next.js
- react-helmet → Metadata API
- Framer Motion, Radix UI
- Data fetching (useEffect → async)
- Testes (Vitest → Jest)
- Checklist por componente

**Público:** Desenvolvedores React

---

### 3. [Conversion Scripts](./NEXTJS_CONVERSION_SCRIPTS.md)
Scripts automatizados para acelerar migração.

**Conteúdo:**
- 7 scripts Node.js prontos para usar
- Converter blog JS → Markdown
- Adicionar 'use client' automático
- React Router → Next.js
- JSX → TSX
- Helmet → Metadata API
- Análise de componentes
- Gerar estrutura App Router

**Público:** Desenvolvedores, DevOps

---

### 4. [FAQ](./NEXTJS_FAQ.md)
Perguntas frequentes e respostas práticas.

**Conteúdo:**
- 30+ perguntas respondidas
- Seções: Geral, Arquitetura, Componentes, Blog, Compliance, Performance, Testes, Custos, Migração
- Comparações lado a lado
- ROI e custos
- Recomendação final

**Público:** Todos (leitura rápida)

---

## 🗺 Roadmap de Leitura

### Para Gestores/Stakeholders
1. **Começar:** [FAQ - Perguntas Gerais](./NEXTJS_FAQ.md#perguntas-gerais)
2. **Depois:** [Migration Guide - Visão Geral](./NEXTJS_MIGRATION_GUIDE.md#visão-geral)
3. **Foco:** Motivação, Timeline, Custos, ROI
4. **Decisão:** Aprovar início da migração

**Tempo:** 30-45 minutos

---

### Para Desenvolvedores Frontend
1. **Começar:** [Component Migration - Princípios Fundamentais](./NEXTJS_COMPONENT_MIGRATION.md#princípios-fundamentais)
2. **Depois:** [Migration Guide - Fase 1 (Páginas Estáticas)](./NEXTJS_MIGRATION_GUIDE.md#fase-1-páginas-estáticas-ssg)
3. **Prática:** [Conversion Scripts - Análise](./NEXTJS_CONVERSION_SCRIPTS.md#6-análise-de-dependências)
4. **Referência:** [FAQ - Componentes](./NEXTJS_FAQ.md#componentes-e-código)

**Tempo:** 2-3 horas (estudo completo)

---

### Para DevOps/Infra
1. **Começar:** [FAQ - Arquitetura](./NEXTJS_FAQ.md#arquitetura-e-infraestrutura)
2. **Depois:** [Migration Guide - Deploy](./NEXTJS_MIGRATION_GUIDE.md#deployment-e-infraestrutura)
3. **Foco:** Vercel vs VPS, Nginx config, Rollback plan
4. **Ação:** Setup staging environment

**Tempo:** 1-2 horas

---

### Para QA/Compliance
1. **Começar:** [FAQ - Compliance](./NEXTJS_FAQ.md#compliance-e-segurança)
2. **Depois:** [Migration Guide - Compliance](./NEXTJS_MIGRATION_GUIDE.md#considerações-de-compliance)
3. **Foco:** CFM validation, LGPD, Security headers
4. **Ação:** Planejar testes de compliance

**Tempo:** 1 hora

---

## 📊 Comparação Rápida: Vite vs Next.js

| Aspecto | Vite (Atual) | Next.js (Futuro) |
|---------|-------------|------------------|
| **Rendering** | CSR (Client-Side) | SSR + SSG + ISR |
| **SEO** | ⚠️ Limitado (prerender) | ✅ Excelente (HTML nativo) |
| **TTI** | 3-4.5s | 1-2s (-50%) |
| **Bundle Size** | 250KB chunks | Auto-split por rota |
| **Image Opt** | Manual (sharp) | Automático (WebP/AVIF) |
| **Routing** | React Router | File-based |
| **API** | Express separado | API Routes integrado |
| **Metadata** | react-helmet | Metadata API nativa |
| **Deploy** | Nginx static | Vercel/VPS Node.js |
| **Compliance** | Client-side | Server-side + Edge |
| **Blog** | JS estático | Markdown + ISR |
| **Dev Experience** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 Timeline Resumido

```
Fase 0: Setup Inicial          [1 semana]
  └─ Criar projeto Next.js, configurar TypeScript, POC

Fase 1: Páginas Estáticas      [2 semanas]
  └─ /sobre, /lentes, /faq, /privacy

Fase 2: Blog + SEO             [1 semana]
  └─ Converter posts, ISR, Metadata API

Fase 3: Páginas Dinâmicas      [2 semanas]
  └─ /servicos/:id, /podcast/:slug

Fase 4: API Routes             [1 semana]
  └─ Google Reviews, Analytics, Health

Fase 5: Compliance + Testes    [1 semana]
  └─ CFM/LGPD, Jest, Coverage 80%

Fase 6: Deploy + Cutover       [1 semana]
  └─ Staging, produção, rollback plan

TOTAL: 9 semanas (2+ meses)
```

---

## ✅ Checklist de Migração (Resumo)

### Setup (Fase 0)
- [ ] Criar projeto Next.js 15
- [ ] Configurar TypeScript strict
- [ ] Setup Tailwind CSS
- [ ] Configurar path alias (@/)
- [ ] POC com 1 página

### Componentes
- [ ] Analisar 101 componentes
- [ ] Adicionar 'use client' (~60 componentes)
- [ ] Migrar Radix UI
- [ ] Atualizar Framer Motion
- [ ] Testes de todos componentes

### Páginas
- [ ] Migrar 21 páginas
- [ ] Converter React Router → Next.js
- [ ] Implementar Metadata API
- [ ] SSG para estáticas
- [ ] SSR/ISR para dinâmicas

### Blog
- [ ] Converter 99 posts → Markdown
- [ ] Implementar /blog (lista)
- [ ] Implementar /blog/[slug]
- [ ] ISR (revalidate: 24h)
- [ ] Schema.org MedicalArticle

### APIs
- [ ] Migrar Google Reviews API
- [ ] Migrar Analytics API
- [ ] Edge Runtime
- [ ] Rate limiting
- [ ] Testes API

### Compliance
- [ ] Middleware CFM/LGPD
- [ ] Security headers
- [ ] Cookie consent
- [ ] Audit logs
- [ ] Validação legal

### Deploy
- [ ] Setup Vercel/VPS
- [ ] Configurar domínio
- [ ] SSL certificates
- [ ] Environment variables
- [ ] Monitoring

---

## 📦 Scripts Disponíveis

```bash
# Análise inicial
npm run migrate:analyze

# Converter blog posts
npm run migrate:blog

# Converter React Router
npm run migrate:router

# Converter Helmet
npm run migrate:helmet

# Gerar estrutura Next.js
npm run migrate:structure

# Migração completa (automática)
npm run migrate:full
```

*(Adicionar ao package.json conforme [Conversion Scripts](./NEXTJS_CONVERSION_SCRIPTS.md))*

---

## 🔗 Links Úteis

### Documentação Oficial
- [Next.js 15 Docs](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### Ferramentas
- [next-codemod](https://nextjs.org/docs/app/building-your-application/upgrading/codemods)
- [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### Comunidade
- [Next.js Brasil Discord](https://discord.gg/nextjs-br)
- [GitHub Discussions](https://github.com/vercel/next.js/discussions)

---

## 📞 Suporte

### Dúvidas Técnicas
- **Documentação**: Consultar esta pasta `docs/`
- **Issues**: Criar issue no repositório
- **Discussão**: Discord Next.js Brasil

### Decisões Arquiteturais
- **Revisar:** [ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md)
- **Consultar:** Equipe de arquitetura

---

## 📅 Próximas Ações

### Dezembro 2024
- [ ] Apresentar documentação para stakeholders
- [ ] Aprovar orçamento e timeline
- [ ] Alocar equipe (2 devs full-time)

### Janeiro 2025
- [ ] Setup ambiente Next.js
- [ ] POC com página /sobre
- [ ] Treinamento equipe (1 semana)

### Fevereiro-Março 2025
- [ ] Migração completa (Fases 1-5)
- [ ] Testes em staging

### Abril 2025
- [ ] Deploy produção
- [ ] Monitoramento 24/7 (1 semana)
- [ ] Rollback se necessário

---

**Status**: 🚧 Em Planejamento
**Última Atualização**: Outubro 2025
**Próximo Review**: Dezembro 2024
**Responsável**: Equipe Saraiva Vision
