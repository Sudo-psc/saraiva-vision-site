# Configurações Recomendadas - Headers, Caching, Fallbacks

## 🔧 Nginx Configuration

### Headers de Segurança e Performance

```nginx
# /etc/nginx/sites-enabled/saraivavision

server {
    listen 443 ssl http2;
    server_name saraivavision.com.br;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # CORS para API
    location /api/ {
        # Permitir origin específico
        if ($http_origin ~* ^https://(www\.)?saraivavision\.com\.br$) {
            add_header 'Access-Control-Allow-Origin' "$http_origin" always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
        }

        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,X-CSRF-Token' always;
        add_header 'Access-Control-Max-Age' 86400 always;

        # Preflight requests
        if ($request_method = 'OPTIONS') {
            return 204;
        }

        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache Headers para Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|webp|avif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # HTML sem cache (ou cache curto)
    location ~* \.(html|htm)$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # API sem cache
    location /api/ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate";
        add_header Pragma "no-cache";
    }

    # Compression
    gzip on;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";

    # Rate Limiting Zones
    limit_req_zone $binary_remote_addr zone=contact_limit:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/m;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/m;

    # Rate Limiting Aplicado
    location /api/contact {
        limit_req zone=contact_limit burst=2 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:3001;
    }

    location /api/analytics/ {
        limit_req zone=api_limit burst=10 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:3001;
    }

    location / {
        limit_req zone=general_limit burst=20 nodelay;
        root /var/www/saraivavision/current;
        try_files $uri $uri/ /index.html;
    }

    # WebSocket Support (Pulse.is, etc)
    location /ws/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }

    # Error Pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /var/www/saraivavision/current;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;
    return 301 https://saraivavision.com.br$request_uri;
}

# Redirect www to non-www
server {
    listen 443 ssl http2;
    server_name www.saraivavision.com.br;
    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    return 301 https://saraivavision.com.br$request_uri;
}
```

---

## 🌐 CORS Configuration (Backend)

### Express Middleware

```javascript
// api/src/middleware/cors.js

import cors from 'cors';

const ALLOWED_ORIGINS = [
  'https://saraivavision.com.br',
  'https://www.saraivavision.com.br',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3002' : null
].filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Permitir requests sem origin (mobile apps, curl, etc)
    if (!origin) {
      return callback(null, true);
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('[CORS] Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'X-CSRF-Token',
    'X-Requested-With',
    'Authorization'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 horas
});
```

---

## 📦 Caching Strategy

### Service Worker Cache Strategy

```javascript
// public/sw.js

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAMES = {
  STATIC: `static-${CACHE_VERSION}`,
  DYNAMIC: `dynamic-${CACHE_VERSION}`,
  IMAGES: `images-${CACHE_VERSION}`
};

// Precache assets críticos
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/index.js',
  '/assets/index.css',
  '/logo.png'
];

// Cache-First para assets estáticos
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    // Atualizar em background
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(CACHE_NAMES.STATIC).then(cache => {
          cache.put(request, response);
        });
      }
    });
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAMES.STATIC);
    cache.put(request, response.clone());
  }
  return response;
}

// Network-First para API
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAMES.DYNAMIC);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale-While-Revalidate para imagens
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      caches.open(CACHE_NAMES.IMAGES).then(cache => {
        cache.put(request, response);
      });
    }
    return response;
  });

  return cached || fetchPromise;
}
```

### HTTP Cache Headers

```javascript
// api/src/middleware/cache.js

export function cacheControl(duration, type = 'public') {
  return (req, res, next) => {
    if (duration === 0) {
      res.set({
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
    } else {
      res.set({
        'Cache-Control': `${type}, max-age=${duration}`,
        'Expires': new Date(Date.now() + duration * 1000).toUTCString()
      });
    }
    next();
  };
}

// Uso
app.get('/api/blog-posts', cacheControl(3600), (req, res) => {
  // Cachear por 1 hora
  res.json(blogPosts);
});

app.get('/api/analytics/ga', cacheControl(0), (req, res) => {
  // Nunca cachear analytics
  res.json({ success: true });
});
```

---

## 📊 Google Tag Manager / Analytics Fallback

### GTM Container Configuration

