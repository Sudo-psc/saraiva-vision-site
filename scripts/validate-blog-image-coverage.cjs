#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📊 Validação de Cobertura de Imagens do Blog\n');

// Read posts file
const postsPath = path.join(__dirname, '../src/data/blogPosts.js');
const postsContent = fs.readFileSync(postsPath, 'utf8');

// Extract image paths using improved regex
const imageMatches = postsContent.match(/"image":\s*"([^"]+)"/g);

if (!imageMatches) {
  console.log('❌ Nenhuma referência de imagem encontrada nos posts');
  process.exit(1);
}

const imagePaths = imageMatches.map(match => {
  const pathMatch = match.match(/"image":\s*"([^"]+)"/);
  return pathMatch ? pathMatch[1] : null;
}).filter(Boolean);

console.log(`✅ Encontrados ${imagePaths.length} posts com imagens\n`);

// Get available images
const publicBlogPath = path.join(__dirname, '../public/Blog');
const availableImages = fs.readdirSync(publicBlogPath);

// Check coverage for each format
const formats = ['webp', 'avif', 'jpeg', 'jpg', 'png'];
const results = {
  total: imagePaths.length,
  coverage: {},
  missing: {},
  recommendations: []
};

formats.forEach(format => {
  results.coverage[format] = 0;
  results.missing[format] = [];
});

console.log('🔍 Verificando cobertura de formatos...\n');

imagePaths.forEach((imgPath, index) => {
  const filename = path.basename(imgPath);
  const filenameWithoutExt = filename.replace(/\.(webp|avif|jpe?g|png)$/i, '');

  // Check each format
  formats.forEach(format => {
    const expectedFilename = `${filenameWithoutExt}.${format}`;
    const expectedOptimized = `${filenameWithoutExt}-1200w.${format}`;

    const exists = availableImages.includes(expectedFilename) ||
                   availableImages.includes(expectedOptimized) ||
                   availableImages.some(img => img.startsWith(filenameWithoutExt) && img.endsWith(`.${format}`));

    if (exists) {
      results.coverage[format]++;
    } else {
      results.missing[format].push({
        post: index + 1,
        path: imgPath,
        expected: expectedOptimized
      });
    }
  });
});

// Display results
console.log('📈 COBERTURA POR FORMATO:\n');

formats.forEach(format => {
  const percentage = ((results.coverage[format] / results.total) * 100).toFixed(1);
  const icon = percentage >= 90 ? '✅' : percentage >= 50 ? '⚠️' : '❌';

  console.log(`${icon} ${format.toUpperCase()}: ${results.coverage[format]}/${results.total} (${percentage}%)`);
});

console.log('\n');

// Show critical missing images (posts without WebP or AVIF)
const criticalMissing = imagePaths.filter((imgPath, index) => {
  const filename = path.basename(imgPath);
  const filenameWithoutExt = filename.replace(/\.(webp|avif|jpe?g|png)$/i, '');

  const hasWebP = availableImages.some(img => img.startsWith(filenameWithoutExt) && img.endsWith('.webp'));
  const hasAVIF = availableImages.some(img => img.startsWith(filenameWithoutExt) && img.endsWith('.avif'));

  return !hasWebP && !hasAVIF;
});

if (criticalMissing.length > 0) {
  console.log('🚨 POSTS SEM FORMATOS MODERNOS (WebP E AVIF):\n');
  criticalMissing.forEach((imgPath, i) => {
    console.log(`   ${i + 1}. ${path.basename(imgPath)}`);
  });
  console.log('\n');
}

// Recommendations
console.log('💡 RECOMENDAÇÕES:\n');

const webpCoverage = (results.coverage.webp / results.total) * 100;
const avifCoverage = (results.coverage.avif / results.total) * 100;

if (webpCoverage < 100) {
  console.log(`   ⚠️  ${results.total - results.coverage.webp} imagens sem formato WebP (economia de 25-35%)`);
}

if (avifCoverage < 100) {
  console.log(`   ⚠️  ${results.total - results.coverage.avif} imagens sem formato AVIF (economia de até 90%)`);
}

if (criticalMissing.length > 0) {
  console.log(`   🚨 ${criticalMissing.length} posts críticos sem formatos otimizados`);
}

console.log('\n📋 RESUMO:\n');
console.log(`   Posts analisados: ${results.total}`);
console.log(`   Cobertura WebP: ${webpCoverage.toFixed(1)}%`);
console.log(`   Cobertura AVIF: ${avifCoverage.toFixed(1)}%`);
console.log(`   Posts sem otimização: ${criticalMissing.length}`);

if (webpCoverage === 100 && avifCoverage === 100) {
  console.log('\n🎉 Excelente! Todas as imagens têm formatos otimizados!\n');
} else if (criticalMissing.length === 0) {
  console.log('\n✅ Bom! Todas as imagens têm pelo menos um formato otimizado.\n');
} else {
  console.log('\n⚠️  Atenção! Alguns posts precisam de imagens otimizadas.\n');
}
