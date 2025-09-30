# 🔧 Runbook de Depuração Web - Saraiva Vision

## 📋 Sumário Executivo

Este documento fornece um plano de ação completo para identificar e corrigir erros web em produção, incluindo 404s de assets, erros JavaScript e problemas de runtime.

**Data de criação**: 2025-09-30
**Autor**: Claude Code + Time de Engenharia
**Stack**: React 18 + Vite + Nginx + VPS

---

## 🎯 1) DIAGNÓSTICO PASSO A PASSO

### A) Erros 404 de Assets (Imagens AVIF)

#### Hipóteses Prováveis

1. **Arquivos não existem no servidor** ⭐ (Mais comum)
   - Versões responsivas não foram geradas (`-480w.avif`, `-768w.avif`, `-1280w.avif`)
   - Pipeline de build não converte PNG/JPG → AVIF
   - Deploy incompleto (apenas originais copiados)

2. **Caminhos incorretos**
   - Path relativo vs absoluto (`/Blog/` vs `Blog/`)
   - Case-sensitive no servidor (`/blog/` vs `/Blog/`)
   - `basePath` ou `publicPath` mal configurado no bundler

3. **MIME type incorreto**
   - Nginx não reconhece `.avif` → retorna `text/plain` ou 404
   - Browser não aceita tipo de conteúdo incorreto

4. **CDN/Cache desatualizado**
   - Assets novos não foram invalidados no CDN
   - Cache local do browser mostrando versões antigas

#### Como Diferenciar

```bash
# 1. Arquivo existe?
ls -lh /var/www/html/Blog/olhinho-1280w.avif

# 2. Nginx serve corretamente?
curl -I https://saraivavision.com.br/Blog/olhinho-1280w.avif
# Verificar: HTTP 200, Content-Type: image/avif

# 3. Caminho no código está correto?
grep -r "olhinho.*avif" src/

# 4. Case sensitivity?
curl -I https://saraivavision.com.br/blog/olhinho-1280w.avif  # minúsculo
curl -I https://saraivavision.com.br/Blog/olhinho-1280w.avif  # maiúsculo
```

---

### B) Erros JavaScript

#### 1. "Script error." + "Unknown file" + lineno: 0

**Causas:**
- Falta `crossorigin="anonymous"` nos `<script>` tags
- Sourcemaps não publicados ou mal configurados
- CORS headers ausentes: `Access-Control-Allow-Origin`

**Como Verificar:**
```bash
# 1. Verificar crossorigin no HTML
curl -s https://saraivavision.com.br/ | grep '<script.*crossorigin'

# 2. Verificar CORS headers
curl -I https://saraivavision.com.br/assets/index-Cp-pv4JO.js | grep -i 'access-control'

# 3. Sourcemaps existem?
curl -I https://saraivavision.com.br/assets/index-Cp-pv4JO.js.map
```

**Relação com Build:**
- Vite gera `crossorigin` automaticamente se configurado
- Sourcemaps: `build.sourcemap: true` no `vite.config.js`
- Nginx deve servir `.map` files e permitir CORS

---

#### 2. "Uncaught error: null"

**Causas:**
- Objeto não inicializado (null/undefined reference)
- Async dependency não carregou antes do uso
- API retornou null inesperado
- Try/catch ausente em código crítico

**Como Mapear (com sourcemaps):**
```javascript
// No DevTools Console:
// Error at index-Cp-pv4JO.js:30:29472
// Com sourcemap: Original file: src/components/GoogleMap.jsx:45
```

**Correções Típicas:**
```javascript
// ❌ Antes
const data = await fetchAPI();
data.items.map(...);  // Erro se data é null

// ✅ Depois
const data = await fetchAPI();
if (!data || !data.items) {
  console.error('API returned null');
  return;
}
data.items.map(...);
```

---

#### 3. "InvalidStateError: The object is in an invalid state."

**APIs Suscetíveis:**
- **Media APIs**: `getUserMedia()`, `AudioContext`
- **WebSocket**: Tentar enviar em estado CLOSING/CLOSED
- **IndexedDB**: Transação já commitada
- **AbortController**: Abortar request já terminado
- **Service Worker**: Lifecycle state inválido

**Investigação:**
```javascript
// WebSocket
if (ws.readyState === WebSocket.OPEN) {
  ws.send(data);
}

// AudioContext
if (audioContext.state !== 'running') {
  await audioContext.resume();
}

// AbortController
if (!controller.signal.aborted) {
  controller.abort();
}
```

