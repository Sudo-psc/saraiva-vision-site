#!/usr/bin/env node

/**
 * Teste de Conexão WordPress para Clínica Saraiva Vision
 * Simula requisição do frontend para diagnosticar problemas de CORS
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Carrega .env se existir (para tentar extrair endpoints)
try {
  require('dotenv').config();
} catch {}

// Candidatos de endpoints (ordem de tentativa)
// 1) Porta típica do WP local (docker/nginx)
// 2) Porta alternativa usada em alguns scripts/NGINX
// 3) Via Vite Dev Server (proxy) – exige vite dev rodando em 3002
// 4) Variáveis de ambiente, se configuradas
const candidates = [
  process.env.WORDPRESS_API_URL,
  process.env.VITE_WORDPRESS_API_URL,
  'http://localhost:8080/wp-json/wp/v2',
  'http://127.0.0.1:8080/wp-json/wp/v2',
  'http://localhost:8083/wp-json/wp/v2',
  'http://127.0.0.1:8083/wp-json/wp/v2',
  'http://localhost:3002/wp-json/wp/v2',
].filter(Boolean);

console.log('🏥 TESTE DE CONEXÃO - CLÍNICA SARAIVA VISION');
console.log('==========================================');
console.log('📍 Candidatos de endpoint (em ordem):');
for (const c of candidates) console.log('  -', c);
console.log('');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestModule = urlObj.protocol === 'https:' ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Origin simula o frontend (Vite dev)
        'Origin': 'http://localhost:3002',
        'User-Agent': 'SaraivaVision-Frontend/1.0',
        ...options.headers
      },
      timeout: 5000,
    };

    const req = requestModule.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, data });
      });
    });

    req.on('error', (error) => { reject(error); });
    req.on('timeout', () => { req.destroy(new Error('timeout')); });
    req.end();
  });
}

async function tryFirstHealthyEndpoint(paths = ['/posts?per_page=1']) {
  for (const base of candidates) {
    try {
      for (const p of paths) {
        const testUrl = base.replace(/\/$/, '') + (p.startsWith('/') ? p : `/${p}`);
        const res = await makeRequest(testUrl);
        if (res.statusCode === 200) {
          return { base, ok: true };
        }
      }
    } catch (_) {
      // tenta próximo
    }
  }
  return { base: null, ok: false };
}

async function testPosts(base) {
  console.log('📝 Teste 1: Buscando posts educativos sobre oftalmologia...');
  try {
    const response = await makeRequest(`${base.replace(/\/$/, '')}/posts?per_page=3`);
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   CORS Header: ${response.headers['access-control-allow-origin'] || 'AUSENTE'}`);

    if (response.statusCode === 200) {
      const posts = JSON.parse(response.data);
      console.log(`   ✅ ${posts.length} posts encontrados`);
      posts.forEach((post, index) => {
        console.log(`   📖 Post ${index + 1}: "${post.title?.rendered || post.title}"`);
        if (post.date) console.log(`       Data: ${new Date(post.date).toLocaleDateString('pt-BR')}`);
        if (post.slug) console.log(`       Slug: ${post.slug}`);
        console.log('');
      });
    } else {
      console.log(`   ❌ Erro: Status ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
  }
}

async function testCategories(base) {
  console.log('🏷️  Teste 2: Verificando categorias de conteúdo...');
  try {
    const response = await makeRequest(`${base.replace(/\/$/, '')}/categories`);
    console.log(`   Status: ${response.statusCode}`);

    if (response.statusCode === 200) {
      const categories = JSON.parse(response.data);
      console.log(`   ✅ ${categories.length} categorias encontradas`);
      categories.slice(0, 5).forEach((category, index) => {
        console.log(`   📂 Categoria ${index + 1}: "${category.name}" (${category.count} posts)`);
      });
    } else {
      console.log(`   ❌ Erro: Status ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
  }
}

async function testSearch(base) {
  console.log('🔍 Teste 3: Buscando conteúdo sobre "lentes de contato"...');
  try {
    const response = await makeRequest(`${base.replace(/\/$/, '')}/posts?search=lentes`);
    console.log(`   Status: ${response.statusCode}`);

    if (response.statusCode === 200) {
      const posts = JSON.parse(response.data);
      console.log(`   ✅ ${posts.length} posts encontrados sobre lentes de contato`);
      posts.forEach((post, index) => {
        console.log(`   🔬 Resultado ${index + 1}: "${post.title?.rendered || post.title}"`);
      });
    } else {
      console.log(`   ❌ Erro: Status ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
  }
}

async function runAllTests() {
  const probe = await tryFirstHealthyEndpoint();
  if (!probe.ok) {
    console.log('❌ Nenhum endpoint respondeu com sucesso.');
    console.log('   Verifique se o WordPress está rodando (porta 8080 ou 8083) ou se o Vite dev (3002) está ativo.');
    console.log('   Dica: em dev, o frontend usa /wp-json/wp/v2 via proxy do Vite (vide vite.config.js).');
    return;
  }

  const WORDPRESS_API_URL = probe.base;
  console.log(`✅ Endpoint selecionado: ${WORDPRESS_API_URL}`);
  console.log('');

  await testPosts(WORDPRESS_API_URL);
  console.log('');
  await testCategories(WORDPRESS_API_URL);
  console.log('');
  await testSearch(WORDPRESS_API_URL);

  console.log('');
  console.log('🎯 RESUMO DO DIAGNÓSTICO');
  console.log('========================');
  console.log('Se todos os testes passaram, o WordPress está funcionando corretamente.');
  console.log('O frontend, em desenvolvimento, usa /wp-json/wp/v2 (mesma origem) e o Vite proxy redireciona para o WP.');
  console.log('');
  console.log('💡 PRÓXIMOS PASSOS:');
  console.log('1) Subir WordPress (porta 8080 preferencial) ou ajustar vite.config.js se usar outra porta');
  console.log('2) Verificar CORS no WP (wordpress-cors-config.php / nginx-wordpress.conf)');
  console.log('3) Rodar `npm run dev` e acessar /blog');
}

runAllTests().catch(console.error);
