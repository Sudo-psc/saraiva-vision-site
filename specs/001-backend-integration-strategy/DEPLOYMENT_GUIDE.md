# Deployment and Infrastructure Guide

## Overview

This guide provides comprehensive instructions for deploying and maintaining Saraiva Vision's hybrid architecture (Vercel + VPS Linux). It covers infrastructure setup, application deployment, monitoring, and maintenance procedures.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │   VPS Linux     │    │   Supabase      │
│                 │    │                 │    │                 │
│  Next.js App    │────┤  WordPress      │────┤  PostgreSQL     │
│  API Routes     │    │  Headless CMS   │    │  Auth Service   │
│  Edge Functions │    │  MariaDB        │    │  Storage        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Infrastructure Requirements

### VPS Specifications
- **Provider**: AWS EC2, DigitalOcean, or similar
- **OS**: Ubuntu 22.04 LTS
- **Resources**: 2 vCPU, 4 GB RAM, 80 GB SSD
- **Swap**: 2-4 GB
- **Bandwidth**: 1 TB/month minimum

### Domain Configuration
- **Main Domain**: `saraivavision.com.br` → Vercel
- **CMS Domain**: `cms.saraivavision.com.br` → VPS IP
- **Subdomains**: Configure appropriate CNAME records

## Phase 1: VPS Setup and Configuration

### 1.1 Initial Server Setup

#### Connect to VPS
```bash
# Connect via SSH
ssh root@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Create user for deployment
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy
sudo passwd deploy

# Configure SSH key for deploy user
su - deploy
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### Security Hardening
```bash
# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Disable root SSH login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 1.2 Docker and Docker Compose Installation

```bash
# Install Docker
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker

# Add deploy user to docker group
sudo usermod -aG docker deploy

# Verify installation
docker --version
docker-compose --version
```

### 1.3 WordPress Directory Structure

```bash
# Create directories
sudo mkdir -p /srv/wp
sudo chown -R deploy:deploy /srv/wp

# Navigate to project directory
cd /srv/wp

# Create subdirectories
mkdir -p nginx/conf.d
mkdir -p scripts
mkdir -p backups
```

## Phase 2: WordPress Headless Setup

### 2.1 Docker Compose Configuration

Create `/srv/wp/docker-compose.yml`:
```yaml
version: "3.9"
services:
  db:
    image: mariadb:10.6
    restart: unless-stopped
    environment:
      - MYSQL_DATABASE=wordpress
      - MYSQL_USER=wp
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
      - ./backups:/backups
    networks:
      - wp-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  redis:
    image: redis:6-alpine
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes", "--requirepass", "${REDIS_PASSWORD}"]
    volumes:
      - redis_data:/data
    networks:
      - wp-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      timeout: 10s
      retries: 5

  wp:
    image: wordpress:6.5-php8.2-fpm
    restart: unless-stopped
    environment:
      - WORDPRESS_DB_HOST=db:3306
      - WORDPRESS_DB_USER=wp
      - WORDPRESS_DB_PASSWORD=${MYSQL_PASSWORD}
      - WORDPRESS_DB_NAME=wordpress
      - WORDPRESS_CONFIG_EXTRA= |
          define('WP_HOME', 'https://cms.saraivavision.com.br');
          define('WP_SITEURL', 'https://cms.saraivavision.com.br');
          define('WP_REDIS_HOST', 'redis');
          define('WP_REDIS_PASSWORD', '${REDIS_PASSWORD}');
          define('WP_REDIS_PORT', 6379);
          define('FS_METHOD', 'direct');
    volumes:
      - wp_data:/var/www/html
      - ./backups:/backups
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - wp-network

  nginx:
    image: nginx:stable
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - wp_data:/var/www/html:ro
      - ./nginx/conf.d:/etc/nginx/conf.d
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/lib/letsencrypt:/var/lib/letsencrypt:ro
    depends_on:
      - wp
    networks:
      - wp-network

volumes:
  db_data:
  wp_data:
  redis_data:

networks:
  wp-network:
    driver: bridge
```

### 2.2 Environment Configuration

Create `/srv/wp/.env`:
```bash
# Database
MYSQL_PASSWORD=your_strong_mysql_password
MYSQL_ROOT_PASSWORD=your_strong_root_password

# Redis
REDIS_PASSWORD=your_strong_redis_password

# WordPress
WORDPRESS_ADMIN_USER=admin
WORDPRESS_ADMIN_PASSWORD=your_strong_admin_password
WORDPRESS_ADMIN_EMAIL=admin@saraivavision.com.br
```

