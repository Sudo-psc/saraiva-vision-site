#!/bin/bash

# Saraiva Vision System Health Check Script
# Comprehensive health monitoring for all services and websites

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_FORMAT="${OUTPUT_FORMAT:-text}" # text, json, or html
CHECK_TIMEOUT=30

# Services to check
SERVICES=("nginx" "php8.1-fpm" "mysql" "redis-server")
WEBSITES=(
    "https://saraivavision.com.br"
    "https://blog.saraivavision.com.br"
    "http://cms.saraivavision.com.br"
)
APIS=(
    "https://saraivavision.com.br/api/health"
    "https://blog.saraivavision.com.br/wp-json/wp/v2/posts?per_page=1"
    "https://saraivavision.com.br/graphql"
)

# Results storage
declare -A RESULTS
declare -A DETAILS

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}================================${NC}"
}

# Function to check service status
check_service() {
    local service="$1"
    local status="unknown"
    local details=""

    if systemctl is-active --quiet "$service" 2>/dev/null; then
        status="running"
        details="Service is active and running"
    elif systemctl is-enabled --quiet "$service" 2>/dev/null; then
        status="stopped"
        details="Service is enabled but not running"
    else
        status="not_installed"
        details="Service not found or not installed"
    fi

    RESULTS["service_$service"]="$status"
    DETAILS["service_$service"]="$details"
}

