#!/bin/bash

# Performance Benchmark Script for SaraivaVision Medical Website
# Dr. Philipe Saraiva Cruz - CRM-MG 69.870
# Tests before and after PHP-FPM optimization

set -euo pipefail

# Configuration
WEBSITE_URL="${WEBSITE_URL:-http://localhost}"
BENCHMARK_DIR="/tmp/saraivavision-benchmarks"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="$BENCHMARK_DIR/benchmark_results_$TIMESTAMP.txt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create benchmark directory
mkdir -p "$BENCHMARK_DIR"

echo -e "${BLUE}🏥 SaraivaVision Medical Website Performance Benchmark${NC}"
echo -e "${BLUE}=================================================${NC}"
echo "Timestamp: $(date)"
echo "Website URL: $WEBSITE_URL"
echo "Results will be saved to: $RESULTS_FILE"
echo ""

# Initialize results file
cat > "$RESULTS_FILE" << EOF
SaraivaVision Medical Website Performance Benchmark
==================================================
Date: $(date)
Website URL: $WEBSITE_URL
PHP Version: $(php --version | head -n1)

EOF

# Function to test single endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    echo -e "${YELLOW}Testing: $name${NC}"
    
    # Use curl with timing format
    local result=$(curl -w "@curl-format.txt" -s -o /dev/null "$url" 2>/dev/null || echo "FAILED")
    
    if [[ "$result" == "FAILED" ]]; then
        echo -e "${RED}❌ FAILED: $name${NC}"
        echo "FAILED: $name" >> "$RESULTS_FILE"
        return 1
    fi
    
    # Extract timing data
    local total_time=$(echo "$result" | grep "time_total" | awk '{print $2}' | sed 's/s//')
    local http_code=$(echo "$result" | grep "http_code" | awk '{print $2}')
    local size=$(echo "$result" | grep "size_download" | awk '{print $2}')
    
    # Convert to milliseconds
    local total_ms=$(echo "$total_time * 1000" | bc -l | cut -d. -f1)
    
    echo -e "${GREEN}✅ $name: ${total_ms}ms (HTTP $http_code, ${size} bytes)${NC}"
    
    # Log to results file
    echo "$name: ${total_ms}ms (HTTP $http_code, ${size} bytes)" >> "$RESULTS_FILE"
    
    return 0
}

# Function to run load test with K6
run_load_test() {
    echo -e "${YELLOW}Running load test...${NC}"
    
    if command -v k6 &> /dev/null; then
        echo "Load Test Results:" >> "$RESULTS_FILE"
        k6 run --vus 10 --duration 30s performance-test.js >> "$RESULTS_FILE" 2>&1
        echo -e "${GREEN}✅ Load test completed${NC}"
    else
        echo -e "${YELLOW}⚠️  K6 not installed, skipping load test${NC}"
        echo "K6 not available - load test skipped" >> "$RESULTS_FILE"
    fi
}

# Function to check PHP-FPM status
check_php_fpm() {
    echo -e "${YELLOW}Checking PHP-FPM status...${NC}"
    
    # Check if PHP-FPM is running
    if pgrep -f "php-fpm" > /dev/null; then
        echo -e "${GREEN}✅ PHP-FPM is running${NC}"
        
        # Get PHP-FPM status if available
        if curl -s "$WEBSITE_URL/fpm-status" > /dev/null 2>&1; then
            local fpm_status=$(curl -s "$WEBSITE_URL/fmp-status")
            echo "PHP-FPM Status:" >> "$RESULTS_FILE"
            echo "$fpm_status" >> "$RESULTS_FILE"
        fi
    else
        echo -e "${YELLOW}⚠️  PHP-FPM not detected (might be using built-in server)${NC}"
        echo "PHP-FPM: Not detected" >> "$RESULTS_FILE"
    fi
}

