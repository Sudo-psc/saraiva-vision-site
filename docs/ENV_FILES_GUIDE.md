# Environment Variables Guide

**Last Updated**: 2025-10-12
**Platform**: Saraiva Vision Medical Platform

## 📋 Overview

This document describes all environment files in the project, their purposes, and how to manage them securely.

## 🗂️ Environment File Structure

```
/home/saraiva-vision-site/
├── .env.example              # Template for all environment variables (COMMIT THIS)
├── .env.production           # Production configuration (DO NOT COMMIT)
├── .env.production.template  # Production template (COMMIT THIS)
├── .env.local                # Local development overrides (DO NOT COMMIT)
├── .env.beta                 # Beta environment configuration (DO NOT COMMIT)
├── .env.webhook              # Webhook secrets (DO NOT COMMIT)
├── .env.webhook.example      # Webhook template (COMMIT THIS)
└── api/
    └── .env                  # Backend API configuration (DO NOT COMMIT)
```

## 📁 File Descriptions

### `.env.example`
**Purpose**: Template showing ALL required environment variables with placeholder values
**When to use**: Reference when setting up new environments
**Git Status**: ✅ COMMITTED (contains NO real secrets)
**Owner**: Development team

**Example**:
```bash
# Resend API Configuration
RESEND_API_KEY=your_resend_api_key_here

# Google Maps Configuration
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### `.env.production`
**Purpose**: Production environment configuration with real secrets
**When to use**: Loaded automatically in production (VPS)
**Git Status**: ❌ GITIGNORED
**Owner**: DevOps/Admin only
**Location**: `/var/www/saraivavision/current/.env.production`

**Security Requirements**:
- ✅ File permissions: `chmod 600 .env.production`
- ✅ Owner: `www-data:www-data` (Nginx user)
- ✅ Never expose in logs or error messages
- ✅ Rotate secrets every 90 days

### `.env.production.template`
**Purpose**: Template for production setup (no real values)
**When to use**: Reference when deploying to new production environment
**Git Status**: ✅ COMMITTED
**Owner**: Development team

### `.env.local`
**Purpose**: Local development overrides (developer-specific)
**When to use**: Override default values for local testing
**Git Status**: ❌ GITIGNORED
**Owner**: Individual developers

**Example**:
```bash
# Override API URL for local backend
VITE_API_URL=http://localhost:3001/api

# Use local database
DATABASE_URL=postgresql://localhost:5432/saraiva_dev
```

### `.env.beta`
**Purpose**: Beta/staging environment configuration
**When to use**: Loaded in beta environment for pre-production testing
**Git Status**: ❌ GITIGNORED
**Owner**: QA/Testing team

### `.env.webhook`
**Purpose**: Webhook secrets for GitHub, payment providers, etc.
**When to use**: Loaded by webhook receiver service
**Git Status**: ❌ GITIGNORED
**Owner**: DevOps/Admin only

**Security Requirements**:
- ✅ HMAC signatures for webhook validation
- ✅ Rotate secrets after any security incident
- ✅ Use different secrets per environment

### `.env.webhook.example`
**Purpose**: Template for webhook configuration
**When to use**: Reference when setting up webhooks
**Git Status**: ✅ COMMITTED
**Owner**: Development team

### `api/.env`
**Purpose**: Backend API specific configuration
**When to use**: Loaded by Express server (port 3001)
**Git Status**: ❌ GITIGNORED
**Owner**: Backend developers

## 🔐 Security Best Practices

### 1. Secret Management
```bash
# ✅ GOOD: Use environment variables
const apiKey = process.env.RESEND_API_KEY;

# ❌ BAD: Hardcode secrets
const apiKey = "re_abc123...";
```

### 2. File Permissions (Production)
```bash
# Set restrictive permissions
chmod 600 .env.production
chown www-data:www-data .env.production

# Verify permissions
ls -la .env.production
# Should show: -rw------- 1 www-data www-data
```

### 3. Git Configuration
Verify `.gitignore` contains:
```
# Environment files with secrets
.env.local
.env.production
.env.beta
.env.webhook
api/.env

