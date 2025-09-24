#!/usr/bin/env node

/**
 * Script para diagnosticar e sugerir correções para loops de redirecionamento
 */

import { execSync } from 'child_process';

function fixRedirectLoop() {
    console.log('🔧 Corrigindo loop de redirecionamento...\n');

    console.log('📋 PASSOS PARA CORREÇÃO:\n');

    console.log('1. 🌐 CLOUDFLARE (Se aplicável):');
    console.log('   - Acesse o dashboard do Cloudflare');
    console.log('   - Vá em Rules → Page Rules');
    console.log('   - Procure regras para www.saraivavision.com.br');
    console.log('   - Configure redirecionamento para saraivavision.com.br (sem www)');
    console.log('   - Padrão: www.saraivavision.com.br/*');
    console.log('   - Destino: https://saraivavision.com.br/$1');
    console.log('   - Status: 301 (Permanent Redirect)\n');

    console.log('2. 🚀 VERCEL:');
    console.log('   - Adicionei redirecionamento no vercel.json');
    console.log('   - Fazendo deploy da correção...\n');

    console.log('3. 🧹 LIMPEZA DE CACHE:');
    console.log('   - Limpe cache do Cloudflare (se aplicável)');
    console.log('   - Limpe cache do navegador');
    console.log('   - Teste em modo incógnito\n');

    console.log('4. ✅ VERIFICAÇÃO:');
    console.log('   - www.saraivavision.com.br deve redirecionar para saraivavision.com.br');
    console.log('   - Sem loops de redirecionamento');
    console.log('   - SSL funcionando corretamente\n');

    // Fazer deploy da correção
    try {
        console.log('🚀 Fazendo deploy da correção...');
        execSync('npm run build', { stdio: 'inherit' });
        execSync('vercel --prod', { stdio: 'inherit' });
        console.log('✅ Deploy concluído!');
    } catch (error) {
        console.error('❌ Erro no deploy:', error.message);
    }

    console.log('\n📞 PRÓXIMOS PASSOS:');
    console.log('1. Aguarde alguns minutos para propagação');
    console.log('2. Teste: https://www.saraivavision.com.br');
    console.log('3. Deve redirecionar para: https://saraivavision.com.br');
    console.log('4. Execute: npm run domain:verify para verificar');
}

fixRedirectLoop();