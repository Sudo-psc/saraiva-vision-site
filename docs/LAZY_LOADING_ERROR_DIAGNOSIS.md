# 🔍 Diagnóstico e Correção: "Importing a module script failed"

**Data**: 2025-09-29
**Status**: ⚠️ CRÍTICO - Cache inconsistente causando falhas de lazy loading
**Impacto**: Usuários com cache antigo não conseguem carregar rotas lazy

---

## 📊 Análise dos Logs de Erro

### Stack Trace Real
```
[Error] Lazy loading error: – TypeError: Importing a module script failed.

Assets Afetados:
- /assets/index-BvKCbAvF.js ← Build ANTIGO (não existe mais)
- /assets/router-Cf2KnVCI.js
- /assets/react-vendor-C1qdJj9P.js
```

### 🎯 Causa Raiz Confirmada

**CACHE INCONSISTENTE** - Deploy parcial ou cache desatualizado

**Evidência**:
- ❌ Erro menciona: `index-BvKCbAvF.js` (build antigo)
- ✅ Produção tem apenas: `index-Ct4Rw6XG.js` (build atual)
- ✅ HTML em produção referencia: `index-Ct4Rw6XG.js` (correto)

**Conclusão**: Usuários estão com HTML antigo em cache de navegador/CDN que referencia chunks que foram deletados em deploy posterior.

---

## 🔥 Lista Priorizada de Causas

### 1. ⭐ CACHE DE NAVEGADOR/CDN (CONFIRMADO)
**Probabilidade**: 95%
**Impacto**: Alto
**Verificação**:
```bash
# No navegador do usuário
DevTools > Application > Storage > Clear site data
DevTools > Network > Disable cache (checkbox)
Hard refresh: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
```

**Evidência**:
- HTML antigo (`index-BvKCbAvF.js`) sendo servido
- Chunks antigos não existem mais no servidor
- Build atual usa hashes diferentes

### 2. 🔴 NGINX CACHE HEADERS INADEQUADOS
**Probabilidade**: 80%
**Impacto**: Médio
**Verificação**:
```bash
curl -I https://saraivavision.com.br/ | grep -E "(Cache-Control|ETag)"
curl -I https://saraivavision.com.br/assets/index-Ct4Rw6XG.js | grep Cache-Control
```

**Problema Identificado**:
```nginx
# HTML com cache de 1 hora
expires 1h;
add_header Cache-Control "max-age=3600";
```

**Risco**: HTML fica em cache e referencia chunks antigos após novo deploy.

### 3. 🟡 SERVICE WORKER ANTIGO
**Probabilidade**: 60%
**Impacto**: Alto
**Verificação**:
```bash
# No navegador
chrome://serviceworker-internals
DevTools > Application > Service Workers > Unregister
```

**Código Atual**: Workbox plugin desabilitado em `vite.config.js:18`
```javascript
// Workbox plugin disabled for stable deployment
```

### 4. 🟢 DEPLOY PARCIAL/RACE CONDITION
**Probabilidade**: 40%
**Impacto**: Médio
**Verificação**:
```bash
# Verificar se todos chunks foram copiados
ls -lh /var/www/html/assets/*.js
diff -r dist/assets/ /var/www/html/assets/
```

---

## ✅ Checklist de Diagnóstico

### A. Validação de Headers (Produção)
```bash
# 1. Testar HTML headers
curl -sI https://saraivavision.com.br/ | grep -E "(Cache-Control|ETag|Last-Modified|Expires|Content-Type)"

# 2. Testar JS bundle headers
curl -sI https://saraivavision.com.br/assets/index-Ct4Rw6XG.js | grep -E "(Cache-Control|Content-Type|Content-Encoding|Access-Control)"

# 3. Testar chunk inexistente (deve retornar 404)
curl -I https://saraivavision.com.br/assets/index-BvKCbAvF.js

# 4. Verificar CORS
curl -I -X OPTIONS https://saraivavision.com.br/assets/index-Ct4Rw6XG.js \
  -H "Origin: https://saraivavision.com.br" \
  -H "Access-Control-Request-Method: GET"
```