```javascript
// src/services/analytics.js

class AnalyticsService {
  constructor() {
    this.gtmLoaded = false;
    this.gaLoaded = false;
    this.buffer = [];

    this.init();
  }

  init() {
    // Verificar se GTM carregou
    const checkGTM = setInterval(() => {
      if (window.dataLayer) {
        this.gtmLoaded = true;
        clearInterval(checkGTM);
        this.flushBuffer();
      }
    }, 100);

    // Timeout após 5 segundos
    setTimeout(() => {
      clearInterval(checkGTM);
      if (!this.gtmLoaded) {
        console.warn('[Analytics] GTM failed to load, using fallback');
        this.initFallback();
      }
    }, 5000);
  }

  initFallback() {
    // Carregar GA4 diretamente
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID}`;
    document.head.appendChild(script);

    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', import.meta.env.VITE_GA_ID);

      this.gaLoaded = true;
      this.flushBuffer();
    };

    script.onerror = () => {
      console.error('[Analytics] Fallback GA4 failed to load');
      // Enviar para backend
      this.useBackendFallback();
    };
  }

  useBackendFallback() {
    // Enviar eventos via backend
    this.flushBuffer();
  }

  trackEvent(event, params = {}) {
    if (this.gtmLoaded && window.dataLayer) {
      window.dataLayer.push({
        event,
        ...params
      });
    } else if (this.gaLoaded && window.gtag) {
      window.gtag('event', event, params);
    } else {
      // Buffer para enviar depois
      this.buffer.push({ event, params, timestamp: Date.now() });

      // Fallback: enviar para backend
      this.sendToBackend(event, params);
    }
  }

  async sendToBackend(event, params) {
    try {
      await fetch('/api/analytics/ga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          params,
          timestamp: Date.now(),
          url: window.location.href,
          referrer: document.referrer
        })
      });
    } catch (error) {
      console.error('[Analytics] Failed to send to backend', error);
    }
  }

  flushBuffer() {
    if (this.buffer.length === 0) return;

    console.log('[Analytics] Flushing buffer', {
      count: this.buffer.length
    });

    const events = [...this.buffer];
    this.buffer = [];

    events.forEach(({ event, params }) => {
      this.trackEvent(event, params);
    });
  }

  // Métodos convenientes
  pageview(path) {
    this.trackEvent('page_view', {
      page_path: path || window.location.pathname,
      page_title: document.title
    });
  }

  click(label, category = 'engagement') {
    this.trackEvent('click', {
      event_category: category,
      event_label: label
    });
  }

  conversion(value, currency = 'BRL') {
    this.trackEvent('conversion', {
      value,
      currency
    });
  }
}

export const analytics = new AnalyticsService();
```

---

## 🚫 Ad Blocker Detection & Handling

### Detecção de Ad Blocker

```javascript
// src/utils/adblock-detector.js

export async function detectAdBlock() {
  try {
    // Tentar carregar um script comum de ads
    const response = await fetch(
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      }
    );

    // Se chegou aqui, não está bloqueado
    return false;

  } catch (error) {
    // ERR_BLOCKED_BY_CLIENT ou network error
    if (error.message.includes('blocked')) {
      console.info('[AdBlock] Detected ad blocker');
      return true;
    }

    // Outros erros de rede
    return false;
  }
}

// Uso
detectAdBlock().then(blocked => {
  if (blocked) {
    // Ajustar analytics para não depender de scripts bloqueados
    window.adBlockDetected = true;

    // Usar apenas backend analytics
    console.info('[AdBlock] Using backend-only analytics');

    // Opcional: mostrar mensagem ao usuário
    // showAdBlockMessage();
  }
});
```

### Tratamento de Erros de Ad Blocker

```javascript
// src/services/error-tracker.js

class ErrorTracker {
  captureException(error, context) {
    // Classificar erro
    const classification = this.classifyError(error, context);

    // Ignorar erros de adblock em reports
    if (classification.category === 'adblock') {
      console.info('[ErrorTracker] Adblock error ignored:', error.message);

      // Apenas incrementar métrica, não enviar report
      this.metrics.adblock_errors++;
      return;
    }

    // Enviar outros erros normalmente
    this.sendReport(error, classification);
  }

  classifyError(error, context) {
    const message = error.message || String(error);

    // Padrões de adblock
    const adblockPatterns = [
      'ERR_BLOCKED_BY_CLIENT',
      'Failed to load resource',
      'net::ERR_BLOCKED_BY_RESPONSE',
      'adsbygoogle',
      'doubleclick',
      '/ads/',
      'pagead2.googlesyndication.com'
    ];

    for (const pattern of adblockPatterns) {
      if (message.includes(pattern) || context.url?.includes(pattern)) {
        return {
          category: 'adblock',
          severity: 'info',
          retryable: false
        };
      }
    }

    // Outros erros...
    return {
      category: 'unknown',
      severity: 'error',
      retryable: true
    };
  }
}
```

---

## 🔌 QUIC Protocol Handling

### Desabilitar QUIC (se instável)

```javascript
// src/utils/network-config.js

// Forçar HTTP/2 em vez de HTTP/3 (QUIC)
if ('connection' in navigator) {
  // Chromium experimental API
  try {
    navigator.connection.effectiveType;

    // Se QUIC causando problemas, forçar HTTP/2
    if (localStorage.getItem('force_http2') === 'true') {
      // Não há API direta para isso no browser
      // Mas podemos evitar recursos que usam QUIC

      console.info('[Network] Forcing HTTP/2 instead of QUIC');
    }
  } catch (e) {
    // API não disponível
  }
}
```

### Nginx: Desabilitar HTTP/3 (QUIC)

```nginx
# /etc/nginx/sites-enabled/saraivavision

server {
    # Remover ou comentar linha HTTP/3
    # listen 443 quic reuseport;

    # Usar apenas HTTP/2
    listen 443 ssl http2;

    # Remover header Alt-Svc
    # add_header Alt-Svc 'h3=":443"; ma=86400';
}
```

### Fallback em Fetch

```javascript
// src/utils/fetch-with-fallback.js

