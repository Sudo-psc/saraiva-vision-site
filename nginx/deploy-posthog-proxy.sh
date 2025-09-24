#!/bin/bash

# PostHog Reverse Proxy Deployment Script
# This script automates the complete setup of PostHog reverse proxy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (update these values)
DEFAULT_DOMAIN="analytics.saraivavision.com.br"
DEFAULT_EMAIL="philipe_cruz@outlook.com"

echo -e "${BLUE}🚀 PostHog Reverse Proxy Deployment Script${NC}"
echo "=============================================="

# Get domain and email from user
read -p "Enter your analytics domain [$DEFAULT_DOMAIN]: " DOMAIN
DOMAIN=${DOMAIN:-$DEFAULT_DOMAIN}

read -p "Enter your email for SSL certificates [$DEFAULT_EMAIL]: " EMAIL
EMAIL=${EMAIL:-$DEFAULT_EMAIL}

echo ""
echo -e "${YELLOW}Configuration:${NC}"
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""

read -p "Continue with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 1
fi

echo -e "${BLUE}📋 Step 1: Checking prerequisites...${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are available${NC}"

# Check if ports are available
if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 80 is in use. Make sure to stop other web servers.${NC}"
fi

if lsof -Pi :443 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 443 is in use. Make sure to stop other web servers.${NC}"
fi

echo -e "${BLUE}📝 Step 2: Updating configuration files...${NC}"

# Update nginx configuration
sed -i.bak "s/analytics\.yourdomain\.com/$DOMAIN/g" posthog-proxy.conf
echo -e "${GREEN}✅ Updated NGINX configuration${NC}"

# Update SSL setup script
sed -i.bak "s/analytics\.yourdomain\.com/$DOMAIN/g" setup-ssl.sh
sed -i.bak "s/your-email@yourdomain\.com/$EMAIL/g" setup-ssl.sh
echo -e "${GREEN}✅ Updated SSL setup script${NC}"

echo -e "${BLUE}🔐 Step 3: Setting up SSL certificates...${NC}"

# Make SSL setup script executable
chmod +x setup-ssl.sh

# Run SSL setup
if ./setup-ssl.sh; then
    echo -e "${GREEN}✅ SSL certificates configured successfully${NC}"
else
    echo -e "${RED}❌ SSL setup failed. Please check the logs above.${NC}"
    exit 1
fi

echo -e "${BLUE}🐳 Step 4: Starting Docker containers...${NC}"

# Create logs directory
mkdir -p logs

# Start the containers
if docker-compose up -d; then
    echo -e "${GREEN}✅ Docker containers started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start Docker containers${NC}"
    exit 1
fi

echo -e "${BLUE}🧪 Step 5: Testing the deployment...${NC}"

# Wait for containers to be ready
echo "Waiting for containers to be ready..."
sleep 10

# Test health endpoint
if curl -f -s "https://$DOMAIN/health" > /dev/null; then
    echo -e "${GREEN}✅ Health endpoint is working${NC}"
else
    echo -e "${RED}❌ Health endpoint test failed${NC}"
    echo "Checking container logs..."
    docker-compose logs --tail=20 nginx-posthog-proxy
fi

# Test PostHog endpoint
if curl -f -s -I "https://$DOMAIN/decide/" > /dev/null; then
    echo -e "${GREEN}✅ PostHog proxy is working${NC}"
else
    echo -e "${YELLOW}⚠️  PostHog endpoint test failed (this might be normal if PostHog is blocking the request)${NC}"
fi

echo -e "${BLUE}📊 Step 6: Updating application configuration...${NC}"