### 2.3 Nginx Configuration

Create `/srv/wp/nginx/conf.d/cms.saraivavision.com.br.conf`:
```nginx
server {
    listen 80;
    server_name cms.saraivavision.com.br;
    root /var/www/html;

    # Let's Encrypt challenge
    location ~* ^/.well-known/acme-challenge/ {
        allow all;
        root /var/www/html;
    }

    # Redirect to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name cms.saraivavision.com.br;
    root /var/www/html;
    index index.php index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/cms.saraivavision.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cms.saraivavision.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';" always;

    # WordPress Rules
    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    # PHP-FPM Configuration
    location ~ \.php$ {
        try_files $uri =404;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param SCRIPT_NAME $fastcgi_script_name;
        fastcgi_index index.php;
        fastcgi_pass wp:9000;
        fastcgi_param HTTPS on;
        fastcgi_param HTTP_X_FORWARDED_PROTO https;

        # Performance
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_read_timeout 300;
    }

    # Static Files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Security - Disable access to sensitive files
    location ~* /(?:wp-config\.php|wp-content/(?:debug\.log|\.env|\.htaccess)) {
        deny all;
    }

    # Block WordPress xmlrpc.php
    location = /xmlrpc.php {
        deny all;
    }
}
```

### 2.4 SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Start Docker services
cd /srv/wp
sudo docker-compose up -d

# Wait for services to be ready
sleep 30

# Generate SSL certificate
sudo certbot certonly --webroot -w /var/www/html \
  -d cms.saraivavision.com.br \
  --email admin@saraivavision.com.br \
  --agree-tos \
  --non-interactive

# Setup auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 2.5 WordPress Installation and Configuration

```bash
# Start WordPress
cd /srv/wp
sudo docker-compose up -d

# Wait for WordPress to be ready
sleep 60

# Install WordPress CLI
docker-compose exec wp wp core install \
  --url="https://cms.saraivavision.com.br" \
  --title="Saraiva Vision CMS" \
  --admin_user="${WORDPRESS_ADMIN_USER}" \
  --admin_password="${WORDPRESS_ADMIN_PASSWORD}" \
  --admin_email="${WORDPRESS_ADMIN_EMAIL}"

# Install required plugins
docker-compose exec wp wp plugin install \
  wp-graphql \
  wp-graphql-cors \
  redis-cache \
  wp-webhooks \
  jwt-authentication-for-wp-rest-api \
  limit-login-attempts-reloaded \
  wordpress-seo \
  disable-comments \
  --activate

# Configure Redis
docker-compose exec wp wp plugin activate redis-cache
docker-compose exec wp wp redis enable

# Configure permalink structure
docker-compose exec wp wp option update permalink_structure '/%postname%/'

# Configure JWT Authentication
docker-compose exec wp wp config set JWT_AUTH_SECRET_KEY "$(openssl rand -base64 64)"
docker-compose exec wp wp config set JWT_AUTH_CORS_ENABLE 'true'
```

## Phase 3: Next.js Application Setup

### 3.1 Vercel Project Setup

1. **Create Vercel Account**: Sign up at vercel.com
2. **Connect Repository**: Link your Git repository
3. **Configure Environment Variables**:

```bash
# Vercel Environment Variables
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql
WP_REVALIDATE_SECRET=your_super_secret_key
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# External Services
RESEND_API_KEY=your_resend_api_key
ZENVIA_API_TOKEN=your_zenvia_token
ZENVIA_ACCOUNT_ID=your_zenvia_account_id
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Security
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

### 3.2 Next.js Configuration

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app/**/*",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "crons": [
    {
      "path": "/api/outbox/drain",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/podcast/sync",
      "schedule": "0,30 * * * *"
    }
  ],
  "regions": ["gru1", "sfo1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 3.3 Database Schema Setup

```sql
-- Run these in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  consent BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name TEXT NOT NULL,
  patient_email TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  confirmation_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  notes TEXT
);

CREATE TABLE message_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  send_after TIMESTAMPTZ,
  attempt_count INTEGER DEFAULT 0,
  last_attempt TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  related_type TEXT,
  related_id UUID
);

CREATE TABLE podcast_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spotify_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT,
  duration INTEGER,
  published_at TIMESTAMPTZ,
  image_url TEXT,
  explicit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  payload JSONB,
  level TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  ip_address INET
);

