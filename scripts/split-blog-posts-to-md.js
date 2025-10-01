/**
 * Script para migrar posts de blogPosts.js para arquivos Markdown individuais
 * Uso: node scripts/split-blog-posts-to-md.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar os posts originais
const blogPostsPath = path.join(__dirname, '../src/data/blogPosts.js');
const outputDir = path.join(__dirname, '../src/content/blog');

// Ler e parsear o arquivo
const fileContent = fs.readFileSync(blogPostsPath, 'utf-8');

// Extrair o array de posts usando regex
const postsArrayMatch = fileContent.match(/export const blogPosts = \[([\s\S]+)\];/);
if (!postsArrayMatch) {
  console.error('❌ Não foi possível encontrar o array blogPosts');
  process.exit(1);
}

// Criar diretório de saída se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`✅ Diretório criado: ${outputDir}`);
}

/**
 * Extrai posts do JavaScript de forma manual (sem eval)
 */
function extractPosts(fileContent) {
  const posts = [];
  const lines = fileContent.split('\n');

  let currentPost = null;
  let inContent = false;
  let contentBuffer = [];
  let braceCount = 0;
  let insidePost = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detectar início de novo post
    if (trimmed === '{' && !insidePost && !inContent) {
      insidePost = true;
      currentPost = {};
      braceCount = 1;
      continue;
    }

    if (!insidePost) continue;

    // Detectar início de content
    if (trimmed.startsWith('content:') && trimmed.includes('`')) {
      inContent = true;
      contentBuffer = [];
      continue;
    }

    // Coletar linhas de content
    if (inContent) {
      if (trimmed.includes('`,' ) || (trimmed === '`,' && i < lines.length - 1 && lines[i+1].trim().startsWith('author:'))) {
        inContent = false;
        currentPost.content = contentBuffer.join('\n');
        continue;
      }
      contentBuffer.push(line.replace(/^\s{6}/, '')); // Remove indentação
      continue;
    }

    // Parse campos simples
    const idMatch = line.match(/^\s*id:\s*(\d+),?$/);
    if (idMatch) {
      currentPost.id = parseInt(idMatch[1]);
      continue;
    }

    const slugMatch = line.match(/^\s*slug:\s*['"]([^'"]+)['"],?$/);
    if (slugMatch) {
      currentPost.slug = slugMatch[1];
      continue;
    }

    const titleMatch = line.match(/^\s*title:\s*['"]([^'"]+)['"],?$/);
    if (titleMatch) {
      currentPost.title = titleMatch[1];
      continue;
    }

    const excerptMatch = line.match(/^\s*excerpt:\s*['"]([^'"]+)['"],?$/);
    if (excerptMatch) {
      currentPost.excerpt = excerptMatch[1];
      continue;
    }

    const authorMatch = line.match(/^\s*author:\s*['"]([^'"]+)['"],?$/);
    if (authorMatch) {
      currentPost.author = authorMatch[1];
      continue;
    }

    const dateMatch = line.match(/^\s*date:\s*['"]([^'"]+)['"],?$/);
    if (dateMatch) {
      currentPost.date = dateMatch[1];
      continue;
    }

    const categoryMatch = line.match(/^\s*category:\s*['"]([^'"]+)['"],?$/);
    if (categoryMatch) {
      currentPost.category = categoryMatch[1];
      continue;
    }

    const imageMatch = line.match(/^\s*image:\s*['"]([^'"]+)['"],?$/);
    if (imageMatch) {
      currentPost.image = imageMatch[1];
      continue;
    }

    const featuredMatch = line.match(/^\s*featured:\s*(true|false),?$/);
    if (featuredMatch) {
      currentPost.featured = featuredMatch[1] === 'true';
      continue;
    }

    // Parse tags array
    if (trimmed.startsWith('tags:') && trimmed.includes('[')) {
      const tagsMatch = line.match(/tags:\s*\[(.*)\]/);
      if (tagsMatch) {
        currentPost.tags = tagsMatch[1]
          .split(',')
          .map(t => t.trim().replace(/['"]/g, ''))
          .filter(Boolean);
      }
      continue;
    }

    // Parse objeto SEO
    if (trimmed.startsWith('seo:') && trimmed.includes('{')) {
      currentPost.seo = {};
      let j = i + 1;
      while (j < lines.length && !lines[j].includes('}')) {
        const seoLine = lines[j].trim();
        const metaDescMatch = seoLine.match(/metaDescription:\s*['"]([^'"]+)['"]/);
        if (metaDescMatch) currentPost.seo.metaDescription = metaDescMatch[1];

        const keywordsMatch = seoLine.match(/keywords:\s*['"]([^'"]+)['"]/);
        if (keywordsMatch) currentPost.seo.keywords = keywordsMatch[1];

        const ogImageMatch = seoLine.match(/ogImage:\s*['"]([^'"]+)['"]/);
        if (ogImageMatch) currentPost.seo.ogImage = ogImageMatch[1];

        j++;
      }
      i = j;
      continue;
    }

    // Detectar fim de post
    if (trimmed === '},') {
      insidePost = false;
      if (currentPost && currentPost.id) {
        posts.push(currentPost);
      }
      currentPost = null;
    }
  }

  return posts;
}

/**
 * Converte HTML para Markdown simplificado
 */
function htmlToMarkdown(html) {
  return html
    .replace(/<h2>(.*?)<\/h2>/g, '\n## $1\n')
    .replace(/<h3>(.*?)<\/h3>/g, '\n### $1\n')
    .replace(/<h4>(.*?)<\/h4>/g, '\n#### $1\n')
    .replace(/<p>(.*?)<\/p>/g, '\n$1\n')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<ul>/g, '\n')
    .replace(/<\/ul>/g, '\n')
    .replace(/<li>(.*?)<\/li>/g, '- $1')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/^\s+/, '') // Remove espaços iniciais
    .replace(/\n{3,}/g, '\n\n') // Normaliza quebras de linha
    .trim();
}

