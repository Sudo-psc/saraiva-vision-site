#!/usr/bin/env node

/**
 * Solução temporária para o loop de redirecionamento
 */

console.log('🔧 SOLUÇÃO TEMPORÁRIA - Loop de Redirecionamento\n');

console.log('📋 PROBLEMA IDENTIFICADO:');
console.log('- Cloudflare está criando loop: www.saraivavision.com.br → www.saraivavision.com.br');
console.log('- Status 308 (Permanent Redirect) em loop infinito');
console.log('- Vercel não consegue sobrescrever configuração do Cloudflare\n');

console.log('✅ DOMÍNIO FUNCIONANDO:');
console.log('- https://saraivavision.com.br (Status 200 - OK)');
console.log('- SSL válido até dezembro 2025');
console.log('- Hospedado no Vercel corretamente\n');

console.log('🚨 AÇÃO NECESSÁRIA:');
console.log('1. Acesse o dashboard do Cloudflare');
console.log('2. Vá em Rules → Page Rules ou Redirect Rules');
console.log('3. Procure regras para www.saraivavision.com.br');
console.log('4. DELETE regras que causam loop');
console.log('5. Crie nova regra:');
console.log('   - URL: www.saraivavision.com.br/*');
console.log('   - Redirect: https://saraivavision.com.br/$1');
console.log('   - Status: 301\n');

console.log('⏰ SOLUÇÃO TEMPORÁRIA:');
console.log('- Use apenas: https://saraivavision.com.br');
console.log('- Evite: https://www.saraivavision.com.br');
console.log('- Atualize links e referências para usar domínio sem www\n');

console.log('🔍 VERIFICAÇÃO:');
console.log('Execute: npm run domain:diagnose');
console.log('Aguarde: www deve redirecionar para domínio principal sem loop\n');

console.log('📞 SUPORTE:');
console.log('Se não tiver acesso ao Cloudflare, contate o administrador do domínio');
console.log('Documentação completa: docs/CLOUDFLARE_FIX_GUIDE.md');

// Testar domínio principal
console.log('\n🧪 TESTE RÁPIDO:');
try {
    const { execSync } = require('child_process');
    const result = execSync('curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br', { encoding: 'utf8' });

    if (result.trim() === '200') {
        console.log('✅ Domínio principal funcionando (Status 200)');
    } else {
        console.log(`⚠️ Domínio principal: Status ${result.trim()}`);
    }
} catch (error) {
    console.log('❌ Erro no teste:', error.message);
}

console.log('\n🎯 RESUMO:');
console.log('- Problema: Configuração do Cloudflare');
console.log('- Solução: Corrigir regras de redirecionamento no Cloudflare');
console.log('- Temporário: Usar apenas saraivavision.com.br (sem www)');
console.log('- Status: Aguardando correção no Cloudflare');