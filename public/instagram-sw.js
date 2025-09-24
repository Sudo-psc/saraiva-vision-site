/**
 * Instagram Service Worker
 * Handles offline caching for Instagram content and provides offline functionality
 */

const CACHE_NAME = 'instagram-cache-v1';
const OFFLINE_CACHE_NAME = 'instagram-offline-v1';
const INSTAGRAM_API_CACHE = 'instagram-api-v1';

// URLs to cache for offline functionality
const STATIC_CACHE_URLS = [
    '/img/placeholder.svg',
    '/icons/instagram.svg',
    '/icons/wifi-off.svg',
    '/icons/refresh.svg'
];

// Instagram API endpoints to cache
const API_CACHE_PATTERNS = [
    /\/api\/instagram\/posts/,
    /\/api\/instagram\/stats/
];

// Image cache patterns (Instagram images)
const IMAGE_CACHE_PATTERNS = [
    /cdninstagram\.com/,
    /fbcdn\.net/,
    /instagram\.com.*\.(jpg|jpeg|png|webp|avif)/
];

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only'
};

// Cache configuration
const CACHE_CONFIG = {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 100,
    apiMaxAge: 5 * 60 * 1000, // 5 minutes for API responses
    imageMaxAge: 7 * 24 * 60 * 60 * 1000 // 7 days for images
};

/**
 * Install event - cache static resources
 */
self.addEventListener('install', (event) => {
    console.log('[Instagram SW] Installing service worker');

    event.waitUntil(
        Promise.all([
            // Cache static resources
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(STATIC_CACHE_URLS);
            }),
            // Initialize offline cache
            caches.open(OFFLINE_CACHE_NAME),
            // Initialize API cache
            caches.open(INSTAGRAM_API_CACHE)
        ]).then(() => {
            console.log('[Instagram SW] Static resources cached');
            // Force activation of new service worker
            return self.skipWaiting();
        })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Instagram SW] Activating service worker');

    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName.startsWith('instagram-') &&
                            cacheName !== CACHE_NAME &&
                            cacheName !== OFFLINE_CACHE_NAME &&
                            cacheName !== INSTAGRAM_API_CACHE) {
                            console.log('[Instagram SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all clients
            self.clients.claim()
        ]).then(() => {
            console.log('[Instagram SW] Service worker activated');
        })
    );
});

/**
 * Fetch event - handle network requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Determine cache strategy based on request type
    let strategy = CACHE_STRATEGIES.NETWORK_FIRST;
    let cacheName = CACHE_NAME;

    if (isInstagramAPI(url)) {
        strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
        cacheName = INSTAGRAM_API_CACHE;
    } else if (isInstagramImage(url)) {
        strategy = CACHE_STRATEGIES.CACHE_FIRST;
        cacheName = CACHE_NAME;
    } else if (isStaticResource(url)) {
        strategy = CACHE_STRATEGIES.CACHE_FIRST;
        cacheName = CACHE_NAME;
    }

    event.respondWith(
        handleRequest(request, strategy, cacheName)
    );
});

/**
 * Handle requests with different caching strategies
 */
async function handleRequest(request, strategy, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    switch (strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            return cachedResponse || fetchAndCache(request, cache);

        case CACHE_STRATEGIES.NETWORK_FIRST:
            try {
                const networkResponse = await fetchAndCache(request, cache);
                return networkResponse;
            } catch (error) {
                console.log('[Instagram SW] Network failed, trying cache:', error);
                return cachedResponse || createOfflineResponse(request);
            }

        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            // Return cached response immediately if available
            if (cachedResponse) {
                // Update cache in background
                fetchAndCache(request, cache).catch(console.error);
                return cachedResponse;
            }
            // If no cache, fetch from network
            return fetchAndCache(request, cache);

        case CACHE_STRATEGIES.NETWORK_ONLY:
            return fetch(request);

        case CACHE_STRATEGIES.CACHE_ONLY:
            return cachedResponse || createOfflineResponse(request);

        default:
            return fetchAndCache(request, cache);
    }
}

/**
 * Fetch from network and cache the response
 */
async function fetchAndCache(request, cache) {
    try {
        const response = await fetch(request);

        // Only cache successful responses
        if (response.status === 200) {
            // Clone response before caching (response can only be consumed once)
            const responseToCache = response.clone();

            // Add timestamp for cache expiration
            const responseWithTimestamp = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: {
                    ...Object.fromEntries(responseToCache.headers.entries()),
                    'sw-cached-at': Date.now().toString()
                }
            });

            await cache.put(request, responseWithTimestamp);
        }

        return response;
    } catch (error) {
        console.error('[Instagram SW] Fetch failed:', error);
        throw error;
    }
}

/**
 * Create offline response for failed requests
 */
function createOfflineResponse(request) {
    const url = new URL(request.url);

    if (isInstagramAPI(url)) {
        // Return offline API response
        return new Response(
            JSON.stringify({
                success: false,
                error: 'offline',
                message: 'Content unavailable offline',
                offline: true,
                timestamp: Date.now()
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'sw-offline': 'true'
                }
            }
        );
    } else if (isInstagramImage(url)) {
        // Return placeholder image for failed image requests
        return caches.match('/img/placeholder.svg');
    } else {
        // Return generic offline response
        return new Response(
            'Content unavailable offline',
            {
                status: 503,
                headers: {
                    'Content-Type': 'text/plain',
                    'sw-offline': 'true'
                }
            }
        );
    }
}

