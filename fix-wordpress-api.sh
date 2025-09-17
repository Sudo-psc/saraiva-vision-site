#!/bin/bash

# Script de Correção WordPress - Clínica Saraiva Vision
# Resolve problemas comuns de API retornando HTML em vez de JSON

echo "🏥 Clínica Saraiva Vision - Script de Correção WordPress"
echo "=================================================="

# Verificar se é ambiente de desenvolvimento ou produção
if [[ -n "$SSH_CONNECTION" ]]; then
    echo "📡 Detectado ambiente de PRODUÇÃO via SSH"
    ENVIRONMENT="production"
else
    echo "💻 Detectado ambiente de DESENVOLVIMENTO"
    ENVIRONMENT="development"
fi

# Função para backup
backup_files() {
    echo "💾 Criando backup dos arquivos críticos..."
    BACKUP_DIR="/tmp/wp-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    if [ -f "/var/www/html/.htaccess" ]; then
        cp /var/www/html/.htaccess "$BACKUP_DIR/"
        echo "✅ Backup do .htaccess criado"
    fi
    
    if [ -f "/var/www/html/wp-config.php" ]; then
        cp /var/www/html/wp-config.php "$BACKUP_DIR/"
        echo "✅ Backup do wp-config.php criado"
    fi
    
    echo "📁 Backup salvo em: $BACKUP_DIR"
}

# Função para diagnosticar o problema
diagnose_api() {
    echo "🔍 Executando diagnóstico da API WordPress..."
    
    # Teste 1: Verificar se o WordPress está acessível
    if [ "$ENVIRONMENT" = "production" ]; then
        API_URL="https://clinicasaraivavision.com.br/wp-json/wp/v2"
    else
        API_URL="http://localhost:8081/wp-json/wp/v2"
    fi
    
    echo "📡 Testando URL: $API_URL/posts?per_page=1"
    
    RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$API_URL/posts?per_page=1" 2>/dev/null || echo "HTTPSTATUS:000")
    HTTP_STATUS=$(echo $RESPONSE | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    RESPONSE_BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]*$//')
    
    echo "📊 Status HTTP: $HTTP_STATUS"
    
    # Verificar se é HTML
    if [[ $RESPONSE_BODY == *"<!doctype"* ]] || [[ $RESPONSE_BODY == *"<html"* ]]; then
        echo "❌ PROBLEMA DETECTADO: Servidor retornou HTML em vez de JSON"
        echo "📄 Prévia da resposta:"
        echo "$RESPONSE_BODY" | head -5
        return 1
    elif [[ $HTTP_STATUS == "200" ]]; then
        echo "✅ API respondendo corretamente com JSON"
        return 0
    else
        echo "⚠️  Status HTTP não esperado: $HTTP_STATUS"
        return 2
    fi
}

# Função para corrigir .htaccess
fix_htaccess() {
    echo "🔧 Corrigindo arquivo .htaccess..."
    
    HTACCESS_FILE="/var/www/html/.htaccess"
    
    # Criar .htaccess se não existir
    if [ ! -f "$HTACCESS_FILE" ]; then
        echo "📝 Criando novo arquivo .htaccess"
        touch "$HTACCESS_FILE"
    fi
    
    # Verificar se já tem regras do WordPress
    if ! grep -q "BEGIN WordPress" "$HTACCESS_FILE"; then
        echo "➕ Adicionando regras do WordPress ao .htaccess"
        cat >> "$HTACCESS_FILE" << 'EOF'

# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress

# BEGIN WP REST API Fix for Clinic Saraiva Vision
<IfModule mod_rewrite.c>
RewriteRule ^wp-json/(.*) /wp-json/$1 [QSA,L]
</IfModule>
# END WP REST API Fix for Clinic Saraiva Vision
EOF
        echo "✅ Regras adicionadas ao .htaccess"
    else
        echo "ℹ️  Regras do WordPress já existem no .htaccess"
    fi
}

