#!/bin/bash

###############################################################################
# Script de Correção de Erros de Fetch e Service Worker
# 
# Implementa as soluções documentadas em docs/ERROR_SOLUTIONS_FETCH_SW.md
#
# Uso: sudo bash scripts/fix-fetch-errors.sh [--dry-run]
#
# Autor: Dr. Philipe Saraiva Cruz
# Data: 2025-10-22
###############################################################################

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Flags
DRY_RUN=false

# Parse argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo -e "${RED}❌ Argumento desconhecido: $1${NC}"
      echo "Uso: $0 [--dry-run]"
      exit 1
      ;;
  esac
done

# Função para log
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Função para criar backup
create_backup() {
  local file=$1
  local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
  
  if [ -f "$file" ]; then
    if [ "$DRY_RUN" = true ]; then
      log_info "DRY-RUN: Criaria backup de $file → $backup"
    else
      cp "$file" "$backup"
      log_success "Backup criado: $backup"
    fi
  else
    log_warning "Arquivo não encontrado para backup: $file"
  fi
}

# Banner
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🔧 Fix Fetch Errors - Service Worker & Retry Logic      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$DRY_RUN" = true ]; then
  log_warning "MODO DRY-RUN - Nenhuma alteração será feita"
  echo ""
fi

# Verifica se está no diretório correto
if [ ! -f "package.json" ]; then
  log_error "Execute este script da raiz do projeto"
  exit 1
fi

log_info "Diretório: $(pwd)"
echo ""

###############################################################################
# FASE 1: BACKUP DE ARQUIVOS CRÍTICOS
###############################################################################

log_info "📦 Fase 1: Criando backups de segurança..."
echo ""

create_backup "public/sw.js"
create_backup "src/utils/fetch-with-retry.js"

echo ""

###############################################################################
# FASE 2: ATUALIZAR SERVICE WORKER
###############################################################################

log_info "🔧 Fase 2: Atualizando Service Worker (public/sw.js)..."
echo ""

if [ "$DRY_RUN" = true ]; then
  log_info "DRY-RUN: Aplicaria correções no Service Worker"
else
  # Aplicar patch via sed/awk (correções específicas)

  # 1. Verificar se anchor existe antes de aplicar patch
  if ! grep -q '/api/analytics/' public/sw.js; then
    log_error "Anchor '/api/analytics/' não encontrado em public/sw.js"
    log_error "Impossível aplicar patch de analytics patterns"
    exit 1
  fi

  # 2. Adicionar patterns de analytics para ignorar
  sed -i '/\/api\/analytics\//a\
  \n  \/\/ Guard 3: Ignorar cross-origin analytics e tracking\n\
  const analyticsPatterns = [\n\
    "\/api\/analytics\/",\n\
    "\/api\/sw-errors",\n\
    "google-analytics.com",\n\
    "googletagmanager.com",\n\
    "doubleclick.net",\n\
    "facebook.com",\n\
    "facebook.net",\n\
    "connect.facebook.net",\n\
    "\/ccm\/",\n\
    "\/gtag\/",\n\
    "\/gtm.js",\n\
    "\/analytics.js"\n\
  ];\n\
  \n\
  if (analyticsPatterns.some(pattern =>\n\
    url.href.includes(pattern) || url.pathname.includes(pattern)\n\
  )) {\n\
    SWLogger.info("Skipping analytics\/tracking request", { url: url.href });\n\
    return;\n\
  }' public/sw.js

  # 3. Verificar se patch foi aplicado com sucesso
  if ! grep -q 'analyticsPatterns' public/sw.js; then
    log_error "Patch de analytics patterns não foi aplicado corretamente"
    log_error "Verifique public/sw.js manualmente"
    exit 1
  fi

  log_success "Service Worker atualizado com analytics patterns"
fi

echo ""

###############################################################################
# FASE 3: ATUALIZAR FETCH-WITH-RETRY
###############################################################################

log_info "🔧 Fase 3: Atualizando fetch-with-retry.js..."
echo ""

if [ "$DRY_RUN" = true ]; then
  log_info "DRY-RUN: Aplicaria correções no fetch-with-retry.js"
else
  # Aplicar correções programaticamente
  
  # 1. Adicionar SWLogger no topo
  if ! grep -q "const SWLogger" src/utils/fetch-with-retry.js; then
    sed -i '15a\
\n\/\/ Logger para integração com Service Worker\n\
const SWLogger = typeof self !== "undefined" \&\& self.SWLogger\n\
  ? self.SWLogger\n\
  : {\n\
      info: () => {},\n\
      warn: () => {},\n\
      error: () => {}\n\
    };' src/utils/fetch-with-retry.js
    
    log_success "SWLogger adicionado ao fetch-with-retry.js"
  else
    log_info "SWLogger já existe no fetch-with-retry.js"
  fi
  
  # 2. Adicionar allowEmptyResponse ao config
  sed -i 's/validateJSON = true/validateJSON = true,\n    allowEmptyResponse = true/' src/utils/fetch-with-retry.js
  
  log_success "Parâmetro allowEmptyResponse adicionado"
  
  # 3. Adicionar verificação de Content-Length
  if ! grep -q "Content-Length" src/utils/fetch-with-retry.js; then
    sed -i '/Guard 2: Verifica Content-Type/i\
      \/\/ Guard 2: Verifica Content-Length\n\
      const contentLength = response.headers.get("Content-Length");\n\
      if (contentLength === "0") {\n\
        if (circuitBreaker) {\n\
          getCircuitBreaker(normalizedURL).recordSuccess();\n\
        }\n\
        SWLogger?.info("Empty response (Content-Length: 0)", { url: normalizedURL });\n\
        return allowEmptyResponse ? null : [];\n\
      }\n' src/utils/fetch-with-retry.js
    
    log_success "Verificação de Content-Length adicionada"
  fi