### B. Verificação de DevTools
```
1. Abrir: https://saraivavision.com.br/blog
2. DevTools > Network > Filter: JS
3. Hard refresh (Ctrl+Shift+R)
4. Verificar:
   ✅ Status 200 para todos *.js
   ✅ Content-Type: application/javascript
   ✅ Sem erros CORS
   ✅ Content-Encoding: gzip ou br
```

### C. Validação de Arquivos
```bash
# SSH no VPS
ssh root@31.97.129.78

# Verificar arquivos deployados
ls -lh /var/www/html/assets/*.js | grep index
cat /var/www/html/index.html | grep -o 'index-[^"]*\.js'

# Comparar com build local
diff /var/www/html/index.html dist/index.html
```

### D. Teste de Fallback/Retry
```
1. Abrir: https://saraivavision.com.br/blog
2. DevTools > Network > Throttling: Slow 3G
3. Hard refresh
4. Verificar:
   ✅ Fallback UI aparece ("Carregando página...")
   ✅ Retry automático funciona (3 tentativas)
   ✅ ErrorBoundary mostra UI amigável após falhas
```

---

## 🛠 Correções Propostas

### 1. NGINX - Cache Headers Otimizados

**Problema**: HTML com cache longo (1h) pode referenciar chunks antigos

**Solução**: Cache agressivo para assets, zero cache para HTML

```nginx
# /etc/nginx/sites-available/saraivavision

server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;

    root /var/www/html;
    index index.html;

    # ============================================================
    # CRITICAL: HTML sem cache (SPA entry point)
    # ============================================================
    location = / {
        try_files /index.html =404;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    location = /index.html {
        try_files /index.html =404;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # ============================================================
    # STATIC ASSETS: Cache imutável com hash
    # ============================================================
    location ~* ^/assets/.*\.(js|mjs|css|woff2?|ttf|eot|otf)$ {
        # Apenas arquivos que existem (evita fallback para HTML)
        try_files $uri =404;

        # MIME types corretos
        types {
            application/javascript js mjs;
            text/css css;
            font/woff2 woff2;
            font/woff woff;
            font/ttf ttf;
            font/eot eot;
            font/otf otf;
        }

        # Cache agressivo (1 ano) - arquivos com hash são imutáveis
        expires 1y;
        add_header Cache-Control "public, immutable, max-age=31536000";

        # CORS para chunks dinâmicos
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept";

        # Vary para compressão
        add_header Vary "Accept-Encoding";

        # Gzip
        gzip_static on;
        gzip_vary on;

        access_log off;
    }

    # ============================================================
    # IMAGES E OUTROS ASSETS
    # ============================================================
    location ~* \.(png|jpg|jpeg|gif|webp|avif|svg|ico)$ {
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
        gzip_static on;
    }

    # ============================================================
    # SPA ROUTING: Fallback apenas para navegação HTML
    # ============================================================
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # ============================================================
    # CSP E SECURITY HEADERS
    # ============================================================
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # CSP: permitir scripts do próprio domínio e CDNs confiáveis
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.pulse.is; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://cdn.pulse.is wss://lc.pulse.is https://*.supabase.co https://cms.saraivavision.com.br https://maps.googleapis.com; frame-src 'self' https://www.google.com; worker-src 'self' blob:; object-src 'none'; upgrade-insecure-requests;" always;
}
```

### 2. Vite Config - Build Manifest

**Adicionar manifest.json para mapeamento de chunks**

```javascript
// vite.config.js
export default defineConfig({
  build: {
    outDir: 'dist',
    manifest: true, // ← ADICIONAR: Gera manifest.json
    sourcemap: false,
    rollupOptions: {
      output: {
        // Garantir hashes consistentes
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
```

### 3. Service Worker - Cleanup

**Criar SW que limpa caches antigos**

```javascript
// public/sw.js
const CACHE_VERSION = 'v2025-09-29'; // Atualizar em cada deploy
const CACHE_NAME = `saraivavision-${CACHE_VERSION}`;

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('saraivavision-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
});

// Estratégia: Network-first para HTML, Cache-first para assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // HTML: sempre buscar da rede
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Assets com hash: cache-first (imutáveis)
  if (url.pathname.includes('/assets/') && /\-[a-f0-9]{8,}\.(js|css)/.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // Default: network-first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
```

