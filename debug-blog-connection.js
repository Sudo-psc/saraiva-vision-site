/**
 * Debug Blog Connection - Test WordPress API from browser context
 * 
 * Este script testa a conectividade WordPress exatamente como o React faz
 */

// Simular o ambiente React
const API_URL = 'http://localhost:8081/wp-json/wp/v2';

console.log('🔍 Debugging Blog Connection');
console.log('WordPress API URL:', API_URL);

// Teste 1: Conexão básica (como checkWordPressConnection)
async function testBasicConnection() {
    console.log('\n📡 Teste 1: Conexão básica');
    try {
        const response = await fetch(`${API_URL}/posts?per_page=1`);
        console.log('Status:', response.status);
        console.log('OK:', response.ok);
        console.log('Headers:', Object.fromEntries(response.headers));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Dados recebidos:', data.length, 'posts');
            return true;
        } else {
            console.log('❌ Resposta não OK');
            return false;
        }
    } catch (error) {
        console.error('❌ Erro na conexão:', error);
        return false;
    }
}

// Teste 2: Buscar posts completos (como BlogPage faz)
async function testFetchPosts() {
    console.log('\n📚 Teste 2: Buscar posts completos');
    try {
        const response = await fetch(`${API_URL}/posts?per_page=9&page=1&orderby=date&order=desc&_embed=true&status=publish`);
        console.log('Status:', response.status);
        
        if (response.ok) {
            const posts = await response.json();
            console.log('✅ Posts recebidos:', posts.length);
            
            posts.forEach((post, i) => {
                console.log(`  ${i + 1}. ${post.title.rendered}`);
            });
            
            return posts;
        } else {
            console.log('❌ Erro ao buscar posts');
            return [];
        }
    } catch (error) {
        console.error('❌ Erro:', error);
        return [];
    }
}

// Teste 3: Verificar CORS
async function testCORS() {
    console.log('\n🌐 Teste 3: Verificar CORS');
    try {
        // OPTIONS request (preflight)
        const optionsResponse = await fetch(`${API_URL}/posts`, {
            method: 'OPTIONS'
        });
        console.log('OPTIONS Status:', optionsResponse.status);
        console.log('CORS Headers:', {
            'Access-Control-Allow-Origin': optionsResponse.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': optionsResponse.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': optionsResponse.headers.get('Access-Control-Allow-Headers')
        });
    } catch (error) {
        console.error('❌ CORS Preflight falhou:', error);
    }
}

// Executar todos os testes
async function runAllTests() {
    console.log('🚀 Iniciando testes...\n');
    
    await testCORS();
    
    const connectionOK = await testBasicConnection();
    
    if (connectionOK) {
        await testFetchPosts();
        console.log('\n✅ DIAGNÓSTICO: WordPress está funcionando corretamente!');
        console.log('   O problema pode estar na configuração do React ou no timing');
    } else {
        console.log('\n❌ DIAGNÓSTICO: Problema de conectividade WordPress');
        console.log('   Verifique se o mock server está rodando na porta 8081');
    }
}

// Para executar no navegador:
// 1. Abra o DevTools (F12)
// 2. Cole este código no Console
// 3. Execute: runAllTests()

if (typeof window !== 'undefined') {
    console.log('💡 Para executar os testes, digite: runAllTests()');
    window.runAllTests = runAllTests;
    window.testBasicConnection = testBasicConnection;
    window.testFetchPosts = testFetchPosts;
    window.testCORS = testCORS;
} else {
    // Executar automaticamente se não estiver no navegador
    runAllTests();
}