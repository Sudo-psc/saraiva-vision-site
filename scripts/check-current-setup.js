#!/usr/bin/env node

/**
 * Verifica configuração atual dos domínios
 */

import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

async function checkCurrentSetup() {
    console.log('🔍 Verificando configuração atual...\n');

    // Verificar onde saraivavision.com.br está hospedado
    try {
        console.log('=== DOMÍNIO PRINCIPAL ===');
        const { stdout: curlMain } = await execAsync('curl -I https://saraivavision.com.br 2>/dev/null || echo "Erro na conexão"');
        console.log('Headers de saraivavision.com.br:');
        console.log(curlMain);

        console.log('\n=== SUBDOMÍNIO WWW ===');
        const { stdout: curlWww } = await execAsync('curl -I https://www.saraivavision.com.br 2>/dev/null || echo "Erro na conexão"');
        console.log('Headers de www.saraivavision.com.br:');
        console.log(curlWww);

        // Verificar se há redirecionamento
        console.log('\n=== TESTE DE REDIRECIONAMENTO ===');
        try {
            const { stdout: redirect } = await execAsync('curl -I https://www.saraivavision.com.br 2>/dev/null | grep -i location || echo "Sem redirecionamento"');
            console.log('Redirecionamento www:', redirect);
        } catch (e) {
            console.log('Sem redirecionamento detectado');
        }

        // Verificar DNS detalhado
        console.log('\n=== DNS DETALHADO ===');
        try {
            const { stdout: digMain } = await execAsync('dig +short saraivavision.com.br');
            console.log('IPs de saraivavision.com.br:', digMain.trim());

            const { stdout: digWww } = await execAsync('dig +short www.saraivavision.com.br');
            console.log('IPs de www.saraivavision.com.br:', digWww.trim());
        } catch (e) {
            console.log('Erro ao verificar DNS:', e.message);
        }

    } catch (error) {
        console.error('Erro na verificação:', error.message);
    }
}

checkCurrentSetup();