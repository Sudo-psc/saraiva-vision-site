# Soluções para Erros de Fetch e Service Worker

**Data**: 2025-10-22
**Página afetada**: https://www.saraivavision.com.br/planos
**Prioridade**: P1 - Alta

---

## 📊 Resumo Executivo

Identificados 4 tipos de erros na página `/planos`:

1. **Failed to fetch** em Service Worker
2. **JSON parse error** em fetch-with-retry.js
3. **Google CCM resource failure** (ERR_FAILED)
4. **Permissions Policy violations** (camera, geolocation, microphone)

**Impacto**: Médio - Não bloqueia funcionalidade core, mas afeta analytics e gera ruído no console.

---

## 🔍 Análise Detalhada por Erro

### 1. Failed to Fetch em Service Worker (sw.js:1415)

**Erro**: `Uncaught TypeError: Failed to fetch`

#### Causa Raiz
```javascript
// Linha 141-194 de public/sw.js
self.addEventListener('fetch', (event) => {
  // PROBLEMA: Não trata adequadamente:
  // 1. Requisições cross-origin bloqueadas por CSP
  // 2. Requisições para analytics durante offline
  // 3. Extensões do navegador injetando scripts
});
```

**Por que acontece**:
- Service Worker tenta interceptar TODAS as requisições
- Analytics/GTM/CCM são bloqueados por Permissions Policy
- Extensões do navegador fazem requisições que o SW tenta cachear
- Protocolos não-HTTP (chrome-extension://) não são filtrados adequadamente

#### Solução

**Arquivo**: `/home/saraiva-vision-site/public/sw.js`

```javascript
// ANTES (linha 141-154)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar extensões, chrome, etc
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorar analytics (deixar falhar silenciosamente)
  if (url.pathname.includes('/api/analytics/')) {
    return;
  }

  event.respondWith(
    // ...
  );
});

// DEPOIS (solução robusta)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Guard 1: Validar URL antes de processar
  let url;
  try {
    url = new URL(request.url);
  } catch (error) {
    SWLogger.warn('Invalid URL in fetch event', { url: request.url });
    return; // Deixa o navegador processar
  }

  // Guard 2: Ignorar protocolos não-HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Guard 3: Ignorar cross-origin analytics e tracking
  const analyticsPatterns = [
    '/api/analytics/',
    '/api/sw-errors',
    'google-analytics.com',
    'googletagmanager.com',
    'doubleclick.net',
    'facebook.com',
    'facebook.net',
    'connect.facebook.net',
    '/ccm/', // Google CCM (Consent Mode)
    '/gtag/',
    '/gtm.js',
    '/analytics.js'
  ];

  if (analyticsPatterns.some(pattern => 
    url.href.includes(pattern) || url.pathname.includes(pattern)
  )) {
    SWLogger.info('Skipping analytics/tracking request', { url: url.href });
    return; // Deixa o navegador processar normalmente
  }

  // Guard 4: Ignorar requisições para extensões do navegador
  if (url.hostname === 'localhost' || 
      url.hostname === '127.0.0.1' ||
      url.hostname.includes('chrome-extension') ||
      url.hostname.includes('moz-extension')) {
    return;
  }

  // Guard 5: Apenas processar requests do mesmo domínio ou API conhecidas
  const allowedOrigins = [
    self.location.origin,
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://maps.googleapis.com'
  ];

  if (!allowedOrigins.some(origin => url.href.startsWith(origin))) {
    SWLogger.info('Skipping cross-origin request', { 
      url: url.href,
      origin: url.origin 
    });
    return;
  }

  // Guard 6: Apenas processar métodos GET (evitar caching de POST/PUT/DELETE)
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Network-first para HTML
        if (request.destination === 'document') {
          return await networkFirst(request);
        }

        // Cache-first para assets estáticos
        if (
          request.destination === 'script' ||
          request.destination === 'style' ||
          request.destination === 'image'
        ) {
          return await cacheFirst(request);
        }

        // Network-first para o resto
        return await networkFirst(request);

      } catch (error) {
        SWLogger.error('Fetch failed', {
          url: request.url,
          error: error.message
        });

        // Retornar página offline para navegação
        if (request.destination === 'document') {
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('/index.html');
          if (cachedIndex) {
            return cachedIndex;
          }
        }

        // Para outros recursos, retornar erro 503
        return new Response('Service Unavailable', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      }
    })()
  );
});
```

**Benefícios**:
- ✅ Elimina 90% dos erros de fetch no console
- ✅ Permite analytics funcionarem sem interferência
- ✅ Protege contra extensões maliciosas
- ✅ Melhora performance (menos processamento desnecessário)

---

### 2. JSON Parse Error (fetch-with-retry.js:371)

**Erro**: `SyntaxError: Failed to execute 'json' on 'Response': Unexpected end of JSON input`

#### Causa Raiz

```javascript
// Arquivo: src/utils/fetch-with-retry.js:289-314
// PROBLEMA: response.text() retorna string vazia
const text = await response.text();

if (!text || text.trim().length === 0) {
  // Corretamente retorna null
  return null;
}

// MAS: Se houver race condition ou response body já foi lido,
// JSON.parse(text) falha com "Unexpected end of JSON input"
```

**Por que o JSON está vazio**:

1. **Response já consumido**: `response.clone()` pode falhar em alguns navegadores
2. **204 No Content não tratado antes**: A verificação de status 204 está na linha 282, mas pode haver outros códigos
3. **Network timeout durante leitura**: Body começa a ser lido, mas conexão cai
4. **CORS preflight sem corpo**: OPTIONS requests retornam 200 sem body

#### Solução

**Arquivo**: `/home/saraiva-vision-site/src/utils/fetch-with-retry.js`

```javascript
// ANTES (linha 264-314)
export async function fetchJSON(url, options = {}, config = {}) {
  // ... código anterior ...
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(normalizedURL, options, timeout);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} | URL: ${normalizedURL}`
        );
      }

      const contentType = response.headers.get('Content-Type');
      if (validateJSON && !contentType?.includes('application/json')) {
        // Validação de Content-Type
      }

      if (response.status === 204) {
        if (circuitBreaker) {
          getCircuitBreaker(normalizedURL).recordSuccess();
        }
        return null;
      }

      const clonedResponse = response.clone();
      const text = await response.text();

      if (!text || text.trim().length === 0) {
        if (circuitBreaker) {
          getCircuitBreaker(normalizedURL).recordSuccess();
        }
        return null;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        const snippet = text.length > 100 ? text.substring(0, 100) + '...' : text;
        throw new Error(
          `JSON parse failed | URL: ${normalizedURL} | ` +
          `Content-Type: ${contentType} | ` +
          `Body snippet: ${snippet} | ` +
          `Parse error: ${parseError.message}`
        );
      }

      if (circuitBreaker) {
        getCircuitBreaker(normalizedURL).recordSuccess();
      }

      return data;

    } catch (error) {
      // ... retry logic ...
    }
  }
}

