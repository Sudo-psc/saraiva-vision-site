#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎨 Verificação de Adequação de Imagens ao Conteúdo\n');
console.log('=' .repeat(70));
console.log('\n');

// Read posts
const postsPath = path.join(__dirname, '../src/data/blogPosts.js');
const postsContent = fs.readFileSync(postsPath, 'utf8');

// Extract comprehensive post data
const postBlockRegex = /{[\s\S]*?"id":\s*(\d+)[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"image":\s*"([^"]+)"[\s\S]*?"category":\s*"([^"]+)"[\s\S]*?"tags":\s*\[([\s\S]*?)\][\s\S]*?}/g;

const posts = [];
let match;

while ((match = postBlockRegex.exec(postsContent)) !== null) {
  const [, id, title, image, category, tagsStr] = match;

  // Extract tags
  const tagMatches = tagsStr.match(/"([^"]+)"/g);
  const tags = tagMatches ? tagMatches.map(t => t.replace(/"/g, '')) : [];

  posts.push({
    id: parseInt(id),
    title,
    image: path.basename(image),
    category,
    tags: tags.slice(0, 5) // Limit to first 5 tags for display
  });

  if (posts.length >= 25) break; // Limit to avoid excessive processing
}

console.log(`📊 Analisando ${posts.length} posts...\n\n`);

// Analyze image relevance
const issues = [];

posts.forEach(post => {
  const imageBaseName = post.image
    .replace(/capa-/g, '')
    .replace(/-optimized.*$/g, '')
    .replace(/-\d+w/g, '')
    .replace(/\.(webp|avif|jpe?g|png)$/g, '')
    .toLowerCase();

  const titleLower = post.title.toLowerCase();
  const tagsLower = post.tags.join(' ').toLowerCase();

  // Extract key terms from image filename
  const imageTerms = imageBaseName.split('-').filter(t => t.length > 2);

  // Check if image terms are relevant to content
  const relevantTerms = imageTerms.filter(term => {
    return titleLower.includes(term) || tagsLower.includes(term);
  });

  const relevanceRatio = relevantTerms.length / Math.max(imageTerms.length, 1);

  // Check for generic/placeholder images
  const isGeneric = imageBaseName.includes('geral') ||
                     imageBaseName.includes('post-') ||
                     imageBaseName.includes('gemini') ||
                     imageBaseName.includes('imagen4') ||
                     imageBaseName.includes('capa-capa');

  const status = isGeneric ? '🔶 GENÉRICA' :
                 relevanceRatio >= 0.5 ? '✅ ADEQUADA' :
                 relevanceRatio >= 0.3 ? '⚠️  PARCIAL' :
                 '❌ IRRELEVANTE';

  console.log(`${status} - Post ${post.id}`);
  console.log(`   Título: ${post.title.substring(0, 60)}...`);
  console.log(`   Imagem: ${post.image.substring(0, 60)}`);
  console.log(`   Categoria: ${post.category}`);

  if (isGeneric) {
    console.log(`   ⚠️  Imagem genérica detectada - considere imagem mais específica`);
    issues.push({
      id: post.id,
      title: post.title,
      image: post.image,
      issue: 'Imagem genérica ou placeholder'
    });
  } else if (relevanceRatio < 0.5) {
    console.log(`   ⚠️  Relevância: ${(relevanceRatio * 100).toFixed(0)}% - baixa correspondência com conteúdo`);
    console.log(`   🔍 Termos da imagem: ${imageTerms.join(', ')}`);
    console.log(`   🔍 Termos relevantes: ${relevantTerms.join(', ') || 'nenhum'}`);
    issues.push({
      id: post.id,
      title: post.title,
      image: post.image,
      issue: `Baixa relevância (${(relevanceRatio * 100).toFixed(0)}%)`
    });
  } else {
    console.log(`   ✅ Relevância: ${(relevanceRatio * 100).toFixed(0)}%`);
  }

  console.log('');
});

console.log('\n' + '='.repeat(70));
console.log('\n📋 RESUMO:\n');
console.log(`   Posts analisados: ${posts.length}`);
console.log(`   ✅ Imagens adequadas: ${posts.length - issues.length}`);
console.log(`   ⚠️  Possíveis problemas: ${issues.length}`);
console.log('\n');

if (issues.length > 0) {
  console.log('⚠️  ATENÇÃO - Imagens que podem precisar de revisão:\n');
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. Post ${issue.id}: ${issue.title.substring(0, 50)}...`);
    console.log(`   Problema: ${issue.issue}`);
    console.log(`   Imagem: ${issue.image}\n`);
  });

  console.log('💡 RECOMENDAÇÃO:');
  console.log('   - Revise as imagens listadas acima');
  console.log('   - Considere usar imagens mais específicas para o conteúdo');
  console.log('   - Evite imagens genéricas ou placeholders em produção\n');
} else {
  console.log('🎉 Todas as imagens parecem adequadas ao conteúdo dos posts!\n');
}

console.log('='.repeat(70) + '\n');

// Validation tips
console.log('💡 DICAS PARA VALIDAÇÃO MANUAL:\n');
console.log('   1. Abra http://localhost:3002/blog no navegador');
console.log('   2. Verifique se as imagens carregam corretamente');
console.log('   3. Confirme se as imagens refletem o tema do post');
console.log('   4. Verifique se não há imagens quebradas ou com baixa qualidade\n');