-- Create indexes
CREATE INDEX idx_contact_messages_created_at ON contact_messages (created_at);
CREATE INDEX idx_appointments_date_status ON appointments (appointment_date, status);
CREATE INDEX idx_message_outbox_status_send_after ON message_outbox (status, send_after);
CREATE INDEX idx_podcast_episodes_published_at ON podcast_episodes (published_at);
CREATE INDEX idx_event_log_created_at ON event_log (created_at);

-- Enable Row Level Security
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable insert for authenticated users" ON contact_messages
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read for authenticated users" ON contact_messages
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Enable all for service role" ON contact_messages
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Similar policies for other tables...
```

## Phase 4: Backup and Monitoring Setup

### 4.1 Backup Strategy

Create `/srv/wp/scripts/backup.sh`:
```bash
#!/bin/bash

# Backup configuration
BACKUP_DIR="/srv/wp/backups/$(date +%Y-%m-%d)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="saraiva-vision-backups"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
echo "Backing up database..."
docker-compose exec -T db mysqldump -u root -p$MYSQL_ROOT_PASSWORD wordpress > "$BACKUP_DIR/database_$TIMESTAMP.sql"
gzip "$BACKUP_DIR/database_$TIMESTAMP.sql"

# WordPress files backup
echo "Backing up WordPress files..."
tar -czf "$BACKUP_DIR/wordpress_$TIMESTAMP.tar.gz" -C /var/lib/docker/volumes/saraiva-vision_wp_data/_data wp-content

# Nginx configuration backup
echo "Backing up Nginx configuration..."
tar -czf "$BACKUP_DIR/nginx_$TIMESTAMP.tar.gz" -C /srv/wp nginx

# Upload to S3 (if AWS CLI is configured)
if command -v aws &> /dev/null; then
    echo "Uploading to S3..."
    aws s3 sync "$BACKUP_DIR" "s3://$S3_BUCKET/$(date +%Y-%m-%d)/"
fi

# Clean old backups (keep 30 days)
find /srv/wp/backups -type d -mtime +30 -exec rm -rf {} \;

echo "Backup completed successfully: $BACKUP_DIR"
```

Make the script executable:
```bash
chmod +x /srv/wp/scripts/backup.sh
```

### 4.2 Automated Backups

Add to crontab (`crontab -e`):
```bash
# Daily backup at 2 AM
0 2 * * * /srv/wp/scripts/backup.sh >> /srv/wp/backups/backup.log 2>&1
```

### 4.3 Monitoring Setup

Create `/srv/wp/scripts/health-check.sh`:
```bash
#!/bin/bash

# Health check script
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Check Docker services
DOCKER_SERVICES=$(docker-compose ps --services)
for service in $DOCKER_SERVICES; do
    STATUS=$(docker-compose ps $service | grep -q "Up" && echo "UP" || echo "DOWN")
    echo "$TIMESTAMP - $service: $STATUS"
done

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}')
echo "$TIMESTAMP - Disk usage: $DISK_USAGE"

# Check memory usage
MEMORY_USAGE=$(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2}')
echo "$TIMESTAMP - Memory usage: $MEMORY_USAGE"

# Check Nginx process
if pgrep nginx > /dev/null; then
    echo "$TIMESTAMP - Nginx: RUNNING"
else
    echo "$TIMESTAMP - Nginx: DOWN"
fi
```

### 4.4 Log Management

Create `/srv/wp/nginx/conf.d/logrotate.conf`:
```nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 nginx nginx
    postrotate
        docker-compose exec nginx nginx -s reload
    endscript
}
```

## Phase 5: WordPress Configuration

### 5.1 WPGraphQL Configuration

1. **Access WordPress Admin**: https://cms.saraivavision.com.br/wp-admin
2. **Configure WPGraphQL**:
   - Go to GraphQL → Settings
   - Enable public introspection (for development)
   - Configure CORS settings
   - Set up authentication for mutations

### 5.2 Content Types Setup

```bash
# Create custom content types via WP-CLI
docker-compose exec wp wp post-type create podcast \
  --label='Podcast Episodes' \
  --public \
  --show_in_rest \
  --has_archive \
  --rewrite='slug=podcast'

# Create custom fields
docker-compose exec wp wp plugin install advanced-custom-fields --activate
docker-compose exec wp wp plugin install wp-graphql-acf --activate
```

### 5.3 Webhook Configuration

1. **Install WP Webhooks Pro** (or use free version)
2. **Configure webhook triggers**:
   - Post published
   - Post updated
   - Page published
   - Page updated
3. **Set webhook URL**: `https://saraivavision.com.br/api/webhooks/wp-revalidate?secret=your_secret`

