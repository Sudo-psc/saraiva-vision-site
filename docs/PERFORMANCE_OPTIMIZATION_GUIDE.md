# 🚀 Guia de Otimização de Performance - Saraiva Vision

## 📊 Situação Inicial

**Problemas Críticos Identificados:**
- ⚠️ Total Blocking Time (TBT): 20 tarefas longas detectadas
- ⚠️ Tarefa mais longa: 253ms (vendor-misc-Datc-lkf.js)
- ⚠️ Google Tag Manager/Ads bloqueando thread principal (724ms, 245ms, 204ms)
- ⚠️ Bundle OptimizedImage: 204KB
- ⚠️ React Core: Múltiplas tarefas longas (164ms, 148ms, 146ms, 129ms)
- ⚠️ Framer Motion sendo carregado eagerly em 34+ componentes

**Meta de Performance:**
- ✅ TBT < 200ms (reduzir de 20 tarefas para < 5 tarefas)
- ✅ Nenhuma tarefa individual > 100ms
- ✅ Lighthouse Performance Score > 90
- ✅ First Input Delay (FID) < 100ms

---

## 🛠️ Otimizações Implementadas

### 1. Google Tag Manager - Carregamento Diferido ⚡

**Problema:** GTM carregando sincronamente no `<head>`, bloqueando 724ms + 245ms da thread principal.

**Solução:**
```javascript
// src/components/GoogleTagManager.jsx
// ✅ Carregamento diferido com requestIdleCallback
// ✅ Carrega após 2s OU primeira interação do usuário
// ✅ Eventos: mousedown, touchstart, scroll
```

**Impacto Esperado:**
- ⬇️ Redução de ~1000ms em tarefas longas
- ⬆️ Melhoria de 30-40 pontos no Lighthouse Score
- ✅ GTM não bloqueia mais o carregamento inicial

**Arquivo:** `src/components/GoogleTagManager.jsx`

---

### 2. Code Splitting Aprimorado 📦

**Problema:** Bundle `vendor-misc` muito grande (253ms de parse/execução).

**Solução:**
```javascript
// vite.config.js - manualChunks otimizado
// ✅ Separação granular de dependências:
- hypertune (feature flags)
- xml-parser (RSS/sitemap)
- esbuild-runtime (build tools)
- glob-utils (file matching)
- prop-types (validação)
```

**Impacto Esperado:**
- ⬇️ Chunks menores < 100KB cada
- ⬆️ Melhor cache de longo prazo
- ✅ Carregamento paralelo otimizado

**Arquivo:** `vite.config.js` (linhas 247-267)

---

### 3. Lazy Loading do Framer Motion 🎨

**Problema:** Framer Motion (biblioteca pesada de animações) carregada em 34+ componentes, bloqueando thread principal.

**Solução:**
```javascript
// src/utils/lazyMotion.js
// ✅ Dynamic import com cache
// ✅ Preload em requestIdleCallback
// ✅ Compartilhamento de instância entre componentes
```

**Uso:**
```javascript
import { loadFramerMotion } from '@/utils/lazyMotion';

const MyComponent = () => {
  const [Motion, setMotion] = useState(null);
  
  useEffect(() => {
    loadFramerMotion().then(({ motion }) => setMotion(() => motion));
  }, []);
  
  if (!Motion) return <SimpleCSS />;
  return <Motion.div>...</Motion.div>;
};
```

**Impacto Esperado:**
- ⬇️ Redução de ~150KB no bundle inicial
- ⬇️ Redução de ~200ms em parse/execução
- ✅ Framer Motion só carrega quando necessário

**Arquivos:** `src/utils/lazyMotion.js`

---

### 4. Performance Monitoring - Long Tasks 📊

**Problema:** Sem visibilidade de tarefas longas em produção.

**Solução:**
```javascript
// src/utils/performanceMonitor.js
// ✅ PerformanceObserver para longtask
// ✅ Tracking de TBT em tempo real
// ✅ Alertas para tarefas > 50ms
// ✅ Integração com Google Analytics
```

**Métricas Monitoradas:**
- Long Tasks (> 50ms)
- Total Blocking Time
- Web Vitals (LCP, FID, INP, CLS, FCP, TTFB)
- Resource Loading (scripts, images, CSS)
- Healthcare Compliance

**Console Output:**
```
⚠️ Long Task detected: 253.45ms
  blockingTime: 203.45ms
  attribution: vendor-misc-Datc-lkf.js
```

**Arquivo:** `src/utils/performanceMonitor.js` (linhas 126-151)

---

### 5. Web Worker para Processamento de Imagens 🖼️

**Problema:** Processamento de imagens bloqueando thread principal.