export async function fetchWithProtocolFallback(url, options = {}) {
  try {
    // Tentar requisição normal
    const response = await fetch(url, options);
    return response;

  } catch (error) {
    // Se erro QUIC, tentar forçar HTTP/1.1 ou HTTP/2
    if (error.message.includes('ERR_QUIC_PROTOCOL_ERROR')) {
      console.warn('[Fetch] QUIC error, retrying with HTTP/2');

      // Retry sem QUIC (navegador tentará HTTP/2)
      // Não há controle direto, mas retry pode usar protocolo diferente
      return fetch(url, {
        ...options,
        cache: 'reload' // Força nova conexão
      });
    }

    throw error;
  }
}
```

---

## 🔍 Debugging & Logging

### Structured Logging

```javascript
// src/utils/logger.js

class Logger {
  constructor(namespace) {
    this.namespace = namespace;
    this.enabled = localStorage.getItem('debug') === 'true';
  }

  log(level, message, data = {}) {
    if (!this.enabled && level !== 'error') return;

    const entry = {
      level,
      namespace: this.namespace,
      message,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    const color = {
      info: '#0099ff',
      warn: '#ff9900',
      error: '#ff0000'
    }[level] || '#000000';

    console.log(
      `%c[${this.namespace}:${level.toUpperCase()}]`,
      `color: ${color}; font-weight: bold`,
      message,
      data
    );

    // Enviar para backend se error
    if (level === 'error') {
      this.sendToBackend(entry);
    }
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  async sendToBackend(entry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // Fail silently
    }
  }
}

// Uso
const logger = new Logger('Analytics');
logger.info('Event tracked', { event: 'pageview' });
logger.error('Failed to send', { error: 'Network timeout' });
```

### Debug Mode

```javascript
// src/utils/debug.js

// Ativar debug via localStorage
if (window.location.search.includes('debug=true')) {
  localStorage.setItem('debug', 'true');
  console.log('🐛 Debug mode enabled');
}

// Desativar
if (window.location.search.includes('debug=false')) {
  localStorage.removeItem('debug');
  console.log('✅ Debug mode disabled');
}

// Verificar
export const DEBUG = localStorage.getItem('debug') === 'true';

// Expor utilitários globais para debug
if (DEBUG) {
  window.DEBUG_UTILS = {
    clearCache: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Cache cleared');
    },

    reconnectWS: () => {
      if (window.robustWS) {
        window.robustWS.closeConnection(false);
        window.robustWS.connect();
        console.log('🔌 WebSocket reconnection triggered');
      }
    },

    resetCircuitBreaker: (endpoint) => {
      // Implementar reset manual
      console.log('🔄 Circuit breaker reset for', endpoint);
    },

    dumpMetrics: () => {
      console.table({
        errors: window.errorTracker?.metrics,
        websocket: window.robustWS?.getState(),
        analytics: window.analytics?.buffer?.length
      });
    }
  };

  console.log('🔧 Debug utils available: window.DEBUG_UTILS');
}
```

---

## 📱 Mobile Specific Optimizations

### iOS Background Handling

```javascript
// src/utils/ios-lifecycle.js

// Detectar iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

if (isIOS) {
  // Prevenir "zumbificar" WebSocket
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Fechar conexões graciosamente
      window.robustWS?.closeConnection(false);

      // Pausar heartbeats
      clearInterval(window.heartbeatTimer);
    } else {
      // Reabrir conexões
      window.robustWS?.connect();

      // Retomar heartbeats
      startHeartbeat();
    }
  });

  // Tratar pageshow (iOS BFCache)
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      console.log('[iOS] Page restored from BFCache');

      // Reconectar tudo
      window.robustWS?.connect();
      window.portManager?.connect();
    }
  });
}
```

---

## ✅ Validation Script

```bash
#!/bin/bash
# scripts/validate-configs.sh

echo "🔍 Validating configurations..."

# 1. Nginx syntax
echo "Checking Nginx..."
sudo nginx -t || exit 1

# 2. Environment variables
echo "Checking env vars..."
required_vars=(
  "VITE_GA_ID"
  "VITE_GTM_ID"
  "VITE_BASE_URL"
)

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing $var"
    exit 1
  fi
done

# 3. Scripts presence
echo "Checking scripts..."
scripts=(
  "chrome-extension-port-manager.js"
  "robust-websocket.js"
  "fetch-with-retry.js"
  "error-tracker.js"
  "secure-form-submit.js"
)

for script in "${scripts[@]}"; do
  if [ ! -f "scripts/$script" ]; then
    echo "❌ Missing $script"
    exit 1
  fi
done

# 4. Build test
echo "Testing build..."
npm run build:vite || exit 1

echo "✅ All validations passed!"
```

---

## 📚 Additional Resources

- [MDN: HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Google: Web Vitals](https://web.dev/vitals/)
- [Nginx: Performance Tuning](https://www.nginx.com/blog/tuning-nginx/)
- [OWASP: Security Headers](https://owasp.org/www-project-secure-headers/)
