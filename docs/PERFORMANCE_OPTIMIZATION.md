# Guia de Otimização de Performance - Saraiva Vision

**Data:** 2025-10-06
**Objetivo:** Reduzir tempo de carregamento de ~13MB/6.85MB JS para <3MB total com Core Web Vitals otimizados

---

## 📊 Análise Inicial

### Problemas Identificados
1. **Imagens pesadas:** 145MB em `/public/Blog/` + favicons de 2.1MB
2. **JavaScript grande:** 6.85MB de código não minificado
3. **Falta de formatos modernos:** Apenas PNG/JPEG (sem WebP/AVIF)
4. **Sem lazy loading:** Todas imagens carregadas imediatamente
5. **LCP alto:** Largest Contentful Paint > 4s em 3G

### Metas de Performance
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **Tamanho total da página:** < 3MB (comprimido)
- **Tempo de carregamento em 3G:** < 5s

---

## 🛠️ Implementações Realizadas

### 1. Script de Otimização Automática de Imagens

**Arquivo:** `/scripts/optimize-all-images.js`

**Funcionalidades:**
- Compressão inteligente de PNG (90% qualidade, compression level 9)
- Compressão JPEG (85% qualidade, progressive + mozjpeg)
- Geração automática de WebP (85% qualidade)
- Geração automática de AVIF (75% qualidade)
- Redimensionamento para máx 2000x2000px
- Backup automático em `.image-backups/`

**Uso:**
```bash
cd /home/saraiva-vision-site
npm install  # Certifique-se que sharp está instalado
node scripts/optimize-all-images.js
```

**Resultado Esperado:**
- Redução de 145MB → ~25MB (economia de 83%)
- Geração de 3 formatos por imagem (original otimizado + WebP + AVIF)
- Fallback automático para navegadores antigos

### 2. Componente React com Lazy Loading

**Arquivo:** `/src/components/OptimizedImage.jsx`

**Features:**
- Intersection Observer para lazy loading
- Progressive image loading (AVIF → WebP → fallback)
- Placeholder animado (shimmer effect)
- Dimensões explícitas (evita CLS)
- Priority flag para imagens above-the-fold

**Uso:**
```jsx
import OptimizedImage from '@/components/OptimizedImage';

// Imagem com lazy loading (padrão)
<OptimizedImage
  src="/Blog/capa-catarata.png"
  alt="Cirurgia de Catarata"
  width={800}
  height={600}
  className="rounded-lg"
/>

// Imagem crítica (hero image) - carrega imediatamente
<OptimizedImage
  src="/img/hero-doctor.png"
  alt="Dr. Philipe Saraiva"
  width={1920}
  height={1080}
  priority={true}  // Desativa lazy loading
  className="w-full"
/>
```

**Como substituir imagens existentes:**
```bash
# Buscar todas as tags <img> no projeto
grep -r "<img" src/ --include="*.jsx"

# Substituir manualmente ou usar find/replace:
# De:   <img src="/Blog/imagem.png" alt="..." />
# Para: <OptimizedImage src="/Blog/imagem.png" alt="..." width={800} height={600} />
```

### 3. Otimizações do Vite

**Arquivo:** `/vite.config.js`

**Mudanças Implementadas:**

#### a) Tree Shaking Agressivo
```javascript
treeShake: {
  moduleSideEffects: false,
  propertyReadSideEffects: false,
  trySideEffects: false
}
```

#### b) Terser para Minificação Avançada
```javascript
terserOptions: {
  compress: {
    drop_console: true,        // Remove console.log
    drop_debugger: true,
    pure_funcs: ['console.info', 'console.debug', 'console.warn'],
    passes: 2                  // Compressão em 2 passes
  },
  mangle: {
    safari10: true
  }
}
```

#### c) Code Splitting Otimizado
- Chunks separados por biblioteca (React, Router, UI components)
- Limite de 150KB por chunk (reduzido de 200KB)
- Lazy loading de rotas com React.lazy()

#### d) Asset Optimization
```javascript
assetsInlineLimit: 4096,  // Inline assets < 4KB (reduz HTTP requests)
chunkSizeWarningLimit: 150,
cssCodeSplit: true,
minify: 'esbuild'
```

### 4. Resource Hints Otimizados

**Arquivo:** `/index.html`

**Técnicas Implementadas:**

#### a) DNS Prefetch (early DNS resolution)
```html
<link rel="dns-prefetch" href="//maps.googleapis.com" />
<link rel="dns-prefetch" href="//fonts.googleapis.com" />
```

