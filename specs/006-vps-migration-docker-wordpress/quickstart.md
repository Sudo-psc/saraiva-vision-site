# Quickstart Guide: VPS Migration with Docker Containers

## Prerequisites

Before starting the migration, ensure you have:

- **Access to**: VPS server (Ubuntu 22.04 LTS)
- **Domain name**: saraivavision.com.br (or equivalent)
- **SSH access**: To VPS with sudo privileges
- **Git access**: To repository with appropriate permissions
- **Local development**: Docker and Docker Compose installed locally
- **Database access**: Supabase credentials for data export

## Phase 1: Infrastructure Setup (Week 1-2)

### 1.1 VPS Provisioning

```bash
# Connect to VPS
ssh root@31.97.129.78

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl git ufw fail2ban

# Create user for deployment
useradd -m -s /bin/bash deploy
usermod -aG sudo deploy

# Switch to deploy user
su - deploy

# Set up SSH keys
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# Add your public key to ~/.ssh/authorized_keys
```

### 1.2 Docker Installation

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker deploy

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
docker-compose --version
```

### 1.3 Security Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Configure fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create SSL certificates directory
sudo mkdir -p /etc/letsencrypt/live/saraivavision.com.br
sudo chown deploy:deploy /etc/letsencrypt/live/saraivavision.com.br
```

### 1.4 Project Setup

```bash
# Clone repository
git clone https://github.com/your-repo/saraiva-vision-site.git
cd saraiva-vision-site

# Create feature branch
git checkout -b 006-vps-migration-docker-wordpress

# Create necessary directories
mkdir -p docker/{ssl,logs}
mkdir -p database/{data,init}
mkdir -p wordpress/wp-content/{plugins,themes,uploads}
mkdir -p proxy/ssl
```

## Phase 2: Containerization (Week 3-4)

### 2.1 Frontend Container

```bash
# Create frontend Dockerfile
cat > frontend/Dockerfile << 'EOF'
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# Create nginx config for frontend
cat > frontend/docker/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF
```

### 2.2 Backend Container

```bash
# Create backend Dockerfile
cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
EOF
```

### 2.3 WordPress Container

```bash
# Create WordPress Dockerfile
cat > wordpress/Dockerfile << 'EOF'
FROM wordpress:6.0-php8.1-fpm

# Install required PHP extensions
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy custom configuration
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

# Set permissions
RUN chown -R www-data:www-data /var/www/html
EOF

# Create PHP configuration
cat > wordpress/docker/php.ini << 'EOF'
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
EOF
```

### 2.4 Database Container

```bash
# Create MySQL Dockerfile
cat > database/Dockerfile << 'EOF'
FROM mysql:8.0

# Copy configuration
COPY docker/my.cnf /etc/mysql/conf.d/custom.cnf
COPY docker/init/ /docker-entrypoint-initdb.d/

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=secure_root_password
ENV MYSQL_DATABASE=saraivavision
ENV MYSQL_USER=app_user
ENV MYSQL_PASSWORD=secure_app_password
EOF

# Create MySQL configuration
cat > database/docker/my.cnf << 'EOF'
[mysqld]
default-authentication-plugin=mysql_native_password
innodb-buffer-pool-size=256M
innodb-log-file-size=64M
max-connections=200
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
EOF
```

### 2.5 Nginx Proxy Container

```bash
# Create proxy Dockerfile
cat > proxy/Dockerfile << 'EOF'
FROM nginx:alpine

# Copy SSL certificates and configuration
COPY ssl/ /etc/nginx/ssl/
COPY nginx.conf /etc/nginx/nginx.conf

# Create directories for SSL
RUN mkdir -p /etc/nginx/ssl && \
    chmod 700 /etc/nginx/ssl

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
EOF
```

