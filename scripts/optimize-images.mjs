#!/usr/bin/env node

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const images = [
	{
		input: 'public/img/hero.png',
		outputs: [
			{ format: 'webp', quality: 85 },
			{ format: 'avif', quality: 70 }
		]
	},
	{
		input: 'public/img/drphilipe_perfil.png',
		outputs: [
			{ format: 'webp', quality: 85 },
			{ format: 'avif', quality: 70 }
		]
	},
	{
		input: 'public/img/avatar-female-blonde.png',
		outputs: [
			{ format: 'webp', quality: 90 },
			{ format: 'avif', quality: 80 }
		]
	},
	{
		input: 'public/img/avatar-female-brunette.png',
		outputs: [
			{ format: 'webp', quality: 90 },
			{ format: 'avif', quality: 80 }
		]
	}
];

async function optimizeImages() {
	console.log('🎨 Iniciando otimização de imagens...');

	let totalSavings = 0;
	let originalTotal = 0;

	for (const imageConfig of images) {
		const { input, outputs } = imageConfig;

		try {
			// Verificar se arquivo original existe
			const originalStat = await fs.stat(input);
			originalTotal += originalStat.size;

			console.log(`\n📷 Processando: ${input} (${(originalStat.size / 1024 / 1024).toFixed(2)} MB)`);

			const baseName = path.basename(input, path.extname(input));
			const dir = path.dirname(input);

			for (const output of outputs) {
				const outputPath = path.join(dir, `${baseName}.${output.format}`);

				await sharp(input)
				[output.format]({
					quality: output.quality,
					effort: output.format === 'avif' ? 9 : 6 // Max effort for AVIF
				})
					.toFile(outputPath);

				const newStat = await fs.stat(outputPath);
				const savings = originalStat.size - newStat.size;
				totalSavings += savings;

				const savingsPercent = ((savings / originalStat.size) * 100).toFixed(1);
				console.log(`  ✅ ${output.format.toUpperCase()}: ${(newStat.size / 1024 / 1024).toFixed(2)} MB (-${savingsPercent}%)`);
			}
		} catch (error) {
			console.error(`❌ Erro ao processar ${input}:`, error.message);
		}
	}

	console.log(`\n📊 Resumo da Otimização:`);
	console.log(`💾 Tamanho original total: ${(originalTotal / 1024 / 1024).toFixed(2)} MB`);
	console.log(`💸 Economia total: ${(totalSavings / 1024 / 1024).toFixed(2)} MB`);
	console.log(`📈 Redução percentual: ${((totalSavings / originalTotal) * 100).toFixed(1)}%`);

	return { originalTotal, totalSavings };
}

if (import.meta.url === `file://${process.argv[1]}`) {
	optimizeImages()
		.then(({ totalSavings, originalTotal }) => {
			const reductionPercent = ((totalSavings / originalTotal) * 100).toFixed(1);
			if (parseFloat(reductionPercent) >= 30) {
				console.log(`\n🎯 Meta atingida! Redução de ${reductionPercent}% (≥30%)`);
				process.exit(0);
			} else {
				console.log(`\n⚠️  Meta não atingida. Redução de ${reductionPercent}% (<30%)`);
				process.exit(1);
			}
		})
		.catch(error => {
			console.error('💥 Erro na otimização:', error);
			process.exit(1);
		});
}
