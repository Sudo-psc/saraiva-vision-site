#!/bin/bash

# Script para desenvolvimento local - Saraiva Vision
# Inicia o servidor de desenvolvimento Vite e opcionalmente a API

set -e

echo "🚀 Iniciando ambiente de desenvolvimento..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute o script a partir do diretório do projeto"
    exit 1
fi

# Função para limpar processos ao sair
cleanup() {
    echo "🧹 Limpando processos..."
    # Matar processos filhos
    jobs -p | xargs -r kill
    exit
}

# Configurar trap para limpar ao sair
trap cleanup SIGINT SIGTERM EXIT

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo "🎯 Escolha o modo de desenvolvimento:"
echo "1. Apenas frontend (Vite dev server)"
echo "2. Frontend + API (Vite + Node.js)"
echo "3. Apenas build e preview"

read -p "Opção (1-3): " choice

case $choice in
    1)
        echo "🌟 Iniciando servidor de desenvolvimento Vite..."
        npm run dev
        ;;
    2)
        echo "🌟 Iniciando frontend e API..."
        
        # Iniciar API em background
        echo "🔧 Iniciando servidor API na porta 3001..."
        npm run start:api &
        API_PID=$!
        
        # Aguardar um pouco para API iniciar
        sleep 2
        
        # Iniciar Vite dev server
        echo "🌟 Iniciando servidor Vite na porta 5173..."
        npm run dev &
        VITE_PID=$!
        
        echo "✅ Ambiente iniciado!"
        echo "📱 Frontend: http://localhost:5173"
        echo "🔧 API: http://localhost:3001"
        echo "📊 Pressione Ctrl+C para parar tudo"
        
        # Aguardar
        wait
        ;;
    3)
        echo "🔨 Fazendo build..."
        npm run build
        
        if [ -d "dist" ]; then
            echo "👀 Iniciando preview..."
            npm run preview
        else
            echo "❌ Erro: Build falhou"
            exit 1
        fi
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac
