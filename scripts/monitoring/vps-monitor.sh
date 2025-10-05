#!/bin/bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPORT_DIR="/var/log/saraiva-monitoring"
readonly TEMP_DIR="/tmp/saraiva-monitor-$$"
readonly TIMEOUT=60
readonly TIMESTAMP=$(date +%Y%m%d_%H%M%S)
readonly REPORT_FILE="${REPORT_DIR}/report_${TIMESTAMP}.md"
readonly GIT_REPO_PATH="/home/saraiva-vision-site"

mkdir -p "${REPORT_DIR}" "${TEMP_DIR}"
trap "rm -rf ${TEMP_DIR}" EXIT

agent_nginx() {
    local output="${TEMP_DIR}/nginx.txt"
    {
        echo "## 🌐 NGINX STATUS"
        echo ""
        
        if systemctl is-active --quiet nginx 2>/dev/null || service nginx status >/dev/null 2>&1; then
            echo "✅ **Status**: Running"
            
            local pid=$(pgrep -o nginx 2>/dev/null || echo "")
            if [[ -n "$pid" ]]; then
                local mem=$(ps -p "$pid" -o rss= 2>/dev/null | awk '{printf "%.2f MB", $1/1024}')
                local cpu=$(ps -p "$pid" -o %cpu= 2>/dev/null | awk '{printf "%.2f%%", $1}')
                echo "📊 **Memory Usage**: ${mem}"
                echo "⚡ **CPU Usage**: ${cpu}"
                
        local connections=$(ss -tn 'sport = :80 or sport = :443' 2>/dev/null | grep ESTAB | wc -l || echo "0")
        echo "🔗 **Active Connections**: ${connections}"
            fi
            
            if timeout 5 curl -s -o /dev/null -w "%{http_code}" http://localhost >/dev/null 2>&1; then
                local response_time=$(timeout 5 curl -s -o /dev/null -w "%{time_total}" http://localhost 2>/dev/null || echo "N/A")
                echo "⏱️  **Response Time**: ${response_time}s"
            fi
        else
            echo "❌ **Status**: NOT RUNNING"
            echo "⚠️  **Action Required**: Service is down"
        fi
    } > "$output" 2>&1
}

agent_logs() {
    local output="${TEMP_DIR}/logs.txt"
    {
        echo "## 📋 SYSTEM LOGS (Last 24h)"
        echo ""
        
        echo "### Error Summary"
        local since_time=$(date -d '24 hours ago' '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -v-24H '+%Y-%m-%d %H:%M:%S')
        
        if command -v journalctl >/dev/null 2>&1; then
            local critical=$(journalctl --since "${since_time}" -p 2 2>/dev/null | grep -c . || echo "0")
            local errors=$(journalctl --since "${since_time}" -p 3 2>/dev/null | grep -c . || echo "0")
            local warnings=$(journalctl --since "${since_time}" -p 4 2>/dev/null | grep -c . || echo "0")
            
            echo "- 🔴 **Critical**: ${critical}"
            echo "- 🟠 **Errors**: ${errors}"
            echo "- 🟡 **Warnings**: ${warnings}"
        fi
        
        echo ""
        echo "### Nginx Errors"
        if [[ -f /var/log/nginx/error.log ]]; then
            local nginx_errors=$(grep -c "error" /var/log/nginx/error.log 2>/dev/null || echo "0")
            echo "- **Total Errors**: ${nginx_errors}"
            
            if [[ $nginx_errors -gt 0 ]]; then
                echo "- **Recent Errors** (last 5):"
                echo '```'
                tail -n 100 /var/log/nginx/error.log | grep "error" | tail -5 || echo "No recent errors"
                echo '```'
            fi
        else
            echo "⚠️  Log file not accessible"
        fi
        
        echo ""
        echo "### Application Logs"
        if command -v pm2 >/dev/null 2>&1; then
            local pm2_errors=$(pm2 logs --lines 50 --nostream 2>/dev/null | grep -i "error" | tail -5 || echo "")
            if [[ -n "$pm2_errors" ]]; then
                echo '```'
                echo "$pm2_errors"
                echo '```'
            else
                echo "✅ No recent PM2 errors"
            fi
        else
            echo "ℹ️  PM2 not detected, skipping app logs"
        fi
    } > "$output" 2>&1
}

agent_nodejs() {
    local output="${TEMP_DIR}/nodejs.txt"
    {
        echo "## 🟢 NODE.JS STATUS"
        echo ""
        
        local node_pid=""
        
        if command -v pm2 >/dev/null 2>&1; then
            if pm2 list 2>/dev/null | grep -q "online"; then
                echo "✅ **PM2 Status**: Running"
                echo ""
                echo '```'
                pm2 list 2>/dev/null || echo "Failed to get PM2 list"
                echo '```'
                
                node_pid=$(pm2 jlist 2>/dev/null | jq -r '.[0].pid // empty' 2>/dev/null || echo "")
            else
                echo "⚠️  **PM2 Status**: No processes online"
            fi
        elif systemctl is-active --quiet node 2>/dev/null; then
            echo "✅ **Service Status**: Running (systemd)"
            node_pid=$(pgrep -o node 2>/dev/null || echo "")
        else
            node_pid=$(pgrep -o node 2>/dev/null || echo "")
            if [[ -n "$node_pid" ]]; then
                echo "✅ **Process Status**: Running (PID: ${node_pid})"
            else
                echo "❌ **Status**: NOT RUNNING"
            fi
        fi
        
        if [[ -n "$node_pid" ]]; then
            echo ""
            local mem=$(ps -p "$node_pid" -o rss= 2>/dev/null | awk '{printf "%.2f MB", $1/1024}')
            local cpu=$(ps -p "$node_pid" -o %cpu= 2>/dev/null | awk '{printf "%.2f%%", $1}')
            local uptime=$(ps -p "$node_pid" -o etime= 2>/dev/null | xargs)
            
            echo "📊 **Memory Usage**: ${mem}"
            echo "⚡ **CPU Usage**: ${cpu}"
            echo "⏰ **Uptime**: ${uptime}"
        fi
        
        if timeout 5 curl -s http://localhost:3000/health >/dev/null 2>&1; then
            echo "✅ **Health Check**: PASS"
        elif timeout 5 curl -s http://localhost:3000 >/dev/null 2>&1; then
            echo "⚠️  **Health Check**: Endpoint exists but no /health route"
        fi
    } > "$output" 2>&1
}

agent_git() {
    local output="${TEMP_DIR}/git.txt"
    {
        echo "## 🔄 GIT REPOSITORY STATUS"
        echo ""
        
        if [[ ! -d "${GIT_REPO_PATH}/.git" ]]; then
            echo "❌ **Error**: Not a git repository"
            return 1
        fi
        
        cd "${GIT_REPO_PATH}"
        
        local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        echo "🌿 **Current Branch**: ${current_branch}"
        
        if timeout 10 git fetch --quiet 2>/dev/null; then
            echo "✅ **Remote Sync**: Success"
        else
            echo "⚠️  **Remote Sync**: Failed (timeout or network issue)"
        fi
        
        echo ""
        echo "### Recent Commits (Last 24h)"
        local commits=$(git log --since="24 hours ago" --pretty=format:"- %h | %an | %ar | %s" 2>/dev/null || echo "")
        if [[ -n "$commits" ]]; then
            echo "$commits"
        else
            echo "ℹ️  No commits in the last 24 hours"
        fi
        
        echo ""
        echo "### Repository Status"
        local status=$(git status --short 2>/dev/null || echo "")
        if [[ -n "$status" ]]; then
            echo "⚠️  **Uncommitted Changes**:"
            echo '```'
            echo "$status"
            echo '```'
        else
            echo "✅ **Working Tree**: Clean"
        fi
        
        local ahead=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")
        local behind=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "0")
        
        if [[ $ahead -gt 0 ]]; then
            echo "⬆️  **Ahead of Remote**: ${ahead} commits"
        fi
        if [[ $behind -gt 0 ]]; then
            echo "⬇️  **Behind Remote**: ${behind} commits"
        fi
    } > "$output" 2>&1
}

export -f agent_nginx agent_logs agent_nodejs agent_git
export TEMP_DIR TIMEOUT GIT_REPO_PATH

run_parallel_agents() {
    echo "Starting parallel monitoring agents..."
    
    parallel --timeout "${TIMEOUT}" --jobs 4 ::: \
        agent_nginx \
        agent_logs \
        agent_nodejs \
        agent_git
    
    echo "All agents completed"
}

generate_report() {
    local overall_status="✅ OK"
    
    {
        echo "# 📊 SARAIVA VISION - VPS MONITORING REPORT"
        echo ""
        echo "**Generated**: $(date '+%Y-%m-%d %H:%M:%S %Z')"
        echo "**Hostname**: $(hostname)"
        echo "**Uptime**: $(uptime -p 2>/dev/null || uptime)"
        echo ""
        echo "---"
        echo ""
        
        if [[ -f "${TEMP_DIR}/nginx.txt" ]]; then
            cat "${TEMP_DIR}/nginx.txt"
            if grep -q "NOT RUNNING" "${TEMP_DIR}/nginx.txt"; then
                overall_status="❌ CRITICAL"
            fi
        else
            echo "## 🌐 NGINX STATUS"
            echo "❌ **Agent Failed**: Timeout or error"
            overall_status="❌ CRITICAL"
        fi
        echo ""
        
        if [[ -f "${TEMP_DIR}/logs.txt" ]]; then
            cat "${TEMP_DIR}/logs.txt"
        else
            echo "## 📋 SYSTEM LOGS"
            echo "⚠️  **Agent Failed**: Timeout or error"
        fi
        echo ""
        
        if [[ -f "${TEMP_DIR}/nodejs.txt" ]]; then
            cat "${TEMP_DIR}/nodejs.txt"
            if grep -q "NOT RUNNING" "${TEMP_DIR}/nodejs.txt"; then
                overall_status="❌ CRITICAL"
            fi
        else
            echo "## 🟢 NODE.JS STATUS"
            echo "⚠️  **Agent Failed**: Timeout or error"
        fi
        echo ""
        
        if [[ -f "${TEMP_DIR}/git.txt" ]]; then
            cat "${TEMP_DIR}/git.txt"
        else
            echo "## 🔄 GIT REPOSITORY STATUS"
            echo "⚠️  **Agent Failed**: Timeout or error"
        fi
        echo ""
        
        echo "---"
        echo ""
        echo "## 🎯 OVERALL STATUS: ${overall_status}"
        echo ""
        echo "_Report saved to: ${REPORT_FILE}_"
        
    } > "${REPORT_FILE}"
    
    chmod 644 "${REPORT_FILE}"
    echo "Report generated: ${REPORT_FILE}"
}

cleanup_old_reports() {
    find "${REPORT_DIR}" -name "report_*.md" -type f -mtime +30 -delete 2>/dev/null || true
    echo "Old reports cleaned (kept last 30 days)"
}

main() {
    echo "=== Saraiva Vision VPS Monitoring ==="
    echo "Started at: $(date)"
    echo ""
    
    run_parallel_agents
    generate_report
    cleanup_old_reports
    
    echo ""
    echo "=== Monitoring Complete ==="
    
    if grep -q "CRITICAL" "${REPORT_FILE}"; then
        exit 1
    fi
}

main "$@"
