#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

// Read a small portion of blogPosts.js to understand structure
const postsPath = path.join(__dirname, '../src/data/blogPosts.js');

console.log('📊 Testando Carregamento de Imagens do Blog\n');

// Test blog page
const testUrl = 'http://localhost:3002/blog';
console.log(`🌐 Testando página: ${testUrl}\n`);

http.get(testUrl, (res) => {
  let html = '';

  res.on('data', (chunk) => {
    html += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Página carregada (status: ${res.statusCode})\n`);

    // Extract image references from HTML
    const imgRegex = /src="([^"]*Blog[^"]*)"/g;
    const images = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      images.push(match[1]);
    }

    console.log(`🖼️  Imagens encontradas no HTML: ${images.length}\n`);

    if (images.length > 0) {
      console.log('Primeiras 10 imagens:');
      images.slice(0, 10).forEach((img, i) => {
        console.log(`   ${i + 1}. ${img}`);
      });
      console.log('');
    }

    // Test if images are accessible
    console.log('🔍 Testando acessibilidade das imagens...\n');

    let tested = 0;
    let success = 0;
    let failed = 0;

    const testImage = (imgUrl) => {
      return new Promise((resolve) => {
        const url = imgUrl.startsWith('http') ? imgUrl : `http://localhost:3002${imgUrl}`;

        http.get(url, (res) => {
          tested++;
          if (res.statusCode === 200) {
            success++;
            console.log(`   ✅ ${imgUrl.split('/').pop()}`);
          } else {
            failed++;
            console.log(`   ❌ ${imgUrl} (status: ${res.statusCode})`);
          }
          resolve();
        }).on('error', (err) => {
          tested++;
          failed++;
          console.log(`   ❌ ${imgUrl} (erro: ${err.message})`);
          resolve();
        });
      });
    };

    // Test first 10 images
    const imagesToTest = images.slice(0, 10);

    Promise.all(imagesToTest.map(testImage)).then(() => {
      console.log('\n📋 RESUMO DOS TESTES:\n');
      console.log(`   Imagens testadas: ${tested}`);
      console.log(`   Sucessos: ${success} ✅`);
      console.log(`   Falhas: ${failed} ❌\n`);

      if (failed > 0) {
        console.log('⚠️  Algumas imagens não foram carregadas corretamente!');
      } else {
        console.log('🎉 Todas as imagens testadas foram carregadas com sucesso!');
      }
    });
  });
}).on('error', (err) => {
  console.error(`❌ Erro ao acessar página: ${err.message}`);
  process.exit(1);
});
