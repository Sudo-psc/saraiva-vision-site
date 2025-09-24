#!/bin/bash
set -euo pipefail

# Nginx custom entrypoint script

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] NGINX: $*"
}

# Function to generate DH parameters if they don't exist
generate_dhparam() {
    local dhparam_file="/etc/nginx/ssl/dhparam.pem"
    
    if [ ! -f "$dhparam_file" ]; then
        log "Generating Diffie-Hellman parameters (this may take a while)..."
        mkdir -p /etc/nginx/ssl
        openssl dhparam -out "$dhparam_file" 2048
        chmod 600 "$dhparam_file"
        log "DH parameters generated successfully"
    else
        log "DH parameters already exist"
    fi
}

# Function to create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p /var/cache/nginx/client_temp
    mkdir -p /var/cache/nginx/proxy_temp
    mkdir -p /var/cache/nginx/fastcgi_temp
    mkdir -p /var/cache/nginx/uwsgi_temp
    mkdir -p /var/cache/nginx/scgi_temp
    mkdir -p /var/log/nginx
    mkdir -p /etc/nginx/ssl
    mkdir -p /var/www/certbot
    
    # Set proper permissions
    chown -R nginx:nginx /var/cache/nginx
    chown -R nginx:nginx /var/log/nginx
    chmod -R 755 /var/cache/nginx
    chmod -R 755 /var/log/nginx
    
    log "Directories created successfully"
}

# Function to validate Nginx configuration
validate_config() {
    log "Validating Nginx configuration..."
    
    if nginx -t; then
        log "Nginx configuration is valid"
    else
        log "ERROR: Nginx configuration is invalid"
        exit 1
    fi
}

# Function to setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    cat > /etc/logrotate.d/nginx << 'EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF
    
    log "Log rotation configured"
}

# Function to create default SSL certificate (self-signed) if Let's Encrypt certs don't exist
create_default_ssl() {
    local cert_dir="/etc/letsencrypt/live/cms.saraivavision.com.br"
    local cert_file="$cert_dir/fullchain.pem"
    local key_file="$cert_dir/privkey.pem"
    
    if [ ! -f "$cert_file" ] || [ ! -f "$key_file" ]; then
        log "Creating temporary self-signed SSL certificate..."
        
        mkdir -p "$cert_dir"
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout "$key_file" \
            -out "$cert_file" \
            -subj "/C=BR/ST=SP/L=SaoPaulo/O=SaraivaVision/CN=cms.saraivavision.com.br"
        
        # Create chain file (same as fullchain for self-signed)
        cp "$cert_file" "$cert_dir/chain.pem"
        
        chmod 600 "$key_file"
        chmod 644 "$cert_file"
        chmod 644 "$cert_dir/chain.pem"
        
        log "Temporary SSL certificate created"
        log "WARNING: Using self-signed certificate. Replace with Let's Encrypt certificate in production."
    else
        log "SSL certificates already exist"
    fi
}

# Function to optimize Nginx for the current system
optimize_nginx() {
    log "Optimizing Nginx configuration for current system..."
    
    # Get number of CPU cores
    local cpu_cores=$(nproc)
    log "Detected $cpu_cores CPU cores"
    
    # Update worker_processes in nginx.conf if it's set to auto
    if grep -q "worker_processes auto" /etc/nginx/nginx.conf; then
        log "Worker processes already set to auto"
    else
        sed -i "s/worker_processes [0-9]*;/worker_processes $cpu_cores;/" /etc/nginx/nginx.conf
        log "Updated worker_processes to $cpu_cores"
    fi
    
    # Set worker_rlimit_nofile based on system limits
    local max_files=$(ulimit -n)
    if [ "$max_files" != "unlimited" ] && [ "$max_files" -gt 1024 ]; then
        sed -i "s/worker_rlimit_nofile [0-9]*;/worker_rlimit_nofile $max_files;/" /etc/nginx/nginx.conf
        log "Updated worker_rlimit_nofile to $max_files"
    fi
}

# Function to setup health check
setup_health_check() {
    log "Setting up health check endpoint..."
    
    # Create a simple health check page
    mkdir -p /usr/share/nginx/html
    cat > /usr/share/nginx/html/nginx-health << 'EOF'
healthy
EOF
    
    chmod 644 /usr/share/nginx/html/nginx-health
    log "Health check endpoint configured"
}

# Main execution
main() {
    log "Starting Nginx custom setup..."
    
    # Run setup functions
    create_directories
    generate_dhparam
    create_default_ssl
    setup_log_rotation
    setup_health_check
    optimize_nginx
    validate_config
    
    log "Nginx custom setup completed successfully"
}

# Run main function
main

log "Nginx is ready to start"