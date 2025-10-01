#!/bin/bash

###############################################################################
# Healthcheck Script
# Descrição: Verifica se a aplicação está respondendo corretamente
# Uso: ./scripts/healthcheck.sh [URL] [MAX_RETRIES] [TIMEOUT]
###############################################################################

set -euo pipefail

# Configurações padrão
DEFAULT_URL="https://saraivavision.com.br/"
DEFAULT_MAX_RETRIES=5
DEFAULT_TIMEOUT=10
DEFAULT_EXPECTED_STATUS=200

# Parâmetros
URL="${1:-$DEFAULT_URL}"
MAX_RETRIES="${2:-$DEFAULT_MAX_RETRIES}"
TIMEOUT="${3:-$DEFAULT_TIMEOUT}"
EXPECTED_STATUS="${4:-$DEFAULT_EXPECTED_STATUS}"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🏥 Healthcheck - $URL${NC}"
echo "Retries: $MAX_RETRIES | Timeout: ${TIMEOUT}s | Expected: $EXPECTED_STATUS"
echo "========================================"

# Função de healthcheck com retry e backoff exponencial
healthcheck() {
    local retry=0
    local wait_time=1
    
    while [[ $retry -lt $MAX_RETRIES ]]; do
        retry=$((retry + 1))
        
        echo -n "Tentativa $retry/$MAX_RETRIES... "
        
        # Fazer requisição
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
            --max-time "$TIMEOUT" \
            --connect-timeout 5 \
            -L \
            "$URL" 2>/dev/null || echo "000")
        
        # Verificar status code
        if [[ "$HTTP_CODE" == "$EXPECTED_STATUS" ]]; then
            echo -e "${GREEN}✓ OK ($HTTP_CODE)${NC}"
            return 0
        else
            echo -e "${RED}✗ FAILED ($HTTP_CODE)${NC}"
            
            # Se não for a última tentativa, aguardar com backoff
            if [[ $retry -lt $MAX_RETRIES ]]; then
                echo "  Aguardando ${wait_time}s antes de tentar novamente..."
                sleep "$wait_time"
                wait_time=$((wait_time * 2))  # Backoff exponencial
            fi
        fi
    done
    
    # Todas as tentativas falharam
    echo -e "\n${RED}❌ Healthcheck FAILED após $MAX_RETRIES tentativas${NC}"
    echo "Última resposta: HTTP $HTTP_CODE"
    return 1
}

# Executar healthcheck
if healthcheck; then
    echo -e "\n${GREEN}✅ Healthcheck PASSED${NC}"
    exit 0
else
    echo -e "\n${RED}🚨 Healthcheck FAILED${NC}"
    exit 1
fi
