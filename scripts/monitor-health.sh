#!/bin/bash

###############################################################################
# Monitor Health - Saraiva Vision
# Descrição: Monitora saúde do site e envia alertas
# Uso: ./scripts/monitor-health.sh
# Cron: */5 * * * * /home/saraiva-vision-site/scripts/monitor-health.sh
###############################################################################

set -euo pipefail

# Configurações
SITE_URL="https://saraivavision.com.br"
ALERT_EMAIL="saraivavision@gmail.com"
LOG_FILE="/home/saraiva-vision-site/claudelogs/monitor/health_$(date +%Y%m%d).log"
STATUS_FILE="/tmp/saraiva_health_status"
RETRY_COUNT=3
RETRY_DELAY=5

# Criar diretório de log
mkdir -p "$(dirname "$LOG_FILE")"

# Função de log
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# Função para enviar alerta
send_alert() {
    local subject="$1"
    local message="$2"
    
    # Log do alerta
    log "ALERT: $subject - $message"
    
    # Enviar email (se mail estiver configurado)
    if command -v mail &> /dev/null; then
        echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
    fi
    
    # Webhook (opcional - configure seu webhook)
    # curl -X POST "https://your-webhook-url" \
    #      -H "Content-Type: application/json" \
    #      -d "{\"subject\":\"$subject\",\"message\":\"$message\"}"
}

# Função para health check
check_health() {
    local url="$1"
    local retries="$2"
    
    for ((i=1; i<=retries; i++)); do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10 || echo "000")
        
        if [ "$HTTP_CODE" = "200" ]; then
            return 0
        fi
        
        if [ $i -lt $retries ]; then
            sleep "$RETRY_DELAY"
        fi
    done
    
    return 1
}

# Verificar se o site está online
log "Checking health: $SITE_URL"

if check_health "$SITE_URL" "$RETRY_COUNT"; then
    HTTP_CODE=200
    log "✓ Site OK (HTTP $HTTP_CODE)"
    
    # Se estava com problema antes, notificar recuperação
    if [ -f "$STATUS_FILE" ]; then
        PREVIOUS_STATUS=$(cat "$STATUS_FILE")
        if [ "$PREVIOUS_STATUS" = "DOWN" ]; then
            send_alert "✅ Saraiva Vision - Site Recuperado" \
                "O site $SITE_URL voltou ao normal.\nStatus: HTTP 200\nTimestamp: $(date +'%Y-%m-%d %H:%M:%S')"
        fi
    fi
    
    # Atualizar status
    echo "UP" > "$STATUS_FILE"
else
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" --max-time 10 || echo "000")
    log "✗ Site DOWN (HTTP $HTTP_CODE)"
    
    # Verificar se já estava down
    PREVIOUS_STATUS="UP"
    if [ -f "$STATUS_FILE" ]; then
        PREVIOUS_STATUS=$(cat "$STATUS_FILE")
    fi
    
    # Se é a primeira falha, enviar alerta
    if [ "$PREVIOUS_STATUS" = "UP" ]; then
        # Coletar informações adicionais
        NGINX_STATUS=$(systemctl is-active nginx 2>/dev/null || echo "unknown")
        CURRENT_RELEASE=$(readlink -f /var/www/saraivavision/current 2>/dev/null || echo "unknown")
        
        send_alert "🚨 ALERTA: Saraiva Vision - Site Indisponível" \
            "O site $SITE_URL está fora do ar!

Status HTTP: $HTTP_CODE
Nginx Status: $NGINX_STATUS
Release Atual: $CURRENT_RELEASE
Timestamp: $(date +'%Y-%m-%d %H:%M:%S')

Verifique os logs:
- Deploy: /home/saraiva-vision-site/claudelogs/deploy/
- Nginx: /var/log/nginx/saraivavision_error.log

Para rollback rápido:
sudo npm run deploy:rollback"
    fi
    
    # Atualizar status
    echo "DOWN" > "$STATUS_FILE"
fi

# Métricas adicionais (opcional)
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" "$SITE_URL" || echo "0")
log "Response time: ${RESPONSE_TIME}s"

# Alerta se resposta muito lenta (> 3s)
if (( $(echo "$RESPONSE_TIME > 3.0" | bc -l) )); then
    log "WARNING: Slow response time: ${RESPONSE_TIME}s"
    
    # Enviar alerta apenas uma vez por hora
    SLOW_ALERT_FILE="/tmp/saraiva_slow_alert_$(date +%Y%m%d%H)"
    if [ ! -f "$SLOW_ALERT_FILE" ]; then
        send_alert "⚠️ Saraiva Vision - Site Lento" \
            "O site está respondendo lentamente.

URL: $SITE_URL
Response Time: ${RESPONSE_TIME}s
Threshold: 3.0s
Timestamp: $(date +'%Y-%m-%d %H:%M:%S')

Verifique a performance e considere otimizações."
        
        touch "$SLOW_ALERT_FILE"
    fi
fi

exit 0