### 4. ErrorBoundary - Retry Melhorado

**Já implementado em `src/utils/lazyLoading.jsx`** ✅

Funcionalidades existentes:
- ✅ Retry automático com backoff exponencial (3 tentativas)
- ✅ ErrorBoundary com detecção de chunk errors
- ✅ UI amigável com botão "Tentar Novamente"
- ✅ Logging centralizado via `errorTracker.js`

**Melhoria Adicional**: Forçar reload de cache após falha

```javascript
// src/utils/lazyLoading.jsx (linha 75-90)
// ADICIONAR após 3 falhas de retry:

if (error && retryCount >= retries) {
  // Limpar cache de Service Worker antes de mostrar erro
  if ('serviceWorker' in navigator && 'caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
      console.log('Cache cleared after chunk load failure');
    });
  }

  return (
    <div className="w-full py-20 text-center">
      {/* UI existente */}
      <button
        onClick={() => {
          // Forçar reload sem cache
          window.location.href = window.location.href + '?nocache=' + Date.now();
        }}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Recarregar com Cache Limpo
      </button>
    </div>
  );
}
```

---

## 🚀 Plano de Deploy

### Fase 1: Correção Nginx (Zero Downtime)
```bash
# 1. SSH no VPS
ssh root@31.97.129.78

# 2. Backup config atual
sudo cp /etc/nginx/sites-available/saraivavision \
       /etc/nginx/sites-available/saraivavision.backup.$(date +%Y%m%d_%H%M%S)

# 3. Editar configuração
sudo nano /etc/nginx/sites-available/saraivavision
# Colar nova configuração acima

# 4. Testar sintaxe
sudo nginx -t

# 5. Se OK, reload (zero downtime)
sudo systemctl reload nginx

# 6. Verificar
curl -I https://saraivavision.com.br/ | grep Cache-Control
# Esperado: "no-store, no-cache, must-revalidate"
```

### Fase 2: Purge de Cache (Imediato)
```bash
# Cloudflare (se usado)
# Dashboard > Caching > Purge Everything

# CDN manual
curl -X PURGE https://saraivavision.com.br/

# Usuários: Instruir hard refresh
# Chrome/Edge: Ctrl+Shift+R
# Firefox: Ctrl+Shift+R
# Safari: Cmd+Option+R
```

### Fase 3: Build com Manifest (Próximo Deploy)
```bash
# Local
git pull origin external-wordpress

# Editar vite.config.js (adicionar manifest: true)
npm run build

# Verificar manifest gerado
cat dist/.vite/manifest.json

# Deploy
sshpass -p 'senha' ssh root@31.97.129.78 'rm -rf /var/www/html/*'
sshpass -p 'senha' scp -r dist/* root@31.97.129.78:/var/www/html/
```

---

## ✅ Validação Pós-Deploy

### Teste Imediato (0-30 min)
```bash
# 1. Limpar cache local
DevTools > Application > Clear storage > Clear site data

# 2. Hard refresh
Ctrl+Shift+R (3x para garantir)

# 3. Testar rotas lazy
https://saraivavision.com.br/blog
https://saraivavision.com.br/servicos
https://saraivavision.com.br/sobre

# 4. Verificar Network tab
✅ Todos *.js retornam 200
✅ Content-Type: application/javascript
✅ Cache-Control correto (immutable para assets, no-cache para HTML)
✅ Sem erros de console

# 5. Testar fallback
DevTools > Network > Throttling: Slow 3G
Hard refresh
✅ "Carregando página..." aparece
✅ Retry automático funciona
✅ Página carrega após retry
```

### Teste de Erro Forçado
```bash
# 1. Renomear chunk no servidor (simular 404)
ssh root@31.97.129.78
sudo mv /var/www/html/assets/router-Cf2KnVCI.js \
        /var/www/html/assets/router-Cf2KnVCI.js.bak

# 2. Navegar para /blog
# Esperado:
✅ Retry automático (3 tentativas)
✅ ErrorBoundary mostra "Erro ao Carregar Página"
✅ Botão "Tentar Novamente" funciona
✅ Botão "Recarregar com Cache Limpo" funciona

# 3. Restaurar chunk
sudo mv /var/www/html/assets/router-Cf2KnVCI.js.bak \
        /var/www/html/assets/router-Cf2KnVCI.js
```

