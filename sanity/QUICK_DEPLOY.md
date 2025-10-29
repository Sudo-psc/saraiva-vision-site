# 🚀 Sanity Studio - Quick Deploy Guide

**Tempo estimado**: 5 minutos

---

## 📋 Comandos Rápidos

```bash
# 1. Navegar para o diretório Sanity
cd /home/saraiva-vision-site/sanity

# 2. Login no Sanity (APENAS UMA VEZ)
npx sanity login

# 3. Deploy do Studio
npm run deploy

# 4. Verificar deploy
curl -I https://saraivavision.sanity.studio
```

---

## ✅ Verificação Pós-Deploy

Acesse no navegador:
```
https://saraivavision.sanity.studio
```

**O que você deve ver**:
- ✅ Sanity Studio carregado
- ✅ Tela de login do Sanity
- ✅ Após login: 25 posts do blog

**Se aparecer 404**:
- ❌ Studio não foi deployado
- 🔄 Repita o passo 3: `npm run deploy`

---

## 🎯 Após o Deploy

### Criar Novo Post

1. Acesse: https://saraivavision.sanity.studio
2. Clique em "Blog Posts" no menu lateral
3. Clique em "Create"
4. Preencha os campos:
   - Title
   - Slug (gerado automaticamente)
   - Excerpt
   - Content (Portable Text - rico em formatação)
   - Main Image (upload direto)
   - Author (selecione "Dr. Philipe Saraiva Cruz")
   - Category
   - Tags
   - SEO metadata
5. Clique em "Publish"

**IMPORTANTE**: Publicação é **instantânea** - não precisa de deploy do site!

### Editar Post Existente

1. Acesse: https://saraivavision.sanity.studio
2. Clique em "Blog Posts"
3. Encontre o post na lista
4. Clique para editar
5. Faça as alterações
6. Clique em "Publish"

**Mudanças aparecem em ~5 segundos** no site (cache do CDN)

---

## 🆘 Problemas?

Veja: `TROUBLESHOOTING.md`

---

**Autor**: Dr. Philipe Saraiva Cruz
**Data**: 2025-10-28
