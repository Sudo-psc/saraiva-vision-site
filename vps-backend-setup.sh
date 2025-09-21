#!/bin/bash

# Saraiva Vision VPS Backend Setup Script
# IP: 31.97.129.78

set -e

echo "🚀 Setting up Saraiva Vision Backend on VPS (31.97.129.78)"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
   exit 1
fi

# System Update
log "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Docker and Docker Compose
log "Installing Docker and Docker Compose..."
apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Nginx
log "Installing Nginx..."
apt-get install -y nginx

# Create project directory
PROJECT_DIR="/var/www/saraiva-vision-backend"
log "Creating project directory: $PROJECT_DIR"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Create Docker Compose configuration
log "Creating Docker Compose configuration..."
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # Node.js API Server
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: saraiva-vision-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=mysql://root:${MYSQL_ROOT_PASSWORD}@db:3306/saraiva_vision
      - REDIS_URL=redis://redis:6379
      - WORDPRESS_DB_NAME=wordpress
      - WORDPRESS_DB_USER=wp
      - WORDPRESS_DB_PASSWORD=${WORDPRESS_DB_PASSWORD}
      - WORDPRESS_DB_HOST=db:3306
    depends_on:
      - db
      - redis
    volumes:
      - ./api:/app
      - /app/node_modules
    networks:
      - saraiva-network

  # WordPress CMS
  wordpress:
    image: wordpress:6.4-php8.1-fpm
    container_name: saraiva-vision-wordpress
    restart: unless-stopped
    depends_on:
      - db
    environment:
      - WORDPRESS_DB_HOST=db:3306
      - WORDPRESS_DB_USER=wp
      - WORDPRESS_DB_PASSWORD=${WORDPRESS_DB_PASSWORD}
      - WORDPRESS_DB_NAME=wordpress
    volumes:
      - ./wordpress:/var/www/html
      - ./wordpress-config/uploads.ini:/usr/local/etc/php/conf.d/uploads.ini
    networks:
      - saraiva-network

  # Nginx Proxy
  nginx:
    image: nginx:alpine
    container_name: saraiva-vision-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./ssl:/etc/nginx/ssl
      - ./wordpress:/var/www/html
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - api
      - wordpress
    networks:
      - saraiva-network

  # MySQL Database
  db:
    image: mysql:8.0
    container_name: saraiva-vision-db
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=saraiva_vision
      - MYSQL_USER=wp
      - MYSQL_PASSWORD=${WORDPRESS_DB_PASSWORD}
    volumes:
      - db_data:/var/lib/mysql
      - ./mysql-backup:/backup
      - ./mysql-init:/docker-entrypoint-initdb.d
    networks:
      - saraiva-network
    command: --default-authentication-plugin=mysql_native_password

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: saraiva-vision-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - saraiva-network

  # phpMyAdmin (optional)
  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    container_name: saraiva-vision-phpmyadmin
    restart: unless-stopped
    environment:
      - PMA_HOST=db
      - PMA_USER=wp
      - PMA_PASSWORD=${WORDPRESS_DB_PASSWORD}
      - PMA_PORT=3306
    ports:
      - "8080:80"
    depends_on:
      - db
    networks:
      - saraiva-network

volumes:
  db_data:
  redis_data:

networks:
  saraiva-network:
    driver: bridge
EOF

# Create environment file
log "Creating environment configuration..."
cat > .env << 'EOF'
# Database Configuration
MYSQL_ROOT_PASSWORD=your_strong_mysql_password_here
WORDPRESS_DB_PASSWORD=your_wordpress_db_password_here
REDIS_PASSWORD=your_redis_password_here

# API Configuration
NODE_ENV=production
PORT=3001
JWT_SECRET=your_jwt_secret_here

# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
DOCTOR_EMAIL=philipe_cruz@outlook.com
CONTACT_EMAIL_FROM=noreply@saraivavision.com.br

# ReCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# WordPress Configuration
WORDPRESS_URL=https://saraivavision.com.br

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=5
EOF

# Create API directory structure
log "Creating API directory structure..."
mkdir -p api/{src,routes,middleware,utils,tests}
mkdir -p wordpress
mkdir -p nginx/{conf.d,ssl}
mkdir -p mysql-backup
mkdir -p mysql-init
mkdir -p logs/nginx