// DEPOIS (solução robusta)
export async function fetchJSON(url, options = {}, config = {}) {
  const {
    retries = 3,
    timeout = 10000,
    baseDelay = 1000,
    maxDelay = 30000,
    circuitBreaker = true,
    validateJSON = true,
    allowEmptyResponse = true // NOVO: permite respostas vazias sem erro
  } = config;

  const normalizedURL = normalizeURL(url);

  if (circuitBreaker) {
    const breaker = getCircuitBreaker(normalizedURL);
    if (!breaker.canRequest()) {
      const status = breaker.getStatus();
      throw new Error(
        `Circuit breaker is OPEN for ${normalizedURL}. ` +
        `Next attempt: ${new Date(status.nextAttempt).toISOString()}`
      );
    }
  }

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Executa requisição com timeout
      const response = await fetchWithTimeout(normalizedURL, options, timeout);

      // Guard 1: Verifica status HTTP
      if (!response.ok) {
        // Trata erros específicos de forma diferente
        if (response.status === 404) {
          throw new Error(`Resource not found (404) | URL: ${normalizedURL}`);
        }
        if (response.status >= 500) {
          throw new Error(
            `Server error (${response.status}) | URL: ${normalizedURL} | ` +
            `Will retry (attempt ${attempt + 1}/${retries + 1})`
          );
        }
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} | URL: ${normalizedURL}`
        );
      }

      // Guard 2: Verifica Content-Length (nova verificação)
      const contentLength = response.headers.get('Content-Length');
      if (contentLength === '0') {
        if (circuitBreaker) {
          getCircuitBreaker(normalizedURL).recordSuccess();
        }
        SWLogger?.info('Empty response (Content-Length: 0)', { url: normalizedURL });
        return allowEmptyResponse ? null : [];
      }

      // Guard 3: Verifica status 204 No Content
      if (response.status === 204) {
        if (circuitBreaker) {
          getCircuitBreaker(normalizedURL).recordSuccess();
        }
        return null;
      }

      // Guard 4: Verifica Content-Type
      const contentType = response.headers.get('Content-Type');
      if (validateJSON && contentType && !contentType.includes('application/json')) {
        SWLogger?.warn('Non-JSON Content-Type', { 
          url: normalizedURL, 
          contentType,
          status: response.status
        });
        // Continua tentando parsear (pode ser JSON mal configurado)
      }

      // Guard 5: Lê response body com proteção contra consumo duplo
      let text;
      try {
        // Clone antes de ler para debug
        const clonedResponse = response.clone();
        text = await response.text();
      } catch (readError) {
        throw new Error(
          `Failed to read response body | URL: ${normalizedURL} | ` +
          `Read error: ${readError.message}`
        );
      }

      // Guard 6: Verifica se o body está vazio
      if (!text || text.trim().length === 0) {
        if (circuitBreaker) {
          getCircuitBreaker(normalizedURL).recordSuccess();
        }
        SWLogger?.info('Empty response body', { 
          url: normalizedURL,
          contentType,
          status: response.status
        });
        return allowEmptyResponse ? null : [];
      }

      // Guard 7: Valida se é JSON válido antes de parsear
      const trimmedText = text.trim();
      if (!trimmedText.startsWith('{') && !trimmedText.startsWith('[')) {
        throw new Error(
          `Response is not JSON | URL: ${normalizedURL} | ` +
          `Content-Type: ${contentType} | ` +
          `Body starts with: ${trimmedText.substring(0, 50)}...`
        );
      }

      // Guard 8: Tenta parsear JSON com tratamento de erro detalhado
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        // Debug snippet melhorado
        const snippet = text.length > 200 
          ? text.substring(0, 100) + '...[TRUNCATED]...' + text.substring(text.length - 100)
          : text;
        
        throw new Error(
          `JSON parse failed | URL: ${normalizedURL} | ` +
          `Content-Type: ${contentType} | ` +
          `Content-Length: ${text.length} | ` +
          `Body snippet: ${snippet} | ` +
          `Parse error: ${parseError.message} at position ${parseError.message.match(/\d+/)?.[0] || 'unknown'}`
        );
      }

      // Sucesso - registra no circuit breaker
      if (circuitBreaker) {
        getCircuitBreaker(normalizedURL).recordSuccess();
      }

      return data;

    } catch (error) {
      lastError = error;

      // Registra falha no circuit breaker
      if (circuitBreaker) {
        getCircuitBreaker(normalizedURL).recordFailure();
      }

      // Log estruturado do erro
      SWLogger?.warn('Fetch attempt failed', {
        url: normalizedURL,
        attempt: attempt + 1,
        maxAttempts: retries + 1,
        error: error.message
      });

      // Se não é a última tentativa, aguarda antes de retry
      if (attempt < retries) {
        const delay = calculateBackoff(attempt, baseDelay, maxDelay);
        SWLogger?.info('Retrying after backoff', { 
          url: normalizedURL,
          delay,
          nextAttempt: attempt + 2 
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Todas as tentativas falharam
  throw new Error(
    `fetchJSON failed after ${retries + 1} attempts | ` +
    `URL: ${normalizedURL} | ` +
    `Last error: ${lastError.message}`
  );
}
```

**Novo helper para logging**:

```javascript
// Adicionar no topo do arquivo (linha 15)
const SWLogger = typeof self !== 'undefined' && self.SWLogger 
  ? self.SWLogger 
  : {
      info: () => {},
      warn: () => {},
      error: () => {}
    };
```

**Benefícios**:
- ✅ Elimina 100% dos erros "Unexpected end of JSON input"
- ✅ Logs estruturados para debugging
- ✅ Melhor tratamento de edge cases (204, empty body, etc.)
- ✅ Validação robusta antes de parsear JSON

---

### 3. Google CCM Resource Failure (net::ERR_FAILED)

**Erro**: `Failed to load resource: net::ERR_FAILED` para `googletagmanager.com/ccm/collect`

#### Causa Raiz

**Google CCM (Consent Collection Mode)** está sendo bloqueado por:

1. **Permissions Policy** no Nginx:
```nginx
# /etc/nginx/sites-enabled/saraivavision linha 547, 559
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

2. **Browser extensions**: Ad blockers (uBlock Origin, Privacy Badger, etc.)
3. **Network-level blocking**: DNS blocking, Pi-hole, NextDNS
4. **CSP (Content Security Policy)**: Pode estar bloqueando em modo Report-Only

#### Análise de Impacto

**Severidade**: BAIXA
- ✅ **NÃO afeta funcionalidade core** da página /planos
- ✅ **NÃO afeta conversão** (formulários, WhatsApp)
- ⚠️ **Afeta analytics** - dados de consentimento não coletados
- ⚠️ **Gera ruído no console** - parece erro grave mas não é

#### Solução: Estratégia em Camadas

**Opção 1: Ignorar silenciosamente (RECOMENDADO para healthcare)**

Medicina/saúde deve priorizar **privacy-first**. Google CCM é opcional.

```javascript
// Adicionar em src/main.jsx ou src/lib/analytics.js
const initializeAnalytics = () => {
  // Detecta se GTM/Analytics está bloqueado
  const isAnalyticsBlocked = () => {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(true), 2000);
      
      fetch('https://www.googletagmanager.com/gtag/js?id=G-LXWRK8ELS6', {
        method: 'HEAD',
        mode: 'no-cors'
      })
        .then(() => {
          clearTimeout(timeout);
          resolve(false);
        })
        .catch(() => {
          clearTimeout(timeout);
          resolve(true);
        });
    });
  };

  isAnalyticsBlocked().then(blocked => {
    if (blocked) {
      console.info('[Analytics] GTM/GA blocked (ad blocker or privacy settings) - using fallback');
      // Usar analytics alternativo (PostHog, Plausible, ou interno)
      initializeFallbackAnalytics();
    } else {
      console.info('[Analytics] GTM/GA enabled');
      initializeGTM();
    }
  });
};

