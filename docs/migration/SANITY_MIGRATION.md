# Migração do Blog para Sanity CMS

**Data**: 2025-10-25
**Autor**: Dr. Philipe Saraiva Cruz
**Status**: 🔄 Em Progresso

## 📋 Visão Geral

Este documento descreve o processo de migração do blog da Saraiva Vision de um sistema 100% estático (JavaScript objects) para o Sanity CMS, um headless CMS moderno e flexível.

## 🎯 Objetivos da Migração

### Problemas do Sistema Atual

1. **Manutenção Manual**: Editar posts requer conhecimento técnico e deploy
2. **Sem Preview**: Impossível visualizar mudanças antes de publicar
3. **Escalabilidade Limitada**: Difícil gerenciar muitos posts
4. **Sem Workflow**: Ausência de aprovação, rascunhos, agendamento
5. **Imagens Não Gerenciadas**: Upload manual e otimização manual

### Benefícios do Sanity CMS

1. ✅ **Interface Visual**: Editor WYSIWYG para conteúdo rico
2. ✅ **Workflow Completo**: Rascunhos, aprovação, agendamento
3. ✅ **Gerenciamento de Mídia**: Upload e otimização automática
4. ✅ **API Flexível**: GraphQL e GROQ para queries
5. ✅ **Real-time**: Atualizações instantâneas
6. ✅ **Versionamento**: Histórico completo de mudanças
7. ✅ **Colaboração**: Múltiplos editores simultâneos

## 🏗️ Arquitetura

### Antes (Sistema Estático)

```
src/data/blogPosts.js (JavaScript objects)
        ↓
   Vite Build
        ↓
   Static JSON
        ↓
Frontend renderiza diretamente
```

### Depois (Sanity CMS)

```
Sanity Studio (CMS)
        ↓
   Sanity API
        ↓
Frontend consome via GROQ/GraphQL
        ↓
(Opcional) ISR ou SSG para cache
```

## 📁 Estrutura de Dados

### Schemas Criados

#### 1. Blog Post (`blogPost`)
- **Identificação**: id, title, slug
- **Conteúdo**: excerpt, content (block content), htmlContent (legacy)
- **Metadados**: author, category, tags, publishedAt
- **SEO**: seo object (metaTitle, metaDescription, keywords)
- **Relacionamentos**: relatedPosts, relatedPodcasts
- **Mídia**: mainImage (com hotspot e alt text)
- **Features**: featured flag

#### 2. Author (`author`)
- name, slug
- image (com hotspot)
- bio, credentials

#### 3. Category (`category`)
- title, slug
- description

#### 4. SEO (`seo`)
- metaTitle, metaDescription
- keywords array
- canonicalUrl

#### 5. Block Content (`blockContent`)
- Parágrafos e headings
- Listas e formatação
- Links e imagens
- Customizável e extensível

### Mapeamento de Dados

| Campo Antigo | Campo Novo | Tipo | Notas |
|-------------|------------|------|-------|
| `id` | `id` | number | Mantido para compatibilidade |
| `slug` | `slug.current` | string | Agora com validação |
| `title` | `title` | string | Limite de 100 chars |
| `excerpt` | `excerpt` | text | Limite de 200 chars |
| `content` (HTML) | `htmlContent` | text | Preservado como legacy |
| `content` (novo) | `content` | blockContent | Conteúdo estruturado |
| `author` | `author._ref` | reference | Referência a documento |
| `date` | `publishedAt` | datetime | ISO format |
| `category` | `category._ref` | reference | Referência a documento |
| `tags` | `tags` | array<string> | Array simples |
| `image` | `mainImage` | image | Upload direto no Sanity |
| `seo.*` | `seo.*` | object | Objeto aninhado |

## 🔄 Processo de Migração

### Fase 1: Setup ✅ CONCLUÍDA

- [x] Criar projeto no Sanity (ID: `92ocrdmp`)
- [x] Configurar dataset `production`
- [x] Instalar dependências do Sanity
- [x] Criar schemas de conteúdo
- [x] Configurar Sanity Studio