### 2.6 Docker Compose Configuration

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Frontend
  frontend:
    build: ./frontend
    container_name: saraiva-frontend
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - app-network

  # Backend
  backend:
    build: ./backend
    container_name: saraiva-backend
    restart: unless-stopped
    depends_on:
      - database
    environment:
      - NODE_ENV=production
      - DATABASE_HOST=database
      - DATABASE_USER=app_user
      - DATABASE_PASSWORD=secure_app_password
      - DATABASE_NAME=saraivavision
    networks:
      - app-network
    volumes:
      - ./backend/logs:/app/logs

  # WordPress
  wordpress:
    build: ./wordpress
    container_name: saraiva-wordpress
    restart: unless-stopped
    depends_on:
      - database
    environment:
      - WORDPRESS_DB_HOST=database:3306
      - WORDPRESS_DB_USER=app_user
      - WORDPRESS_DB_PASSWORD=secure_app_password
      - WORDPRESS_DB_NAME=saraivavision
      - WORDPRESS_TABLE_PREFIX=wp_
    volumes:
      - ./wordpress/wp-content:/var/www/html/wp-content
      - ./wordpress/docker/php.ini:/usr/local/etc/php/conf.d/custom.ini
    networks:
      - app-network

  # Database
  database:
    build: ./database
    container_name: saraiva-database
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=secure_root_password
      - MYSQL_DATABASE=saraivavision
      - MYSQL_USER=app_user
      - MYSQL_PASSWORD=secure_app_password
    volumes:
      - database_data:/var/lib/mysql
      - ./database/logs:/var/log/mysql
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - app-network

  # Nginx Proxy
  proxy:
    build: ./proxy
    container_name: saraiva-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend
      - wordpress
    volumes:
      - ./proxy/ssl:/etc/nginx/ssl
      - ./proxy/logs:/var/log/nginx
    networks:
      - app-network

  # SSL Certbot (for certificate management)
  certbot:
    image: certbot/certbot
    container_name: saraiva-certbot
    volumes:
      - ./proxy/ssl:/etc/letsencrypt
      - ./proxy/logs:/var/log/letsencrypt
    networks:
      - app-network

volumes:
  database_data:

networks:
  app-network:
    driver: bridge
EOF
```

## Phase 3: Data Migration (Week 5-6)

### 3.1 Database Migration Script

```bash
# Create migration script
cat > scripts/migrate-database.sh << 'EOF'
#!/bin/bash

# Export Supabase data
echo "Exporting Supabase data..."
PGPASSWORD=$SUPABASE_PASSWORD pg_dump -h $SUPABASE_HOST -U $SUPABASE_USER -d $SUPABASE_DB > supabase-backup.sql

# Create database migration script
cat > scripts/convert-to-mysql.sql << 'SQLEND'
-- Convert PostgreSQL schema to MySQL
-- This is a simplified example - adjust based on actual schema

