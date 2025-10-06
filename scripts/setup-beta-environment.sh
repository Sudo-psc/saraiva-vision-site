#!/bin/bash
# ==============================================================================
# Saraiva Vision - Beta Environment Setup Script
# ==============================================================================
# Configura ambiente beta no VPS para staging/testing
# ==============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}===================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ==============================================================================
# Configuration
# ==============================================================================
BETA_DOMAIN="beta.saraivavision.com.br"
PROD_DOMAIN="saraivavision.com.br"
BETA_PATH="/var/www/saraivavision/beta"
PROD_PATH="/var/www/saraivavision/current"
RELEASES_PATH="/var/www/saraivavision/releases"
BACKUPS_PATH="/var/www/saraivavision/backups"

# ==============================================================================
# Check if running as root
# ==============================================================================
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root"
    exit 1
fi

print_header "🚀 SETTING UP BETA ENVIRONMENT"

# ==============================================================================
# Step 1: Create directory structure
# ==============================================================================
print_header "📁 Creating Directory Structure"

mkdir -p $BETA_PATH
mkdir -p $RELEASES_PATH/beta
mkdir -p $RELEASES_PATH/production
mkdir -p $BACKUPS_PATH/beta
mkdir -p $BACKUPS_PATH/production

print_success "Directories created"
tree -L 3 /var/www/saraivavision/ || ls -la /var/www/saraivavision/

# ==============================================================================
# Step 2: Configure Nginx for Beta
# ==============================================================================
print_header "🌐 Configuring Nginx for Beta Environment"

cat > /etc/nginx/sites-available/beta-saraivavision << 'NGINX_CONFIG'
# ==============================================================================
# Saraiva Vision - BETA Environment
# ==============================================================================
# Ambiente de staging para testes antes da produção
# URL: https://beta.saraivavision.com.br
# ==============================================================================

# Upstream para Node.js Backend API (Beta)
upstream nodejs_backend_beta {
    server 127.0.0.1:3002;
    keepalive 32;
}

# Rate limiting (mais permissivo que produção)
limit_req_zone $binary_remote_addr zone=beta_limit:10m rate=50r/m;

# ==============================================================================
# HTTPS Server - Beta
# ==============================================================================
server {
    listen 443 ssl http2;
    server_name beta.saraivavision.com.br;

    # SSL Configuration (será gerado pelo Certbot)
    ssl_certificate /etc/letsencrypt/live/beta.saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/beta.saraivavision.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Root directory
    root /var/www/saraivavision/beta;
    index index.html;

    # Charset
    charset utf-8;

    # ==============================================================================
    # Security Headers (Beta - mais permissivo para debug)
    # ==============================================================================
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header X-Environment "BETA" always;

    # CSP mais permissivo para beta
    add_header Content-Security-Policy "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; img-src 'self' https: data: blob:; font-src 'self' data: https:;" always;

    # ==============================================================================
    # Logging (separado do produção)
    # ==============================================================================
    access_log /var/log/nginx/beta-saraivavision-access.log;
    error_log /var/log/nginx/beta-saraivavision-error.log warn;

    # ==============================================================================
    # Cache Control (Beta - cache curto para testes rápidos)
    # ==============================================================================
    # HTML - sem cache
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
        add_header X-Environment "BETA" always;
        try_files $uri $uri/ /index.html;
    }

    # Assets - cache curto
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|ttf|eot)$ {
        expires 5m;
        add_header Cache-Control "public, max-age=300" always;
        add_header X-Environment "BETA" always;
        try_files $uri =404;
    }

    # ==============================================================================
    # API Proxy (Beta)
    # ==============================================================================
    location /api/ {
        limit_req zone=beta_limit burst=20 nodelay;

        proxy_pass http://nodejs_backend_beta/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Environment "BETA";
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # ==============================================================================
    # SPA Routing
    # ==============================================================================
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Environment "BETA" always;
    }

    # ==============================================================================
    # Special Files
    # ==============================================================================
    location = /robots.txt {
        # Beta: disallow all robots
        add_header Content-Type text/plain;
        return 200 "User-agent: *\nDisallow: /\n";
    }

    location = /BUILD_INFO.txt {
        add_header Content-Type text/plain;
        add_header X-Environment "BETA" always;
    }

    # ==============================================================================
    # Compression
    # ==============================================================================
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}

# ==============================================================================
# HTTP Redirect to HTTPS
# ==============================================================================
server {
    listen 80;
    server_name beta.saraivavision.com.br;

    location / {
        return 301 https://$server_name$request_uri;
    }
}
NGINX_CONFIG

print_success "Nginx configuration created for beta environment"

# ==============================================================================
# Step 3: Enable Beta Site (temporarily without SSL)
# ==============================================================================
print_header "⚙️  Enabling Beta Site Configuration"

# Create symlink
ln -sf /etc/nginx/sites-available/beta-saraivavision /etc/nginx/sites-enabled/beta-saraivavision

