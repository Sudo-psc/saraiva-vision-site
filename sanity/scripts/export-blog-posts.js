#!/usr/bin/env node

/**
 * Script de Exportação de Posts do Blog para Sanity CMS
 *
 * Este script migra posts do sistema estático (src/data/blogPosts.js)
 * para o Sanity CMS, criando as estruturas necessárias.
 *
 * Autor: Dr. Philipe Saraiva Cruz
 * Data: 2025-10-25
 */

import {createClient} from '@sanity/client'
import {join, dirname} from 'path'
import {fileURLToPath} from 'url'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente do arquivo .env
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuração do cliente Sanity
const client = createClient({
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2025-10-25',
  token: process.env.SANITY_TOKEN, // Token deve ser configurado via env var
  useCdn: false
})

// Ler posts do arquivo estático
async function loadBlogPosts() {
  try {
    const blogPostsPath = join(__dirname, '../../src/data/blogPosts.js')

    // Usar dynamic import para carregar o módulo ES6
    const module = await import(`file://${blogPostsPath}`)
    const blogPosts = module.blogPosts

    if (!blogPosts || !Array.isArray(blogPosts)) {
      throw new Error('Não foi possível carregar o array blogPosts do arquivo')
    }

    console.log(`✅ Carregados ${blogPosts.length} posts do arquivo estático`)
    return blogPosts
  } catch (error) {
    console.error('❌ Erro ao carregar posts:', error.message)
    process.exit(1)
  }
}

// Criar ou obter categoria
async function getOrCreateCategory(categoryName) {
  try {
    // Buscar categoria existente
    const query = '*[_type == "category" && title == $title][0]'
    const existing = await client.fetch(query, { title: categoryName })

    if (existing) {
      console.log(`  ↳ Categoria encontrada: ${categoryName}`)
      return existing._id
    }

    // Criar nova categoria
    const slug = categoryName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    const category = await client.create({
      _type: 'category',
      title: categoryName,
      slug: {
        _type: 'slug',
        current: slug
      }
    })

    console.log(`  ✅ Categoria criada: ${categoryName}`)
    return category._id
  } catch (error) {
    console.error(`  ❌ Erro ao criar categoria ${categoryName}:`, error.message)
    throw error
  }
}

// Criar ou obter autor
async function getOrCreateAuthor(authorName) {
  try {
    // Buscar autor existente
    const query = '*[_type == "author" && name == $name][0]'
    const existing = await client.fetch(query, { name: authorName })

    if (existing) {
      console.log(`  ↳ Autor encontrado: ${authorName}`)
      return existing._id
    }

    // Criar novo autor
    const slug = authorName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    const author = await client.create({
      _type: 'author',
      name: authorName,
      slug: {
        _type: 'slug',
        current: slug
      },
      credentials: authorName.includes('Dr.') ? 'Oftalmologista - CRM MG' : undefined
    })

    console.log(`  ✅ Autor criado: ${authorName}`)
    return author._id
  } catch (error) {
    console.error(`  ❌ Erro ao criar autor ${authorName}:`, error.message)
    throw error
  }
}

// Converter HTML para texto simples (temporário)
// TODO: Futuramente converter para block content estruturado
function htmlToBlockContent(html) {
  // Por enquanto, vamos manter o HTML original em um campo separado
  // e criar um block content básico
  return [
    {
      _type: 'block',
      _key: 'content',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'text',
          text: 'Conteúdo HTML disponível no campo "HTML Content (Legacy)"',
          marks: []
        }
      ]
    }
  ]
}

// Exportar um post
async function exportPost(post, index, total) {
  try {
    console.log(`\n[${index + 1}/${total}] Exportando: ${post.title}`)

    // Verificar se post já existe
    const query = '*[_type == "blogPost" && id == $id][0]'
    const existing = await client.fetch(query, { id: post.id })

    if (existing) {
      console.log(`  ⚠️  Post já existe (ID: ${post.id}) - Pulando`)
      return { skipped: true, id: existing._id }
    }

    // Obter ou criar categoria e autor
    const categoryId = await getOrCreateCategory(post.category)
    const authorId = await getOrCreateAuthor(post.author)

    // Preparar dados do post
    const sanityPost = {
      _type: 'blogPost',
      id: post.id,
      title: post.title,
      slug: {
        _type: 'slug',
        current: post.slug
      },
      excerpt: post.excerpt,
      content: htmlToBlockContent(post.content),
      htmlContent: post.content, // Manter HTML original
      legacyImageUrl: post.image,
      author: {
        _type: 'reference',
        _ref: authorId
      },
      category: {
        _type: 'reference',
        _ref: categoryId
      },
      tags: post.tags || [],
      publishedAt: new Date(post.date).toISOString(),
      featured: Boolean(post.featured),
      seo: post.seo ? {
        _type: 'seo',
        metaTitle: post.seo.metaTitle,
        metaDescription: post.seo.metaDescription,
        keywords: post.seo.keywords || []
      } : undefined,
      relatedPodcasts: post.relatedPodcasts || []
    }

    // Criar post no Sanity
    const created = await client.create(sanityPost)
    console.log(`  ✅ Post criado com sucesso (Sanity ID: ${created._id})`)

    return { success: true, id: created._id }
  } catch (error) {
    console.error(`  ❌ Erro ao exportar post:`, error.message)
    return { error: error.message }
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando exportação de posts para Sanity CMS\n')
  console.log('📋 Configuração:')
  console.log(`   - Project ID: 92ocrdmp`)
  console.log(`   - Dataset: production`)
  console.log(`   - API Version: 2025-10-25\n`)

  // Verificar token
  if (!process.env.SANITY_TOKEN) {
    console.error('❌ ERRO: Variável de ambiente SANITY_TOKEN não configurada')
    console.log('\n💡 Dica: Crie um token em https://sanity.io/manage')
    console.log('   Depois execute: export SANITY_TOKEN="seu-token-aqui"\n')
    process.exit(1)
  }

  console.log('   - Token: configurado')

  // Carregar posts
  const posts = await loadBlogPosts()

  console.log(`\n📝 Iniciando exportação de ${posts.length} posts...\n`)
  console.log('─'.repeat(60))

  // Estatísticas
  const stats = {
    total: posts.length,
    success: 0,
    skipped: 0,
    errors: 0
  }

  // Exportar cada post
  for (let i = 0; i < posts.length; i++) {
    const result = await exportPost(posts[i], i, posts.length)

    if (result.success) stats.success++
    else if (result.skipped) stats.skipped++
    else stats.errors++

    // Pequena pausa para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Resultado final
  console.log('\n' + '─'.repeat(60))
  console.log('\n📊 Resultado da Exportação:\n')
  console.log(`   Total de posts: ${stats.total}`)
  console.log(`   ✅ Criados: ${stats.success}`)
  console.log(`   ⚠️  Pulados: ${stats.skipped}`)
  console.log(`   ❌ Erros: ${stats.errors}`)

  if (stats.errors === 0 && stats.success > 0) {
    console.log('\n🎉 Exportação concluída com sucesso!')
  } else if (stats.errors > 0) {
    console.log('\n⚠️  Exportação concluída com alguns erros')
  }

  console.log('\n💡 Próximos passos:')
  console.log('   1. Fazer upload das imagens para Sanity')
  console.log('   2. Converter HTML para block content estruturado')
  console.log('   3. Configurar relacionamentos entre posts')
  console.log('   4. Atualizar frontend para consumir dados do Sanity\n')
}

// Executar
main().catch(error => {
  console.error('\n❌ Erro fatal:', error)
  process.exit(1)
})
