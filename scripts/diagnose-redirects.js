#!/usr/bin/env node

/**
 * Diagnostica loops de redirecionamento
 */

import https from 'https';
import http from 'http';

async function traceRedirects(url, maxRedirects = 10) {
    console.log(`🔍 Rastreando redirecionamentos para: ${url}\n`);

    const redirectChain = [];
    let currentUrl = url;
    let redirectCount = 0;

    while (redirectCount < maxRedirects) {
        try {
            const result = await followRedirect(currentUrl);

            redirectChain.push({
                step: redirectCount + 1,
                url: currentUrl,
                status: result.statusCode,
                location: result.location,
                server: result.server,
                headers: result.headers
            });

            console.log(`${redirectCount + 1}. ${currentUrl}`);
            console.log(`   Status: ${result.statusCode}`);
            console.log(`   Server: ${result.server || 'Unknown'}`);

            if (result.location) {
                console.log(`   Redireciona para: ${result.location}`);

                // Verificar se é um loop
                if (redirectChain.some(r => r.url === result.location)) {
                    console.log(`\n❌ LOOP DETECTADO! ${result.location} já foi visitado.`);
                    break;
                }

                currentUrl = result.location;
                redirectCount++;
            } else {
                console.log(`   ✅ Destino final alcançado`);
                break;
            }

            console.log('');
        } catch (error) {
            console.log(`   ❌ Erro: ${error.message}`);
            break;
        }
    }

    if (redirectCount >= maxRedirects) {
        console.log(`\n⚠️ Máximo de ${maxRedirects} redirecionamentos atingido`);
    }

    return redirectChain;
}

function followRedirect(url) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https://');
        const client = isHttps ? https : http;

        const options = {
            method: 'HEAD',
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RedirectTracer/1.0)'
            }
        };

        const req = client.request(url, options, (res) => {
            resolve({
                statusCode: res.statusCode,
                location: res.headers.location,
                server: res.headers.server,
                headers: res.headers
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

async function main() {
    const urls = [
        'https://www.saraivavision.com.br',
        'http://www.saraivavision.com.br',
        'https://saraivavision.com.br',
        'http://saraivavision.com.br'
    ];

    for (const url of urls) {
        console.log('='.repeat(60));
        await traceRedirects(url);
        console.log('\n');
    }

    // Verificar configuração específica do Cloudflare
    console.log('='.repeat(60));
    console.log('🔧 VERIFICAÇÃO ADICIONAL - Headers detalhados\n');

    try {
        const result = await followRedirect('https://www.saraivavision.com.br');
        console.log('Headers completos de www.saraivavision.com.br:');
        Object.entries(result.headers).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
        });
    } catch (error) {
        console.log('Erro ao obter headers:', error.message);
    }
}

main().catch(console.error);