# Function to check Redis status
check_redis() {
    echo -e "${YELLOW}Checking Redis status...${NC}"
    
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Redis is running${NC}"
            local redis_info=$(redis-cli info memory | grep "used_memory_human")
            echo "Redis Memory: $redis_info" >> "$RESULTS_FILE"
            
            # Test Redis performance
            echo "Redis Performance Test:" >> "$RESULTS_FILE"
            redis-cli --latency -i 1 -c 10 >> "$RESULTS_FILE" 2>&1 &
            local redis_pid=$!
            sleep 10
            kill $redis_pid 2>/dev/null || true
        else
            echo -e "${YELLOW}⚠️  Redis not responding${NC}"
            echo "Redis: Not responding" >> "$RESULTS_FILE"
        fi
    else
        echo -e "${YELLOW}⚠️  Redis CLI not available${NC}"
        echo "Redis CLI: Not available" >> "$RESULTS_FILE"
    fi
}

# Function to check OPcache status
check_opcache() {
    echo -e "${YELLOW}Checking OPcache status...${NC}"
    
    # Create temporary PHP script to check OPcache
    local opcache_check="/tmp/opcache_check.php"
    cat > "$opcache_check" << 'EOF'
<?php
if (function_exists('opcache_get_status')) {
    $status = opcache_get_status(false);
    if ($status) {
        echo "OPcache: Enabled\n";
        echo "Memory Usage: " . round($status['memory_usage']['used_memory']/1024/1024, 2) . "MB\n";
        echo "Hit Rate: " . round($status['opcache_statistics']['opcache_hit_rate'], 2) . "%\n";
        echo "Cached Files: " . $status['opcache_statistics']['num_cached_scripts'] . "\n";
    } else {
        echo "OPcache: Disabled\n";
    }
} else {
    echo "OPcache: Not available\n";
}
EOF
    
    local opcache_result=$(php "$opcache_check")
    echo "$opcache_result"
    echo "OPcache Status:" >> "$RESULTS_FILE"
    echo "$opcache_result" >> "$RESULTS_FILE"
    
    rm -f "$opcache_check"
}

# Function to check memory usage
check_memory() {
    echo -e "${YELLOW}Checking memory usage...${NC}"
    
    local memory_info=$(free -h | grep -E "(Mem|Swap)")
    echo "Memory Usage:" >> "$RESULTS_FILE"
    echo "$memory_info" >> "$RESULTS_FILE"
    
    # PHP processes memory usage
    if pgrep -f "php" > /dev/null; then
        local php_memory=$(ps aux | grep -E "php" | grep -v grep | awk '{sum+=$6} END {print sum/1024 " MB"}')
        echo "PHP Processes Memory: $php_memory" >> "$RESULTS_FILE"
    fi
}

# Main benchmark execution
main() {
    echo -e "${BLUE}Starting performance benchmark...${NC}"
    echo ""
    
    # System checks
    check_php_fpm
    check_redis
    check_opcache
    check_memory
    echo ""
    
    # Website endpoint tests
    echo -e "${BLUE}Testing website endpoints...${NC}"
    echo "Endpoint Performance Tests:" >> "$RESULTS_FILE"
    
    test_endpoint "Frontend Homepage" "$WEBSITE_URL/"
    test_endpoint "WordPress API Posts" "$WEBSITE_URL/wp-json/wp/v2/posts"
    test_endpoint "WordPress Admin" "$WEBSITE_URL/wp-admin/"
    test_endpoint "WordPress Login" "$WEBSITE_URL/wp-login.php"
    
    echo ""
    
    # Load testing
    run_load_test
    
    echo ""
    echo -e "${GREEN}✅ Benchmark completed!${NC}"
    echo -e "${BLUE}Results saved to: $RESULTS_FILE${NC}"
    
    # Display summary
    echo ""
    echo -e "${BLUE}Performance Summary:${NC}"
    grep -E "(Frontend|WordPress|Redis|OPcache)" "$RESULTS_FILE" | tail -10
}

# Run the benchmark
main "$@"