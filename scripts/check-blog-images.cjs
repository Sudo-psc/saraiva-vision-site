#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read blog posts
const postsPath = path.join(__dirname, '../src/data/blogPosts.js');
const postsContent = fs.readFileSync(postsPath, 'utf8');

// Extract image references using regex
const imageMatches = postsContent.match(/image:\s*["']([^"']+)["']/g);
const images = imageMatches ? imageMatches.map(match => {
  const imageMatch = match.match(/["']([^"']+)["']/);
  return imageMatch ? imageMatch[1] : null;
}).filter(Boolean) : [];

console.log('📊 Análise de Imagens do Blog\n');
console.log(`Total de referências de imagens: ${images.length}\n`);

// Check if images exist
const publicBlogPath = path.join(__dirname, '../public/Blog');
const existingImages = fs.readdirSync(publicBlogPath);

console.log('🔍 Verificando existência das imagens:\n');

const missing = [];
const found = [];
const wrongExtension = [];

images.forEach((img, index) => {
  const imgPath = img.replace('/Blog/', '');
  const exists = existingImages.includes(imgPath);

  if (!exists) {
    // Check if image exists with different extension
    const baseName = imgPath.replace(/\.(webp|jpg|jpeg|png)$/, '');
    const possibleExtensions = ['.webp', '.jpg', '.jpeg', '.png'];
    let foundWithDifferentExt = false;

    for (const ext of possibleExtensions) {
      if (existingImages.includes(baseName + ext)) {
        wrongExtension.push({
          referenced: imgPath,
          found: baseName + ext,
          post: index + 1
        });
        foundWithDifferentExt = true;
        break;
      }
    }

    if (!foundWithDifferentExt) {
      missing.push({ image: imgPath, post: index + 1 });
    }
  } else {
    found.push(imgPath);
  }
});

console.log(`✅ Imagens encontradas: ${found.length}`);
console.log(`⚠️  Imagens com extensão diferente: ${wrongExtension.length}`);
console.log(`❌ Imagens faltando: ${missing.length}\n`);

if (wrongExtension.length > 0) {
  console.log('⚠️  Imagens com extensão diferente da referenciada:\n');
  wrongExtension.forEach(item => {
    console.log(`   Post ${item.post}: ${item.referenced} → EXISTE COMO: ${item.found}`);
  });
  console.log('');
}

if (missing.length > 0) {
  console.log('❌ Imagens faltando:\n');
  missing.forEach(item => {
    console.log(`   Post ${item.post}: ${item.image}`);
  });
  console.log('');
}

// Check for orphaned images (images not referenced in any post)
console.log('🔍 Verificando imagens órfãs (não referenciadas em nenhum post):\n');
const optimizedImages = existingImages.filter(img => img.includes('optimized-1200w'));
const referencedImageNames = images.map(img => path.basename(img));
const orphaned = optimizedImages.filter(img => !referencedImageNames.includes(img));

console.log(`📁 Total de imagens otimizadas: ${optimizedImages.length}`);
console.log(`🔗 Imagens referenciadas: ${referencedImageNames.length}`);
console.log(`🗑️  Imagens órfãs: ${orphaned.length}\n`);

if (orphaned.length > 0) {
  console.log('Imagens órfãs:');
  orphaned.forEach(img => console.log(`   - ${img}`));
}

// Summary
console.log('\n📋 RESUMO:\n');
console.log(`   Posts analisados: ${images.length}`);
console.log(`   Imagens OK: ${found.length} ✅`);
console.log(`   Extensões diferentes: ${wrongExtension.length} ⚠️`);
console.log(`   Imagens faltando: ${missing.length} ❌`);
console.log(`   Imagens órfãs: ${orphaned.length} 🗑️\n`);
