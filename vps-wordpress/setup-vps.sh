#!/bin/bash

# VPS Setup Script for WordPress Headless CMS
# Ubuntu 22.04 LTS with Docker and Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root. Please run as a regular user with sudo privileges."
fi

# Check if sudo is available
if ! command -v sudo &> /dev/null; then
    error "sudo is required but not installed. Please install sudo first."
fi

log "Starting VPS setup for WordPress Headless CMS..."

# Update system packages
log "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
log "Installing required packages..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common \
    ufw \
    fail2ban \
    htop \
    git \
    unzip \
    wget

# Install Docker
log "Installing Docker..."
if ! command -v docker &> /dev/null; then
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker Engine
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    log "Docker installed successfully"
else
    log "Docker is already installed"
fi

# Install Docker Compose (standalone)
log "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_VERSION="v2.21.0"
    sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log "Docker Compose installed successfully"
else
    log "Docker Compose is already installed"
fi

# Install Certbot for Let's Encrypt
log "Installing Certbot..."
sudo apt install -y certbot

# Configure UFW Firewall
log "Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
# Replace with your admin IP range
sudo ufw allow from 192.168.1.0/24 to any port 22
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Configure Fail2Ban
log "Configuring Fail2Ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create fail2ban configuration for nginx
sudo tee /etc/fail2ban/jail.local > /dev/null <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 7200
EOF

sudo systemctl restart fail2ban

# Create WordPress directory structure
log "Creating WordPress directory structure..."
WORDPRESS_DIR="/opt/wordpress-cms"
sudo mkdir -p $WORDPRESS_DIR
sudo chown $USER:$USER $WORDPRESS_DIR

# Create backup directory
sudo mkdir -p /opt/backups/wordpress
sudo chown $USER:$USER /opt/backups/wordpress

# Create log directory
sudo mkdir -p /var/log/wordpress
sudo chown $USER:$USER /var/log/wordpress

# Set up log rotation
sudo tee /etc/logrotate.d/wordpress > /dev/null <<EOF
/var/log/wordpress/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF

# Configure system limits
log "Configuring system limits..."
sudo tee -a /etc/security/limits.conf > /dev/null <<EOF
# WordPress limits
$USER soft nofile 65536
$USER hard nofile 65536
$USER soft nproc 32768
$USER hard nproc 32768
EOF

# Configure sysctl for better performance
sudo tee /etc/sysctl.d/99-wordpress.conf > /dev/null <<EOF
# Network performance
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.tcp_congestion_control = bbr

# File system
fs.file-max = 2097152
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF

sudo sysctl -p /etc/sysctl.d/99-wordpress.conf

# Enable Docker service
log "Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# Create systemd service for WordPress
log "Creating systemd service for WordPress..."
sudo tee /etc/systemd/system/wordpress-cms.service > /dev/null <<EOF
[Unit]
Description=WordPress CMS Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$WORDPRESS_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable wordpress-cms.service

# Create backup script
log "Creating backup script..."
sudo tee /usr/local/bin/wordpress-backup.sh > /dev/null <<'EOF'
#!/bin/bash

# WordPress Backup Script
BACKUP_DIR="/opt/backups/wordpress"
DATE=$(date +%Y%m%d_%H%M%S)
WORDPRESS_DIR="/opt/wordpress-cms"

# Create backup directory
mkdir -p "$BACKUP_DIR/$DATE"

# Backup WordPress files
echo "Backing up WordPress files..."
docker run --rm -v wordpress_wp_data:/data -v "$BACKUP_DIR/$DATE":/backup alpine tar czf /backup/wordpress-files.tar.gz -C /data .

# Backup database
echo "Backing up database..."
cd "$WORDPRESS_DIR"
docker-compose exec -T db mysqldump -u wp -p$MYSQL_PASSWORD wordpress > "$BACKUP_DIR/$DATE/wordpress-db.sql"

# Compress backup
echo "Compressing backup..."
cd "$BACKUP_DIR"
tar czf "wordpress-backup-$DATE.tar.gz" "$DATE"
rm -rf "$DATE"

# Keep only last 7 backups
find "$BACKUP_DIR" -name "wordpress-backup-*.tar.gz" -mtime +7 -delete

echo "Backup completed: wordpress-backup-$DATE.tar.gz"
EOF

sudo chmod +x /usr/local/bin/wordpress-backup.sh

# Create cron job for backups
log "Setting up automated backups..."
if ! crontab -l 2>/dev/null | grep -q '/usr/local/bin/wordpress-backup.sh'; then
    (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/wordpress-backup.sh >> /var/log/wordpress/backup.log 2>&1") | crontab -
fi
# Create monitoring script
log "Creating monitoring script..."
sudo tee /usr/local/bin/wordpress-monitor.sh > /dev/null <<'EOF'
#!/bin/bash

# WordPress Monitoring Script
WORDPRESS_DIR="/opt/wordpress-cms"
LOG_FILE="/var/log/wordpress/monitor.log"

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check if containers are running
cd "$WORDPRESS_DIR"
if ! docker-compose ps | grep -q "Up"; then
    log_message "ERROR: WordPress containers are not running. Attempting restart..."
    docker-compose up -d >> "$LOG_FILE" 2>&1
    
    if [ $? -eq 0 ]; then
        log_message "INFO: WordPress containers restarted successfully"
    else
        log_message "ERROR: Failed to restart WordPress containers"
    fi
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    log_message "WARNING: Disk usage is at ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    log_message "WARNING: Memory usage is at ${MEMORY_USAGE}%"
fi

log_message "INFO: Health check completed"
EOF

sudo chmod +x /usr/local/bin/wordpress-monitor.sh

# Create cron job for monitoring
if ! crontab -l 2>/dev/null | grep -q '/usr/local/bin/wordpress-monitor.sh'; then
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/wordpress-monitor.sh") | crontab -
fi
log "VPS setup completed successfully!"
log "Next steps:"
log "1. Copy your WordPress files to $WORDPRESS_DIR"
log "2. Create .env file with your configuration"
log "3. Run SSL certificate setup: sudo ./setup-ssl.sh"
log "4. Start WordPress: cd $WORDPRESS_DIR && docker-compose up -d"

warn "Please log out and log back in for Docker group membership to take effect"
warn "Or run: newgrp docker"