#!/bin/bash

# WordPress Blog Monitoring Script for Saraiva Vision
# Real-time monitoring with automated alerts and performance tracking

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="${DOMAIN:-blog.saraivavision.com.br}"
WP_PATH="${WP_PATH:-/var/www/blog.saraivavision.com.br}"
LOG_PATH="${LOG_PATH:-/var/log/wordpress-monitor}"
ALERT_EMAIL="${ALERT_EMAIL:-admin@saraivavision.com.br}"
CHECK_INTERVAL="${CHECK_INTERVAL:-60}"
PERFORMANCE_THRESHOLD="${PERFORMANCE_THRESHOLD:-2000}"
ERROR_THRESHOLD="${ERROR_THRESHOLD:-5}"

# Metrics tracking
METRICS_FILE="${LOG_PATH}/metrics.log"
ALERTS_FILE="${LOG_PATH}/alerts.log"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_metric() {
    echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to ensure log directory exists
setup_logging() {
    mkdir -p "$LOG_PATH"
    touch "$METRICS_FILE" "$ALERTS_FILE"
}

# Function to send alert
send_alert() {
    local subject="$1"
    local message="$2"
    local severity="${3:-warning}"

    # Log alert
    echo "$(date '+%Y-%m-%d %H:%M:%S') [$severity] $subject: $message" >> "$ALERTS_FILE"

    # Send email if mail command is available
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "[$severity] WordPress Blog Alert: $subject" "$ALERT_EMAIL"
        print_status "Alert sent to $ALERT_EMAIL"
    fi

    # Print to console
    case "$severity" in
        "critical") print_error "🚨 CRITICAL: $subject - $message" ;;
        "warning") print_warning "⚠️ WARNING: $subject - $message" ;;
        *) print_status "ℹ️ INFO: $subject - $message" ;;
    esac
}

# Function to log metrics
log_metric() {
    local metric_name="$1"
    local metric_value="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    echo "$timestamp,$metric_name,$metric_value" >> "$METRICS_FILE"
}

# Function to check service status
check_services() {
    local status_ok=true

    # Check Nginx
    if systemctl is-active --quiet nginx; then
        print_success "✅ Nginx is running"
        log_metric "nginx_status" "1"
    else
        print_error "❌ Nginx is not running"
        log_metric "nginx_status" "0"
        send_alert "Service Down" "Nginx service is not running" "critical"
        status_ok=false
    fi

    # Check PHP-FPM
    if systemctl is-active --quiet php8.1-fpm; then
        print_success "✅ PHP-FPM is running"
        log_metric "php_fpm_status" "1"
    else
        print_error "❌ PHP-FPM is not running"
        log_metric "php_fpm_status" "0"
        send_alert "Service Down" "PHP-FPM service is not running" "critical"
        status_ok=false
    fi

    # Check MySQL
    if systemctl is-active --quiet mysql; then
        print_success "✅ MySQL is running"
        log_metric "mysql_status" "1"
    else
        print_error "❌ MySQL is not running"
        log_metric "mysql_status" "0"
        send_alert "Service Down" "MySQL service is not running" "critical"
        status_ok=false
    fi

    return $status_ok
}

# Function to check website availability
check_website() {
    local url="https://$DOMAIN"
    local start_time=$(date +%s%3N)

    # HTTP check
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" || echo "000")

    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))

    if [[ "$response_code" == "200" ]]; then
        print_success "✅ Website is accessible (HTTP $response_code, ${response_time}ms)"
        log_metric "website_status" "1"
        log_metric "response_time" "$response_time"

        # Check response time
        if [[ $response_time -gt $PERFORMANCE_THRESHOLD ]]; then
            send_alert "Slow Response" "Website response time is ${response_time}ms (threshold: ${PERFORMANCE_THRESHOLD}ms)" "warning"
        fi

        return 0
    else
        print_error "❌ Website is not accessible (HTTP $response_code)"
        log_metric "website_status" "0"
        log_metric "response_time" "-1"
        send_alert "Website Down" "Website returned HTTP $response_code" "critical"
        return 1
    fi
}