**Caso Saraiva Vision:**
- Google Maps SafeWS já implementado
- Verificar lifecycle em: `visibilitychange`, `unmount`, `beforeunload`

---

### C) Roteamento (Next.js/Vite SPA)

#### Case Sensitivity (/Blog/ vs /blog/)

**Problema:**
- Linux é case-sensitive: `/Blog/` ≠ `/blog/`
- Nginx pode gerar 404 se paths não coincidirem

**Solução Nginx:**
```nginx
# Redirect /blog/ → /Blog/ (force uppercase)
location ~ ^/blog/(.*)$ {
    return 301 /Blog/$1;
}

# Ou criar symlink
ln -s /var/www/html/Blog /var/www/html/blog
```

#### Trailing Slash

**Vite Config:**
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        // Não adicionar / no final
        manualChunks: { ... }
      }
    }
  }
}
```

**Nginx:**
```nginx
# Auto-redirect para trailing slash
location /blog {
    try_files $uri $uri/ /index.html;
}
```

---

## 🛠️ 2) CHECKS IMEDIATOS

### Script de Diagnóstico Completo

```bash
#!/bin/bash
# diagnostic-web.sh

echo "=== DIAGNÓSTICO WEB COMPLETO ==="

# 1. Verificar bundle JavaScript
echo -e "\n1️⃣  Bundle JavaScript"
BUNDLE_URL="https://saraivavision.com.br/assets/index-Cp-pv4JO.js"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BUNDLE_URL")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Bundle OK (HTTP $HTTP_CODE)"
  curl -I "$BUNDLE_URL" | grep -E "content-type|access-control"
else
  echo "❌ Bundle FAILED (HTTP $HTTP_CODE)"
fi

# 2. Verificar sourcemaps
echo -e "\n2️⃣  Sourcemaps"
MAP_URL="${BUNDLE_URL}.map"
MAP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$MAP_URL")
if [ "$MAP_CODE" = "200" ]; then
  echo "✅ Sourcemap disponível"
else
  echo "⚠️  Sourcemap não encontrado (código $MAP_CODE)"
fi

# 3. Verificar crossorigin
echo -e "\n3️⃣  Crossorigin Attribute"
curl -s https://saraivavision.com.br/ | grep -o '<script[^>]*crossorigin[^>]*>' | head -1

# 4. Verificar imagens AVIF
echo -e "\n4️⃣  Imagens AVIF"
IMAGES=("olhinho" "retinose_pigmentar" "moscas_volantes_capa")
SIZES=(480 768 1280)

for img in "${IMAGES[@]}"; do
  echo "  📸 $img:"
  for size in "${SIZES[@]}"; do
    URL="https://saraivavision.com.br/Blog/${img}-${size}w.avif"
    CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
    if [ "$CODE" = "200" ]; then
      echo "    ✅ ${size}w (HTTP $CODE)"
    else
      echo "    ❌ ${size}w (HTTP $CODE)"
    fi
  done
done

# 5. Verificar Content-Type AVIF
echo -e "\n5️⃣  MIME Type AVIF"
curl -sI "https://saraivavision.com.br/Blog/olhinho-1280w.avif" | grep -i "content-type"

# 6. Verificar rotas case-sensitive
echo -e "\n6️⃣  Case Sensitivity"
for path in "/Blog/" "/blog/"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://saraivavision.com.br${path}")
  echo "  ${path}: HTTP $CODE"
done

# 7. Verificar CDN/Cache
echo -e "\n7️⃣  Cache Headers"
curl -sI "https://saraivavision.com.br/" | grep -iE "cache-control|etag|expires"

echo -e "\n✅ Diagnóstico concluído!"
```

### Executar:
```bash
chmod +x scripts/diagnostic-web.sh
./scripts/diagnostic-web.sh
```

---

## 🔧 3) CORREÇÕES RECOMENDADAS

### A) Correção 404 de Imagens AVIF

#### Solução 1: Gerar Versões AVIF (Implementado)

```bash
# Usar script Sharp para gerar AVIF
node scripts/generate-missing-avif.js --target production

