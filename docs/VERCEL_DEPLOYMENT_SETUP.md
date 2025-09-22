# Vercel Deployment Setup Guide

This guide provides step-by-step instructions for deploying the Saraiva Vision website with Resend contact form integration to Vercel.

## Prerequisites

1. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```

2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

3. **Resend Account**: Sign up at [resend.com](https://resend.com) and get API key

## Quick Setup

### 1. Login and Link Project

```bash
# Login to Vercel
vercel login

# Link your project to Vercel
vercel link
```

### 2. Environment Variables Setup

#### Option A: Automated Setup (Recommended)
```bash
# Run the automated setup script
node scripts/vercel-env-setup.js
```

#### Option B: Manual Setup
Set each environment variable manually using Vercel CLI:

```bash
# Production Environment
vercel env add NODE_ENV production
vercel env add VITE_API_URL production
vercel env add RESEND_API_KEY production
vercel env add DOCTOR_EMAIL production
# ... (continue for all variables)

# Preview Environment  
vercel env add NODE_ENV preview
# ... (repeat for preview)

# Development Environment
vercel env add NODE_ENV development
# ... (repeat for development)
```

### 3. Required Environment Variables

#### Non-Sensitive Variables (Auto-configured)
- `NODE_ENV`: Environment identifier
- `VITE_API_URL`: API base URL for frontend
- `VITE_WORDPRESS_URL`: WordPress integration URL
- `CONTACT_EMAIL_FROM`: From address for contact emails
- `RATE_LIMIT_WINDOW`: Rate limiting time window (minutes)
- `RATE_LIMIT_MAX`: Maximum requests per window

#### Sensitive Variables (Manual Setup Required)
- `RESEND_API_KEY`: Your Resend API key
- `DOCTOR_EMAIL`: Dr. Philipe's email address
- `RECAPTCHA_SECRET_KEY`: reCAPTCHA secret (if using)

### 4. Set Sensitive Variables

# Set Resend API Key (get from https://resend.com/api-keys)
vercel env add RESEND_API_KEY production preview development
# Paste your key when securely prompted

# Set Doctor Email
vercel env add DOCTOR_EMAIL production preview development
# Enter email when prompted

# Set reCAPTCHA Secret (if using)
vercel env add RECAPTCHA_SECRET_KEY production preview development
# Paste secret when securely prompted

## Environment-Specific Configuration

### Production Environment
- **Domain**: `saraivavision.com.br`
- **API URL**: `https://saraivavision.com.br/api`
- **Rate Limiting**: Strict (5 requests per 15 minutes)
- **Email**: Production email addresses

### Preview Environment
- **Domain**: Auto-generated Vercel preview URL
- **API URL**: Preview deployment API endpoint
- **Rate Limiting**: Moderate (10 requests per 10 minutes)
- **Email**: Test email addresses for safe testing

### Development Environment
- **Domain**: `localhost:3000` (local development)
- **API URL**: `http://localhost:3000/api`
- **Rate Limiting**: Lenient (20 requests per 5 minutes)
- **Email**: Development/test email addresses

## Deployment Commands

### Production Deployment
```bash
# Deploy to production
vercel --prod

# Deploy with specific environment
vercel --prod --env NODE_ENV=production
```

### Preview Deployment
```bash
# Deploy preview (automatic on PR)
vercel

# Deploy specific branch as preview
vercel --target preview
```

### Local Development
```bash
# Run Vercel development server
vercel dev

# Run with specific port
vercel dev --listen 3000
```

## Verification Steps

### 1. Check Environment Variables
```bash
# List all environment variables
vercel env ls

# Check specific environment
vercel env ls --environment production
```

### 2. Test API Endpoints
```bash
# Test contact API health
curl https://your-domain.vercel.app/api/contact/health

# Test contact form submission (replace with actual data)
curl -X POST https://your-domain.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"11999999999","message":"Test message","consent":true}'
```

### 3. Monitor Deployment
```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

## Security Best Practices

### Environment Variables
- ✅ Use Vercel's encrypted environment variable storage
- ✅ Never commit sensitive keys to version control
- ✅ Use different keys for different environments
- ✅ Rotate API keys regularly

### API Security
- ✅ Rate limiting implemented
- ✅ Input validation and sanitization
- ✅ CORS headers configured
- ✅ Error handling without information leakage

### Email Security
- ✅ Template injection prevention
- ✅ LGPD compliance measures
- ✅ PII protection in logs
- ✅ Secure email delivery via Resend

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
```bash
# Check if variables are set correctly
vercel env ls

# Redeploy to refresh environment
vercel --prod --force
```

#### 2. API Endpoint 404 Errors
- Verify `vercel.json` configuration
- Check function file paths
- Ensure proper export in API files

#### 3. Email Delivery Failures
- Verify Resend API key is valid
- Check doctor email address format
- Review Resend dashboard for delivery status

#### 4. Rate Limiting Issues
- Adjust `RATE_LIMIT_WINDOW` and `RATE_LIMIT_MAX`
- Check IP-based rate limiting logic
- Monitor function logs for rate limit hits

### Debug Commands
```bash
# View detailed logs
vercel logs --follow --output raw

# Check function performance
vercel inspect

# Test local development
vercel dev --debug
```

## Performance Optimization

### Function Configuration
- **Memory**: 256MB for contact API (sufficient for email processing)
- **Timeout**: 10 seconds (allows for email delivery + retries)
- **Region**: `gru1` (São Paulo) for Brazilian users

### Cold Start Optimization
- Minimal dependencies in serverless functions
- Efficient import statements
- Connection pooling where applicable

### Monitoring
- Use Vercel Analytics for performance insights
- Monitor function execution time
- Track error rates and success metrics

## Support

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Resend Documentation](https://resend.com/docs)
- [Project README](../README.md)

### Contact
For deployment issues or questions, refer to the project documentation or contact the development team.

---

**Last Updated**: December 2024  
**Version**: 1.0.0