CREATE TABLE IF NOT EXISTS wp_users (
  ID bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  user_login varchar(60) NOT NULL,
  user_pass varchar(255) NOT NULL,
  user_nicename varchar(50) NOT NULL,
  user_email varchar(100) NOT NULL,
  user_url varchar(100) NOT NULL,
  user_registered datetime NOT NULL,
  user_activation_key varchar(255) NOT NULL,
  user_status int(11) NOT NULL DEFAULT '0',
  display_name varchar(250) NOT NULL,
  PRIMARY KEY (ID),
  UNIQUE KEY user_login (user_login),
  KEY user_email (user_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add more table conversions as needed
SQLEND

echo "Database migration script created."
EOF

chmod +x scripts/migrate-database.sh
```

### 3.2 WordPress Setup

```bash
# Create WordPress setup script
cat > scripts/setup-wordpress.sh << 'EOF'
#!/bin/bash

# Wait for database to be ready
until mysql -h database -u app_user -psecure_app_password -e "SHOW DATABASES;"; do
  echo "Waiting for database..."
  sleep 3
done

# Install WordPress CLI
docker exec saraiva-wordpress curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
docker exec saraiva-wordpress chmod +x wp-cli.phar
docker exec saraiva-wordpress mv wp-cli.phar /usr/local/bin/wp

# Configure WordPress
docker exec saraiva-wordpress wp core config --dbname=saraivavision --dbuser=app_user --dbpass=secure_app_password --dbhost=database --dbprefix=wp_

# Install WordPress
docker exec saraiva-wordpress wp core install --url="https://saraivavision.com.br" --title="Saraiva Vision" --admin_user=admin --admin_password=secure_admin_password --admin_email=admin@saraivavision.com.br

# Install required plugins
docker exec saraiva-wordpress wp plugin install rest-api --activate
docker exec saraiva-wordpress wp plugin install custom-post-type-ui --activate
docker exec saraiva-wordpress wp plugin install advanced-custom-fields --activate

echo "WordPress setup completed."
EOF

chmod +x scripts/setup-wordpress.sh
```

## Phase 4: Integration & Testing (Week 7-8)

### 4.1 Build and Start Containers

```bash
# Build all containers
docker-compose build

# Start services
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4.2 SSL Certificate Setup

```bash
# Obtain SSL certificates
docker-compose run --rm certbot certonly --webroot --webroot-path /var/www/certbot -d saraivavision.com.br -d www.saraivavision.com.br

# Configure Nginx for SSL
cat > proxy/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:80;
    }

    upstream backend {
        server backend:3001;
    }

    upstream wordpress {
        server wordpress:9000;
    }

    # HTTP redirect to HTTPS
    server {
        listen 80;
        server_name saraivavision.com.br www.saraivavision.com.br;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name saraivavision.com.br www.saraivavision.com.br;

        ssl_certificate /etc/ssl/certs/saraivavision.com.br.crt;
        ssl_certificate_key /etc/ssl/private/saraivavision.com.br.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WordPress
        location /wp-admin/ {
            proxy_pass http://wordpress;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WordPress REST API
        location /wp-json/ {
            proxy_pass http://wordpress;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Restart proxy
docker-compose restart proxy
```

### 4.3 Testing

```bash
# Create test script
cat > scripts/test-deployment.sh << 'EOF'
#!/bin/bash

echo "Testing deployment..."

# Test frontend
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo "✓ Frontend is accessible"
else
    echo "✗ Frontend is not accessible"
    exit 1
fi

# Test backend API
if curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health | grep -q "200"; then
    echo "✓ Backend API is accessible"
else
    echo "✗ Backend API is not accessible"
    exit 1
fi

# Test WordPress
if curl -s -o /dev/null -w "%{http_code}" http://localhost/wp-admin/ | grep -q "302"; then
    echo "✓ WordPress is accessible"
else
    echo "✗ WordPress is not accessible"
    exit 1
fi

echo "All tests passed!"
EOF

chmod +x scripts/test-deployment.sh
./scripts/test-deployment.sh
```

## Phase 5: Production Deployment (Week 9-10)

### 5.1 DNS Configuration

1. **Update DNS records**:
   ```
   A record: saraivavision.com.br → 31.97.129.78
   A record: www.saraivavision.com.br → 31.97.129.78
   ```

2. **Configure domain in WordPress**:
   ```bash
   docker exec saraiva-wordpress wp option update home 'https://saraivavision.com.br'
   docker exec saraiva-wordpress wp option update siteurl 'https://saraivavision.com.br'
   ```

### 5.2 Monitoring Setup

```bash
# Create monitoring script
cat > scripts/monitor.sh << 'EOF'
#!/bin/bash

# Check container status
docker-compose ps

# Check system resources
free -h
df -h
docker stats --no-stream

# Check logs for errors
docker-compose logs --tail=100 backend | grep -i error
docker-compose logs --tail=100 wordpress | grep -i error
docker-compose logs --tail=100 database | grep -i error
EOF

chmod +x scripts/monitor.sh
```

### 5.3 Backup Setup

```bash
# Create backup script
cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# Create backup directory
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup database
docker exec saraiva-database mysqldump -u root -psecure_root_password saraivavision > $BACKUP_DIR/database.sql

# Backup WordPress files
tar -czf $BACKUP_DIR/wordpress.tar.gz wordpress/wp-content/

# Backup configuration files
cp docker-compose.yml $BACKUP_DIR/
cp -r proxy/ssl $BACKUP_DIR/

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x scripts/backup.sh
```

## Development Workflow

### Local Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Build and test specific containers
docker-compose build frontend
docker-compose up -d frontend

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Deployment Commands

```bash
# Deploy to production
git pull origin main
docker-compose build
docker-compose up -d
./scripts/test-deployment.sh

# Rollback deployment
git checkout previous-version
docker-compose build
docker-compose up -d
```

### Maintenance Commands

```bash
# Update containers
docker-compose pull
docker-compose up -d

# Clean up unused resources
docker system prune -a

# View resource usage
docker stats

# Access container shells
docker exec -it saraiva-wordpress bash
docker exec -it saraiva-database mysql -u root -p
```

## Troubleshooting

### Common Issues

1. **Container not starting**:
   ```bash
   docker-compose logs <container_name>
   docker inspect <container_name>
   ```

2. **Database connection issues**:
   ```bash
   docker exec -it saraiva-database mysql -u app_user -psecure_app_password
   ```

3. **SSL certificate issues**:
   ```bash
   docker-compose run --rm certbot certificates
   ```

4. **Performance issues**:
   ```bash
   docker stats
   docker exec saraiva-database mysql -e "SHOW PROCESSLIST;"
   ```

### Health Checks

```bash
# Check all services
./scripts/test-deployment.sh

# Monitor logs
docker-compose logs -f --tail=100

# Check resource usage
free -h
df -h
docker stats --no-stream
```

This quickstart guide provides a comprehensive foundation for migrating Saraiva Vision to a VPS with Docker containers. Remember to:

1. **Test thoroughly** in staging before production
2. **Monitor closely** after deployment
3. **Document all changes** and procedures
4. **Train staff** on the new WordPress interface
5. **Implement monitoring** and alerting

For detailed specifications and API contracts, refer to the generated documentation in the `specs/` directory.