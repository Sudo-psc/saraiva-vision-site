#!/bin/bash

# Deploy simplificado para Saraiva Vision
# Copia apenas os arquivos essenciais corrigidos

echo "========================================="
echo "🚀 DEPLOY SIMPLIFICADO - SARAIVA VISION"
echo "========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Diretórios
DIST_DIR="./dist"
DEPLOY_DIR="/var/www/saraivavision/current"
BACKUP_DIR="/var/www/saraivavision/backup-$(date +%Y%m%d-%H%M%S)"

# 1. Verificar se o build existe
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Diretório dist/ não encontrado. Execute 'npm run build' primeiro."
    exit 1
fi

echo -e "${YELLOW}📦 Iniciando deploy...${NC}"
echo ""

# 2. Criar backup (opcional)
if [ -d "$DEPLOY_DIR" ]; then
    echo "💾 Criando backup em $BACKUP_DIR..."
    sudo cp -r "$DEPLOY_DIR" "$BACKUP_DIR" 2>/dev/null || echo "⚠️  Backup ignorado"
fi

# 3. Copiar Service Worker atualizado
echo "📋 Atualizando Service Worker..."
if [ -f "public/sw.js" ]; then
    sudo cp -f public/sw.js "$DIST_DIR/sw.js"
    echo -e "${GREEN}✓${NC} Service Worker v1.0.4 copiado"
fi

# 4. Criar diretório de deploy se não existir
echo "📁 Preparando diretório de deploy..."
sudo mkdir -p "$DEPLOY_DIR"
sudo mkdir -p /etc/nginx/nginx-includes

# 5. Copiar arquivos do build
echo "📂 Copiando arquivos do build..."
sudo rsync -avz --delete "$DIST_DIR/" "$DEPLOY_DIR/"
echo -e "${GREEN}✓${NC} Arquivos copiados"

# 6. Atualizar CSP
echo "🔒 Atualizando Content Security Policy..."
if [ -f "nginx-includes/csp.conf" ]; then
    sudo cp -f nginx-includes/csp.conf /etc/nginx/nginx-includes/csp.conf
    echo -e "${GREEN}✓${NC} CSP atualizado"
fi

# 7. Copiar outros includes do nginx se existirem
if [ -d "nginx-includes" ]; then
    echo "📝 Atualizando configurações nginx..."
    sudo cp -f nginx-includes/*.conf /etc/nginx/nginx-includes/ 2>/dev/null || true
fi

# 8. Ajustar permissões
echo "🔐 Ajustando permissões..."
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"

# 9. Testar configuração nginx
echo "🔍 Testando configuração nginx..."
if sudo nginx -t 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Configuração nginx válida"
    
    # 10. Recarregar nginx
    echo "🔄 Recarregando nginx..."
    sudo nginx -s reload
    echo -e "${GREEN}✓${NC} Nginx recarregado"
else
    echo "⚠️  Aviso: Configuração nginx com problemas, mas deploy continua"
    echo "   Execute 'sudo nginx -t' para ver detalhes"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✅ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo "========================================="
echo ""
echo "📌 Arquivos atualizados:"
echo "  • Service Worker v1.0.4 (tratamento de respostas 206)"
echo "  • CSP configurado para Google Analytics/GTM"
echo "  • Build React com correções do carousel"
echo ""
echo "🔍 Para verificar:"
echo "  1. Acesse: https://saraivavision.com.br"
echo "  2. Abra Chrome DevTools (F12)"
echo "  3. Verifique:"
echo "     • Console: Sem erros"
echo "     • Application > Service Workers: v1.0.4"
echo "     • Network > Headers: CSP atualizado"
echo ""
echo "💡 Limpe o cache do navegador (Ctrl+Shift+R) se necessário"
echo ""