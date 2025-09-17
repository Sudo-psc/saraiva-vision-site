// Debug script to capture JavaScript errors
const fs = require('fs');
const path = require('path');

console.log('=== DEBUG: Verificando erros JavaScript ===');

// Verificar arquivos que podem estar causando problemas
const problematicFiles = [
	'src/utils/healthcareMonitoringSystem.js',
	'src/utils/performanceOptimizer.js',
	'src/utils/webVitalsMonitoring.js',
	'src/utils/analytics.js',
	'src/utils/criticalCSS.js',
	'src/utils/serviceWorkerManager.js'
];

for (const file of problematicFiles) {
	const fullPath = path.join(__dirname, file);
	if (fs.existsSync(fullPath)) {
		console.log(`✓ ${file} existe`);
		try {
			const content = fs.readFileSync(fullPath, 'utf8');
			if (content.includes('throw') || content.includes('error')) {
				console.log(`⚠️  ${file} contém código de erro - verificar`);
			}
		} catch (e) {
			console.log(`❌ Erro ao ler ${file}:`, e.message);
		}
	} else {
		console.log(`❌ ${file} não existe`);
	}
}

console.log('\n=== Verificando logs do Node.js ===');
