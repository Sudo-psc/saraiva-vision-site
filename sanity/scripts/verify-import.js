#!/usr/bin/env node

/**
 * Script de Verificação da Importação
 */

import {createClient} from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config()

const client = createClient({
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2025-10-25',
  token: process.env.SANITY_TOKEN,
  useCdn: false
})

async function verify() {
  console.log('🔍 Verificando importação no Sanity CMS\n')

  try {
    // Contar posts
    const posts = await client.fetch('*[_type == "blogPost"]')
    console.log(`✅ Posts importados: ${posts.length}`)

    // Contar categorias
    const categories = await client.fetch('*[_type == "category"]')
    console.log(`✅ Categorias criadas: ${categories.length}`)
    categories.forEach(cat => {
      console.log(`   - ${cat.title}`)
    })

    // Contar autores
    const authors = await client.fetch('*[_type == "author"]')
    console.log(`\n✅ Autores criados: ${authors.length}`)
    authors.forEach(author => {
      console.log(`   - ${author.name}`)
    })

    // Mostrar alguns posts
    console.log(`\n📝 Primeiros 5 posts importados:`)
    posts.slice(0, 5).forEach((post, idx) => {
      console.log(`   ${idx + 1}. ${post.title}`)
      console.log(`      ID: ${post.id} | Sanity ID: ${post._id}`)
    })

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

verify()
