#!/bin/bash
#==============================================================================
# Saraiva Vision - Daily Health Check Monitor
# Execução: Diariamente às 06:00 via systemd timer
# Descrição: Monitoramento paralelo de Nginx, Logs, Node.js e Git
#==============================================================================

set -euo pipefail

# Configurações
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="/home/saraiva-vision-site"
readonly LOG_DIR="/var/log/saraiva-monitoring"
readonly REPORT_DIR="${LOG_DIR}/reports"
readonly TEMP_DIR="${LOG_DIR}/temp"
readonly TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
readonly REPORT_FILE="${REPORT_DIR}/health-check-${TIMESTAMP}.md"
readonly RETENTION_DAYS=30
readonly AGENT_TIMEOUT=60

# Cores para output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Criar diretórios necessários
mkdir -p "${LOG_DIR}" "${REPORT_DIR}" "${TEMP_DIR}"

#==============================================================================
# FUNÇÕES AUXILIARES
#==============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $*" >&2
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $*" >&2
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

run_with_timeout() {
    local timeout_duration=$1
    local func_name=$2

    # Execute function in background
    $func_name &
    local pid=$!

    # Wait with timeout
    local count=0
    while kill -0 $pid 2>/dev/null; do
        if [[ $count -ge $timeout_duration ]]; then
            kill -TERM $pid 2>/dev/null
            sleep 1
            kill -KILL $pid 2>/dev/null
            return 124  # timeout exit code
        fi
        sleep 1
        ((count++))
    done

    wait $pid
    return $?
}

#==============================================================================
# AGENTE 1 - MONITOR NGINX
#==============================================================================
agent_nginx_monitor() {
    local output_file="${TEMP_DIR}/nginx_${TIMESTAMP}.txt"

    {
        echo "# NGINX STATUS"
        echo ""

        # Status do serviço
        if systemctl is-active --quiet nginx; then
            echo "✅ **Status**: Running"

            # PID do processo master
            local nginx_pid=$(pgrep -o nginx)
            echo "📊 **PID**: ${nginx_pid}"

            # Uso de memória
            local mem_usage=$(ps -p ${nginx_pid} -o rss= | awk '{printf "%.2f MB", $1/1024}')
            echo "💾 **Memory**: ${mem_usage}"

            # Uso de CPU
            local cpu_usage=$(ps -p ${nginx_pid} -o %cpu= | awk '{printf "%.1f%%", $1}')
            echo "⚡ **CPU**: ${cpu_usage}"

            # Número de workers
            local workers=$(pgrep nginx | wc -l)
            echo "👷 **Workers**: ${workers}"

            # Conexões ativas
            if command -v netstat >/dev/null; then
                local connections=$(netstat -an | grep -c ':80\|:443' || echo "0")
                echo "🔌 **Active Connections**: ${connections}"
            fi

            # Teste de resposta
            local response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:80 2>/dev/null || echo "N/A")
            if [[ "$response_time" != "N/A" ]]; then
                echo "⏱️ **Response Time**: ${response_time}s"
            fi

            # Configuração válida
            if nginx -t &>/dev/null; then
                echo "✅ **Config**: Valid"
            else
                echo "❌ **Config**: Invalid"
            fi

        else
            echo "❌ **Status**: Stopped/Failed"
            systemctl status nginx --no-pager -l | head -20
        fi

        echo ""

    } > "${output_file}" 2>&1

    log_info "Agente Nginx concluído"
}

#==============================================================================
# AGENTE 2 - COLETOR DE LOGS
#==============================================================================
agent_log_collector() {
    local output_file="${TEMP_DIR}/logs_${TIMESTAMP}.txt"

    {
        echo "# SYSTEM LOGS (Last 24h)"
        echo ""

        # Logs de erro do Nginx
        echo "## Nginx Error Logs"
        if [[ -f /var/log/nginx/error.log ]]; then
            local nginx_errors=$(grep -c "error" /var/log/nginx/error.log 2>/dev/null || echo "0")
            echo "- **Total Errors**: ${nginx_errors}"

            if [[ ${nginx_errors} -gt 0 ]]; then
                echo ""
                echo "### Recent Errors (Last 10)"
                echo '```'
                tail -10 /var/log/nginx/error.log
                echo '```'
            fi
        else
            echo "⚠️ Log file not found"
        fi
        echo ""

        # System logs (journalctl)
        echo "## System Logs"
        if command -v journalctl >/dev/null; then
            local system_errors=$(journalctl --since "24 hours ago" -p err --no-pager | wc -l)
            echo "- **System Errors (24h)**: ${system_errors}"

            if [[ ${system_errors} -gt 0 ]]; then
                echo ""
                echo "### Critical System Errors"
                echo '```'
                journalctl --since "24 hours ago" -p err --no-pager | head -20
                echo '```'
            fi
        else
            echo "⚠️ journalctl not available"
        fi
        echo ""

        # Disk space warnings
        echo "## Disk Space"
        local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
        echo "- **Root Usage**: ${disk_usage}%"

        if [[ ${disk_usage} -gt 80 ]]; then
            echo "⚠️ **WARNING**: Disk usage above 80%"
        fi
        echo ""

    } > "${output_file}" 2>&1

    log_info "Agente Logs concluído"
}

