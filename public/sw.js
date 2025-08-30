/*
  Saraiva Vision - Service Worker
  Objetivo: oferecer navegação offline básica e resiliência a conexões instáveis.
  Estratégias:
  - App shell: Network First com fallback ao cache (SPA: navegações recebem index.html do cache)
  - Assets estáticos (js/css/imagens do diretório /assets/): Stale-While-Revalidate
  - API local (/api/): Network First com fallback ao cache (quando possível)
*/

const SW_VERSION = 'v1.0.0';
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
  '/apple-touch-icon.png'
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
    })()
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function isAssetRequest(url) {
  return url.origin === self.location.origin && (/\/assets\//.test(url.pathname) || /\.(css|js|png|jpg|jpeg|gif|svg|webp|avif|woff2?)$/i.test(url.pathname));
}

function isApiRequest(url) {
  return url.origin === self.location.origin && url.pathname.startsWith('/api/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET
  if (request.method !== 'GET') return;

  // Navegações (SPA): Network First com fallback ao cache de index.html
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put('/index.html', fresh.clone());
          return fresh;
        } catch (_) {
          const cache = await caches.open(CORE_CACHE);
          return (await cache.match('/index.html')) || Response.error();
        }
      })()
    );
    return;
  }

  // APIs locais: Network First com fallback ao cache
  if (isApiRequest(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        try {
          const fresh = await fetch(request);
          cache.put(request, fresh.clone());
          return fresh;
        } catch (_) {
          const cached = await cache.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })()
    );
    return;
  }

  // Assets estáticos: Stale-While-Revalidate
  if (isAssetRequest(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSETS_CACHE);
        const cached = await cache.match(request);
        const fetchAndUpdate = fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => undefined);

        return cached || (await fetchAndUpdate) || fetch(request);
      })()
    );
    return;
  }

  // Demais requests de mesma origem: fallback simples Cache First com atualização em segundo plano
  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            cache.put(request, res.clone());
            return res;
          })
          .catch(() => undefined);
        return cached || (await network) || Response.error();
      })()
    );
  }
});

