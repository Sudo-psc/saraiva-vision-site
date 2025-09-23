# WordPress Headless CMS Deployment Checklist

## 📋 Pre-Deployment Checklist

### VPS Requirements
- [ ] Ubuntu 22.04 LTS VPS with minimum 2GB RAM, 20GB storage
- [ ] Root or sudo access configured
- [ ] SSH key authentication set up
- [ ] Domain `cms.saraivavision.com.br` pointing to VPS IP address
- [ ] Firewall configured (ports 22, 80, 443 open)

### DNS Configuration
- [ ] A record: `cms.saraivavision.com.br` → VPS IP address
- [ ] DNS propagation completed (check with `nslookup cms.saraivavision.com.br`)
- [ ] TTL set to reasonable value (300-3600 seconds)

### Local Preparation
- [ ] All files downloaded to VPS
- [ ] Environment variables configured in `.env`
- [ ] Scripts made executable (`chmod +x *.sh`)

## 🚀 Deployment Steps

### Step 1: Initial VPS Setup
```bash
# SSH into VPS
ssh user@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Copy files to VPS (from local machine)
scp -r vps-wordpress/ user@your-vps-ip:/tmp/

# Move to working directory
sudo mv /tmp/vps-wordpress /opt/wordpress-setup
cd /opt/wordpress-setup
```

### Step 2: Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Required Variables:**
- [ ] `DOMAIN=cms.saraivavision.com.br`
- [ ] `EMAIL=admin@saraivavision.com.br`
- [ ] `MYSQL_PASSWORD` (will be auto-generated if not set)
- [ ] `MYSQL_ROOT_PASSWORD` (will be auto-generated if not set)
- [ ] `JWT_SECRET_KEY` (will be auto-generated if not set)

### Step 3: Run Deployment
```bash
# Make scripts executable
chmod +x *.sh

# Run full deployment
./deploy.sh
```

**Deployment Process:**
- [ ] Prerequisites check passed
- [ ] Docker and Docker Compose installed
- [ ] Containers built and started
- [ ] SSL certificates generated
- [ ] WordPress plugins installed
- [ ] Health checks passed

### Step 4: WordPress Setup
- [ ] Visit `https://cms.saraivavision.com.br`
- [ ] Complete WordPress installation wizard
- [ ] Set language to Portuguese (Brazil)
- [ ] Create admin user account
- [ ] Set site title: "Saraiva Vision CMS"
- [ ] Configure permalink structure (Settings → Permalinks → Post name)

### Step 5: Plugin Configuration
- [ ] WPGraphQL activated and configured
- [ ] JWT Authentication working
- [ ] Redis cache enabled and working
- [ ] Advanced Custom Fields configured
- [ ] Custom post types visible in admin

### Step 6: Content Setup
- [ ] Create sample service
- [ ] Create sample team member
- [ ] Create sample testimonial
- [ ] Test content creation and editing

### Step 7: GraphQL Testing
```bash
# Test GraphQL endpoint
curl -X POST https://cms.saraivavision.com.br/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { generalSettings { title url } }"}'
```

- [ ] GraphQL endpoint responding
- [ ] Basic queries working
- [ ] Custom post types accessible via GraphQL
- [ ] JWT authentication functional

## 🔧 Vercel Integration Setup

### Environment Variables
Add to Vercel project:
- [ ] `WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql`
- [ ] `WORDPRESS_DOMAIN=https://cms.saraivavision.com.br`
- [ ] `WP_REVALIDATE_SECRET=generate_secure_random_string`
- [ ] `WP_WEBHOOK_SECRET=generate_secure_random_string`

### Webhook Configuration
- [ ] Install WP Webhooks plugin in WordPress
- [ ] Configure webhook URL: `https://saraivavision.com.br/api/wordpress-webhook`
- [ ] Set webhook secret (use WP_WEBHOOK_SECRET)
- [ ] Enable webhooks for post/page updates
- [ ] Test webhook delivery

### Integration Testing
```bash
# Test revalidation endpoint
curl -X POST https://saraivavision.com.br/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your_revalidate_secret","path":"/"}'
```

- [ ] Revalidation endpoint working
- [ ] Content updates trigger Next.js rebuilds
- [ ] ISR (Incremental Static Regeneration) functional

## 🔒 Security Verification

### SSL/TLS
- [ ] SSL certificate installed and valid
- [ ] HTTPS redirect working
- [ ] Security headers present
- [ ] SSL Labs test score A or A+

### WordPress Security
- [ ] Admin user has strong password
- [ ] File editing disabled
- [ ] XML-RPC disabled
- [ ] Login rate limiting active
- [ ] Security plugins configured

### Server Security
- [ ] Firewall configured correctly
- [ ] SSH key authentication only
- [ ] Regular security updates enabled
- [ ] Fail2ban configured (optional)

## 📊 Performance Verification

### Caching
- [ ] Redis object cache working
- [ ] OPcache enabled and functional
- [ ] Nginx static file caching active
- [ ] Browser caching headers present

### Performance Tests
- [ ] Page load times < 2 seconds
- [ ] GraphQL query response times < 500ms
- [ ] Database queries optimized
- [ ] No memory leaks or excessive resource usage

## 🔍 Monitoring Setup

### Health Checks
- [ ] WordPress health endpoint responding
- [ ] Nginx health endpoint responding
- [ ] Database connectivity verified
- [ ] Redis connectivity verified

### Logging
- [ ] Application logs being written
- [ ] Error logs accessible
- [ ] Log rotation configured
- [ ] Monitoring alerts set up (optional)

### Backup Verification
- [ ] Automated backups running daily
- [ ] Backup files being created
- [ ] Backup restoration tested
- [ ] Backup retention policy configured

## 🧪 Final Testing

### Functionality Tests
- [ ] Create new post in WordPress
- [ ] Verify post appears in GraphQL
- [ ] Test webhook triggers Next.js update
- [ ] Verify content appears on frontend

### Load Testing (Optional)
- [ ] Concurrent user simulation
- [ ] Database performance under load
- [ ] Memory usage monitoring
- [ ] Response time consistency

### Disaster Recovery
- [ ] Backup restoration procedure documented
- [ ] Recovery time objectives defined
- [ ] Emergency contact information available
- [ ] Rollback procedures tested

## 📝 Post-Deployment Tasks

### Documentation
- [ ] Update deployment documentation
- [ ] Document custom configurations
- [ ] Create user guides for content editors
- [ ] Update system architecture diagrams

### Team Training
- [ ] Train content editors on WordPress admin
- [ ] Document GraphQL schema for developers
- [ ] Share monitoring and maintenance procedures
- [ ] Establish support procedures

### Maintenance Schedule
- [ ] Weekly security updates
- [ ] Monthly WordPress core updates
- [ ] Quarterly full system review
- [ ] Annual security audit

## ✅ Sign-off

### Technical Verification
- [ ] **System Administrator**: All systems operational
- [ ] **Developer**: Integration tests passed
- [ ] **Security Officer**: Security requirements met
- [ ] **Project Manager**: Deployment criteria satisfied

### Go-Live Approval
- [ ] **Stakeholder Approval**: Content management ready
- [ ] **Performance Approval**: Response times acceptable
- [ ] **Security Approval**: Security measures in place
- [ ] **Final Go-Live**: System ready for production use

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Verified By**: _______________  
**Go-Live Approved By**: _______________

## 🆘 Emergency Contacts

- **System Administrator**: _______________
- **Lead Developer**: _______________
- **VPS Provider Support**: _______________
- **Domain Registrar Support**: _______________

---

**Note**: Keep this checklist updated and use it for future deployments or system updates.