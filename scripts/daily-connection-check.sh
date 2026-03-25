#!/bin/bash
# =============================================================================
# Saraiva Vision - Daily Connection & Server Status Check
#
# Comprehensive daily health check that verifies:
# - Website connectivity and response times
# - API endpoint health
# - SSL certificate validity
# - DNS resolution
# - Nginx status and configuration
# - systemd service status (saraiva-api)
# - Redis connectivity
# - System resources (CPU, RAM, disk)
# - Google Analytics/GTM endpoint accessibility
# - Sanity CMS API connectivity
# - Port availability (443, 3001)
#
# Output: JSON report + human-readable log
# Usage: bash scripts/daily-connection-check.sh [--json] [--quiet]
#
# @author Dr. Philipe Saraiva Cruz
# =============================================================================

set -uo pipefail

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
REPORT_DIR="$PROJECT_ROOT/reports/daily-checks"
mkdir -p "$REPORT_DIR"

LOG_FILE="$REPORT_DIR/check-${TIMESTAMP}.log"
JSON_FILE="$REPORT_DIR/check-${TIMESTAMP}.json"

# Parse arguments
OUTPUT_JSON=false
QUIET=false
for arg in "$@"; do
  case "$arg" in
    --json) OUTPUT_JSON=true ;;
    --quiet) QUIET=true ;;
  esac
done

# Domains and endpoints
MAIN_SITE="https://saraivavision.com.br"
API_HEALTH="https://saraivavision.com.br/api/health"
API_LOCAL="http://127.0.0.1:3001/health"
SANITY_API="https://92ocrdmp.api.sanity.io/v2024-01-01/data/query/production?query=count%28%2A%5B_type%3D%3D%22post%22%5D%29"
GTM_ENDPOINT="https://www.googletagmanager.com/gtm.js?id=GTM-KF2NP85D"
GA_ENDPOINT="https://www.googletagmanager.com/gtag/js?id=G-LXWRK8ELS6"

# Thresholds
RESPONSE_TIME_WARN=3    # seconds
RESPONSE_TIME_CRIT=8    # seconds
SSL_WARN_DAYS=14
SSL_CRIT_DAYS=7
CPU_WARN=80
MEM_WARN=85
DISK_WARN=85

# Counters
PASS=0
WARN=0
FAIL=0
TOTAL=0

# JSON results array
declare -a JSON_RESULTS

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------
log() {
  local level="$1"
  shift
  local msg="$*"
  local ts
  ts="$(date '+%Y-%m-%d %H:%M:%S')"

  echo "[$ts] [$level] $msg" >> "$LOG_FILE"

  if [[ "$QUIET" == "false" ]]; then
    case "$level" in
      PASS) echo -e "\033[32m[PASS]\033[0m $msg" ;;
      WARN) echo -e "\033[33m[WARN]\033[0m $msg" ;;
      FAIL) echo -e "\033[31m[FAIL]\033[0m $msg" ;;
      INFO) echo -e "\033[36m[INFO]\033[0m $msg" ;;
      *)    echo "[$level] $msg" ;;
    esac
  fi
}

record() {
  local name="$1"
  local status="$2"
  local detail="$3"
  local value="${4:-}"

  TOTAL=$((TOTAL + 1))
  case "$status" in
    pass) PASS=$((PASS + 1)) ;;
    warn) WARN=$((WARN + 1)) ;;
    fail) FAIL=$((FAIL + 1)) ;;
  esac

  # Escape double quotes in detail for JSON
  local safe_detail
  safe_detail=$(echo "$detail" | sed 's/"/\\"/g' | tr '\n' ' ')
  local safe_value
  safe_value=$(echo "$value" | sed 's/"/\\"/g')

  JSON_RESULTS+=("{\"name\":\"$name\",\"status\":\"$status\",\"detail\":\"$safe_detail\",\"value\":\"$safe_value\"}")
}

header() {
  if [[ "$QUIET" == "false" ]]; then
    echo ""
    echo -e "\033[1;35m--- $1 ---\033[0m"
  fi
  echo "" >> "$LOG_FILE"
  echo "--- $1 ---" >> "$LOG_FILE"
}

# ---------------------------------------------------------------------------
# Check functions
# ---------------------------------------------------------------------------

