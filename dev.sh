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

# Verificar Node.js e npm
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js primeiro."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale npm primeiro."
    exit 1
fi

# Verificar versão do Node.js se .nvmrc existir
if [ -f ".nvmrc" ]; then
    REQUIRED_NODE=$(cat .nvmrc)
    CURRENT_NODE=$(node -v)
    echo "📋 Versão Node.js requerida: $REQUIRED_NODE"
    echo "📋 Versão Node.js atual: $CURRENT_NODE"
    
    if command -v nvm &> /dev/null; then
        echo "🔧 nvm detectado - usando versão especificada..."
        nvm use
    fi
fi

# Função para limpar processos ao sair
cleanup() {
    echo "🧹 Limpando processos..."
    # Matar processos filhos
    jobs -p | xargs -r kill 2>/dev/null || true
    exit
}

# Configurar trap para limpar ao sair
trap cleanup SIGINT SIGTERM EXIT

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install --legacy-peer-deps
else
    echo "✅ Dependências já instaladas"
fi

# Verificar se build funciona
echo "🔧 Verificando se build funciona..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build funciona corretamente"
else
    echo "⚠️  Build falhou - pode haver problemas de desenvolvimento"
    read -p "Continuar mesmo assim? (y/N): " continue_anyway
    if [[ ! "$continue_anyway" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verificar arquivos de ambiente
if [ -f ".env.example" ] && [ ! -f ".env" ]; then
    echo "📄 Criando .env a partir de .env.example..."
    cp .env.example .env
    echo "⚠️  Configure as variáveis em .env conforme necessário"
fi

echo "🎯 Escolha o modo de desenvolvimento:"
echo "1. Apenas frontend (Vite dev server)"
echo "2. Frontend + API (Vite + Node.js)"
echo "3. Apenas build e preview"
echo "4. Executar testes"
echo "5. Executar linting"

read -p "Opção (1-5): " choice

case $choice in
    1)
        echo "🌟 Iniciando servidor de desenvolvimento Vite..."
        echo "🌐 Acesse: http://localhost:5173"
        npm run dev
        ;;
    2)
        echo "🌟 Iniciando frontend e API..."
        
        # Verificar se server.js existe
        if [ ! -f "server.js" ]; then
            echo "⚠️  server.js não encontrado - iniciando apenas frontend"
            npm run dev
        else
            # Iniciar API em background
            echo "🔧 Iniciando servidor API na porta 3001..."
            npm run start:api &
            API_PID=$!
            
            # Aguardar um pouco para API iniciar
            sleep 2
            
            # Verificar se API está rodando
            if kill -0 $API_PID 2>/dev/null; then
                echo "✅ API iniciada com sucesso"
            else
                echo "⚠️  API falhou ao iniciar"
            fi
            
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
        fi
        ;;
    3)
        echo "🔨 Fazendo build..."
        npm run build
        
        if [ -d "dist" ]; then
            echo "👀 Iniciando preview..."
            echo "🌐 Acesse: http://localhost:4173"
            npm run preview
        else
            echo "❌ Erro: Build falhou"
            exit 1
        fi
        ;;
    4)
        echo "🧪 Executando testes..."
        echo "Escolha o tipo de teste:"
        echo "1. Todos os testes"
        echo "2. Testes em modo watch"
        echo "3. Testes com coverage"
        
        read -p "Opção (1-3): " test_choice
        
        case $test_choice in
            1)
                npm run test:run
                ;;
            2)
                npm run test
                ;;
            3)
                npm run test:coverage
                ;;
            *)
                echo "❌ Opção inválida"
                exit 1
                ;;
        esac
        ;;
    5)
        echo "🔍 Executando linting..."
        if command -v eslint &> /dev/null; then
            echo "📝 Executando ESLint..."
            npx eslint src/ --ext .js,.jsx,.ts,.tsx
        else
            echo "⚠️  ESLint não encontrado"
        fi
        
        if [ -f ".htmlvalidate.json" ]; then
            echo "📄 Validando HTML (se build existir)..."
            if [ -d "dist" ]; then
                npm run verify:html
            else
                echo "⚠️  Execute build primeiro para validar HTML"
            fi
        fi
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac
