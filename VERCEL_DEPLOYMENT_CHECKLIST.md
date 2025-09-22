# Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. Environment Variables Configuration
- [ ] **WordPress Integration**
  - [ ] `WORDPRESS_GRAPHQL_ENDPOINT` - Set to `https://cms.saraivavision.com.br/graphql`
  - [ ] `WORDPRESS_DOMAIN` - Set to `https://cms.saraivavision.com.br`
  - [ ] `WP_REVALIDATE_SECRET` - Generate secure random string
  - [ ] `WP_WEBHOOK_SECRET` - Generate secure random string

- [ ] **Database Configuration**
  - [ ] `SUPABASE_URL` - Your Supabase project URL
  - [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

- [ ] **Email & SMS Services**
  - [ ] `RESEND_API_KEY` - Resend API key for email delivery
  - [ ] `DOCTOR_EMAIL` - Set to `philipe_cruz@outlook.com`
  - [ ] `CONTACT_EMAIL_FROM` - Set to `contato@saraivavision.com.br`
  - [ ] `ZENVIA_API_TOKEN` - Zenvia API token for SMS
  - [ ] `ZENVIA_FROM_NUMBER` - Zenvia sender phone number

- [ ] **External Services**
  - [ ] `SPOTIFY_RSS_URL` - Podcast RSS feed URL
  - [ ] `OPENAI_API_KEY` - OpenAI API key for chatbot

- [ ] **Analytics**
  - [ ] `POSTHOG_KEY` - PostHog public key
  - [ ] `POSTHOG_API_KEY` - PostHog API key (optional)
  - [ ] `POSTHOG_PROJECT_ID` - PostHog project ID (optional)

- [ ] **System Configuration**
  - [ ] `NODE_ENV` - Set to `production`
  - [ ] `TIMEZONE` - Set to `America/Sao_Paulo`
  - [ ] `NEXT_PUBLIC_SITE_URL` - Set to `https://saraivavision.com.br`
  - [ ] `RATE_LIMIT_WINDOW` - Set to `15`
  - [ ] `RATE_LIMIT_MAX` - Set to `5`

### 2. Vercel Configuration Validation
- [ ] Run `node scripts/optimize-serverless-functions-fixed.js --validate`
- [ ] Verify all cron jobs are configured:
  - [ ] `/api/outbox/drain` - Every 5 minutes
  - [ ] `/api/podcast/sync` - Every 30 minutes
  - [ ] `/api/appointments/reminders` - Every 2 hours
  - [ ] `/api/monitoring/health` - Every 10 minutes

### 3. Function Configurations
- [ ] **Contact API**: 10s timeout, 256MB memory
- [ ] **Appointments**: 15s timeout, 512MB memory
- [ ] **Podcast Sync**: 60s timeout, 1024MB memory
- [ ] **Chatbot**: 20s timeout, 512MB memory
- [ ] **Outbox Processing**: 60s timeout, 1024MB memory
- [ ] **Appointment Reminders**: 60s timeout, 1024MB memory

## Deployment Process

### 1. Pre-Deployment Validation
```bash
# Validate environment variables
node scripts/vercel-env-config.js --validate

# Validate deployment configuration
node scripts/optimize-serverless-functions-fixed.js --validate

# Generate performance test commands
node scripts/optimize-serverless-functions-fixed.js --performance
```

### 2. Deploy to Preview
```bash
# Deploy to preview environment
vercel

# Test preview deployment
node scripts/test-vercel-deployment.js --domain preview-abc123.vercel.app
```

### 3. Deploy to Production
```bash
# Deploy to production
vercel --prod

# Test production deployment
node scripts/test-vercel-deployment.js --domain saraivavision.com.br
```

## Post-Deployment Testing

### 1. Health Checks
- [ ] `/api/health` - Basic health check (<1s)
- [ ] `/api/ping` - Simple ping endpoint (<0.5s)
- [ ] `/api/monitoring/health` - Detailed system status (<2s)

### 2. Functional Tests
- [ ] `/api/appointments/availability` - Appointment slots (<2s)
- [ ] `/api/podcast/episodes` - Podcast episodes list (<1.5s)
- [ ] `/api/dashboard/metrics` - Dashboard metrics (<3s)
- [ ] `/api/contact` - Contact form submission (<3s)

### 3. Cron Job Tests
- [ ] `/api/outbox/drain` - Message processing (<10s)
- [ ] `/api/podcast/sync` - Podcast synchronization (<15s)
- [ ] `/api/appointments/reminders` - Reminder processing (<10s)

### 4. Performance Tests
```bash
# Run performance tests
./scripts/load-test-functions.sh

# Monitor function logs
vercel logs --follow
```

### 5. Security Validation
- [ ] CORS headers properly configured
- [ ] Rate limiting working correctly
- [ ] Input validation on all endpoints
- [ ] No sensitive data in logs

## Monitoring Setup

### 1. Vercel Dashboard
- [ ] Monitor function invocations
- [ ] Check error rates
- [ ] Review performance metrics
- [ ] Monitor cron job execution

### 2. External Monitoring
- [ ] Set up uptime monitoring for critical endpoints
- [ ] Configure alerting for function failures
- [ ] Monitor database performance
- [ ] Track email/SMS delivery rates

## Rollback Plan

### If Issues Occur:
1. **Immediate Rollback**:
   ```bash
   vercel rollback [previous-deployment-url]
   ```

2. **Investigate Issues**:
   ```bash
   vercel logs
   vercel logs --follow
   ```

3. **Fix and Redeploy**:
   - Fix identified issues
   - Test in preview environment
   - Deploy to production when stable

## Success Criteria

- [ ] All health checks pass (>95% success rate)
- [ ] Function response times within expected limits
- [ ] Cron jobs executing successfully
- [ ] No critical errors in logs
- [ ] Email/SMS delivery working
- [ ] WordPress integration functional
- [ ] Database connections stable

## Documentation

- [ ] Update deployment documentation
- [ ] Document any configuration changes
- [ ] Update monitoring runbooks
- [ ] Share access credentials securely

## Final Verification

Run the complete test suite:
```bash
node scripts/test-vercel-deployment.js
```

Expected results:
- Overall success rate: >90%
- Average response time: <2s
- No critical failures
- All cron jobs operational

---

**Deployment completed by**: ________________  
**Date**: ________________  
**Vercel deployment URL**: ________________  
**Notes**: ________________