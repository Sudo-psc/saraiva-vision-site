# Vercel Deployment Configuration Guide

This guide covers the complete setup for deploying Saraiva Vision's backend system to Vercel with proper environment variables, cron jobs, and performance optimization.

## Prerequisites

1. **Vercel CLI installed**: `npm i -g vercel`
2. **Vercel account** with appropriate permissions
3. **Domain configured** in Vercel dashboard
4. **External services** configured (Supabase, Resend, Zenvia, etc.)

## Environment Variables Setup

### Production Environment

Configure these environment variables in the Vercel dashboard under Settings > Environment Variables:

#### WordPress Integration
```bash
WORDPRESS_GRAPHQL_ENDPOINT=https://cms.saraivavision.com.br/graphql
WORDPRESS_DOMAIN=https://cms.saraivavision.com.br
WP_REVALIDATE_SECRET=your_secure_revalidate_token_here
WP_WEBHOOK_SECRET=your_secure_webhook_token_here
```

#### Database Configuration
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Email & SMS Services
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
DOCTOR_EMAIL=philipe_cruz@outlook.com
CONTACT_EMAIL_FROM=contato@saraivavision.com.br
ZENVIA_API_TOKEN=your_zenvia_api_token_here
ZENVIA_FROM_NUMBER=+5511999999999
```

#### External Services
```bash
SPOTIFY_RSS_URL=https://anchor.fm/s/your-podcast/podcast/rss
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Analytics
```bash
POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
POSTHOG_API_KEY=phx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
POSTHOG_PROJECT_ID=12345
```

#### System Configuration
```bash
NODE_ENV=production
TIMEZONE=America/Sao_Paulo
NEXT_PUBLIC_SITE_URL=https://saraivavision.com.br
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=5
```

### Preview Environment

For preview deployments, use the same variables but with development/staging values where appropriate.

## Vercel Configuration (vercel.json)

The `vercel.json` file is already configured with:

### Function Configurations
- **Memory allocation**: Optimized per function complexity
- **Timeout settings**: Based on expected execution time
- **Regional deployment**: Optimized for Brazilian users (gru1)

### Cron Jobs
- **Outbox processing**: Every 5 minutes (`*/5 * * * *`)
- **Podcast sync**: Every 30 minutes (`0,30 * * * *`)
- **Appointment reminders**: Every 2 hours (`0 */2 * * *`)
- **Health monitoring**: Every 10 minutes (`*/10 * * * *`)

### Security Headers
- CORS configuration for API endpoints
- Cache control for static assets
- Service Worker configuration

## Deployment Process

### 1. Initial Setup

```bash
# Login to Vercel
vercel login

# Link project (run in project root)
vercel link

# Set up environment variables
node scripts/vercel-env-config.js --generate-template
```

### 2. Environment Variables Configuration

```bash
# Use the generated setup guide
cat docs/VERCEL_ENV_SETUP.md

# Or configure manually
vercel env add WORDPRESS_GRAPHQL_ENDPOINT production
vercel env add SUPABASE_URL production
# ... continue for all required variables
```

### 3. Validate Configuration

```bash
# Validate environment setup
node scripts/vercel-env-config.js --validate

# Validate deployment configuration
node scripts/optimize-serverless-functions.js --validate
```

### 4. Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 5. Test Deployment

```bash
# Test all endpoints
node scripts/test-vercel-deployment.js

# Test specific domain
node scripts/test-vercel-deployment.js --domain your-domain.vercel.app

# Test only critical functions
node scripts/test-vercel-deployment.js --health --performance
```

## Performance Optimization

### Function Configuration

The system uses optimized configurations based on function complexity:

- **Contact API**: 10s timeout, 256MB memory
- **Appointments**: 15s timeout, 512MB memory  
- **Podcast Sync**: 60s timeout, 1024MB memory
- **Chatbot**: 20s timeout, 512MB memory
- **Outbox Processing**: 60s timeout, 1024MB memory

### Cold Start Optimization

1. **Connection Reuse**: Database connections are reused across invocations
2. **Minimal Dependencies**: Only essential packages are imported
3. **Regional Deployment**: Functions deployed in São Paulo (gru1) for low latency
4. **Memory Allocation**: Optimized per function to reduce cold start time

### Monitoring

Use the built-in monitoring endpoints:

- `/api/health` - Basic health check
- `/api/monitoring/health` - Detailed system status
- `/api/dashboard/metrics` - Performance metrics

## Cron Jobs Configuration

### Outbox Processing (`/api/outbox/drain`)
- **Schedule**: Every 5 minutes
- **Purpose**: Process pending email/SMS messages
- **Timeout**: 60 seconds
- **Memory**: 1024MB

### Podcast Synchronization (`/api/podcast/sync`)
- **Schedule**: Every 30 minutes
- **Purpose**: Sync new episodes from Spotify
- **Timeout**: 60 seconds
- **Memory**: 1024MB

### Appointment Reminders (`/api/appointments/reminders`)
- **Schedule**: Every 2 hours
- **Purpose**: Send scheduled appointment reminders
- **Timeout**: 60 seconds
- **Memory**: 1024MB

### Health Monitoring (`/api/monitoring/health`)
- **Schedule**: Every 10 minutes
- **Purpose**: Monitor system health and external services
- **Timeout**: 15 seconds
- **Memory**: 512MB

## Security Configuration

### Environment Variables Security

1. **Never commit secrets** to version control
2. **Use different keys** for production and preview
3. **Rotate keys regularly** (quarterly recommended)
4. **Monitor API usage** for unusual activity

### API Security

1. **Rate Limiting**: Configured per endpoint
2. **CORS Headers**: Restricted to saraivavision.com.br
3. **Input Validation**: All endpoints use Zod schemas
4. **LGPD Compliance**: Data encryption and consent management

## Troubleshooting

### Common Issues

#### Environment Variables Not Loading
```bash
# Check if variables are set
vercel env ls production

# Pull environment variables locally
vercel env pull .env.local
```

#### Function Timeouts
```bash
# Check function logs
vercel logs --follow

# Increase timeout in vercel.json if needed
```

#### Cold Start Performance
```bash
# Analyze function performance
node scripts/optimize-serverless-functions.js --analyze

# Test performance
node scripts/test-vercel-deployment.js --performance
```

### Debugging Commands

```bash
# View deployment logs
vercel logs

# Check function status
vercel ls

# Test specific function
curl -X POST https://your-domain.vercel.app/api/health

# Monitor cron jobs
vercel logs --follow | grep "cron"
```

## Maintenance

### Regular Tasks

1. **Monitor Performance**: Weekly review of function metrics
2. **Update Dependencies**: Monthly security updates
3. **Rotate Secrets**: Quarterly key rotation
4. **Review Logs**: Daily error log review
5. **Test Deployments**: Automated testing on each deployment

### Performance Monitoring

Use the provided scripts for ongoing monitoring:

```bash
# Weekly performance analysis
node scripts/optimize-serverless-functions.js --analyze

# Daily health checks
node scripts/test-vercel-deployment.js --health

# Load testing (before major releases)
./scripts/load-test-functions.sh
```

## Support

For deployment issues:

1. Check the [Vercel documentation](https://vercel.com/docs)
2. Review function logs: `vercel logs`
3. Test locally: `vercel dev`
4. Validate configuration: `node scripts/vercel-env-config.js --validate`

## Rollback Procedure

If deployment issues occur:

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or promote a specific preview
vercel promote [preview-url]
```