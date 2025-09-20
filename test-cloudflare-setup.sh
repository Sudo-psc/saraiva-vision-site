#!/bin/bash

# Test script for Saraiva Vision Cloudflare setup
# Run this after completing Cloudflare configuration

set -e

DOMAIN="saraivavision.com.br"
WWW_DOMAIN="www.saraivavision.com.br"
SERVER_IP="31.97.129.78"

echo "🧪 Saraiva Vision Cloudflare Setup Test"
echo "========================================"

# Test 1: DNS Configuration
echo "📡 Testing DNS configuration..."
DOMAIN_IP=$(nslookup $DOMAIN | grep -A 1 "Name:" | tail -1 | awk '{print $2}')
WWW_IP=$(nslookup $WWW_DOMAIN | grep -A 1 "Name:" | tail -1 | awk '{print $2}')

echo "  Domain $DOMAIN points to: $DOMAIN_IP"
echo "  Domain $WWW_DOMAIN points to: $WWW_IP"

if [[ "$DOMAIN_IP" == "$SERVER_IP" ]]; then
    echo "  ✅ Root domain points to server IP"
else
    echo "  ❌ Root domain does not point to server IP"
fi

if [[ "$WWW_IP" == "$SERVER_IP" ]]; then
    echo "  ✅ WWW domain points to server IP"
else
    echo "  ❌ WWW domain does not point to server IP"
fi

# Test 2: SSL Certificate
echo ""
echo "🔒 Testing SSL certificate..."
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "  ✅ SSL certificate exists"

    # Check certificate expiration
    EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem | cut -d= -f2)
    echo "  📅 Certificate expires: $EXPIRY"

    # Test certificate validity
    if openssl x509 -checkend 86400 -noout -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem; then
        echo "  ✅ Certificate is valid for at least 24 hours"
    else
        echo "  ❌ Certificate expires within 24 hours"
    fi
else
    echo "  ❌ SSL certificate not found"
    echo "  📝 Run: ./setup-cloudflare-ssl.sh"
fi

# Test 3: Service Health
echo ""
echo "🏥 Testing service health..."

# Test Nginx
if curl -s http://localhost/health | grep -q "healthy"; then
    echo "  ✅ Nginx health check passed"
else
    echo "  ❌ Nginx health check failed"
fi

# Test API
if curl -s http://localhost:3001/api/health | grep -q "healthy"; then
    echo "  ✅ API health check passed"
else
    echo "  ❌ API health check failed"
fi

# Test Frontend
if curl -s http://localhost:3002 | grep -q "Saraiva"; then
    echo "  ✅ Frontend is responding"
else
    echo "  ❌ Frontend is not responding"
fi

# Test 4: SSL Connectivity (if DNS points to server)
if [[ "$DOMAIN_IP" == "$SERVER_IP" ]]; then
    echo ""
    echo "🌐 Testing SSL connectivity..."

    # Test HTTPS
    if curl -k -I https://$DOMAIN 2>/dev/null | grep -q "200 OK\|301 Moved"; then
        echo "  ✅ HTTPS connection successful"
    else
        echo "  ❌ HTTPS connection failed"
    fi

    # Test SSL configuration
    if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        echo "  ✅ SSL certificate verification successful"
    else
        echo "  ❌ SSL certificate verification failed"
    fi

    # Test API endpoint
    if curl -k -s https://$DOMAIN/api/health | grep -q "healthy"; then
        echo "  ✅ API endpoint accessible via HTTPS"
    else
        echo "  ❌ API endpoint not accessible via HTTPS"
    fi
fi

# Test 5: Configuration Files
echo ""
echo "📋 Testing configuration files..."

if [ -f "/home/saraiva-vision-site/nginx-configs/cloudflare-optimized.conf" ]; then
    echo "  ✅ Cloudflare-optimized Nginx configuration exists"
else
    echo "  ❌ Cloudflare-optimized Nginx configuration missing"
fi

if [ -f "/home/saraiva-vision-site/setup-cloudflare-ssl.sh" ]; then
    echo "  ✅ SSL setup script exists"
else
    echo "  ❌ SSL setup script missing"
fi

