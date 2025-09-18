#!/bin/bash

# SaraivaVision Routing Configuration Test Script
# Dr. Philipe Saraiva Cruz (CRM-MG 69.870)
# Tests all routing configurations after optimization

echo "🧪 SaraivaVision Routing Configuration Test"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test functions
test_nginx_config() {
    echo -e "${YELLOW}Testing nginx configuration...${NC}"
    
    # Test local nginx config
    if nginx -t -c nginx.local.conf 2>/dev/null; then
        echo -e "${GREEN}✅ Local nginx configuration is valid${NC}"
    else
        echo -e "${RED}❌ Local nginx configuration has errors${NC}"
        nginx -t -c nginx.local.conf
        return 1
    fi
    
    # Test production nginx config if available
    if [ -f "nginx.conf" ]; then
        if nginx -t -c nginx.conf 2>/dev/null; then
            echo -e "${GREEN}✅ Production nginx configuration is valid${NC}"
        else
            echo -e "${RED}❌ Production nginx configuration has errors${NC}"
            nginx -t -c nginx.conf
            return 1
        fi
    fi
}

test_php_syntax() {
    echo -e "${YELLOW}Testing PHP syntax...${NC}"
    
    # Test router.php syntax
    if php -l wordpress-local/router.php 2>/dev/null; then
        echo -e "${GREEN}✅ router.php syntax is valid${NC}"
    else
        echo -e "${RED}❌ router.php has syntax errors${NC}"
        return 1
    fi
    
    # Test wp-config.php syntax
    if php -l wordpress-local/wp-config.php 2>/dev/null; then
        echo -e "${GREEN}✅ wp-config.php syntax is valid${NC}"
    else
        echo -e "${RED}❌ wp-config.php has syntax errors${NC}"
        return 1
    fi
}

test_wordpress_files() {
    echo -e "${YELLOW}Testing WordPress file structure...${NC}"
    
    # Check required files
    required_files=(
        "wordpress-local/index.php"
        "wordpress-local/wp-config.php"
        "wordpress-local/router.php"
        "wordpress-local/.htaccess"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "${GREEN}✅ $file exists${NC}"
        else
            echo -e "${RED}❌ $file missing${NC}"
            return 1
        fi
    done
    
    # Check WordPress directories
    required_dirs=(
        "wordpress-local/wp-content"
        "wordpress-local/wp-includes"
        "wordpress-local/wp-admin"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            echo -e "${GREEN}✅ $dir exists${NC}"
        else
            echo -e "${RED}❌ $dir missing${NC}"
            return 1
        fi
    done
}

test_routing_conflicts() {
    echo -e "${YELLOW}Checking for routing conflicts...${NC}"
    
    # Check for duplicate location blocks in nginx configs
    echo "Checking nginx location blocks..."
    
    # Extract location blocks from local config
    locations_local=$(grep -n "location" nginx.local.conf | awk '{print $2}' | sort | uniq -c)
    
    echo "Local nginx location blocks:"
    echo "$locations_local"
    
    # Check for potential conflicts
    conflicts=$(echo "$locations_local" | awk '$1 > 1 {print "Potential conflict: " $2}')
    
    if [ -n "$conflicts" ]; then
        echo -e "${YELLOW}⚠️  Potential conflicts found:${NC}"
        echo "$conflicts"
    else
        echo -e "${GREEN}✅ No obvious location conflicts found${NC}"
    fi
}

test_port_availability() {
    echo -e "${YELLOW}Testing port availability...${NC}"
    
    # Check if port 8083 is available for WordPress
    if lsof -i :8083 >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port 8083 is in use${NC}"
        echo "Process using port 8083:"
        lsof -i :8083
    else
        echo -e "${GREEN}✅ Port 8083 is available${NC}"
    fi
    
    # Check if port 80 is available for nginx
    if lsof -i :80 >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port 80 is in use${NC}"
        echo "Process using port 80:"
        lsof -i :80
    else
        echo -e "${GREEN}✅ Port 80 is available${NC}"
    fi
}

test_wordpress_database() {
    echo -e "${YELLOW}Testing WordPress database setup...${NC}"
    
    # Check if database directory exists
    if [ -d "wordpress-local/wp-content/databases" ]; then
        echo -e "${GREEN}✅ Database directory exists${NC}"
        
        # Check if database file exists
        if [ -f "wordpress-local/wp-content/databases/database.sqlite" ]; then
            echo -e "${GREEN}✅ SQLite database file exists${NC}"
        else
            echo -e "${YELLOW}⚠️  SQLite database file not found (will be created by WordPress)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Database directory not found (will be created by WordPress)${NC}"
    fi
}

# Run all tests
echo "Starting comprehensive routing configuration tests..."
echo ""

test_nginx_config
echo ""
test_php_syntax
echo ""
test_wordpress_files
echo ""
test_routing_conflicts
echo ""
test_port_availability
echo ""
test_wordpress_database

echo ""
echo "============================================"
echo -e "${GREEN}🎉 Routing configuration test completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Start WordPress server: ./start-wordpress-server.sh"
echo "2. Start nginx: nginx -c nginx.local.conf"
echo "3. Test routes in browser:"
echo "   - http://localhost:8083 (WordPress direct)"
echo "   - http://localhost (React app with WordPress proxy)"
echo "   - http://localhost/blog/ (WordPress blog)"
echo "   - http://localhost/wp-admin/ (WordPress admin)"