# Function to check API endpoints
check_api() {
    local base_url="https://$DOMAIN"
    local api_ok=true

    # Check WordPress REST API root
    local api_response
    api_response=$(curl -s -w "%{http_code}" "${base_url}/wp-json/wp/v2/" -o /dev/null || echo "000")

    if [[ "$api_response" == "200" ]]; then
        print_success "✅ WordPress REST API is working"
        log_metric "api_status" "1"
    else
        print_error "❌ WordPress REST API error (HTTP $api_response)"
        log_metric "api_status" "0"
        send_alert "API Error" "WordPress REST API returned HTTP $api_response" "warning"
        api_ok=false
    fi

    # Check posts endpoint
    local posts_response
    posts_response=$(curl -s -w "%{http_code}" "${base_url}/wp-json/wp/v2/posts?per_page=1" -o /dev/null || echo "000")

    if [[ "$posts_response" == "200" ]]; then
        print_success "✅ Posts API is working"
        log_metric "posts_api_status" "1"
    else
        print_error "❌ Posts API error (HTTP $posts_response)"
        log_metric "posts_api_status" "0"
        send_alert "API Error" "Posts API returned HTTP $posts_response" "warning"
        api_ok=false
    fi

    return $api_ok
}

# Function to check SSL certificate
check_ssl() {
    local expiry_days
    expiry_days=$(echo | openssl s_client -servername "$DOMAIN" -connect "${DOMAIN}:443" 2>/dev/null | openssl x509 -noout -checkend 2592000 2>/dev/null)

    if [[ $? -eq 0 ]]; then
        print_success "✅ SSL certificate is valid (>30 days)"
        log_metric "ssl_status" "1"
    else
        print_warning "⚠️ SSL certificate expires within 30 days"
        log_metric "ssl_status" "0"
        send_alert "SSL Expiry" "SSL certificate for $DOMAIN expires within 30 days" "warning"
    fi
}

# Function to check disk space
check_disk_space() {
    local wp_disk_usage
    wp_disk_usage=$(df "$WP_PATH" | awk 'NR==2 {print $5}' | sed 's/%//')

    print_metric "📊 WordPress directory disk usage: ${wp_disk_usage}%"
    log_metric "disk_usage" "$wp_disk_usage"

    if [[ $wp_disk_usage -gt 90 ]]; then
        send_alert "High Disk Usage" "WordPress directory disk usage is ${wp_disk_usage}%" "critical"
    elif [[ $wp_disk_usage -gt 80 ]]; then
        send_alert "High Disk Usage" "WordPress directory disk usage is ${wp_disk_usage}%" "warning"
    fi
}

# Function to check memory usage
check_memory() {
    local mem_usage
    mem_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')

    print_metric "📊 Memory usage: ${mem_usage}%"
    log_metric "memory_usage" "$mem_usage"

    # Convert to integer for comparison
    local mem_int=${mem_usage%.*}

    if [[ $mem_int -gt 90 ]]; then
        send_alert "High Memory Usage" "System memory usage is ${mem_usage}%" "critical"
    elif [[ $mem_int -gt 80 ]]; then
        send_alert "High Memory Usage" "System memory usage is ${mem_usage}%" "warning"
    fi
}

# Function to check PHP-FPM pool status
check_php_fpm_pool() {
    if command -v curl >/dev/null 2>&1; then
        local pool_status
        pool_status=$(curl -s "http://127.0.0.1:9001/status" 2>/dev/null || echo "error")

        if [[ "$pool_status" != "error" ]]; then
            print_success "✅ PHP-FPM pool is responding"
            log_metric "php_pool_status" "1"

            # Extract metrics from status page
            local active_processes=$(echo "$pool_status" | grep "active processes" | awk '{print $3}')
            local total_processes=$(echo "$pool_status" | grep "total processes" | awk '{print $3}')

            if [[ -n "$active_processes" ]] && [[ -n "$total_processes" ]]; then
                print_metric "📊 PHP-FPM: $active_processes/$total_processes active processes"
                log_metric "php_active_processes" "$active_processes"
                log_metric "php_total_processes" "$total_processes"

                # Alert if pool is saturated
                if [[ $active_processes -ge $((total_processes - 2)) ]]; then
                    send_alert "PHP Pool Saturation" "PHP-FPM pool is nearly saturated ($active_processes/$total_processes)" "warning"
                fi
            fi
        else
            print_error "❌ PHP-FPM pool status check failed"
            log_metric "php_pool_status" "0"
            send_alert "PHP Pool Error" "Unable to retrieve PHP-FPM pool status" "warning"
        fi
    fi
}