# Create API package.json
log "Creating API package.json..."
cat > api/package.json << 'EOF'
{
  "name": "saraiva-vision-api",
  "version": "1.0.0",
  "description": "Saraiva Vision Backend API",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "migrate": "knex migrate:latest",
    "seed": "knex seed:run"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "mysql2": "^3.6.3",
    "redis": "^4.6.8",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "joi": "^17.11.0",
    "nodemailer": "^6.9.7",
    "resend": "^3.2.0",
    "winston": "^3.11.0",
    "express-rate-limit": "^7.1.5",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.54.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create main API server
log "Creating main API server..."
cat > api/src/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: [
    'https://saraivavision.com.br',
    'https://www.saraivavision.com.br',
    'http://localhost:3000',
    'http://localhost:3002'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/contact', require('./routes/contact'));
app.use('/api/servicos', require('./routes/servicos'));
app.use('/api/wordpress', require('./routes/wordpress'));
app.use('/api/health', require('./routes/health'));
app.use('/api/reviews', require('./routes/reviews'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Saraiva Vision API server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
EOF

# Create API routes directory
mkdir -p api/src/routes

# Copy existing API endpoints
log "Migrating existing API endpoints..."
cp -r /home/saraiva-vision-site/api/* api/src/routes/

# Create Nginx configuration
log "Creating Nginx configuration..."
cat > nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Performance optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
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

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    include /etc/nginx/conf.d/*.conf;
}
EOF

# Create Nginx site configuration
cat > nginx/conf.d/saraiva-vision.conf << 'EOF'
server {
    listen 80;
    server_name 31.97.129.78 saraivavision.com.br www.saraivavision.com.br api.saraivavision.com.br;

    # Security
    server_tokens off;

    # Redirect to HTTPS (when SSL is configured)
    # return 301 https://$server_name$request_uri;

    # API endpoints
    location /api/ {
        limit_req zone=api burst=10 nodelay;

        proxy_pass http://api:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers
        add_header Access-Control-Allow-Origin "https://saraivavision.com.br" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;

        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # WordPress
    location / {
        try_files $uri $uri/ /index.php?$args;

        proxy_pass http://wordpress:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WordPress specific headers
        proxy_set_header SCRIPT_FILENAME /var/www/html$fastcgi_script_name;
        proxy_set_header SCRIPT_NAME $fastcgi_script_name;
    }

    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://wordpress:9000;
    }

    # phpMyAdmin (optional)
    location /phpmyadmin {
        proxy_pass http://phpmyadmin:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# HTTPS configuration (uncomment when SSL certificates are available)
# server {
#     listen 443 ssl http2;
#     server_name saraivavision.com.br www.saraivavision.com.br api.saraivavision.com.br;
#
#     ssl_certificate /etc/nginx/ssl/saraivavision.com.br.crt;
#     ssl_certificate_key /etc/nginx/ssl/saraivavision.com.br.key;
#
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
#     ssl_prefer_server_ciphers off;
#     ssl_session_cache shared:SSL:10m;
#     ssl_session_timeout 10m;
#
#     # HSTS
#     add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
#
#     # Include the location blocks from above
#     include /etc/nginx/conf.d/locations.conf;
# }
EOF

# Create API Dockerfile
cat > api/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
EOF

# Create startup script
cat > start-backend.sh << 'EOF'
#!/bin/bash

# Saraiva Vision Backend Startup Script

echo "🚀 Starting Saraiva Vision Backend Services..."

# Check if environment file exists
if [ ! -f .env ]; then
    echo "❌ Environment file not found. Please create .env file first."
    exit 1
fi

# Start Docker Compose
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "📊 Service Status:"
docker-compose ps

# Run database migrations (if any)
echo "🗄️  Running database migrations..."
docker-compose exec api npm run migrate || echo "No migrations found"

echo "✅ Backend services started successfully!"
echo ""
echo "🌐 Access points:"
echo "  - API: http://31.97.129.78:3001"
echo "  - WordPress: http://31.97.129.78"
echo "  - phpMyAdmin: http://31.97.129.78:8080"
echo ""
echo "📝 Logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
EOF

# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash

# Saraiva Vision Backend Monitoring Script

echo "📊 Saraiva Vision Backend Status"
echo "=================================="

# Check Docker services
echo "🐳 Docker Services:"
docker-compose ps

echo ""
echo "🔍 Health Checks:"

# Check API health
echo "  - API Health:"
curl -s http://localhost:3001/health | jq . 2>/dev/null || echo "    ❌ API not responding"

# Check database
echo "  - Database:"
docker-compose exec db mysqladmin ping -u root -p$MYSQL_ROOT_PASSWORD 2>/dev/null && echo "    ✅ Database online" || echo "    ❌ Database offline"

# Check Redis
echo "  - Redis:"
docker-compose exec redis redis-cli ping 2>/dev/null && echo "    ✅ Redis online" || echo "    ❌ Redis offline"

echo ""
echo "📈 Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""
echo "📝 Recent Logs (last 10 lines):"
docker-compose logs --tail=10
EOF

# Make scripts executable
chmod +x start-backend.sh
chmod +x monitor.sh

# Set permissions
chown -R $USER:$USER $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

log "✅ Backend setup completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Edit .env file with your actual configuration"
echo "2. Run: ./start-backend.sh"
echo "3. Check status: ./monitor.sh"
echo "4. Configure SSL certificates for HTTPS"
echo ""
warn "⚠️  Remember to:"
warn "  - Set strong passwords in .env file"
warn "  - Configure SSL certificates"
warn "  - Set up database backups"
warn "  - Configure firewall rules"