# Test configuration
if nginx -t; then
    print_success "Nginx configuration test passed"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# ==============================================================================
# Step 4: DNS Instructions
# ==============================================================================
print_header "📋 DNS Configuration Required"

print_warning "You need to configure DNS for beta subdomain:"
echo ""
echo "Add the following DNS record in your domain registrar:"
echo ""
echo "  Type: A"
echo "  Name: beta"
echo "  Value: $(curl -s ifconfig.me)"
echo "  TTL: 300 (5 minutes)"
echo ""
echo "OR"
echo ""
echo "  Type: CNAME"
echo "  Name: beta"
echo "  Value: saraivavision.com.br"
echo "  TTL: 300 (5 minutes)"
echo ""

read -p "Have you configured the DNS record? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please configure DNS and run this script again"
    print_warning "Alternatively, you can continue and configure SSL later with:"
    echo ""
    echo "  sudo certbot --nginx -d beta.saraivavision.com.br"
    echo ""
    read -p "Continue without SSL for now? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# ==============================================================================
# Step 5: SSL Certificate (if DNS is ready)
# ==============================================================================
print_header "🔒 Configuring SSL Certificate"

if command -v certbot >/dev/null 2>&1; then
    print_success "Certbot found"

    # Wait for DNS propagation
    print_warning "Waiting 30 seconds for DNS propagation..."
    sleep 30

    # Try to obtain certificate
    if certbot --nginx -d $BETA_DOMAIN --non-interactive --agree-tos --email admin@saraivavision.com.br; then
        print_success "SSL certificate obtained successfully"
    else
        print_warning "SSL certificate generation failed"
        print_warning "You can try again later with:"
        echo "  sudo certbot --nginx -d $BETA_DOMAIN"
    fi
else
    print_warning "Certbot not installed. Installing..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx

    if certbot --nginx -d $BETA_DOMAIN --non-interactive --agree-tos --email admin@saraivavision.com.br; then
        print_success "SSL certificate obtained successfully"
    else
        print_warning "SSL certificate generation failed"
    fi
fi

# ==============================================================================
# Step 6: Reload Nginx
# ==============================================================================
print_header "🔄 Reloading Nginx"

systemctl reload nginx
print_success "Nginx reloaded"

# ==============================================================================
# Step 7: Create placeholder page
# ==============================================================================
print_header "📄 Creating Placeholder Page"

cat > $BETA_PATH/index.html << 'HTML'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Saraiva Vision - Beta Environment</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .beta-badge {
            background: #ff6b6b;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 2rem;
        }
        p {
            font-size: 1.2rem;
            line-height: 1.6;
            margin-bottom: 1rem;
        }
        .info {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 10px;
            margin-top: 2rem;
        }
        code {
            background: rgba(0, 0, 0, 0.3);
            padding: 0.2rem 0.5rem;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 Saraiva Vision</h1>
        <div class="beta-badge">BETA ENVIRONMENT</div>
        <p>Este é o ambiente de testes (staging) do site Saraiva Vision.</p>
        <div class="info">
            <p><strong>Status:</strong> Aguardando primeiro deploy</p>
            <p><strong>Ambiente:</strong> Beta/Staging</p>
            <p><strong>Objetivo:</strong> Testes antes da produção</p>
            <br>
            <p style="font-size: 0.9rem; opacity: 0.8;">
                O primeiro deploy será feito automaticamente quando houver um push para a branch <code>develop</code> ou <code>main</code>
            </p>
        </div>
    </div>
</body>
</html>
HTML

print_success "Placeholder page created"

# ==============================================================================
# Step 8: Summary
# ==============================================================================
print_header "✅ SETUP COMPLETE"

echo ""
echo "Beta environment has been configured successfully!"
echo ""
echo "📋 Summary:"
echo "  • Beta URL: https://$BETA_DOMAIN"
echo "  • Beta Path: $BETA_PATH"
echo "  • Nginx Config: /etc/nginx/sites-available/beta-saraivavision"
echo "  • Logs: /var/log/nginx/beta-saraivavision-*.log"
echo ""
echo "🔄 Next Steps:"
echo "  1. Configure GitHub Actions secrets:"
echo "     - VPS_HOST: $(curl -s ifconfig.me)"
echo "     - VPS_SSH_KEY: <your SSH private key>"
echo "     - BETA_GOOGLE_MAPS_API_KEY: <beta API key>"
echo "     - BETA_GOOGLE_PLACES_API_KEY: <beta API key>"
echo ""
echo "  2. Push to develop/main branch to trigger auto-deployment"
echo ""
echo "  3. Monitor deployment: https://github.com/<your-repo>/actions"
echo ""
echo "  4. Test on: https://$BETA_DOMAIN"
echo ""
echo "  5. When ready, deploy to production using GitHub Actions UI"
echo ""

print_success "Beta environment setup completed! 🎉"
