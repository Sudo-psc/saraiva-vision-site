#!/usr/bin/env node
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

// Try different API versions
const API_VERSIONS = ['2024-01-01', '2023-01-01', 'v2021-10-21'];

async function testConnection(apiVersion) {
  const client = createClient({
    projectId: '92ocrdmp',
    dataset: 'production',
    apiVersion: apiVersion,
    useCdn: false, // Don't use CDN for testing
    token: process.env.VITE_SANITY_TOKEN || undefined,
  });

  try {
    console.log(`\n🔄 Testando com API version: ${apiVersion}`);
    const result = await client.fetch(`*[_type == "blogPost"][0...1] { title }`);
    console.log(`✅ Sucesso! Retornou ${result.length} post(s)`);
    return { success: true, apiVersion, client };
  } catch (error) {
    console.log(`❌ Falhou: ${error.message.substring(0, 100)}`);
    return { success: false, apiVersion, error };
  }
}

async function checkPosts() {
  console.log('🔍 Verificando conexão com Sanity CMS...');
  console.log('Project ID: 92ocrdmp');
  console.log('Dataset: production');
  console.log(`Token: ${process.env.VITE_SANITY_TOKEN ? 'Configurado' : 'Não configurado'}`);

  // Test different API versions
  let workingClient = null;
  for (const version of API_VERSIONS) {
    const result = await testConnection(version);
    if (result.success) {
      workingClient = result.client;
      break;
    }
  }

  if (!workingClient) {
    console.log('\n❌ Não foi possível conectar ao Sanity com nenhuma versão de API');
    console.log('\n💡 Possíveis soluções:');
    console.log('1. Verificar se o projeto 92ocrdmp está acessível');
    console.log('2. Verificar se o dataset "production" existe e está público');
    console.log('3. Adicionar VITE_SANITY_TOKEN ao .env se o projeto for privado');
    console.log('4. Verificar se há posts do tipo "blogPost" no Sanity');
    return;
  }

  try {
    console.log('\n📊 Buscando todos os posts...');

    const posts = await workingClient.fetch(`*[_type == "blogPost"] {
      _id,
      title,
      mainImage,
      legacyImageUrl,
      "slug": slug.current
    } | order(_createdAt desc)`);

    console.log(`\n✅ Total de posts no Sanity: ${posts.length}\n`);

    if (posts.length === 0) {
      console.log('⚠️  Nenhum post encontrado no Sanity!');
      return;
    }

    const postsWithoutImages = posts.filter(p => !p.mainImage && !p.legacyImageUrl);
    const postsWithMainImage = posts.filter(p => p.mainImage);
    const postsWithLegacyOnly = posts.filter(p => !p.mainImage && p.legacyImageUrl);

    console.log('📈 Resumo de Imagens:');
    console.log(`  ✅ Posts com mainImage: ${postsWithMainImage.length}`);
    console.log(`  📁 Posts só com legacyImageUrl: ${postsWithLegacyOnly.length}`);
    console.log(`  ❌ Posts SEM imagem alguma: ${postsWithoutImages.length}\n`);

    if (postsWithoutImages.length > 0) {
      console.log('⚠️  Posts sem imagens:');
      console.log('━'.repeat(60));
      postsWithoutImages.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   Slug: ${post.slug}`);
        console.log(`   ID: ${post._id}\n`);
      });
    } else {
      console.log('✅ Todos os posts têm imagens!\n');
    }

    if (postsWithLegacyOnly.length > 0) {
      console.log('📁 Posts usando apenas legacyImageUrl:');
      console.log('━'.repeat(60));
      postsWithLegacyOnly.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title}`);
        console.log(`   legacyImageUrl: ${post.legacyImageUrl}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao buscar posts:', error.message);
  }
}

checkPosts();