**Arquivos criados**:
```
sanity/
├── sanity.config.js
├── package.json
├── schemas/
│   ├── index.js
│   ├── blogPost.js
│   ├── author.js
│   ├── category.js
│   ├── blockContent.js
│   └── seo.js
├── scripts/
│   └── export-blog-posts.js
├── .env.example
└── README.md
```

### Fase 2: Autenticação ⏳ PENDENTE

- [ ] Completar `npx sanity login`
- [ ] Criar token de API
- [ ] Configurar variável `SANITY_TOKEN`

**Comando**:
```bash
cd sanity
npx sanity login
```

### Fase 3: Migração de Dados ⏳ PENDENTE

- [ ] Executar script de exportação
- [ ] Verificar posts criados
- [ ] Fazer upload de imagens
- [ ] Validar integridade dos dados

**Comandos**:
```bash
# 1. Configurar token
export SANITY_TOKEN="seu-token-aqui"

# 2. Instalar dependências
cd sanity
npm install

# 3. Executar exportação
npm run export
```

**Dados a migrar**:
- 27 posts do blog
- ~10 categorias únicas
- 1 autor principal (Dr. Philipe Saraiva Cruz)
- ~100 tags únicas
- 27 imagens de capa

### Fase 4: Conversão de Conteúdo ⏳ FUTURA

- [ ] Converter HTML para block content
- [ ] Otimizar imagens no Sanity
- [ ] Configurar relacionamentos entre posts
- [ ] Adicionar campos customizados se necessário

### Fase 5: Integração com Frontend ⏳ FUTURA

- [ ] Instalar `@sanity/client` no frontend
- [ ] Criar queries GROQ para listagem de posts
- [ ] Criar queries GROQ para post individual
- [ ] Atualizar componentes para usar Sanity
- [ ] Configurar cache/ISR
- [ ] Testar em desenvolvimento

### Fase 6: Deploy e Validação ⏳ FUTURA

- [ ] Deploy do Sanity Studio
- [ ] Configurar webhooks para revalidação
- [ ] Testar fluxo completo de publicação
- [ ] Migrar tráfego gradualmente
- [ ] Monitorar métricas de performance

## 🛠️ Scripts de Migração

### Script de Exportação

Localização: `/sanity/scripts/export-blog-posts.js`

**Funcionalidades**:
- ✅ Lê posts do arquivo estático
- ✅ Cria categorias automaticamente
- ✅ Cria autores automaticamente
- ✅ Evita duplicatas (verifica por ID)
- ✅ Mantém HTML original para referência
- ✅ Cria block content básico
- ✅ Preserva metadados SEO
- ✅ Logs detalhados de progresso

**Estatísticas esperadas**:
```
Total de posts: 27
Categorias: ~10
Autores: 1
Tags: ~100 únicas
```

## 📊 Comparação de Performance

### Sistema Atual (Estático)

| Métrica | Valor |
|---------|-------|
| Tamanho do bundle | +50KB (posts incluídos) |
| Tempo de build | ~30s |
| Deploy | Full rebuild |
| Update time | ~5min (edit + build + deploy) |

### Sistema Futuro (Sanity)

| Métrica | Valor Estimado |
|---------|---------------|
| Tamanho do bundle | -50KB (apenas componentes) |
| Tempo de build | ~20s (sem posts) |
| Deploy | Independente do conteúdo |
| Update time | ~30s (edit no CMS + webhook) |

## 🔐 Segurança e Compliance

### Considerações LGPD

- ✅ Dados de saúde NÃO são armazenados no CMS
- ✅ Apenas conteúdo educativo médico
- ✅ Sem PII (Personally Identifiable Information)
- ✅ Webhooks com autenticação

### Controle de Acesso

- [ ] Configurar roles no Sanity (Editor, Admin)
- [ ] Restringir acesso ao Studio
- [ ] Configurar 2FA para administradores
- [ ] Audit log de mudanças

## 📝 Checklist de Validação

### Pré-Migração

- [x] Schemas criados e validados
- [x] Script de exportação pronto
- [ ] Token de API configurado
- [ ] Backup do sistema atual

