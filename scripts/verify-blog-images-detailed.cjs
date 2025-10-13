#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificação Detalhada de Imagens do Blog\n');
console.log('=' .repeat(70));
console.log('\n');

// Read posts
const postsPath = path.join(__dirname, '../src/data/blogPosts.js');
const postsContent = fs.readFileSync(postsPath, 'utf8');

// Extract posts with better regex
const postMatches = postsContent.match(/"id":\s*\d+[\s\S]*?"image":\s*"([^"]+)"[\s\S]*?"title":\s*"([^"]+)"/g);

if (!postMatches) {
  console.log('❌ Não foi possível extrair posts');
  process.exit(1);
}

const posts = postMatches.map(match => {
  const idMatch = match.match(/"id":\s*(\d+)/);
  const imageMatch = match.match(/"image":\s*"([^"]+)"/);
  const titleMatch = match.match(/"title":\s*"([^"]+)"/);

  return {
    id: idMatch ? parseInt(idMatch[1]) : 0,
    image: imageMatch ? imageMatch[1] : '',
    title: titleMatch ? titleMatch[1].substring(0, 60) : 'Sem título'
  };
});

console.log(`📊 Total de posts encontrados: ${posts.length}\n`);

// Get available images
const publicBlogPath = path.join(__dirname, '../public/Blog');
const availableImages = fs.readdirSync(publicBlogPath);

// Check each post
const problems = [];
let successCount = 0;

console.log('🔍 VERIFICANDO POSTS:\n');

posts.forEach((post, index) => {
  const filename = path.basename(post.image);
  const filenameWithoutExt = filename.replace(/\.(webp|avif|jpe?g|png)$/i, '');

  // Check if image exists (any format)
  const hasWebP = availableImages.some(img => img.startsWith(filenameWithoutExt) && img.endsWith('.webp'));
  const hasAVIF = availableImages.some(img => img.startsWith(filenameWithoutExt) && img.endsWith('.avif'));
  const hasJPEG = availableImages.some(img => img.startsWith(filenameWithoutExt) && (img.endsWith('.jpeg') || img.endsWith('.jpg')));
  const hasPNG = availableImages.some(img => img.startsWith(filenameWithoutExt) && img.endsWith('.png'));

  const hasAny = hasWebP || hasAVIF || hasJPEG || hasPNG;

  if (!hasAny) {
    console.log(`❌ Post ${post.id}: "${post.title}"`);
    console.log(`   Imagem: ${filename}`);
    console.log(`   ⚠️  NENHUM FORMATO ENCONTRADO\n`);
    problems.push({
      id: post.id,
      title: post.title,
      image: filename,
      issue: 'Imagem não encontrada em nenhum formato'
    });
  } else {
    const formats = [];
    if (hasWebP) formats.push('WebP');
    if (hasAVIF) formats.push('AVIF');
    if (hasJPEG) formats.push('JPEG');
    if (hasPNG) formats.push('PNG');

    const icon = (hasWebP && hasAVIF) ? '✅' : (hasWebP || hasAVIF) ? '⚠️' : '🔶';

    console.log(`${icon} Post ${post.id}: "${post.title}"`);
    console.log(`   Imagem: ${filename}`);
    console.log(`   Formatos: ${formats.join(', ')}`);

    if (!hasWebP || !hasAVIF) {
      const missing = [];
      if (!hasWebP) missing.push('WebP');
      if (!hasAVIF) missing.push('AVIF');
      console.log(`   ⚠️  Faltam: ${missing.join(', ')}`);
      problems.push({
        id: post.id,
        title: post.title,
        image: filename,
        issue: `Faltam formatos: ${missing.join(', ')}`
      });
    } else {
      successCount++;
    }
    console.log('');
  }
});

console.log('\n' + '='.repeat(70));
console.log('\n📋 RESUMO FINAL:\n');
console.log(`   Total de posts: ${posts.length}`);
console.log(`   ✅ Posts com todos os formatos: ${successCount}`);
console.log(`   ⚠️  Posts com problemas: ${problems.length}`);
console.log('\n');

if (problems.length > 0) {
  console.log('📝 LISTA DE PROBLEMAS:\n');
  problems.forEach((problem, i) => {
    console.log(`${i + 1}. Post ${problem.id}: ${problem.title}`);
    console.log(`   - ${problem.issue}`);
    console.log(`   - Arquivo: ${problem.image}\n`);
  });
}

// Recommendations
console.log('💡 RECOMENDAÇÕES:\n');

if (problems.length === 0) {
  console.log('   🎉 Excelente! Todas as imagens estão otimizadas!\n');
} else {
  const missingImages = problems.filter(p => p.issue.includes('não encontrada'));
  const missingFormats = problems.filter(p => p.issue.includes('Faltam formatos'));

  if (missingImages.length > 0) {
    console.log(`   🚨 ${missingImages.length} imagem(ns) completamente ausente(s) - URGENTE!`);
  }

  if (missingFormats.length > 0) {
    console.log(`   ⚠️  ${missingFormats.length} imagem(ns) sem todos os formatos otimizados`);
    console.log('   💡 Execute: npm run optimize:images para gerar formatos faltantes');
  }
  console.log('');
}

console.log('=' + ''.repeat(70) + '\n');

// Exit code based on problems
process.exit(problems.filter(p => p.issue.includes('não encontrada')).length > 0 ? 1 : 0);
