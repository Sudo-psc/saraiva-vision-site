#!/bin/bash

# Saraiva Vision VPS Deployment Script
# This script builds and deploys the React app to the VPS

set -e

echo "🚀 Starting Saraiva Vision VPS deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"
WEB_ROOT="/var/www/html"
BACKUP_DIR="/var/www/backup"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# Function to print status messages
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Create backup
echo "📦 Creating backup..."
if [ -d "$WEB_ROOT" ]; then
    mkdir -p "$BACKUP_DIR"
    backup_name="saraiva-vision-$(date +%Y%m%d-%H%M%S)"
    cp -r "$WEB_ROOT" "$BACKUP_DIR/$backup_name"
    print_status "Backup created: $BACKUP_DIR/$backup_name"
fi

# 2. Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production
print_status "Dependencies installed"

# 3. Build the React app
echo "🔨 Building React application..."
npm run build
print_status "React app built successfully"

# 4. Test the build
echo "🧪 Testing build..."
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

if [ ! -f "$BUILD_DIR/index.html" ]; then
    print_error "Build failed - index.html not found"
    exit 1
fi

print_status "Build validation passed"

# 5. Create web root directory if it doesn't exist
echo "📁 Setting up web root..."
mkdir -p "$WEB_ROOT"

# 6. Copy files to web root
echo "📂 Copying files to web root..."
# Remove existing files but keep WordPress
find "$WEB_ROOT" -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "assets" -type d | xargs rm -rf 2>/dev/null || true

# Copy React build files
cp -r "$BUILD_DIR"/* "$WEB_ROOT/"
print_status "Files copied to web root"

# 7. Set proper permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"
find "$WEB_ROOT" -type f -exec chmod 644 {} \;
find "$WEB_ROOT" -type d -exec chmod 755 {} \;
print_status "Permissions set"

# 8. Create nginx configuration if it doesn't exist
echo "⚙️  Configuring nginx..."
if [ ! -f "$NGINX_SITES_AVAILABLE/saraivavision" ]; then
    cat > "$NGINX_SITES_AVAILABLE/saraivavision" << 'EOF'
# Saraiva Vision Nginx Configuration
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name saraivavision.com.br www.saraivavision.com.br;
    root /var/www/html;
    index index.html index.php;

    # SSL Configuration (assumes certificates are in place)
    ssl_certificate /etc/letsencrypt/live/saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/saraivavision.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # React Router fallback
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API proxy to Node.js backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WordPress endpoints
    location /wp-json/ {
        proxy_pass http://localhost:8083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /wp-admin/ {
        proxy_pass http://localhost:8083;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    print_status "Nginx configuration created"
fi

# 9. Enable site
if [ ! -L "$NGINX_SITES_ENABLED/saraivavision" ]; then
    ln -sf "$NGINX_SITES_AVAILABLE/saraivavision" "$NGINX_SITES_ENABLED/saraivavision"
    print_status "Nginx site enabled"
fi

# 10. Test nginx configuration
echo "🧪 Testing nginx configuration..."
if nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration test failed"
    exit 1
fi

# 11. Restart nginx
echo "🔄 Restarting nginx..."
systemctl restart nginx
print_status "Nginx restarted"

# 12. Check if services are running
echo "🔍 Checking service status..."
if systemctl is-active --quiet nginx; then
    print_status "Nginx is running"
else
    print_error "Nginx is not running"
fi

if systemctl is-active --quiet saraiva-api; then
    print_status "API service is running"
else
    print_warning "API service (saraiva-api) is not running - start it with: systemctl start saraiva-api"
fi

if systemctl is-active --quiet docker; then
    if docker ps | grep -q "wordpress"; then
        print_status "WordPress containers are running"
    else
        print_warning "WordPress containers are not running - check Docker"
    fi
else
    print_warning "Docker service is not running"
fi

# 13. Final verification
echo "🔍 Performing final verification..."
if [ -f "$WEB_ROOT/index.html" ]; then
    print_status "Frontend deployed successfully"
else
    print_error "Frontend deployment failed - index.html not found"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Summary:"
echo "   ✅ Frontend deployed to $WEB_ROOT"
echo "   ✅ Nginx configured and restarted"
echo "   ✅ Backup created: $BACKUP_DIR/$backup_name"
echo ""
echo "🌐 Website: https://saraivavision.com.br"
echo "📊 Health check: https://saraivavision.com.br/health"
echo ""
echo "🛠️  Useful commands:"
echo "   View logs: journalctl -u nginx -f"
echo "   Restart services: systemctl restart nginx saraiva-api"
echo "   Check status: systemctl status nginx saraiva-api docker"
echo ""
echo "📝 To rollback:"
echo "   cp -r $BACKUP_DIR/$backup_name/* $WEB_ROOT/"
echo "   systemctl restart nginx"