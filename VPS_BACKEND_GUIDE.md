# Saraiva Vision VPS Backend Configuration Guide

## Overview

This guide explains how to configure and deploy the Saraiva Vision backend on your VPS at IP **31.97.129.78**.

## Architecture

```
Frontend (Vercel CDN) → Backend API (31.97.129.78:3001) → Database/Services
```

### Components
- **Node.js API Server** (Port 3001) - Main backend logic
- **WordPress CMS** - Content management
- **MySQL Database** - Data persistence
- **Redis Cache** - Performance optimization
- **Nginx Proxy** - Reverse proxy and load balancer
- **phpMyAdmin** - Database management (Port 8080)

## Quick Setup

### 1. Copy Setup Script to VPS
```bash
# On your local machine
scp vps-backend-setup.sh root@31.97.129.78:/root/
```

### 2. SSH into VPS and Run Setup
```bash
ssh root@31.97.129.78
cd /root
chmod +x vps-backend-setup.sh
./vps-backend-setup.sh
```

### 3. Configure Environment
```bash
cd /var/www/saraiva-vision-backend
cp .env.example .env
nano .env
```

**Important: Update these values in `.env`:**
- `MYSQL_ROOT_PASSWORD` - Strong password for MySQL root
- `WORDPRESS_DB_PASSWORD` - WordPress database password
- `REDIS_PASSWORD` - Redis password
- `RESEND_API_KEY` - Your Resend API key
- `JWT_SECRET` - JWT secret key

### 4. Start Backend Services
```bash
./start-backend.sh
```

### 5. Verify Deployment
```bash
./monitor.sh
```

## Service URLs

Once deployed, your services will be available at:

- **Main API**: `https://31.97.129.78:3001/api`
- **Health Check**: `https://31.97.129.78:3001/health`
- **WordPress Admin**: `https://31.97.129.78/wp-admin`
- **phpMyAdmin**: `https://31.97.129.78:8080`

## API Endpoints

### Contact Form
- **POST** `/api/contact` - Submit contact form
- **GET** `/api/contact/health` - Contact service health

### Services
- **GET** `/api/servicos` - Get clinic services
- **GET** `/api/servicos/:id` - Get specific service

### WordPress Integration
- **GET** `/api/wordpress/*` - WordPress REST API proxy

### Health Monitoring
- **GET** `/api/health` - Overall system health
- **GET** `/api/health/database` - Database status
- **GET** `/api/health/redis` - Cache status

## Frontend Configuration

The frontend is already configured to use the VPS backend:

```javascript
// In src/lib/services-api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://31.97.129.78:3001/api';
```

## SSL Configuration (Recommended)

### 1. Install Certbot
```bash
apt-get install certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate
```bash
certbot --nginx -d saraivavision.com.br -d www.saraivavision.com.br -d api.saraivavision.com.br
```

### 3. Update Nginx Configuration
Uncomment the HTTPS server block in `nginx/conf.d/saraiva-vision.conf`

## Database Migration

The system includes MySQL database setup with:
- `saraiva_vision` database for application data
- `wordpress` database for CMS
- Automatic backup scripts in `mysql-backup/`

### Manual Database Access
```bash
# Access MySQL console
docker-compose exec db mysql -u root -p

# Create backup
docker-compose exec db mysqldump -u root -p saraiva_vision > backup.sql

# Restore backup
docker-compose exec -T db mysql -u root -p saraiva_vision < backup.sql
```

## Monitoring and Maintenance

### Check Service Status
```bash
./monitor.sh
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f db
docker-compose logs -f nginx
```

### Restart Services
```bash
docker-compose restart
```

### Update Services
```bash
docker-compose pull
docker-compose up -d
```

## Security Considerations

### Firewall Configuration
```bash
# Allow only necessary ports
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

### Database Security
- Change default passwords
- Use SSL connections
- Regular backups
- Limit database access

### API Security
- Rate limiting enabled
- CORS restrictions
- JWT authentication
- Input validation

## Performance Optimization

### Redis Cache
- Automatically caches API responses
- Configurable TTL settings
- Connection pooling

### Nginx Optimization
- Gzip compression
- Static file caching
- Load balancing ready

### Database Optimization
- Connection pooling
- Query optimization
- Regular maintenance

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Check what's using the port
netstat -tulpn | grep :3001
# Stop conflicting service
systemctl stop nginx
```

**Database Connection Issues**
```bash
# Check database container
docker-compose logs db
# Test connection
docker-compose exec db mysqladmin ping -u root -p
```

**API Not Responding**
```bash
# Check API logs
docker-compose logs api
# Restart API service
docker-compose restart api
```

### Performance Issues
```bash
# Check resource usage
docker stats
# Monitor specific container
docker stats saraiva-vision-api
```

## Backup Strategy

### Automated Backups
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/saraiva-vision-backend/mysql-backup"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup databases
docker-compose exec db mysqldump -u root -p$MYSQL_ROOT_PASSWORD saraiva_vision > $BACKUP_DIR/saraiva_vision_$DATE.sql
docker-compose exec db mysqldump -u root -p$MYSQL_ROOT_PASSWORD wordpress > $BACKUP_DIR/wordpress_$DATE.sql

# Compress backups
gzip $BACKUP_DIR/*.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup.sh
```

### Scheduled Backups
```bash
# Add to crontab
crontab -e
# Add: 0 2 * * * /var/www/saraiva-vision-backend/backup.sh
```

## Scaling Considerations

### Horizontal Scaling
- Add more API containers
- Use Docker Swarm or Kubernetes
- Load balancer configuration

### Vertical Scaling
- Increase server resources
- Optimize database performance
- Add caching layers

## Support

For issues or questions:
1. Check logs with `docker-compose logs`
2. Run health checks with `./monitor.sh`
3. Review this documentation
4. Contact system administrator

---

**Note**: This backend setup provides a complete, production-ready infrastructure for the Saraiva Vision medical clinic website with proper security, monitoring, and scalability features.