# Function to check error logs
check_error_logs() {
    local error_count=0

    # Check Nginx error log
    if [[ -f "/var/log/nginx/error.log" ]]; then
        local nginx_errors
        nginx_errors=$(tail -n 100 /var/log/nginx/error.log | grep "$(date '+%Y/%m/%d')" | wc -l)
        error_count=$((error_count + nginx_errors))

        if [[ $nginx_errors -gt 0 ]]; then
            print_metric "📊 Nginx errors today: $nginx_errors"
        fi
    fi

    # Check PHP-FPM error log
    if [[ -f "/var/log/php8.1-fpm-wordpress-error.log" ]]; then
        local php_errors
        php_errors=$(tail -n 100 /var/log/php8.1-fpm-wordpress-error.log | grep "$(date '+%d-%b-%Y')" | wc -l)
        error_count=$((error_count + php_errors))

        if [[ $php_errors -gt 0 ]]; then
            print_metric "📊 PHP-FPM errors today: $php_errors"
        fi
    fi

    log_metric "error_count" "$error_count"

    if [[ $error_count -gt $ERROR_THRESHOLD ]]; then
        send_alert "High Error Rate" "Detected $error_count errors in logs today (threshold: $ERROR_THRESHOLD)" "warning"
    fi
}

# Function to check WordPress health
check_wordpress_health() {
    if [[ -d "$WP_PATH" ]] && command -v wp >/dev/null 2>&1; then
        cd "$WP_PATH"

        # Check database connectivity
        if wp db check --allow-root --quiet 2>/dev/null; then
            print_success "✅ WordPress database connection is healthy"
            log_metric "wp_db_status" "1"
        else
            print_error "❌ WordPress database connection failed"
            log_metric "wp_db_status" "0"
            send_alert "Database Error" "WordPress database connection failed" "critical"
        fi

        # Check for updates
        local core_updates
        core_updates=$(wp core check-update --format=count --allow-root --quiet 2>/dev/null || echo "0")

        if [[ $core_updates -gt 0 ]]; then
            print_warning "⚠️ WordPress core updates available: $core_updates"
            log_metric "wp_updates_available" "$core_updates"
            send_alert "Updates Available" "$core_updates WordPress core updates available" "info"
        else
            print_success "✅ WordPress is up to date"
            log_metric "wp_updates_available" "0"
        fi

        # Check plugin status
        local inactive_plugins
        inactive_plugins=$(wp plugin list --status=inactive --format=count --allow-root --quiet 2>/dev/null || echo "0")

        if [[ $inactive_plugins -gt 0 ]]; then
            print_metric "📊 Inactive plugins: $inactive_plugins"
        fi

        log_metric "wp_inactive_plugins" "$inactive_plugins"
    fi
}

# Function to generate performance report
generate_performance_report() {
    local report_file="${LOG_PATH}/performance_report_$(date +%Y%m%d).txt"

    print_status "📊 Generating performance report..."

    {
        echo "WordPress Blog Performance Report - $(date)"
        echo "================================================"
        echo ""

        # System metrics
        echo "System Metrics:"
        echo "- CPU Usage: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
        echo "- Memory Usage: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
        echo "- Disk Usage: $(df "$WP_PATH" | awk 'NR==2 {print $5}')"
        echo ""

        # Service status
        echo "Service Status:"
        echo "- Nginx: $(systemctl is-active nginx)"
        echo "- PHP-FPM: $(systemctl is-active php8.1-fpm)"
        echo "- MySQL: $(systemctl is-active mysql)"
        echo ""

        # Recent metrics from log
        echo "Recent Performance Metrics (last 24 hours):"
        if [[ -f "$METRICS_FILE" ]]; then
            local yesterday=$(date -d '1 day ago' '+%Y-%m-%d')
            grep "$yesterday\|$(date '+%Y-%m-%d')" "$METRICS_FILE" | tail -20
        fi

        echo ""
        echo "Recent Alerts:"
        if [[ -f "$ALERTS_FILE" ]]; then
            tail -10 "$ALERTS_FILE"
        fi

    } > "$report_file"

    print_success "✅ Performance report saved to $report_file"
}

