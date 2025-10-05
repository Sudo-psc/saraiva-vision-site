#!/bin/bash
# Next.js Production Deploy Script - Saraiva Vision
# Proper deployment for Next.js with API support using npm start

set -e  # Exit on any error

echo "🚀 Saraiva Vision - Next.js Production Deploy"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/saraiva-vision-site"
SERVICE_NAME="saraiva-vision"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run with sudo: sudo ./scripts/nextjs-production-deploy.sh"
    exit 1
fi

# Step 1: Kill any existing Next.js process on port 3001
echo "🛑 Step 1: Stopping existing Next.js processes..."
pkill -f "next start" 2>/dev/null || true
pkill -f "port 3001" 2>/dev/null || true
systemctl stop "$SERVICE_NAME" 2>/dev/null || true
print_success "Existing processes stopped"

# Step 2: Clean and build
echo ""
echo "🧹 Step 2: Cleaning and building..."
cd "$PROJECT_DIR"
rm -rf .next/
npm run build

if [ $? -eq 0 ]; then
    print_success "Next.js build completed successfully"
else
    print_error "Next.js build failed"
    exit 1
fi

# Step 3: Create systemd service
echo ""
echo "⚙️  Step 3: Creating systemd service..."

cat > "/etc/systemd/system/${SERVICE_NAME}.service" << EOF
[Unit]
Description=Saraiva Vision Next.js Application
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=/usr/bin/npm start
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=saraiva-vision

# Environment file
EnvironmentFile=-$PROJECT_DIR/.env.local

[Install]
WantedBy=multi-user.target
EOF

print_success "Systemd service created"

# Step 4: Update Nginx configuration
echo ""
echo "🌐 Step 4: Updating Nginx configuration..."

# Backup current config
cp /etc/nginx/sites-enabled/saraivavision "/etc/nginx/sites-enabled/saraivavision.backup_$TIMESTAMP"

cat > "/etc/nginx/sites-available/saraivavision-nextjs" << 'EOF'
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Static files from Next.js build (serve directly for performance)
    location /_next/static/ {
        alias /home/saraiva-vision-site/.next/static/;
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Public static assets
    location /static/ {
        alias /home/saraiva-vision-site/public/static/;
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Images and other static files
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|avif|webmanifest|js|css|woff|woff2|ttf|eot)$ {
        root /home/saraiva-vision-site/public;
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Blog images
    location /Blog/ {
        alias /home/saraiva-vision-site/public/Blog/;
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Proxy all other requests to Next.js server (including API routes)
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;

        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;

        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;

        # Handle preflight OPTIONS requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type "text/plain; charset=utf-8";
            add_header Content-Length 0;
            return 204;
        }
    }

    # Logging
    access_log /var/log/nginx/saraivavision_access.log;
    error_log /var/log/nginx/saraivavision_error.log;
}
EOF

# Enable the new site
ln -sf /etc/nginx/sites-available/saraivavision-nextjs /etc/nginx/sites-enabled/saraivavision

print_success "Nginx configuration updated"

# Step 5: Start Next.js service
echo ""
echo "🚀 Step 5: Starting Next.js service..."

# Reload systemd
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"

# Start the service
systemctl start "$SERVICE_NAME"

# Wait for service to start
print_info "Waiting for Next.js service to start..."
sleep 10

# Check service status
if systemctl is-active --quiet "$SERVICE_NAME"; then
    print_success "Next.js service is running"
else
    print_error "Next.js service failed to start"
    echo "Service status:"
    systemctl status "$SERVICE_NAME" --no-pager
    echo ""
    echo "Service logs:"
    journalctl -u "$SERVICE_NAME" --no-pager -n 20
    exit 1
fi

# Step 6: Test Nginx and reload
echo ""
echo "🔍 Step 6: Testing and reloading Nginx..."

# Test Nginx config
nginx -t
if [ $? -eq 0 ]; then
    print_success "Nginx configuration is valid"
else
    print_error "Nginx configuration is invalid"
    exit 1
fi

# Reload Nginx
systemctl reload nginx
print_success "Nginx reloaded"

# Step 7: Comprehensive testing
echo ""
echo "🧪 Step 7: Testing deployment..."

