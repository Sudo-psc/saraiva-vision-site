# Vercel Environment Variables Setup Guide

## Required Environment Variables for Production

### WordPress Integration
```bash
vercel env add WORDPRESS_GRAPHQL_ENDPOINT production
# Value: https://cms.saraivavision.com.br/graphql

vercel env add WORDPRESS_DOMAIN production  
# Value: https://cms.saraivavision.com.br

vercel env add WP_REVALIDATE_SECRET production
# Value: [Generate a secure random string]

vercel env add WP_WEBHOOK_SECRET production
# Value: [Generate a secure random string]
```

### Database Configuration
```bash
vercel env add SUPABASE_URL production
# Value: https://your-project.supabase.co

vercel env add SUPABASE_ANON_KEY production
# Value: [Your Supabase anonymous key]

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Value: [Your Supabase service role key]
```

### Email & SMS Services
```bash
vercel env add RESEND_API_KEY production
# Value: [Your Resend API key]

vercel env add DOCTOR_EMAIL production
# Value: philipe_cruz@outlook.com

vercel env add CONTACT_EMAIL_FROM production
# Value: contato@saraivavision.com.br

vercel env add ZENVIA_API_TOKEN production
# Value: [Your Zenvia API token]

vercel env add ZENVIA_FROM_NUMBER production
# Value: +5511999999999
```

### External Services
```bash
vercel env add SPOTIFY_RSS_URL production
# Value: [Your Spotify podcast RSS URL]

vercel env add OPENAI_API_KEY production
# Value: [Your OpenAI API key]
```

### Analytics
```bash
vercel env add POSTHOG_KEY production
# Value: [Your PostHog public key]

vercel env add POSTHOG_API_KEY production
# Value: [Your PostHog API key] (optional)

vercel env add POSTHOG_PROJECT_ID production
# Value: [Your PostHog project ID] (optional)
```

### System Configuration
```bash
vercel env add NODE_ENV production
# Value: production

vercel env add TIMEZONE production
# Value: America/Sao_Paulo

vercel env add NEXT_PUBLIC_SITE_URL production
# Value: https://saraivavision.com.br

vercel env add RATE_LIMIT_WINDOW production
# Value: 15

vercel env add RATE_LIMIT_MAX production
# Value: 5
```

## Preview Environment Setup

For preview deployments, copy the same variables but with preview-specific values:

```bash
# Copy production variables to preview
vercel env ls production | grep -E "^[A-Z_]+" | while read var; do
  vercel env add "$var" preview
done
```

## Security Best Practices

1. **Never commit sensitive values** to version control
2. **Use different API keys** for production and preview environments
3. **Regularly rotate** API keys and secrets
4. **Monitor usage** of API keys for unusual activity
5. **Use least privilege** principle for service accounts

## Validation

Run the validation script to check your configuration:

```bash
node scripts/vercel-env-config.js --validate
```
