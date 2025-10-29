#!/bin/bash
###############################################################################
# MONIT QUICK STATUS - Status rápido e visual
###############################################################################

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 MONIT QUICK STATUS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Status do Monit
if systemctl is-active --quiet monit; then
    echo -e "Monit: ${GREEN}●${NC} RUNNING  |  Uptime: $(ps -p $(systemctl show -p MainPID --value monit) -o etime= 2>/dev/null | xargs)"
else
    echo -e "Monit: ${RED}●${NC} STOPPED"
    exit 1
fi

echo ""

# Contar serviços por status
TOTAL=$(monit summary | tail -n +3 | wc -l)
OK=$(monit summary | tail -n +3 | grep -c "OK" || echo 0)
ERRORS=$(monit summary | tail -n +3 | grep -v "OK" | wc -l)

if [ "$ERRORS" -eq 0 ]; then
    echo -e "Serviços: ${GREEN}✅ $OK/$TOTAL OK${NC}"
else
    echo -e "Serviços: ${YELLOW}⚠️  $OK/$TOTAL OK, $ERRORS com problemas${NC}"
fi

echo ""

# Sistema
LOAD=$(uptime | awk -F'load average:' '{print $2}' | xargs)
MEM=$(free | grep Mem | awk '{printf "%.0f%%", $3/$2 * 100}')
DISK=$(df -h / | tail -1 | awk '{print $5}')

echo -e "Sistema:  Load: $LOAD  |  RAM: $MEM  |  Disco: $DISK"

echo ""

# Últimos eventos (se houver problemas)
if [ "$ERRORS" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Últimos Eventos:${NC}"
    tail -3 /var/log/monit.log | sed 's/^/   /'
    echo ""
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Dashboard: http://31.97.129.78:2812  |  Detalhes: monit-health"

