# Quickstart Guide: Backend Integration Strategy

## Prerequisites

### System Requirements
- Node.js 18+
- TypeScript 5.x
- Supabase account and project
- Vercel account for deployment
- Git for version control

### Environment Setup
```bash
# Clone repository
git clone https://github.com/Sudo-psc/saraivavision-site-v2.git
cd saraivavision-site-v2

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

### Required API Keys
Before starting, obtain these API keys:

1. **Supabase**
   - Project URL and anon key from dashboard
   - Service role key (for admin operations)

2. **Resend API**
   - API key from resend.com dashboard
   - Verify domain for email sending

3. **Spotify Web API**
   - Client ID and Client Secret from Spotify Dashboard
   - Register app at developer.spotify.com

4. **WhatsApp Business API**
   - Business Solution Provider (BSP) account
   - Webhook URL and verify token
   - Phone number ID and access token

## Environment Configuration

### .env.local
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend Email API
RESEND_API_KEY=re_your-api-key
FROM_EMAIL=contato@saraivavision.com.br

# Spotify API
SPOTIFY_CLIENT_ID=your-client-id
SPOTIFY_CLIENT_SECRET=your-client-secret
PODCAST_SHOW_ID=your-show-id

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-verify-token
WHATSAPP_WEBHOOK_SECRET=your-webhook-secret

# Security
JWT_SECRET=your-jwt-secret
WEBHOOK_SECRET=your-webhook-secret
```

## Database Setup

### 1. Initialize Supabase Schema
```bash
# Apply migrations
npx supabase db reset
npx supabase db push

# Or manually apply schema from data-model.md
```

### 2. Create Required Tables
Execute the SQL from `data-model.md` in your Supabase SQL editor:

```sql
-- Run each CREATE TABLE statement
-- Set up Row Level Security policies
-- Create indexes for performance
```

### 3. Seed Initial Data
```bash
# Run seed script
npm run db:seed

# Or manually insert test data
```

## API Development

### 1. Start Development Server
```bash
# Start frontend and API
npm run dev

# Server runs at http://localhost:3000
# API available at http://localhost:3000/api
```

### 2. Test API Endpoints

#### Contact Form API
```bash
# Test contact submission
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message for contact form"
  }'
```

#### Podcast API
```bash
# Test podcast episodes
curl http://localhost:3000/api/podcast/shows

# Test specific show episodes
curl http://localhost:3000/api/podcast/shows/{show-id}/episodes
```

#### WhatsApp Webhook (Development)
```bash
# Use ngrok for local webhook testing
npx ngrok http 3000

# Configure webhook URL in BSP dashboard:
# https://your-ngrok-url.ngrok.io/api/whatsapp/webhook
```

## Integration Testing

### 1. Contact Form Integration Test
```bash
# Create test file: tests/integration/contact.test.js
npm test -- tests/integration/contact.test.js
```

### 2. Spotify Integration Test
```bash
# Test Spotify API connection
npm run test:spotify

# Manual sync test
curl -X POST http://localhost:3000/api/podcast/sync \
  -H "Authorization: Bearer your-jwt-token"
```

### 3. Email Integration Test
```bash
# Test Resend API
npm run test:email

# Send test email
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

## Deployment

### 1. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
vercel env add SUPABASE_URL
vercel env add RESEND_API_KEY
# ... add all other environment variables
```

### 2. Configure Webhooks
After deployment, update webhook URLs:

1. **WhatsApp Business API**
   - Webhook URL: `https://your-domain.vercel.app/api/whatsapp/webhook`
   - Verify token from environment variables

2. **Supabase Webhooks** (if using)
   - Configure database triggers for real-time updates

### 3. DNS Configuration
```bash
# Configure custom domain in Vercel
# Set up SSL certificates
# Update DNS records to point to Vercel
```

## Feature Verification

### 1. Contact Form Workflow
1. Visit website contact page
2. Fill out form with test data
3. Verify email received via Resend
4. Check database for stored submission
5. Test admin dashboard access

### 2. Podcast Synchronization
1. Trigger manual sync from admin dashboard
2. Verify episodes appear on website
3. Check Spotify metadata accuracy
4. Test featured episode functionality

### 3. WhatsApp Integration
1. Send test message to WhatsApp number
2. Verify webhook receives message
3. Test automated response
4. Check conversation appears in dashboard

### 4. Dashboard Functionality
1. Login to admin dashboard
2. View system metrics
3. Manage contact submissions
4. Update podcast content
5. Monitor WhatsApp conversations

## Common Issues & Solutions

### API Connection Issues
```bash
# Check environment variables
echo $SUPABASE_URL
echo $RESEND_API_KEY

# Verify API endpoints
curl -I http://localhost:3000/api/health
```

### Database Connection Issues
```bash
# Test Supabase connection
npx supabase db ping

# Check database status
npx supabase status
```

### Spotify API Issues
```bash
# Test API credentials
curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=$SPOTIFY_CLIENT_ID&client_secret=$SPOTIFY_CLIENT_SECRET"
```

### WhatsApp Webhook Issues
```bash
# Verify webhook endpoint
curl -X GET "https://your-domain.vercel.app/api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=test&hub.verify_token=$WHATSAPP_WEBHOOK_VERIFY_TOKEN"

# Should return the challenge value
```

## Performance Optimization

### 1. Database Optimization
- Enable connection pooling
- Add proper indexes
- Configure query optimization

### 2. API Optimization
- Implement response caching
- Add rate limiting
- Configure CORS properly

### 3. Frontend Optimization
- Enable ISR for static content
- Optimize image loading
- Configure service worker

## Monitoring & Maintenance

### 1. Health Checks
```bash
# API health endpoint
curl http://localhost:3000/api/health

# Database health
curl http://localhost:3000/api/health/database

# External services health
curl http://localhost:3000/api/health/external
```

### 2. Log Monitoring
- Configure structured logging
- Set up error tracking (Sentry)
- Monitor API response times

### 3. Regular Maintenance
- Database backups
- API key rotation
- Security updates
- Performance reviews

## Next Steps

1. **Security Hardening**
   - Implement rate limiting
   - Add input validation
   - Configure CORS policies
   - Set up monitoring

2. **Feature Enhancement**
   - Add user authentication
   - Implement role-based access
   - Create advanced analytics
   - Build mobile app

3. **Scale Preparation**
   - Configure CDN
   - Implement caching strategies
   - Plan database scaling
   - Set up monitoring alerts

## Support & Documentation

- **Technical Documentation**: `/docs/api/`
- **Database Schema**: `data-model.md`
- **API Contracts**: `/contracts/`
- **Issue Tracking**: GitHub Issues
- **Contact**: tech@saraivavision.com.br