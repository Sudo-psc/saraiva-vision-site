#!/bin/bash

# Deploy Completo - Clínica Saraiva Vision
# Data: 2025-09-18

echo "=================================================="
echo "🚀 DEPLOY COMPLETO - CLÍNICA SARAIVA VISION"
echo "=================================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Variáveis
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DEPLOY_DIR="/var/www/saraivavision"
CURRENT_DIR="$DEPLOY_DIR/current"
RELEASE_DIR="$DEPLOY_DIR/releases/$TIMESTAMP"
BACKUP_DIR="$DEPLOY_DIR/backups/$TIMESTAMP"
DIST_DIR="/home/saraiva-vision-site-v3/webapp/dist"

echo -e "${BLUE}📦 Preparando deploy...${NC}"
echo ""

# 1. Criar diretórios necessários
echo "1. Criando estrutura de diretórios..."
sudo mkdir -p "$DEPLOY_DIR/releases"
sudo mkdir -p "$DEPLOY_DIR/backups"
sudo mkdir -p "$RELEASE_DIR"
echo -e "${GREEN}✓${NC} Diretórios criados"

# 2. Backup da versão atual
if [ -L "$CURRENT_DIR" ]; then
    echo ""
    echo "2. Fazendo backup da versão atual..."
    CURRENT_RELEASE=$(readlink "$CURRENT_DIR")
    sudo cp -r "$CURRENT_RELEASE" "$BACKUP_DIR" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Backup salvo em $BACKUP_DIR"
else
    echo ""
    echo "2. Primeira instalação (sem backup necessário)"
fi

# 3. Copiar arquivos do build
echo ""
echo "3. Copiando arquivos do build..."
sudo rsync -avz --delete "$DIST_DIR/" "$RELEASE_DIR/"
echo -e "${GREEN}✓${NC} Arquivos copiados"

# 4. Copiar Service Worker atualizado
echo ""
echo "4. Atualizando Service Worker..."
if [ -f "/home/saraiva-vision-site-v3/webapp/public/sw.js" ]; then
    sudo cp "/home/saraiva-vision-site-v3/webapp/public/sw.js" "$RELEASE_DIR/sw.js"
    echo -e "${GREEN}✓${NC} Service Worker v1.0.4 atualizado"
fi

# 5. Ajustar permissões
echo ""
echo "5. Ajustando permissões..."
sudo chown -R www-data:www-data "$RELEASE_DIR"
sudo chmod -R 755 "$RELEASE_DIR"
echo -e "${GREEN}✓${NC} Permissões ajustadas"

# 6. Atualizar link simbólico (atomic switch)
echo ""
echo "6. Ativando novo release..."
sudo ln -sfn "$RELEASE_DIR" "$CURRENT_DIR.tmp"
sudo mv -Tf "$CURRENT_DIR.tmp" "$CURRENT_DIR"
echo -e "${GREEN}✓${NC} Release $TIMESTAMP ativado"

# 7. Atualizar configuração nginx
echo ""
echo "7. Atualizando configuração nginx..."

# Backup da configuração atual
sudo cp /etc/nginx/sites-available/saraivavision /etc/nginx/sites-available/saraivavision.backup.$TIMESTAMP 2>/dev/null || true

# Copiar nova configuração otimizada
sudo cp nginx-production-optimized.conf /etc/nginx/sites-available/saraivavision

# Atualizar includes
sudo mkdir -p /etc/nginx/nginx-includes
sudo cp nginx-includes/*.conf /etc/nginx/nginx-includes/ 2>/dev/null || true

echo -e "${GREEN}✓${NC} Configuração nginx atualizada"

# 8. Testar configuração nginx
echo ""
echo "8. Testando configuração nginx..."
if sudo nginx -t 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Configuração válida"
    
    # Recarregar nginx
    echo ""
    echo "9. Recarregando nginx..."
    sudo nginx -s reload
    echo -e "${GREEN}✓${NC} Nginx recarregado"
else
    echo -e "${YELLOW}⚠️${NC} Erro na configuração nginx, restaurando backup..."
    sudo cp /etc/nginx/sites-available/saraivavision.backup.$TIMESTAMP /etc/nginx/sites-available/saraivavision
    sudo nginx -s reload
fi

# 10. Limpar releases antigas (manter últimas 5)
echo ""
echo "10. Limpando releases antigas..."
cd "$DEPLOY_DIR/releases"
ls -t | tail -n +6 | xargs -r sudo rm -rf
echo -e "${GREEN}✓${NC} Releases antigas removidas"

# 11. Verificar serviços
echo ""
echo "=================================================="
echo -e "${BLUE}📊 VERIFICAÇÃO DE SERVIÇOS${NC}"
echo "=================================================="
echo ""

# Verificar React App
echo -n "React App: "
if curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br | grep -q "200"; then
    echo -e "${GREEN}✓ Online${NC}"
else
    echo -e "${YELLOW}⚠️ Verificar${NC}"
fi

# Verificar WordPress
echo -n "WordPress Blog: "
if curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/blog | grep -q "200"; then
    echo -e "${GREEN}✓ Online${NC}"
else
    echo -e "${YELLOW}⚠️ Verificar${NC}"
fi

# Verificar API
echo -n "WordPress API: "
if curl -s https://saraivavision.com.br/wp-json | grep -q "name"; then
    echo -e "${GREEN}✓ Online${NC}"
else
    echo -e "${YELLOW}⚠️ Verificar${NC}"
fi

# Verificar Service Worker
echo -n "Service Worker: "
if curl -s https://saraivavision.com.br/sw.js | grep -q "SW_VERSION"; then
    echo -e "${GREEN}✓ v1.0.4${NC}"
else
    echo -e "${YELLOW}⚠️ Verificar${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✅ DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
echo "=================================================="
echo ""
echo "📌 Informações do Deploy:"
echo "   • Release: $TIMESTAMP"
echo "   • Diretório: $RELEASE_DIR"
echo "   • Backup: $BACKUP_DIR"
echo ""
echo "🔗 URLs da Clínica Saraiva Vision:"
echo "   • Site: https://saraivavision.com.br"
echo "   • Blog: https://saraivavision.com.br/blog"
echo "   • Admin: https://saraivavision.com.br/blog/wp-admin"
echo "   • API: https://saraivavision.com.br/wp-json"
echo ""
echo "🏥 Clínica Saraiva Vision"
echo "   Dr. Philipe Saraiva Cruz (CRM-MG 69.870)"
echo "   Enfermeira Ana Lúcia"
echo "   Caratinga, MG"
echo ""
echo "💡 Para reverter este deploy:"
echo "   sudo ln -sfn $BACKUP_DIR $CURRENT_DIR"
echo "   sudo nginx -s reload"
echo ""
echo "=================================================="