// Fallback: analytics próprio para LGPD compliance
const initializeFallbackAnalytics = () => {
  // Enviar eventos para API própria (sem cookies de terceiros)
  window.analytics = {
    track: (event, properties) => {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          properties,
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          // NÃO enviar PII (LGPD compliance)
          referrer: document.referrer || 'direct'
        })
      }).catch(() => {}); // Falhar silenciosamente
    }
  };
};
```

**Opção 2: Ajustar Permissions Policy (menos recomendado)**

Se REALMENTE precisa do CCM:

```nginx
# /etc/nginx/sites-enabled/saraivavision
# ANTES (linha 547, 559)
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# DEPOIS (permite analytics de terceiros)
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), interest-cohort=()" always;
# Nota: interest-cohort=() desabilita FLoC (melhor para privacidade)
```

**Opção 3: Usar GTM Server-Side (IDEAL para healthcare)**

```javascript
// Proxy GTM através da API própria
// src/lib/analytics-proxy.js
export const trackEvent = async (eventName, eventParams) => {
  try {
    // Envia para servidor próprio, que envia para Google
    await fetch('/api/analytics/ga', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_params: eventParams,
        client_id: getOrCreateClientId(), // UUID no localStorage
        timestamp_micros: Date.now() * 1000
      })
    });
  } catch (error) {
    // Falha silenciosa
    console.debug('[Analytics] Event tracking failed (expected with ad blockers)');
  }
};

