#!/bin/bash

# Saraiva Vision Alert System
# Monitors for critical issues and sends alerts

ALERT_LOG="/var/log/saraiva-alerts.log"
EMAIL_RECIPIENT="admin@saraivavision.com.br"  # Configure as needed
CRITICAL_THRESHOLD=3
WARNING_THRESHOLD=5

# Function to send alert
send_alert() {
    local severity="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo "[$timestamp] [$severity] $message" | tee -a "$ALERT_LOG"

    # Log to system journal for visibility
    logger -t "saraiva-alert" "[$severity] $message"

    # For critical alerts, you could add email/SMS notifications here
    if [ "$severity" = "CRITICAL" ]; then
        # Example: echo "$message" | mail -s "Saraiva Vision CRITICAL ALERT" "$EMAIL_RECIPIENT"
        logger -p user.crit -t "saraiva-critical" "$message"
    fi
}

# Function to check for critical issues
check_critical_issues() {
    local issues=0

    # Check if main website is down
    local website_status=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br)
    if [ "$website_status" != "200" ]; then
        send_alert "CRITICAL" "Main website is DOWN (HTTP $website_status)"
        ((issues++))
    fi

    # Check if API is down
    local api_status=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/api/health)
    if [ "$api_status" != "200" ]; then
        send_alert "CRITICAL" "API health endpoint is DOWN (HTTP $api_status)"
        ((issues++))
    fi

    # Check service statuses
    if ! systemctl is-active --quiet nginx; then
        send_alert "CRITICAL" "Nginx service is DOWN"
        ((issues++))
    fi

    if ! systemctl is-active --quiet saraiva-api; then
        send_alert "CRITICAL" "Saraiva API service is DOWN"
        ((issues++))
    fi

    # Check disk space
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        send_alert "CRITICAL" "Disk usage critical: ${disk_usage}%"
        ((issues++))
    fi

    # Check SSL certificate expiration
    local ssl_expiry=$(openssl s_client -connect saraivavision.com.br:443 -servername saraivavision.com.br < /dev/null 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
    local ssl_days=$(( ($(date -d "$ssl_expiry" +%s) - $(date +%s)) / 86400 ))
    if [ "$ssl_days" -lt 7 ]; then
        send_alert "CRITICAL" "SSL certificate expires in $ssl_days days"
        ((issues++))
    fi

    return $issues
}

# Function to check warning conditions
check_warning_conditions() {
    local issues=0

    # Check high memory usage
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$memory_usage > 85" | bc -l) )); then
        send_alert "WARNING" "High memory usage: ${memory_usage}%"
        ((issues++))
    fi

    # Check high CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    if (( $(echo "$cpu_usage > 85" | bc -l) )); then
        send_alert "WARNING" "High CPU usage: ${cpu_usage}%"
        ((issues++))
    fi

    # Check recent error patterns
    local nginx_errors=$(tail -100 /var/log/nginx/error.log 2>/dev/null | grep -c "error")
    if [ "$nginx_errors" -gt 10 ]; then
        send_alert "WARNING" "High Nginx error rate: $nginx_errors errors in last 100 lines"
        ((issues++))
    fi

    # Check for suspicious activity
    local suspicious_requests=$(tail -1000 /var/log/nginx/access.log 2>/dev/null | grep -E "(cgi-bin|luci|shell|\.php)" | wc -l)
    if [ "$suspicious_requests" -gt 5 ]; then
        send_alert "WARNING" "Suspicious requests detected: $suspicious_requests in last 1000 requests"
        ((issues++))
    fi

    return $issues
}

# Function to analyze trends
analyze_trends() {
    # Check for increasing error rates
    local current_errors=$(tail -50 /var/log/nginx/error.log 2>/dev/null | grep -c "error")
    local previous_errors=$(tail -100 /var/log/nginx/error.log 2>/dev/null | head -50 | grep -c "error")

    if [ "$current_errors" -gt "$((previous_errors * 2))" ] && [ "$current_errors" -gt 5 ]; then
        send_alert "WARNING" "Error rate increasing: current ($current_errors) vs previous ($previous_errors)"
    fi

    # Check for unusual traffic patterns
    local recent_requests=$(tail -1000 /var/log/nginx/access.log 2>/dev/null | wc -l)
    if [ "$recent_requests" -lt 10 ]; then
        send_alert "WARNING" "Unusually low traffic: $recent_requests requests in last 1000 log lines"
    fi
}

# Main alert function
run_alert_check() {
    echo "=== SARAIVA VISION ALERT SYSTEM ===" | tee -a "$ALERT_LOG"
    echo "Time: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$ALERT_LOG"

    check_critical_issues
    local critical_issues=$?

    check_warning_conditions
    local warning_issues=$?

    analyze_trends

    if [ "$critical_issues" -eq 0 ] && [ "$warning_issues" -eq 0 ]; then
        echo "✅ All systems operating normally" | tee -a "$ALERT_LOG"
    else
        echo "⚠️ Issues detected: $critical_issues critical, $warning_issues warnings" | tee -a "$ALERT_LOG"
    fi

    echo "=== ALERT CHECK COMPLETED ===" | tee -a "$ALERT_LOG"
    echo ""
}

# Run alert check
run_alert_check