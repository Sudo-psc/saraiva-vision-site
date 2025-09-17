#!/usr/bin/env bash

# Deploy local simplificado para macOS - SaraivaVision
# Apenas copia os arquivos para um diretório local e inicia um servidor simples

set -e

readonly PROJECT_ROOT="$(pwd)"
readonly LOCAL_DEPLOY_ROOT="$HOME/saraivavision-deploy"
readonly TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
readonly DEPLOY_DIR="$LOCAL_DEPLOY_ROOT/$TIMESTAMP"
readonly CURRENT_LINK="$LOCAL_DEPLOY_ROOT/current"
readonly PORT="${PORT:-8080}"

echo "🚀 Deploy Local SaraivaVision - macOS"
echo "📁 Diretório de deploy: $LOCAL_DEPLOY_ROOT"
echo "🌐 Porta: $PORT"

# Verificar se estamos no diretório correto
if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
    echo "❌ Execute a partir do diretório do projeto (package.json não encontrado)"
    exit 1
fi

# Verificar se dist existe
if [[ ! -d "$PROJECT_ROOT/dist" ]]; then
    echo "📦 Diretório dist/ não encontrado. Executando build..."
    npm run build
fi

if [[ ! -d "$PROJECT_ROOT/dist" ]]; then
    echo "❌ Build falhou. Diretório dist/ não foi criado."
    exit 1
fi

# Criar estrutura de deploy
echo "📁 Criando estrutura de deploy..."
mkdir -p "$DEPLOY_DIR"

# Copiar arquivos
echo "📋 Copiando arquivos..."
rsync -a --delete "$PROJECT_ROOT/dist/" "$DEPLOY_DIR/"

# Verificar se index.html existe
if [[ ! -f "$DEPLOY_DIR/index.html" ]]; then
    echo "❌ index.html não encontrado após cópia"
    exit 1
fi

# Criar metadata do release
echo "🧾 Criando metadata do release..."
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
APP_VERSION=$(node -pe "require('./package.json').version" 2>/dev/null || echo "0.0.0")

cat > "$DEPLOY_DIR/RELEASE_INFO.json" <<META
{
  "release": "${TIMESTAMP}",
  "version": "${APP_VERSION}",
  "commit": "${GIT_COMMIT}",
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "node": "$(node -v 2>/dev/null || echo unknown)",
  "env": "local-development",
  "deployPath": "${DEPLOY_DIR}",
  "port": ${PORT}
}
META

# Backup do release anterior (se existe)
if [[ -L "$CURRENT_LINK" ]]; then
    PREVIOUS_TARGET="$(readlink "$CURRENT_LINK" 2>/dev/null || true)"
    if [[ -n "$PREVIOUS_TARGET" && -d "$PREVIOUS_TARGET" ]]; then
        echo "💾 Release anterior: $PREVIOUS_TARGET"
    fi
fi

# Atualizar link simbólico
echo "🔗 Atualizando link current -> $DEPLOY_DIR"
ln -sfn "$DEPLOY_DIR" "$CURRENT_LINK"

# Criar arquivo de configuração para servidor
cat > "$CURRENT_LINK/.serve-config.json" <<CONFIG
{
  "public": "$CURRENT_LINK",
  "rewrites": [
    { "source": "**", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "**/*.@(js|css)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "**/*.@(json|xml|txt|html)",
      "headers": [
        {
          "key": "Cache-Control", 
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
CONFIG

echo "✅ Deploy concluído!"
echo "📂 Release: $DEPLOY_DIR"
echo "🔗 Current: $CURRENT_LINK"

# Verificar se serve está instalado globalmente
if ! command -v serve &> /dev/null; then
    echo "📦 Instalando serve globalmente..."
    npm install -g serve
fi

# Criar script helper para iniciar servidor
cat > "$LOCAL_DEPLOY_ROOT/start-server.sh" <<SCRIPT
#!/bin/bash
cd "$CURRENT_LINK"
echo "🌐 Iniciando servidor local..."
echo "📍 URL: http://localhost:$PORT"
echo "📂 Servindo: $CURRENT_LINK"
echo "🔄 Pressione Ctrl+C para parar"
serve -s . -l $PORT --config .serve-config.json
SCRIPT

chmod +x "$LOCAL_DEPLOY_ROOT/start-server.sh"

echo ""
echo "🎯 Para iniciar o servidor:"
echo "   $LOCAL_DEPLOY_ROOT/start-server.sh"
echo ""
echo "🌐 Ou manualmente:"
echo "   cd $CURRENT_LINK"
echo "   serve -s . -l $PORT"
echo ""

# Perguntar se quer iniciar agora
read -p "🚀 Iniciar servidor agora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Iniciando servidor local na porta $PORT..."
    echo "📍 URL: http://localhost:$PORT"
    echo "🔄 Pressione Ctrl+C para parar"
    cd "$CURRENT_LINK"
    serve -s . -l $PORT --config .serve-config.json
fi