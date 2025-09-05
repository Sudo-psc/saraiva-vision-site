#!/usr/bin/env node

/**
 * Teste de Conexão WordPress para Clínica Saraiva Vision
 * Simula requisição do frontend para diagnosticar problemas de CORS
 */

const https = require('https');
const http = require('http');

// Configuração baseada no arquivo wordpress.js
const WORDPRESS_API_URL = 'http://localhost:8083/wp-json/wp/v2';

console.log('🏥 TESTE DE CONEXÃO - CLÍNICA SARAIVA VISION');
console.log('==========================================');
console.log(`📍 Testando WordPress API: ${WORDPRESS_API_URL}`);
console.log('');

// Função para fazer requisição HTTP
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
        'Origin': 'http://localhost:3002',
        'User-Agent': 'SaraivaVision-Frontend/1.0',
        ...options.headers
      }
    };

    const req = requestModule.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Teste 1: Verificar posts disponíveis
async function testPosts() {
  console.log('📝 Teste 1: Buscando posts educativos sobre oftalmologia...');
  
  try {
    const response = await makeRequest(`${WORDPRESS_API_URL}/posts?per_page=3`);
    
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   CORS Header: ${response.headers['access-control-allow-origin'] || 'AUSENTE'}`);
    
    if (response.statusCode === 200) {
      const posts = JSON.parse(response.data);
      console.log(`   ✅ ${posts.length} posts encontrados`);
      
      posts.forEach((post, index) => {
        console.log(`   📖 Post ${index + 1}: "${post.title.rendered}"`);
        console.log(`       Data: ${new Date(post.date).toLocaleDateString('pt-BR')}`);
        console.log(`       Slug: ${post.slug}`);
        console.log('');
      });
    } else {
      console.log(`   ❌ Erro: Status ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
  }
}

// Teste 2: Verificar categorias
async function testCategories() {
  console.log('🏷️  Teste 2: Verificando categorias de conteúdo...');
  
  try {
    const response = await makeRequest(`${WORDPRESS_API_URL}/categories`);
    
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

// Teste 3: Simular busca por conteúdo específico da clínica
async function testSearch() {
  console.log('🔍 Teste 3: Buscando conteúdo sobre "lentes de contato"...');
  
  try {
    const response = await makeRequest(`${WORDPRESS_API_URL}/posts?search=lentes`);
    
    console.log(`   Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      const posts = JSON.parse(response.data);
      console.log(`   ✅ ${posts.length} posts encontrados sobre lentes de contato`);
      
      posts.forEach((post, index) => {
        console.log(`   🔬 Resultado ${index + 1}: "${post.title.rendered}"`);
      });
    } else {
      console.log(`   ❌ Erro: Status ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro de conexão: ${error.message}`);
  }
}

// Executar todos os testes
async function runAllTests() {
  await testPosts();
  console.log('');
  await testCategories();
  console.log('');
  await testSearch();
  
  console.log('');
  console.log('🎯 RESUMO DO DIAGNÓSTICO');
  console.log('========================');
  console.log('Se todos os testes passaram, o WordPress está funcionando corretamente.');
  console.log('O problema pode estar na implementação do frontend ou cache do navegador.');
  console.log('');
  console.log('💡 PRÓXIMOS PASSOS:');
  console.log('1. Verificar console do navegador (F12)');
  console.log('2. Limpar cache do navegador');
  console.log('3. Verificar se o servidor de desenvolvimento está rodando');
  console.log('4. Verificar implementação do hook useWordPress.js');
}

// Iniciar testes
runAllTests().catch(console.error);
