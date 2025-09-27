#!/bin/bash

# Native VPS Setup Script for Saraiva Vision
# Configures Ubuntu/Debian VPS with native services (no Docker)
# Author: Saraiva Vision Development Team
# Version: 2.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="saraivavision.com.br"
WEB_ROOT="/var/www/html"
API_USER="saraiva-api"
API_DIR="/opt/saraiva-api"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Update system packages
update_system() {
    print_status "Updating system packages..."

    apt update
    apt upgrade -y

    print_success "System updated"
}

# Install Node.js 18+
install_nodejs() {
    print_status "Installing Node.js 18+..."

    # Remove old Node.js if exists
    apt remove -y nodejs npm 2>/dev/null || true

    # Install NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

    # Install Node.js
    apt install -y nodejs

    # Verify installation
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)

    print_success "Node.js installed: $NODE_VERSION"
    print_success "npm installed: $NPM_VERSION"
}

# Install and configure Nginx
install_nginx() {
    print_status "Installing and configuring Nginx..."

    apt install -y nginx

    # Create basic Nginx configuration for React SPA
    cat > /etc/nginx/sites-available/saraiva-vision << 'EOF'
server {
    listen 80;
    server_name saraivavision.com.br www.saraivavision.com.br;
    root /var/www/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: ws: wss: data: blob: 'unsafe-inline'; frame-ancestors 'self';" always;

    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to Node.js backend
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WordPress blog proxy
    location /blog/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security - hide sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ ~$ {
        deny all;
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/saraiva-vision /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default

    # Test configuration
    nginx -t

    # Start and enable Nginx
    systemctl start nginx
    systemctl enable nginx

    print_success "Nginx installed and configured"
}

# Install MySQL
install_mysql() {
    print_status "Installing MySQL..."

    # Set non-interactive mode
    export DEBIAN_FRONTEND=noninteractive

    # Install MySQL server
    apt install -y mysql-server

    # Start and enable MySQL
    systemctl start mysql
    systemctl enable mysql

    # Secure MySQL installation (basic)
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'SaraivaVision2024!';"
    mysql -e "DELETE FROM mysql.user WHERE User='';"
    mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');"
    mysql -e "DROP DATABASE IF EXISTS test;"
    mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';"
    mysql -e "FLUSH PRIVILEGES;"

    print_success "MySQL installed and secured"
}

# Install Redis
install_redis() {
    print_status "Installing Redis..."

    apt install -y redis-server

    # Configure Redis
    sed -i 's/# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
    sed -i 's/# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

    # Start and enable Redis
    systemctl start redis-server
    systemctl enable redis-server

    print_success "Redis installed and configured"
}

# Install PHP-FPM for WordPress
install_php() {
    print_status "Installing PHP-FPM 8.1..."

    # Add PHP repository
    apt install -y software-properties-common
    add-apt-repository -y ppa:ondrej/php
    apt update

    # Install PHP and extensions
    apt install -y php8.1-fpm php8.1-mysql php8.1-curl php8.1-gd php8.1-intl php8.1-mbstring php8.1-soap php8.1-xml php8.1-xmlrpc php8.1-zip

    # Start and enable PHP-FPM
    systemctl start php8.1-fpm
    systemctl enable php8.1-fpm

    print_success "PHP-FPM 8.1 installed"
}

# Setup application directories
setup_directories() {
    print_status "Setting up application directories..."

    # Create web root
    mkdir -p "$WEB_ROOT"
    chown -R www-data:www-data "$WEB_ROOT"
    chmod -R 755 "$WEB_ROOT"

    # Create API directory
    mkdir -p "$API_DIR"

    # Create backup directory
    mkdir -p /var/backups/saraiva-vision

    print_success "Directories created"
}

# Create API service user
create_api_user() {
    print_status "Creating API service user..."

    # Create system user for API service
    if ! id "$API_USER" &>/dev/null; then
        useradd --system --no-create-home --shell /bin/false "$API_USER"
        print_success "User $API_USER created"
    else
        print_status "User $API_USER already exists"
    fi
}

# Create systemd service for API
create_api_service() {
    print_status "Creating systemd service for API..."

    cat > /etc/systemd/system/saraiva-api.service << EOF
[Unit]
Description=Saraiva Vision API Service
After=network.target mysql.service redis.service
Wants=mysql.service redis.service

[Service]
Type=simple
User=$API_USER
WorkingDirectory=$API_DIR
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=saraiva-api

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd
    systemctl daemon-reload

    print_success "API service created (not started - needs application files)"
}

# Configure firewall
configure_firewall() {
    print_status "Configuring firewall..."

    # Install ufw if not present
    apt install -y ufw

    # Reset firewall
    ufw --force reset

    # Default policies
    ufw default deny incoming
    ufw default allow outgoing

    # Allow essential services
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp

    # Enable firewall
    ufw --force enable

    print_success "Firewall configured"
}

# Install certbot for SSL
install_certbot() {
    print_status "Installing Certbot for SSL certificates..."

    apt install -y certbot python3-certbot-nginx

    print_success "Certbot installed"
    print_warning "Run 'certbot --nginx -d $DOMAIN -d www.$DOMAIN' to get SSL certificates"
}

# Create maintenance scripts
create_maintenance_scripts() {
    print_status "Creating maintenance scripts..."

    # Create log rotation script
    cat > /usr/local/bin/saraiva-maintenance.sh << 'EOF'
#!/bin/bash
# Saraiva Vision maintenance script

# Rotate logs
journalctl --vacuum-time=30d

# Clean old backups (keep 30 days)
find /var/backups/saraiva-vision -name "*.tar.gz" -mtime +30 -delete

# Update system packages (weekly)
if [ "$(date +%u)" -eq 1 ]; then
    apt update && apt upgrade -y
fi

# Restart services weekly
if [ "$(date +%u)" -eq 1 ] && [ "$(date +%H)" -eq 3 ]; then
    systemctl restart nginx
    systemctl restart saraiva-api
    systemctl restart mysql
    systemctl restart redis-server
    systemctl restart php8.1-fpm
fi
EOF

    chmod +x /usr/local/bin/saraiva-maintenance.sh

    # Add to crontab
    (crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/saraiva-maintenance.sh") | crontab -

    print_success "Maintenance scripts created"
}

# Show setup summary
show_summary() {
    print_success "=== VPS SETUP COMPLETE ==="
    echo -e "${GREEN}✓${NC} System packages updated"
    echo -e "${GREEN}✓${NC} Node.js 18+ installed"
    echo -e "${GREEN}✓${NC} Nginx installed and configured"
    echo -e "${GREEN}✓${NC} MySQL installed and secured"
    echo -e "${GREEN}✓${NC} Redis installed and configured"
    echo -e "${GREEN}✓${NC} PHP-FPM 8.1 installed"
    echo -e "${GREEN}✓${NC} Application directories created"
    echo -e "${GREEN}✓${NC} API service user created"
    echo -e "${GREEN}✓${NC} Systemd service configured"
    echo -e "${GREEN}✓${NC} Firewall configured"
    echo -e "${GREEN}✓${NC} Certbot installed"
    echo -e "${GREEN}✓${NC} Maintenance scripts created"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Deploy your application using deploy-vps-native.sh"
    echo "2. Copy your API files to $API_DIR"
    echo "3. Start the API service: systemctl start saraiva-api"
    echo "4. Get SSL certificates: certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    echo ""
    echo -e "${YELLOW}MySQL root password:${NC} SaraivaVision2024!"
    echo -e "${YELLOW}Change this password in production!${NC}"
}

# Main setup function
main() {
    echo -e "${BLUE}🔧 Setting up Native VPS for Saraiva Vision${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo ""

    check_root
    update_system
    install_nodejs
    install_nginx
    install_mysql
    install_redis
    install_php
    setup_directories
    create_api_user
    create_api_service
    configure_firewall
    install_certbot
    create_maintenance_scripts
    show_summary
}

# Handle script interruption
trap 'print_error "Setup interrupted"; exit 1' INT TERM

# Run main function
main "$@"