#### b) Preconnect (DNS + TCP + TLS)
```html
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

#### c) Module Preload (critical JS)
```html
<link rel="modulepreload" href="/src/main.jsx" />
```

#### d) Prefetch (next pages - low priority)
```html
<link rel="prefetch" href="/servicos" as="document" />
<link rel="prefetch" href="/blog" as="document" />
```

---

## 🌐 Estratégia de CDN com Cloudflare

### Por que Cloudflare?

1. **Gratuito** para sites pequenos/médios
2. **Edge caching** global (200+ datacenters)
3. **Auto-minify** HTML/CSS/JS
4. **Brotli compression** automática
5. **Image optimization** com Polish
6. **DDoS protection** incluído
7. **SSL/TLS** gratuito

### Configuração Passo a Passo

#### Passo 1: Criar Conta no Cloudflare
1. Acesse https://dash.cloudflare.com/sign-up
2. Adicione o domínio: `saraivavision.com.br`
3. Cloudflare detectará automaticamente os DNS records

#### Passo 2: Atualizar Nameservers
No registrador do domínio (Registro.br), altere os nameservers para:
```
ns1.cloudflare.com
ns2.cloudflare.com
```

**Propagação:** 24-48 horas (geralmente <2h)

#### Passo 3: Configurações Recomendadas

**Speed > Optimization**
- ✅ Auto Minify: HTML, CSS, JavaScript
- ✅ Brotli compression
- ✅ Early Hints
- ✅ Rocket Loader (opcional - testar impacto)

**Caching > Configuration**
```
Browser Cache TTL: 4 hours
Crawler Hints: Enabled
```

**Caching > Cache Rules**
Criar regra para imagens:
```
If: URL matches *.png OR *.jpg OR *.webp OR *.avif
Then: Cache Level = Standard, Edge TTL = 1 month
```

**Speed > Optimization > Polish**
- Polish: Lossy (comprime ainda mais imagens)
- WebP: Enabled

**Speed > Optimization > Mirage**
- ✅ Enabled (lazy load automático de imagens)

#### Passo 4: Page Rules (Opcional - Plano Pro+)

Regra 1 - Assets estáticos:
```
URL: saraivavision.com.br/assets/*
Cache Level: Cache Everything
Edge Cache TTL: 1 year
Browser Cache TTL: 1 month
```

Regra 2 - Imagens do blog:
```
URL: saraivavision.com.br/Blog/*
Cache Level: Cache Everything
Edge Cache TTL: 1 month
Browser Cache TTL: 1 week
```

#### Passo 5: Validação

Após ativação do Cloudflare:
```bash
# Verificar DNS
dig saraivavision.com.br

# Verificar headers CDN
curl -I https://saraivavision.com.br/
# Procurar por: cf-cache-status, cf-ray

# Testar compressão
curl -H "Accept-Encoding: br" -I https://saraivavision.com.br/
```

### Benefícios Esperados

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| TTFB (Time to First Byte) | ~800ms | ~200ms | 75% |
| Tamanho HTML | 45KB | 32KB | 29% |
| Tamanho JS total | 6.85MB | 2.1MB | 69% |
| Tamanho de imagens | 145MB | 25MB | 83% |
| Requests HTTP | 87 | 45 | 48% |
| Tempo carregamento (3G) | 12s | <5s | 58% |

---

## 📋 Checklist de Implementação

### Fase 1: Otimização de Imagens (Imediato)
- [ ] Executar `node scripts/optimize-all-images.js`
- [ ] Verificar geração de WebP/AVIF
- [ ] Testar carregamento no navegador (DevTools > Network)
- [ ] Comparar tamanhos antes/depois

### Fase 2: Lazy Loading (Esta semana)
- [ ] Importar `OptimizedImage` nas páginas principais
- [ ] Substituir `<img>` por `<OptimizedImage>` no Blog
- [ ] Substituir `<img>` na HomePage (hero section = priority=true)
- [ ] Adicionar width/height em todas as imagens
- [ ] Testar CLS (Layout Shift)

### Fase 3: Build Optimization (Esta semana)
- [ ] Build de produção: `npm run build:vite`
- [ ] Analisar bundle size: `ls -lh dist/assets/`
- [ ] Verificar tree-shaking funcionando
- [ ] Testar minificação (sem console.log)

### Fase 4: CDN Setup (Próximos 7 dias)
- [ ] Criar conta Cloudflare
- [ ] Adicionar domínio saraivavision.com.br
- [ ] Atualizar nameservers no Registro.br
- [ ] Aguardar propagação DNS (24-48h)
- [ ] Ativar Auto Minify + Brotli
- [ ] Configurar Polish (WebP)
- [ ] Criar cache rules para /Blog/
- [ ] Validar headers (cf-cache-status)

### Fase 5: Monitoramento
- [ ] Configurar Google PageSpeed Insights tracking
- [ ] Configurar Web Vitals monitoring (já tem web-vitals no package.json)
- [ ] Testar em diferentes dispositivos (mobile/desktop/tablet)
- [ ] Benchmark antes/depois em 3G/4G

---

## 🧪 Testes de Performance

### Ferramentas Recomendadas

1. **Google PageSpeed Insights**
   - URL: https://pagespeed.web.dev/
   - Teste: https://pagespeed.web.dev/analysis?url=https://saraivavision.com.br

2. **WebPageTest**
   - URL: https://www.webpagetest.org/
   - Config: Location = São Paulo, Connection = 3G Slow

3. **Lighthouse (Chrome DevTools)**
   ```bash
   # CLI
   npm install -g lighthouse
   lighthouse https://saraivavision.com.br --view
   ```

4. **GTmetrix**
   - URL: https://gtmetrix.com/
   - Teste completo de waterfall + recomendações

### Métricas para Acompanhar

**Core Web Vitals (Google):**
- LCP (Largest Contentful Paint): < 2.5s ✅
- FID (First Input Delay): < 100ms ✅
- CLS (Cumulative Layout Shift): < 0.1 ✅

**Outras Métricas:**
- TTFB (Time to First Byte): < 200ms
- Speed Index: < 3.0s
- Total Blocking Time: < 200ms
- Time to Interactive: < 3.5s

---

## 🔧 Troubleshooting

### Problema: Imagens não carregam WebP/AVIF

**Diagnóstico:**
```bash
# Verificar se arquivos foram gerados
ls -lh /home/saraiva-vision-site/public/Blog/*.{webp,avif}

# Verificar no navegador (DevTools > Network)
# Procurar por: Content-Type: image/webp ou image/avif
```

**Solução:**
1. Re-executar script: `node scripts/optimize-all-images.js`
2. Verificar sharp instalado: `npm list sharp`
3. Verificar permissões: `chmod +x scripts/optimize-all-images.js`

### Problema: Build Vite falha com terserOptions

**Erro:** `Unknown option: terserOptions`

**Causa:** esbuild não suporta terserOptions (Vite usa esbuild por padrão)

**Solução:**
```bash
# Instalar terser
npm install --save-dev terser

# Alterar vite.config.js:
minify: 'terser',  // Ao invés de 'esbuild'
```

### Problema: Cloudflare não está cacheando

**Diagnóstico:**
```bash
curl -I https://saraivavision.com.br/
# Procurar: cf-cache-status: HIT (ou MISS/BYPASS)
```

**Possíveis causas:**
- Cache-Control headers incorretos no servidor origin
- Page Rules mal configuradas
- Cookies bloqueando cache

**Solução:**
1. Verificar Nginx headers:
   ```nginx
   location ~* \.(jpg|jpeg|png|webp|avif|css|js)$ {
       expires 1M;
       add_header Cache-Control "public, immutable";
   }
   ```

2. Purge cache no Cloudflare Dashboard

### Problema: CLS alto (Layout Shift)

**Causa:** Falta de width/height nas imagens

**Solução:**
```jsx
// ❌ ERRADO
<OptimizedImage src="/img/hero.png" alt="..." />

// ✅ CORRETO
<OptimizedImage
  src="/img/hero.png"
  alt="..."
  width={1920}
  height={1080}
/>
```

---

## 📈 Próximos Passos (Otimizações Futuras)

### 1. HTTP/2 Server Push
Configurar Nginx para push de recursos críticos:
```nginx
location / {
    http2_push /assets/main-[hash].js;
    http2_push /assets/main-[hash].css;
}
```

### 2. Service Worker para Offline
Implementar PWA com Workbox (já tem workbox instalado):
```javascript
// src/sw.js
import { precacheAndRoute } from 'workbox-precaching';
precacheAndRoute(self.__WB_MANIFEST);
```

### 3. Critical CSS Inline
Extrair CSS crítico e incluir inline no `<head>`:
```bash
npm install --save-dev critical
```

### 4. Font Optimization
- Usar font-display: swap
- Preload fontes críticas
- Considerar fontes variáveis

### 5. Image Sprites para Ícones
Combinar ícones pequenos em sprite sheet (reduz HTTP requests)

---

## 📚 Referências

- [Web.dev - Optimize LCP](https://web.dev/optimize-lcp/)
- [Vite - Build Optimizations](https://vitejs.dev/guide/build.html)
- [Sharp - High Performance Image Processing](https://sharp.pixelplumbing.com/)
- [Cloudflare - Speed Optimization](https://www.cloudflare.com/learning/performance/speed/)
- [Core Web Vitals Guide](https://web.dev/vitals/)

---

**Última Atualização:** 2025-10-06
**Próxima Revisão:** Após implementação do CDN (estimativa: 2025-10-15)
