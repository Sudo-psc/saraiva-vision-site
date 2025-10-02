#!/bin/bash

# Saraiva Vision System Health Monitor
# Continuous monitoring script for medical platform

LOG_FILE="/var/log/saraiva-health-monitor.log"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=80
ALERT_THRESHOLD_DISK=90
ALERT_THRESHOLD_RESPONSE_TIME=5

# Function to log with timestamp
log_with_timestamp() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check system resources
check_system_resources() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    local load_avg=$(uptime | awk -F'load average:' '{print $2}')

    log_with_timestamp "=== SYSTEM RESOURCES ==="
    log_with_timestamp "CPU Usage: ${cpu_usage}%"
    log_with_timestamp "Memory Usage: ${memory_usage}%"
    log_with_timestamp "Disk Usage: ${disk_usage}%"
    log_with_timestamp "Load Average: $load_avg"

    # Check for alerts
    if (( $(echo "$cpu_usage > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        log_with_timestamp "🚨 ALERT: High CPU usage: ${cpu_usage}%"
    fi

    if (( $(echo "$memory_usage > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
        log_with_timestamp "🚨 ALERT: High memory usage: ${memory_usage}%"
    fi

    if [ "$disk_usage" -gt "$ALERT_THRESHOLD_DISK" ]; then
        log_with_timestamp "🚨 ALERT: High disk usage: ${disk_usage}%"
    fi
}

# Function to check services
check_services() {
    log_with_timestamp "=== SERVICE STATUS ==="

    # Check Nginx
    if systemctl is-active --quiet nginx; then
        log_with_timestamp "✅ Nginx: Active"
    else
        log_with_timestamp "❌ Nginx: Inactive - CRITICAL"
    fi

    # Check Saraiva API
    if systemctl is-active --quiet saraiva-api; then
        log_with_timestamp "✅ Saraiva API: Active"
    else
        log_with_timestamp "❌ Saraiva API: Inactive - CRITICAL"
    fi

    # Check Redis
    if systemctl is-active --quiet redis-server; then
        log_with_timestamp "✅ Redis: Active"
    else
        log_with_timestamp "❌ Redis: Inactive"
    fi
}

# Function to check website health
check_website_health() {
    log_with_timestamp "=== WEBSITE HEALTH ==="

    # Check main website
    local main_site_status=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br)
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" https://saraivavision.com.br)

    if [ "$main_site_status" = "200" ]; then
        log_with_timestamp "✅ Main Website: HTTP $main_site_status (${response_time}s)"

        if (( $(echo "$response_time > $ALERT_THRESHOLD_RESPONSE_TIME" | bc -l) )); then
            log_with_timestamp "🚨 ALERT: Slow response time: ${response_time}s"
        fi
    else
        log_with_timestamp "❌ Main Website: HTTP $main_site_status - CRITICAL"
    fi

    # Check API health endpoint
    local api_health=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/api/health)
    if [ "$api_health" = "200" ]; then
        log_with_timestamp "✅ API Health: HTTP $api_health"
    else
        log_with_timestamp "❌ API Health: HTTP $api_health - CRITICAL"
    fi

    # Check SSL certificate
    local ssl_expiry=$(openssl s_client -connect saraivavision.com.br:443 -servername saraivavision.com.br < /dev/null 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
    local ssl_days=$(( ($(date -d "$ssl_expiry" +%s) - $(date +%s)) / 86400 ))

    if [ "$ssl_days" -lt 7 ]; then
        log_with_timestamp "🚨 ALERT: SSL certificate expires in $ssl_days days"
    else
        log_with_timestamp "✅ SSL Certificate: Valid for $ssl_days days"
    fi
}

# Function to check recent logs for errors
check_recent_errors() {
    log_with_timestamp "=== RECENT ERRORS ==="

    # Check recent Nginx errors
    local nginx_errors=$(tail -100 /var/log/nginx/error.log 2>/dev/null | grep -c "error")
    if [ "$nginx_errors" -gt 0 ]; then
        log_with_timestamp "⚠️ Nginx: $nginx_errors errors in last 100 lines"
    else
        log_with_timestamp "✅ Nginx: No recent errors"
    fi

    # Check recent API errors
    local api_errors=$(journalctl -u saraiva-api --since "1 hour ago" --no-pager | grep -i "error\|failed" | wc -l)
    if [ "$api_errors" -gt 0 ]; then
        log_with_timestamp "⚠️ API: $api_errors errors in last hour"
    else
        log_with_timestamp "✅ API: No recent errors"
    fi
}

# Function to check Google Reviews functionality
check_google_reviews() {
    log_with_timestamp "=== GOOGLE REVIEWS ==="

    local reviews_endpoint="https://saraivavision.com.br/api/google-reviews"
    local reviews_status=$(curl -s -o /dev/null -w "%{http_code}" "$reviews_endpoint")

    if [ "$reviews_status" = "200" ]; then
        log_with_timestamp "✅ Google Reviews API: HTTP $reviews_status"
    else
        log_with_timestamp "❌ Google Reviews API: HTTP $reviews_status"
    fi
}

# Function to check git status for recent changes
check_recent_changes() {
    log_with_timestamp "=== RECENT CHANGES ==="

    cd /home/saraiva-vision-site
    local recent_commits=$(git log --oneline --since="24 hours ago" | wc -l)
    if [ "$recent_commits" -gt 0 ]; then
        log_with_timestamp "📝 $recent_commits commits in last 24 hours"
        git log --oneline --since="24 hours ago" | while read commit; do
            log_with_timestamp "   $commit"
        done
    else
        log_with_timestamp "📝 No commits in last 24 hours"
    fi
}

# Main monitoring function
run_health_check() {
    log_with_timestamp "========================================"
    log_with_timestamp "🏥 SARAIVA VISION HEALTH MONITOR"
    log_with_timestamp "========================================"

    check_system_resources
    check_services
    check_website_health
    check_google_reviews
    check_recent_errors
    check_recent_changes

    log_with_timestamp "========================================"
    log_with_timestamp "Health check completed"
    log_with_timestamp "========================================"
    echo ""
}

# Run health check
run_health_check