# Guia de Otimização de Imagens - Saraiva Vision

## 📊 Resumo de Implementação

### Reduções Alcançadas
- **Logo**: 166KB (PNG) → 31KB (AVIF) = **81% redução**
- **Hero Image**: 728KB (PNG) → 231KB (AVIF) = **68% redução**
- **Perfil Dr. Philipe**: 1.1MB (PNG) → 114KB (AVIF) = **90% redução**
- **Contact Lenses Hero**: 956KB (PNG) → 51KB (AVIF) = **95% redução**
- **Avatares**: 412-460KB → 64-77KB (AVIF) = **82-85% redução**
- **Ícones Médicos**: 220-316KB → comprimidos para AVIF/WebP

### Impacto Esperado no Payload
- **Antes**: ~13.1MB total
- **Após otimização**: Estimado <2MB (85% redução)
- **LCP**: Esperado redução de 50-70% no tempo de carregamento

---

## 🎯 Componentes Implementados

### 1. OptimizedImage.jsx
**Localização**: `/src/components/OptimizedImage.jsx`

Componente React que:
- Gera automaticamente `<picture>` com fallbacks AVIF → WebP → PNG
- Implementa lazy loading com Intersection Observer
- Placeholder com shimmer animation
- Dimensões explícitas para evitar CLS (Cumulative Layout Shift)

**Uso**:
```jsx
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  src="/img/hero.png"
  alt="Hero image"
  width={1920}
  height={1080}
  priority={true}
  objectFit="cover"
/>
```

**Props**:
- `src`: Caminho da imagem PNG/JPG original
- `alt`: Texto alternativo (obrigatório)
- `width`, `height`: Dimensões para evitar layout shift
- `priority`: `true` para imagens above-the-fold (eager loading)
- `objectFit`: `cover`, `contain`, `fill`, etc.
- `loading`: `lazy` (padrão) ou `eager`

---

## 📝 Componentes Atualizados

### Logo.jsx
```jsx
// ANTES
<img src="/img/logo_prata.png" ... />

// DEPOIS
<OptimizedImage 
  src="/img/logo_prata.png"
  priority={true}
  ...
/>
```

### SocialIcons.jsx
Atualizado para usar `OptimizedImage` ao invés de `<img>` direto.

**Outros componentes com ícones sociais**:
- `Footer.jsx`
- `EnhancedFooter.jsx`
- `SocialIcon3D.demo.jsx`
- Arquivos de teste (não alterados - usam PNGs em mocks)

---

## 🛠️ Script de Otimização Automática

**Localização**: `/scripts/optimize-images.sh`

Converte automaticamente todas as imagens PNG/JPG para AVIF e WebP.

**Uso**:
```bash
cd /home/saraiva-vision-site
./scripts/optimize-images.sh
```

**Configuração**:
- Hero images: qualidade 85%, max 1920px
- Avatares: qualidade 80%, max 800px
- Ícones médicos: qualidade 75%, max 512px
- Ícones sociais: qualidade 75%, max 256px

**Dependências**:
- ImageMagick (`convert` command)
- Instalado via: `apt install imagemagick`

---

## 🔍 Otimizações no index.html

### Favicons
```html
<!-- Prioriza AVIF (40KB) ao invés de PNG (93KB) -->
<link rel="icon" type="image/avif" href="/favicon-32x32.avif" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
```

### Preload de Imagens Críticas
```html
<!-- LCP boost: carrega logo e hero ANTES do bundle JS -->
<link rel="preload" as="image" type="image/avif" href="/img/logo_prata.avif" fetchpriority="high" />
<link rel="preload" as="image" type="image/avif" href="/img/hero.avif" fetchpriority="high" />
```

---

## 📦 Estrutura de Arquivos

Cada imagem agora possui 3 versões:
```
public/img/
├── hero.png          (728KB - fallback)
├── hero.webp         (164KB - suporte amplo)
└── hero.avif         (231KB - melhor compressão)
```

O componente `OptimizedImage` carrega automaticamente:
1. **AVIF** (Chrome 85+, Edge 90+, Firefox 93+, Safari 16+)
2. **WebP** (95%+ suporte) se AVIF falhar
3. **PNG/JPG** (fallback universal) se WebP falhar

---

## ✅ Checklist de Validação

### Imagens Otimizadas
- [x] Logo prata (31KB AVIF)
- [x] Hero image (231KB AVIF)
- [x] Perfil Dr. Philipe (114KB AVIF)
- [x] Contact Lenses Hero (51KB AVIF)
- [x] Avatares (64-77KB AVIF)
- [x] Ícones médicos (12 ícones convertidos)
- [x] Ícones sociais (AVIF/WebP existentes)

### Componentes
- [x] OptimizedImage.jsx criado
- [x] Logo.jsx atualizado
- [x] SocialIcons.jsx atualizado
- [x] index.html com preloads

### Scripts & Docs
- [x] optimize-images.sh executável
- [x] Documentação criada

### Próximos Passos
- [ ] Executar `npm run build` para validar
- [ ] Lighthouse audit (meta: LCP <2.5s)
- [ ] Testar em navegadores (Chrome, Firefox, Safari)
- [ ] Validar fallbacks em navegadores antigos

---

## 🚀 Deploy

1. **Verificar build**:
```bash
npm run build
npm run preview
```

2. **Lighthouse audit** (dev tools):
   - Performance: meta >90
   - LCP: <2.5s
   - CLS: <0.1
   - Network payload: <2MB

3. **Deploy Vercel**:
```bash
vercel --prod
```

4. **Validar produção**:
   - https://saraivavision.com.br
   - Verificar DevTools > Network > imagens AVIF carregadas
   - Confirmar payload total <2MB

---

## 📚 Referências

- [Web.dev - Modern Image Formats](https://web.dev/uses-webp-images/)
- [AVIF vs WebP](https://jakearchibald.com/2020/avif-has-landed/)
- [Preload Critical Assets](https://web.dev/preload-critical-assets/)
- [Optimizing LCP](https://web.dev/optimize-lcp/)

---

**Data**: 2025-10-06  
**Autor**: Claude AI (Otimização de Performance)  
**Versão**: 1.0
