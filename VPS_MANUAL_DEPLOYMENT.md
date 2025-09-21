# VPS Backend Deployment Instructions

## Manual Deployment Steps

Since SSH access requires authentication, here are the manual steps to deploy the backend:

### 1. Connect to VPS
```bash
ssh root@31.97.129.78
# You'll need to authenticate with password or SSH key
```

### 2. Create Backend Directory
```bash
mkdir -p /var/www/saraiva-vision-backend
cd /var/www/saraiva-vision-backend
```

### 3. Copy Files to VPS
Copy these files to the VPS:
- `vps-backend-setup.sh` - Setup script
- `vps-servicos-endpoint.js` - API endpoint
- `vps-nginx-config-updated.conf` - Nginx configuration
- `docker-compose.yml` - Docker configuration

### 4. Run Setup
```bash
chmod +x vps-backend-setup.sh
./vps-backend-setup.sh
```

### 5. Configure Environment
```bash
cp .env.example .env
nano .env
```

### 6. Start Services
```bash
./start-backend.sh
```

## Testing the API

### Test Connection
```bash
./test-backend-connection.js
```

### Manual API Test
```bash
curl http://31.97.129.78:3001/api/servicos
curl http://31.97.129.78:3001/health
```

## Environment Variables Template

Create `.env` file with:
```env
# Database
MYSQL_ROOT_PASSWORD=your_secure_password
WORDPRESS_DB_PASSWORD=your_wp_password
REDIS_PASSWORD=your_redis_password

# API
NODE_ENV=production
PORT=3001
JWT_SECRET=your_jwt_secret

# Email
RESEND_API_KEY=your_resend_key
DOCTOR_EMAIL=philipe_cruz@outlook.com

# WordPress
WORDPRESS_URL=https://saraivavision.com.br

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=5
```

## Security Notes

1. Change all default passwords
2. Configure SSL certificates
3. Set up firewall rules
4. Configure domain DNS
5. Update CORS origins for production