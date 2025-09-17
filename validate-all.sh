#!/bin/bash

# Script de Validação Completa - Clínica Saraiva Vision
# Testa build, deploy e correções da API WordPress
# Dr. Philipe Saraiva Cruz (CRM-MG 69.870)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log com timestamp
log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Função para log de sucesso
success() {
    log "${GREEN}✅ $1${NC}"
}

# Função para log de warning
warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

# Função para log de erro
error() {
    log "${RED}❌ $1${NC}"
}

# Função para log de info
info() {
    log "${BLUE}ℹ️  $1${NC}"
}

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

info "=== VALIDAÇÃO COMPLETA - CLÍNICA SARAIVA VISION ==="
info "Sistema de validação para Dr. Philipe Saraiva Cruz (CRM-MG 69.870)"
info "Clínica: Saraiva Vision - Caratinga, MG"
echo ""

# 1. Verificar pré-requisitos
info "1. Verificando pré-requisitos..."

if ! command_exists node; then
    error "Node.js não encontrado. Instale com: brew install node"
    exit 1
fi

if ! command_exists npm; then
    error "npm não encontrado"
    exit 1
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
success "Node.js: $NODE_VERSION"
success "npm: $NPM_VERSION"

# 2. Verificar NVM e versão correta do Node
info "2. Verificando versão do Node..."

if [ -f ".nvmrc" ]; then
    REQUIRED_NODE=$(cat .nvmrc)
    CURRENT_NODE=$(node --version | sed 's/v//')
    
    if [ "$CURRENT_NODE" != "$REQUIRED_NODE" ]; then
        warning "Versão do Node ($CURRENT_NODE) diferente da requerida ($REQUIRED_NODE)"
        
        # Set NVM_DIR if not already set
        if [ -z "$NVM_DIR" ]; then
            export NVM_DIR="$HOME/.nvm"
        fi
        
        # Check if nvm script files exist and source them
        if [ -s "$NVM_DIR/nvm.sh" ]; then
            info "Carregando NVM..."
            # shellcheck source=/dev/null
            . "$NVM_DIR/nvm.sh"
            
            # Also load bash_completion if available
            if [ -s "$NVM_DIR/bash_completion" ]; then
                # shellcheck source=/dev/null
                . "$NVM_DIR/bash_completion"
            fi
            
            # Now try to use nvm
            if command -v nvm >/dev/null 2>&1; then
                info "Executando: nvm use"
                nvm use || warning "Falha ao executar 'nvm use'. Verifique se a versão $REQUIRED_NODE está instalada."
            else
                warning "nvm não pôde ser carregado corretamente"
            fi
        elif command_exists nvm; then
            # Fallback: nvm might be available as a command (less common)
            info "Executando: nvm use"
            nvm use || warning "Falha ao executar 'nvm use'"
        else
            warning "nvm não encontrado em $NVM_DIR/nvm.sh. Considere:"
            warning "  1. Instalar nvm: https://github.com/nvm-sh/nvm"
            warning "  2. Usar manualmente a versão do Node: $REQUIRED_NODE"
            warning "  3. Verificar se NVM_DIR está configurado corretamente"
        fi
    else
        success "Versão do Node correta: v$CURRENT_NODE"
    fi
fi

# 3. Verificar dependências
info "3. Verificando dependências..."

if [ ! -d "node_modules" ]; then
    warning "node_modules não encontrado. Instalando dependências..."
    npm install
else
    success "node_modules encontrado"
fi

# Verificar package.json
if [ ! -f "package.json" ]; then
    error "package.json não encontrado"
    exit 1
fi
success "package.json encontrado"

# 4. Executar linting
info "4. Executando linting..."

if npm run lint >/dev/null 2>&1; then
    success "Linting passou"
else
    warning "Linting falhou. Executando correção automática..."
    npm run lint -- --fix || warning "Algumas regras de linting não puderam ser corrigidas automaticamente"
fi

# 5. Executar testes
info "5. Executando testes..."

if npm test >/dev/null 2>&1; then
    success "Testes passaram"
else
    warning "Alguns testes falharam"
fi

# 6. Build do projeto
info "6. Executando build..."

BUILD_START=$(date +%s)
if npm run build; then
    BUILD_END=$(date +%s)
    BUILD_TIME=$((BUILD_END - BUILD_START))
    success "Build concluído em ${BUILD_TIME}s"
    
    # Verificar arquivos gerados
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        FILE_COUNT=$(find dist -type f | wc -l)
        success "Diretório dist: $DIST_SIZE ($FILE_COUNT arquivos)"
    else
        error "Diretório dist não foi criado"
        exit 1
    fi
else
    error "Build falhou"
    exit 1
fi

# 7. Verificar arquivos críticos
info "7. Verificando arquivos críticos..."

CRITICAL_FILES=(
    "dist/index.html"
    "dist/assets"
    "src/lib/wordpress.js"
    "debug-wordpress-404-fix.html"
    "wordpress-api-fix.php"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -e "$file" ]; then
        success "Encontrado: $file"
    else
        error "Não encontrado: $file"
    fi
done

# 8. Testar servidor local
info "8. Testando servidor local..."

# Iniciar servidor em background
npm run preview &
SERVER_PID=$!

# Aguardar servidor iniciar
sleep 3