check_http() {
  local name="$1"
  local url="$2"
  local expected_code="${3:-200}"

  local result
  result=$(curl -sS -o /dev/null -w "%{http_code}|%{time_total}|%{ssl_verify_result}" \
    --max-time 15 --connect-timeout 10 \
    -A "SaraivaVision-DailyCheck/1.0" \
    "$url" 2>&1) || true

  local http_code response_time ssl_verify
  http_code=$(echo "$result" | cut -d'|' -f1)
  response_time=$(echo "$result" | cut -d'|' -f2)
  ssl_verify=$(echo "$result" | cut -d'|' -f3)

  if [[ -z "$http_code" || "$http_code" == "000" ]]; then
    log FAIL "$name: Connection failed (timeout or unreachable)"
    record "$name" "fail" "Connection failed - timeout or unreachable" "0"
    return
  fi

  local rt_int
  rt_int=$(echo "$response_time" | cut -d'.' -f1)
  rt_int=${rt_int:-0}

  if [[ "$http_code" == "$expected_code" ]]; then
    if [[ "$rt_int" -ge "$RESPONSE_TIME_CRIT" ]]; then
      log WARN "$name: HTTP $http_code OK but slow (${response_time}s)"
      record "$name" "warn" "HTTP $http_code - response slow: ${response_time}s" "$response_time"
    elif [[ "$rt_int" -ge "$RESPONSE_TIME_WARN" ]]; then
      log WARN "$name: HTTP $http_code OK, slightly slow (${response_time}s)"
      record "$name" "warn" "HTTP $http_code - slightly slow: ${response_time}s" "$response_time"
    else
      log PASS "$name: HTTP $http_code in ${response_time}s"
      record "$name" "pass" "HTTP $http_code in ${response_time}s" "$response_time"
    fi
  else
    log FAIL "$name: Expected HTTP $expected_code, got $http_code (${response_time}s)"
    record "$name" "fail" "Expected HTTP $expected_code, got $http_code in ${response_time}s" "$response_time"
  fi
}

check_ssl() {
  local name="$1"
  local domain="$2"

  local expiry_date
  expiry_date=$(echo | openssl s_client -servername "$domain" -connect "${domain}:443" 2>/dev/null \
    | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2) || true

  if [[ -z "$expiry_date" ]]; then
    log FAIL "$name: Could not retrieve SSL certificate"
    record "$name" "fail" "SSL certificate retrieval failed" "0"
    return
  fi

  local expiry_epoch now_epoch days_left
  expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null) || true
  now_epoch=$(date +%s)

  if [[ -z "$expiry_epoch" ]]; then
    log FAIL "$name: Could not parse SSL expiry date: $expiry_date"
    record "$name" "fail" "Could not parse expiry date" "0"
    return
  fi

  days_left=$(( (expiry_epoch - now_epoch) / 86400 ))

  if [[ "$days_left" -le "$SSL_CRIT_DAYS" ]]; then
    log FAIL "$name: SSL expires in $days_left days! ($expiry_date)"
    record "$name" "fail" "SSL expires in $days_left days ($expiry_date)" "$days_left"
  elif [[ "$days_left" -le "$SSL_WARN_DAYS" ]]; then
    log WARN "$name: SSL expires in $days_left days ($expiry_date)"
    record "$name" "warn" "SSL expires in $days_left days ($expiry_date)" "$days_left"
  else
    log PASS "$name: SSL valid for $days_left days ($expiry_date)"
    record "$name" "pass" "SSL valid for $days_left days" "$days_left"
  fi
}

check_dns() {
  local name="$1"
  local domain="$2"

  local result
  result=$(dig +short "$domain" A 2>/dev/null | head -1) || true

  if [[ -n "$result" ]]; then
    log PASS "$name: Resolves to $result"
    record "$name" "pass" "Resolves to $result" "$result"
  else
    log FAIL "$name: DNS resolution failed"
    record "$name" "fail" "DNS resolution failed for $domain" ""
  fi
}

check_service() {
  local name="$1"
  local service="$2"

  if systemctl is-active --quiet "$service" 2>/dev/null; then
    local uptime_info
    uptime_info=$(systemctl show "$service" --property=ActiveEnterTimestamp --value 2>/dev/null) || true
    log PASS "$name: Active since $uptime_info"
    record "$name" "pass" "Service active since $uptime_info" "running"
  elif systemctl is-enabled --quiet "$service" 2>/dev/null; then
    log FAIL "$name: Enabled but NOT running"
    record "$name" "fail" "Service enabled but not running" "stopped"
  else
    log WARN "$name: Service not found"
    record "$name" "warn" "Service not found or not installed" "not_found"
  fi
}

