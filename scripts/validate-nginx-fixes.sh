#!/bin/bash
# ============================================================
# Nginx Configuration Fixes Validation Script
# ============================================================
# Validates all fixes applied to Nginx configuration
# Author: Dr. Philipe Saraiva Cruz
# Date: 2025-10-24
# ============================================================

set -e

echo "🔍 Nginx Configuration Fixes Validation"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

info() {
    echo -e "ℹ️  INFO: $1"
}

# ============================================================
# Test 1: Check Cache Directories
# ============================================================
echo "📁 Test 1: Cache Directories"
echo "----------------------------"

if [ -d "/var/cache/nginx/proxy" ]; then
    pass "Cache directory /var/cache/nginx/proxy exists"

    # Check ownership
    OWNER=$(stat -c '%U:%G' /var/cache/nginx/proxy)
    if [ "$OWNER" = "www-data:www-data" ]; then
        pass "Ownership is correct (www-data:www-data)"
    else
        fail "Ownership is incorrect: $OWNER (expected www-data:www-data)"
    fi

    # Check permissions
    PERMS=$(stat -c '%a' /var/cache/nginx/proxy)
    if [ "$PERMS" = "755" ]; then
        pass "Permissions are correct (755)"
    else
        warn "Permissions are $PERMS (recommended: 755)"
    fi
else
    fail "Cache directory /var/cache/nginx/proxy does not exist"
fi

if [ -d "/var/cache/nginx/gtm_cache" ]; then
    pass "Cache directory /var/cache/nginx/gtm_cache exists"

    # Check ownership
    OWNER=$(stat -c '%U:%G' /var/cache/nginx/gtm_cache)
    if [ "$OWNER" = "www-data:www-data" ]; then
        pass "Ownership is correct (www-data:www-data)"
    else
        fail "Ownership is incorrect: $OWNER (expected www-data:www-data)"
    fi
else
    fail "Cache directory /var/cache/nginx/gtm_cache does not exist"
fi

echo ""

# ============================================================
# Test 2: Check nginx-gtm-proxy.conf
# ============================================================
echo "📄 Test 2: nginx-gtm-proxy.conf Configuration"
echo "--------------------------------------------"

GTM_PROXY="/home/saraiva-vision-site/nginx-gtm-proxy.conf"

if [ -f "$GTM_PROXY" ]; then
    pass "nginx-gtm-proxy.conf exists"

    # Check for proxy_cache_path
    if grep -q "proxy_cache_path.*gtm_cache" "$GTM_PROXY"; then
        pass "proxy_cache_path for gtm_cache is defined"
    else
        fail "proxy_cache_path for gtm_cache is NOT defined"
    fi

    # Check for consent warnings
    if grep -q "COMPLIANCE REQUIREMENTS" "$GTM_PROXY"; then
        pass "Compliance warnings added to header"
    else
        warn "Compliance warnings missing from header"
    fi

    # Check for consent checks in locations
    if grep -q "analytics_consent" "$GTM_PROXY"; then
        pass "Consent validation code present"
    else
        warn "Consent validation code missing"
    fi

    # Check for proxy_cache directives
    CACHE_COUNT=$(grep -c "proxy_cache gtm_cache" "$GTM_PROXY" || true)
    if [ "$CACHE_COUNT" -ge 3 ]; then
        pass "proxy_cache directive found in $CACHE_COUNT locations"
    else
        fail "proxy_cache directive only found in $CACHE_COUNT locations (expected 3+)"
    fi

else
    fail "nginx-gtm-proxy.conf does not exist"
fi

echo ""

# ============================================================
# Test 3: Check nginx-saraivavision.conf (backup)
# ============================================================
echo "📄 Test 3: nginx-saraivavision.conf (Backup)"
echo "--------------------------------------------"

NGINX_BACKUP="/home/saraiva-vision-site/backups/20251015_222018/nginx-saraivavision.conf"

if [ -f "$NGINX_BACKUP" ]; then
    pass "Backup configuration exists"

    # Check for proxy_cache_path
    if grep -q "proxy_cache_path.*proxy_cache" "$NGINX_BACKUP"; then
        pass "proxy_cache_path for proxy_cache is defined"
    else
        fail "proxy_cache_path for proxy_cache is NOT defined"
    fi

    # Check for limit_except
    if grep -q "limit_except POST" "$NGINX_BACKUP"; then
        pass "limit_except directive found (replaced if block)"
    else
        fail "limit_except directive not found (if block may still exist)"
    fi

    # Check that old if() block is removed
    if grep -q 'if ($request_method !~ ^(POST)$' "$NGINX_BACKUP"; then
        warn "Old if() block still present in webhook location"
    else
        pass "Old if() block successfully removed"
    fi

