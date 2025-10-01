# 📸 Blog Image Guidelines

**Saraiva Vision Blog - Image Standards & Best Practices**

---

## 🎯 Overview

Este documento define os padrões para imagens de posts do blog, garantindo consistência visual, performance otimizada e boa experiência do usuário.

---

## 📐 Especificações Técnicas

### Aspect Ratio
- **Obrigatório**: 16:9 (1.78:1)
- **Tolerância**: ±5%
- **Dimensões recomendadas**:
  - Original: 1920x1080px
  - Fallback: 1280x720px

### Formatos de Arquivo

#### Ordem de Prioridade (servida pelo OptimizedImage)
1. **AVIF** (mais moderno, melhor compressão)
2. **WebP** (fallback moderno)
3. **PNG/JPG** (fallback universal)

#### Tamanhos Responsivos
Gerar as seguintes variantes para cada imagem:

```
post-{id}-cover.png           # Original (1920x1080)
post-{id}-cover-1280w.avif    # Desktop grande
post-{id}-cover-1280w.webp    # Desktop fallback
post-{id}-cover-768w.avif     # Tablet
post-{id}-cover-768w.webp     # Tablet fallback
post-{id}-cover-480w.avif     # Mobile
post-{id}-cover-480w.webp     # Mobile fallback
post-{id}-cover.avif          # Original AVIF
post-{id}-cover.webp          # Original WebP
```

### Limites de Tamanho

| Formato | Largura | Tamanho Máximo |
|---------|---------|----------------|
| PNG/JPG | 1920w   | 500 KB         |
| WebP    | 1280w   | 150 KB         |
| WebP    | 768w    | 80 KB          |
| WebP    | 480w    | 50 KB          |
| AVIF    | 1280w   | 100 KB         |
| AVIF    | 768w    | 50 KB          |
| AVIF    | 480w    | 30 KB          |

---

## 📋 Convenção de Nomenclatura

### Padrão de Nomes

```
post-{id}-cover[-{width}w].{ext}
```

**Exemplos**:
- ✅ `post-22-cover.png`
- ✅ `post-22-cover-768w.avif`
- ✅ `post-15-cover-480w.webp`

**Evitar**:
- ❌ `ChatGPT 2025-09-30 00.47.23.tiff`
- ❌ `1d166bbe258b66d34d5dc1df7e8eb172713130d3.png`
- ❌ `blog_image_final_v2.jpg`

### ID do Post
O `{id}` deve corresponder ao `id` no array `blogPosts` em `src/data/blogPosts.js`.

---

## 🎨 Diretrizes de Design

### Composição Visual

1. **Foco Central**: Elemento principal no centro ótico (regra dos terços)
2. **Respiração**: Evitar texto/elementos nas bordas (safe area: 10% padding)
3. **Contraste**: Texto deve ter contraste mínimo 4.5:1 com fundo
4. **Hierarquia**: Máximo 3 níveis de hierarquia visual

### Paleta de Cores (Atualizada 2025-10-01)

Usar cores que harmonizem com as categorias do blog:

| Categoria | Cor Principal | Hex | Uso |
|-----------|---------------|-----|-----|
| Prevenção | Emerald | `#10B981` | Saúde/Proteção |
| Tratamento | Cyan | `#06B6D4` | Medicina/Confiança |
| Tecnologia | Purple | `#A855F7` | Inovação |
| Dúvidas Frequentes | Orange | `#F97316` | Atenção/Clareza |

### Tipografia em Imagens

Se a imagem contiver texto:
- **Font family**: Sans-serif (Inter, Poppins, Montserrat)
- **Weight**: 600-700 (semibold/bold)
- **Size**: Mínimo 48px para headings
- **Spacing**: Line-height 1.2-1.4

---

## 🛠️ Processo de Otimização

### Script Automático (Recomendado)

```bash
# 1. Adicionar imagem original
cp new-image.png public/Blog/post-{id}-cover.png

# 2. Gerar variantes otimizadas
npm run optimize:blog-images -- --post-id {id}

# 3. Validar aspect ratios
npm run validate:blog-images
```

### Manual (Sharp CLI)

```bash
# Gerar AVIF variants
sharp -i post-{id}-cover.png -o post-{id}-cover-1280w.avif resize 1280 720
sharp -i post-{id}-cover.png -o post-{id}-cover-768w.avif resize 768 432
sharp -i post-{id}-cover.png -o post-{id}-cover-480w.avif resize 480 270

# Gerar WebP variants
sharp -i post-{id}-cover.png -o post-{id}-cover-1280w.webp resize 1280 720 --webp
sharp -i post-{id}-cover.png -o post-{id}-cover-768w.webp resize 768 432 --webp
sharp -i post-{id}-cover.png -o post-{id}-cover-480w.webp resize 480 270 --webp
```

---

## ✅ Checklist Pré-Deploy

Antes de fazer commit de novas imagens:

- [ ] Aspect ratio 16:9 validado
- [ ] Todas as variantes geradas (480w, 768w, 1280w, original)
- [ ] Formatos AVIF e WebP presentes
- [ ] Tamanhos dentro dos limites especificados
- [ ] Nome segue convenção `post-{id}-cover`
- [ ] Imagem referenciada corretamente em `blogPosts.js`
- [ ] Executado `npm run validate:blog-images` sem erros

---

## 🔍 Validação e Testes

### Script de Validação

```bash
# Validar todas as imagens
node scripts/validate-blog-images.js

# Output esperado:
# ✓ post-22-cover.png
#   1920x1080 (1.78:1) - 245.32 KB
#
# Summary:
# Total Images: 22
# Valid: 22
# Invalid: 0
```

### Testes Visuais

1. **Desktop**: Verificar em 1920x1080, 1440x900, 1366x768
2. **Tablet**: Verificar em 1024x768 (landscape/portrait)
3. **Mobile**: Verificar em 375x667 (iPhone SE), 414x896 (iPhone 11)

---

## 📚 Recursos e Ferramentas

### Editores de Imagem
- [Photopea](https://www.photopea.com/) - Editor online gratuito
- [GIMP](https://www.gimp.org/) - Editor desktop open-source
- [Figma](https://www.figma.com/) - Design de mockups

### Otimização
- [Squoosh](https://squoosh.app/) - Otimizador online
- [Sharp](https://sharp.pixelplumbing.com/) - CLI/Node.js (usado internamente)

---

**Mantido por**: Saraiva Vision Tech Team
**Última atualização**: 2025-10-01
