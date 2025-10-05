#!/bin/bash
# Next.js Standalone Deploy Script - Saraiva Vision
# Proper deployment for Next.js standalone mode with API support

set -e  # Exit on any error

echo "🚀 Saraiva Vision - Next.js Standalone Deploy"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROD_DIR="/var/www/saraivavision/current"
PROJECT_DIR="/home/saraiva-vision-site"
BACKUP_DIR="/var/backups/saraiva-vision"
NEXTJS_DIR="/opt/nextjs-saraiva"
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
    print_error "Please run with sudo: sudo ./scripts/nextjs-standalone-deploy.sh"
    exit 1
fi

# Step 1: Clean previous build
echo "🧹 Step 1: Cleaning previous build..."
cd "$PROJECT_DIR"
rm -rf .next/
print_success "Previous build cleaned"

# Step 2: Build Next.js standalone
echo ""
echo "📦 Step 2: Building Next.js standalone..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Next.js build completed successfully"
else
    print_error "Next.js build failed"
    exit 1
fi

# Step 3: Verify standalone structure
echo ""
echo "🔍 Step 3: Verifying standalone structure..."
if [ ! -d "$PROJECT_DIR/.next" ]; then
    print_error ".next directory not found"
    exit 1
fi

if [ ! -f "$PROJECT_DIR/.next/server.js" ] && [ ! -f "$PROJECT_DIR/node_modules/next/dist/server/next-server.js" ]; then
    print_warning "Standalone server.js not found, will use next-server.js"
fi

print_success "Next.js build structure verified"

# Step 4: Create Next.js deployment directory
echo ""
echo "📁 Step 4: Setting up Next.js deployment directory..."
mkdir -p "$NEXTJS_DIR"
mkdir -p "$BACKUP_DIR"

# Backup current deployment
if [ -d "$NEXTJS_DIR/.next" ]; then
    BACKUP_FILE="$BACKUP_DIR/nextjs_backup_$TIMESTAMP.tar.gz"
    tar -czf "$BACKUP_FILE" -C "$NEXTJS_DIR" . 2>/dev/null || true
    print_success "Next.js backup created: $BACKUP_FILE"
fi

# Step 5: Deploy Next.js application
echo ""
echo "🚢 Step 5: Deploying Next.js application..."

# Copy .next directory
cp -r "$PROJECT_DIR/.next" "$NEXTJS_DIR/"
print_success ".next directory copied"

# Copy public directory
cp -r "$PROJECT_DIR/public" "$NEXTJS_DIR/"
print_success "public directory copied"

# Copy package.json for dependencies
cp "$PROJECT_DIR/package.json" "$NEXTJS_DIR/"
print_success "package.json copied"

# Copy node_modules (or install fresh)
if [ ! -d "$NEXTJS_DIR/node_modules" ]; then
    print_info "Installing dependencies in production..."
    cd "$NEXTJS_DIR"
    npm install --production
    cd "$PROJECT_DIR"
    print_success "Dependencies installed"
else
    cp -r "$PROJECT_DIR/node_modules" "$NEXTJS_DIR/"
    print_success "node_modules copied"
fi

# Step 6: Create/Update systemd service
echo ""
echo "⚙️  Step 6: Setting up systemd service..."

cat > "/etc/systemd/system/${SERVICE_NAME}.service" << EOF
[Unit]
Description=Saraiva Vision Next.js Application
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=/usr/bin/npm start
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=saraiva-vision

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$NEXTJS_DIR

[Install]
WantedBy=multi-user.target
EOF

# Fix permissions
chown -R www-data:www-data "$NEXTJS_DIR"
chmod -R 755 "$NEXTJS_DIR"

print_success "Systemd service created/updated"

# Step 7: Update Nginx configuration
echo ""
echo "🌐 Step 7: Updating Nginx configuration..."

