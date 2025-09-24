#!/bin/bash

# Script para configurar variáveis de ambiente xAI no Vercel
# Uso: ./scripts/configure-vercel-xai.sh

echo "🚀 Configurando xAI no Vercel"
echo "============================="

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar se está logado
if ! vercel whoami &> /dev/null; then
    echo "🔐 Fazendo login no Vercel..."
    vercel login
fi

echo ""
echo "📋 Configuração da API Key do xAI"
echo "1. Acesse: https://console.x.ai"
echo "2. Crie uma conta ou faça login"
echo "3. Gere uma nova API key"
echo ""

# Solicitar API key
read -p "🔑 Cole sua xAI API Key: " XAI_API_KEY

if [ -z "$XAI_API_KEY" ]; then
    echo "❌ API Key é obrigatória!"
    exit 1
fi

# Configurações opcionais
read -p "🤖 Modelo xAI (padrão: grok-2-1212): " XAI_MODEL
XAI_MODEL=${XAI_MODEL:-grok-2-1212}

read -p "🎯 Max Tokens (padrão: 8192): " XAI_MAX_TOKENS
XAI_MAX_TOKENS=${XAI_MAX_TOKENS:-8192}

read -p "🌡️ Temperature (padrão: 0.1): " XAI_TEMPERATURE
XAI_TEMPERATURE=${XAI_TEMPERATURE:-0.1}

echo ""
echo "⚙️ Configurando variáveis no Vercel..."

# Configurar variáveis para todos os ambientes
echo "📝 Configurando XAI_API_KEY..."
echo "$XAI_API_KEY" | vercel env add XAI_API_KEY production
echo "$XAI_API_KEY" | vercel env add XAI_API_KEY preview
echo "$XAI_API_KEY" | vercel env add XAI_API_KEY development

echo "📝 Configurando XAI_MODEL..."
echo "$XAI_MODEL" | vercel env add XAI_MODEL production
echo "$XAI_MODEL" | vercel env add XAI_MODEL preview
echo "$XAI_MODEL" | vercel env add XAI_MODEL development

echo "📝 Configurando XAI_MAX_TOKENS..."
echo "$XAI_MAX_TOKENS" | vercel env add XAI_MAX_TOKENS production
echo "$XAI_MAX_TOKENS" | vercel env add XAI_MAX_TOKENS preview
echo "$XAI_MAX_TOKENS" | vercel env add XAI_MAX_TOKENS development

echo "📝 Configurando XAI_TEMPERATURE..."
echo "$XAI_TEMPERATURE" | vercel env add XAI_TEMPERATURE production
echo "$XAI_TEMPERATURE" | vercel env add XAI_TEMPERATURE preview
echo "$XAI_TEMPERATURE" | vercel env add XAI_TEMPERATURE development

# Atualizar .env local
echo ""
echo "📄 Atualizando .env local..."

# Backup do .env atual
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Atualizar variáveis no .env
sed -i.bak "s/^XAI_API_KEY=.*/XAI_API_KEY=$XAI_API_KEY/" .env
sed -i.bak "s/^XAI_MODEL=.*/XAI_MODEL=$XAI_MODEL/" .env
sed -i.bak "s/^XAI_MAX_TOKENS=.*/XAI_MAX_TOKENS=$XAI_MAX_TOKENS/" .env
sed -i.bak "s/^XAI_TEMPERATURE=.*/XAI_TEMPERATURE=$XAI_TEMPERATURE/" .env

# Remover arquivo de backup do sed
rm .env.bak

echo "✅ .env local atualizado"

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Verificar configuração: vercel env ls"
echo "2. Deploy da aplicação: npm run deploy"
echo "3. Testar chatbot: node test-xai-chatbot.js"
echo ""
echo "💡 Para verificar se funcionou:"
echo "   curl -X POST https://seu-dominio.vercel.app/api/chatbot \\"
echo "   -H 'Content-Type: application/json' \\"
echo "   -d '{\"message\": \"Olá, teste do xAI\"}'"