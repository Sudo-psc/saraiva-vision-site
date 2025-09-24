#!/usr/bin/env node

/**
 * Script para configurar variáveis de ambiente xAI no Vercel
 * Configura automaticamente todas as variáveis necessárias para o chatbot xAI
 */

import { execSync } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setupVercelXAI() {
    console.log('🚀 Configuração do xAI Chatbot no Vercel');
    console.log('=====================================\n');

    // Verificar se Vercel CLI está instalado
    try {
        execSync('vercel --version', { stdio: 'ignore' });
    } catch (error) {
        console.log('❌ Vercel CLI não encontrado. Instalando...');
        execSync('npm install -g vercel', { stdio: 'inherit' });
    }

    // Verificar se está logado no Vercel
    try {
        execSync('vercel whoami', { stdio: 'ignore' });
        console.log('✅ Conectado ao Vercel');
    } catch (error) {
        console.log('🔐 Fazendo login no Vercel...');
        execSync('vercel login', { stdio: 'inherit' });
    }

    // Solicitar API key do xAI
    console.log('\n📋 Configuração da API Key do xAI');
    console.log('1. Acesse: https://console.x.ai');
    console.log('2. Crie uma conta ou faça login');
    console.log('3. Gere uma nova API key');
    console.log('4. Cole a API key abaixo:\n');

    const xaiApiKey = await question('🔑 xAI API Key: ');

    if (!xaiApiKey || xaiApiKey.trim() === '') {
        console.log('❌ API Key é obrigatória!');
        process.exit(1);
    }

    // Configurar modelo (opcional)
    const xaiModel = await question('🤖 Modelo xAI (padrão: grok-2-1212): ') || 'grok-2-1212';
    const maxTokens = await question('🎯 Max Tokens (padrão: 8192): ') || '8192';
    const temperature = await question('🌡️ Temperature (padrão: 0.1): ') || '0.1';

    console.log('\n⚙️ Configurando variáveis no Vercel...');

    // Lista de variáveis para configurar
    const envVars = [
        { key: 'XAI_API_KEY', value: xaiApiKey.trim() },
        { key: 'XAI_MODEL', value: xaiModel },
        { key: 'XAI_MAX_TOKENS', value: maxTokens },
        { key: 'XAI_TEMPERATURE', value: temperature }
    ];

    // Configurar cada variável
    for (const envVar of envVars) {
        try {
            console.log(`📝 Configurando ${envVar.key}...`);

            // Configurar para todos os ambientes
            const environments = ['production', 'preview', 'development'];

            for (const env of environments) {
                const command = `vercel env add ${envVar.key} ${env}`;
                execSync(command, {
                    input: envVar.value + '\n',
                    stdio: ['pipe', 'pipe', 'inherit']
                });
            }

            console.log(`✅ ${envVar.key} configurada`);
        } catch (error) {
            console.log(`⚠️ Erro ao configurar ${envVar.key}:`, error.message);
        }
    }

    // Atualizar .env local
    console.log('\n📄 Atualizando .env local...');
    updateLocalEnv(envVars);

    console.log('\n🎉 Configuração concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Deploy da aplicação: npm run deploy');
    console.log('2. Testar chatbot: node test-xai-chatbot.js');
    console.log('3. Verificar logs no Vercel dashboard');

    rl.close();
}

function updateLocalEnv(envVars) {
    const envPath = '.env';
    let envContent = '';

    // Ler .env existente
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Atualizar ou adicionar variáveis
    for (const envVar of envVars) {
        const regex = new RegExp(`^${envVar.key}=.*$`, 'm');
        const newLine = `${envVar.key}=${envVar.value}`;

        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, newLine);
        } else {
            envContent += `\n${newLine}`;
        }
    }

    // Salvar .env atualizado
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env local atualizado');
}

// Função para listar variáveis atuais
async function listCurrentEnvs() {
    console.log('\n📋 Variáveis atuais no Vercel:');
    try {
        const output = execSync('vercel env ls', { encoding: 'utf8' });
        console.log(output);
    } catch (error) {
        console.log('❌ Erro ao listar variáveis:', error.message);
    }
}

// Função para remover variáveis xAI
async function removeXAIEnvs() {
    const xaiVars = ['XAI_API_KEY', 'XAI_MODEL', 'XAI_MAX_TOKENS', 'XAI_TEMPERATURE'];

    console.log('\n🗑️ Removendo variáveis xAI do Vercel...');

    for (const varName of xaiVars) {
        try {
            execSync(`vercel env rm ${varName}`, { stdio: 'inherit' });
            console.log(`✅ ${varName} removida`);
        } catch (error) {
            console.log(`⚠️ ${varName} não encontrada ou erro ao remover`);
        }
    }
}

// Processar argumentos da linha de comando
const args = process.argv.slice(2);

if (args.includes('--list')) {
    listCurrentEnvs();
} else if (args.includes('--remove')) {
    removeXAIEnvs();
} else if (args.includes('--help')) {
    console.log(`
🚀 Script de Configuração xAI para Vercel

Uso:
  node scripts/setup-vercel-xai.js          # Configurar xAI
  node scripts/setup-vercel-xai.js --list   # Listar variáveis atuais
  node scripts/setup-vercel-xai.js --remove # Remover variáveis xAI
  node scripts/setup-vercel-xai.js --help   # Mostrar ajuda

Variáveis configuradas:
  - XAI_API_KEY: Chave da API do xAI
  - XAI_MODEL: Modelo a ser usado (padrão: grok-2-1212)
  - XAI_MAX_TOKENS: Máximo de tokens (padrão: 8192)
  - XAI_TEMPERATURE: Temperatura do modelo (padrão: 0.1)
    `);
} else {
    setupVercelXAI().catch(console.error);
}