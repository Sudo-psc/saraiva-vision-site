/*
  Saraiva Vision - Service Worker
  Objetivo: oferecer navegação offline básica e resiliência a conexões instáveis.
  Estratégias:
  - App shell: Network First com fallback ao cache (SPA: navegações recebem index.html do cache)
  - Assets estáticos (js/css/imagens do diretório /assets/): Stale-While-Revalidate
  - API local (/api/): Network First com fallback ao cache (quando possível)
*/

const SW_VERSION = 'v1.0.3';
const RUNTIME_CACHE = `sv-runtime-${SW_VERSION}`;
const ASSETS_CACHE = `sv-assets-${SW_VERSION}`;
const CORE_CACHE = `sv-core-${SW_VERSION}`;

// Arquivos essenciais (sem hash) para boot offline básico
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  // Accessibility floating button icon (improves A11y UX offline)
  '/img/Acessib_icon.png',
  // Fontes essenciais
  '/assets/fonts/Inter-roman.var.woff2',
  '/assets/fonts/Inter-italic.var.woff2'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => undefined)
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Limpa caches antigos
      const names = await caches.keys();
      await Promise.all(
        names.map((name) => {
          if (!name.includes(SW_VERSION)) {
            return caches.delete(name);
          }
        })
      );
      await self.clients.claim();
      // Notifica clientes sobre atualização
      const clients = await self.clients.matchAll({ includeUncontrolled: true });
      clients.forEach(client => {
        client.postMessage({ type: 'SW_UPDATED', version: SW_VERSION });
      });
    })()
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function isAssetRequest(url) {
  return url.origin === self.location.origin && (
    /\/assets\//.test(url.pathname) ||
    /\.(css|js|png|jpg|jpeg|gif|svg|webp|avif|woff2?|ttf|otf)$/i.test(url.pathname)
  );
}

function isApiRequest(url) {
  return url.origin === self.location.origin && url.pathname.startsWith('/api/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests from same origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Always fetch network for ads/web-vitals endpoints
  if (url.pathname.startsWith('/ads') || url.pathname.startsWith('/web-vitals')) {
    event.respondWith(fetch(request));
    return;
  }

  // Safari fix: handle errors more gracefully
  const handleError = (error) => {
    console.warn('SW fetch error:', error);
    return Response.error();
  };

  // Navegações (SPA): Network First com fallback ao cache de index.html
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          // Only cache successful responses
          if (fresh.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put('/index.html', fresh.clone());
          }
          return fresh;
        } catch (error) {
          try {
            const cache = await caches.open(CORE_CACHE);
            const cached = await cache.match('/index.html');
            return cached || new Response('<!DOCTYPE html><html lang="pt-BR"><head><title>Offline</title><style>body{font-family:sans-serif;text-align:center;padding:2em;}h1{color:#2563eb;}p{color:#64748b;}</style></head><body><h1>Você está offline</h1><p>O site Saraiva Vision está sem conexão.<br>Tente novamente mais tarde.</p></body></html>', {
              headers: { 'Content-Type': 'text/html' }
            });
          } catch (cacheError) {
            return handleError(cacheError);
          }
        }
      })()
    );
    return;
  }

  // APIs locais: Network First com fallback ao cache
  if (isApiRequest(url)) {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(RUNTIME_CACHE);
          const fresh = await fetch(request);
          if (fresh.status === 200) {
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch (error) {
          try {
            const cache = await caches.open(RUNTIME_CACHE);
            const cached = await cache.match(request);
            if (cached) return cached;
            return new Response(JSON.stringify({ error: 'offline', message: 'API indisponível offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (cacheError) {
            return handleError(cacheError);
          }
        }
      })()
    );
    return;
  }

  // Assets estáticos: Stale-While-Revalidate
  if (isAssetRequest(url)) {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(ASSETS_CACHE);
          const cached = await cache.match(request);
          const fetchAndUpdate = fetch(request)
            .then((response) => {
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => null);

          return cached || (await fetchAndUpdate) || handleError('Asset not found');
        } catch (error) {
          return handleError(error);
        }
      })()
    );
    return;
  }

  // Demais requests de mesma origem: Cache First com fallback
  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;

        const fresh = await fetch(request);
        if (fresh.status === 200) {
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch (error) {
        return handleError(error);
      }
    })()
  );
});
