#!/bin/bash

# Saraiva Vision Monitoring Dashboard
# Real-time system overview with critical metrics

clear

# Function to display header
display_header() {
    echo "=================================================================="
    echo "🏥 SARAIVA VISION MEDICAL PLATFORM - MONITORING DASHBOARD"
    echo "=================================================================="
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Server: $(hostname) | IP: $(hostname -I | awk '{print $1}')"
    echo "Uptime: $(uptime -p)"
    echo "=================================================================="
    echo ""
}

# Function to display system resources
display_system_resources() {
    echo "📊 SYSTEM RESOURCES"
    echo "-------------------"

    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}')
    local load_avg=$(uptime | awk -F'load average:' '{print $2}')
    local temp=$(sensors 2>/dev/null | grep -E "Core|Tdie" | head -1 | awk '{print $3}' || echo "N/A")

    printf "CPU Usage:     %6s%%\n" "$cpu_usage"
    printf "Memory Usage:  %6s%%\n" "$memory_usage"
    printf "Disk Usage:    %6s\n" "$disk_usage"
    printf "Load Average:  %6s\n" "$load_avg"
    printf "Temperature:   %6s\n" "$temp"

    # Color coding for alerts
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        echo "⚠️  High CPU usage detected"
    fi

    if (( $(echo "$memory_usage > 85" | bc -l) )); then
        echo "⚠️  High memory usage detected"
    fi

    echo ""
}

# Function to display service status
display_service_status() {
    echo "🔧 SERVICE STATUS"
    echo "----------------"

    # Nginx
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx: Active (PID: $(systemctl show nginx -p MainPID --value))"
    else
        echo "❌ Nginx: INACTIVE"
    fi

    # Saraiva API
    if systemctl is-active --quiet saraiva-api; then
        echo "✅ Saraiva API: Active (PID: $(systemctl show saraiva-api -p MainPID --value))"
    else
        echo "❌ Saraiva API: INACTIVE"
    fi

    # Redis
    if systemctl is-active --quiet redis-server; then
        echo "✅ Redis: Active (PID: $(systemctl show redis-server -p MainPID --value))"
    else
        echo "❌ Redis: INACTIVE"
    fi

    echo ""
}

# Function to display website health
display_website_health() {
    echo "🌐 WEBSITE HEALTH"
    echo "----------------"

    # Main website status
    local main_site_status=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br)
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" https://saraivavision.com.br)

    if [ "$main_site_status" = "200" ]; then
        printf "✅ Main Website: HTTP %s (%.3fs)\n" "$main_site_status" "$response_time"
    else
        printf "❌ Main Website: HTTP %s (%.3fs)\n" "$main_site_status" "$response_time"
    fi

    # API health
    local api_health=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/api/health)
    if [ "$api_health" = "200" ]; then
        echo "✅ API Health: HTTP $api_health"
    else
        echo "❌ API Health: HTTP $api_health"
    fi

    # SSL certificate
    local ssl_expiry=$(openssl s_client -connect saraivavision.com.br:443 -servername saraivavision.com.br < /dev/null 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
    local ssl_days=$(( ($(date -d "$ssl_expiry" +%s) - $(date +%s)) / 86400 ))

    if [ "$ssl_days" -lt 30 ]; then
        printf "⚠️  SSL Certificate: %d days\n" "$ssl_days"
    else
        printf "✅ SSL Certificate: %d days\n" "$ssl_days"
    fi

    echo ""
}

# Function to display recent activity
display_recent_activity() {
    echo "📈 RECENT ACTIVITY"
    echo "-----------------"

    # Recent requests
    local recent_requests=$(tail -1000 /var/log/nginx/access.log 2>/dev/null | wc -l)
    local unique_visitors=$(tail -1000 /var/log/nginx/access.log 2>/dev/null | awk '{print $1}' | sort -u | wc -l)

    printf "Requests (last 1000): %d\n" "$recent_requests"
    printf "Unique Visitors: %d\n" "$unique_visitors"

    # Google Reviews status
    local reviews_status=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/api/google-reviews)
    if [ "$reviews_status" = "200" ]; then
        echo "✅ Google Reviews: Active"
    else
        echo "❌ Google Reviews: HTTP $reviews_status"
    fi

    echo ""
}

