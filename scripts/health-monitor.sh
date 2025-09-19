#!/bin/bash

# Health Monitor para Clínica Saraiva Vision
# Monitora serviços críticos e envia alertas

LOG_FILE="/var/log/saraiva-health.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] Iniciando verificação de saúde dos serviços" >> $LOG_FILE

# Função para verificar serviço
check_service() {
    local service_name="$1"
    local url="$2"
    local expected_code="$3"

    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response_code" = "$expected_code" ]; then
        echo "[$TIMESTAMP] ✅ $service_name: OK (HTTP $response_code)" >> $LOG_FILE
        return 0
    else
        echo "[$TIMESTAMP] ❌ $service_name: FALHOU (HTTP $response_code, esperado $expected_code)" >> $LOG_FILE
        return 1
    fi
}

# Verificações de serviços críticos
FAILED_SERVICES=()

# 1. API Health Check
if ! check_service "API Saraiva Vision" "http://localhost:3001/api/health" "200"; then
    FAILED_SERVICES+=("API")
fi

# 2. Frontend
if ! check_service "Frontend" "http://localhost:3002/health" "200"; then
    FAILED_SERVICES+=("Frontend")
fi

# 3. Nginx Proxy
if ! check_service "Nginx Proxy" "http://localhost:8083/api/health" "200"; then
    FAILED_SERVICES+=("Nginx-API")
fi

# 4. WordPress
if ! check_service "WordPress CMS" "http://localhost:8083/wp-json/" "200"; then
    FAILED_SERVICES+=("WordPress")
fi

# 5. WordPress Admin
if ! check_service "WordPress Admin" "http://localhost:8083/wp-admin/" "302"; then
    FAILED_SERVICES+=("WP-Admin")
fi

# Alerta se houver falhas
if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
    echo "[$TIMESTAMP] 🚨 ALERTA: Falhas detectadas em: ${FAILED_SERVICES[*]}" >> $LOG_FILE
    echo "[$TIMESTAMP] 🏥 IMPACTO: Sistema da Clínica Saraiva Vision com problemas" >> $LOG_FILE

    # Enviar notificação (implementar webhook/email se necessário)
    # notify_admin "Falhas no sistema: ${FAILED_SERVICES[*]}"
else
    echo "[$TIMESTAMP] ✅ Todos os serviços da clínica estão funcionais" >> $LOG_FILE
fi

echo "[$TIMESTAMP] Verificação concluída\n" >> $LOG_FILE