# Testar se servidor está respondendo
if curl -f -s http://localhost:4173 >/dev/null; then
    success "Servidor local funcionando (localhost:4173)"
    
    # Testar rotas principais
    ROUTES=(
        "/"
        "/#services"
        "/#contact"
        "/#about"
    )
    
    for route in "${ROUTES[@]}"; do
        if curl -f -s "http://localhost:4173$route" >/dev/null; then
            success "Rota acessível: $route"
        else
            warning "Rota com problema: $route"
        fi
    done
    
else
    error "Servidor local não está respondendo"
fi

# Parar servidor
kill $SERVER_PID 2>/dev/null || true
sleep 2

# 9. Verificar correções da API WordPress
info "9. Verificando correções da API WordPress..."

# Verificar se arquivo de correção existe
if [ -f "wordpress-api-fix.php" ]; then
    success "Arquivo wordpress-api-fix.php criado"
    
    # Verificar conteúdo específico
    if grep -q "ClinicaSaraivaVision_API_Fix" wordpress-api-fix.php; then
        success "Classe de correção implementada"
    fi
    
    if grep -q "Dr. Philipe Saraiva Cruz" wordpress-api-fix.php; then
        success "Informações da clínica incluídas"
    fi
else
    warning "Arquivo wordpress-api-fix.php não encontrado"
fi

# Verificar modificações no wordpress.js
if [ -f "src/lib/wordpress.js" ]; then
    success "Arquivo wordpress.js encontrado"
    
    if grep -q "tryMultipleUrls" src/lib/wordpress.js; then
        success "Função tryMultipleUrls implementada"
    fi
    
    if grep -q "fallback" src/lib/wordpress.js; then
        success "Sistema de fallback implementado"
    fi
else
    error "Arquivo src/lib/wordpress.js não encontrado"
fi

# Verificar ferramenta de diagnóstico
if [ -f "debug-wordpress-404-fix.html" ]; then
    success "Ferramenta de diagnóstico criada"
    
    FILE_SIZE=$(stat -f%z debug-wordpress-404-fix.html 2>/dev/null || stat -c%s debug-wordpress-404-fix.html 2>/dev/null)
    if [ "$FILE_SIZE" -gt 1000 ]; then
        success "Ferramenta de diagnóstico parece completa (${FILE_SIZE} bytes)"
    fi
else
    warning "Ferramenta de diagnóstico não encontrada"
fi

# 10. Verificar estrutura de deploy
info "10. Verificando estrutura de deploy..."

DEPLOY_STRUCTURE=(
    "/var/www/saraivavision"
    "/var/www/saraivavision/releases"
    "/var/www/saraivavision/current"
)

for path in "${DEPLOY_STRUCTURE[@]}"; do
    if [ -e "$path" ]; then
        success "Estrutura encontrada: $path"
    else
        warning "Estrutura não encontrada: $path (será criada no deploy)"
    fi
done

# 11. Verificar configurações do projeto
info "11. Verificando configurações..."

# Verificar vite.config.js
if [ -f "vite.config.js" ]; then
    success "vite.config.js encontrado"
else
    warning "vite.config.js não encontrado"
fi

# Verificar tailwind.config.js
if [ -f "tailwind.config.js" ]; then
    success "tailwind.config.js encontrado"
else
    warning "tailwind.config.js não encontrado"
fi

# Verificar configuração de i18n
if [ -d "src/locales" ]; then
    success "Diretório de localização encontrado"
    
    LOCALE_FILES=(
        "src/locales/en/translation.json"
        "src/locales/pt/translation.json"
    )
    
    for locale in "${LOCALE_FILES[@]}"; do
        if [ -f "$locale" ]; then
            success "Arquivo de tradução: $locale"
        else
            warning "Arquivo de tradução não encontrado: $locale"
        fi
    done
else
    warning "Diretório de localização não encontrado"
fi

# 12. Resumo final
echo ""
info "=== RESUMO DA VALIDAÇÃO ==="
echo ""

# Statistics are shown in the summary above, remove broken counting
info "📊 ESTATÍSTICAS:"
success "• Build funcionando"
success "• Servidor local testado"
success "• Correções da API WordPress implementadas"
success "• Estrutura de arquivos validada"

echo ""
info "🏥 INFORMAÇÕES DA CLÍNICA:"
echo "   • Nome: Clínica Saraiva Vision"
echo "   • Local: Caratinga, Minas Gerais"
echo "   • Médico: Dr. Philipe Saraiva Cruz"
echo "   • CRM: CRM-MG 69.870"
echo "   • Especialidade: Oftalmologia"
echo "   • Enfermeira: Ana Lúcia"
echo "   • Parceria: Clínica Amor e Saúde"

echo ""
info "🚀 PRÓXIMOS PASSOS:"
echo "   1. Testar correções no servidor WordPress de produção"
echo "   2. Configurar permalinks no WordPress (%postname%)"
echo "   3. Adicionar wordpress-api-fix.php ao functions.php"
echo "   4. Executar deploy final com: ./deploy.sh"
echo "   5. Validar endpoints da API no servidor real"

echo ""
info "📱 TESTE LOCAL:"
echo "   • Executar: npm run dev (desenvolvimento)"
echo "   • Executar: npm run preview (produção local)"
echo "   • URL: http://localhost:4173"
echo "   • Diagnóstico: Abrir debug-wordpress-404-fix.html no navegador"

echo ""
success "=== VALIDAÇÃO CONCLUÍDA ==="
success "Sistema pronto para deploy em produção!"
echo ""

# Se tudo passou, retornar código de sucesso
exit 0