## Phase 6: Maintenance and Operations

### 6.1 Regular Maintenance Tasks

#### Weekly
- Check WordPress updates
- Review backup logs
- Monitor disk space
- Check SSL certificate expiration

#### Monthly
- Update Docker images
- Review security patches
- Analyze performance metrics
- Test backup restoration

#### Quarterly
- Security audit
- Performance optimization review
- Disaster recovery testing
- Capacity planning

### 6.2 Update Procedures

#### WordPress Updates
```bash
# Create backup first
/srv/wp/scripts/backup.sh

# Update WordPress core
docker-compose exec wp wp core update
docker-compose exec wp wp core update-db

# Update plugins
docker-compose exec wp wp plugin update --all

# Update themes
docker-compose exec wp wp theme update --all
```

#### Docker Updates
```bash
# Pull latest images
docker-compose pull

# Recreate containers
docker-compose up -d --force-recreate

# Clean up old images
docker image prune -f
```

### 6.3 Troubleshooting

#### Common Issues

**WordPress not loading:**
```bash
# Check container status
docker-compose ps

# Check nginx logs
docker-compose logs nginx

# Check WordPress logs
docker-compose logs wp
```

**Database connection issues:**
```bash
# Check database container
docker-compose exec db mysql -u root -p

# Check environment variables
docker-compose config
```

**Performance issues:**
```bash
# Check container resource usage
docker stats

# Check Redis status
docker-compose exec redis redis-cli ping

# Clear WordPress cache
docker-compose exec wp wp redis flush
```

## Security Best Practices

### 6.4 Security Monitoring

```bash
# Install auditd
sudo apt install auditd -y
sudo systemctl enable auditd
sudo systemctl start auditd

# Monitor login attempts
sudo auditctl -w /var/log/auth.log -p wa -k logins

# Monitor file changes
sudo auditctl -w /srv/wp -p wa -k wordpress_files
```

### 6.5 Access Control

```bash
# Restrict SSH access
sudo nano /etc/ssh/sshd_config
# Add: AllowUsers deploy
# Remove: PasswordAuthentication yes

# Restart SSH
sudo systemctl restart sshd
```

## Deployment Checklist

### Pre-Deployment
- [ ] Backup current system
- [ ] Test deployment scripts
- [ ] Verify environment variables
- [ ] Check database migrations
- [ ] Test rollback procedures

### During Deployment
- [ ] Deploy to staging environment
- [ ] Run comprehensive tests
- [ ] Monitor performance metrics
- [ ] Check error logs
- [ ] Verify all services running

### Post-Deployment
- [ ] Update documentation
- [ ] Notify stakeholders
- [ ] Monitor for 24 hours
- [ ] Perform smoke tests
- [ ] Update backup configurations

## Emergency Procedures

### 6.6 Site Down

1. **Check services**:
   ```bash
   docker-compose ps
   docker-compose logs
   ```

2. **Restart services**:
   ```bash
   docker-compose restart
   ```

3. **Check resources**:
   ```bash
   df -h
   free -m
   ```

### 6.7 Database Issues

1. **Check database status**:
   ```bash
   docker-compose exec db mysql -u root -p -e "SHOW STATUS;"
   ```

2. **Restore from backup**:
   ```bash
   docker-compose exec -T db mysql -u root -p wordpress < backup_file.sql
   ```

### 6.8 Security Incident

1. **Isolate system**:
   ```bash
   sudo ufw default deny incoming
   ```

2. **Collect evidence**:
   ```bash
   sudo ausearch -k logins --start recent
   ```

3. **Notify security team**
4. **Follow incident response plan**

## Support and Maintenance

### Monitoring Tools
- **Vercel Analytics**: Application performance
- **Supabase Logs**: Database and authentication
- **WordPress Logs**: CMS activities
- **Server Logs**: System health

### Documentation
- Maintain this deployment guide
- Update runbooks for common procedures
- Document any custom configurations
- Keep change logs for updates

### Team Training
- Regular security awareness training
- Deployment procedure reviews
- Emergency response drills
- Performance optimization workshops

---

This deployment guide provides a comprehensive framework for setting up and maintaining Saraiva Vision's hybrid infrastructure. Regular updates and reviews of this documentation will ensure it remains current and effective as the system evolves.