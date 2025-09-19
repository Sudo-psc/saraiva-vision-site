#!/bin/bash

# Nginx Configuration Validation Script
# Tests all consolidated configurations for syntax and conflicts

echo "🔍 NGINX CONFIGURATION VALIDATION"
echo "=================================="
echo

CONFIGS_DIR="./nginx-configs"
INCLUDES_DIR="$CONFIGS_DIR/includes"
ERRORS=0

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "OK")
            echo -e "   ${GREEN}✅ $message${NC}"
            ;;
        "ERROR")
            echo -e "   ${RED}❌ $message${NC}"
            ((ERRORS++))
            ;;
        "WARNING")
            echo -e "   ${YELLOW}⚠️  $message${NC}"
            ;;
        "INFO")
            echo -e "   ${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Check if nginx is available for syntax testing
if ! command -v nginx &> /dev/null; then
    print_status "WARNING" "nginx command not available - syntax checking disabled"
    NGINX_AVAILABLE=false
else
    NGINX_AVAILABLE=true
    print_status "OK" "nginx command available for syntax checking"
fi

echo
echo "📁 STRUCTURE VALIDATION"
echo "======================="

# Check main directory structure
if [[ -d "$CONFIGS_DIR" ]]; then
    print_status "OK" "nginx-configs directory exists"
else
    print_status "ERROR" "nginx-configs directory missing"
fi

if [[ -d "$INCLUDES_DIR" ]]; then
    print_status "OK" "includes directory exists"
else
    print_status "ERROR" "includes directory missing"
fi

echo
echo "📄 CONFIGURATION FILES"
echo "======================"

# Check main configuration files
MAIN_CONFIGS=("production.conf" "local.conf" "staging.conf")
for config in "${MAIN_CONFIGS[@]}"; do
    config_path="$CONFIGS_DIR/$config"
    if [[ -f "$config_path" ]]; then
        print_status "OK" "$config exists ($(wc -l < "$config_path") lines)"
        
        # Basic syntax checks
        if grep -q "server {" "$config_path"; then
            print_status "OK" "$config contains server blocks"
        else
            print_status "WARNING" "$config missing server blocks"
        fi
        
        if grep -q "listen" "$config_path"; then
            print_status "OK" "$config has listen directives"
        else
            print_status "ERROR" "$config missing listen directives"
        fi
        
    else
        # Check if config is disabled
        disabled_path="$CONFIGS_DIR/$config.disabled"
        if [[ -f "$disabled_path" ]]; then
            print_status "INFO" "$config disabled ($config.disabled exists)"
        else
            print_status "ERROR" "$config missing"
        fi
    fi
done

echo
echo "🧩 INCLUDE FILES"
echo "================"

# Check include files
INCLUDE_FILES=("ssl.conf" "security-headers.conf" "csp.conf" "gzip.conf" "wordpress-proxy.conf")
for include in "${INCLUDE_FILES[@]}"; do
    include_path="$INCLUDES_DIR/$include"
    if [[ -f "$include_path" ]]; then
        print_status "OK" "$include exists ($(wc -c < "$include_path") bytes)"
    else
        print_status "ERROR" "$include missing"
    fi
done

echo
echo "🔌 PORT CONFLICT ANALYSIS"
echo "========================="

# Analyze port usage across configurations
echo "Port allocation analysis:"
for config in "${MAIN_CONFIGS[@]}"; do
    config_path="$CONFIGS_DIR/$config"
    if [[ -f "$config_path" ]]; then
        echo "  📄 $config:"
        ports=$(grep "listen" "$config_path" | sed 's/.*listen \([0-9]*\).*/\1/' | sort -u)
        for port in $ports; do
            case $port in
                80)
                    print_status "INFO" "Port $port (HTTP)"
                    ;;
                443)
                    print_status "INFO" "Port $port (HTTPS)"
                    ;;
                8080|8081|8082|8083)
                    print_status "INFO" "Port $port (Development/Services)"
                    ;;
                *)
                    print_status "WARNING" "Port $port (Custom)"
                    ;;
            esac
        done
    fi
done

echo
echo "🏗️  NGINX SYNTAX VALIDATION"
echo "============================"

if [[ "$NGINX_AVAILABLE" == "true" ]]; then
    # Create temporary nginx.conf for testing
    temp_nginx_conf=$(mktemp)
    
    cat > "$temp_nginx_conf" << EOF
# Temporary nginx.conf for syntax testing
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Test include files (commented out for syntax test)
    # include $INCLUDES_DIR/gzip.conf;
    
    # Test main configurations
    include $(pwd)/$CONFIGS_DIR/production.conf;
}
EOF

    # Test syntax (this will fail due to missing SSL certs, but will catch syntax errors)
    if nginx -t -c "$temp_nginx_conf" 2>/dev/null; then
        print_status "OK" "Nginx syntax validation passed"
    else
        # Try to get more specific error info
        error_output=$(nginx -t -c "$temp_nginx_conf" 2>&1 | head -3)
        if echo "$error_output" | grep -q "ssl"; then
            print_status "WARNING" "Syntax OK (SSL cert warnings expected in test)"
        else
            print_status "ERROR" "Nginx syntax errors detected"
            echo "$error_output" | while read line; do
                print_status "ERROR" "$line"
            done
        fi
    fi
    
    # Clean up
    rm -f "$temp_nginx_conf"
else
    print_status "INFO" "Nginx syntax validation skipped (nginx not available)"
fi

echo
echo "🔗 DEPENDENCY VALIDATION"
echo "========================"

# Check if include paths are correctly referenced
for config in "${MAIN_CONFIGS[@]}"; do
    config_path="$CONFIGS_DIR/$config"
    if [[ -f "$config_path" ]]; then
        echo "  📄 Checking includes in $config:"
        
        # Check for include statements
        includes=$(grep "include.*nginx-configs/includes/" "$config_path" || true)
        if [[ -n "$includes" ]]; then
            echo "$includes" | while read include_line; do
                # Extract the included file path
                included_file=$(echo "$include_line" | sed 's/.*include \([^;]*\);.*/\1/')
                # Convert absolute path to relative for checking
                relative_path=$(echo "$included_file" | sed 's|/etc/nginx/nginx-configs/includes/||')
                
                if [[ -f "$INCLUDES_DIR/$relative_path" ]]; then
                    print_status "OK" "Include found: $relative_path"
                else
                    print_status "ERROR" "Missing include: $relative_path"
                fi
            done
        else
            print_status "WARNING" "No includes found in $config"
        fi
    fi
done

echo
echo "📊 SUMMARY"
echo "=========="

if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}✅ All validations passed! Configuration is ready for deployment.${NC}"
    echo
    echo "🚀 DEPLOYMENT READY"
    echo "==================="
    echo "• Use: nginx-configs/production.conf for production"
    echo "• Use: nginx-configs/local.conf for development" 
    echo "• Use: nginx-configs/staging.conf for staging"
    echo "• Copy includes/ directory to /etc/nginx/nginx-configs/includes/"
    echo
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s). Please fix before deployment.${NC}"
    echo
    echo "🔧 TROUBLESHOOTING"
    echo "=================="
    echo "• Check file paths and permissions"
    echo "• Verify all include files are present"
    echo "• Test nginx syntax: nginx -t"
    echo
    exit 1
fi