#==============================================================================
# AGENTE 3 - MONITOR NODE.JS/REACT
#==============================================================================
agent_nodejs_monitor() {
    local output_file="${TEMP_DIR}/nodejs_${TIMESTAMP}.txt"

    {
        echo "# NODE.JS / VITE PREVIEW STATUS"
        echo ""

        # Procurar processo vite preview (porta 4174)
        local vite_pid=$(pgrep -f "vite preview" | head -1)

        if [[ -n "${vite_pid}" ]]; then
            echo "✅ **Status**: Running"
            echo "📊 **PID**: ${vite_pid}"

            # Uso de memória
            local mem_usage=$(ps -p ${vite_pid} -o rss= | awk '{printf "%.2f MB", $1/1024}')
            echo "💾 **Memory**: ${mem_usage}"

            # Uso de CPU
            local cpu_usage=$(ps -p ${vite_pid} -o %cpu= | awk '{printf "%.1f%%", $1}')
            echo "⚡ **CPU**: ${cpu_usage}"

            # Uptime
            local start_time=$(ps -p ${vite_pid} -o lstart= | awk '{print $2, $3, $4}')
            echo "🕐 **Started**: ${start_time}"

            # Porta
            if command -v netstat >/dev/null; then
                local port=$(netstat -tlnp 2>/dev/null | grep ${vite_pid} | awk '{print $4}' | cut -d: -f2 | head -1)
                echo "🔌 **Port**: ${port}"
            fi

            # Health check
            local health_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4174 2>/dev/null || echo "000")
            if [[ "${health_status}" == "200" ]]; then
                echo "✅ **Health Check**: Passed (${health_status})"
            else
                echo "❌ **Health Check**: Failed (${health_status})"
            fi

        else
            echo "❌ **Status**: Not Running"
            echo "⚠️ Vite preview process not found on port 4174"
        fi

        echo ""

        # Verificar se há outros processos Node.js
        echo "## Other Node.js Processes"
        ps aux | grep -i node | grep -v grep | head -5 || echo "None found"
        echo ""

    } > "${output_file}" 2>&1

    log_info "Agente Node.js concluído"
}

#==============================================================================
# AGENTE 4 - MONITOR GIT
#==============================================================================
agent_git_monitor() {
    local output_file="${TEMP_DIR}/git_${TIMESTAMP}.txt"

    {
        echo "# GIT REPOSITORY STATUS"
        echo ""

        cd "${PROJECT_ROOT}" || exit 1

        # Branch atual
        local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        echo "🌿 **Current Branch**: ${current_branch}"

        # Status do repositório
        echo ""
        echo "## Repository Status"
        echo '```'
        git status --short 2>/dev/null || echo "Git repository not found"
        echo '```'
        echo ""

        # Fetch remoto (silent)
        git fetch --quiet 2>/dev/null || true

        # Commits das últimas 24h
        echo "## Recent Commits (Last 24h)"
        local commits_24h=$(git log --since="24 hours ago" --oneline --no-merges 2>/dev/null | wc -l)
        echo "- **Total Commits**: ${commits_24h}"

        if [[ ${commits_24h} -gt 0 ]]; then
            echo ""
            echo '```'
            git log --since="24 hours ago" --pretty=format:"%h - %an: %s" --no-merges 2>/dev/null | head -10
            echo '```'
        fi
        echo ""

        # Arquivos modificados recentemente
        echo "## Recent Changes"
        local changed_files=$(git diff --name-only HEAD~1 HEAD 2>/dev/null | wc -l || echo "0")
        echo "- **Files Changed (last commit)**: ${changed_files}"

        if [[ ${changed_files} -gt 0 ]]; then
            echo '```'
            git diff --name-status HEAD~1 HEAD 2>/dev/null | head -15
            echo '```'
        fi
        echo ""

        # Divergências com remoto
        echo "## Remote Sync Status"
        local ahead=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")
        local behind=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "0")

        echo "- **Commits Ahead**: ${ahead}"
        echo "- **Commits Behind**: ${behind}"

        if [[ ${ahead} -gt 0 ]]; then
            echo "⚠️ Local branch is ahead of remote"
        fi
        if [[ ${behind} -gt 0 ]]; then
            echo "⚠️ Local branch is behind remote"
        fi
        echo ""

        # Branches não mescladas
        echo "## Unmerged Branches"
        local unmerged=$(git branch --no-merged main 2>/dev/null | grep -v "^\*" | wc -l || echo "0")
        echo "- **Count**: ${unmerged}"

        if [[ ${unmerged} -gt 0 ]]; then
            echo '```'
            git branch --no-merged main 2>/dev/null | grep -v "^\*"
            echo '```'
        fi
        echo ""

    } > "${output_file}" 2>&1

    log_info "Agente Git concluído"
}

