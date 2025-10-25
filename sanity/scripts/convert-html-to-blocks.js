#!/usr/bin/env node

/**
 * Script de Conversão de HTML para Block Content
 *
 * Este script converte o conteúdo HTML dos posts para o formato
 * estruturado de Portable Text do Sanity.
 *
 * Autor: Dr. Philipe Saraiva Cruz
 * Data: 2025-10-25
 */

import {createClient} from '@sanity/client'
import {JSDOM} from 'jsdom'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2025-10-25',
  token: process.env.SANITY_TOKEN,
  useCdn: false
})

// Converter HTML para block content
function htmlToBlocks(html) {
  if (!html || html.trim() === '') {
    return []
  }

  const dom = new JSDOM(html)
  const document = dom.window.document
  const blocks = []

  // Processar cada elemento filho do body
  const elements = document.body.children

  for (const element of elements) {
    const block = convertElement(element)
    if (block) {
      if (Array.isArray(block)) {
        blocks.push(...block)
      } else {
        blocks.push(block)
      }
    }
  }

  return blocks
}

// Converter um elemento HTML para block
function convertElement(element) {
  const tagName = element.tagName.toLowerCase()

  switch (tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
      return createHeadingBlock(element, tagName)

    case 'p':
      return createParagraphBlock(element)

    case 'ul':
      return createListBlock(element, 'bullet')

    case 'ol':
      return createListBlock(element, 'number')

    case 'blockquote':
      return createBlockquoteBlock(element)

    case 'table':
      return createTableBlock(element)

    default:
      // Se for um elemento desconhecido, tentar extrair como parágrafo
      if (element.textContent && element.textContent.trim()) {
        return createParagraphBlock(element)
      }
      return null
  }
}

// Criar bloco de cabeçalho
function createHeadingBlock(element, tag) {
  const text = element.textContent.trim()
  if (!text) return null

  return {
    _type: 'block',
    _key: generateKey(),
    style: tag,
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text: text,
        marks: []
      }
    ]
  }
}

// Criar bloco de parágrafo
function createParagraphBlock(element) {
  const children = extractInlineContent(element)
  if (children.length === 0) return null

  return {
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    children: children
  }
}

// Criar bloco de lista
function createListBlock(element, listItem) {
  const items = element.querySelectorAll('li')
  const blocks = []

  for (const item of items) {
    const children = extractInlineContent(item)
    if (children.length > 0) {
      blocks.push({
        _type: 'block',
        _key: generateKey(),
        style: 'normal',
        listItem: listItem,
        children: children
      })
    }
  }

  return blocks
}

// Criar bloco de citação
function createBlockquoteBlock(element) {
  const children = extractInlineContent(element)
  if (children.length === 0) return null

  return {
    _type: 'block',
    _key: generateKey(),
    style: 'blockquote',
    children: children
  }
}

// Criar bloco de tabela (simplificado - tabelas são complexas no Portable Text)
function createTableBlock(element) {
  const text = element.textContent.trim()
  if (!text) return null

  return {
    _type: 'block',
    _key: generateKey(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text: `[Tabela: ${text.substring(0, 100)}...]`,
        marks: ['em']
      }
    ]
  }
}

// Extrair conteúdo inline (strong, em, links, etc)
function extractInlineContent(element) {
  const children = []
  const nodes = element.childNodes

  for (const node of nodes) {
    if (node.nodeType === 3) { // Text node
      const text = node.textContent
      if (text && text.trim()) {
        children.push({
          _type: 'span',
          _key: generateKey(),
          text: text,
          marks: []
        })
      }
    } else if (node.nodeType === 1) { // Element node
      const tagName = node.tagName.toLowerCase()

      if (tagName === 'strong' || tagName === 'b') {
        const text = node.textContent.trim()
        if (text) {
          children.push({
            _type: 'span',
            _key: generateKey(),
            text: text,
            marks: ['strong']
          })
        }
      } else if (tagName === 'em' || tagName === 'i') {
        const text = node.textContent.trim()
        if (text) {
          children.push({
            _type: 'span',
            _key: generateKey(),
            text: text,
            marks: ['em']
          })
        }
      } else if (tagName === 'a') {
        const text = node.textContent.trim()
        const href = node.getAttribute('href')
        if (text && href) {
          children.push({
            _type: 'span',
            _key: generateKey(),
            text: text,
            marks: [{
              _type: 'link',
              _key: generateKey(),
              href: href
            }]
          })
        }
      } else {
        // Para outros elementos, extrair o texto simples
        const text = node.textContent.trim()
        if (text) {
          children.push({
            _type: 'span',
            _key: generateKey(),
            text: text,
            marks: []
          })
        }
      }
    }
  }

  return children
}

// Gerar key única
function generateKey() {
  return Math.random().toString(36).substring(2, 15)
}

// Converter um post
async function convertPost(post) {
  try {
    console.log(`\n[${post.id}] ${post.title}`)

    if (!post.htmlContent || post.htmlContent.trim() === '') {
      console.log(`  ⚠️  Sem conteúdo HTML para converter`)
      return { skipped: true }
    }

    // Verificar se já tem block content
    if (post.content && post.content.length > 1) {
      console.log(`  ↳ Já possui block content estruturado - pulando`)
      return { skipped: true }
    }

    console.log(`  🔄 Convertendo HTML para block content...`)
    const blocks = htmlToBlocks(post.htmlContent)

    if (blocks.length === 0) {
      console.log(`  ⚠️  Nenhum bloco gerado da conversão`)
      return { error: 'No blocks generated' }
    }

    console.log(`  ✅ ${blocks.length} blocos criados`)

    // Atualizar post
    await client
      .patch(post._id)
      .set({ content: blocks })
      .commit()

    console.log(`  ✅ Post atualizado com block content`)

    return { success: true, blocks: blocks.length }
  } catch (error) {
    console.error(`  ❌ Erro:`, error.message)
    return { error: error.message }
  }
}

// Função principal
async function main() {
  console.log('📝 Iniciando conversão de HTML para Block Content\n')

  // Buscar todos os posts
  const posts = await client.fetch('*[_type == "blogPost"]{ _id, id, title, htmlContent, content }')
  console.log(`Encontrados ${posts.length} posts\n`)

  let converted = 0
  let skipped = 0
  let errors = 0

  for (const post of posts) {
    const result = await convertPost(post)

    if (result.success) converted++
    else if (result.skipped) skipped++
    else errors++

    // Pequena pausa
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Resultado final
  console.log('\n' + '─'.repeat(60))
  console.log('\n📊 Resultado da Conversão:\n')
  console.log(`   Total de posts: ${posts.length}`)
  console.log(`   ✅ Convertidos: ${converted}`)
  console.log(`   ⚠️  Pulados: ${skipped}`)
  console.log(`   ❌ Erros: ${errors}`)

  if (errors === 0 && converted > 0) {
    console.log('\n🎉 Conversão concluída com sucesso!')
  }

  console.log('\n💡 Próximo passo: Visualizar no Sanity Studio')
  console.log('   Acesse: http://localhost:3333\n')
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error)
  process.exit(1)
})