/**
 * Cria arquivo Markdown para um post
 */
function createMarkdownFile(post) {
  const { slug, id, title, excerpt, content, author, date, category, tags, image, featured, seo } = post;

  if (!slug) {
    console.warn(`⚠️  Post ${id} não tem slug, pulando...`);
    return;
  }

  // Converter content HTML para Markdown
  const markdownContent = content ? htmlToMarkdown(content) : '';

  // Criar frontmatter YAML
  const frontmatter = `---
id: ${id}
slug: ${slug}
title: ${title || 'Sem título'}
excerpt: ${excerpt || ''}
author: ${author || 'Dr. Philipe Saraiva Cruz'}
date: ${date || '2025-01-01'}
category: ${category || 'Geral'}${tags && tags.length > 0 ? `
tags:${tags.map(tag => `\n  - ${tag}`).join('')}` : ''}
image: ${image || '/Blog/default.png'}${featured ? `
featured: true` : ''}${seo ? `
seo:
  metaDescription: ${seo.metaDescription || excerpt || ''}
  keywords: ${seo.keywords || ''}
  ogImage: ${seo.ogImage || image || '/Blog/default.png'}` : ''}
---
`;

  const fullContent = frontmatter + '\n' + markdownContent;

  // Salvar arquivo
  const filename = `${slug}.md`;
  const filepath = path.join(outputDir, filename);

  try {
    fs.writeFileSync(filepath, fullContent, 'utf-8');
    console.log(`✅ Criado: ${filename}`);
  } catch (error) {
    console.error(`❌ Erro ao criar ${filename}:`, error.message);
  }
}

/**
 * Função principal
 */
function main() {
  console.log('🚀 Iniciando migração de posts...\n');

  try {
    const posts = extractPosts(fileContent);
    console.log(`📄 Encontrados ${posts.length} posts\n`);

    posts.forEach(post => createMarkdownFile(post));

    console.log(`\n✅ Migração completa! ${posts.length} arquivos criados em ${outputDir}`);
    console.log('\n📝 Próximos passos:');
    console.log('1. Criar src/content/blog/index.js com loader');
    console.log('2. Atualizar imports em BlogPage.jsx');
    console.log('3. Testar build com npm run build');
  } catch (error) {
    console.error('❌ Erro durante migração:', error.message);
    process.exit(1);
  }
}

main();