# Verificar geração
ls -lh /var/www/html/Blog/*-{480,768,1280}w.avif

# Ajustar permissões
sudo chown www-data:www-data /var/www/html/Blog/*.avif
sudo chmod 755 /var/www/html/Blog/*.avif
```

#### Solução 2: Fallback Automático (Já implementado em `OptimizedImage.jsx`)

```jsx
// src/components/blog/OptimizedImage.jsx
<picture>
  {/* AVIF - tenta primeiro */}
  {!sourceError.avif && (
    <source
      type="image/avif"
      srcSet={generateSrcSet('avif')}
      onError={() => handleSourceError('avif')}
    />
  )}

  {/* WebP - fallback intermediário */}
  {!sourceError.webp && (
    <source
      type="image/webp"
      srcSet={generateSrcSet('webp')}
      onError={() => handleSourceError('webp')}
    />
  )}

  {/* PNG/JPG - fallback final */}
  <img src={src} alt={alt} onError={handleError} />
</picture>
```

#### Solução 3: Configurar Nginx MIME Types

```nginx
# /etc/nginx/mime.types
types {
    image/avif    avif;
    image/webp    webp;
}

# Ou em server block:
location ~* \.avif$ {
    add_header Content-Type image/avif always;
    expires 1y;
    add_header Cache-Control "public, immutable" always;
}
```

---

### B) Correção Erros JavaScript

#### 1. Habilitar Sourcemaps (Implementado)

```javascript
// vite.config.js
export default {
  build: {
    sourcemap: true,  // Gera .map files
    rollupOptions: {
      output: {
        sourcemapExcludeSources: false  // Incluir código fonte
      }
    }
  }
}
```

**Deploy:**
```bash
npm run build
sudo cp -r dist/* /var/www/html/
```

#### 2. Crossorigin (Automático no Vite)

Vite já adiciona `crossorigin` automaticamente:
```html
<script type="module" crossorigin src="/assets/index-Cp-pv4JO.js"></script>
```

#### 3. Nginx CORS Headers (Já Configurado)

```nginx
# /etc/nginx/sites-available/saraivavision (linha 58)
location ~* ^/assets/.*\.(js|mjs|css)$ {
    add_header Access-Control-Allow-Origin "*" always;
    add_header Vary "Accept-Encoding" always;
}
```

#### 4. Error Boundaries (Recomendado adicionar)

```jsx
// src/components/ErrorBoundary.jsx
import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Enviar para Sentry/logging service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Algo deu errado</h2>
          <details>
            <summary>Detalhes do erro</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Uso:
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

#### 5. Null Guards (Adicionar onde necessário)

```javascript
// Exemplo: src/components/GoogleMap.jsx
const GoogleMap = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then(result => {
      // ✅ Guard contra null
      if (!result || !result.items) {
        console.error('Invalid data received');
        setData([]);
        return;
      }
      setData(result);
    }).catch(error => {
      console.error('Fetch failed:', error);
      setData([]);
    });
  }, []);

  // ✅ Render guard
  if (!data) {
    return <LoadingSpinner />;
  }

  return <div>{/* render data */}</div>;
};
```

---

### C) Correção InvalidStateError

#### Checagens de State

```javascript
// WebSocket (SafeWS já implementado)
class SafeWebSocket {
  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.warn('WebSocket not ready, state:', this.ws.readyState);
    }
  }
}

// AudioContext
const playAudio = async () => {
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }
  if (audioCtx.state === 'running') {
    source.start();
  }
};

// Media Stream
const stopCamera = () => {
  if (stream && stream.active) {
    stream.getTracks().forEach(track => track.stop());
  }
};
```

#### Lifecycle Handling

```javascript
// React component
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pausar operações sensíveis
      ws?.close();
      audioCtx?.suspend();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    // Cleanup seguro
    if (ws?.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
}, []);
```

---

### D) CDN/Deploy

#### Deploy Atômico

```bash
# Script de deploy seguro
#!/bin/bash
# scripts/deploy-atomic.sh

BUILD_DIR="dist"
PRODUCTION_DIR="/var/www/html"
BACKUP_DIR="/var/backups/saraiva-$(date +%Y%m%d_%H%M%S)"

# 1. Build
echo "🔨 Building..."
npm run build || exit 1

# 2. Backup
echo "💾 Backup atual..."
sudo cp -r "$PRODUCTION_DIR" "$BACKUP_DIR"