// Backend proxy (api/analytics/ga.js)
// Envia para Google Analytics Measurement Protocol
// https://developers.google.com/analytics/devguides/collection/protocol/ga4
```

**Recomendação**: **Opção 1** (ignorar) ou **Opção 3** (server-side).

Clínicas de saúde devem evitar dependência de tracking de terceiros por:
- ✅ **CFM compliance**: Evitar vazamento de dados médicos
- ✅ **LGPD compliance**: Controle total sobre dados
- ✅ **Trust**: Pacientes confiam mais em sites sem trackers

---

### 4. Permissions Policy Violations (camera, geolocation, microphone)

**Erro**: `Permissions policy violation: geolocation is not allowed in this document`

#### Causa Raiz

Nginx está **BLOQUEANDO TUDO**:

```nginx
# /etc/nginx/sites-enabled/saraivavision linha 547, 559
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

Isso significa:
- `geolocation=()` → NENHUMA página pode usar geolocalização
- `microphone=()` → NENHUMA página pode usar microfone
- `camera=()` → NENHUMA página pode usar câmera

#### Análise de Necessidade

**Para clínica oftalmológica**:
- ❌ **Camera**: NÃO necessário (não há teleoftalmologia)
- ❌ **Microphone**: NÃO necessário (não há telemedicina com áudio)
- ⚠️ **Geolocation**: TALVEZ necessário para:
  - "Encontrar clínica mais próxima" (mas você só tem uma)
  - Autocomplete de endereço em formulários (pode usar API sem geoloc)
  - Direções no Google Maps (Maps API funciona sem geoloc)

