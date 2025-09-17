# Deployment Guide - Saraiva Vision

## Overview

The site now uses a **zero-downtime deployment system** with proper version management to prevent conflicts between multiple versions.

## Architecture

- **Production URL**: https://saraivavision.com.br (ports 80/443)
- **Local Testing**: http://localhost:8082
- **WordPress Backend**: http://localhost:8083 (internal only)
- **Deployment Structure**: `/var/www/saraivavision/`
  - `current/` → symlink to latest release
  - `releases/YYYYMMDD_HHMMSS/` → versioned releases

## Quick Commands

### Deploy New Version
```bash
sudo /home/saraiva-vision-site-v3/scripts/deploy.sh deploy
```

### Check Deployment Status
```bash
/home/saraiva-vision-site-v3/scripts/deploy.sh status
```

### Rollback to Previous Version
```bash
sudo /home/saraiva-vision-site-v3/scripts/deploy.sh rollback
```

### Site Configuration Management
```bash
# Check site configuration status
sudo /home/saraiva-vision-site-v3/scripts/site-manager.sh status

# Fix configuration conflicts
sudo /home/saraiva-vision-site-v3/scripts/site-manager.sh fix
```

## Deployment Process

The deployment script automatically:

1. **Builds** the project (`npm ci && npm run build`)
2. **Creates** a timestamped release directory
3. **Copies** build output to the new release
4. **Atomically switches** the `current` symlink
5. **Validates** the deployment
6. **Reloads** nginx
7. **Cleans up** old releases (keeps last 5)

## Directory Structure

```
/var/www/saraivavision/
├── current -> releases/20250909_220657/
├── releases/
│   ├── 20250909_220657/
│   ├── 20250909_210845/
│   └── 20250909_195623/
└── (older releases automatically cleaned)
```

## Configuration Files

- **Nginx Config**: `/etc/nginx/sites-available/saraivavision-production`
- **Active Sites**: `/etc/nginx/sites-enabled/`
- **Logs**: 
  - Deploy: `/var/log/deploy-saraivavision.log`
  - Site Manager: `/var/log/site-manager.log`

## Conflict Resolution

The system prevents conflicts by:

1. **Single Active Config**: Only `saraivavision-production` serves the domain
2. **Disabled Old Configs**: Old `saraivavisao` config is disabled
3. **Version Management**: Proper release directory structure
4. **Atomic Deployments**: Zero-downtime symlink switching
5. **Validation**: Pre and post-deployment checks

## Troubleshooting

### Site Not Loading
```bash
# Check nginx status
sudo systemctl status nginx

# Check site configuration
sudo /home/saraiva-vision-site-v3/scripts/site-manager.sh validate

# Fix issues automatically
sudo /home/saraiva-vision-site-v3/scripts/site-manager.sh fix
```

### Rollback Failed Deployment
```bash
# Rollback to previous version
sudo /home/saraiva-vision-site-v3/scripts/deploy.sh rollback

# Check what went wrong
sudo /home/saraiva-vision-site-v3/scripts/deploy.sh health
```

### Check Deployment History
```bash
# Show deployment status and history
/home/saraiva-vision-site-v3/scripts/deploy.sh status

# List all releases
ls -la /var/www/saraivavision/releases/
```

## Security Notes

- All deployments run with proper file permissions (`www-data:www-data`)
- WordPress backend is restricted to localhost only
- Rate limiting is enforced on API endpoints
- Security headers are applied to all responses
- SSL/TLS is properly configured with modern protocols

## Maintenance

### Regular Tasks
- **Deployments**: Automated cleanup keeps last 5 releases
- **Logs**: Monitor `/var/log/deploy-saraivavision.log` for issues
- **SSL Certificates**: Auto-renewed by certbot
- **Updates**: Run deployment script after code changes

### Backup Strategy
- **Configurations**: Auto-backed up before changes
- **Releases**: Last 5 releases kept automatically
- **Database**: WordPress backup handled separately

## Performance Features

- **Gzip Compression**: Enabled for text assets
- **Static Asset Caching**: 1-year cache for immutable assets  
- **CDN-Ready**: Proper cache headers for external CDNs
- **HTTP/2**: Enabled for better performance
- **Security Headers**: CSP, HSTS, and other security headers applied