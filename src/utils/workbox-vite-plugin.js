// Workbox Vite Plugin Configuration
import { injectManifest } from 'workbox-build';
import path from 'path';
import fs from 'fs';

export function workboxVitePlugin() {
	return {
		name: 'workbox-vite-plugin',
		apply: 'build', // Só executa no build de produção

		async closeBundle() {
			console.log('[Workbox] Gerando service worker...');

			try {
				const { count, size, warnings } = await injectManifest({
					// Diretório dos assets buildados
					globDirectory: path.join(process.cwd(), 'dist'),

					// Template do SW customizado
					swSrc: path.join(process.cwd(), 'src', 'sw.workbox.js'),

					// Diretório de saída
					swDest: path.join(process.cwd(), 'dist', 'sw.js'),

					// Arquivos a serem pré-cacheados
					globPatterns: [
						// Assets essenciais para funcionamento offline
						'index.html',
						'assets/entry/*.js',
						'assets/styles/*.css',
						'assets/vendor/vendor-react-*.js',
						'site.webmanifest',
						'favicon-*.png',
						'apple-touch-icon.png',
						// Imagens críticas pequenas
						'img/Acessib_icon.png'
					],

					// Excluir do precache
					globIgnores: [
						'**/node_modules/**/*',
						'assets/images/**/*', // Imagens serão cached on-demand
						'Podcasts/**/*', // Podcasts não são críticos
						'**/*.map', // Source maps
						'test-*.html' // Arquivos de teste
					],

					// Configurações avançadas
					maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB max por arquivo

					// Configuração do manifest
					manifestTransforms: [
						(manifestEntries) => {
							// Remove query params dos assets com hash
							const manifest = manifestEntries.map(entry => {
								if (entry.url.includes('?')) {
									entry.url = entry.url.split('?')[0];
								}
								return entry;
							});

							return { manifest };
						}
					]
				});

				console.log(`[Workbox] ✅ Service worker gerado!`);
				console.log(`[Workbox] 📦 ${count} arquivos pré-cacheados`);
				console.log(`[Workbox] 📊 ${(size / 1024 / 1024).toFixed(2)}MB em cache`);

				if (warnings.length > 0) {
					console.warn('[Workbox] ⚠️  Warnings:', warnings);
				}

				// Criar arquivo de registro para debugging
				const logData = {
					timestamp: new Date().toISOString(),
					version: 'workbox-v2.0.0',
					filesPreCached: count,
					totalSize: size,
					warnings: warnings
				};

				fs.writeFileSync(
					path.join(process.cwd(), 'dist', 'sw-build.log'),
					JSON.stringify(logData, null, 2)
				);

			} catch (error) {
				console.error('[Workbox] ❌ Erro ao gerar service worker:', error);
				throw error;
			}
		}
	};
}
