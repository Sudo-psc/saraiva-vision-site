#!/usr/bin/env node

/**
 * Script para verificar configuração de domínio e SSL
 */

import https from 'https';
import http from 'http';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

const DOMAINS = [
    'saraivavision.com.br',
    'www.saraivavision.com.br'
];

const VERCEL_IPS = [
    '76.76.19.61',
    '76.223.126.88'
];

/**
 * Verifica DNS de um domínio
 */
async function checkDNS(domain) {
    try {
        const { stdout } = await execAsync(`nslookup ${domain}`);
        console.log(`\n📍 DNS para ${domain}:`);
        console.log(stdout);

        // Verificar se aponta para Vercel
        const pointsToVercel = VERCEL_IPS.some(ip => stdout.includes(ip)) ||
            stdout.includes('cname.vercel-dns.com');

        return {
            domain,
            dns: stdout,
            pointsToVercel,
            status: pointsToVercel ? 'OK' : 'ERRO'
        };
    } catch (error) {
        console.error(`❌ Erro ao verificar DNS de ${domain}:`, error.message);
        return {
            domain,
            dns: null,
            pointsToVercel: false,
            status: 'ERRO'
        };
    }
}

/**
 * Verifica certificado SSL
 */
async function checkSSL(domain) {
    return new Promise((resolve) => {
        const options = {
            hostname: domain,
            port: 443,
            path: '/',
            method: 'HEAD',
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            const cert = res.socket.getPeerCertificate();

            resolve({
                domain,
                status: 'OK',
                statusCode: res.statusCode,
                certificate: {
                    subject: cert.subject,
                    issuer: cert.issuer,
                    validFrom: cert.valid_from,
                    validTo: cert.valid_to,
                    subjectAltNames: cert.subjectaltname
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                domain,
                status: 'ERRO',
                error: error.message,
                certificate: null
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                domain,
                status: 'TIMEOUT',
                error: 'Timeout na conexão SSL',
                certificate: null
            });
        });

        req.end();
    });
}

/**
 * Verifica redirecionamento HTTP para HTTPS
 */
async function checkHTTPRedirect(domain) {
    return new Promise((resolve) => {
        const options = {
            hostname: domain,
            port: 80,
            path: '/',
            method: 'HEAD',
            timeout: 10000
        };

        const req = http.request(options, (res) => {
            const location = res.headers.location;
            const redirectsToHTTPS = location && location.startsWith('https://');

            resolve({
                domain,
                status: 'OK',
                statusCode: res.statusCode,
                redirectsToHTTPS,
                location
            });
        });

        req.on('error', (error) => {
            resolve({
                domain,
                status: 'ERRO',
                error: error.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                domain,
                status: 'TIMEOUT',
                error: 'Timeout na conexão HTTP'
            });
        });

        req.end();
    });
}

/**
 * Função principal
 */
async function main() {
    console.log('🔍 Verificando configuração de domínio e SSL...\n');

    // Verificar DNS
    console.log('=== VERIFICAÇÃO DNS ===');
    const dnsResults = [];
    for (const domain of DOMAINS) {
        const result = await checkDNS(domain);
        dnsResults.push(result);
    }

    // Verificar SSL
    console.log('\n=== VERIFICAÇÃO SSL ===');
    const sslResults = [];
    for (const domain of DOMAINS) {
        console.log(`\n🔒 Verificando SSL para ${domain}...`);
        const result = await checkSSL(domain);
        sslResults.push(result);

        if (result.status === 'OK') {
            console.log(`✅ SSL OK - Status: ${result.statusCode}`);
            console.log(`   Emissor: ${result.certificate.issuer.O}`);
            console.log(`   Válido até: ${result.certificate.validTo}`);
        } else {
            console.log(`❌ SSL ERRO: ${result.error}`);
        }
    }

    // Verificar redirecionamento HTTP
    console.log('\n=== VERIFICAÇÃO REDIRECIONAMENTO HTTP ===');
    const redirectResults = [];
    for (const domain of DOMAINS) {
        console.log(`\n🔄 Verificando redirecionamento HTTP para ${domain}...`);
        const result = await checkHTTPRedirect(domain);
        redirectResults.push(result);

        if (result.status === 'OK') {
            if (result.redirectsToHTTPS) {
                console.log(`✅ Redireciona para HTTPS: ${result.location}`);
            } else {
                console.log(`⚠️  Não redireciona para HTTPS - Status: ${result.statusCode}`);
            }
        } else {
            console.log(`❌ ERRO: ${result.error}`);
        }
    }

    // Resumo
    console.log('\n=== RESUMO ===');

    const dnsOK = dnsResults.every(r => r.pointsToVercel);
    const sslOK = sslResults.every(r => r.status === 'OK');
    const redirectOK = redirectResults.every(r => r.redirectsToHTTPS);

    console.log(`DNS: ${dnsOK ? '✅' : '❌'} ${dnsOK ? 'Todos os domínios apontam para Vercel' : 'Alguns domínios não apontam para Vercel'}`);
    console.log(`SSL: ${sslOK ? '✅' : '❌'} ${sslOK ? 'Certificados SSL válidos' : 'Problemas com certificados SSL'}`);
    console.log(`Redirecionamento: ${redirectOK ? '✅' : '❌'} ${redirectOK ? 'HTTP redireciona para HTTPS' : 'Problemas com redirecionamento'}`);

    if (!dnsOK) {
        console.log('\n📋 AÇÕES NECESSÁRIAS:');
        console.log('1. Configure os registros DNS conforme documentação');
        console.log('2. Aguarde propagação DNS (até 48h)');
        console.log('3. Adicione domínios no painel do Vercel');
    }

    if (!sslOK) {
        console.log('\n🔒 PROBLEMAS SSL:');
        console.log('1. Verifique se DNS está correto');
        console.log('2. Aguarde geração automática do certificado');
        console.log('3. Remova e adicione domínio no Vercel se necessário');
    }

    const allOK = dnsOK && sslOK && redirectOK;
    console.log(`\n${allOK ? '🎉' : '⚠️'} Status geral: ${allOK ? 'TUDO OK' : 'REQUER ATENÇÃO'}`);

    process.exit(allOK ? 0 : 1);
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        console.error('❌ Erro na verificação:', error);
        process.exit(1);
    });
}

export { checkDNS, checkSSL, checkHTTPRedirect };