check_port() {
  local name="$1"
  local port="$2"

  if ss -tlnp 2>/dev/null | grep -q ":${port} " 2>/dev/null; then
    log PASS "$name: Port $port is listening"
    record "$name" "pass" "Port $port is listening" "$port"
  else
    log FAIL "$name: Port $port is NOT listening"
    record "$name" "fail" "Port $port is not listening" "$port"
  fi
}

check_redis() {
  local name="redis-connectivity"

  if command -v redis-cli >/dev/null 2>&1; then
    local pong
    pong=$(redis-cli ping 2>/dev/null) || true
    if [[ "$pong" == "PONG" ]]; then
      log PASS "$name: Redis responding (PONG)"
      record "$name" "pass" "Redis responding with PONG" "connected"
    else
      log FAIL "$name: Redis not responding (got: $pong)"
      record "$name" "fail" "Redis not responding" "disconnected"
    fi
  else
    log WARN "$name: redis-cli not installed"
    record "$name" "warn" "redis-cli not available" "not_installed"
  fi
}

check_nginx() {
  local name="nginx-config"

  if command -v nginx >/dev/null 2>&1; then
    local test_result
    test_result=$(nginx -t 2>&1) || true
    if echo "$test_result" | grep -q "syntax is ok" 2>/dev/null; then
      log PASS "$name: Nginx configuration valid"
      record "$name" "pass" "Nginx configuration syntax is OK" "valid"
    else
      log FAIL "$name: Nginx configuration error"
      record "$name" "fail" "Nginx config error: $(echo "$test_result" | tail -1)" "invalid"
    fi
  else
    log WARN "$name: Nginx not found"
    record "$name" "warn" "Nginx not installed" "not_found"
  fi
}

check_system_resources() {
  # CPU
  local cpu_idle
  cpu_idle=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" 2>/dev/null) || cpu_idle="0"
  local cpu_usage
  cpu_usage=$(echo "100 - $cpu_idle" | bc 2>/dev/null) || cpu_usage="0"
  local cpu_int
  cpu_int=$(echo "$cpu_usage" | cut -d'.' -f1)
  cpu_int=${cpu_int:-0}

  if [[ "$cpu_int" -ge "$CPU_WARN" ]]; then
    log WARN "cpu-usage: ${cpu_usage}% (threshold: ${CPU_WARN}%)"
    record "cpu-usage" "warn" "CPU at ${cpu_usage}% (threshold: ${CPU_WARN}%)" "$cpu_usage"
  else
    log PASS "cpu-usage: ${cpu_usage}%"
    record "cpu-usage" "pass" "CPU at ${cpu_usage}%" "$cpu_usage"
  fi

  # Memory
  local mem_total mem_used mem_pct
  mem_total=$(free -m | awk 'NR==2{print $2}') || mem_total=1
  mem_used=$(free -m | awk 'NR==2{print $3}') || mem_used=0
  mem_pct=$((mem_used * 100 / (mem_total > 0 ? mem_total : 1)))

  if [[ "$mem_pct" -ge "$MEM_WARN" ]]; then
    log WARN "memory-usage: ${mem_used}MB/${mem_total}MB (${mem_pct}%)"
    record "memory-usage" "warn" "Memory at ${mem_pct}% (${mem_used}MB/${mem_total}MB)" "$mem_pct"
  else
    log PASS "memory-usage: ${mem_used}MB/${mem_total}MB (${mem_pct}%)"
    record "memory-usage" "pass" "Memory at ${mem_pct}% (${mem_used}MB/${mem_total}MB)" "$mem_pct"
  fi

  # Disk
  local disk_pct
  disk_pct=$(df / | tail -1 | awk '{print $5}' | sed 's/%//') || disk_pct=0

  if [[ "$disk_pct" -ge "$DISK_WARN" ]]; then
    log WARN "disk-usage: ${disk_pct}%"
    record "disk-usage" "warn" "Disk at ${disk_pct}% (threshold: ${DISK_WARN}%)" "$disk_pct"
  else
    log PASS "disk-usage: ${disk_pct}%"
    record "disk-usage" "pass" "Disk at ${disk_pct}%" "$disk_pct"
  fi

  # Load average
  local load_avg
  load_avg=$(cat /proc/loadavg | awk '{print $1, $2, $3}') || load_avg="unknown"
  log INFO "load-average: $load_avg"
  record "load-average" "pass" "Load: $load_avg" "$load_avg"
}

