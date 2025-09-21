# VPS Backend Deployment Package

## Files to Deploy to VPS

### Required Files
1. **vps-servicos-endpoint.js** - Complete /api/servicos implementation
2. **vps-nginx-config-updated.conf** - Updated Nginx config with CORS
3. **docker-compose.yml** - Docker configuration (if not exists)
4. **vps-backend-setup.sh** - Setup automation script

### Manual Deployment Steps

#### Step 1: Connect to VPS
```bash
ssh root@31.97.129.78
```

#### Step 2: Create Directory Structure
```bash
mkdir -p /var/www/saraiva-vision-backend/api/src/routes
cd /var/www/saraiva-vision-backend
```

#### Step 3: Copy Files
On your local machine, copy these files:
```bash
scp vps-servicos-endpoint.js root@31.97.129.78:/var/www/saraiva-vision-backend/api/src/routes/servicos.js
scp vps-nginx-config-updated.conf root@31.97.129.78:/var/www/saraiva-vision-backend/nginx/conf.d/saraiva-vision.conf
```

#### Step 4: Update API Server
Add the services endpoint to the main API server:
```javascript
// In /var/www/saraiva-vision-backend/api/src/server.js
const servicosRoutes = require('./routes/servicos');
app.use('/api/servicos', servicosRoutes);
```

#### Step 5: Restart Services
```bash
docker-compose restart api
docker-compose restart nginx
```

## Verification

### Test the Services Endpoint
```bash
curl http://31.97.129.78:3001/api/servicos
curl http://31.97.129.78:3001/api/servicos/consultas-oftalmologicas
```

### Test CORS
```bash
curl -H "Origin: https://saraivavision.com.br" -v http://31.97.129.78:3001/api/servicos
```

## Current Status

✅ **Completed:**
- VPS is running and accessible
- Backend API is healthy and responding
- `/api/health` endpoint working
- Network connectivity established

🔄 **Pending:**
- Deploy `/api/servicos` endpoint to VPS
- Update CORS configuration for Vercel domains
- Configure HTTPS for production
- Test frontend-backend integration
- Deploy and test on Vercel

## Next Steps

1. **Manual Deployment:** Follow the steps above to deploy the services endpoint
2. **Local Testing:** Use the provided test scripts to verify functionality
3. **CORS Configuration:** Ensure Vercel domains are whitelisted
4. **HTTPS Setup:** Configure SSL certificates for production
5. **Vercel Testing:** Update frontend to use the new backend endpoint