else
    warn "Backup configuration not found (expected at $NGINX_BACKUP)"
fi

echo ""

# ============================================================
# Test 4: Check Documentation
# ============================================================
echo "📚 Test 4: Documentation"
echo "------------------------"

COMPLIANCE_DOC="/home/saraiva-vision-site/docs/NGINX_GTM_PROXY_COMPLIANCE.md"
SUMMARY_DOC="/home/saraiva-vision-site/docs/NGINX_CONFIGURATION_FIXES_SUMMARY.md"

if [ -f "$COMPLIANCE_DOC" ]; then
    pass "Compliance guide exists"

    # Check for key sections
    if grep -q "Pre-Production Checklist" "$COMPLIANCE_DOC"; then
        pass "Compliance guide contains checklist"
    fi

    if grep -q "LGPD" "$COMPLIANCE_DOC"; then
        pass "LGPD compliance mentioned"
    fi
else
    warn "Compliance guide missing"
fi

if [ -f "$SUMMARY_DOC" ]; then
    pass "Summary report exists"
else
    warn "Summary report missing"
fi

echo ""

# ============================================================
# Test 5: Nginx Configuration Syntax (if running as sudo)
# ============================================================
echo "🔧 Test 5: Nginx Syntax Validation"
echo "----------------------------------"

if [ "$EUID" -eq 0 ]; then
    if nginx -t 2>/dev/null; then
        pass "Nginx configuration syntax is valid"
    else
        fail "Nginx configuration has syntax errors"
        info "Run 'sudo nginx -t' for details"
    fi
else
    warn "Skipping Nginx syntax check (requires sudo)"
    info "Run with sudo to test: sudo ./scripts/validate-nginx-fixes.sh"
fi

echo ""

# ============================================================
# Test 6: Production Config Check
# ============================================================
echo "🚀 Test 6: Production Configuration"
echo "-----------------------------------"

PROD_CONFIG="/etc/nginx/sites-enabled/saraivavision"

if [ -f "$PROD_CONFIG" ]; then
    info "Production config exists at $PROD_CONFIG"

    # Check if fixes are applied to production
    if grep -q "proxy_cache_path.*proxy_cache" "$PROD_CONFIG" 2>/dev/null; then
        pass "Production config has proxy_cache_path"
    else
        warn "Production config may not have proxy_cache_path directive"
        info "Apply fixes from backup to production"
    fi

    if grep -q "limit_except POST" "$PROD_CONFIG" 2>/dev/null; then
        pass "Production config uses limit_except"
    else
        warn "Production config may still use if() block"
        info "Apply fixes from backup to production"
    fi
else
    warn "Production config not found at $PROD_CONFIG"
fi

echo ""

# ============================================================
# Test 7: Cache Functionality (if Nginx is running)
# ============================================================
echo "💾 Test 7: Cache Status"
echo "----------------------"

if systemctl is-active --quiet nginx 2>/dev/null; then
    info "Nginx is running"

    # Check if cache directories have any files
    PROXY_CACHE_SIZE=$(du -sh /var/cache/nginx/proxy 2>/dev/null | cut -f1 || echo "0")
    GTM_CACHE_SIZE=$(du -sh /var/cache/nginx/gtm_cache 2>/dev/null | cut -f1 || echo "0")

    info "Proxy cache size: $PROXY_CACHE_SIZE"
    info "GTM cache size: $GTM_CACHE_SIZE"

    if [ "$PROXY_CACHE_SIZE" != "0" ] || [ "$GTM_CACHE_SIZE" != "0" ]; then
        pass "Cache directories contain data"
    else
        info "Cache directories are empty (normal if just configured)"
    fi
else
    warn "Nginx is not running"
    info "Start Nginx to test cache functionality"
fi

echo ""

# ============================================================
# Summary
# ============================================================
echo "=========================================="
echo "📊 VALIDATION SUMMARY"
echo "=========================================="
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Apply fixes to production: sudo nano /etc/nginx/sites-enabled/saraivavision"
    echo "2. Test configuration: sudo nginx -t"
    echo "3. Reload Nginx: sudo systemctl reload nginx"
    echo "4. Review compliance: cat docs/NGINX_GTM_PROXY_COMPLIANCE.md"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    echo ""
    echo "📋 Action Required:"
    echo "1. Review failed tests above"
    echo "2. Check documentation: docs/NGINX_CONFIGURATION_FIXES_SUMMARY.md"
    echo "3. Apply missing fixes"
    echo "4. Run validation again"
    exit 1
fi
