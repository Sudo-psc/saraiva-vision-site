import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { workboxVitePlugin } from './src/utils/workbox-vite-plugin.js'

export default defineConfig({
	plugins: [react(), workboxVitePlugin()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	build: {
		outDir: 'dist',
		sourcemap: false,
		rollupOptions: {
			output: {
				manualChunks: undefined,
			},
		},
	},
	server: {
		port: 3002,
		host: true,
		proxy: {
			'/wp-json': {
				target: 'http://localhost:8083',
				changeOrigin: true,
				secure: false,
				headers: {
					'Origin': 'http://localhost:3002'
				}
			},
			'/wp-admin': {
				target: 'http://localhost:8083',
				changeOrigin: true,
				secure: false
			}
		}
	}
})
