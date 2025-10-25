# Guia Rápido: Migração Sanity.io

## 🎯 Resumo Executivo

**Objetivo:** Migrar blog de arquivos estáticos JS para Sanity.io CMS headless

**Status Atual:**
- 32 posts em `src/data/blogPosts.js`
- HTML rico, 934 linhas de código
- 100% estático, sem CMS

**Após Migração:**
- Interface visual para gestão de conteúdo
- Publicação sem deploy de código
- Versionamento e workflow editorial
- Compliance CFM/LGPD preservado

## ⚡ Quick Start

### 1. Setup Sanity (15 min)

```bash
# Criar projeto
npm create sanity@latest

# Project name: saraiva-vision-blog
# Dataset: production
# Output path: ./sanity-studio
```

### 2. Schemas Básicos (30 min)

```javascript
// sanity-studio/schemas/blogPost.js
export default {
  name: 'blogPost',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug', options: { source: 'title' } },
    { name: 'excerpt', type: 'text' },
    { name: 'content', type: 'array', of: [{ type: 'block' }] },
    { name: 'featuredImage', type: 'image' },
    { name: 'publishedAt', type: 'datetime' }
  ]
}
```

### 3. Script de Migração (1-2h)

```bash
# Instalar deps
npm install @sanity/client @sanity/block-tools html-react-parser

# Criar script
node scripts/migrate-to-sanity.js
```

### 4. Integrar Frontend (2-3h)

```javascript
// src/lib/sanity.js
import { createClient } from '@sanity/client'

export const client = createClient({
  projectId: 'YOUR_PROJECT_ID',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true
})

// Fetch em build-time
npm run fetch:blog && npm run build:vite
```

## 📊 Comparação: Antes vs. Depois

| Aspecto | Antes (JS Estático) | Depois (Sanity.io) |
|---------|---------------------|-------------------|
| **Publicar post** | Edit JS → Commit → Deploy (30-60 min) | Interface visual → Publish (2 min) |
| **Editar conteúdo** | Código HTML direto | Editor visual WYSIWYG |
| **Dependência dev** | Alta (toda mudança) | Baixa (apenas estrutura) |
| **Versionamento** | Git commits | Built-in + Git |
| **Preview** | Build local | Real-time preview |
| **Imagens** | Manual upload + path | Drag & drop + CDN |
| **Performance** | Excelente (estático) | Excelente (cached) |
| **SEO** | Manual em cada post | Interface dedicada |
| **Custo** | $0 | $0-99/mês |

## 🏗️ Arquitetura Recomendada

```
┌──────────────┐
│ Sanity CMS   │ ← Equipe edita conteúdo
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Webhook      │ ← Trigger on publish
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ GitHub Action│ ← Auto build
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Vite Build   │ ← Fetch + build static
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Production   │ ← Deploy to VPS
└──────────────┘
```

## 🎓 Benefícios Chave

### Para Marketing/Conteúdo
✅ Autonomia total para publicar  
✅ Preview antes de ir ao ar  
✅ Rascunhos salvos automaticamente  
✅ Agendamento de posts  
✅ Biblioteca de imagens organizada  

### Para Desenvolvimento
✅ Menos time em tarefas de conteúdo  
✅ Schema versionado e tipado  
✅ API GraphQL/REST pronta  
✅ Webhooks para automação  
✅ Backup e recovery built-in  

### Para Negócio
✅ Velocidade: 30x mais rápido para publicar  
✅ Qualidade: Preview reduz erros  
✅ Escala: Suporta crescimento de conteúdo  
✅ Compliance: Campos obrigatórios CFM/LGPD  

## 💰 Custos

| Tier | Preço | Recomendado Para |
|------|-------|------------------|
| **Free** | $0/mês | Início, até 100K API calls/mês |
| **Growth** | $99/mês | Produção, múltiplos editores |
| **Enterprise** | Custom | Alta escala, SLA garantido |

**Recomendação:** Começar com Free, avaliar após 3 meses.

## 📅 Timeline Estimado

| Fase | Duração | Entregas |
|------|---------|----------|
| Setup | 1 semana | Projeto criado, schemas definidos |
| Migração Dados | 1-2 semanas | 32 posts migrados e validados |
| Integração Frontend | 1-2 semanas | Fetch em build-time funcionando |
| Webhook/CI | 1 semana | Auto-build em publish |
| Testes/QA | 1 semana | Validação completa |
| Deploy | 1 semana | Production com monitoramento |

**Total: 6-8 semanas**

## 🚦 Decisão: Go/No-Go

### ✅ Prosseguir SE:

- [ ] Equipe de conteúdo precisa de autonomia
- [ ] Volume de posts vai crescer (>10 novos/mês)
- [ ] Workflow editorial é necessário (draft/review)
- [ ] Budget de $0-99/mês está OK
- [ ] 6-8 semanas de implementação é aceitável

### ❌ Não Prosseguir SE:

- [ ] Posts raramente atualizam (<1/mês)
- [ ] Equipe técnica está confortável com JS
- [ ] Zero budget para ferramentas
- [ ] Não há tempo para migração (urgências)
- [ ] Dependência externa é inaceitável

## 🔗 Recursos Úteis

**Documentação:**
- [Plano Completo](/docs/SANITY_MIGRATION_PLAN.md)
- [Sanity Docs](https://www.sanity.io/docs)
- [GROQ Cheat Sheet](https://www.sanity.io/docs/query-cheat-sheet)

**Ferramentas:**
- [Sanity Studio Demo](https://www.sanity.io/studio)
- [Portable Text Playground](https://portabletext.org/)

**Suporte:**
- [Sanity Community Slack](https://slack.sanity.io/)
- [Sanity GitHub Discussions](https://github.com/sanity-io/sanity/discussions)

## ✅ Checklist de Aprovação

- [ ] Stakeholders revisaram o plano
- [ ] Budget aprovado (Free tier ou Growth)
- [ ] Timeline aceito (6-8 semanas)
- [ ] Equipe definida (dev + conteúdo)
- [ ] Conta Sanity criada (trial)
- [ ] Kickoff meeting agendado

## 📞 Próximo Passo

**Decisão necessária:** Aprovar ou não prosseguir com migração

**Se aprovado:**
1. Criar projeto Sanity (trial gratuito)
2. Workshop inicial com equipe (2h)
3. Iniciar Fase 1: Setup & Schema

**Se não aprovado:**
- Documentar razões
- Alternativas consideradas
- Revisão futura agendada (quando?)

---

**Documento preparado:** 24/10/2025  
**Versão:** 1.0  
**Para dúvidas:** Ver plano completo em `/docs/SANITY_MIGRATION_PLAN.md`
