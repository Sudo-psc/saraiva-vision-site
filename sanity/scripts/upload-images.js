#!/usr/bin/env node

/**
 * Script de Upload de Imagens para Sanity CMS
 *
 * Este script faz upload das imagens dos posts do blog para o Sanity
 * e atualiza as referências nos posts.
 *
 * Autor: Dr. Philipe Saraiva Cruz
 * Data: 2025-10-25
 */

import {createClient} from '@sanity/client'
import {createReadStream, existsSync} from 'fs'
import {join, dirname} from 'path'
import {fileURLToPath} from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Carregar variáveis de ambiente
dotenv.config()

const client = createClient({
  projectId: '92ocrdmp',
  dataset: 'production',
  apiVersion: '2025-10-25',
  token: process.env.SANITY_TOKEN,
  useCdn: false
})

// Mapeamento de imagens legadas para arquivos
const imageMapping = {
  '/Blog/capa-monovisao-lentes-multifocais-presbiopia-optimized-1200w.webp': 'capa-monovisao-lentes-multifocais-presbiopia-optimized-1200w.webp',
  '/Blog/capa-lentes-contato-tipos-optimized-1200w.webp': 'capa-lentes-contato-tipos-optimized-1200w.webp',
  '/Blog/capa-amaurose-congenita-leber-optimized-1200w.webp': 'capa-amaurose-congenita-leber-optimized-1200w.webp',
  '/Blog/capa-teste-olhinho-optimized-1200w.webp': 'capa-teste-olhinho-optimized-1200w.webp',
  '/Blog/capa-retinose-pigmentar-optimized-1200w.webp': 'capa-retinose-pigmentar-optimized-1200w.webp',
  '/Blog/capa-moscas-volantes-optimized-1200w.webp': 'capa-moscas-volantes-optimized-1200w.webp',
  '/Blog/capa-cuidados-visuais-esportes-optimized-1200w.webp': 'capa-cuidados-visuais-esportes-optimized-1200w.webp',
  '/Blog/capa-lentes-daltonismo-optimized-1200w.webp': 'capa-lentes-daltonismo-optimized-1200w.webp',
  '/Blog/capa-descolamento-retina-optimized-1200w.webp': 'capa-descolamento-retina-optimized-1200w.webp',
  '/Blog/futuristic-eye-examination-optimized-1200w.webp': 'futuristic-eye-examination-optimized-1200w.webp',
  '/Blog/capa-pediatria-optimized-1200w.webp': 'capa-pediatria-optimized-1200w.webp',
  '/Blog/capa-terapias-geneticas-optimized-1200w.webp': 'capa-terapias-geneticas-optimized-1200w.webp',
  '/Blog/capa-digital-optimized-1200w.webp': 'capa-digital-optimized-1200w.webp',
  '/Blog/capa-olho-seco-optimized-1200w.webp': 'capa-olho-seco-optimized-1200w.webp',
  '/Blog/capa-estrabismo-tratamento-optimized-1200w.webp': 'capa-estrabismo-tratamento-optimized-1200w.webp',
  '/Blog/capa-alimentacao-microbioma-ocular-optimized-1200w.webp': 'capa-alimentacao-microbioma-ocular-optimized-1200w.webp',
  '/Blog/capa-geral-optimized-1200w.webp': 'capa-geral-optimized-1200w.webp',
  '/Blog/capa-cirurgia-refrativa-optimized-1200w.webp': 'capa-cirurgia-refrativa-optimized-1200w.webp',
  '/Blog/capa-lentes-presbiopia-optimized-1200w.webp': 'capa-lentes-presbiopia-optimized-1200w.webp',
  '/Blog/pterigio-capa-optimized-1200w.webp': 'pterigio-capa-optimized-1200w.webp',
  '/Blog/capa-sensibilidade-luz-fotofobia-optimized-1200w.webp': 'capa-sensibilidade-luz-fotofobia-optimized-1200w.webp',
  '/Blog/capa-presbiopia-optimized-1200w.webp': 'capa-presbiopia-optimized-1200w.webp',
  '/Blog/capa-ductolacrimal-optimized.webp': 'capa-ductolacrimal-optimized-1200w.webp',
  '/Blog/capa-lentes-premium-catarata-optimized.webp': 'capa-lentes-premium-catarata-optimized-1200w.webp',
  '/Blog/capa-pediatria.webp': 'capa-pediatria-optimized-1200w.webp'
}

// Função para fazer upload de uma imagem
async function uploadImage(imagePath, filename) {
  try {
    const fullPath = join(__dirname, '../../public/Blog', filename)

    if (!existsSync(fullPath)) {
      console.log(`  ⚠️  Imagem não encontrada: ${filename}`)
      return null
    }

    console.log(`  📤 Fazendo upload: ${filename}`)

    const stream = createReadStream(fullPath)
    const asset = await client.assets.upload('image', stream, {
      filename: filename
    })

    console.log(`  ✅ Upload concluído: ${asset._id}`)
    return asset
  } catch (error) {
    console.error(`  ❌ Erro ao fazer upload de ${filename}:`, error.message)
    return null
  }
}

// Função para atualizar post com imagem
async function updatePostWithImage(post, imageAsset) {
  try {
    await client
      .patch(post._id)
      .set({
        coverImage: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          }
        }
      })
      .commit()

    console.log(`  ✅ Post atualizado com imagem`)
  } catch (error) {
    console.error(`  ❌ Erro ao atualizar post:`, error.message)
  }
}

// Função principal
async function main() {
  console.log('🖼️  Iniciando upload de imagens para Sanity CMS\n')

  // Buscar todos os posts
  const posts = await client.fetch('*[_type == "blogPost"]{ _id, id, title, legacyImageUrl }')
  console.log(`📝 Encontrados ${posts.length} posts\n`)

  let uploaded = 0
  let skipped = 0
  let errors = 0

  for (const post of posts) {
    console.log(`\n[Post ID ${post.id}] ${post.title}`)
    console.log(`  Imagem legada: ${post.legacyImageUrl}`)

    // Verificar se já tem imagem no Sanity
    const postWithImage = await client.fetch(
      '*[_type == "blogPost" && _id == $id][0]{ coverImage }',
      { id: post._id }
    )

    if (postWithImage.coverImage) {
      console.log(`  ↳ Post já possui imagem no Sanity - pulando`)
      skipped++
      continue
    }

    // Buscar arquivo de imagem
    const filename = imageMapping[post.legacyImageUrl]
    if (!filename) {
      console.log(`  ⚠️  Mapeamento de imagem não encontrado`)
      skipped++
      continue
    }

    // Fazer upload da imagem
    const imageAsset = await uploadImage(post.legacyImageUrl, filename)
    if (imageAsset) {
      await updatePostWithImage(post, imageAsset)
      uploaded++
    } else {
      errors++
    }

    // Pequena pausa para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Resultado final
  console.log('\n' + '─'.repeat(60))
  console.log('\n📊 Resultado do Upload:\n')
  console.log(`   Total de posts: ${posts.length}`)
  console.log(`   ✅ Imagens enviadas: ${uploaded}`)
  console.log(`   ⚠️  Pulados: ${skipped}`)
  console.log(`   ❌ Erros: ${errors}`)

  if (errors === 0 && uploaded > 0) {
    console.log('\n🎉 Upload concluído com sucesso!')
  }

  console.log('\n💡 Próximo passo: Converter HTML para block content')
  console.log('   Execute: npm run convert-content\n')
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error)
  process.exit(1)
})