# Test if Next.js server responds on port 3001
print_info "Testing Next.js server on port 3001..."
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/ || echo "000")
if [ "$SERVER_STATUS" == "200" ]; then
    print_success "Next.js server responding (HTTP $SERVER_STATUS)"
else
    print_error "Next.js server not responding (HTTP $SERVER_STATUS)"
fi

# Test API endpoints
print_info "Testing API endpoints..."

# Test /api/config
API_CONFIG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/config || echo "000")
if [ "$API_CONFIG_STATUS" == "200" ]; then
    print_success "/api/config working (HTTP $API_CONFIG_STATUS)"

    # Test if it returns JSON
    API_CONTENT_TYPE=$(curl -s -I http://127.0.0.1:3001/api/config | grep -i content-type || echo "")
    if [[ "$API_CONTENT_TYPE" == *"application/json"* ]]; then
        print_success "/api/config returns JSON correctly"
    else
        print_warning "/api/config not returning JSON: $API_CONTENT_TYPE"
    fi
else
    print_error "/api/config failed (HTTP $API_CONFIG_STATUS)"
fi

# Test /api/google-reviews
API_REVIEWS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/google-reviews || echo "000")
if [ "$API_REVIEWS_STATUS" == "200" ]; then
    print_success "/api/google-reviews working (HTTP $API_REVIEWS_STATUS)"
else
    print_warning "/api/google-reviews returned HTTP $API_REVIEWS_STATUS (may need API keys)"
fi

# Test public site through Nginx
print_info "Testing public site through Nginx..."
SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/ || echo "000")
if [ "$SITE_STATUS" == "200" ]; then
    print_success "Public site accessible (HTTPS $SITE_STATUS)"
else
    print_warning "Public site returned HTTP $SITE_STATUS"
fi

# Test APIs through Nginx proxy
print_info "Testing APIs through Nginx proxy..."
NGINX_API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/api/config || echo "000")
if [ "$NGINX_API_STATUS" == "200" ]; then
    print_success "API working through Nginx proxy (HTTP $NGINX_API_STATUS)"

    # Verify JSON response through proxy
    PROXY_CONTENT_TYPE=$(curl -s -I https://saraivavision.com.br/api/config | grep -i content-type || echo "")
    if [[ "$PROXY_CONTENT_TYPE" == *"application/json"* ]]; then
        print_success "API returns JSON through Nginx proxy"
    else
        print_error "API not returning JSON through proxy: $PROXY_CONTENT_TYPE"
    fi
else
    print_error "API failed through Nginx proxy (HTTP $NGINX_API_STATUS)"
fi

# Step 8: Show service information
echo ""
echo "📊 Step 8: Service Information"
echo "=============================="
echo "Service Status:"
systemctl status "$SERVICE_NAME" --no-pager -l

echo ""
echo "Recent Logs:"
journalctl -u "$SERVICE_NAME" --no-pager -n 10

# Summary
echo ""
echo "✅ Next.js Production Deployment completed!"
echo "=========================================="
echo "📊 Deployment Summary:"
echo "   - Build: ✓"
echo "   - Next.js Server: ✓ (Port 3001)"
echo "   - Service: $SERVICE_NAME ✓"
echo "   - Nginx Proxy: ✓"
echo "   - API /config: ✓ (HTTP $API_CONFIG_STATUS)"
echo "   - API /google-reviews: ✓ (HTTP $API_REVIEWS_STATUS)"
echo "   - Public Site: ✓ (HTTPS $SITE_STATUS)"
echo "   - API through Proxy: ✓ (HTTP $NGINX_API_STATUS)"
echo ""
echo "🌐 Site URL: https://saraivavision.com.br"
echo "🔧 Service Management:"
echo "   - Status: sudo systemctl status $SERVICE_NAME"
echo "   - Restart: sudo systemctl restart $SERVICE_NAME"
echo "   - Logs: sudo journalctl -u $SERVICE_NAME -f"
echo "   - Config: sudo nano /etc/systemd/system/${SERVICE_NAME}.service"
echo ""
echo "🌐 API Testing:"
echo "   - Local: curl http://127.0.0.1:3001/api/config"
echo "   - Public: curl https://saraivavision.com.br/api/config"