if [ -f "/home/saraiva-vision-site/CLOUDFLARE_CONFIG.md" ]; then
    echo "  ✅ Cloudflare configuration guide exists"
else
    echo "  ❌ Cloudflare configuration guide missing"
fi

# Test 6: Docker Services
echo ""
echo "🐳 Testing Docker services..."
docker compose ps --format "table {{.Service}}\t{{.Status}}" | grep -E "(api|frontend|nginx|db|redis)" | while read line; do
    if echo "$line" | grep -q "healthy\|running\|Up"; then
        echo "  ✅ $line"
    else
        echo "  ❌ $line"
    fi
done

# Test 7: Performance and Security Headers
if [[ "$DOMAIN_IP" == "$SERVER_IP" ]]; then
    echo ""
    echo "🔐 Testing security headers..."

    # Get headers
    HEADERS=$(curl -k -I https://$DOMAIN 2>/dev/null)

    # Check for important headers
    if echo "$HEADERS" | grep -qi "Strict-Transport-Security"; then
        echo "  ✅ HSTS header present"
    else
        echo "  ❌ HSTS header missing"
    fi

    if echo "$HEADERS" | grep -qi "Content-Security-Policy"; then
        echo "  ✅ CSP header present"
    else
        echo "  ❌ CSP header missing"
    fi

    if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
        echo "  ✅ X-Content-Type-Options header present"
    else
        echo "  ❌ X-Content-Type-Options header missing"
    fi
fi

# Test 8: Cloudflare Integration (if proxy enabled)
echo ""
echo "☁️  Testing Cloudflare integration..."

if [[ "$DOMAIN_IP" == "172.67.180.121" || "$DOMAIN_IP" == "104.21.83.178" ]]; then
    echo "  ✅ Domain points to Cloudflare (proxy enabled)"

    # Test Cloudflare headers
    CF_HEADERS=$(curl -k -I https://$DOMAIN 2>/dev/null)
    if echo "$CF_HEADERS" | grep -qi "CF-RAY"; then
        echo "  ✅ Cloudflare headers present"
    else
        echo "  ❌ Cloudflare headers missing"
    fi
elif [[ "$DOMAIN_IP" == "$SERVER_IP" ]]; then
    echo "  ⚠️  Domain points to server (DNS only mode)"
    echo "  📝 Complete Cloudflare setup after SSL installation"
else
    echo "  ❌ Domain points to unknown IP: $DOMAIN_IP"
fi

# Summary
echo ""
echo "📊 Test Summary"
echo "==============="

if [[ "$DOMAIN_IP" == "$SERVER_IP" ]]; then
    echo "🔧 Ready for SSL installation"
    echo "   Run: ./setup-cloudflare-ssl.sh"
elif [[ "$DOMAIN_IP" == "172.67.180.121" || "$DOMAIN_IP" == "104.21.83.178" ]]; then
    echo "🎉 Cloudflare proxy enabled"
    echo "   Verify SSL mode is Full (strict)"
else
    echo "⚠️  DNS configuration needed"
    echo "   Update DNS records in Cloudflare"
fi

echo ""
echo "📚 Documentation"
echo "  - Cloudflare Setup: CLOUDFLARE_SETUP.md"
echo "  - Configuration Guide: CLOUDFLARE_CONFIG.md"
echo "  - SSL Setup Script: setup-cloudflare-ssl.sh"
echo ""
echo "🚀 Next Steps"
if [[ "$DOMAIN_IP" == "$SERVER_IP" ]]; then
    echo "  1. Install SSL certificates"
    echo "  2. Enable Cloudflare proxy"
    echo "  3. Configure SSL/TLS settings"
elif [[ "$DOMAIN_IP" == "172.67.180.121" || "$DOMAIN_IP" == "104.21.83.178" ]]; then
    echo "  1. Verify SSL/TLS mode is Full (strict)"
    echo "  2. Test all website functionality"
    echo "  3. Configure Cloudflare security settings"
else
    echo "  1. Update DNS records in Cloudflare"
    echo "  2. Wait for DNS propagation"
    echo "  3. Install SSL certificates"
fi

echo ""
echo "✨ Test completed!"