# Saraiva Vision Blog - Sanity CMS

Este diretório contém a configuração do Sanity Studio para o gerenciamento do blog da Saraiva Vision.

## 📋 Informações do Projeto

- **Project ID**: `92ocrdmp`
- **Dataset**: `production`
- **Studio URL**: https://studio.saraivavision.com.br
- **Template**: Clean (configuração customizada)

## 🚀 Primeiros Passos

### 1. Instalação de Dependências

```bash
cd sanity
npm install
```

### 2. Autenticação

Faça login no Sanity CLI:

```bash
npx sanity login
```

Escolha o método de autenticação (Google, GitHub ou E-mail).

### 3. Iniciar Studio de Desenvolvimento

```bash
npm run dev
```

O Sanity Studio será aberto em `http://localhost:3333`

## 📦 Estrutura do Projeto

```
sanity/
├── sanity.config.js       # Configuração principal do Sanity
├── schemas/               # Schemas de conteúdo
│   ├── index.js          # Exportação de todos os schemas
│   ├── blogPost.js       # Schema de posts do blog
│   ├── author.js         # Schema de autores
│   ├── category.js       # Schema de categorias
│   ├── blockContent.js   # Schema de conteúdo rico
│   └── seo.js            # Schema de metadados SEO
├── scripts/              # Scripts de migração e utilitários
│   └── export-blog-posts.js  # Script de exportação de posts
└── README.md             # Este arquivo
```

## 📝 Schemas Disponíveis

### Blog Post (`blogPost`)

Schema principal para posts do blog, incluindo:
- Informações básicas (título, slug, excerpt)
- Conteúdo rico (block content)
- Metadados (autor, categoria, tags, data)
- SEO (meta title, meta description, keywords)
- Relacionamentos (posts relacionados, podcasts)
- Compatibilidade com sistema legado (ID numérico, HTML content)

### Author (`author`)

Informações sobre autores:
- Nome e slug
- Foto
- Biografia
- Credenciais profissionais

### Category (`category`)

Categorias de posts:
- Título e slug
- Descrição

### SEO (`seo`)

Objeto reutilizável para metadados de SEO:
- Meta Title
- Meta Description
- Keywords
- Canonical URL

### Block Content (`blockContent`)

Conteúdo rico estruturado:
- Parágrafos e headings (H1-H4)
- Listas (bullet e numeradas)
- Formatação (negrito, itálico, código)
- Links
- Imagens com alt text e legendas

## 🔄 Migração de Posts

### Pré-requisitos

1. Criar um token de API no Sanity:
   - Acesse: https://sanity.io/manage/project/92ocrdmp/api
   - Crie um token com permissão de **Editor**
   - Copie o token gerado

2. Configurar variável de ambiente:

```bash
export SANITY_TOKEN="seu-token-aqui"
```

### Executar Migração

```bash
npm run export
```

Este script irá:
1. Ler posts do arquivo `/src/data/blogPosts.js`
2. Criar categorias e autores automaticamente
3. Criar posts no Sanity com todas as informações
4. Manter HTML original em campo separado para referência

### Logs da Migração

O script fornece logs detalhados:
- ✅ Posts criados com sucesso
- ⚠️  Posts já existentes (pulados)
- ❌ Erros durante a criação

## 🎨 Personalização do Studio

### Ordenação de Posts

Posts podem ser ordenados por:
- Data de publicação (mais recentes primeiro)
- Data de publicação (mais antigos primeiro)
- Título (A-Z)

### Preview de Posts

O preview mostra:
- Título do post
- Imagem de capa
- Autor e data de publicação

## 📚 Próximos Passos

Após a migração inicial:

1. **Upload de Imagens**
   - Fazer upload das imagens de capa para Sanity
   - Atualizar referências nos posts

2. **Conversão de Conteúdo**
   - Converter HTML legado para block content estruturado
   - Aproveitar recursos de formatação rica

3. **Relacionamentos**
   - Configurar posts relacionados
   - Integrar com podcasts

4. **Frontend**
   - Atualizar frontend para consumir API do Sanity
   - Implementar queries GROQ
   - Configurar webhooks para revalidação

## 🔗 Links Úteis

- [Studio de Produção](https://studio.saraivavision.com.br)
- [Documentação do Sanity](https://www.sanity.io/docs)
- [GROQ Cheat Sheet](https://www.sanity.io/docs/query-cheat-sheet)
- [Sanity Management](https://sanity.io/manage/project/92ocrdmp)
- [Sanity Vision (Query Tool)](http://localhost:3333/vision) (após `npm run dev`)

## 🛠️ Comandos Disponíveis

```bash
npm run dev        # Iniciar studio de desenvolvimento
npm run build      # Build para produção
npm run deploy     # Deploy do studio
npm run export     # Executar migração de posts
```

## 📝 Notas de Desenvolvimento

### Compatibilidade com Sistema Legado

Os schemas foram projetados para manter compatibilidade com o sistema estático anterior:
- Campo `id` numérico para referência
- Campo `htmlContent` para preservar HTML original
- Campo `legacyImageUrl` para URLs de imagens antigas
- Campo `relatedPodcasts` para IDs de podcasts

### Validações

Todos os campos obrigatórios têm validação:
- Títulos limitados a 100 caracteres
- Meta descriptions limitadas a 160 caracteres
- Slugs gerados automaticamente
- Referências obrigatórias para autor e categoria

### SEO e Acessibilidade

- Alt text obrigatório em todas as imagens
- Metadados SEO estruturados
- Suporte a canonical URLs
- Keywords organizadas

## 👨‍⚕️ Autor

**Dr. Philipe Saraiva Cruz**
Oftalmologista - Saraiva Vision
Caratinga, MG

---

**Última atualização**: 2025-10-25
**Versão**: 1.0.0
