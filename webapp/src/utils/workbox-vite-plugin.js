// Workbox Vite Plugin Configuration
import { injectManifest } from 'workbox-build';
import path from 'path';
import fs from 'fs';
import esbuild from 'esbuild';

export function workboxVitePlugin() {
	return {
		name: 'workbox-vite-plugin',
		apply: 'build', // Só executa no build de produção

		async closeBundle() {
			console.log('[Workbox] Gerando service worker...');

			try {
            const distDir = path.join(process.cwd(), 'dist');
            const swSrcPath = path.join(process.cwd(), 'src', 'sw.workbox.js');
            const bundledPath = path.join(distDir, 'sw-bundled.js');

            // 1) Bundle o SW para remover imports não suportados pelo browser no contexto de SW
            await esbuild.build({
                entryPoints: [swSrcPath],
                bundle: true,
                format: 'iife',
                platform: 'browser',
                outfile: bundledPath,
                sourcemap: false,
                target: ['es2019']
            });

            // 2) Inject manifest no arquivo já bundleado
            const { count, size, warnings } = await injectManifest({
                globDirectory: distDir,
                swSrc: bundledPath,
                swDest: path.join(distDir, 'sw.js'),

					// Arquivos a serem pré-cacheados
					globPatterns: [
						// App shell e PWA
						'index.html',
						'site.webmanifest',
						'favicon-*.png',
						'apple-touch-icon.png',
						// JS e CSS gerados pelo Vite (qualquer subpasta dentro de assets)
						'assets/**/*.js',
						'assets/**/*.css',
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