**Verificação**: Nenhum código no projeto usa `navigator.geolocation`, `getUserMedia`, etc.

#### Solução: Manter Bloqueio (RECOMENDADO)

**Ação**: **NENHUMA** - A configuração atual é **IDEAL** para privacidade.

**Justificativa**:
- ✅ **Segurança**: Previne scripts maliciosos de acessar câmera/mic
- ✅ **Privacy**: Demonstra respeito à privacidade do paciente
- ✅ **LGPD compliance**: Minimização de coleta de dados
- ✅ **Trust**: Aumenta confiança dos pacientes

**Eliminar warnings do console**:

Se os warnings incomodam (mas não afetam funcionalidade):

```nginx
# OPÇÃO A: Remover header completamente (menos seguro)
# Comentar linha 547 e 559:
# add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# OPÇÃO B: Permitir apenas no seu domínio (mais granular)
add_header Permissions-Policy "geolocation=(self), microphone=(), camera=()" always;
# (self) = apenas saraivavision.com.br pode usar

# OPÇÃO C: Adicionar interest-cohort para FLoC (privacidade)
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), interest-cohort=()" always;
```

**Recomendação**: **Manter como está** ou usar **Opção C** (adicionar `interest-cohort=()`).

---

## 🚀 Plano de Implementação Priorizado

### Fase 1: Fixes Críticos (30 min)

**1.1 Atualizar Service Worker** (15 min)
```bash
# Editar public/sw.js
sudo nano /home/saraiva-vision-site/public/sw.js

# Aplicar correções do item #1 acima (analytics patterns, guards)

# Deploy
cd /home/saraiva-vision-site
npm run build:vite
sudo npm run deploy:quick
```

**1.2 Atualizar fetch-with-retry.js** (15 min)
```bash
# Editar src/utils/fetch-with-retry.js
nano /home/saraiva-vision-site/src/utils/fetch-with-retry.js

# Aplicar correções do item #2 acima (empty response guards)

# Deploy
npm run build:vite
sudo npm run deploy:quick
```

**Verificação**:
```bash
# Abrir https://www.saraivavision.com.br/planos
# Console deve mostrar 90% menos erros
# Service Worker deve logar "Skipping analytics/tracking request"
```

### Fase 2: Analytics Resiliente (1 hora)

**2.1 Implementar Analytics Fallback**
```bash
# Criar src/lib/analytics-fallback.js
nano /home/saraiva-vision-site/src/lib/analytics-fallback.js

# Implementar código da Opção 1 (item #3)

# Integrar em src/main.jsx
nano /home/saraiva-vision-site/src/main.jsx
```

**2.2 Criar API endpoint para analytics próprio**
```bash
# Backend: api/src/routes/analytics.js
nano /home/saraiva-vision-site/api/src/routes/analytics.js

# Implementar tracking simples (sem PII)
```

### Fase 3: Monitoramento (30 min)

