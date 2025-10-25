# Checklist de Migração para Sanity.io

Este documento serve como guia passo-a-passo para a migração do blog da Saraiva Vision para Sanity.io.

---

## 📋 Fase 0: Planejamento e Preparação

### Aprovações e Setup Inicial

- [ ] **Revisar documentação completa**
  - [ ] Ler [Plano de Migração](/docs/SANITY_MIGRATION_PLAN.md)
  - [ ] Ler [Guia Rápido](/docs/SANITY_MIGRATION_QUICKSTART.md)
  - [ ] Ler [Comparação Técnica](/docs/SANITY_TECHNICAL_COMPARISON.md)

- [ ] **Obter aprovações**
  - [ ] Aprovação técnica (CTO/Lead Dev)
  - [ ] Aprovação de budget ($0 Free tier ou $99/mês Growth)
  - [ ] Aprovação de timeline (6-8 semanas)
  - [ ] Aprovação de stakeholders (Marketing/Conteúdo)

- [ ] **Definir equipe**
  - [ ] Líder técnico do projeto: _______________
  - [ ] Desenvolvedor(es): _______________
  - [ ] Responsável conteúdo: _______________
  - [ ] QA/Tester: _______________

- [ ] **Criar conta Sanity**
  - [ ] Acessar [sanity.io](https://www.sanity.io)
  - [ ] Criar conta (usar email corporativo)
  - [ ] Escolher plano (Free para início)
  - [ ] Documentar credenciais em gerenciador de senhas

- [ ] **Setup de comunicação**
  - [ ] Criar canal Slack/Discord para projeto
  - [ ] Agendar kickoff meeting
  - [ ] Definir cadência de sync (semanal recomendado)

**Entregável:** Documento de kickoff com equipe, timeline e aprovações  
**Prazo:** 1 semana

---

## 📋 Fase 1: Setup do Sanity Studio

### 1.1 Criar Projeto Sanity

- [ ] **Criar novo projeto**
  ```bash
  npm create sanity@latest
  ```
  - [ ] Project name: `saraiva-vision-blog`
  - [ ] Use default dataset: `production`
  - [ ] Output path: `./sanity-studio`
  - [ ] Project template: `clean`

- [ ] **Configurar variáveis de ambiente**
  - [ ] Criar `.env` no root do projeto
  - [ ] Adicionar:
    ```bash
    VITE_SANITY_PROJECT_ID=abc123def
    VITE_SANITY_DATASET=production
    SANITY_WRITE_TOKEN=sk...
    SANITY_WEBHOOK_SECRET=webhook_secret_here
    ```
  - [ ] Adicionar `.env` ao `.gitignore`
  - [ ] Documentar vars em 1Password/LastPass

### 1.2 Desenvolver Schemas

- [ ] **Schema: Author**
  - [ ] Criar `sanity-studio/schemas/author.js`
  - [ ] Campos: name, crm, bio, image
  - [ ] Testar criação no Studio

- [ ] **Schema: Category**
  - [ ] Criar `sanity-studio/schemas/category.js`
  - [ ] Campos: title, slug, description
  - [ ] Popular categorias existentes:
    - [ ] Dúvidas Frequentes
    - [ ] Tratamento
    - [ ] (catalogar outras do blogPosts.js)

- [ ] **Schema: Blog Post**
  - [ ] Criar `sanity-studio/schemas/blogPost.js`
  - [ ] Campos principais (title, slug, excerpt, content)
  - [ ] Campos de metadados (category, tags, author, date)
  - [ ] Campos SEO (metaTitle, metaDescription, keywords)
  - [ ] Campos compliance (cfmCompliant, reviewDate, etc)
  - [ ] Testar criação de post de teste

- [ ] **Custom Blocks**
  - [ ] Block: Callout (info, warning, success, error)
  - [ ] Block: Table (custom table component)
  - [ ] Block: Quick Facts
  - [ ] Testar renderização no Studio

### 1.3 Configurar Studio

- [ ] **Customizar Studio**
  - [ ] Logo da clínica
  - [ ] Cores do tema (brand colors)
  - [ ] Configurar preview personalizado

- [ ] **Permissões e Roles**
  - [ ] Role: Editor (create, read, update)
  - [ ] Role: Reviewer (read only)
  - [ ] Role: Admin (full access)

- [ ] **Deploy Studio**
  - [ ] Opção A: Sanity hosted (`studio.sanity.io/saraiva-vision`)
  - [ ] Opção B: Self-hosted (`studio.saraivavision.com.br`)
  - [ ] Testar acesso externo

**Entregável:** Sanity Studio funcional com schemas completos  
**Prazo:** 1 semana

---

## 📋 Fase 2: Migração de Dados

### 2.1 Preparar Script de Migração

- [ ] **Instalar dependências**
  ```bash
  npm install @sanity/client @sanity/block-tools html-react-parser
  ```

- [ ] **Criar script base**
  - [ ] `scripts/migrate-to-sanity.js`
  - [ ] Função: `uploadImage(imagePath)`
  - [ ] Função: `htmlToPortableText(html)`
  - [ ] Função: `getOrCreateAuthor(authorName)`
  - [ ] Função: `getOrCreateCategory(categoryName)`
  - [ ] Função: `migratePost(post)`

### 2.2 Testar Migração (Staging)

- [ ] **Criar dataset staging**
  - [ ] Dataset: `staging`
  - [ ] Configurar em `.env.staging`

- [ ] **Migrar 5 posts de teste**
  - [ ] Post 1 (mais recente): _______________
  - [ ] Post 2 (HTML complexo): _______________
  - [ ] Post 3 (muitas imagens): _______________
  - [ ] Post 4 (tabelas): _______________
  - [ ] Post 5 (callouts): _______________

- [ ] **Validar migração**
  - [ ] Conteúdo preservado (sem perda de dados)
  - [ ] Imagens carregadas corretamente
  - [ ] Formatação mantida (listas, headings, etc)
  - [ ] Tabelas convertidas
  - [ ] Links externos funcionando
  - [ ] SEO metadata preservado

### 2.3 Migração Completa (Production)

- [ ] **Migrar todos os 32 posts**
  ```bash
  npm run migrate:sanity
  ```

- [ ] **Validação automática**
  - [ ] Script: todos 32 posts migrados
  - [ ] Nenhum erro de upload
  - [ ] Todas imagens no CDN

- [ ] **Revisão manual**
  - [ ] Revisar 10 posts aleatórios
  - [ ] Verificar formatação
  - [ ] Testar preview no Studio

- [ ] **Correções**
  - [ ] Listar posts com problemas
  - [ ] Corrigir manualmente ou refinar script
  - [ ] Re-migrar posts problemáticos

**Entregável:** 32 posts migrados e validados no Sanity  
**Prazo:** 1-2 semanas

---

## 📋 Fase 3: Integração Frontend

### 3.1 Setup Cliente Sanity

- [ ] **Instalar dependências**
  ```bash
  npm install @sanity/client @sanity/image-url
  npm install --save-dev @sanity/types
  ```

- [ ] **Criar cliente Sanity**
  - [ ] `src/lib/sanity.js`
  - [ ] Configurar projectId, dataset, apiVersion
  - [ ] Helper: `urlFor(image)` para imagens

### 3.2 Desenvolver Queries GROQ

- [ ] **Criar arquivo de queries**
  - [ ] `src/lib/sanityQueries.js`
  - [ ] Query: `allPostsQuery`
  - [ ] Query: `postBySlugQuery`
  - [ ] Query: `featuredPostsQuery`
  - [ ] Query: `postsByCategoryQuery`
  - [ ] Testar queries no Sanity Vision

### 3.3 Fetch Build-Time

- [ ] **Script de fetch**
  - [ ] `scripts/fetch-blog-posts.js`
  - [ ] Fetch todos os posts do Sanity
  - [ ] Salvar em `src/data/sanity-blog-posts.json`
  - [ ] Tratar erros (fallback para dados antigos)

- [ ] **Atualizar package.json**
  ```json
  {
    "scripts": {
      "fetch:blog": "node scripts/fetch-blog-posts.js",
      "prebuild": "npm run fetch:blog",
      "build:vite": "npm run fetch:blog && vite build"
    }
  }
  ```

### 3.4 Atualizar Componentes

- [ ] **Atualizar loader**
  - [ ] `src/data/blogPostsLoader.js`
  - [ ] Ler de `sanity-blog-posts.json` em vez de `blogPosts.js`
  - [ ] Manter interface compatível

- [ ] **Converter Portable Text para HTML**
  - [ ] Instalar `@portabletext/react`
  - [ ] Criar componente `PortableTextRenderer`
  - [ ] Mapear custom blocks (callout, table)

- [ ] **Atualizar BlogPostLayout**
  - [ ] Usar `PortableTextRenderer` para content
  - [ ] Adaptar estrutura de dados Sanity
  - [ ] Testar renderização

- [ ] **Atualizar imagens**
  - [ ] Usar `urlFor()` helper
  - [ ] Lazy loading mantido
  - [ ] Alt texts preservados

### 3.5 Testes de Integração

- [ ] **Testes unitários**
  - [ ] `getAllPosts()` retorna posts
  - [ ] `getPostBySlug()` encontra post
  - [ ] `getFeaturedPosts()` filtra corretamente

- [ ] **Testes de componentes**
  - [ ] BlogPostLayout renderiza
  - [ ] PortableTextRenderer converte corretamente
  - [ ] Imagens carregam
  - [ ] Links funcionam

**Entregável:** Frontend integrado com Sanity (build-time)  
**Prazo:** 1-2 semanas

---

## 📋 Fase 4: Webhook e Automação

### 4.1 Configurar Webhook Sanity

- [ ] **Criar webhook no Sanity**
  - [ ] Acessar Sanity Manage → Webhooks
  - [ ] Nome: "Production Build Trigger"
  - [ ] URL: `https://api.saraivavision.com.br/webhooks/sanity`
  - [ ] Trigger: `create`, `update`, `delete` em `blogPost`
  - [ ] Secret: gerar e salvar em `.env`

### 4.2 Endpoint Webhook na API

- [ ] **Criar handler**
  - [ ] `api/src/webhooks/sanity.js`
  - [ ] Validar assinatura do webhook
  - [ ] Trigger rebuild (exec npm run build)
  - [ ] Logging completo

- [ ] **Adicionar rota**
  - [ ] `api/src/routes/webhooks.js`
  - [ ] POST `/webhooks/sanity`
  - [ ] Middleware de validação

- [ ] **Rate limiting**
  - [ ] Máximo 10 webhooks/minuto
  - [ ] Prevenir rebuild loops

### 4.3 GitHub Actions (Alternativo)

- [ ] **Criar workflow**
  - [ ] `.github/workflows/sanity-rebuild.yml`
  - [ ] Trigger: `repository_dispatch`
  - [ ] Actions: checkout, install, build, deploy

- [ ] **Configurar secrets**
  - [ ] `SANITY_PROJECT_ID`
  - [ ] `SANITY_WEBHOOK_SECRET`
  - [ ] SSH key para deploy (se aplicável)

### 4.4 Testes de Webhook

- [ ] **Testar fluxo completo**
  - [ ] Editar post no Sanity Studio
  - [ ] Publicar
  - [ ] Verificar webhook recebido
  - [ ] Verificar build iniciado
  - [ ] Verificar deploy completado
  - [ ] Verificar mudança em production

- [ ] **Monitoramento**
  - [ ] Logs de webhook
  - [ ] Alertas de falha
  - [ ] Dashboard de builds

**Entregável:** Auto-rebuild on publish funcionando  
**Prazo:** 1 semana

---

## 📋 Fase 5: Testes e QA

### 5.1 Testes Funcionais

- [ ] **Navegação do blog**
  - [ ] Listagem de posts funciona
  - [ ] Filtro por categoria funciona
  - [ ] Busca funciona (se implementada)
  - [ ] Paginação funciona

- [ ] **Post individual**
  - [ ] URL preservada (`/blog/:slug`)
  - [ ] Conteúdo renderiza corretamente
  - [ ] Imagens carregam
  - [ ] Links internos/externos funcionam
  - [ ] Callouts renderizam
  - [ ] Tabelas renderizam
  - [ ] Share buttons funcionam

### 5.2 Testes de SEO

- [ ] **Meta tags**
  - [ ] Title tags corretos
  - [ ] Meta descriptions presentes
  - [ ] Open Graph tags
  - [ ] Twitter Cards
  - [ ] Canonical URLs

- [ ] **Schema.org**
  - [ ] ArticleSchema presente
  - [ ] AuthorSchema presente
  - [ ] OrganizationSchema presente
  - [ ] Validar em [Schema Validator](https://validator.schema.org/)

- [ ] **Performance SEO**
  - [ ] Lighthouse SEO score ≥ 95
  - [ ] Core Web Vitals passing
  - [ ] Sitemap atualizado
  - [ ] Robots.txt correto

### 5.3 Testes de Performance

- [ ] **Lighthouse Audit**
  - [ ] Performance ≥ 90
  - [ ] Accessibility ≥ 95
  - [ ] Best Practices ≥ 95
  - [ ] SEO ≥ 95

- [ ] **WebPageTest**
  - [ ] TTFB < 600ms
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

- [ ] **Bundle Size**
  - [ ] Comparar antes/depois
  - [ ] Nenhum aumento significativo (>10%)

### 5.4 Testes de Acessibilidade

- [ ] **WCAG 2.1 AA**
  - [ ] Contraste suficiente
  - [ ] Alt text em todas as imagens
  - [ ] Navegação por teclado
  - [ ] Screen reader friendly
  - [ ] ARIA labels corretos

- [ ] **Ferramentas**
  - [ ] axe DevTools (0 violations)
  - [ ] WAVE (sem erros)
  - [ ] Lighthouse a11y ≥ 95

### 5.5 Testes de Compliance

- [ ] **CFM Compliance**
  - [ ] Disclaimers médicos presentes
  - [ ] CRM do autor visível
  - [ ] Data de revisão médica
  - [ ] Sem promessas terapêuticas irregulares

- [ ] **LGPD**
  - [ ] Nenhum dado pessoal exposto
  - [ ] Consentimento para uso de imagens
  - [ ] Política de privacidade linkada

### 5.6 Testes de Regressão

- [ ] **URLs antigas**
  - [ ] Todos os 32 slugs antigos funcionam
  - [ ] Nenhum 404 inesperado
  - [ ] Redirects (se aplicável) funcionam

- [ ] **Funcionalidades existentes**
  - [ ] Podcast integration mantida
  - [ ] Related posts funcionam
  - [ ] CTAs presentes
  - [ ] Forms funcionam

**Entregável:** Suite de testes 100% passing  
**Prazo:** 1 semana

---

## 📋 Fase 6: Deploy e Go-Live

### 6.1 Deploy Staging

- [ ] **Preparar ambiente staging**
  - [ ] Dataset: `staging`
  - [ ] URL: `staging.saraivavision.com.br/blog`

- [ ] **Deploy**
  ```bash
  npm run build:vite
  # Deploy to staging
  ```

- [ ] **Smoke tests**
  - [ ] Site carrega
  - [ ] Blog funciona
  - [ ] Posts renderizam

### 6.2 UAT (User Acceptance Testing)

- [ ] **Testar com stakeholders**
  - [ ] Equipe de conteúdo testa Studio
  - [ ] Criar post draft
  - [ ] Editar post existente
  - [ ] Publicar post
  - [ ] Validar preview

- [ ] **Coletar feedback**
  - [ ] Lista de ajustes necessários
  - [ ] Priorizar (must-have vs. nice-to-have)
  - [ ] Implementar ajustes

### 6.3 Preparação para Production

- [ ] **Backup completo**
  - [ ] Export de todos posts do Sanity
  - [ ] Backup de `blogPosts.js` (arquivo antigo)
  - [ ] Backup de imagens
  - [ ] Backup de database (se aplicável)

- [ ] **Plano de rollback**
  - [ ] Documentar passos de rollback
  - [ ] Testar rollback em staging
  - [ ] Feature flag pronta (Sanity on/off)

- [ ] **Comunicação**
  - [ ] Avisar equipe interna
  - [ ] Preparar comunicado (se necessário)
  - [ ] Definir janela de deploy

### 6.4 Deploy Production

- [ ] **Deploy**
  - [ ] Escolher horário baixo tráfego (madrugada)
  - [ ] Executar deploy
    ```bash
    npm run build:vite
    sudo bash DEPLOY_NOW.sh
    ```
  - [ ] Monitorar logs em real-time

- [ ] **Validação imediata**
  - [ ] Site está UP
  - [ ] Blog carrega
  - [ ] 5 posts aleatórios funcionam
  - [ ] Nenhum erro 500

### 6.5 Monitoramento Pós-Deploy

- [ ] **Primeiras 24h**
  - [ ] Monitorar analytics (traffic drop?)
  - [ ] Monitorar Sentry (erros JS?)
  - [ ] Monitorar servidor (CPU/RAM)
  - [ ] Verificar Search Console (indexação OK?)

- [ ] **Primeira semana**
  - [ ] Verificar rankings SEO mantidos
  - [ ] Verificar Core Web Vitals
  - [ ] Coletar feedback de usuários

- [ ] **Primeiro mês**
  - [ ] Análise de performance completa
  - [ ] Comparar métricas antes/depois
  - [ ] Documentar lições aprendidas

**Entregável:** Blog em production com Sanity.io  
**Prazo:** 1 semana

---

## 📋 Fase 7: Treinamento e Documentação

### 7.1 Documentação Técnica

- [ ] **Para Desenvolvedores**
  - [ ] README atualizado
  - [ ] Guia de queries GROQ
  - [ ] Guia de custom blocks
  - [ ] Troubleshooting guide
  - [ ] Runbook operacional

- [ ] **Architecture Decision Records (ADRs)**
  - [ ] Por que Sanity vs. alternativas
  - [ ] Build-time vs. runtime fetching
  - [ ] Portable Text conversion strategy

### 7.2 Documentação para Usuários

- [ ] **Manual do Editor**
  - [ ] Como criar um post
  - [ ] Como adicionar imagens
  - [ ] Como usar callouts
  - [ ] Como criar tabelas
  - [ ] Como agendar publicação

- [ ] **Guia de SEO**
  - [ ] Boas práticas de títulos
  - [ ] Meta descriptions efetivas
  - [ ] Uso de keywords
  - [ ] Alt text para imagens

- [ ] **Checklist de Compliance**
  - [ ] Verificação CFM obrigatória
  - [ ] Disclaimers necessários
  - [ ] Campos obrigatórios

### 7.3 Sessões de Treinamento

- [ ] **Sessão 1: Introdução (2h)**
  - [ ] Overview do Sanity
  - [ ] Tour pelo Studio
  - [ ] Criar primeiro post (hands-on)
  - [ ] Q&A

- [ ] **Sessão 2: Features Avançadas (2h)**
  - [ ] Blocos customizados
  - [ ] Gestão de assets
  - [ ] Preview e draft
  - [ ] Agendamento
  - [ ] Q&A

- [ ] **Sessão 3: SEO e Compliance (1h)**
  - [ ] Otimização SEO
  - [ ] Compliance CFM/LGPD
  - [ ] Boas práticas
  - [ ] Q&A

- [ ] **Sessão 4: Troubleshooting (1h)**
  - [ ] Problemas comuns
  - [ ] Como pedir ajuda
  - [ ] Escalation path
  - [ ] Q&A

**Entregável:** Equipe treinada e documentação completa  
**Prazo:** 1 semana

---

## ✅ Finalização

### Retrospectiva

- [ ] **Meeting de retrospectiva**
  - [ ] O que funcionou bem?
  - [ ] O que pode melhorar?
  - [ ] Ações para próximos projetos

- [ ] **Documentar métricas**
  - [ ] Tempo total gasto
  - [ ] Custo real vs. estimado
  - [ ] KPIs de sucesso atingidos?

### Handoff

- [ ] **Transferir ownership**
  - [ ] Equipe de conteúdo assume Studio
  - [ ] Dev team mantém código/schemas
  - [ ] Definir SLA para suporte

- [ ] **Celebration! 🎉**
  - [ ] Comunicar sucesso para empresa
  - [ ] Reconhecer contribuições da equipe
  - [ ] Pizza/happy hour (bem merecido!)

---

## 📊 Progress Tracking

| Fase | Status | Início | Fim | Responsável |
|------|--------|--------|-----|-------------|
| 0. Planejamento | ⬜ Not Started | - | - | - |
| 1. Setup Sanity | ⬜ Not Started | - | - | - |
| 2. Migração Dados | ⬜ Not Started | - | - | - |
| 3. Integração Frontend | ⬜ Not Started | - | - | - |
| 4. Webhook/CI | ⬜ Not Started | - | - | - |
| 5. Testes/QA | ⬜ Not Started | - | - | - |
| 6. Deploy | ⬜ Not Started | - | - | - |
| 7. Treinamento | ⬜ Not Started | - | - | - |

**Legenda:**
- ⬜ Not Started
- 🟨 In Progress
- ✅ Completed
- ⛔ Blocked

---

**Última atualização:** 24/10/2025  
**Versão:** 1.0  
**Projeto:** Migração Blog Sanity.io - Saraiva Vision