/**
 * Check if URL is an Instagram API endpoint
 */
function isInstagramAPI(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

/**
 * Check if URL is an Instagram image
 */
function isInstagramImage(url) {
    return IMAGE_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

/**
 * Check if URL is a static resource
 */
function isStaticResource(url) {
    return STATIC_CACHE_URLS.some(staticUrl => url.pathname === staticUrl);
}

/**
 * Clean expired cache entries
 */
async function cleanExpiredCache() {
    const cacheNames = [CACHE_NAME, INSTAGRAM_API_CACHE, OFFLINE_CACHE_NAME];

    for (const cacheName of cacheNames) {
        try {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();

            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const cachedAt = response.headers.get('sw-cached-at');
                    if (cachedAt) {
                        const age = Date.now() - parseInt(cachedAt);
                        const maxAge = cacheName === INSTAGRAM_API_CACHE ?
                            CACHE_CONFIG.apiMaxAge : CACHE_CONFIG.maxAge;

                        if (age > maxAge) {
                            console.log('[Instagram SW] Removing expired cache entry:', request.url);
                            await cache.delete(request);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[Instagram SW] Error cleaning cache:', error);
        }
    }
}

/**
 * Handle background sync for offline actions
 */
self.addEventListener('sync', (event) => {
    console.log('[Instagram SW] Background sync:', event.tag);

    if (event.tag === 'instagram-sync') {
        event.waitUntil(syncInstagramData());
    } else if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanExpiredCache());
    }
});

/**
 * Sync Instagram data when back online
 */
async function syncInstagramData() {
    try {
        console.log('[Instagram SW] Syncing Instagram data...');

        // Notify clients that sync is starting
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'INSTAGRAM_SYNC_START'
            });
        });

        // Try to fetch fresh data
        const response = await fetch('/api/instagram/posts');
        if (response.ok) {
            const cache = await caches.open(INSTAGRAM_API_CACHE);
            await cache.put('/api/instagram/posts', response.clone());

            // Notify clients that sync completed
            clients.forEach(client => {
                client.postMessage({
                    type: 'INSTAGRAM_SYNC_SUCCESS',
                    data: response.clone()
                });
            });
        }
    } catch (error) {
        console.error('[Instagram SW] Sync failed:', error);

        // Notify clients that sync failed
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'INSTAGRAM_SYNC_ERROR',
                error: error.message
            });
        });
    }
}

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
    const { type, data } = event.data;

    switch (type) {
        case 'CACHE_INSTAGRAM_POSTS':
            handleCacheInstagramPosts(data);
            break;

        case 'CLEAR_INSTAGRAM_CACHE':
            handleClearCache();
            break;

        case 'GET_CACHE_STATUS':
            handleGetCacheStatus(event.ports[0]);
            break;

        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
    }
});

/**
 * Cache Instagram posts manually
 */
async function handleCacheInstagramPosts(posts) {
    try {
        const cache = await caches.open(OFFLINE_CACHE_NAME);

        // Cache the posts data
        const postsResponse = new Response(JSON.stringify({
            success: true,
            posts,
            cached: true,
            timestamp: Date.now()
        }), {
            headers: {
                'Content-Type': 'application/json',
                'sw-cached-at': Date.now().toString()
            }
        });

        await cache.put('/api/instagram/posts/offline', postsResponse);

        // Cache post images
        for (const post of posts) {
            if (post.media_url) {
                try {
                    const imageResponse = await fetch(post.media_url);
                    if (imageResponse.ok) {
                        await cache.put(post.media_url, imageResponse);
                    }
                } catch (error) {
                    console.warn('[Instagram SW] Failed to cache image:', post.media_url);
                }
            }
        }

        console.log('[Instagram SW] Cached', posts.length, 'Instagram posts for offline use');
    } catch (error) {
        console.error('[Instagram SW] Failed to cache posts:', error);
    }
}

/**
 * Clear Instagram cache
 */
async function handleClearCache() {
    try {
        await Promise.all([
            caches.delete(CACHE_NAME),
            caches.delete(INSTAGRAM_API_CACHE),
            caches.delete(OFFLINE_CACHE_NAME)
        ]);

        console.log('[Instagram SW] Cache cleared');
    } catch (error) {
        console.error('[Instagram SW] Failed to clear cache:', error);
    }
}

/**
 * Get cache status
 */
async function handleGetCacheStatus(port) {
    try {
        const cacheNames = await caches.keys();
        const instagramCaches = cacheNames.filter(name => name.startsWith('instagram-'));

        const status = {
            caches: instagramCaches,
            totalSize: 0,
            entryCount: 0
        };

        for (const cacheName of instagramCaches) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();
            status.entryCount += requests.length;
        }

        port.postMessage({
            type: 'CACHE_STATUS_RESPONSE',
            status
        });
    } catch (error) {
        port.postMessage({
            type: 'CACHE_STATUS_ERROR',
            error: error.message
        });
    }
}

/**
 * Periodic cache cleanup
 */
setInterval(() => {
    cleanExpiredCache();
}, 60 * 60 * 1000); // Run every hour

console.log('[Instagram SW] Service worker script loaded');