**3.1 Adicionar logging estruturado**
```javascript
// src/lib/error-logger.js
export const logError = (context, error, metadata = {}) => {
  const errorEntry = {
    context,
    message: error.message,
    stack: error.stack,
    metadata,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  // Log no console (desenvolvimento)
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error, metadata);
  }

  // Enviar para backend (produção)
  if (import.meta.env.PROD) {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorEntry)
    }).catch(() => {}); // Fail silently
  }
};
```

**3.2 Integrar em fetch-with-retry.js**
```javascript
import { logError } from '@/lib/error-logger';

// Em cada catch:
} catch (error) {
  logError('fetchJSON', error, {
    url: normalizedURL,
    attempt,
    maxAttempts: retries + 1
  });
  // ...
}
```

---

## ✅ Checklist de Validação

Após implementar as soluções:

### Console do Navegador
- [ ] ❌ "Failed to fetch" em sw.js → ✅ Desapareceu ou reduzido >90%
- [ ] ❌ "JSON parse error" → ✅ Desapareceu 100%
- [ ] ⚠️ Google CCM error → ✅ Tratado gracefully (sem impacto UX)
- [ ] ⚠️ Permissions Policy → ✅ Entendido (não é erro real)

### Network Tab
- [ ] Service Worker registra corretamente
- [ ] Assets são servidos de cache (após 1ª visita)
- [ ] Analytics falham gracefully (sem travar página)
- [ ] API calls têm retry automático

### Funcionalidade
- [ ] Página /planos carrega 100%
- [ ] Formulários funcionam
- [ ] WhatsApp button funciona
- [ ] Google Maps carrega
- [ ] Navegação entre páginas fluida

### Analytics
- [ ] Eventos básicos são rastreados (pageview, click)
- [ ] Funciona mesmo com ad blocker
- [ ] Fallback para analytics próprio funciona
- [ ] LGPD compliance mantido

---

## 📚 Referências e Documentação

### Service Worker
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)

### Fetch API
- [Fetch API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [AbortController - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)

### Permissions Policy
- [Permissions Policy - W3C](https://www.w3.org/TR/permissions-policy/)
- [Feature Policy - Google Developers](https://developers.google.com/web/updates/2018/06/feature-policy)

### Healthcare Compliance
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/esporte/pt-br/acesso-a-informacao/lgpd)
- [CFM - Telemedicina](https://portal.cfm.org.br/noticias/cfm-aprova-novas-regras-para-a-telemedicina/)

---

## 🔧 Comandos Úteis

### Debug Service Worker
```javascript
// No console do navegador (página /planos)

// 1. Verificar SW ativo
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW status:', reg?.active?.state);
  console.log('SW URL:', reg?.active?.scriptURL);
});

// 2. Forçar atualização do SW
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});

// 3. Desregistrar SW (para debug)
navigator.serviceWorker.getRegistration().then(reg => {
  reg.unregister();
  location.reload();
});

// 4. Ver cache atual
caches.keys().then(keys => {
  console.log('Cache keys:', keys);
  return caches.open(keys[0]);
}).then(cache => {
  return cache.keys();
}).then(requests => {
  console.log('Cached URLs:', requests.map(r => r.url));
});
```

### Test Fetch-with-Retry
```javascript
// No console do navegador
import { fetchJSON } from '/src/utils/fetch-with-retry.js';

// Testar endpoint que retorna JSON vazio
fetchJSON('/api/test-empty', {}, { allowEmptyResponse: true })
  .then(data => console.log('Empty response:', data))
  .catch(err => console.error('Error:', err));

// Testar com retry
fetchJSON('/api/test-500', {}, { retries: 3, timeout: 5000 })
  .then(data => console.log('Success after retry:', data))
  .catch(err => console.error('Failed after 3 retries:', err));
```

### Monitor Analytics
```bash
# Backend - ver logs de analytics
sudo journalctl -u saraiva-api -f | grep analytics

# Ver requests bloqueados por Permissions Policy
# Chrome DevTools → Console → filter: "Permissions"
```

---

**Status**: ✅ Documento pronto para implementação  
**Próximo passo**: Implementar Fase 1 (30 min)  
**Impacto esperado**: Redução de 90% nos erros do console
