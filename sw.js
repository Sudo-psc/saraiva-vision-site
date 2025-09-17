// Service Worker for Saraiva Vision Medical Clinic
// Versão: v2.0.0 - Medical Clinic Optimized
// Criado em: 2025-01-17

const CACHE_NAME = 'saraivavision-v2.0.0';
const MEDICAL_CACHE = 'medical-critical-v1.0.0';
const STATIC_CACHE = 'static-assets-v1.0.0';
const API_CACHE = 'api-responses-v1.0.0';

// Medical clinic critical routes for offline functionality
const MEDICAL_ROUTES = [
  '/',
  '/servicos',
  '/contato',
  '/agenda',
  '/servicos/consulta-oftalmologica',
  '/servicos/exame-de-visao',
  '/servicos/cirurgias'
];

// Static assets for medical clinic
const STATIC_ASSETS = [
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// WordPress API routes for medical content
const API_ROUTES = [
  '/wp-json/wp/v2/pages',
  '/wp-json/wp/v2/posts',
  '/wp-json/wp/v2/categories',
  '/api/reviews',
  '/api/contact'
];

// Install event - Cache critical medical assets
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    Promise.all([
      // Cache critical medical routes
      caches.open(MEDICAL_CACHE).then(cache => {
        console.log('[SW] Caching medical critical routes...');
        return cache.addAll(MEDICAL_ROUTES.map(route =>
          new Request(route, { method: 'GET' })
        ));
      }),

      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      }),

      // Skip waiting to activate new worker immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME &&
              cacheName !== MEDICAL_CACHE &&
              cacheName !== STATIC_CACHE &&
              cacheName !== API_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - Medical-optimized caching strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and Chrome extensions
  if (event.request.method !== 'GET' ||
      url.protocol === 'chrome-extension:' ||
      url.protocol === 'moz-extension:') {
    return;
  }

  // Handle different resource types with medical clinic priorities
  if (isMedicalCriticalRoute(url.pathname)) {
    // Network-first for critical medical routes with offline fallback
    event.respondWith(medicalNetworkFirstStrategy(event.request));
  } else if (isAPIRoute(url.pathname)) {
    // Cache-first for API responses with short TTL
    event.respondWith(apiCacheStrategy(event.request));
  } else if (isStaticAsset(url.pathname)) {
    // Cache-first for static assets
    event.respondWith(staticCacheStrategy(event.request));
  } else {
    // Stale-while-revalidate for other resources
    event.respondWith(staleWhileRevalidateStrategy(event.request));
  }
});

// Background sync for medical forms
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'medical-form-sync') {
    event.waitUntil(syncMedicalForms());
  } else if (event.tag === 'appointment-sync') {
    event.waitUntil(syncAppointments());
  }
});

// Push notifications for medical reminders
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');

  const options = {
    body: 'Lembrete: Você tem uma consulta agendada amanhã',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'medical-reminder',
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: 'confirm',
        title: 'Confirmar Presença',
        icon: '/icons/check.png'
      },
      {
        action: 'reschedule',
        title: 'Remarcar',
        icon: '/icons/calendar.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Saraiva Vision - Lembrete de Consulta', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'confirm') {
    // Open appointment confirmation page
    event.waitUntil(
      clients.openWindow('/confirmar-consulta')
    );
  } else if (event.action === 'reschedule') {
    // Open rescheduling page
    event.waitUntil(
      clients.openWindow('/remarcar-consulta')
    );
  } else {
    // Default action - open appointments page
    event.waitUntil(
      clients.openWindow('/agenda')
    );
  }
});

// Medical-specific helper functions
function isMedicalCriticalRoute(pathname) {
  return MEDICAL_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

function isAPIRoute(pathname) {
  return API_ROUTES.some(route => pathname.startsWith(route));
}

function isStaticAsset(pathname) {
  return pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/);
}

// Medical network-first strategy with offline fallback
async function medicalNetworkFirstStrategy(request) {
  const cache = await caches.open(MEDICAL_CACHE);

  try {
    // Try network first for critical medical content
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful response
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log('[SW] Network failed, using cache for medical route:', request.url);

    // Fallback to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Ultimate fallback to offline page for medical routes
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('Página offline - Saraiva Vision', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// API cache strategy with short TTL (5 minutes)
async function apiCacheStrategy(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);

  // Check if cached response is still valid
  if (cachedResponse) {
    const dateHeader = cachedResponse.headers.get('date');
    if (dateHeader) {
      const cachedTime = new Date(dateHeader).getTime();
      const now = Date.now();
      const maxAge = 5 * 60 * 1000; // 5 minutes

      if (now - cachedTime < maxAge) {
        return cachedResponse;
      }
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache API response with date header
      const responseToCache = networkResponse.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set('date', new Date().toUTCString());

      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });

      await cache.put(request, modifiedResponse);
      return networkResponse;
    }

    return cachedResponse || networkResponse;
  } catch (error) {
    console.log('[SW] API network failed, using cache:', request.url);
    return cachedResponse || new Response('{"error": "Network error"}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Static cache strategy
async function staticCacheStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[SW] Static asset fetch failed:', request.url);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Always fetch from network to update cache
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  // Return cached response immediately, or wait for network
  return cachedResponse || fetchPromise;
}

// Background sync for medical forms
async function syncMedicalForms() {
  console.log('[SW] Syncing medical forms...');

  const db = await getIndexedDB();
  const forms = await db.getAll('pendingForms');

  for (const form of forms) {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form.data)
      });

      if (response.ok) {
        await db.delete('pendingForms', form.id);
        console.log('[SW] Form synced successfully:', form.id);
      }
    } catch (error) {
      console.error('[SW] Form sync failed:', form.id, error);
    }
  }
}

// Background sync for appointments
async function syncAppointments() {
  console.log('[SW] Syncing appointments...');

  const db = await getIndexedDB();
  const appointments = await db.getAll('pendingAppointments');

  for (const appointment of appointments) {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointment.data)
      });

      if (response.ok) {
        await db.delete('pendingAppointments', appointment.id);
        console.log('[SW] Appointment synced successfully:', appointment.id);
      }
    } catch (error) {
      console.error('[SW] Appointment sync failed:', appointment.id, error);
    }
  }
}

// IndexedDB helper for offline storage
async function getIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SaraivaVisionOfflineDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = event => {
      const db = event.target.result;

      // Store for pending contact forms
      if (!db.objectStoreNames.contains('pendingForms')) {
        db.createObjectStore('pendingForms', { keyPath: 'id', autoIncrement: true });
      }

      // Store for pending appointments
      if (!db.objectStoreNames.contains('pendingAppointments')) {
        db.createObjectStore('pendingAppointments', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Message handler for client communication
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CLAIM_CLIENTS') {
    self.clients.claim();
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      Promise.all(
        event.data.urls.map(url =>
          caches.open(CACHE_NAME).then(cache =>
            fetch(url).then(response => {
              if (response.ok) cache.put(url, response.clone());
            })
          )
        )
      )
    );
  }
});

// Cleanup on unload
self.addEventListener('beforeunload', () => {
  console.log('[SW] Service worker unloading...');
});

// Error handling
self.addEventListener('error', event => {
  console.error('[SW] Service worker error:', event.error);
});

console.log('[SW] Saraiva Vision Medical Clinic Service Worker Loaded');