# Update .env file if it exists
if [ -f "../.env" ]; then
    # Backup original .env
    cp ../.env ../.env.backup.$(date +%Y%m%d_%H%M%S)
    
    # Update PostHog host
    if grep -q "VITE_PUBLIC_POSTHOG_HOST" ../.env; then
        sed -i.bak "s|VITE_PUBLIC_POSTHOG_HOST=.*|VITE_PUBLIC_POSTHOG_HOST=https://$DOMAIN|g" ../.env
        echo -e "${GREEN}✅ Updated .env file with new PostHog host${NC}"
    else
        echo "VITE_PUBLIC_POSTHOG_HOST=https://$DOMAIN" >> ../.env
        echo -e "${GREEN}✅ Added PostHog host to .env file${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found. Please manually update your PostHog configuration.${NC}"
fi

echo -e "${BLUE}📋 Step 7: Creating monitoring scripts...${NC}"

# Create monitoring script
cat > monitor-proxy.sh << 'EOF'
#!/bin/bash

# PostHog Proxy Monitoring Script

DOMAIN="DOMAIN_PLACEHOLDER"

echo "🔍 PostHog Proxy Status Check"
echo "=============================="

# Check container status
echo "📦 Container Status:"
docker-compose ps

echo ""

# Check health endpoint
echo "🏥 Health Check:"
if curl -f -s "https://$DOMAIN/health" > /dev/null; then
    echo "✅ Health endpoint: OK"
else
    echo "❌ Health endpoint: FAILED"
fi

# Check SSL certificate
echo ""
echo "🔒 SSL Certificate:"
CERT_EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ ! -z "$CERT_EXPIRY" ]; then
    echo "✅ SSL Certificate expires: $CERT_EXPIRY"
else
    echo "❌ SSL Certificate: FAILED to retrieve"
fi

# Check recent logs
echo ""
echo "📝 Recent Logs (last 10 lines):"
docker-compose logs --tail=10 nginx-posthog-proxy

echo ""
echo "📊 Container Stats:"
docker stats --no-stream nginx-posthog-proxy
EOF

# Replace domain placeholder
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" monitor-proxy.sh
chmod +x monitor-proxy.sh

echo -e "${GREEN}✅ Created monitoring script (monitor-proxy.sh)${NC}"

# Create backup script
cat > backup-proxy.sh << 'EOF'
#!/bin/bash

# PostHog Proxy Backup Script

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="posthog-proxy-backup-$TIMESTAMP.tar.gz"

echo "💾 Creating backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
tar -czf "$BACKUP_DIR/$BACKUP_FILE" \
    *.conf \
    *.yml \
    *.sh \
    ssl/ \
    logs/ \
    2>/dev/null

echo "✅ Backup created: $BACKUP_DIR/$BACKUP_FILE"

# Keep only last 5 backups
cd $BACKUP_DIR
ls -t posthog-proxy-backup-*.tar.gz | tail -n +6 | xargs -r rm
cd ..

echo "🧹 Old backups cleaned up"
EOF

chmod +x backup-proxy.sh

echo -e "${GREEN}✅ Created backup script (backup-proxy.sh)${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "======================="
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "• Domain: https://$DOMAIN"
echo "• SSL: Configured with Let's Encrypt"
echo "• Auto-renewal: Enabled (weekly cron job)"
echo "• Health check: https://$DOMAIN/health"
echo ""
echo -e "${BLUE}🔧 Management Commands:${NC}"
echo "• Monitor status: ./monitor-proxy.sh"
echo "• Create backup: ./backup-proxy.sh"
echo "• Renew SSL: ./renew-ssl.sh"
echo "• View logs: docker-compose logs -f nginx-posthog-proxy"
echo "• Restart: docker-compose restart nginx-posthog-proxy"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Update your DNS to point $DOMAIN to this server"
echo "2. Test your application with the new PostHog endpoint"
echo "3. Monitor the proxy using ./monitor-proxy.sh"
echo "4. Set up regular backups with ./backup-proxy.sh"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "• Make sure your domain DNS is pointing to this server"
echo "• Test your application thoroughly with the new endpoint"
echo "• Monitor the logs for any issues"
echo ""
echo -e "${GREEN}✅ Your PostHog reverse proxy is ready!${NC}"