#==============================================================================
# CONSOLIDAÇÃO DO RELATÓRIO
#==============================================================================
consolidate_report() {
    log_info "Consolidando relatório..."

    {
        echo "# 🏥 Saraiva Vision - Daily Health Check"
        echo ""
        echo "**Date**: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "**Server**: $(hostname)"
        echo "**Uptime**: $(uptime -p)"
        echo ""
        echo "---"
        echo ""

        # Status geral
        echo "## 📊 Overall Status"
        echo ""

        local status="OK"
        local warnings=0
        local errors=0

        # Verificar status de cada componente
        if ! systemctl is-active --quiet nginx; then
            status="CRITICAL"
            ((errors++))
        fi

        if ! pgrep -f "vite preview" >/dev/null; then
            status="WARNING"
            ((warnings++))
        fi

        local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
        if [[ ${disk_usage} -gt 90 ]]; then
            status="CRITICAL"
            ((errors++))
        elif [[ ${disk_usage} -gt 80 ]]; then
            status="WARNING"
            ((warnings++))
        fi

        if [[ "${status}" == "OK" ]]; then
            echo "✅ **System Status**: ${status}"
        elif [[ "${status}" == "WARNING" ]]; then
            echo "⚠️ **System Status**: ${status} (${warnings} warnings)"
        else
            echo "❌ **System Status**: ${status} (${errors} errors, ${warnings} warnings)"
        fi
        echo ""
        echo "---"
        echo ""

        # Incluir outputs dos agentes
        for agent_file in "${TEMP_DIR}"/*_${TIMESTAMP}.txt; do
            if [[ -f "${agent_file}" ]]; then
                cat "${agent_file}"
                echo ""
            fi
        done

        # Recursos do sistema
        echo "## 💻 System Resources"
        echo ""
        echo "### CPU"
        echo '```'
        top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "Usage: " 100 - $1"%"}'
        echo '```'
        echo ""

        echo "### Memory"
        echo '```'
        free -h | awk 'NR==2{printf "Used: %s / %s (%.1f%%)\n", $3, $2, $3*100/$2}'
        echo '```'
        echo ""

        echo "### Disk"
        echo '```'
        df -h / | awk 'NR==2{printf "Used: %s / %s (%s)\n", $3, $2, $5}'
        echo '```'
        echo ""

        # Load average
        echo "### Load Average"
        echo '```'
        uptime | awk -F'load average:' '{print $2}'
        echo '```'
        echo ""

        echo "---"
        echo ""
        echo "_Report generated by Saraiva Vision Health Check System_"

    } > "${REPORT_FILE}"

    log_info "Relatório salvo em: ${REPORT_FILE}"
}

#==============================================================================
# LIMPEZA DE RELATÓRIOS ANTIGOS
#==============================================================================
cleanup_old_reports() {
    log_info "Limpando relatórios antigos (>${RETENTION_DAYS} dias)..."
    find "${REPORT_DIR}" -name "health-check-*.md" -type f -mtime +${RETENTION_DAYS} -delete
    find "${TEMP_DIR}" -name "*.txt" -type f -mtime +1 -delete
}

#==============================================================================
# EXECUÇÃO PRINCIPAL
#==============================================================================
main() {
    log_info "Iniciando Health Check - ${TIMESTAMP}"

    # Limpar arquivos temporários antigos
    rm -f "${TEMP_DIR}"/*_${TIMESTAMP}.txt 2>/dev/null || true

    # Executar agentes em paralelo
    log_info "Executando agentes em paralelo..."

    # Execute each agent with timeout - run_with_timeout handles backgrounding
    (run_with_timeout ${AGENT_TIMEOUT} agent_nginx_monitor) &
    local pid1=$!

    (run_with_timeout ${AGENT_TIMEOUT} agent_log_collector) &
    local pid2=$!

    (run_with_timeout ${AGENT_TIMEOUT} agent_nodejs_monitor) &
    local pid3=$!

    (run_with_timeout ${AGENT_TIMEOUT} agent_git_monitor) &
    local pid4=$!

    # Aguardar conclusão de todos os agentes
    local failed=0

    wait ${pid1} || { log_error "Agente Nginx falhou"; ((failed++)); }
    wait ${pid2} || { log_error "Agente Logs falhou"; ((failed++)); }
    wait ${pid3} || { log_error "Agente Node.js falhou"; ((failed++)); }
    wait ${pid4} || { log_error "Agente Git falhou"; ((failed++)); }

    if [[ ${failed} -gt 0 ]]; then
        log_warn "${failed} agente(s) falharam, mas continuando..."
    fi

    # Consolidar relatório
    consolidate_report

    # Limpeza
    cleanup_old_reports

    log_info "Health Check concluído com sucesso!"
    log_info "Relatório: ${REPORT_FILE}"

    # Exibir resumo no stdout
    echo ""
    echo "======================================"
    echo "Health Check Report: ${REPORT_FILE}"
    echo "======================================"
    grep "System Status" "${REPORT_FILE}" || true
}

# Executar
main "$@"
