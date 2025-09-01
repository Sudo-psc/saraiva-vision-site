/*
	Saraiva Vision - Service Worker Workbox

	Estratégias otimizadas por tipo de recurso:
	- App Shell (HTML): NetworkFirst com offline fallback
	- Static Assets: CacheFirst para assets com hash, StaleWhileRevalidate para assets sem hash
	- APIs: NetworkFirst com short TTL para reviews, StaleWhileRevalidate para outros
	- Images: CacheFirst com compressão automática
	- Fonts: CacheFirst com long-term caching
*/

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
	NetworkFirst,
	CacheFirst,
	StaleWhileRevalidate,
	NetworkOnly
} from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

const SW_VERSION = 'workbox-v2.0.0';

// ========================
// WORKBOX PRECACHING
// ========================
// Precache build assets (será populado pelo build process)
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// ========================
// APP SHELL STRATEGY
// ========================
// SPA Navigation - Network First com fallback para index.html cached
const navigationHandler = new NetworkFirst({
	cacheName: `sv-navigation-${SW_VERSION}`,
	networkTimeoutSeconds: 3,
	plugins: [
		new CacheableResponsePlugin({
			statuses: [0, 200]
		}),
		new ExpirationPlugin({
			maxEntries: 50,
			maxAgeSeconds: 24 * 60 * 60, // 24h
			purgeOnQuotaError: true
		})
	]
});

const navigationRoute = new NavigationRoute(navigationHandler, {
	denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/] // Exclui admin routes e arquivos com extensão
});

registerRoute(navigationRoute);

// ========================
// STATIC ASSETS STRATEGIES
// ========================

// 1. ASSETS COM HASH (immutable) - Cache First com long-term caching
registerRoute(
	({ request, url }) => {
		return url.pathname.startsWith('/assets/') &&
			(request.destination === 'script' ||
				request.destination === 'style') &&
			/\-[a-f0-9]{8,}\.(js|css)$/i.test(url.pathname);
	},
	new CacheFirst({
		cacheName: `sv-hashed-assets-${SW_VERSION}`,
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 200,
				maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
				purgeOnQuotaError: true
			})
		]
	})
);

// 2. IMAGES - Cache First com otimizações
registerRoute(
	({ request, url }) => {
		return request.destination === 'image' ||
			/\.(png|jpg|jpeg|gif|webp|avif|ico|svg)$/i.test(url.pathname);
	},
	new CacheFirst({
		cacheName: `sv-images-${SW_VERSION}`,
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 300,
				maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
				purgeOnQuotaError: true
			})
		]
	})
);

// 3. FONTS - Cache First com very long-term caching
registerRoute(
	({ request, url }) => {
		return request.destination === 'font' ||
			/\.(woff|woff2|ttf|eot|otf)$/i.test(url.pathname);
	},
	new CacheFirst({
		cacheName: `sv-fonts-${SW_VERSION}`,
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 30,
				maxAgeSeconds: 365 * 24 * 60 * 60, // 1 ano
				purgeOnQuotaError: true
			})
		]
	})
);

// 4. MANIFEST E PWA FILES - Stale While Revalidate
registerRoute(
	({ url }) => {
		return url.pathname.match(/\/(site\.webmanifest|robots\.txt|sitemap\.xml|\.well-known\/.*)$/);
	},
	new StaleWhileRevalidate({
		cacheName: `sv-pwa-files-${SW_VERSION}`,
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 20,
				maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
			})
		]
	})
);

// ========================
// API CACHING STRATEGIES
// ========================

// 1. REVIEWS API - Network First com TTL curto (dados dinâmicos)
registerRoute(
	({ url }) => url.pathname.startsWith('/api/reviews'),
	new NetworkFirst({
		cacheName: `sv-api-reviews-${SW_VERSION}`,
		networkTimeoutSeconds: 5,
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 10,
				maxAgeSeconds: 5 * 60, // 5 minutos - dados frescos para reviews
				purgeOnQuotaError: true
			})
		]
	})
);

// 2. CONTACT API - Network Only (não cachear envios de formulário)
registerRoute(
	({ url, request }) => url.pathname.startsWith('/api/contact'),
	new NetworkOnly()
);

// 3. MONITORING/ANALYTICS APIs - Network Only
registerRoute(
	({ url }) => url.pathname.match(/\/api\/(web-vitals|monitoring|analytics)/),
	new NetworkOnly()
);

// 4. OUTROS APIs - Stale While Revalidate
registerRoute(
	({ url }) => url.pathname.startsWith('/api/') && url.origin === self.location.origin,
	new StaleWhileRevalidate({
		cacheName: `sv-api-general-${SW_VERSION}`,
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 15 * 60, // 15 minutos
				purgeOnQuotaError: true
			})
		]
	})
);

// ========================
// EXTERNAL RESOURCES
// ========================

// Google Fonts - Cache First
registerRoute(
	({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
	new StaleWhileRevalidate({
		cacheName: `sv-google-fonts-${SW_VERSION}`,
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 30,
				maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
			})
		]
	})
);

// Google Analytics - Network Only (para não afetar métricas)
registerRoute(
	({ url }) => url.hostname.match(/google-analytics|googletagmanager|gstatic/),
	new NetworkOnly()
);

// ========================
// OFFLINE FALLBACKS
// ========================

// Fallback para navegação offline
self.addEventListener('fetch', (event) => {
	const { request } = event;

	// Se for navegação e estiver offline, serve index.html do cache
	if (request.mode === 'navigate' && !navigator.onLine) {
		event.respondWith(
			caches.match('/index.html').then(response => {
				return response || new Response(
					`<!DOCTYPE html>
          <html><head><title>Offline - Saraiva Vision</title></head>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1>Você está offline</h1>
            <p>Verifique sua conexão com a internet e tente novamente.</p>
            <button onclick="window.location.reload()">Tentar Novamente</button>
          </body></html>`,
					{ headers: { 'Content-Type': 'text/html' } }
				);
			})
		);
	}
});

// ========================
// MAINTENANCE & MONITORING
// ========================

// Cleanup automático quando storage está baixo
self.addEventListener('quotaexceed', () => {
	caches.keys().then(names => {
		names.forEach(name => {
			if (name.includes(SW_VERSION)) return; // Preserva cache atual
			caches.delete(name);
		});
	});
});

// Log de ativação para debugging
self.addEventListener('activate', (event) => {
	console.log(`[SW] Workbox ${SW_VERSION} ativado`);
});

// Message handler para comunicação com app
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});