# Function to run single check
run_single_check() {
    setup_logging

    print_status "🔍 Running WordPress blog health check..."

    local overall_status=true

    # Run all checks
    check_services || overall_status=false
    check_website || overall_status=false
    check_api || overall_status=false
    check_ssl
    check_disk_space
    check_memory
    check_php_fpm_pool
    check_error_logs
    check_wordpress_health

    if [[ "$overall_status" == "true" ]]; then
        print_success "🎉 All critical checks passed!"
        log_metric "overall_status" "1"
    else
        print_error "⚠️ Some critical checks failed!"
        log_metric "overall_status" "0"
    fi

    echo ""
    print_status "📊 Check completed at $(date)"
}

# Function to run continuous monitoring
run_continuous_monitoring() {
    setup_logging

    print_status "🔄 Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)"
    print_status "Press Ctrl+C to stop monitoring"

    while true; do
        echo ""
        echo "========================================"
        print_status "🔍 Running health check cycle..."

        run_single_check

        sleep "$CHECK_INTERVAL"
    done
}

# Function to show metrics dashboard
show_dashboard() {
    clear
    echo "================================================"
    echo "🏥 WordPress Blog Monitoring Dashboard"
    echo "================================================"
    echo ""

    # Current status
    print_status "Current Status:"
    echo "- Website: $(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://$DOMAIN" || echo "ERROR")"
    echo "- Nginx: $(systemctl is-active nginx 2>/dev/null || echo "unknown")"
    echo "- PHP-FPM: $(systemctl is-active php8.1-fpm 2>/dev/null || echo "unknown")"
    echo "- MySQL: $(systemctl is-active mysql 2>/dev/null || echo "unknown")"
    echo ""

    # System resources
    print_status "System Resources:"
    echo "- CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    echo "- Memory: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
    echo "- Disk: $(df "$WP_PATH" | awk 'NR==2 {print $5}')"
    echo ""

    # Recent alerts
    print_status "Recent Alerts (last 5):"
    if [[ -f "$ALERTS_FILE" ]]; then
        tail -5 "$ALERTS_FILE" | while IFS= read -r line; do
            echo "  $line"
        done
    else
        echo "  No alerts logged"
    fi

    echo ""
    echo "================================================"
    echo "Commands: [c]heck [m]onitor [r]eport [q]uit"
    read -p "Enter command: " -n 1 -r
    echo

    case $REPLY in
        c|C) run_single_check; read -p "Press Enter to continue..." ;;
        m|M) run_continuous_monitoring ;;
        r|R) generate_performance_report ;;
        q|Q) exit 0 ;;
        *) echo "Invalid option" ;;
    esac

    show_dashboard
}

# Command line interface
case "${1:-check}" in
    "check")
        run_single_check
        ;;
    "monitor")
        run_continuous_monitoring
        ;;
    "dashboard")
        show_dashboard
        ;;
    "report")
        generate_performance_report
        ;;
    "logs")
        echo "=== Recent Metrics ==="
        if [[ -f "$METRICS_FILE" ]]; then
            tail -20 "$METRICS_FILE"
        else
            echo "No metrics logged yet"
        fi
        echo ""
        echo "=== Recent Alerts ==="
        if [[ -f "$ALERTS_FILE" ]]; then
            tail -10 "$ALERTS_FILE"
        else
            echo "No alerts logged yet"
        fi
        ;;
    "help")
        echo "WordPress Blog Monitoring Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  check       Run single health check"
        echo "  monitor     Start continuous monitoring"
        echo "  dashboard   Show interactive dashboard"
        echo "  report      Generate performance report"
        echo "  logs        Show recent metrics and alerts"
        echo "  help        Show this help message"
        echo ""
        echo "Environment Variables:"
        echo "  DOMAIN                  Blog domain (default: blog.saraivavision.com.br)"
        echo "  WP_PATH                 WordPress path (default: /var/www/blog.saraivavision.com.br)"
        echo "  LOG_PATH                Log directory (default: /var/log/wordpress-monitor)"
        echo "  ALERT_EMAIL             Alert email address"
        echo "  CHECK_INTERVAL          Check interval in seconds (default: 60)"
        echo "  PERFORMANCE_THRESHOLD   Response time threshold in ms (default: 2000)"
        echo "  ERROR_THRESHOLD         Error count threshold (default: 5)"
        ;;
    *)
        print_error "Unknown command: $1"
        print_status "Use '$0 help' for usage information"
        exit 1
        ;;
esac