### Pós-Migração

- [ ] Todos os 27 posts migrados
- [ ] Imagens funcionando
- [ ] SEO metadata preservado
- [ ] Links internos funcionando
- [ ] Tags e categorias corretas
- [ ] Datas preservadas

### Pré-Deploy

- [ ] Frontend integrado com Sanity
- [ ] Cache configurado
- [ ] Webhooks testados
- [ ] Rollback plan definido
- [ ] Monitoring configurado

## 🚀 Próximos Passos

### Imediatos (Esta Semana)

1. **Completar autenticação**
   ```bash
   cd sanity
   npx sanity login
   ```

2. **Criar token de API**
   - Acessar: https://sanity.io/manage/project/92ocrdmp/api
   - Criar token com permissão de Editor
   - Salvar em `.env`

3. **Executar migração**
   ```bash
   export SANITY_TOKEN="..."
   npm run export
   ```

4. **Fazer upload de imagens**
   - Upload manual via Studio
   - Ou script automatizado

### Curto Prazo (Próximas 2 Semanas)

1. **Deploy do Sanity Studio**
   ```bash
   npm run deploy
   ```

2. **Integrar frontend**
   - Instalar `@sanity/client`
   - Criar queries GROQ
   - Atualizar componentes

3. **Configurar webhooks**
   - Webhook para rebuild
   - Webhook para cache invalidation

### Médio Prazo (Próximo Mês)

1. **Converter conteúdo**
   - HTML → Block Content
   - Melhorar formatação
   - Adicionar mídia rica

2. **Otimizar workflow**
   - Configurar preview
   - Configurar agendamento
   - Adicionar aprovação

3. **Treinamento**
   - Documentar processo editorial
   - Treinar equipe no Studio
   - Criar guidelines de conteúdo

## 📚 Recursos e Documentação

### Sanity

- [Documentação Oficial](https://www.sanity.io/docs)
- [GROQ Cheat Sheet](https://www.sanity.io/docs/query-cheat-sheet)
- [Schema Types](https://www.sanity.io/docs/schema-types)
- [Content Studio](https://www.sanity.io/docs/content-studio)

### Projeto

- [README do Sanity](/sanity/README.md)
- [Schemas](/sanity/schemas/)
- [Script de Exportação](/sanity/scripts/export-blog-posts.js)

### Dashboard

- [Sanity Management](https://sanity.io/manage/project/92ocrdmp)
- [Sanity Studio](http://localhost:3333) (após `npm run dev`)

## 🐛 Troubleshooting

### Erro: "You must login first"

**Solução**:
```bash
cd sanity
npx sanity login
```

### Erro: "SANITY_TOKEN not configured"

**Solução**:
```bash
# 1. Criar token em https://sanity.io/manage/project/92ocrdmp/api
# 2. Exportar variável
export SANITY_TOKEN="seuTokenAqui"
```

### Posts duplicados na migração

**Solução**: O script verifica por ID antes de criar. Se houver duplicatas:
```bash
# Listar posts
npx sanity documents query '*[_type == "blogPost"]'

# Deletar post específico
npx sanity documents delete <document-id>
```

## ✅ Critérios de Sucesso

### Migração Bem-Sucedida

- [ ] 100% dos posts migrados (27/27)
- [ ] Todas as imagens funcionando
- [ ] SEO metadata preservado
- [ ] Performance igual ou melhor
- [ ] Workflow de edição funcionando
- [ ] Zero downtime durante migração

### KPIs a Monitorar

- **Tempo de atualização**: < 1 minuto
- **Uptime**: > 99.9%
- **Performance**: LCP < 2.5s
- **SEO**: Rankings mantidos

## 📞 Contato e Suporte

**Desenvolvedor**: Dr. Philipe Saraiva Cruz
**Projeto**: Saraiva Vision
**Sanity Project**: 92ocrdmp
**Dataset**: production

---

**Última atualização**: 2025-10-25
**Versão**: 1.0.0
**Status**: 🔄 Migração em Progresso
