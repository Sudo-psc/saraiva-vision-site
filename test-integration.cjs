#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Configuração de testes
const tests = [
  {
    name: 'WordPress API - Posts',
    url: 'http://localhost:8080/wp-json/wp/v2/posts',
    expectedStatus: 200
  },
  {
    name: 'WordPress API - Categories', 
    url: 'http://localhost:8080/wp-json/wp/v2/categories',
    expectedStatus: 200
  },
  {
    name: 'WordPress Admin Access',
    url: 'http://localhost:8080/wp-admin/',
    expectedStatus: 302 // Redirecionamento para login
  }
];

// Função para fazer requisição HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers
      });
    });
    
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

// Executar testes
async function runTests() {
  console.log('🧪 Executando Testes de Integração\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`⏳ ${test.name}...`);
      const result = await makeRequest(test.url);
      
      if (result.statusCode === test.expectedStatus) {
        console.log(`✅ ${test.name} - PASSED (${result.statusCode})`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - FAILED (Expected: ${test.expectedStatus}, Got: ${result.statusCode})`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR: ${error.message}`);
      failed++;
    }
    console.log('');
  }
  
  console.log(`📊 Resultados: ${passed} PASSED, ${failed} FAILED\n`);
  
  if (failed === 0) {
    console.log('🎉 Todos os testes passaram! Sistema integrado com sucesso.');
    process.exit(0);
  } else {
    console.log('⚠️  Alguns testes falharam. Verifique a configuração.');
    process.exit(1);
  }
}

// Executar
runTests().catch(console.error);
