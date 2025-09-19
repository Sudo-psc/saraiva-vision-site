#!/bin/bash
# Saraiva Vision - Docker Backup Script
# Backs up Docker volumes and container data

set -e

BACKUP_DIR="/backup/saraiva-vision-$(date +%Y%m%d_%H%M%S)"
COMPOSE_FILE="docker-compose.prod.yml"

echo "🔄 Starting Saraiva Vision backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup Docker volumes
echo "📦 Backing up Docker volumes..."
docker run --rm -v saraiva-vision-site-v3_nginx_logs:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/nginx_logs.tar.gz -C /data .

# Backup environment files
echo "⚙️ Backing up configuration files..."
cp .env.production "$BACKUP_DIR/"
cp docker-compose.prod.yml "$BACKUP_DIR/"

# Backup nginx configs
echo "🌐 Backing up nginx configurations..."
cp -r nginx-configs "$BACKUP_DIR/"

# Create backup manifest
echo "📋 Creating backup manifest..."
cat > "$BACKUP_DIR/backup_manifest.txt" << EOF
Saraiva Vision Docker Backup
Created: $(date)
Backup Directory: $BACKUP_DIR

Contents:
- nginx_logs.tar.gz: Nginx access and error logs
- .env.production: Production environment variables
- docker-compose.prod.yml: Production Docker Compose configuration
- nginx-configs/: Nginx configuration files

Restore Instructions:
1. Extract volumes: docker run --rm -v saraiva-vision-site-v3_nginx_logs:/data -v $BACKUP_DIR:/backup alpine tar xzf /backup/nginx_logs.tar.gz -C /data
2. Copy config files back to project directory
3. Restart containers: docker compose -f docker-compose.prod.yml up -d
EOF

echo "✅ Backup completed successfully!"
echo "📁 Backup location: $BACKUP_DIR"
echo "📊 Backup size: $(du -sh "$BACKUP_DIR" | cut -f1)"