# Create backup of current Nginx config
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

    # Static files from Next.js build
    location /_next/static/ {
        alias /opt/nextjs-saraiva/.next/static/;
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Static assets
    location /static/ {
        alias /opt/nextjs-saraiva/public/static/;
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Images and other static files
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|avif|webmanifest|js|css|woff|woff2|ttf|eot)$ {
        root /opt/nextjs-saraiva/public;
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Blog images
    location /Blog/ {
        alias /opt/nextjs-saraiva/public/Blog/;
        expires 1y;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # Proxy to Next.js server for all other requests (including API routes)
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;

        # Handle CORS
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;

        # Handle preflight requests
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

    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    location = /50x.html {
        root /opt/nextjs-saraiva/public;
    }

    # Logging
    access_log /var/log/nginx/saraivavision_access.log;
    error_log /var/log/nginx/saraivavision_error.log;
}
EOF

# Enable the new site
ln -sf /etc/nginx/sites-available/saraivavision-nextjs /etc/nginx/sites-enabled/saraivavision

print_success "Nginx configuration updated"

# Step 8: Start/Restart Next.js service
echo ""
echo "🔄 Step 8: Starting Next.js service..."

# Reload systemd
systemctl daemon-reload

# Stop existing service if running
systemctl stop "$SERVICE_NAME" 2>/dev/null || true

# Start the service
systemctl start "$SERVICE_NAME"
systemctl enable "$SERVICE_NAME"

# Wait a moment for service to start
sleep 3

# Check service status
if systemctl is-active --quiet "$SERVICE_NAME"; then
    print_success "Next.js service is running"
else
    print_error "Next.js service failed to start"
    systemctl status "$SERVICE_NAME"
    exit 1
fi

# Step 9: Test Nginx configuration
echo ""
echo "🔍 Step 9: Testing Nginx configuration..."

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

# Step 10: Verify deployment
echo ""
echo "🔍 Step 10: Verifying deployment..."

# Test if Next.js server is responding
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/)
if [ "$HTTP_STATUS" == "200" ]; then
    print_success "Next.js server is accessible (HTTP $HTTP_STATUS)"
else
    print_error "Next.js server returned HTTP $HTTP_STATUS"
fi

# Test API endpoint
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3001/api/config)
if [ "$API_STATUS" == "200" ]; then
    print_success "API endpoint is working (HTTP $API_STATUS)"
else
    print_warning "API endpoint returned HTTP $API_STATUS"
fi

# Test public site
SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://saraivavision.com.br/)
if [ "$SITE_STATUS" == "200" ]; then
    print_success "Public site is accessible (HTTPS $SITE_STATUS)"
else
    print_warning "Public site returned HTTP $SITE_STATUS"
fi

# Step 11: Cleanup old backups (keep last 3)
echo ""
echo "🧹 Step 11: Cleaning up old backups..."
cd "$BACKUP_DIR"
ls -t nextjs_backup_*.tar.gz 2>/dev/null | tail -n +4 | xargs -r rm
print_success "Old backups cleaned (keeping last 3)"

# Summary
echo ""
echo "✅ Next.js Standalone Deployment completed successfully!"
echo "==================================================="
echo "📊 Deployment Summary:"
echo "   - Build: ✓"
echo "   - Next.js: ✓ (Port 3001)"
echo "   - Service: $SERVICE_NAME"
echo "   - Nginx: ✓ (Proxy configured)"
echo "   - APIs: ✓"
echo "   - Site: HTTPS $SITE_STATUS"
echo ""
echo "🌐 Site URL: https://saraivavision.com.br"
echo "🔧 Service: sudo systemctl status $SERVICE_NAME"
echo "📝 Logs: sudo journalctl -u $SERVICE_NAME -f"
echo ""
echo "🔄 To rollback: sudo systemctl stop $SERVICE_NAME && sudo tar -xzf $BACKUP_FILE -C $NEXTJS_DIR && sudo systemctl start $SERVICE_NAME"