# Function to check HTTP/HTTPS connectivity
check_website() {
    local url="$1"
    local status="unknown"
    local details=""
    local response_code=""
    local response_time=""

    # Extract domain for SSL check
    local domain=$(echo "$url" | sed 's|https*://||' | sed 's|/.*||')

    # Check HTTP response
    if response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" \
                 --max-time "$CHECK_TIMEOUT" \
                 -A "SaraivaVision-HealthCheck/1.0" \
                 "$url" 2>/dev/null); then

        response_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        response_time=$(echo "$response" | grep -o "TIME:[0-9.]*" | cut -d: -f2)

        if [[ "$response_code" == "200" ]]; then
            status="healthy"
            details="HTTP $response_code, ${response_time}s response time"
        elif [[ "$response_code" =~ ^(301|302)$ ]]; then
            status="redirect"
            details="HTTP $response_code (redirect), ${response_time}s response time"
        elif [[ "$response_code" =~ ^(4|5)[0-9][0-9]$ ]]; then
            status="error"
            details="HTTP $response_code (client/server error), ${response_time}s response time"
        else
            status="warning"
            details="HTTP $response_code, ${response_time}s response time"
        fi
    else
        status="down"
        details="Connection failed or timeout after ${CHECK_TIMEOUT}s"
    fi

    # Check SSL certificate if HTTPS
    if [[ "$url" == https://* ]]; then
        if echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1; then
            ssl_expiry=$(echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
            ssl_days=$(( ($(date -d "$ssl_expiry" +%s) - $(date +%s)) / 86400 ))
            if [[ $ssl_days -gt 30 ]]; then
                details="$details, SSL valid (${ssl_days} days)"
            elif [[ $ssl_days -gt 7 ]]; then
                details="$details, SSL expires soon (${ssl_days} days)"
                [[ "$status" == "healthy" ]] && status="warning"
            else
                details="$details, SSL expires very soon (${ssl_days} days)"
                [[ "$status" != "error" ]] && status="error"
            fi
        else
            details="$details, SSL certificate invalid"
            [[ "$status" != "error" ]] && status="error"
        fi
    fi

    RESULTS["website_$domain"]="$status"
    DETAILS["website_$domain"]="$details"
}

# Function to check API endpoints
check_api() {
    local url="$1"
    local status="unknown"
    local details=""
    local response_code=""
    local response_time=""

    if response=$(curl -s -w "HTTPSTATUS:%{http_code};TIME:%{time_total}" \
                 --max-time "$CHECK_TIMEOUT" \
                 -H "Accept: application/json" \
                 -A "SaraivaVision-HealthCheck/1.0" \
                 "$url" 2>/dev/null); then

        response_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
        response_time=$(echo "$response" | grep -o "TIME:[0-9.]*" | cut -d: -f2)

        if [[ "$response_code" == "200" ]]; then
            status="healthy"
            details="API responding, HTTP $response_code, ${response_time}s response time"
        elif [[ "$response_code" =~ ^(4|5)[0-9][0-9]$ ]]; then
            status="error"
            details="API error, HTTP $response_code, ${response_time}s response time"
        else
            status="warning"
            details="API unusual response, HTTP $response_code, ${response_time}s response time"
        fi
    else
        status="down"
        details="API unreachable or timeout after ${CHECK_TIMEOUT}s"
    fi

    local api_name=$(echo "$url" | sed 's|https*://[^/]*||' | sed 's|/||g' | sed 's/[^a-zA-Z0-9]/_/g')
    RESULTS["api_$api_name"]="$status"
    DETAILS["api_$api_name"]="$details"
}

# Function to check system resources
check_system_resources() {
    # CPU usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    if (( $(echo "$cpu_usage < 80" | bc -l) )); then
        RESULTS["system_cpu"]="healthy"
        DETAILS["system_cpu"]="CPU usage: ${cpu_usage}%"
    else
        RESULTS["system_cpu"]="warning"
        DETAILS["system_cpu"]="High CPU usage: ${cpu_usage}%"
    fi

    # Memory usage
    mem_total=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    mem_used=$(free -m | awk 'NR==2{printf "%.0f", $3}')
    mem_percent=$((mem_used * 100 / mem_total))
    if [[ $mem_percent -lt 90 ]]; then
        RESULTS["system_memory"]="healthy"
        DETAILS["system_memory"]="Memory usage: ${mem_used}MB/${mem_total}MB (${mem_percent}%)"
    else
        RESULTS["system_memory"]="warning"
        DETAILS["system_memory"]="High memory usage: ${mem_used}MB/${mem_total}MB (${mem_percent}%)"
    fi

    # Disk usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [[ $disk_usage -lt 90 ]]; then
        RESULTS["system_disk"]="healthy"
        DETAILS["system_disk"]="Disk usage: ${disk_usage}%"
    else
        RESULTS["system_disk"]="warning"
        DETAILS["system_disk"]="High disk usage: ${disk_usage}%"
    fi
}

# Function to check database connectivity
check_database() {
    if command -v mysql >/dev/null 2>&1; then
        if mysql -e "SELECT 1;" >/dev/null 2>&1; then
            RESULTS["database_mysql"]="healthy"
            DETAILS["database_mysql"]="MySQL connection successful"
        else
            RESULTS["database_mysql"]="error"
            DETAILS["database_mysql"]="MySQL connection failed"
        fi
    else
        RESULTS["database_mysql"]="not_installed"
        DETAILS["database_mysql"]="MySQL client not found"
    fi
}

# Function to generate JSON output
generate_json() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local overall_status="healthy"

    # Determine overall status
    for key in "${!RESULTS[@]}"; do
        if [[ "${RESULTS[$key]}" == "error" ]] || [[ "${RESULTS[$key]}" == "down" ]]; then
            overall_status="error"
            break
        elif [[ "${RESULTS[$key]}" == "warning" ]] && [[ "$overall_status" == "healthy" ]]; then
            overall_status="warning"
        fi
    done

    echo "{"
    echo "  \"timestamp\": \"$timestamp\","
    echo "  \"overall_status\": \"$overall_status\","
    echo "  \"checks\": {"

    local first=true
    for key in "${!RESULTS[@]}"; do
        if [[ "$first" == "true" ]]; then
            first=false
        else
            echo ","
        fi
        echo -n "    \"$key\": {"
        echo -n "\"status\": \"${RESULTS[$key]}\", "
        echo -n "\"details\": \"${DETAILS[$key]}\""
        echo -n "}"
    done
    echo ""
    echo "  }"
    echo "}"
}

# Function to generate HTML dashboard
generate_html() {
    local timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
    local overall_status="healthy"

    # Determine overall status
    for key in "${!RESULTS[@]}"; do
        if [[ "${RESULTS[$key]}" == "error" ]] || [[ "${RESULTS[$key]}" == "down" ]]; then
            overall_status="error"
            break
        elif [[ "${RESULTS[$key]}" == "warning" ]] && [[ "$overall_status" == "healthy" ]]; then
            overall_status="warning"
        fi
    done

    cat << EOF
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saraiva Vision - Health Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; font-size: 14px; }
        .status-healthy { background: #4CAF50; color: white; }
        .status-warning { background: #FF9800; color: white; }
        .status-error { background: #F44336; color: white; }
        .status-unknown { background: #9E9E9E; color: white; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .card { background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .card-title { font-size: 18px; font-weight: bold; color: #333; }
        .card-details { color: #666; font-size: 14px; line-height: 1.5; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        .refresh-btn { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; margin-top: 20px; }
        .refresh-btn:hover { background: #5a6fd8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Saraiva Vision - Health Dashboard</h1>
            <p>Status de saúde dos serviços e websites</p>
            <div class="status-badge status-$overall_status">Status Geral: $overall_status</div>
            <p style="margin-top: 10px; font-size: 14px;">Última atualização: $timestamp</p>
        </div>

        <div class="grid">
EOF

    # Services
    echo "            <div class=\"card\">"
    echo "                <div class=\"card-header\">"
    echo "                    <div class=\"card-title\">🖥️ Serviços do Sistema</div>"
    echo "                </div>"
    for service in "${SERVICES[@]}"; do
        status="${RESULTS["service_$service"]:-unknown}"
        details="${DETAILS["service_$service"]:-No details available}"
        echo "                <div style=\"margin-bottom: 10px;\">"
        echo "                    <strong>$service:</strong> <span class=\"status-badge status-$status\">$status</span><br>"
        echo "                    <small>$details</small>"
        echo "                </div>"
    done
    echo "            </div>"

    # Websites
    echo "            <div class=\"card\">"
    echo "                <div class=\"card-header\">"
    echo "                    <div class=\"card-title\">🌐 Websites</div>"
    echo "                </div>"
    for website in "${WEBSITES[@]}"; do
        domain=$(echo "$website" | sed 's|https*://||' | sed 's|/.*||')
        status="${RESULTS["website_$domain"]:-unknown}"
        details="${DETAILS["website_$domain"]:-No details available}"
        echo "                <div style=\"margin-bottom: 10px;\">"
        echo "                    <strong>$domain:</strong> <span class=\"status-badge status-$status\">$status</span><br>"
        echo "                    <small>$details</small>"
        echo "                </div>"
    done
    echo "            </div>"

    # APIs
    echo "            <div class=\"card\">"
    echo "                <div class=\"card-header\">"
    echo "                    <div class=\"card-title\">🔌 APIs</div>"
    echo "                </div>"
    for api in "${APIS[@]}"; do
        api_name=$(echo "$api" | sed 's|https*://[^/]*||' | sed 's|/||g' | sed 's/[^a-zA-Z0-9]/_/g')
        status="${RESULTS["api_$api_name"]:-unknown}"
        details="${DETAILS["api_$api_name"]:-No details available}"
        endpoint=$(echo "$api" | sed 's|https*://[^/]*||')
        echo "                <div style=\"margin-bottom: 10px;\">"
        echo "                    <strong>$endpoint:</strong> <span class=\"status-badge status-$status\">$status</span><br>"
        echo "                    <small>$details</small>"
        echo "                </div>"
    done
    echo "            </div>"

    # System Resources
    echo "            <div class=\"card\">"
    echo "                <div class=\"card-header\">"
    echo "                    <div class=\"card-title\">📊 Recursos do Sistema</div>"
    echo "                </div>"
    for resource in "cpu" "memory" "disk"; do
        status="${RESULTS["system_$resource"]:-unknown}"
        details="${DETAILS["system_$resource"]:-No details available}"
        echo "                <div style=\"margin-bottom: 10px;\">"
        echo "                    <strong>$resource:</strong> <span class=\"status-badge status-$status\">$status</span><br>"
        echo "                    <small>$details</small>"
        echo "                </div>"
    done
    echo "            </div>"

    cat << EOF
        </div>

        <div class="footer">
            <button class="refresh-btn" onclick="location.reload()">🔄 Atualizar Dashboard</button>
            <p>Saraiva Vision - Sistema de Monitoramento de Saúde</p>
            <p>Para mais detalhes, execute: <code>./scripts/system-health-check.sh</code></p>
        </div>
    </div>
</body>
</html>
EOF
}

# Main execution
main() {
    print_header "🏥 SARAIVA VISION - SYSTEM HEALTH CHECK"
    print_status "Starting comprehensive health check..."

    # Check services
    print_status "Checking system services..."
    for service in "${SERVICES[@]}"; do
        check_service "$service"
    done

    # Check websites
    print_status "Checking website connectivity..."
    for website in "${WEBSITES[@]}"; do
        check_website "$website"
    done

    # Check APIs
    print_status "Checking API endpoints..."
    for api in "${APIS[@]}"; do
        check_api "$api"
    done

    # Check system resources
    print_status "Checking system resources..."
    check_system_resources

    # Check database
    print_status "Checking database connectivity..."
    check_database

    # Output results
    case "$OUTPUT_FORMAT" in
        "json")
            generate_json
            ;;
        "html")
            generate_html
            ;;
        "text"|*)
            print_header "📊 HEALTH CHECK RESULTS"

            # Overall status
            local overall_status="healthy"
            local error_count=0
            local warning_count=0

            for key in "${!RESULTS[@]}"; do
                case "${RESULTS[$key]}" in
                    "error"|"down")
                        overall_status="error"
                        ((error_count++))
                        ;;
                    "warning")
                        [[ "$overall_status" == "healthy" ]] && overall_status="warning"
                        ((warning_count++))
                        ;;
                esac
            done

            echo "Overall Status: $overall_status"
            echo "Errors: $error_count, Warnings: $warning_count"
            echo ""

            # Services
            print_header "🖥️ SYSTEM SERVICES"
            for service in "${SERVICES[@]}"; do
                status="${RESULTS["service_$service"]}"
                details="${DETAILS["service_$service"]}"
                case "$status" in
                    "running") print_success "✅ $service: $details" ;;
                    "stopped") print_warning "⚠️  $service: $details" ;;
                    "not_installed") print_error "❌ $service: $details" ;;
                    *) print_warning "?  $service: $status" ;;
                esac
            done
            echo ""

            # Websites
            print_header "🌐 WEBSITES"
            for website in "${WEBSITES[@]}"; do
                domain=$(echo "$website" | sed 's|https*://||' | sed 's|/.*||')
                status="${RESULTS["website_$domain"]}"
                details="${DETAILS["website_$domain"]}"
                case "$status" in
                    "healthy") print_success "✅ $domain: $details" ;;
                    "redirect") print_warning "↪️  $domain: $details" ;;
                    "warning") print_warning "⚠️  $domain: $details" ;;
                    "error") print_error "❌ $domain: $details" ;;
                    "down") print_error "🔴 $domain: $details" ;;
                    *) print_warning "?  $domain: $status" ;;
                esac
            done
            echo ""

            # APIs
            print_header "🔌 API ENDPOINTS"
            for api in "${APIS[@]}"; do
                api_name=$(echo "$api" | sed 's|https*://[^/]*||' | sed 's|/||g' | sed 's/[^a-zA-Z0-9]/_/g')
                status="${RESULTS["api_$api_name"]}"
                details="${DETAILS["api_$api_name"]}"
                endpoint=$(echo "$api" | sed 's|https*://[^/]*||')
                case "$status" in
                    "healthy") print_success "✅ $endpoint: $details" ;;
                    "warning") print_warning "⚠️  $endpoint: $details" ;;
                    "error") print_error "❌ $endpoint: $details" ;;
                    "down") print_error "🔴 $endpoint: $details" ;;
                    *) print_warning "?  $endpoint: $status" ;;
                esac
            done
            echo ""

            # System Resources
            print_header "📊 SYSTEM RESOURCES"
            for resource in "cpu" "memory" "disk"; do
                status="${RESULTS["system_$resource"]}"
                details="${DETAILS["system_$resource"]}"
                case "$status" in
                    "healthy") print_success "✅ $resource: $details" ;;
                    "warning") print_warning "⚠️  $resource: $details" ;;
                    *) print_warning "?  $resource: $status" ;;
                esac
            done
            echo ""

            # Database
            print_header "🗄️ DATABASE"
            status="${RESULTS["database_mysql"]}"
            details="${DETAILS["database_mysql"]}"
            case "$status" in
                "healthy") print_success "✅ MySQL: $details" ;;
                "error") print_error "❌ MySQL: $details" ;;
                "not_installed") print_warning "⚠️  MySQL: $details" ;;
                *) print_warning "?  MySQL: $status" ;;
            esac
            echo ""

            print_header "✅ HEALTH CHECK COMPLETED"
            echo "Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
            ;;
    esac
}

# Run main function
main "$@"