# Keep templates
!.env.example
!.env.production.template
!.env.webhook.example
```

### 4. Secret Rotation Schedule
| Secret Type | Rotation Frequency | Owner |
|-------------|-------------------|-------|
| API Keys | Every 90 days | DevOps |
| Webhook Secrets | Every 180 days | DevOps |
| Database Passwords | Every 60 days | DBA |
| Encryption Keys | Every 365 days | Security |

## 🔄 Environment Loading Order

### Frontend (Vite)
```
1. .env.production (if NODE_ENV=production)
2. .env.local (developer overrides)
3. .env (default values)
```

### Backend (Express)
```
1. api/.env (API-specific config)
2. .env.production (if NODE_ENV=production)
3. Process environment variables
```

## 📝 Required Variables by Service

### Frontend (Vite) - `VITE_*` prefix
```bash
# Google Services
VITE_GOOGLE_MAPS_API_KEY=        # Google Maps API
VITE_GOOGLE_PLACES_API_KEY=      # Google Places API
VITE_GOOGLE_PLACE_ID=            # Clinic Place ID

# Analytics
VITE_GA_ID=                      # Google Analytics 4
VITE_GTM_ID=                     # Google Tag Manager
VITE_POSTHOG_KEY=                # PostHog analytics

# Supabase
VITE_SUPABASE_URL=               # Supabase project URL
VITE_SUPABASE_ANON_KEY=          # Supabase anonymous key

# Application
VITE_BASE_URL=                   # Production URL
```

### Backend (API)
```bash
# Email Service
RESEND_API_KEY=                  # Resend email service
DOCTOR_EMAIL=                    # Recipient email
CONTACT_EMAIL_FROM=              # Sender email

# Database (if using)
DATABASE_URL=                    # PostgreSQL connection string

# Security
WEBHOOK_SECRET=                  # Webhook HMAC secret
APPOINTMENT_WEBHOOK_SECRET=      # Appointment webhook secret

# Environment
NODE_ENV=production              # Environment mode
PORT=3001                        # API server port
```

## 🚀 Setup Instructions

### New Developer Setup
```bash
# 1. Copy example files
cp .env.example .env.local
cp api/.env.example api/.env

# 2. Request secrets from team lead
# Get: RESEND_API_KEY, GOOGLE_MAPS_API_KEY, etc.

# 3. Update .env.local with real values
nano .env.local

# 4. Verify configuration
npm run dev:vite    # Should start without errors
```

### Production Deployment
```bash
# 1. SSH to production server
ssh user@31.97.129.78

# 2. Navigate to deployment directory
cd /var/www/saraivavision/current

# 3. Create .env.production from template
cp .env.production.template .env.production

# 4. Add real production secrets
sudo nano .env.production

# 5. Set secure permissions
sudo chmod 600 .env.production
sudo chown www-data:www-data .env.production

# 6. Verify secrets are loaded
sudo systemctl restart saraiva-api
sudo journalctl -u saraiva-api -f | grep "Environment"
```

## ❌ Common Mistakes to Avoid

### 1. Committing Secrets
```bash
# ❌ NEVER do this
git add .env.production
git commit -m "Add config"

# ✅ If you accidentally committed secrets:
git reset HEAD .env.production
git rm --cached .env.production
# Rotate all exposed secrets immediately
```

### 2. Using Production Secrets in Development
```bash
# ❌ BAD: Copying production secrets to local
cp .env.production .env.local

# ✅ GOOD: Use development-specific values
echo "RESEND_API_KEY=test_key" > .env.local
```

### 3. Exposing Secrets in Logs
```javascript
// ❌ BAD
console.log('API Key:', process.env.RESEND_API_KEY);

// ✅ GOOD
logger.info('API configured', { keyPresent: !!process.env.RESEND_API_KEY });
```

## 🔍 Troubleshooting

### Environment variable not loading
```bash
# Check if file exists and has correct permissions
ls -la .env.production

# Verify file is not empty
cat .env.production | wc -l

# Check for syntax errors
grep "=" .env.production | grep -v "^#"

# Restart service to reload
sudo systemctl restart saraiva-api
```

### Missing required variable
```bash
# Check which variables are loaded
node -e "console.log(Object.keys(process.env).filter(k => k.includes('VITE_')))"

# Verify variable is exported
export $(cat .env.production | xargs)
echo $VITE_GOOGLE_MAPS_API_KEY
```

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [OWASP Secret Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App Configuration](https://12factor.net/config)

## 🆘 Support

For environment configuration issues:
- **Development**: Contact tech lead
- **Production**: Create ticket with DevOps team
- **Security Incidents**: Immediately notify security@saraivavision.com.br

---

**Security Notice**: This document itself contains NO secrets. All examples use placeholder values.