**Solução:**
```javascript
// public/image-worker.js + src/utils/imageWorkerManager.js
// ✅ Web Worker dedicado para:
//   - Otimização de imagens
//   - Validação de tamanho
//   - Batch processing
// ✅ Não bloqueia UI
```

**Uso:**
```javascript
import { imageWorkerManager } from '@/utils/imageWorkerManager';

const optimized = await imageWorkerManager.optimizeImage({
  src: '/img/hero.avif',
  width: 1920,
  height: 1080,
  quality: 0.8
});
```

**Impacto Esperado:**
- ⬇️ Zero bloqueio da thread principal para processamento
- ✅ UI sempre responsiva
- ⚡ Processamento paralelo em background

**Arquivos:** 
- `public/image-worker.js`
- `src/utils/imageWorkerManager.js`

---

## 📈 Resultados Esperados

### Antes das Otimizações:
- 🔴 TBT: ~2000ms (20 tarefas longas)
- 🔴 Maior tarefa: 253ms
- 🔴 Lighthouse: ~60-70

### Depois das Otimizações:
- 🟢 TBT: < 200ms (< 5 tarefas longas)
- 🟢 Maior tarefa: < 100ms
- 🟢 Lighthouse: > 90

### Ganhos por Otimização:

| Otimização | TBT Reduzido | Lighthouse +Δ |
|------------|--------------|---------------|
| GTM Defer | ~1000ms | +30-40 |
| Code Split | ~300ms | +10-15 |
| Lazy Motion | ~200ms | +5-10 |
| Web Worker | ~100ms | +5 |
| **TOTAL** | **~1600ms** | **+50-70** |

---

## 🧪 Como Testar

### 1. Build de Produção:
```bash
npm run build:vite
```

### 2. Preview Local:
```bash
npm run preview
```

### 3. Lighthouse CI:
```bash
npx lighthouse http://localhost:4173 \
  --output html \
  --output-path ./lighthouse-report.html \
  --chrome-flags="--headless"
```

### 4. Verificar Long Tasks no Console:
```javascript
// Abrir DevTools → Console
window.healthcarePerformanceMonitor.getPerformanceReport()
```

Saída esperada:
```json
{
  "overallScore": 95,
  "metrics": {
    "LCP": { "value": 1800, "rating": "good" },
    "FID": { "value": 50, "rating": "good" },
    "TBT": { "value": 150, "rating": "good" }
  },
  "longTasks": [
    { "duration": 85, "attribution": "react-core" }
  ]
}
```

---

## 🚀 Deploy

### Checklist Pré-Deploy:
- [ ] `npm run build:vite` sem erros
- [ ] `npm run test:run` passando
- [ ] `npm run lint` sem warnings críticos
- [ ] Bundle sizes < 100KB por chunk (verificar dist/assets/)
- [ ] Performance report sem tarefas > 100ms

### Deploy para VPS:
```bash
sudo npm run deploy:quick
```

### Verificação Pós-Deploy:
```bash
curl -I https://saraivavision.com.br
# Verificar:
# - Status: 200 OK
# - Content-Encoding: gzip
# - Cache-Control headers

# Lighthouse remoto:
npx lighthouse https://saraivavision.com.br \
  --output html \
  --output-path ./lighthouse-prod.html
```

---

## 📊 Monitoramento Contínuo

### 1. Real User Monitoring (RUM):
```javascript
// Já configurado em src/utils/performanceMonitor.js
// Envia para Google Analytics automaticamente
```

### 2. Alertas:
```javascript
// Console warnings para:
// - TBT > 200ms
// - Long tasks > 50ms
// - Large resources > 500KB
```

### 3. Dashboard:
```javascript
// Acesse métricas em tempo real:
window.healthcarePerformanceMonitor.getHealthcareComplianceReport()
```

---

## 🔧 Próximos Passos (Opcional)

### Otimizações Adicionais Possíveis:

1. **Service Worker para Cache:**
   - Workbox já configurado em `vite.config.js`
   - Descomentar plugin quando estável

2. **Resource Hints Adicionais:**
   ```html
   <link rel="preload" as="script" href="/assets/react-core.js" />
   <link rel="prefetch" href="/assets/motion.js" />
   ```

3. **HTTP/2 Server Push (Nginx):**
   ```nginx
   http2_push /assets/react-core-[hash].js;
   http2_push /assets/index-[hash].css;
   ```

4. **Image CDN:**
   - Cloudflare Images
   - Imgix
   - CloudFront

---

## 📚 Referências

- [Web Vitals](https://web.dev/vitals/)
- [Long Tasks API](https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API)
- [Code Splitting (Vite)](https://vitejs.dev/guide/build.html#chunking-strategy)
- [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)

---

**Documentação atualizada:** 06 de Outubro de 2025  
**Versão:** 2.0.1  
**Autor:** Sistema de Otimização de Performance