check_recent_errors() {
  local name="recent-nginx-errors"
  local error_log="/var/log/nginx/saraivavision.error.log"

  if [[ -f "$error_log" ]]; then
    local error_count
    error_count=$(tail -500 "$error_log" 2>/dev/null | grep -c "$(date +%Y/%m/%d)" 2>/dev/null) || error_count=0

    if [[ "$error_count" -gt 50 ]]; then
      log WARN "$name: $error_count errors today in Nginx error log"
      record "$name" "warn" "$error_count Nginx errors today" "$error_count"
    else
      log PASS "$name: $error_count errors today"
      record "$name" "pass" "$error_count Nginx errors today" "$error_count"
    fi
  else
    log INFO "$name: Error log not found at $error_log"
    record "$name" "pass" "Error log not accessible" "0"
  fi
}

generate_json_report() {
  local overall="pass"
  if [[ "$FAIL" -gt 0 ]]; then
    overall="fail"
  elif [[ "$WARN" -gt 0 ]]; then
    overall="warn"
  fi

  {
    echo "{"
    echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
    echo "  \"overall\": \"$overall\","
    echo "  \"summary\": {"
    echo "    \"total\": $TOTAL,"
    echo "    \"pass\": $PASS,"
    echo "    \"warn\": $WARN,"
    echo "    \"fail\": $FAIL"
    echo "  },"
    echo "  \"checks\": ["

    local first=true
    for item in "${JSON_RESULTS[@]}"; do
      if [[ "$first" == "true" ]]; then
        first=false
      else
        echo ","
      fi
      echo -n "    $item"
    done

    echo ""
    echo "  ]"
    echo "}"
  } > "$JSON_FILE"
}

cleanup_old_reports() {
  # Keep only the last 30 days of reports
  find "$REPORT_DIR" -name "check-*.log" -mtime +30 -delete 2>/dev/null || true
  find "$REPORT_DIR" -name "check-*.json" -mtime +30 -delete 2>/dev/null || true
}

# ---------------------------------------------------------------------------
# Main execution
# ---------------------------------------------------------------------------
main() {
  log INFO "=== Saraiva Vision Daily Connection Check ==="
  log INFO "Started at $(date '+%Y-%m-%d %H:%M:%S %Z')"

  # 1. DNS Resolution
  header "DNS Resolution"
  check_dns "dns-saraivavision.com.br" "saraivavision.com.br"

  # 2. Website connectivity
  header "Website Connectivity"
  check_http "site-main" "$MAIN_SITE"

  # 3. SSL Certificates
  header "SSL Certificates"
  check_ssl "ssl-saraivavision.com.br" "saraivavision.com.br"

  # 4. API Endpoints
  header "API Endpoints"
  check_http "api-health-public" "$API_HEALTH"
  check_http "api-health-local" "$API_LOCAL"

  # 5. External Services
  header "External Services"
  check_http "sanity-api" "$SANITY_API"
  check_http "gtm-endpoint" "$GTM_ENDPOINT"
  check_http "ga-endpoint" "$GA_ENDPOINT"

  # 6. System Services
  header "System Services"
  check_service "service-nginx" "nginx"
  check_service "service-saraiva-api" "saraiva-api"
  check_service "service-redis" "redis-server"

  # 7. Ports
  header "Port Availability"
  check_port "port-https" "443"
  check_port "port-api" "3001"

  # 8. Nginx Config
  header "Nginx Configuration"
  check_nginx

  # 9. Redis
  header "Redis Connectivity"
  check_redis

  # 10. System Resources
  header "System Resources"
  check_system_resources

  # 11. Recent Errors
  header "Recent Errors"
  check_recent_errors

  # Generate JSON report
  generate_json_report

  # Cleanup old reports
  cleanup_old_reports

  # Summary
  header "Summary"
  log INFO "Total: $TOTAL | Pass: $PASS | Warn: $WARN | Fail: $FAIL"
  log INFO "Log: $LOG_FILE"
  log INFO "JSON: $JSON_FILE"

  if [[ "$OUTPUT_JSON" == "true" ]]; then
    cat "$JSON_FILE"
  fi

  # Exit code based on results
  if [[ "$FAIL" -gt 0 ]]; then
    exit 2
  elif [[ "$WARN" -gt 0 ]]; then
    exit 1
  fi
  exit 0
}

main "$@"