# Function to display security status
display_security_status() {
    echo "🔒 SECURITY STATUS"
    echo "-----------------"

    # Recent errors
    local nginx_errors=$(tail -100 /var/log/nginx/error.log 2>/dev/null | grep -c "error")
    local suspicious_requests=$(tail -1000 /var/log/nginx/access.log 2>/dev/null | grep -E "(cgi-bin|luci|shell|\.php)" | wc -l)

    printf "Nginx Errors (last 100): %d\n" "$nginx_errors"
    printf "Suspicious Requests (last 1000): %d\n" "$suspicious_requests"

    # Failed logins (if SSH monitoring is enabled)
    local failed_ssh=$(grep "Failed password" /var/log/auth.log 2>/dev/null | grep "$(date '+%b %d')" | wc -l)
    printf "Failed SSH attempts today: %d\n" "$failed_ssh"

    if [ "$suspicious_requests" -gt 10 ]; then
        echo "⚠️  High suspicious activity detected"
    fi

    echo ""
}

# Function to display git status
display_git_status() {
    echo "📝 REPOSITORY STATUS"
    echo "-------------------"

    cd /home/saraiva-vision-site

    local current_branch=$(git branch --show-current)
    local latest_commit=$(git log -1 --oneline --pretty=format:'%h %s')
    local commits_today=$(git log --since="midnight" --oneline | wc -l)
    local uncommitted=$(git status --porcelain | wc -l)

    printf "Current Branch: %s\n" "$current_branch"
    printf "Latest Commit: %s\n" "$latest_commit"
    printf "Commits Today: %d\n" "$commits_today"
    printf "Uncommitted Changes: %d\n" "$uncommitted"

    if [ "$uncommitted" -gt 0 ]; then
        echo "⚠️  Uncommitted changes detected"
    fi

    echo ""
}

# Function to display recent alerts
display_recent_alerts() {
    echo "🚨 RECENT ALERTS"
    echo "----------------"

    if [ -f "/var/log/saraiva-alerts.log" ]; then
        tail -5 /var/log/saraiva-alerts.log | while read line; do
            if [[ $line == *"[CRITICAL]"* ]]; then
                echo "❌ $line"
            elif [[ $line == *"[WARNING]"* ]]; then
                echo "⚠️  $line"
            else
                echo "ℹ️  $line"
            fi
        done
    else
        echo "No alerts recorded yet"
    fi

    echo ""
}

# Function to display monitoring status
display_monitoring_status() {
    echo "📡 MONITORING STATUS"
    echo "-------------------"

    if [ -f "/var/run/saraiva-monitor.pid" ]; then
        local monitor_pid=$(cat /var/run/saraiva-monitor.pid)
        if kill -0 "$monitor_pid" 2>/dev/null; then
            echo "✅ Health Monitor: Active (PID: $monitor_pid)"
        else
            echo "❌ Health Monitor: Stale PID file"
        fi
    else
        echo "❌ Health Monitor: Not running"
    fi

    if [ -f "/var/log/saraiva-health-monitor.log" ]; then
        local last_check=$(tail -1 /var/log/saraiva-health-monitor.log 2>/dev/null | grep -o '\[.*\]' | head -1)
        echo "Last Health Check: $last_check"
    fi

    echo ""
}

# Function to show quick commands
show_quick_commands() {
    echo "⚡ QUICK COMMANDS"
    echo "----------------"
    echo "Health Check:     sudo /home/saraiva-vision-site/scripts/health-monitor.sh"
    echo "Alert System:     sudo /home/saraiva-vision-site/scripts/alert-system.sh"
    echo "Monitor Control:  sudo /home/saraiva-vision-site/scripts/monitor-daemon.sh {start|stop|status}"
    echo "View Nginx Logs:  sudo tail -f /var/log/nginx/access.log"
    echo "View API Logs:     sudo journalctl -u saraiva-api -f"
    echo "Git Status:        git status"
    echo ""
}

# Main dashboard function
display_dashboard() {
    display_header
    display_system_resources
    display_service_status
    display_website_health
    display_recent_activity
    display_security_status
    display_git_status
    display_recent_alerts
    display_monitoring_status
    show_quick_commands

    echo "=================================================================="
    echo "🔄 Auto-refresh in 30 seconds (Press Ctrl+C to exit)"
    echo "=================================================================="
}

# Continuous monitoring mode
if [ "$1" = "--continuous" ]; then
    while true; do
        display_dashboard
        sleep 30
        clear
    done
else
    display_dashboard
fi