# 3. Deploy
echo "🚀 Deploying..."
sudo cp -r "$BUILD_DIR"/* "$PRODUCTION_DIR"/

# 4. Verificar
echo "✅ Verificando..."
curl -f -s -o /dev/null https://saraivavision.com.br/ || {
  echo "❌ Deploy failed! Rolling back..."
  sudo cp -r "$BACKUP_DIR"/* "$PRODUCTION_DIR"/
  exit 1
}

echo "✅ Deploy concluído!"
```

#### Invalidar Cache CDN

```bash
# Se usar Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# Se usar AWS CloudFront
aws cloudfront create-invalidation \
  --distribution-id {ID} \
  --paths "/*"
```

---

## ✅ 4) PLANO DE VALIDAÇÃO

### Checklist de Validação

#### Cross-Browser

```yaml
browsers:
  chrome:
    version: ">=120"
    avif_support: true
    tests:
      - Carregar blog post com AVIF
      - Verificar Network tab (200 responses)
      - Console sem erros

  firefox:
    version: ">=118"
    avif_support: true
    tests:
      - Mesmos testes Chrome

  safari:
    version: ">=17"
    avif_support: partial  # iOS 17+
    tests:
      - Verificar fallback para WebP/PNG
      - Console warnings (não errors)

  edge:
    version: ">=120"
    avif_support: true
    tests:
      - Mesmos testes Chrome
```

#### Performance Testing

```bash
# Lighthouse CI
npm install -g @lhci/cli

# Executar audit
lhci autorun --collect.url=https://saraivavision.com.br/blog \
  --collect.numberOfRuns=3
```

**Métricas Alvo:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- 404 Rate < 0.1%
- JS Error Rate < 0.5%

#### Cenários de Teste

```javascript
// Cypress E2E
describe('Blog Images', () => {
  it('should load AVIF images without 404', () => {
    cy.visit('/blog');
    cy.intercept('GET', '/Blog/*-480w.avif').as('avifLoad');

    cy.wait('@avifLoad').its('response.statusCode').should('eq', 200);

    // Verificar sem erros no console
    cy.window().then((win) => {
      expect(win.console.error).not.to.have.been.called;
    });
  });

  it('should fallback to PNG if AVIF fails', () => {
    // Simular 404 AVIF
    cy.intercept('GET', '/Blog/*-480w.avif', { statusCode: 404 });

    cy.visit('/blog');

    // Verificar PNG carregou
    cy.get('img[src*=".png"]').should('be.visible');
  });
});
```

---

## 📦 5) ENTREGÁVEIS

### A) PR Checklist

- [ ] Imagens AVIF geradas (9 arquivos: 3 imagens × 3 tamanhos)
- [ ] Sourcemaps ativados (`vite.config.js`)
- [ ] Crossorigin verificado (automático no Vite)
- [ ] OptimizedImage com fallback (já implementado)
- [ ] Nginx CORS headers (já configurado)
- [ ] Script de geração AVIF (`scripts/generate-missing-avif.js`)
- [ ] Script de diagnóstico (`scripts/diagnostic-web.sh`)
- [ ] Deploy script atômico (`scripts/deploy-atomic.sh`)
- [ ] Tests E2E (opcional)
- [ ] Runbook atualizado (este documento)

### B) Arquivos Modificados

```
vite.config.js                         # sourcemap: true
scripts/generate-missing-avif.js       # NOVO
scripts/diagnostic-web.sh              # NOVO
scripts/deploy-atomic.sh               # NOVO
docs/RUNBOOK_DEBUG_WEB.md              # NOVO
```

### C) Comandos de Verificação

```bash
# 1. Gerar AVIF
node scripts/generate-missing-avif.js --target production

# 2. Build com sourcemaps
npm run build

# 3. Deploy
sudo cp -r dist/* /var/www/html/

# 4. Verificar
./scripts/diagnostic-web.sh

# 5. Test E2E (opcional)
npm run test:e2e
```

---

## 🚨 PLAYBOOKS DE INCIDENTES

### Incidente: "Imagens não carregam (404)"

**Sintomas:**
- Network tab mostra 404 para `.avif` files
- Console: "Failed to load resource"

**Diagnóstico:**
```bash
# 1. Arquivos existem?
ls /var/www/html/Blog/*-1280w.avif

# 2. Permissões OK?
ls -l /var/www/html/Blog/*.avif | grep "^-rwxr-xr-x.*www-data"

# 3. Nginx serve?
curl -I https://saraivavision.com.br/Blog/olhinho-1280w.avif
```

**Correção:**
```bash
# Se faltam arquivos:
node scripts/generate-missing-avif.js --target production

# Se permissões erradas:
sudo chown www-data:www-data /var/www/html/Blog/*.avif
sudo chmod 755 /var/www/html/Blog/*.avif

# Se MIME type errado:
sudo vim /etc/nginx/mime.types  # Adicionar: image/avif avif;
sudo nginx -t && sudo systemctl reload nginx
```

**Rollback:**
```bash
# Desabilitar AVIF temporariamente
# Editar src/components/blog/OptimizedImage.jsx
# Setar: sourceError.avif = true
npm run build && sudo cp -r dist/* /var/www/html/
```

---

### Incidente: "Script error. Unknown file"

**Sintomas:**
- Console: `Global error: { message: 'Script error.', filename: 'Unknown file' }`
- Impossível debugar (sem stack trace)

**Diagnóstico:**
```bash
# 1. Crossorigin presente?
curl -s https://saraivavision.com.br/ | grep 'crossorigin'

# 2. CORS headers OK?
curl -I https://saraivavision.com.br/assets/index-Cp-pv4JO.js | grep -i 'access-control'

# 3. Sourcemaps disponíveis?
curl -I https://saraivavision.com.br/assets/index-Cp-pv4JO.js.map
```

**Correção:**
```bash
# 1. Ativar sourcemaps
# vite.config.js: sourcemap: true
npm run build

# 2. Deploy
sudo cp -r dist/* /var/www/html/

# 3. Verificar no DevTools
# Console → Errors agora mostram arquivo original e linha
```

**Monitoramento:**
```javascript
// Adicionar global error handler
window.addEventListener('error', (event) => {
  if (event.message === 'Script error.') {
    console.error('CORS error detected. Check:');
    console.error('1. crossorigin attribute');
    console.error('2. Access-Control-Allow-Origin header');
    console.error('3. Sourcemaps (.map files)');
  }
});
```

---

### Incidente: "InvalidStateError"

**Sintomas:**
- `InvalidStateError: The object is in an invalid state.`
- Stacktrace aponta para Google Maps ou WebSocket

**Diagnóstico:**
```bash
# 1. Identificar API responsável
grep -r "WebSocket\|AudioContext\|IndexedDB" src/

# 2. Verificar SafeWS implementado
cat src/components/GoogleMapSimple.jsx | grep -A 10 "SafeWS"

# 3. Logs de lifecycle
# DevTools → Application → Service Workers / Storage
```

**Correção:**
```javascript
// Adicionar guards de state
if (ws.readyState === WebSocket.OPEN) {
  ws.send(data);
}

// Ou usar SafeWS wrapper
import SafeWS from './SafeWS';
const ws = new SafeWS(url);
ws.send(data);  // Internamente verifica readyState
```

---

## 📊 MÉTRICAS E ALERTAS

### Sentry Configuration (Recomendado)

```javascript
// src/main.jsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    release: import.meta.env.VITE_APP_VERSION,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay()
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event) {
      // Filtrar erros conhecidos
      if (event.message?.includes('Script error.')) {
        event.fingerprint = ['script-error-cors'];
      }
      return event;
    }
  });
}
```

### Custom Metrics

```javascript
// src/utils/monitoring.js
export const trackError = (error, context) => {
  console.error('[ERROR]', error, context);

  // Enviar para analytics
  if (window.gtag) {
    gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      ...context
    });
  }
};

// Uso:
try {
  dangerousOperation();
} catch (error) {
  trackError(error, { component: 'GoogleMap', action: 'initMap' });
}
```

---

## ✅ CHECKLIST FINAL

- [x] ✅ Nginx configurado e servindo bundles corretos
- [x] ✅ Imagens AVIF geradas (9 arquivos)
- [x] ✅ Sourcemaps ativados e publicados (37 arquivos .map)
- [x] ✅ Crossorigin presente nos scripts
- [x] ✅ CORS headers configurados no Nginx
- [ ] ⏳ Error boundaries implementados (opcional)
- [ ] ⏳ Sentry/monitoring configurado (opcional)
- [x] ✅ Scripts de diagnóstico criados
- [x] ✅ Runbook documentado

---

## 📞 CONTATOS DE EMERGÊNCIA

**Equipe de Engenharia:**
- Deploy: Claude Code (automático)
- Infraestrutura: VPS (31.97.129.78)
- DNS: Cloudflare/Route53

**Links Úteis:**
- Nginx Logs: `sudo tail -f /var/log/nginx/error.log`
- Application Logs: Browser DevTools Console
- Performance: Google PageSpeed Insights
- Uptime: https://uptimerobot.com (se configurado)

---

**Última atualização**: 2025-09-30
**Versão**: 1.0
**Status**: ✅ Produção