fi

echo ""

###############################################################################
# FASE 4: VALIDAÇÃO SINTÁTICA
###############################################################################

log_info "🔍 Fase 4: Validando sintaxe dos arquivos modificados..."
echo ""

if [ "$DRY_RUN" = true ]; then
  log_info "DRY-RUN: Pulando validação"
else
  # Validar JavaScript
  if command -v node &> /dev/null; then
    # Validar sw.js
    if node -c public/sw.js 2>/dev/null; then
      log_success "public/sw.js: Sintaxe válida"
    else
      log_error "public/sw.js: Erro de sintaxe!"
      exit 1
    fi
    
    # Validar fetch-with-retry.js (ESM)
    # Nota: -c não funciona com ESM, então apenas checamos se o arquivo existe
    if [ -f src/utils/fetch-with-retry.js ]; then
      log_success "src/utils/fetch-with-retry.js: Arquivo existe"
    else
      log_error "src/utils/fetch-with-retry.js: Arquivo não encontrado!"
      exit 1
    fi
  else
    log_warning "Node.js não encontrado - pulando validação de sintaxe"
  fi
fi

echo ""

###############################################################################
# FASE 5: BUILD E DEPLOY
###############################################################################

log_info "🚀 Fase 5: Build e Deploy..."
echo ""

if [ "$DRY_RUN" = true ]; then
  log_info "DRY-RUN: Build e deploy não serão executados"
  log_info "Comandos que seriam executados:"
  echo "  npm run build:vite"
  echo "  sudo npm run deploy:quick"
else
  # Build
  log_info "Executando build com Vite..."
  npm run build:vite
  
  if [ $? -eq 0 ]; then
    log_success "Build concluído com sucesso"
  else
    log_error "Build falhou!"
    exit 1
  fi
  
  echo ""
  
  # Deploy
  log_info "Executando deploy..."
  sudo npm run deploy:quick
  
  if [ $? -eq 0 ]; then
    log_success "Deploy concluído com sucesso"
  else
    log_error "Deploy falhou!"
    exit 1
  fi
fi

echo ""

###############################################################################
# FASE 6: VERIFICAÇÃO PÓS-DEPLOY
###############################################################################

log_info "✅ Fase 6: Verificação pós-deploy..."
echo ""

if [ "$DRY_RUN" = true ]; then
  log_info "DRY-RUN: Verificação não será executada"
else
  # Aguardar propagação
  log_info "Aguardando propagação do deploy (5 segundos)..."
  sleep 5
  
  # Verificar se Service Worker está acessível
  log_info "Verificando Service Worker..."
  sw_status=$(curl -s -o /dev/null -w "%{http_code}" https://www.saraivavision.com.br/sw.js)
  
  if [ "$sw_status" = "200" ]; then
    log_success "Service Worker acessível (HTTP $sw_status)"
  else
    log_warning "Service Worker retornou HTTP $sw_status"
  fi
  
  # Verificar se página /planos carrega
  log_info "Verificando página /planos..."
  planos_status=$(curl -s -o /dev/null -w "%{http_code}" https://www.saraivavision.com.br/planos)
  
  if [ "$planos_status" = "200" ]; then
    log_success "Página /planos acessível (HTTP $planos_status)"
  else
    log_warning "Página /planos retornou HTTP $planos_status"
  fi
  
  # Verificar se bundle foi atualizado
  log_info "Verificando bundle JavaScript..."

  # Expandir glob para encontrar arquivo
  bundle_files=(dist/assets/index-*.js)

  # Verificar se arquivo existe (glob retorna literal se não encontrar)
  if [ -e "${bundle_files[0]}" ]; then
    bundle_size=$(du -h "${bundle_files[0]}" | awk '{print $1}')
    log_success "Bundle JavaScript: $bundle_size"
  else
    log_warning "Bundle JavaScript não encontrado em dist/assets/"
  fi
fi

echo ""

###############################################################################
# RESUMO FINAL
###############################################################################

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     ✅ CORREÇÕES APLICADAS                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

log_success "Service Worker atualizado com filtros de analytics"
log_success "fetch-with-retry.js atualizado com guards robustos"
log_success "Build e deploy concluídos"
echo ""

log_info "📝 PRÓXIMOS PASSOS:"
echo ""
echo "  1. Abra https://www.saraivavision.com.br/planos no navegador"
echo "  2. Abra o Console (F12 → Console)"
echo "  3. Verifique se erros de 'Failed to fetch' diminuíram >90%"
echo "  4. Verifique se 'JSON parse error' desapareceu"
echo "  5. Verifique se há logs '[SW:INFO] Skipping analytics/tracking request'"
echo ""

log_info "📚 DOCUMENTAÇÃO:"
echo ""
echo "  docs/ERROR_SOLUTIONS_FETCH_SW.md"
echo ""

log_info "🔧 ROLLBACK (se necessário):"
echo ""
echo "  Restaurar backups:"
echo "  cp public/sw.js.backup.* public/sw.js"
echo "  cp src/utils/fetch-with-retry.js.backup.* src/utils/fetch-with-retry.js"
echo "  npm run build:vite && sudo npm run deploy:quick"
echo ""

if [ "$DRY_RUN" = true ]; then
  log_warning "MODO DRY-RUN - Nenhuma alteração foi feita"
  log_info "Execute sem --dry-run para aplicar as correções"
fi

echo ""
log_success "Script concluído!"
echo ""