### Monitoramento (24h)
```bash
# Logs de erro Nginx
sudo tail -f /var/log/nginx/saraivavision_error.log | grep "404.*\.js"

# Se encontrar 404s de chunks antigos:
# → Normal nas primeiras horas (cache de usuários)
# → Deve diminuir após 6-12h
# → Se persistir >24h, investigar CDN/proxy

# Alertas
# - Taxa de erro >1% em Analytics
# - Aumento de pageviews na página de erro
# - Reports de usuários sobre página em branco
```

---

## 🆘 Rollback

Se problemas persistirem:

```bash
# SSH no VPS
ssh root@31.97.129.78

# 1. Restaurar Nginx config
LATEST=$(ls -t /etc/nginx/sites-available/saraivavision.backup.* | head -1)
sudo cp "$LATEST" /etc/nginx/sites-available/saraivavision

# 2. Testar e reload
sudo nginx -t && sudo systemctl reload nginx

# 3. Verificar
curl -I https://saraivavision.com.br/ | grep Cache-Control
sudo systemctl status nginx
```

---

## 📊 Métricas de Sucesso

### Imediato
- ✅ 0 erros "Importing a module script failed" no console
- ✅ 100% das rotas lazy carregam em <2s
- ✅ Headers corretos (no-cache para HTML, immutable para assets)

### 24 Horas
- ✅ Taxa de erro <0.1% (Analytics)
- ✅ 0 reports de usuários sobre páginas em branco
- ✅ Nginx logs sem 404 de chunks (após 12h)

### 7 Dias
- ✅ Core Web Vitals mantidos (LCP <2.5s)
- ✅ Bounce rate estável (<40%)
- ✅ 0 incidentes de cache inconsistente

---

## 🎯 Prevenção Futura

### 1. Deploy Checklist
```
□ Build gerado com manifest: true
□ Todos assets copiados antes de HTML
□ Nginx reload após deploy
□ Purge de CDN/cache
□ Smoke test de rotas lazy
□ Monitor logs por 30 min
```

### 2. CI/CD Automation (Futuro)
```yaml
# .github/workflows/deploy.yml
steps:
  - name: Build
    run: npm run build

  - name: Verify manifest
    run: test -f dist/.vite/manifest.json

  - name: Deploy assets first
    run: rsync -av dist/assets/ vps:/var/www/html/assets/

  - name: Deploy HTML last
    run: rsync -av dist/*.html vps:/var/www/html/

  - name: Reload Nginx
    run: ssh vps "sudo systemctl reload nginx"

  - name: Purge CDN
    run: curl -X PURGE https://saraivavision.com.br/

  - name: Smoke test
    run: |
      curl -f https://saraivavision.com.br/ || exit 1
      curl -f https://saraivavision.com.br/blog || exit 1
```

### 3. Monitoring
```javascript
// src/utils/errorTracking.js
// Adicionar tracking específico para chunk errors

export function trackChunkError(chunkName, error) {
  const data = {
    type: 'chunk_load_error',
    chunk: chunkName,
    error: error.message,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    // Dados de cache
    hasServiceWorker: 'serviceWorker' in navigator,
    cacheStorage: 'caches' in window,
    connection: navigator.connection?.effectiveType || 'unknown'
  };

  // Enviar para Sentry/Bugsnag
  console.error('[Chunk Error]', data);

  // Opcional: API de logging
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(() => {});
}
```

---

## 📚 Referências

- **Vite Build Options**: https://vitejs.dev/config/build-options.html
- **Nginx Caching**: https://www.nginx.com/blog/nginx-caching-guide/
- **Service Worker Lifecycle**: https://web.dev/service-worker-lifecycle/
- **React Lazy/Suspense**: https://react.dev/reference/react/lazy
- **Error Boundaries**: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary

---

**Preparado por**: Claude Code
**Versão**: 1.0
**Status**: ✅ Pronto para implementação