# Função para verificar plugins conflitantes
check_plugins() {
    echo "🔌 Verificando plugins que podem causar conflitos..."
    
    # Lista de plugins conhecidos que podem interferir na API REST
    PROBLEMATIC_PLUGINS=(
        "disable-json-api"
        "disable-wp-rest-api"
        "wp-rest-api-controller"
        "jwt-authentication-for-wp-rest-api"
    )
    
    PLUGINS_DIR="/var/www/html/wp-content/plugins"
    
    if [ -d "$PLUGINS_DIR" ]; then
        for plugin in "${PROBLEMATIC_PLUGINS[@]}"; do
            if [ -d "$PLUGINS_DIR/$plugin" ]; then
                echo "⚠️  Plugin problemático encontrado: $plugin"
                echo "💡 Considere desativar este plugin temporariamente"
            fi
        done
    fi
}

# Função para flush rewrite rules via WP-CLI
flush_rewrite_rules() {
    echo "🔄 Fazendo flush das regras de rewrite..."
    
    if command -v wp &> /dev/null; then
        cd /var/www/html
        wp rewrite flush --hard
        echo "✅ Regras de rewrite atualizadas"
    else
        echo "⚠️  WP-CLI não encontrado, flush manual necessário"
        echo "💡 Acesse wp-admin → Settings → Permalinks e clique em 'Save Changes'"
    fi
}

# Função para verificar permissões
check_permissions() {
    echo "🔐 Verificando permissões de arquivos..."
    
    WP_ROOT="/var/www/html"
    
    if [ -d "$WP_ROOT" ]; then
        # Verificar se o servidor web pode ler os arquivos
        if [ ! -r "$WP_ROOT/index.php" ]; then
            echo "❌ Arquivo index.php não é legível pelo servidor web"
            echo "🔧 Corrigindo permissões..."
            chmod 644 "$WP_ROOT/index.php"
        fi
        
        # Verificar diretório wp-json
        WP_JSON_DIR="$WP_ROOT/wp-includes/rest-api"
        if [ -d "$WP_JSON_DIR" ]; then
            chmod -R 755 "$WP_JSON_DIR"
            echo "✅ Permissões do diretório REST API atualizadas"
        fi
    fi
}

# Função para testar correção
test_fix() {
    echo "🧪 Testando se as correções funcionaram..."
    
    sleep 2  # Aguardar propagação das mudanças
    
    if diagnose_api; then
        echo "🎉 SUCESSO! API WordPress funcionando corretamente"
        echo "✅ A Clínica Saraiva Vision pode usar o sistema WordPress"
        return 0
    else
        echo "❌ Ainda há problemas com a API"
        echo "📞 Contate o suporte técnico para análise avançada"
        return 1
    fi
}

# Função principal
main() {
    echo "🚀 Iniciando processo de correção..."
    
    # Verificar se temos permissões necessárias
    if [ "$EUID" -ne 0 ] && [ "$ENVIRONMENT" = "production" ]; then
        echo "⚠️  Este script precisa de privilégios de administrador em produção"
        echo "💡 Execute: sudo $0"
        exit 1
    fi
    
    # Executar correções
    backup_files
    
    echo ""
    diagnose_api
    DIAGNOSIS_RESULT=$?
    
    if [ $DIAGNOSIS_RESULT -eq 0 ]; then
        echo "✅ API já está funcionando corretamente!"
        exit 0
    fi
    
    echo ""
    fix_htaccess
    echo ""
    check_plugins
    echo ""
    check_permissions
    echo ""
    flush_rewrite_rules
    echo ""
    test_fix
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🏥 Clínica Saraiva Vision - Correção Concluída com Sucesso!"
        echo "📧 Sistema WordPress pronto para receber dados do blog"
        echo "👨‍⚕️ Dr. Philipe Saraiva Cruz pode publicar conteúdo médico"
    else
        echo ""
        echo "⚠️  Correção parcial realizada"
        echo "📋 Próximos passos recomendados:"
        echo "   1. Verificar logs do servidor web"
        echo "   2. Desativar plugins um por um"
        echo "   3. Verificar tema ativo"
        echo "   4. Consultar documentação do WordPress REST API"
    fi
}

# Executar script
main "$@"