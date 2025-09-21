/**
 * Service Worker Registration com Workbox
 * Features: Update detection, skip waiting control, cache management
 */

export class ServiceWorkerManager {
	constructor() {
		this.registration = null;
		this.updateAvailable = false;
		this.callbacks = {
			updateAvailable: [],
			controllerChanged: [],
			error: []
		};
	}

	// Registrar service worker
	async register() {
		if (!('serviceWorker' in navigator)) {
			console.warn('[SW] Service Workers não suportados neste navegador');
			return null;
		}

		try {
			// Aguarda carregamento completo para não afetar performance inicial
			if (document.readyState === 'loading') {
				await new Promise(resolve => {
					document.addEventListener('DOMContentLoaded', resolve);
				});
			}

			// Delay adicional para não competir com recursos críticos
			await new Promise(resolve => setTimeout(resolve, 1000));

			console.log('[SW] Registrando service worker...');

			this.registration = await navigator.serviceWorker.register('/sw.js', {
				scope: '/',
				type: 'module', // Necessário para imports ES6
				updateViaCache: 'none' // Força verificação de updates
			});

			console.log('[SW] ✅ Service worker registrado');

			// Setup de event listeners
			this.setupEventListeners();

			// Verifica por updates imediatamente após registro
			this.checkForUpdates();

			// Verifica por updates periodicamente (a cada 30 minutos)
			setInterval(() => this.checkForUpdates(), 30 * 60 * 1000);

			return this.registration;

		} catch (error) {
			console.error('[SW] ❌ Erro ao registrar service worker:', error);
			// Migração: se houver SW clássico antigo registrado, desinstalar e tentar novamente como módulo
			const msg = String(error?.message || '');
			const isClassicVsModuleMismatch = /import statement outside a module/i.test(msg) || /Unexpected token 'import'/.test(msg);
			if (isClassicVsModuleMismatch) {
				try {
					const regs = await navigator.serviceWorker.getRegistrations();
					for (const reg of regs) {
						await reg.unregister();
					}
					// Pequeno atraso para garantir liberação
					await new Promise(r => setTimeout(r, 300));
					console.warn('[SW] Realizando migração de classic -> module. Tentando novo registro...');
					this.registration = await navigator.serviceWorker.register('/sw.js', {
						scope: '/',
						type: 'module',
						updateViaCache: 'none'
					});
					console.log('[SW] ✅ Re-registro bem-sucedido após migração');
					this.setupEventListeners();
					this.checkForUpdates();
					return this.registration;
				} catch (re) {
					console.error('[SW] Falha ao migrar SW:', re);
				}
			}

			this.triggerCallback('error', error);
			return null;
		}
	}

	// Setup de event listeners
	setupEventListeners() {
		if (!this.registration) return;

		// Novo service worker instalando
			this.registration.addEventListener('updatefound', () => {
				const newWorker = this.registration.installing;
				if (!newWorker) return;

				newWorker.addEventListener('statechange', async () => {
					if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
						console.log('[SW] 🆕 Nova versão disponível');
						this.updateAvailable = true;
						this.triggerCallback('updateAvailable', newWorker);
						// Auto-aplicar update para evitar assets 404 por index antigo
						try {
							await this.applyUpdate();
							console.log('[SW] ⏭️  SKIP_WAITING enviado');
						} catch (e) {
							console.warn('[SW] Falha ao aplicar update automaticamente:', e);
						}
					}
				});
			});

		// Controller mudou (nova versão ativa)
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			console.log('[SW] 🔄 Controller alterado - aplicando nova versão');
			this.triggerCallback('controllerChanged');
			// Recarregar após pequena espera para garantir ativação completa
			setTimeout(() => {
				try { window.location.reload(); } catch(_) {}
			}, 300);
		});

		// Messages do service worker
		navigator.serviceWorker.addEventListener('message', (event) => {
			console.log('[SW] 💬 Mensagem recebida:', event.data);

			if (event.data?.type === 'CACHE_UPDATED') {
				// Cache foi atualizado em background
				this.triggerCallback('cacheUpdated', event.data);
			}
		});
	}

	// Verificar manualmente por updates
	async checkForUpdates() {
		if (!this.registration) return;

		try {
			await this.registration.update();
		} catch (error) {
			console.warn('[SW] Erro ao verificar updates:', error);
		}
	}

	// Aplicar update (skip waiting)
	async applyUpdate() {
		if (!this.registration || !this.registration.waiting) {
			console.warn('[SW] Nenhum update pendente');
			return;
		}

		// Enviar mensagem para o SW waiting aplicar update
		this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
	}

	// Registrar callbacks para eventos
	on(event, callback) {
		if (this.callbacks[event]) {
			this.callbacks[event].push(callback);
		}
	}

	// Disparar callbacks
	triggerCallback(event, data) {
		if (this.callbacks[event]) {
			this.callbacks[event].forEach(callback => callback(data));
		}
	}

	// Limpar caches antigos manualmente
	async clearOldCaches() {
		if (!('caches' in window)) return;

		try {
			const cacheNames = await caches.keys();
			const currentVersion = 'workbox-v2.0.0';

			const oldCaches = cacheNames.filter(name => !name.includes(currentVersion));

			await Promise.all(oldCaches.map(name => {
				console.log(`[SW] 🧹 Removendo cache antigo: ${name}`);
				return caches.delete(name);
			}));

			console.log(`[SW] ✅ ${oldCaches.length} caches antigos removidos`);

		} catch (error) {
			console.error('[SW] Erro ao limpar caches:', error);
		}
	}

	// Obter estatísticas de cache
	async getCacheStats() {
		if (!('caches' in window)) return null;

		try {
			const cacheNames = await caches.keys();
			const stats = {};

			for (const name of cacheNames) {
				const cache = await caches.open(name);
				const keys = await cache.keys();
				stats[name] = {
					entries: keys.length,
					urls: keys.map(req => req.url)
				};
			}

			return stats;
		} catch (error) {
			console.error('[SW] Erro ao obter stats de cache:', error);
			return null;
		}
	}
}

// Instância singleton
export const swManager = new ServiceWorkerManager();

// Auto-inicialização quando módulo é importado - TEMPORARIAMENTE DESABILITADO
// Aguardando correção do deployment do service worker no Vercel
// if (typeof window !== 'undefined' && import.meta.env.PROD) {
//	swManager.register();
// }

// Export para uso direto
export default swManager;
