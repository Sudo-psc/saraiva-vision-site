#!/bin/bash
# Script para habilitar/desabilitar CSP temporariamente no Nginx
# Uso: sudo ./scripts/toggle-csp.sh [enable|disable]

set -e

ACTION="${1:-status}"
CONFIG_FILE="/etc/nginx/sites-available/saraivavision"
BACKUP_DIR="/etc/nginx/backups"

case "$ACTION" in
    disable)
        echo "🔓 Desabilitando CSP..."

        # Backup
        cp "$CONFIG_FILE" "$BACKUP_DIR/saraivavision.backup-csp-enabled-$(date +%Y%m%d_%H%M%S)"

        # Comentar linha do CSP
        sed -i '/add_header Content-Security-Policy-Report-Only/s/^/            # CSP TEMPORARIAMENTE DESABILITADO - $(date +%Y-%m-%d)\n            # /' "$CONFIG_FILE"

        # Copiar para sites-enabled
        cp "$CONFIG_FILE" /etc/nginx/sites-enabled/saraivavision

        # Testar e recarregar
        nginx -t && systemctl reload nginx

        echo "✅ CSP desabilitado com sucesso!"
        ;;

    enable)
        echo "🔒 Habilitando CSP..."

        # Backup
        cp "$CONFIG_FILE" "$BACKUP_DIR/saraivavision.backup-csp-disabled-$(date +%Y%m%d_%H%M%S)"

        # Remover comentários do CSP
        sed -i '/# CSP TEMPORARIAMENTE DESABILITADO/,+1d' "$CONFIG_FILE"
        sed -i 's/^[[:space:]]*#[[:space:]]*\(add_header Content-Security-Policy-Report-Only\)/            \1/' "$CONFIG_FILE"

        # Copiar para sites-enabled
        cp "$CONFIG_FILE" /etc/nginx/sites-enabled/saraivavision

        # Testar e recarregar
        nginx -t && systemctl reload nginx

        echo "✅ CSP habilitado com sucesso!"
        ;;

    status)
        echo "📊 Status do CSP:"
        echo ""

        if grep -q "^[[:space:]]*add_header Content-Security-Policy" "$CONFIG_FILE" 2>/dev/null; then
            echo "✅ CSP HABILITADO"
            echo ""
            echo "Configuração atual:"
            grep "add_header Content-Security-Policy" "$CONFIG_FILE" | head -1
        elif grep -q "^[[:space:]]*#.*add_header Content-Security-Policy" "$CONFIG_FILE" 2>/dev/null; then
            echo "❌ CSP DESABILITADO (comentado)"
            echo ""
            echo "Linha comentada:"
            grep "# CSP TEMPORARIAMENTE" "$CONFIG_FILE" -A 1 | head -2
        else
            echo "⚠️  CSP não encontrado no arquivo de configuração"
        fi

        echo ""
        echo "Headers HTTP atuais:"
        curl -sI https://saraivavision.com.br | grep -i "content-security-policy" || echo "  Nenhum header CSP encontrado"
        ;;

    *)
        echo "Uso: $0 {enable|disable|status}"
        echo ""
        echo "  enable   - Habilita o CSP"
        echo "  disable  - Desabilita o CSP (para testes)"
        echo "  status   - Mostra o status atual do CSP"
        exit 1
        ;;
esac
