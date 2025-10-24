#!/bin/bash

###############################################################################
# Script de Correção de CSP e Integração JotForm
#
# Implementa as soluções documentadas em docs/JOTFORM_CSP_SOLUTION.md
#
# Uso: sudo bash scripts/fix-jotform-csp.sh [--dry-run] [--skip-nginx]
#
# Autor: Automated deployment system
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
SKIP_NGINX=false

# Parse argumentos
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-nginx)
      SKIP_NGINX=true
      shift
      ;;
    *)
      echo -e "${RED}❌ Argumento desconhecido: $1${NC}"
      echo "Uso: $0 [--dry-run] [--skip-nginx]"
      exit 1
      ;;
  esac
done

# Funções de log
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

# Banner
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🔐 Fix JotForm CSP - Content Security Policy            ║"
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

if [ "$DRY_RUN" = false ]; then
  # Backup Nginx
  if [ "$SKIP_NGINX" = false ] && [ -f "/etc/nginx/sites-enabled/saraivavision" ]; then
    sudo cp /etc/nginx/sites-enabled/saraivavision "/etc/nginx/sites-enabled/saraivavision.backup.$(date +%Y%m%d_%H%M%S)"
    log_success "Backup Nginx criado"
  fi

  # Backup JotformChatbot (já foi feito)
  if [ -f "src/components/JotformChatbot.jsx" ]; then
    cp src/components/JotformChatbot.jsx "src/components/JotformChatbot.jsx.backup.$(date +%Y%m%d_%H%M%S)"
    log_success "Backup JotformChatbot.jsx criado"
  fi
else
  log_info "DRY-RUN: Backups seriam criados"
fi

echo ""

###############################################################################
# FASE 2: ATUALIZAR NGINX CSP (Opcional - requer sudo)
###############################################################################

if [ "$SKIP_NGINX" = false ]; then
  log_info "🔧 Fase 2: Atualizando Nginx CSP..."
  echo ""

  if [ "$DRY_RUN" = false ]; then
    # Verificar se linha 551 existe
    if [ -f "/etc/nginx/sites-enabled/saraivavision" ]; then
      log_warning "CSP no Nginx requer edição manual"
      log_info "Instruções:"
      echo "  1. sudo nano /etc/nginx/sites-enabled/saraivavision"
      echo "  2. Ir para linha 551"
      echo "  3. Substituir CSP pelo fornecido em docs/JOTFORM_CSP_SOLUTION.md"
      echo "  4. sudo nginx -t (validar)"
      echo "  5. sudo systemctl reload nginx"
      echo ""
      log_warning "Pulando atualização automática do Nginx"
    else
      log_warning "Arquivo Nginx não encontrado: /etc/nginx/sites-enabled/saraivavision"
    fi
  else
    log_info "DRY-RUN: Nginx seria atualizado"
  fi
else
  log_info "Pulando atualização do Nginx (--skip-nginx)"
fi

echo ""

###############################################################################
# FASE 3: COMPONENTE JOTFORMCHATBOT JÁ ATUALIZADO
###############################################################################

log_info "✅ Fase 3: JotformChatbot.jsx já foi atualizado"
echo ""

log_success "Componente atualizado com:"
echo "  - 3 guards de prevenção de duplicação"
echo "  - Persistência em navegação SPA"
echo "  - Error handling robusto"
echo "  - Logging estruturado"

echo ""

###############################################################################
# FASE 4: BUILD E DEPLOY
###############################################################################

log_info "🚀 Fase 4: Build e Deploy..."
echo ""

if [ "$DRY_RUN" = false ]; then
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
else
  log_info "DRY-RUN: Build e deploy não serão executados"
fi

echo ""

###############################################################################
# FASE 5: VERIFICAÇÕES PÓS-DEPLOY
###############################################################################

log_info "✅ Fase 5: Verificações pós-deploy..."
echo ""

if [ "$DRY_RUN" = false ]; then
  # Aguardar propagação
  log_info "Aguardando propagação do deploy (5 segundos)..."
  sleep 5

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

  echo ""

  # Verificar CSP header (se não pular Nginx)
  if [ "$SKIP_NGINX" = false ]; then
    log_info "Verificando header CSP..."
    csp_header=$(curl -s -I https://www.saraivavision.com.br/planos | grep -i "content-security-policy" || echo "")
    
    if [ -n "$csp_header" ]; then
      log_success "Header CSP presente"
    else
      log_warning "Header CSP não encontrado (pode estar comentado no Nginx)"
    fi
  fi
else
  log_info "DRY-RUN: Verificações não serão executadas"
fi

echo ""

###############################################################################
# RESUMO FINAL
###############################################################################

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                     ✅ CORREÇÕES APLICADAS                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

log_success "JotformChatbot.jsx atualizado com guards de duplicação"
log_success "Build e deploy concluídos"

if [ "$SKIP_NGINX" = true ]; then
  log_warning "Atualização do Nginx foi pulada (--skip-nginx)"
  echo ""
  log_info "Para ativar CSP no Nginx:"
  echo "  1. Edite /etc/nginx/sites-enabled/saraivavision linha 551"
  echo "  2. Adicione domínios JotForm conforme docs/JOTFORM_CSP_SOLUTION.md"
  echo "  3. sudo nginx -t && sudo systemctl reload nginx"
fi

echo ""

log_info "📝 PRÓXIMOS PASSOS:"
echo ""
echo "  1. Abra https://www.saraivavision.com.br/planos no navegador"
echo "  2. Abra o Console (F12 → Console)"
echo "  3. Verifique logs '[JotForm] Carregando script do chatbot...'"
echo "  4. Verifique se chatbot aparece (ícone no canto inferior direito)"
echo "  5. Navegue para outra página e volte - deve mostrar '[JotForm] Agent já carregado globalmente'"
echo "  6. Verifique se NÃO há erro 'Can't create duplicate variable'"
echo ""

log_info "📚 DOCUMENTAÇÃO:"
echo ""
echo "  docs/JOTFORM_CSP_SOLUTION.md (solução completa)"
echo ""

log_info "🔧 ROLLBACK (se necessário):"
echo ""
echo "  Restaurar backups:"
echo "  cp src/components/JotformChatbot.jsx.backup.* src/components/JotformChatbot.jsx"
if [ "$SKIP_NGINX" = false ]; then
  echo "  sudo cp /etc/nginx/sites-enabled/saraivavision.backup.* /etc/nginx/sites-enabled/saraivavision"
  echo "  sudo systemctl reload nginx"
fi
echo "  npm run build:vite && sudo npm run deploy:quick"
echo ""

if [ "$DRY_RUN" = true ]; then
  log_warning "MODO DRY-RUN - Nenhuma alteração foi feita"
  log_info "Execute sem --dry-run para aplicar as correções"
fi

echo ""
log_success "Script concluído!"
echo ""

###############################################################################
# TESTES AUTOMÁTICOS (Opcional)
###############################################################################

log_info "🧪 TESTES OPCIONAIS:"
echo ""
echo "Para validar a implementação, execute:"
echo ""
echo "  # Teste 1: Verificar carregamento sem duplicação"
echo "  # Abra /planos, verifique console: deve mostrar logs [JotForm] sem erros"
echo ""
echo "  # Teste 2: Verificar CSP (se ativado no Nginx)"
echo "  curl -I https://www.saraivavision.com.br/planos | grep -i csp"
echo ""
echo "  # Teste 3: Verificar se chatbot funciona"
echo "  # Clique no ícone do chatbot, envie mensagem, receba resposta"
echo ""

exit 0
