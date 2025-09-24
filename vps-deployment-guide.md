# WordPress Headless CMS VPS Deployment Guide

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] Ubuntu 22.04 LTS VPS with at least 2GB RAM
- [ ] Domain `cms.saraivavision.com.br` pointing to your VPS IP
- [ ] Root or sudo access to the VPS
- [ ] SSH key access configured

## Step 1: Initial VPS Setup

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Copy WordPress setup files to VPS
scp -r vps-wordpress/ user@your-vps-ip:/tmp/

# Move to working directory
sudo mv /tmp/vps-wordpress /opt/wordpress-setup
cd /opt/wordpress-setup

# Make scripts executable
chmod +x *.sh
```

## Step 2: Run VPS Setup Script

```bash
# Install Docker, configure firewall, etc.
sudo ./setup-vps.sh

# Log out and back in for Docker group membership
exit
ssh user@your-vps-ip
```

## Step 3: Configure Environment

```bash
cd /opt/wordpress-setup

# Create environment file
cp .env.example .env

# Edit configuration (passwords will be auto-generated if not set)
nano .env
```

Required configuration:
```bash
# Domain Configuration
DOMAIN=cms.saraivavision.com.br
EMAIL=admin@saraivavision.com.br

# SSL Configuration
LETSENCRYPT_EMAIL=admin@saraivavision.com.br

# Database passwords (will be auto-generated if not set)
MYSQL_PASSWORD=your_secure_mysql_password_here
MYSQL_ROOT_PASSWORD=your_secure_root_password_here

# JWT secret (will be auto-generated if not set)
JWT_SECRET_KEY=your_jwt_secret_key_for_graphql_auth
```

## Step 4: Deploy WordPress

```bash
# Run complete deployment
./deploy.sh

# This will:
# - Generate secure passwords
# - Start Docker containers
# - Configure SSL certificates
# - Install WordPress plugins
# - Set up monitoring and backups
```

## Step 5: Complete WordPress Setup

1. Visit `https://cms.saraivavision.com.br`
2. Complete WordPress installation:
   - Language: Portuguese (Brazil)
   - Site Title: "Saraiva Vision CMS"
   - Admin Username: Choose secure username
   - Admin Password: Use strong password
   - Admin Email: `admin@saraivavision.com.br`

3. Configure permalinks:
   - Go to Settings → Permalinks
   - Select "Post name" structure
   - Save changes

## Step 6: Verify GraphQL Setup

Test the GraphQL endpoint:

```bash
# Test GraphQL endpoint
curl -X POST https://cms.saraivavision.com.br/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { generalSettings { title url } }"
  }'
```

Expected response:
```json
{
  "data": {
    "generalSettings": {
      "title": "Saraiva Vision CMS",
      "url": "https://cms.saraivavision.com.br"
    }
  }
}
```

## Step 7: Configure Vercel Environment

Add these environment variables to your Vercel project:

```bash
# WordPress Integration
WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql
WORDPRESS_DOMAIN=https://cms.saraivavision.com.br
WP_REVALIDATE_SECRET=generate_secure_random_string
WP_WEBHOOK_SECRET=generate_secure_random_string

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 8: Set Up WordPress Webhooks

1. Install "WP Webhooks" plugin in WordPress admin
2. Configure webhook URL: `https://saraivavision.com.br/api/wordpress-webhook`
3. Set webhook secret (use WP_WEBHOOK_SECRET from Vercel)
4. Enable webhooks for:
   - Post publish/update
   - Page publish/update
   - Custom post type updates

## Step 9: Test Integration

Test the complete integration:

```bash
# Test WordPress to Next.js integration
curl -X POST https://saraivavision.com.br/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_revalidate_secret",
    "path": "/"
  }'
```

## Management Commands

```bash
# Check service status
cd /opt/wordpress-cms && ./deploy.sh health

# View live logs
./deploy.sh logs

# Restart services
./deploy.sh restart

# Create manual backup
./deploy.sh backup

# Check SSL certificate
openssl x509 -in /etc/letsencrypt/live/cms.saraivavision.com.br/fullchain.pem -text -noout
```

## Troubleshooting

### Common Issues

1. **Domain not resolving**
   ```bash
   # Check DNS propagation
   nslookup cms.saraivavision.com.br
   
   # Verify A record points to VPS IP
   dig cms.saraivavision.com.br A
   ```

2. **SSL certificate issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Manual renewal
   sudo certbot renew --force-renewal
   ```

3. **WordPress not accessible**
   ```bash
   # Check container status
   docker-compose ps
   
   # Check logs
   docker-compose logs wordpress
   docker-compose logs nginx
   ```

4. **GraphQL not working**
   ```bash
   # Check plugin status
   docker-compose exec wordpress wp plugin list --allow-root
   
   # Reactivate GraphQL plugins
   docker-compose exec wordpress wp plugin activate wp-graphql --allow-root
   ```

## Security Considerations

- [ ] Change default WordPress admin username
- [ ] Use strong passwords for all accounts
- [ ] Keep WordPress and plugins updated
- [ ] Monitor access logs regularly
- [ ] Set up fail2ban for brute force protection
- [ ] Regular security audits

## Backup and Recovery

- Automated daily backups at 2:00 AM
- Backups stored in `/opt/backups/wordpress/`
- Retention: 7 days
- Manual backup: `./deploy.sh backup`

## Monitoring

- Health checks every 5 minutes
- Logs in `/var/log/wordpress/`
- Email alerts for critical issues
- SSL certificate auto-renewal

---

**Next Steps After VPS Deployment:**
1. Complete WordPress setup and content creation
2. Test GraphQL API endpoints
3. Configure Vercel environment variables
4. Set up WordPress webhooks
5. Test end-to-end integration