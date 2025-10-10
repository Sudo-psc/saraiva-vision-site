/**
 * Service Worker Robusto para Manifest V3
 * Trata promises, mantém alive apenas quando necessário, logging estruturado
 */

// service-worker.js

const SW_VERSION = '1.0.0';
const CACHE_NAME = `saraiva-vision-v${SW_VERSION}`;

// Assets para cache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css'
];

// Configuração
const CONFIG = {
  maxCacheAge: 86400000, // 24 horas
  maxCacheSize: 50,
  offlinePageUrl: '/offline.html',
  analyticsBuffer: []
};

/**
 * Logger estruturado
 */
class SWLogger {
  static log(level, message, data = {}) {
    const entry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      version: SW_VERSION
    };

    console.log(`[SW:${level}]`, message, data);

    // Enviar para analytics quando online
    if (level === 'error' && navigator.onLine) {
      this.reportError(entry);
    }
  }

  static info(message, data) {
    this.log('INFO', message, data);
  }

  static warn(message, data) {
    this.log('WARN', message, data);
  }

  static error(message, data) {
    this.log('ERROR', message, data);
  }

  static async reportError(entry) {
    try {
      await fetch('/api/sw-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('[SW] Failed to report error', error);
    }
  }
}

/**
 * Install event
 */
self.addEventListener('install', (event) => {
  SWLogger.info('Installing service worker', { version: SW_VERSION });

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(PRECACHE_ASSETS);

        SWLogger.info('Precache completed', {
          assets: PRECACHE_ASSETS.length
        });

        // Forçar ativação imediata
        await self.skipWaiting();

      } catch (error) {
        SWLogger.error('Install failed', {
          error: error.message,
          stack: error.stack
        });
        throw error;
      }
    })()
  );
});

/**
 * Activate event
 */
self.addEventListener('activate', (event) => {
  SWLogger.info('Activating service worker', { version: SW_VERSION });

  event.waitUntil(
    (async () => {
      try {
        // Limpar caches antigos
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              SWLogger.info('Deleting old cache', { name });
              return caches.delete(name);
            })
        );

        // Tomar controle imediato
        await self.clients.claim();

        SWLogger.info('Activation completed');

      } catch (error) {
        SWLogger.error('Activation failed', {
          error: error.message,
          stack: error.stack
        });
        throw error;
      }
    })()
  );
});

/**
 * Fetch event com estratégia Network-First
 */
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
          const offlinePage = await cache.match(CONFIG.offlinePageUrl);
          if (offlinePage) {
            return offlinePage;
          }
        }

        throw error;
      }
    })()
  );
});

/**
 * Estratégia Network-First
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Cachear resposta bem-sucedida
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;

  } catch (error) {
    // Fallback para cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      SWLogger.warn('Network failed, serving from cache', {
        url: request.url
      });
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * Estratégia Cache-First
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Atualizar cache em background
    updateCacheInBackground(request);
    return cachedResponse;
  }

  // Não está em cache, buscar da rede
  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }

  return response;
}

/**
 * Atualizar cache em background
 */
async function updateCacheInBackground(request) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response);
    }
  } catch (error) {
    // Ignorar erros silenciosamente
  }
}

/**
 * Message handler com tratamento robusto
 */
self.addEventListener('message', (event) => {
  SWLogger.info('Message received', {
    type: event.data?.type,
    source: event.source?.id
  });

  // Retornar promise para evitar erros
  event.waitUntil(
    (async () => {
      try {
        const { type, payload } = event.data;

        let result;

        switch (type) {
          case 'SKIP_WAITING':
            await self.skipWaiting();
            result = { success: true };
            break;

          case 'CACHE_URLS':
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(payload.urls);
            result = { success: true, cached: payload.urls.length };
            break;

          case 'CLEAR_CACHE':
            await caches.delete(CACHE_NAME);
            result = { success: true };
            break;

          case 'GET_VERSION':
            result = { version: SW_VERSION };
            break;

          default:
            result = { error: 'Unknown message type' };
        }

        // Responder ao cliente
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage(result);
        }

      } catch (error) {
        SWLogger.error('Message handler error', {
          error: error.message,
          stack: error.stack,
          type: event.data?.type
        });

        // Sempre retornar resposta, mesmo em erro
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({
            error: true,
            message: error.message
          });
        }
      }
    })()
  );
});

/**
 * Sync event para analytics offline
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    SWLogger.info('Background sync: analytics');

    event.waitUntil(
      (async () => {
        try {
          // Enviar analytics buffered
          await syncAnalytics();
        } catch (error) {
          SWLogger.error('Analytics sync failed', {
            error: error.message
          });
        }
      })()
    );
  }
});

async function syncAnalytics() {
  if (CONFIG.analyticsBuffer.length === 0) {
    return;
  }

  const events = [...CONFIG.analyticsBuffer];
  CONFIG.analyticsBuffer = [];

  for (const event of events) {
    try {
      await fetch('/api/analytics/ga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      // Re-buffar se falhou
      CONFIG.analyticsBuffer.push(event);
    }
  }
}

/**
 * Periodic Background Sync (Manifest V3)
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    SWLogger.info('Periodic sync: cache cleanup');

    event.waitUntil(
      (async () => {
        try {
          await cleanupOldCache();
        } catch (error) {
          SWLogger.error('Cache cleanup failed', {
            error: error.message
          });
        }
      })()
    );
  }
});

async function cleanupOldCache() {
  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();

  const now = Date.now();
  let deletedCount = 0;

  for (const request of requests) {
    const response = await cache.match(request);

    if (!response) continue;

    const dateHeader = response.headers.get('date');
    if (!dateHeader) continue;

    const age = now - new Date(dateHeader).getTime();

    if (age > CONFIG.maxCacheAge) {
      await cache.delete(request);
      deletedCount++;
    }
  }

  SWLogger.info('Cache cleanup completed', {
    deleted: deletedCount,
    remaining: requests.length - deletedCount
  });
}

/**
 * Error handler global
 */
self.addEventListener('error', (event) => {
  SWLogger.error('Global error', {
    message: event.message || 'Unknown error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error ? {
      name: event.error.name,
      message: event.error.message,
      stack: event.error.stack
    } : null
  });
});

/**
 * Unhandled promise rejections
 */
self.addEventListener('unhandledrejection', (event) => {
  SWLogger.error('Unhandled promise rejection', {
    reason: event.reason instanceof Error ? {
      name: event.reason.name,
      message: event.reason.message,
      stack: event.reason.stack
    } : String(event.reason)
  });

  // Prevenir default (não logar no console novamente)
  event.preventDefault();
});

SWLogger.info('Service worker loaded', { version: SW_VERSION });
